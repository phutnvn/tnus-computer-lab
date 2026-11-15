@echo off
chcp 65001 > nul
title HỆ THỐNG MÔ PHỎNG & QUẢN LÝ PHÒNG MÁY TÍNH TNUS
cd /d "%~dp0"

echo ============================================================
echo   HỆ THỐNG MÔ PHỎNG & QUẢN LÝ PHÒNG MÁY TÍNH TNUS
echo   Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)
echo   Phụ trách: ThS. Trịnh Minh Phú (SĐT: 0975.090.666)
echo ============================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [1/2] Đã phát hiện Node.js, đang khởi động máy chủ Local tốc độ cao...
    node server.js
) else (
    echo [1/2] Đang mở trực tiếp giao diện trên trình duyệt của bạn...
    start "" "%~dp0index.html"
    echo.
    echo ✅ ĐÃ MỞ GIAO DIỆN HỆ THỐNG THÀNH CÔNG!
    pause
)
