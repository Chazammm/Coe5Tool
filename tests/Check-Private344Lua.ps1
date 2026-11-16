param([Parameter(Mandatory)][string]$Runtime,[Parameter(Mandatory)][string]$Manifest,[Parameter(Mandatory)][string]$Cases,[Parameter(Mandatory)][string]$Report)
$ErrorActionPreference='Stop'
$taskManifest=Get-Content -LiteralPath $Manifest -Raw | ConvertFrom-Json
$taskHash=(Get-FileHash -LiteralPath $Runtime -Algorithm SHA256).Hash.ToLowerInvariant()
if($taskManifest.dlls.'lua_test_runtime.dll' -ne $taskHash){throw 'Lua test DLL differs from its build manifest'}
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class WorkbenchLua344 {
 [UnmanagedFunctionPointer(CallingConvention.Cdecl)] public delegate int Run([MarshalAs(UnmanagedType.LPUTF8Str)]string script);
 [UnmanagedFunctionPointer(CallingConvention.Cdecl)] public delegate IntPtr Error();
}
'@
$taskLibrary=[Runtime.InteropServices.NativeLibrary]::Load((Resolve-Path -LiteralPath $Runtime).Path)
try{
 $taskRun=[Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer([Runtime.InteropServices.NativeLibrary]::GetExport($taskLibrary,'luaTestRun'),[WorkbenchLua344+Run])
 $taskError=[Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer([Runtime.InteropServices.NativeLibrary]::GetExport($taskLibrary,'luaTestError'),[WorkbenchLua344+Error])
 $taskResults=@(Get-Content -LiteralPath $Cases -Raw | ConvertFrom-Json | ForEach-Object {
  $taskCode=$taskRun.Invoke($_.script)
  [ordered]@{name=$_.name;passed=$taskCode -eq 0;error=if($taskCode -eq 0){$null}else{[Runtime.InteropServices.Marshal]::PtrToStringUTF8($taskError.Invoke())}}
 })
 $taskPassed=@($taskResults | Where-Object {-not $_.passed}).Count -eq 0
 $taskResult=[ordered]@{passed=$taskPassed;tests=$taskResults.Count;runtimeSha256=$taskHash;checks=$taskResults;scope='Actual generated helper preflight and extracted write/readback functions executed in a verified standalone Lua test VM with synthetic APIs. No game, UI rendering or gameplay.'}
 $taskResult | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $Report -Encoding utf8NoBOM
 $taskResults | ForEach-Object { Write-Output ($(if($_.passed){'PASS'}else{'FAIL'})+' '+$_.name+$(if($_.error){': '+$_.error})) }
 if(-not $taskPassed){throw 'Lua model checks failed'}
}finally{[Runtime.InteropServices.NativeLibrary]::Free($taskLibrary)}
