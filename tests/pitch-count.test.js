const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

assert.match(html, /id="ballCount"/, 'live ball count must be visible');
assert.match(html, /id="strikeCount"/, 'live strike count must be visible');
assert.match(html, /id="ballBtn"[\s\S]*<kbd>B<\/kbd>/, 'phone and keyboard ball control must be present');
assert.match(html, /id="strikeBtn"[\s\S]*<kbd>S<\/kbd>/, 'phone and keyboard strike control must be present');
assert.match(html, /id="foulBtn"[\s\S]*<kbd>F<\/kbd>/, 'foul control must be present');
assert.match(html, /id="inPlayBtn"[\s\S]*<kbd>I<\/kbd>/, 'in-play control must be present');
assert.match(html, /id="strikeoutChooser"/, 'strike-three result chooser must be present');
assert.match(html, /data-terminal-outcome="K"/, 'swinging strikeout option must be present');
assert.match(html, /data-terminal-outcome="KL"/, 'looking strikeout option must be present');
assert.match(html, /data-terminal-outcome="D3K"/, 'dropped-third-strike option must be present');
assert.match(app, /if\(count\.balls>=4\)[\s\S]*recordQuickOutcome\("BB",true\)/, 'ball four must record a walk');
assert.match(app, /if\(count\.strikes>=3\)[\s\S]*count\.pendingStrikeout=true/, 'strike three must activate the result chooser');
assert.match(app, /pitchCount=existing\?\.pitchCount\|\|countSnapshot\(\)/, 'completed plays must retain the final count');
assert.match(app, /pitchSequence:/, 'completed plays must retain the pitch sequence');
assert.match(app, /document\.addEventListener\("keydown",handleScoringKeyboard\)/, 'keyboard shortcuts must be enabled');
assert.match(app, /const pitchKeys=\{b:"ball",s:"strike",f:"foul",i:"inplay"\}/, 'pitch keyboard shortcuts must be mapped');
assert.match(app, /const resultKeys=\{[\s\S]*"1":"1B"[\s\S]*w:"BB"[\s\S]*k:"K"/, 'quick result keyboard shortcuts must be mapped');
assert.match(css, /\.pitch-button-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/, 'desktop pitch controls must use four columns');
assert.match(css, /@media \(max-width:760px\)[\s\S]*\.pitch-button-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'phone pitch controls must use two columns');
assert.match(html, /app\.js\?v=21/, 'Version 21 app JavaScript must be cache-busted');

console.log('pitch count and quick scoring tests passed');
