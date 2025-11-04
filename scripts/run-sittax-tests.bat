@echo off
echo ========================================
echo    SITTAX K6 PERFORMANCE TESTS SUITE
echo     🔥💀 VERSÃO DEVASTADORA 💀🔥
echo ========================================
echo.

echo [1/7] 🔍 SMOKE TEST - Verificação básica do sistema...
echo Duração: ~1 minuto
k6 run tests/sittax-smoke-test.js --out json=reports/sittax-smoke-result.json

echo.
echo [2/7] 📈 LOAD TEST - Teste de carga normal...
echo Duração: ~16 minutos
k6 run tests/sittax-load-test.js --out json=reports/sittax-load-result.json

echo.
echo [3/7] 💪 STRESS TEST - Teste de estresse DEVASTADOR...
echo Duração: ~25 minutos - TESTE EXTREMAMENTE AGRESSIVO!
echo Carga: 200 → 9000 usuários virtuais (APOCALÍPTICO)
set /p confirm3="⚠️ ATENÇÃO: Este teste pode DESTRUIR o sistema (9000 VUs)! Continuar? (s/N): "
if /i "%confirm3%"=="s" (
    k6 run tests/sittax-stress-test.js --out json=reports/sittax-stress-result.json
) else (
    echo STRESS Test pulado pelo usuário.
)

echo.
echo [4/7] 🚀 SPIKE TEST - Teste de picos súbitos EXTREMOS...
echo Duração: ~7 minutos - TESTE MUITO AGRESSIVO!
echo Carga: 20 → 800 usuários (pico extremo)
set /p confirm4="⚠️ ATENÇÃO: Este teste simula picos EXTREMOS (800 VUs). Continuar? (s/N): "
if /i "%confirm4%"=="s" (
    k6 run tests/sittax-spike-test.js --out json=reports/sittax-spike-result.json
) else (
    echo SPIKE Test pulado pelo usuário.
)

echo.
echo [5/7] 🔥💀 SPIKE TEST EXTREME - DEVASTAÇÃO TOTAL...
echo Duração: ~8 minutos - TESTE APOCALÍPTICO!
echo Carga: 100 → 10000 usuários (ANIQUILAÇÃO)
set /p confirm7="💀 PERIGO: Este teste pode ANIQUILAR completamente o sistema (10000 VUs)! Continuar? (s/N): "
if /i "%confirm7%"=="s" (
    k6 run tests/sittax-spike-test-extreme.js --out json=reports/sittax-spike-extreme-result.json
) else (
    echo SPIKE EXTREME Test pulado pelo usuário.
)

echo.
echo [6/7] ⏰ SOAK TEST - Teste de durabilidade (40min)...
echo Duração: ~40 minutos - ATENÇÃO: TESTE LONGO!
set /p confirm="Executar SOAK Test de 40 minutos? (s/N): "
if /i "%confirm%"=="s" (
    k6 run tests/sittax-soak-test.js --out json=reports/sittax-soak-result.json
) else (
    echo SOAK Test pulado pelo usuário.
)

echo.
echo [7/7] � BREAKPOINT TEST - Encontrar limite ABSOLUTO do sistema...
echo Duração: ~20 minutos - ATENÇÃO: TESTE EXTREMAMENTE AGRESSIVO!
echo Carga: 50 → 2500 usuários virtuais
set /p confirm2="💥 ATENÇÃO: Este teste pode QUEBRAR o sistema (2500 VUs)! Continuar? (s/N): "
if /i "%confirm2%"=="s" (
    k6 run tests/sittax-breakpoint-test.js --out json=reports/sittax-breakpoint-result.json
) else (
    echo BREAKPOINT Test pulado pelo usuário.
)

echo.
echo ========================================
echo   🔥💀 TESTES DE DEVASTAÇÃO COMPLETOS 💀🔥
echo Verifique os relatórios em: reports/
echo Se o sistema sobreviveu, é um milagre! 
echo ========================================
pause