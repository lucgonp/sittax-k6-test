import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Carregar dados de usuários do CSV
const usuarios = new SharedArray('usuarios', function () {
  const csvData = open('../data/login_usuarios.csv');
  return papaparse.parse(csvData, { header: true }).data;
});

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Baseline maior
    { duration: '1m', target: 100 },  // 2x
    { duration: '1m', target: 200 },  // 4x
    { duration: '1m', target: 350 },  // 7x
    { duration: '1m', target: 500 },  // 10x
    { duration: '2m', target: 750 },  // 15x
    { duration: '2m', target: 1000 }, // 20x - Provável breakpoint
    { duration: '2m', target: 1500 }, // 30x - Definitivamente vai quebrar
    { duration: '2m', target: 2000 }, // 40x - Stress máximo absoluto
    { duration: '1m', target: 2500 }, // 50x - Sistema deve falhar aqui
    { duration: '5m', target: 0 },    // Recovery longo
  ],
  thresholds: {
    // Thresholds mais permissivos para encontrar o limite real
    http_req_duration: ['p(95)<30000'],    // 30s máximo
    http_req_failed: ['rate<0.80'],        // 80% erro indica breakpoint severo
    checks: ['rate>0.20'],                 // 20% checks mínimo
  },
};

let errorCount = 0;
let totalRequests = 0;

export default function () {
  totalRequests++;
  
  // Selecionar usuário aleatório
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  if (!usuario || !usuario.usuario || !usuario.senha) {
    return;
  }

  // Payload do login
  const loginPayload = JSON.stringify({
    usuario: usuario.usuario,
    senha: usuario.senha,
  });

  // Headers
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://homologacao.sittax.com.br/',
      'Origin': 'https://homologacao.sittax.com.br',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  };

  // Realizar login com timeout mais alto para breakpoint
  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    {
      ...params,
      timeout: '30s', // Timeout maior para detectar degradação extrema
    }
  );

  const currentVUs = __ENV.K6_VUS || 20;
  
  // Verificações para detectar breakpoint
  const systemStillWorks = check(loginResponse, {
    'Sistema ainda responde': (r) => r.status !== undefined,
    'Não há timeout total': (r) => r.timings.duration < 30000,
    'Status não é erro crítico': (r) => r.status !== 500 && r.status !== 502 && r.status !== 503 && r.status !== 504,
    'Conexão estabelecida': (r) => r.timings.connecting !== undefined && r.timings.connecting < 10000,
  });

  // Detectar sinais de breakpoint
  if (loginResponse.status >= 500 || loginResponse.timings.duration > 10000) {
    errorCount++;
    console.log(`🔥 BREAKPOINT INDICATOR - VUs: ${currentVUs}, Status: ${loginResponse.status}, Duration: ${loginResponse.timings.duration}ms`);
  }

  if (loginResponse.status === 200) {
    console.log(`✅ Sistema ainda funciona com ${currentVUs} VUs - ${loginResponse.timings.duration}ms`);
  } else if (loginResponse.status === 429) {
    console.log(`⚠️ Rate Limiting ativo com ${currentVUs} VUs - Sistema se defendendo`);
  } else if (loginResponse.status >= 500) {
    console.log(`💥 POSSÍVEL BREAKPOINT - Status ${loginResponse.status} com ${currentVUs} VUs`);
  }

  // Fazer múltiplas requisições em paralelo para pressão máxima
  if (currentVUs > 1000) {
    // Em breakpoint extremo, fazer requisições em rajada
    for (let burst = 0; burst < 3; burst++) {
      const burstResponse = http.post(
        'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
        loginPayload,
        {
          ...params,
          timeout: '15s',
        }
      );
      
      if (burstResponse.status >= 500) {
        console.log(`💥 BURST FAILURE - ${currentVUs} VUs, Status: ${burstResponse.status}`);
      }
    }
  }

  // Log a cada 25 requests para acompanhar degradação mais de perto
  if (totalRequests % 25 === 0) {
    const errorRate = (errorCount / totalRequests) * 100;
    console.log(`📊 BREAKPOINT TEST - VUs: ${currentVUs}, Error Rate: ${errorRate.toFixed(1)}%, Total Requests: ${totalRequests}`);
    
    // Detectar diferentes níveis de breakpoint
    if (errorRate > 60) {
      console.log(`🚨 BREAKPOINT CRÍTICO DETECTADO com ${currentVUs} VUs - Error Rate: ${errorRate.toFixed(1)}%`);
    } else if (errorRate > 40) {
      console.log(`🔥 BREAKPOINT SEVERO DETECTADO com ${currentVUs} VUs - Error Rate: ${errorRate.toFixed(1)}%`);
    } else if (errorRate > 20) {
      console.log(`⚠️ POSSÍVEL BREAKPOINT DETECTADO com ${currentVUs} VUs - Error Rate: ${errorRate.toFixed(1)}%`);
    }
  }

  // Think time mínimo para pressão máxima absoluta
  sleep(Math.random() * 0.3 + 0.05); // 0.05-0.35 segundos (extremamente agressivo)
}