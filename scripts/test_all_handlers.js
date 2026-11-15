const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const onclickRegex = /onclick=["']([^"']+)["']/g;
let m;
const onclicks = new Set();
while ((m = onclickRegex.exec(html)) !== null) {
  onclicks.add(m[1].trim());
}

console.log('Total unique inline onclick handlers found in index.html:', onclicks.size);
Array.from(onclicks).forEach(fn => console.log('  -', fn));
