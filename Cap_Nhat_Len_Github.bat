@echo off
chcp 65001 > nul
title ĐỒNG BỘ & CẬP NHẬT DỰ ÁN LÊN GITHUB
cd /d "%~dp0"

echo ============================================================
echo   TỰ ĐỘNG CẬP NHẬT HỆ THỐNG PHÒNG MÁY TÍNH TNUS LÊN GITHUB
echo   Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)
echo   Phụ trách: ThS. Trịnh Minh Phú (0975.090.666)
echo ============================================================
echo.

set /p commit_msg="Nhập mô tả nội dung cập nhật (hoặc bấm Enter để dùng mặc định): "
if "%commit_msg%"=="" set commit_msg=Cap nhat he thong phong may TNUS ngay %date%

echo.
echo [1/3] Đang ghi nhận các tệp thay đổi...
git add .

echo [2/3] Đang đóng gói phiên bản cập nhật...
git commit -m "%commit_msg%"

echo [3/3] Đang đẩy mã nguồn mới lên GitHub...
git push origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ============================================================
    echo ✅ ĐÃ CẬP NHẬT LÊN GITHUB THÀNH CÔNG!
    echo 🌐 Trang web GitHub Pages sẽ tự động làm mới sau khoảng 30 - 60 giây.
    echo ============================================================
) else (
    echo ⚠️ Có lỗi khi đẩy lên GitHub. Vui lòng kiểm tra kết nối mạng hoặc liên kết GitHub Repository.
)

pause
