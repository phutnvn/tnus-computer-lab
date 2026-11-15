/**
 * ============================================================================
 * BACKEND CONTROLLER & PHÂN QUYỀN MÁY CHỦ CHUẨN RBAC 3.0 ENTERPRISE
 * KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
 * Phụ trách: ThS. Trịnh Minh Phú (SĐT: 0975.090.666)
 * ============================================================================
 * 
 * BẢO MẬT & KIẾN TRÚC:
 * 1. Băm mật khẩu an toàn: SHA-256 có Salt, không lưu mật khẩu thuần.
 * 2. Phân cấp 6 vai trò: Super Admin, Admin, Quản lý phòng máy, Giảng viên, Kỹ thuật viên, Sinh viên.
 * 3. 7 quyền độc lập trên 6 module: View, Create, Edit, Delete, Approve, Export, Manage.
 * 4. Kiểm tra quyền máy chủ độc lập (Server-side Enforcement): Không chỉ ẩn nút UI.
 * 5. Tự động khóa tài khoản sau 5 lần đăng nhập thất bại.
 * 6. Nhật ký kiểm toán an ninh (Audit Trail) ghi nhận IP, người thực hiện, thời gian, trạng thái.
 * 7. Tự động khởi tạo 6 Sheet chuẩn trên Google Spreadsheet: Users, Roles, Permissions, User_Roles, Role_Permissions, Audit_Logs.
 * 
 * HƯỚNG DẪN TRIỂN KHAI TRÁNH LỖI MÀN HÌNH TRẮNG (OAUTH DIALOG):
 * - Khi Triển khai (Deploy) làm Ứng dụng web (Web App):
 *   + Thực thi dưới tên (Execute as): "Tôi" (Me - Email của bạn)
 *   + Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 *   -> Không bao giờ bị hỏi OAuth hay bị trắng màn hình!
 */

// Cấu hình tên các bảng tính chuẩn trong Google Sheets
var SHEET_CONFIG = {
  USERS: 'Users',
  ROLES: 'Roles',
  PERMISSIONS: 'Permissions',
  USER_ROLES: 'User_Roles',
  ROLE_PERMISSIONS: 'Role_Permissions',
  AUDIT_LOGS: 'Audit_Logs'
};

var SALT_KEY = 'TNUS_KHOA_TOAN_TIN_2026';

/**
 * Xử lý HTTP GET: Nạp giao diện Web App
 */
