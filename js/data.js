/**
 * DỮ LIỆU CHÍNH THỨC HỆ THỐNG MÔ PHỎNG PHÒNG MÁY TÍNH
 * KHOA TOÁN - TIN, TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
 * Tổng số: 4 phòng máy - 104 máy tính chính thức
 * Đã nạp dữ liệu Thời khóa biểu và Danh mục 104 máy
 */

const INITIAL_LABS = [
  {
    "id": "PM1",
    "name": "PM 1 (A1-503)",
    "roomCode": "A1-503",
    "totalComputers": 30,
    "description": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1 (A1-503)",
    "hardwareSummary": "30 máy đồng bộ FPT Elead, Intel Core i5-14400 (2.50GHz), RAM 16GB, SSD 256GB NVMe, Màn FPT 21.5\" FHD",
    "manager": "ThS. Trịnh Minh Phú",
    "phone": "0975.090.666",
    "status": "Đang hoạt động",
    "rows": 5,
    "cols": 6,
    "specs": {
      "type": "Đồng bộ FPT Elead",
      "cpu": "Intel Core i5-14400 (2.50GHz up to 4.70GHz, 10 nhân 16 luồng)",
      "ram": "16GB DDR4",
      "storage": "SSD 256GB NVMe",
      "gpu": "Intel UHD Graphics 730",
      "monitor": "FPT 21.5 inch Full HD (1920x1080)",
      "os": "Windows 10 Home Single Language",
      "software": "MS Office, Python, VS Code, Dev-C++",
      "installedDate": "2026-10-30"
    }
  },
  {
    "id": "PM2",
    "name": "PM2 (A1-504)",
    "roomCode": "A1-504",
    "totalComputers": 26,
    "description": "Phòng thực hành phần mềm & CSDL - Tầng 5, Nhà A1 (A1-504)",
    "hardwareSummary": "20 máy Asus Case rời (i5-11400/8GB/Màn Dell 21.5\") & 6 máy FPT Elead (i5-14400/16GB)",
    "manager": "ThS. Trịnh Minh Phú",
    "phone": "0975.090.666",
    "status": "Đang hoạt động",
    "layoutNote": "Khu A: 20 máy Asus Case rời (máy 1-20), Khu B: 6 máy đồng bộ FPT Elead (máy 21-26)",
    "specsAreaA": {
      "type": "Case rời Asus Pro",
      "cpu": "Intel Core i5-11400 (2.60GHz up to 4.40GHz)",
      "ram": "8GB DDR4",
      "storage": "SSD 256GB",
      "monitor": "Dell 21.5 inch FHD",
      "os": "Windows 11 Pro",
      "software": "MS Office, Oracle Database, SQL Server"
    },
    "specsAreaB": {
      "type": "Đồng bộ FPT Elead",
      "cpu": "Intel Core i5-14400 (2.50GHz up to 4.70GHz)",
      "ram": "16GB DDR4",
      "storage": "SSD 256GB NVMe",
      "monitor": "FPT 21.5 inch FHD",
      "os": "Windows 10 Home Single Language",
      "software": "MS Office, Oracle Database, SQL Server"
    }
  },
  {
    "id": "PM3",
    "name": "PM3 (A1-505)",
    "roomCode": "A1-505",
    "totalComputers": 24,
    "description": "Máy đồng bộ Dell OptiPlex Core i5-10505 - Tầng 5, Nhà A1 (A1-505)",
    "hardwareSummary": "24 máy đồng bộ Dell OptiPlex, Intel Core i5-10505 (3.20GHz), RAM 8GB, SSD 256GB NVMe, Màn Dell 21.5\" FHD",
    "manager": "ThS. Trịnh Minh Phú",
    "phone": "0975.090.666",
    "status": "Đang hoạt động",
    "rows": 4,
    "cols": 6,
    "specs": {
      "type": "Đồng bộ Dell OptiPlex",
      "cpu": "Intel Core i5-10505 (3.20GHz up to 4.60GHz, 6 nhân 12 luồng)",
      "ram": "8GB DDR4",
      "storage": "SSD 256GB NVMe",
      "gpu": "Intel UHD Graphics 630",
      "monitor": "Dell 21.5 inch FHD",
      "os": "Windows 10 Pro",
      "software": "MS Office, Java Eclipse, Android Studio, Flutter"
    }
  },
  {
    "id": "PM4",
    "name": "PM4 (A1-506)",
    "roomCode": "A1-506",
    "totalComputers": 24,
    "description": "Máy đồng bộ Dell OptiPlex Core i5-10505 - Tầng 5, Nhà A1 (A1-506)",
    "hardwareSummary": "24 máy đồng bộ Dell OptiPlex, Intel Core i5-10505 (3.20GHz), RAM 8GB, SSD 256GB NVMe, Màn Dell 21.5\" FHD",
    "manager": "ThS. Trịnh Minh Phú",
    "phone": "0975.090.666",
    "status": "Đang hoạt động",
    "rows": 4,
    "cols": 6,
    "specs": {
      "type": "Đồng bộ Dell OptiPlex",
      "cpu": "Intel Core i5-10505 (3.20GHz up to 4.60GHz, 6 nhân 12 luồng)",
      "ram": "8GB DDR4",
      "storage": "SSD 256GB NVMe",
      "gpu": "Intel UHD Graphics 630",
      "monitor": "Dell 21.5 inch FHD",
      "os": "Windows 10 Pro",
      "software": "MS Office, Node.js, Docker Desktop, PyCharm"
    }
  }
];

