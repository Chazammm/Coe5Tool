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
    dotnet publish desktop\Workbench.csproj -c Release -r win-x64 --self-contained false --no-restore -o build\desktop-0161-resume
    if ($LASTEXITCODE -ne 0) { throw 'Desktop build failed.' }
    # Exact source-derived allowlist: stale output files, profiles and caches cannot enter the ZIP.
    $publishRoot = (Resolve-Path -LiteralPath 'build\desktop-0161-resume').Path
    $stageRoot = Join-Path $taskRoot ('build\package-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $stageRoot | Out-Null
    $include = @('CoE5Workbench.exe','CoE5Workbench.dll','CoE5Workbench.deps.json','CoE5Workbench.runtimeconfig.json',
        'Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.Wpf.dll','Microsoft.Web.WebView2.WinForms.dll','WebView2Loader.dll')
    $project = [xml](Get-Content -LiteralPath 'desktop\Workbench.csproj' -Raw)
    foreach ($item in $project.Project.ItemGroup.Content) {
        if ($item.Link -like 'ui\*' -or $item.Link -like 'licenses\*') {
            foreach ($pattern in ([string]$item.Include -split ';')) {
                foreach ($source in Get-ChildItem -Path (Join-Path 'desktop' $pattern) -File) {
                    $include += if ($item.Link -like 'licenses\*') { 'licenses\' + ([string]$item.Link -replace '^licenses\\','' -replace '%\(Filename\)%\(Extension\)', $source.Name) } elseif ($source.Directory.Name -eq 'docs') { 'ui\docs\' + $source.Name } else { 'ui\' + $source.Name }
                }
            }
        }
    }
    # Optional, open-source Workbench roster extension only; never the game, release loader or assets.
    $overlay = Join-Path $taskRoot 'local-extender\roster-v1\CoE5SE\coe5se.c5plugin.dll'
    if (Test-Path -LiteralPath $overlay) {
        if ((Get-FileHash -LiteralPath $overlay -Algorithm SHA256).Hash.ToLowerInvariant() -ne '46c982fcef57c60fa68a6fcbcc624b6ce2e78d36526991508c8d4d5ff4826ec7') { throw 'Roster extension fingerprint differs; refusing to package.' }
        $include += 'roster-runtime\coe5se.c5plugin.dll'
    }
    foreach ($relative in $include | Sort-Object -Unique) {
        $destination = Join-Path $stageRoot $relative
        New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $publishRoot $relative) -Destination $destination
    }
    New-Item -ItemType Directory -Path (Join-Path $stageRoot 'examples') | Out-Null
    Copy-Item -LiteralPath 'examples\selected-spell-workshop.c5m' -Destination (Join-Path $stageRoot 'examples')
    Copy-Item -LiteralPath 'docs\WINDOWS-PACKAGE-0161.md' -Destination (Join-Path $stageRoot 'START-HERE.md')
    $manifest = Get-ChildItem -LiteralPath $stageRoot -File -Recurse | Sort-Object FullName | ForEach-Object {
        [ordered]@{ path = [IO.Path]::GetRelativePath($stageRoot,$_.FullName).Replace('\','/'); sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
    }
    [ordered]@{ version='0.16.1'; architecture='win-x64'; frameworkDependent=$true; files=@($manifest) } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $stageRoot 'PACKAGE-CONTENTS.json') -Encoding utf8NoBOM
    New-Item -ItemType Directory -Path 'dist' -Force | Out-Null
    Compress-Archive -Path (Join-Path $stageRoot '*') -DestinationPath 'dist\CoE5Workbench-0.16.1-win-x64.zip' -Force
    Get-FileHash -LiteralPath 'dist\CoE5Workbench-0.16.1-win-x64.zip' -Algorithm SHA256
    Write-Host 'Built build\desktop-0161-resume\CoE5Workbench.exe and dist\CoE5Workbench-0.16.1-win-x64.zip (framework-dependent). Keep the entire extracted folder.'
} finally { Pop-Location }
