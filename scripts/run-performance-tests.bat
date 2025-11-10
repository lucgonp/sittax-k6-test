@echo off
echo ========================================
echo    SITTAX K6 PERFORMANCE TESTS ONLY
echo     🚀 TESTES DE PERFORMANCE 🚀
echo ========================================
echo.

echo [1/6] 🧪 SMOKE TEST...
k6 run tests/performance/sittax-smoke-test.js --out json=reports/sittax-smoke-result.json

echo.
echo [2/6] ⚡ LOAD TEST...
k6 run tests/performance/sittax-load-test.js --out json=reports/sittax-load-result.json

echo.
echo [3/6] 🔥 STRESS TEST - EXTREMO...
k6 run tests/performance/sittax-stress-test.js --out json=reports/sittax-stress-result.json

echo.
echo [4/6] ⚡ SPIKE TEST - BRUTAL...
k6 run tests/performance/sittax-spike-test.js --out json=reports/sittax-spike-result.json

echo.
echo [5/6] 🏃 SOAK TEST...
k6 run tests/performance/sittax-soak-test.js --out json=reports/sittax-soak-result.json

echo.
echo [6/6] 💥 BREAKPOINT TEST...
k6 run tests/performance/sittax-breakpoint-test.js --out json=reports/sittax-breakpoint-result.json

echo.
echo ======================================
echo   🚀 PERFORMANCE TESTS COMPLETOS 🚀
echo ======================================
pause