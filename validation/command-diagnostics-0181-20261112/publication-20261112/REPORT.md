# CoE5 Workbench 0.18.1 publication verification

Date: 2026-11-12. Published at 15:28:55 UTC (16:28:55 Europe/Berlin).

Release: [CoE5 Spell & Weapon Workbench 0.18.1](https://github.com/Chazammm/Coe5Tool/releases/tag/v0.18.1). Stable, public, marked latest. Tag v0.18.1 points to the tested application source commit **9799770e1cef54e7dab309289ed54809f55bbecf**. Later repository changes in this publication task update documentation only.

## Exact archive and source

The existing archive was reused without rebuilding or changing any bytes:

| Asset | Size | SHA-256 |
| --- | --- | --- |
| CoE5Workbench-0.18.1-win-x64.zip | 60,331,902 bytes | `271df1e9eb2b31ad363be676c9e8833555545f60b51b06b6f2478d8014f97c04` |
| CoE5Workbench-0.18.1-win-x64.sha256 | 99 bytes | `af342151ea70e572438d4ecb026ef4e2103048789c145e1af8306f1dd87201f3` |

The checksum file names the exact ZIP and contains its expected digest. A fresh extraction passed the existing 89-file inventory/privacy verification. Publication lint also passed: **89 files, zero failures, zero warnings**, including comparison with the user's own local game files. No game, official/derived extender core, personal mod, save, profile or private session is included.

All 31 packaged UI code files matched current local source. All 88 compared tracked program/build/helper files matched the published source checkout. The packaged executable matched both the existing build output and the extraction used in the earlier desktop check; its SHA-256 is `d740b61d2b57703ff51741116bcc1f14ce7023178418a31afdd1537900e7d757`.

One documentation difference was investigated and resolved as historical evidence: the current VERIFICATION.md has the 0.18.1 test-result paragraph prepended after the package was tested. The remaining document content is identical. It is not a code/binary difference and does not require replacing the tested archive. The archive's README/setup notes still describe its earlier local-only publication state; the release notes and current repository explicitly explain that those statements predate publication. This preserves the user's requested exact ZIP identity.

## Published-asset verification

Both draft uploads were checked for the expected filenames, sizes, completed upload states and GitHub SHA-256 metadata before publishing. After publication:

- The public release API confirmed v0.18.1, draft=false, prerelease=false and the tested target commit. The tag API independently resolved the tag to the same commit.
- Both assets were downloaded from the published release to a new local verification folder. Their computed SHA-256 values matched the local files and GitHub asset digests. The checksum file was also byte-identical.
- The public release page was checked, and the current release link is recorded above.
- v0.18.0 remains public under the same release ID with its original ZIP digest `89d63fe2470235f45ebee7082f1e90c44915c45d39ede97185a43db40fa3c320`. No earlier release, asset, tag or Git history was replaced or rewritten. Previously hidden older releases remain unchanged.

Local metadata, downloaded files and audit output stay outside the publication allowlist. Only this text report and intended documentation updates are committed.

## Verification scope and setup

This task rechecked identity, source association, packaging, privacy and distribution. It reuses the earlier 338 JavaScript, 117 retained native, 44 current-producer native and actual Windows desktop results; it does not claim to have rerun them or performed a new game test. [Earlier verification](../REPORT.md).

Extract the complete ZIP to a writable folder, retain ui/examples/licenses and open CoE5Workbench.exe. .NET 10 is included; WebView2 Evergreen is required. Editing/export work offline. Integrated testing requires the user's own exact supported CoE5 5.43 and official CoE5SE 3.3.0, 3.2.2 or 2.13.0 files.

The update improves diagnostic categories, grouped coverage notes and context-sensitive recognition. It remains a partial editor/assessment, not a whole-mod validator. Vorochi's file and exact messages were unavailable, so his specific issue has not been reproduced or confirmed resolved. No new command's gameplay or visual behavior is inferred from recognition alone.
