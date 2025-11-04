@echo off
echo 🔍 SITTAX SMOKE TEST
echo ==================
echo Executando verificação básica do sistema...
echo.
k6 run tests/sittax-smoke-test.js --out json=reports/sittax-smoke-result.json
echo.
echo Smoke test concluído! Verifique: reports/sittax-smoke-result.json
pause