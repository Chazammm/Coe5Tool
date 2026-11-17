# 0.19.0-rc.3 — Test Effects audit preview

Source update and local Windows candidate. No new public release is created by this task.

- Test Effects can use the exact official CoE5SE dev **3.5.0.0 / API 15**, commit **9d74ae4**, with the pinned CoE5 5.43 executable. The full profile and attestation are checked; future dev builds and stable 3.5.0 are separate profiles. Dev support is limited to Test Effects.
- Inspect-only effect candidates remain inspectable without attempting an unsupported preview. Refused casts and closes are handled explicitly, and returned unit identities must be distinct and match the fixture.
- Reopening browser setup shows its saved target/count and rechecks readiness. Failed replacement preparation cannot leave the previous Start action or receipt active.
- Existing supported release routes, source editing, protected return/export and old receipt review are preserved. Earlier browser helpers remain read-only contracts.

Every valid native spell ID can be requested unchanged; targets, terrain and other engine conditions can still prevent an effect. Native weapon previews copy supported visuals only. Returned calls do not establish hits, damage or appearance. No desktop renderer, faithful cloning, Vanilla-only test field or complete global restoration is promised. See the [audit and acceptance record](../validation/effect-browser-audit-019-20261117/REPORT.md) for what was actually tested.

The portable app includes .NET 10 and requires WebView2 Evergreen. In-game testing uses the user's own supported game/extender files; none are distributed. Existing public downloads do not contain this source preview.
