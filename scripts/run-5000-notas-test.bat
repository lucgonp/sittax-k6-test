@echo off
echo ================================================
echo 🔥 TESTE DE 5.000 NOTAS FISCAIS - SITTAX
echo ================================================
echo.
echo ⚠️  ATENÇÃO: Este teste irá enviar ~5.000 notas fiscais!
echo ⚠️  Duração estimada: ~23 minutos
echo ⚠️  30 usuários simultâneos no pico
echo.
set /p confirm="Deseja continuar? (s/N): "
if /i not "%confirm%"=="s" (
    echo Teste cancelado.
    pause
    exit /b
)

echo.
echo 🚀 Iniciando teste de volume extremo...
echo 📊 Meta: 5.000+ notas fiscais enviadas
echo 🕒 Iniciado em: %date% %time%
echo.

k6 run tests/upload/sittax-upload-5000-notas.js

echo.
echo ✅ Teste finalizado em: %date% %time%
echo 📄 Relatório salvo em: reports/sittax-upload-notas-results.json
echo.
pause