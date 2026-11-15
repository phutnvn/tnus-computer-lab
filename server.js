/**
 * MÁY CHỦ WEB CỤC BỘ SIÊU NHẸ (LIGHTWEIGHT LOCAL SERVER)
 * Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)
 * Phụ trách: ThS. Trịnh Minh Phú (SĐT: 0975.090.666)
 *
 * Chạy độc lập hoàn toàn bằng Node.js core (không cần cài thêm bất kỳ thư viện nào)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  // Chuẩn hóa đường dẫn URL
  let parsedUrl = req.url.split('?')[0].split('#')[0];
  if (parsedUrl === '/') parsedUrl = '/index.html';

  // Chống Directory Traversal
  const safeSuffix = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safeSuffix);

  // Kiểm tra tồn tại của tệp
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`
        <div style="font-family:sans-serif;padding:40px;text-align:center;">
          <h2 style="color:#e11d48;">404 - Không tìm thấy tệp</h2>
          <p>Đường dẫn yêu cầu: <code>${parsedUrl}</code></p>
          <a href="/" style="display:inline-block;margin-top:15px;padding:8px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">Về trang chính</a>
        </div>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('============================================================');
  console.log('   HỆ THỐNG MÔ PHỎNG & QUẢN LÝ PHÒNG MÁY TÍNH TNUS');
  console.log('   Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)');
  console.log('   Phụ trách: ThS. Trịnh Minh Phú (SĐT: 0975.090.666)');
  console.log('============================================================');
  console.log(`🚀 Máy chủ Local đang hoạt động tại: ${url}`);
  console.log('👉 Đang tự động mở trình duyệt...');
  console.log('📌 Nhấn Ctrl + C để dừng máy chủ.');
  console.log('============================================================');

  // Tự động mở trình duyệt mặc định trên Windows
  if (process.platform === 'win32') {
    exec(`start ${url}`);
  } else if (process.platform === 'darwin') {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Cổng ${PORT} đang bận, tự động chuyển sang cổng ${Number(PORT) + 1}...`);
    server.listen(Number(PORT) + 1);
  } else {
    console.error('Lỗi máy chủ:', e.message);
  }
});
