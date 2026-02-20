import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend, Counter } from 'k6/metrics';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// ============================================================
//  MÉTRICAS CUSTOMIZADAS
// ============================================================
const loginSuccessRate = new Rate('login_success_rate');
const dashboardSuccessRate = new Rate('dashboard_success_rate');
const notifSuccessRate = new Rate('notif_success_rate');
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');
const totalRequests = new Counter('total_requests');
const failedLogins = new Counter('failed_logins');

// Carregar dados de usuários do CSV
const usuarios = new SharedArray('agilizza_usuarios', function () {
    const csvData = open('../../data/agilizza_usuarios.csv');
    return papaparse.parse(csvData, { header: true }).data.filter(u => u.email && u.senha);
});

// ============================================================
//  🔥 TESTE DE STRESS EXTREMO - Agilizza
//  Spike test: sobe até 200 VUs, depois 300 VUs
//  Testa o limite do servidor com 100 usuários reais
//  Duração total: ~15 minutos
// ============================================================
export const options = {
    stages: [
        // Fase 1 - Aquecimento
        { duration: '30s', target: 20 },    // 0 → 20 VUs
        { duration: '1m', target: 50 },    // 20 → 50 VUs

        // Fase 2 - Carga pesada
        { duration: '2m', target: 100 },   // 50 → 100 VUs (cada user logando)
        { duration: '2m', target: 100 },   // Sustentar 100 VUs

        // Fase 3 - SPIKE! Acima do número de usuários
        { duration: '1m', target: 200 },   // 100 → 200 VUs (2 sessões por user)
        { duration: '2m', target: 200 },   // Sustentar 200 VUs

        // Fase 4 - STRESS MÁXIMO
        { duration: '1m', target: 300 },   // 200 → 300 VUs (3 sessões por user)
        { duration: '2m', target: 300 },   // Sustentar 300 VUs

        // Fase 5 - Recovery
        { duration: '1m', target: 100 },   // 300 → 100 VUs
        { duration: '1m', target: 50 },    // 100 → 50 VUs
        { duration: '30s', target: 0 },     // Ramp down total
    ],
    thresholds: {
        http_req_duration: ['p(95)<15000'],      // 95% < 15s (tolerante por ser stress)
        http_req_failed: ['rate<0.5'],           // Taxa de erro < 50%
        'login_success_rate': ['rate>0.4'],      // 40% de logins com sucesso (stress)
    },
};

const BASE_URL = 'https://agilizza.sittax.com.br';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
};

export default function () {
    // Cada VU pega um usuário aleatório dos 100 disponíveis
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];

    if (!usuario || !usuario.email || !usuario.senha) {
        return;
    }

    let loggedIn = false;

    // ============================================================
    //  GRUPO 1: LOGIN COMPLETO
    // ============================================================
    group('01_Login', function () {
        // GET login page → CSRF token
        const loginPage = http.get(`${BASE_URL}/login`, {
            headers: { ...HEADERS, 'Accept': 'text/html,application/xhtml+xml' },
            tags: { name: 'GET_login_page' },
            timeout: '30s',
        });
        totalRequests.add(1);

        if (loginPage.status !== 200) {
            console.log(`⚠️ Login page retornou ${loginPage.status}`);
            loginSuccessRate.add(false);
            failedLogins.add(1);
            return;
        }

        const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
        if (!csrfMatch) {
            console.log(`❌ CSRF token não encontrado`);
            loginSuccessRate.add(false);
            failedLogins.add(1);
            return;
        }

        // POST login
        const loginResponse = http.post(`${BASE_URL}/login`, {
            _token: csrfMatch[1],
            email: usuario.email,
            password: usuario.senha,
        }, {
            headers: {
                ...HEADERS,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': `${BASE_URL}/login`,
                'Origin': BASE_URL,
            },
            redirects: 5,
            tags: { name: 'POST_login' },
            timeout: '30s',
        });
        totalRequests.add(1);

        loggedIn = check(loginResponse, {
            'Login: status 200/302': (r) => r.status === 200 || r.status === 302,
            'Login: redirecionou para /home': (r) => r.url.includes('/home') || r.url.includes('/dashboard'),
        });

        loginSuccessRate.add(loggedIn);
        loginDuration.add(loginResponse.timings.duration);

        if (!loggedIn) {
            failedLogins.add(1);
        }
    });

    // ============================================================
    //  GRUPO 2: NAVEGAÇÃO PÓS-LOGIN (simula uso real)
    // ============================================================
    if (loggedIn) {
        group('02_Dashboard', function () {
            sleep(Math.random() * 0.5 + 0.3);

            // Dashboard data
            const dashResp = http.get(`${BASE_URL}/dashboard/data/all`, {
                headers: {
                    ...HEADERS,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `${BASE_URL}/home`,
                },
                tags: { name: 'GET_dashboard_data' },
                timeout: '30s',
            });
            totalRequests.add(1);

            const dashOk = check(dashResp, {
                'Dashboard: status 200': (r) => r.status === 200,
            });
            dashboardSuccessRate.add(dashOk);
            dashboardDuration.add(dashResp.timings.duration);
        });

        group('03_Notifications', function () {
            // Notificações
            const notifResp = http.get(`${BASE_URL}/notifications/unread/get`, {
                headers: {
                    ...HEADERS,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `${BASE_URL}/home`,
                },
                tags: { name: 'GET_notifications' },
                timeout: '30s',
            });
            totalRequests.add(1);

            const notifOk = check(notifResp, {
                'Notificações: status 200': (r) => r.status === 200,
            });
            notifSuccessRate.add(notifOk);
        });

        // Simular navegação adicional - acessar páginas
        group('04_Navegacao', function () {
            sleep(Math.random() * 0.5 + 0.2);

            const pages = ['/home', '/empresas'];
            const page = pages[Math.floor(Math.random() * pages.length)];

            const pageResp = http.get(`${BASE_URL}${page}`, {
                headers: {
                    ...HEADERS,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Referer': `${BASE_URL}/home`,
                },
                tags: { name: `GET_page_${page.replace('/', '')}` },
                timeout: '30s',
            });
            totalRequests.add(1);

            check(pageResp, {
                'Página carregou: status 200': (r) => r.status === 200,
            });
        });
    }

    // Think time reduzido para maximizar pressão no servidor
    sleep(Math.random() * 1.5 + 0.5);
}
