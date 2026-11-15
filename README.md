# HỆ THỐNG MÔ PHỎNG & QUẢN LÝ PHÒNG MÁY TÍNH TNUS
### KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)

> **Cán bộ phụ trách hệ thống:** ThS. Trịnh Minh Phú  
> **Điện thoại / Zalo:** `0975.090.666` • **Email:** `phutm@tnus.edu.vn`  
> **Địa điểm:** Tầng 5, Nhà A1 - Trường Đại học Khoa học (TNUS)

---

## 📌 1. TỔNG QUAN HỆ THỐNG

Hệ thống Web App chuyên nghiệp phục vụ công tác quản lý, giảng dạy thực hành và bảo trì kỹ thuật cho **4 phòng máy tính (Tổng cộng 104 máy trạm đồng bộ)** thuộc Khoa Toán - Tin:

| Phòng máy | Mã phòng | Số máy | Cấu hình phần cứng đồng bộ | Cán bộ phụ trách |
| :--- | :---: | :---: | :--- | :--- |
| **Phòng Máy 1** | **A1-503** | **30 máy** | FPT Elead, Intel Core i5-14400, RAM 16GB, SSD 256GB NVMe | ThS. Trịnh Minh Phú (0975.090.666) |
| **Phòng Máy 2** | **A1-504** | **26 máy** | HP ProDesk 400 G7, Intel Core i5-10500, RAM 16GB, SSD 512GB | ThS. Trịnh Minh Phú (0975.090.666) |
| **Phòng Máy 3** | **A1-505** | **24 máy** | Dell OptiPlex 7090, Intel Core i7-11700, RAM 32GB, SSD 512GB NVMe | ThS. Trịnh Minh Phú (0975.090.666) |
| **Phòng Máy 4** | **A1-506** | **24 máy** | Lenovo ThinkCentre M70s, Intel Core i5-12400, RAM 16GB, SSD 512GB | ThS. Trịnh Minh Phú (0975.090.666) |

---

## 🚀 2. TÍNH NĂNG NỔI BẬT

### 🥽 1. Sơ Đồ Mô Phỏng 2D Trực Quan (Interactive 2D Digital Twin)
* Mô phỏng chính xác mặt bằng phòng máy theo tỷ lệ thực (Bàn giáo viên, các dãy máy học viên, Switch mạng, Máy chiếu, Điều hòa).
* Hiển thị trạng thái máy theo 5 mã màu: **Tốt (Xanh lá)**, **Đang sử dụng (Xanh dương)**, **Cần kiểm tra (Vàng)**, **Hỏng hóc (Đỏ)**, **Tắt nguồn (Xám)**.
* Tính năng tương tác: Phóng to (Zoom), Kéo mặt bằng (Pan), Tìm kiếm vị trí máy, Lọc trạng thái, Điều khiển Bật/Tắt nguồn từ xa (Wake-on-LAN), Ping kiểm tra mạng và Mô phỏng màn hình máy trạm.

### 🖥️ 2. Quản Lý Danh Mục 104 Thiết Bị & In Tem QR Code
* Bảng dữ liệu tra cứu đầy đủ: Mã máy, Tên máy, Địa chỉ IP, Địa chỉ MAC, Cấu hình chi tiết CPU/RAM/Ổ cứng/Màn hình, Ngày bảo dưỡng gần nhất.
* Xuất file Excel chuẩn và Nhập cập nhật thông số hàng loạt từ file Excel.
* Tự động tạo và in tem tài sản có mã QR Code theo chuẩn kiểm kê tài sản nhà trường.

### 📅 3. Lịch Thực Hành & Tự Động Vào Ca (Auto Shift Engine)
* Quản lý thời khóa biểu các ca học: Sáng (Ca 1-2, Ca 3-4), Chiều (Ca 5-6, Ca 7-8), Tối (Ca 9-10).
* Thuật toán phát hiện xung đột phòng học hoặc trùng lịch giảng viên.
* **Cơ chế tự động hóa theo giờ học:** Tự động kích hoạt trạng thái "Đang diễn ra" và phát lệnh bật máy Wake-on-LAN khi đến giờ vào ca; tự động trả phòng và giải phóng thiết bị khi hết giờ.

### 🔧 4. Tiếp Nhận & Xử Lý Sự Cố Chuẩn ITIL
* Quy trình xử lý phiếu sự cố: *Tiếp nhận báo hỏng -> Phân công KTV -> Xử lý & Thay thế linh kiện -> Nghiệm thu hoàn tất*.
* Khi sự cố được nghiệm thu xong, hệ thống tự động đổi trạng thái máy trên Sơ đồ 2D từ "Hỏng" về "Tốt" ngay lập tức.
* In Phiếu báo hỏng và Biên bản bàn giao sửa chữa theo mẫu chuẩn.

