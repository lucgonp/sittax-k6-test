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
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');
const totalRequests = new Counter('total_requests');

// Carregar dados de usuários do CSV
const usuarios = new SharedArray('agilizza_usuarios', function () {
    const csvData = open('../../data/agilizza_usuarios.csv');
    return papaparse.parse(csvData, { header: true }).data.filter(u => u.email && u.senha);
});

// ============================================================
//  TESTE DE CARGA MASSIVA - Agilizza
//  Ramp up progressivo até 100 VUs simultâneos
//  Simula login + navegação no dashboard
// ============================================================
export const options = {
    stages: [
        { duration: '30s', target: 10 },   // Aquecimento: 0 → 10 VUs
        { duration: '1m', target: 25 },   // Subida: 10 → 25 VUs
        { duration: '2m', target: 50 },   // Carga média: 25 → 50 VUs
        { duration: '2m', target: 100 },  // Carga alta: 50 → 100 VUs
        { duration: '3m', target: 100 },  // Sustentar 100 VUs por 3 min
        { duration: '1m', target: 50 },   // Ramp down parcial
        { duration: '30s', target: 0 },    // Ramp down total
    ],
    thresholds: {
        http_req_duration: ['p(95)<8000'],       // 95% das requests < 8s
        http_req_failed: ['rate<0.3'],           // Taxa de erro < 30%
        'login_success_rate': ['rate>0.6'],      // 60% de logins com sucesso
        'dashboard_success_rate': ['rate>0.5'],  // 50% de dashboards com sucesso
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
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];

    if (!usuario || !usuario.email || !usuario.senha) {
        return;
    }

    let csrfToken = null;
    let loggedIn = false;

    // ============================================================
    //  GRUPO 1: LOGIN
    // ============================================================
    group('01_Login', function () {
        // Step 1: GET login page (pegar CSRF token + cookies de sessão)
        const loginPage = http.get(`${BASE_URL}/login`, {
            headers: { ...HEADERS, 'Accept': 'text/html,application/xhtml+xml' },
            tags: { name: 'GET_login_page' },
        });
        totalRequests.add(1);

        const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
        if (!csrfMatch) {
            console.log(`❌ CSRF token não encontrado`);
            loginSuccessRate.add(false);
            return;
        }
        csrfToken = csrfMatch[1];

        // Step 2: POST login
        const loginPayload = {
            _token: csrfToken,
            email: usuario.email,
            password: usuario.senha,
        };

        const loginResponse = http.post(`${BASE_URL}/login`, loginPayload, {
            headers: {
                ...HEADERS,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': `${BASE_URL}/login`,
                'Origin': BASE_URL,
            },
            redirects: 5,
            tags: { name: 'POST_login' },
        });
        totalRequests.add(1);

        loggedIn = check(loginResponse, {
            'Login: status 200/302': (r) => r.status === 200 || r.status === 302,
            'Login: redirecionou para /home': (r) => r.url.includes('/home') || r.url.includes('/dashboard'),
            'Login: tempo < 8s': (r) => r.timings.duration < 8000,
        });

        loginSuccessRate.add(loggedIn);
        loginDuration.add(loginResponse.timings.duration);

        if (!loggedIn) {
            console.log(`❌ Login falhou: ${usuario.email} | Status: ${loginResponse.status}`);
        }
    });

    // ============================================================
    //  GRUPO 2: DASHBOARD (somente se logado)
    // ============================================================
    if (loggedIn) {
        group('02_Dashboard', function () {
            sleep(Math.random() * 1 + 0.5); // Think time

            // Carregar dados do dashboard
            const dashResponse = http.get(`${BASE_URL}/dashboard/data/all`, {
                headers: {
                    ...HEADERS,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `${BASE_URL}/home`,
                },
                tags: { name: 'GET_dashboard_data' },
            });
            totalRequests.add(1);

            const dashOk = check(dashResponse, {
                'Dashboard: status 200': (r) => r.status === 200,
                'Dashboard: response é JSON': (r) => {
                    try { JSON.parse(r.body); return true; } catch (e) { return false; }
                },
                'Dashboard: tempo < 5s': (r) => r.timings.duration < 5000,
            });

            dashboardSuccessRate.add(dashOk);
            dashboardDuration.add(dashResponse.timings.duration);

            // Carregar notificações
            const notifResponse = http.get(`${BASE_URL}/notifications/unread/get`, {
                headers: {
                    ...HEADERS,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `${BASE_URL}/home`,
                },
                tags: { name: 'GET_notifications' },
            });
            totalRequests.add(1);

            check(notifResponse, {
                'Notificações: status 200': (r) => r.status === 200,
            });
        });
    }

    // Think time entre iterações
    sleep(Math.random() * 3 + 1);
}
