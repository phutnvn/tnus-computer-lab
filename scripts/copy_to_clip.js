const fs = require('fs');
const { spawn } = require('child_process');

const target = process.argv[2] || 'html';

let filePath = 'dist/google-apps-script/Index.html';
if (target.toLowerCase() === 'gs' || target.toLowerCase() === 'code' || target.toLowerCase() === 'ma') {
  filePath = 'dist/google-apps-script/Code.gs';
}

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

if (process.platform === 'win32') {
  const clip = spawn('clip');
  clip.stdin.write(content, 'utf8');
  clip.stdin.end();
  console.log(`📋 ĐÃ COPY NỘI DUNG TỆP [${filePath}] VÀO CLIPBOARD THÀNH CÔNG!`);
} else {
  console.log(`Đã đọc tệp [${filePath}] (${content.length} ký tự).`);
}
