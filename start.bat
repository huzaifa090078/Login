@echo off
title LOGIN Order Form Server
echo ====================================================
echo Starting LOGIN Order Form Application...
echo ====================================================
start "" http://localhost:3000
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 3000
pause
