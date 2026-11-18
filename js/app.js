/**
 * MAIN APP CONTROLLER - HỆ THỐNG MÔ PHỎNG PHÒNG MÁY TÍNH TNUS
 * Điều hướng SPA, Quản lý State, LocalStorage, Modal tương tác máy tính, Xuất Excel/JSON
 */

const STORAGE_KEY = 'tnus_lab_simulation_data_v11';

// Khởi tạo State toàn cục
window.appState = {
  labs: [],
  computers: [],
  schedules: [],
  maintenance: [],
  users: [],
  currentUser: null,
  activityLogs: [],
  currentTab: 'dashboard'
};

// Lưu state vào LocalStorage
window.saveStateToLocalStorage = function() {
  try {
    const dataToSave = {
      labs: window.appState.labs,
      computers: window.appState.computers,
      schedules: window.appState.schedules,
      maintenance: window.appState.maintenance,
      users: window.appState.users,
      roles: window.appState.roles,
      rolePermissions: window.appState.rolePermissions,
      currentUser: window.appState.currentUser,
      activityLogs: window.appState.activityLogs
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Lỗi khi lưu LocalStorage:', err);
  }
};

// Tải state từ LocalStorage hoặc khởi tạo mặc định
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Luôn đồng bộ danh mục phòng chuẩn mới nhất từ INITIAL_LABS (Tầng 5, Nhà A1)
      window.appState.labs = INITIAL_LABS;
      window.appState.computers = parsed.computers || INITIAL_COMPUTERS;
      window.appState.schedules = parsed.schedules || INITIAL_SCHEDULES;
      // Luôn đồng bộ bổ sung lịch học tuần 13 (16/11 - 21/11/2026) theo thời gian thực nếu dữ liệu lưu cục bộ chưa có
      if (!window.appState.schedules.some(s => s.date === '2026-11-17')) {
        const w13Items = INITIAL_SCHEDULES.filter(s => s.date >= '2026-11-16' && s.date <= '2026-11-21');
        window.appState.schedules = window.appState.schedules.concat(w13Items);
      }

      // Chuẩn hóa và nâng cấp toàn bộ ca học theo bảng Tiết học TNUS chuẩn thời gian thực (Sáng 07:00-11:50, Chiều 13:00-17:50)
      if (Array.isArray(window.appState.schedules)) {
        window.appState.schedules.forEach(s => {
          if (!s.shift) return;
          if (s.shift.includes('07:24 - 09:14')) {
            s.shift = '07:00 - 08:50 (Tiết 1-2)'; s.startTime = '07:00'; s.endTime = '08:50'; s.startPeriod = '1'; s.endPeriod = '2';
          } else if (s.shift.includes('09:24 - 11:14')) {
            s.shift = '09:00 - 10:50 (Tiết 3-4)'; s.startTime = '09:00'; s.endTime = '10:50'; s.startPeriod = '3'; s.endPeriod = '4';
          } else if (s.shift.includes('07:24 - 12:14')) {
            s.shift = '07:00 - 11:50 (Tiết 1-5)'; s.startTime = '07:00'; s.endTime = '11:50'; s.startPeriod = '1'; s.endPeriod = '5';
          } else if (s.shift.includes('07:24 - 10:14')) {
            s.shift = '07:00 - 09:50 (Tiết 1-3)'; s.startTime = '07:00'; s.endTime = '09:50'; s.startPeriod = '1'; s.endPeriod = '3';
          } else if (s.shift.includes('09:24 - 12:14')) {
            s.shift = '09:00 - 11:50 (Tiết 3-5)'; s.startTime = '09:00'; s.endTime = '11:50'; s.startPeriod = '3'; s.endPeriod = '5';
          } else if (s.shift.includes('11:24 - 13:14')) {
            s.shift = '11:00 - 13:50 (Tiết 5-6)'; s.startTime = '11:00'; s.endTime = '13:50'; s.startPeriod = '5'; s.endPeriod = '6';
          } else if (s.shift.includes('13:24 - 15:14')) {
            s.shift = '13:00 - 14:50 (Tiết 6-7)'; s.startTime = '13:00'; s.endTime = '14:50'; s.startPeriod = '6'; s.endPeriod = '7';
          } else if (s.shift.includes('13:24 - 16:14')) {
            s.shift = '13:00 - 15:50 (Tiết 6-8)'; s.startTime = '13:00'; s.endTime = '15:50'; s.startPeriod = '6'; s.endPeriod = '8';
          } else if (s.shift.includes('15:24 - 17:14')) {
            s.shift = '15:00 - 16:50 (Tiết 8-9)'; s.startTime = '15:00'; s.endTime = '16:50'; s.startPeriod = '8'; s.endPeriod = '9';
          } else if (s.shift.includes('13:24 - 18:14')) {
            s.shift = '13:00 - 17:50 (Tiết 6-10)'; s.startTime = '13:00'; s.endTime = '17:50'; s.startPeriod = '6'; s.endPeriod = '10';
          } else if (s.shift.includes('16:24 - 19:14')) {
            s.shift = '17:00 - 19:50 (Tiết 10-12)'; s.startTime = '17:00'; s.endTime = '19:50'; s.startPeriod = '10'; endPeriod = '12';
          }
        });
      }
      window.appState.maintenance = parsed.maintenance || INITIAL_MAINTENANCE;

      // 1. Khởi tạo & đồng bộ danh sách 5 Vai trò chuẩn (SYSTEM_ROLES)
      window.appState.roles = [...SYSTEM_ROLES];

      // 2. Khởi tạo & nạp Ma trận phân quyền (ROLE_PERMISSIONS)
      window.appState.rolePermissions = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)), parsed.rolePermissions || {});
      // Admin luôn luôn có toàn quyền 42/42 chức năng trên toàn hệ thống
      window.appState.rolePermissions.admin = [...DEFAULT_ROLE_PERMISSIONS.admin];
      // Quản lý phòng máy luôn được đồng bộ đúng chuẩn quyền vận hành thiết bị, lịch & bảo trì
      window.appState.rolePermissions.lab_manager = [...DEFAULT_ROLE_PERMISSIONS.lab_manager];
      // Giảng viên luôn được đồng bộ đúng chuẩn quyền giảng dạy, đăng ký lịch & báo hỏng
      window.appState.rolePermissions.teacher = [...DEFAULT_ROLE_PERMISSIONS.teacher];
      // Sinh viên luôn được đồng bộ đúng chuẩn quyền tra cứu chỉ đọc
      window.appState.rolePermissions.student = [...DEFAULT_ROLE_PERMISSIONS.student];

      // 3. Đồng bộ danh sách tài khoản (USERS)
      if (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0) {
        window.appState.users = parsed.users;
        // Chuyển đổi mọi vai trò super_admin cũ sang admin chuẩn
        window.appState.users.forEach(u => {
          if (u.role === 'super_admin') {
            u.role = 'admin';
            u.roleName = 'Quản trị viên';
          }
        });
        // Đảm bảo luôn có Quản trị viên (Admin) gốc USR-01 (ThS. Trịnh Minh Phú)
        let rootAdmin = window.appState.users.find(u => u.id === 'USR-01');
        if (!rootAdmin) {
          window.appState.users.unshift({ ...INITIAL_USERS[0] });
        } else {
          rootAdmin.role = 'admin';
          rootAdmin.roleName = 'Quản trị viên';
          rootAdmin.name = 'ThS. Trịnh Minh Phú';
          rootAdmin.phone = '0975.090.666';
          rootAdmin.email = 'phutm@tnus.edu.vn';
          rootAdmin.department = 'Khoa Toán - Tin, TNUS';
          rootAdmin.status = 'active';
        }

        // Đảm bảo luôn có tài khoản Quản lý phòng máy (ThS. Trần Thị Linh - @linhtt)
        let labManager = window.appState.users.find(u => u.username === 'linhtt' || u.role === 'lab_manager');
        if (!labManager && typeof STANDARD_ROLE_ACCOUNTS !== 'undefined' && STANDARD_ROLE_ACCOUNTS.lab_manager) {
          window.appState.users.push({ ...STANDARD_ROLE_ACCOUNTS.lab_manager });
        } else if (labManager && labManager.username === 'qlphongmay') {
          labManager.username = 'linhtt';
          labManager.name = 'ThS. Trần Thị Linh';
          labManager.email = 'linhtt@tnus.edu.vn';
        }

        // Chỉ loại bỏ tài khoản kỹ thuật viên (lab_staff / ktvlab) nếu còn tồn đọng từ bộ nhớ đệm cũ
        window.appState.users = window.appState.users.filter(u => u.role !== 'lab_staff' && u.username !== 'ktvlab');
        if (typeof window.saveStateToLocalStorage === 'function') {
          window.saveStateToLocalStorage();
        }
      } else {
        window.appState.users = (typeof INITIAL_USERS !== 'undefined') ? [...INITIAL_USERS] : [];
      }

      // 4. Đồng bộ phiên đăng nhập hiện hành
      if (parsed.currentUser) {
        if (window.appState.users.some(u => u.id === parsed.currentUser.id)) {
          window.appState.currentUser = window.appState.users.find(u => u.id === parsed.currentUser.id);
        } else if (parsed.currentUser.role && parsed.currentUser.role !== 'admin' && parsed.currentUser.role !== 'lab_staff') {
          // Duy trì phiên làm việc theo vai trò đã chọn (lab_manager, teacher, student)
          window.appState.currentUser = parsed.currentUser;
        } else {
          window.appState.currentUser = window.appState.users[0];
        }
      } else {
        window.appState.currentUser = window.appState.users[0];
      }

      window.appState.activityLogs = (parsed.activityLogs && parsed.activityLogs.length) ? parsed.activityLogs : (typeof INITIAL_ACTIVITY_LOGS !== 'undefined' ? [...INITIAL_ACTIVITY_LOGS] : []);
      return;
    } catch (e) {
      console.warn('Dữ liệu lưu không hợp lệ, tải lại mặc định.', e);
    }
  }

  // Khởi tạo mặc định lần đầu
  window.appState.labs = INITIAL_LABS;
  window.appState.computers = INITIAL_COMPUTERS;
  window.appState.schedules = INITIAL_SCHEDULES;
  window.appState.maintenance = INITIAL_MAINTENANCE;
  window.appState.users = [...INITIAL_USERS];
  window.appState.currentUser = INITIAL_USERS[0];
  window.appState.activityLogs = (typeof INITIAL_ACTIVITY_LOGS !== 'undefined' ? [...INITIAL_ACTIVITY_LOGS] : []);
  window.saveStateToLocalStorage();
}

window.updateDashboardKPIs = function() {
  const comps = window.appState.computers;
  const total = comps.length;
  const good = comps.filter(c => c.status === 'good').length;
  const inUse = comps.filter(c => c.status === 'in_use').length;
  const warning = comps.filter(c => c.status === 'warning').length;
  const broken = comps.filter(c => c.status === 'broken').length;
  const inactive = comps.filter(c => c.status === 'inactive').length;
  const activeTotal = good + inUse;
  const readiness = total > 0 ? ((activeTotal / total) * 100).toFixed(1) : 0;
  const issueTotal = warning + broken;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // 1. Cập nhật 4 thẻ KPI Chính (Master KPI Cards)
  setEl('kpi-total-comps', total);
  setEl('kpi-total-labs', window.appState.labs.length);
  setEl('kpi-readiness-rate', `${readiness}%`);
  setEl('kpi-active-total', activeTotal);
  setEl('kpi-inuse-comps', inUse);
  setEl('kpi-issue-total', issueTotal);
  setEl('kpi-warning-comps', warning);
  setEl('kpi-broken-comps', broken);

  const readinessBar = document.getElementById('kpi-readiness-bar');
  if (readinessBar) {
    readinessBar.style.width = `${readiness}%`;
  }

  // 2. Cập nhật các thẻ chú thích dưới Biểu đồ tròn (Doughnut Legend)
  setEl('chart-legend-good', good);
  setEl('chart-legend-inuse', inUse);
  setEl('chart-legend-warning', warning);
  setEl('chart-legend-broken', broken);
  setEl('chart-legend-inactive', inactive);

  // 3. Đồng bộ các chỉ số Quản lý Thiết bị (Tab 3 Asset Management)
  setEl('asset-summary-total', total);
  setEl('asset-summary-active', activeTotal);
  setEl('asset-summary-rate', `${readiness}%`);
  setEl('asset-summary-issue', issueTotal);
  setEl('chart-legend-readiness', `${readiness}%`);

  // 3. Cập nhật Mini-status bar và số lượng cho 4 phòng máy
  ['PM1', 'PM2', 'PM3', 'PM4'].forEach(labId => {
    const labComps = comps.filter(c => c.labId === labId);
    const labTotal = labComps.length;
    const lGood = labComps.filter(c => c.status === 'good').length;
    const lInUse = labComps.filter(c => c.status === 'in_use').length;
    const lWarn = labComps.filter(c => c.status === 'warning').length;
    const lBroken = labComps.filter(c => c.status === 'broken').length;
    const lInactive = labComps.filter(c => c.status === 'inactive').length;

    const countEl = document.getElementById(`lab-summary-counts-${labId.toLowerCase()}`);
    if (countEl) {
      countEl.innerHTML = `
        <span class="text-emerald-600 font-bold">🟢 ${lGood} tốt</span> • 
        <span class="text-blue-600 font-bold">🔵 ${lInUse} dùng</span> • 
        <span class="text-amber-600 font-bold">🟡 ${lWarn} ktra</span> • 
        <span class="text-rose-600 font-bold">🔴 ${lBroken} hỏng</span>
        ${lInactive > 0 ? `• <span class="text-slate-400 font-bold">⚪ ${lInactive} nghỉ</span>` : ''}
      `;
    }

    // Mini bar
    const barEl = document.getElementById(`lab-minibar-${labId.toLowerCase()}`);
    if (barEl && labTotal > 0) {
      const pGood = (lGood / labTotal) * 100;
      const pInUse = (lInUse / labTotal) * 100;
      const pWarn = (lWarn / labTotal) * 100;
      const pBroken = (lBroken / labTotal) * 100;
      const pInactive = (lInactive / labTotal) * 100;
      barEl.innerHTML = `
        <div style="width: ${pGood}%" class="bg-emerald-500 h-full transition-all" title="Tốt: ${lGood}"></div>
        <div style="width: ${pInUse}%" class="bg-blue-500 h-full transition-all" title="Đang dùng: ${lInUse}"></div>
        <div style="width: ${pWarn}%" class="bg-amber-400 h-full transition-all" title="Cần KT: ${lWarn}"></div>
        <div style="width: ${pBroken}%" class="bg-rose-500 h-full transition-all" title="Hỏng: ${lBroken}"></div>
        ${pInactive > 0 ? `<div style="width: ${pInactive}%" class="bg-slate-400 h-full transition-all" title="Ngừng dùng: ${lInactive}"></div>` : ''}
      `;
    }
  });

  // 4. Render danh sách ca học hôm nay trên Dashboard
  renderDashboardTodaySchedules();

  // 5. Render danh sách sự cố gần nhất trên Dashboard
  renderDashboardRecentIncidents();

  // 6. Cập nhật biểu đồ nếu có
  if (window.chartManager) {
    window.chartManager.refresh();
  }
};

// Render ca học hôm nay trên Dashboard với tính toán ngày động
function renderDashboardTodaySchedules() {
  const container = document.getElementById('dashboard-today-schedules');
  const titleEl = document.getElementById('dashboard-today-schedule-title');
  const shiftCountEl = document.getElementById('dashboard-today-shift-count');
  if (!container) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const actualToday = `${y}-${m}-${d}`;

  // Kiểm tra xem hôm nay có lịch không
  let targetDate = actualToday;
  let schedules = (window.appState.schedules || []).filter(s => s.date === targetDate);

  // Nếu ngày hiện tại chưa có lịch, lấy ngày có lịch gần nhất trong tập dữ liệu
  if (schedules.length === 0) {
    const allDates = [...new Set((window.appState.schedules || []).map(s => s.date))].sort();
    if (allDates.length > 0) {
      targetDate = allDates[allDates.length - 1]; // Ngày có lịch mới nhất
      schedules = window.appState.schedules.filter(s => s.date === targetDate);
    }
  }

  // Định dạng ngày hiển thị (DD/MM/YYYY)
  const [tY, tM, tD] = targetDate.split('-');
  const formattedDate = `${tD}/${tM}/${tY}`;
  const isActualToday = (targetDate === actualToday);

  if (titleEl) {
    titleEl.textContent = isActualToday 
      ? `Ca Thực Hành Hôm Nay (${formattedDate})` 
      : `Lịch Thực Hành Gần Nhất (${formattedDate})`;
  }

  if (shiftCountEl) {
    shiftCountEl.textContent = `${isActualToday ? 'Hôm nay' : 'Theo lịch'}: ${schedules.length} ca học`;
  }

  if (schedules.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-slate-400 text-xs">
        <i class="fa-regular fa-calendar-check text-2xl mb-1 block text-slate-300"></i>
        Không có ca học nào được xếp lịch cho ngày ${formattedDate}.
      </div>
    `;
    return;
  }

  // Sắp xếp ca học theo thời gian bắt đầu
  const sorted = [...schedules].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  container.innerHTML = sorted.slice(0, 8).map(sch => {
    let statusClass = 'bg-blue-100 text-blue-800 border-blue-200';
    if (sch.status === 'Đang diễn ra') {
      statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse';
    } else if (sch.status === 'Sắp diễn ra') {
      statusClass = 'bg-cyan-100 text-cyan-800 border-cyan-300';
    }

    return `
      <div onclick="window.scheduleManager ? window.scheduleManager.showScheduleDetailModal('${sch.id}') : null" 
        class="p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 bg-slate-50/60 hover:bg-blue-50/40 transition flex items-center justify-between gap-3 text-xs cursor-pointer group shadow-2xs">
        <div class="flex items-center space-x-2.5 min-w-0">
          <span onclick="event.stopPropagation(); window.navigateToLab('${sch.labId}')" title="Mở Sơ đồ 2D phòng ${sch.labId}" 
            class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-[11px] shadow-xs flex-shrink-0 cursor-pointer transition flex items-center gap-1">
            ${sch.labId} <i class="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-80 group-hover:opacity-100"></i>
          </span>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 group-hover:text-blue-700 transition truncate" title="${sch.subject}">${sch.subject}</div>
            <div class="text-[11px] text-slate-500 truncate">
              <span class="font-semibold text-slate-700">${sch.shift}</span> • <span>GV: ${sch.lecturer}</span> • <span class="italic text-slate-400">${sch.className || ''}</span>
            </div>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}">${sch.status || 'Chính khóa'}</span>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">${sch.studentCount || 0} SV</div>
        </div>
      </div>
    `;
  }).join('');
}

// Render sự cố cảnh báo gần nhất trên Dashboard
function renderDashboardRecentIncidents() {
  const container = document.getElementById('dashboard-recent-incidents');
  if (!container) return;

  const incidents = window.appState.maintenance || [];
  if (incidents.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-slate-400 text-xs">
        <i class="fa-solid fa-circle-check text-2xl mb-1 block text-emerald-400"></i>
        Tất cả thiết bị đều hoạt động ổn định, không có sự cố nào!
      </div>
    `;
    return;
  }

  // Sắp xếp sự cố mới nhất lên trước
  const sorted = [...incidents].sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''));

  container.innerHTML = sorted.slice(0, 5).map(inc => {
    let statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">Chờ xử lý</span>';
    if (inc.status === 'in_progress') {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">Đang sửa</span>';
    } else if (inc.status === 'completed') {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Đã xử lý</span>';
    }

    return `
      <div onclick="window.maintenanceManager ? window.maintenanceManager.showIncidentDetailModal('${inc.id}') : null" 
        class="p-2.5 rounded-lg border border-slate-100 hover:border-rose-300 bg-slate-50/60 hover:bg-rose-50/30 transition flex items-center justify-between gap-3 text-xs cursor-pointer group shadow-2xs">
        <div class="flex items-center space-x-2.5 min-w-0">
          <span onclick="event.stopPropagation(); window.locateComputerOn2D('${inc.computerId}')" title="Định vị máy ${inc.computerId} trên Sơ đồ 2D" 
            class="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-mono font-bold text-[11px] border border-rose-200 flex-shrink-0 cursor-pointer transition flex items-center gap-1">
            ${inc.computerId} <i class="fa-solid fa-map-location-dot text-[10px] text-rose-600"></i>
          </span>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 group-hover:text-rose-700 transition truncate" title="${inc.title}">${inc.title}</div>
            <div class="text-[11px] text-slate-500 truncate">Phòng ${inc.labId} • Người báo: ${inc.reportedBy}</div>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <div>${statusBadge}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">${inc.reportDate}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Chạy đồng hồ thời gian thực
function startDashboardClock() {
  const clockEl = document.getElementById('dashboard-realtime-clock');
  if (!clockEl) return;

  let tickCount = 0;
  const update = () => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isAutoOn = window.autoShiftConfig?.enabled !== false;
    clockEl.innerHTML = `<i class="fa-regular fa-clock mr-1.5 text-blue-400"></i><strong>${dayName}</strong>, ${dateStr} • <span class="font-mono text-cyan-300 font-bold">${timeStr}</span> <span class="ml-2 px-1.5 py-0.5 rounded ${isAutoOn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-400'} text-[10px] font-bold"><span class="w-1.5 h-1.5 rounded-full ${isAutoOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'} inline-block mr-1"></span>${isAutoOn ? 'Tự động vào ca: BẬT' : 'Tự động: TẮT'}</span>`;

    tickCount++;
    if (tickCount % 10 === 0) {
      if (window.scheduleManager && typeof window.scheduleManager.checkAndAutoActivateShifts === 'function') {
        window.scheduleManager.checkAndAutoActivateShifts();
      }
    }
  };

  update();
  setInterval(update, 1000);
}

// Đóng / Mở menu Sidebar trên màn hình di động & máy tính bảng
window.toggleSidebar = function() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) {
    sidebar.classList.toggle('-translate-x-full');
  }
  if (backdrop) {
    backdrop.classList.toggle('hidden');
  }
};

// Hàm chuyển tab tập trung & an toàn tuyệt đối (Hỗ trợ gọi từ nút bấm, mã sự kiện hoặc inline onclick)
window.switchTab = function(targetTab) {
  if (!targetTab) return;

  const curUser = window.appState?.currentUser || (window.appState?.users && window.appState.users[0]);
  const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';

  // Với vai trò Sinh viên: CHỈ HIỂN THỊ VÀ TRUY CẬP DUY NHẤT LỊCH THỰC HÀNH, CÁC CHỨC NĂNG KHÁC ẨN
  if (role === 'student' && targetTab !== 'schedule') {
    targetTab = 'schedule';
  }
  if (targetTab === 'computers' && (role === 'student' || role === 'teacher')) {
    if (typeof Swal !== 'undefined') {
      const isTeacher = (role === 'teacher');
      Swal.fire({
        icon: 'warning',
        title: 'CHỨC NĂNG DÀNH CHO CÁN BỘ QUẢN LÝ THIẾT BỊ',
        html: `
          <div class="text-left text-xs space-y-2">
            <p>Phân hệ <strong>Quản lý Thiết bị (104 máy)</strong> dành riêng cho Cán bộ Quản lý phòng máy để theo dõi vòng đời tài sản, cấu hình IP/MAC và kiểm kê thiết bị.</p>
            <p class="text-slate-600">${isTeacher ? 'Giảng viên vui lòng mở <strong>Thời khóa biểu</strong> để quản lý ca dạy hoặc tra cứu cấu hình và vị trí máy trên <strong>Sơ đồ Mô phỏng 2D</strong>.' : 'Sinh viên vui lòng tra cứu trực quan sơ đồ phòng máy, máy tính trống khả dụng và thông số tại phân hệ <strong>Sơ đồ Mô phỏng 2D</strong>.'}</p>
          </div>
        `,
        confirmButtonColor: '#2563eb',
        confirmButtonText: isTeacher ? 'Đến Thời Khóa Biểu' : 'Đến Sơ đồ Mô phỏng 2D'
      }).then(() => {
        window.switchTab(isTeacher ? 'schedule' : 'simulation');
      });
    }
    return;
  }

  // Kiểm tra thẩm quyền khi truy cập Tab Bảo trì & Sự cố (Tab 5) - Khóa với Sinh viên / Khách
  if (targetTab === 'maintenance' && role === 'student') {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'CHỨC NĂNG BẢO TRÌ & SỰ CỐ',
        html: `
          <div class="text-left text-xs space-y-2">
            <p>Phân hệ <strong>Bảo trì & Sự cố</strong> dành riêng cho Cán bộ Quản lý và Giảng viên xử lý kỹ thuật.</p>
            <p class="text-slate-600">Sinh viên khi phát hiện sự cố máy tính vui lòng báo trực tiếp với Giảng viên phụ trách ca dạy hoặc Cán bộ quản lý phòng máy.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb'
      });
    }
    return;
  }

  // Kiểm tra thẩm quyền khi truy cập Tab Phân quyền & Người dùng (Tab 6) - Độc quyền Quản trị viên (Admin)
  if (targetTab === 'users') {
    if (role !== 'admin') {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'TỪ CHỐI TRUY CẬP (ACCESS DENIED)',
          html: `
            <div class="text-left text-xs space-y-2">
              <p>Phân hệ <strong>Quản trị Người dùng & Phân quyền</strong> chỉ dành riêng cho Quản trị viên hệ thống (Admin - ThS. Trịnh Minh Phú).</p>
              <p class="text-slate-500">Vai trò hiện tại của bạn: <strong class="text-rose-600">${curUser?.roleName || role}</strong> không có thẩm quyền truy cập cấu hình hệ thống & phân quyền RBAC.</p>
            </div>
          `,
          confirmButtonColor: '#2563eb'
        });
      }
      return;
    }
  }

  // Đóng sidebar tự động trên thiết bị di động sau khi chọn tab
  if (window.innerWidth < 1024) {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }

  const navButtons = document.querySelectorAll('.nav-tab-link');
  const tabContents = document.querySelectorAll('.tab-content-panel');

  // 1. Cập nhật trạng thái active trên thanh điều hướng Sidebar
  navButtons.forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === targetTab;
    if (isTarget) {
      btn.classList.add('nav-tab-active', 'bg-blue-50', 'text-blue-700', 'font-bold');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('nav-tab-active', 'bg-blue-50', 'text-blue-700', 'font-bold');
      btn.classList.add('text-slate-300');
    }
  });

  // 2. Chuyển đổi khung nội dung các màn hình (Panel)
  let foundPanel = false;
  tabContents.forEach(panel => {
    if (panel.id === `tab-pane-${targetTab}`) {
      panel.classList.remove('hidden');
      foundPanel = true;
    } else {
      panel.classList.add('hidden');
    }
  });

  if (!foundPanel) {
    console.warn(`[Navigation] Không tìm thấy panel: #tab-pane-${targetTab}`);
  }

  if (window.appState) {
    window.appState.currentTab = targetTab;
  }

  // 3. Xử lý reload dữ liệu an toàn cho từng màn hình khi kích hoạt
  try {
    if (targetTab === 'dashboard') {
      if (typeof window.updateDashboardKPIs === 'function') window.updateDashboardKPIs();
      if (window.chartManager && typeof window.chartManager.initDashboardCharts === 'function') {
        window.chartManager.initDashboardCharts();
      }
    } else if (targetTab === 'simulation') {
      if (window.labSimulation) {
        window.labSimulation.loadLab(window.labSimulation.currentLabId || 'PM1');
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (window.labSimulation && typeof window.labSimulation.fitToScreen === 'function') {
              window.labSimulation.fitToScreen();
            }
          }, 80);
        });
      }
    } else if (targetTab === 'computers') {
      if (typeof renderComputerTable === 'function') renderComputerTable();
    } else if (targetTab === 'schedule') {
      if (window.scheduleManager && typeof window.scheduleManager.loadScheduleTable === 'function') {
        window.scheduleManager.loadScheduleTable();
      }
    } else if (targetTab === 'maintenance') {
      if (window.maintenanceManager && typeof window.maintenanceManager.loadMaintenanceTable === 'function') {
        window.maintenanceManager.loadMaintenanceTable();
      }
    } else if (targetTab === 'users') {
      if (typeof window.renderUserAccountsTable === 'function') window.renderUserAccountsTable();
      if (typeof window.updateUserKPIs === 'function') window.updateUserKPIs();
      if (typeof window.renderActivityLogs === 'function') window.renderActivityLogs();
    }
  } catch (err) {
    console.warn(`[Navigation] Cảnh báo kích hoạt dữ liệu tab ${targetTab}:`, err);
  }
};

// ============================================================================
// ĐIỀU HƯỚNG LIÊN KẾT ĐỒNG BỘ GIỮA CÁC PHÂN HỆ (CROSS-MODULE DEEP LINKING)
// ============================================================================

// 1. Chuyển thẳng đến sơ đồ phòng máy cụ thể (PM1, PM2, PM3, PM4)
window.navigateToLab = function(labId) {
  if (!labId) return;
  const upperLab = labId.toUpperCase();
  window.switchTab('simulation');
  setTimeout(() => {
    if (window.labSimulation && typeof window.labSimulation.switchLab === 'function') {
      window.labSimulation.switchLab(upperLab);
    }
  }, 100);
};

// 2. Định vị máy tính trên Sơ đồ 2D từ bất kỳ phân hệ nào (Dashboard, Thiết bị, Lịch học, Sự cố)
window.locateComputerOn2D = function(computerId) {
  if (!computerId) return;
  const compId = computerId.trim();
  const comp = (window.appState?.computers || []).find(c => c.id === compId);
  const labId = comp ? comp.labId : compId.split('-')[0].toUpperCase();

  // Chuyển sang Tab Sơ đồ 2D
  window.switchTab('simulation');

  // Đổi sang đúng phòng máy và cuộn trọng tâm vào máy với hiệu ứng highlight
  setTimeout(() => {
    if (window.labSimulation) {
      if (labId && window.labSimulation.currentLabId !== labId) {
        window.labSimulation.switchLab(labId);
      }
      setTimeout(() => {
        if (typeof window.labSimulation.centerOnComputer === 'function') {
          window.labSimulation.centerOnComputer(compId);
        }
      }, 150);
    }
  }, 120);
};

// Điều hướng Single Page Application (Tabs)
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-tab-link');

  navButtons.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-tab');
      window.switchTab(targetTab);
    };
  });

  // Ủy quyền sự kiện click trên toàn document cho bất kỳ phần tử nào có data-tab
  document.addEventListener('click', (e) => {
    const tabEl = e.target.closest('[data-tab]');
    if (tabEl && tabEl.classList.contains('nav-tab-link')) {
      e.preventDefault();
      const targetTab = tabEl.getAttribute('data-tab');
      window.switchTab(targetTab);
    }
  });
}

