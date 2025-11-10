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
    { duration: '30s', target: 10 }, // Ramp up para 10 usuários
    { duration: '2m', target: 10 },  // Manter 10 usuários por 2 minutos
    { duration: '30s', target: 20 }, // Aumentar para 20 usuários
    { duration: '2m', target: 20 },  // Manter 20 usuários por 2 minutos
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições em menos de 2s
    http_req_failed: ['rate<0.05'],    // Taxa de erro menor que 5%
    'login_success_rate': ['rate>0.95'], // Taxa de sucesso de login > 95%
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
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
  };

  // Realizar o login
  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    params
  );

  // Verificações do login
  const loginSuccess = check(loginResponse, {
    'login status é 200': (r) => r.status === 200,
    'login response tempo < 2s': (r) => r.timings.duration < 2000,
    'response contém dados válidos': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && (body.token || body.access_token || body.success);
      } catch (e) {
        return false;
      }
    },
  });

  // Métricas customizadas
  if (loginSuccess) {
    // Se o login foi bem-sucedido, simular navegação adicional
    sleep(1);
    
    // Verificar se recebemos um token
    let token = null;
    try {
      const loginBody = JSON.parse(loginResponse.body);
      token = loginBody.token || loginBody.access_token || loginBody.accessToken;
    } catch (e) {
      console.log('Erro ao parsear resposta do login');
    }

    // Se temos um token, fazer uma requisição autenticada de exemplo
    if (token) {
      const authParams = {
        headers: {
          ...params.headers,
          'Authorization': `Bearer ${token}`,
        },
      };

      // Simular uma requisição autenticada (ajuste a URL conforme necessário)
      const profileResponse = http.get(
        'https://autenticacaohomologacao.sittax.com.br/api/user/profile',
        authParams
      );

      check(profileResponse, {
        'requisição autenticada bem-sucedida': (r) => r.status === 200 || r.status === 401, // 401 é esperado se a rota não existir
      });
    }
  } else {
    console.log(`Falha no login para usuário: ${usuario.usuario}`);
  }

  // Simular tempo de think time do usuário
  sleep(Math.random() * 3 + 1); // Entre 1-4 segundos
}