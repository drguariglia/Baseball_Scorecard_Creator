const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const netlify = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const fn = fs.readFileSync(path.join(root, 'netlify/functions/mlb.mts'), 'utf8');

assert.match(html, /<script src="baseball-data\.js\?v=24"><\/script>/, 'index.html must load baseball-data.js');
assert.ok(html.indexOf('baseball-data.js?v=24') < html.indexOf('app.js?v=24'), 'baseball-data.js must load before app.js');
assert.match(html, /id="connectionBadge"/, 'connection status badge must be present');
assert.match(worker, /guariglia-scorecard-v24-sharp-pdf/, 'service worker cache must be bumped');
assert.match(worker, /"\/baseball-data\.js\?v=24"/, 'service worker must cache the connection module');
assert.match(netlify, /from = "\/api\/mlb"[\s\S]*to = "\/\.netlify\/functions\/mlb"/, 'Netlify route must forward /api/mlb');
assert.match(fn, /path: "\/api\/mlb"/, 'serverless function must expose /api/mlb');
assert.match(fn, /action === "schedule"/, 'serverless function must support schedule lookup');
assert.match(fn, /action === "game"/, 'serverless function must support selected-game lookup');

console.log('index and connection wiring tests passed');
