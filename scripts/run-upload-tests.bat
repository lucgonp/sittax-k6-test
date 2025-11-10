@echo off
echo ========================================
echo      SITTAX K6 UPLOAD TESTS SUITE
echo     📤 TESTES DE UPLOAD DE ARQUIVOS 📤
echo ========================================
echo.

echo [1/3] 🔐 LOGIN TEST - Verificar autenticação...
echo Duração: ~30 segundos
k6 run tests/auth/sittax-login-simple.js --out json=reports/sittax-login-result.json

echo.
echo [2/3] 📄 UPLOAD XML TEST - Upload simples de XML...
echo Duração: ~10 segundos
k6 run tests/upload/sittax-xml-upload-simple.js --out json=reports/sittax-xml-upload-result.json

echo.
echo [3/3] 📁 UPLOAD NOTAS TEST - Upload de notas fiscais...
echo Duração: ~5 minutos
echo Carga: 5 → 10 usuários fazendo upload simultâneo
echo Arquivos: Simula C:\k6\notasTeste\*.xml
k6 run tests/upload/sittax-upload-notas-test.js --out json=reports/sittax-upload-notas-result.json

echo.
echo ========================================
echo   📤 TESTES DE UPLOAD COMPLETOS 📤
echo Verifique os relatórios em: reports/
echo ========================================
pause