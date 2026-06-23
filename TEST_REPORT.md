# Version 22 Test Report

## Automated source tests

All tests passed:

- Baseball schedule data normalization
- Page/script connection order
- Blank startup and full reset
- Refresh clearing and Section 1 retention
- Responsive layout checks
- Pitch-count and quick-result controls
- Permanent pitch tracking
- Full undo and derived-state rebuilding
- Show/Hide Codes control behavior

Commands completed successfully:

- `npm test`
- `node --check app.js`
- `node --check baseball-data.js`
- `node --check service-worker.js`
- Netlify TypeScript function compilation with a temporary `@netlify/functions` type declaration

## Browser game-state simulation

A Chromium browser simulation recorded three completed plate appearances and ten pitches:

1. Single after Ball, Swinging Strike, and In Play
2. Four-pitch walk
3. Three-pitch strikeout

Before undo:

- Top 1
- One out
- Runners on first and second
- Ten pitcher pitches
- Three batters faced
- One hit, one walk, one strikeout

### Undo latest play

After undoing the strikeout:

- Outs returned from one to zero
- Runners remained on first and second
- Current batter returned correctly
- Pitch log fell from ten pitches to seven
- Strikeout and batters-faced totals decreased correctly

### Delete an earlier play

After deleting the earlier single:

- The remaining walk was replayed from an empty diamond
- Only first base remained occupied
- Pitch log fell from seven pitches to four
- Hits fell to zero
- Walks remained one
- Batters faced became one

### Edit a historical play

The remaining walk was changed to a groundout:

- Outs became one
- The diamond became empty
- Walks became zero
- Batters faced remained one
- All later snapshots were rebuilt

### Undo an inning-ending play

A single followed by a double play moved the game to Bottom 1. Undoing the double play restored:

- Top 1
- One out
- Runner on first
- Empty second and third bases
- Correct current batter

### Actual plate-appearance selector deletion

The test also used the visible plate-appearance dropdown itself, selected the blank option, and confirmed deletion. The app rebuilt to:

- Top 1
- Zero outs
- Runner on first
- One remaining completed play
- One remaining recorded pitch
- One hit, zero walks, one batter faced

## Additional correction

The browser simulation identified and verified a fix for runners marked **Stayed/Hold**. They now remain on their original bases instead of disappearing after a strikeout or other out.

## Artifacts

- `UNDO_REBUILD_REPORT.json` contains the complete before-and-after state snapshots.
- `preview/undo-rebuilt-game-state.png` shows the restored inning, outs, current batter, and interactive diamond.
- `preview/undo-rebuilt-pitch-tracking.png` shows recalculated pitcher statistics and pitch history.
- `preview/undo-via-pa-selector.png` shows the state after deleting a play through the plate-appearance selector.

## Show/Hide Codes browser verification

The control was tested in Chromium at desktop and iPhone widths.

Initial visible state:

- Button label: **Hide Codes**
- `aria-expanded`: `true`
- Grid display: `grid`
- Grid height: 312 pixels in the desktop test

After selecting **Hide Codes**:

- Button label changed to **Show Codes**
- `aria-expanded` changed to `false`
- `aria-hidden` changed to `true`
- The `hidden` attribute and `is-collapsed` class were both applied
- Computed display became `none`
- Grid height became zero

After selecting **Show Codes** again, all values returned to the visible state. A complete game-state snapshot before, during, and after the toggle remained identical, confirming that the control changes presentation only and does not alter scoring data.

Artifacts:

- `SHOW_HIDE_CODES_REPORT.json` contains the browser assertions.
- `preview/show-hide-codes-desktop.png` shows the expanded desktop layout.
- `preview/show-hide-codes-iphone-hidden.png` shows the collapsed iPhone layout.

## Version 23 Fill App scroll verification

The **Fill App from Selected Game** workflow was tested in headless Chromium using a mocked official-game response.

- Viewport before import: `x=0, y=520`
- Viewport after import: `x=0, y=520`
- Vertical movement: `0 pixels`
- Focus after import: `lookupGameBtn`
- Away and home team fields populated successfully
- Browser page errors: none

Artifacts:

- `FILL_APP_SCROLL_REPORT.json`
- `preview/fill-app-scroll-preserved.png`

The regression suite also confirms that normal section navigation retains its existing scroll-to-top behavior, while selected-game import explicitly suppresses it.
