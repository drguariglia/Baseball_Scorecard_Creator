# Guariglia Baseball Scorecard Builder & Live Scorer — Version 22

Version 22 builds on the approved Version 21 source and adds permanent pitch-by-pitch storage, pitcher statistics, and full game-state rebuilding after an undo or edited play.

## Pitch tracking

- Every Ball, Swinging Strike, Called Strike, Foul, In Play, and Hit By Pitch is stored as a separate pitch event.
- Each event retains the pitcher, batter, inning, half-inning, count before and after, pitch code, and timestamp.
- The Active Pitcher selector credits every new pitch and completed plate appearance to the correct pitcher.
- The separate Pitch Tracking section reports pitches, strikes, balls, strike percentage, swinging strikes, called strikes, fouls, balls in play, batters faced, hits, walks, intentional walks, hit batters, and strikeouts.
- The complete pitch log can be downloaded as a CSV file.

## Undo and correction behavior

Version 22 now treats the ordered play log as the source of truth for all derived game information. Whenever a completed play is undone, deleted from a plate-appearance selector, or edited, the app rebuilds every remaining play from the beginning and recalculates:

- Current inning and half-inning
- Outs
- Runs, hits, errors, and inning totals
- Current batter and batting-order position
- First-, second-, and third-base occupancy on the interactive diamond
- Batter totals
- Pitcher pitches, strikes, balls, walks, hit batters, strikeouts, hits, and batters faced
- Pitch-event ownership and the current in-progress pitch session

Runners marked **Stayed** now remain on their original bases. This corrects strikeouts, flyouts, and other plays where existing runners hold their positions.

## Show/Hide Codes control

- **Hide Codes** now fully removes the quick-result grid from the layout.
- **Show Codes** restores the complete grid in the same location.
- The button label, `aria-expanded`, `aria-hidden`, `hidden`, and collapsed CSS state remain synchronized.
- Toggling the codes does not change the count, inning, outs, runners, plays, pitch history, or pitcher statistics.
- Choosing **In Play** automatically reopens the result codes so the play can be completed quickly.

## Preserved Version 21 features

- Burnt orange, brown, gold, yellow, and cream app/PDF palette
- Classic one-page scorecard layout
- MLB and MiLB schedule lookup and selected-game import
- Responsive desktop and iPhone interface
- Blank startup, full-game reset, and scroll-preserving schedule refresh
- Split Swinging Strike and Called Strike controls
- Phone and keyboard scoring controls
- Quick result codes
- Excel and one-page PDF exports
- Saved game files compatible with earlier versions

Deploy the entire unzipped folder so the Netlify function, service worker, templates, and all supporting assets are included.

## Fill App scroll preservation

Selecting **Fill App from Selected Game** now keeps the user at the exact same page position while the selected game information is populated. The button also retains keyboard focus. Normal navigation buttons continue to move to the top of their selected section.
