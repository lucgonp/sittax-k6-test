# 🚨 CONFIGURAÇÃO OBRIGATÓRIA - ARQUIVOS XML REAIS

## ❌ Problema Atual
O teste está configurado para usar **APENAS arquivos XML reais** da pasta `C:\k6\notasTeste\`, mas os nomes na lista não correspondem aos arquivos que existem na sua pasta.

## ✅ Solução em 3 Passos

### **1. Descubra os arquivos que existem**
```bash
# Execute este script para listar os arquivos XML
scripts\descobrir-arquivos-xml.bat
```

### **2. Edite o código com os nomes EXATOS**
No arquivo `tests\upload\sittax-upload-notas-test.js`, linha ~95, substitua:

```javascript
// ❌ NOMES FALSOS (atual)
const arquivosXML = [
  'arquivo1.xml',
  'arquivo2.xml', 
  'arquivo3.xml',
];

// ✅ NOMES REAIS (seus arquivos)
const arquivosXML = [
  'sua_nfe_001.xml',
  'nota_fiscal_123.xml',
  'documento_fiscal_456.xml',
  // ... seus arquivos reais
];
```

### **3. Execute o teste**
```bash
scripts\run-upload-tests.bat
```

## 📋 Exemplo Prático

Se sua pasta `C:\k6\notasTeste\` contém:
```
- nfe_12345.xml
- nota_fiscal_67890.xml  
- documento_abc.xml
```

Então edite para:
```javascript
const arquivosXML = [
  'nfe_12345.xml',
  'nota_fiscal_67890.xml',
  'documento_abc.xml',
];
```

## 🔥 Resultado Esperado

Quando configurado corretamente:
```
✅ Arquivo XML REAL carregado: nfe_12345.xml
✅ Arquivo XML REAL carregado: nota_fiscal_67890.xml
✅ Arquivo XML REAL carregado: documento_abc.xml
📁 Total de 3 arquivos XML REAIS carregados da pasta C:/k6/notasTeste/
```

## ⚠️ Sem Fallback

**IMPORTANTE**: O teste **NÃO usa mais arquivos simulados**. Se um arquivo não for encontrado, o teste **falha**. Isso garante que você está testando apenas com seus dados reais.

## 🛠️ Verificação Rápida

Para confirmar que seus arquivos estão corretos:
1. Execute `scripts\descobrir-arquivos-xml.bat`
2. Copie a lista exata que aparecer
3. Cole no código
4. Execute o teste

---

💡 **Dica**: Use `Copy-Item "C:\k6\notasTeste\*.xml" "xml_files\"` se preferir trabalhar com cópia local dos arquivos.