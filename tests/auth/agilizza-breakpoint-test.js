import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend, Counter } from 'k6/metrics';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Métricas
const loginSuccessRate = new Rate('login_success_rate');
const loginDuration = new Trend('login_duration');
const totalRequests = new Counter('total_requests');
const erros = new Counter('erros_total');

// Carregar usuários
const usuarios = new SharedArray('agilizza_usuarios', function () {
    // Lê o arquivo CSV do diretório raiz do projeto
    let csvData = open('../../data/agilizza_usuarios.csv');
    for (let i = 101; i < 1000; i++) {
        csvData += `test.agilizza.${i}@sittax.com.br,Sittax123.\n`;
    }
    return papaparse.parse(csvData, { header: true }).data.filter(u => u.email && u.senha);
});

// ============================================================
//  🎯 BREAKPOINT TEST - Encontrar o limite do servidor
//
//  Sobe a carga progressivamente:
//    50 → 100 → 200 → 300 → 500 VUs
//
//  Quando o servidor começar a retornar erros 5xx,
//  timeouts, ou taxa de erro > 50%, significa que
//  encontramos o ponto de quebra!
//
//  Você pode parar com Ctrl+C quando vir que quebrou.
// ============================================================
export const options = {
    stages: [
        { duration: '30s', target: 50 },    // Aquece: 50 VUs
        { duration: '1m', target: 50 },    // Sustenta 50
        { duration: '30s', target: 100 },   // Sobe: 100 VUs
        { duration: '1m', target: 100 },   // Sustenta 100
        { duration: '30s', target: 200 },   // Sobe: 200 VUs
        { duration: '1m', target: 200 },   // Sustenta 200
        { duration: '30s', target: 300 },   // Sobe: 300 VUs
        { duration: '1m', target: 300 },   // Sustenta 300
        { duration: '30s', target: 500 },   // Sobe: 500 VUs
        { duration: '2m', target: 500 },   // Sustenta 500 - MÁXIMO
        { duration: '30s', target: 0 },     // Ramp down
    ],
    // Thresholds INTENCIONALMENTE frouxos - o objetivo é ver QUANDO falha
    thresholds: {
        http_req_duration: [{ threshold: 'p(95)<30000', abortOnFail: false }],
        http_req_failed: [{ threshold: 'rate<0.9', abortOnFail: false }],
    },
};

const BASE_URL = 'https://agilizza.sittax.com.br';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

export default function () {
    const usuario = usuarios[__VU % usuarios.length];

    if (!usuario || !usuario.email || !usuario.senha) {
        return;
    }

    // ---- GET login page (CSRF) ----
    const loginPage = http.get(`${BASE_URL}/login`, {
        headers: { ...HEADERS, 'Accept': 'text/html' },
        tags: { name: 'GET_login_page' },
        timeout: '30s',
    });
    totalRequests.add(1);

    if (loginPage.status !== 200) {
        erros.add(1);
        loginSuccessRate.add(false);
        sleep(0.5);
        return;
    }

    const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
    if (!csrfMatch) {
        erros.add(1);
        loginSuccessRate.add(false);
        sleep(0.5);
        return;
    }

    // ---- POST login ----
    const loginResponse = http.post(`${BASE_URL}/login`, {
        _token: csrfMatch[1],
        email: usuario.email,
        password: usuario.senha,
    }, {
        headers: {
            ...HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': `${BASE_URL}/login`,
            'Origin': BASE_URL,
        },
        redirects: 5,
        tags: { name: 'POST_login' },
        timeout: '30s',
    });
    totalRequests.add(1);

    const ok = check(loginResponse, {
        'Login OK (200/302)': (r) => r.status === 200 || r.status === 302,
        'Redirecionou /home': (r) => r.url.includes('/home') || r.url.includes('/dashboard'),
    });

    loginSuccessRate.add(ok);
    loginDuration.add(loginResponse.timings.duration);

    if (!ok) {
        erros.add(1);
    }

    // ---- Se logou, acessa dashboard ----
    if (ok) {
        http.get(`${BASE_URL}/dashboard/data/all`, {
            headers: {
                ...HEADERS,
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${BASE_URL}/home`,
            },
            tags: { name: 'GET_dashboard' },
            timeout: '30s',
        });
        totalRequests.add(1);

        http.get(`${BASE_URL}/notifications/unread/get`, {
            headers: {
                ...HEADERS,
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${BASE_URL}/home`,
            },
            tags: { name: 'GET_notifications' },
            timeout: '30s',
        });
        totalRequests.add(1);
    }

    // Think time mínimo para manter pressão máxima
    sleep(Math.random() * 0.5 + 0.3);
}
