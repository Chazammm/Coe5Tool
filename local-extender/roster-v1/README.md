# Local Workbench roster-v1 extender

This is an isolated development copy of the complete CoE5SE 2.13.0 release source. It adds a field-owned mixed roster and retains the original numeric `openTestField` API. The modified files are described in [field-roster.patch](field-roster.patch). The original release extraction and installed game are separate.

Build on Windows from the Workbench project folder.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File local-extender/roster-v1/Build.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File local-extender/roster-v1/Test.ps1
```

The toolchain is llvm-mingw 20260922, obtained from its upstream release archive. Its ZIP was verified against SHA-256 `e3ad77d117a4bea19a7a3b333341824d79a5a371004a10e25b8504e7b3047666`, as listed in the CoE5SE security documentation. It was extracted under `local-extender/toolchain/`; it changes no global toolchain settings. Build.ps1 accepts an explicit **Compiler** path if necessary. [Upstream archive](https://github.com/mstorsjo/llvm-mingw/releases/download/20260922/llvm-mingw-20260922-ucrt-x86_64.zip).

Build.ps1 compiles the plugin, bundled Lua sources and Windows resource using the release recipe. It keeps the official loader/stub and writes [build.json](build.json) with compiler and output fingerprints. The local file description identifies the development variant. Windows CoE5 5.43 is the supported game build. Mac entry points refuse this local API.

The Workbench pins the resulting DLL in [LocalRosterRuntime.cs](../../../desktop/LocalRosterRuntime.cs). After intentionally changing native source, rebuild and review the output SHA-256 before updating that pin and rebuilding the desktop app. The current pinned plugin hash is `46c982fcef57c60fa68a6fcbcc624b6ce2e78d36526991508c8d4d5ff4826ec7`. Desktop publish copies it to `roster-runtime/`. Single-type fixtures continue to use the official runtime.

Test.ps1 compiles the actual modified field headers and bundled Lua against a deterministic native-memory model. Nine cases exercise successful allocation, callback failure, partial allocation, carrier allocation failure, invalid total, 200 defenders, nested-call refusal, an explicit close followed by a refused reopen, and retry after failure. Each case compares the complete modeled memory before and after. This is separate from gameplay testing.

The roster snapshots approximately 36 MB of unit/commander records plus its field state per invocation. Allocation failure occurs before field mutation. The native owner restores those snapshots on return and logs `wb_roster_closed`. The snapshots do not cover every engine cache or random state. The new API is scoped to a disposable main-menu test. It is not supported for campaign mutation or an active game.

[API and Workbench workflow](../../docs/MIXED-TARGETS-016.md) · [Live validation](../../validation/standalone-mixed-20261107-193525/REPORT.md).
