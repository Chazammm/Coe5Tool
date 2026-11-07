param([switch]$SkipRestore)
$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$env:DOTNET_CLI_HOME = Join-Path $taskRoot '.dotnet-home'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_GENERATE_ASPNET_CERTIFICATE = 'false'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
$env:DOTNET_CLI_UI_LANGUAGE = 'en'
Push-Location $taskRoot
try {
    if (-not $SkipRestore) {
        dotnet restore desktop\Workbench.csproj -r win-x64 --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Dependency restore failed. An initial build needs nuget.org access.' }
    }
    dotnet publish desktop\Workbench.csproj -c Release -r win-x64 --self-contained false --no-restore -o build\desktop-016-workspace
    if ($LASTEXITCODE -ne 0) { throw 'Desktop build failed.' }
    # Whitelist published files; private profile/cache and local reference data never enter the ZIP.
    $publishRoot = (Resolve-Path -LiteralPath 'build\desktop-016-workspace').Path
    $stageRoot = Join-Path $taskRoot ('build\package-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $stageRoot | Out-Null
    foreach ($entry in Get-ChildItem -LiteralPath $publishRoot -Force) {
        if ($entry.Name -eq '.workbench-profile' -or $entry.Name -eq 'library-import-error.txt' -or $entry.Extension -eq '.pdb') { continue }
        Copy-Item -LiteralPath $entry.FullName -Destination $stageRoot -Recurse
    }
    New-Item -ItemType Directory -Path 'dist' -Force | Out-Null
    Compress-Archive -Path (Join-Path $stageRoot '*') -DestinationPath 'dist\CoE5Workbench-0.16.0-win-x64.zip' -Force
    Write-Host 'Built build\desktop-016-workspace\CoE5Workbench.exe and dist\CoE5Workbench-0.16.0-win-x64.zip (framework-dependent).'
} finally { Pop-Location }
