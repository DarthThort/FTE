@echo off
title Simulador Espacial FTL
cd /d "%~dp0\Solitary-chromosphere"
echo ========================================================
echo   INICIANDO SIMULADOR ESPACIAL FTL (Solitary Chromosphere)
echo ========================================================
echo Abriendo juego en http://localhost:8085 ...
timeout /t 1 /nobreak >nul
start http://localhost:8085
python -m http.server 8085
pause
