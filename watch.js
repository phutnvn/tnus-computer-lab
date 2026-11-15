const fs = require('fs');
const { execSync } = require('child_process');

console.log('============================================================');
console.log(' CHẾ ĐỘ TỰ ĐỘNG THEO DÕI & ĐÓNG GÓI (LIVE WATCHER)');
console.log(' Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)');
console.log(' Đang giám sát thay đổi tại index.html, css/ và js/...');
console.log(' Nhấn Ctrl + C để dừng.');
console.log('============================================================');

let timer = null;
function triggerBuild(filename) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`\n[${new Date().toLocaleTimeString()}] Phát hiện thay đổi tại ${filename}. Đang đóng gói lại...`);
    try {
      execSync('node build_gas.js', { stdio: 'inherit' });
    } catch (e) {
      console.error('Lỗi khi đóng gói:', e.message);
    }
  }, 300);
}

// Giám sát index.html
fs.watchFile('index.html', { interval: 500 }, () => triggerBuild('index.html'));

// Giám sát thư mục css
if (fs.existsSync('css')) {
  fs.watch('css', (event, filename) => triggerBuild('css/' + filename));
}

// Giám sát thư mục js
if (fs.existsSync('js')) {
  fs.watch('js', (event, filename) => triggerBuild('js/' + filename));
}
