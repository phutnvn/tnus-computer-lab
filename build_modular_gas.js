const fs = require('fs');
const path = require('path');

const outDir = 'dist/google-apps-script-modular';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('============================================================');
console.log(' ĐANG TẠO GÓI GOOGLE APPS SCRIPT CHUẨN MODULAR (ĐA TỆP)...');
console.log(' Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)');
console.log('============================================================');

// 1. Tạo tệp Code.gs
const codeGsSource = fs.readFileSync('dist/google-apps-script/Code.gs', 'utf8');
let modularCodeGs = codeGsSource;

// Thay thế doGet sang template.evaluate() và thêm include(filename)
const modularDoGet = `/**
 * Xử lý HTTP GET: Nạp giao diện Web App dạng Templated HTML chuẩn Modular
 */
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.setup === 'true') {
      var setupRes = setupGoogleSheets();
      return ContentService.createTextOutput(JSON.stringify(setupRes)).setMimeType(ContentService.MimeType.JSON);
    }

    var template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
      .setTitle('KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS) - Hệ Thống Mô Phỏng & Quản Lý Phòng Máy Tính')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (globalErr) {
    return HtmlService.createHtmlOutput('<div style=\"font-family:sans-serif;padding:30px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:20px;\">' +
      '<h2>⚠️ Thông báo nạp Web App TNUS</h2>' +
      '<p><strong>Chi tiết:</strong> ' + globalErr.message + '</p>' +
      '</div>');
  }
}

/**
 * Hàm nhúng các tệp module (CSS, Data, Simulation, Schedule...) vào Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}`;

modularCodeGs = modularCodeGs.replace(/function doGet\(e\) \{[\s\S]*?function doPost\(e\)/, modularDoGet + '\n\nfunction doPost(e)');
fs.writeFileSync(path.join(outDir, 'Code.gs'), modularCodeGs, 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Code.gs');

// 2. Tạo Index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n<?!= include(\'Css\'); ?>\n</style>');

const scriptTags = `  <!-- SCRIPT NẠP MODULES -->
  <script src="js/data.js"></script>
  <script src="js/lab-simulation.js"></script>
  <script src="js/chart-manager.js"></script>
  <script src="js/schedule.js"></script>
  <script src="js/maintenance.js"></script>
  <script src="js/app.js"></script>`;

const modularScripts = `<script>
<?!= include('Data'); ?>
<?!= include('Simulation'); ?>
<?!= include('Charts'); ?>
<?!= include('Schedule'); ?>
<?!= include('Maintenance'); ?>
<?!= include('App'); ?>
</script>`;

indexHtml = indexHtml.replace(scriptTags, modularScripts);
fs.writeFileSync(path.join(outDir, 'Index.html'), indexHtml, 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Index.html');

// 3. Tạo các tệp module nhỏ độc lập
fs.writeFileSync(path.join(outDir, 'Css.html'), fs.readFileSync('css/style.css', 'utf8'), 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Css.html');

fs.writeFileSync(path.join(outDir, 'Data.html'), fs.readFileSync('js/data.js', 'utf8'), 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Data.html');

fs.writeFileSync(path.join(outDir, 'Simulation.html'), fs.readFileSync('js/lab-simulation.js', 'utf8'), 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Simulation.html');

fs.writeFileSync(path.join(outDir, 'Charts.html'), fs.readFileSync('js/chart-manager.js', 'utf8'), 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Charts.html');

fs.writeFileSync(path.join(outDir, 'Schedule.html'), fs.readFileSync('js/schedule.js', 'utf8'), 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Schedule.html');

fs.writeFileSync(path.join(outDir, 'Maintenance.html'), fs.readFileSync('js/maintenance.js', 'utf8'), 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/Maintenance.html');

fs.writeFileSync(path.join(outDir, 'App.html'), fs.readFileSync('js/app.js', 'utf8'), 'utf8');
console.log('✅ Đã tạo: dist/google-apps-script-modular/App.html');

console.log('============================================================');
console.log('✅ HOÀN TẤT ĐÓNG GÓI MODULAR 8 TỆP ĐỘC LẬP!');
console.log('============================================================');
