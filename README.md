# CoE5 Spell & Weapon Workbench

Create, inspect and edit supported Conquest of Elysium 5 spells and weapons, test them in game, then export a separate source copy. Windows desktop **0.18.0-rc.3 · official mixed visual-comparison preview**. Bounded CoE5SE 3.2.2 game evidence covers selected-spell return/export, original Fireball AI observation and one fixed ranged mixed-group battle with recorded review and normal exit. Other combinations remain unverified; see the [mixed-game evidence and limits](validation/official-mixed-0182-20261110/game-20261110/REPORT.md). Version 0.17.0 remains the previous stable download.

## Download and start

Get the versioned Windows ZIP and checksum from [GitHub Releases](https://github.com/Chazammm/Coe5Tool/releases). Extract the **whole folder** and run **CoE5Workbench.exe**. Keep the files beside it; copying only the EXE is insufficient.

Requires Windows x64, [.NET 8 Desktop Runtime x64](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) and [WebView2 Evergreen Runtime](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution). Normal editing needs no Node.js, SDK, account or game launch.

Integrated game tests require your own **CoE5 5.43** and official **CoE5SE 3.2.2** files (compatibility preview) or **2.13.0** (earlier bounded gameplay evidence). They are not supplied. Workbench checks exact fingerprints and prepares a private runtime/profile. It does not update Steam, install mods in your normal profile or use campaigns/saves.

## Choose a starting point

| Intention | Start here | Next action |
| --- | --- | --- |
| Observe a Vanilla spell or weapon | **Explore Vanilla spells & weapons** | Read your verified local catalog, search by name/ID, follow known links and **Observe original with CoE5SE…**. Originals stay read-only. |
| Edit your mod | **Open your mod…**, or drop one `.c5m` / `.c5se` | Search the overview, open a definition, edit supported fields and **Apply changes** to the draft. Test an eligible selection or **Export copy**. |
| Create content | **New spell & weapon**, or **Target → Vanilla → New native weapon** | Create a separate draft, edit/apply, then test or export a fragment for integration into your mod. **Try a supported example** supplies a usable starting shape. |

Target, actual file format and test dependency are separate. Switching Target never converts or deletes source. Mixed/CoE5SE content stays inspectable; unknown commands and comments stay in full-source exports.

## Test, review and use the result

1. Choose a supported selection's test action and check its participants, payload and stated scope.
2. **Prepare game test** builds the files and validates a separate setup in one action. It starts no game. Choose your local game/extender files first if requested.
3. Explicitly **Start isolated test** and follow its displayed menu entry/instructions. Do not start/load a campaign.
4. Close the field and Quit normally, then return to Workbench. Helper records, actual attacks and visible effects are separate evidence.
5. For editable experiments, review **Saved test values**, select what to bring back, resolve newer-edit conflicts and export a separate copy. Original observations have read-only summaries under **Previous observations…** / **Prepared tests…**.

After reopening: **Prepared tests… → select an unused preparation → Check before resuming → Start saved test**. Used, stale, incomplete or incompatible preparations explain their refusal. These actions do not replace the open draft.

| Test | What happens | Boundary |
| --- | --- | --- |
| Original Vanilla record | Native AI with an eligible native caster/carrier | May use the selected record zero or several times. No forced cast, shared edit or faithful editable clone. |
| Supported custom spell + linked weapon | Forced item-style cast of a bounded pair | Some ranges are temporarily extended. Other mod content is not loaded; normal AI/campaign behavior is not established. |
| Supported standalone weapon | Native AI using a private melee/ranged carrier and explicit payload | Limited damage/area/visual shapes. The native export stays separate from the CoE5SE fixture. |

Supported private fixtures include physical/fire/cold/shock damage, selected sprite/particle visuals, same-type groups and mixed native groups. Official 3.2.2 keeps the fixed field and adds a bounded [mixed visual-comparison preview](docs/OFFICIAL-COMPARISON-0183.md) with up to eight fresh field attempts and protected visual return; new comparison gameplay acceptance is pending. The older fixed field has one ranged two-type game case; legacy mixed comparison needs the separately available authorized 2.13.0 component. Special/manual payloads remain restricted. Visual comparison can return selected values with conflict protection. There is **no desktop VFX renderer, complete original clone or Vanilla-only integrated field**. Historical references and verified installed/runtime data have distinct provenance. A saved value, battle return or HP change is not automatically a confirmed cast, attacker, hit or visual success.

**Apply changes** updates the in-memory draft. **Export copy** writes a new file and cannot overwrite the opened original. Pending edits and unsaved observations have replacement/close protection. Full exports preserve unrelated definitions, comments, formatting and unknown lines. A definition-only test does not validate an entire mod or its dependencies.

## Help, evidence and source

- [Practical user guide](docs/USER-GUIDE-018.md) · [Windows setup](docs/WINDOWS-PACKAGE-018.md)
- [Damage types](docs/DAMAGE-TYPES-014.md) · [Vanilla data coverage](docs/VANILLA-LIBRARY-016.md)
- [Release verification](https://github.com/Chazammm/Coe5Tool/blob/main/validation/extender-322-20261110/REPORT.md) · [Bounded Fireball AI/VFX evidence](https://github.com/Chazammm/Coe5Tool/blob/main/validation/fireball-library-manual-20261109/agent-game-20261109/REPORT.md)

For source builds, use `Build-Desktop.ps1` (.NET 8 SDK and initial NuGet access), then `Start-Workbench.cmd` or `build/desktop-018-comparison/CoE5Workbench.exe`. Use `-SkipRestore` after restoring locked dependencies. Tests: `node --test tests/*.test.cjs` and the compiled native self-tests. Version 0.18 adds independently verified runtime profiles and version-bound preparation/review. Earlier helpers/results keep their contracts. The new official group helper has its own closure receipt, without a record-rollback claim; see [official mixed fields](docs/OFFICIAL-MIXED-0182.md). See [compatibility/API findings](docs/COE5SE-COMPATIBILITY-018.md) and [manual acceptance](docs/MANUAL-ACCEPTANCE-018.md).

Game files, official or derived extender binaries/core source, assets, personal mods, saves, profiles and private sessions are excluded from the current public source/package. Only portable examples and identifier/reference metadata are supplied; the full installed catalog is read from the user's executable. Legacy 2.13.0 mixed tests need a separately available, authorized private roster component, which is not distributed here. The 3.2.2 API-11 loader never receives that API-10 plugin.

Development uses Codex (GPT-6 family) assistance. CoE5 is by Illwinter; CoE5SE and its MIT-licensed tools/reference work are by musical_pianist. Third-party notices are in `licenses` in the Windows package; project licensing is unchanged. Earlier development history remains in the source repository's `docs/history` and validation reports.
