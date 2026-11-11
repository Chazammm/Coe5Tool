# CoE5SE 3.3.0 verification — 2026-11-11

**API/file checks and three bounded real-game cases passed. Final package/publication checks are recorded in the release report.** The user requested 3.3.0 verification before publication of the polished Workbench release.

## Official identity and source investigation

Selected official [CoE5SE 3.3.0](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v3.3.0), current stable on 2026-11-11, source commit b1150f2786e01ba4ebd484cd4633005e003a79cb. The archive matched both the release-body SHA-256 and GitHub asset digest: **60ac4979f6cfe508da6488a84c006daf8311bac5e1fc8e86a81c865594403db9**. GitHub attestation verification passed for the official repository/workflow/tag. Extraction is private and isolated; no installer script was run.

The shipped API header, test-field, UI, unit, get/set, copy, data-file, game-data and Lua-facade sources are byte-identical to the verified 3.2.2 extraction. API remains 11. Game-code hash definitions are identical; address changes add item/parser entries without changing existing addresses. The same exact Windows CoE5 5.43 executable remains required (SHA-256 489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55).

New official plugin SHA-256: 26cb5c25e5aab0dc27710bbd08bc7ba9374dfa8ff8f6e4dc423b3e2cc743e14b. Loader: d6b9075704b89f414e1cfbbcc98b1d7158f5edc6b3ed29a999e92588bc41d12d. The sidecar is unchanged from 3.2.2. Stub, mod descriptor, banner/layout and game dependencies keep their independently pinned hashes. This is a separate complete profile, not a version-string bypass.

The meaningful workflow change is logging. The new loader creates coe5se_logs inside its own game directory; new extender logs use that folder, with a documented root fallback. In our sessions this is the staged runtime directory, not the user's installed game. The native launch path now preserves both expected locations safely before a launch.

## Adaptation and offline checks

- Independent 3.3.0 profile, explicit API-11 capability routing, canonical generation, official fixed/comparison readers, prepared-session labels and source/result version association. The private API-10 roster component remains restricted to 2.13.0.
- 3.3.0 contracts require a fresh current-version preparation. Existing 2.13.0/3.2.2 records retain their own paths and checks; rc.3 records remain readable. Unknown versions, mismatched components and tampered files remain refused.
- **326 script checks passed**, including canonical selected spell/original/weapon packages, identical Lua across 3.2.2/3.3.0 for equivalent inputs, actual UI-model mixed routing and no automatic launch.
- **115 compiled native checks passed**, including actual files for all three profiles, captured launch intent/substitute child, isolated ownership/stale checks, old-result review, bound official mixed receipts and new log preservation. A new fixture initially omitted the source/mode envelope supplied by the real desktop; the fixture was corrected before the passing run. These are not game tests.
- No extender core was modified, built or distributed. The 24 existing Lua helpers remain unchanged. Source inspection/model checks do not establish that any 3.3.0 spell/weapon was used or rendered in game.

## Actual desktop preparation

Using the current self-contained source-built Workbench, the native file dialogs selected the user's verified game and the separate official 3.3.0 extraction. The interface displayed the 3.3.0 preview dependency. Three independent disposable sessions were prepared normally, closing/reopening the app between preparations so changing modes did not stale another bound snapshot:

1. Selected Harbor Ember Test with linked Harbor Ember, ordinary Spearman caster/target, editable test values enabled. Other definitions are not loaded.
2. Read-only original Fireball spell #445, three Spearmen; native caster eligibility is chosen in game, with Pyromancer #55 as the previously observed candidate if offered.
3. Private ranged Official Comparison Needle, piercing payload 8, area code 5, Spearman #13 ×2 and Levy #27 ×2; live visual comparison enabled. The installed-data search distinguished Levy variants rather than guessing an ID. Baseline sprite 1 / Ballista bolt #7 / Flame #68.

At preparation time all three were unused and all 19 staged input hashes matched per session. The later authorized agent run used each once; see the actual-game report. Screenshots, identifiers, paths, source copies and session records remain local. A real chooser caption still named only 3.2.2; corrected for 3.2.2/3.3.0 and recorded in checklist C52. The final archive/render check remains pending.

## Acceptance outcome

Local MANUAL-330.md contains the prepared-session names, exact menu entries and short steps. Required observations: one controlled selected-spell cast/save, a named Fireball AI cast if it occurs, and two mixed visual configurations with fresh targets, followed by field closure and normal exit. Actual attacks, visuals, recorded values and process exit must be reported separately. AI refusing to cast Fireball is inconclusive, not success. HP changes do not identify an attacker; official close does not establish complete rollback.

Actual observations and defects: [game report](game-agent-20261111/REPORT.md). Selected Harbor Ember was cast exactly once; original Fireball was cast twice by native AI in one battle; two mixed visual configurations used fresh Spearman/Levy groups. All three closed and responded to menu Quit. Two exit codes were retained as 0; the original observation lost its exit receipt to the pre-fix refresh defect and remains explicitly unknown. The result refresh and a missed browser return gate were corrected, tested and reviewed in the actual rebuilt app. No extra diagnostic battle was run.

327 JavaScript checks and 116 native checks passed after fixes. All older version profiles and old-result checks remain. The only Lua change is the version-neutral comparison title; the exact old title remains accepted for retained setups. Runtime rollback, unknown hit attribution and historical status/Quit causes are not promoted to confirmed behavior. Local clips, logs, identifiers and source copies are excluded from GitHub/package; text-only findings may be published.
