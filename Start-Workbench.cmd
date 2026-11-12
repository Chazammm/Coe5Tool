@echo off
if not exist "%~dp0build\desktop-0181-diagnostics\CoE5Workbench.exe" (
  echo Source build missing. Download the portable Windows package or build with the .NET 10 SDK.
  pause
  exit /b 1
)
start "" "%~dp0build\desktop-0181-diagnostics\CoE5Workbench.exe"