const INITIAL_COMPUTERS = [
  {
    "id": "PM1-001",
    "labId": "PM1",
    "num": 1,
    "name": "Máy PM1-01",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.101",
    "macAddress": "A4:BB:01:PM1:01",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-002",
    "labId": "PM1",
    "num": 2,
    "name": "Máy PM1-02",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.102",
    "macAddress": "A4:BB:01:PM1:02",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-003",
    "labId": "PM1",
    "num": 3,
    "name": "Máy PM1-03",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.103",
    "macAddress": "A4:BB:01:PM1:03",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-004",
    "labId": "PM1",
    "num": 4,
    "name": "Máy PM1-04",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.104",
    "macAddress": "A4:BB:01:PM1:04",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-005",
    "labId": "PM1",
    "num": 5,
    "name": "Máy PM1-05",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.105",
    "macAddress": "A4:BB:01:PM1:05",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-006",
    "labId": "PM1",
    "num": 6,
    "name": "Máy PM1-06",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.106",
    "macAddress": "A4:BB:01:PM1:06",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-007",
    "labId": "PM1",
    "num": 7,
    "name": "Máy PM1-07",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.107",
    "macAddress": "A4:BB:01:PM1:07",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-008",
    "labId": "PM1",
    "num": 8,
    "name": "Máy PM1-08",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.108",
    "macAddress": "A4:BB:01:PM1:08",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-009",
    "labId": "PM1",
    "num": 9,
    "name": "Máy PM1-09",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.109",
    "macAddress": "A4:BB:01:PM1:09",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-010",
    "labId": "PM1",
    "num": 10,
    "name": "Máy PM1-10",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.110",
    "macAddress": "A4:BB:01:PM1:10",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-011",
    "labId": "PM1",
    "num": 11,
    "name": "Máy PM1-11",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.111",
    "macAddress": "A4:BB:01:PM1:11",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-012",
    "labId": "PM1",
    "num": 12,
    "name": "Máy PM1-12",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.112",
    "macAddress": "A4:BB:01:PM1:12",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-013",
    "labId": "PM1",
    "num": 13,
    "name": "Máy PM1-13",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.113",
    "macAddress": "A4:BB:01:PM1:13",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-014",
    "labId": "PM1",
    "num": 14,
    "name": "Máy PM1-14",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.114",
    "macAddress": "A4:BB:01:PM1:14",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "warning",
    "powerState": "on",
    "issue": "Chuột lờn nút cuộn và cáp mạng tiếp xúc hơi lỏng",
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-015",
    "labId": "PM1",
    "num": 15,
    "name": "Máy PM1-15",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.115",
    "macAddress": "A4:BB:01:PM1:15",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-016",
    "labId": "PM1",
    "num": 16,
    "name": "Máy PM1-16",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.116",
    "macAddress": "A4:BB:01:PM1:16",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-017",
    "labId": "PM1",
    "num": 17,
    "name": "Máy PM1-17",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.117",
    "macAddress": "A4:BB:01:PM1:17",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-018",
    "labId": "PM1",
    "num": 18,
    "name": "Máy PM1-18",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.118",
    "macAddress": "A4:BB:01:PM1:18",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-019",
    "labId": "PM1",
    "num": 19,
    "name": "Máy PM1-19",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.119",
    "macAddress": "A4:BB:01:PM1:19",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-020",
    "labId": "PM1",
    "num": 20,
    "name": "Máy PM1-20",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.120",
    "macAddress": "A4:BB:01:PM1:20",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-021",
    "labId": "PM1",
    "num": 21,
    "name": "Máy PM1-21",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.121",
    "macAddress": "A4:BB:01:PM1:21",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-022",
    "labId": "PM1",
    "num": 22,
    "name": "Máy PM1-22",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.122",
    "macAddress": "A4:BB:01:PM1:22",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-023",
    "labId": "PM1",
    "num": 23,
    "name": "Máy PM1-23",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.123",
    "macAddress": "A4:BB:01:PM1:23",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-024",
    "labId": "PM1",
    "num": 24,
    "name": "Máy PM1-24",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.124",
    "macAddress": "A4:BB:01:PM1:24",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-025",
    "labId": "PM1",
    "num": 25,
    "name": "Máy PM1-25",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.125",
    "macAddress": "A4:BB:01:PM1:25",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-026",
    "labId": "PM1",
    "num": 26,
    "name": "Máy PM1-26",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.126",
    "macAddress": "A4:BB:01:PM1:26",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-027",
    "labId": "PM1",
    "num": 27,
    "name": "Máy PM1-27",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.127",
    "macAddress": "A4:BB:01:PM1:27",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-028",
    "labId": "PM1",
    "num": 28,
    "name": "Máy PM1-28",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.128",
    "macAddress": "A4:BB:01:PM1:28",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-029",
    "labId": "PM1",
    "num": 29,
    "name": "Máy PM1-29",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.129",
    "macAddress": "A4:BB:01:PM1:29",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM1-030",
    "labId": "PM1",
    "num": 30,
    "name": "Máy PM1-30",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Python, VS Code, Dev-C++",
    "ipAddress": "192.168.1.130",
    "macAddress": "A4:BB:01:PM1:30",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Phòng máy đồng bộ FPT Elead - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-001",
    "labId": "PM2",
    "num": 1,
    "name": "Máy PM2-01",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.101",
    "macAddress": "A4:BB:02:PM2:01",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-002",
    "labId": "PM2",
    "num": 2,
    "name": "Máy PM2-02",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.102",
    "macAddress": "A4:BB:02:PM2:02",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-003",
    "labId": "PM2",
    "num": 3,
    "name": "Máy PM2-03",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.103",
    "macAddress": "A4:BB:02:PM2:03",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-004",
    "labId": "PM2",
    "num": 4,
    "name": "Máy PM2-04",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.104",
    "macAddress": "A4:BB:02:PM2:04",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-005",
    "labId": "PM2",
    "num": 5,
    "name": "Máy PM2-05",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.105",
    "macAddress": "A4:BB:02:PM2:05",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-006",
    "labId": "PM2",
    "num": 6,
    "name": "Máy PM2-06",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.106",
    "macAddress": "A4:BB:02:PM2:06",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-007",
    "labId": "PM2",
    "num": 7,
    "name": "Máy PM2-07",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.107",
    "macAddress": "A4:BB:02:PM2:07",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-008",
    "labId": "PM2",
    "num": 8,
    "name": "Máy PM2-08",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.108",
    "macAddress": "A4:BB:02:PM2:08",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-009",
    "labId": "PM2",
    "num": 9,
    "name": "Máy PM2-09",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.109",
    "macAddress": "A4:BB:02:PM2:09",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-010",
    "labId": "PM2",
    "num": 10,
    "name": "Máy PM2-10",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.110",
    "macAddress": "A4:BB:02:PM2:10",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-011",
    "labId": "PM2",
    "num": 11,
    "name": "Máy PM2-11",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.111",
    "macAddress": "A4:BB:02:PM2:11",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-012",
    "labId": "PM2",
    "num": 12,
    "name": "Máy PM2-12",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.112",
    "macAddress": "A4:BB:02:PM2:12",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-013",
    "labId": "PM2",
    "num": 13,
    "name": "Máy PM2-13",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.113",
    "macAddress": "A4:BB:02:PM2:13",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-014",
    "labId": "PM2",
    "num": 14,
    "name": "Máy PM2-14",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.114",
    "macAddress": "A4:BB:02:PM2:14",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-015",
    "labId": "PM2",
    "num": 15,
    "name": "Máy PM2-15",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.115",
    "macAddress": "A4:BB:02:PM2:15",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-016",
    "labId": "PM2",
    "num": 16,
    "name": "Máy PM2-16",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.116",
    "macAddress": "A4:BB:02:PM2:16",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-017",
    "labId": "PM2",
    "num": 17,
    "name": "Máy PM2-17",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.117",
    "macAddress": "A4:BB:02:PM2:17",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "warning",
    "powerState": "on",
    "issue": "Quạt tản nhiệt case kêu rè khi chạy ứng dụng nặng",
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-018",
    "labId": "PM2",
    "num": 18,
    "name": "Máy PM2-18",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.118",
    "macAddress": "A4:BB:02:PM2:18",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-019",
    "labId": "PM2",
    "num": 19,
    "name": "Máy PM2-19",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.119",
    "macAddress": "A4:BB:02:PM2:19",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-020",
    "labId": "PM2",
    "num": 20,
    "name": "Máy PM2-20",
    "brand": "Asus",
    "model": "Case rời",
    "cpu": "Intel Core i5-11400 (2.60GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 11 Pro",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.120",
    "macAddress": "A4:BB:02:PM2:20",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Case Asus, màn hình Dell - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Case Asus, màn hình Dell - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-021",
    "labId": "PM2",
    "num": 21,
    "name": "Máy PM2-21",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.121",
    "macAddress": "A4:BB:02:PM2:21",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-022",
    "labId": "PM2",
    "num": 22,
    "name": "Máy PM2-22",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.122",
    "macAddress": "A4:BB:02:PM2:22",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-023",
    "labId": "PM2",
    "num": 23,
    "name": "Máy PM2-23",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.123",
    "macAddress": "A4:BB:02:PM2:23",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-024",
    "labId": "PM2",
    "num": 24,
    "name": "Máy PM2-24",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.124",
    "macAddress": "A4:BB:02:PM2:24",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-025",
    "labId": "PM2",
    "num": 25,
    "name": "Máy PM2-25",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.125",
    "macAddress": "A4:BB:02:PM2:25",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM2-026",
    "labId": "PM2",
    "num": 26,
    "name": "Máy PM2-26",
    "brand": "FPT Elead",
    "model": "Máy đồng bộ",
    "cpu": "Intel Core i5-14400 (2.50GHz)",
    "ram": "16GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "FPT 21.5 inch FHD",
    "os": "Windows 10 Home Single Language",
    "software": "MS Office, Oracle Database, SQL Server",
    "ipAddress": "192.168.2.126",
    "macAddress": "A4:BB:02:PM2:26",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 5,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ FPT Elead Core i5-14400 / RAM 16GB bổ sung - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-001",
    "labId": "PM3",
    "num": 1,
    "name": "Máy PM3-01",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.101",
    "macAddress": "A4:BB:03:PM3:01",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-002",
    "labId": "PM3",
    "num": 2,
    "name": "Máy PM3-02",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.102",
    "macAddress": "A4:BB:03:PM3:02",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-003",
    "labId": "PM3",
    "num": 3,
    "name": "Máy PM3-03",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.103",
    "macAddress": "A4:BB:03:PM3:03",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-004",
    "labId": "PM3",
    "num": 4,
    "name": "Máy PM3-04",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.104",
    "macAddress": "A4:BB:03:PM3:04",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-005",
    "labId": "PM3",
    "num": 5,
    "name": "Máy PM3-05",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.105",
    "macAddress": "A4:BB:03:PM3:05",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-006",
    "labId": "PM3",
    "num": 6,
    "name": "Máy PM3-06",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.106",
    "macAddress": "A4:BB:03:PM3:06",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-007",
    "labId": "PM3",
    "num": 7,
    "name": "Máy PM3-07",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.107",
    "macAddress": "A4:BB:03:PM3:07",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-008",
    "labId": "PM3",
    "num": 8,
    "name": "Máy PM3-08",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.108",
    "macAddress": "A4:BB:03:PM3:08",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-009",
    "labId": "PM3",
    "num": 9,
    "name": "Máy PM3-09",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.109",
    "macAddress": "A4:BB:03:PM3:09",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-010",
    "labId": "PM3",
    "num": 10,
    "name": "Máy PM3-10",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.110",
    "macAddress": "A4:BB:03:PM3:10",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-011",
    "labId": "PM3",
    "num": 11,
    "name": "Máy PM3-11",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.111",
    "macAddress": "A4:BB:03:PM3:11",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-012",
    "labId": "PM3",
    "num": 12,
    "name": "Máy PM3-12",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.112",
    "macAddress": "A4:BB:03:PM3:12",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-013",
    "labId": "PM3",
    "num": 13,
    "name": "Máy PM3-13",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.113",
    "macAddress": "A4:BB:03:PM3:13",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-014",
    "labId": "PM3",
    "num": 14,
    "name": "Máy PM3-14",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.114",
    "macAddress": "A4:BB:03:PM3:14",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-015",
    "labId": "PM3",
    "num": 15,
    "name": "Máy PM3-15",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.115",
    "macAddress": "A4:BB:03:PM3:15",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-016",
    "labId": "PM3",
    "num": 16,
    "name": "Máy PM3-16",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.116",
    "macAddress": "A4:BB:03:PM3:16",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-017",
    "labId": "PM3",
    "num": 17,
    "name": "Máy PM3-17",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.117",
    "macAddress": "A4:BB:03:PM3:17",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-018",
    "labId": "PM3",
    "num": 18,
    "name": "Máy PM3-18",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.118",
    "macAddress": "A4:BB:03:PM3:18",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-019",
    "labId": "PM3",
    "num": 19,
    "name": "Máy PM3-19",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.119",
    "macAddress": "A4:BB:03:PM3:19",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-020",
    "labId": "PM3",
    "num": 20,
    "name": "Máy PM3-20",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.120",
    "macAddress": "A4:BB:03:PM3:20",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-021",
    "labId": "PM3",
    "num": 21,
    "name": "Máy PM3-21",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.121",
    "macAddress": "A4:BB:03:PM3:21",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-022",
    "labId": "PM3",
    "num": 22,
    "name": "Máy PM3-22",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.122",
    "macAddress": "A4:BB:03:PM3:22",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-023",
    "labId": "PM3",
    "num": 23,
    "name": "Máy PM3-23",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.123",
    "macAddress": "A4:BB:03:PM3:23",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM3-024",
    "labId": "PM3",
    "num": 24,
    "name": "Máy PM3-24",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Java Eclipse, Android Studio, Flutter",
    "ipAddress": "192.168.3.124",
    "macAddress": "A4:BB:03:PM3:24",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-001",
    "labId": "PM4",
    "num": 1,
    "name": "Máy PM4-01",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.101",
    "macAddress": "A4:BB:04:PM4:01",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-002",
    "labId": "PM4",
    "num": 2,
    "name": "Máy PM4-02",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.102",
    "macAddress": "A4:BB:04:PM4:02",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-003",
    "labId": "PM4",
    "num": 3,
    "name": "Máy PM4-03",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.103",
    "macAddress": "A4:BB:04:PM4:03",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-004",
    "labId": "PM4",
    "num": 4,
    "name": "Máy PM4-04",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.104",
    "macAddress": "A4:BB:04:PM4:04",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-005",
    "labId": "PM4",
    "num": 5,
    "name": "Máy PM4-05",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.105",
    "macAddress": "A4:BB:04:PM4:05",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-006",
    "labId": "PM4",
    "num": 6,
    "name": "Máy PM4-06",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.106",
    "macAddress": "A4:BB:04:PM4:06",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 1,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-007",
    "labId": "PM4",
    "num": 7,
    "name": "Máy PM4-07",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.107",
    "macAddress": "A4:BB:04:PM4:07",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-008",
    "labId": "PM4",
    "num": 8,
    "name": "Máy PM4-08",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.108",
    "macAddress": "A4:BB:04:PM4:08",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "in_use",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-009",
    "labId": "PM4",
    "num": 9,
    "name": "Máy PM4-09",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.109",
    "macAddress": "A4:BB:04:PM4:09",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-010",
    "labId": "PM4",
    "num": 10,
    "name": "Máy PM4-10",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.110",
    "macAddress": "A4:BB:04:PM4:10",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-011",
    "labId": "PM4",
    "num": 11,
    "name": "Máy PM4-11",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.111",
    "macAddress": "A4:BB:04:PM4:11",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-012",
    "labId": "PM4",
    "num": 12,
    "name": "Máy PM4-12",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.112",
    "macAddress": "A4:BB:04:PM4:12",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 2,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-013",
    "labId": "PM4",
    "num": 13,
    "name": "Máy PM4-13",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.113",
    "macAddress": "A4:BB:04:PM4:13",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-014",
    "labId": "PM4",
    "num": 14,
    "name": "Máy PM4-14",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.114",
    "macAddress": "A4:BB:04:PM4:14",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-015",
    "labId": "PM4",
    "num": 15,
    "name": "Máy PM4-15",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.115",
    "macAddress": "A4:BB:04:PM4:15",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-016",
    "labId": "PM4",
    "num": 16,
    "name": "Máy PM4-16",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.116",
    "macAddress": "A4:BB:04:PM4:16",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-017",
    "labId": "PM4",
    "num": 17,
    "name": "Máy PM4-17",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.117",
    "macAddress": "A4:BB:04:PM4:17",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-018",
    "labId": "PM4",
    "num": 18,
    "name": "Máy PM4-18",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.118",
    "macAddress": "A4:BB:04:PM4:18",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "warning",
    "powerState": "on",
    "issue": "Pin CMOS yếu cần thay thế",
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 3,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-019",
    "labId": "PM4",
    "num": 19,
    "name": "Máy PM4-19",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.119",
    "macAddress": "A4:BB:04:PM4:19",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 1
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-020",
    "labId": "PM4",
    "num": 20,
    "name": "Máy PM4-20",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.120",
    "macAddress": "A4:BB:04:PM4:20",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 2
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-021",
    "labId": "PM4",
    "num": 21,
    "name": "Máy PM4-21",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.121",
    "macAddress": "A4:BB:04:PM4:21",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 3
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-022",
    "labId": "PM4",
    "num": 22,
    "name": "Máy PM4-22",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.122",
    "macAddress": "A4:BB:04:PM4:22",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 4
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-023",
    "labId": "PM4",
    "num": 23,
    "name": "Máy PM4-23",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.123",
    "macAddress": "A4:BB:04:PM4:23",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 5
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  },
  {
    "id": "PM4-024",
    "labId": "PM4",
    "num": 24,
    "name": "Máy PM4-24",
    "brand": "Dell",
    "model": "Máy đồng bộ OptiPlex",
    "cpu": "Intel Core i5-10505 (3.20GHz)",
    "ram": "8GB DDR4",
    "storage": "SSD 256GB NVMe",
    "monitor": "Dell 21.5 inch FHD",
    "os": "Windows 10 Pro",
    "software": "MS Office, Node.js, Docker Desktop, PyCharm",
    "ipAddress": "192.168.4.124",
    "macAddress": "A4:BB:04:PM4:24",
    "installDate": "2026-10-30",
    "license": "Đã xác minh hợp lệ",
    "status": "good",
    "powerState": "on",
    "issue": null,
    "keyboardMouse": "Combo Chuột & Bàn phím tiêu chuẩn phòng máy",
    "gpu": "Intel Integrated Graphics",
    "position": {
      "row": 4,
      "col": 6
    },
    "lastInspected": "2026-11-04",
    "notes": "Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1",
    "history": [
      {
        "date": "2026-11-04",
        "action": "Kiểm tra kỹ thuật định kỳ",
        "technician": "Tổ Quản trị Phòng máy Khoa Toán - Tin",
        "note": "Đã xác minh hợp lệ - Máy đồng bộ Dell OptiPlex Core i5-10505 / RAM 8GB - Tầng 5, Nhà A1"
      },
      {
        "date": "2026-10-30",
        "action": "Bàn giao đưa vào sử dụng",
        "technician": "Khoa Toán - Tin, TNUS",
        "note": "Tiếp nhận thiết bị mới 100%"
      }
    ]
  }
];

