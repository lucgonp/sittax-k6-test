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
  vus: 5, // 5 usuários virtuais
  duration: '1m', // Duração de 1 minuto
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% das requisições em menos de 3s
    http_req_failed: ['rate<0.1'],     // Taxa de erro menor que 10%
  },
};

export default function () {
  // Selecionar um usuário aleatório do CSV
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  if (!usuario || !usuario.usuario || !usuario.senha) {
    console.log('Usuário inválido encontrado, pulando iteração');
    return;
  }

  console.log(`Testando login para: ${usuario.usuario}`);

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
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    },
  };

  // Realizar o login
  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    params
  );

  // Verificações básicas
  const checks = check(loginResponse, {
    'Status é 200': (r) => r.status === 200,
    'Tempo de resposta < 3s': (r) => r.timings.duration < 3000,
    'Response não está vazio': (r) => r.body.length > 0,
    'Content-Type é JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
  });

  if (checks) {
    console.log(`✅ Login bem-sucedido para: ${usuario.usuario}`);
  } else {
    console.log(`❌ Falha no login para: ${usuario.usuario} - Status: ${loginResponse.status}`);
    console.log(`Response body: ${loginResponse.body.substring(0, 200)}...`);
  }

  // Pausa entre requisições
  sleep(1);
}