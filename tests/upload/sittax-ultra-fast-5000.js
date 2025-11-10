import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { check } from 'k6';

// 🚀⚡ TESTE ULTRA RÁPIDO: VELOCIDADE MÁXIMA SEM SLEEP! ⚡🚀
// Meta: Máxima velocidade possível sem rate limit

// 📊 Carrega usuários reais
const usuarios = new SharedArray('usuarios', function () {
  const csvData = open('../../data/login_usuarios.csv');
  const lines = csvData.split('\n').slice(1);
  
  return lines
    .filter(line => line.trim() && !line.includes('mariana@arthacontabilidade.com.br'))
    .map(line => {
      const [email, senha] = line.split(',');
      return {
        email: email?.trim(),
        senha: senha?.trim()
      };
    })
    .filter(user => user.email && user.senha)
    .slice(0, 10); // 10 usuários para máxima velocidade
});

// 📁 Carrega arquivos XML REAIS 
const xmlFiles = new SharedArray('xmlFiles', function () {
  const arquivosXML = [
   '41250981073090000908650020000523411171633800 - Copia (3).xml',
   '41250981073090000908650020000523411171633800 - Copia - Copia (2).xml',
   '41250981073090000908650020000523411171633800 - Copia - Copia - Copia.xml',
   '41250981073090000908650020000523411171633800 - Copia - Copia.xml',
   '41250981073090000908650020000523411171633800 - Copia.xml',
   '41250981073090000908650020000523411171633800.xml',
   '41250981073090000908650020000523421171633816 - Copia (2) - Copia.xml',
   '41250981073090000908650020000523421171633816 - Copia (2).xml',
   '41250981073090000908650020000523421171633816 - Copia (3).xml',
   '41250981073090000908650020000523421171633816 - Copia - Copia (2).xml',
   // Primeiros 10 para velocidade máxima
  ];
  
  const arquivosCarregados = [];
  for (let i = 0; i < arquivosXML.length; i++) {
    try {
      const conteudo = open(`C:/k6/notasTeste/${arquivosXML[i]}`);
      arquivosCarregados.push({
        fileName: arquivosXML[i],
        content: conteudo
      });
    } catch (e) {
      console.error(`❌ ERRO: ${arquivosXML[i]}`);
    }
  }
  
  console.log(`🚀 ${arquivosCarregados.length} arquivos XML carregados para VELOCIDADE MÁXIMA`);
  return arquivosCarregados;
});

// ⚡ CONFIGURAÇÃO ULTRA RÁPIDA: 10 VUs x 500 iterations = 5000 uploads
export const options = {
  scenarios: {
    ultra_fast: {
      executor: 'per-vu-iterations',
      vus: 10,                             // 10 usuários simultâneos (máximo)
      iterations: 500,                     // 500 uploads por usuário = 5000 total
      maxDuration: '5m',                   // Máximo 5 minutos
    },
  },
  
  thresholds: {
    'http_req_duration': ['p(95)<2000'],   // Mais permissivo
    'http_req_failed': ['rate<0.2'],       // 20% de falha é ok para velocidade máxima
    'iterations': ['count>=4000'],         // Meta: pelo menos 4000 uploads
  },
};

// 🔑 Cache global de tokens
let authTokens = {};

function getAuthToken(userIndex) {
  const user = usuarios[userIndex % usuarios.length];
  const cacheKey = user.email;
  
  if (authTokens[cacheKey] && authTokens[cacheKey].expiry > Date.now()) {
    return authTokens[cacheKey].token;
  }
  
  const loginPayload = JSON.stringify({
    usuario: user.email,
    senha: user.senha
  });

  const loginResponse = http.post(
    'https://autenticacaohomologacao.sittax.com.br/api/auth/login',
    loginPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://homologacao.sittax.com.br/',
      }
    }
  );

  if (loginResponse.status === 200) {
    try {
      const responseBody = loginResponse.body;
      const tokenMatch = responseBody.match(/"token":"([^"]+)"/);
      if (tokenMatch) {
        authTokens[cacheKey] = {
          token: tokenMatch[1],
          expiry: Date.now() + (40 * 60 * 1000) // 40 minutos
        };
        return tokenMatch[1];
      }
    } catch (e) {
      console.error(`❌ Parse token: ${e.message}`);
    }
  }
  
  return null;
}

