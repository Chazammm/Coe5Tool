# Test Effects technical audit — 0.19.0-rc.3

2026-11-17. Preview update; no GitHub release or Nexus upload is authorized by this task.

## Scope and findings

Started from clean main at `3d34627285ba74ca5214b70cf4f7a3c5e5b2f0d8`, matching the remote. Reviewed the complete browser journey, parser-independent private fixture, native candidate verifier, isolated preparation/launch/resume, runtime profile, Lua catalog/search/selection, original dispatch, private writes, inspect/copy, receipts, old-result association, geometry/hitboxes and packaging allowlist. Existing source/pending edits are independent of the browser. No unrelated local changes were discarded.

Corrected inspect-only candidate inspection, explicit cast/close refusals, duplicate/caster target identities, saved-target restoration and stale launch/result UI state. Browser reopening rechecks saved preparation before enabling Start. Retained rc.1/rc.2 browser helpers remain exact, read-only review contracts. A fresh preparation is required for the new helper. Existing mod-test producer versions remain recognized.

The newest official dev artifact checked was 3.5.0.0 / API 15, attested source `9d74ae4fc70d019bb088dc26995594c71f6e2497`. Asset SHA-256 `a00bc72db5f8842dbb96c4e5b33436b26c875e041abb711908f5a61d298586f4`; internal binary hashes and SLSA workflow verification passed. The moving tag's historical target metadata was not used as binary identity. The dev profile checks all 14 files, is enabled for Test Effects only, and refuses other routes, stable 3.5.0, future dev versions and mixed components. No official core is modified or redistributed.

The supplied animation-viewer ZIP was a reference, with no explicit reuse license. No supplied code/data/media, Sandbox experimental core or game assets were copied. Role metadata remains the existing independent 5.43 data; identity/witnesses do not establish appearance. All 1,029 original native spell IDs are requestable without payload reconstruction. This is not proof that every spell works on the grass field or under item-style targeting.

## Verification record

Final automated/native/package and rendered/game observations are recorded below as each completes. No successful new gameplay is inferred from source inspection, a model or a launch. Initial native audit lacked four local INI controls and the isolated-package input; those fixture-copy omissions were corrected without weakening application checks.

See [supported scope and source contracts](../../docs/EFFECT-BROWSER-AUDIT-019.md). Private runtime downloads, generated catalog/model inputs, actual session data, screenshots and video remain local and are excluded from publication.

## Subsequent desktop and bounded game observation

After renewed desktop permission, the extracted rc.3 app showed the older browser contract refusal with Start disabled and the saved Spearman #13 ×4 target/count retained. The normal native dialogs selected the pinned game and exact attested official dev folder. The app displayed dev 3.5.0.0 / 9d74ae4, loaded 1,847 target choices, prepared a fresh private browser and started it explicitly. Logs confirm API 15 and only CoE5SE plus the uniquely named test mod.

One deliberate **Fireball #445 / weapon #54** request was observed using Spearman #13 against four Spearmen. The visible log named Fireball, the impact/flame/smoke was seen, and the debug log records the named weapon, payload 15, damage type 4 and one target taking **3 damage**. Debug text is supporting evidence for this run, not a stable hit API. The bound receipt records requests=1, calls=1, with hits and visual observations still unknown; those were not overwritten by what the agent saw. A successful native request does not establish AI eligibility or general spell coverage.

Reset was observed, with the close/open pair in the native log. The primary controls were visible at the original 880×672 window and after maximization; the lower-left event log stayed readable. The overlay stepped aside during the cast and returned. Search opened the native input box, but a second spell was not selected/cast. The proposed three-effect recording was canceled by the user; no finished video was produced. Clipboard inspection, other entries/categories and final field Close/native menu Quit remain unverified in game. The last receipt stage is ready after Reset, not closed. The process disappeared; the owning Workbench refresh recorded **exit code 0** and correctly displayed one request/returned call without claiming final cleanup. The Workbench window closed normally. No test is replayed.

An automation mistake earlier entered the game executable into the file dialog location bar and launched the regular Steam-path game instead of selecting it. No campaign was entered. That window subsequently closed; the action/exit route was not established. A separate FPS-project game process was briefly present and was not operated or closed by this task. Both were absent before the actual isolated launch. No game binary was patched or replaced; the installed executable's final SHA-256 still matches the pinned build. Because the accidental startup used the regular environment, absence of incidental normal-profile/log writes is not independently established. This is recorded as an automation error, not a Workbench defect.

## Offline results

- 360/360 JavaScript regressions passed, including dev/profile refusal, saved-target restoration, native readiness refusal, failed preparation and unchanged pending draft cases.
- 151/151 compiled native checks passed in the sequential run, with real file fingerprint verification and substitute processes only. Existing 2.13.0, 3.2.2, 3.3.0 and 3.4.4 profile/result controls were included. A prior overlapping run correctly encountered the global launch lock; rerunning sequentially passed without bypassing it.
- 24/24 standalone Lua-VM models passed on 3.4.4; 25/25 passed on the dev-generated helper including the local all-1,029-original-ID model. These are synthetic calls, not 1,029 in-game tests. Private ownership, refusal/partial writes, open/close errors, identity corruption, copy/inspection, history capacity and responsive hitboxes were covered. Helper/template parity passed.
- Initial extracted package inventory/privacy gate passed (96 files, 95 inventoried); no game/core/private files or machine paths. The final archive will be checked after final documentation changes.

## Rendered Windows check so far

The extracted rc.3 application opened at 1107 x 794 pixels. Home entries and the Test Effects setup were present. Runtime/target data loaded from the user's verified 3.4.4 profile. Desktop input paused when the foreground switched to Discord; no game had been launched. At that stage no game had launched. The subsequent bounded observation and canceled recording are recorded above.


## Exact final local candidate

dist/CoE5Workbench-0.19.0-rc.3-win-x64.zip — 60,401,754 bytes. SHA-256: 68ab084c33e35c2f2ff28c75912c09b2687cf217c0bd7696e495d6ce4b705a59. The sidecar checksum matches. A fresh extraction passed the 97-file / 96-inventoried privacy/hash scan. The extracted executable is byte-identical to the final compiled build (SHA-256 9861105c55d63f52d9eb31b962c4ff65d75422942314b059feb3cf84843e306b), and its own native run passed 151/151 checks.

The exact final extraction was launched at 1107 x 794. Test Effects displayed the pinned dev profile, restored Spearman #13 x4, kept the used preparation's Start disabled and reviewed the retained one-request/one-return receipt with unknown hit/appearance. It closed normally. No additional game was launched in this final-package check. All 360 tests also passed in the publication checkout, and both generated-helper parity checks passed.

This remains a local preview ZIP. No GitHub release, asset upload, Nexus update or external message is made. Latest dev was rechecked before completion and remained the same 3.5.0.0 artifact/source. Remaining manual acceptance: a fresh session for a second original and a private role; inline inspect/copy with persistent Cast; final field Close followed by the actual menu Quit. Do not replay this used session or equate its interrupted final receipt with completed cleanup. The user canceled the recording; incomplete local captures are not public artifacts.
