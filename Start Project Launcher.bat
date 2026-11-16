@echo off
rem Starts the project launcher without a console window.
set "APP=%~dp0launcher.pyw"
where pythonw >nul 2>nul && (start "" pythonw "%APP%" & exit /b)
if exist "%USERPROFILE%\miniconda3\pythonw.exe" (start "" "%USERPROFILE%\miniconda3\pythonw.exe" "%APP%" & exit /b)
where pyw >nul 2>nul && (start "" pyw "%APP%" & exit /b)
echo Could not find Python. Install it from python.org or open this from an Anaconda prompt.
pause
