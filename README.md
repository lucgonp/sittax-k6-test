# 🔥 Sittax K6 Performance Testing Suite

> **Projeto de testes de performance extremamente agressivos para a API de autenticação Sittax usando k6**

[![k6](https://img.shields.io/badge/k6-performance%20testing-7d64ff)](https://k6.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## � Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Tipos de Teste](#tipos-de-teste)
- [Configuração](#configuração)
- [Resultados](#resultados)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

Este projeto implementa uma suíte completa de testes de performance para a API de autenticação Sittax, incluindo testes **extremamente agressivos** que podem simular até **10.000 usuários simultâneos**.

### 🔥 Características Principais

- **32 usuários reais** carregados de CSV
- **Testes devastadores** com até 10k VUs
- **7 tipos de teste** diferentes (Smoke, Load, Stress, Spike, Spike Extreme, Soak, Breakpoint)
- **Spike Test Extreme** com capacidade apocalíptica
- **Relatórios detalhados** em JSON
- **Integração VS Code** com tasks configuradas

## ✨ Funcionalidades

- 🔍 **Smoke Test**: Verificação básica (1 VU)
- 📈 **Load Test**: Carga normal (até 200 VUs)
- 💪 **Stress Test**: Estresse extremo (até 9000 VUs)
- 🚀 **Spike Test**: Picos súbitos (até 800 VUs)
- 🔥 **Spike Test Extreme**: Devastação total (até 10000 VUs)
- ⏰ **Soak Test**: Durabilidade (40 minutos)
- 💥 **Breakpoint Test**: Limite absoluto (até 2500 VUs)

## 🛠 Pré-requisitos

- [k6](https://k6.io/docs/get-started/installation/) instalado
- Windows PowerShell ou terminal compatível
- Acesso à API Sittax de homologação

## � Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/sittax-k6-test.git
cd sittax-k6-test
```

2. Verifique se o k6 está instalado:
```bash
k6 version
```

## 🚀 Uso

### Execução Individual

```bash
# Teste básico
k6 run tests/sittax-smoke-test.js

# Teste de carga
k6 run tests/sittax-load-test.js

# Spike devastador (⚠️ CUIDADO)
k6 run tests/sittax-spike-test-extreme.js
```

### Execução Completa

```bash
# Windows
scripts\run-sittax-tests.bat

# Ou individual com parâmetros
k6 run tests/sittax-spike-test.js --vus 500 --duration 2m
```

### VS Code Tasks

Se usar VS Code, execute via `Ctrl+Shift+P` → `Tasks: Run Task`:
- `k6: Sittax Smoke Test`
- `k6: Sittax Load Test`
- `k6: Sittax Stress Test`
- `k6: Sittax Spike Test`
- `k6: Run All Sittax Tests`

## � Tipos de Teste

| Teste | VUs Máximos | Duração | Objetivo |
|-------|-------------|---------|----------|
| **Smoke** | 1 | 1min | Verificação básica |
| **Load** | 200 | 16min | Carga normal |
| **Stress** | 9000 | 25min | Estresse extremo |
| **Spike** | 800 | 7min | Picos súbitos |
| **Spike Extreme** | 10000 | 8min | Devastação total |
| **Soak** | 15 | 40min | Durabilidade |
| **Breakpoint** | 2500 | 20min | Limite absoluto |

## ⚙️ Configuração

### Dados de Usuário

Os usuários de teste estão em `data/login_usuarios.csv`:

```csv
usuario,senha
user1@sittax.com.br,senha123
user2@sittax.com.br,senha456
...
```

### Endpoint de Teste

```javascript
const API_URL = 'https://autenticacaohomologacao.sittax.com.br/api/auth/login';
```

### Thresholds Configurados

```javascript
thresholds: {
  http_req_duration: ['p(95)<30000'],    // 95% < 30s
  http_req_failed: ['rate<0.85'],        // < 85% falhas
  checks: ['rate>0.15'],                 // > 15% sucessos
}
```

## 📈 Resultados

Os relatórios são salvos em `reports/`:

- `sittax-smoke-result.json`
- `sittax-load-result.json`
- `sittax-stress-result.json`
- `sittax-spike-result.json`
- `sittax-spike-extreme-result.json`
- `sittax-soak-result.json`
- `sittax-breakpoint-result.json`

### Exemplo de Resultado

```
🔥💀⚡ SPIKE TEST EXTREME - DEVASTAÇÃO TOTAL ⚡💀🔥

📊 ESTATÍSTICAS:
- Total requests: 45,230
- RPS: 1,205.2
- Taxa de falha: 23.4%
- P95: 8,950ms

💀 RESULTADO: SISTEMA DEVASTADO! ✅
```

## ⚠️ Avisos Importantes

- **SPIKE EXTREME** pode quebrar o sistema alvo
- **Monitorar recursos** durante testes pesados
- **Usar em ambiente de homologação** apenas
- **10.000 VUs** = potencialmente 200.000+ requests simultâneos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature incrível'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## � Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Criado para testes de performance extremos da API Sittax.

---

**⚡ Lembre-se: Com grandes poderes vêm grandes responsabilidades. Use estes testes com sabedoria! ⚡**