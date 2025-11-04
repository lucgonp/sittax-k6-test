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
  vus: 1, // 1 usuário virtual
  duration: '1m', // 1 minuto
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requisições em menos de 1s
    http_req_failed: ['rate<0.01'],    // Taxa de erro menor que 1%
    checks: ['rate>0.99'],             // 99% dos checks devem passar
  },
};

export default function () {
  // Selecionar um usuário aleatório do CSV
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  if (!usuario || !usuario.usuario || !usuario.senha) {
    console.log('Usuário inválido encontrado, pulando iteração');
    return;
  }

  // Payload do login - formato correto do Sittax
  const loginPayload = JSON.stringify({
    usuario: usuario.usuario,
    senha: usuario.senha,
  });

  // Headers necessários baseados na requisição real
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://homologacao.sittax.com.br/',
      'Origin': 'https://homologacao.sittax.com.br',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    },
  };

  // Realizar o login
  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    params
  );

  // Verificações críticas para smoke test
  const loginSuccess = check(loginResponse, {
    'Sistema está online - Status 200': (r) => r.status === 200,
    'Tempo de resposta aceitável < 1s': (r) => r.timings.duration < 1000,
    'Response tem conteúdo': (r) => r.body.length > 0,
    'Content-Type é JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
    'Não há erro de servidor': (r) => r.status < 500,
    'Autenticação funcional': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && (body.token || body.access_token || body.success !== false);
      } catch (e) {
        return false;
      }
    },
  });

  if (!loginSuccess) {
    console.log(`❌ SMOKE TEST FALHOU para usuário: ${usuario.usuario}`);
    console.log(`Status: ${loginResponse.status}, Response: ${loginResponse.body.substring(0, 100)}`);
  } else {
    console.log(`✅ Smoke test OK para: ${usuario.usuario}`);
  }

  // Pausa mínima entre requisições
  sleep(Math.random() * 2 + 1); // 1-3 segundos
}