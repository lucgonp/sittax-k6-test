@echo off
echo ========================================
echo   AGILIZZA K6 - SUITE DE TESTES DE CARGA
echo   🚀 https://agilizza.sittax.com.br
echo   📊 100 usuários de teste disponíveis
echo ========================================
echo.
echo Selecione o teste:
echo.
echo   [1] 🟢 SMOKE TEST   - Login simples (5 VUs, 1 min)
echo   [2] 🟡 LOAD TEST    - Carga massiva (até 100 VUs, ~10 min)
echo   [3] 🔴 STRESS TEST  - Stress extremo (até 300 VUs, ~15 min)
echo   [4] 🔵 TODOS        - Executar todos em sequência
echo   [0] ❌ SAIR
echo.

set /p choice=Escolha (0-4): 

if "%choice%"=="1" goto smoke
if "%choice%"=="2" goto load
if "%choice%"=="3" goto stress
if "%choice%"=="4" goto all
if "%choice%"=="0" goto end

echo Opcao invalida!
goto end

:smoke
echo.
echo 🟢 Iniciando SMOKE TEST...
echo Duração estimada: ~1 minuto
echo.
k6 run tests/auth/agilizza-login-simple.js --out json=reports/agilizza-smoke-result.json
goto done

:load
echo.
echo 🟡 Iniciando LOAD TEST (carga massiva)...
echo Duração estimada: ~10 minutos
echo ⚠️  Até 100 VUs simultâneos!
echo.
k6 run tests/auth/agilizza-load-test.js --out json=reports/agilizza-load-result.json
goto done

:stress
echo.
echo 🔴 Iniciando STRESS TEST (extremo)...
echo Duração estimada: ~15 minutos
echo 🔥 Até 300 VUs simultâneos! Isso VAI pressionar o servidor!
echo.
set /p confirm=Tem certeza? (S/N): 
if /i "%confirm%" neq "S" (
    echo ❌ Teste cancelado.
    goto end
)
k6 run tests/auth/agilizza-stress-test.js --out json=reports/agilizza-stress-result.json
goto done

:all
echo.
echo 🔵 Executando TODOS os testes em sequência...
echo.
echo [1/3] 🟢 SMOKE TEST...
k6 run tests/auth/agilizza-login-simple.js --out json=reports/agilizza-smoke-result.json
echo.
echo [2/3] 🟡 LOAD TEST...
k6 run tests/auth/agilizza-load-test.js --out json=reports/agilizza-load-result.json
echo.
echo [3/3] 🔴 STRESS TEST...
k6 run tests/auth/agilizza-stress-test.js --out json=reports/agilizza-stress-result.json
goto done

:done
echo.
echo ========================================
echo   ✅ TESTE(S) FINALIZADO(S)!
echo   📊 Relatórios em: reports/
echo ========================================

:end
echo.
pause
