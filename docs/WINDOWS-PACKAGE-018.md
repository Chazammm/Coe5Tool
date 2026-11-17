**Current local source build: 0.19.0-rc.3.** The new [Test Effects browser](TEST-EFFECTS-019.md) needs pinned official 3.4.4 or dev 3.5.0.0 and fresh game acceptance. Public 0.18.1/0.18.2-rc.1 downloads do not contain this feature. No Nexus update is made.

# Install CoE5 Workbench 0.19.0-rc.3

## Windows portable candidate

1. Use the locally built CoE5Workbench-0.19.0-rc.3-win-x64.zip and checksum in dist. This candidate has no published 0.19 GitHub download yet. Source developers build it with Build-Desktop.ps1.
2. In Explorer, choose Extract All. Use a writable folder such as Documents. Do not run from inside the ZIP or place it in the game/mod folder.
3. Open CoE5Workbench.exe. Keep the ui, examples and licenses folders beside it.
4. .NET 10 is included. No .NET install, SDK, terminal, account or administrator access is needed for Workbench itself. Microsoft Edge WebView2 Evergreen must be available; many Windows PCs already have it. If missing, the app offers Microsoft's download page. Installation is your choice; nothing is installed silently.
5. Start with Explore Vanilla, Open your mod or a new definition. F1 opens help. The examples folder contains disposable source fragments.

This is a portable package, not an installer. It does not create shortcuts, file associations or global settings. A verified portable build avoids adding an untested installer. The app is not code-signed; Windows reputation and organization policies may vary. Do not bypass security controls to run it.

## Optional game testing

Use your own exact supported CoE5 5.43 executable/data and a complete official CoE5SE 3.4.4 (preview), 3.3.0, 3.2.2 or 2.13.0 folder. Select them in the test setup's file dialogs. Workbench verifies the files and creates separate disposable profiles; it never installs over Steam, normal mods or saves. CoE5SE 3.3.0 has bounded in-game evidence; broader combinations remain unverified. See [compatibility](COE5SE-COMPATIBILITY-0182.md).

Game files, game assets/catalogs and official/derived extender core files are not included. No game is required to edit and export supported source offline. There is no Vanilla-only integrated field. [First use](USER-GUIDE-018.md).

## Update or remove

Export open work and close Workbench. Extract each update into a new folder; do not merge a release over a used app folder. Keep the old folder until you have checked your files in the new version. Prepared tests/results live separately on the same Windows account and keep their original runtime requirements.

To remove the app, close it and remove its extracted folder. It has no installer/uninstaller. Keep your exported sources. The app-local .workbench-profile contains reference imports and WebView cache; do not share a used app folder. Prepared test data under the account's CoE5Workbench Tests folder is retained deliberately; removing the app does not remove those records. The bundled .NET runtime may also leave its standard per-user extraction cache. No normal game profile is removed.

Share the original ZIP and checksum, not your used application folder. PACKAGE-CONTENTS.json inventories the archive before first launch. Third-party terms are in licenses. Earlier releases and evidence remain available on GitHub.

## Preview scope

This local candidate adds Test Effects: original native spell requests, private visual previews and inline battlefield inspection. It requires the already pinned official 3.4.4 profile; official 3.5.0 is not yet verified. Corrected browser gameplay and final rendered desktop acceptance remain pending. Earlier runtime/session requirements remain intact; old browser receipts are review-only. Existing public releases are preserved. [Scope and manual steps](TEST-EFFECTS-019.md). No game or extender core files are bundled. Nexus is not changed by this task.