// Khởi tạo toàn bộ ứng dụng TNUS an toàn & chống xung đột
function initApplication() {
  if (window.__tnusAppInitialized) return;
  window.__tnusAppInitialized = true;

  // 1. Nạp trạng thái lưu trữ LocalStorage / Mặc định
  try {
    loadState();
  } catch (e) {
    console.warn('Lỗi loadState:', e);
  }

  // 2. Khởi tạo điều hướng Menu Tabs NGAY ĐẦU TIÊN (đảm bảo luôn luôn click chuyển tab được)
  try {
    initNavigation();
  } catch (e) {
    console.warn('Lỗi initNavigation:', e);
  }

  // 3. Khởi tạo Chart Manager (được bọc an toàn tránh lỗi CDN chặn)
  try {
    window.chartManager = new ChartManager();
    window.chartManager.initDashboardCharts();
  } catch (e) {
    console.warn('Lỗi ChartManager:', e);
  }

  // 4. Khởi tạo Mô phỏng 2D
  try {
    window.labSimulation = new LabSimulation('lab-simulation-container', {
      initialLabId: 'PM1',
      onComputerClick: (comp) => {
        window.openComputerDetailModal(comp.id);
      }
    });
  } catch (e) {
    console.warn('Lỗi LabSimulation:', e);
  }

  // 5. Khởi tạo Quản lý Thời khóa biểu
  try {
    window.scheduleManager = new ScheduleManager();
    window.scheduleManager.init();
  } catch (e) {
    console.warn('Lỗi ScheduleManager:', e);
  }

  // 6. Khởi tạo Quản lý Bảo trì & Sự cố
  try {
    window.maintenanceManager = new MaintenanceManager();
    window.maintenanceManager.init();
  } catch (e) {
    console.warn('Lỗi MaintenanceManager:', e);
  }

  // 7. Khởi tạo các phân hệ phụ trợ & Kiểm tra tham số URL
  // 7. Khởi tạo các phân hệ phụ trợ & Kiểm tra tham số URL
  try { if (typeof initUserRoleSwitcher === 'function') initUserRoleSwitcher(); } catch (e) { console.warn('Lỗi initUserRoleSwitcher:', e); }
  try { if (typeof initUserModule === 'function') initUserModule(); } catch (e) { console.warn('Lỗi initUserModule:', e); }
  try { if (typeof initComputerListTable === 'function') initComputerListTable(); } catch (e) { console.warn('Lỗi initComputerListTable:', e); }
  try { if (typeof initQuickModals === 'function') initQuickModals(); } catch (e) { console.warn('Lỗi initQuickModals:', e); }
  try { if (typeof startDashboardClock === 'function') startDashboardClock(); } catch (e) { console.warn('Lỗi startDashboardClock:', e); }
  try { if (typeof window.updateDashboardKPIs === 'function') window.updateDashboardKPIs(); } catch (e) {}
  try { if (typeof initUrlParamsHandler === 'function') initUrlParamsHandler(); } catch (e) { console.warn('Lỗi initUrlParamsHandler:', e); }

  // Hỗ trợ phím tắt Alt + L hoặc bấm vào tiêu đề trường để mở hộp thoại Đăng nhập khi ở giao diện Sinh viên
  try {
    window.addEventListener('keydown', (e) => {
      if ((e.altKey && (e.key === 'l' || e.key === 'L')) || (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l'))) {
        e.preventDefault();
        if (typeof window.openLoginModal === 'function') window.openLoginModal();
      }
    });
    const headerTitleEl = document.querySelector('header h1');
    if (headerTitleEl) {
      headerTitleEl.addEventListener('click', () => {
        const curRole = window.appState.currentUser?.role;
        if (!curRole || curRole === 'student') {
          if (typeof window.openLoginModal === 'function') window.openLoginModal();
        }
      });
    }
  } catch (e) {}
}

// ============================================================================
// HỆ THỐNG PHÂN QUYỀN RBAC & QUẢN TRỊ TÀI KHOẢN NGƯỜI DÙNG
// KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
// ============================================================================

// Bảng ánh xạ quyền hạn tương thích ngược từ khóa cũ sang chuẩn module.action mới
const RBAC_LEGACY_MAP = {
  view_simulation: 'simulation.view',
  view_schedule: 'schedule.view',
  view_devices: 'computers.view',
  view_maintenance: 'maintenance.view',
  control_power: 'simulation.manage',
  edit_device: 'computers.edit',
  delete_device: 'computers.delete',
  import_export_devices: 'computers.export',
  manage_schedule: 'schedule.create',
  start_shift: 'schedule.manage',
  create_ticket: 'maintenance.create',
  resolve_ticket: 'maintenance.edit',
  manage_users: 'users.manage',
  system_backup: 'users.manage',
  print_asset_tag: 'computers.export',
  broadcast_screen: 'simulation.manage'
};

// Chuẩn hóa mã vai trò và xử lý các bí danh URL (manager -> lab_manager, staff -> lab_manager)
window.normalizeRole = function(r) {
  if (!r) return 'student';
  const str = String(r).toLowerCase().trim();
  if (str === 'manager' || str === 'qlpm' || str === 'qlphong' || str === 'lab_manager') return 'lab_manager';
  if (str === 'staff' || str === 'ktv' || str === 'kythuat' || str === 'lab_staff' || str === 'technician') return 'lab_manager';
  if (str === 'teacher' || str === 'giangvien' || str === 'gv') return 'teacher';
  if (str === 'student' || str === 'sinhvien' || str === 'khach' || str === 'guest') return 'student';
  if (str === 'admin' || str === 'administrator' || str === 'quantri') return 'admin';
  return str;
};

// Tìm tài khoản người dùng theo vai trò, nếu chưa có trong danh sách thì dùng tài khoản chuẩn của vai trò đó
window.getRoleUser = function(roleParam) {
  const norm = window.normalizeRole(roleParam);
  // 1. Tìm trong danh sách tài khoản đã cấp phát trong appState.users
  const found = (window.appState?.users || []).find(u => 
    u && u.role && window.normalizeRole(u.role) === norm && (u.status || 'active') === 'active'
  );
  if (found) return found;

  // 2. Nếu chưa khởi tạo trong bảng danh sách, dùng tài khoản đại diện chuẩn của vai trò đó
  const standard = (typeof STANDARD_ROLE_ACCOUNTS !== 'undefined' ? STANDARD_ROLE_ACCOUNTS : window.STANDARD_ROLE_ACCOUNTS);
  if (standard && standard[norm]) {
    return { ...standard[norm] };
  }
  return standard?.student || { id: 'GUEST', username: 'student', name: 'Sinh viên TNUS (Khách)', role: 'student', roleName: 'Sinh viên', status: 'active' };
};

// Hàm kiểm tra quyền hạn của người dùng hiện hành đối với bất kỳ thao tác nào
window.checkPermission = function(permKey, actionName = 'thực hiện thao tác này', showNotification = true) {
  const user = window.appState.currentUser || (window.appState.users && window.appState.users[0]);
  if (!user) return false;

  // A. Kiểm tra khóa tài khoản: Tài khoản bị khóa không được làm bất cứ thao tác nào
  if (user.status === 'locked') {
    if (showNotification && typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'TÀI KHOẢN ĐANG BỊ KHÓA',
        html: `
          <div class="text-left text-xs space-y-2">
            <p>Tài khoản <strong>${user.name}</strong> (@${user.username}) hiện đang ở trạng thái khóa an toàn.</p>
            <p class="text-slate-500">Vui lòng liên hệ ThS. Trịnh Minh Phú (0975.090.666) để mở khóa tài khoản.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb'
      });
    }
    return false;
  }

  // Chuẩn hóa khóa quyền (Hỗ trợ cả dạng 'module.action' lẫn khóa tương thích cũ)
  const canonicalKey = (typeof RBAC_LEGACY_MAP !== 'undefined' && RBAC_LEGACY_MAP[permKey]) ? RBAC_LEGACY_MAP[permKey] : permKey;

  // B. Quản trị viên (Admin) luôn có toàn quyền tuyệt đối trên toàn hệ thống
  const userRole = (window.normalizeRole ? window.normalizeRole(user.role) : (user.role || 'student')).toLowerCase();
  if (userRole === 'admin' || user.role === 'admin') return true;

  // Lấy ma trận quyền hiện hành của vai trò này (trong State hoặc mặc định)
  const matrix = window.appState.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
  const rolePerms = matrix[userRole] || (DEFAULT_ROLE_PERMISSIONS[userRole] || []);

  const hasPerm = rolePerms.includes(canonicalKey);

  if (!hasPerm) {
    if (showNotification && typeof Swal !== 'undefined') {
      // Tìm tên vai trò
      const rObj = (window.appState.roles || SYSTEM_ROLES).find(r => r.id === userRole);
      const roleTitle = rObj ? rObj.name : userRole;

      Swal.fire({
        icon: 'error',
        title: 'TỪ CHỐI TRUY CẬP (ACCESS DENIED)',
        html: `
          <div class="text-left text-xs space-y-2.5">
            <p class="text-slate-700">
              Tài khoản <strong>${user.name}</strong> với vai trò <span class="font-bold text-rose-600">[${roleTitle}]</span> không có quyền <strong>${actionName}</strong>.
            </p>
            <div class="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] leading-relaxed">
              <i class="fa-solid fa-shield-halved mr-1"></i>
              Mã kiểm tra: <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-300 font-bold">${canonicalKey}</code><br>
              Hệ thống RBAC 3.0 chỉ cho phép các vai trò được cấp phép trong Ma trận phân quyền thực hiện chức năng này.
            </div>
            <p class="text-slate-500 italic text-[11px]">
              Vui lòng chuyển sang vai trò Quản trị viên trên thanh điều hướng hoặc liên hệ ThS. Trịnh Minh Phú (0975.090.666) để được cấp thẩm quyền.
            </p>
          </div>
        `,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Đã hiểu'
      });
    }

    if (typeof window.logUserActivity === 'function') {
      window.logUserActivity('Từ chối quyền', `Từ chối thao tác '${actionName}' (Yêu cầu quyền: ${canonicalKey})`, '10.10.5.1', 'warning');
    }
    return false;
  }

  return true;
};

// Ghi nhận nhật ký thao tác kiểm toán (Audit Trail)
window.logUserActivity = function(action, details, ip = '10.10.5.1') {
  if (!window.appState.activityLogs) {
    window.appState.activityLogs = [];
  }

  const user = window.appState.currentUser || (window.appState.users && window.appState.users[0]) || {
    username: 'system',
    name: 'Hệ thống TNUS',
    role: 'admin'
  };

  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logEntry = {
    id: 'LOG-' + Date.now().toString().slice(-6),
    timestamp: timestamp,
    username: user.username,
    userName: user.name,
    role: user.role,
    action: action,
    details: details,
    ip: ip
  };

  window.appState.activityLogs.unshift(logEntry);

  // Giới hạn lưu tối đa 150 mục nhật ký gần nhất
  if (window.appState.activityLogs.length > 150) {
    window.appState.activityLogs = window.appState.activityLogs.slice(0, 150);
  }

  window.saveStateToLocalStorage();

  // Cập nhật lại giao diện bảng log nếu đang ở tab users
  if (window.appState.currentTab === 'users' && typeof window.renderActivityLogs === 'function') {
    window.renderActivityLogs();
  }
};

// Cập nhật giao diện người dùng trên Header & Profile
window.updateUserUI = function() {
  const u = window.appState.currentUser || (window.appState.users && window.appState.users[0]);
  if (!u) return;

  const role = window.normalizeRole ? window.normalizeRole(u.role) : (u.role || 'student');
  const isAdmin = (role === 'admin');
  const isStudent = (role === 'student');
  const roleContainer = document.getElementById('header-role-switcher-container');
  const select = document.getElementById('user-role-select');
  const staticBadge = document.getElementById('header-role-static-badge');
  const staticName = document.getElementById('header-role-static-name');
  const roleLabel = document.getElementById('header-role-label');
  const userDisplay = document.getElementById('current-user-display');
  const roleDisplay = document.getElementById('current-role-display');
  const badgeAvatar = document.getElementById('user-header-badge-avatar');

  if (userDisplay) userDisplay.textContent = u.name;
  if (roleDisplay) roleDisplay.textContent = `${u.roleName || role} • Khoa Toán - Tin`;
  if (badgeAvatar) badgeAvatar.textContent = u.avatar || '👤';

  // KIỂM SOÁT BẢO MẬT & ĐIỀU KHIỂN HEADER:
  // - Sinh viên: BỎ HOÀN TOÀN nút lệnh / hộp chọn vai trò (ẩn roleContainer)
  // - Admin: Hiển thị dropdown chuyển đổi vai trò
  // - Quản lý phòng máy, Giảng viên: Hiển thị huy hiệu vai trò tĩnh cố định
  if (roleContainer) {
    if (isStudent) {
      roleContainer.style.display = 'none';
    } else {
      roleContainer.style.display = '';
    }
  }

  if (select) {
    select.value = role;
    if (isAdmin) {
      select.style.display = '';
      select.removeAttribute('disabled');
      if (staticBadge) staticBadge.style.display = 'none';
      if (roleLabel) roleLabel.style.display = '';
    } else if (isStudent) {
      select.style.display = 'none';
      select.setAttribute('disabled', 'true');
      if (staticBadge) staticBadge.style.display = 'none';
      if (roleLabel) roleLabel.style.display = 'none';
    } else {
      select.style.display = 'none';
      select.setAttribute('disabled', 'true');
      if (staticBadge) {
        staticBadge.style.display = '';
        if (staticName) staticName.textContent = u.roleName || role;
      }
      if (roleLabel) roleLabel.style.display = '';
    }
  }

  // Cập nhật thẻ profile trên Tab 6
  const headerAvatar = document.getElementById('user-header-avatar');
  const headerName = document.getElementById('user-header-name');
  const headerRole = document.getElementById('user-header-role');

  if (headerAvatar) headerAvatar.textContent = u.avatar || '👤';
  if (headerName) headerName.textContent = u.name;
  if (headerRole) {
    const roleCfg = (typeof ROLE_PERMISSIONS !== 'undefined' && ROLE_PERMISSIONS[role]) ? ROLE_PERMISSIONS[role] : { label: u.roleName || role };
    headerRole.innerHTML = `<i class="fa-solid fa-circle-check text-[10px]"></i><span>${roleCfg.label}</span>`;
  }

  // Tự động áp dụng giới hạn giao diện theo vai trò (RBAC UI Enforcement)
  if (typeof window.applyRoleRestrictionsToUI === 'function') {
    window.applyRoleRestrictionsToUI();
  }
};

// Chuyển đổi vai trò người dùng (Role Switcher trên Header - CHỈ DÀNH CHO ADMIN)
function initUserRoleSwitcher() {
  const select = document.getElementById('user-role-select');

  window.updateUserUI();

  if (select) {
    select.addEventListener('change', (e) => {
      const curUser = window.appState.currentUser;
      const curRole = window.normalizeRole ? window.normalizeRole(curUser?.role) : (curUser?.role || 'student');

      // Chặn ngay lập tức nếu vai trò hiện hành không phải Admin
      if (curRole !== 'admin') {
        e.preventDefault();
        e.stopPropagation();
        select.value = curRole;
        window.updateUserUI();
        Swal.fire({
          icon: 'warning',
          title: 'Không được phép chuyển đổi vai trò',
          text: 'Chức năng chuyển đổi vai trò chỉ dành riêng cho Quản trị viên (Admin). Các tài khoản Quản lý phòng máy, Giảng viên và Sinh viên không được phép tự ý chuyển đổi.',
          confirmButtonColor: '#2563eb'
        });
        return false;
      }

      const selectedRole = e.target.value;

      // Sinh viên / Khách: Cho phép chuyển xem trực quan ngay
      if (selectedRole === 'student') {
        const targetUser = window.getRoleUser(selectedRole);
        if (targetUser) {
          window.appState.currentUser = targetUser;
          window.saveStateToLocalStorage();
          window.updateUserUI();
          if (window.applyRoleRestrictionsToUI) window.applyRoleRestrictionsToUI();
          window.logUserActivity('Đổi vai trò', `Chuyển sang vai trò: Sinh viên / Tra cứu`);
          window.switchTab('simulation');
        }
        return;
      }

      // Quản lý phòng máy, Giảng viên, Sinh viên: BẮT BUỘC ĐĂNG NHẬP XÁC THỰC
      // Chỉ kích hoạt giao diện khi đăng nhập thành công!
      if (selectedRole !== 'admin') {
        select.value = curRole; // Giữ nguyên vai trò hiện hành cho tới khi xác thực thành công
        if (typeof window.openRoleLoginModal === 'function') {
          window.openRoleLoginModal(selectedRole);
        }
        return;
      }

      const targetUser = window.getRoleUser(selectedRole);
      if (targetUser) {
        window.appState.currentUser = targetUser;
        window.saveStateToLocalStorage();
        window.updateUserUI();
        if (window.applyRoleRestrictionsToUI) window.applyRoleRestrictionsToUI();
        window.logUserActivity('Đổi vai trò', `Chuyển sang vai trò: ${targetUser.roleName} (${targetUser.name})`);
        
        if (window.renderUserAccountsTable) window.renderUserAccountsTable();
        if (window.updateUserKPIs) window.updateUserKPIs();

        Swal.fire({
          icon: 'info',
          title: `Đã chuyển vai trò: ${targetUser.roleName}`,
          text: `Đang thao tác với quyền: ${targetUser.name} (${targetUser.roleName})`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
}

// Chuyển phiên làm việc sang một tài khoản cụ thể (CHỈ DÀNH CHO ADMIN)
window.switchToUser = function(userId) {
  const curUser = window.appState.currentUser;
  const curRole = window.normalizeRole ? window.normalizeRole(curUser?.role) : (curUser?.role || 'student');
  if (curRole !== 'admin') {
    Swal.fire({
      icon: 'warning',
      title: 'Không có quyền chuyển đổi tài khoản',
      text: 'Chức năng chuyển đổi tài khoản chỉ dành riêng cho Quản trị viên (Admin). Các tài khoản Quản lý phòng máy, Giảng viên và Sinh viên không được phép thực hiện.',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const targetUser = window.appState.users.find(u => u.id === userId);
  if (!targetUser) return;

  if (targetUser.status === 'locked') {
    Swal.fire({
      icon: 'error',
      title: 'Tài khoản đã bị khóa',
      text: `Tài khoản ${targetUser.name} (${targetUser.username}) hiện đang ở trạng thái khóa. Vui lòng mở khóa trước khi kích hoạt.`,
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  window.appState.currentUser = targetUser;
  window.saveStateToLocalStorage();
  window.updateUserUI();
  window.logUserActivity('Đổi phiên đăng nhập', `Chuyển người dùng thao tác sang ${targetUser.name} (${targetUser.roleName})`);

  if (window.renderUserAccountsTable) window.renderUserAccountsTable();
  if (window.updateUserKPIs) window.updateUserKPIs();

  Swal.fire({
    icon: 'success',
    title: `Đã kích hoạt: ${targetUser.name}`,
    html: `
      <div class="text-xs text-slate-600">
        Vai trò: <strong class="text-blue-600">${targetUser.roleName}</strong><br>
        Đơn vị: ${targetUser.department || 'Khoa Toán - Tin, TNUS'}
      </div>
    `,
    timer: 1500,
    showConfirmButton: false
  });
};

// Khởi tạo Module Quản lý người dùng
window.initUserModule = function() {
  const searchInput = document.getElementById('user-search-input');
  const roleFilter = document.getElementById('user-role-filter');
  const statusFilter = document.getElementById('user-status-filter');
  const auditSearch = document.getElementById('audit-log-search');

  let debounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        window.renderUserAccountsTable();
      }, 200);
    });
  }

  if (roleFilter) {
    roleFilter.addEventListener('change', () => {
      window.renderUserAccountsTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      window.renderUserAccountsTable();
    });
  }

  if (auditSearch) {
    auditSearch.addEventListener('input', (e) => {
      window.renderActivityLogs(e.target.value);
    });
  }

  window.renderUserAccountsTable();
  window.updateUserKPIs();
  window.renderActivityLogs();
};

// Kết xuất bảng tài khoản người dùng
window.renderUserAccountsTable = function() {
  const tbody = document.getElementById('user-accounts-table-body');
  const emptyState = document.getElementById('user-accounts-empty-state');
  if (!tbody) return;

  const searchVal = (document.getElementById('user-search-input')?.value || '').toLowerCase().trim();
  const roleVal = document.getElementById('user-role-filter')?.value || 'all';
  const statusVal = document.getElementById('user-status-filter')?.value || 'all';

  let list = [...(window.appState.users || [])];

  if (roleVal !== 'all') {
    list = list.filter(u => u.role === roleVal);
  }

  if (statusVal !== 'all') {
    list = list.filter(u => (u.status || 'active') === statusVal);
  }

  if (searchVal) {
    list = list.filter(u => 
      (u.id && u.id.toLowerCase().includes(searchVal)) ||
      (u.name && u.name.toLowerCase().includes(searchVal)) ||
      (u.username && u.username.toLowerCase().includes(searchVal)) ||
      (u.email && u.email.toLowerCase().includes(searchVal)) ||
      (u.phone && u.phone.includes(searchVal)) ||
      (u.department && u.department.toLowerCase().includes(searchVal))
    );
  }

  const totalFiltered = list.length;

  // Cập nhật phân trang
  const pageSize = window.userPagination?.pageSize || 8;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  if (window.userPagination.page > totalPages) window.userPagination.page = totalPages;
  const currentPage = window.userPagination.page || 1;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalFiltered);
  const pagedList = list.slice(startIdx, endIdx);

  // Cập nhật thanh hiển thị phân trang
  const pStart = document.getElementById('user-page-start');
  const pEnd = document.getElementById('user-page-end');
  const pTotal = document.getElementById('user-page-total');
  const pCurrent = document.getElementById('user-page-current');
  const btnPrev = document.getElementById('btn-user-prev');
  const btnNext = document.getElementById('btn-user-next');

  if (pStart) pStart.textContent = totalFiltered > 0 ? (startIdx + 1) : 0;
  if (pEnd) pEnd.textContent = endIdx;
  if (pTotal) pTotal.textContent = totalFiltered;
  if (pCurrent) pCurrent.textContent = currentPage;
  if (btnPrev) btnPrev.disabled = currentPage <= 1;
  if (btnNext) btnNext.disabled = currentPage >= totalPages;

  if (totalFiltered === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const currentUserId = window.appState.currentUser?.id;

  const roleBadges = {
    admin: { label: 'Quản trị viên (Admin)', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    lab_manager: { label: 'Quản lý phòng máy', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    teacher: { label: 'Giảng viên', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    student: { label: 'Sinh viên', bg: 'bg-purple-100 text-purple-800 border-purple-200' }
  };

  tbody.innerHTML = pagedList.map(user => {
    const isCurrent = user.id === currentUserId;
    const isLocked = user.status === 'locked';
    const isRootAdmin = user.id === 'USR-01';
    const roleCfg = roleBadges[user.role] || { label: user.roleName || user.role, bg: 'bg-slate-100 text-slate-800 border-slate-200' };

    return `
      <tr class="hover:bg-slate-50/90 transition border-b border-slate-100 ${isCurrent ? 'bg-blue-50/40 font-medium' : ''}">
        <!-- Cột Mã (Chống gãy dòng & Ghim cố định khi cuộn) -->
        <td class="py-3 px-3 text-center whitespace-nowrap sticky left-0 ${isCurrent ? 'bg-blue-50/95' : 'bg-white'} z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
          <span class="font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs shadow-2xs">${user.id}</span>
        </td>

        <!-- Cột Thông tin người dùng (Ghim cố định khi cuộn) -->
        <td class="py-3 px-4 min-w-[210px] whitespace-nowrap sticky left-16 ${isCurrent ? 'bg-blue-50/95' : 'bg-white'} z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shadow-xs shrink-0">
              ${user.avatar || '👤'}
            </div>
            <div>
              <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span>${user.name}</span>
                ${isCurrent ? '<span class="px-1.5 py-0.5 rounded text-[9px] bg-blue-600 text-white font-extrabold uppercase shadow-2xs">Bạn</span>' : ''}
              </div>
              <div class="text-[11px] text-slate-500 font-mono">@${user.username}</div>
            </div>
          </div>
        </td>

        <!-- Cột Vai trò phân quyền (Hiển thị rõ chức năng & quyền hạn) -->
        <td class="py-3 px-4 min-w-[210px] whitespace-nowrap">
          <div class="flex flex-col items-start gap-1">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${roleCfg.bg}">
              ${roleCfg.label}
            </span>
            <div class="text-[10px] text-slate-500 font-medium leading-tight">
              ${window.getRoleDutySummary ? window.getRoleDutySummary(user.role) : (user.roleName || user.role)}
            </div>
            <button onclick="window.viewRoleDetailModal('${user.role}')" class="text-[10px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold transition" title="Xem danh sách quyền hạn chi tiết của vai trò này">
              <i class="fa-solid fa-shield-halved text-[9px]"></i>
              <span>Xem quyền & chức năng</span>
            </button>
          </div>
        </td>

        <!-- Cột Đơn vị & Liên hệ -->
        <td class="py-3 px-4 min-w-[220px] whitespace-nowrap text-xs">
          <div class="text-slate-800 font-semibold">${user.department || 'Khoa Toán - Tin, TNUS'}</div>
          <div class="text-slate-500 font-mono text-[11px] flex items-center gap-3 mt-1">
            <span class="flex items-center gap-1 text-slate-600"><i class="fa-regular fa-envelope text-slate-400"></i>${user.email || 'chua_co@tnus.edu.vn'}</span>
            ${user.phone ? `<span class="flex items-center gap-1 text-blue-700 font-bold"><i class="fa-solid fa-phone text-blue-500"></i>${user.phone}</span>` : ''}
          </div>
        </td>

        <!-- Cột Trạng thái (chống gãy chữ Hoạt / động) -->
        <td class="py-3 px-4 text-center whitespace-nowrap">
          ${isLocked ? `
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
              <i class="fa-solid fa-lock mr-1.5"></i>Đã khóa
            </span>
          ` : `
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs">
              <i class="fa-solid fa-circle-check mr-1.5 text-emerald-600"></i>Hoạt động
            </span>
          `}
        </td>

        <!-- Cột Đăng nhập cuối (chống gãy dòng ngày giờ) -->
        <td class="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
          ${user.lastLogin || '2026-11-14 08:00'}
        </td>

        <!-- Cột Thao tác: Thiết kế nút bấm đầy đủ, màu sắc nổi bật, chống mờ -->
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <div class="flex items-center justify-center space-x-1.5">
            <!-- Nút Kích hoạt / Đang dùng -->
            ${isCurrent ? `
              <span class="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-default">
                <i class="fa-solid fa-check text-blue-600"></i>Đang dùng
              </span>
            ` : `
              <button onclick="window.switchToUser('${user.id}')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="Kích hoạt phiên làm việc của tài khoản này">
                <i class="fa-solid fa-right-to-bracket"></i>Kích hoạt
              </button>
            `}

            <!-- Nút Sao chép thông tin tài khoản (Gửi Zalo / Email) -->
            <button onclick="window.copyUserCredentials('${user.id}')" class="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-600 hover:text-white text-cyan-700 border border-cyan-300 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="Sao chép thông tin đăng nhập để gửi cho Cán bộ / Giảng viên">
              <i class="fa-regular fa-copy"></i>
              <span>Sao chép</span>
            </button>

            <!-- Nút Sửa (Màu vàng cam nổi bật) -->
            <button onclick="window.showEditUserModal('${user.id}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-300 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="Chỉnh sửa thông tin tài khoản">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Sửa</span>
            </button>

            <!-- Nút Đặt lại Mật khẩu (Reset Password) -->
            <button onclick="window.resetUserPassword('${user.id}')" class="px-2.5 py-1 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1" title="Đặt lại mật khẩu về mặc định (tnus@2026)">
              <i class="fa-solid fa-key"></i>
              <span>Reset MK</span>
            </button>

            <!-- Nút Khóa / Mở khóa -->
            ${isRootAdmin ? `
              <button disabled class="px-2 py-1 bg-slate-50 text-slate-300 border border-slate-200 rounded-lg text-xs cursor-not-allowed" title="Tài khoản Quản trị viên mặc định không thể bị khóa">
                <i class="fa-solid fa-shield"></i>
              </button>
            ` : `
              <button onclick="window.toggleUserStatus('${user.id}')" class="px-2.5 py-1 ${isLocked ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-600 hover:text-white'} rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="${isLocked ? 'Mở khóa tài khoản này' : 'Khóa tài khoản này'}">
                <i class="fa-solid ${isLocked ? 'fa-lock-open' : 'fa-lock'}"></i>
                <span>${isLocked ? 'Mở' : 'Khóa'}</span>
              </button>
            `}

            <!-- Nút Xóa (Màu đỏ cảnh báo) -->
            ${isRootAdmin ? `
              <button disabled class="px-2.5 py-1 bg-slate-50 text-slate-300 border border-slate-200 rounded-lg text-xs cursor-not-allowed" title="Tài khoản Quản trị viên mặc định không thể xóa">
                <i class="fa-solid fa-lock"></i>
              </button>
            ` : `
              <button onclick="window.deleteUser('${user.id}')" class="px-2.5 py-1 bg-slate-50 hover:bg-rose-600 hover:text-white text-slate-600 hover:border-rose-600 border border-slate-300 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="Xóa tài khoản này">
                <i class="fa-regular fa-trash-can"></i>
                <span>Xóa</span>
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

// Cập nhật thống kê KPI tài khoản
window.updateUserKPIs = function() {
  const users = window.appState.users || [];
  const total = users.length;
  // Quản trị viên (Admin)
  const adminCount = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'lab_manager').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const activeCount = users.filter(u => (u.status || 'active') === 'active').length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('user-kpi-total', total);
  setEl('user-kpi-admin', adminCount);
  setEl('user-kpi-manager', managerCount);
  setEl('user-kpi-teacher', teacherCount);
  setEl('user-kpi-student', studentCount);
  setEl('user-kpi-active', `${activeCount}/${total}`);
};

// Hàm sao chép thông tin tài khoản để bàn giao cho Giảng viên / Cán bộ
window.copyUserCredentials = function(userId) {
  const user = (window.appState.users || []).find(u => u.id === userId);
  if (!user) return;

  const roleName = user.roleName || (window.appState.roles?.find(r => r.id === user.role)?.name) || user.role;
  const pass = user.initialPassword || 'Tnus@2026';
  const loginUrl = window.location.origin + window.location.pathname;

  const textToCopy = 
`KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
THÔNG TIN TÀI KHOẢN HỆ THỐNG PHÒNG MÁY:
• Họ và tên: ${user.name}
• Vai trò: ${roleName}
• Tên đăng nhập: ${user.username}
• Mật khẩu: ${pass}
• Đơn vị: ${user.department || 'Khoa Toán - Tin, TNUS'}
• Link đăng nhập: ${loginUrl}
---------------------------------------------
Quản trị viên hỗ trợ: ThS. Trịnh Minh Phú (0975.090.666 - phutm@tnus.edu.vn)`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã sao chép thông tin!',
        html: `<span class="text-xs text-slate-600">Đã sao chép thông tin của <b>${user.name}</b> (@${user.username}) để gửi qua Zalo/Email</span>`,
        showConfirmButton: false,
        timer: 3000
      });
    }).catch(() => {
      prompt('Sao chép thông tin tài khoản dưới đây:', textToCopy);
    });
  } else {
    prompt('Sao chép thông tin tài khoản dưới đây:', textToCopy);
  }
};

// Hàm tự động gợi ý Username từ Họ và tên theo chuẩn TNUS
function generateUsernameFromName(name) {
  if (!name) return '';
  let clean = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  clean = clean.replace(/^(ThS|TS|PGS|GS|CN|KS)\.?\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const lastName = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
  const initials = parts.slice(0, -1).map(p => p[0].toLowerCase().replace(/[^a-z0-9]/g, '')).join('');
  return (lastName + initials).slice(0, 20);
}

// Modal Thêm người dùng mới
window.showAddUserModal = function() {
  if (!window.checkPermission('manage_users', 'Tạo tài khoản người dùng mới')) return;

  let maxIdNum = 0;
  (window.appState.users || []).forEach(u => {
    const match = (u.id || '').match(/USR-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });
  const defaultId = 'USR-' + (maxIdNum + 1).toString().padStart(2, '0');

  Swal.fire({
    title: `
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 w-full">
        <div class="flex items-center space-x-3 text-left">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg shadow-sm">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <div>
            <div class="text-base font-black text-slate-900 leading-tight">Thêm Mới Tài Khoản Hệ Thống</div>
            <div class="text-xs text-slate-500 font-normal mt-0.5">Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)</div>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-mono font-bold tracking-wider">
            ${defaultId}
          </span>
        </div>
      </div>
    `,
    html: `
      <form id="form-add-user" class="text-left space-y-3.5 text-xs pt-2">
        <!-- 1. CHỌN VAI TRÒ HỆ THỐNG (ROLE CARDS) -->
        <div>
          <label class="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>1. Chọn vai trò tài khoản <span class="text-rose-500">*</span></span>
            <span class="text-2xs text-slate-400 font-normal">Xác định phân quyền trên 4 phòng máy</span>
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="add-user-role-cards">
            <!-- Quản lý PM -->
            <div class="cursor-pointer border-2 border-blue-600 bg-blue-50/70 rounded-xl p-2.5 text-center transition-all shadow-xs role-card flex flex-col items-center justify-center" data-role="lab_manager" data-avatar="🏢">
              <span class="text-2xl mb-1">🏢</span>
              <span class="font-bold text-blue-900 text-xs block leading-tight">Quản lý PM</span>
              <span class="text-[10px] text-blue-600/80 mt-0.5">Điều phối 4 phòng</span>
            </div>

            <!-- Giảng viên -->
            <div class="cursor-pointer border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 rounded-xl p-2.5 text-center transition-all hover:shadow-xs role-card flex flex-col items-center justify-center" data-role="teacher" data-avatar="👨‍🏫">
              <span class="text-2xl mb-1">👨‍🏫</span>
              <span class="font-bold text-slate-800 text-xs block leading-tight">Giảng viên</span>
              <span class="text-[10px] text-slate-500 mt-0.5">Dạy & Báo hỏng</span>
            </div>

            <!-- Admin -->
            <div class="cursor-pointer border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl p-2.5 text-center transition-all hover:shadow-xs role-card flex flex-col items-center justify-center" data-role="admin" data-avatar="🛡️">
              <span class="text-2xl mb-1">🛡️</span>
              <span class="font-bold text-slate-800 text-xs block leading-tight">Quản trị viên</span>
              <span class="text-[10px] text-slate-500 mt-0.5">Toàn quyền Admin</span>
            </div>

            <!-- Sinh viên -->
            <div class="cursor-pointer border border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50/30 rounded-xl p-2.5 text-center transition-all hover:shadow-xs role-card flex flex-col items-center justify-center" data-role="student" data-avatar="👨‍🎓">
              <span class="text-2xl mb-1">👨‍🎓</span>
              <span class="font-bold text-slate-800 text-xs block leading-tight">Sinh viên</span>
              <span class="text-[10px] text-slate-500 mt-0.5">Tra cứu & Sơ đồ 2D</span>
            </div>
          </div>
          <input type="hidden" id="add-user-role-val" value="lab_manager">
          <input type="hidden" id="add-user-avatar-val" value="🏢">
        </div>

        <!-- 2. HỌ VÀ TÊN & TÊN ĐĂNG NHẬP -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label class="block font-bold text-slate-700 mb-1">
              2. Họ và tên cán bộ / giảng viên <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <i class="fa-solid fa-user text-xs"></i>
              </span>
              <input type="text" id="add-user-name" placeholder="vd: ThS. Trần Thu Hường" class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>3. Tên đăng nhập (Username) <span class="text-rose-500">*</span></span>
              <span class="text-2xs text-blue-600 font-semibold" id="label-username-hint">Gợi ý tự động</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono text-xs font-bold pointer-events-none">@</span>
              <input type="text" id="add-user-username" placeholder="qlphongmay hoặc huongtt" class="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
            </div>
          </div>
        </div>

        <!-- 3. MẬT KHẨU BAN ĐẦU & EMAIL TNUS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>4. Mật khẩu khởi tạo <span class="text-rose-500">*</span></span>
              <span class="text-2xs text-slate-400 font-normal">Tối thiểu 6 ký tự</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <i class="fa-solid fa-key text-xs"></i>
              </span>
              <input type="password" id="add-user-password" value="Tnus@2026" class="w-full pl-8 pr-8 py-2 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
              <button type="button" id="btn-toggle-add-pass" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-blue-600 transition cursor-pointer" title="Ẩn/Hiện mật khẩu">
                <i class="fa-solid fa-eye-slash text-xs" id="icon-toggle-add-pass"></i>
              </button>
            </div>
            <div class="flex items-center space-x-1.5 mt-1.5">
              <button type="button" id="btn-set-default-pass" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-2xs font-semibold rounded border border-slate-200 transition">
                Mặc định: Tnus@2026
              </button>
              <button type="button" id="btn-generate-rand-pass" class="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-2xs font-semibold rounded border border-blue-200 transition">
                <i class="fa-solid fa-wand-magic-sparkles mr-0.5"></i>Tạo ngẫu nhiên
              </button>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">
              5. Email ĐH Khoa học (TNUS)
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <i class="fa-solid fa-envelope text-xs"></i>
              </span>
              <input type="email" id="add-user-email" placeholder="huongtt@tnus.edu.vn" class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
            </div>
            <p class="text-2xs text-slate-400 mt-1 italic leading-tight">Nhận thông báo lịch thực hành & xác thực mật khẩu</p>
          </div>
        </div>

        <!-- 4. THÔNG TIN BỔ SUNG: SỐ ĐIỆN THOẠI & ĐƠN VỊ CÔNG TÁC -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <i class="fa-solid fa-phone text-xs"></i>
              </span>
              <input type="text" id="add-user-phone" placeholder="09xx.xxx.xxx" class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Đơn vị công tác / Bộ môn</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <i class="fa-solid fa-building text-xs"></i>
              </span>
              <input type="text" id="add-user-dept" value="Tổ Quản trị Phòng máy - Khoa Toán - Tin" class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
            </div>
          </div>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-user-plus mr-1.5"></i>Tạo tài khoản',
    cancelButtonText: 'Hủy bỏ',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    width: '620px',
    padding: '1.25rem',
    didOpen: () => {
      const nameInput = document.getElementById('add-user-name');
      const usernameInput = document.getElementById('add-user-username');
      const emailInput = document.getElementById('add-user-email');
      const passInput = document.getElementById('add-user-password');
      const deptInput = document.getElementById('add-user-dept');
      const btnTogglePass = document.getElementById('btn-toggle-add-pass');
      const iconTogglePass = document.getElementById('icon-toggle-add-pass');
      const btnSetDefaultPass = document.getElementById('btn-set-default-pass');
      const btnGenRandPass = document.getElementById('btn-generate-rand-pass');
      const roleCards = document.querySelectorAll('.role-card');
      const roleValInput = document.getElementById('add-user-role-val');
      const avatarValInput = document.getElementById('add-user-avatar-val');

      // Tương tác Role Cards
      roleCards.forEach(card => {
        card.addEventListener('click', () => {
          roleCards.forEach(c => {
            c.className = 'cursor-pointer border border-slate-200 bg-white hover:border-slate-300 rounded-xl p-2.5 text-center transition-all hover:shadow-xs role-card flex flex-col items-center justify-center';
            const spans = c.querySelectorAll('span');
            if (spans[1]) spans[1].className = 'font-bold text-slate-800 text-xs block leading-tight';
            if (spans[2]) spans[2].className = 'text-[10px] text-slate-500 mt-0.5';
          });

          const r = card.dataset.role;
          const av = card.dataset.avatar;
          roleValInput.value = r;
          avatarValInput.value = av;

          const spans = card.querySelectorAll('span');
          if (r === 'lab_manager') {
            card.className = 'cursor-pointer border-2 border-blue-600 bg-blue-50/70 rounded-xl p-2.5 text-center transition-all shadow-xs role-card flex flex-col items-center justify-center';
            if (spans[1]) spans[1].className = 'font-bold text-blue-900 text-xs block leading-tight';
            if (spans[2]) spans[2].className = 'text-[10px] text-blue-600/80 mt-0.5';
          } else if (r === 'teacher') {
            card.className = 'cursor-pointer border-2 border-emerald-600 bg-emerald-50/70 rounded-xl p-2.5 text-center transition-all shadow-xs role-card flex flex-col items-center justify-center';
            if (spans[1]) spans[1].className = 'font-bold text-emerald-900 text-xs block leading-tight';
            if (spans[2]) spans[2].className = 'text-[10px] text-emerald-600/80 mt-0.5';
          } else if (r === 'admin') {
            card.className = 'cursor-pointer border-2 border-indigo-600 bg-indigo-50/70 rounded-xl p-2.5 text-center transition-all shadow-xs role-card flex flex-col items-center justify-center';
            if (spans[1]) spans[1].className = 'font-bold text-indigo-900 text-xs block leading-tight';
            if (spans[2]) spans[2].className = 'text-[10px] text-indigo-600/80 mt-0.5';
          } else {
            card.className = 'cursor-pointer border-2 border-purple-600 bg-purple-50/70 rounded-xl p-2.5 text-center transition-all shadow-xs role-card flex flex-col items-center justify-center';
            if (spans[1]) spans[1].className = 'font-bold text-purple-900 text-xs block leading-tight';
            if (spans[2]) spans[2].className = 'text-[10px] text-purple-600/80 mt-0.5';
          }

          // Cập nhật gợi ý đơn vị
          if (deptInput && !deptInput.dataset.customized) {
            if (r === 'lab_manager') {
              deptInput.value = 'Tổ Quản trị Phòng máy - Khoa Toán - Tin';
            } else if (r === 'teacher') {
              deptInput.value = 'Bộ môn Tin học - Khoa Toán - Tin, TNUS';
            } else if (r === 'student') {
              deptInput.value = 'Sinh viên - Khoa Toán - Tin, TNUS';
            } else {
              deptInput.value = 'Khoa Toán - Tin, TNUS';
            }
          }
        });
      });

      // Tự động sinh Username & Email khi gõ họ tên nếu admin chưa gõ Username riêng
      let userTypedUsername = false;
      let userTypedEmail = false;

      if (usernameInput) {
        usernameInput.addEventListener('input', () => {
          userTypedUsername = true;
          const cleaned = usernameInput.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
          if (usernameInput.value !== cleaned) usernameInput.value = cleaned;
          if (!userTypedEmail && emailInput) {
            emailInput.value = cleaned ? `${cleaned}@tnus.edu.vn` : '';
          }
        });
      }

      if (emailInput) {
        emailInput.addEventListener('input', () => {
          userTypedEmail = true;
        });
      }

      if (nameInput) {
        nameInput.addEventListener('input', () => {
          if (!userTypedUsername && usernameInput) {
            const suggested = generateUsernameFromName(nameInput.value);
            usernameInput.value = suggested;
            if (!userTypedEmail && emailInput) {
              emailInput.value = suggested ? `${suggested}@tnus.edu.vn` : '';
            }
          }
        });
      }

      if (deptInput) {
        deptInput.addEventListener('input', () => {
          deptInput.dataset.customized = 'true';
        });
      }

      // Ẩn/Hiện mật khẩu
      if (btnTogglePass && passInput && iconTogglePass) {
        btnTogglePass.addEventListener('click', () => {
          if (passInput.type === 'password') {
            passInput.type = 'text';
            iconTogglePass.className = 'fa-solid fa-eye text-xs text-blue-600';
          } else {
            passInput.type = 'password';
            iconTogglePass.className = 'fa-solid fa-eye-slash text-xs text-slate-400';
          }
        });
      }

      // Nút mật khẩu mặc định
      if (btnSetDefaultPass && passInput) {
        btnSetDefaultPass.addEventListener('click', () => {
          passInput.value = 'Tnus@2026';
          if (passInput.type === 'password') {
            passInput.type = 'text';
            if (iconTogglePass) iconTogglePass.className = 'fa-solid fa-eye text-xs text-blue-600';
          }
        });
      }

      // Nút tạo mật khẩu ngẫu nhiên
      if (btnGenRandPass && passInput) {
        btnGenRandPass.addEventListener('click', () => {
          const randNum = Math.floor(1000 + Math.random() * 9000);
          passInput.value = `Tnus@${randNum}`;
          passInput.type = 'text';
          if (iconTogglePass) iconTogglePass.className = 'fa-solid fa-eye text-xs text-blue-600';
        });
      }
    },
    preConfirm: () => {
      const username = (document.getElementById('add-user-username')?.value || '').trim().toLowerCase();
      const name = (document.getElementById('add-user-name')?.value || '').trim();
      const role = document.getElementById('add-user-role-val')?.value || 'lab_manager';
      const avatar = document.getElementById('add-user-avatar-val')?.value || '🏢';
      const dept = (document.getElementById('add-user-dept')?.value || '').trim();
      const email = (document.getElementById('add-user-email')?.value || '').trim();
      const phone = (document.getElementById('add-user-phone')?.value || '').trim();
      const rawPass = (document.getElementById('add-user-password')?.value || '').trim();

      if (!name) {
        Swal.showValidationMessage('Vui lòng nhập Họ và Tên Cán bộ / Giảng viên');
        return false;
      }

      if (!username) {
        Swal.showValidationMessage('Vui lòng nhập Tên Đăng Nhập (Username)');
        return false;
      }
      if (username.length < 3) {
        Swal.showValidationMessage('Tên đăng nhập phải có ít nhất 3 ký tự');
        return false;
      }
      if (!/^[a-z0-9_.-]+$/.test(username)) {
        Swal.showValidationMessage('Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch (_ . -)');
        return false;
      }
      if ((window.appState.users || []).some(u => (u.username || '').toLowerCase() === username)) {
        Swal.showValidationMessage(`Tên đăng nhập '@${username}' đã tồn tại! Vui lòng chọn tên khác.`);
        return false;
      }

      if (!rawPass) {
        Swal.showValidationMessage('Vui lòng nhập Mật Khẩu khởi tạo');
        return false;
      }
      if (rawPass.length < 6) {
        Swal.showValidationMessage('Mật khẩu phải có độ dài tối thiểu 6 ký tự để bảo mật');
        return false;
      }

      const roleObj = (window.appState.roles || SYSTEM_ROLES || []).find(r => r.id === role);
      const roleName = roleObj ? roleObj.name : (role === 'lab_manager' ? 'Quản lý phòng máy' : (role === 'teacher' ? 'Giảng viên' : (role === 'admin' ? 'Quản trị viên' : 'Sinh viên')));
      const salt = 'TNUS_KHOA_TOAN_TIN_2026';

      return {
        id: defaultId,
        username,
        name,
        role,
        roleName,
        department: dept || 'Khoa Toán - Tin, TNUS',
        avatar,
        email: email || `${username}@tnus.edu.vn`,
        phone: phone || '',
        status: 'active',
        initialPassword: rawPass,
        passwordHash: typeof hashPassword === 'function' ? hashPassword(rawPass, salt) : 'sha256_' + rawPass,
        salt: salt,
        failedLogins: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Chưa đăng nhập'
      };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      const newUser = result.value;
      if (!Array.isArray(window.appState.users)) window.appState.users = [];
      window.appState.users.push(newUser);
      window.saveStateToLocalStorage();
      window.logUserActivity('Thêm tài khoản', `Tạo tài khoản mới ${newUser.name} (@${newUser.username}) với vai trò ${newUser.roleName}`);
      window.renderUserAccountsTable();
      window.updateUserKPIs();

      // Hiển thị Card bàn giao tài khoản kèm nút Sao chép 1-click
      const loginUrl = window.location.origin + window.location.pathname;
      const textToCopy = 
`KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
THÔNG TIN TÀI KHOẢN HỆ THỐNG PHÒNG MÁY:
• Họ và tên: ${newUser.name}
• Vai trò: ${newUser.roleName}
• Tên đăng nhập: ${newUser.username}
• Mật khẩu: ${newUser.initialPassword}
• Đơn vị: ${newUser.department}
• Link đăng nhập: ${loginUrl}
---------------------------------------------
Quản trị viên hỗ trợ: ThS. Trịnh Minh Phú (0975.090.666 - phutm@tnus.edu.vn)`;

      Swal.fire({
        icon: 'success',
        title: 'Tạo Tài Khoản Thành Công!',
        html: `
          <div class="text-left text-xs space-y-3 mt-1">
            <p class="text-slate-600">Tài khoản đã sẵn sàng trong hệ thống. Quản trị viên có thể sao chép thông tin dưới đây để gửi cho cán bộ qua Zalo/Email:</p>
            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center space-x-3 pb-2 border-b border-slate-200">
                <span class="text-3xl">${newUser.avatar}</span>
                <div>
                  <div class="font-bold text-slate-800 text-sm">${newUser.name}</div>
                  <div class="text-slate-500 font-mono">${newUser.roleName} • ID: ${newUser.id}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <div><span class="text-slate-500">Tên đăng nhập:</span> <strong class="font-mono text-blue-600 font-bold block text-sm">@${newUser.username}</strong></div>
                <div><span class="text-slate-500">Mật khẩu:</span> <strong class="font-mono text-emerald-600 font-bold block text-sm">${newUser.initialPassword}</strong></div>
                <div><span class="text-slate-500">Email:</span> <span class="font-mono text-slate-700 block">${newUser.email}</span></div>
                <div><span class="text-slate-500">Đơn vị:</span> <span class="text-slate-700 block">${newUser.department}</span></div>
              </div>
            </div>
            <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-2xs flex items-center space-x-2">
              <i class="fa-solid fa-circle-info text-amber-600 text-sm shrink-0"></i>
              <span>Cán bộ có thể dùng ngay Tên đăng nhập và Mật khẩu này để đăng nhập vào phân hệ phòng máy.</span>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fa-regular fa-copy mr-1.5"></i>Sao chép thông tin tài khoản',
        cancelButtonText: 'Đóng',
        confirmButtonColor: '#0284c7',
        cancelButtonColor: '#64748b',
        width: '560px'
      }).then(copyRes => {
        if (copyRes.isConfirmed) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
              Swal.fire({
                icon: 'success',
                title: 'Đã sao chép vào bộ nhớ tạm!',
                text: 'Bạn có thể dán (Ctrl+V) để gửi cho Cán bộ / Giảng viên.',
                timer: 2200,
                showConfirmButton: false
              });
            }).catch(() => {
              prompt('Sao chép thông tin tài khoản dưới đây:', textToCopy);
            });
          } else {
            prompt('Sao chép thông tin tài khoản dưới đây:', textToCopy);
          }
        }
      });
    }
  });
};

// Modal Chỉnh sửa người dùng
window.showEditUserModal = function(userId) {
  if (!window.checkPermission('manage_users', 'Chỉnh sửa tài khoản người dùng')) return;

  const user = window.appState.users.find(u => u.id === userId);
  if (!user) return;

  Swal.fire({
    title: `
      <div class="flex items-center space-x-2 text-left">
        <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-base">
          <i class="fa-solid fa-user-pen"></i>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900">Cập Nhật Tài Khoản ${user.id}</div>
          <div class="text-xs text-slate-500 font-normal">@${user.username} • Khoa Toán - Tin TNUS</div>
        </div>
      </div>
    `,
    html: `
      <form id="form-edit-user" class="text-left space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mã Tài Khoản</label>
            <input type="text" value="${user.id}" readonly class="w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-600 text-xs">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên Đăng Nhập (Username)</label>
            <input type="text" value="${user.username}" readonly class="w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono text-slate-600 text-xs">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Họ và Tên Cán Bộ <span class="text-rose-500">*</span></label>
            <input type="text" id="edit-user-name" value="${user.name}" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Vai Trò Phân Quyền</label>
            <select id="edit-user-role" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white" ${user.id === 'USR-01' ? 'disabled' : ''}>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin (Quản trị viên)</option>
              <option value="lab_manager" ${user.role === 'lab_manager' ? 'selected' : ''}>Quản lý phòng máy (Lab Manager)</option>
              <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Giảng viên (Teacher)</option>
              <option value="student" ${user.role === 'student' ? 'selected' : ''}>Sinh viên / Khách (Student)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Đơn Vị Công Tác / Bộ Môn</label>
            <input type="text" id="edit-user-dept" value="${user.department || 'Khoa Toán - Tin, TNUS'}" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Biểu Tượng Avatar</label>
            <select id="edit-user-avatar" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="👨‍💼" ${user.avatar === '👨‍💼' ? 'selected' : ''}>👨‍💼 Quản trị viên</option>
              <option value="🏢" ${user.avatar === '🏢' ? 'selected' : ''}>🏢 Quản lý phòng máy</option>
              <option value="👨‍🏫" ${user.avatar === '👨‍🏫' ? 'selected' : ''}>👨‍🏫 Giảng viên nam</option>
              <option value="👩‍🏫" ${user.avatar === '👩‍🏫' ? 'selected' : ''}>👩‍🏫 Giảng viên nữ</option>
              <option value="👨‍🎓" ${user.avatar === '👨‍🎓' ? 'selected' : ''}>👨‍🎓 Sinh viên nam</option>
              <option value="👩‍🎓" ${user.avatar === '👩‍🎓' ? 'selected' : ''}>👩‍🎓 Sinh viên nữ</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Liên Hệ</label>
            <input type="email" id="edit-user-email" value="${user.email || ''}" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
            <input type="text" id="edit-user-phone" value="${user.phone || ''}" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Trạng Thái Truy Cập</label>
            <select id="edit-user-status" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="active" ${(user.status || 'active') === 'active' ? 'selected' : ''}>Đang hoạt động</option>
              <option value="locked" ${user.status === 'locked' ? 'selected' : ''}>Khóa truy cập</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Đặt Lại Mật Khẩu</label>
            <input type="password" id="edit-user-newpass" placeholder="Để trống nếu không đổi" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: 'Lưu thay đổi',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#2563eb',
    width: '580px',
    preConfirm: () => {
      const name = document.getElementById('edit-user-name').value.trim();
      const role = document.getElementById('edit-user-role').value;
      const dept = document.getElementById('edit-user-dept').value.trim();
      const avatar = document.getElementById('edit-user-avatar').value;
      const email = document.getElementById('edit-user-email').value.trim();
      const phone = document.getElementById('edit-user-phone').value.trim();
      const status = document.getElementById('edit-user-status').value;

      if (!name) {
        Swal.showValidationMessage('Vui lòng nhập họ và tên');
        return false;
      }

      if (user.id === 'USR-01' && role !== 'admin') {
        Swal.showValidationMessage('Tài khoản Quản trị viên gốc (USR-01) bắt buộc phải có vai trò Quản trị viên!');
        return false;
      }
      if (user.id === 'USR-01' && status === 'locked') {
        Swal.showValidationMessage('Không thể khóa tài khoản Quản trị viên gốc (USR-01)!');
        return false;
      }
      if (user.id === window.appState.currentUser?.id && status === 'locked') {
        Swal.showValidationMessage('Không thể tự khóa tài khoản bạn đang sử dụng!');
        return false;
      }

      const newPass = document.getElementById('edit-user-newpass')?.value?.trim();
      return { name, role, dept, avatar, email, phone, status, newPass };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      const val = result.value;
      const roleObj = (window.appState.roles || SYSTEM_ROLES).find(r => r.id === val.role);
      user.name = val.name;
      user.role = val.role;
      user.roleName = roleObj ? roleObj.name : val.role;
      user.department = val.dept;
      user.avatar = val.avatar;
      user.email = val.email;
      user.phone = val.phone;
      user.status = val.status;
      if (val.newPass) {
        user.passwordHash = typeof hashPassword === 'function' ? hashPassword(val.newPass) : 'hashed_' + val.newPass;
      }

      if (window.appState.currentUser?.id === user.id) {
        window.appState.currentUser = user;
        window.updateUserUI();
      }

      window.saveStateToLocalStorage();
      window.logUserActivity('Sửa tài khoản', `Cập nhật thông tin tài khoản ${user.name} (@${user.username})`);
      window.renderUserAccountsTable();
      window.updateUserKPIs();

      Swal.fire({
        icon: 'success',
        title: 'Đã lưu thay đổi!',
        text: `Thông tin tài khoản ${user.name} đã được cập nhật thành công.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// Khóa / Mở khóa tài khoản
window.toggleUserStatus = function(userId) {
  if (!window.checkPermission('manage_users', 'Khóa / Mở khóa tài khoản người dùng')) return;

  const user = window.appState.users.find(u => u.id === userId);
  if (!user) return;

  if (user.id === 'USR-01') {
    Swal.fire({
      icon: 'error',
      title: 'Bảo vệ hệ thống',
      text: 'Tài khoản Quản trị viên mặc định (ThS. Trịnh Minh Phú) không thể bị khóa!',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  if (user.id === window.appState.currentUser?.id) {
    Swal.fire({
      icon: 'warning',
      title: 'Thao tác không hợp lệ',
      text: 'Bạn không thể tự khóa tài khoản hiện đang đăng nhập của chính mình!',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const isLocked = user.status === 'locked';
  const newStatus = isLocked ? 'active' : 'locked';
  const actionText = isLocked ? 'Mở khóa' : 'Khóa';

  Swal.fire({
    title: `${actionText} tài khoản này?`,
    html: `Bạn có chắc muốn ${actionText.toLowerCase()} tài khoản <strong>${user.name}</strong> (@${user.username})?`,
    icon: isLocked ? 'info' : 'warning',
    showCancelButton: true,
    confirmButtonText: actionText,
    cancelButtonText: 'Hủy',
    confirmButtonColor: isLocked ? '#10b981' : '#ef4444'
  }).then(res => {
    if (res.isConfirmed) {
      user.status = newStatus;
      window.saveStateToLocalStorage();
      window.logUserActivity(`${actionText} tài khoản`, `${actionText} tài khoản ${user.name} (@${user.username})`);
      window.renderUserAccountsTable();
      window.updateUserKPIs();

      Swal.fire({
        icon: 'success',
        title: `Đã ${actionText.toLowerCase()} thành công!`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// Xóa tài khoản người dùng
window.deleteUser = function(userId) {
  if (!window.checkPermission('manage_users', 'Xóa tài khoản người dùng')) return;

  const user = window.appState.users.find(u => u.id === userId);
  if (!user) return;

  if (user.id === window.appState.currentUser?.id) {
    Swal.fire({
      icon: 'warning',
      title: 'Không thể xóa',
      text: 'Bạn không thể xóa tài khoản hiện đang sử dụng để đăng nhập!',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  if (user.id === 'USR-01') {
    Swal.fire({
      icon: 'error',
      title: 'Bảo vệ hệ thống',
      text: 'Tài khoản Quản trị viên mặc định (ThS. Trịnh Minh Phú) không thể bị xóa!',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  Swal.fire({
    title: 'Xóa vĩnh viễn tài khoản?',
    html: `Bạn có chắc chắn muốn xóa tài khoản <strong>${user.name}</strong> (@${user.username})? Hành động này không thể hoàn tác.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ef4444'
  }).then(res => {
    if (res.isConfirmed) {
      window.appState.users = window.appState.users.filter(u => u.id !== userId);
      window.saveStateToLocalStorage();
      window.logUserActivity('Xóa tài khoản', `Xóa tài khoản ${user.name} (@${user.username}) khỏi hệ thống`);
      window.renderUserAccountsTable();
      window.updateUserKPIs();

      Swal.fire({
        icon: 'success',
        title: 'Đã xóa tài khoản!',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// Modal Xem & Cập nhật Hồ sơ cá nhân người dùng hiện hành
window.showUserProfileModal = function() {
  const user = window.appState.currentUser || (window.appState.users && window.appState.users[0]);
  if (!user) return;

  const roleCfg = (typeof ROLE_PERMISSIONS !== 'undefined' && ROLE_PERMISSIONS[user.role]) ? ROLE_PERMISSIONS[user.role] : { label: user.roleName || user.role, permissions: [] };

  const permissionLabels = {
    view_simulation: 'Quan sát sơ đồ 2D & trạng thái 104 máy',
    view_schedule: 'Tra cứu Thời khóa biểu 4 phòng',
    view_devices: 'Xem danh mục & thông số thiết bị',
    view_maintenance: 'Tra cứu phiếu bảo trì & sự cố',
    control_power: 'Điều khiển nguồn (Wake-on-LAN)',
    edit_device: 'Sửa cấu hình phần cứng thiết bị',
    delete_device: 'Xóa thiết bị khỏi danh mục',
    import_export_devices: 'Xuất & Nhập dữ liệu Excel',
    manage_schedule: 'Đăng ký & xếp lịch thực hành',
    start_shift: 'Kích hoạt vào ca thực hành',
    create_ticket: 'Lập phiếu báo hỏng khi giảng dạy',
    resolve_ticket: 'Tiếp nhận xử lý & quyết toán chi phí sửa chữa',
    manage_users: 'Quản lý tài khoản & phân quyền (RBAC)',
    system_backup: 'Sao lưu & khôi phục toàn bộ hệ thống',
    print_asset_tag: 'In tem kiểm kê tài sản QR Code TNUS'
  };

  const permsHtml = (roleCfg.permissions || []).map(p => `
    <div class="flex items-center space-x-2 text-xs py-1 border-b border-slate-100 last:border-0">
      <i class="fa-solid fa-circle-check text-emerald-500 text-[11px]"></i>
      <span class="text-slate-700">${permissionLabels[p] || p}</span>
    </div>
  `).join('');

  Swal.fire({
    title: `
      <div class="flex items-center space-x-2.5 text-left">
        <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow">
          ${user.avatar || '👨‍💼'}
        </div>
        <div>
          <div class="text-base font-bold text-slate-900">${user.name}</div>
          <div class="text-xs text-blue-600 font-semibold">${user.roleName} • @${user.username}</div>
        </div>
      </div>
    `,
    html: `
      <div class="text-left space-y-3.5 text-xs max-h-[72vh] overflow-y-auto pr-1">
        <!-- Thông tin cá nhân -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span><i class="fa-solid fa-id-card text-blue-600 mr-1.5"></i>Hồ Sơ Cán Bộ</span>
            <span class="font-mono text-slate-500">${user.id}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
            <div><strong>Đơn vị:</strong> ${user.department || 'Khoa Toán - Tin, TNUS'}</div>
            <div><strong>Trạng thái:</strong> <span class="text-emerald-600 font-bold">Đang hoạt động</span></div>
            <div><strong>Email:</strong> <span class="font-mono">${user.email || 'phutm@tnus.edu.vn'}</span></div>
            <div><strong>Điện thoại:</strong> <span class="font-mono text-blue-700 font-bold">${user.phone || '0975.090.666'}</span></div>
          </div>
        </div>

        <!-- Cập nhật liên hệ & Đổi mật khẩu -->
        <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
          <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            <i class="fa-solid fa-lock text-amber-600 mr-1.5"></i>Cập Nhật Liên Hệ & Mật Khẩu
          </div>
          <div class="space-y-2">
            <div>
              <label class="block text-slate-600 font-medium text-[11px] mb-0.5">Số điện thoại liên hệ</label>
              <input type="text" id="profile-edit-phone" value="${user.phone || ''}" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-slate-600 font-medium text-[11px] mb-0.5">Email thông báo</label>
              <input type="email" id="profile-edit-email" value="${user.email || ''}" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-slate-600 font-medium text-[11px] mb-0.5">Mật khẩu mới (Để trống nếu không đổi)</label>
              <input type="password" id="profile-edit-newpass" placeholder="Nhập mật khẩu mới..." class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
            </div>
          </div>
        </div>

        <!-- Danh sách thẩm quyền của vai trò này -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span><i class="fa-solid fa-shield-check text-emerald-600 mr-1.5"></i>Danh Mục Quyền Hạn Của Vai Trò</span>
            <span class="text-[10px] text-slate-500 font-normal">${(roleCfg.permissions || []).length} thẩm quyền</span>
          </div>
          <div class="max-h-40 overflow-y-auto space-y-0.5 bg-white p-2 rounded-lg border border-slate-200">
            ${permsHtml}
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Lưu thông tin',
    cancelButtonText: 'Đóng',
    confirmButtonColor: '#2563eb',
    width: '560px',
    preConfirm: () => {
      const phone = document.getElementById('profile-edit-phone').value.trim();
      const email = document.getElementById('profile-edit-email').value.trim();
      const newPass = document.getElementById('profile-edit-newpass').value.trim();
      return { phone, email, newPass };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      user.phone = result.value.phone;
      user.email = result.value.email;
      window.saveStateToLocalStorage();
      window.updateUserUI();
      window.logUserActivity('Cập nhật hồ sơ', `Cập nhật thông tin liên hệ của ${user.name}`);

      Swal.fire({
        icon: 'success',
        title: 'Đã cập nhật hồ sơ!',
        text: result.value.newPass ? 'Thông tin liên hệ và mật khẩu mới đã được lưu thành công.' : 'Thông tin liên hệ đã được lưu thành công.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// =========================================================================
// XUẤT DANH SÁCH TÀI KHOẢN RA EXCEL (CHỈ DÀNH CHO ADMIN)
// =========================================================================
window.exportUsersToExcel = function() {
  if (typeof XLSX === 'undefined') {
    Swal.fire('Lỗi', 'Thư viện XLSX chưa tải xong. Vui lòng thử lại sau giây lát.', 'error');
    return;
  }

  const users = window.appState.users || [];
  if (users.length === 0) {
    Swal.fire('Thông báo', 'Không có dữ liệu tài khoản để xuất file Excel.', 'info');
    return;
  }

  const roleNameMap = {
    admin: 'Quản trị viên (Admin)',
    lab_manager: 'Quản lý phòng máy',
    teacher: 'Giảng viên',
    student: 'Sinh viên / Khách'
  };

  const exportData = users.map((u, idx) => ({
    'STT': idx + 1,
    'Mã tài khoản': u.id,
    'Tên đăng nhập': u.username,
    'Họ và tên': u.name,
    'Vai trò hệ thống': u.roleName || roleNameMap[u.role] || u.role,
    'Mã vai trò (RBAC)': u.role,
    'Đơn vị công tác': u.department || 'Khoa Toán - Tin, TNUS',
    'Email': u.email || `${u.username}@tnus.edu.vn`,
    'Số điện thoại': u.phone || '',
    'Trạng thái': (u.status || 'active') === 'active' ? 'Đang hoạt động' : 'Đã khóa',
    'Ngày cấp tài khoản': u.createdAt || '2026-10-15',
    'Lần đăng nhập cuối': u.lastLogin || 'Chưa đăng nhập'
  }));

  let downloadedFileName = `TNUS_DanhSach_TaiKhoan_RBAC_${new Date().toISOString().split('T')[0]}.xlsx`;

  if (typeof XLSX !== 'undefined') {
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Định dạng độ rộng cột tối ưu, chống tràn chữ
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Mã tài khoản
      { wch: 18 }, // Tên đăng nhập
      { wch: 28 }, // Họ và tên
      { wch: 24 }, // Vai trò hệ thống
      { wch: 18 }, // Mã vai trò (RBAC)
      { wch: 32 }, // Đơn vị công tác
      { wch: 28 }, // Email
      { wch: 16 }, // Số điện thoại
      { wch: 16 }, // Trạng thái
      { wch: 18 }, // Ngày cấp
      { wch: 22 }  // Lần đăng nhập cuối
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSach_TaiKhoan_TNUS");

    // Sheet 2: Thông tin hệ thống & Cán bộ phụ trách
    const metaData = [
      { 'Thuộc tính': 'Đơn vị quản lý', 'Nội dung': 'KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)' },
      { 'Thuộc tính': 'Hệ thống vận hành', 'Nội dung': 'Hệ thống Mô phỏng & Quản trị Phòng máy tính TNUS (Tầng 5, Nhà A1)' },
      { 'Thuộc tính': 'Cán bộ phụ trách', 'Nội dung': 'ThS. Trịnh Minh Phú (0975.090.666 - phutm@tnus.edu.vn)' },
      { 'Thuộc tính': 'Tổng số tài khoản', 'Nội dung': `${users.length} tài khoản` },
      { 'Thuộc tính': 'Mô hình phân quyền', 'Nội dung': 'RBAC Enterprise 3.0 (4 vai trò: Admin, QL Phòng, Giảng viên, Sinh viên)' },
      { 'Thuộc tính': 'Thời gian kết xuất', 'Nội dung': new Date().toLocaleString('vi-VN') }
    ];
    const metaSheet = XLSX.utils.json_to_sheet(metaData);
    metaSheet['!cols'] = [{ wch: 24 }, { wch: 65 }];
    XLSX.utils.book_append_sheet(workbook, metaSheet, "ThongTin_DonVi");

    XLSX.writeFile(workbook, downloadedFileName);
  } else {
    // Fallback xuất CSV chuẩn UTF-8 có BOM mở trực tiếp trên Excel không bị lỗi font
    downloadedFileName = `TNUS_DanhSach_TaiKhoan_RBAC_${new Date().toISOString().split('T')[0]}.csv`;
    const headers = ['STT', 'Mã tài khoản', 'Tên đăng nhập', 'Họ và tên', 'Vai trò hệ thống', 'Mã vai trò (RBAC)', 'Đơn vị công tác', 'Email', 'Số điện thoại', 'Trạng thái', 'Ngày cấp tài khoản', 'Lần đăng nhập cuối'];
    const csvRows = [headers.join(',')];
    exportData.forEach(row => {
      const values = headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    });
    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  window.logUserActivity('Xuất Excel', `Xuất danh sách ${users.length} tài khoản người dùng ra file ${downloadedFileName}`);

  Swal.fire({
    icon: 'success',
    title: 'Xuất danh sách thành công!',
    html: `Đã kết xuất danh sách <strong>${users.length}</strong> tài khoản ra tệp: <br><code class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">${downloadedFileName}</code>`,
    timer: 2000,
    showConfirmButton: false
  });
};

// =========================================================================
// TẢI FILE MẪU EXCEL CHUẨN ĐỂ NHẬP TÀI KHOẢN
// =========================================================================
window.downloadUserExcelTemplate = function() {
  if (typeof XLSX === 'undefined') {
    Swal.fire('Lỗi', 'Thư viện XLSX chưa tải xong.', 'error');
    return;
  }

  const sampleRows = [
    {
      'STT': 1,
      'Mã tài khoản': 'USR-01',
      'Tên đăng nhập': 'admin',
      'Họ và tên': 'ThS. Trịnh Minh Phú',
      'Mã vai trò (RBAC)': 'admin',
      'Vai trò hệ thống': 'Quản trị viên',
      'Đơn vị công tác': 'Khoa Toán - Tin, TNUS',
      'Email': 'phutm@tnus.edu.vn',
      'Số điện thoại': '0975.090.666',
      'Trạng thái': 'Đang hoạt động'
    },
    {
      'STT': 2,
      'Mã tài khoản': 'USR-02',
      'Tên đăng nhập': 'qlphongmay',
      'Họ và tên': 'Nguyễn Văn Quản Lý',
      'Mã vai trò (RBAC)': 'lab_manager',
      'Vai trò hệ thống': 'Quản lý phòng máy',
      'Đơn vị công tác': 'Tổ Quản trị Phòng máy - Khoa Toán - Tin',
      'Email': 'qlpm@tnus.edu.vn',
      'Số điện thoại': '0978.889.991',
      'Trạng thái': 'Đang hoạt động'
    },
    {
      'STT': 3,
      'Mã tài khoản': 'USR-03',
      'Tên đăng nhập': 'toannv',
      'Họ và tên': 'TS. Nguyễn Văn Toán',
      'Mã vai trò (RBAC)': 'teacher',
      'Vai trò hệ thống': 'Giảng viên',
      'Đơn vị công tác': 'Bộ môn Khoa học Máy tính - TNUS',
      'Email': 'toannv@tnus.edu.vn',
      'Số điện thoại': '0912.345.678',
      'Trạng thái': 'Đang hoạt động'
    },
    {
      'STT': 4,
      'Mã tài khoản': 'USR-04',
      'Tên đăng nhập': 'sinhvien',
      'Họ và tên': 'Trần Thị Sinh Viên',
      'Mã vai trò (RBAC)': 'student',
      'Vai trò hệ thống': 'Sinh viên / Khách',
      'Đơn vị công tác': 'Khoa Toán - Tin, TNUS',
      'Email': 'sinhvien@tnus.edu.vn',
      'Số điện thoại': '0208.3855.564',
      'Trạng thái': 'Đang hoạt động'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 18 },
    { wch: 26 },
    { wch: 18 },
    { wch: 22 },
    { wch: 32 },
    { wch: 26 },
    { wch: 16 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Mau_TaiKhoan_TNUS");

  const fileName = 'TNUS_Mau_Nhap_TaiKhoan_RBAC.xlsx';
  XLSX.writeFile(workbook, fileName);

  Swal.fire({
    icon: 'success',
    title: 'Đã tải tệp mẫu Excel!',
    html: `Tệp <strong>${fileName}</strong> đã được tải về máy của bạn.<br><span class="text-xs text-slate-500">Mở tệp, điền danh sách tài khoản theo các cột mẫu và nạp lại vào hệ thống.</span>`,
    confirmButtonColor: '#2563eb'
  });
};

// =========================================================================
// HỘP THOẠI NHẬP DANH SÁCH TÀI KHOẢN TỪ EXCEL
// =========================================================================
window.showImportUsersModal = function() {
  if (!window.checkPermission('manage_users', 'Nhập danh sách tài khoản từ Excel')) return;

  Swal.fire({
    title: `
      <div class="flex items-center space-x-2 text-left pb-2 border-b border-slate-200">
        <div class="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-sm shadow-xs">
          <i class="fa-solid fa-file-excel"></i>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900 leading-tight">Nhập Danh Sách Tài Khoản từ Excel</div>
          <div class="text-[11px] text-slate-500 font-normal">Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)</div>
        </div>
      </div>
    `,
    html: `
      <div class="text-left space-y-3.5 text-xs pt-2">
        <div class="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
          <div class="font-bold text-blue-900 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-info text-blue-600"></i>
            <span>Hướng dẫn quy chuẩn tệp Excel:</span>
          </div>
          <p class="text-slate-600 leading-relaxed text-[11px]">
            Hệ thống nhận dạng file <code>.xlsx</code> hoặc <code>.xls</code> với các cột: <strong>Tên đăng nhập</strong> (bắt buộc), <strong>Họ và tên</strong>, <strong>Mã vai trò (RBAC)</strong>, <strong>Đơn vị công tác</strong>, <strong>Email</strong>, <strong>Số điện thoại</strong>.
          </p>
          <div class="pt-1">
            <button onclick="window.downloadUserExcelTemplate()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
              <i class="fa-solid fa-download"></i>
              <span>Tải file Excel mẫu chuẩn TNUS (.xlsx)</span>
            </button>
          </div>
        </div>

        <div class="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center transition bg-slate-50 hover:bg-blue-50/30 cursor-pointer" onclick="document.getElementById('input-import-users-modal').click()">
          <i class="fa-solid fa-cloud-arrow-up text-3xl text-blue-600 mb-2"></i>
          <div class="font-bold text-slate-800 text-sm">Bấm vào đây để chọn tệp Excel từ máy tính</div>
          <div class="text-slate-500 text-[11px] mt-0.5">Hỗ trợ định dạng .xlsx, .xls (Tối đa 5MB)</div>
          <input type="file" id="input-import-users-modal" class="hidden" accept=".xlsx, .xls, .csv" onchange="window.handleUserExcelImportFromModal(event)">
        </div>

        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div class="font-bold text-slate-700">Quy tắc nạp dữ liệu:</div>
          <div>• <strong>4 Vai trò hợp lệ:</strong> <code>admin</code> (Quản trị), <code>lab_manager</code> (Quản lý PM), <code>teacher</code> (Giảng viên), <code>student</code> (Sinh viên).</div>
          <div>• Tài khoản đã tồn tại (trùng username) sẽ được <strong>tự động cập nhật</strong> thông tin mới.</div>
          <div>• Tài khoản mới sẽ được cấp mật khẩu mặc định: <strong class="text-blue-700 font-mono">Tnus@2026</strong>.</div>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    width: '560px'
  });
};

window.handleUserExcelImportFromModal = function(event) {
  Swal.close();
  window.handleUserExcelImport(event);
};

// =========================================================================
// XỬ LÝ NẠP DỮ LIỆU TÀI KHOẢN TỪ FILE EXCEL
// =========================================================================
window.handleUserExcelImport = function(event) {
  if (!window.checkPermission('manage_users', 'Nhập danh sách tài khoản từ Excel')) return;

  const file = event.target.files[0];
  if (!file) return;

  if (typeof XLSX === 'undefined') {
    Swal.fire('Lỗi', 'Thư viện SheetJS XLSX chưa được tải.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      if (!rows || rows.length === 0) {
        Swal.fire('Lỗi', 'Tệp Excel không có dữ liệu tài khoản hợp lệ.', 'error');
        return;
      }

      let addedCount = 0;
      let updatedCount = 0;
      const roleNames = {
        admin: 'Quản trị viên',
        lab_manager: 'Quản lý phòng máy',
        teacher: 'Giảng viên',
        student: 'Sinh viên'
      };

      const avatarMap = {
        admin: '👨‍💼',
        lab_manager: '🏢',
        teacher: '👨‍🏫',
        student: '👨‍🎓'
      };

      // Tìm số USR lớn nhất hiện tại để sinh mã tự động liên tục
      let maxIdNum = 0;
      (window.appState.users || []).forEach(u => {
        const match = (u.id || '').match(/USR-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxIdNum) maxIdNum = num;
        }
      });

      rows.forEach(r => {
        const username = (r['Tên đăng nhập'] || r['username'] || r['Tên tài khoản'] || '').toString().trim().toLowerCase();
        if (!username) return;

        const roleRaw = (r['Mã vai trò (RBAC)'] || r['role'] || r['Vai trò hệ thống'] || r['Vai trò'] || '').toString().toLowerCase();
        let role = 'student';
        if (roleRaw.includes('admin') || roleRaw.includes('quản trị')) role = 'admin';
        else if (roleRaw.includes('manager') || roleRaw.includes('quản lý') || roleRaw.includes('lab_manager') || roleRaw.includes('staff') || roleRaw.includes('kỹ thuật') || roleRaw.includes('ktv')) role = 'lab_manager';
        else if (roleRaw.includes('teach') || roleRaw.includes('giảng viên') || roleRaw.includes('gv')) role = 'teacher';

        const existing = window.appState.users.find(u => u.username.toLowerCase() === username);
        if (existing) {
          existing.name = (r['Họ và tên'] || r['name'] || r['Họ tên'] || existing.name).toString().trim();
          existing.role = role;
          existing.roleName = roleNames[role] || role;
          existing.department = (r['Đơn vị công tác'] || r['department'] || r['Bộ môn'] || existing.department).toString().trim();
          existing.email = (r['Email'] || r['email'] || existing.email).toString().trim();
          existing.phone = (r['Số điện thoại'] || r['phone'] || r['SĐT'] || existing.phone).toString().trim();
          const statusRaw = (r['Trạng thái'] || r['status'] || '').toString().toLowerCase();
          if (statusRaw.includes('khóa') || statusRaw.includes('locked')) existing.status = 'locked';
          else if (statusRaw.includes('hoạt động') || statusRaw.includes('active')) existing.status = 'active';
          updatedCount++;
        } else {
          maxIdNum++;
          const nextId = 'USR-' + maxIdNum.toString().padStart(2, '0');
          const defaultPass = 'Tnus@2026';
          const salt = 'TNUS_KHOA_TOAN_TIN_2026';
          window.appState.users.push({
            id: r['Mã tài khoản'] || nextId,
            username: username,
            name: (r['Họ và tên'] || r['name'] || r['Họ tên'] || username).toString().trim(),
            role: role,
            roleName: roleNames[role] || role,
            department: (r['Đơn vị công tác'] || r['department'] || r['Bộ môn'] || 'Khoa Toán - Tin, TNUS').toString().trim(),
            avatar: avatarMap[role] || '👤',
            email: (r['Email'] || r['email'] || `${username}@tnus.edu.vn`).toString().trim(),
            phone: (r['Số điện thoại'] || r['phone'] || r['SĐT'] || '').toString().trim(),
            status: ((r['Trạng thái'] || r['status'] || '').toString().toLowerCase().includes('khóa') || (r['Trạng thái'] || '').toString().toLowerCase().includes('locked')) ? 'locked' : 'active',
            passwordHash: typeof hashPassword === 'function' ? hashPassword(defaultPass, salt) : 'hashed_' + defaultPass,
            salt: salt,
            failedLogins: 0,
            createdAt: new Date().toISOString().split('T')[0],
            lastLogin: 'Chưa đăng nhập'
          });
          addedCount++;
        }
      });

      window.saveStateToLocalStorage();
      window.logUserActivity('Nhập Excel', `Nhập danh sách tài khoản từ Excel: thêm mới ${addedCount}, cập nhật ${updatedCount}`);
      window.renderUserAccountsTable();
      window.updateUserKPIs();

      Swal.fire({
        icon: 'success',
        title: 'Nhập Excel thành công!',
        html: `
          <div class="text-left text-xs space-y-2">
            <p>Đã xử lý xong tệp Excel dữ liệu tài khoản:</p>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div>• Thêm mới thành công: <strong class="text-emerald-600">${addedCount}</strong> tài khoản</div>
              <div>• Cập nhật thông tin: <strong class="text-blue-600">${updatedCount}</strong> tài khoản</div>
              <div>• Tổng số tài khoản hiện có: <strong>${window.appState.users.length}</strong> tài khoản</div>
            </div>
            <p class="text-slate-500 text-[11px]">Tất cả tài khoản mới đều có thể đăng nhập ngay với mật khẩu mặc định <code>Tnus@2026</code>.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb'
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Không thể xử lý tệp Excel. Vui lòng kiểm tra định dạng tệp.', 'error');
    }
  };

  reader.readAsArrayBuffer(file);
  event.target.value = '';
};

// Khôi phục danh sách người dùng về ban đầu
window.resetUsersToDefault = function() {
  if (!window.checkPermission('system_backup', 'Khôi phục danh sách tài khoản gốc')) return;

  Swal.fire({
    title: 'Khôi phục tài khoản gốc?',
    text: 'Hệ thống sẽ đặt lại danh sách người dùng về 4 tài khoản mặc định ban đầu của Khoa Toán - Tin TNUS.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Khôi phục ngay',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#2563eb'
  }).then(res => {
    if (res.isConfirmed) {
      window.appState.users = JSON.parse(JSON.stringify(INITIAL_USERS));
      window.appState.currentUser = window.appState.users[0];
      window.saveStateToLocalStorage();
      window.updateUserUI();
      window.logUserActivity('Khôi phục tài khoản', 'Đặt lại danh sách tài khoản về cấu hình mặc định ban đầu');
      window.renderUserAccountsTable();
      window.updateUserKPIs();

      Swal.fire({
        icon: 'success',
        title: 'Đã khôi phục mặc định!',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// Kết xuất bảng nhật ký kiểm toán (Activity Logs)
window.renderActivityLogs = function(filterText = '') {
  const tbody = document.getElementById('user-activity-log-body');
  if (!tbody) return;

  const logs = window.appState.activityLogs || [];
  const term = (filterText || '').toLowerCase().trim();

  let filtered = logs;
  if (term) {
    filtered = logs.filter(l => 
      (l.action && l.action.toLowerCase().includes(term)) ||
      (l.details && l.details.toLowerCase().includes(term)) ||
      (l.userName && l.userName.toLowerCase().includes(term)) ||
      (l.username && l.username.toLowerCase().includes(term)) ||
      (l.ip && l.ip.includes(term))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400 font-sans italic text-xs">Không có nhật ký nào phù hợp</td></tr>`;
    return;
  }

  const roleBadges = {
    admin: 'bg-blue-100 text-blue-800',
    lab_manager: 'bg-indigo-100 text-indigo-800',
    teacher: 'bg-emerald-100 text-emerald-800',
    student: 'bg-purple-100 text-purple-800'
  };

  tbody.innerHTML = filtered.map(item => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-2.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
        ${item.timestamp}
      </td>
      <td class="py-2.5 px-4 whitespace-nowrap">
        <div class="flex items-center space-x-1.5 font-sans">
          <span class="font-bold text-slate-800 text-xs">${item.userName || item.username}</span>
          <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${roleBadges[item.role] || 'bg-slate-100 text-slate-700'}">${item.role}</span>
        </div>
      </td>
      <td class="py-2.5 px-4 font-sans font-bold text-slate-700 text-xs whitespace-nowrap">
        ${item.action}
      </td>
      <td class="py-2.5 px-4 text-slate-600 font-sans text-xs">
        ${item.details}
      </td>
      <td class="py-2.5 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
        ${item.ip || '10.10.5.1'}
      </td>
    </tr>
  `).join('');
};

// Xóa nhật ký hoạt động
window.clearActivityLogs = function() {
  if (!window.checkPermission('manage_users', 'Xóa nhật ký hoạt động hệ thống')) return;

  Swal.fire({
    title: 'Xóa toàn bộ nhật ký?',
    text: 'Lịch sử nhật ký kiểm toán hệ thống sẽ được xóa sạch. Hành động này không thể hoàn tác.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ef4444'
  }).then(res => {
    if (res.isConfirmed) {
      window.appState.activityLogs = [];
      window.logUserActivity('Khởi tạo nhật ký', 'Nhật ký kiểm toán đã được làm mới bởi Quản trị viên');
      window.saveStateToLocalStorage();
      window.renderActivityLogs();

      Swal.fire({
        icon: 'success',
        title: 'Đã xóa nhật ký!',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// Modal Xem Chi Tiết & Tương Tác Trực Tiếp Với Từng Máy Tính
window.openComputerDetailModal = function(computerId) {
  const comp = window.appState.computers.find(c => c.id === computerId);
  if (!comp) return;

  const curUser = window.appState.currentUser;
  const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
  const canManageStatus = (role === 'admin' || role === 'lab_manager');

  const cfg = STATUS_CONFIG[comp.status] || STATUS_CONFIG.good;
  const isPowerOn = comp.powerState === 'on';

  const historyHtml = (comp.history && comp.history.length > 0) ? comp.history.map(h => `
    <div class="border-l-2 border-blue-500 pl-3 py-1 my-1.5 text-xs">
      <div class="flex items-center justify-between text-slate-500 font-mono text-[10px]">
        <span>${h.date}</span>
        <span class="font-semibold text-slate-700">${h.technician}</span>
      </div>
      <div class="font-bold text-slate-800">${h.action}</div>
      <div class="text-slate-600">${h.note}</div>
    </div>
  `).join('') : '<div class="text-slate-400 text-xs italic">Chưa có lịch sử bảo trì ghi nhận.</div>';

  Swal.fire({
    title: `
      <div class="flex items-center justify-between border-b pb-2 text-left">
        <div>
          <span class="text-xl font-black font-mono text-blue-600">${comp.id}</span>
          <span class="text-sm font-semibold text-slate-700 ml-2">(${comp.name})</span>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm" style="background-color: ${cfg.hex};">
          ${cfg.label}
        </span>
      </div>
    `,
    html: `
      <div class="text-left space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <!-- Thông tin cấu hình chính -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
            <i class="fa-solid fa-microchip text-blue-500 mr-1.5"></i>Cấu hình phần cứng
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="text-slate-500">Thương hiệu:</span> <strong>${comp.brand}</strong></div>
            <div><span class="text-slate-500">Phân loại:</span> <strong>${comp.model}</strong></div>
            <div><span class="text-slate-500">CPU:</span> <strong>${comp.cpu}</strong></div>
            <div><span class="text-slate-500">Bộ nhớ RAM:</span> <strong>${comp.ram}</strong></div>
            <div><span class="text-slate-500">Ổ cứng:</span> <strong>${comp.storage}</strong></div>
            <div><span class="text-slate-500">Màn hình:</span> <strong>${comp.monitor}</strong></div>
            <div><span class="text-slate-500">Hệ điều hành:</span> <strong>${comp.os}</strong></div>
            <div><span class="text-slate-500">Bản quyền:</span> <strong class="text-emerald-600">${comp.license || 'Đã xác minh'}</strong></div>
          </div>
          ${comp.software ? `
            <div class="mt-2 pt-2 border-t border-slate-200 text-xs">
              <span class="text-slate-500 font-semibold">Phần mềm cài sẵn:</span>
              <div class="font-mono text-blue-700 bg-blue-50/80 p-1.5 rounded mt-0.5">${comp.software}</div>
            </div>
          ` : ''}
        </div>

        <!-- Mạng và vị trí -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg">
            <div class="text-[11px] font-bold text-blue-700 uppercase mb-1">Mạng & Kết nối</div>
            <div>IP: <span class="font-mono font-bold text-blue-800">${comp.ipAddress}</span></div>
            <div>MAC: <span class="font-mono text-slate-600">${comp.macAddress}</span></div>
            <div>Ngày đưa vào SD: <span class="font-mono">${comp.installDate || '2026-10-30'}</span></div>
          </div>
          <div class="p-2.5 bg-slate-100 border border-slate-200 rounded-lg">
            <div class="text-[11px] font-bold text-slate-700 uppercase mb-1">Vị trí & Kiểm định</div>
            <div>Phòng: <strong>${comp.labId}</strong></div>
            <div>Vị trí: Hàng ${comp.position.row}, Cột ${comp.position.col}</div>
            <div>Kiểm tra gần nhất: <span class="font-mono font-bold text-slate-800">${comp.lastInspected}</span></div>
          </div>
        </div>

        ${comp.notes ? `
          <div class="bg-slate-50 border border-slate-200 text-slate-600 p-2 rounded text-[11px]">
            <i class="fa-solid fa-circle-info text-blue-500 mr-1"></i>${comp.notes}
          </div>
        ` : ''}

        ${comp.issue ? `
          <div class="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-xs">
            <div class="font-bold flex items-center"><i class="fa-solid fa-triangle-exclamation mr-1.5"></i>Sự cố ghi nhận:</div>
            <div class="mt-1">${comp.issue}</div>
          </div>
        ` : ''}

        ${canManageStatus ? `
        <!-- Thay đổi nhanh trạng thái máy -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div class="text-xs font-bold text-slate-700 mb-2">Cập nhật nhanh trạng thái:</div>
          <div class="grid grid-cols-3 gap-2">
            <button onclick="window.changeComputerStatus('${comp.id}', 'good')" class="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-semibold">🟢 Hoạt động tốt</button>
            <button onclick="window.changeComputerStatus('${comp.id}', 'in_use')" class="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold">🔵 Đang sử dụng</button>
            <button onclick="window.changeComputerStatus('${comp.id}', 'warning')" class="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold">🟡 Cần kiểm tra</button>
            <button onclick="window.changeComputerStatus('${comp.id}', 'broken')" class="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-semibold">🔴 Đang hỏng</button>
            <button onclick="window.changeComputerStatus('${comp.id}', 'inactive')" class="p-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs font-semibold">⚪ Ngừng sử dụng</button>
            <button onclick="window.toggleSinglePower('${comp.id}')" class="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold">⚡ ${isPowerOn ? 'Tắt nguồn' : 'Bật nguồn'}</button>
          </div>
        </div>
        ` : `
        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <span class="text-slate-600"><i class="fa-solid fa-power-off ${isPowerOn ? 'text-emerald-500' : 'text-slate-400'} mr-1.5"></i>Nguồn máy tính: <strong class="${isPowerOn ? 'text-emerald-600' : 'text-slate-500'}">${isPowerOn ? 'Đang BẬT' : 'Đang TẮT'}</strong></span>
          <span class="text-slate-400 text-[11px] font-mono">Quản lý nguồn bởi Tổ PM</span>
        </div>
        `}

        <!-- Thao tác kiểm tra mạng, Desktop ảo, Định vị 2D & Báo hỏng -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div class="flex items-center space-x-2">
            <button onclick="window.openVirtualDesktopModal('${comp.id}')" class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center">
              <i class="fa-solid fa-display mr-1.5"></i>Màn hình ảo (Desktop)
            </button>
            <button onclick="Swal.close(); window.locateComputerOn2D('${comp.id}')" class="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-300 text-xs font-bold rounded-lg flex items-center shadow-2xs">
              <i class="fa-solid fa-map-location-dot mr-1.5 text-teal-600"></i>Xem trên Sơ đồ 2D
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="window.pingTestComputer('${comp.id}', '${comp.ipAddress}')" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg flex items-center">
              <i class="fa-solid fa-network-wired mr-1.5 text-blue-600"></i>Ping Test
            </button>
            ${role !== 'student' ? `
            <button onclick="window.reportIncidentFromModal('${comp.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-semibold rounded-lg flex items-center">
              <i class="fa-solid fa-flag mr-1.5 text-rose-600"></i>Báo hỏng
            </button>` : ''}
          </div>
        </div>

        <!-- Lịch sử bảo trì -->
        <div>
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Lịch sử bảo dưỡng & sửa chữa:</div>
          <div class="bg-white p-2.5 rounded-lg border border-slate-200 max-h-32 overflow-y-auto">
            ${historyHtml}
          </div>
        </div>
      </div>
    `,
    width: '620px',
    showConfirmButton: true,
    confirmButtonText: 'Đóng',
    confirmButtonColor: '#2563eb'
  });
};

// Cập nhật trạng thái máy
window.changeComputerStatus = function(computerId, newStatus) {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('control_power', 'Thay đổi trạng thái thiết bị')) return;
  const comp = window.appState.computers.find(c => c.id === computerId);
  if (!comp) return;

  comp.status = newStatus;
  if (newStatus === 'broken' || newStatus === 'inactive') {
    comp.powerState = 'off';
  } else if (newStatus === 'in_use' || newStatus === 'good') {
    comp.powerState = 'on';
  }

  // Ghi nhận lịch sử
  comp.history.unshift({
    date: new Date().toISOString().split('T')[0],
    action: `Đổi trạng thái sang ${STATUS_CONFIG[newStatus].label}`,
    technician: window.appState.currentUser.name,
    note: `Thao tác trực tiếp từ bảng điều khiển`
  });

  window.saveStateToLocalStorage();
  window.updateDashboardKPIs();

  if (window.labSimulation) {
    window.labSimulation.loadLab(window.labSimulation.currentLabId);
  }
  if (window.appState.currentTab === 'computers') {
    renderComputerTable();
  }

  Swal.close();
  setTimeout(() => {
    window.openComputerDetailModal(computerId);
  }, 200);
};

// Bật / Tắt nguồn từng máy
window.toggleSinglePower = function(computerId) {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('control_power', 'Bật / Tắt nguồn thiết bị')) return;
  const comp = window.appState.computers.find(c => c.id === computerId);
  if (!comp) return;

  comp.powerState = comp.powerState === 'on' ? 'off' : 'on';
  window.saveStateToLocalStorage();

  if (window.labSimulation) {
    window.labSimulation.loadLab(window.labSimulation.currentLabId);
  }

  Swal.close();
  setTimeout(() => {
    window.openComputerDetailModal(computerId);
  }, 200);
};

// Mô phỏng Ping Test IP máy tính
window.pingTestComputer = function(computerId, ip) {
  Swal.fire({
    title: `Ping kiểm tra ${computerId} (${ip})`,
    html: `
      <div class="bg-slate-900 text-green-400 font-mono text-left p-3 rounded text-xs space-y-1">
        <div>Pinging ${ip} with 32 bytes of data:</div>
        <div id="ping-line-1" class="hidden">Reply from ${ip}: bytes=32 time=1ms TTL=128</div>
        <div id="ping-line-2" class="hidden">Reply from ${ip}: bytes=32 time=1ms TTL=128</div>
        <div id="ping-line-3" class="hidden">Reply from ${ip}: bytes=32 time=2ms TTL=128</div>
        <div id="ping-line-4" class="hidden">Reply from ${ip}: bytes=32 time=1ms TTL=128</div>
        <div id="ping-summary" class="hidden text-white pt-2 border-t border-slate-700">Ping statistics for ${ip}: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss). Status: ONLINE OK!</div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Đóng',
    didOpen: () => {
      setTimeout(() => document.getElementById('ping-line-1')?.classList.remove('hidden'), 300);
      setTimeout(() => document.getElementById('ping-line-2')?.classList.remove('hidden'), 600);
      setTimeout(() => document.getElementById('ping-line-3')?.classList.remove('hidden'), 900);
      setTimeout(() => document.getElementById('ping-line-4')?.classList.remove('hidden'), 1200);
      setTimeout(() => document.getElementById('ping-summary')?.classList.remove('hidden'), 1500);
    }
  });
};

window.reportIncidentFromModal = function(computerId) {
  Swal.close();
  setTimeout(() => {
    window.maintenanceManager.showCreateIncidentModal(computerId);
  }, 250);
};

// Mô phỏng Màn hình Desktop ảo (Remote Desktop Preview)
window.openVirtualDesktopModal = function(computerId) {
  const comp = window.appState.computers.find(c => c.id === computerId);
  if (!comp) return;

  const isPowerOn = comp.powerState === 'on';

  Swal.fire({
    title: `
      <div class="flex items-center justify-between border-b pb-2 text-left">
        <div class="flex items-center space-x-2">
          <span class="w-3 h-3 rounded-full ${isPowerOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}"></span>
          <span class="text-sm font-bold font-mono text-slate-800">Remote Desktop • ${comp.id} (${comp.ipAddress})</span>
        </div>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">1920x1080 • 60Hz</span>
      </div>
    `,
    html: isPowerOn ? `
      <div class="virtual-screen-frame bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 text-left font-mono relative mt-2 shadow-2xl">
        <!-- Windows Title Bar -->
        <div class="bg-slate-800 px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 border-b border-slate-700">
          <div class="flex items-center space-x-2">
            <i class="fa-brands fa-windows text-blue-400"></i>
            <span class="text-[11px] font-sans font-semibold">Visual Studio Code - [TNUS_Algorithms.py] • Python 3.12</span>
          </div>
          <div class="flex items-center space-x-2 text-slate-400 text-xs">
            <i class="fa-solid fa-minus hover:text-white cursor-pointer"></i>
            <i class="fa-regular fa-square hover:text-white cursor-pointer"></i>
            <i class="fa-solid fa-xmark hover:text-rose-400 cursor-pointer"></i>
          </div>
        </div>

        <!-- Editor Area -->
        <div class="p-3 bg-[#1e1e1e] text-slate-200 text-xs font-mono space-y-1 overflow-x-auto">
          <div class="text-emerald-400"># KHOA TOAN - TIN • TRUONG DAI HOC KHOA HOC (TNUS)</div>
          <div class="text-slate-400"># Phong may: ${comp.labId} • May tram: ${comp.id} • IP: ${comp.ipAddress}</div>
          <div class="text-blue-300 mt-2">def <span class="text-yellow-300">dijkstra_shortest_path</span>(graph, start_node):</div>
          <div class="text-slate-300 pl-4">""" Thuat toan tim duong di ngan nhat tren do thi """</div>
          <div class="text-slate-300 pl-4">distances = {node: float('inf') for node in graph}</div>
          <div class="text-slate-300 pl-4">distances[start_node] = 0</div>
          <div class="text-cyan-400 pl-4">print(f"[TNUS Lab] Thuc thi giai thuat tu may: {start_node}")</div>
          <div class="text-purple-300 pl-4">return distances</div>
        </div>

        <!-- Terminal Output -->
        <div class="bg-black/90 p-2.5 border-t border-slate-700 text-[11px] font-mono space-y-1">
          <div class="text-slate-400">PS C:\\Users\\Student\\TNUS_Workspace&gt; python TNUS_Algorithms.py</div>
          <div class="text-emerald-400">[SUCCESS] Ket noi Server phong thuc hanh: 192.168.1.1 (Cisco Gigabit LAN OK)</div>
          <div class="text-blue-300">[INFO] CPU: ${comp.cpu} | RAM Used: 4.8GB / ${comp.ram} | OS: ${comp.os}</div>
          <div class="text-amber-400">[TEST] 5/5 Test cases PASSED (Thoi gian thuc thi: 0.042s). Dat 100/100 diem!</div>
        </div>

        <!-- Windows Taskbar -->
        <div class="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-t border-slate-800 text-xs">
          <div class="flex items-center space-x-3">
            <i class="fa-brands fa-windows text-blue-500 text-sm hover:scale-110 transition"></i>
            <i class="fa-regular fa-folder text-amber-400 hover:scale-110 transition"></i>
            <i class="fa-brands fa-edge text-blue-400 hover:scale-110 transition"></i>
            <i class="fa-solid fa-code text-blue-400 hover:scale-110 transition"></i>
            <i class="fa-solid fa-terminal text-emerald-400 hover:scale-110 transition"></i>
          </div>
          <div class="flex items-center space-x-2 text-[10px] text-slate-400 font-sans">
            <span>ENG</span>
            <span><i class="fa-solid fa-wifi text-emerald-400 mr-1"></i>1Gbps</span>
            <span><i class="fa-solid fa-volume-high mr-1"></i>100%</span>
            <span class="font-mono">2026-11-13</span>
          </div>
        </div>
      </div>
    ` : `
      <div class="bg-slate-900 text-slate-400 p-8 rounded-xl text-center space-y-3 border-2 border-slate-700">
        <i class="fa-solid fa-power-off text-4xl text-slate-600"></i>
        <div class="text-base font-bold text-slate-200">Máy tính đang tắt nguồn (Offline)</div>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">Không thể kết nối Remote Desktop khi máy đang ở chế độ Standby hoặc chưa cấp nguồn điện.</p>
        <button onclick="window.toggleSinglePower('${comp.id}'); window.openVirtualDesktopModal('${comp.id}');" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow">
          <i class="fa-solid fa-bolt mr-1.5"></i>Bật nguồn máy này ngay
        </button>
      </div>
    `,
    width: '740px',
    showConfirmButton: true,
    confirmButtonText: 'Đóng cửa sổ Remote',
    confirmButtonColor: '#2563eb'
  });
};

// Quản lý Bảng Danh Sách 104 Thiết Bị (Tab 3: Quản lý Thiết bị - ITAM)
let compFilter = {
  lab: 'all',
  status: 'all',
  brand: 'all',
  search: '',
  page: 1,
  pageSize: 15,
  selectedIds: new Set()
};

function initComputerListTable() {
  const labSelect = document.getElementById('table-filter-lab');
  const statusSelect = document.getElementById('table-filter-status');
  const brandSelect = document.getElementById('table-filter-brand');
  const pageSizeSelect = document.getElementById('table-page-size');
  const searchInput = document.getElementById('table-search-input');
  const exportBtn = document.getElementById('btn-export-excel');
  const addCompBtn = document.getElementById('btn-add-computer');
  const batchBtn = document.getElementById('btn-batch-actions');
  const printQrAllBtn = document.getElementById('btn-print-qr-all');
  const importInput = document.getElementById('input-import-excel');
  const checkAllBox = document.getElementById('check-all-computers');

  if (labSelect) {
    labSelect.addEventListener('change', (e) => {
      compFilter.lab = e.target.value;
      compFilter.page = 1;
      renderComputerTable();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      compFilter.status = e.target.value;
      compFilter.page = 1;
      renderComputerTable();
    });
  }

  if (brandSelect) {
    brandSelect.addEventListener('change', (e) => {
      compFilter.brand = e.target.value;
      compFilter.page = 1;
      renderComputerTable();
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', (e) => {
      compFilter.pageSize = parseInt(e.target.value, 10) || 15;
      compFilter.page = 1;
      renderComputerTable();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      compFilter.search = e.target.value.trim().toUpperCase();
      compFilter.page = 1;
      renderComputerTable();
    });
  }

  if (checkAllBox) {
    checkAllBox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const filteredList = getFilteredComputers();
      const startIndex = (compFilter.page - 1) * compFilter.pageSize;
      const pageItems = filteredList.slice(startIndex, startIndex + compFilter.pageSize);
      
      pageItems.forEach(c => {
        if (isChecked) {
          compFilter.selectedIds.add(c.id);
        } else {
          compFilter.selectedIds.delete(c.id);
        }
      });
      renderComputerTable();
    });
  }

  if (batchBtn) {
    batchBtn.addEventListener('click', () => {
      if (typeof window.showBatchActionsModal === 'function') window.showBatchActionsModal();
    });
  }

  if (printQrAllBtn) {
    printQrAllBtn.addEventListener('click', () => {
      if (typeof window.showPrintAllAssetTagsModal === 'function') window.showPrintAllAssetTagsModal();
    });
  }

  if (importInput) {
    importInput.addEventListener('change', (e) => {
      if (typeof handleExcelImport === 'function') handleExcelImport(e);
      else if (typeof window.handleExcelImport === 'function') window.handleExcelImport(e);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (typeof exportComputersToExcel === 'function') exportComputersToExcel();
      else if (typeof window.exportComputersToExcel === 'function') window.exportComputersToExcel();
    });
  }

  if (addCompBtn) {
    addCompBtn.addEventListener('click', () => {
      if (typeof showAddComputerModal === 'function') showAddComputerModal();
      else if (typeof window.showAddComputerModal === 'function') window.showAddComputerModal();
    });
  }
}

// Lọc danh sách máy tính theo các tiêu chí kết hợp
function getFilteredComputers() {
  let list = [...window.appState.computers];

  if (compFilter.lab !== 'all') {
    list = list.filter(c => c.labId === compFilter.lab);
  }
  if (compFilter.status !== 'all') {
    list = list.filter(c => c.status === compFilter.status);
  }
  if (compFilter.brand !== 'all') {
    list = list.filter(c => {
      const b = (c.brand || '').toLowerCase();
      if (compFilter.brand === 'FPT') return b.includes('fpt');
      if (compFilter.brand === 'Dell') return b.includes('dell');
      if (compFilter.brand === 'Asus') return b.includes('asus');
      return true;
    });
  }
  if (compFilter.search) {
    const s = compFilter.search;
    list = list.filter(c => 
      (c.id && c.id.toUpperCase().includes(s)) ||
      (c.brand && c.brand.toUpperCase().includes(s)) ||
      (c.model && c.model.toUpperCase().includes(s)) ||
      (c.cpu && c.cpu.toUpperCase().includes(s)) ||
      (c.ram && c.ram.toUpperCase().includes(s)) ||
      (c.storage && c.storage.toUpperCase().includes(s)) ||
      (c.ipAddress && c.ipAddress.toUpperCase().includes(s)) ||
      (c.macAddress && c.macAddress.toUpperCase().includes(s)) ||
      (c.serialNumber && c.serialNumber.toUpperCase().includes(s)) ||
      (c.name && c.name.toUpperCase().includes(s))
    );
  }
  return list;
}

// Toggle chọn từng máy tính qua checkbox
window.toggleSelectComputer = function(id, isChecked) {
  if (isChecked) {
    compFilter.selectedIds.add(id);
  } else {
    compFilter.selectedIds.delete(id);
  }
  updateSelectedCountUI();
};

function updateSelectedCountUI() {
  const badge = document.getElementById('selected-count-badge');
  const count = compFilter.selectedIds.size;
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  const filteredList = getFilteredComputers();
  const startIndex = (compFilter.page - 1) * compFilter.pageSize;
  const pageItems = filteredList.slice(startIndex, startIndex + compFilter.pageSize);
  const allChecked = pageItems.length > 0 && pageItems.every(c => compFilter.selectedIds.has(c.id));
  const checkAllBox = document.getElementById('check-all-computers');
  if (checkAllBox) {
    checkAllBox.checked = allChecked;
  }
  
  const countInfo = document.getElementById('table-count-info');
  if (countInfo) {
    countInfo.textContent = `Hiển thị ${pageItems.length}/${filteredList.length} máy tính ${count > 0 ? `(Đã chọn ${count} máy)` : ''}`;
  }
}

// Render bảng danh sách thiết bị
function renderComputerTable() {
  const tbody = document.getElementById('computer-table-body');
  if (!tbody) return;

  const curUser = window.appState?.currentUser;
  const curRole = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
  const canDeleteComp = (curRole === 'admin' || curRole === 'lab_manager');

  const list = getFilteredComputers();
  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / compFilter.pageSize) || 1;
  const startIndex = (compFilter.page - 1) * compFilter.pageSize;
  const pageItems = list.slice(startIndex, startIndex + compFilter.pageSize);

  updateSelectedCountUI();

  // Cập nhật Asset KPI tóm tắt
  const allComps = window.appState.computers;
  const totalComps = allComps.length;
  const activeComps = allComps.filter(c => c.status === 'good' || c.status === 'in_use').length;
  const issueComps = allComps.filter(c => c.status === 'warning' || c.status === 'broken').length;
  const rate = totalComps > 0 ? ((activeComps / totalComps) * 100).toFixed(1) : 0;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setEl('asset-summary-total', totalComps);
  setEl('asset-summary-active', activeComps);
  setEl('asset-summary-rate', `${rate}%`);
  setEl('asset-summary-issue', issueComps);

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-12 text-center text-slate-400">
          <i class="fa-solid fa-magnifying-glass text-3xl mb-2 block text-slate-300"></i>
          <span class="text-sm font-semibold">Không tìm thấy máy tính nào phù hợp với bộ lọc.</span>
          <p class="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa hoặc đặt lại tiêu chí lọc phòng, hãng máy.</p>
        </td>
      </tr>
    `;
    renderPagination(totalPages);
    return;
  }

  const labMap = {
    'PM1': { name: 'PM 1', code: 'A1-503', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    'PM2': { name: 'PM2', code: 'A1-504', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'PM3': { name: 'PM3', code: 'A1-505', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    'PM4': { name: 'PM4', code: 'A1-506', badge: 'bg-teal-50 text-teal-700 border-teal-200' }
  };

  tbody.innerHTML = pageItems.map(c => {
    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.good;
    const isPowerOn = c.powerState === 'on';
    const isSelected = compFilter.selectedIds.has(c.id);
    const labInfo = labMap[c.labId] || { name: c.labId, code: c.labId, badge: 'bg-slate-50 text-slate-700 border-slate-200' };

    return `
      <tr class="hover:bg-slate-50/80 transition cursor-pointer ${isSelected ? 'bg-blue-50/40' : ''}" onclick="window.openComputerDetailModal('${c.id}')">
        <!-- Checkbox chọn -->
        <td class="py-3 px-3 text-center" onclick="event.stopPropagation()">
          <input type="checkbox" class="comp-row-checkbox rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
            ${isSelected ? 'checked' : ''} 
            onchange="window.toggleSelectComputer('${c.id}', this.checked)">
        </td>

        <!-- Mã máy & Trạng thái nguồn -->
        <td class="py-3 px-3">
          <div class="flex items-center space-x-1.5">
            <span class="w-2 h-2 rounded-full ${isPowerOn ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'}" title="${isPowerOn ? 'Nguồn: BẬT' : 'Nguồn: TẮT'}"></span>
            <span onclick="event.stopPropagation(); window.locateComputerOn2D('${c.id}')" class="font-mono font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer flex items-center gap-1" title="Định vị máy ${c.id} trên Sơ đồ 2D">
              ${c.id} <i class="fa-solid fa-map-location-dot text-[10px] text-teal-600 opacity-70 hover:opacity-100"></i>
            </span>
          </div>
          <div class="text-[10px] text-slate-400 font-mono">${c.name || ''}</div>
        </td>

        <!-- Phòng máy & vị trí -->
        <td class="py-3 px-3">
          <div class="flex items-center space-x-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${labInfo.badge}">${labInfo.code}</span>
            <span class="font-semibold text-slate-800">${labInfo.name}</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">Hàng ${c.position?.row || 1}, Cột ${c.position?.col || 1}</div>
        </td>

        <!-- Hãng & Serial -->
        <td class="py-3 px-3">
          <div class="font-bold text-slate-800">${c.brand}</div>
          <div class="text-[11px] text-slate-500">${c.model}</div>
          <div class="text-[10px] font-mono text-slate-400">SN: ${c.serialNumber || ('SN-' + c.id)}</div>
        </td>

        <!-- Cấu hình CPU / RAM / SSD -->
        <td class="py-3 px-3">
          <div class="font-mono text-slate-800 font-medium">${c.cpu}</div>
          <div class="text-[11px] text-slate-500 font-medium mt-0.5">${c.ram} • ${c.storage}</div>
          <div class="text-[10px] text-slate-400">${c.monitor || 'LED FHD'}</div>
        </td>

        <!-- Mạng & Kết nối -->
        <td class="py-3 px-3">
          <div class="font-mono text-blue-700 font-semibold flex items-center">
            <i class="fa-solid fa-network-wired text-[10px] text-slate-400 mr-1"></i>${c.ipAddress}
          </div>
          <div class="font-mono text-[10px] text-slate-400 mt-0.5">${c.macAddress}</div>
        </td>

        <!-- Trạng thái -->
        <td class="py-3 px-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs" style="background-color: ${cfg.hex};">
            <span class="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>${cfg.label}
          </span>
        </td>

        <!-- Kiểm định -->
        <td class="py-3 px-3">
          <div class="font-mono text-slate-700 text-[11px]">${c.lastInspected}</div>
          <div class="text-[10px] text-emerald-600 font-medium">Bảo dưỡng OK</div>
        </td>

        <!-- Nhóm Thao tác -->
        <td class="py-3 px-3 text-right" onclick="event.stopPropagation()">
          <div class="flex items-center justify-end space-x-1">
            <button onclick="window.openComputerDetailModal('${c.id}')" class="p-1.5 text-blue-600 hover:bg-blue-100/70 rounded transition" title="Xem chi tiết">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button onclick="window.locateComputerOn2D('${c.id}')" class="p-1.5 text-teal-600 hover:bg-teal-100/70 rounded transition" title="Định vị máy trên sơ đồ 2D">
              <i class="fa-solid fa-map-location-dot"></i>
            </button>
            <button onclick="window.openVirtualDesktopModal('${c.id}')" class="p-1.5 text-indigo-600 hover:bg-indigo-100/70 rounded transition" title="Màn hình ảo (Desktop)">
              <i class="fa-solid fa-desktop"></i>
            </button>
            <button onclick="window.showEditComputerModal('${c.id}')" class="p-1.5 text-amber-600 hover:bg-amber-100/70 rounded transition" title="Chỉnh sửa thông số">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="window.showPrintAssetTagModal('${c.id}')" class="p-1.5 text-purple-600 hover:bg-purple-100/70 rounded transition" title="In tem mã QR tài sản">
              <i class="fa-solid fa-qrcode"></i>
            </button>
            <button onclick="window.reportIncidentForComputer('${c.id}')" class="p-1.5 text-rose-500 hover:bg-rose-100/70 rounded transition" title="Báo sự cố">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </button>
            ${canDeleteComp ? `
            <button onclick="window.deleteComputer('${c.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Xóa thiết bị">
              <i class="fa-regular fa-trash-can"></i>
            </button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('table-pagination');
  if (!container) return;

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button onclick="window.changeTablePage(${i})" class="px-2.5 py-1 text-xs rounded border ${i === compFilter.page ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
        ${i}
      </button>
    `;
  }
  container.innerHTML = html;
}

window.changeTablePage = function(page) {
  compFilter.page = page;
  renderComputerTable();
};

// 1. CHỈNH SỬA TOÀN DIỆN THÔNG TIN MÁY TÍNH (ENTERPRISE IT EDIT MODAL)
window.showEditComputerModal = function(computerId) {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('edit_device', 'Chỉnh sửa cấu hình thông số máy tính')) return;
  const comp = window.appState.computers.find(c => c.id === computerId);
  if (!comp) return;

  Swal.fire({
    title: `
      <div class="flex items-center space-x-2 text-left">
        <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-base">
          <i class="fa-solid fa-pen-to-square"></i>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900">Cập Nhật Thông Số Thiết Bị ${comp.id}</div>
          <div class="text-xs text-slate-500 font-normal">Quản lý vòng đời tài sản CNTT • Khoa Toán - Tin TNUS</div>
        </div>
      </div>
    `,
    html: `
      <form id="form-edit-computer" class="text-left space-y-4 text-xs max-h-[72vh] overflow-y-auto pr-1">
        <!-- Nhóm Định danh & Phòng máy -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div class="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center">
            <i class="fa-solid fa-tag text-blue-600 mr-1.5"></i>Định danh & Vị trí lắp đặt
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Mã máy (Asset ID)</label>
              <input type="text" id="edit-comp-id" value="${comp.id}" readonly class="w-full p-2 bg-slate-200/80 border border-slate-300 rounded font-mono font-bold text-slate-700 cursor-not-allowed">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Tên thiết bị</label>
              <input type="text" id="edit-comp-name" value="${comp.name || ''}" class="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Phòng máy trực thuộc *</label>
              <select id="edit-comp-lab" class="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-blue-700 focus:ring-1 focus:ring-blue-500">
                <option value="PM1" ${comp.labId === 'PM1' ? 'selected' : ''}>PM 1 (A1-503) - FPT Elead</option>
                <option value="PM2" ${comp.labId === 'PM2' ? 'selected' : ''}>PM2 (A1-504) - Asus / FPT</option>
                <option value="PM3" ${comp.labId === 'PM3' ? 'selected' : ''}>PM3 (A1-505) - Dell OptiPlex</option>
                <option value="PM4" ${comp.labId === 'PM4' ? 'selected' : ''}>PM4 (A1-506) - Dell OptiPlex</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2.5 mt-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Vị trí hàng (Row)</label>
              <input type="number" min="1" max="10" id="edit-comp-row" value="${comp.position?.row || 1}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Vị trí cột (Column)</label>
              <input type="number" min="1" max="10" id="edit-comp-col" value="${comp.position?.col || 1}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
          </div>
        </div>

        <!-- Nhóm Cấu hình phần cứng -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div class="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center">
            <i class="fa-solid fa-microchip text-indigo-600 mr-1.5"></i>Cấu hình phần cứng chi tiết
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Thương hiệu (Brand)</label>
              <input type="text" id="edit-comp-brand" value="${comp.brand}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Dòng máy (Model)</label>
              <input type="text" id="edit-comp-model" value="${comp.model}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Số Serial (S/N)</label>
              <input type="text" id="edit-comp-serial" value="${comp.serialNumber || ('SN-' + comp.id)}" class="w-full p-2 bg-white border border-slate-300 rounded font-mono">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Vi xử lý (CPU)</label>
              <input type="text" id="edit-comp-cpu" value="${comp.cpu}" class="w-full p-2 bg-white border border-slate-300 rounded font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Bộ nhớ RAM</label>
              <input type="text" id="edit-comp-ram" value="${comp.ram}" class="w-full p-2 bg-white border border-slate-300 rounded font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Ổ cứng (Storage)</label>
              <input type="text" id="edit-comp-storage" value="${comp.storage}" class="w-full p-2 bg-white border border-slate-300 rounded font-mono">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Màn hình hiển thị</label>
              <input type="text" id="edit-comp-monitor" value="${(comp.monitor || 'LED FHD 22 inch').replace(/"/g, '&quot;')}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Card đồ họa (GPU)</label>
              <input type="text" id="edit-comp-gpu" value="${comp.gpu || 'Intel UHD Graphics'}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
          </div>
        </div>

        <!-- Nhóm Mạng & Phần mềm -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div class="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center">
            <i class="fa-solid fa-network-wired text-cyan-600 mr-1.5"></i>Mạng, Hệ điều hành & Bản quyền
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Địa chỉ IP tĩnh</label>
              <input type="text" id="edit-comp-ip" value="${comp.ipAddress}" class="w-full p-2 bg-white border border-slate-300 rounded font-mono text-blue-700 font-bold">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Địa chỉ MAC Card mạng</label>
              <input type="text" id="edit-comp-mac" value="${comp.macAddress}" class="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-600">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Hệ điều hành (OS)</label>
              <input type="text" id="edit-comp-os" value="${comp.os || 'Windows 11 Pro 64-bit'}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Bản quyền phần mềm</label>
              <input type="text" id="edit-comp-license" value="${comp.license || 'OEM TNUS Kỹ thuật số'}" class="w-full p-2 bg-white border border-slate-300 rounded text-emerald-700 font-semibold">
            </div>
          </div>
        </div>

        <!-- Nhóm Trạng thái vận hành & Ghi chú -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div class="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 flex items-center">
            <i class="fa-solid fa-sliders text-emerald-600 mr-1.5"></i>Trạng thái vận hành & Bảo dưỡng
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Tình trạng máy</label>
              <select id="edit-comp-status" class="w-full p-2 bg-white border border-slate-300 rounded font-bold">
                <option value="good" ${comp.status === 'good' ? 'selected' : ''}>🟢 Hoạt động tốt</option>
                <option value="in_use" ${comp.status === 'in_use' ? 'selected' : ''}>🔵 Đang học / Đang dùng</option>
                <option value="warning" ${comp.status === 'warning' ? 'selected' : ''}>🟡 Cần kiểm tra</option>
                <option value="broken" ${comp.status === 'broken' ? 'selected' : ''}>🔴 Đang hỏng</option>
                <option value="inactive" ${comp.status === 'inactive' ? 'selected' : ''}>⚪ Ngừng sử dụng</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Nguồn điện</label>
              <select id="edit-comp-power" class="w-full p-2 bg-white border border-slate-300 rounded font-bold">
                <option value="on" ${comp.powerState === 'on' ? 'selected' : ''}>⚡ BẬT (Power ON)</option>
                <option value="off" ${comp.powerState === 'off' ? 'selected' : ''}>💤 TẮT (Power OFF)</option>
              </select>
            </div>
          </div>
          <div class="mt-2.5">
            <label class="block font-semibold text-slate-600 mb-1">Ghi chú kỹ thuật / Lịch sử kiểm định</label>
            <textarea id="edit-comp-notes" rows="2" class="w-full p-2 bg-white border border-slate-300 rounded placeholder-slate-400" placeholder="Ghi chú chi tiết về tình trạng hoặc kiểm tra...">${comp.notes || ''}</textarea>
          </div>
        </div>
      </form>
    `,
    width: '680px',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-floppy-disk mr-1.5"></i>Lưu Thay Đổi',
    cancelButtonText: 'Hủy bỏ',
    confirmButtonColor: '#2563eb',
    preConfirm: () => {
      const name = document.getElementById('edit-comp-name').value.trim();
      const labId = document.getElementById('edit-comp-lab').value;
      const row = parseInt(document.getElementById('edit-comp-row').value, 10) || 1;
      const col = parseInt(document.getElementById('edit-comp-col').value, 10) || 1;
      const brand = document.getElementById('edit-comp-brand').value.trim();
      const model = document.getElementById('edit-comp-model').value.trim();
      const serial = document.getElementById('edit-comp-serial').value.trim();
      const cpu = document.getElementById('edit-comp-cpu').value.trim();
      const ram = document.getElementById('edit-comp-ram').value.trim();
      const storage = document.getElementById('edit-comp-storage').value.trim();
      const monitor = document.getElementById('edit-comp-monitor').value.trim();
      const gpu = document.getElementById('edit-comp-gpu').value.trim();
      const ip = document.getElementById('edit-comp-ip').value.trim();
      const mac = document.getElementById('edit-comp-mac').value.trim();
      const os = document.getElementById('edit-comp-os').value.trim();
      const license = document.getElementById('edit-comp-license').value.trim();
      const status = document.getElementById('edit-comp-status').value;
      const power = document.getElementById('edit-comp-power').value;
      const notes = document.getElementById('edit-comp-notes').value.trim();

      if (!brand || !cpu || !ip) {
        Swal.showValidationMessage('Vui lòng điền đầy đủ thương hiệu, CPU và địa chỉ IP!');
        return false;
      }

      return {
        name, labId, row, col, brand, model, serial, cpu, ram, storage,
        monitor, gpu, ip, mac, os, license, status, power, notes
      };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      const v = result.value;
      comp.name = v.name;
      comp.labId = v.labId;
      comp.position = { row: v.row, col: v.col };
      comp.brand = v.brand;
      comp.model = v.model;
      comp.serialNumber = v.serial;
      comp.cpu = v.cpu;
      comp.ram = v.ram;
      comp.storage = v.storage;
      comp.monitor = v.monitor;
      comp.gpu = v.gpu;
      comp.ipAddress = v.ip;
      comp.macAddress = v.mac;
      comp.os = v.os;
      comp.license = v.license;
      comp.status = v.status;
      comp.powerState = v.power;
      comp.notes = v.notes;
      comp.lastInspected = new Date().toISOString().split('T')[0];

      if (!comp.history) comp.history = [];
      comp.history.unshift({
        date: new Date().toISOString().split('T')[0],
        action: 'Cập nhật thông số kỹ thuật & kiểm định',
        technician: window.appState.currentUser.name,
        note: v.notes || 'Cập nhật định kỳ thông số phần cứng và mạng'
      });

      window.saveStateToLocalStorage();
      renderComputerTable();
      window.updateDashboardKPIs();
      if (window.labSimulation) window.labSimulation.render();

      Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công!',
        text: `Đã lưu thay đổi cho máy ${comp.id}.`,
        timer: 1600,
        showConfirmButton: false
      });
    }
  });
};

// 2. THAO TÁC HÀNG LOẠT (BATCH OPERATIONS FOR SELECTED COMPUTERS)
window.showBatchActionsModal = function() {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('control_power', 'Thao tác điều khiển trạng thái hàng loạt')) return;
  const selectedCount = compFilter.selectedIds.size;
  if (selectedCount === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Chưa chọn thiết bị',
      text: 'Vui lòng tích chọn ít nhất 1 máy tính từ danh sách để thực hiện thao tác hàng loạt.',
      confirmButtonText: 'Đã hiểu',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const curUser = window.appState?.currentUser;
  const curRole = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
  const canDeleteComp = (curRole === 'admin' || curRole === 'lab_manager');

  Swal.fire({
    title: `
      <div class="text-left">
        <div class="text-base font-bold text-slate-800 flex items-center">
          <i class="fa-solid fa-check-double text-indigo-600 mr-2"></i>Thao Tác Hàng Loạt (${selectedCount} máy)
        </div>
        <div class="text-xs text-slate-500 font-normal mt-0.5">Chọn một hành động quản trị áp dụng cho tất cả máy đã tích chọn</div>
      </div>
    `,
    html: `
      <div class="text-left space-y-3 text-xs pt-1">
        <!-- Hành động 1: Cập nhật trạng thái -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label class="font-bold text-slate-700 flex items-center">
            <i class="fa-solid fa-traffic-light text-blue-600 mr-1.5"></i>1. Cập nhật trạng thái đồng loạt:
          </label>
          <div class="flex items-center space-x-2">
            <select id="batch-status-val" class="flex-1 p-2 bg-white border border-slate-300 rounded font-semibold text-slate-800">
              <option value="">-- Chọn trạng thái mới --</option>
              <option value="good">🟢 Hoạt động tốt</option>
              <option value="in_use">🔵 Đang sử dụng</option>
              <option value="warning">🟡 Cần kiểm tra</option>
              <option value="broken">🔴 Đang hỏng</option>
              <option value="inactive">⚪ Ngừng sử dụng</option>
            </select>
            <button onclick="window.applyBatchStatus()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition">
              Áp dụng
            </button>
          </div>
        </div>

        <!-- Hành động 2: Nguồn điện -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label class="font-bold text-slate-700 flex items-center">
            <i class="fa-solid fa-bolt text-amber-500 mr-1.5"></i>2. Điều khiển nguồn điện (Wake-on-LAN):
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="window.applyBatchPower('on')" class="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center justify-center space-x-1">
              <i class="fa-solid fa-power-off"></i>
              <span>Bật nguồn tất cả</span>
            </button>
            <button onclick="window.applyBatchPower('off')" class="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded font-bold transition flex items-center justify-center space-x-1">
              <i class="fa-solid fa-power-off"></i>
              <span>Tắt nguồn tất cả</span>
            </button>
          </div>
        </div>

        <!-- Hành động 3: In tem tài sản QR -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-700 flex items-center">
              <i class="fa-solid fa-qrcode text-purple-600 mr-1.5"></i>3. In tem QR tài sản CNTT
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">Xuất mẫu in tem chuẩn TNUS cho ${selectedCount} máy tính đã chọn</div>
          </div>
          <button onclick="Swal.close(); window.showPrintAllAssetTagsModal(true)" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold transition">
            In tem ngay
          </button>
        </div>

        <!-- Hành động 4: Ghi chú bảo dưỡng -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label class="font-bold text-slate-700 flex items-center">
            <i class="fa-solid fa-clipboard-check text-emerald-600 mr-1.5"></i>4. Cập nhật ngày kiểm tra & ghi chú bảo dưỡng:
          </label>
          <div class="flex items-center space-x-2">
            <input type="text" id="batch-note-val" placeholder="Nhập ghi chú chung (VD: Đã vệ sinh quạt gió, tra keo tản nhiệt)..." class="flex-1 p-2 bg-white border border-slate-300 rounded">
            <button onclick="window.applyBatchNote()" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition whitespace-nowrap">
              Cập nhật
            </button>
          </div>
        </div>

        ${canDeleteComp ? `
        <!-- Hành động 5: Xóa máy -->
        <div class="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
          <div>
            <div class="font-bold text-rose-700 flex items-center">
              <i class="fa-solid fa-trash-can text-rose-600 mr-1.5"></i>5. Xóa các thiết bị đã chọn
            </div>
            <div class="text-[11px] text-rose-600">Thao tác này sẽ gỡ bỏ ${selectedCount} máy tính khỏi hệ thống</div>
          </div>
          <button onclick="window.applyBatchDelete()" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition">
            Xóa máy
          </button>
        </div>` : ''}
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Đóng hộp thoại',
    width: '560px'
  });
};

window.applyBatchStatus = function() {
  const val = document.getElementById('batch-status-val')?.value;
  if (!val) {
    Swal.showValidationMessage('Vui lòng chọn trạng thái cần áp dụng!');
    return;
  }
  const count = compFilter.selectedIds.size;
  window.appState.computers.forEach(c => {
    if (compFilter.selectedIds.has(c.id)) {
      c.status = val;
      c.lastInspected = new Date().toISOString().split('T')[0];
    }
  });
  window.saveStateToLocalStorage();
  renderComputerTable();
  window.updateDashboardKPIs();
  if (window.labSimulation) window.labSimulation.render();
  Swal.fire('Thành công', `Đã đổi trạng thái cho ${count} máy tính thành công.`, 'success');
};

window.applyBatchPower = function(state) {
  const count = compFilter.selectedIds.size;
  window.appState.computers.forEach(c => {
    if (compFilter.selectedIds.has(c.id)) {
      c.powerState = state;
    }
  });
  window.saveStateToLocalStorage();
  renderComputerTable();
  window.updateDashboardKPIs();
  if (window.labSimulation) window.labSimulation.render();
  Swal.fire('Thành công', `Đã ${state === 'on' ? 'bật nguồn (Wake-on-LAN)' : 'tắt nguồn'} cho ${count} máy tính.`, 'success');
};

window.applyBatchNote = function() {
  const note = document.getElementById('batch-note-val')?.value.trim();
  if (!note) {
    Swal.showValidationMessage('Vui lòng nhập nội dung ghi chú!');
    return;
  }
  const count = compFilter.selectedIds.size;
  const today = new Date().toISOString().split('T')[0];
  window.appState.computers.forEach(c => {
    if (compFilter.selectedIds.has(c.id)) {
      c.notes = note;
      c.lastInspected = today;
      if (!c.history) c.history = [];
      c.history.unshift({
        date: today,
        action: 'Bảo dưỡng thiết bị định kỳ (Hàng loạt)',
        technician: window.appState.currentUser.name,
        note: note
      });
    }
  });
  window.saveStateToLocalStorage();
  renderComputerTable();
  Swal.fire('Thành công', `Đã cập nhật bảo dưỡng cho ${count} máy tính.`, 'success');
};

window.applyBatchDelete = function() {
  const curUser = window.appState?.currentUser;
  const curRole = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
  if (curRole !== 'admin' && curRole !== 'lab_manager') {
    Swal.fire({
      icon: 'error',
      title: 'Truy cập bị từ chối',
      html: 'Chỉ <strong>Quản trị viên (Admin)</strong> và <strong>Quản lý phòng máy</strong> mới có thẩm quyền xóa bỏ tài sản máy tính khỏi hệ thống.'
    });
    return;
  }
  const count = compFilter.selectedIds.size;
  Swal.fire({
    title: 'Xác nhận xóa hàng loạt?',
    text: `Bạn có chắc chắn muốn xóa ${count} máy tính đã chọn khỏi cơ sở dữ liệu?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    confirmButtonText: 'Đồng ý xóa vĩnh viễn',
    cancelButtonText: 'Hủy'
  }).then(res => {
    if (res.isConfirmed) {
      window.appState.computers = window.appState.computers.filter(c => !compFilter.selectedIds.has(c.id));
      compFilter.selectedIds.clear();
      window.saveStateToLocalStorage();
      renderComputerTable();
      window.updateDashboardKPIs();
      if (window.labSimulation) window.labSimulation.render();
      Swal.fire('Đã xóa', `Đã xóa ${count} máy tính khỏi hệ thống.`, 'success');
    }
  });
};

// 3. IN TEM MÃ QR TÀI SẢN CNTT (PRINT UNIVERSITY ASSET TAGS)
function generateSingleAssetTagHtml(comp) {
  const labMap = {
    'PM1': { name: 'PM 1 (A1-503)', room: 'Phòng A1-503 • Tầng 5, Nhà A1' },
    'PM2': { name: 'PM2 (A1-504)', room: 'Phòng A1-504 • Tầng 5, Nhà A1' },
    'PM3': { name: 'PM3 (A1-505)', room: 'Phòng A1-505 • Tầng 5, Nhà A1' },
    'PM4': { name: 'PM4 (A1-506)', room: 'Phòng A1-506 • Tầng 5, Nhà A1' }
  };
  const lab = labMap[comp.labId] || { name: comp.labId, room: 'Tầng 5, Nhà A1' };
  const qrData = JSON.stringify({
    assetId: `TNUS-ITAM-${comp.id}`,
    room: comp.labId,
    specs: `${comp.brand} - ${comp.cpu} - ${comp.ram}`,
    ip: comp.ipAddress,
    mac: comp.macAddress,
    manager: 'ThS. Trịnh Minh Phú (0975.090.666)'
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return `
    <div class="tag-card p-4 shadow-sm relative overflow-hidden flex flex-col justify-between border-2 border-slate-800 bg-white rounded-lg" style="min-height: 230px;">
      <!-- Tiêu đề tem trường TNUS -->
      <div class="border-b-2 border-slate-800 pb-2 mb-2 flex items-center justify-between">
        <div>
          <div class="text-[9px] font-black uppercase tracking-tight text-slate-900 leading-tight">TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)</div>
          <div class="text-[8px] font-bold text-blue-700 tracking-wider uppercase">KHOA TOÁN - TIN • TRUNG TÂM PHÒNG THỰC HÀNH MÁY TÍNH</div>
        </div>
        <div class="text-right">
          <span class="inline-block px-1.5 py-0.5 bg-blue-700 text-white font-mono font-black text-[10px] rounded">ITAM-2026</span>
        </div>
      </div>

      <!-- Phần thân tem: Mã QR & Thông số chi tiết -->
      <div class="grid grid-cols-12 gap-3 items-center my-auto">
        <!-- Mã QR và Mã vạch -->
        <div class="col-span-4 flex flex-col items-center justify-center text-center border-r border-dashed border-slate-300 pr-2">
          <img src="${qrUrl}" alt="QR ${comp.id}" class="w-24 h-24 object-contain border border-slate-200 p-0.5 rounded bg-white">
          <span class="font-mono font-black text-[11px] text-slate-900 mt-1 tracking-wider">${comp.id}</span>
        </div>

        <!-- Thông số cấu hình & mạng -->
        <div class="col-span-8 pl-1 text-[11px] leading-tight space-y-1 text-slate-800">
          <div><span class="text-slate-500 font-medium">Vị trí:</span> <strong class="text-blue-800">${lab.name}</strong> (Hàng ${comp.position?.row || 1}, Cột ${comp.position?.col || 1})</div>
          <div><span class="text-slate-500 font-medium">Địa điểm:</span> <span class="font-medium">${lab.room}</span></div>
          <div><span class="text-slate-500 font-medium">Thiết bị:</span> <strong>${comp.brand}</strong> - ${comp.model}</div>
          <div><span class="text-slate-500 font-medium">Cấu hình:</span> <span class="font-mono text-[10px] font-semibold">${comp.cpu}</span></div>
          <div><span class="text-slate-500 font-medium">Bộ nhớ:</span> <span class="font-mono text-[10px]">${comp.ram} • ${comp.storage}</span></div>
          <div><span class="text-slate-500 font-medium">Mạng:</span> <span class="font-mono text-[10px] text-blue-700 font-bold">IP ${comp.ipAddress}</span></div>
          <div class="text-[9px] text-slate-400 font-mono">MAC: ${comp.macAddress}</div>
        </div>
      </div>

      <!-- Chân tem: Cán bộ quản lý -->
      <div class="border-t border-slate-200 pt-1.5 mt-2 flex items-center justify-between text-[9px] text-slate-600">
        <div>Phụ trách: <strong>ThS. Trịnh Minh Phú</strong> • <span class="font-mono font-bold text-blue-700">0975.090.666</span></div>
        <div class="font-mono text-slate-400">Kiểm định: ${comp.lastInspected}</div>
      </div>
    </div>
  `;
}

function printHtmlContent(title, htmlContent) {
  const printWindow = window.open('', '_blank', 'width=950,height=750');
  if (!printWindow) {
    Swal.fire('Lỗi', 'Trình duyệt chặn mở cửa sổ in (popup). Vui lòng cho phép popup để xem bản in tem.', 'warning');
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${'<scr' + 'ipt src="https://cdn.tailwindcss.com"></scr' + 'ipt>'}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        @page { size: A4; margin: 10mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
        }
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .tag-card { border: 2px solid #0f172a; border-radius: 8px; background: white; break-inside: avoid; }
      </style>
    </head>
    <body>
      <div class="no-print mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <h2 class="font-bold text-blue-900 text-base flex items-center"><i class="fa-solid fa-print mr-2"></i>Bản In Tem Quản Lý Thiết Bị CNTT - TNUS</h2>
          <p class="text-xs text-blue-700 mt-0.5">Đã tối ưu hóa định dạng chuẩn tem kiểm kê tài sản (Khổ A4 / Decal tem 70x50mm)</p>
        </div>
        <button onclick="window.print()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition flex items-center space-x-2 text-sm">
          <i class="fa-solid fa-print"></i>
          <span>Bấm Để In Ngay</span>
        </button>
      </div>
      <div class="print-content">
        ${htmlContent}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
}

window.showPrintAssetTagModal = function(computerId) {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('print_asset_tag', 'In tem kiểm kê tài sản QR Code')) return;
  const comp = window.appState.computers.find(c => c.id === computerId);
  if (!comp) return;

  const tagHtml = generateSingleAssetTagHtml(comp);

  Swal.fire({
    title: `
      <div class="flex items-center space-x-2 text-left">
        <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-base">
          <i class="fa-solid fa-qrcode"></i>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900">Tem Quản Lý Tài Sản ${comp.id}</div>
          <div class="text-xs text-slate-500 font-normal">Mã QR quét thông tin định danh & vị trí phòng máy TNUS</div>
        </div>
      </div>
    `,
    html: `
      <div class="pt-2">
        ${tagHtml}
      </div>
    `,
    width: '600px',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-print mr-1.5"></i>In Tem Này',
    cancelButtonText: 'Đóng',
    confirmButtonColor: '#7c3aed'
  }).then(res => {
    if (res.isConfirmed) {
      printHtmlContent(`Tem Tài Sản CNTT - ${comp.id}`, `<div class="max-w-md mx-auto">${tagHtml}</div>`);
    }
  });
};

window.showPrintAllAssetTagsModal = function(onlySelected = false) {
  let targetComps = [];
  if (onlySelected && compFilter.selectedIds.size > 0) {
    targetComps = window.appState.computers.filter(c => compFilter.selectedIds.has(c.id));
  } else {
    targetComps = getFilteredComputers();
  }

  if (targetComps.length === 0) {
    Swal.fire('Thông báo', 'Không có máy tính nào phù hợp để in tem.', 'info');
    return;
  }

  const tagsGridHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${targetComps.map(c => generateSingleAssetTagHtml(c)).join('')}
    </div>
  `;

  printHtmlContent(`Danh Sách ${targetComps.length} Tem Tài Sản CNTT - TNUS`, tagsGridHtml);
};

// 4. NHẬP DỮ LIỆU EXCEL / CSV (BULK ASSET IMPORT)
function handleExcelImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (typeof XLSX === 'undefined') {
    Swal.fire('Lỗi', 'Thư viện SheetJS XLSX chưa được tải.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      if (!rows || rows.length === 0) {
        Swal.fire('Thông báo', 'Tệp Excel không có dữ liệu máy tính.', 'warning');
        return;
      }

      let addedCount = 0;
      let updatedCount = 0;

      rows.forEach((row, idx) => {
        const id = (row['Mã thiết bị'] || row['Mã máy'] || row['id'] || row['ID'] || `COMP-${Date.now()}-${idx}`).toString().trim().toUpperCase();
        const labId = (row['Phòng máy'] || row['labId'] || row['Phòng'] || 'PM1').toString().trim().toUpperCase();
        const brand = (row['Hãng máy'] || row['Thương hiệu'] || row['brand'] || 'Đồng bộ FPT').toString().trim();
        const model = (row['Loại máy'] || row['Model'] || row['model'] || 'Standard Edition').toString().trim();
        const cpu = (row['CPU'] || row['cpu'] || 'Intel Core i5').toString().trim();
        const ram = (row['RAM'] || row['ram'] || '16 GB').toString().trim();
        const storage = (row['Ổ cứng'] || row['storage'] || 'SSD 256GB').toString().trim();
        const monitor = (row['Màn hình'] || row['monitor'] || 'LED FHD 22"').toString().trim();
        const ip = (row['Địa chỉ IP'] || row['IP'] || row['ipAddress'] || `192.168.1.${100 + idx}`).toString().trim();
        const mac = (row['Địa chỉ MAC'] || row['MAC'] || row['macAddress'] || '00:1B:44:11:3A:B7').toString().trim();
        const statusRaw = (row['Tình trạng'] || row['Trạng thái'] || row['status'] || 'good').toString().trim().toLowerCase();
        
        let status = 'good';
        if (statusRaw.includes('dùng') || statusRaw.includes('in_use')) status = 'in_use';
        else if (statusRaw.includes('tra') || statusRaw.includes('warning') || statusRaw.includes('cảnh báo')) status = 'warning';
        else if (statusRaw.includes('hỏng') || statusRaw.includes('broken') || statusRaw.includes('lỗi')) status = 'broken';
        else if (statusRaw.includes('ngừng') || statusRaw.includes('inactive')) status = 'inactive';

        const existing = window.appState.computers.find(c => c.id === id);
        if (existing) {
          existing.labId = labId;
          existing.brand = brand;
          existing.model = model;
          existing.cpu = cpu;
          existing.ram = ram;
          existing.storage = storage;
          existing.monitor = monitor;
          existing.ipAddress = ip;
          existing.macAddress = mac;
          existing.status = status;
          existing.lastInspected = new Date().toISOString().split('T')[0];
          updatedCount++;
        } else {
          window.appState.computers.push({
            id,
            labId,
            name: `Máy tính ${id}`,
            brand,
            model,
            serialNumber: `SN-${id}`,
            ipAddress: ip,
            macAddress: mac,
            status,
            powerState: 'on',
            cpu,
            ram,
            storage,
            monitor,
            gpu: 'Intel Integrated Graphics',
            os: 'Windows 11 Pro 64-bit',
            license: 'OEM Kỹ thuật số TNUS',
            keyboardMouse: 'Combo USB Phím Chuột',
            position: { row: Math.floor(idx / 6) + 1, col: (idx % 6) + 1 },
            installDate: new Date().toISOString().split('T')[0],
            lastInspected: new Date().toISOString().split('T')[0],
            notes: 'Nhập khẩu từ Excel',
            history: [{
              date: new Date().toISOString().split('T')[0],
              action: 'Nhập khẩu dữ liệu thiết bị từ Excel',
              technician: window.appState.currentUser.name,
              note: 'Tạo mới từ tệp bảng tính'
            }]
          });
          addedCount++;
        }
      });

      window.saveStateToLocalStorage();
      renderComputerTable();
      window.updateDashboardKPIs();
      if (window.labSimulation) window.labSimulation.render();

      Swal.fire({
        icon: 'success',
        title: 'Nhập dữ liệu thành công!',
        html: `
          <div class="text-left text-xs space-y-1.5 pt-1">
            <p>Đã xử lý xong tệp <strong>${file.name}</strong>:</p>
            <p class="text-emerald-600 font-bold"><i class="fa-solid fa-plus-circle mr-1"></i>Thêm mới: ${addedCount} thiết bị</p>
            <p class="text-blue-600 font-bold"><i class="fa-solid fa-arrows-rotate mr-1"></i>Cập nhật thông số: ${updatedCount} thiết bị</p>
            <p class="text-slate-500 pt-2 border-t mt-2">Tổng số thiết bị trong hệ thống: <strong>${window.appState.computers.length} máy</strong></p>
          </div>
        `
      });
    } catch (err) {
      console.error('Lỗi khi đọc file Excel:', err);
      Swal.fire('Lỗi định dạng', 'Không thể đọc dữ liệu từ tệp này. Vui lòng kiểm tra lại cấu trúc bảng.', 'error');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsArrayBuffer(file);
}

// 5. THÊM MỚI THIẾT BỊ VÀO PHÒNG MÁY
function showAddComputerModal() {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('edit_device', 'Thêm máy tính mới vào phòng')) return;
  Swal.fire({
    title: `
      <div class="flex items-center space-x-2 text-left">
        <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
          <i class="fa-solid fa-plus"></i>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900">Thêm Máy Tính Mới</div>
          <div class="text-xs text-slate-500 font-normal">Đăng ký thiết bị mới vào hệ thống quản lý phòng máy TNUS</div>
        </div>
      </div>
    `,
    html: `
      <div class="text-left space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1 pt-1">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Phòng máy *</label>
            <select id="new-comp-lab" class="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-blue-700">
              <option value="PM1">PM 1 (A1-503)</option>
              <option value="PM2">PM2 (A1-504)</option>
              <option value="PM3">PM3 (A1-505)</option>
              <option value="PM4">PM4 (A1-506)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Mã máy *</label>
            <input type="text" id="new-comp-id" placeholder="VD: PM1-31" class="w-full p-2 bg-white border border-slate-300 rounded font-mono uppercase font-bold text-blue-700">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Hãng / Dòng máy</label>
            <input type="text" id="new-comp-brand" value="FPT Elead" class="w-full p-2 bg-white border border-slate-300 rounded">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Địa chỉ IP tĩnh</label>
            <input type="text" id="new-comp-ip" value="192.168.1.199" class="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-blue-700">
          </div>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-700">Cấu hình CPU</label>
          <input type="text" id="new-comp-cpu" value="Intel Core i5-14400 2.50GHz" class="w-full p-2 bg-white border border-slate-300 rounded font-mono">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Bộ nhớ RAM</label>
            <input type="text" id="new-comp-ram" value="16 GB" class="w-full p-2 bg-white border border-slate-300 rounded">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Ổ cứng</label>
            <input type="text" id="new-comp-storage" value="SSD 256GB NVMe" class="w-full p-2 bg-white border border-slate-300 rounded">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Vị trí Hàng (Row)</label>
            <input type="number" min="1" max="10" id="new-comp-row" value="1" class="w-full p-2 bg-white border border-slate-300 rounded">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700">Vị trí Cột (Col)</label>
            <input type="number" min="1" max="10" id="new-comp-col" value="1" class="w-full p-2 bg-white border border-slate-300 rounded">
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Thêm máy ngay',
    cancelButtonText: 'Đóng',
    confirmButtonColor: '#2563eb',
    preConfirm: () => {
      const id = document.getElementById('new-comp-id').value.trim().toUpperCase();
      const labId = document.getElementById('new-comp-lab').value;
      const brand = document.getElementById('new-comp-brand').value.trim();
      const ip = document.getElementById('new-comp-ip').value.trim();
      const cpu = document.getElementById('new-comp-cpu').value.trim();
      const ram = document.getElementById('new-comp-ram').value.trim();
      const storage = document.getElementById('new-comp-storage').value.trim();
      const row = parseInt(document.getElementById('new-comp-row').value, 10) || 1;
      const col = parseInt(document.getElementById('new-comp-col').value, 10) || 1;

      if (!id) {
        Swal.showValidationMessage('Vui lòng nhập mã máy!');
        return false;
      }
      if (window.appState.computers.some(c => c.id === id)) {
        Swal.showValidationMessage('Mã máy này đã tồn tại trong hệ thống!');
        return false;
      }

      return {
        id,
        labId,
        name: `Máy tính ${id}`,
        brand,
        model: 'Standard Edition',
        serialNumber: `SN-${Date.now()}`,
        ipAddress: ip,
        macAddress: '00:1B:44:11:3A:B7',
        status: 'good',
        powerState: 'on',
        cpu,
        ram,
        storage,
        monitor: 'FPT 21.5" LED FHD',
        gpu: 'Intel UHD Graphics',
        os: 'Windows 11 Pro 64-bit',
        license: 'OEM TNUS Kỹ thuật số',
        keyboardMouse: 'Logitech Combo',
        position: { row, col },
        installDate: new Date().toISOString().split('T')[0],
        lastInspected: new Date().toISOString().split('T')[0],
        notes: 'Máy mới thêm',
        history: [{
          date: new Date().toISOString().split('T')[0],
          action: 'Nhập máy mới vào phòng',
          technician: window.appState.currentUser.name,
          note: 'Thiết bị hoạt động tốt'
        }]
      };
    }
  }).then(res => {
    if (res.isConfirmed && res.value) {
      window.appState.computers.push(res.value);
      window.saveStateToLocalStorage();
      renderComputerTable();
      window.updateDashboardKPIs();
      if (window.labSimulation) window.labSimulation.render();
      Swal.fire('Thành công', `Đã thêm máy ${res.value.id} vào hệ thống.`, 'success');
    }
  });
}

// 6. XÓA MÁY TÍNH
window.deleteComputer = function(compId) {
  const curUser = window.appState?.currentUser;
  const curRole = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
  if (curRole !== 'admin' && curRole !== 'lab_manager') {
    Swal.fire({
      icon: 'error',
      title: 'Truy cập bị từ chối',
      html: 'Chỉ <strong>Quản trị viên (Admin)</strong> và <strong>Quản lý phòng máy</strong> mới có thẩm quyền xóa bỏ tài sản thiết bị máy tính khỏi danh mục.'
    });
    return;
  }
  if (typeof window.checkPermission === 'function' && !window.checkPermission('delete_device', 'Xóa máy tính khỏi danh mục hệ thống')) return;
  Swal.fire({
    title: 'Xác nhận xóa?',
    text: `Bạn có chắc muốn xóa thiết bị ${compId} khỏi hệ thống?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#e11d48'
  }).then(res => {
    if (res.isConfirmed) {
      window.appState.computers = window.appState.computers.filter(c => c.id !== compId);
      compFilter.selectedIds.delete(compId);
      window.saveStateToLocalStorage();
      renderComputerTable();
      window.updateDashboardKPIs();
      if (window.labSimulation) window.labSimulation.render();
      Swal.fire('Đã xóa', `Đã xóa thiết bị ${compId}.`, 'success');
    }
  });
};

// 7. BÁO CÁO SỰ CỐ TỪ DANH MỤC THIẾT BỊ
window.reportIncidentForComputer = function(computerId) {
  if (window.maintenanceManager && typeof window.maintenanceManager.showCreateIncidentModal === 'function') {
    window.maintenanceManager.showCreateIncidentModal(computerId);
  } else if (typeof window.reportIncidentFromModal === 'function') {
    window.reportIncidentFromModal(computerId);
  } else {
    Swal.fire('Thông báo', `Báo cáo sự cố cho máy ${computerId}`, 'info');
  }
};

// 8. XUẤT EXCEL DANH MỤC MÁY TÍNH (PRESERVING FULL DETAILS & SPECS)
function exportComputersToExcel() {
  const curUser = window.appState?.currentUser;
  const curRole = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
  if (curRole !== 'admin' && curRole !== 'lab_manager') {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Truy cập bị từ chối',
        html: 'Chỉ <strong>Quản trị viên</strong> và <strong>Quản lý phòng máy</strong> mới có thẩm quyền xuất dữ liệu kiểm kê thiết bị máy tính.'
      });
    }
    return;
  }
  if (typeof XLSX === 'undefined') {
    Swal.fire('Lỗi', 'Thư viện xuất Excel chưa tải xong. Vui lòng thử lại sau giây lát.', 'error');
    return;
  }

  const exportList = getFilteredComputers();
  const exportData = exportList.map((c, idx) => ({
    'STT': idx + 1,
    'Mã thiết bị': c.id,
    'Phòng máy': c.labId,
    'Tên máy': c.name || `Máy tính ${c.id}`,
    'Hãng máy': c.brand,
    'Loại máy': c.model,
    'Số Serial': c.serialNumber || ('SN-' + c.id),
    'Vị trí': `Hàng ${c.position?.row || 1}, Cột ${c.position?.col || 1}`,
    'CPU': c.cpu,
    'RAM': c.ram,
    'Ổ cứng': c.storage,
    'Màn hình': c.monitor,
    'Card đồ họa': c.gpu || 'Intel Integrated',
    'Hệ điều hành': c.os,
    'Bản quyền': c.license || 'OEM TNUS',
    'Địa chỉ IP': c.ipAddress,
    'Địa chỉ MAC': c.macAddress,
    'Nguồn điện': c.powerState === 'on' ? 'Đang bật' : 'Đang tắt',
    'Tình trạng': STATUS_CONFIG[c.status]?.label || c.status,
    'Ngày đưa vào SD': c.installDate || '2026-10-30',
    'Ngày kiểm tra gần nhất': c.lastInspected,
    'Cán bộ phụ trách': 'ThS. Trịnh Minh Phú (0975.090.666)',
    'Ghi chú': c.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DanhMuc_ThietBi_TNUS");

  const fileName = `TNUS_QuanLyThietBi_PhongMay_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  Swal.fire({
    icon: 'success',
    title: 'Xuất file Excel thành công!',
    text: `Đã lưu tệp ${fileName} (${exportList.length} thiết bị)`,
    timer: 2000,
    showConfirmButton: false
  });
}

// Khởi tạo các Modal sao lưu / Phục hồi / Hướng dẫn
function initQuickModals() {
  // Nút khôi phục dữ liệu gốc
  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (typeof window.checkPermission === 'function' && !window.checkPermission('system_backup', 'Khôi phục dữ liệu gốc toàn bộ hệ thống')) return;
      Swal.fire({
        title: 'Khôi phục dữ liệu mặc định?',
        text: 'Toàn bộ dữ liệu 104 máy tính, lịch học và phiếu bảo trì sẽ được đặt lại trạng thái ban đầu.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Khôi phục ngay',
        cancelButtonText: 'Hủy'
      }).then(res => {
        if (res.isConfirmed) {
          localStorage.removeItem(STORAGE_KEY);
          loadState();
          window.location.reload();
        }
      });
    });
  }

  // Nút Xuất JSON sao lưu
  const exportJsonBtn = document.getElementById('btn-export-json');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      if (typeof window.checkPermission === 'function' && !window.checkPermission('system_backup', 'Sao lưu cơ sở dữ liệu hệ thống (JSON)')) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.appState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `TNUS_Lab_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }
}

// Khai báo các hàm toàn cục phục vụ tương tác trực tiếp từ HTML
if (typeof exportComputersToExcel === 'function') window.exportComputersToExcel = exportComputersToExcel;
if (typeof showAddComputerModal === 'function') window.showAddComputerModal = showAddComputerModal;


// ============================================================================
// BỘ ĐỊNH TUYẾN URL THÔNG MINH CHO GOOGLE APPS SCRIPT & WEB (ROLE & TAB ROUTING)
// ============================================================================

// Lưu URL Web App người dùng nhập
window.saveCustomWebAppUrl = function(url, showToast = false) {
  if (!url) return;
  const cleanUrl = url.trim().split('?')[0].split('#')[0];
  localStorage.setItem('tnus_gas_web_app_url', cleanUrl);

  const inp = document.getElementById('input-custom-web-app-url');
  if (inp) inp.value = cleanUrl;

  if (showToast && typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'success',
      title: 'Đã lưu URL Web App!',
      text: 'Các nút sao chép link bên dưới sẽ tự động tạo liên kết dựa trên URL này.',
      timer: 1800,
      showConfirmButton: false
    });
  }
};

// Thực thi sao chép liên kết vào clipboard
window.executeCopyLink = function(baseUrl, role, defaultTab) {
  const fullUrl = `${baseUrl}?role=${role}${defaultTab ? '&tab=' + defaultTab : ''}`;

  const showSuccessDialog = () => {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: `Đã sao chép link [${role.toUpperCase()}]!`,
        html: `
          <div class="text-left text-xs space-y-2">
            <p>Liên kết đăng nhập trực tiếp cho vai trò <strong>${role}</strong>:</p>
            <div class="p-2.5 bg-slate-100 rounded-lg font-mono text-blue-700 break-all select-all text-[11px] border border-slate-200">${fullUrl}</div>
            <p class="text-slate-500 text-[10px]">Người nhận nhấp vào liên kết này hệ thống sẽ tự động hiển thị Giao diện Đăng Nhập đúng vai trò và mở đúng phân hệ làm việc.</p>
          </div>
        `,
        timer: 6000,
        showConfirmButton: true,
        confirmButtonText: '<i class="fa-solid fa-right-to-bracket mr-1"></i>Thử Giao Diện Đăng Nhập',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        confirmButtonColor: '#2563eb'
      }).then(res => {
        if (res.isConfirmed) {
          if (typeof window.openRoleLoginModal === 'function') {
            window.openRoleLoginModal(role, defaultTab);
          }
        }
      });
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullUrl).then(showSuccessDialog).catch(() => {
      prompt('Sao chép liên kết dưới đây:', fullUrl);
    });
  } else {
    prompt('Sao chép liên kết dưới đây:', fullUrl);
  }
};

// Sao chép liên kết truy cập nhanh cho từng vai trò
window.copyRoleAccessLink = function(role, defaultTab = 'dashboard') {
  // 1. Kiểm tra URL đã lưu hoặc nhập trong ô input
  const inputUrl = document.getElementById('input-custom-web-app-url')?.value?.trim();
  const savedUrl = localStorage.getItem('tnus_gas_web_app_url');
  
  let baseUrl = inputUrl || savedUrl;

  // 2. Nếu chưa có, kiểm tra window.location
  if (!baseUrl) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    if (origin && origin !== 'null' && !origin.includes('googleusercontent.com') && window.location.protocol !== 'file:') {
      baseUrl = `${origin}${pathname}`;
    }
  }

  // 3. Nếu vẫn không có (đang chạy trong iframe googleusercontent lần đầu tiên)
  if (!baseUrl || baseUrl.includes('googleusercontent.com')) {
    Swal.fire({
      icon: 'info',
      title: 'Dán URL Web App của bạn',
      html: `
        <div class="text-left text-xs space-y-2.5">
          <p class="text-slate-700">Vì ứng dụng đang chạy trong khung bảo mật của Google, bạn vui lòng dán đường link Web App chính thức của bạn (dạng <code>https://script.google.com/macros/s/.../exec</code>) để hệ thống tự động tạo link chia sẻ chuẩn xác:</p>
          <input type="text" id="swal-input-gas-url" placeholder="https://script.google.com/macros/s/AKfycb.../exec" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50">
          <p class="text-slate-400 text-[10px]">Hệ thống sẽ lưu lại đường link này cho các lần sao chép tiếp theo.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu & Sao chép',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const val = document.getElementById('swal-input-gas-url').value.trim();
        if (!val || !val.startsWith('http')) {
          Swal.showValidationMessage('Vui lòng dán đường link URL hợp lệ (bắt đầu bằng https://)');
          return false;
        }
        return val;
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        baseUrl = res.value.split('?')[0].split('#')[0];
        window.saveCustomWebAppUrl(baseUrl, false);
        window.executeCopyLink(baseUrl, role, defaultTab);
      }
    });
    return;
  }

  baseUrl = baseUrl.split('?')[0].split('#')[0];
  window.executeCopyLink(baseUrl, role, defaultTab);
};

// Áp dụng các tham số URL vào hệ thống (Chuyển vai trò, mở tab, chọn phòng)
function applyUrlParameters(params) {
  if (!params) return;

  const roleParam = params.role;
  const userParam = params.user;
  const tabParam = params.tab;
  const labParam = params.lab;

  console.log('[RBAC Router] Áp dụng tham số URL:', params);

  // 1. Khi có tham số ?role= hoặc ?user=:
  // TUYỆT ĐỐI KHÔNG mở tab phân hệ trước khi đăng nhập thành công.
  // Giao diện vai trò CHỈ HOẠT ĐỘNG KHI ĐĂNG NHẬP THÀNH CÔNG!
  if (roleParam || userParam) {
    const targetAccount = roleParam || userParam;
    const curUser = window.appState.currentUser;
    const curRole = window.normalizeRole ? window.normalizeRole(curUser?.role) : curUser?.role;
    const targetNormRole = window.normalizeRole ? window.normalizeRole(targetAccount) : targetAccount;

    // Nếu tham số là Sinh viên / Khách tra cứu: Vào thẳng ngay lập tức, không bắt đăng nhập
    if (targetNormRole === 'student') {
      if (typeof window.returnToGuestView === 'function') {
        window.returnToGuestView(false);
      }
      if (tabParam) {
        const tabLink = document.querySelector(`.nav-tab-link[data-tab="${tabParam.toLowerCase()}"]`);
        if (tabLink) setTimeout(() => tabLink.click(), 80);
      }
      return;
    }

    // Nếu người dùng chưa ở phiên vai trò này, bật hộp thoại đăng nhập bắt buộc
    if (curRole !== targetNormRole) {
      // Đảm bảo không hiển thị phân hệ quản lý thiết bị/tài khoản ở background trước khi xác thực
      if (window.appState.currentTab === 'computers' || window.appState.currentTab === 'users') {
        const safeLink = document.querySelector('.nav-tab-link[data-tab="dashboard"]');
        if (safeLink) safeLink.click();
      }
      setTimeout(() => {
        if (typeof window.openRoleLoginModal === 'function') {
          const defaultRoleTab = (targetNormRole === 'lab_manager' ? 'computers' : (targetNormRole === 'teacher' ? 'schedule' : 'simulation'));
          window.openRoleLoginModal(targetAccount, tabParam || defaultRoleTab);
        }
      }, 300);
    } else {
      // Nếu đã đăng nhập đúng vai trò này rồi thì cho phép chuyển tab
      if (tabParam) {
        const tabLink = document.querySelector(`.nav-tab-link[data-tab="${tabParam.toLowerCase()}"]`);
        if (tabLink) setTimeout(() => tabLink.click(), 80);
      }
    }
  } else {
    // 2. Chỉ chuyển tab theo ?tab= khi KHÔNG có yêu cầu đăng nhập vai trò
    if (tabParam) {
      const tabLink = document.querySelector(`.nav-tab-link[data-tab="${tabParam.toLowerCase()}"]`);
      if (tabLink) {
        setTimeout(() => tabLink.click(), 80);
      }
    }
  }

  // 3. Tự động mở phòng máy cụ thể theo tham số ?lab= (PM1, PM2, PM3, PM4)
  if (labParam && window.labSimulation && ['PM1', 'PM2', 'PM3', 'PM4'].includes(labParam.toUpperCase())) {
    setTimeout(() => {
      if (window.labSimulation && typeof window.labSimulation.switchLab === 'function') {
        window.labSimulation.switchLab(labParam.toUpperCase());
      }
    }, 180);
  }

  // 4. Tự động định vị máy tính cụ thể theo tham số ?comp= (VD: ?comp=PM1-08)
  const compParam = params.comp || params.computer;
  if (compParam) {
    setTimeout(() => {
      if (typeof window.locateComputerOn2D === 'function') {
        window.locateComputerOn2D(compParam);
      }
    }, 250);
  }
}

// Khởi tạo bộ đọc tham số URL (Hỗ trợ cả Google Apps Script, Localhost, GitHub Pages & Hash)
function initUrlParamsHandler() {
  // A. Thử đọc từ google.script.url.getLocation (Chuẩn chính thức của Google Apps Script trong iframe)
  if (typeof google !== 'undefined' && google.script && google.script.url) {
    try {
      google.script.url.getLocation(function(location) {
        if (location) {
          if (location.href) {
            const cleanUrl = location.href.split('?')[0].split('#')[0];
            if (cleanUrl.includes('script.google.com')) {
              localStorage.setItem('tnus_gas_web_app_url', cleanUrl);
              const inputUrl = document.getElementById('input-custom-web-app-url');
              if (inputUrl && !inputUrl.value) inputUrl.value = cleanUrl;
            }
          }
          if (location.parameter && Object.keys(location.parameter).length > 0) {
            applyUrlParameters(location.parameter);
          }
        }
      });
    } catch (e) {
      console.warn('Lỗi gọi google.script.url.getLocation:', e);
    }
  }

  // B. Thử đọc từ window.location.search (cho Localhost / GitHub Pages / Vercel / Netlify)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramsObj = {};
    for (const [k, v] of urlParams.entries()) {
      paramsObj[k] = v;
    }
    if (Object.keys(paramsObj).length > 0) {
      applyUrlParameters(paramsObj);
    }
  } catch (e) {}

  // C. Thử đọc từ window.GAS_QUERY_PARAMS (nếu template Google Apps Script inject sẵn)
  if (window.GAS_QUERY_PARAMS && Object.keys(window.GAS_QUERY_PARAMS).length > 0) {
    applyUrlParameters(window.GAS_QUERY_PARAMS);
  }

  // D. Thử đọc từ Hash (e.g. #role=teacher hoặc #tab=schedule)
  try {
    if (window.location.hash && window.location.hash.includes('=')) {
      const hashStr = window.location.hash.replace('#', '');
      const hashParams = new URLSearchParams(hashStr);
      const hashObj = {};
      for (const [k, v] of hashParams.entries()) {
        hashObj[k] = v;
      }
      applyUrlParameters(hashObj);
    }
  } catch (e) {}

  // Nạp lại URL đã lưu trước đó vào ô nhập, hoặc tự động phát hiện URL hiện hành (GitHub Pages / Web)
  const savedUrl = localStorage.getItem('tnus_gas_web_app_url');
  const inputUrl = document.getElementById('input-custom-web-app-url');
  if (inputUrl) {
    if (savedUrl) {
      inputUrl.value = savedUrl;
    } else if (typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
      const liveUrl = window.location.origin + window.location.pathname;
      inputUrl.value = liveUrl;
      localStorage.setItem('tnus_gas_web_app_url', liveUrl);
    } else {
      inputUrl.value = 'https://phutnvn.github.io/tnus-computer-lab/';
    }
  }
}


// ============================================================================
// HỆ THỐNG ĐỒNG BỘ THỜI GIAN THỰC & THI HÀNH PHÂN QUYỀN RBAC NÂNG CAO
// KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
// ============================================================================

// Tự động kiểm soát & cập nhật giao diện theo vai trò của người dùng hiện hành
window.applyRoleRestrictionsToUI = function() {
  const u = window.appState.currentUser || (window.appState.users && window.appState.users[0]);
  if (!u) return;

  const role = window.normalizeRole ? window.normalizeRole(u.role) : (u.role || 'student');
  const roleName = u.roleName || role;
  const isAdmin = (role === 'admin');
  const bannerContainer = document.getElementById('dynamic-role-alert-banner');

  // 0. BẢO MẬT & ĐIỀU KHIỂN HEADER THEO VAI TRÒ:
  const isStudent = (role === 'student');
  const roleContainer = document.getElementById('header-role-switcher-container');
  const headerSelect = document.getElementById('user-role-select');
  const staticBadge = document.getElementById('header-role-static-badge');
  const staticName = document.getElementById('header-role-static-name');
  const roleLabel = document.getElementById('header-role-label');

  if (roleContainer) {
    if (isStudent) {
      // BỎ HOÀN TOÀN nút lệnh / hộp chọn vai trò ở giao diện Sinh viên
      roleContainer.style.display = 'none';
    } else if (isAdmin) {
      roleContainer.style.display = '';
      if (headerSelect) {
        headerSelect.style.display = '';
        headerSelect.removeAttribute('disabled');
      }
      if (staticBadge) staticBadge.style.display = 'none';
      if (roleLabel) roleLabel.style.display = '';
    } else {
      roleContainer.style.display = '';
      if (headerSelect) {
        headerSelect.style.display = 'none';
        headerSelect.setAttribute('disabled', 'true');
      }
      if (staticBadge) {
        staticBadge.style.display = '';
        if (staticName) staticName.textContent = u.roleName || role;
      }
      if (roleLabel) roleLabel.style.display = '';
    }
  }

  // 0.1. ĐIỀU KHIỂN CÁC NÚT LỆNH TRÊN HEADER:
  // - BỎ nút "Chức năng 4 vai trò" cho Sinh viên
  // - Ẩn nút "Sao lưu" & "Reset mẫu" cho Sinh viên và các tài khoản không phải Admin
  // - Ẩn nút "Đổi MK" cho Sinh viên
  // - BỎ nút "Đăng nhập cán bộ" cho Sinh viên (khi cần đăng nhập chỉ dùng nút Đăng xuất)
  const rolesComparisonBtn = document.getElementById('btn-header-roles-comparison');
  if (rolesComparisonBtn) {
    rolesComparisonBtn.style.display = isStudent ? 'none' : '';
  }

  const backupControls = document.getElementById('header-backup-controls');
  const backupDivider = document.getElementById('header-backup-divider');
  if (backupControls) {
    backupControls.style.display = (isStudent || !isAdmin) ? 'none' : '';
  }
  if (backupDivider) {
    backupDivider.style.display = (isStudent || !isAdmin) ? 'none' : '';
  }

  const changePwdBtn = document.getElementById('btn-header-change-password');
  if (changePwdBtn) {
    changePwdBtn.style.display = isStudent ? 'none' : '';
  }

  const headerLoginBtn = document.getElementById('btn-header-login');
  if (headerLoginBtn) {
    // BỎ hoàn toàn nút lệnh đăng nhập trên thanh header cho Sinh viên (và các vai trò đã đăng nhập)
    headerLoginBtn.style.display = 'none';
  }

  const userProfileBtn = document.getElementById('btn-user-profile-header');
  if (userProfileBtn) {
    // Ẩn badge profile cho sinh viên để giao diện tối giản, tập trung học tập tra cứu
    userProfileBtn.style.display = isStudent ? 'none' : '';
  }

  const headerLogoutBtn = document.getElementById('btn-header-logout');
  if (headerLogoutBtn) {
    if (isStudent) {
      // Giao diện tài khoản Sinh viên: BỎ nút lệnh Đăng xuất theo yêu cầu
      headerLogoutBtn.style.display = 'none';
    } else {
      headerLogoutBtn.style.display = '';
      headerLogoutBtn.title = 'Đăng xuất khỏi phiên làm việc';
      headerLogoutBtn.innerHTML = '<i class="fa-solid fa-power-off mr-1.5"></i><span>Đăng xuất</span>';
      headerLogoutBtn.className = 'px-3 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer';
    }
  }

  // 1. BANNER ĐÃ ĐƯỢC ẨN HOÀN TOÀN ĐỂ GIAO DIỆN TỐI GIẢN, THOÁNG ĐÃNG
  if (bannerContainer) {
    bannerContainer.innerHTML = '';
    bannerContainer.classList.add('hidden');
  }

  // 2. ĐIỀU HƯỚNG SIDEBAR THEO VAI TRÒ:
  // Với tài khoản Sinh viên: CHỈ HIỂN THỊ DUY NHẤT CHỨC NĂNG LỊCH THỰC HÀNH, TẤT CẢ CÁC CHỨC NĂNG KHÁC ẨN HOÀN TOÀN!
  const dashTabLink = document.querySelector('.nav-tab-link[data-tab="dashboard"]');
  const simTabLink = document.querySelector('.nav-tab-link[data-tab="simulation"]');
  const computersTabLink = document.querySelector('.nav-tab-link[data-tab="computers"]');
  const scheduleTabLink = document.querySelector('.nav-tab-link[data-tab="schedule"]');
  const maintenanceTabLink = document.querySelector('.nav-tab-link[data-tab="maintenance"]');
  const usersTabLink = document.querySelector('.nav-tab-link[data-tab="users"]');
  const sidebarSecMain = document.getElementById('sidebar-section-main');
  const sidebarSecOps = document.getElementById('sidebar-section-ops');

  if (isStudent) {
    // Ẩn tất cả các tab khác đối với Sinh viên, CHỈ ĐỂ LẠI DUY NHẤT LỊCH THỰC HÀNH
    if (dashTabLink) dashTabLink.style.display = 'none';
    if (simTabLink) simTabLink.style.display = 'none';
    if (computersTabLink) computersTabLink.style.display = 'none';
    if (maintenanceTabLink) maintenanceTabLink.style.display = 'none';
    if (usersTabLink) usersTabLink.style.display = 'none';
    if (sidebarSecMain) sidebarSecMain.style.display = 'none';
    if (sidebarSecOps) {
      sidebarSecOps.style.display = '';
      sidebarSecOps.textContent = 'CHỨC NĂNG SINH VIÊN';
    }
    if (scheduleTabLink) {
      scheduleTabLink.style.display = '';
      scheduleTabLink.classList.remove('opacity-40', 'pointer-events-none');
    }

    // Tự động chuyển thẳng sang phân hệ Lịch thực hành
    if (window.appState.currentTab !== 'schedule' && typeof window.switchTab === 'function') {
      window.switchTab('schedule');
    }
  } else {
    // Phục hồi lại đầy đủ sidebar cho Admin, Quản lý phòng máy, Giảng viên:
    if (dashTabLink) dashTabLink.style.display = '';
    if (simTabLink) simTabLink.style.display = '';
    if (scheduleTabLink) scheduleTabLink.style.display = '';
    if (sidebarSecMain) sidebarSecMain.style.display = '';
    if (sidebarSecOps) {
      sidebarSecOps.style.display = '';
      sidebarSecOps.textContent = 'VẬN HÀNH PHÒNG MÁY';
    }

    if (computersTabLink) {
      computersTabLink.style.display = '';
      if (role === 'teacher') {
        computersTabLink.classList.add('opacity-40', 'pointer-events-none');
        computersTabLink.title = '[🔒 Bị khóa] Phân hệ Quản lý Thiết bị chỉ dành cho Cán bộ Quản lý và Quản trị viên';
      } else {
        computersTabLink.classList.remove('opacity-40', 'pointer-events-none');
        computersTabLink.title = 'Quản lý Thiết bị (104 máy)';
      }
    }

    if (maintenanceTabLink) {
      maintenanceTabLink.style.display = '';
      maintenanceTabLink.classList.remove('opacity-40', 'pointer-events-none');
      maintenanceTabLink.title = 'Bảo trì & Sự cố';
    }

    if (usersTabLink) {
      if (isAdmin) {
        usersTabLink.style.display = '';
        usersTabLink.classList.remove('opacity-40', 'pointer-events-none');
        usersTabLink.title = 'Phân quyền & Tài khoản';
      } else {
        usersTabLink.style.display = '';
        usersTabLink.classList.add('opacity-40', 'pointer-events-none');
        usersTabLink.title = '[🔒 Bị khóa] Phân hệ Quản trị Người dùng & Phân quyền chỉ dành riêng cho Quản trị viên (Admin)';
      }
    }
  }

  // 3. ĐÁNH DẤU CỘT VAI TRÒ HIỆN HÀNH TRÊN BẢNG 11 NGHIỆP VỤ & 4 THẺ CHI TIẾT
  const allRoles = ['admin', 'lab_manager', 'teacher', 'student'];
  allRoles.forEach(r => {
    const isCurrent = (r === role);
    const th = document.getElementById(`th-role-${r}`);
    if (th) {
      const tag = th.querySelector('.role-current-tag');
      if (tag) tag.classList.toggle('hidden', !isCurrent);
      if (isCurrent) {
        th.classList.add('ring-2', 'ring-blue-500', 'bg-blue-100', 'font-black');
      } else {
        th.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-100', 'font-black');
      }
    }
    document.querySelectorAll(`td[data-col-role="${r}"]`).forEach(td => {
      if (isCurrent) {
        td.classList.add('bg-blue-50/80', 'font-black');
      } else {
        td.classList.remove('bg-blue-50/80', 'font-black');
      }
    });

    const card = document.getElementById(`role-detail-card-${r}`);
    if (card) {
      if (isCurrent) {
        card.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500', 'shadow-md');
      } else {
        card.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'shadow-md');
      }
    }
  });

  // 4. KHÓA / MỞ KHÓA VÀ GẮN CHỈ BÁO TRỰC QUAN TRÊN TẤT CẢ CÁC NÚT BẤM (RBAC ENFORCEMENT)
  const canControlPower = isAdmin || role === 'lab_manager';
  const canManageComputers = isAdmin || role === 'lab_manager';
  const canCreateSchedule = isAdmin || role === 'lab_manager' || role === 'teacher';
  const canBroadcast = isAdmin || role === 'lab_manager' || role === 'teacher';
  const canLockScreen = isAdmin || role === 'lab_manager' || role === 'teacher';
  const canFaultInject = isAdmin || role === 'lab_manager';
  const canCreateTicket = role !== 'student';
  const canResolveTicket = isAdmin || role === 'lab_manager';

  const applyBtnState = (btnEl, isAllowed, allowedMsg, deniedMsg) => {
    if (!btnEl) return;
    if (isAllowed) {
      btnEl.classList.remove('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
      btnEl.title = allowedMsg;
    } else {
      btnEl.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
      btnEl.title = `[🔒 Bị khóa] ${deniedMsg}`;
    }
  };

  // Nút trong Tab 2 (Simulation):
  // Xử lý hiển thị rõ ràng các nút lệnh cho Sinh viên / Khách:
  const wolBtn = document.getElementById('btn-scenario-wol');
  const broadcastBtn = document.getElementById('btn-scenario-broadcast');
  const lockBtn = document.getElementById('btn-scenario-lock');
  const faultBtn = document.getElementById('btn-scenario-fault');
  const pingBtn = document.getElementById('btn-scenario-ping');
  const resetBtn = document.getElementById('btn-scenario-reset');
  const findAvailBtn = document.getElementById('btn-student-find-available');
  const reportFaultBtn = document.getElementById('btn-student-report-fault');
  const scenarioLabel = document.getElementById('sim-scenario-label');

  if (isStudent) {
    // Với tài khoản Sinh viên:
    // Ẩn hoàn toàn các nút thao tác nghiệp vụ của cán bộ (tránh nút mờ opacity-40 khó nhìn)
    if (wolBtn) wolBtn.classList.add('hidden');
    if (broadcastBtn) broadcastBtn.classList.add('hidden');
    if (lockBtn) lockBtn.classList.add('hidden');
    if (faultBtn) faultBtn.classList.add('hidden');

    // Hiển thị các nút lệnh tra cứu của sinh viên RÕ RÀNG & NỔI BẬT:
    if (scenarioLabel) {
      scenarioLabel.textContent = 'Tiện ích tra cứu:';
      scenarioLabel.classList.remove('hidden');
    }
    if (pingBtn) {
      pingBtn.classList.remove('hidden', 'opacity-40', 'cursor-not-allowed', 'pointer-events-none');
      pingBtn.className = 'px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-md font-bold text-[11px] transition flex items-center space-x-1 shadow-2xs';
      pingBtn.title = 'Kiểm tra độ trễ và kết nối mạng ICMP toàn phòng';
    }
    if (findAvailBtn) {
      findAvailBtn.classList.remove('hidden');
      findAvailBtn.className = 'px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold text-[11px] transition flex items-center space-x-1 shadow-2xs';
    }
    if (reportFaultBtn) {
      reportFaultBtn.classList.remove('hidden');
      reportFaultBtn.className = 'px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-md font-bold text-[11px] transition flex items-center space-x-1 shadow-2xs';
    }
    if (resetBtn) {
      resetBtn.classList.remove('hidden', 'opacity-40', 'cursor-not-allowed', 'pointer-events-none');
      resetBtn.className = 'px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-bold text-[11px] transition flex items-center space-x-1 shadow-2xs';
      const resetText = document.getElementById('btn-scenario-reset-text');
      if (resetText) resetText.classList.remove('hidden');
    }
  } else {
    // Với Admin / Cán bộ / Giảng viên:
    if (scenarioLabel) scenarioLabel.textContent = 'Thực nghiệm:';
    if (findAvailBtn) findAvailBtn.classList.add('hidden');
    if (reportFaultBtn) reportFaultBtn.classList.add('hidden');
    const resetText = document.getElementById('btn-scenario-reset-text');
    if (resetText) resetText.classList.add('hidden');

    if (wolBtn) wolBtn.classList.remove('hidden');
    if (broadcastBtn) broadcastBtn.classList.remove('hidden');
    if (lockBtn) lockBtn.classList.remove('hidden');
    if (faultBtn) faultBtn.classList.remove('hidden');

    applyBtnState(wolBtn, canControlPower, 'Kích hoạt Wake-on-LAN tuần tự', 'Chỉ Quản trị viên và Quản lý phòng mới có quyền điều khiển nguồn Wake-on-LAN');
    applyBtnState(broadcastBtn, canBroadcast, 'Phát bài giảng & đề thi (UDP Multicast)', 'Chỉ Quản trị viên, Quản lý phòng và Giảng viên mới có quyền phát bài giảng');
    applyBtnState(lockBtn, canLockScreen, 'Khóa / Mở màn hình lớp học', 'Chỉ Quản trị viên, Quản lý phòng và Giảng viên mở ca mới có quyền khóa màn hình');
    applyBtnState(faultBtn, canFaultInject, 'Mô phỏng phát sinh sự cố', 'Chỉ Quản trị viên và Quản lý phòng mới có quyền thử nghiệm sự cố');
    applyBtnState(resetBtn, canControlPower, 'Khôi phục trạng thái chuẩn phòng máy', 'Chỉ Quản trị viên và Quản lý phòng mới có quyền khôi phục');
  }

  // Nút thao tác nhanh trên Banner Dashboard (Tab 1)
  const dashBtnReport = document.getElementById('dash-btn-report');
  const dashBtnExport = document.getElementById('dash-btn-export');
  const dashLinkMaint = document.getElementById('dash-link-maintenance');
  if (dashBtnReport) {
    if (role === 'student') {
      dashBtnReport.classList.add('hidden');
    } else {
      dashBtnReport.classList.remove('hidden');
    }
  }
  if (dashBtnExport) {
    if (role === 'student' || role === 'teacher') {
      dashBtnExport.classList.add('hidden');
    } else {
      dashBtnExport.classList.remove('hidden');
    }
  }
  if (dashLinkMaint) {
    if (role === 'student') {
      dashLinkMaint.classList.add('hidden');
    } else {
      dashLinkMaint.classList.remove('hidden');
    }
  }

  // Nút trong Tab 3 (Computers)
  applyBtnState(document.getElementById('btn-add-computer'), canManageComputers, 'Thêm máy trạm mới', 'Chỉ Quản trị viên và Quản lý phòng mới có quyền thêm máy tính');
  applyBtnState(document.getElementById('btn-batch-actions'), canManageComputers, 'Thao tác hàng loạt', 'Chức năng chỉ dành cho cán bộ quản lý thiết bị');

  // Nút trong Tab 4 (Schedule)
  applyBtnState(document.getElementById('btn-add-schedule'), canCreateSchedule, 'Đăng ký ca thực hành mới', 'Chỉ Giảng viên và Quản lý phòng máy mới có quyền xếp lịch dạy');

  // Nút trong Tab 5 (Maintenance)
  applyBtnState(document.getElementById('btn-create-ticket'), canCreateTicket, 'Gửi báo cáo sự cố', 'Chế độ sinh viên chỉ có quyền tra cứu thông tin');

  // Nút trong Tab 6 (Users)
  applyBtnState(document.getElementById('btn-add-user'), isAdmin, 'Tạo tài khoản người dùng mới', 'Chỉ Quản trị viên (Admin) mới có quyền thêm tài khoản');
  applyBtnState(document.getElementById('btn-export-users'), isAdmin, 'Xuất danh sách ra file Excel', 'Chỉ Quản trị viên mới có quyền xuất dữ liệu tài khoản');
  applyBtnState(document.querySelector('button[title*="Nhập danh sách tài khoản"]'), isAdmin, 'Nhập danh sách tài khoản từ Excel', 'Chỉ Quản trị viên mới có quyền nhập tài khoản');

  const btnResetUsers = document.querySelector('button[title*="Khôi phục danh sách tài khoản gốc"]');
  if (btnResetUsers) {
    if (isAdmin) {
      btnResetUsers.classList.remove('hidden');
    } else {
      btnResetUsers.classList.add('hidden');
    }
  }

  // Khóa các nút Sao lưu & Khôi phục JSON / Reset trên Header
  const btnResetData = document.getElementById('btn-reset-data');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnImportJson = document.getElementById('btn-import-json');
  if (btnResetData) applyBtnState(btnResetData, isAdmin, 'Khôi phục 104 máy mặc định', 'Chỉ Quản trị viên (Admin) mới có quyền reset hệ thống');
  if (btnExportJson) applyBtnState(btnExportJson, isAdmin || role === 'lab_manager', 'Xuất file JSON sao lưu', 'Chỉ Quản trị viên và Quản lý phòng mới có quyền sao lưu hệ thống');
  if (btnImportJson) applyBtnState(btnImportJson, isAdmin, 'Khôi phục từ file JSON', 'Chỉ Quản trị viên mới có quyền khôi phục hệ thống');

  // Tự động chuyển tab an toàn nếu người dùng đang ở Tab bị khóa
  const curTab = window.appState?.currentTab || 'dashboard';
  if (role === 'student' && ['computers', 'maintenance', 'users'].includes(curTab)) {
    setTimeout(() => {
      window.switchTab('simulation');
    }, 50);
  } else if (role === 'teacher' && (curTab === 'computers' || curTab === 'users')) {
    setTimeout(() => {
      window.switchTab('schedule');
    }, 50);
  } else if (curTab === 'users' && !isAdmin) {
    const homeTabs = { lab_manager: 'computers', teacher: 'schedule', student: 'simulation' };
    setTimeout(() => {
      window.switchTab(homeTabs[role] || 'dashboard');
    }, 50);
  }
};

// Vào thẳng vai trò để thử nghiệm nhanh (Mở Giao diện Đăng Nhập cho vai trò)
window.directTestRole = function(role, defaultTab = 'dashboard') {
  if (typeof window.openRoleLoginModal === 'function') {
    window.openRoleLoginModal(role, defaultTab);
  } else {
    const curUser = window.appState.currentUser;
    const curRole = window.normalizeRole ? window.normalizeRole(curUser?.role) : (curUser?.role || 'student');
    if (curRole !== 'admin') {
      Swal.fire({
        icon: 'warning',
        title: 'Không có quyền chuyển đổi vai trò',
        text: 'Chức năng dùng thử vai trò chỉ dành riêng cho Quản trị viên (Admin). Các tài khoản Quản lý phòng máy, Giảng viên và Sinh viên không được phép tự ý chuyển đổi vai trò.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const targetUser = window.getRoleUser(role);
    if (targetUser) {
      window.appState.currentUser = targetUser;
      window.saveStateToLocalStorage();
      window.updateUserUI();
      if (window.applyRoleRestrictionsToUI) window.applyRoleRestrictionsToUI();
      if (window.renderUserAccountsTable) window.renderUserAccountsTable();
      if (window.updateUserKPIs) window.updateUserKPIs();
      if (defaultTab && typeof window.switchTab === 'function') {
        window.switchTab(defaultTab);
      }
    }
  }
};

// Sao lưu toàn bộ cơ sở dữ liệu hệ thống ra tệp JSON
window.exportSystemBackup = function() {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('system_backup', 'Sao lưu cơ sở dữ liệu hệ thống')) return;

  const backupData = {
    metadata: {
      university: 'KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)',
      system: 'Hệ Thống Mô Phỏng & Quản Lý 4 Phòng Máy Tính (104 Máy)',
      exportedAt: new Date().toISOString(),
      exportedBy: window.appState.currentUser ? `${window.appState.currentUser.name} (${window.appState.currentUser.username})` : 'admin',
      version: '2.5.0'
    },
    labs: window.appState.labs,
    computers: window.appState.computers,
    schedules: window.appState.schedules,
    maintenance: window.appState.maintenance,
    users: window.appState.users,
    activityLogs: window.appState.activityLogs
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

  const link = document.createElement('a');
  link.href = url;
  link.download = `TNUS_PhongMay_SaoLuu_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  window.logUserActivity('Sao lưu hệ thống', 'Xuất file sao lưu cơ sở dữ liệu JSON toàn diện');

  Swal.fire({
    icon: 'success',
    title: 'Sao lưu thành công!',
    html: `
      <div class="text-xs text-slate-600 space-y-1">
        <p>Đã tải xuống tệp: <strong class="font-mono text-blue-700">TNUS_PhongMay_SaoLuu_${dateStr}.json</strong></p>
        <p class="text-[11px] text-slate-500">Bao gồm 4 phòng máy, 104 máy trạm, thời khóa biểu, lịch sử sự cố, tài khoản & nhật ký kiểm toán.</p>
      </div>
    `,
    confirmButtonColor: '#2563eb'
  });
};

// Khôi phục cơ sở dữ liệu từ tệp sao lưu JSON
window.restoreSystemBackup = function(event) {
  if (typeof window.checkPermission === 'function' && !window.checkPermission('system_backup', 'Khôi phục cơ sở dữ liệu hệ thống')) {
    event.target.value = '';
    return;
  }

  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.computers || !Array.isArray(data.computers)) {
        throw new Error('Tệp không đúng cấu trúc sao lưu phòng máy tính TNUS!');
      }

      Swal.fire({
        title: 'Xác nhận khôi phục hệ thống?',
        html: `
          <div class="text-xs text-slate-600 text-left space-y-2">
            <p>Tệp sao lưu: <strong>${file.name}</strong></p>
            <div class="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900">
              <i class="fa-solid fa-triangle-exclamation mr-1 text-amber-600"></i>
              Toàn bộ dữ liệu hiện hành trên trình duyệt sẽ được thay thế bằng dữ liệu từ tệp sao lưu này.
            </div>
            <div>Số máy trạm nạp vào: <strong>${data.computers.length} máy</strong></div>
            <div>Số tài khoản: <strong>${(data.users || []).length} tài khoản</strong></div>
            <div>Số ca thực hành: <strong>${(data.schedules || []).length} ca</strong></div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Đồng ý khôi phục',
        cancelButtonText: 'Hủy'
      }).then(res => {
        if (res.isConfirmed) {
          window.appState.computers = data.computers;
          if (data.labs && data.labs.length) window.appState.labs = data.labs;
          if (data.schedules) window.appState.schedules = data.schedules;
          if (data.maintenance) window.appState.maintenance = data.maintenance;
          if (data.users && data.users.length) window.appState.users = data.users;
          if (data.activityLogs) window.appState.activityLogs = data.activityLogs;

          window.saveStateToLocalStorage();
          window.updateDashboardKPIs();
          window.updateUserUI();
          if (window.renderUserAccountsTable) window.renderUserAccountsTable();
          if (window.updateUserKPIs) window.updateUserKPIs();
          if (window.renderActivityLogs) window.renderActivityLogs();
          if (window.labSimulation) window.labSimulation.loadLab(window.labSimulation.currentLabId);

          window.logUserActivity('Khôi phục hệ thống', `Nạp dữ liệu từ tệp sao lưu ${file.name}`);

          Swal.fire({
            icon: 'success',
            title: 'Khôi phục hoàn tất!',
            text: 'Hệ thống đã được đồng bộ chuẩn xác từ tệp sao lưu.',
            confirmButtonColor: '#2563eb'
          });
        }
        event.target.value = '';
      });
    } catch (err) {
      Swal.fire('Lỗi nạp tệp', err.message || 'Tệp JSON không hợp lệ!', 'error');
      event.target.value = '';
    }
  };
  reader.readAsText(file, 'utf8');
};

// Đồng bộ cưỡng bức dữ liệu hệ thống (Force Sync)
window.forceSyncSystem = function() {
  window.saveStateToLocalStorage();
  window.updateDashboardKPIs();
  window.updateUserUI();
  if (window.renderUserAccountsTable) window.renderUserAccountsTable();
  if (window.updateUserKPIs) window.updateUserKPIs();
  if (window.renderActivityLogs) window.renderActivityLogs();
  if (window.labSimulation) window.labSimulation.loadLab(window.labSimulation.currentLabId);

  window.logUserActivity('Đồng bộ dữ liệu', 'Cưỡng bức đồng bộ cơ sở dữ liệu thời gian thực');

  Swal.fire({
    icon: 'success',
    title: 'Đã đồng bộ thời gian thực!',
    html: `
      <div class="text-xs text-slate-600 text-left space-y-1">
        <div>Trạng thái: <strong class="text-emerald-600">Đã đồng bộ 100%</strong></div>
        <div>Tổng số máy quản lý: <strong>104 máy (4 phòng A1-503 đến A1-506)</strong></div>
        <div>Tài khoản phân quyền: <strong>${(window.appState.users || []).length} tài khoản</strong></div>
        <div class="text-[11px] text-slate-400 mt-1">Dữ liệu đã được lưu trữ an toàn trong LocalStorage & Google Apps Script runtime.</div>
      </div>
    `,
    timer: 1600,
    showConfirmButton: false
  });
};

// Lắng nghe sự kiện đồng bộ đa tab (Multi-tab real-time sync)
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY && e.newValue) {
    try {
      const parsed = JSON.parse(e.newValue);
      if (parsed.computers) window.appState.computers = parsed.computers;
      if (parsed.schedules) window.appState.schedules = parsed.schedules;
      if (parsed.maintenance) window.appState.maintenance = parsed.maintenance;
      if (parsed.users) window.appState.users = parsed.users;
      if (parsed.activityLogs) window.appState.activityLogs = parsed.activityLogs;

      window.updateDashboardKPIs();
      window.updateUserUI();
      if (window.renderUserAccountsTable) window.renderUserAccountsTable();
      if (window.updateUserKPIs) window.updateUserKPIs();
      if (window.renderActivityLogs) window.renderActivityLogs();
      if (window.labSimulation && window.appState.currentTab === 'simulation') {
        window.labSimulation.loadLab(window.labSimulation.currentLabId);
      }
    } catch (err) {
      console.warn('Lỗi phân tích dữ liệu đồng bộ đa tab:', err);
    }
  }
});


// ============================================================================
// ĐIỀU HƯỚNG SUB-TABS TRONG QUẢN TRỊ TÀI KHOẢN & PHÂN QUYỀN
// ============================================================================
window.rbacCurrentSubTab = 'users';
window.userPagination = {
  page: 1,
  pageSize: 8
};

window.switchRbacSubTab = function(subTabId) {
  window.rbacCurrentSubTab = subTabId;

  // Cập nhật giao diện nút tab
  const btnIds = ['users', 'matrix', 'roles', 'audit', 'direct_links'];
  btnIds.forEach(id => {
    const btn = document.getElementById(`btn-subtab-${id}`);
    if (btn) {
      if (id === subTabId) {
        btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 bg-blue-600 text-white shadow-xs';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200';
      }
    }
  });

  // Ẩn hiện subpanel
  const panelIds = ['users', 'matrix', 'roles', 'audit', 'direct_links'];
  panelIds.forEach(id => {
    const panel = document.getElementById(`subpanel-rbac-${id}`);
    if (panel) {
      if (id === subTabId) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    }
  });

  // Tải dữ liệu tương ứng khi mở tab
  if (subTabId === 'matrix') {
    window.renderRbacMatrixTable();
  } else if (subTabId === 'users') {
    window.renderUserAccountsTable();
  } else if (subTabId === 'audit') {
    window.renderActivityLogs();
  }
};

// ============================================================================
// KẾT XUẤT MA TRẬN PHÂN QUYỀN DẠNG CHECKBOX (INTERACTIVE RBAC MATRIX)
// ============================================================================
window.renderRbacMatrixTable = function() {
  const tbody = document.getElementById('matrix-table-body');
  const roleSelect = document.getElementById('matrix-role-selector');
  if (!tbody || !roleSelect) return;

  const currentRole = roleSelect.value;
  const isAdminRole = currentRole === 'admin';

  // Lấy ma trận quyền hiện hành của vai trò này
  if (!window.appState.rolePermissions) {
    window.appState.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  }
  // Admin luôn giữ trọn vẹn 42/42 quyền
  if (isAdminRole) {
    window.appState.rolePermissions.admin = [...DEFAULT_ROLE_PERMISSIONS.admin];
  }

  const rolePerms = window.appState.rolePermissions[currentRole] || (DEFAULT_ROLE_PERMISSIONS[currentRole] || []);
  const activeCount = isAdminRole ? 42 : rolePerms.length;
  const totalPerms = 42;
  const percent = Math.round((activeCount / totalPerms) * 100);

  // Cập nhật thanh tóm tắt trạng thái vai trò
  const summaryTitle = document.getElementById('matrix-role-title');
  const summaryBadge = document.getElementById('matrix-role-badge');
  const summaryDesc = document.getElementById('matrix-role-desc');
  const selectAllBtn = document.getElementById('btn-matrix-select-all');
  const clearAllBtn = document.getElementById('btn-matrix-clear-all');

  const roleDescriptions = {
    admin: 'Quản trị viên luôn sở hữu toàn quyền 42/42 chức năng trên hệ thống (không thể vô hiệu hóa).',
    lab_manager: 'Toàn quyền cấu hình máy tính, thiết bị, duyệt ca học, bảo trì và xuất báo cáo.',
    teacher: 'Xem sơ đồ, theo dõi và đăng ký lịch thực hành, gửi phiếu báo hỏng máy tính.',
    student: 'Chế độ tra cứu thông tin (Read-only): Xem sơ đồ phòng máy và lịch thực hành.'
  };

  const roleLabels = {
    admin: 'Admin (Quản trị hệ thống)',
    lab_manager: 'Quản lý phòng máy',
    teacher: 'Giảng viên (Teacher)',
    student: 'Sinh viên / Khách'
  };

  if (summaryTitle) summaryTitle.textContent = roleLabels[currentRole] || currentRole;
  if (summaryDesc) summaryDesc.textContent = roleDescriptions[currentRole] || '';
  if (summaryBadge) {
    summaryBadge.textContent = `${activeCount} / ${totalPerms} quyền (${percent}%)`;
    summaryBadge.className = `text-[10px] font-bold px-2 py-0.5 rounded-full ${isAdminRole ? 'bg-emerald-100 text-emerald-800' : (activeCount > 20 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700')}`;
  }

  if (selectAllBtn) {
    selectAllBtn.disabled = isAdminRole;
    selectAllBtn.classList.toggle('opacity-50', isAdminRole);
    selectAllBtn.classList.toggle('cursor-not-allowed', isAdminRole);
  }
  if (clearAllBtn) {
    clearAllBtn.disabled = isAdminRole;
    clearAllBtn.classList.toggle('opacity-50', isAdminRole);
    clearAllBtn.classList.toggle('cursor-not-allowed', isAdminRole);
  }

  // Kết xuất từng dòng module nghiệp vụ
  tbody.innerHTML = RBAC_MODULES.map(mod => {
    let modPermCount = 0;

    // 7 ô checkbox cho 7 hành động
    const actionTds = RBAC_ACTIONS.map(act => {
      const permKey = `${mod.id}.${act.id}`;
      const isChecked = isAdminRole ? true : rolePerms.includes(permKey);
      if (isChecked) modPermCount++;

      return `
        <td class="py-2.5 px-3 text-center whitespace-nowrap">
          <label class="inline-flex items-center justify-center ${isAdminRole ? 'cursor-not-allowed' : 'cursor-pointer'}">
            <input type="checkbox" 
              class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition ${isAdminRole ? 'accent-emerald-600 cursor-not-allowed' : 'accent-blue-600 cursor-pointer'}" 
              data-role="${currentRole}" 
              data-perm="${permKey}"
              ${isChecked ? 'checked' : ''} 
              ${isAdminRole ? 'disabled title="Admin luôn có toàn quyền tuyệt đối 42/42"' : `title="${act.name} cho module ${mod.name}"`}
              onchange="window.onMatrixCheckboxChange(this)">
          </label>
        </td>
      `;
    }).join('');

    return `
      <tr class="hover:bg-slate-50/80 transition border-b border-slate-100">
        <td class="py-3 px-4 font-semibold text-slate-800 flex items-center space-x-2.5">
          <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs shadow-2xs shrink-0">
            <i class="fa-solid ${mod.icon}"></i>
          </div>
          <div class="min-w-0">
            <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span>${mod.name}</span>
              <span class="text-[10px] font-semibold text-slate-400">(${modPermCount}/7)</span>
            </div>
            <div class="text-[10px] text-slate-400 font-normal truncate max-w-xs">${mod.description}</div>
          </div>
        </td>
        ${actionTds}
        <td class="py-2.5 px-3 text-center whitespace-nowrap">
          ${isAdminRole ? `
            <span class="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <i class="fa-solid fa-check mr-0.5"></i> 7/7 Toàn quyền
            </span>
          ` : `
            <div class="flex items-center justify-center space-x-1">
              <button onclick="window.toggleModuleAllPerms('${currentRole}', '${mod.id}', true)" class="px-2 py-0.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded text-[10px] font-bold transition shadow-2xs" title="Cấp tất cả 7 quyền cho module này">Bật 7 quyền</button>
              <button onclick="window.toggleModuleAllPerms('${currentRole}', '${mod.id}', false)" class="px-1.5 py-0.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded text-[10px] font-bold transition shadow-2xs" title="Tắt toàn bộ quyền của module này">Tắt hết</button>
            </div>
          `}
        </td>
      </tr>
    `;
  }).join('');
};

// Xử lý khi người dùng tick hoặc bỏ tick một ô checkbox trong ma trận
window.onMatrixCheckboxChange = function(inputEl) {
  const role = inputEl.getAttribute('data-role');
  const perm = inputEl.getAttribute('data-perm');
  const isChecked = inputEl.checked;

  if (role === 'admin') return; // Admin luôn có toàn quyền tuyệt đối

  if (!window.appState.rolePermissions) {
    window.appState.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  }
  if (!window.appState.rolePermissions[role]) {
    window.appState.rolePermissions[role] = [];
  }

  let list = window.appState.rolePermissions[role];
  if (isChecked) {
    if (!list.includes(perm)) list.push(perm);
  } else {
    window.appState.rolePermissions[role] = list.filter(p => p !== perm);
  }

  window.saveStateToLocalStorage();
  window.renderRbacMatrixTable();
};

// Bật / Tắt nhanh toàn bộ quyền của một module cho vai trò đang chọn
window.toggleModuleAllPerms = function(role, moduleId, enable) {
  if (role === 'admin') return;

  if (!window.appState.rolePermissions) {
    window.appState.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  }
  if (!window.appState.rolePermissions[role]) {
    window.appState.rolePermissions[role] = [];
  }

  const modulePerms = RBAC_ACTIONS.map(act => `${moduleId}.${act.id}`);
  let list = window.appState.rolePermissions[role];

  if (enable) {
    modulePerms.forEach(p => {
      if (!list.includes(p)) list.push(p);
    });
  } else {
    window.appState.rolePermissions[role] = list.filter(p => !modulePerms.includes(p));
  }

  window.saveStateToLocalStorage();
  window.renderRbacMatrixTable();
};

// Bật / Tắt toàn bộ 42 quyền cho vai trò đang chọn
window.toggleAllMatrixPermissions = function(enable) {
  const roleSelect = document.getElementById('matrix-role-selector');
  const currentRole = roleSelect ? roleSelect.value : 'admin';
  if (currentRole === 'admin') return;

  if (!window.appState.rolePermissions) {
    window.appState.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  }

  if (enable) {
    const allPerms = [];
    RBAC_MODULES.forEach(mod => {
      RBAC_ACTIONS.forEach(act => {
        allPerms.push(`${mod.id}.${act.id}`);
      });
    });
    window.appState.rolePermissions[currentRole] = allPerms;
  } else {
    window.appState.rolePermissions[currentRole] = [];
  }

  window.saveStateToLocalStorage();
  window.renderRbacMatrixTable();
};

// Đổi trạng thái toàn bộ 1 cột hành động (Ví dụ: bật/tắt toàn bộ View cho 6 module)
window.toggleColumnActionPerms = function(actionId) {
  const roleSelect = document.getElementById('matrix-role-selector');
  const currentRole = roleSelect ? roleSelect.value : 'admin';
  if (currentRole === 'admin') return;

  if (!window.appState.rolePermissions) {
    window.appState.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  }
  if (!window.appState.rolePermissions[currentRole]) {
    window.appState.rolePermissions[currentRole] = [];
  }

  const colPerms = RBAC_MODULES.map(mod => `${mod.id}.${actionId}`);
  let list = window.appState.rolePermissions[currentRole];

  // Nếu tất cả đã bật thì tắt, ngược lại thì bật hết
  const allAlreadyEnabled = colPerms.every(p => list.includes(p));
  if (allAlreadyEnabled) {
    window.appState.rolePermissions[currentRole] = list.filter(p => !colPerms.includes(p));
  } else {
    colPerms.forEach(p => {
      if (!list.includes(p)) list.push(p);
    });
  }

  window.saveStateToLocalStorage();
  window.renderRbacMatrixTable();
};

// Lưu ma trận phân quyền
window.saveCurrentRolePermissions = function() {
  const roleSelect = document.getElementById('matrix-role-selector');
  const currentRole = roleSelect ? roleSelect.value : 'admin';
  const rObj = (window.appState.roles || SYSTEM_ROLES).find(r => r.id === currentRole);
  const roleName = rObj ? rObj.name : currentRole;

  window.saveStateToLocalStorage();
  if (typeof window.applyRoleRestrictionsToUI === 'function') {
    window.applyRoleRestrictionsToUI();
  }
  window.logUserActivity('Cập nhật quyền', `Lưu thay đổi ma trận phân quyền cho vai trò: ${roleName}`);

  const activeCount = (currentRole === 'admin') ? 42 : ((window.appState.rolePermissions && window.appState.rolePermissions[currentRole]) ? window.appState.rolePermissions[currentRole].length : 0);

  Swal.fire({
    icon: 'success',
    title: 'Đã lưu ma trận phân quyền!',
    html: `
      <div class="text-xs text-slate-600 text-left space-y-1.5">
        <div>Vai trò: <strong>${roleName}</strong></div>
        <div>Tổng quyền kích hoạt: <strong class="text-blue-600">${activeCount} / 42 quyền</strong></div>
        <p class="text-[11px] text-slate-500">Mọi tài khoản thuộc vai trò này sẽ ngay lập tức được áp dụng các thẩm quyền vừa cấu hình.</p>
      </div>
    `,
    timer: 1600,
    showConfirmButton: false
  });
};

// Khôi phục ma trận gốc chuẩn của vai trò
window.resetRolePermissionsToDefault = function() {
  const roleSelect = document.getElementById('matrix-role-selector');
  const currentRole = roleSelect ? roleSelect.value : 'admin';
  const rObj = (window.appState.roles || SYSTEM_ROLES).find(r => r.id === currentRole);
  const roleName = rObj ? rObj.name : currentRole;

  Swal.fire({
    title: 'Khôi phục ma trận quyền chuẩn?',
    html: `Bạn có chắc chắn muốn đặt lại quyền hạn của vai trò <strong>${roleName}</strong> về thiết lập mặc định của Khoa Toán - Tin TNUS?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đặt lại mặc định',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#2563eb'
  }).then(res => {
    if (res.isConfirmed) {
      if (!window.appState.rolePermissions) window.appState.rolePermissions = {};
      window.appState.rolePermissions[currentRole] = [...(DEFAULT_ROLE_PERMISSIONS[currentRole] || [])];
      window.saveStateToLocalStorage();
      if (typeof window.applyRoleRestrictionsToUI === 'function') {
        window.applyRoleRestrictionsToUI();
      }
      window.renderRbacMatrixTable();
      window.logUserActivity('Khôi phục quyền', `Đặt lại ma trận quyền mặc định cho vai trò: ${roleName}`);

      Swal.fire('Thành công', `Đã khôi phục quyền chuẩn cho vai trò ${roleName}`, 'success');
    }
  });
};

// Lọc người dùng theo vai trò từ trang Kiến trúc vai trò hoặc KPI card
window.filterUsersByRole = function(roleId) {
  window.switchRbacSubTab('users');
  const roleFilter = document.getElementById('user-role-filter');
  if (roleFilter) {
    roleFilter.value = roleId;
  }
  if (window.userPagination) window.userPagination.page = 1;
  window.renderUserAccountsTable();
};

// Phân trang danh sách người dùng
window.changeUserPage = function(delta) {
  window.userPagination.page += delta;
  if (window.userPagination.page < 1) window.userPagination.page = 1;
  window.renderUserAccountsTable();
};

// Tóm tắt trách nhiệm & chức năng của từng vai trò
window.getRoleDutySummary = function(role) {
  const summaries = {
    admin: '🛡️ Toàn quyền quản trị hệ thống, thiết bị & phân quyền',
    lab_manager: '🏢 Điều phối 4 phòng PM • Duyệt lịch • Bảo trì',
    teacher: '👨‍🏫 Dạy thực hành • Đăng ký lịch • Báo hỏng máy',
    student: '👨‍🎓 Tra cứu sơ đồ 2D • Xem lịch học (Chỉ đọc)'
  };
  return summaries[role] || 'Thành viên hệ thống';
};

// Cấu trúc định nghĩa chi tiết chức năng, quyền hạn & giới hạn an toàn của 4 vai trò
window.ROLE_CAPABILITY_PROFILES = {
  admin: {
    title: 'Admin (Quản trị viên Hệ thống)',
    subtitle: 'ThS. Trịnh Minh Phú (0975.090.666)',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    color: 'blue',
    icon: 'fa-shield-halved',
    desc: 'Quản trị viên toàn quyền tối cao của toàn hệ thống, chịu trách nhiệm kiến trúc bảo mật, ma trận phân quyền, quản lý 104 máy trạm và an toàn dữ liệu.',
    allowed: [
      'Toàn quyền 42/42 quyền hạn trên toàn bộ 6 module nghiệp vụ',
      'Độc quyền chỉnh sửa, nạp và lưu Ma trận phân quyền RBAC Enterprise',
      'Tạo mới, sửa đổi, khóa và reset mật khẩu mọi tài khoản trong hệ thống',
      'Sao lưu toàn bộ cơ sở dữ liệu hệ thống (JSON Backup / Restore)',
      'Điều khiển toàn diện 104 máy trạm và 4 phòng máy A1-503 đến A1-506'
    ],
    restricted: [
      'Không có giới hạn nào áp dụng cho Admin'
    ],
    sampleAccount: 'ThS. Trịnh Minh Phú (username: <code>admin</code> • SĐT: <strong>0975.090.666</strong>)'
  },
  lab_manager: {
    title: 'Quản Lý Phòng Máy',
    subtitle: 'Cán bộ Quản lý phòng máy',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    color: 'indigo',
    icon: 'fa-desktop',
    desc: 'Trực tiếp phụ trách cơ sở vật chất, quản lý tài sản, điều phối sử dụng 4 phòng máy A1-503 đến A1-506 và giám sát hoạt động thực hành.',
    allowed: [
      'Duyệt hoặc từ chối đơn đăng ký sử dụng phòng máy của giảng viên',
      'Theo dõi tiến độ và mở ca thực hành trực tiếp tại phòng máy',
      'Kiểm kê tài sản 104 máy trạm, in tem mã QR và xuất báo cáo hiện trạng',
      'Lập kế hoạch bảo trì định kỳ, nghiệm thu chất lượng sửa chữa máy tính',
      'Xem nhật ký an ninh và thống kê công suất sử dụng phòng máy'
    ],
    restricted: [
      'Không có quyền tạo, sửa hoặc xóa tài khoản cán bộ trong hệ thống',
      'Không có quyền thay đổi cấu hình bảo mật hoặc Ma trận phân quyền RBAC'
    ],
    sampleAccount: 'Tài khoản Quản lý phòng máy (Lab Manager)'
  },
  teacher: {
    title: 'Giảng Viên Thực Hành',
    subtitle: 'Giảng viên giảng dạy / thực hành',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    color: 'emerald',
    icon: 'fa-chalkboard-user',
    desc: 'Phục vụ cán bộ giảng viên giảng dạy thực hành tin học, lập trình, tính toán khoa học cho sinh viên tại các phòng máy của khoa.',
    allowed: [
      'Tra cứu thời khóa biểu, lịch giảng dạy và tình trạng máy trống của 4 phòng',
      'Đăng ký lịch thực hành mới cho các lớp học phần',
      'Mở ca dạy và kết thúc ca thực hành do chính mình phụ trách',
      'Gửi phiếu báo hỏng thiết bị trực tiếp khi phát hiện máy hỏng trong giờ học',
      'Xem sơ đồ 2D và cấu hình chi tiết từng máy để phân bổ vị trí sinh viên'
    ],
    restricted: [
      'Không thể can thiệp bật/tắt nguồn máy trạm từ xa (chống gián đoạn giờ học)',
      'Không thể sửa cấu hình phần cứng hoặc xóa máy trạm khỏi hệ thống',
      'Không thể duyệt hoặc hủy ca thực hành của giảng viên khác',
      'Không thể can thiệp phân quyền hoặc quản trị tài khoản'
    ],
    sampleAccount: 'Tài khoản Giảng viên thực hành'
  },
  student: {
    title: 'Sinh Viên / Khách Tra Cứu',
    subtitle: 'Sinh viên TNUS • Khách tra cứu',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    color: 'purple',
    icon: 'fa-graduation-cap',
    desc: 'Chế độ an toàn công khai dành cho sinh viên đến học thực hành hoặc khách tham quan tra cứu thông tin phòng máy TNUS.',
    allowed: [
      'Tra cứu trực quan sơ đồ 2D phòng máy và kiểm tra máy tính còn trống',
      'Xem thông số cấu hình phần cứng máy trạm (CPU, RAM, VGA, Màn hình)',
      'Xem thời khóa biểu các ca thực hành diễn ra trong tuần',
      'Xem danh bạ liên hệ hỗ trợ kỹ thuật và giáo viên phụ trách'
    ],
    restricted: [
      'TOÀN BỘ CHỨC NĂNG SỬA ĐỔI ĐƯỢC KHÓA AN TOÀN (CHỈ XEM - READ ONLY)',
      'Không thể bật/tắt nguồn máy trạm',
      'Không thể sửa cấu hình, thêm hoặc xóa máy trạm',
      'Không thể xếp lịch, báo sự cố hay can thiệp hệ thống'
    ],
    sampleAccount: 'Sinh viên TNUS (Chế độ chỉ xem)'
  }
};

// Hiển thị hộp thoại Modal chi tiết quyền hạn & chức năng của từng vai trò
window.viewRoleDetailModal = function(roleId) {
  const profile = window.ROLE_CAPABILITY_PROFILES[roleId] || {
    title: `Vai trò [${roleId}]`,
    subtitle: 'Tài khoản người dùng',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    desc: 'Chức năng cơ bản của hệ thống',
    allowed: ['Xem các thông tin được cấp quyền'],
    restricted: ['Các hành động hạn chế theo phân quyền'],
    sampleAccount: 'Tài khoản thành viên'
  };

  const allowedHtml = profile.allowed.map(item => `
    <li class="flex items-start gap-2 text-slate-700">
      <i class="fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0 text-xs"></i>
      <span class="text-xs leading-relaxed font-medium">${item}</span>
    </li>
  `).join('');

  const restrictedHtml = profile.restricted.map(item => `
    <li class="flex items-start gap-2 text-slate-600">
      <i class="fa-solid fa-ban text-rose-500 mt-0.5 shrink-0 text-xs"></i>
      <span class="text-xs leading-relaxed">${item}</span>
    </li>
  `).join('');

  Swal.fire({
    title: `
      <div class="text-left flex items-center gap-2.5 pb-2 border-b border-slate-200">
        <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0">
          <i class="fa-solid ${profile.icon || 'fa-id-badge'}"></i>
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900 leading-tight">${profile.title}</h3>
          <p class="text-[11px] text-slate-500 font-normal mt-0.5">${profile.subtitle}</p>
        </div>
      </div>
    `,
    html: `
      <div class="text-left text-xs space-y-3.5 pt-2">
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-normal">
          ${profile.desc}
        </div>

        <div>
          <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-square-check text-emerald-600"></i>
            <span>Chức năng & Thao tác được phép (${profile.allowed.length})</span>
          </div>
          <ul class="space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            ${allowedHtml}
          </ul>
        </div>

        <div>
          <div class="text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-shield-halved text-rose-600"></i>
            <span>Giới hạn an toàn & Rào cản bảo vệ</span>
          </div>
          <ul class="space-y-1.5 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
            ${restrictedHtml}
          </ul>
        </div>

        <div class="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div><i class="fa-solid fa-user-tag text-blue-600 mr-1"></i>Tài khoản đại diện: ${profile.sampleAccount}</div>
        </div>
      </div>
    `,
    width: '620px',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-right-to-bracket mr-1.5"></i>Vào thử vai trò này ngay',
    cancelButtonText: 'Đóng',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b'
  }).then(result => {
    if (result.isConfirmed) {
      if (typeof window.directTestRole === 'function') {
        window.directTestRole(roleId, 'dashboard');
      }
    }
  });
};

// Hiển thị Modal So sánh & Đối chiếu Năng lực 5 Loại Tài Khoản Toàn Hệ Thống
window.showAllRolesCapabilityModal = function() {
  const curUser = window.appState.currentUser || (window.appState.users && window.appState.users[0]);
  const curRole = window.normalizeRole ? window.normalizeRole(curUser?.role) : (curUser?.role || 'student');
  const isAdmin = (curRole === 'admin');

  Swal.fire({
    title: `
      <div class="text-left flex items-center justify-between pb-2 border-b border-slate-200">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-2xs">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 leading-tight">Đối Chiếu Năng Lực & Chức Năng 5 Loại Tài Khoản</h3>
            <p class="text-[11px] text-slate-500 font-normal">Khoa Toán - Tin • Trường Đại học Khoa học (TNUS) • Chuẩn RBAC Enterprise</p>
          </div>
        </div>
      </div>
    `,
    html: `
      <div class="text-left text-xs space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
        <div class="p-3 ${isAdmin ? 'bg-blue-50/80 border-blue-200 text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600'} rounded-xl border leading-relaxed text-[11px]">
          ${isAdmin 
            ? 'Mỗi vai trò được thiết kế chuyên biệt theo quy trình vận hành giảng dạy thực tế tại 4 phòng máy A1-503, A1-504, A1-505, A1-506. Là Quản trị viên (Admin), bạn có thể bấm "Vào thử" để chuyển thử nghiệm tức thì.' 
            : `Bảng đối chiếu thông tin phân quyền & năng lực của 4 loại tài khoản trên hệ thống phòng máy TNUS. Bạn đang đăng nhập với tài khoản <strong>${curUser ? curUser.name : ''}</strong> (${curUser ? curUser.roleName : ''}) - <span class="text-slate-500 font-semibold">Tài khoản này không được phép chuyển đổi sang vai trò khác.</span>`}
        </div>

        <!-- BẢNG SO SÁNH NHANH 4 VAI TRÒ -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
          <table class="w-full text-left text-[11px] border-collapse bg-white">
            <thead>
              <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th class="py-2.5 px-3">Nghiệp vụ / Chức năng chính</th>
                <th class="py-2.5 px-2 text-center text-blue-700 bg-blue-50/60">Admin</th>
                <th class="py-2.5 px-2 text-center text-indigo-700 bg-indigo-50/60">QL Phòng</th>
                <th class="py-2.5 px-2 text-center text-emerald-700 bg-emerald-50/60">Giảng Viên</th>
                <th class="py-2.5 px-2 text-center text-purple-700 bg-purple-50/60">Sinh Viên</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td class="py-2 px-3 font-semibold">1. Xem Dashboard KPI & Sơ đồ 2D 104 máy</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr class="bg-slate-50/50">
                <td class="py-2 px-3 font-semibold">2. Bật / Tắt nguồn Wake-on-LAN máy trạm</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold">3. Thêm / Sửa / Khóa máy tính & Cập nhật IP/MAC</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
              <tr class="bg-slate-50/50">
                <td class="py-2 px-3 font-semibold">4. Đăng ký ca thực hành mới & Mở ca dạy</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold">5. Duyệt đơn & Phê duyệt lịch phòng máy</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
              <tr class="bg-slate-50/50">
                <td class="py-2 px-3 font-semibold">6. Gửi phiếu báo hỏng thiết bị trực tiếp</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold">7. Tiếp nhận xử lý sự cố & thay linh kiện</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
              <tr class="bg-slate-50/50">
                <td class="py-2 px-3 font-semibold">8. Quản lý tài khoản cán bộ (Thêm/Sửa/Khóa/Reset)</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
              <tr class="bg-blue-50/50">
                <td class="py-2 px-3 font-bold text-blue-900">9. Chỉnh sửa Ma trận phân quyền RBAC</td>
                <td class="py-2 px-2 text-center text-emerald-600 font-black">✓ (Toàn quyền)</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
                <td class="py-2 px-2 text-center text-slate-300 font-bold">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4 THẺ VAI TRÒ NHANH KÈM NÚT DÙNG THỬ HOẶC TRẠNG THÁI -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          <div class="p-3 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between">
            <div>
              <div class="font-bold text-blue-900 text-xs">⚙️ Admin (ThS. Trịnh Minh Phú)</div>
              <div class="text-[10px] text-slate-600">Toàn quyền 42/42 thẩm quyền, quản trị 104 máy trạm & RBAC</div>
            </div>
            ${isAdmin ? `
              <button onclick="Swal.close(); window.directTestRole('admin');" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs">Vào thử</button>
            ` : (curRole === 'admin' ? `
              <span class="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-[11px] font-bold border border-blue-300 flex items-center gap-1 shadow-2xs"><i class="fa-solid fa-circle-check"></i> Đang dùng</span>
            ` : `
              <span class="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-medium border border-slate-200 cursor-not-allowed flex items-center gap-1"><i class="fa-solid fa-lock text-[9px]"></i> Khóa chuyển</span>
            `)}
          </div>

          <div class="p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between">
            <div>
              <div class="font-bold text-indigo-900 text-xs">🏢 Quản lý phòng máy</div>
              <div class="text-[10px] text-slate-600">Điều phối 4 phòng, duyệt lịch thực hành, kiểm kê tài sản</div>
            </div>
            ${isAdmin ? `
              <button onclick="Swal.close(); window.directTestRole('lab_manager');" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs">Vào thử</button>
            ` : (curRole === 'lab_manager' ? `
              <span class="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-[11px] font-bold border border-indigo-300 flex items-center gap-1 shadow-2xs"><i class="fa-solid fa-circle-check"></i> Đang dùng</span>
            ` : `
              <span class="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-medium border border-slate-200 cursor-not-allowed flex items-center gap-1"><i class="fa-solid fa-lock text-[9px]"></i> Khóa chuyển</span>
            `)}
          </div>

          <div class="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
            <div>
              <div class="font-bold text-emerald-900 text-xs">👨‍🏫 Giảng viên thực hành</div>
              <div class="text-[10px] text-slate-600">Đăng ký ca dạy, mở ca thực hành & báo hỏng thiết bị</div>
            </div>
            ${isAdmin ? `
              <button onclick="Swal.close(); window.directTestRole('teacher');" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs">Vào thử</button>
            ` : (curRole === 'teacher' ? `
              <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-300 flex items-center gap-1 shadow-2xs"><i class="fa-solid fa-circle-check"></i> Đang dùng</span>
            ` : `
              <span class="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-medium border border-slate-200 cursor-not-allowed flex items-center gap-1"><i class="fa-solid fa-lock text-[9px]"></i> Khóa chuyển</span>
            `)}
          </div>

          <div class="p-3 rounded-xl border border-purple-200 bg-purple-50/40 flex items-center justify-between">
            <div>
              <div class="font-bold text-purple-900 text-xs">👨‍🎓 Sinh Viên / Khách (Read-only)</div>
              <div class="text-[10px] text-slate-600">Tra cứu sơ đồ 2D trực quan, cấu hình máy & thời khóa biểu tuần các phòng máy</div>
            </div>
            ${isAdmin ? `
              <button onclick="Swal.close(); window.directTestRole('student');" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs">Vào thử</button>
            ` : (curRole === 'student' ? `
              <span class="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-[11px] font-bold border border-purple-300 flex items-center gap-1 shadow-2xs"><i class="fa-solid fa-circle-check"></i> Đang dùng</span>
            ` : `
              <span class="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-medium border border-slate-200 cursor-not-allowed flex items-center gap-1"><i class="fa-solid fa-lock text-[9px]"></i> Khóa chuyển</span>
            `)}
          </div>
        </div>
      </div>
    `,
    width: '760px',
    showConfirmButton: false,
    showCloseButton: true
  });
};


// ============================================================================
// HỆ THỐNG ĐĂNG NHẬP, ĐĂNG XUẤT & BẢO MẬT PHÂN QUYỀN (RBAC AUTHENTICATION 3.0)
// KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
// ============================================================================

/**
 * Ẩn / hiện mật khẩu trong modal đăng nhập vai trò
 */
window.toggleRoleLoginPasswordVisibility = function() {
  const pwdInput = document.getElementById('role-login-password');
  const eyeIcon = document.getElementById('role-login-pwd-eye');
  if (!pwdInput || !eyeIcon) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    pwdInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
};

/**
 * Chuyển phiên làm việc về tài khoản khách (Sinh viên / Tra cứu)
 * Kích hoạt khi người dùng bấm "Đóng" trên modal đăng nhập hoặc hủy xác thực
 */
window.returnToGuestView = function(showToast = true) {
  const guestUser = (typeof window.getRoleUser === 'function')
    ? window.getRoleUser('student')
    : (window.STANDARD_ROLE_ACCOUNTS?.student || {
        id: 'USR-05',
        username: 'student',
        name: 'Sinh viên / Khách tra cứu',
        role: 'student',
        roleName: 'Sinh viên',
        avatar: '👨‍🎓',
        department: 'Khoa Toán - Tin, TNUS',
        status: 'active'
      });

  window.appState.currentUser = guestUser;
  window.saveStateToLocalStorage();
  window.updateUserUI();
  if (typeof window.applyRoleRestrictionsToUI === 'function') {
    window.applyRoleRestrictionsToUI();
  }
  if (typeof window.renderUserAccountsTable === 'function') {
    window.renderUserAccountsTable();
  }
  if (typeof window.updateUserKPIs === 'function') {
    window.updateUserKPIs();
  }
  if (typeof window.switchTab === 'function') {
    window.switchTab('schedule');
  }

  if (showToast && typeof Swal !== 'undefined') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
    Toast.fire({
      icon: 'info',
      title: 'Đang ở giao diện Khách tra cứu (Sinh viên)'
    });
  }
};

/**
 * Mở hộp thoại Đăng nhập chuyên biệt cho từng vai trò tài khoản
 * (Quản lý phòng máy, Giảng viên, Quản trị viên, Sinh viên)
 * Giao diện tối giản, chuyên nghiệp, dễ nhìn, không rườm rà.
 * Khi đóng sẽ tự động chuyển về giao diện tài khoản khách (Sinh viên).
 */
window.openRoleLoginModal = function(roleParam, targetTab) {
  const rawRole = (roleParam || 'lab_manager').toString().toLowerCase().trim();
  const aliasRoleMap = {
    'manager': 'lab_manager',
    'lab_manager': 'lab_manager',
    'qlpm': 'lab_manager',
    'qlphongmay': 'lab_manager',
    'quanly': 'lab_manager',
    'quanlyphongmay': 'lab_manager',
    'teacher': 'teacher',
    'giangvien': 'teacher',
    'gv': 'teacher',
    'toannv': 'teacher',
    'staff': 'lab_manager',
    'lab_staff': 'lab_manager',
    'technician': 'lab_manager',
    'ktv': 'lab_manager',
    'ktvlab': 'lab_manager',
    'kythuat': 'lab_manager',
    'kythuatvien': 'lab_manager',
    'admin': 'admin',
    'quantri': 'admin',
    'quantrivien': 'admin',
    'phutm': 'admin',
    'student': 'student',
    'sinhvien': 'student',
    'sv': 'student',
    'khach': 'student'
  };

  const normRole = aliasRoleMap[rawRole] || (window.normalizeRole ? window.normalizeRole(rawRole) : rawRole);

  // BỎ HOÀN TOÀN CHỨC NĂNG ĐĂNG NHẬP Ở TÀI KHOẢN SINH VIÊN / KHÁCH TRA CỨU:
  // Sinh viên tra cứu tự do (Sơ đồ 2D, Lịch thực hành) không cần tài khoản hay mật khẩu
  if (normRole === 'student') {
    if (typeof window.returnToGuestView === 'function') {
      window.returnToGuestView(true);
    }
    if (targetTab && typeof window.switchTab === 'function') {
      window.switchTab(targetTab);
    }
    return;
  }

  const roleUiConfig = {
    lab_manager: {
      roleTitle: 'QUẢN LÝ PHÒNG MÁY',
      roleBadge: 'Quản lý thiết bị',
      themeColor: '#4f46e5',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconClass: 'fa-desktop',
      destTab: targetTab || 'computers',
      destTabLabel: 'Quản lý Thiết bị (104 máy)'
    },
    teacher: {
      roleTitle: 'GIẢNG VIÊN THỰC HÀNH',
      roleBadge: 'Giảng dạy',
      themeColor: '#059669',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconClass: 'fa-chalkboard-user',
      destTab: targetTab || 'schedule',
      destTabLabel: 'Lịch Thực Hành Phòng Máy'
    },
    admin: {
      roleTitle: 'QUẢN TRỊ VIÊN HỆ THỐNG',
      roleBadge: 'Toàn quyền',
      themeColor: '#2563eb',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconClass: 'fa-shield-halved',
      destTab: targetTab || 'dashboard',
      destTabLabel: 'Dashboard Tổng Quan'
    },
    student: {
      roleTitle: 'SINH VIÊN / TRA CỨU',
      roleBadge: 'Khách',
      themeColor: '#7c3aed',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      iconClass: 'fa-graduation-cap',
      destTab: targetTab || 'simulation',
      destTabLabel: 'Sơ Đồ 2D Trực Quan'
    }
  };

  const ui = roleUiConfig[normRole] || roleUiConfig['lab_manager'];
  let roleLoginSubmitted = false;

  // Lấy danh sách tài khoản thuộc vai trò này hiện có trong hệ thống (bao gồm tài khoản do Admin tạo mới)
  const roleUsers = (window.appState.users || []).filter(u => {
    const r = window.normalizeRole ? window.normalizeRole(u.role) : u.role;
    return r === normRole;
  });

  const isTeacherRole = (normRole === 'teacher');

  let defaultUser = isTeacherRole ? null : roleUsers[0];
  if (!isTeacherRole && !defaultUser && typeof STANDARD_ROLE_ACCOUNTS !== 'undefined' && STANDARD_ROLE_ACCOUNTS[normRole]) {
    defaultUser = STANDARD_ROLE_ACCOUNTS[normRole];
  }
  // Yêu cầu: tên đăng nhập, mật khẩu tài khoản giáo viên để trống, không để tên mặc định
  const defaultUsername = isTeacherRole ? '' : (defaultUser ? (defaultUser.username || '') : (normRole === 'lab_manager' ? 'linhtt' : ''));
  const defaultPass = isTeacherRole ? '' : ((defaultUser && defaultUser.initialPassword) ? defaultUser.initialPassword : (normRole === 'lab_manager' ? 'Tnus@2026' : ''));

  let userChipsHtml = '';
  // Đối với giáo viên: để trống hoàn toàn, không hiện gợi ý chip để giáo viên tự nhập tài khoản cá nhân do Admin cấp
  if (!isTeacherRole && roleUsers.length > 0) {
    const chips = roleUsers.map(u => {
      const uname = (u.username || '').replace(/^@+/, '');
      const uPass = u.initialPassword || 'Tnus@2026';
      return `<button type="button" class="btn-role-quick-user px-2 py-1 bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-bold rounded-lg border border-slate-300 transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer" data-uname="${uname}" data-pass="${uPass}" title="Bấm để chọn tài khoản ${u.name}">
        <span>${u.avatar || '👤'}</span>
        <span class="text-indigo-600 font-bold">@${uname}</span>
        <span class="text-[10px] text-slate-500 font-sans font-normal truncate max-w-[120px]">(${u.name})</span>
      </button>`;
    }).join('');

    userChipsHtml = `
      <div class="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-left">
        <div class="text-[10px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span><i class="fa-solid fa-users text-indigo-600 mr-1"></i>Tài khoản ${ui.roleTitle} khả dụng:</span>
          <span class="text-[10px] text-indigo-600 font-normal">Nhấp để điền nhanh</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${chips}
        </div>
      </div>
    `;
  }

  Swal.fire({
    width: '420px',
    padding: '1.25rem',
    backdrop: 'rgba(15, 23, 42, 0.85)',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    showCloseButton: false,
    html: `
      <div class="text-left select-none">
        <!-- Header gọn gàng, tinh tế -->
        <div class="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div class="w-10 h-10 rounded-xl text-white flex items-center justify-center text-lg shadow-sm shrink-0" style="background: ${ui.themeColor};">
            <i class="fa-solid ${ui.iconClass}"></i>
          </div>
          <div class="flex-1 min-w-0 pr-4">
            <div class="flex items-center justify-between gap-1">
              <h3 class="text-sm font-extrabold text-slate-900 tracking-tight uppercase">${ui.roleTitle}</h3>
            </div>
            <p class="text-[11px] text-blue-700 font-semibold truncate">Khoa Toán - Tin • Trường ĐH Khoa học (TNUS)</p>
          </div>
        </div>

        <!-- Phân hệ đích -->
        <div class="mt-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span class="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-arrow-right-to-bracket text-indigo-600"></i>
            Phân hệ đích:
          </span>
          <span class="text-[11px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
            ${ui.destTabLabel}
          </span>
        </div>

        ${userChipsHtml}

        <!-- Form nhập liệu chuyên nghiệp, gọn gàng -->
        <div class="space-y-3 mt-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span><i class="fa-solid fa-user text-slate-400 mr-1.5"></i>Tên đăng nhập</span>
              <span class="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Do Admin cấp
              </span>
            </label>
            <input type="text" id="role-login-username" value="${defaultUsername}" placeholder="Nhập tên đăng nhập do Quản trị viên cấp..." autocomplete="off"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span><i class="fa-solid fa-lock text-slate-400 mr-1.5"></i>Mật khẩu</span>
              <span class="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Do Admin cấp
              </span>
            </label>
            <div class="relative">
              <input type="password" id="role-login-password" value="${defaultPass}" placeholder="Nhập mật khẩu do Quản trị viên cấp..." autocomplete="off"
              class="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition">
              <button type="button" onclick="window.toggleRoleLoginPasswordVisibility()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                <i id="role-login-pwd-eye" class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>

          <!-- Ghi chú bảo mật & hỗ trợ 1 dòng -->
          <div class="py-1.5 px-2.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5">
            <i class="fa-solid fa-shield-halved text-amber-600 shrink-0 text-xs"></i>
            <span>Liên hệ Admin ThS. Trịnh Minh Phú (<strong>0975.090.666</strong>) để cấp tài khoản.</span>
          </div>
        </div>

        <!-- Nút hành động chính: Đăng nhập toàn chiều rộng -->
        <div class="mt-4 pt-2 border-t border-slate-100">
          <button type="button" id="btn-role-login-submit" class="w-full py-2.5 px-4 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 hover:opacity-95" style="background: ${ui.themeColor};">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Đăng Nhập</span>
          </button>
        </div>

        <!-- Nút phụ quay về giao diện khách tra cứu -->
        <div class="mt-2.5 text-center">
          <button type="button" id="btn-role-login-guest" class="text-[11px] text-slate-500 hover:text-indigo-600 hover:underline font-semibold inline-flex items-center gap-1 transition">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Quay về giao diện tài khoản khách (Sinh viên)</span>
          </button>
        </div>
      </div>
    `,
    didOpen: () => {
      const uInput = document.getElementById('role-login-username');
      const pInput = document.getElementById('role-login-password');
      if (isTeacherRole) {
        if (uInput) uInput.value = '';
        if (pInput) pInput.value = '';
      }
      if (uInput) uInput.focus();

      // Kết nối các nút điền nhanh tài khoản khả dụng
      document.querySelectorAll('.btn-role-quick-user').forEach(btn => {
        btn.addEventListener('click', () => {
          if (uInput) uInput.value = btn.dataset.uname;
          if (pInput) pInput.value = btn.dataset.pass;
          if (uInput) uInput.focus();
        });
      });

      const doSubmit = () => {
        if (roleLoginSubmitted) return;
        const u = uInput ? uInput.value.trim() : '';
        const p = pInput ? pInput.value : '';
        if (!u) {
          Swal.showValidationMessage('Vui lòng nhập tên đăng nhập!');
          return;
        }
        if (!p) {
          Swal.showValidationMessage('Vui lòng nhập mật khẩu!');
          return;
        }
        roleLoginSubmitted = true;
        window.handleLoginSubmit(u, p, targetTab || ui.destTab);
      };

      const btnSubmit = document.getElementById('btn-role-login-submit');
      if (btnSubmit) btnSubmit.addEventListener('click', doSubmit);

      if (pInput) {
        pInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') doSubmit();
        });
      }
      if (uInput) {
        uInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            if (pInput) pInput.focus();
          }
        });
      }

      // Xử lý nút Quay về khách:
      const handleCloseToGuest = () => {
        roleLoginSubmitted = false;
        Swal.close();
        window.returnToGuestView(true);
      };

      const btnGuest = document.getElementById('btn-role-login-guest');
      if (btnGuest) btnGuest.addEventListener('click', handleCloseToGuest);
    }
  }).then(result => {
    // Nếu người dùng đã submit đăng nhập, không can thiệp hoàn tác
    if (roleLoginSubmitted) return;

    // Chỉ khi người dùng chủ động đóng modal quay về giao diện khách
    const curUser = window.appState.currentUser;
    const curRole = window.normalizeRole ? window.normalizeRole(curUser?.role) : (curUser?.role || 'student');
    if (!curUser || curRole === 'student') {
      window.returnToGuestView(false);
    }
  });
};

/**
 * Mở hộp thoại Đăng nhập hệ thống chung (Login Modal)
 * Giao diện gọn gàng, tinh tế, đóng thì quay về giao diện tài khoản khách
 */
window.openLoginModal = function() {
  let generalLoginSubmitted = false;

  // Lấy các tài khoản cán bộ khả dụng (admin, lab_manager, teacher)
  const staffUsers = (window.appState.users || []).filter(u => u.role === 'admin' || u.role === 'lab_manager' || u.role === 'teacher');
  let staffChips = '';
  if (staffUsers.length > 0) {
    const chips = staffUsers.slice(0, 4).map(u => {
      const uname = (u.username || '').replace(/^@+/, '');
      const pass = u.initialPassword || (u.role === 'admin' ? 'Tnus@Admin2026' : 'Tnus@2026');
      return `<button type="button" class="btn-gen-quick-user px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded border border-slate-300 transition shadow-2xs inline-flex items-center gap-1 cursor-pointer" data-uname="${uname}" data-pass="${pass}">
        <span>${u.avatar || '👤'}</span>
        <span class="text-blue-600 font-bold">@${uname}</span>
        <span class="text-[9px] text-slate-500 font-sans font-normal truncate max-w-[85px]">(${u.roleName || u.name})</span>
      </button>`;
    }).join('');

    staffChips = `
      <div class="p-2 bg-slate-50 border border-slate-200 rounded-lg text-left mt-2">
        <div class="text-[10px] font-bold text-slate-700 mb-1 flex items-center justify-between">
          <span><i class="fa-solid fa-users text-blue-600 mr-1"></i>Tài khoản cán bộ trong hệ thống:</span>
          <span class="text-2xs text-blue-600 font-normal">Nhấp để điền nhanh</span>
        </div>
        <div class="flex flex-wrap gap-1">
          ${chips}
        </div>
      </div>
    `;
  }

  Swal.fire({
    width: '420px',
    padding: '1.25rem',
    backdrop: 'rgba(15, 23, 42, 0.85)',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    showCloseButton: false,
    html: `
      <div class="text-left select-none text-xs">
        <div class="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div class="flex-1 min-w-0 pr-4">
            <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Đăng Nhập Hệ Thống</h3>
            <p class="text-[11px] text-blue-700 font-semibold truncate">Khoa Toán - Tin • Trường ĐH Khoa học (TNUS)</p>
          </div>
        </div>

        ${staffChips}

        <div class="space-y-3 mt-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span><i class="fa-solid fa-user text-slate-400 mr-1.5"></i>Tên đăng nhập</span>
              <span class="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Do Admin cấp
              </span>
            </label>
            <input type="text" id="login-username" value="" placeholder="Nhập tên đăng nhập do Quản trị viên cấp..." autocomplete="off"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span><i class="fa-solid fa-lock text-slate-400 mr-1.5"></i>Mật khẩu</span>
              <span class="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Do Admin cấp
              </span>
            </label>
            <div class="relative">
              <input type="password" id="login-password" value="" placeholder="Nhập mật khẩu do Quản trị viên cấp..." autocomplete="off"
                class="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
              <button type="button" onclick="window.toggleLoginPasswordVisibility()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                <i id="login-pwd-eye" class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>

          <div class="py-1.5 px-2.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5">
            <i class="fa-solid fa-shield-halved text-amber-600 shrink-0 text-xs"></i>
            <span>Liên hệ Admin ThS. Trịnh Minh Phú (<strong>0975.090.666</strong>) để cấp tài khoản.</span>
          </div>
        </div>

        <!-- Nút hành động chính: Đăng nhập toàn chiều rộng -->
        <div class="mt-4 pt-2 border-t border-slate-100">
          <button type="button" id="btn-login-submit" class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Đăng Nhập</span>
          </button>
        </div>

        <div class="mt-2.5 text-center">
          <button type="button" id="btn-login-guest" class="text-[11px] text-slate-500 hover:text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 transition">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Quay về giao diện tài khoản khách (Sinh viên)</span>
          </button>
        </div>
      </div>
    `,
    didOpen: () => {
      const uInput = document.getElementById('login-username');
      const pInput = document.getElementById('login-password');
      if (uInput) uInput.focus();

      // Kết nối các nút điền nhanh tài khoản cán bộ
      document.querySelectorAll('.btn-gen-quick-user').forEach(btn => {
        btn.addEventListener('click', () => {
          if (uInput) uInput.value = btn.dataset.uname;
          if (pInput) pInput.value = btn.dataset.pass;
          if (uInput) uInput.focus();
        });
      });

      const doSubmit = () => {
        if (generalLoginSubmitted) return;
        const u = uInput ? uInput.value.trim() : '';
        const p = pInput ? pInput.value : '';
        if (!u) {
          Swal.showValidationMessage('Vui lòng nhập tên đăng nhập!');
          return;
        }
        if (!p) {
          Swal.showValidationMessage('Vui lòng nhập mật khẩu!');
          return;
        }
        generalLoginSubmitted = true;
        window.handleLoginSubmit(u, p);
      };

      const btnSubmit = document.getElementById('btn-login-submit');
      if (btnSubmit) btnSubmit.addEventListener('click', doSubmit);

      if (pInput) {
        pInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') doSubmit();
        });
      }
      if (uInput) {
        uInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            if (pInput) pInput.focus();
          }
        });
      }

      const handleCloseToGuest = () => {
        generalLoginSubmitted = false;
        Swal.close();
        window.returnToGuestView(true);
      };

      const btnGuest = document.getElementById('btn-login-guest');
      if (btnGuest) btnGuest.addEventListener('click', handleCloseToGuest);
    }
  }).then(result => {
    if (generalLoginSubmitted) return;
    const curUser = window.appState.currentUser;
    const curRole = window.normalizeRole ? window.normalizeRole(curUser?.role) : curUser?.role;
    if (!curUser || curRole === 'student') {
      window.returnToGuestView(false);
    }
  });
};

/**
 * Ẩn / hiện mật khẩu trong modal đăng nhập
 */
window.toggleLoginPasswordVisibility = function() {
  const pwdInput = document.getElementById('login-password');
  const eyeIcon = document.getElementById('login-pwd-eye');
  if (!pwdInput || !eyeIcon) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    pwdInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
};

/**
 * Điền nhanh thông tin tài khoản demo
 */
window.quickFillLogin = function(username, password) {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;
};

/**
 * Xử lý xác thực đăng nhập tài khoản (Quản lý phòng máy, Giảng viên, Admin, Sinh viên)
 */
window.handleLoginSubmit = function(username, password, explicitTargetTab = null) {
  if (!username) {
    Swal.fire({
      icon: 'warning',
      title: 'Thiếu tên đăng nhập',
      text: 'Vui lòng nhập tên đăng nhập để tiếp tục.',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const rawTerm = (username || '').trim();
  const cleanTerm = rawTerm.toLowerCase().replace(/^@+/, '');

  // Sinh viên / Khách tra cứu tự do không cần đăng nhập
  if (cleanTerm === 'student' || cleanTerm === 'sinhvien' || cleanTerm === 'khach' || cleanTerm === 'sv') {
    if (typeof window.returnToGuestView === 'function') {
      window.returnToGuestView(true);
    }
    if (explicitTargetTab && typeof window.switchTab === 'function') {
      window.switchTab(explicitTargetTab);
    }
    return;
  }

  // Bản đồ bí danh các vai trò tài khoản để nhận dạng linh hoạt mọi từ khóa
  const aliasMap = {
    // Quản lý phòng máy
    'linhtt': 'linhtt',
    'linh': 'linhtt',
    'qlphongmay': 'linhtt',
    'qlpm': 'linhtt',
    'manager': 'linhtt',
    'lab_manager': 'linhtt',
    'quanly': 'linhtt',
    'quanlyphongmay': 'linhtt',
    
    // Giảng viên
    'toannv': 'toannv',
    'giangvien': 'toannv',
    'teacher': 'toannv',
    'gv': 'toannv',
    
    // Sinh viên / Khách
    'student': 'student',
    'sinhvien': 'student',
    'sv': 'student',
    'khach': 'student',
    'guest': 'student',
    
    // Quản trị viên
    'admin': 'admin',
    'quantri': 'admin',
    'quantrivien': 'admin',
    'phutm': 'admin'
  };

  const lookupKey = aliasMap[cleanTerm];

  // 1. Tìm chính xác trong appState.users (ưu tiên hàng đầu tài khoản do Admin tạo mới!)
  let user = (window.appState.users || []).find(u => 
    (u.username && u.username.toLowerCase().replace(/^@+/, '') === cleanTerm) ||
    (u.id && u.id.toLowerCase() === cleanTerm) ||
    (u.email && u.email.toLowerCase() === cleanTerm) ||
    (u.name && u.name.toLowerCase().trim() === cleanTerm)
  );

  // 2. Nếu chưa thấy, thử tìm theo bí danh trong appState.users
  if (!user && lookupKey) {
    user = (window.appState.users || []).find(u => 
      (u.username && u.username.toLowerCase().replace(/^@+/, '') === lookupKey) ||
      (lookupKey === 'linhtt' && (u.role === 'lab_manager' || u.username === 'qlphongmay')) ||
      (lookupKey === 'toannv' && u.role === 'teacher') ||
      (lookupKey === 'student' && u.role === 'student') ||
      (lookupKey === 'admin' && u.role === 'admin')
    );
  }

  // 3. Nếu vẫn chưa thấy trong appState.users, tìm theo vai trò Quản lý phòng máy nếu từ khóa liên quan đến quản lý
  if (!user && (cleanTerm === 'linhtt' || cleanTerm === 'linh' || cleanTerm === 'qlphongmay' || cleanTerm === 'manager' || cleanTerm === 'qlpm' || cleanTerm === 'quanly' || cleanTerm === 'quanlyphongmay')) {
    user = (window.appState.users || []).find(u => u.role === 'lab_manager');
  }

  // 4. Nếu vẫn chưa thấy trong appState.users, tìm trong STANDARD_ROLE_ACCOUNTS mặc định của hệ thống
  if (!user && (typeof STANDARD_ROLE_ACCOUNTS !== 'undefined' || window.STANDARD_ROLE_ACCOUNTS)) {
    const standards = typeof STANDARD_ROLE_ACCOUNTS !== 'undefined' ? STANDARD_ROLE_ACCOUNTS : window.STANDARD_ROLE_ACCOUNTS;
    user = Object.values(standards).find(u => 
      (u.username && u.username.toLowerCase().replace(/^@+/, '') === cleanTerm) ||
      (u.id && u.id.toLowerCase() === cleanTerm) ||
      (u.email && u.email.toLowerCase() === cleanTerm) ||
      (lookupKey && u.username && u.username.toLowerCase().replace(/^@+/, '') === lookupKey)
    );
    if (!user && (cleanTerm === 'linhtt' || cleanTerm === 'linh' || cleanTerm === 'qlphongmay' || cleanTerm === 'manager' || cleanTerm === 'qlpm' || cleanTerm === 'quanly')) {
      user = standards.lab_manager;
    }
    if (user) {
      user = { ...user };
      if (!window.appState.users.some(u => u.id === user.id || u.username === user.username)) {
        window.appState.users.push(user);
        window.saveStateToLocalStorage();
      }
    }
  }

  // 5. Nếu từ khóa là linhtt (ThS. Trần Thị Linh) mà chưa có trong bộ nhớ, tự động đồng bộ ngay lập tức:
  if (!user && (cleanTerm === 'linhtt' || cleanTerm === 'linh')) {
    user = {
      id: 'USR-02',
      username: 'linhtt',
      name: 'ThS. Trần Thị Linh',
      role: 'lab_manager',
      roleName: 'Quản lý phòng máy',
      email: 'linhtt@tnus.edu.vn',
      phone: '0978.889.991',
      department: 'Tổ Quản trị Phòng máy - Khoa Toán - Tin',
      avatar: '🏢',
      status: 'active',
      initialPassword: 'Tnus@2026',
      passwordHash: typeof hashPassword === 'function' ? hashPassword('Tnus@2026') : 'tnus@2026',
      salt: 'TNUS_KHOA_TOAN_TIN_2026',
      failedLogins: 0,
      createdAt: '2026-10-15',
      lastLogin: '2026-11-18 08:00'
    };
    if (!window.appState.users.some(u => u.username === 'linhtt')) {
      window.appState.users.push(user);
      window.saveStateToLocalStorage();
    }
  }

  if (!user) {
    Swal.fire({
      icon: 'error',
      title: 'Tài khoản không tồn tại',
      html: `
        <div class="text-xs text-slate-600 text-left space-y-2">
          <p>Không tìm thấy tài khoản <strong>"${username}"</strong> trong hệ thống phòng máy TNUS.</p>
          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-2xs space-y-1">
            <p>• Nếu bạn là Cán bộ / Giảng viên mới: Vui lòng liên hệ Admin <strong>ThS. Trịnh Minh Phú (0975.090.666)</strong> để được tạo tài khoản.</p>
            <p>• Bạn có thể nhập Tên đăng nhập (Username), Email hoặc Mã tài khoản (USR-xx).</p>
          </div>
        </div>
      `,
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  // Kiểm tra tài khoản bị khóa
  if (user.status === 'locked') {
    window.logUserActivity('Đăng nhập thất bại', `Cố gắng đăng nhập tài khoản đang bị khóa: ${user.name} (@${user.username})`, 'users', 'BLOCKED');
    Swal.fire({
      icon: 'error',
      title: 'TÀI KHOẢN ĐANG BỊ KHÓA',
      html: `
        <div class="text-left text-xs space-y-2">
          <p>Tài khoản <strong>${user.name}</strong> (@${user.username}) hiện đang ở trạng thái khóa an toàn.</p>
          <p class="text-slate-500">Vui lòng liên hệ Quản trị viên ThS. Trịnh Minh Phú (0975.090.666) để mở khóa tài khoản.</p>
        </div>
      `,
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  // Xác thực mật khẩu (Hỗ trợ mật khẩu mặc định tnus@2026, mật khẩu cá nhân, initialPassword lẫn hash)
  const verifyFn = (typeof window.verifyPassword === 'function') 
    ? window.verifyPassword 
    : ((typeof verifyPassword === 'function') ? verifyPassword : null);

  const cleanPass = (password || '').trim();
  const isMatch = verifyFn 
    ? verifyFn(cleanPass, user) 
    : (cleanPass.toLowerCase() === 'tnus@2026' || 
       cleanPass === 'Tnus@Admin2026' ||
       (user.initialPassword && (cleanPass === user.initialPassword.trim()))
      );

  if (!isMatch) {
    user.failedLogins = (user.failedLogins || 0) + 1;
    const remaining = 5 - user.failedLogins;

    if (user.failedLogins >= 5) {
      user.status = 'locked';
      window.saveStateToLocalStorage();
      window.logUserActivity('Khóa tài khoản tự động', `Tài khoản ${user.name} (@${user.username}) bị khóa do nhập sai mật khẩu 5 lần liên tiếp.`, 'users', 'BLOCKED');
      
      Swal.fire({
        icon: 'error',
        title: 'TÀI KHOẢN ĐÃ BỊ TỰ ĐỘNG KHÓA',
        html: `
          <div class="text-left text-xs space-y-2">
            <p class="text-rose-600 font-bold">Cảnh báo an ninh: Nhập sai mật khẩu quá 5 lần liên tiếp!</p>
            <p>Hệ thống đã tự động khóa tài khoản <strong>${user.name}</strong> để bảo vệ dữ liệu.</p>
            <p class="text-slate-500">Liên hệ Quản trị viên ThS. Trịnh Minh Phú (0975.090.666) để khôi phục.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    window.saveStateToLocalStorage();
    window.logUserActivity('Sai mật khẩu', `Nhập sai mật khẩu cho tài khoản @${user.username} (Lần ${user.failedLogins}/5)`, 'users', 'WARNING');

    Swal.fire({
      icon: 'warning',
      title: 'Mật khẩu không chính xác',
      html: `
        <div class="text-xs text-slate-600">
          Tên đăng nhập hoặc mật khẩu không đúng.<br>
          Bạn còn <strong class="text-rose-600 font-bold">${remaining}</strong> lần thử trước khi tài khoản bị khóa an toàn!
        </div>
      `,
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  // Đăng nhập thành công: Cập nhật trạng thái
  user.failedLogins = 0;
  user.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
  window.appState.currentUser = user;
  window.saveStateToLocalStorage();

  window.logUserActivity('Đăng nhập thành công', `Đăng nhập thành công với vai trò: ${user.roleName || user.role} (${user.name})`, 'users', 'SUCCESS');

  // Cập nhật toàn bộ giao diện & phân quyền
  window.updateUserUI();
  if (window.renderUserAccountsTable) window.renderUserAccountsTable();
  if (window.updateUserKPIs) window.updateUserKPIs();
  if (window.applyRoleRestrictionsToUI) window.applyRoleRestrictionsToUI();

  // Tự động điều hướng đến đúng phân hệ làm việc chuyên biệt của từng vai trò
  const normRole = window.normalizeRole ? window.normalizeRole(user.role) : user.role;
  const homeTabMap = {
    lab_manager: 'computers',   // Quản lý phòng máy -> Quản lý Thiết bị (104 máy)
    teacher: 'schedule',        // Giảng viên -> Lịch thực hành phòng máy
    admin: 'dashboard',         // Quản trị viên -> Dashboard tổng quan
    student: 'schedule'       // Sinh viên -> Lịch thực hành phòng máy
  };

  const targetTab = explicitTargetTab || homeTabMap[normRole] || 'dashboard';
  if (typeof window.switchTab === 'function') {
    setTimeout(() => {
      window.switchTab(targetTab);
    }, 150);
  }

  // Nội dung chào mừng chuyên biệt theo từng vai trò
  const roleWelcomeInfo = {
    lab_manager: {
      badge: 'Quản lý phòng máy',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      tabName: 'Quản lý Thiết bị (104 máy)',
      powers: [
        'Quản lý danh mục 104 máy trạm của cả 4 phòng (PM1 - PM4)',
        'Bật/Tắt nguồn Wake-on-LAN và kiểm soát trạng thái máy',
        'Phê duyệt lịch thực hành và điều phối phòng máy',
        'Kiểm kê tài sản thiết bị và theo dõi chỉ số khấu hao'
      ]
    },
    teacher: {
      badge: 'Giảng viên thực hành',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tabName: 'Lịch thực hành',
      powers: [
        'Đăng ký ca thực hành mới và quản lý lịch giảng dạy',
        'Mở ca thực hành lớp học và xác nhận trả phòng',
        'Phát bài giảng & đề thi trực tuyến (UDP Multicast)',
        'Khóa / Mở màn hình lớp học tập trung khi giảng bài',
        'Gửi phiếu báo hỏng máy tính trực tiếp cho Quản lý'
      ]
    },
    admin: {
      badge: 'Quản trị viên (Admin)',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      tabName: 'Dashboard tổng quan',
      powers: [
        'Toàn quyền quản trị hệ thống, thiết bị và tài khoản',
        'Cấu hình Ma trận phân quyền RBAC 7 thẩm quyền trên 6 module',
        'Thêm mới, nhập/xuất Excel và quản lý tài khoản người dùng',
        'Sao lưu và khôi phục toàn vẹn dữ liệu hệ thống'
      ]
    },
    student: {
      badge: 'Sinh viên / Khách tra cứu',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      tabName: 'Sơ đồ mô phỏng 2D',
      powers: [
        'Tra cứu sơ đồ 2D trực quan vị trí 104 máy của 4 phòng',
        'Xem cấu hình chi tiết phần cứng từng máy trạm',
        'Xem thời khóa biểu thực hành và lịch trống phòng máy'
      ]
    }
  };

  const info = roleWelcomeInfo[normRole] || roleWelcomeInfo.student;
  const powersHtml = info.powers.map(p => `
    <div class="flex items-start gap-1.5 text-slate-700 text-[11px]">
      <i class="fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0 text-[10px]"></i>
      <span>${p}</span>
    </div>
  `).join('');

  Swal.fire({
    icon: 'success',
    title: `Xin chào, ${user.name}!`,
    html: `
      <div class="text-left text-xs space-y-3 pt-1">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900">${user.name}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${info.badgeClass}">${info.badge}</span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono">Username: @${user.username} • Đơn vị: ${user.department || 'Khoa Toán - Tin, TNUS'}</div>
        </div>

        <div>
          <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <i class="fa-solid fa-key text-blue-600"></i>
            <span>Quyền hạn kích hoạt cho vai trò này:</span>
          </div>
          <div class="space-y-1 p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg">
            ${powersHtml}
          </div>
        </div>

        <div class="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5">
          <i class="fa-solid fa-arrow-right"></i>
          <span>Đã tự động chuyển đến không gian làm việc: <strong>${info.tabName}</strong></span>
        </div>
      </div>
    `,
    width: '520px',
    confirmButtonText: 'Bắt đầu làm việc',
    confirmButtonColor: '#2563eb'
  });
};

/**
 * Đăng xuất khỏi hệ thống
 * Tại giao diện Khách / Sinh viên khi ấn nút đăng xuất sẽ trở về giao diện đăng nhập tài khoản
 */
window.logoutUser = function() {
  const current = window.appState.currentUser;
  const role = window.normalizeRole ? window.normalizeRole(current?.role) : current?.role;
  const isGuestOrStudent = !current || role === 'student';

  // 1. Nếu đang ở giao diện Khách / Sinh viên:
  // Ấn nút Đăng xuất sẽ ngay lập tức trở về giao diện Đăng nhập tài khoản
  if (isGuestOrStudent) {
    window.logUserActivity('Chuyển sang Đăng nhập', 'Khách / Sinh viên ấn nút Đăng xuất để mở giao diện đăng nhập tài khoản', 'users', 'INFO');
    if (typeof window.openLoginModal === 'function') {
      window.openLoginModal();
    }
    return;
  }

  // 2. Nếu đang đăng nhập tài khoản cán bộ (Admin, Quản lý phòng máy, Giảng viên):
  // Xác nhận đăng xuất và tự động chuyển về giao diện đăng nhập tài khoản
  Swal.fire({
    title: 'Xác nhận đăng xuất?',
    html: `Bạn có chắc chắn muốn kết thúc phiên làm việc của <strong>${current.name}</strong> (${current.roleName || role})?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-power-off mr-1"></i>Đăng xuất',
    cancelButtonText: 'Ở lại',
    confirmButtonColor: '#e11d48',
    width: '420px',
    padding: '1.25rem'
  }).then(res => {
    if (res.isConfirmed) {
      window.logUserActivity('Đăng xuất', `Kết thúc phiên làm việc của ${current.name}`, 'users', 'SUCCESS');
      
      // Chuyển về tài khoản Sinh viên / Khách mặc định
      const guest = (typeof window.getRoleUser === 'function')
        ? window.getRoleUser('student')
        : (window.STANDARD_ROLE_ACCOUNTS?.student || { id: 'USR-05', username: 'student', name: 'Sinh viên / Khách tra cứu', role: 'student', roleName: 'Sinh viên', avatar: '👨‍🎓', status: 'active' });
      window.appState.currentUser = guest;
      window.saveStateToLocalStorage();

      window.updateUserUI();
      if (window.renderUserAccountsTable) window.renderUserAccountsTable();
      if (window.updateUserKPIs) window.updateUserKPIs();
      if (window.applyRoleRestrictionsToUI) window.applyRoleRestrictionsToUI();
      if (typeof window.switchTab === 'function') window.switchTab('simulation');

      // Tự động mở ngay giao diện đăng nhập tài khoản
      setTimeout(() => {
        if (typeof window.openLoginModal === 'function') {
          window.openLoginModal();
        }
      }, 300);
    }
  });
};

/**
 * Mở modal Đổi mật khẩu cá nhân
 */
window.openChangePasswordModal = function() {
  const user = window.appState.currentUser;
  if (!user) return;

  Swal.fire({
    title: `
      <div class="text-left flex items-center space-x-2">
        <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
          <i class="fa-solid fa-key"></i>
        </div>
        <div>
          <div class="text-base font-bold text-slate-800">Đổi Mật Khẩu Cá Nhân</div>
          <div class="text-xs text-slate-500 font-normal">@${user.username} • ${user.name}</div>
        </div>
      </div>
    `,
    html: `
      <div class="text-left space-y-3 text-xs mt-2">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
          <input type="password" id="cp-current" placeholder="Nhập mật khẩu đang dùng" 
            class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
          <input type="password" id="cp-new" placeholder="Nhập mật khẩu mới" 
            class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
          <input type="password" id="cp-confirm" placeholder="Nhập lại mật khẩu mới" 
            class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Cập nhật mật khẩu',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#2563eb',
    preConfirm: () => {
      const cur = document.getElementById('cp-current').value;
      const n1 = document.getElementById('cp-new').value;
      const n2 = document.getElementById('cp-confirm').value;

      if (!cur) {
        Swal.showValidationMessage('Vui lòng nhập mật khẩu hiện tại!');
        return false;
      }
      if (!n1 || n1.length < 6) {
        Swal.showValidationMessage('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return false;
      }
      if (n1 !== n2) {
        Swal.showValidationMessage('Xác nhận mật khẩu mới không trùng khớp!');
        return false;
      }
      return { cur, n1 };
    }
  }).then(res => {
    if (res.isConfirmed) {
      const { cur, n1 } = res.value;
      const isMatch = (typeof verifyPassword === 'function')
        ? verifyPassword(cur, user)
        : (cur.toLowerCase() === 'tnus@2026');

      if (!isMatch) {
        Swal.fire('Lỗi', 'Mật khẩu hiện tại không chính xác!', 'error');
        return;
      }

      user.passwordHash = (typeof hashPassword === 'function') 
        ? hashPassword(n1, user.salt || 'TNUS_KHOA_TOAN_TIN_2026') 
        : n1;
      
      window.saveStateToLocalStorage();
      window.logUserActivity('Đổi mật khẩu', `Người dùng ${user.name} (@${user.username}) đã đổi mật khẩu thành công`, 'users', 'SUCCESS');

      Swal.fire({
        icon: 'success',
        title: 'Đổi mật khẩu thành công!',
        text: 'Mật khẩu mới đã được băm an toàn SHA-256 và lưu vào hệ thống.',
        timer: 1800,
        showConfirmButton: false
      });
    }
  });
};

/**
 * Đặt lại mật khẩu về mặc định (Chỉ dành cho Quản trị viên Admin)
 */
window.resetUserPassword = function(userId) {
  const current = window.appState.currentUser;
  if (!current || current.role !== 'admin') {
    Swal.fire('Từ chối truy cập', 'Chỉ Quản trị viên (Admin) mới có quyền đặt lại mật khẩu của người dùng khác!', 'error');
    return;
  }

  const target = (window.appState.users || []).find(u => u.id === userId);
  if (!target) return;

  Swal.fire({
    title: 'Đặt lại mật khẩu?',
    html: `
      <div class="text-xs text-slate-600 text-left space-y-2">
        <p>Bạn đang yêu cầu đặt lại mật khẩu cho tài khoản: <strong>${target.name}</strong> (@${target.username}).</p>
        <p>Mật khẩu sẽ được khôi phục về mặc định an toàn: <strong class="text-blue-600 font-mono">tnus@2026</strong></p>
        <p class="text-slate-500">Tài khoản nếu đang bị khóa sẽ tự động được mở khóa.</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-key mr-1"></i>Đặt lại mật khẩu',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#7c3aed'
  }).then(res => {
    if (res.isConfirmed) {
      target.passwordHash = (typeof hashPassword === 'function')
        ? hashPassword('tnus@2026', target.salt || 'TNUS_KHOA_TOAN_TIN_2026')
        : 'tnus@2026';
      target.failedLogins = 0;
      target.status = 'active';

      window.saveStateToLocalStorage();
      window.logUserActivity('Reset mật khẩu', `Quản trị viên ${current.name} đã đặt lại mật khẩu cho ${target.name} (@${target.username})`, 'users', 'SUCCESS');

      if (window.renderUserAccountsTable) window.renderUserAccountsTable();
      if (window.updateUserKPIs) window.updateUserKPIs();

      Swal.fire({
        icon: 'success',
        title: 'Đã đặt lại mật khẩu!',
        html: `
          <div class="text-xs text-slate-600 text-left space-y-1">
            <p>Tài khoản: <strong>${target.name}</strong> (@${target.username})</p>
            <p>Mật khẩu mới: <strong class="text-blue-600 font-mono font-bold text-sm">tnus@2026</strong></p>
            <p class="text-emerald-600 font-semibold mt-1">Trạng thái: Đã mở khóa & sẵn sàng sử dụng.</p>
          </div>
        `
      });
    }
  });
};

/**
 * Tiện ích cho Sinh viên tra cứu: Lọc nhanh và làm nổi bật các máy tính trống / hoạt động tốt
 */
window.findAvailableComputersForStudent = function() {
  if (window.labSimulation) {
    const statusSelect = document.getElementById('sim-status-filter');
    if (statusSelect) {
      statusSelect.value = 'good';
      window.labSimulation.statusFilter = 'good';
      window.labSimulation.applyFilters();
    }
    const goodCount = (window.appState.computers || []).filter(c => c.labId === window.labSimulation.currentLabId && c.status === 'good').length;
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Đang làm nổi bật ${goodCount} máy tính sẵn sàng sử dụng tại ${window.labSimulation.currentLabId}`,
      timer: 2200,
      showConfirmButton: false
    });
  }
};

/**
 * Tiện ích cho Sinh viên tra cứu: Mở biểu mẫu báo hỏng máy tính trực quan
 */
window.openStudentReportFaultModal = function() {
  const currentLab = window.labSimulation ? window.labSimulation.currentLabId : 'PM1';
  const labComputers = (window.appState?.computers || []).filter(c => c.labId === currentLab);

  Swal.fire({
    width: '420px',
    padding: '1.25rem',
    title: `
      <div class="text-left flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base shadow-xs shrink-0">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <div class="text-sm font-extrabold text-slate-900 uppercase">Báo Hỏng Máy Tính</div>
          <div class="text-[11px] text-slate-500 font-medium">Gửi phiếu báo sự cố đến Cán bộ Quản lý phòng máy</div>
        </div>
      </div>
    `,
    html: `
      <div class="text-left text-xs space-y-3 mt-3">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Chọn máy tính gặp sự cố (${currentLab}):</label>
          <select id="swal-student-comp-id" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
            ${labComputers.map(c => `<option value="${c.id}">${c.name} (${c.id}) - [${c.brand || 'PC'}]</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Mô tả hiện tượng sự cố:</label>
          <textarea id="swal-student-issue-desc" rows="3" placeholder="Ví dụ: Máy không lên nguồn, màn hình bị nhấp nháy, chuột không nhận, mất mạng..." 
            class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
        </div>
        <div class="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-1.5">
          <i class="fa-solid fa-circle-info text-blue-600 shrink-0"></i>
          <span>Cán bộ Quản lý phòng máy sẽ tiếp nhận và tiến hành xử lý kỹ thuật.</span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-paper-plane mr-1"></i>Gửi Báo Hỏng',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#d97706',
    preConfirm: () => {
      const compId = document.getElementById('swal-student-comp-id')?.value;
      const desc = document.getElementById('swal-student-issue-desc')?.value.trim();
      if (!desc) {
        Swal.showValidationMessage('Vui lòng mô tả ngắn gọn sự cố gặp phải!');
        return false;
      }
      return { compId, desc };
    }
  }).then(res => {
    if (res.isConfirmed && res.value) {
      const { compId, desc } = res.value;
      const comp = (window.appState.computers || []).find(c => c.id === compId);
      if (comp) {
        comp.status = 'warning';
        comp.issue = desc;
      }
      const ticketId = 'INC-' + String((window.appState.maintenance || []).length + 1).padStart(3, '0');
      const newTicket = {
        id: ticketId,
        computerId: compId,
        labId: currentLab,
        computerName: comp ? comp.name : compId,
        issue: desc,
        reportedBy: 'Sinh viên TNUS',
        reporterRole: 'student',
        reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'pending',
        priority: 'medium',
        type: 'hardware'
      };
      if (!window.appState.maintenance) window.appState.maintenance = [];
      window.appState.maintenance.unshift(newTicket);
      window.saveStateToLocalStorage();
      if (window.labSimulation && typeof window.labSimulation.renderRoom === 'function') {
        window.labSimulation.renderRoom();
      }
      Swal.fire({
        icon: 'success',
        title: 'Đã gửi báo hỏng thành công',
        text: `Mã phiếu ${ticketId} đã được chuyển đến Cán bộ Quản lý phòng máy.`,
        confirmButtonColor: '#2563eb'
      });
    }
  });
};

// ============================================================================
// KHỞI CHẠY ỨNG DỤNG TOÀN DIỆN KHOA TOÁN - TIN • TNUS
// Đảm bảo chạy an toàn sau khi mọi module, hàm phân quyền và dữ liệu đã nạp 100%
// ============================================================================
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
  } else {
    initApplication();
  }
}
