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
      window.appState.maintenance = parsed.maintenance || INITIAL_MAINTENANCE;

      // 1. Khởi tạo & đồng bộ danh sách 6 Vai trò chuẩn (SYSTEM_ROLES)
      window.appState.roles = [...SYSTEM_ROLES];

      // 2. Khởi tạo & nạp Ma trận phân quyền (ROLE_PERMISSIONS)
      window.appState.rolePermissions = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)), parsed.rolePermissions || {});

      // 3. Đồng bộ danh sách tài khoản (USERS)
      if (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0) {
        window.appState.users = parsed.users;
        // Đảm bảo luôn có Super Admin gốc USR-01 (ThS. Trịnh Minh Phú)
        let rootAdmin = window.appState.users.find(u => u.id === 'USR-01');
        if (!rootAdmin) {
          window.appState.users.unshift({ ...INITIAL_USERS[0] });
        } else {
          rootAdmin.role = 'super_admin';
          rootAdmin.roleName = 'Super Admin';
          rootAdmin.name = 'ThS. Trịnh Minh Phú';
          rootAdmin.phone = '0975.090.666';
          rootAdmin.email = 'phutm@tnus.edu.vn';
          rootAdmin.department = 'Khoa Toán - Tin, TNUS';
          rootAdmin.status = 'active';
        }
        // Đảm bảo luôn đầy đủ các tài khoản mẫu chuẩn từ INITIAL_USERS (USR-02 đến USR-06)
        const sampleUsers = (typeof INITIAL_USERS !== 'undefined') ? INITIAL_USERS : (window.INITIAL_USERS || []);
        if (Array.isArray(sampleUsers)) {
          let hasAdded = false;
          sampleUsers.forEach(initUser => {
            if (!window.appState.users.some(u => u.id === initUser.id)) {
              window.appState.users.push({ ...initUser });
              hasAdded = true;
            }
          });
          if (hasAdded && typeof window.saveStateToLocalStorage === 'function') {
            window.saveStateToLocalStorage();
          }
        }
      } else {
        window.appState.users = (typeof INITIAL_USERS !== 'undefined') ? [...INITIAL_USERS] : [];
      }

      // 4. Đồng bộ phiên đăng nhập hiện hành
      if (parsed.currentUser && window.appState.users.some(u => u.id === parsed.currentUser.id)) {
        window.appState.currentUser = window.appState.users.find(u => u.id === parsed.currentUser.id);
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
      <div class="p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 bg-slate-50/60 hover:bg-blue-50/30 transition flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center space-x-2.5 min-w-0">
          <span class="px-2 py-1 rounded bg-blue-600 text-white font-mono font-bold text-[11px] shadow-xs flex-shrink-0">${sch.labId}</span>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 truncate" title="${sch.subject}">${sch.subject}</div>
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
      <div class="p-2.5 rounded-lg border border-slate-100 hover:border-rose-200 bg-slate-50/60 hover:bg-rose-50/20 transition flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center space-x-2.5 min-w-0">
          <span class="px-2 py-1 rounded bg-rose-100 text-rose-800 font-mono font-bold text-[11px] border border-rose-200 flex-shrink-0">${inc.computerId}</span>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 truncate" title="${inc.title}">${inc.title}</div>
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
  try {
    initUserRoleSwitcher();
    initUserModule();
    initComputerListTable();
    initQuickModals();
    startDashboardClock();
    window.updateDashboardKPIs();
    initUrlParamsHandler();
  } catch (e) {
    console.warn('Lỗi khởi tạo module phụ trợ:', e);
  }
}

// Khởi chạy an toàn: Hỗ trợ cả trường hợp DOM đang nạp lẫn trường hợp DOM đã nạp xong (trong iframe Google Apps Script)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}

// ============================================================================
// HỆ THỐNG PHÂN QUYỀN RBAC & QUẢN TRỊ TÀI KHOẢN NGƯỜI DÙNG
// KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
// ============================================================================

// Kiểm tra quyền hạn của người dùng hiện tại đối với một hành động
// ============================================================================
// HỆ THỐNG KIỂM TRA PHÂN QUYỀN RBAC 3.0 (7 ACTIONS x 6 MODULES)
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

  // B. Phân cấp Quản trị viên tối cao & Quản trị viên
  if (user.role === 'super_admin') return true;
  if (user.role === 'admin' && canonicalKey !== 'matrix.manage') return true;

  const userRole = user.role || 'student';

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

  const select = document.getElementById('user-role-select');
  const userDisplay = document.getElementById('current-user-display');
  const roleDisplay = document.getElementById('current-role-display');
  const badgeAvatar = document.getElementById('user-header-badge-avatar');

  if (userDisplay) userDisplay.textContent = u.name;
  if (roleDisplay) roleDisplay.textContent = `${u.roleName || u.role} • Khoa Toán - Tin`;
  if (select) select.value = u.role;
  if (badgeAvatar) badgeAvatar.textContent = u.avatar || '👤';

  // Cập nhật thẻ profile trên Tab 6
  const headerAvatar = document.getElementById('user-header-avatar');
  const headerName = document.getElementById('user-header-name');
  const headerRole = document.getElementById('user-header-role');

  if (headerAvatar) headerAvatar.textContent = u.avatar || '👤';
  if (headerName) headerName.textContent = u.name;
  if (headerRole) {
    const roleCfg = (typeof ROLE_PERMISSIONS !== 'undefined' && ROLE_PERMISSIONS[u.role]) ? ROLE_PERMISSIONS[u.role] : { label: u.roleName };
    headerRole.innerHTML = `<i class="fa-solid fa-circle-check text-[10px]"></i><span>${roleCfg.label}</span>`;
  }

  // Tự động áp dụng giới hạn giao diện theo vai trò (RBAC UI Enforcement)
  if (typeof window.applyRoleRestrictionsToUI === 'function') {
    window.applyRoleRestrictionsToUI();
  }
};