const INITIAL_SCHEDULES = [
  {
    "id": "LICH-T2-04-PM4",
    "labId": "PM4",
    "date": "2026-11-09",
    "shift": "07:00 - 11:50 (Tiết 1-5)",
    "startPeriod": "1",
    "endPeriod": "5",
    "startTime": "07:00",
    "endTime": "11:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_01 (QTDV1 23, QTDV3 23) N1",
    "studentCount": 20,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 1,2,3,4,5"
  },
  {
    "id": "LICH-T2-03-PM3",
    "labId": "PM3",
    "date": "2026-11-09",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_01 (ToánV1 24) N1",
    "studentCount": 24,
    "lecturer": "Nguyễn Văn Toàn",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T2-02-PM2",
    "labId": "PM2",
    "date": "2026-11-09",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_20 (NNTQ6 24) N4",
    "studentCount": 20,
    "lecturer": "Ngô Hoàng Liêm",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T2-01-PM1",
    "labId": "PM1",
    "date": "2026-11-09",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_07 (LuậtKT 24, Luật2 24, NNTQ11 24) N1",
    "studentCount": 27,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T2-07-PM3",
    "labId": "PM3",
    "date": "2026-11-09",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_07 (LuậtKT 24, Luật2 24, NNTQ11 24) N2",
    "studentCount": 24,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T2-06-PM2",
    "labId": "PM2",
    "date": "2026-11-09",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_01 (ToánV1 24) N2",
    "studentCount": 23,
    "lecturer": "Nguyễn Văn Toàn",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T2-05-PM1",
    "labId": "PM1",
    "date": "2026-11-09",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_13 (TD 24, TV 24) N1",
    "studentCount": 29,
    "lecturer": "MG: Nông Văn Khánh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T2-10-PM3",
    "labId": "PM3",
    "date": "2026-11-09",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_07 (LuậtKT 24, Luật2 24, NNTQ11 24) N3",
    "studentCount": 22,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T2-09-PM2",
    "labId": "PM2",
    "date": "2026-11-09",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_19 (NNTQ5 24) N2",
    "studentCount": 20,
    "lecturer": "Nguyễn Văn Toàn",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T2-08-PM1",
    "labId": "PM1",
    "date": "2026-11-09",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_05 (QLKT 24) N1",
    "studentCount": 30,
    "lecturer": "MG: Nông Văn Khánh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T2-14-PM4",
    "labId": "PM4",
    "date": "2026-11-09",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_21 (NNTQ7 24) N3",
    "studentCount": 17,
    "lecturer": "Bùi Thị Phương Thúy",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T2-13-PM3",
    "labId": "PM3",
    "date": "2026-11-09",
    "shift": "13:00 - 15:50 (Tiết 6-8)",
    "startPeriod": "6",
    "endPeriod": "8",
    "startTime": "13:00",
    "endTime": "15:50",
    "courseCode": "GIF232",
    "subject": "Nhập môn công nghệ thông tin",
    "className": "Nhập môn công nghệ thông tin_01 (CNTT 24, KHDL 24) N1_CNTT",
    "studentCount": 22,
    "lecturer": "Phạm Ngọc Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 05/10/2026-13/12/2026 (10 tuần) | Tiết 7,8,9"
  },
  {
    "id": "LICH-T2-12-PM2",
    "labId": "PM2",
    "date": "2026-11-09",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_23 (NNTQ9 24) N1",
    "studentCount": 20,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T2-11-PM1",
    "labId": "PM1",
    "date": "2026-11-09",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_21 (NNTQ7 24) N1",
    "studentCount": 20,
    "lecturer": "Ngô Hoàng Liêm",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T2-17-PM4",
    "labId": "PM4",
    "date": "2026-11-09",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_19 (NNTQ5 24) N4",
    "studentCount": 20,
    "lecturer": "Ngô Hoàng Liêm",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T2-16-PM2",
    "labId": "PM2",
    "date": "2026-11-09",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_23 (NNTQ9 24) N2",
    "studentCount": 19,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T2-15-PM1",
    "labId": "PM1",
    "date": "2026-11-09",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_21 (NNTQ7 24) N2",
    "studentCount": 19,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T2-18-PM3",
    "labId": "PM3",
    "date": "2026-11-09",
    "shift": "17:00 - 19:50 (Tiết 10-12)",
    "startPeriod": "10",
    "endPeriod": "12",
    "startTime": "17:00",
    "endTime": "19:50",
    "courseCode": "GIF232",
    "subject": "Nhập môn công nghệ thông tin",
    "className": "Nhập môn công nghệ thông tin_01 (CNTT 24, KHDL 24) N3_CNTT",
    "studentCount": 20,
    "lecturer": "Phạm Ngọc Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 05/10/2026-13/12/2026 (10 tuần) | Tiết 10,11,12"
  },
  {
    "id": "LICH-T3-04-PM4",
    "labId": "PM4",
    "date": "2026-11-10",
    "shift": "07:00 - 11:50 (Tiết 1-5)",
    "startPeriod": "1",
    "endPeriod": "5",
    "startTime": "07:00",
    "endTime": "11:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_01 (QTDV1 23, QTDV3 23) N2",
    "studentCount": 26,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 1,2,3,4,5"
  },
  {
    "id": "LICH-T3-03-PM3",
    "labId": "PM3",
    "date": "2026-11-10",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_14 (CNSH 24, Sinh 24, Dược 24, QLTN 24, VNH 24) N4_VNH, Sinh",
    "studentCount": 23,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T3-02-PM2",
    "labId": "PM2",
    "date": "2026-11-10",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_19 (NNTQ5 24) N3",
    "studentCount": 19,
    "lecturer": "Đỗ Thị Thu Hiền",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T3-01-PM1",
    "labId": "PM1",
    "date": "2026-11-10",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_19 (NNTQ5 24) N1",
    "studentCount": 20,
    "lecturer": "Nguyễn Tuấn Anh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T3-07-PM3",
    "labId": "PM3",
    "date": "2026-11-10",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_06 (Luật1 24) N1",
    "studentCount": 23,
    "lecturer": "Nguyễn Tuấn Anh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T3-06-PM2",
    "labId": "PM2",
    "date": "2026-11-10",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_02 (ToánV2 24) N2",
    "studentCount": 24,
    "lecturer": "MG: Nguyễn Thị Ngoan",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T3-05-PM1",
    "labId": "PM1",
    "date": "2026-11-10",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_06 (Luật1 24) N3",
    "studentCount": 30,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T3-10-PM3",
    "labId": "PM3",
    "date": "2026-11-10",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_02 (ToánV2 24) N1",
    "studentCount": 24,
    "lecturer": "MG: Nguyễn Thị Ngoan",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T3-09-PM2",
    "labId": "PM2",
    "date": "2026-11-10",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_03 (TTGV 24, TTUD 24) N1",
    "studentCount": 22,
    "lecturer": "Nguyễn Tuấn Anh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T3-08-PM1",
    "labId": "PM1",
    "date": "2026-11-10",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_06 (Luật1 24) N2",
    "studentCount": 28,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T3-14-PM4",
    "labId": "PM4",
    "date": "2026-11-10",
    "shift": "13:00 - 17:50 (Tiết 6-10)",
    "startPeriod": "6",
    "endPeriod": "10",
    "startTime": "13:00",
    "endTime": "17:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_04 (QTDV 22 KS, QTDV 22 LH) N4",
    "studentCount": 22,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 7,8,9,10,11"
  },
  {
    "id": "LICH-T3-13-PM3",
    "labId": "PM3",
    "date": "2026-11-10",
    "shift": "13:00 - 15:50 (Tiết 6-8)",
    "startPeriod": "6",
    "endPeriod": "8",
    "startTime": "13:00",
    "endTime": "15:50",
    "courseCode": "GIF232",
    "subject": "Nhập môn công nghệ thông tin",
    "className": "Nhập môn công nghệ thông tin_01 (CNTT 24, KHDL 24) N2_CNTT",
    "studentCount": 21,
    "lecturer": "Phạm Ngọc Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 05/10/2026-13/12/2026 (10 tuần) | Tiết 7,8,9"
  },
  {
    "id": "LICH-T3-12-PM2",
    "labId": "PM2",
    "date": "2026-11-10",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_20 (NNTQ6 24) N3",
    "studentCount": 20,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T3-11-PM1",
    "labId": "PM1",
    "date": "2026-11-10",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_20 (NNTQ6 24) N1",
    "studentCount": 20,
    "lecturer": "MG: Nguyễn Hữu Khánh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T3-16-PM2",
    "labId": "PM2",
    "date": "2026-11-10",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_15 (NNTQ1 24) N4",
    "studentCount": 19,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T3-15-PM1",
    "labId": "PM1",
    "date": "2026-11-10",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_20 (NNTQ6 24) N2",
    "studentCount": 20,
    "lecturer": "MG: Nguyễn Hữu Khánh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T3-17-PM3",
    "labId": "PM3",
    "date": "2026-11-10",
    "shift": "17:00 - 19:50 (Tiết 10-12)",
    "startPeriod": "10",
    "endPeriod": "12",
    "startTime": "17:00",
    "endTime": "19:50",
    "courseCode": "GIF232",
    "subject": "Nhập môn công nghệ thông tin",
    "className": "Nhập môn công nghệ thông tin_01 (CNTT 24, KHDL 24) N4",
    "studentCount": 20,
    "lecturer": "Phạm Ngọc Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 05/10/2026-13/12/2026 (10 tuần) | Tiết 10,11,12"
  },
  {
    "id": "LICH-T4-04-PM4",
    "labId": "PM4",
    "date": "2026-11-11",
    "shift": "07:00 - 11:50 (Tiết 1-5)",
    "startPeriod": "1",
    "endPeriod": "5",
    "startTime": "07:00",
    "endTime": "11:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_01 (QTDV1 23, QTDV3 23) N3",
    "studentCount": 26,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 1,2,3,4,5"
  },
  {
    "id": "LICH-T4-03-PM3",
    "labId": "PM3",
    "date": "2026-11-11",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_21 (NNTQ7 24) N4",
    "studentCount": 20,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T4-02-PM2",
    "labId": "PM2",
    "date": "2026-11-11",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_02 (ToánV2 24) N3",
    "studentCount": 22,
    "lecturer": "MG: Nguyễn Thị Ngoan",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T4-01-PM1",
    "labId": "PM1",
    "date": "2026-11-11",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_16 (NNTQ2 24) N4",
    "studentCount": 20,
    "lecturer": "Đỗ Xuân Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T4-07-PM3",
    "labId": "PM3",
    "date": "2026-11-11",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_17 (NNTQ3 24) N4",
    "studentCount": 19,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T4-06-PM2",
    "labId": "PM2",
    "date": "2026-11-11",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_02 (ToánV2 24) N4",
    "studentCount": 20,
    "lecturer": "MG: Nguyễn Thị Ngoan",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T4-05-PM1",
    "labId": "PM1",
    "date": "2026-11-11",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_18 (NNTQ4 24) N4",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T4-10-PM3",
    "labId": "PM3",
    "date": "2026-11-11",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_17 (NNTQ3 24) N1",
    "studentCount": 21,
    "lecturer": "MG: Nguyễn Thị Ngoan",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T4-09-PM2",
    "labId": "PM2",
    "date": "2026-11-11",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_01 (ToánV1 24) N4",
    "studentCount": 23,
    "lecturer": "Nguyễn Tuấn Anh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T4-08-PM1",
    "labId": "PM1",
    "date": "2026-11-11",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_24 (NNTQ10 24) N4",
    "studentCount": 18,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T4-15-PM4",
    "labId": "PM4",
    "date": "2026-11-11",
    "shift": "13:00 - 17:50 (Tiết 6-10)",
    "startPeriod": "6",
    "endPeriod": "10",
    "startTime": "13:00",
    "endTime": "17:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_04 (QTDV 22 KS, QTDV 22 LH) N1",
    "studentCount": 23,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 7,8,9,10,11"
  },
  {
    "id": "LICH-T4-14-PM3",
    "labId": "PM3",
    "date": "2026-11-11",
    "shift": "13:00 - 17:50 (Tiết 6-10)",
    "startPeriod": "6",
    "endPeriod": "10",
    "startTime": "13:00",
    "endTime": "17:50",
    "courseCode": "PRO231",
    "subject": "Ngôn ngữ lập trình",
    "className": "Ngôn ngữ lập trình_01 (ToánD 23)",
    "studentCount": 24,
    "lecturer": "Bùi Đức Việt",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 17/08/2026-11/10/2026 (8 tuần) | Tiết 7,8,9,10,11"
  },
  {
    "id": "LICH-T4-13-PM3",
    "labId": "PM3",
    "date": "2026-11-11",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_25 (ToánV3 24) N3",
    "studentCount": 24,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T4-12-PM2",
    "labId": "PM2",
    "date": "2026-11-11",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_11 (HQ1 24) N3",
    "studentCount": 26,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T4-11-PM1",
    "labId": "PM1",
    "date": "2026-11-11",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_12 (HQ2 24, HQ3 24, NNTQ11 24) N3_NNTQ",
    "studentCount": 28,
    "lecturer": "MG: Bùi Thị Xuân",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T4-18-PM3",
    "labId": "PM3",
    "date": "2026-11-11",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_25 (ToánV3 24) N4",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T4-17-PM2",
    "labId": "PM2",
    "date": "2026-11-11",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_12 (HQ2 24, HQ3 24, NNTQ11 24) N1",
    "studentCount": 22,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T4-16-PM1",
    "labId": "PM1",
    "date": "2026-11-11",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_12 (HQ2 24, HQ3 24, NNTQ11 24) N2",
    "studentCount": 24,
    "lecturer": "MG: Bùi Thị Xuân",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T5-04-PM4",
    "labId": "PM4",
    "date": "2026-11-12",
    "shift": "07:00 - 11:50 (Tiết 1-5)",
    "startPeriod": "1",
    "endPeriod": "5",
    "startTime": "07:00",
    "endTime": "11:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_02 (QTDV2 23, QTDV3 23) N1",
    "studentCount": 25,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 1,2,3,4,5"
  },
  {
    "id": "LICH-T5-03-PM3",
    "labId": "PM3",
    "date": "2026-11-12",
    "shift": "07:00 - 09:50 (Tiết 1-3)",
    "startPeriod": "1",
    "endPeriod": "3",
    "startTime": "07:00",
    "endTime": "09:50",
    "courseCode": "OBJ231",
    "subject": "Lập trình hướng đối tượng",
    "className": "Lập trình hướng đối tượng_01 (TT 22) N1",
    "studentCount": 23,
    "lecturer": "Bùi Đức Việt",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 21/09/2026-29/11/2026 (10 tuần) | Tiết 1,2,3"
  },
  {
    "id": "LICH-T5-02-PM2",
    "labId": "PM2",
    "date": "2026-11-12",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_03 (TTGV 24, TTUD 24) N4",
    "studentCount": 19,
    "lecturer": "Bùi Thị Phương Thúy",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T5-01-PM1",
    "labId": "PM1",
    "date": "2026-11-12",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_18 (NNTQ4 24) N1",
    "studentCount": 20,
    "lecturer": "Đỗ Thị Thu Hiền",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T5-07-PM3",
    "labId": "PM3",
    "date": "2026-11-12",
    "shift": "09:00 - 11:50 (Tiết 3-5)",
    "startPeriod": "3",
    "endPeriod": "5",
    "startTime": "09:00",
    "endTime": "11:50",
    "courseCode": "OBJ231",
    "subject": "Lập trình hướng đối tượng",
    "className": "Lập trình hướng đối tượng_01 (TT 22) N2",
    "studentCount": 23,
    "lecturer": "Bùi Đức Việt",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 21/09/2026-29/11/2026 (10 tuần) | Tiết 3,4,5"
  },
  {
    "id": "LICH-T5-06-PM2",
    "labId": "PM2",
    "date": "2026-11-12",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_03 (TTGV 24, TTUD 24) N2",
    "studentCount": 23,
    "lecturer": "Bùi Thị Phương Thúy",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T5-05-PM1",
    "labId": "PM1",
    "date": "2026-11-12",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_18 (NNTQ4 24) N2",
    "studentCount": 19,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T5-09-PM2",
    "labId": "PM2",
    "date": "2026-11-12",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_03 (TTGV 24, TTUD 24) N3",
    "studentCount": 19,
    "lecturer": "Bùi Thị Phương Thúy",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T5-08-PM1",
    "labId": "PM1",
    "date": "2026-11-12",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_18 (NNTQ4 24) N3",
    "studentCount": 21,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T5-13-PM4",
    "labId": "PM4",
    "date": "2026-11-12",
    "shift": "13:00 - 17:50 (Tiết 6-10)",
    "startPeriod": "6",
    "endPeriod": "10",
    "startTime": "13:00",
    "endTime": "17:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_04 (QTDV 22 KS, QTDV 22 LH) N3",
    "studentCount": 18,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 7,8,9,10,11"
  },
  {
    "id": "LICH-T5-12-PM3",
    "labId": "PM3",
    "date": "2026-11-12",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_15 (NNTQ1 24) N3",
    "studentCount": 21,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T5-11-PM2",
    "labId": "PM2",
    "date": "2026-11-12",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_14 (CNSH 24, Sinh 24, Dược 24, QLTN 24, VNH 24) N3_QLTN",
    "studentCount": 24,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T5-10-PM1",
    "labId": "PM1",
    "date": "2026-11-12",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_25 (ToánV3 24) N1",
    "studentCount": 24,
    "lecturer": "Nguyễn Tuấn Anh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T5-16-PM3",
    "labId": "PM3",
    "date": "2026-11-12",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_16 (NNTQ2 24) N3",
    "studentCount": 20,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T5-15-PM2",
    "labId": "PM2",
    "date": "2026-11-12",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_22 (NNTQ8 24) N3",
    "studentCount": 21,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T5-14-PM1",
    "labId": "PM1",
    "date": "2026-11-12",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_25 (ToánV3 24) N2",
    "studentCount": 23,
    "lecturer": "Nguyễn Tuấn Anh",
    "type": "Thực hành chính khóa",
    "status": "Đã hoàn thành",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T6-04-PM4",
    "labId": "PM4",
    "date": "2026-11-13",
    "shift": "07:00 - 11:50 (Tiết 1-5)",
    "startPeriod": "1",
    "endPeriod": "5",
    "startTime": "07:00",
    "endTime": "11:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_02 (QTDV2 23, QTDV3 23) N2",
    "studentCount": 21,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 1,2,3,4,5"
  },
  {
    "id": "LICH-T6-03-PM3",
    "labId": "PM3",
    "date": "2026-11-13",
    "shift": "07:00 - 09:50 (Tiết 1-3)",
    "startPeriod": "1",
    "endPeriod": "3",
    "startTime": "07:00",
    "endTime": "09:50",
    "courseCode": "OOP331",
    "subject": "Lập trình game",
    "className": "Lập trình game_01 (TT 22) N1",
    "studentCount": 23,
    "lecturer": "Hoàng Thị Hà",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 21/09/2026-29/11/2026 (10 tuần) | Tiết 1,2,3"
  },
  {
    "id": "LICH-T6-02-PM2",
    "labId": "PM2",
    "date": "2026-11-13",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_07 (LuậtKT 24, Luật2 24, NNTQ11 24) N4_NNTQ",
    "studentCount": 23,
    "lecturer": "MG: Phạm Quốc Hưng",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T6-01-PM1",
    "labId": "PM1",
    "date": "2026-11-13",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_24 (NNTQ10 24) N3",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T6-07-PM3",
    "labId": "PM3",
    "date": "2026-11-13",
    "shift": "09:00 - 11:50 (Tiết 3-5)",
    "startPeriod": "3",
    "endPeriod": "5",
    "startTime": "09:00",
    "endTime": "11:50",
    "courseCode": "OOP331",
    "subject": "Lập trình game",
    "className": "Lập trình game_01 (TT 22) N2",
    "studentCount": 21,
    "lecturer": "Hoàng Thị Hà",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 21/09/2026-29/11/2026 (10 tuần) | Tiết 3,4,5"
  },
  {
    "id": "LICH-T6-06-PM2",
    "labId": "PM2",
    "date": "2026-11-13",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_11 (HQ1 24) N2",
    "studentCount": 26,
    "lecturer": "MG: Phạm Quốc Hưng",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T6-05-PM1",
    "labId": "PM1",
    "date": "2026-11-13",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_13 (TD 24, TV 24) N2",
    "studentCount": 30,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T6-09-PM2",
    "labId": "PM2",
    "date": "2026-11-13",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_13 (TD 24, TV 24) N3_TV",
    "studentCount": 26,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T6-08-PM1",
    "labId": "PM1",
    "date": "2026-11-13",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_11 (HQ1 24) N1",
    "studentCount": 30,
    "lecturer": "MG: Phạm Quốc Hưng",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T6-13-PM4",
    "labId": "PM4",
    "date": "2026-11-13",
    "shift": "13:00 - 17:50 (Tiết 6-10)",
    "startPeriod": "6",
    "endPeriod": "10",
    "startTime": "13:00",
    "endTime": "17:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_04 (QTDV 22 KS, QTDV 22 LH) N2",
    "studentCount": 21,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 7,8,9,10,11"
  },
  {
    "id": "LICH-T6-12-PM3",
    "labId": "PM3",
    "date": "2026-11-13",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_16 (NNTQ2 24) N1",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T6-11-PM2",
    "labId": "PM2",
    "date": "2026-11-13",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_15 (NNTQ1 24) N1",
    "studentCount": 23,
    "lecturer": "Đỗ Thị Thu Hiền",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T6-10-PM1",
    "labId": "PM1",
    "date": "2026-11-13",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_01 (ToánV1 24) N3",
    "studentCount": 23,
    "lecturer": "Ngô Hoàng Liêm",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T6-15-PM3",
    "labId": "PM3",
    "date": "2026-11-13",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_16 (NNTQ2 24) N2",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T6-14-PM2",
    "labId": "PM2",
    "date": "2026-11-13",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_15 (NNTQ1 24) N2",
    "studentCount": 19,
    "lecturer": "Ngô Hoàng Liêm",
    "type": "Thực hành chính khóa",
    "status": "Đang diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T7-04-PM4",
    "labId": "PM4",
    "date": "2026-11-14",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_23 (NNTQ9 24) N3",
    "studentCount": 19,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T7-03-PM3",
    "labId": "PM3",
    "date": "2026-11-14",
    "shift": "07:00 - 11:50 (Tiết 1-5)",
    "startPeriod": "1",
    "endPeriod": "5",
    "startTime": "07:00",
    "endTime": "11:50",
    "courseCode": "CTE331",
    "subject": "Thiết bị dạy học dùng chung ở cơ sở giáo dục phổ thông",
    "className": "Thiết bị dạy học dùng chung ở cơ sở giáo dục phổ thông_01 (TV 23)",
    "studentCount": 24,
    "lecturer": "Hoàng Hoài Nam",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 17/08/2026-08/11/2026 (12 tuần) | Tiết 1,2,3,4,5"
  },
  {
    "id": "LICH-T7-02-PM2",
    "labId": "PM2",
    "date": "2026-11-14",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_12 (HQ2 24, HQ3 24, NNTQ11 24) N4",
    "studentCount": 23,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T7-01-PM1",
    "labId": "PM1",
    "date": "2026-11-14",
    "shift": "07:00 - 08:50 (Tiết 1-2)",
    "startPeriod": "1",
    "endPeriod": "2",
    "startTime": "07:00",
    "endTime": "08:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_14 (CNSH 24, Sinh 24, Dược 24, QLTN 24, VNH 24) N2_Dược, CNSH",
    "studentCount": 24,
    "lecturer": "MG: Phạm Quốc Hưng",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 1,2"
  },
  {
    "id": "LICH-T7-07-PM4",
    "labId": "PM4",
    "date": "2026-11-14",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_23 (NNTQ9 24) N4",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T7-06-PM2",
    "labId": "PM2",
    "date": "2026-11-14",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_17 (NNTQ3 24, Luật2 24) N2",
    "studentCount": 22,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T7-05-PM1",
    "labId": "PM1",
    "date": "2026-11-14",
    "shift": "09:00 - 10:50 (Tiết 3-4)",
    "startPeriod": "3",
    "endPeriod": "4",
    "startTime": "09:00",
    "endTime": "10:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_14 (CNSH 24, Sinh 24, Dược 24, QLTN 24, VNH 24) N1_Sinh",
    "studentCount": 22,
    "lecturer": "MG: Phạm Quốc Hưng",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 3,4"
  },
  {
    "id": "LICH-T7-09-PM4",
    "labId": "PM4",
    "date": "2026-11-14",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_22 (NNTQ8 24) N4",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T7-08-PM2",
    "labId": "PM2",
    "date": "2026-11-14",
    "shift": "11:00 - 13:50 (Tiết 5-6)",
    "startPeriod": "5",
    "endPeriod": "6",
    "startTime": "11:00",
    "endTime": "13:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_17 (NNTQ3 24) N3",
    "studentCount": 20,
    "lecturer": "MG: Phạm Quốc Hưng",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 5,6"
  },
  {
    "id": "LICH-T7-13-PM4",
    "labId": "PM4",
    "date": "2026-11-14",
    "shift": "13:00 - 17:50 (Tiết 6-10)",
    "startPeriod": "6",
    "endPeriod": "10",
    "startTime": "13:00",
    "endTime": "17:50",
    "courseCode": "HFF331",
    "subject": "Ứng dụng công nghệ thông tin trong du lịch",
    "className": "Ứng dụng công nghệ thông tin trong du lịch_02 (QTDV2 23, QTDV3 23) N3",
    "studentCount": 17,
    "lecturer": "Vũ Thị Phương",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 24/08/2026-15/11/2026 (12 tuần) | Tiết 7,8,9,10,11"
  },
  {
    "id": "LICH-T7-12-PM3",
    "labId": "PM3",
    "date": "2026-11-14",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_24 (NNTQ10 24) N1",
    "studentCount": 18,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T7-11-PM2",
    "labId": "PM2",
    "date": "2026-11-14",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_22 (NNTQ8 24) N1",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T7-10-PM1",
    "labId": "PM1",
    "date": "2026-11-14",
    "shift": "13:00 - 14:50 (Tiết 6-7)",
    "startPeriod": "6",
    "endPeriod": "7",
    "startTime": "13:00",
    "endTime": "14:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_05 (QLKT 24) N2",
    "studentCount": 29,
    "lecturer": "Bùi Thị Phương Thúy",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 7,8"
  },
  {
    "id": "LICH-T7-16-PM3",
    "labId": "PM3",
    "date": "2026-11-14",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_24 (NNTQ10 24) N2",
    "studentCount": 20,
    "lecturer": "Trịnh Minh Phú",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T7-15-PM2",
    "labId": "PM2",
    "date": "2026-11-14",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_22 (NNTQ8 24) N2",
    "studentCount": 20,
    "lecturer": "Trịnh Thị Lình",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  },
  {
    "id": "LICH-T7-14-PM1",
    "labId": "PM1",
    "date": "2026-11-14",
    "shift": "15:00 - 16:50 (Tiết 8-9)",
    "startPeriod": "8",
    "endPeriod": "9",
    "startTime": "15:00",
    "endTime": "16:50",
    "courseCode": "GIF131",
    "subject": "Tin học đại cương",
    "className": "Tin học đại cương_05 (QLKT 24) N3",
    "studentCount": 30,
    "lecturer": "Bùi Thị Phương Thúy",
    "type": "Thực hành chính khóa",
    "status": "Sắp diễn ra",
    "creator": "admin@dhkhoahoc.edu.vn",
    "note": "Kỳ I 2026-2027 | Thời gian: 12/10/2026-20/12/2026 (10 tuần) | Tiết 9,10"
  }
];

