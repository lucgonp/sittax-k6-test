@echo off
echo.
echo 🔥🔥🔥 INICIANDO ESTRESSE EXTREMO - BOMBARDEIO MÁXIMO! 🔥🔥🔥
echo.
echo ⚠️  ATENÇÃO: Este teste vai BOMBARDEAR o servidor com uploads massivos!
echo ⚠️  Até 250 usuários virtuais simultâneos fazendo uploads!
echo ⚠️  Cada usuário faz múltiplos uploads por iteração!
echo.
echo 📊 Características do teste:
echo    - Rampa até 250 usuários virtuais
echo    - 75 usuários constantes por 3 minutos
echo    - Cada VU faz 3 uploads por iteração
echo    - Timeout reduzido para máximo throughput
echo.

set /p confirm=🚨 TEM CERTEZA que quer continuar? (S/N): 
if /i "%confirm%" neq "S" (
    echo ❌ Teste cancelado pelo usuário.
    exit /b
)

echo.
echo 🚀 Iniciando BOMBARDEIO em 5 segundos...
timeout /t 5 /nobreak > nul

echo.
echo 💥 INICIANDO ESTRESSE EXTREMO...
k6 run tests/upload/sittax-upload-notas-stress-extremo.js

echo.
echo 🏁 Teste de estresse extremo finalizado!
echo.
pause