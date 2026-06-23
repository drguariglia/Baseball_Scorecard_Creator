# Version 24 Test Report

Date: 2026-06-23

## Result

PASS - Version 24 preserves the Version 23 application and exact PDF geometry while eliminating residual 2x3 counter artifacts and substantially improving PDF sharpness from top to bottom.

## Automated checks

All inherited and Version 24 tests passed:

- Schedule data and connection wiring
- Blank startup and reset behavior
- Refresh Schedule clearing and Section 1 retention
- Responsive layout
- Pitch count and quick scoring
- Permanent pitch tracking
- Undo and full-state rebuilding
- Show/Hide Codes
- MLB rules alignment
- Button wiring
- Home-team PDF palette and clean-box behavior
- Version 24 high-resolution background and full scoring-grid reconstruction

JavaScript syntax checks passed for `app.js`, `baseball-data.js`, and `service-worker.js`.

## PDF clarity verification

The PDF background was increased from 1275 x 1650 pixels to 2550 x 3300 pixels, equivalent to 300 DPI on a US Letter page.

A Version 24 Mets-color sample was rendered at 300 DPI and visually inspected in three regions:

- Top: game information, Replay Challenge area, line score, and column headings
- Middle: all 180 batter scoring boxes across both teams
- Bottom: both pitching sections and the Game Notes box

Verification confirmed:

- No plus-sign remnants in completed computer-scored boxes
- No 2x3 counter lines or fragments inside or along the scoring-box edges
- Continuous, evenly redrawn vertical and horizontal scoring-grid borders
- Sharper headings, borders, labels, and background details from top to bottom
- Exactly one US Letter portrait page, 612 x 792 points
- No changes to rows, columns, field coordinates, pitching sections, or Game Notes geometry

Measured edge-detail scores increased substantially over Version 23 at the same 300-DPI render:

- Top headers: 108.28 to 349.75
- Scoring grids: 79.46 to 236.81
- Bottom pitching area: 100.30 to 352.09

## Files

- `preview/v24-sharp-clean-pdf.png`
- `preview/v24-clean-scoring-boxes.png`
- `PDF_CLARITY_REPORT.json`

Version 24 has not been deployed to the live Netlify site.