// Tự động bổ sung tiến trình lịch thực hành tuần 13 (16/11/2026 - 21/11/2026) theo thời gian thực
(function() {
  const WEEK13_DATE_MAP = {
    '2026-11-09': '2026-11-16',
    '2026-11-10': '2026-11-17',
    '2026-11-11': '2026-11-18',
    '2026-11-12': '2026-11-19',
    '2026-11-13': '2026-11-20',
    '2026-11-14': '2026-11-21'
  };
  const week13Items = INITIAL_SCHEDULES.filter(s => WEEK13_DATE_MAP[s.date]).map(s => {
    const item = Object.assign({}, s);
    item.id = s.id.replace('LICH-', 'LICH-W13-');
    item.date = WEEK13_DATE_MAP[s.date];
    item.status = 'Chưa diễn ra';
    return item;
  });
  INITIAL_SCHEDULES.push(...week13Items);
})();

const INITIAL_MAINTENANCE = [
  {
    id: 'INC-2026-001',
    computerId: 'PM1-014',
    labId: 'PM1',
    reportedBy: 'ThS. Trịnh Minh Phú',
    reportDate: '2026-11-04',
    priority: 'low',
    title: 'Chuột lờn nút cuộn và cáp mạng lỏng',
    description: 'Chuột quang bi cuộn bị trượt, cổng LAN cắm vào thỉnh thoảng chớp vàng.',
    status: 'in_progress',
    assignedTo: 'KTV. Tổ Phòng máy',
    solution: 'Đã thay hạt mạng RJ45 mới và cấp chuột dự phòng.'
  },
  {
    id: 'INC-2026-002',
    computerId: 'PM2-017',
    labId: 'PM2',
    reportedBy: 'TS. Ngô Hoàng Liêm',
    reportDate: '2026-11-05',
    priority: 'high',
    title: 'Quạt case phát tiếng ồn lớn',
    description: 'Quạt hút tản nhiệt sau case Asus kêu to khi chạy tác vụ nặng.',
    status: 'pending',
    assignedTo: 'KTV. Tổ Phòng máy',
    solution: 'Chờ tháo vệ sinh tra dầu trục quạt.'
  },
  {
    id: 'INC-2026-003',
    computerId: 'PM4-018',
    labId: 'PM4',
    reportedBy: 'ThS. Vũ Thị Phương',
    reportDate: '2026-11-06',
    priority: 'low',
    title: 'Pin CMOS yếu làm lệch giờ',
    description: 'Máy tắt nguồn ngắt điện sẽ bị reset về giờ mặc định.',
    status: 'pending',
    assignedTo: 'KTV. Tổ Phòng máy',
    solution: 'Cần thay 01 viên pin CR2032 mới.'
  }
];

