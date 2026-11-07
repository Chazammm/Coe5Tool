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
        dotnet restore desktop\Workbench.csproj -r win-x64 --locked-mode -p:SelfContained=true
        if ($LASTEXITCODE -ne 0) { throw 'Dependency restore failed.' }
    }
    # A fresh output prevents a local reference/WebView profile from entering the friend ZIP.
    $friendVersion = (Get-Content -LiteralPath package.json -Raw | ConvertFrom-Json).version
    $friendName = 'CoE5Workbench-' + $friendVersion + '-friend-win-x64'
    $publishPath = Join-Path $taskRoot ('build\friend-' + [guid]::NewGuid().ToString('N'))
    dotnet publish desktop\Workbench.csproj -c Release -r win-x64 --self-contained true --no-restore -o $publishPath
    if ($LASTEXITCODE -ne 0) { throw 'Self-contained Windows build failed.' }
    $included = (Get-Content -LiteralPath (Join-Path $publishPath 'CoE5Workbench.runtimeconfig.json') -Raw | ConvertFrom-Json).runtimeOptions.includedFrameworks
    foreach ($framework in $included) {
        $packPath = Join-Path $taskRoot ('.packages\' + $framework.name.ToLowerInvariant() + '.runtime.win-x64\' + $framework.version)
        $licenseFile = @('LICENSE.TXT','LICENSE') | ForEach-Object { Join-Path $packPath $_ } | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
        if (-not $licenseFile) { throw ('Missing cached runtime license: ' + $framework.name) }
        Copy-Item -LiteralPath $licenseFile -Destination (Join-Path $publishPath ('licenses\' + $framework.name + '-LICENSE.txt'))
        $notices = Join-Path $packPath 'THIRD-PARTY-NOTICES.TXT'
        if (Test-Path -LiteralPath $notices -PathType Leaf) { Copy-Item -LiteralPath $notices -Destination (Join-Path $publishPath ('licenses\' + $framework.name + '-THIRD-PARTY-NOTICES.txt')) }
    }
    $guidePath = Join-Path $publishPath 'START-HERE.txt'
    $friendGuide = @'
CoE5 Spell & Weapon Workbench __VERSION__ - Windows x64 friend package

Extract the entire ZIP to a folder you can write to. Double-click CoE5Workbench.exe.
Keep ui, licenses and the other files beside it. Do not run from inside the ZIP.
Windows 10/11 x64 is required. The .NET runtime is included; no .NET SDK/install is needed.
Microsoft Edge WebView2 Runtime is still required. If startup reports it missing, get
Microsoft's official Evergreen Runtime here, install it, then try the app again:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/
The app does not install anything automatically. Administrator access is not required
for the workbench itself; extract it to a writable folder, such as your Documents folder.

Try New native weapon or New spell & weapon from the starting desk, or Open source.
After an isolated test is saved and exited, Review saved values -> Apply selected to draft
-> Export copy. Newer values stay unchecked until you explicitly select Replace.
Other pending form edits remain pending and must be resolved before exporting.
Damage types: 1-10 have guided numeric inputs. Types 12/13 have searchable effect masks;
their type/payload stay fixed in the isolated test. Animate (25) can be created/exported,
but automatic testing is blocked because terrain targets cannot be configured.
The remaining documented types need explicit manual-payload acknowledgement and export.
See ui/README.md and ui/docs/DAMAGE-TYPES-014.md for the exact support boundaries.

No game/extender, private reference data, runtime paths, saves or test results are included.
Creation, source review and export work offline. Game testing requires your own compatible
CoE5 5.43 / official CoE5SE 2.13.0 files, with exact fingerprints, and an explicitly prepared
disposable session. Do not use a normal campaign. Historical reference imports are optional.
The app neither installs nor downloads game files and sends no game input.

This is a portable test build, not a published/signed release. The damage workflow was
checked offline; the current rendered Windows interface and newly supported gameplay
still need acceptance. No new gameplay observation is implied by packaging.

Useful feedback: Windows/display scaling, what you tried, expected/actual behavior,
any visible error, and a screenshot if convenient. Do not send game files or saves.
'@
    $friendGuide.Replace('__VERSION__', $friendVersion) | Set-Content -LiteralPath $guidePath -Encoding utf8
    # The developer README refers to local build/evidence paths; give recipients portable instructions.
    $portableReadme = @'
# CoE5 Spell & Weapon Workbench __VERSION__

This Windows 10/11 x64 package includes .NET. Extract the entire ZIP to a writable folder
and run **CoE5Workbench.exe** in the folder above this file. Keep `ui`, `licenses` and all
supporting files together. WebView2 Evergreen Runtime is required separately if missing:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

No game, extender or developer tools are needed to create, inspect and export source.
Choose **Vanilla CoE5** for a native weapon fragment, or **CoE5SE** for a linked spell/weapon.
The starting desk follows that choice. Open source or create a draft, search for choices,
edit supported fields, **Apply changes**, then **Export copy** to a new file.

All 25 documented damage IDs are selectable, with guided versus manual payload handling.
Types 1-10 support numeric generation/testing. Types 12/13 use exact effect masks and keep
their prepared type/payload fixed during tests. Animate supports selectors 1/2 for export;
its automatic test is blocked. Other special types need manual payload acknowledgement.
Read [damage types and limits](docs/DAMAGE-TYPES-014.md) before using special payloads.

Actual game testing is optional and requires your own compatible CoE5 5.43 / official
CoE5SE 2.13.0 files. The host checks exact fingerprints and prepares a disposable session.
It does not use a normal campaign, download/install game files, or control game input.
Save test values, close the field, Quit, then review and explicitly apply/export changes.
Saved values and completed cast calls do not prove visual correctness or normal combat.

The editor preserves originals and unrelated source. Exports are separate files. Conflicts
require explicit replacement; pending edits are retained. Unknown commands are not erased.
Historical/reference imports are optional and not included. No private data, game files,
saved sessions, runtime paths or saves are shipped. `.workbench-profile` is created beside
the app for its local settings/WebView cache. Disposable test sessions use
`%LOCALAPPDATA%\CoE5Workbench\Tests`; keep that separate from game profiles.

The package was prepared and checked offline. First use, layout/scaling on another PC and
additional gameplay remain unverified. See **START-HERE.txt** above this folder for startup
and feedback instructions, and `docs/WORKSHOP-013.md` for the interface workflow.
'@
    $portableReadme.Replace('__VERSION__', $friendVersion) | Set-Content -LiteralPath (Join-Path $publishPath 'ui\README.md') -Encoding utf8
    @'
# Portable package verification scope

This is a self-contained Windows x64 package. The .NET runtime and required notices are
included; WebView2 Evergreen Runtime is a separate prerequisite. Supporting files must
remain beside the executable. The developer's private build/research reports and test
fixtures are not distributed.

Packaging and offline checks do not establish startup on every recipient's PC, rendered
layout/scaling, or new gameplay. Report those observations separately. Existing game
test evidence is specific to its fixture and is not a guarantee for another definition.

See START-HERE.txt above the ui folder and docs/DAMAGE-TYPES-014.md for supported workflows
and exact limitations. The application does not install or bundle CoE5 or CoE5SE.
'@ | Set-Content -LiteralPath (Join-Path $publishPath 'ui\docs\VERIFICATION.md') -Encoding utf8
    New-Item -ItemType Directory -Path dist -Force | Out-Null
    $zipPath = Join-Path $taskRoot ('dist\' + $friendName + '.zip')
    Compress-Archive -Path (Join-Path $publishPath '*') -DestinationPath $zipPath -Force
    # Record only build paths; no user/runtime data. The archive itself is inspected separately.
    $meta = @{ version = $friendVersion; executable = (Join-Path $publishPath 'CoE5Workbench.exe'); folder = $publishPath; archive = $zipPath; selfContained = $true; webView2Included = $false }
    $meta | ConvertTo-Json | Set-Content -LiteralPath 'dist/friend-build.json' -Encoding utf8
    Write-Host ('Built friend executable and self-contained package: ' + $zipPath)
} finally { Pop-Location }
