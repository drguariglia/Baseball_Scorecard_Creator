# Version 21 Test Report

## Scope

Version 21 was built from the controlling Version 20 source. The live-scoring interface was redesigned around pitch-by-pitch count entry while preserving schedule lookup, blank startup, refresh behavior, classic scorecard exports, responsive layout, and saved-game compatibility.

## Automated source tests

The following tests passed:

- MLB/MiLB schedule and selected-game data mapping
- Netlify function and connection-script wiring
- blank startup and complete reset
- Refresh Schedule clearing and scroll-position retention
- responsive desktop, reduced-window, and phone rules
- live balls-strikes controls and keyboard mappings
- automatic ball-four walk handling
- strike-three result chooser
- pitch-count and pitch-sequence storage

Command: `npm test`

Result: all six test files passed.

## Browser interaction test

A Chromium browser-level test exercised the actual Version 21 interface at desktop and iPhone widths.

Verified:

- Three balls and two strikes displayed as `3-2` after five pitches.
- A foul ball with two strikes left the count at `3-2` and increased the pitch total.
- Undo Pitch removed the foul and restored the prior pitch total.
- Ball four automatically recorded a walk, advanced to the next batter, and reset the live count to `0-0`.
- The completed walk retained its final `4-2` count and six-pitch sequence.
- Strike three displayed Swinging K, Looking K, and Dropped Third Strike choices.
- Selecting Swinging K recorded the strikeout, added one out, advanced the batter, and reset the count.
- Keyboard shortcuts recorded Ball and Strike correctly.
- Keyboard shortcuts continued working after a pitch button retained focus.
- Desktop horizontal overflow: `0 px`.
- iPhone horizontal overflow: `0 px`.

Detailed results are stored in `PITCH_CONSOLE_REPORT.json`.

## Responsive review

The pitch console uses four large controls on desktop and a two-by-two control arrangement on phones. Quick result codes use six columns on wide screens, four on reduced desktop/tablet widths, three on smaller screens, and two on narrow phones.

Screenshots:

- `preview/desktop-pitch-console.png`
- `preview/iphone-pitch-console.png`

## Compatibility

Version 11 through Version 20 saved-game files remain supported. Older files open with the current plate appearance at a `0-0` count because they did not store pitch-by-pitch data.


## PDF palette revision

The approved Version 21 source was updated without changing its version number. The classic one-page PDF background and overlay text now use the exact burnt orange, dark brown, gold, pale yellow, cream, and warm-cream palette used by the app.

Verified:

- PDF page geometry remains 612 × 792 points (US Letter portrait).
- Embedded background dimensions remain 1275 × 1650 pixels.
- No scorecard rows, columns, labels, scoring boxes, or note areas moved.
- The previous pink/peach total-cell tint was replaced with warm cream.
- Header text uses cream rather than pure white.
- JavaScript syntax and the full Version 21 automated test suite pass.
- A rendered sample PDF was visually inspected for clipping, overlap, and palette consistency.
