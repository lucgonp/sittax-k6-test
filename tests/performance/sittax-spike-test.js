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
    { duration: '20s', target: 100 },  // Aquecimento maior
    { duration: '10s', target: 100 },  // Baseline
    { duration: '5s', target: 2000 },  // SPIKE BRUTAL! 20x aumento súbito
    { duration: '2m', target: 2000 },  // Manter spike brutal
    { duration: '5s', target: 4000 },  // SPIKE INSANO! 40x 
    { duration: '2m', target: 4000 },  // Manter spike insano por mais tempo
    { duration: '3s', target: 6000 },  // SPIKE APOCALÍPTICO! 60x
    { duration: '1m', target: 6000 },  // Manter apocalipse
    { duration: '3s', target: 8000 },  // SPIKE MÁXIMO ABSOLUTO! 80x
    { duration: '1m', target: 8000 },  // Tentar destruir o sistema
    { duration: '5s', target: 100 },   // Volta súbita (se sobreviver)
    { duration: '20s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<30000'],    // 30s durante spike apocalíptico
    http_req_failed: ['rate<0.80'],        // 80% erro aceitável (sistema DEVE quebrar)
    checks: ['rate>0.20'],                 // 20% checks mínimo - sobrevivência mínima
  },
};

export default function () {
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

  // Durante spike, simular urgência do usuário (menos think time)
  const currentVUs = __ENV.K6_VUS || 50;
  const isSpike = currentVUs > 200;
  const isExtremeSpike = currentVUs > 1000;
  const isApocalypticSpike = currentVUs > 2000;

  // Login principal
  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    params
  );

  const loginSuccess = check(loginResponse, {
    'Sistema sobreviveu ao spike': (r) => r.status === 200,
    'Não há crash do servidor': (r) => r.status !== 500 && r.status !== 502 && r.status !== 503 && r.status !== 504,
    'Response em tempo razoável': (r) => r.timings.duration < 5000,
    'Sistema ainda responde': (r) => r.body.length > 0,
  });

  if (isApocalypticSpike) {
    // SPIKE APOCALÍPTICO - Bombardeio total
    for (let burst = 0; burst < 8; burst++) { // 8 rajadas por iteração
      const burstResponse = http.post(
        'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
        loginPayload,
        {
          ...params,
          timeout: '5s', // Timeout baixo para aumentar pressure
        }
      );
      check(burstResponse, {
        'Sistema sobrevive apocalipse': (r) => r.status === 200 || r.status === 429 || r.status === 503,
      });
    }
    console.log(`� APOCALIPSE! ${currentVUs} VUs - Status: ${loginResponse.status}`);
    sleep(0.02); // 20ms entre iterações (INSANO)
    
  } else if (isExtremeSpike) {
    // SPIKE EXTREMO - Rajadas intensas
    for (let burst = 0; burst < 5; burst++) { // 5 rajadas
      const burstResponse = http.post(
        'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
        loginPayload,
        params
      );
      check(burstResponse, {
        'Sistema sobrevive extremo': (r) => r.status === 200 || r.status === 429,
      });
      sleep(0.05); // 50ms entre rajadas
    }
    console.log(`🔥 EXTREMO! ${currentVUs} VUs - Login: ${loginResponse.status}`);
    sleep(0.05); // 50ms entre iterações
    
  } else if (isSpike) {
    // SPIKE NORMAL - Mais agressivo que antes
    for (let i = 0; i < 3; i++) {
      const spikeResponse = http.post(
        'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
        loginPayload,
        params
      );
      check(spikeResponse, {
        'Sistema aguenta spike': (r) => r.status === 200,
      });
      sleep(0.1); // 100ms entre requests
    }
    console.log(`🚀 SPIKE - ${currentVUs} VUs`);
    sleep(0.2); // 200ms entre iterações
    
  } else {
    // Normal
    console.log(`✅ Normal - ${currentVUs} VUs`);
    sleep(Math.random() * 2 + 1);
  }
}