import http from 'k6/http';
import { check, sleep } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Carregar dados dos usuários do CSV
const csvData = open('../data/login_usuarios.csv');
const parsedData = papaparse.parse(csvData, { header: true });
const usuarios = parsedData.data.filter(user => user.usuario && user.senha);

console.log(`🔥💀 SPIKE TEST EXTREME: ${usuarios.length} usuários carregados para DEVASTAÇÃO TOTAL`);

// CONFIGURAÇÃO EXTREMAMENTE AGRESSIVA - MÁQUINA VAI SOFRER!
export const options = {
  stages: [
    { duration: '10s', target: 100 },    // Aquecimento rápido
    { duration: '5s', target: 100 },     // Baseline
    { duration: '3s', target: 2000 },    // SPIKE BRUTAL! 20x em 3s
    { duration: '30s', target: 2000 },   // Manter spike brutal
    { duration: '2s', target: 4000 },    // SPIKE INSANO! 40x em 2s
    { duration: '45s', target: 4000 },   // Manter spike insano
    { duration: '2s', target: 6000 },    // SPIKE APOCALÍPTICO! 60x
    { duration: '1m', target: 6000 },    // Manter apocalipse
    { duration: '1s', target: 8000 },    // SPIKE MÁXIMO ABSOLUTO! 80x em 1s
    { duration: '2m', target: 8000 },    // Tentar destruir completamente
    { duration: '1s', target: 10000 },   // SPIKE FINAL DEVASTADOR! 100x
    { duration: '1m', target: 10000 },   // APOCALIPSE TOTAL
    { duration: '5s', target: 100 },     // Volta súbita (se sobreviver)
    { duration: '15s', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<60000'],    // 1 minuto durante apocalipse
    http_req_failed: ['rate<0.95'],        // 95% erro aceitável (DESTRUIÇÃO TOTAL)
    checks: ['rate>0.05'],                 // 5% checks mínimo - sobrevivência milagrosa
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

  // Detectar nível de devastação atual
  const currentVUs = __VU;
  const isApocalypticSpike = currentVUs > 5000;   // APOCALIPSE
  const isExtremeSpike = currentVUs > 2000;       // EXTREMO
  const isIntenseSpike = currentVUs > 1000;       // INTENSO
  const isSpike = currentVUs > 500;               // NORMAL

  // DEVASTAÇÃO CONFIGURADA POR NÍVEL DE VUs
  let requestBursts, sleepTime, timeoutMs;
  
  if (isApocalypticSpike) {
    requestBursts = 20;      // 20 rajadas por VU (DEVASTADOR)
    sleepTime = 0.001;       // 1ms (INSANO)
    timeoutMs = 1000;        // 1s timeout (AGRESSIVO)
    console.log(`🔥💀⚡ APOCALIPSE TOTAL! VU=${currentVUs} - 20 RAJADAS DEVASTADORAS`);
  } else if (isExtremeSpike) {
    requestBursts = 15;      // 15 rajadas
    sleepTime = 0.005;       // 5ms
    timeoutMs = 2000;        // 2s timeout
    console.log(`🔥💀 DEVASTAÇÃO EXTREMA! VU=${currentVUs} - 15 RAJADAS`);
  } else if (isIntenseSpike) {
    requestBursts = 10;      // 10 rajadas
    sleepTime = 0.01;        // 10ms
    timeoutMs = 3000;        // 3s timeout
    console.log(`🔥 SPIKE INTENSO! VU=${currentVUs} - 10 RAJADAS`);
  } else if (isSpike) {
    requestBursts = 5;       // 5 rajadas
    sleepTime = 0.05;        // 50ms
    timeoutMs = 5000;        // 5s timeout
    console.log(`⚡ Spike normal VU=${currentVUs} - 5 rajadas`);
  } else {
    requestBursts = 1;       // Apenas 1 request
    sleepTime = 0.5;         // 500ms normal
    timeoutMs = 10000;       // 10s timeout normal
  }

  // BOMBARDEIO PRINCIPAL
  for (let burst = 0; burst < requestBursts; burst++) {
    const burstResponse = http.post(
      'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
      loginPayload,
      {
        ...params,
        timeout: `${timeoutMs}ms`,
      }
    );

    // Checks adaptativos baseados no nível de stress
    if (isApocalypticSpike) {
      check(burstResponse, {
        'Sistema ainda respira': (r) => r.status > 0,
        'Não morreu completamente': (r) => r.status !== undefined,
      });
    } else if (isExtremeSpike) {
      check(burstResponse, {
        'Sistema sobrevive': (r) => r.status === 200 || r.status >= 400,
        'Resposta existe': (r) => r.body !== undefined,
      });
    } else {
      check(burstResponse, {
        'Login funcionou': (r) => r.status === 200,
        'Token retornado': (r) => r.json('token') !== undefined,
        'Tempo razoável': (r) => r.timings.duration < 10000,
      });
    }
  }

  // Sleep adaptativos para máximo stress
  sleep(sleepTime);
}

export function handleSummary(data) {
  return {
    'reports/sittax-spike-extreme-results.json': JSON.stringify(data, null, 2),
    stdout: `
🔥💀⚡ RELATÓRIO DE DEVASTAÇÃO - SPIKE TEST EXTREME ⚡💀🔥

📊 ESTATÍSTICAS DE DESTRUIÇÃO:
- Total de requests: ${data.metrics.http_reqs.values.count}
- Requests por segundo: ${data.metrics.http_reqs.values.rate.toFixed(2)}
- Taxa de falha: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
- Duração média: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
- P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms

⚡ NÍVEIS DE STRESS TESTADOS:
- VUs máximos: 10,000 (APOCALÍPTICO)
- Rajadas por VU: até 20 (DEVASTADOR)
- Sleep mínimo: 1ms (INSANO)

💀 RESULTADO: ${data.metrics.http_req_failed.values.rate < 0.5 ? 'SISTEMA SOBREVIVEU!' : 'SISTEMA DEVASTADO! ✅'}
    `,
  };
}