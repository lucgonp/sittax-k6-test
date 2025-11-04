@echo off
echo ⚠️ SITTAX BREAKPOINT TEST - TESTE AGRESSIVO
echo ==========================================
echo Este teste vai aumentar a carga progressivamente até encontrar o limite do sistema.
echo Duração estimada: 25 minutos
echo.
set /p confirm="ATENÇÃO: Este é um teste agressivo que pode impactar o sistema. Continuar? (s/N): "
if /i "%confirm%"=="s" (
    echo.
    echo Iniciando Breakpoint Test...
    k6 run tests/sittax-breakpoint-test.js --out json=reports/sittax-breakpoint-result.json
    echo.
    echo Breakpoint test concluído! Verifique: reports/sittax-breakpoint-result.json
) else (
    echo Teste cancelado pelo usuário.
)
pause