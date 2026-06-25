# Guariglia Baseball Scorecard Builder — Version 27.2

Version 27.2 is the current testing build, combining the Game Management Update with regulation-game rules, extra-inning continuation pages, active-roster pitcher selection, and corrected pitching exports. It retains the approved Version 24 classic PDF foundation and all Version 25/26 scoring, pitch-tracking, ABS, and live-matchup capabilities.

## Game Notes and Key Plays

- The lower-right Game Notes area begins with the final/current score.
- Appearance notes are assembled chronologically from the first recorded plate appearance through the last.
- Each note includes the inning, batter, at-bat result, and the note entered for that appearance.
- A compact **Key Play** toggle prefixes the note with `KEY PLAY`, marks the scoring cell, and identifies the event in Game Notes.
- Manual Game Notes, substitutions, pitching changes, and ABS challenge information are retained in the exported timeline.

## Position-Player Substitutions

- Each team has a ten-player bench area with the same fields used for starters: number, name, position, bats, AVG, and OBP.
- Each live lineup row includes a substitution dropdown.
- Only unused available bench players appear.
- The substitution dialog records the reason, defensive position, inning, half-inning, and optional note.
- Starters and substitutes retain separate identities, histories, and individual batting statistics while sharing the correct batting-order slot.

## Pitching Changes

- Each team’s Pitching section includes an available-pitcher/reliever dropdown.
- Every pitcher retains number, name, throwing hand, record, ERA, and strikeouts.
- Pitchers already used are removed from the available-reliever list.
- Pitch history, batters faced, hits, walks, strikeouts, and other totals remain separate for each pitcher.

## Individual Error Assignment

- A compact **Record Error** button opens an error-assignment panel for the current plate appearance.
- The fielder dropdown lists only players currently on defense.
- Error types include fielding, throwing, catching, dropped fly, missed catch, and other.
- A second error can be assigned to the same play, with optional details.
- Reached on Error requires a defensive player assignment before it can be saved.
- Standard notation such as `E6` is generated automatically. Combined plays can display notation such as `1B/E9`.
- Individual fielder totals and team error totals are maintained and rebuilt correctly after Undo Last Play.

## Display and Control Refinements

- The schedule button is labeled **Reset Card / Refresh Schedule List**.
- A home run displays only **HR** in every at-bat box, while the underlying run and RBI statistics remain accurate.
- Undo Last Play, Change Half-Inning, and Reset Entire Game remain beneath the scoring instructions.
- The consolidated live matchup area continues to show current batter and pitcher data, prior batter appearances, and live pitcher statistics.

## Preserved Features

- MLB ABS challenge tracking
- Permanent pitch history and pitcher totals
- Automatic walks and swinging/looking strikeouts
- Dropped-third-strike correction
- Full game-state undo and rebuild
- MLB/MiLB schedule and game-data lookup
- Sharpened 300-DPI classic one-page PDF
- Home-team MLB color palettes
- Excel, PDF, saved-game, and pitch-log CSV exports
- Optional traditional guides on blank PDFs

Version 24 remains the approved production baseline until Version 27 is explicitly approved. Version 27.2 is the current testing build.



## Version 27.2

- Shows the starting pitcher first and adds each selected reliever beneath that starter only when used.
- Loads every available active-roster pitcher up to the app's 15-pitcher capacity internally.
- Keeps the probable/current pitcher identified separately.
- Uses one compact Add Pitcher dropdown, sorted by last name and then first name, for all unused eligible pitchers.
- Shows full pitcher information: uniform number, name, throwing hand, record, ERA, and strikeouts.
- Removes pitchers from availability after they enter while preserving their game history and statistics.
- PDF and Excel pitching rows now list only pitchers who actually entered the game, in exact first-appearance order.
- Unused roster pitchers no longer fill blank scorecard pitching lines.
- Each exported pitcher retains uniform number, name, throwing hand, record, ERA, and strikeouts.

## Version 27.1

- Corrects online bullpen and reliever loading by using each team’s active roster.
- Loads the full active-roster pitching pool internally without displaying the entire bullpen at once.
- Populates pitching-change dropdowns with all unused active pitchers and relievers.
- Keeps PDF and Excel pitching sections limited to the starter and up to five pitchers who appeared.

## Version 27

- Ends regulation games correctly after the top or bottom of the ninth and immediately on a home-team walk-off.
- Uses the MLB regular-season automatic-runner rule in extra innings: the batting-order player immediately preceding the leadoff hitter begins each half-inning on second, with a pinch-runner available through the existing substitution workflow.
- Provides a postseason/traditional extra-inning option with empty bases.
- Preserves innings 1–10 on PDF page 1 and automatically adds a continuation scorecard for innings 11–20 on page 2.
- Save Game File, Download Excel, and Download PDF retain all on-screen data and then offer a deliberate, double-confirmed Clear Card option.

## Continuous autosave and recovery

Version 27.2 now continuously saves the live game in the browser. Every field edit, pitch, completed play, substitution, pitcher change, ABS challenge, error, Key Play, and note is written to a current recovery snapshot, with the immediately previous snapshot retained as a backup. The app restores the current game automatically after refresh, browser restart, or reopening the installed app.

The Settings section includes **Save Now** and **Restore Previous Autosave**. Save Game File remains the portable backup for moving a game to another device. Explicit reset and blank-card commands are the only actions that clear browser recovery data.

### Version 27.2 iPhone roster persistence
Team names, lineup and bench players, and pitchers now have a protected field cache and an independent browser-storage roster mirror. This prevents iPhone Safari or the installed web app from replacing restored roster fields with blanks while retaining scoring data. Intentional edits and resets still work normally.
