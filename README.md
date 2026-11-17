# CoE5 Spell & Weapon Workbench

A Windows workspace for Conquest of Elysium 5 modders. Find a spell or weapon, edit supported settings, see eligible content in game, and export a separate source copy.

Current source: **0.19.0-rc.3** adds **Test Effects**: browse native spells/weapons and supported flight/impact candidates in an isolated in-game field without creating a draft. It accepts the pinned CoE5 5.43 / official CoE5SE 3.4.4 profile and the exact official dev 3.5.0.0 build at 9d74ae4 (API 15). Dev support is Test Effects only. One Fireball cast/reset has been observed; full browser acceptance is pending. [Test Effects and manual steps](docs/TEST-EFFECTS-019.md).

## Download

[Stable 0.18.1 for Windows x64](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.1) · [0.18.2-rc.1 preview for CoE5SE 3.4.4](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.2-rc.1)

The published downloads above predate Test Effects. Build the current source for the new browser; its local Windows candidate is not a newly published release.

Extract the whole ZIP and open **CoE5Workbench.exe**. .NET is included; no account, terminal or SDK is needed. Microsoft Edge WebView2 Evergreen must be available. [Installation, updates and removal](docs/WINDOWS-PACKAGE-018.md).

## Start with what you need

- **Test Effects** — search a real in-game browser, deliberately cast eligible originals or private visual configurations, reset targets and inspect/copy metadata. Pinned CoE5SE 3.4.4 or dev 3.5.0.0 required; this route is awaiting game acceptance.
- **Explore Vanilla spells & weapons** — search the user's verified 5.43 executable by name or ID, follow known links and observe eligible originals with native AI. Built-in records stay read-only.
- **Open your mod** — open or drop one UTF-8 .c5m/.c5se file, find a spell or weapon, edit supported fields and follow resolved links. Unknown lines, comments and unrelated definitions are preserved.
- **Create a draft** — create a linked CoE5SE spell/weapon or choose Vanilla for a native weapon. Search damage and effect choices without memorizing IDs.

Eligible tests use isolated profiles and private records. Review recorded settings and observations, explicitly apply selected values with conflict protection, then **Export copy**. Prepared tests can be found again after reopening; used or stale tests cannot be replayed. Export work you want to keep before closing: open drafts are not automatically restored.

## Game requirements and limits

Editing and native export work offline. **Every integrated game test requires the user's own supported CoE5 5.43 and complete official CoE5SE files.** Existing mod tests and AI observations use 3.4.4 (preview), 3.3.0, 3.2.2 or 2.13.0; Test Effects also accepts the pinned dev 3.5.0.0 profile. Nothing is installed over Steam, normal profiles or mods. CoE5SE 3.3.0 passed bounded selected-spell, original Fireball and mixed visual-comparison game checks. [Compatibility](docs/COE5SE-COMPATIBILITY-0182.md).

Support is bounded: not every mod, original, payload or effect is testable. Custom spell tests use a forced cast; original/weapon observations use AI, which may choose another attack. There is no desktop effects/audio renderer, faithful built-in cloning or Vanilla-only test field. HP changes do not identify a hit. Official field closure does not establish complete record restoration.

[First-use guide](docs/USER-GUIDE-018.md) · [Current update](docs/COE5SE-COMPATIBILITY-0182.md) · [Verification](validation/extender-344-20261116/REPORT.md)

## Development and notices

Developers: [build and verification notes](docs/DEVELOPMENT.md). Earlier reports and releases remain available. No game assets, installed catalogs, extender core, private sessions, profiles or saves are distributed. Third-party notices remain in the package's licenses folder. Workbench is maintained in this repository with Codex assistance; upstream CoE5SE tools/documentation are credited in the existing notices. No new license grant for Workbench or the extender core is implied.
