# 📁 Pasta de Arquivos XML - Sittax k6 Tests

Esta pasta contém os arquivos XML de Notas Fiscais que são usados nos testes de upload.

## 📂 Como usar seus próprios arquivos

### Opção 1: Copiar seus XMLs para esta pasta
1. Copie os arquivos XML da pasta `C:\k6\notasTeste\` para `xml_files/`
2. Edite o arquivo `tests/upload/sittax-upload-notas-test.js`
3. Na linha `const arquivosXML = [...]` substitua pelos nomes reais dos seus arquivos

### Opção 2: Apontar diretamente para C:\k6\notasTeste
1. Edite o arquivo `tests/upload/sittax-upload-notas-test.js`
2. Na função `open()`, mude o caminho de `../../xml_files/` para `C:/k6/notasTeste/`

## 📋 Arquivos de exemplo inclusos

- `nota001.xml` - NFe de venda de mercadoria (R$ 100,00)
- `nota002.xml` - NFe de prestação de serviços (R$ 1.500,00) 
- `nota003.xml` - NFe de produtos diversos (R$ 850,00)

## ⚙️ Configuração atual

O teste está configurado para:
- ✅ **Tentar carregar arquivos reais** primeiro
- ✅ **Usar conteúdo simulado** se o arquivo não existir
- ✅ **Logs informativos** sobre quais arquivos foram carregados
- ✅ **Upload multipart** com FormData correto

## 🚀 Execução

```bash
# Rodar teste de upload
k6 run tests/upload/sittax-upload-notas-test.js

# Ou usar script automatizado
scripts\run-upload-tests.bat
```

## 📊 Logs esperados

```
✅ Arquivo carregado: nota001.xml
✅ Arquivo carregado: nota002.xml  
⚠️ Arquivo nota999.xml não encontrado, usando simulado
```

## 📝 Formato XML esperado

Os arquivos XML devem ser **NFes válidas** no formato:
- Versão 4.00
- Com tag `<nfeProc>` 
- Encoding UTF-8
- Estrutura completa da NFe

Se você tem arquivos diferentes, o teste vai funcionar, mas talvez a API da Sittax retorne erro específico do formato.