@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18+ is required to run the complete local API mock.
  echo Fallback static-only server: python -m http.server 8080
  pause
  exit /b 1
)
node dev-server.mjs
