# Prototype scope and route

Current local 0.4 adds compact layout and exact-hash historical value imports; no changes are pushed in this phase. See docs/COMPACT-DATA-04.md. Existing 0.1–0.3 decisions below remain historical context, with source-preserving core unchanged.

- Target: a source-preparation utility for native CoE5 weapon definitions and existing CoE5SE spell declarations. This program does not attach to or patch the game.
- Format baseline: pinned CoE5SE 2.12.0 source/docs and official native HTML, checked on 5 November 2026. Exact metadata is in research/baseline.json. The installed executable changed during the earlier prototype task; its current version is unverified (research/environment-drift.json).
- Current implementation: dependency-free HTML/CSS/JavaScript UI/core inside a .NET 8 WPF/WebView2 Windows shell (Microsoft.Web.WebView2 SDK 1.0.4314.35). A framework-dependent x64 executable and ZIP are built locally. Offline native dialogs and narrow messages avoid engine bindings or external services; browser fallback remains separate.
- Distinct workflow: paired source-section inspection and form editing. Completion, general diagnostics, hovers and definition indexing already exist in the official extension.
- Safety boundary: all writes stay inside this project. Originals are only read and protected by scoped hashes. No game launch/control, helper injection, map/profile installation, source extension, repository publication or messages.
- Test route: parser/patcher tests and app-script DOM-adapter tests here; real browser and manual game validation remain separate. Native VFX testing should build on existing CoE5SE test-field APIs, with full combat/map checks where those APIs simplify behavior.
- Open questions: real browser acceptance, multi-file pass/order resolution, native identifier/catalog lookup, exact VFX rendering and user-owned game/test-session integration.

Version 0.2 adds an original arcane-workshop interface, name/type filtering, grouped fields, inline feedback, draft-state labels and a collapsed source review. The only field addition is opt-in level insertion in a plain, otherwise complete spell block; all other missing fields retain conservative read-only handling. See docs/DESIGN-AND-REVIEW.md.

Version 0.3 adds native copy export, unsaved-close handling and a separate reference library. Personal cache: exact historical official index with 406 spell / 797 weapon names, no IDs or full definitions. Distributable: one short documented weapon reference, no index/cache/game assets. The known source layout did not safely decode the current executable, so there is no speculative binary importer. See docs/LIBRARY-AND-DESKTOP.md and MODLOG.md. Desktop visual/dialog acceptance remains pending under the existing local-content inspection restriction; headless checks are labeled separately.
