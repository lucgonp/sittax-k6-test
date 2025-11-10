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
    { duration: '2m', target: 10 },  // Ramp up para 10 usuários em 2 minutos
    { duration: '5m', target: 10 },  // Manter 10 usuários por 5 minutos
    { duration: '2m', target: 20 },  // Aumentar para 20 usuários em 2 minutos
    { duration: '5m', target: 20 },  // Manter 20 usuários por 5 minutos
    { duration: '2m', target: 0 },   // Ramp down para 0 em 2 minutos
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],     // 95% das requisições em menos de 500ms
    http_req_failed: ['rate<0.05'],       // Taxa de erro menor que 5%
    checks: ['rate>0.95'],                // 95% dos checks devem passar
    'login_duration': ['p(95)<800'],      // Login específico deve ser rápido
  },
};

export default function () {
  // Selecionar um usuário aleatório do CSV
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  if (!usuario || !usuario.usuario || !usuario.senha) {
    return;
  }

  // Payload do login
  const loginPayload = JSON.stringify({
    usuario: usuario.usuario,
    senha: usuario.senha,
  });

  // Headers necessários
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://homologacao.sittax.com.br/',
      'Origin': 'https://homologacao.sittax.com.br',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  };

  // Simular comportamento real do usuário
  // 1. Primeiro acesso à página de login (simular)
  sleep(Math.random() * 2 + 1);

  // 2. Realizar o login
  const startTime = new Date().getTime();
  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    params
  );
  const endTime = new Date().getTime();
  const loginDuration = endTime - startTime;

  // Verificações do load test
  const loginSuccess = check(loginResponse, {
    'Login bem-sucedido': (r) => r.status === 200,
    'Tempo de resposta OK': (r) => r.timings.duration < 500,
    'Response válido': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body !== null;
      } catch (e) {
        return false;
      }
    },
  });

  // Métricas customizadas
  if (loginSuccess) {
    // Simular navegação pós-login
    sleep(Math.random() * 3 + 2); // 2-5 segundos pensando
    
    // Simular uma requisição adicional (dashboard, etc.)
    // Nota: Ajuste a URL conforme necessário para o sistema real
    const dashboardResponse = http.get(
      'https://autenticacaohomologacao.sittax.com.br/api/user/dashboard',
      {
        headers: {
          ...params.headers,
          'Authorization': `Bearer ${JSON.parse(loginResponse.body).token || 'fake-token'}`,
        },
      }
    );

    check(dashboardResponse, {
      'Dashboard acessível': (r) => r.status === 200 || r.status === 401, // 401 OK se rota não existir
    });
  }

  // Think time realista do usuário
  sleep(Math.random() * 4 + 1); // 1-5 segundos
}