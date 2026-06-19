# Online Lookup Technical Guide

## Schedule selection

The start screen uses three controls:

1. Game date
2. League or level
3. Scheduled game

Supported schedule choices include:

- MLB
- MLB plus all affiliated MiLB
- All affiliated MiLB
- Triple-A
- Double-A
- High-A
- Single-A
- Rookie

The game dropdown is refreshed whenever the date or level changes. Combined schedules are grouped by baseball level.

## Lookup sequence

1. Request the schedule for the selected date and sport level or levels.
2. Display each scheduled matchup in the game dropdown.
3. Store the official game identifier and level with each option.
4. Load the detailed game feed after the user chooses a game.
5. Determine home and away automatically.
6. Map available schedule, lineup, pitcher, weather, umpire, and broadcast information into the editable form.
7. Leave unpublished fields blank.

## Browser and Netlify access

The browser first calls `/api/mlb` when the app is hosted. Netlify redirects that request to `netlify/functions/mlb.js`, which relays permitted MLB-hosted data requests.

When the app is opened directly as a local file, it attempts a direct request. Browser cross-origin restrictions can block those requests, so Netlify deployment is recommended for consistent schedule loading.

## Manual fallback

Online data never bypasses the editable form. Imported information appears in the same fields used for manual entry and can be corrected before Excel or PDF creation.
