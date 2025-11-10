@echo off
echo ========================================
echo   🔍 DESCOBRIR ARQUIVOS XML - SITTAX
echo ========================================
echo.

echo 📁 Verificando pasta C:\k6\notasTeste\...
echo.

if not exist "C:\k6\notasTeste\" (
    echo ❌ PASTA NÃO ENCONTRADA: C:\k6\notasTeste\
    echo.
    echo 💡 SOLUÇÃO:
    echo    1. Crie a pasta: mkdir "C:\k6\notasTeste"
    echo    2. Copie seus arquivos XML para lá
    echo    3. Execute este script novamente
    goto :end
)

echo ✅ Pasta encontrada: C:\k6\notasTeste\
echo.
echo 📋 ARQUIVOS XML ENCONTRADOS:
echo ----------------------------------------

set /a count=0
for %%f in ("C:\k6\notasTeste\*.xml") do (
    set /a count+=1
    echo    '%%~nxf',
)

echo ----------------------------------------
echo Total: %count% arquivos XML
echo.

if %count% equ 0 (
    echo ❌ NENHUM ARQUIVO XML ENCONTRADO!
    echo.
    echo 💡 SOLUÇÃO:
    echo    1. Copie seus arquivos .xml para C:\k6\notasTeste\
    echo    2. Verifique se os arquivos têm extensão .xml
    goto :end
)

echo ✅ Arquivos encontrados!
echo.
echo 📝 PRÓXIMO PASSO:
echo    1. Copie a lista acima 
echo    2. Edite tests\upload\sittax-upload-notas-test.js
echo    3. Substitua a lista arquivosXML = [...] pelos nomes reais
echo.
echo Exemplo:
echo const arquivosXML = [
for %%f in ("C:\k6\notasTeste\*.xml") do (
    echo    '%%~nxf',
)
echo ];

:end
echo.
echo ========================================
pause