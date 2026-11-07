# Target-aware starting desk · v0.13 correction

The user's screenshot showed Vanilla selected while the empty desk still advertised a linked spell/weapon and an extender test workflow. The central start copy and actions were static, and the two creation shortcuts implicitly changed the selected target.

The desk now follows Target:

- **Vanilla:** “Shape a native weapon.”, “Native weapon source editor”, only **New native weapon**, and **Edit → Review → Export**. The empty source note shows native weapons.
- **CoE5SE:** “Make a spell. Shape its weapon.”, only **New spell & weapon**, and **Edit → Test → Bring back**. The spell source note is restored.
- **Open source…** remains available in either. The visible creation action uses the selected target and never changes it implicitly. Existing source records, including spells in mixed source, remain inspectable; target switches do not rebuild fields, drop pending edits or convert source/format.

**183 script tests pass.** Focused integration checks cover both switching directions, hidden/disabled incompatible creation actions, unchanged target on creation, restored copy/workflow, unchanged Read-as/source/unsaved state, and preserved pending fields and mixed records. Static HTML/reference, package-byte and protected-file checks are in `checks.json`; full script output is in `script-tests.txt`.

The standard desktop app and `dist/CoE5Workbench-win-x64.zip` are rebuilt. Its native assembly is unchanged from the previously checked build. All 491 protected files and the earlier friend ZIP retain their hashes. No friend package was rebuilt for this small correction.

No desktop/game control or new rendered acceptance occurred. The supplied screenshot establishes the previous visible problem; it does not verify the fix. Restart the standard desktop app and switch Vanilla ↔ CoE5SE to visually confirm the new desk. Source editing and export safeguards are unchanged.