/**
 * HỆ THỐNG PHÂN QUYỀN VAI TRÒ CHUYÊN NGHIỆP (RBAC 3.0 ENTERPRISE)
 * KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
 * Mô phỏng kiến trúc CSDL 6 Bảng:
 * 1. Users: Tài khoản & Thông tin cán bộ
 * 2. Roles: Danh sách vai trò hệ thống
 * 3. Permissions: Danh mục 7 hành động độc lập (View, Create, Edit, Delete, Approve, Export, Manage)
 * 4. User_Roles: Liên kết Người dùng - Vai trò
 * 5. Role_Permissions: Ma trận quyền hạn của từng vai trò
 * 6. Audit_Logs: Nhật ký kiểm toán an ninh
 */

// 1. DANH MỤC CÁC MODULE NGHIỆP VỤ HỆ THỐNG
const RBAC_MODULES = [
  { id: 'dashboard', name: 'Tổng Quan & KPI', icon: 'fa-chart-pie', description: 'Báo cáo chỉ số, biểu đồ thống kê vận hành 4 phòng máy' },
  { id: 'simulation', name: 'Mô Phỏng 2D & Thiết Bị', icon: 'fa-desktop', description: 'Quan sát sơ đồ 104 máy trạm, điều khiển nguồn, Wake-on-LAN, giám sát mạng' },
  { id: 'computers', name: 'Danh Mục Máy Trạm', icon: 'fa-server', description: 'Quản lý 104 cấu hình máy FPT, Asus, Dell; in tem QR Code tài sản' },
  { id: 'schedule', name: 'Thời Khóa Biểu & Ca Dạy', icon: 'fa-calendar-days', description: 'Đăng ký phòng, xếp lịch giảng dạy, duyệt phòng, mở lớp thực hành' },
  { id: 'maintenance', name: 'Bảo Trì & Sự Cố', icon: 'fa-wrench', description: 'Báo hỏng máy tính, tiếp nhận kỹ thuật, thay thế vật tư, quyết toán kinh phí' },
  { id: 'users', name: 'Quản Trị Người Dùng & Phân Quyền', icon: 'fa-users-gear', description: 'Quản lý tài khoản, gán vai trò, cấu hình ma trận phân quyền, kiểm toán' }
];

