# Guariglia Baseball Scorecard Builder - Version 10

This version builds on the MLB and MiLB schedule-selection app and adds direct one-page PDF creation.

## Main workflow

1. Choose a current or future date.
2. Choose MLB, all professional baseball, all MiLB, or a specific MiLB level.
3. Select one scheduled game from the dropdown.
4. Fill the scorecard with the available online game information.
5. Review and edit every field.
6. Download the finished scorecard as Excel or PDF.

Manual entry remains available for college, high school, youth, historic, exhibition, or custom games.

## Download options

### Excel

The Excel option writes the reviewed information into the real blank scorecard workbook. The workbook preserves the grid, at-bat counters, replay area, pitching sections, notes area, and print layout.

The built-in workbook is now configured for:

- US Letter paper: 8.5 x 11 inches
- Portrait orientation
- One-page fit
- 0.25-inch top, bottom, left, and right margins

### PDF

The PDF option creates the scorecard directly in the browser. It uses the actual blank scorecard as the page background and places the reviewed game information into the corresponding locations.

The generated PDF is:

- Exactly one page
- US Letter size: 8.5 x 11 inches
- Portrait orientation
- Designed with 0.25-inch outer margins
- Ready to print without opening Excel

If the form is blank, the PDF button downloads a blank printable scorecard.

## Online information

Depending on what has been published for the selected game, the app may fill:

- Away and home teams
- Team records
- Date, time, and venue
- Team game numbers
- Probable or used pitchers and available statistics
- Announced batting orders and available batting statistics
- Weather
- Umpire assignments
- Television, streaming, radio, or audio information

MiLB availability varies by level, club, ballpark, and how close the game is to first pitch. Missing information stays blank and can be entered manually.

## Running locally

Open `index.html` in a modern browser. Manual entry, Excel export, PDF export, draft saving, and blank scorecard downloads work locally.

Some browsers restrict direct online schedule requests from local files. Netlify deployment is recommended for dependable MLB and MiLB lookup.

## Netlify deployment

The folder includes `netlify.toml` and `netlify/functions/mlb.js`.

1. Place the entire folder in a Git repository.
2. Import the repository into Netlify.
3. Netlify publishes the site and builds the included data-proxy function.
4. The app uses the same-origin `/api/mlb` route for schedule and game information.

No API key is required for the included lookup.

## Important files

- `index.html` - interface and workflow
- `styles.css` - responsive styling
- `app.js` - form, Excel, PDF, draft, and workflow logic
- `mlb_data.js` - MLB and MiLB schedule and game-data mapping
- `template_data.js` - embedded blank Excel scorecard
- `pdf_background_data.js` - embedded one-page scorecard background used for PDF generation
- `vendor/jszip.min.js` - workbook export support
- `templates/Scorecard_20260615_blank_template.xlsx` - printable blank workbook
- `netlify/functions/mlb.js` - online data proxy
- `ONLINE_LOOKUP_GUIDE.md` - lookup details
- `TEMPLATE_MAPPING_GUIDE.md` - Excel and PDF placement details

## Limitations

- Lineups are available only after they are announced.
- Probable pitchers, weather, umpires, and broadcasts may not be available for every game.
- Every imported field should be reviewed before downloading.
- An uploaded replacement Excel template is used for Excel export. PDF export continues to use the built-in one-page scorecard background so it can remain reliable in the browser.

## Version 10 branding update

- Replaced the prior blue interface with a coordinated burnt orange, deep brown, and golden yellow palette.
- Standardized the typography scale, field heights, button sizes, card padding, section spacing, and navigation spacing throughout the application.
- Improved contrast, focus states, responsive spacing, and visual hierarchy without changing the schedule lookup, manual entry, Excel export, or PDF export workflows.
- Added the uploaded Guariglia crest as the company logo in the app header and branded footer.
- Updated the visible app title to “Guariglia Baseball Scorecard Builder.”
- Preserved all Version 9 functionality, styling, schedule lookup, manual entry, Excel export, and one-page PDF export.
