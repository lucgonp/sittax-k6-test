# 📁 Estrutura de Testes Organizada

## 🗂️ Organização por Categoria

### 🔐 **`tests/auth/`** - Testes de Autenticação
- `sittax-login-simple.js` - Login simples
- `sittax-login-test.js` - Login completo com validações

### 📤 **`tests/upload/`** - Testes de Upload
- `sittax-xml-upload-simple.js` - Upload XML básico
- `sittax-upload-notas-test.js` - **Upload de notas fiscais (NOVO)**

### ⚡ **`tests/performance/`** - Testes de Performance
- `sittax-smoke-test.js` - Teste smoke
- `sittax-load-test.js` - Teste de carga
- `sittax-stress-test.js` - Teste de estresse
- `sittax-spike-test.js` - Teste de picos
- `sittax-spike-test-extreme.js` - Teste de picos extremos
- `sittax-soak-test.js` - Teste de durabilidade
- `sittax-breakpoint-test.js` - Teste de limite

## 🚀 Como Executar

### Testes de Upload
```bash
# Upload XML simples
k6 run tests/upload/sittax-xml-upload-simple.js

# Upload de notas fiscais (NOVO)
k6 run tests/upload/sittax-upload-notas-test.js
```

### Testes de Autenticação
```bash
# Login simples
k6 run tests/auth/sittax-login-simple.js

# Login completo
k6 run tests/auth/sittax-login-test.js
```

### Testes de Performance
```bash
# Smoke test
k6 run tests/performance/sittax-smoke-test.js

# Load test
k6 run tests/performance/sittax-load-test.js

# Stress extremo
k6 run tests/performance/sittax-stress-test.js
```