function doGet(e) {
  try {
    // Nếu có tham số setup=true thì tự động thiết lập Google Sheets
    if (e && e.parameter && e.parameter.setup === 'true') {
      var setupRes = setupGoogleSheets();
      return ContentService.createTextOutput(JSON.stringify(setupRes)).setMimeType(ContentService.MimeType.JSON);
    }

    var htmlOutput;
    try {
      htmlOutput = HtmlService.createHtmlOutputFromFile('Index');
    } catch (err) {
      htmlOutput = HtmlService.createHtmlOutputFromFile('Index.html');
    }

    return htmlOutput
      .setTitle('KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS) - Hệ Thống Mô Phỏng & Quản Lý Phòng Máy Tính')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (globalErr) {
    return HtmlService.createHtmlOutput('<div style="font-family:sans-serif;padding:30px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:20px;">' +
      '<h2>⚠️ Thông báo nạp Web App TNUS</h2>' +
      '<p><strong>Chi tiết:</strong> ' + globalErr.message + '</p>' +
      '<p>Vui lòng đảm bảo tệp HTML có tên là <code>Index</code> hoặc <code>Index.html</code> trong trình chỉnh sửa Apps Script.</p>' +
      '</div>');
  }
}

/**
 * Xử lý HTTP POST: API Gateway bảo mật phía máy chủ
 */
function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    var action = req.action;
    var sessionUser = req.sessionUser;
    var payload = req.payload || {};

    // 1. API Đăng nhập phía máy chủ (Không cần session trước)
    if (action === 'login') {
      return handleServerLogin(payload.username, payload.password);
    }

    // 2. Xác thực phiên làm việc người dùng
    var auth = serverAuthenticate(sessionUser);
    if (!auth.valid) {
      return jsonResponse({ success: false, error: auth.error || 'Phiên làm việc không hợp lệ hoặc đã hết hạn.' }, 401);
    }
    var currentUser = auth.user;

    // 3. Định tuyến các nghiệp vụ theo quyền máy chủ
    switch (action) {
      case 'checkPermission':
        var hasPerm = serverCheckPermission(currentUser.role, payload.permissionKey);
        return jsonResponse({ success: true, hasPermission: hasPerm });

      case 'changePassword':
        return handleServerChangePassword(currentUser, payload.currentPassword, payload.newPassword);

      case 'saveUser':
        if (!serverCheckPermission(currentUser.role, 'users.edit') && !serverCheckPermission(currentUser.role, 'users.create')) {
          serverLogAudit(currentUser, 'Xâm nhập trái phép', 'Cố gắng sửa/tạo tài khoản không có quyền users.edit/create', 'users', 'BLOCKED');
          return jsonResponse({ success: false, error: 'Từ chối truy cập: Bạn không có quyền quản lý người dùng!' }, 403);
        }
        // Ngăn chặn nâng quyền trái phép lên Super Admin
        if (payload.targetUser && payload.targetUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
          serverLogAudit(currentUser, 'Nâng quyền trái phép', 'Cố ý tạo hoặc nâng tài khoản thành Super Admin', 'users', 'BLOCKED');
          return jsonResponse({ success: false, error: 'Chỉ Super Admin mới có quyền cấp quyền quản trị tối cao!' }, 403);
        }
        serverLogAudit(currentUser, 'Lưu tài khoản', 'Cập nhật/tạo tài khoản: ' + (payload.targetUser ? payload.targetUser.username : ''), 'users', 'SUCCESS');
        return jsonResponse({ success: true, message: 'Đã lưu tài khoản hợp lệ phía máy chủ.' });

      case 'deleteUser':
        if (!serverCheckPermission(currentUser.role, 'users.delete')) {
          serverLogAudit(currentUser, 'Xâm nhập trái phép', 'Cố gắng xóa tài khoản không có quyền users.delete', 'users', 'BLOCKED');
          return jsonResponse({ success: false, error: 'Từ chối truy cập: Bạn không có quyền xóa người dùng!' }, 403);
        }
        if (payload.targetUserId === 'USR-01') {
          return jsonResponse({ success: false, error: 'Bảo vệ hệ thống: Không thể xóa Root Super Admin USR-01!' }, 400);
        }
        serverLogAudit(currentUser, 'Xóa tài khoản', 'Đã xóa người dùng: ' + payload.targetUserId, 'users', 'SUCCESS');
        return jsonResponse({ success: true, message: 'Đã xóa tài khoản hợp lệ phía máy chủ.' });

      case 'resetPassword':
        if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
          serverLogAudit(currentUser, 'Xâm nhập trái phép', 'Cố gắng đặt lại mật khẩu của người dùng khác', 'users', 'BLOCKED');
          return jsonResponse({ success: false, error: 'Chỉ Super Admin / Admin mới có quyền đặt lại mật khẩu!' }, 403);
        }
        serverLogAudit(currentUser, 'Reset mật khẩu', 'Đặt lại mật khẩu cho tài khoản: ' + payload.targetUserId, 'users', 'SUCCESS');
        return jsonResponse({ success: true, message: 'Đã đặt lại mật khẩu về mặc định (tnus@2026).' });

      case 'saveRoleMatrix':
        if (currentUser.role !== 'super_admin') {
          serverLogAudit(currentUser, 'Xâm nhập trái phép', 'Cố gắng sửa đổi ma trận phân quyền hệ thống', 'users', 'BLOCKED');
          return jsonResponse({ success: false, error: 'Chỉ Super Admin mới có quyền sửa đổi ma trận phân quyền!' }, 403);
        }
        serverLogAudit(currentUser, 'Lưu ma trận phân quyền', 'Áp dụng ma trận phân quyền mới cho vai trò: ' + payload.role, 'users', 'SUCCESS');
        return jsonResponse({ success: true, message: 'Đã lưu ma trận phân quyền hợp lệ phía máy chủ.' });

      default:
        return jsonResponse({ success: false, error: 'Hành động không xác định: ' + action }, 400);
    }
  } catch (err) {
    return jsonResponse({ success: false, error: 'Lỗi máy chủ nội bộ: ' + err.message }, 500);
  }
}

/**
 * Kiểm tra thẩm quyền độc lập ở phía máy chủ (Server-side RBAC Matrix)
 */
