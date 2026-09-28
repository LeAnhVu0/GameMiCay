@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 goto launcher
set "PYTHON="
for /f "delims=" %%P in ('where python.exe 2^>nul ^| findstr /i /v "WindowsApps"') do set "PYTHON=%%P"
if not defined PYTHON goto missing
"%PYTHON%" -m http.server 8080
goto :eof

:launcher
echo Serving static files at http://127.0.0.1:8080
py -3 -m http.server 8080 2>nul
if not errorlevel 1 goto :eof
set "PYTAG="
for /f "tokens=1" %%V in ('py -0p 2^>nul ^| findstr /c:"-V:"') do set "PYTAG=%%V"
if not defined PYTAG goto missing
py %PYTAG% -m http.server 8080
goto :eof

:missing
echo Python 3 is required to run the local static preview.
pause
exit /b 1
