# Independent review and corrections

**Historical review of version 0.1.** This independent review predates the 0.2 interface and optional insertion changes. The redesign's separate self-review and remaining browser limits are recorded in [DESIGN-AND-REVIEW.md](DESIGN-AND-REVIEW.md); do not treat the findings below as independent approval of that new code.

**5 November 2026.** The existing Astra agent independently examined format evidence and prototype code. A separate reviewer examined native VFX/test-field contracts and local example metadata. Both were read-only. No external messages, game launch or source changes were performed by reviewers.

| Finding | Correction / disposition |
|---|---|
| Official editor already covers completion, general diagnostics, hover tables and definitions | ACCEPTED. Scope is a paired form/source/change-review workflow, not a replacement language service. |
| `.c5se` prefixed hash lines are comments, unlike `.c5m` decoding | FIXED. Lexer takes format; regression prevents phantom definitions or incorrect field attribution. |
| A duplicate after an unknown or malformed line could leave the earlier field editable | FIXED. Visible matching commands in opaque/malformed tails disable the ambiguous field; unrelated earlier fields remain usable. |
| JS Unicode whitespace admitted unsupported separators | FIXED. ASCII space/tab delimiters; BOM only at file start. Regression covers NBSP and noninitial BOM. |
| Large integers must not use Number | ACCEPTED. Decimal strings/BigInt; signed 64-bit spell damage remains exact. Selected reference/storage bounds catch gross overflow without promising loaded IDs or native legal-value validation. |
| Name byte limits and embedded NUL | FIXED. Spell header 47 bytes, quoted weapon reference 63 bytes; NUL is rejected. Multibyte regressions included. |
| Changing interpretation changed download extension without conversion | FIXED. Imported source's extension is retained; interpretation change is explicitly not conversion. |
| Starter impact sound -1 was not established by the cited manual rule | FIXED. Removed it and default look 0; starter keeps documented explicit settings rather than inventing defaults. |
| Native test APIs already exist | ACCEPTED. Future VFX validation uses that route; single-shot range expansion and timing limits documented. No helper/map-only gap invented. |
| Abyss companion spell citation excluded its weapon assignment | FIXED. Cited lines 137–143, assignment on 142. |

Astra independently ran the initial corrected 35-test suite successfully, then identified the final malformed-duplicate case. Root added that regression/fix and reran the full suite. The VFX reviewer confirmed actual examples and the documented seven test APIs. The final totals are in research/check-results.json.

## Verification boundary

Completed: primary-source/version checks, exact source comparison, parser tests and actual app.js through a DOM adapter. Browser local-file navigation was rejected by the browser tool's URL policy and was not bypassed. No real browser layout/file-picker/download check or in-game acceptance is claimed. The DOM adapter is not a rendering engine.

No material review issue was dismissed. Future browser and manual native testing remain explicit roadmap work.

Final environment note: the preservation check detected a changed installed game executable, outside this project's write actions. It was left in place and recorded without assuming a cause or new version. The other 330 protected files matched. This is a known integrity-baseline exception, not a passing unchanged-binary check.
