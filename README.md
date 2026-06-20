# Guariglia Baseball Scorecard Builder & Live Scorer — Version 21

Version 21 uses Version 20 as its controlling source and redesigns live scoring around pitch-by-pitch entry.

## New pitch console

- Large live balls-strikes count for phone and desktop.
- One-tap Ball, Strike, Foul, and In Play buttons.
- Keyboard shortcuts: B, S, F, I, number keys 1–4 for hits, W for walk, H for hit-by-pitch, K for strikeout, G for groundout, O for flyout, L for lineout, P for popout, and Backspace to undo the last pitch.
- Ball four automatically records a walk and advances forced runners.
- Strike three presents Swinging K, Looking K, and Dropped Third Strike choices.
- Quick result-code buttons for common hits, outs, walks, errors, and special plays.
- Results that are unambiguous are recorded immediately. Plays involving runner movement open the existing detail window with defaults already filled in.
- The plate-appearance grids remain available below the pitch console for review and historical editing.
- Pitch count and pitch sequence are stored in the play log and saved game file.


## PDF palette alignment

The one-page PDF export now uses the exact approved app palette while keeping the classic Version 8–10 scorecard geometry unchanged:

- Burnt orange `#9B4D1F`
- Dark brown `#3D2519`
- Gold `#D9A441`
- Pale yellow `#FBE9B8`
- Cream `#FFF8E9`
- Warm cream `#F6EAD0`

Only the PDF colors changed. Field placement, score boxes, player and pitcher sections, game notes, page size, scoring logic, schedule import, Excel export, and phone/desktop interface remain identical.

## Preserved features

The Version 20 schedule connection, refresh behavior, blank startup, classic scorecard layout, responsive interface, Excel export, one-page PDF export, and saved game files remain available. Older Version 11–20 saved games open with a 0-0 current count.

Deploy the entire unzipped folder so the Netlify function and all supporting assets are included.
