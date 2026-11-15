@echo off
title TNUS - Chay Thu Nghiem Mo Phong Phong May Tinh
color 0b

echo ====================================================================
echo  HE THONG MO PHONG VA QUAN LY PHONG MAY TINH
echo  Khoa Toan - Tin - Truong Dai hoc Khoa hoc (TNUS)
echo ====================================================================
echo.
echo [1/2] Dang khoi dong Web Server cuc bo tai cong 8080...
start "" "http://localhost:8080"
echo [2/2] Da tu dong mo trinh duyet: http://localhost:8080
echo.
echo --------------------------------------------------------------------
echo  Meo: Nhan Ctrl + C tai cua so nay de dung Web Server khi xong.
echo --------------------------------------------------------------------
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    python -m http.server 8080
) else (
    where npx >nul 2>nul
    if %errorlevel% equ 0 (
        npx serve -l 8080 .
    ) else (
        start "" "index.html"
        pause
    )
)
