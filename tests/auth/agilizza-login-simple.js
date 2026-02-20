import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend } from 'k6/metrics';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Métricas customizadas
const loginSuccessRate = new Rate('login_success_rate');
const loginDuration = new Trend('login_duration');

// Carregar dados de usuários do CSV
const usuarios = new SharedArray('agilizza_usuarios', function () {
    const csvData = open('../../data/agilizza_usuarios.csv');
    return papaparse.parse(csvData, { header: true }).data.filter(u => u.email && u.senha);
});

// ============================================================
//  TESTE SIMPLES - Smoke test do login Agilizza
//  5 VUs por 1 minuto
// ============================================================
export const options = {
    vus: 5,
    duration: '1m',
    thresholds: {
        http_req_duration: ['p(95)<5000'],   // 95% das requisições < 5s
        http_req_failed: ['rate<0.3'],       // Taxa de erro < 30%
        'login_success_rate': ['rate>0.7'],  // 70% de logins com sucesso
    },
};

const BASE_URL = 'https://agilizza.sittax.com.br';

export default function () {
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];

    if (!usuario || !usuario.email || !usuario.senha) {
        console.log('Usuário inválido, pulando iteração');
        return;
    }

    // ---- STEP 1: GET na página de login para pegar o CSRF token ----
    const loginPage = http.get(`${BASE_URL}/login`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
    });

    // Extrair o CSRF token do HTML
    const csrfMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
    if (!csrfMatch) {
        console.log('❌ Não foi possível extrair o CSRF token');
        loginSuccessRate.add(false);
        return;
    }
    const csrfToken = csrfMatch[1];

    // Extrair cookies da sessão
    const jar = http.cookieJar();

    // ---- STEP 2: POST do login (form submission Laravel) ----
    const loginPayload = {
        _token: csrfToken,
        email: usuario.email,
        password: usuario.senha,
    };

    const loginResponse = http.post(`${BASE_URL}/login`, loginPayload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': `${BASE_URL}/login`,
            'Origin': BASE_URL,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        },
        redirects: 5,
    });

    const loginSuccess = check(loginResponse, {
        'Login status é 200 ou 302': (r) => r.status === 200 || r.status === 302,
        'Redirecionou para /home': (r) => r.url.includes('/home') || r.url.includes('/dashboard'),
        'Tempo de resposta < 5s': (r) => r.timings.duration < 5000,
    });

    loginSuccessRate.add(loginSuccess);
    loginDuration.add(loginResponse.timings.duration);

    if (loginSuccess) {
        console.log(`✅ Login OK para: ${usuario.email} (${loginResponse.timings.duration.toFixed(0)}ms)`);
    } else {
        console.log(`❌ Falha no login para: ${usuario.email} - Status: ${loginResponse.status} - URL: ${loginResponse.url}`);
    }

    sleep(Math.random() * 2 + 1);
}
