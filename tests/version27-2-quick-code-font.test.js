const assert=require('assert');
const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');

assert.match(app,/class="quick-code-symbol\$\{mirrored\?" is-mirrored-k":""\}"/,'all Quick Codes must use the shared quick-code-symbol element');
assert.match(app,/escapeHtml\(mirrored\?"K":text\)/,'looking strikeout must use the normal K glyph before mirroring');
assert(!app.includes('code:"ꓘ"'),'a special Unicode reverse-K glyph must not be used');
assert.match(css,/\.quick-code-symbol\{[^}]*font-family:Arial,Helvetica,sans-serif[^}]*font-size:1rem[^}]*font-weight:800[^}]*line-height:1/,'all Quick Code symbols must share an explicit font treatment');
assert.match(css,/\.quick-code-symbol\.is-mirrored-k\{transform:scaleX\(-1\)/,'only the looking-K symbol should be mirrored');
assert(html.includes('styles.css?v=27.2-mobile-roster-save'),'HTML must request the corrected stylesheet');
assert(html.includes('app.js?v=27.2-mobile-roster-save'),'HTML must request the corrected app script');
assert(sw.includes('guariglia-scorecard-v27-2-mobile-roster-save'),'service-worker cache must be refreshed');
console.log('Version 27.2 Quick Code font tests passed.');
