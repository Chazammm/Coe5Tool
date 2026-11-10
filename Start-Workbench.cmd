@echo off
if not exist "%~dp0build\desktop-018-mixed\CoE5Workbench.exe" (
  echo Desktop build missing. Run Build-Desktop.ps1 with the .NET 8 SDK installed.
  pause
  exit /b 1
)
start "" "%~dp0build\desktop-018-preview\CoE5Workbench.exe"