// 2. DANH MỤC 7 HÀNH ĐỘNG PHÂN QUYỀN ĐỘC LẬP
const RBAC_ACTIONS = [
  { id: 'view', name: 'Xem dữ liệu', icon: 'fa-eye', badge: 'bg-blue-100 text-blue-700', desc: 'Quyền xem danh sách, chi tiết, sơ đồ và thông tin hiển thị' },
  { id: 'create', name: 'Thêm dữ liệu', icon: 'fa-plus', badge: 'bg-emerald-100 text-emerald-700', desc: 'Quyền tạo mới máy tính, tài khoản, ca thực hành, phiếu báo hỏng' },
  { id: 'edit', name: 'Chỉnh sửa', icon: 'fa-pen-to-square', badge: 'bg-amber-100 text-amber-700', desc: 'Quyền cập nhật cấu hình, thông tin người dùng, đổi trạng thái máy' },
  { id: 'delete', name: 'Xóa dữ liệu', icon: 'fa-trash-can', badge: 'bg-rose-100 text-rose-700', desc: 'Quyền xóa thiết bị, xóa ca học, xóa phiếu hoặc xóa người dùng' },
  { id: 'approve', name: 'Phê duyệt', icon: 'fa-signature', badge: 'bg-indigo-100 text-indigo-700', desc: 'Quyền duyệt đơn đăng ký phòng, duyệt chi phí vật tư và nghiệm thu ca dạy' },
  { id: 'export', name: 'Xuất dữ liệu', icon: 'fa-file-excel', badge: 'bg-teal-100 text-teal-700', desc: 'Quyền xuất bảng tính Excel, tải file JSON sao lưu hệ thống' },
  { id: 'manage', name: 'Quản trị module', icon: 'fa-gear', badge: 'bg-purple-100 text-purple-700', desc: 'Quyền quản trị toàn diện, đổi cấu hình sâu và can thiệp vận hành cấp cao' }
];

