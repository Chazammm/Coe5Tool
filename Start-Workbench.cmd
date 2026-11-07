@echo off
if not exist "%~dp0build\desktop-016-workspace\CoE5Workbench.exe" (
  echo Desktop build missing. Run Build-Desktop.ps1 with the .NET 8 SDK installed.
  pause
  exit /b 1
)
start "" "%~dp0build\desktop-016-workspace\CoE5Workbench.exe"
