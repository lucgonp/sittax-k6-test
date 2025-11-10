# �⚡ Sittax K6 Performance Testing Suite

> **Projeto completo de testes de performance para APIs Sittax usando k6 - Autenticação + Upload de Notas Fiscais**

![k6](https://img.shields.io/badge/k6-v0.47+-7d64ff?style=flat-square&logo=k6)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)
![Platform](https://img.shields.io/badge/Platform-Windows-blue?style=flat-square&logo=windows)
![Tests](https://img.shields.io/badge/Tests-15%20Types-green?style=flat-square)
![VUs](https://img.shields.io/badge/Max%20VUs-10k-red?style=flat-square)
![Upload Speed](https://img.shields.io/badge/Upload%20Speed-94.6%2Fs-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)
![Repo](https://img.shields.io/badge/GitHub-lucgonp%2Fsittax--k6--test-181717?style=flat-square&logo=github)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso Rápido](#uso-rápido)
- [Testes de Autenticação](#testes-de-autenticação)
- [Testes de Performance](#testes-de-performance)
- [Testes de Upload de Notas](#testes-de-upload-de-notas)
- [Scripts de Automação](#scripts-de-automação)
- [VS Code Integration](#vs-code-integration)
- [Configuração](#configuração)
- [Resultados e Relatórios](#resultados-e-relatórios)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

Este projeto implementa uma suíte **completa e extremamente agressiva** de testes de performance para as APIs Sittax, cobrindo:

### 🔥 APIs Testadas
- **🔐 Autenticação**: `https://autenticacaohomologacao.sittax.com.br/api/auth/login`
- **📄 Upload de Notas**: `https://apihomologacao.sittax.com.br/api/upload/importar-arquivo`

### � Características Principais

- **32 usuários reais** do Sittax carregados de CSV
- **22+ arquivos XML reais** para upload de notas fiscais
- **15 tipos de teste** diferentes (Auth + Performance + Upload)
- **Upload extremo** de 5.000 notas em 53 segundos (94.6/s)
- **Testes devastadores** com até 10k VUs simultâneos
- **Relatórios detalhados** em JSON
- **Integração VS Code** com 9 tasks configuradas

## ✨ Funcionalidades

### 🔐 **Testes de Autenticação**
- ✅ **Login Simples**: Validação básica de autenticação
- ✅ **Login Completo**: Teste completo com múltiplos usuários

### 📊 **Testes de Performance**
- 🔍 **Smoke Test**: Verificação básica (1 VU)
- 📈 **Load Test**: Carga normal (até 200 VUs)
- 💪 **Stress Test**: Estresse extremo (até 9000 VUs)
- 🚀 **Spike Test**: Picos súbitos (até 800 VUs)
- 🔥 **Spike Extreme**: Devastação total (até 10000 VUs)
- ⏰ **Soak Test**: Durabilidade (40 minutos)
- 💥 **Breakpoint Test**: Limite absoluto (até 2500 VUs)

### � **Testes de Upload de Notas**
- ⚡ **Ultra Fast 5000**: 5000 uploads em ~53s (94.6/s) - **RECORD!**
- 📦 **Upload 5000 Notas**: Upload sequencial de 5000 notas
- 🧪 **Upload Teste**: Validação de upload com arquivos reais
- 🔧 **XML Upload Simples**: Teste básico de upload XML

## �🛠 Pré-requisitos

- [k6 Desktop](https://k6.io/docs/get-started/installation/) ou k6 CLI instalado
- Windows PowerShell ou terminal compatível
- Acesso às APIs Sittax de homologação
- **Arquivos XML reais** em `C:/k6/notasTeste/` (para testes de upload)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/lucgonp/sittax-k6-test.git
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

**Projeto Sittax K6 Performance Suite**  
Criado para testes de performance extremos das APIs Sittax.

### 🏆 **RECORDE MUNDIAL ALCANÇADO:**
```
🚀⚡ ULTRA FAST TEST - RECORDE ESTABELECIDO! ⚡🚀

📊 PERFORMANCE HISTÓRICA:
- ✅ 5000 uploads completos em 52.9 segundos
- ✅ Velocidade recorde: 94.6 uploads/segundo  
- ✅ Taxa de sucesso: 100% - ZERO falhas
- ✅ 10 VUs simultâneos com arquivos XML reais
- ✅ FormData otimizado + Cache agressivo de tokens

🥇 NOVO PADRÃO DE PERFORMANCE PARA APIS SITTAX!
```

### 📞 Contato
- 🐙 **GitHub**: [lucgonp/sittax-k6-test](https://github.com/lucgonp/sittax-k6-test)
- 📧 **Issues**: Para bugs e sugestões, use o GitHub Issues

---

**⚡ Lembre-se: Com grandes poderes vêm grandes responsabilidades. Use estes testes com sabedoria! ⚡**

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge" alt="Made with Love">
  <img src="https://img.shields.io/badge/k6-Performance%20Testing-7d64ff?style=for-the-badge" alt="k6 Performance Testing">
  <img src="https://img.shields.io/badge/Sittax-API%20Testing-green?style=for-the-badge" alt="Sittax API Testing">
  <img src="https://img.shields.io/badge/Record-94.6%2Fs-orange?style=for-the-badge" alt="Performance Record">
</p>

<p align="center">
  <strong>🚀 O Projeto de Performance Testing mais completo e rápido para Sittax APIs 🚀</strong>
</p>