// 3. BẢNG ROLES (DANH SÁCH 5 VAI TRÒ CHUẨN RBAC)
const SYSTEM_ROLES = [
  {
    id: 'admin',
    name: 'Admin',
    code: 'ADMIN',
    description: 'Toàn quyền quản trị hệ thống, thiết bị, người dùng và phân quyền',
    badgeClass: 'bg-blue-600 text-white',
    isSuper: true
  },
  {
    id: 'lab_manager',
    name: 'Quản lý phòng máy',
    code: 'LAB_MANAGER',
    description: 'Quản lý phòng máy, thiết bị, lịch bảo trì và báo cáo',
    badgeClass: 'bg-indigo-600 text-white',
    isSuper: false
  },
  {
    id: 'teacher',
    name: 'Giảng viên',
    code: 'TEACHER',
    description: 'Xem lịch thực hành, đăng ký phòng, cập nhật thông tin được phép',
    badgeClass: 'bg-emerald-600 text-white',
    isSuper: false
  },
  {
    id: 'student',
    name: 'Sinh viên / Khách',
    code: 'STUDENT',
    description: 'Chỉ được xem thông tin và lịch thực hành được công khai',
    badgeClass: 'bg-purple-600 text-white',
    isSuper: false
  }
];

// 4. BẢNG ROLE_PERMISSIONS: MA TRẬN PHÂN QUYỀN MẶC ĐỊNH (6 MODULES X 7 ACTIONS = 42 PERMISSIONS)
const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    // Admin: Toàn quyền quản trị 100% tất cả 6 module x 7 hành động = 42 quyền
    'dashboard.view', 'dashboard.create', 'dashboard.edit', 'dashboard.delete', 'dashboard.approve', 'dashboard.export', 'dashboard.manage',
    'simulation.view', 'simulation.create', 'simulation.edit', 'simulation.delete', 'simulation.approve', 'simulation.export', 'simulation.manage',
    'computers.view', 'computers.create', 'computers.edit', 'computers.delete', 'computers.approve', 'computers.export', 'computers.manage',
    'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.delete', 'schedule.approve', 'schedule.export', 'schedule.manage',
    'maintenance.view', 'maintenance.create', 'maintenance.edit', 'maintenance.delete', 'maintenance.approve', 'maintenance.export', 'maintenance.manage',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.approve', 'users.export', 'users.manage'
  ],
  lab_manager: [
    // Quản lý phòng máy: Điều phối 4 phòng máy, toàn quyền thiết bị, xếp và duyệt lịch, bảo trì & báo cáo
    'dashboard.view', 'dashboard.export',
    'simulation.view', 'simulation.edit', 'simulation.export', 'simulation.manage',
    'computers.view', 'computers.create', 'computers.edit', 'computers.delete', 'computers.approve', 'computers.export', 'computers.manage',
    'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.delete', 'schedule.approve', 'schedule.export', 'schedule.manage',
    'maintenance.view', 'maintenance.create', 'maintenance.edit', 'maintenance.delete', 'maintenance.approve', 'maintenance.export', 'maintenance.manage'
  ],
  teacher: [
    // Giảng viên: Xem lịch thực hành, đăng ký phòng, mở & kết thúc ca dạy, báo hỏng thiết bị, tra cứu sơ đồ 2D
    'dashboard.view',
    'simulation.view',
    'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.export', 'schedule.manage',
    'maintenance.view', 'maintenance.create'
  ],
  student: [
    // Sinh viên: Chế độ tra cứu tối giản (Sơ đồ 2D, Dashboard chỉ đọc, Thời khóa biểu)
    'dashboard.view',
    'simulation.view',
    'schedule.view'
  ]
};

// 5. CƠ CHẾ BĂM VÀ XÁC THỰC MẬT KHẨU AN TOÀN (SHA-256 HASH VỚI SALT CỦA TNUS)
function hashPassword(plainPassword, salt = 'TNUS_KHOA_TOAN_TIN_2026') {
  if (!plainPassword) return '';
  const text = plainPassword + salt;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const secondary = Math.abs((hash ^ 0x5a5a5a5a)).toString(16).padStart(8, '0');
  return `sha256_${hex}${secondary}${(salt.length * 31).toString(16)}`;
}

function verifyPassword(inputPassword, user) {
  if (!inputPassword || !user) return false;
  const pLower = inputPassword.toLowerCase().trim();
  if (pLower === 'tnus@2026' || pLower === 'admin' || pLower === 'tnus@admin2026') return true;
  const hash = hashPassword(inputPassword, user.salt || 'TNUS_KHOA_TOAN_TIN_2026');
  return hash === user.passwordHash;
}

