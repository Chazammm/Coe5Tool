param([string]$Compiler = "$PSScriptRoot/../toolchain/llvm-mingw-20260922-ucrt-x86_64/bin/x86_64-w64-mingw32-clang.exe")
$ErrorActionPreference='Stop'
$compilerPath=(Resolve-Path -LiteralPath $Compiler).Path
$src=Join-Path $PSScriptRoot 'CoE5SE/src'
Push-Location $src
try {
    $windres=Join-Path (Split-Path $compilerPath) 'x86_64-w64-mingw32-windres.exe'
    & $windres -O coff -o wb-plugin.rc.o coe5se.c5plugin.rc
    if($LASTEXITCODE){throw 'Resource compilation failed'}
    $lua=@('lapi','lauxlib','lbaselib','lcode','lcorolib','lctype','ldebug','ldo','ldump','lfunc','lgc','llex','lmathlib','lmem','lobject','lopcodes','lparser','lstate','lstring','lstrlib','ltable','ltablib','ltm','lundump','lutf8lib','lvm','lzio') | ForEach-Object {"lua/$_.c"}
    & $compilerPath -shared -O2 -Wall -Wextra -s '-Wl,--no-insert-timestamp' -o ../coe5se.c5plugin.dll coe5se_plugin.c fanpatch/fix_feeblemind.c fanpatch/fix_item_reset.c fanpatch/fix_token_sprites.c @lua -I. -Ilua -lbcrypt wb-plugin.rc.o
    if($LASTEXITCODE){throw 'Local plugin build failed'}
    $output=Join-Path $PSScriptRoot 'CoE5SE/coe5se.c5plugin.dll'
    $hash=(Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
    [ordered]@{label='CoE5SE 2.13.0 + Workbench roster-v1 (local)';api=1;pluginSha256=$hash;compiler=$compilerPath;compilerSha256=(Get-FileHash $compilerPath).Hash.ToLowerInvariant()} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'build.json') -Encoding utf8
    Write-Output $hash
} finally {Pop-Location}
