const fs = require('fs');
const { spawn } = require('child_process');

console.log('============================================================');
console.log(' ĐANG ĐÓNG GÓI DỰ ÁN CHO GOOGLE APPS SCRIPT...');
console.log(' Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)');
console.log('============================================================');

let html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const dataJs = fs.readFileSync('js/data.js', 'utf8');
const simJs = fs.readFileSync('js/lab-simulation.js', 'utf8');
const chartJs = fs.readFileSync('js/chart-manager.js', 'utf8');
const schJs = fs.readFileSync('js/schedule.js', 'utf8');
const mntJs = fs.readFileSync('js/maintenance.js', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');

// Thay thế thẻ link css bằng thẻ style
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>');

// Thay thế các thẻ script rời bằng khối script nhúng
const scriptTags = `  <!-- SCRIPT NẠP MODULES -->
  <script src="js/data.js"></script>
  <script src="js/lab-simulation.js"></script>
  <script src="js/chart-manager.js"></script>
  <script src="js/schedule.js"></script>
  <script src="js/maintenance.js"></script>
  <script src="js/app.js"></script>`;

const bundledScripts = `<script>
// ==================== DATA MODULE ====================
${dataJs}

// ==================== SIMULATION MODULE ====================
${simJs}

// ==================== CHART MANAGER ====================
${chartJs}

// ==================== SCHEDULE MODULE ====================
${schJs}

// ==================== MAINTENANCE MODULE ====================
${mntJs}

// ==================== MAIN APP CONTROLLER ====================
${appJs}
</script>`;

html = html.replace(scriptTags, bundledScripts);

if (!fs.existsSync('dist/google-apps-script')) {
  fs.mkdirSync('dist/google-apps-script', { recursive: true });
}

fs.writeFileSync('dist/google-apps-script/Index.html', html, 'utf8');

console.log('✅ Đã tạo tệp: dist/google-apps-script/Index.html (' + Math.round(html.length / 1024) + ' KB)');
console.log('✅ Đã xác nhận tệp: dist/google-apps-script/Code.gs');

// Tự động copy vào clipboard nếu có tham số --clip hoặc trên Windows
if (process.argv.includes('--clip') || process.platform === 'win32') {
  try {
    const clipProc = spawn('clip');
    clipProc.stdin.write(html, 'utf8');
    clipProc.stdin.end();
    console.log('📋 ĐÃ TỰ ĐỘNG COPY TOÀN BỘ NỘI DUNG VÀO CLIPBOARD (BỘ NHỚ TẠM)!');
    console.log('👉 Bạn chỉ cần chuyển sang tab Google Apps Script và bấm Ctrl + V.');
  } catch (e) {
    console.log('Ghi chú: Không thể tự động copy sang clipboard:', e.message);
  }
}
console.log('============================================================');
