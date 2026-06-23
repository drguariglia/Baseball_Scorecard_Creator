# Guariglia Baseball Scorecard Builder - Version 24

Version 24 is built from the deployed Version 23 baseline. It preserves the existing scoring workflow, MLB home-team color palettes, optional blank-PDF guides, and the exact one-page classic PDF geometry.

## Version 24 changes

- Replaced the 150-DPI PDF background with a sharpened 300-DPI background measuring 2550 x 3300 pixels.
- Completed computer-scored PDFs now rebuild both nine-row scoring grids after removing traditional guides.
- Every plus sign and every 2x3 ball-strike counter fragment is removed from completed PDFs, including remnants that previously remained along cell edges.
- Vertical and horizontal scoring-box borders are redrawn cleanly after the guides are removed.
- PDF image encoding quality was increased while retaining the same US Letter portrait page and all existing field positions.
- Blank PDFs can still include the traditional plus signs and 2x3 counters when the user selects that option.
- Home-team MLB color schemes, online scoring, pitch tracking, undo rebuilding, exports, and all Version 23 app behavior remain unchanged.

Version 23 remains the currently deployed live baseline. Version 24 is the new testing build until it is reviewed and deployed.