### 🔐 5. Hệ Thống Phân Quyền RBAC 3.0 Enterprise
Phân cấp độc lập 6 vai trò người dùng và 7 quyền thao tác trên 6 phân hệ:
* **Super Admin (ThS. Trịnh Minh Phú):** Toàn quyền hệ thống, quản lý tài khoản và phân quyền cao nhất.
* **Admin (KS. Trần Văn Hải):** Quản lý cấu hình, người dùng và dữ liệu.
* **Quản lý phòng máy (ThS. Lê Hoàng Nam):** Quản lý thiết bị, lịch bảo dưỡng và báo cáo.
* **Giảng viên (ThS. Nguyễn Văn Toàn):** Xem thời khóa biểu, vào ca dạy và đăng ký phòng.
* **Kỹ thuật viên (KTV. Chu Tuấn Hưng):** Tiếp nhận sự cố, điều khiển nguồn và thay thế linh kiện.
* **Sinh viên / Khách:** Tra cứu thời khóa biểu và sơ đồ máy công khai (chế độ chỉ đọc).

Bảo mật an toàn: Mật khẩu được băm SHA-256 có Salt (`TNUS_KHOA_TOAN_TIN_2026`), tự động khóa tài khoản sau 5 lần nhập sai, ghi nhận Nhật ký kiểm toán (Audit Trail).

---

## 💻 3. HƯỚNG DẪN CHẠY TRÊN MÁY TÍNH (LOCAL)

### Cách 1: Chạy 1-Click (Khuyên dùng)
* Nhấp đúp chuột vào tệp: **`Chay_He_Thong.bat`**
* Hệ thống sẽ tự động bật máy chủ cục bộ và mở ứng dụng trên trình duyệt của bạn tại địa chỉ: `http://localhost:3000`.

### Cách 2: Mở trực tiếp (Không cần cài đặt gì thêm)
* Nhấp đúp chuột trực tiếp vào tệp: **`index.html`** để mở trên Google Chrome, Microsoft Edge hoặc Cốc Cốc.

---

## 🌐 4. HƯỚNG DẪN TRIỂN KHAI LÊN GITHUB PAGES

Dự án đã được cấu hình sẵn sàng 100% để triển khai lên **GitHub Pages**:

### Bước 1: Khởi tạo Git & Commit mã nguồn
Mở terminal (PowerShell hoặc Git Bash) tại thư mục dự án:
```bash
git init -b main
git add .
git commit -m "Khoi tao he thong mo phong phong may tinh TNUS"
```

### Bước 2: Tạo Repository trên GitHub và đẩy mã nguồn lên
1. Truy cập [github.com/new](https://github.com/new) và tạo một Repository mới (ví dụ đặt tên: `tnus-computer-lab`).
2. Chạy lệnh liên kết và đẩy code lên:
```bash
git remote add origin https://github.com/<tai-khoan-cua-ban>/tnus-computer-lab.git
git push -u origin main
```

### Bước 3: Kích hoạt GitHub Pages (Tự động)
1. Vào mục **Settings** của Repository trên GitHub -> chọn **Pages** (ở cột bên trái).
2. Tại mục **Build and deployment** -> **Source**:
   - Chọn **Deploy from a branch** -> Nhánh **`main`** -> Thư mục **`/ (root)`** -> Bấm **Save**.
   *(Hoặc chọn **GitHub Actions**, quy trình `.github/workflows/deploy.yml` đã được tạo sẵn sẽ tự động triển khai).*
3. Sau khoảng 1-2 phút, trang web sẽ hoạt động trực tuyến tại địa chỉ:
   ```text
   https://<tai-khoan-cua-ban>.github.io/tnus-computer-lab/
   ```

---

## 🔑 5. DANH SÁCH TÀI KHOẢN MẪU KIỂM THỬ

*Mật khẩu thử nghiệm mặc định cho tất cả tài khoản:* **`tnus@2026`**

| Tên đăng nhập | Họ và tên cán bộ | Vai trò | Quyền hạn chính |
| :--- | :--- | :---: | :--- |
| **`admin`** | **ThS. Trịnh Minh Phú** | **Super Admin** | Toàn quyền cấu hình, tài khoản & phân quyền |
| **`admin_cntt`** | KS. Trần Văn Hải | Admin | Quản lý thiết bị, tài khoản người dùng |
| **`qlphongmay`** | ThS. Lê Hoàng Nam | Quản lý phòng máy | Quản lý phòng học, lịch bảo trì và xuất Excel |
| **`toannv`** | ThS. Nguyễn Văn Toàn | Giảng viên | Xem thời khóa biểu, mở ca thực hành |
| **`ktvlab`** | KTV. Chu Tuấn Hưng | Kỹ thuật viên | Điều khiển nguồn Wake-on-LAN, xử lý sự cố |
| **`student`** | Sinh viên TNUS | Sinh viên / Khách | Xem thời khóa biểu và sơ đồ 2D (Chỉ đọc) |

---
**Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)**  
*Đổi mới - Sáng tạo - Chuyển đổi số giáo dục đại học*
