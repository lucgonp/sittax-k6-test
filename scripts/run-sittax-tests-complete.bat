@echo off
echo ========================================
echo      SITTAX K6 PERFORMANCE TESTS
echo      🚀 TESTE COMPLETO - 2024 🚀
echo ========================================
echo.

echo [1/8] 🧪 SMOKE TEST - Verificar funcionamento básico...
echo Duração: ~30 segundos
k6 run tests/performance/sittax-smoke-test.js --out json=reports/sittax-smoke-result.json

echo.
echo [2/8] 🔐 LOGIN TEST - Verificar autenticação...
echo Duração: ~1 minuto
k6 run tests/auth/sittax-login-simple.js --out json=reports/sittax-login-result.json

echo.
echo [3/8] ⚡ LOAD TEST - Carga normal de trabalho...
echo Duração: ~3 minutos
echo Carga: 1 → 50 → 100 usuários
k6 run tests/performance/sittax-load-test.js --out json=reports/sittax-load-result.json

echo.
echo [4/8] 🔥 STRESS TEST - FORÇANDO LIMITES EXTREMOS...
echo Duração: ~5 minutos
echo Carga: 1 → 200 → 500 usuários simultâneos!
k6 run tests/performance/sittax-stress-test.js --out json=reports/sittax-stress-result.json

echo.
echo [5/8] ⚡ SPIKE TEST - Picos de tráfego BRUTAL...
echo Duração: ~3 minutos
echo Carga: 1 → 1000 usuários EM 10 SEGUNDOS!
k6 run tests/performance/sittax-spike-test.js --out json=reports/sittax-spike-result.json

echo.
echo [6/8] 🏃 SOAK TEST - Teste de resistência prolongada...
echo Duração: ~10 minutos
echo Carga: 100 usuários por 8 minutos contínuos
k6 run tests/performance/sittax-soak-test.js --out json=reports/sittax-soak-result.json

echo.
echo [7/8] 💥 BREAKPOINT TEST - Encontrar limite de quebra...
echo Duração: ~8 minutos
echo Carga: Escala até quebrar (até 2000 usuários!)
k6 run tests/performance/sittax-breakpoint-test.js --out json=reports/sittax-breakpoint-result.json

echo.
echo [8/8] 📤 UPLOAD TEST - Teste de upload de arquivos...
echo Duração: ~5 minutos
echo Carga: Upload simultâneo de múltiplos arquivos
k6 run tests/upload/sittax-upload-notas-test.js --out json=reports/sittax-upload-result.json

echo.
echo ========================================
echo   🚀 TODOS OS TESTES COMPLETOS 🚀
echo Tempo total estimado: ~35 minutos
echo Verifique os relatórios em: reports/
echo ========================================
pause