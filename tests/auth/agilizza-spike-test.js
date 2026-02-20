import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend, Counter } from 'k6/metrics';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Métricas
const loginSuccessRate = new Rate('login_success_rate');
const dashboardSuccessRate = new Rate('dashboard_success_rate');
const loginDuration = new Trend('login_duration');
const totalRequests = new Counter('total_requests');

// Carregar usuários
const usuarios = new SharedArray('agilizza_usuarios', function () {
    const csvData = open('../../data/agilizza_usuarios.csv');
    return papaparse.parse(csvData, { header: true }).data.filter(u => u.email && u.senha);
});

// ============================================================
//  💥 SPIKE TEST - TODOS OS 100 USUÁRIOS DE UMA VEZ!
//  100 VUs iniciam INSTANTANEAMENTE, sem ramp up
//  Cada um faz login + dashboard + notificações
//  Repete 3x por usuário para manter pressão
// ============================================================
export const options = {
    scenarios: {
        spike_login: {
            executor: 'per-vu-iterations',
            vus: 100,            // 100 usuários simultâneos IMEDIATAMENTE
            iterations: 1000,    // Cada um faz 1000 logins = 100.000 total!
            maxDuration: '60m',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<15000'],
        http_req_failed: ['rate<0.5'],
        'login_success_rate': ['rate>0.3'],
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
    // Cada VU pega um usuário diferente (VU 1 = user 1, VU 2 = user 2, etc.)
    const vuId = __VU - 1;
    const usuario = usuarios[vuId % usuarios.length];

    if (!usuario || !usuario.email || !usuario.senha) {
        return;
    }

    let loggedIn = false;

    // ---- LOGIN ----
    group('01_Login_Simultaneo', function () {
        const loginPage = http.get(`${BASE_URL}/login`, {
            headers: { ...HEADERS, 'Accept': 'text/html,application/xhtml+xml' },
            tags: { name: 'GET_login_page' },
            timeout: '30s',
        });
        totalRequests.add(1);

        if (loginPage.status !== 200) {
            loginSuccessRate.add(false);
            return;
        }

        const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
        if (!csrfMatch) {
            loginSuccessRate.add(false);
            return;
        }

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
            'Login: redirecionou /home': (r) => r.url.includes('/home') || r.url.includes('/dashboard'),
        });

        loginSuccessRate.add(loggedIn);
        loginDuration.add(loginResponse.timings.duration);
    });

    // ---- DASHBOARD + NOTIFICAÇÕES (se logou) ----
    if (loggedIn) {
        group('02_Dashboard', function () {
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
            dashboardSuccessRate.add(check(dashResp, {
                'Dashboard: status 200': (r) => r.status === 200,
            }));

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
            check(notifResp, { 'Notificacoes: status 200': (r) => r.status === 200 });
        });
    }

    // Think time mínimo entre iterações
    sleep(Math.random() * 1 + 0.5);
}
