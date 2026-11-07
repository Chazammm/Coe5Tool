# Friend package · Workbench 0.14.0

Prepared the requested portable Windows x64 sharing ZIP. Nothing was uploaded or published.

`dist/CoE5Workbench-0.14.0-friend-win-x64.zip`

Size: 72,952,397 bytes (about 73 MB). SHA-256:

`0a36af618a8e10c274a2edb75dd36cc0ca012d3ab6f6471154351b9979ece17d`

The complete ZIP must be extracted to a writable folder; run `CoE5Workbench.exe` with its supporting files beside it. The package includes .NET Core and Windows Desktop runtimes, version 8.0.8 from the existing cached packs, plus their licenses/notices. It requires no .NET SDK or separate .NET installation. WebView2 Evergreen Runtime remains a separate prerequisite; `START-HERE.txt` gives Microsoft's official download page. No installer or global setting change is performed by packaging.

The build uses a fresh output directory. Portable startup/workflow instructions replace the developer-machine README and verification timeline inside the ZIP. All 39 other UI/help files match current source, including the v0.14 damage workflow. No game/extender binaries, private references, runtime paths, saves, retained sessions, validation fixtures, profiles, PDBs, developer absolute user paths or known private session identifiers are present. Eight license/notice files are included.

The actual ZIP was extracted into a fresh folder named **Unpacked Friend Package**, exercising a path with spaces. Its executable completed **72 compiled headless checks**, exit code 0. These check the canonical templates, damage/result policies, file/process safeguards and old-result reading without a game or rendered window. The package's runtime configuration declares included frameworks and contains coreclr/hostfxr/hostpolicy and WPF dependencies. Direct process-module observation did not establish a runtime DLL path; no stronger runtime-location claim is made.

All 491 protected game/mod/session/evidence files and the previous v0.13 friend ZIP retain their hashes. The verification copy may contain newly generated local test artifacts after checking; those were created after extraction and are not in the sharing ZIP.

Evidence: `package-checks.json`, `native-checks.json`, `runtime-check.json`, `build.json`. A `.zip.sha256` companion is beside the archive. The current source's 191 script checks, 51 mocked Lua scenarios and 24 native return/export round trips are previous implementation evidence, not additional recipient-machine tests.

No actual desktop rendering, clean Windows VM, recipient PC, or new game test was performed. First use and display scaling on the friend's computer remain to be observed. Creation/export works without the game; optional real testing requires the recipient's own compatible CoE5 5.43 / CoE5SE 2.13.0 installation and a disposable session.
