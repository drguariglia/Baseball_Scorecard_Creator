const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

assert.doesNotMatch(app, /loadAutosave\s*\(/, "startup must not restore an autosaved game");
assert.doesNotMatch(app, /localStorage\.setItem\s*\(/, "session changes must not persist automatically across launches");
assert.match(app, /initializeBlankStartup\(\)/, "startup must explicitly initialize a blank game");
assert.match(app, /clearPersistentGameData\(\)/, "legacy stored games must be removed");
assert.match(app, /setFieldsFromData\(\{\}\)/, "all scorecard fields must be blanked");
assert.match(app, /scoring=initialScoring\(\)/, "scoring state must return to zero");
assert.match(app, /event\.persisted[\s\S]*initializeBlankStartup\(\)/, "back-forward cache restoration must be cleared");
assert.match(app, /Reset the entire game\?/, "reset confirmation must describe a complete reset");
assert.match(html, /Reset Entire Game/, "reset button must describe the complete reset");
assert.match(html, /app\.js\?v=27.2-quick-code-k-font/, "app JavaScript must be cache-busted");
assert.match(worker, /guariglia-scorecard-v27-2-quick-code-k-font/, "service-worker cache must be bumped");

console.log("startup and reset tests passed");
