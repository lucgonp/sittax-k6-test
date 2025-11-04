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
    { duration: '30s', target: 200 },  // Aquecimento mais agressivo
    { duration: '1m', target: 200 },   // Baseline alto
    { duration: '30s', target: 1000 }, // 5x stress rápido
    { duration: '2m', target: 1000 },  // Manter
    { duration: '30s', target: 2000 }, // 10x stress DEVASTADOR
    { duration: '3m', target: 2000 },  // Manter devastação
    { duration: '30s', target: 3500 }, // 17x stress APOCALÍPTICO
    { duration: '4m', target: 3500 },  // Manter apocalipse
    { duration: '20s', target: 5000 }, // 25x stress MÁXIMO ABSOLUTO
    { duration: '3m', target: 5000 },  // Devastação total por 3min
    { duration: '15s', target: 7000 }, // 35x DESTRUIÇÃO FINAL
    { duration: '2m', target: 7000 },  // ANIQUILAÇÃO TOTAL
    { duration: '10s', target: 9000 }, // LIMITE ABSOLUTO DA MÁQUINA
    { duration: '1m', target: 9000 },  // STRESS FINAL DEVASTADOR
    { duration: '2m', target: 0 },     // Recovery (se sobreviver)
  ],
  thresholds: {
    http_req_duration: ['p(95)<30000'],    // 30s máximo (sistema pode morrer)
    http_req_failed: ['rate<0.85'],        // 85% erro aceitável (DEVASTAÇÃO)
    checks: ['rate>0.15'],                 // 15% checks mínimo (sobrevivência milagrosa)
  },
};

export default function () {
  // Selecionar um usuário aleatório
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

  // Realizar login múltiplas vezes para simular stress
  const currentVUs = __ENV.K6_VUS || 50;
  let requestsPerIteration = 1;
  
  // Aumentar agressividade baseado no número de VUs
  if (currentVUs > 600) {
    requestsPerIteration = 5; // 5 requests por iteração em stress máximo
  } else if (currentVUs > 400) {
    requestsPerIteration = 4; // 4 requests em stress extremo
  } else if (currentVUs > 200) {
    requestsPerIteration = 3; // 3 requests em stress pesado
  } else if (currentVUs > 100) {
    requestsPerIteration = 2; // 2 requests em stress normal
  }

  for (let i = 0; i < requestsPerIteration; i++) {
    const loginResponse = http.post(
      'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
      loginPayload,
      params
    );

    const loginSuccess = check(loginResponse, {
      'Sistema resistiu ao stress extremo': (r) => r.status === 200,
      'Não há timeout severo': (r) => r.timings.duration < 10000, // 10s máximo em stress
      'Servidor não crashou': (r) => r.status !== 500 && r.status !== 502 && r.status !== 503,
      'Response ainda é válido': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch (e) {
          return false;
        }
      },
    });

    if (!loginSuccess) {
      console.log(`🔥 STRESS EXTREMO detectado - VUs: ${currentVUs}, Status: ${loginResponse.status} para ${usuario.usuario}`);
    }

    // Pausa mínima em stress test baseada na intensidade
    if (currentVUs > 600) {
      sleep(0.1); // Pausa mínima em stress máximo
    } else if (currentVUs > 400) {
      sleep(0.2); // Stress extremo
    } else if (currentVUs > 200) {
      sleep(0.3); // Stress pesado
    } else {
      sleep(0.5); // Stress normal
    }
  }

  // Think time reduzido para manter pressure alta
  if (currentVUs > 600) {
    sleep(Math.random() * 0.5 + 0.1); // 0.1-0.6 segundos (máximo stress)
  } else if (currentVUs > 400) {
    sleep(Math.random() * 1 + 0.2); // 0.2-1.2 segundos (stress extremo)
  } else {
    sleep(Math.random() * 2 + 0.5); // 0.5-2.5 segundos (stress normal)
  }
}