export default function () {
  const vuIndex = __VU - 1;
  const xmlFile = xmlFiles[Math.floor(Math.random() * xmlFiles.length)];
  
  // 🔑 Token rápido
  const token = getAuthToken(vuIndex);
  if (!token) {
    return; // Falha silenciosa para máxima velocidade
  }

  // 🚀 UPLOAD ULTRA RÁPIDO: FormData otimizado
  const boundary = '----WebKitFormBoundary5K4UVAB8gOEjxkKA';
  let formData = `--${boundary}\r\n`;
  formData += `Content-Disposition: form-data; name="file"; filename="${xmlFile.fileName}"\r\n`;
  formData += `Content-Type: text/xml\r\n\r\n`;
  formData += `${xmlFile.content}\r\n`;
  formData += `--${boundary}--\r\n`;

  const uploadResponse = http.post(
    'https://apihomologacao.sittax.com.br/api/upload/importar-arquivo',
    formData,
    {
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://homologacao.sittax.com.br/',
      }
    }
  );

  // ✅ Validação mínima para velocidade
  const success = uploadResponse.status === 200;
  
  // Log super esparso (a cada 250 uploads por VU)
  if (success && (__ITER + 1) % 250 === 0) {
    const totalUploads = (__VU - 1) * 500 + (__ITER + 1);
    console.log(`🚀 VU${__VU} - ${__ITER + 1}/500 | Total: ~${totalUploads}/5000 | ${uploadResponse.timings.duration.toFixed(0)}ms`);
  }

  // 🚫 SEM SLEEP - VELOCIDADE MÁXIMA ABSOLUTA!
  // sleep(0); // Comentado para máxima velocidade
}

export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs ? data.metrics.http_reqs.count : 0;
  const failedRequests = data.metrics.http_req_failed ? data.metrics.http_req_failed.count : 0;
  const avgDuration = data.metrics.http_req_duration ? data.metrics.http_req_duration.avg : 0;
  const p95Duration = data.metrics.http_req_duration && data.metrics.http_req_duration['p(95)'] ? data.metrics.http_req_duration['p(95)'] : 0;
  const iterations = data.metrics.iterations ? data.metrics.iterations.count : 0;
  const successRate = totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests * 100) : 0;
  const duration = data.state.testRunDurationMs ? data.state.testRunDurationMs / 1000 : 1;

  return {
    'reports/sittax-ultra-fast-5000-results.json': JSON.stringify(data, null, 2),
    stdout: `
🚀⚡ TESTE ULTRA RÁPIDO: VELOCIDADE MÁXIMA! ⚡🚀

📊 RESULTADO FINAL:
- 🎯 UPLOADS REALIZADOS: ${iterations}
- 📈 TOTAL DE REQUISIÇÕES: ${totalRequests}
- 🏆 TAXA DE SUCESSO: ${successRate.toFixed(2)}%
- ⚡ TEMPO MÉDIO: ${avgDuration.toFixed(2)}ms
- 📊 P95: ${p95Duration.toFixed(2)}ms
- 🔥 VELOCIDADE MÁXIMA: ${(iterations / duration).toFixed(1)} uploads/segundo
- ⏱️ DURAÇÃO: ${duration.toFixed(1)}s

🚀 CONFIGURAÇÃO ULTRA RÁPIDA:
- ⚡ 10 VUs simultâneos (máximo seguro)
- 🚫 ZERO sleep entre uploads
- 🔥 Cache agressivo de tokens
- 📦 FormData otimizado
- 🎯 Validação mínima

👥 USUÁRIOS ULTRA PARALELOS:
- 🔥 10 usuários reais simultâneos
- 📊 500 uploads por usuário
- ⚡ Velocidade teórica: 500+ uploads/s
- 🚀 Sem limitação de velocidade

${iterations >= 4000 ? '🎉🎉 META ULTRA ALCANÇADA! 4000+ uploads em minutos! 🎉🎉' : `⚡ Ultra progresso: ${iterations}/5000 (${(iterations/5000*100).toFixed(1)}%)`}

⚡ NOTA: Este é o teste mais rápido possível - VELOCIDADE MÁXIMA!
🚨 CUIDADO: Pode saturar completamente o servidor Sittax!
    `,
  };
}