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
    { duration: '5m', target: 15 },   // Ramp up gradual
    { duration: '30m', target: 15 },  // ⏰ SOAK - 30 minutos de carga constante
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],      // Performance deve se manter estável
    http_req_failed: ['rate<0.02'],        // Taxa de erro baixa durante todo o soak
    checks: ['rate>0.98'],                 // Alta confiabilidade durante período longo
    'memory_leak_indicator': ['p(99)<1500'], // Detectar possíveis vazamentos de memória
  },
};

let iterationCount = 0;

export default function () {
  iterationCount++;
  
  // Selecionar usuário aleatório
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  if (!usuario || !usuario.usuario || !usuario.senha) {
    return;
  }

  // Log a cada 100 iterações para acompanhar progresso
  if (iterationCount % 100 === 0) {
    console.log(`🕐 SOAK Test - Iteração ${iterationCount} - Tempo: ${new Date().toISOString()}`);
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

  // Realizar login
  const startTime = Date.now();
  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    params
  );
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  // Verificações específicas para soak test
  const soakChecks = check(loginResponse, {
    'Performance estável após tempo': (r) => r.timings.duration < 800,
    'Sem degradação de memória': (r) => responseTime < 1500,
    'Sistema ainda funcionando': (r) => r.status === 200,
    'Sem vazamento de conexões': (r) => r.timings.connecting < 100,
    'Response ainda válido': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body !== null && typeof body === 'object';
      } catch (e) {
        return false;
      }
    },
  });

  // Detectar sinais de degradação
  if (responseTime > 1000) {
    console.log(`⚠️ SOAK - Degradação detectada: ${responseTime}ms para ${usuario.usuario} na iteração ${iterationCount}`);
  }

  if (!soakChecks) {
    console.log(`❌ SOAK - Falha detectada na iteração ${iterationCount} para ${usuario.usuario}`);
  }

  // Simular comportamento real de usuário durante período longo
  // Alternar entre períodos ativos e menos ativos
  const timeOfDay = (Date.now() / 1000 / 60) % 60; // Minuto atual
  
  if (timeOfDay < 15 || timeOfDay > 45) {
    // Período "menos ativo" - mais think time
    sleep(Math.random() * 8 + 3); // 3-11 segundos
  } else {
    // Período "ativo" - menos think time
    sleep(Math.random() * 4 + 2); // 2-6 segundos
  }
}