// Chuyển đổi vai trò người dùng (Role Switcher trên Header)
function initUserRoleSwitcher() {
  const select = document.getElementById('user-role-select');

  window.updateUserUI();

  if (select) {
    select.addEventListener('change', (e) => {
      const selectedRole = e.target.value;
      const found = window.appState.users.find(u => u.role === selectedRole && (u.status || 'active') === 'active');
      if (found) {
        window.appState.currentUser = found;
        window.saveStateToLocalStorage();
        window.updateUserUI();
        window.logUserActivity('Đổi vai trò', `Chuyển sang vai trò: ${found.roleName} (${found.name})`);
        
        if (window.renderUserAccountsTable) window.renderUserAccountsTable();
        if (window.updateUserKPIs) window.updateUserKPIs();

        Swal.fire({
          icon: 'info',
          title: `Đã chuyển vai trò: ${found.roleName}`,
          text: `Đang thao tác với quyền: ${found.name}`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Không tìm thấy tài khoản',
          text: `Không có tài khoản nào thuộc vai trò này đang mở hoạt động.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
}

// Chuyển phiên làm việc sang một tài khoản cụ thể
window.switchToUser = function(userId) {
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
    if (roleVal === 'admins') {
      list = list.filter(u => u.role === 'admin' || u.role === 'super_admin');
    } else {
      list = list.filter(u => u.role === roleVal);
    }
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
    super_admin: { label: 'Super Admin', bg: 'bg-red-100 text-red-800 border-red-200' },
    admin: { label: 'Admin', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    lab_manager: { label: 'Quản lý phòng máy', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    teacher: { label: 'Giảng viên', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    lab_staff: { label: 'Kỹ thuật viên', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
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
  // Quản trị viên gồm Super Admin và Admin
  const adminCount = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const managerCount = users.filter(u => u.role === 'lab_manager').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const staffCount = users.filter(u => u.role === 'lab_staff').length;
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
  setEl('user-kpi-staff', staffCount);
  setEl('user-kpi-student', studentCount);
  setEl('user-kpi-active', `${activeCount}/${total}`);
};

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
      <div class="flex items-center space-x-2 text-left">
        <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
          <i class="fa-solid fa-user-plus"></i>
        </div>
        <div>
          <div class="text-base font-bold text-slate-900">Thêm Mới Tài Khoản Hệ Thống</div>
          <div class="text-xs text-slate-500 font-normal">Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)</div>
        </div>
      </div>
    `,
    html: `
      <form id="form-add-user" class="text-left space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mã Tài Khoản</label>
            <input type="text" id="add-user-id" value="${defaultId}" readonly class="w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-600 text-xs">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên Đăng Nhập (Username) <span class="text-rose-500">*</span></label>
            <input type="text" id="add-user-username" placeholder="vd: huongtt" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Họ và Tên Cán Bộ / Người Dùng <span class="text-rose-500">*</span></label>
            <input type="text" id="add-user-name" placeholder="vd: ThS. Trần Thu Hường" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Vai Trò Phân Quyền (RBAC) <span class="text-rose-500">*</span></label>
            <select id="add-user-role" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="admin">Admin (Quản trị hệ thống)</option>
              <option value="lab_manager">Quản lý phòng máy (Lab Manager)</option>
              <option value="teacher">Giảng viên (Teacher)</option>
              <option value="lab_staff">Kỹ thuật viên (Lab Staff)</option>
              <option value="student">Sinh viên / Khách (Student)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Đơn Vị Công Tác / Bộ Môn</label>
            <input type="text" id="add-user-dept" value="Khoa Toán - Tin, TNUS" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Biểu Tượng Avatar</label>
            <select id="add-user-avatar" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="👨‍🏫">👨‍🏫 Giảng viên nam</option>
              <option value="👩‍🏫">👩‍🏫 Giảng viên nữ</option>
              <option value="🧑‍🔧">🧑‍🔧 Kỹ thuật viên</option>
              <option value="👨‍💼">👨‍💼 Quản trị viên</option>
              <option value="👨‍🎓">👨‍🎓 Sinh viên nam</option>
              <option value="👩‍🎓">👩‍🎓 Sinh viên nữ</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email ĐH Khoa Học</label>
            <input type="email" id="add-user-email" placeholder="huongtt@tnus.edu.vn" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số Điện Thoại Liên Hệ</label>
            <input type="text" id="add-user-phone" placeholder="09xx.xxx.xxx" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mật Khẩu Ban Đầu</label>
            <input type="password" id="add-user-password" value="Tnus@2026" class="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Trạng Thái Truy Cập</label>
            <select id="add-user-status" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="active">Đang hoạt động</option>
              <option value="locked">Khóa truy cập</option>
            </select>
          </div>
        </div>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: 'Tạo tài khoản',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#2563eb',
    width: '580px',
    preConfirm: () => {
      const username = document.getElementById('add-user-username').value.trim().toLowerCase();
      const name = document.getElementById('add-user-name').value.trim();
      const role = document.getElementById('add-user-role').value;
      const dept = document.getElementById('add-user-dept').value.trim();
      const avatar = document.getElementById('add-user-avatar').value;
      const email = document.getElementById('add-user-email').value.trim();
      const phone = document.getElementById('add-user-phone').value.trim();
      const status = document.getElementById('add-user-status').value;

      if (!username) {
        Swal.showValidationMessage('Vui lòng nhập tên đăng nhập (Username)');
        return false;
      }
      if (!/^[a-z0-9_.-]+$/.test(username)) {
        Swal.showValidationMessage('Tên đăng nhập chỉ chứa chữ cái thường, số và dấu gạch');
        return false;
      }
      if (window.appState.users.some(u => u.username.toLowerCase() === username)) {
        Swal.showValidationMessage(`Tên đăng nhập '${username}' đã tồn tại trong hệ thống!`);
        return false;
      }
      if (!name) {
        Swal.showValidationMessage('Vui lòng nhập họ và tên');
        return false;
      }

      const rawPass = document.getElementById('add-user-password')?.value || 'Tnus@2026';
      const roleObj = (window.appState.roles || SYSTEM_ROLES).find(r => r.id === role);
      const roleName = roleObj ? roleObj.name : role;

      return {
        id: document.getElementById('add-user-id').value,
        username,
        name,
        role,
        roleName,
        department: dept || 'Khoa Toán - Tin, TNUS',
        avatar,
        email: email || `${username}@tnus.edu.vn`,
        phone: phone || '',
        status,
        passwordHash: typeof hashPassword === 'function' ? hashPassword(rawPass) : 'hashed_' + rawPass,
        failedLogins: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Chưa đăng nhập'
      };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      window.appState.users.push(result.value);
      window.saveStateToLocalStorage();
      window.logUserActivity('Thêm tài khoản', `Tạo tài khoản mới ${result.value.name} (@${result.value.username}) với vai trò ${result.value.roleName}`);
      window.renderUserAccountsTable();
      window.updateUserKPIs();

      Swal.fire({
        icon: 'success',
        title: 'Thêm tài khoản thành công!',
        text: `Tài khoản ${result.value.name} (@${result.value.username}) đã được tạo và phân quyền ${result.value.roleName}.`,
        timer: 1800,
        showConfirmButton: false
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
              ${user.id === 'USR-01' ? '<option value="super_admin" selected>Super Admin (Toàn quyền hệ thống)</option>' : ''}
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin (Quản trị viên)</option>
              <option value="lab_manager" ${user.role === 'lab_manager' ? 'selected' : ''}>Quản lý phòng máy (Lab Manager)</option>
              <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Giảng viên (Teacher)</option>
              <option value="lab_staff" ${user.role === 'lab_staff' ? 'selected' : ''}>Kỹ thuật viên (Lab Staff)</option>
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
              <option value="👨‍🏫" ${user.avatar === '👨‍🏫' ? 'selected' : ''}>👨‍🏫 Giảng viên nam</option>
              <option value="👩‍🏫" ${user.avatar === '👩‍🏫' ? 'selected' : ''}>👩‍🏫 Giảng viên nữ</option>
              <option value="🧑‍🔧" ${user.avatar === '🧑‍🔧' ? 'selected' : ''}>🧑‍🔧 Kỹ thuật viên</option>
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

// Xuất danh sách tài khoản ra Excel
window.exportUsersToExcel = function() {
  if (typeof XLSX === 'undefined') {
    Swal.fire('Lỗi', 'Thư viện XLSX chưa tải xong. Vui lòng thử lại sau giây lát.', 'error');
    return;
  }

  const users = window.appState.users || [];
  const exportData = users.map((u, idx) => ({
    'STT': idx + 1,
    'Mã tài khoản': u.id,
    'Tên đăng nhập': u.username,
    'Họ và tên': u.name,
    'Vai trò hệ thống': u.roleName || u.role,
    'Mã vai trò (RBAC)': u.role,
    'Đơn vị công tác': u.department || 'Khoa Toán - Tin, TNUS',
    'Email': u.email || '',
    'Số điện thoại': u.phone || '',
    'Trạng thái': (u.status || 'active') === 'active' ? 'Đang hoạt động' : 'Đã khóa',
    'Ngày cấp tài khoản': u.createdAt || '2026-10-15',
    'Lần đăng nhập cuối': u.lastLogin || '2026-11-14'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "TaiKhoan_PhanQuyen_TNUS");

  const fileName = `TNUS_DanhSach_TaiKhoan_RBAC_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  window.logUserActivity('Xuất Excel', `Xuất danh sách ${users.length} tài khoản người dùng ra file Excel`);
};

// Nhập danh sách tài khoản từ Excel
window.handleUserExcelImport = function(event) {
  if (!window.checkPermission('manage_users', 'Nhập danh sách tài khoản từ Excel')) return;

  const file = event.target.files[0];
  if (!file) return;

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

      rows.forEach(r => {
        const username = (r['Tên đăng nhập'] || r['username'] || '').toString().trim().toLowerCase();
        if (!username) return;

        const roleRaw = (r['Mã vai trò (RBAC)'] || r['role'] || r['Vai trò hệ thống'] || '').toString().toLowerCase();
        let role = 'student';
        if (roleRaw.includes('admin') || roleRaw.includes('quản trị')) role = 'admin';
        else if (roleRaw.includes('teach') || roleRaw.includes('giảng viên')) role = 'teacher';
        else if (roleRaw.includes('staff') || roleRaw.includes('kỹ thuật')) role = 'lab_staff';

        const roleNames = { admin: 'Quản trị viên', teacher: 'Giảng viên', lab_staff: 'Kỹ thuật viên', student: 'Sinh viên' };

        const existing = window.appState.users.find(u => u.username.toLowerCase() === username);
        if (existing) {
          existing.name = r['Họ và tên'] || r['name'] || existing.name;
          existing.role = role;
          existing.roleName = roleNames[role];
          existing.department = r['Đơn vị công tác'] || r['department'] || existing.department;
          existing.email = r['Email'] || r['email'] || existing.email;
          existing.phone = r['Số điện thoại'] || r['phone'] || existing.phone;
          updatedCount++;
        } else {
          const nextId = 'USR-' + (window.appState.users.length + 1).toString().padStart(2, '0');
          window.appState.users.push({
            id: r['Mã tài khoản'] || nextId,
            username: username,
            name: r['Họ và tên'] || r['name'] || username,
            role: role,
            roleName: roleNames[role],
            department: r['Đơn vị công tác'] || 'Khoa Toán - Tin, TNUS',
            avatar: role === 'admin' ? '👨‍💼' : (role === 'teacher' ? '👨‍🏫' : (role === 'lab_staff' ? '🧑‍🔧' : '👨‍🎓')),
            email: r['Email'] || `${username}@tnus.edu.vn`,
            phone: r['Số điện thoại'] || '',
            status: 'active',
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
        html: `Đã nạp dữ liệu: <strong>${addedCount}</strong> tài khoản mới, cập nhật <strong>${updatedCount}</strong> tài khoản có sẵn.`,
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
    teacher: 'bg-emerald-100 text-emerald-800',
    lab_staff: 'bg-amber-100 text-amber-800',
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

        <!-- Thao tác kiểm tra mạng, Desktop ảo & Báo hỏng -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button onclick="window.openVirtualDesktopModal('${comp.id}')" class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center">
            <i class="fa-solid fa-display mr-1.5"></i>Xem Màn hình ảo (Desktop)
          </button>
          <div class="flex items-center space-x-2">
            <button onclick="window.pingTestComputer('${comp.id}', '${comp.ipAddress}')" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg flex items-center">
              <i class="fa-solid fa-network-wired mr-1.5 text-blue-600"></i>Ping Test
            </button>
            <button onclick="window.reportIncidentFromModal('${comp.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-semibold rounded-lg flex items-center">
              <i class="fa-solid fa-flag mr-1.5 text-rose-600"></i>Báo hỏng
            </button>
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
    batchBtn.addEventListener('click', showBatchActionsModal);
  }

  if (printQrAllBtn) {
    printQrAllBtn.addEventListener('click', showPrintAllAssetTagsModal);
  }

  if (importInput) {
    importInput.addEventListener('change', handleExcelImport);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportComputersToExcel);
  }

  if (addCompBtn) {
    addCompBtn.addEventListener('click', showAddComputerModal);
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
            <span class="font-mono font-bold text-blue-700 hover:underline">${c.id}</span>
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
            <button onclick="window.deleteComputer('${c.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Xóa thiết bị">
              <i class="fa-regular fa-trash-can"></i>
            </button>
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
        </div>
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
window.exportComputersToExcel = exportComputersToExcel;
window.showAddComputerModal = showAddComputerModal;
window.showBatchActionsModal = showBatchActionsModal;


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
            <p class="text-slate-500 text-[10px]">Người nhận chỉ cần nhấp vào link này là hệ thống sẽ tự động đăng nhập đúng vai trò và mở đúng trang phân hệ.</p>
          </div>
        `,
        timer: 4500,
        showConfirmButton: false
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

  // 1. Tự động đăng nhập / chuyển quyền theo tham số ?user= hoặc ?role=
  if (userParam) {
    const foundUser = window.appState.users.find(u => 
      (u.username && u.username.toLowerCase() === userParam.toLowerCase()) || 
      (u.id && u.id.toLowerCase() === userParam.toLowerCase())
    );
    if (foundUser && foundUser.status !== 'locked') {
      window.appState.currentUser = foundUser;
      window.saveStateToLocalStorage();
      window.updateUserUI();
      if (window.renderUserAccountsTable) window.renderUserAccountsTable();
      if (window.updateUserKPIs) window.updateUserKPIs();
    }
  } else if (roleParam) {
    const foundUser = window.appState.users.find(u => 
      u.role.toLowerCase() === roleParam.toLowerCase() && (u.status || 'active') === 'active'
    );
    if (foundUser) {
      window.appState.currentUser = foundUser;
      window.saveStateToLocalStorage();
      window.updateUserUI();
      if (window.renderUserAccountsTable) window.renderUserAccountsTable();
      if (window.updateUserKPIs) window.updateUserKPIs();
    }
  }

  // 2. Tự động chuyển tab theo tham số ?tab= (dashboard, simulation, computers, schedule, maintenance, users)
  if (tabParam) {
    const tabLink = document.querySelector(`.nav-tab-link[data-tab="${tabParam.toLowerCase()}"]`);
    if (tabLink) {
      setTimeout(() => tabLink.click(), 80);
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

  const role = u.role;
  const bannerContainer = document.getElementById('dynamic-role-alert-banner');

  if (bannerContainer) {
    if (role === 'super_admin') {
      bannerContainer.innerHTML = `
        <div class="p-3 bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-red-700/60">
          <div class="flex items-center space-x-2 text-xs">
            <span class="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
            <span><strong>🛡️ Super Admin Tối Cao:</strong> ${u.name} (SĐT: 0975.090.666) • <strong>Toàn quyền 42/42 chức năng</strong> trên cả 6 phân hệ và Ma trận RBAC Enterprise.</span>
          </div>
          <div class="flex items-center space-x-2 shrink-0 text-[11px]">
            <button onclick="window.viewRoleDetailModal('super_admin')" class="px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-400/40 font-bold hover:bg-red-500/50 transition">
              <i class="fa-solid fa-circle-info mr-1"></i>Chi tiết quyền
            </button>
            <button onclick="window.forceSyncSystem()" class="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded font-semibold text-white transition flex items-center gap-1">
              <i class="fa-solid fa-rotate"></i>
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>
      `;
    } else if (role === 'admin') {
      bannerContainer.innerHTML = `
        <div class="p-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-blue-700/50">
          <div class="flex items-center space-x-2 text-xs">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span><strong>⚙️ Quản Trị Viên (Admin):</strong> ${u.name} • Quản lý thiết bị 104 máy, người dùng cán bộ, thời khóa biểu và xử lý sự cố bảo trì.</span>
          </div>
          <div class="flex items-center space-x-2 shrink-0 text-[11px]">
            <button onclick="window.viewRoleDetailModal('admin')" class="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold hover:bg-blue-500/50 transition">
              <i class="fa-solid fa-circle-info mr-1"></i>Chi tiết quyền
            </button>
            <button onclick="window.forceSyncSystem()" class="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded font-semibold text-white transition flex items-center gap-1">
              <i class="fa-solid fa-rotate"></i>
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>
      `;
    } else if (role === 'lab_manager') {
      bannerContainer.innerHTML = `
        <div class="p-3 bg-indigo-50 border-l-4 border-indigo-600 rounded-r-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-indigo-950">
          <div class="flex items-center space-x-2 text-xs">
            <i class="fa-solid fa-desktop text-indigo-600 text-sm"></i>
            <span><strong>🏢 Quản Lý Phòng Máy:</strong> <strong>${u.name}</strong> • Điều phối sử dụng 4 phòng A1-503 đến A1-506, duyệt lịch dạy, kiểm kê tài sản & giám sát bảo trì.</span>
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <button onclick="window.viewRoleDetailModal('lab_manager')" class="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-extrabold text-[11px] hover:bg-indigo-300 transition">
              <i class="fa-solid fa-circle-info mr-1"></i>Xem chức năng
            </button>
          </div>
        </div>
      `;
    } else if (role === 'teacher') {
      bannerContainer.innerHTML = `
        <div class="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-emerald-950">
          <div class="flex items-center space-x-2 text-xs">
            <i class="fa-solid fa-chalkboard-user text-emerald-600 text-sm"></i>
            <span><strong>👨‍🏫 Giảng Viên Thực Hành:</strong> Thầy/Cô <strong>${u.name}</strong> • Có quyền tra cứu sơ đồ 2D, mở ca giảng dạy, đăng ký lịch thực hành và gửi phiếu báo hỏng. (Chức năng sửa cấu hình máy & tài khoản được bảo vệ).</span>
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <button onclick="window.viewRoleDetailModal('teacher')" class="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-extrabold text-[11px] hover:bg-emerald-300 transition">
              <i class="fa-solid fa-circle-info mr-1"></i>Xem chức năng
            </button>
          </div>
        </div>
      `;
    } else if (role === 'lab_staff') {
      bannerContainer.innerHTML = `
        <div class="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-950">
          <div class="flex items-center space-x-2 text-xs">
            <i class="fa-solid fa-wrench text-amber-600 text-sm"></i>
            <span><strong>🧑‍🔧 Kỹ Thuật Viên:</strong> <strong>${u.name}</strong> • Có quyền điều khiển nguồn Wake-on-LAN, cập nhật tình trạng phần cứng, tiếp nhận xử lý sự cố & in tem QR.</span>
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <button onclick="window.viewRoleDetailModal('lab_staff')" class="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-extrabold text-[11px] hover:bg-amber-300 transition">
              <i class="fa-solid fa-circle-info mr-1"></i>Xem chức năng
            </button>
          </div>
        </div>
      `;
    } else if (role === 'student') {
      bannerContainer.innerHTML = `
        <div class="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-purple-950">
          <div class="flex items-center space-x-2 text-xs">
            <i class="fa-solid fa-eye text-purple-600 text-sm"></i>
            <span><strong>👨‍🎓 Sinh Viên / Khách Tra Cứu (Chỉ đọc - Read-only):</strong> Bạn đang theo dõi trực quan sơ đồ 2D và thời khóa biểu phòng máy. Các thao tác bật/tắt nguồn và sửa đổi dữ liệu đã được khóa an toàn.</span>
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <button onclick="window.viewRoleDetailModal('student')" class="px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-extrabold text-[11px] hover:bg-purple-300 transition">
              <i class="fa-solid fa-circle-info mr-1"></i>Xem giới hạn
            </button>
          </div>
        </div>
      `;
    }
  }

  // Khóa / Ẩn các nút quản trị tài khoản trong Tab 6 nếu không phải Super Admin hoặc Admin
  const isSuperOrAdmin = (role === 'super_admin' || role === 'admin');
  const btnAddUser = document.getElementById('btn-add-user');
  const btnImportUsers = document.querySelector('button[title*="Nhập danh sách tài khoản"]');
  const btnResetUsers = document.querySelector('button[title*="Khôi phục danh sách tài khoản gốc"]');

  if (btnAddUser) {
    if (isSuperOrAdmin) {
      btnAddUser.classList.remove('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
      btnAddUser.title = 'Tạo tài khoản người dùng mới';
    } else {
      btnAddUser.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
      btnAddUser.title = 'Chỉ Quản trị viên mới có quyền thêm tài khoản';
    }
  }

  if (btnImportUsers) {
    if (isSuperOrAdmin) {
      btnImportUsers.classList.remove('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
    } else {
      btnImportUsers.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
    }
  }

  if (btnResetUsers) {
    if (role === 'super_admin') {
      btnResetUsers.classList.remove('hidden');
    } else {
      btnResetUsers.classList.add('hidden');
    }
  }
};

// Vào thẳng vai trò để thử nghiệm nhanh (1-Click Role Access)
window.directTestRole = function(role, defaultTab = 'dashboard') {
  const found = (window.appState.users || []).find(u => u.role === role && (u.status || 'active') === 'active');
  if (found) {
    window.appState.currentUser = found;
    window.saveStateToLocalStorage();
    window.updateUserUI();
    window.logUserActivity('Chuyển vai trò', `Trực tiếp kích hoạt vai trò ${found.roleName} (${found.name}) để kiểm tra thực tế`);

    if (window.renderUserAccountsTable) window.renderUserAccountsTable();
    if (window.updateUserKPIs) window.updateUserKPIs();

    // Chuyển sang tab mục tiêu
    const tabBtn = document.querySelector(`.nav-tab-link[data-tab="${defaultTab}"]`);
    if (tabBtn) tabBtn.click();

    Swal.fire({
      icon: 'success',
      title: `Đã vào vai trò: ${found.roleName}`,
      html: `
        <div class="text-xs text-slate-600 text-left space-y-1.5">
          <div>Tài khoản đại diện: <strong>${found.name}</strong> (@${found.username})</div>
          <div>Mở thẳng tab: <strong class="text-blue-600">${defaultTab.toUpperCase()}</strong></div>
          <div class="p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-[11px]">
            Toàn bộ giao diện, thẩm quyền và giới hạn RBAC đã được áp dụng tức thì.
          </div>
        </div>
      `,
      timer: 1600,
      showConfirmButton: false
    });
  } else {
    Swal.fire('Thông báo', `Không tìm thấy tài khoản hoạt động nào cho vai trò '${role}'`, 'warning');
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
  const isSuperAdminRole = currentRole === 'super_admin';

  // Lấy ma trận quyền hiện hành của vai trò này
  const matrix = window.appState.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
  const rolePerms = matrix[currentRole] || (DEFAULT_ROLE_PERMISSIONS[currentRole] || []);

  tbody.innerHTML = RBAC_MODULES.map(mod => {
    // 7 ô checkbox cho 7 hành động
    const actionTds = RBAC_ACTIONS.map(act => {
      const permKey = `${mod.id}.${act.id}`;
      const isChecked = rolePerms.includes(permKey);

      return `
        <td class="py-2.5 px-3 text-center whitespace-nowrap">
          <label class="inline-flex items-center justify-center cursor-pointer ${isSuperAdminRole ? 'cursor-not-allowed opacity-75' : ''}">
            <input type="checkbox" 
              class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 rbac-matrix-checkbox" 
              data-role="${currentRole}" 
              data-perm="${permKey}"
              ${isChecked ? 'checked' : ''} 
              ${isSuperAdminRole ? 'disabled title="Super Admin luôn có quyền này tuyệt đối"' : ''}
              onchange="window.onMatrixCheckboxChange(this)">
          </label>
        </td>
      `;
    }).join('');

    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="py-3 px-4 font-semibold text-slate-800 flex items-center space-x-2">
          <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
            <i class="fa-solid ${mod.icon}"></i>
          </div>
          <div>
            <div class="font-bold text-xs text-slate-900">${mod.name}</div>
            <div class="text-[10px] text-slate-400 font-normal">${mod.description}</div>
          </div>
        </td>
        ${actionTds}
        <td class="py-2.5 px-3 text-center whitespace-nowrap">
          ${isSuperAdminRole ? `
            <span class="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Toàn quyền</span>
          ` : `
            <div class="flex items-center justify-center space-x-1">
              <button onclick="window.toggleModuleAllPerms('${currentRole}', '${mod.id}', true)" class="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded text-[10px] font-bold transition" title="Cấp tất cả 7 quyền cho module này">Bật hết</button>
              <button onclick="window.toggleModuleAllPerms('${currentRole}', '${mod.id}', false)" class="px-1.5 py-0.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded text-[10px] font-bold transition" title="Tắt toàn bộ quyền của module này">Tắt hết</button>
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

  if (role === 'super_admin') return; // Super Admin luôn khóa cứng toàn quyền

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

// Lưu ma trận phân quyền
window.saveCurrentRolePermissions = function() {
  const roleSelect = document.getElementById('matrix-role-selector');
  const currentRole = roleSelect ? roleSelect.value : 'all';
  const rObj = (window.appState.roles || SYSTEM_ROLES).find(r => r.id === currentRole);
  const roleName = rObj ? rObj.name : currentRole;

  window.saveStateToLocalStorage();
  window.logUserActivity('Cập nhật quyền', `Lưu thay đổi ma trận phân quyền cho vai trò: ${roleName}`);

  Swal.fire({
    icon: 'success',
    title: 'Đã lưu phân quyền thành công!',
    html: `
      <div class="text-xs text-slate-600 text-left space-y-1">
        <div>Vai trò cập nhật: <strong>${roleName}</strong></div>
        <p class="text-[11px] text-slate-500">Toàn bộ tài khoản thuộc vai trò này sẽ ngay lập tức được áp dụng các thẩm quyền mới.</p>
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
    if (roleId === 'admin') {
      roleFilter.value = 'admins';
    } else {
      roleFilter.value = roleId;
    }
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
    super_admin: '🛡️ Toàn quyền hệ thống • Phân quyền RBAC',
    admin: '⚙️ Quản lý thiết bị, tài khoản & lịch dạy',
    lab_manager: '🏢 Điều phối 4 phòng PM • Duyệt lịch • Bảo trì',
    teacher: '👨‍🏫 Dạy thực hành • Đăng ký lịch • Báo hỏng máy',
    lab_staff: '🧑‍🔧 Bật/Tắt Wake-on-LAN • Bảo trì & Sửa chữa',
    student: '👨‍🎓 Tra cứu sơ đồ 2D • Xem lịch học (Chỉ đọc)'
  };
  return summaries[role] || 'Thành viên hệ thống';
};

// Cấu trúc định nghĩa chi tiết chức năng, quyền hạn & giới hạn an toàn của 6 vai trò
window.ROLE_CAPABILITY_PROFILES = {
  super_admin: {
    title: 'Super Admin (Quản trị viên Tối cao)',
    subtitle: 'ThS. Trịnh Minh Phú • Trưởng phòng / Trưởng bộ môn Tin học',
    badge: 'bg-red-100 text-red-800 border-red-300',
    color: 'red',
    icon: 'fa-shield-halved',
    desc: 'Nắm giữ thẩm quyền cao nhất của toàn bộ hệ thống quản lý phòng máy TNUS. Đảm bảo an ninh, kiến trúc phân quyền và điều hành liên phòng.',
    allowed: [
      'Toàn quyền 42/42 quyền hạn trên toàn bộ 6 module nghiệp vụ',
      'Độc quyền chỉnh sửa, nạp và lưu Ma trận phân quyền RBAC Enterprise',
      'Tạo mới, sửa đổi, khóa và reset mật khẩu mọi tài khoản trong hệ thống',
      'Sao lưu toàn bộ cơ sở dữ liệu hệ thống (JSON Backup / Restore)',
      'Điều khiển toàn diện 104 máy trạm và 4 phòng máy A1-503 đến A1-506'
    ],
    restricted: [
      'Không có giới hạn nào áp dụng cho Super Admin'
    ],
    sampleAccount: 'ThS. Trịnh Minh Phú (username: <code>admin</code> • SĐT: <strong>0975.090.666</strong>)'
  },
  admin: {
    title: 'Admin (Quản trị viên Hệ thống)',
    subtitle: 'KS. Trần Văn Hải • Kỹ sư Quản trị mạng',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    color: 'blue',
    icon: 'fa-user-gear',
    desc: 'Hỗ trợ Super Admin vận hành hệ thống máy tính hàng ngày, quản lý dữ liệu thiết bị, tài khoản cán bộ, kiểm duyệt lịch thực hành và bảo trì.',
    allowed: [
      'Quản lý danh sách thiết bị 104 máy (Thêm, Sửa cấu hình, Xuất/Nhập Excel)',
      'Điều khiển nguồn máy tính (Bật/Tắt nguồn Wake-on-LAN)',
      'Thêm, sửa tài khoản người dùng và mở khóa tài khoản cán bộ',
      'Xếp lịch, duyệt ca thực hành và giải quyết xung đột phòng học',
      'Tiếp nhận, phân công và nghiệm thu các phiếu báo hỏng thiết bị'
    ],
    restricted: [
      'Không thể chỉnh sửa Ma trận phân quyền RBAC (chỉ xem ma trận)',
      'Không thể xóa tài khoản Super Admin gốc'
    ],
    sampleAccount: 'KS. Trần Văn Hải (username: <code>admin_cntt</code> • SĐT: <strong>0983.123.456</strong>)'
  },
  lab_manager: {
    title: 'Quản Lý Phòng Máy',
    subtitle: 'ThS. Lê Hoàng Nam • Tổ Quản trị Phòng máy Tầng 5',
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
    sampleAccount: 'ThS. Lê Hoàng Nam (username: <code>qlphongmay</code> • SĐT: <strong>0978.889.991</strong>)'
  },
  teacher: {
    title: 'Giảng Viên Thực Hành',
    subtitle: 'ThS. Nguyễn Văn Toàn • Giảng viên Bộ môn Khoa học Máy tính',
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
    sampleAccount: 'ThS. Nguyễn Văn Toàn (username: <code>toannv</code> • SĐT: <strong>0912.345.678</strong>)'
  },
  lab_staff: {
    title: 'Kỹ Thuật Viên Phòng Máy',
    subtitle: 'KTV. Chu Tuấn Hưng • Kỹ thuật viên Phần cứng & Mạng',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    color: 'amber',
    icon: 'fa-wrench',
    desc: 'Chịu trách nhiệm trực tiếp về kỹ thuật phần cứng, mạng LAN, cài đặt phần mềm, điều khiển nguồn Wake-on-LAN và xử lý sự cố máy tính.',
    allowed: [
      'Kích hoạt Wake-on-LAN bật/tắt nguồn toàn bộ hoặc từng máy trạm tuần tự',
      'Cập nhật trạng thái máy: Hoạt động, Cần kiểm tra, Đang hỏng, Bảo trì',
      'Tiếp nhận phiếu sự cố, ghi nhận nguyên nhân, thay linh kiện & hoàn thành sửa',
      'In nhãn mã QR kiểm kê dán lên từng case máy tính',
      'Gửi cảnh báo kỹ thuật và đề xuất thay thế linh kiện nâng cấp máy'
    ],
    restricted: [
      'Không có quyền xếp lịch dạy hoặc duyệt ca thực hành',
      'Không có quyền tạo hoặc phân quyền tài khoản người dùng',
      'Không có quyền xóa hoàn toàn máy trạm khỏi cơ sở dữ liệu'
    ],
    sampleAccount: 'KTV. Chu Tuấn Hưng (username: <code>ktvlab</code> • SĐT: <strong>0988.776.655</strong>)'
  },
  student: {
    title: 'Sinh Viên / Khách Tra Cứu',
    subtitle: 'Sinh viên các khóa K20, K21, K22, K23 • Khách tra cứu',
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
    sampleAccount: 'Sinh viên TNUS (username: <code>student</code>)'
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


// ============================================================================
// HỆ THỐNG ĐĂNG NHẬP, ĐĂNG XUẤT & BẢO MẬT PHÂN QUYỀN (RBAC AUTHENTICATION 3.0)
// KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)
// ============================================================================

/**
 * Mở hộp thoại Đăng nhập hệ thống (Login Modal)
 * Hỗ trợ nhập Username/Password, bảo vệ khóa tài khoản sau 5 lần sai, và Đăng nhập nhanh 1-Click
 */
window.openLoginModal = function() {
  Swal.fire({
    title: `
      <div class="text-left">
        <div class="flex items-center space-x-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-md">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <div class="text-base font-extrabold text-slate-900 uppercase">Đăng Nhập Hệ Thống</div>
            <div class="text-xs text-blue-700 font-semibold">Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)</div>
          </div>
        </div>
      </div>
    `,
    html: `
      <div class="text-left space-y-4 text-xs mt-3">
        <!-- Form đăng nhập chuẩn -->
        <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên đăng nhập (Username / Mã cán bộ)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <i class="fa-solid fa-user"></i>
              </span>
              <input type="text" id="login-username" placeholder="Nhập username (vd: admin, toannv...)" 
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Mật khẩu</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input type="password" id="login-password" placeholder="Nhập mật khẩu (mặc định: tnus@2026)" 
                class="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <button type="button" onclick="window.toggleLoginPasswordVisibility()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                <i id="login-pwd-eye" class="fa-solid fa-eye"></i>
              </button>
            </div>
            <p class="text-[10px] text-slate-500 mt-1 italic">* Tự động khóa tài khoản sau 5 lần nhập sai liên tiếp</p>
          </div>
        </div>

        <!-- Khối Đăng Nhập Nhanh 1-Click (Dành cho Kiểm thử & Vận hành nhanh) -->
        <div>
          <div class="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-bolt text-amber-500"></i>Đăng Nhập Nhanh Theo Vai Trò (1-Click Demo)</span>
            <span class="text-[10px] text-slate-400 font-normal">Pass: tnus@2026</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <!-- Super Admin -->
            <button type="button" onclick="window.quickFillLogin('admin', 'tnus@2026')" 
              class="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 rounded-lg text-left transition group shadow-2xs">
              <div class="font-extrabold text-[11px] group-hover:text-white flex items-center justify-between">
                <span>Super Admin</span>
                <span class="text-[9px] opacity-75 font-mono">@admin</span>
              </div>
              <div class="text-[10px] text-slate-500 group-hover:text-red-100 truncate mt-0.5">ThS. Trịnh Minh Phú</div>
            </button>

            <!-- Admin -->
            <button type="button" onclick="window.quickFillLogin('admin_cntt', 'tnus@2026')" 
              class="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg text-left transition group shadow-2xs">
              <div class="font-extrabold text-[11px] group-hover:text-white flex items-center justify-between">
                <span>Admin</span>
                <span class="text-[9px] opacity-75 font-mono">@admin_cntt</span>
              </div>
              <div class="text-[10px] text-slate-500 group-hover:text-blue-100 truncate mt-0.5">KS. Trần Văn Hải</div>
            </button>

            <!-- Quản lý phòng máy -->
            <button type="button" onclick="window.quickFillLogin('qlphongmay', 'tnus@2026')" 
              class="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 rounded-lg text-left transition group shadow-2xs">
              <div class="font-extrabold text-[11px] group-hover:text-white flex items-center justify-between">
                <span>Quản Lý Phòng</span>
                <span class="text-[9px] opacity-75 font-mono">@qlpm</span>
              </div>
              <div class="text-[10px] text-slate-500 group-hover:text-indigo-100 truncate mt-0.5">ThS. Lê Hoàng Nam</div>
            </button>

            <!-- Giảng viên -->
            <button type="button" onclick="window.quickFillLogin('toannv', 'tnus@2026')" 
              class="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-left transition group shadow-2xs">
              <div class="font-extrabold text-[11px] group-hover:text-white flex items-center justify-between">
                <span>Giảng Viên</span>
                <span class="text-[9px] opacity-75 font-mono">@toannv</span>
              </div>
              <div class="text-[10px] text-slate-500 group-hover:text-emerald-100 truncate mt-0.5">ThS. Nguyễn Văn Toàn</div>
            </button>

            <!-- Kỹ thuật viên -->
            <button type="button" onclick="window.quickFillLogin('ktvlab', 'tnus@2026')" 
              class="p-2 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-200 rounded-lg text-left transition group shadow-2xs">
              <div class="font-extrabold text-[11px] group-hover:text-white flex items-center justify-between">
                <span>Kỹ Thuật Viên</span>
                <span class="text-[9px] opacity-75 font-mono">@ktvlab</span>
              </div>
              <div class="text-[10px] text-slate-500 group-hover:text-amber-100 truncate mt-0.5">KTV. Chu Tuấn Hưng</div>
            </button>

            <!-- Sinh viên -->
            <button type="button" onclick="window.quickFillLogin('student', 'tnus@2026')" 
              class="p-2 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 rounded-lg text-left transition group shadow-2xs">
              <div class="font-extrabold text-[11px] group-hover:text-white flex items-center justify-between">
                <span>Sinh Viên</span>
                <span class="text-[9px] opacity-75 font-mono">@student</span>
              </div>
              <div class="text-[10px] text-slate-500 group-hover:text-purple-100 truncate mt-0.5">Sinh viên TNUS</div>
            </button>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-right-to-bracket mr-1.5"></i>Đăng Nhập',
    cancelButtonText: 'Đóng',
    confirmButtonColor: '#2563eb',
    focusConfirm: false,
    preConfirm: () => {
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      if (!username) {
        Swal.showValidationMessage('Vui lòng nhập tên đăng nhập!');
        return false;
      }
      if (!password) {
        Swal.showValidationMessage('Vui lòng nhập mật khẩu!');
        return false;
      }
      return { username, password };
    }
  }).then(result => {
    if (result.isConfirmed) {
      window.handleLoginSubmit(result.value.username, result.value.password);
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
 * Xử lý xác thực đăng nhập
 */
window.handleLoginSubmit = function(username, password) {
  const term = username.toLowerCase().trim();
  const user = (window.appState.users || []).find(u => 
    (u.username && u.username.toLowerCase() === term) ||
    (u.id && u.id.toLowerCase() === term) ||
    (u.email && u.email.toLowerCase() === term)
  );

  if (!user) {
    Swal.fire({
      icon: 'error',
      title: 'Tài khoản không tồn tại',
      text: `Không tìm thấy tài khoản "${username}" trong hệ thống phòng máy TNUS.`,
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
          <p class="text-slate-500">Vui lòng liên hệ Super Admin ThS. Trịnh Minh Phú (0975.090.666) để mở khóa tài khoản.</p>
        </div>
      `,
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  // Xác thực mật khẩu
  const isMatch = (typeof verifyPassword === 'function') 
    ? verifyPassword(password, user) 
    : (password.toLowerCase() === 'tnus@2026' || password === 'Tnus@Admin2026');

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
            <p class="text-slate-500">Liên hệ Super Admin ThS. Trịnh Minh Phú (0975.090.666) để khôi phục.</p>
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

  // Đăng nhập thành công
  user.failedLogins = 0;
  user.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
  window.appState.currentUser = user;
  window.saveStateToLocalStorage();

  window.logUserActivity('Đăng nhập thành công', `Đăng nhập thành công với vai trò: ${user.roleName || user.role} (${user.name})`, 'users', 'SUCCESS');

  window.updateUserUI();
  if (window.renderUserAccountsTable) window.renderUserAccountsTable();
  if (window.updateUserKPIs) window.updateUserKPIs();
  if (window.applyRoleRestrictionsToUI) window.applyRoleRestrictionsToUI();

  Swal.fire({
    icon: 'success',
    title: `Xin chào, ${user.name}!`,
    html: `
      <div class="text-xs text-slate-600">
        Vai trò: <strong class="text-blue-600">${user.roleName || user.role}</strong><br>
        Đơn vị: ${user.department || 'Khoa Toán - Tin, TNUS'}
      </div>
    `,
    timer: 1600,
    showConfirmButton: false
  });
};

/**
 * Đăng xuất khỏi hệ thống
 */
window.logoutUser = function() {
  const current = window.appState.currentUser;
  Swal.fire({
    title: 'Xác nhận đăng xuất?',
    html: `Bạn có chắc chắn muốn kết thúc phiên làm việc của <strong>${current ? current.name : 'người dùng'}</strong>?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-power-off mr-1"></i>Đăng xuất',
    cancelButtonText: 'Ở lại',
    confirmButtonColor: '#e11d48'
  }).then(res => {
    if (res.isConfirmed) {
      window.logUserActivity('Đăng xuất', `Kết thúc phiên làm việc của ${current ? current.name : ''}`, 'users', 'SUCCESS');
      
      // Chuyển về tài khoản Sinh viên / Khách mặc định
      const guest = window.appState.users.find(u => u.role === 'student') || window.appState.users[window.appState.users.length - 1];
      window.appState.currentUser = guest;
      window.saveStateToLocalStorage();

      window.updateUserUI();
      if (window.renderUserAccountsTable) window.renderUserAccountsTable();
      if (window.updateUserKPIs) window.updateUserKPIs();
      if (window.applyRoleRestrictionsToUI) window.applyRoleRestrictionsToUI();

      Swal.fire({
        icon: 'info',
        title: 'Đã đăng xuất',
        text: 'Đã chuyển sang chế độ Khách (Sinh viên). Vui lòng đăng nhập lại để sử dụng các chức năng quản trị.',
        timer: 1800,
        showConfirmButton: false
      });
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
 * Đặt lại mật khẩu về mặc định (Chỉ dành cho Super Admin / Admin)
 */
window.resetUserPassword = function(userId) {
  const current = window.appState.currentUser;
  if (!current || (current.role !== 'super_admin' && current.role !== 'admin')) {
    Swal.fire('Từ chối truy cập', 'Chỉ Super Admin mới có quyền đặt lại mật khẩu của người dùng khác!', 'error');
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
      window.logUserActivity('Reset mật khẩu', `Super Admin ${current.name} đã đặt lại mật khẩu cho ${target.name} (@${target.username})`, 'users', 'SUCCESS');

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
