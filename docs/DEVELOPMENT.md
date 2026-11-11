# Development

Use .NET SDK 10.0.404 (global.json), Node.js for the script suite, and PowerShell 7. Build-Desktop.ps1 restores locked dependencies and publishes a self-contained single-file Windows x64 host with .NET 10.0.15. ui/content files stay external. An optional project-local .toolchain/dotnet10/dotnet.exe is used when present; it is not distributed. Build the portable ZIP with Build-Desktop.ps1; Start-Workbench.cmd is the source-build launcher only.

Run node --test tests/*.test.cjs, the native host's --self-test with a disposable report path, and the appropriate Python/Lua model checks. Run tools/verify-package.cjs on a fresh extraction before launching it. Launch changes the extracted folder by creating an app-local cache, so inventory checks precede desktop checks.

The package allowlist is source-derived. Only our bundled apphost is executable; game/extender fingerprints, private session paths, credentials and machine-specific paths are refused. .NET/WPF and WebView2 SDK notices are retained. No game data or extender core is distributed. A portable app cannot be called a clean-machine acceptance test on the development PC: package launch is tested with system .NET lookup disabled, while a genuinely separate machine, missing-WebView2 path, display scale and Windows security reputation remain distinct checks.

User-facing guidance belongs in README, USER-GUIDE-018 and WINDOWS-PACKAGE-018. Architecture, API contracts and historical evidence remain in the existing research/validation documentation. Schema names, hashes and process IDs belong in diagnostics, not ordinary next-action captions. Source edits must preserve unknown text and explicit export. Prior prepared contracts keep their version; never silently migrate retained sessions.
