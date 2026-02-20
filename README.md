<p align="center">
  <img src="https://img.shields.io/badge/k6-v0.47+-7d64ff?style=for-the-badge&logo=k6" alt="k6">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge" alt="License">
</p>

# ⚡ Sittax & Agilizza — Performance Testing Suite

> Suíte completa de testes de carga, stress e performance para as plataformas **Sittax** e **Agilizza** usando [Grafana k6](https://k6.io/).

<p align="center">
  <img src="https://img.shields.io/badge/Testes-20_tipos-4CAF50?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/badge/Max_VUs-10.000-E53935?style=flat-square" alt="VUs">
  <img src="https://img.shields.io/badge/Upload_Record-94.6%2Fs-FF9800?style=flat-square" alt="Upload">
  <img src="https://img.shields.io/badge/Agilizza-500_VUs-FF6600?style=flat-square" alt="Agilizza">
  <img src="https://img.shields.io/badge/Usuários-1.032_reais-2196F3?style=flat-square" alt="Users">
</p>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Sittax — Testes de Performance](#-sittax--testes-de-performance)
- [Agilizza — Testes de Carga](#-agilizza--testes-de-carga)
- [Scripts de Execução](#-scripts-de-execução)
- [Configuração](#️-configuração)
- [Relatórios](#-relatórios)
- [Contribuição](#-contribuição)

---

## 🎯 Visão Geral

Este projeto testa a **resiliência, performance e limites** de duas plataformas da Sittax:

| Plataforma | Stack | Auth | Usuários | Resultado |
|------------|-------|------|----------|-----------|
| **Sittax Homologação** | API REST (JWT) | Bearer Token | 32 | Até 10k VUs |
| **Agilizza** | Laravel (PHP 8.2) | Sessão/Cookie + CSRF | 1.001 | 500 VUs — 90.70% sucesso |

### APIs Testadas

```
🔐 Sittax Auth    → https://<SITTAX_AUTH_HOST>/api/auth/login
📄 Sittax Upload  → https://<SITTAX_API_HOST>/api/upload/importar-arquivo
🚀 Agilizza       → https://<AGILIZZA_HOST>/login
```

---

## 📁 Arquitetura do Projeto

```
sittax-k6-test/
├── tests/
│   ├── auth/                          # Testes de autenticação
│   │   ├── sittax-login-simple.js     # Sittax: login básico
│   │   ├── sittax-login-test.js       # Sittax: login completo
│   │   ├── agilizza-login-simple.js   # Agilizza: smoke test
│   │   ├── agilizza-load-test.js      # Agilizza: carga massiva (100 VUs)
│   │   ├── agilizza-stress-test.js    # Agilizza: stress (300 VUs)
│   │   ├── agilizza-spike-test.js     # Agilizza: spike (100 VUs × N)
│   │   └── agilizza-breakpoint-test.js # Agilizza: limite (500 VUs)
│   ├── performance/                   # Testes de performance Sittax
│   └── upload/                        # Testes de upload de notas
├── data/
│   ├── login_usuarios.csv             # 32 usuários Sittax
│   ├── agilizza_usuarios.csv          # 101 usuários Agilizza
│   └── credentials.csv
├── scripts/                           # Scripts .bat de execução
├── reports/                           # Relatórios JSON gerados
├── xml_files/                         # XMLs para upload de notas
└── config/
```

---

## 🛠 Pré-requisitos

- [k6](https://k6.io/docs/get-started/installation/) instalado (v0.47+)
- Windows PowerShell ou terminal compatível
- Acesso de rede às APIs Sittax/Agilizza
- Arquivos XML reais em `C:/k6/notasTeste/` (para testes de upload)

## 📦 Instalação

```bash
git clone https://github.com/lucgonp/sittax-k6-test.git
cd sittax-k6-test
k6 version   # Verificar instalação
```

---

## 🔐 Sittax — Testes de Performance

Testes para a **API REST do Sittax** (homologação) com autenticação via **JWT Bearer Token**.

### Testes de Autenticação

| Teste | Arquivo | Descrição |
|-------|---------|-----------|
| Login Simples | `tests/auth/sittax-login-simple.js` | 5 VUs, 1 min — validação básica |
| Login Completo | `tests/auth/sittax-login-test.js` | Ramp up 10→20 VUs com navegação autenticada |

### Testes de Performance

| Teste | VUs Máx | Duração | Objetivo |
|-------|---------|---------|----------|
| 🔍 **Smoke** | 1 | 1 min | Verificação básica de sanidade |
| 📈 **Load** | 200 | 16 min | Simular carga normal de produção |
| 💪 **Stress** | 9.000 | 25 min | Testar limites extremos |
| 🚀 **Spike** | 800 | 7 min | Simular picos súbitos de acesso |
| 🔥 **Spike Extreme** | 10.000 | 8 min | Bombardeio máximo |
| ⏰ **Soak** | 15 | 40 min | Teste de durabilidade prolongada |
| 💥 **Breakpoint** | 2.500 | 20 min | Encontrar limite absoluto |

### Testes de Upload de Notas

| Teste | Descrição | Resultado |
|-------|-----------|-----------|
| ⚡ **Ultra Fast 5000** | 5.000 uploads otimizados | **94.6 uploads/s — RECORDE** |
| 📦 **Upload 5000** | Upload sequencial de 5.000 notas | 100% sucesso |
| 🧪 **Upload Teste** | Validação com XMLs reais | Cobertura completa |

### Uso Rápido — Sittax

```bash
# Testes individuais
k6 run tests/auth/sittax-login-simple.js
k6 run tests/performance/sittax-load-test.js

# Suíte completa
scripts\run-sittax-tests.bat

# Com parâmetros customizados
k6 run tests/performance/sittax-spike-test.js --vus 500 --duration 2m
```

---

## 🚀 Agilizza — Testes de Carga

Testes para o sistema **Agilizza** (`agilizza.sittax.com.br`), uma aplicação **Laravel (PHP 8.2)** que usa autenticação via **sessão/cookie** com proteção **CSRF**.

### Fluxo de Autenticação

Diferente do Sittax (JWT), o Agilizza requer um fluxo em **2 etapas**:

```
1. GET  /login  →  Obter token CSRF do HTML (<input name="_token">)
2. POST /login  →  Submeter form com { _token, email, password }
   ↳ Servidor retorna sessão via cookies (agilizza_session + XSRF-TOKEN)
3. GET  /dashboard/data/all  →  Acessar dados autenticados via cookie
```

### Testes Disponíveis

| Teste | Arquivo | VUs | Duração | O que faz |
|-------|---------|-----|---------|-----------|
| 🟢 **Smoke** | `agilizza-login-simple.js` | 5 | 1 min | Login + validação de redirecionamento |
| 🟡 **Load** | `agilizza-load-test.js` | 100 | 10 min | Login + dashboard + notificações (ramp up) |
| 🔴 **Stress** | `agilizza-stress-test.js` | 300 | 15 min | Spike progressivo + navegação completa |
| 💥 **Spike** | `agilizza-spike-test.js` | 100 | Variável | 100 VUs **simultâneos** × 1.000 iterações |
| 🎯 **Breakpoint** | `agilizza-breakpoint-test.js` | 500 | 9 min | Subida progressiva até encontrar o limite |

### Endpoints Testados

| Endpoint | Método | Tipo | Descrição |
|----------|--------|------|-----------|
| `/login` | `GET` | HTML | Página de login (obter CSRF token) |
| `/login` | `POST` | Form | Submissão do formulário de login |
| `/dashboard/data/all` | `GET` | JSON | Dados completos do dashboard |
| `/notifications/unread/get` | `GET` | JSON | Notificações não lidas |
| `/home` | `GET` | HTML | Página principal pós-login |
| `/empresas` | `GET` | HTML | Listagem de empresas |

### Uso Rápido — Agilizza

```bash
# Menu interativo
scripts\run-agilizza-tests.bat

# Direto
k6 run tests/auth/agilizza-login-simple.js         # Smoke
k6 run tests/auth/agilizza-load-test.js             # Carga massiva
k6 run tests/auth/agilizza-stress-test.js           # Stress
k6 run tests/auth/agilizza-breakpoint-test.js       # Breakpoint
```

### 📊 Resultado do Breakpoint Test — 20/02/2026

Teste com subida progressiva de **50 → 100 → 200 → 300 → 500 VUs** usando **1.001 usuários distintos**:

```
┌─────────────────────────────────────────────────────────────┐
│              BREAKPOINT TEST — 1.001 USUÁRIOS               │
├─────────────────────────┬───────────────────────────────────┤
│ Total de requests       │ 86.091                            │
│ Total de iterações      │ 15.322                            │
│ VUs máximos             │ 500                               │
│ Requests/segundo        │ 158.2 req/s                       │
│ Dados transferidos      │ 2.0 GB recebidos                  │
├─────────────────────────┼───────────────────────────────────┤
│ Taxa sucesso login      │ 90.70% (13.898 / 15.322)         │
│ Taxa erro HTTP          │ 2.14%  (1.847 / 86.091)          │
│ Tempo médio resposta    │ 1.49s                             │
│ p50 (mediana)           │ 349ms                             │
│ p90                     │ 1.17s                             │
│ p95                     │ 1.92s                             │
├─────────────────────────┴───────────────────────────────────┤
│ ✅ Servidor NÃO caiu com 500 VUs simultâneos                │
│ ⚠️  Degradação começa a partir de ~300 VUs (timeouts)       │
│ ✅ Infraestrutura bem dimensionada                          │
└─────────────────────────────────────────────────────────────┘
```

#### Comparativo: 101 vs 1.001 Usuários

| Métrica | 101 usuários | 1.001 usuários |
|---------|-------------|----------------|
| Login success | 92.57% | 90.70% |
| Erro HTTP | 1.67% | 2.14% |
| p95 | 2.12s | 1.92s |
| Requests totais | 101k | 86k |
| Tempo/iteração | 7.73s | 8.96s |

> **Nota:** Com 10× mais usuários distintos, cada iteração demora mais (mais sessões únicas no servidor), resultando em menos iterações totais no mesmo período de 9 minutos. A performance do servidor permaneceu estável.

---

## 🎮 Scripts de Execução

| Script | Plataforma | Descrição |
|--------|-----------|-----------|
| `run-agilizza-tests.bat` | Agilizza | Menu interativo (Smoke / Load / Stress / Todos) |
| `run-auth-tests.bat` | Sittax | Login simples + completo |
| `run-sittax-tests.bat` | Sittax | Suíte completa de testes |
| `run-performance-tests.bat` | Sittax | Todos os testes de performance |
| `run-upload-tests.bat` | Sittax | Testes de upload de notas |
| `run-stress-extremo.bat` | Sittax | Stress extremo (com confirmação ⚠️) |
| `run-smoke-test.bat` | Sittax | Smoke test rápido |
| `run-load-test.bat` | Sittax | Teste de carga |
| `run-stress-test.bat` | Sittax | Teste de stress |

---

## ⚙️ Configuração

### Dados de Usuários

> ⚠️ **Os arquivos CSV com credenciais reais estão no `.gitignore` e não são versionados.** Use os templates `.csv.example` como referência.

**Sittax** — copie `data/login_usuarios.csv.example` para `data/login_usuarios.csv`:
```csv
usuario,senha
seuemail@empresa.com.br,SuaSenha
...
```

**Agilizza** — copie `data/agilizza_usuarios.csv.example` para `data/agilizza_usuarios.csv`:
```csv
email,senha
seuemail@empresa.com.br,SuaSenha
...
```

### Thresholds Padrão

```javascript
// Sittax (testes agressivos)
thresholds: {
  http_req_duration: ['p(95)<30000'],   // 95% das requests < 30s
  http_req_failed:   ['rate<0.85'],     // < 85% falhas
}

// Agilizza (testes de carga)
thresholds: {
  http_req_duration: ['p(95)<8000'],    // 95% das requests < 8s
  http_req_failed:   ['rate<0.3'],      // < 30% falhas
  login_success_rate: ['rate>0.6'],     // > 60% logins com sucesso
}
```

### Integração VS Code

Execute via `Ctrl+Shift+P` → **Tasks: Run Task**:
- `k6: Sittax Smoke Test`
- `k6: Sittax Load Test`
- `k6: Sittax Stress Test`
- `k6: Sittax Spike Test`
- `k6: Run All Sittax Tests`

---

## 📈 Relatórios

Todos os relatórios JSON são gerados na pasta `reports/`:

| Plataforma | Relatórios |
|-----------|------------|
| **Sittax** | `sittax-smoke-result.json`, `sittax-load-result.json`, `sittax-stress-result.json`, `sittax-spike-result.json`, `sittax-spike-extreme-result.json`, `sittax-soak-result.json`, `sittax-breakpoint-result.json` |
| **Agilizza** | `agilizza-smoke-result.json`, `agilizza-load-result.json`, `agilizza-stress-result.json`, `agilizza-spike-result.json`, `agilizza-breakpoint-result.json` |

### Métricas Importantes

| Métrica | Descrição |
|---------|-----------|
| `http_req_duration` | Tempo de resposta (p50, p90, p95) |
| `http_req_failed` | Taxa de falhas HTTP |
| `login_success_rate` | Taxa de logins com sucesso |
| `login_duration` | Tempo específico do POST de login |
| `dashboard_duration` | Tempo de carregamento do dashboard |
| `iterations` | Total de iterações completadas |
| `vus` | Usuários virtuais ativos |

---

## ⚠️ Avisos Importantes

> **CUIDADO**: Testes acima de 300 VUs podem causar degradação no servidor-alvo. Sempre use em ambiente de **homologação**.

- Testes **Spike Extreme** (10k VUs) podem derrubar serviços em produção
- **Monitorar recursos** do servidor durante testes pesados
- O Cloudflare pode aplicar **rate limiting** em testes muito agressivos
- Recomendado: coordenar com a equipe de infra antes de testes de breakpoint

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/NovaFeature`
3. Commit: `git commit -m 'Add: Nova feature'`
4. Push: `git push origin feature/NovaFeature`
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-E53935?style=for-the-badge" alt="Made with Love">
  <img src="https://img.shields.io/badge/k6-Performance_Testing-7d64ff?style=for-the-badge&logo=k6" alt="k6">
  <img src="https://img.shields.io/badge/Sittax-API_Testing-4CAF50?style=for-the-badge" alt="Sittax">
  <img src="https://img.shields.io/badge/Agilizza-Load_Testing-FF6600?style=for-the-badge" alt="Agilizza">
</p>

<p align="center">
  <strong>⚡ Suíte de Performance Testing mais completa para Sittax & Agilizza ⚡</strong><br>
  <a href="https://github.com/lucgonp/sittax-k6-test">github.com/lucgonp/sittax-k6-test</a>
</p>