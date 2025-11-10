@echo off
echo.
echo 🚀⚡⚡⚡ TESTE ULTRA RÁPIDO - VELOCIDADE MÁXIMA! ⚡⚡⚡🚀
echo.
echo 📊 CONFIGURAÇÃO EXTREMA:
echo    - 10 VUs simultâneos (máximo)
echo    - 500 uploads por VU = 5000 total
echo    - ZERO delay entre uploads
echo    - Cache agressivo de tokens
echo    - Validação mínima
echo.
echo ⚠️  ATENÇÃO: Este teste pode saturar o servidor!
echo    Velocidade teórica: 500+ uploads/segundo
echo.
echo 🎯 Meta: 5000 uploads em menos de 30 segundos!
echo.
pause
echo.
echo 🚀 Iniciando teste ULTRA RÁPIDO...
echo.

k6 run tests/upload/sittax-ultra-fast-5000.js

echo.
echo 🏁 Teste ULTRA RÁPIDO finalizado!
echo    Veja o arquivo: reports/sittax-ultra-fast-5000-results.json
echo.
pause