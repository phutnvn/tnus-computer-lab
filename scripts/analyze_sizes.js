const fs = require('fs');

const files = [
  'js/data.js',
  'js/lab-simulation.js',
  'js/chart-manager.js',
  'js/schedule.js',
  'js/maintenance.js',
  'js/app.js',
  'css/style.css',
  'index.html'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`${f.padEnd(25)}: ${(content.length / 1024).toFixed(1)} KB | ${content.split('\n').length} lines`);
});
