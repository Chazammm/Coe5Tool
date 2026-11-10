# CoE5 Workbench 0.17.0 · Windows

1. Extract the complete ZIP into a writable folder. Keep all files together.
2. Install **.NET 8 Desktop Runtime x64** if needed: https://dotnet.microsoft.com/en-us/download/dotnet/8.0 (Desktop Runtime, not only the console Runtime). Install **WebView2 Evergreen Runtime** if missing: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution. No Node.js, SDK or account is needed to run the app.
3. Run **CoE5Workbench.exe**. Choose **Explore Vanilla spells & weapons**, **Open your mod…** or create a draft. F1 opens help. From the ZIP root: [workflow guide](USER-GUIDE-017.md).
4. Editing/export need no game launch. Integrated tests require your own **CoE5 5.43 Windows executable/data and official CoE5SE 2.13.0** from https://github.com/musical-pianist/coe5se/releases. Select them in Workbench's file dialogs. Other fingerprints are refused; nothing is downloaded or installed automatically.
5. **Prepare game test** creates a separate setup; **Start isolated test** launches it. Follow its displayed entry/instructions, Close the field and Quit normally. **Prepared tests…** can recheck an unused snapshot after reopening. Saved values, AI battle returns and visuals are different facts.

Vanilla editing/export uses supported native weapon syntax. Spell definitions and all integrated fields require CoE5SE. Mixed private-weapon groups additionally use the optional pinned **Workbench roster-v1** plugin in `roster-runtime`. It is a separately built open-source extension, not the official runtime/loader, and is used only in disposable test copies. Official extender files are still supplied by the user.

The ZIP contains Workbench, WebView2 SDK support libraries/notices, portable examples/docs, and the optional roster plugin/notices. It excludes game executables/assets/full extracted catalogs, official extender binaries, personal mods, saves, profiles, private sessions, cached imports and per-machine runtime paths. Identifier/reference labels are not game assets. `PACKAGE-CONTENTS.json` inventories file hashes; the release checksum verifies the ZIP.

A new account starts with no preparations or imported catalogs. Local settings/session storage are created on that computer; a WebView cache is created in the extracted app folder. Share the original release ZIP, not a used app/cache folder.

Limits: bounded source/fixture support, one pinned game build, no desktop VFX renderer, no faithful built-in clone and no Vanilla-only integrated field. Exact package/desktop verification is documented in the source repository; prior game evidence is separate. Third-party notices are in `licenses`.
