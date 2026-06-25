# Version 27.2 Validation Report

- Complete inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Active-roster bullpen loading: PASS
- Starter-first Add Pitcher workflow: PASS
- Alphabetical unused-pitcher dropdown ordering: PASS
- PDF/Excel actual pitcher appearance order: PASS
- Unused roster pitchers excluded from printed pitching rows: PASS
- Full pitcher data preserved in export: PASS
- Pregame starter-only export fallback: PASS
- Legacy saved-game pitcher matching: PASS
- Quick Codes shared-font validation: PASS
- Strikeout-looking mirrored standard K validation: PASS
- Unicode reverse-K fallback excluded: PASS
- Version 27.2 cache refresh for corrected Quick Code assets: PASS

## Version 27.2 Complete Button Audit — June 24, 2026

- PASS: 64 static buttons inventoried.
- PASS: 89 initial runtime buttons verified.
- PASS: all direct, delegated, submit, and native-dialog handlers verified.
- PASS: 70 direct browser interaction scenarios.
- PASS: duplicate save, Excel, and PDF controls.
- PASS: dynamic Remove Error and Edit Challenge controls.
- PASS: no broken controls or JavaScript runtime errors found.
- Added `tests/version27-2-comprehensive-button-audit.test.js` to the permanent test suite.

## Version 28 Broadcast-Style Live Game Center — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Score, inning, outs, base diamond, and compact count consolidated inside Pitch-by-Pitch Scoring: PASS
- Dynamic MLB/manual team abbreviations: PASS
- Current batter and pitcher data: PASS
- On-deck and in-the-hole batting-order logic: PASS
- Desktop standalone visual render: PASS
- iPhone standalone visual render: PASS
- Version 27.2 autosave migration compatibility: PASS
- ZIP and duplicate-ID validation: PASS