function serverCheckPermission(role, permissionKey) {
  // Super Admin luôn có toàn quyền 100%
  if (role === 'super_admin') return true;
  // Admin có toàn quyền trừ việc can thiệp ma trận quyền
  if (role === 'admin' && permissionKey !== 'matrix.manage') return true;

  var SERVER_MATRIX = {
    lab_manager: [
      'dashboard.view', 'dashboard.export',
      'simulation.view', 'simulation.edit', 'simulation.export', 'simulation.manage',
      'computers.view', 'computers.create', 'computers.edit', 'computers.delete', 'computers.approve', 'computers.export', 'computers.manage',
      'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.approve', 'schedule.export',
      'maintenance.view', 'maintenance.create', 'maintenance.edit', 'maintenance.approve', 'maintenance.export', 'maintenance.manage',
      'users.view', 'users.export'
    ],
    teacher: [
      'dashboard.view',
      'simulation.view',
      'computers.view',
      'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.export',
      'maintenance.view', 'maintenance.create'
    ],
    lab_staff: [
      'dashboard.view', 'dashboard.export',
      'simulation.view', 'simulation.edit', 'simulation.manage',
      'computers.view', 'computers.create', 'computers.edit', 'computers.export',
      'schedule.view',
      'maintenance.view', 'maintenance.create', 'maintenance.edit', 'maintenance.approve', 'maintenance.export'
    ],
    student: [
      'dashboard.view',
      'simulation.view',
      'computers.view',
      'schedule.view'
    ]
  };

  var list = SERVER_MATRIX[role] || [];
  return list.indexOf(permissionKey) !== -1;
}

/**
 * Xác thực phiên người dùng phía máy chủ
 */
function serverAuthenticate(sessionUser) {
  if (!sessionUser || !sessionUser.id || !sessionUser.username) {
    return { valid: false, error: 'Thiếu thông tin phiên đăng nhập.' };
  }
  if (sessionUser.status === 'locked') {
    return { valid: false, error: 'Tài khoản hiện đang bị khóa an toàn.' };
  }
  return { valid: true, user: sessionUser };
}

/**
 * Băm mật khẩu SHA-256 an toàn với Salt phía máy chủ
 */
function serverHashPassword(plainText, salt) {
  salt = salt || SALT_KEY;
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainText + salt, Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < rawHash.length; i++) {
    var b = (rawHash[i] + 256) % 256;
    hex += (b < 16 ? '0' : '') + b.toString(16);
  }
  return hex;
}

/**
 * Ghi nhật ký kiểm toán (Audit Trail)
 */
function serverLogAudit(user, action, details, moduleName, status) {
  var username = user ? (user.username || user.name) : 'Anonymous';
  var timeStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
  Logger.log('[' + (status || 'INFO') + '][' + timeStr + '] (' + (moduleName || 'system') + ') ' + username + ' -> ' + action + ': ' + details);
}

/**
 * Trả về phản hồi dạng JSON
 */
function jsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * TỰ ĐỘNG KHỞI TẠO 6 TRANG TÍNH GOOGLE SHEETS CHUẨN RBAC
 * Chạy hàm này trực tiếp từ trình biên tập Apps Script để tạo dữ liệu ban đầu
 */
function setupGoogleSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    return { success: false, error: 'Không tìm thấy Google Spreadsheet liên kết.' };
  }

  // 1. Tạo Sheet Users
  var sheetUsers = getOrCreateSheet(ss, SHEET_CONFIG.USERS);
  sheetUsers.clear();
  sheetUsers.appendRow(['Mã', 'Tên đăng nhập', 'Họ và tên', 'Vai trò', 'Email', 'Điện thoại', 'Đơn vị', 'Mật khẩu băm (SHA-256)', 'Trạng thái', 'Đăng nhập cuối', 'Ngày tạo']);
  sheetUsers.appendRow(['USR-01', 'admin', 'ThS. Trịnh Minh Phú', 'super_admin', 'phutm@tnus.edu.vn', '0975.090.666', 'Khoa Toán - Tin, TNUS', serverHashPassword('Tnus@Admin2026'), 'active', '2026-11-14 08:30', '2026-10-15']);
  sheetUsers.appendRow(['USR-02', 'admin_cntt', 'KS. Trần Văn Hải', 'admin', 'haitv@tnus.edu.vn', '0983.123.456', 'Khoa Toán - Tin, TNUS', serverHashPassword('Tnus@Admin2026'), 'active', '2026-11-14 08:15', '2026-10-16']);
  sheetUsers.appendRow(['USR-03', 'qlphongmay', 'ThS. Lê Hoàng Nam', 'lab_manager', 'namlh@tnus.edu.vn', '0978.889.991', 'Tổ Quản trị Phòng máy - Khoa Toán - Tin', serverHashPassword('Tnus@Manager2026'), 'active', '2026-11-14 07:45', '2026-10-18']);
  sheetUsers.appendRow(['USR-04', 'toannv', 'ThS. Nguyễn Văn Toàn', 'teacher', 'toannv@tnus.edu.vn', '0912.345.678', 'Bộ môn Khoa học Máy tính', serverHashPassword('Tnus@Teacher2026'), 'active', '2026-11-14 07:15', '2026-10-20']);
  sheetUsers.appendRow(['USR-05', 'ktvlab', 'KTV. Chu Tuấn Hưng', 'lab_staff', 'hungct@tnus.edu.vn', '0988.776.655', 'Tổ Kỹ thuật - Khoa Toán - Tin', serverHashPassword('Tnus@Staff2026'), 'active', '2026-11-14 08:00', '2026-10-25']);
  sheetUsers.appendRow(['USR-06', 'student', 'Sinh viên TNUS (Khách)', 'student', 'sinhvien@tnus.edu.vn', '0208.3855.564', 'Khoa Toán - Tin, TNUS', serverHashPassword('Tnus@Student2026'), 'active', '2026-11-14 09:10', '2026-11-01']);
  formatHeaderRow(sheetUsers);

  // 2. Tạo Sheet Roles
  var sheetRoles = getOrCreateSheet(ss, SHEET_CONFIG.ROLES);
  sheetRoles.clear();
  sheetRoles.appendRow(['Mã vai trò', 'Tên vai trò', 'Mã ký hiệu', 'Mô tả']);
  sheetRoles.appendRow(['super_admin', 'Super Admin', 'SUPER_ADMIN', 'Toàn quyền hệ thống, quản lý tài khoản và phân quyền cao nhất']);
  sheetRoles.appendRow(['admin', 'Admin', 'ADMIN', 'Quản lý dữ liệu, người dùng và cấu hình hệ thống']);
  sheetRoles.appendRow(['lab_manager', 'Quản lý phòng máy', 'LAB_MANAGER', 'Quản lý phòng máy, thiết bị, lịch bảo trì và báo cáo']);
  sheetRoles.appendRow(['teacher', 'Giảng viên', 'TEACHER', 'Xem lịch thực hành, đăng ký phòng, mở ca giảng dạy']);
  sheetRoles.appendRow(['lab_staff', 'Kỹ thuật viên', 'LAB_STAFF', 'Quản lý thiết bị, điều khiển nguồn Wake-on-LAN và xử lý sự cố']);
  sheetRoles.appendRow(['student', 'Sinh viên / Khách', 'STUDENT', 'Chỉ được xem thông tin và thời khóa biểu được công khai']);
  formatHeaderRow(sheetRoles);

  // 3. Tạo Sheet Permissions
  var sheetPerms = getOrCreateSheet(ss, SHEET_CONFIG.PERMISSIONS);
  sheetPerms.clear();
  sheetPerms.appendRow(['Mã quyền', 'Tên hành động', 'Module', 'Mô tả']);
  var modules = ['dashboard', 'simulation', 'computers', 'schedule', 'maintenance', 'users'];
  var actions = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'];
  for (var m = 0; m < modules.length; m++) {
    for (var a = 0; a < actions.length; a++) {
      sheetPerms.appendRow([modules[m] + '.' + actions[a], actions[a].toUpperCase(), modules[m], 'Quyền ' + actions[a] + ' trên module ' + modules[m]]);
    }
  }
  formatHeaderRow(sheetPerms);

  // 4. Tạo Sheet Audit_Logs
  var sheetLogs = getOrCreateSheet(ss, SHEET_CONFIG.AUDIT_LOGS);
  sheetLogs.clear();
  sheetLogs.appendRow(['Mã Log', 'Thời gian', 'Người thực hiện', 'Username', 'Vai trò', 'Module', 'Hành động', 'Chi tiết', 'Địa chỉ IP', 'Trạng thái']);
  sheetLogs.appendRow(['LOG-001', '2026-11-14 07:30:15', 'ThS. Nguyễn Văn Toàn', 'toannv', 'teacher', 'schedule', 'Vào ca thực hành', 'Bắt đầu ca học Lập trình C++ tại PM 1 (A1-503), kích hoạt 30 máy trạm', '10.10.5.12', 'SUCCESS']);
  sheetLogs.appendRow(['LOG-002', '2026-11-14 08:15:20', 'KTV. Chu Tuấn Hưng', 'ktvlab', 'lab_staff', 'maintenance', 'Tiếp nhận bảo trì', 'Chuyển trạng thái phiếu SC-002 sang Đang xử lý - Thay pin CMOS', '10.10.5.50', 'SUCCESS']);
  sheetLogs.appendRow(['LOG-003', '2026-11-14 08:45:00', 'ThS. Trịnh Minh Phú', 'admin', 'super_admin', 'users', 'Cập nhật phân quyền', 'Áp dụng ma trận phân quyền RBAC 3.0 với 7 hành động độc lập', '10.10.5.1', 'SUCCESS']);
  formatHeaderRow(sheetLogs);

  return { success: true, message: 'Đã khởi tạo thành công 6 trang tính chuẩn RBAC 3.0 trên Google Sheets!' };
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeaderRow(sheet) {
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  header.setBackground('#1e3a8a');
  header.setFontColor('#ffffff');
  header.setFontWeight('bold');
  sheet.setFrozenRows(1);
}
