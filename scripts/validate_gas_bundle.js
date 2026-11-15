const fs = require('fs');
const html = fs.readFileSync('dist/google-apps-script/Index.html', 'utf8');

// Check script tags balance
const scriptOpen = (html.match(/<script/gi) || []).length;
const scriptClose = (html.match(/<\/script>/gi) || []).length;
console.log('Script tags:', scriptOpen, 'open,', scriptClose, 'close');

// Check style tags balance
const styleOpen = (html.match(/<style/gi) || []).length;
const styleClose = (html.match(/<\/style>/gi) || []).length;
console.log('Style tags:', styleOpen, 'open,', styleClose, 'close');

// Extract all scripts and validate syntax
const scriptRegex = /<script(\b[^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
let errors = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptIdx++;
  const attrs = match[1];
  const content = match[2];
  if (attrs.includes('src=')) {
    console.log('Script ' + scriptIdx + ': External CDN script (' + attrs.trim() + ')');
    continue;
  }
  try {
    new Function(content);
    console.log('Script ' + scriptIdx + ': Inline JS valid (' + Math.round(content.length / 1024) + ' KB)');
  } catch (err) {
    console.error('❌ Script ' + scriptIdx + ' syntax error:', err.message);
    errors++;
  }
}
if (errors === 0) {
  console.log('✅ ALL INLINE SCRIPTS IN Index.html ARE 100% SYNTACTICALLY VALID!');
} else {
  console.error('❌ Found ' + errors + ' script errors!');
  process.exit(1);
}
