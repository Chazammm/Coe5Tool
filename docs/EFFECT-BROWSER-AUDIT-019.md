# Effect browser audit — 0.19.0-rc.3

This is a preview source update, not a published release. Test Effects reads native records from your own pinned Windows CoE5 5.43. It requests original spells as item-style attacks, or copies supported flight/impact values into its own private piercing weapon. It neither renders effects on the desktop nor clones original behavior. Other mod-file and AI observation workflows retain their existing runtime profiles.

## Official development runtime

Checked on 2026-11-17: the newest official dev download is **3.5.0.0**, source **9d74ae4fc70d019bb088dc26995594c71f6e2497**, API **15**. Stable **3.5.0** is a different artifact. Dev download SHA-256: `a00bc72db5f8842dbb96c4e5b33436b26c875e041abb711908f5a61d298586f4`. Its GitHub asset digest, internal binary checksums and verified SLSA attestation agree. The attestation binds the official dev workflow and source commit; the release page's older `target_commitish` is not used as proof of binary provenance.

The independent runtime profile checks the pinned game plus all 14 staged runtime files. It refuses mixed loaders/plugins, stable 3.5.0, future dev versions and relabelled old preparations. Only Test Effects is enabled on dev in this update. It does not silently opt the older mod-test, mixed-comparison or AI helpers into new editor contracts. Select a retained supported release for those workflows. No official/derived extender files are bundled, downloaded automatically or installed over your game.

The source comparison covers numeric field creation, returned unit identities, private setters/readbacks, original spell dispatch, UI draw/wait/pointer coordinates, INI/clipboard calls and field closure. Numeric field calls retain the legacy route: new table/editor options have additional ownership/lifecycle contracts that this browser does not request. Original dispatch still uses the selected spell ID, may temporarily extend weapon range, and does not return a confirmed hit or visible result. A nil return is recorded only as a returned API call; an explicit false is treated as refusal. Legacy closure returns no restoration receipt; it is not proof of complete rollback. New API availability is not used to claim stronger cleanup.

## Audit corrections

- Inspect-only role candidates can be inspected and copied without trying a rejected preview or aborting the browser. No unverified visual commands are emitted for them.
- Explicit native cast refusal records the request without counting a returned cast. Explicit close refusal prevents private restoration/reopening and requires a new disposable session.
- Returned target IDs must be distinct from each other and from the caster; caster and target monster identities are checked before casting.
- Reopening desktop setup restores the saved target/count, disables Start on a different selected runtime and clears old launch/result state if replacement preparation fails. Native checks remain the final launch gate.
- Exact rc.1 and rc.2 helpers are retained for read-only result review. Their sessions are not patched or replayed with the new helper.

Search preserves duplicate IDs and partial-name/ID matching. Original spell payloads, masks, chains and targeting are passed unchanged rather than reconstructed. All VFX remains an inspect-only table; role candidates have identity/use evidence, not appearance guarantees. The native weapon preview is visual-only; flight and impact do not select damage. Copied fragments describe incomplete metadata, not a faithful mod definition. Unknown/source text, pending draft edits and explicit separate-copy export are untouched by this draft-independent route.

The supplied animation-viewer ZIP and separate Sandbox implementation were inspected as references. No supplied viewer code, generated data/media, proprietary assets or experimental core was reused. The archive did not contain explicit reuse terms; attribution alone was not treated as a license.

## Acceptance

Automated models and native host checks are separate from rendered Windows interaction and actual game casts. See the [audit report](../validation/effect-browser-audit-019-20261117/REPORT.md) for final counts, exact candidate hash and any observed gameplay/video. A successful launch or returned call alone is not a successful effect preview.

The dev route subsequently showed one named Fireball cast/impact and a target reset. The receipt remained one request/returned call with hit/visual fields unknown. The isolated process exited with code 0; final field Close and native menu Quit were not observed. The three-effect video was canceled. Other originals, private roles and in-game inspect/copy remain acceptance items; the one cast is not full browser compatibility.

Manual fallback: prepare a fresh Test Effects session with the pinned dev folder; open its main-menu entry; select Fireball #445 and Cast once; Reset; select a second original or supported role and Cast; repeat for a third configuration. Inspect/copy once, Close, then native Quit and refresh the receipt. Record named log entries and actual flight/impact separately. Do not replay completed sessions or repeat a cast just for footage.

Sources: [official dev download](https://github.com/musical-pianist/coe5se/releases/tag/dev-build), [attested workflow](https://github.com/musical-pianist/coe5se/blob/9d74ae4fc70d019bb088dc26995594c71f6e2497/.github/workflows/dev-build.yml), [API](https://github.com/musical-pianist/coe5se/blob/9d74ae4fc70d019bb088dc26995594c71f6e2497/coe5.lua), [field implementation](https://github.com/musical-pianist/coe5se/blob/9d74ae4fc70d019bb088dc26995594c71f6e2497/src/lua_test_battle.h), [release 3.5.0](https://github.com/musical-pianist/coe5se/releases/tag/CoE5SE-v3.5.0).
