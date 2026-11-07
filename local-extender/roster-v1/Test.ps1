$ErrorActionPreference='Stop'
$cc=(Resolve-Path "$PSScriptRoot/../toolchain/llvm-mingw-20260922-ucrt-x86_64/bin/x86_64-w64-mingw32-clang.exe").Path
$src=Join-Path $PSScriptRoot 'CoE5SE/src'
$lua=Get-ChildItem "$src/lua" -Filter '*.c' | Where-Object {$_.Name -notin 'lua.c','luac.c'} | ForEach-Object {$_.FullName}
& $cc -O1 -w "$PSScriptRoot/tests/roster-test.c" @lua "-I$src/lua" -lbcrypt -o "$PSScriptRoot/tests/roster-test.exe"
if($LASTEXITCODE){throw 'Native roster test compilation failed'}
& "$PSScriptRoot/tests/roster-test.exe"
if($LASTEXITCODE){throw 'Native roster model failed'}
