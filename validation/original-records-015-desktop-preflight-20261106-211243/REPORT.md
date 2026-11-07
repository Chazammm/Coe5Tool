# v0.15 desktop/game validation · offline preflight only

Date: 2026-11-06. **Outcome: BLOCKED before desktop/game testing.** The user answered the desktop-availability check: **“I’m still using it; finish offline preparation only.”** That instruction superseded the earlier request to operate the desktop. No mouse/keyboard input was sent, no application window or game was launched for interaction, and no real disposable sessions/profiles were created.

The computer-use runtime was initialized and open windows were inventoried read-only. The initial process check found no CoE5 game or workbench process. The first CIM-based process query was denied; the ordinary process query and computer-use inventory were available. This was not the reason for stopping. Recent desktop activity and the user's explicit offline-only response were the reason. No unrelated window was activated, altered or closed.

## Small interface correction completed

The actual source text under **What this field can establish & testing instructions** described **Original-record observation**, immediately followed by **“It forces an item-style cast with extended range.”** That was misleading. The original-observation implementation calls `fightTestField`, not `fireTestField`, with no stand-in or weapon/spell setter. The problem was explanatory text, not evidence of forced original-record attacks.

The paragraph now switches with the preparation mode:

- **Generated pair:** **Cast once** forces an item-style attack and temporarily extends some weapon ranges, with the existing limitations.
- **Original record:** **Battle (AI)** runs the native battle. No attack is forced, no range extended and no weapon substituted. AI may use the selected spell/weapon zero or several times; battle startup alone does not establish actual use or a visible effect.

Switching back to generated-pair preparation restores that mode's explanation. The change is limited to HTML/controller text and a focused regression test. The Lua helper, native isolation policy, existing records, sessions and result-return formats were not changed. This correction was checked with actual application scripts and a DOM adapter, **not a rendered desktop window**. The prior text is retained in source-before/index.html (local evidence).

Rebuilt output: CoE5Workbench.exe (local evidence). Keep its whole folder. The normal launcher and older ZIPs were not replaced; no friend package was rebuilt. The native executable/assembly hashes are unchanged because this correction is in the separately loaded UI assets.

## Offline results

| Check | Result / evidence |
| --- | --- |
| Application script suite | **198/198 pass**, script-checks.txt (local evidence). The added test covers both original spell/weapon explanations, the native-fight helper route, and returning to generated-pair mode. |
| Rebuilt native host checks | **13/13 pass**, native-checks.json (local evidence). Includes fingerprint-gated reading of the user's actual executable, PE/fingerprint rejection and WebView2 detection, without a window/game launch. No isolated-session fixture was supplied to this headless run. |
| Exact runtime files | **14/14 hashes match** the existing pinned 5.43 / official 2.13.0 allowlist, offline-preflight.json (local evidence). The plugin was read, not loaded. |
| Game executable | SHA-256 `489d0b82fa790ec36e69a23e2335d0c2048fa57f4051fe8159c64f2d33508e55`; matches the supported Windows 5.43 image. |
| Extender plugin | SHA-256 `26861bb0b6dffaa7150ed239e9eba4e934a955688d101c81161cf395190dd254`; matches the retained official 2.13.0 release used by the host. |
| Rebuild | Successful publish into the requested `build/desktop-015-validation`, build-output.txt (local evidence). Source HTML, controller, README and original-record documentation match their copied desktop assets. |
| Retained files | All **493 protected-file hashes unchanged**, including retained sessions and earlier packages; see offline-preflight.json (local evidence). |
| Desktop rendering, catalog file dialog and preparation controls | **Not attempted** after the user's offline-only instruction. Readability, hierarchy, scrolling/focus and mode-text rendering remain unobserved. |
| Original spell trial | **Not run / blocked.** No selected runtime caster, battle, cast, visible effect, field close or game exit was observed. |
| Original weapon trial | **Not run / blocked.** No selected runtime carrier, battle, attack, field close or game exit was observed. |
| Screenshots and game logs | **None produced for these trials.** Native test JSON and synthetic offline file fixtures are not gameplay logs/evidence. |

The earlier 94 native/original-mock checks, 51 helper scenarios and 24 return/export checks remain historical offline evidence in `validation/original-records-015-20261106/`. They were not relabeled as new desktop or game observations, and were not all rerun for this text-only correction.

## Prepared choices for a later run — not tested

The compiled fingerprint-gated reader re-read 1,029 spells and 936 named native weapons from the installed image. installed-catalog-packet.json (local evidence) is **local test evidence only**, not a distributable application asset.

| Planned trial | Verified pristine metadata | Runtime confirmation still required |
| --- | --- | --- |
| Spell | **Fireball #445**, path **3**, level **2**, effect weapon **#54**. Selected as a candidate for a recognizable effect, not an observed preview. | Load the catalog through the actual desktop dialog; choose #445 explicitly among duplicate names. Use the helper's native eligible-caster picker; record its real name/ID and confirm what the AI actually does. No caster ID is assumed. |
| Weapon | **Spear #4**. Its metadata indicates a native melee weapon; no specific projectile/impact effect is promised. | In a separate new session, select the first melee/ranged-attack route, choose a carrier actually offered by the loaded runtime and record its name/ID. Do not assume a historical carrier or its attack row. |

No package or real session for these planned choices has been prepared behind the desktop interface. This preserves the requested end-to-end desktop workflow for the later test rather than substituting a headless preparation.

## Next useful step

When desktop control is available, resume from this report with the rebuilt **v0.15** executable:

1. Load the installed catalog through **Game data → Load installed 5.43 spells & weapons…**, select **Fireball #445**, then **Observe original with CoE5SE…**. Prepare/start a **new** owned disposable session using the checked runtime. Follow any separate disposable-profile setup instructions.
2. Record the actual native caster ID/name; capture the field before **Battle (AI)**, the relevant native log and any actual animation. Keep battle startup, selected-spell use, and visible VFX as three separate findings. No relevant AI cast means inconclusive, not a pass.
3. Close the field, verify what the helper/log and screen actually establish about cleanup, return to the main menu and Quit only the owned game. Preserve `wb-original-<run>.ini`, launch/session metadata, runtime logs and screenshots in a new evidence subfolder.
4. Repeat in a **separate new session** for **Spear #4**, selecting a runtime-confirmed first-attack carrier. Require evidence that the selected weapon was used; a battle starting alone is insufficient. Do not switch to forced attack.
5. Inspect control readability/hitboxes and lower-left event-log clearance at the actual supported window size, including **Move** if useful. No layout/visual acceptance has happened yet.

The user need not perform these tests manually; their requested agent-operated desktop/game test can resume when the desktop is free. No broader gameplay, AI, VFX, save or Vanilla-only compatibility is established by this preflight.