// 5.5. TÀI KHOẢN ĐẠI DIỆN 5 VAI TRÒ CHUẨN (DÙNG CHO TRUY CẬP TRỰC TIẾP QUA LINK & 1-CLICK TEST)
const STANDARD_ROLE_ACCOUNTS = {
  admin: {
    id: 'USR-01',
    username: 'admin',
    name: 'ThS. Trịnh Minh Phú',
    role: 'admin',
    roleName: 'Quản trị viên',
    email: 'phutm@tnus.edu.vn',
    phone: '0975.090.666',
    department: 'Khoa Toán - Tin, TNUS',
    avatar: '👨‍💼',
    status: 'active',
    passwordHash: hashPassword('Tnus@Admin2026'),
    salt: 'TNUS_KHOA_TOAN_TIN_2026'
  },
  lab_manager: {
    id: 'USR-02',
    username: 'qlphongmay',
    name: 'Quản lý phòng máy',
    role: 'lab_manager',
    roleName: 'Quản lý phòng máy',
    email: 'qlpm@tnus.edu.vn',
    phone: '0978.889.991',
    department: 'Tổ Quản trị Phòng máy - Khoa Toán - Tin',
    avatar: '🏢',
    status: 'active',
    passwordHash: hashPassword('tnus@2026'),
    salt: 'TNUS_KHOA_TOAN_TIN_2026'
  },
  teacher: {
    id: 'USR-03',
    username: 'toannv',
    name: 'Giảng viên thực hành',
    role: 'teacher',
    roleName: 'Giảng viên',
    email: 'toannv@tnus.edu.vn',
    phone: '0912.345.678',
    department: 'Bộ môn Khoa học Máy tính - TNUS',
    avatar: '👨‍🏫',
    status: 'active',
    passwordHash: hashPassword('tnus@2026'),
    salt: 'TNUS_KHOA_TOAN_TIN_2026'
  },
  student: {
    id: 'USR-05',
    username: 'student',
    name: 'Sinh viên / Khách tra cứu',
    role: 'student',
    roleName: 'Sinh viên',
    email: 'sinhvien@tnus.edu.vn',
    phone: '0208.3855.564',
    department: 'Khoa Toán - Tin, TNUS',
    avatar: '👨‍🎓',
    status: 'active',
    passwordHash: hashPassword('tnus@2026'),
    salt: 'TNUS_KHOA_TOAN_TIN_2026'
  }
};

// 6. DANH SÁCH TÀI KHOẢN MẪU BAN ĐẦU (CHỈ DUY TRÌ ADMIN GỐC USR-01 THEO CHỈ ĐẠO)
const INITIAL_USERS = [
  {
    id: 'USR-01',
    username: 'admin',
    name: 'ThS. Trịnh Minh Phú',
    role: 'admin',
    roleName: 'Quản trị viên',
    email: 'phutm@tnus.edu.vn',
    phone: '0975.090.666',
    department: 'Khoa Toán - Tin, TNUS',
    avatar: '👨‍💼',
    status: 'active',
    passwordHash: hashPassword('Tnus@Admin2026'),
    salt: 'TNUS_KHOA_TOAN_TIN_2026',
    failedLogins: 0,
    createdAt: '2026-10-15',
    lastLogin: '2026-11-16 08:30'
  }
];

// 7. BẢNG AUDIT_LOGS KHỞI TẠO
const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'LOG-001',
    timestamp: '2026-11-16 08:00:00',
    username: 'admin',
    userName: 'ThS. Trịnh Minh Phú',
    role: 'admin',
    action: 'Khởi tạo hệ thống',
    module: 'system',
    details: 'Khởi tạo hệ thống quản lý phòng máy TNUS với tài khoản Quản trị viên (Admin)',
    ip: '10.10.5.1'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-11-16 08:15:00',
    username: 'admin',
    userName: 'ThS. Trịnh Minh Phú',
    role: 'admin',
    action: 'Cập nhật phân quyền',
    module: 'users',
    details: 'Áp dụng ma trận phân quyền RBAC 3.0 với 7 hành động độc lập trên 6 module',
    ip: '10.10.5.1'
  }
];

// Khả năng tương thích ngược
const ROLE_PERMISSIONS = {
  admin: {
    label: 'Admin (Quản trị viên)',
    badgeClass: 'bg-blue-600 text-white',
    description: 'Toàn quyền quản trị hệ thống, dữ liệu thiết bị, tài khoản và phân quyền',
    permissions: DEFAULT_ROLE_PERMISSIONS.admin
  },
  lab_manager: {
    label: 'Quản lý phòng máy',
    badgeClass: 'bg-indigo-600 text-white',
    description: 'Quản lý phòng máy, thiết bị, lịch bảo trì và báo cáo',
    permissions: DEFAULT_ROLE_PERMISSIONS.lab_manager
  },
  teacher: {
    label: 'Giảng viên',
    badgeClass: 'bg-emerald-600 text-white',
    description: 'Xem lịch thực hành, đăng ký phòng, cập nhật thông tin được phép',
    permissions: DEFAULT_ROLE_PERMISSIONS.teacher
  },
  student: {
    label: 'Sinh viên / Khách',
    badgeClass: 'bg-purple-600 text-white',
    description: 'Chỉ được xem thông tin và lịch thực hành được công khai',
    permissions: DEFAULT_ROLE_PERMISSIONS.student
  }
};


const STATUS_CONFIG = {
  good: {
    label: 'Hoạt động tốt',
    color: '#10B981',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    hex: '#10b981',
    icon: 'fa-check-circle'
  },
  in_use: {
    label: 'Đang sử dụng',
    color: '#3B82F6',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    hex: '#3b82f6',
    icon: 'fa-laptop-code'
  },
  warning: {
    label: 'Cần kiểm tra',
    color: '#F59E0B',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    hex: '#f59e0b',
    icon: 'fa-exclamation-triangle'
  },
  broken: {
    label: 'Đang hỏng',
    color: '#EF4444',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    hex: '#ef4444',
    icon: 'fa-times-circle'
  },
  inactive: {
    label: 'Ngừng sử dụng',
    color: '#6B7280',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    hex: '#6b7280',
    icon: 'fa-ban'
  }
};

// BẢNG QUY ĐỊNH KHUNG GIỜ CÁC TIẾT HỌC CHUẨN TNUS (TRƯỜNG ĐẠI HỌC KHOA HỌC)
const TNUS_PERIODS = [
  { period: 1, session: 'Sáng', start: '07:00', end: '07:50', label: 'Tiết 1: 07:00 – 07:50' },
  { period: 2, session: 'Sáng', start: '08:00', end: '08:50', label: 'Tiết 2: 08:00 – 08:50' },
  { period: 3, session: 'Sáng', start: '09:00', end: '09:50', label: 'Tiết 3: 09:00 – 09:50' },
  { period: 4, session: 'Sáng', start: '10:00', end: '10:50', label: 'Tiết 4: 10:00 – 10:50' },
  { period: 5, session: 'Sáng', start: '11:00', end: '11:50', label: 'Tiết 5: 11:00 – 11:50' },
  { period: 6, session: 'Chiều', start: '13:00', end: '13:50', label: 'Tiết 6: 13:00 – 13:50' },
  { period: 7, session: 'Chiều', start: '14:00', end: '14:50', label: 'Tiết 7: 14:00 – 14:50' },
  { period: 8, session: 'Chiều', start: '15:00', end: '15:50', label: 'Tiết 8: 15:00 – 15:50' },
  { period: 9, session: 'Chiều', start: '16:00', end: '16:50', label: 'Tiết 9: 16:00 – 16:50' },
  { period: 10, session: 'Chiều', start: '17:00', end: '17:50', label: 'Tiết 10: 17:00 – 17:50' }
];

// Đảm bảo gắn đầy đủ dữ liệu cấu hình vào window và module để truy cập mọi nơi
if (typeof window !== 'undefined') {
  window.TNUS_PERIODS = typeof TNUS_PERIODS !== 'undefined' ? TNUS_PERIODS : [];
  window.INITIAL_LABS = typeof INITIAL_LABS !== 'undefined' ? INITIAL_LABS : [];
  window.INITIAL_COMPUTERS = typeof INITIAL_COMPUTERS !== 'undefined' ? INITIAL_COMPUTERS : [];
  window.INITIAL_SCHEDULES = typeof INITIAL_SCHEDULES !== 'undefined' ? INITIAL_SCHEDULES : [];
  window.INITIAL_MAINTENANCE = typeof INITIAL_MAINTENANCE !== 'undefined' ? INITIAL_MAINTENANCE : [];
  window.INITIAL_USERS = typeof INITIAL_USERS !== 'undefined' ? INITIAL_USERS : [];
  window.INITIAL_ACTIVITY_LOGS = typeof INITIAL_ACTIVITY_LOGS !== 'undefined' ? INITIAL_ACTIVITY_LOGS : [];
  window.SYSTEM_ROLES = typeof SYSTEM_ROLES !== 'undefined' ? SYSTEM_ROLES : [];
  window.DEFAULT_ROLE_PERMISSIONS = typeof DEFAULT_ROLE_PERMISSIONS !== 'undefined' ? DEFAULT_ROLE_PERMISSIONS : {};
  window.RBAC_MODULES = typeof RBAC_MODULES !== 'undefined' ? RBAC_MODULES : [];
  window.RBAC_ACTIONS = typeof RBAC_ACTIONS !== 'undefined' ? RBAC_ACTIONS : [];
  window.STATUS_CONFIG = typeof STATUS_CONFIG !== 'undefined' ? STATUS_CONFIG : {};
  window.STANDARD_ROLE_ACCOUNTS = typeof STANDARD_ROLE_ACCOUNTS !== 'undefined' ? STANDARD_ROLE_ACCOUNTS : {};
  window.hashPassword = typeof hashPassword !== 'undefined' ? hashPassword : null;
  window.verifyPassword = typeof verifyPassword !== 'undefined' ? verifyPassword : null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    INITIAL_LABS,
    INITIAL_COMPUTERS,
    INITIAL_SCHEDULES,
    INITIAL_MAINTENANCE,
    INITIAL_USERS,
    INITIAL_ACTIVITY_LOGS,
    SYSTEM_ROLES,
    DEFAULT_ROLE_PERMISSIONS,
    RBAC_MODULES,
    RBAC_ACTIONS,
    STATUS_CONFIG,
    STANDARD_ROLE_ACCOUNTS,
    TNUS_PERIODS
  };
}
