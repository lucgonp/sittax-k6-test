@echo off
echo ========================================
echo      SITTAX K6 AUTH TESTS SUITE
echo       🔐 TESTES DE LOGIN 🔐
echo ========================================
echo.

echo [1/2] 🔐 LOGIN SIMPLE - Teste básico...
echo Duração: ~30 segundos
k6 run tests/auth/sittax-login-simple.js --out json=reports/sittax-login-simple-result.json

echo.
echo [2/2] 🔐 LOGIN COMPLETO - Teste completo...
echo Duração: ~2 minutos
k6 run tests/auth/sittax-login-test.js --out json=reports/sittax-login-complete-result.json

echo.
echo ========================================
echo    🔐 TESTES DE LOGIN COMPLETOS 🔐
echo Verifique os relatórios em: reports/
echo ========================================
pause