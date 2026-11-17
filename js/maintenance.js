/**
 * MAINTENANCE MODULE - QUẢN LÝ BẢO TRÌ & XỬ LÝ SỰ CỐ THIẾT BỊ CNTT
 * Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)
 * Hệ thống quản lý bảo dưỡng chuẩn ITIL / Enterprise IT: Tiếp nhận báo hỏng,
 * Phân công kỹ thuật viên, Quản lý vật tư linh kiện thay thế,
 * Nghiệm thu và tự động đồng bộ trạng thái máy tính (Good / Warning / Broken),
 * In Phiếu yêu cầu & Biên bản sửa chữa, Xuất & Nhập Excel báo cáo.
 */

class MaintenanceManager {
  constructor() {
    this.container = document.getElementById('maintenance-module-container');
    this.statusFilter = 'all';    // all, pending, in_progress, completed
    this.priorityFilter = 'all';  // all, critical, high, low
    this.labFilter = 'all';       // all, PM1, PM2, PM3, PM4
    this.searchQuery = '';
    this.currentPage = 1;
    this.pageSize = 15;
  }

  init() {
    this.renderView();
    this.bindEvents();
  }

  // Khởi tạo khung giao diện chính Phân hệ Bảo trì & Sự cố
  renderView() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="space-y-4">
        <!-- 1. THANH TỔNG QUAN CHỈ SỐ BẢO TRÌ & SỰ CỐ (MAINTENANCE KPI CARDS) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng Số Sự Cố Ghi Nhận</div>
            <div class="text-xl font-black text-slate-800 mt-0.5">
              <span id="maint-kpi-total">0</span> <span class="text-xs font-semibold text-slate-500">phiếu</span>
            </div>
            <div class="text-[10px] text-blue-600 font-medium mt-1">4 phòng máy Tầng 5, Nhà A1</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
            <div class="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Chờ Tiếp Nhận (Pending)</div>
            <div class="text-xl font-black text-rose-600 mt-0.5">
              <span id="maint-count-pending">0</span> <span class="text-xs font-semibold text-slate-500">phiếu</span>
            </div>
            <div class="text-[10px] text-rose-600 font-medium mt-1">Cần phân công kỹ thuật viên</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
            <div class="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Đang Sửa Chữa (In Progress)</div>
            <div class="text-xl font-black text-amber-600 mt-0.5">
              <span id="maint-count-inprogress">0</span> <span class="text-xs font-semibold text-slate-500">máy</span>
            </div>
            <div class="text-[10px] text-amber-700 font-medium mt-1">Đang thay thế, khắc phục</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
            <div class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Đã Khắc Phục (Completed)</div>
            <div class="text-xl font-black text-emerald-600 mt-0.5">
              <span id="maint-count-completed">0</span> <span class="text-xs font-semibold text-slate-500">phiếu</span>
            </div>
            <div class="text-[10px] text-emerald-700 font-medium mt-1">Đã test nghiệm thu hoàn tất</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tỷ Lệ Xử Lý Thành Công</div>
            <div class="text-xl font-black text-cyan-600 mt-0.5">
              <span id="maint-kpi-rate">100%</span>
            </div>
            <div class="text-[10px] text-cyan-700 font-medium mt-1">Chỉ số cam kết dịch vụ (SLA)</div>
          </div>
        </div>

        <!-- 2. THANH CÔNG CỤ TÌM KIẾM, BỘ LỌC & NÚT THAO TÁC -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-800 flex items-center">
                <i class="fa-solid fa-wrench text-amber-500 mr-2"></i>Quản Lý Bảo Trì & Xử Lý Sự Cố Phòng Máy
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Khoa Toán - Tin • Hệ thống tiếp nhận báo hỏng và phân công sửa chữa • Phụ trách: <strong>ThS. Trịnh Minh Phú (0975.090.666)</strong>
              </p>
            </div>

            <!-- Các nút hành động chính -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Nhập Excel -->
              <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer">
                <i class="fa-solid fa-file-import text-blue-600"></i>
                <span>Nhập Excel</span>
                <input type="file" id="input-import-maint" accept=".xlsx, .xls, .csv" class="hidden">
              </label>

              <!-- Xuất Excel -->
              <button id="btn-export-maint" onclick="window.maintenanceManager.exportMaintenanceToExcel()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs">
                <i class="fa-solid fa-file-excel"></i>
                <span>Xuất Báo Cáo Excel</span>
              </button>

              <!-- Nút tạo phiếu báo hỏng -->
              <button id="btn-create-incident" onclick="window.maintenanceManager.showCreateIncidentModal()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Lập Phiếu Báo Hỏng</span>
              </button>
            </div>
          </div>

          <!-- Bộ lọc chi tiết -->
          <div class="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
            <!-- Lọc trạng thái phiếu -->
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">Tiến độ:</span>
              <select id="maint-status-filter" class="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium">
                <option value="all">Tất cả tiến độ</option>
                <option value="pending">⏳ Chờ xử lý (Pending)</option>
                <option value="in_progress">⚙️ Đang sửa chữa (In Progress)</option>
                <option value="completed">✅ Đã hoàn thành (Done)</option>
              </select>
            </div>

            <!-- Lọc theo phòng máy -->
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">Phòng:</span>
              <select id="maint-lab-filter" class="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium">
                <option value="all">Tất cả phòng (4 phòng)</option>
                <option value="PM1">PM 1 (A1-503)</option>
                <option value="PM2">PM2 (A1-504)</option>
                <option value="PM3">PM3 (A1-505)</option>
                <option value="PM4">PM4 (A1-506)</option>
              </select>
            </div>

            <!-- Lọc theo mức độ ưu tiên -->
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">Mức độ:</span>
              <select id="maint-priority-filter" class="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium">
                <option value="all">Tất cả mức độ</option>
                <option value="critical">🔴 Khẩn cấp (Critical)</option>
                <option value="high">🟡 Mức độ cao (High)</option>
                <option value="low">⚪ Bình thường (Low)</option>
              </select>
            </div>

            <!-- Ô tìm kiếm thông minh -->
            <div class="relative w-48 sm:w-60 ml-auto">
              <i class="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input type="text" id="maint-search-input" placeholder="Tìm mã phiếu, mã máy, tiêu đề lỗi..." class="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
          </div>
        </div>

        <!-- 3. BẢNG DANH SÁCH PHIẾU BẢO TRÌ & SỰ CỐ -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-3">Mã phiếu</th>
                  <th class="py-3 px-3">Thiết bị & Phòng</th>
                  <th class="py-3 px-3 text-center">Mức độ</th>
                  <th class="py-3 px-3">Hiện tượng & Triệu chứng sự cố</th>
                  <th class="py-3 px-3">Người báo hỏng</th>
                  <th class="py-3 px-3">KTV Phụ trách</th>
                  <th class="py-3 px-3 text-center">Tiến độ</th>
                  <th class="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody id="maint-table-body" class="divide-y divide-slate-100 text-slate-700">
                <!-- Nạp qua loadMaintenanceTable() -->
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div id="maint-count-info">Hiển thị 0/0 phiếu sự cố</div>
            <div id="maint-pagination" class="flex items-center space-x-1">
              <!-- Nút số trang -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadMaintenanceTable();
  }

  // Gán sự kiện cho các điều khiển
  bindEvents() {
    const statusFilter = document.getElementById('maint-status-filter');
    const labFilter = document.getElementById('maint-lab-filter');
    const priorityFilter = document.getElementById('maint-priority-filter');
    const searchInput = document.getElementById('maint-search-input');
    const importInput = document.getElementById('input-import-maint');

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.currentPage = 1;
        this.loadMaintenanceTable();
      });
    }

    if (labFilter) {
      labFilter.addEventListener('change', (e) => {
        this.labFilter = e.target.value;
        this.currentPage = 1;
        this.loadMaintenanceTable();
      });
    }

    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.priorityFilter = e.target.value;
        this.currentPage = 1;
        this.loadMaintenanceTable();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toUpperCase();
        this.currentPage = 1;
        this.loadMaintenanceTable();
      });
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        this.handleExcelImport(e);
      });
    }
  }

  // Lọc danh sách sự cố theo các tiêu chí kết hợp
  getFilteredIncidents() {
    let list = [...(window.appState.maintenance || [])];

    if (this.statusFilter !== 'all') {
      list = list.filter(m => m.status === this.statusFilter);
    }

    if (this.labFilter !== 'all') {
      list = list.filter(m => m.labId === this.labFilter);
    }

    if (this.priorityFilter !== 'all') {
      list = list.filter(m => m.priority === this.priorityFilter);
    }

    if (this.searchQuery) {
      const q = this.searchQuery;
      list = list.filter(m => 
        (m.id && m.id.toUpperCase().includes(q)) ||
        (m.computerId && m.computerId.toUpperCase().includes(q)) ||
        (m.labId && m.labId.toUpperCase().includes(q)) ||
        (m.title && m.title.toUpperCase().includes(q)) ||
        (m.description && m.description.toUpperCase().includes(q)) ||
        (m.reportedBy && m.reportedBy.toUpperCase().includes(q)) ||
        (m.assignedTo && m.assignedTo.toUpperCase().includes(q))
      );
    }

    return list;
  }

  // Nạp bảng danh sách sự cố và cập nhật chỉ số KPI
  loadMaintenanceTable() {
    const tbody = document.getElementById('maint-table-body');
    if (!tbody) return;

    const all = window.appState.maintenance || [];
    const pendingCount = all.filter(m => m.status === 'pending').length;
    const inProgressCount = all.filter(m => m.status === 'in_progress').length;
    const completedCount = all.filter(m => m.status === 'completed').length;
    const totalCount = all.length;
    const rate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 100;

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('maint-kpi-total', totalCount);
    setEl('maint-count-pending', pendingCount);
    setEl('maint-count-inprogress', inProgressCount);
    setEl('maint-count-completed', completedCount);
    setEl('maint-kpi-rate', `${rate}%`);

    const list = this.getFilteredIncidents();
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageItems = list.slice(startIndex, startIndex + this.pageSize);

    const countInfo = document.getElementById('maint-count-info');
    if (countInfo) {
      countInfo.textContent = `Hiển thị ${pageItems.length}/${totalItems} phiếu sự cố (Tổng ${totalCount} phiếu)`;
    }

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="py-12 text-center text-slate-400">
            <i class="fa-regular fa-clipboard-check text-3xl mb-2 block text-slate-300"></i>
            <span class="text-sm font-semibold">Không tìm thấy phiếu sự cố nào phù hợp với bộ lọc.</span>
            <p class="text-xs text-slate-400 mt-1">Thử thay đổi tiêu chí lọc trạng thái, phòng máy hoặc từ khóa tìm kiếm.</p>
          </td>
        </tr>
      `;
      this.renderPagination(totalPages);
      return;
    }

    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };

    const curUser = window.appState?.currentUser;
    const curRole = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const canUpdateStatus = (curRole === 'admin' || curRole === 'lab_manager' || curRole === 'lab_staff');
    const canDeleteTicket = (curRole === 'admin' || curRole === 'lab_manager');

    tbody.innerHTML = pageItems.map(item => {
      let priorityBadge = '';
      if (item.priority === 'critical') {
        priorityBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs"><span class="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block mr-1"></span>Khẩn cấp</span>`;
      } else if (item.priority === 'high') {
        priorityBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs"><span class="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block mr-1"></span>Mức cao</span>`;
      } else {
        priorityBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Bình thường</span>`;
      }

      let statusBadge = '';
      if (item.status === 'pending') {
        statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700"><span class="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>Chờ xử lý</span>`;
      } else if (item.status === 'in_progress') {
        statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700"><span class="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 animate-pulse"></span>Đang sửa</span>`;
      } else {
        statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>Đã hoàn tất</span>`;
      }

      return `
        <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.maintenanceManager.showIncidentDetailModal('${item.id}')">
          <td class="py-3 px-3 font-mono font-bold text-blue-600">${item.id}</td>
          <td class="py-3 px-3 font-mono font-bold">
            <div class="flex items-center space-x-1.5">
              <span onclick="event.stopPropagation(); window.locateComputerOn2D('${item.computerId}')" 
                class="text-blue-700 hover:text-blue-900 hover:underline cursor-pointer flex items-center gap-1" title="Định vị máy ${item.computerId} trên Sơ đồ 2D">
                ${item.computerId} <i class="fa-solid fa-map-location-dot text-[10px] text-teal-600"></i>
              </span>
              <span onclick="event.stopPropagation(); window.navigateToLab('${item.labId}')" 
                class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 hover:bg-blue-100 border border-slate-200 text-slate-600 hover:text-blue-700 font-sans cursor-pointer transition" title="Mở sơ đồ phòng ${item.labId}">
                ${labNames[item.labId] || item.labId}
              </span>
            </div>
            <div class="text-[10px] text-slate-400 font-sans font-normal mt-0.5">Tầng 5, Nhà A1</div>
          </td>
          <td class="py-3 px-3 text-center">${priorityBadge}</td>
          <td class="py-3 px-3 max-w-xs">
            <div class="font-bold text-slate-800 leading-snug line-clamp-1">${item.title}</div>
            <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title="${item.description}">${item.description}</div>
            ${item.solution ? `<div class="text-[10px] text-emerald-700 font-semibold mt-0.5 line-clamp-1"><i class="fa-solid fa-check mr-1 text-emerald-600"></i>${item.solution}</div>` : ''}
          </td>
          <td class="py-3 px-3">
            <div class="font-medium text-slate-800"><i class="fa-solid fa-user-pen text-slate-400 mr-1 text-[10px]"></i>${item.reportedBy}</div>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">${item.reportDate}</div>
          </td>
          <td class="py-3 px-3 font-medium text-slate-700">
            <div class="flex items-center"><i class="fa-solid fa-screwdriver-wrench text-amber-500 mr-1.5 text-[10px]"></i>${item.assignedTo || 'Chưa phân công'}</div>
            ${item.sparePart ? `<div class="text-[10px] text-indigo-600 mt-0.5 font-sans"><i class="fa-solid fa-microchip mr-1"></i>${item.sparePart}</div>` : ''}
          </td>
          <td class="py-3 px-3 text-center">${statusBadge}</td>
          <td class="py-3 px-3 text-right space-x-1" onclick="event.stopPropagation()">
            <button onclick="window.maintenanceManager.showIncidentDetailModal('${item.id}')" 
              class="p-1.5 text-blue-600 hover:bg-blue-100/70 rounded transition" title="Xem chi tiết">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button onclick="window.locateComputerOn2D('${item.computerId}')" 
              class="p-1.5 text-teal-600 hover:bg-teal-100/70 rounded transition" title="Định vị máy trên sơ đồ 2D">
              <i class="fa-solid fa-map-location-dot"></i>
            </button>
            ${canUpdateStatus ? `
            <button onclick="window.maintenanceManager.updateIncidentStatus('${item.id}')" 
              class="p-1.5 text-amber-600 hover:bg-amber-100/70 rounded transition" title="Cập nhật tiến độ & Nghiệm thu">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>` : ''}
            <button onclick="window.maintenanceManager.printMaintenanceTicket('${item.id}')" 
              class="p-1.5 text-purple-600 hover:bg-purple-100/70 rounded transition" title="In phiếu sửa chữa">
              <i class="fa-solid fa-print"></i>
            </button>
            ${canDeleteTicket ? `
            <button onclick="window.maintenanceManager.deleteIncident('${item.id}')" 
              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Hủy phiếu">
              <i class="fa-regular fa-trash-can"></i>
            </button>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    this.renderPagination(totalPages);
  }

  // Render nút phân trang
  renderPagination(totalPages) {
    const container = document.getElementById('maint-pagination');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button onclick="window.maintenanceManager.changePage(${i})" class="px-2.5 py-1 text-xs rounded border ${i === this.currentPage ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
          ${i}
        </button>
      `;
    }
    container.innerHTML = html;
  }

  changePage(page) {
    this.currentPage = page;
    this.loadMaintenanceTable();
  }

  // =========================================================================
  // CHI TIẾT SỰ CỐ (INCIDENT DETAIL MODAL)
  // =========================================================================
  showIncidentDetailModal(incidentId) {
    const item = window.appState.maintenance.find(m => m.id === incidentId);
    if (!item) return;

    const comp = window.appState.computers.find(c => c.id === item.computerId);
    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };

    let statusHtml = '';
    if (item.status === 'pending') {
      statusHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">⏳ Chờ xử lý</span>`;
    } else if (item.status === 'in_progress') {
      statusHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">⚙️ Đang xử lý</span>`;
    } else {
      statusHtml = `<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✅ Đã hoàn tất & Nghiệm thu OK</span>`;
    }

    Swal.fire({
      title: `
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-base">
            <i class="fa-solid fa-wrench"></i>
          </div>
          <div>
            <div class="text-base font-bold text-slate-900">Chi Tiết Sự Cố ${item.id}</div>
            <div class="text-xs text-slate-500 font-normal">Thiết bị: ${item.computerId} • ${labNames[item.labId] || item.labId}</div>
          </div>
        </div>
      `,
      html: `
        <div class="text-left space-y-3.5 text-xs pt-1">
          <!-- Trạng thái & Mức độ -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tiến độ khắc phục</div>
              <div class="mt-1">${statusHtml}</div>
            </div>
            <div class="text-right">
              <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mức độ ưu tiên</div>
              <div class="mt-1 font-bold text-sm ${item.priority === 'critical' ? 'text-rose-600' : (item.priority === 'high' ? 'text-amber-600' : 'text-slate-700')}">
                ${item.priority === 'critical' ? '🔴 Khẩn cấp' : (item.priority === 'high' ? '🟡 Mức cao' : '⚪ Bình thường')}
              </div>
            </div>
          </div>

          <!-- Thông tin thiết bị -->
          <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
            <div class="text-[10px] text-blue-700 font-bold uppercase mb-1">Thông Tin Máy Tính Gặp Sự Cố</div>
            <div class="grid grid-cols-2 gap-2 text-slate-800">
              <div>Mã máy: <strong class="font-mono text-blue-800">${item.computerId}</strong></div>
              <div>Phòng máy: <strong>${labNames[item.labId] || item.labId}</strong> (Tầng 5, A1)</div>
              <div>Hãng / Model: ${comp ? comp.brand + ' - ' + comp.model : 'Máy đồng bộ'}</div>
              <div>Cấu hình: ${comp ? comp.cpu + ', ' + comp.ram : 'Core i5, 8GB/16GB'}</div>
              <div>Địa chỉ IP: <span class="font-mono text-blue-700">${comp ? comp.ipAddress : '192.168.1.x'}</span></div>
              <div>Vị trí: Hàng ${comp?.position?.row || 1}, Cột ${comp?.position?.col || 1}</div>
            </div>
          </div>

          <!-- Nội dung sự cố -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div>
              <div class="font-bold text-slate-800 text-sm flex items-center">
                <i class="fa-solid fa-triangle-exclamation text-rose-500 mr-1.5"></i>${item.title}
              </div>
              <div class="text-slate-600 mt-1">${item.description}</div>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-500">
              <div>Người báo hỏng: <strong class="text-slate-800">${item.reportedBy}</strong></div>
              <div>Ngày lập phiếu: <span class="font-mono">${item.reportDate}</span></div>
            </div>
          </div>

          <!-- Xử lý kỹ thuật & Phụ tùng thay thế -->
          <div class="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1.5">
            <div class="text-[10px] text-emerald-800 font-bold uppercase flex items-center">
              <i class="fa-solid fa-clipboard-check mr-1.5 text-emerald-600"></i>Giải Pháp Khắc Phục & Nghiệm Thu
            </div>
            <div class="text-slate-700">
              <strong>KTV phụ trách:</strong> ${item.assignedTo || 'Tổ Kỹ thuật Phòng máy TNUS'}
            </div>
            ${item.sparePart ? `<div class="text-indigo-800"><strong>Linh kiện thay thế:</strong> ${item.sparePart}</div>` : ''}
            <div>
              <strong>Giải pháp:</strong> ${item.solution || '<span class="text-slate-400 italic">Chưa cập nhật nội dung xử lý</span>'}
            </div>
            ${item.cost ? `<div class="text-amber-800"><strong>Chi phí linh kiện:</strong> ${item.cost} VNĐ</div>` : ''}
          </div>

          <!-- Liên kết đồng bộ sang Sơ đồ 2D & Quản lý thiết bị -->
          <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <div class="flex items-center space-x-2">
              <button type="button" onclick="Swal.close(); window.locateComputerOn2D('${item.computerId}')" 
                class="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
                <i class="fa-solid fa-map-location-dot text-teal-600"></i>Định vị trên sơ đồ 2D
              </button>
              <button type="button" onclick="Swal.close(); window.openComputerDetailModal('${item.computerId}')" 
                class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs">
                <i class="fa-solid fa-circle-info text-slate-500"></i>Xem hồ sơ máy
              </button>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">TNUS Lab System</span>
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-pen-to-square mr-1.5"></i>Cập Nhật Tiến Độ',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#2563eb'
    }).then(res => {
      if (res.isConfirmed) {
        this.updateIncidentStatus(item.id);
      }
    });
  }

  // =========================================================================
  // LẬP PHIẾU BÁO HỎNG MỚI (CREATE INCIDENT TICKET)
  // =========================================================================
  showCreateIncidentModal(prefilledCompId = null) {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('create_ticket', 'Lập phiếu báo hỏng thiết bị')) return;
    const computersOptions = window.appState.computers.map(c => 
      `<option value="${c.id}" ${prefilledCompId === c.id ? 'selected' : ''}>${c.id} - ${c.name} (${c.labId} • ${c.brand})</option>`
    ).join('');

    const defaultReporter = window.appState.currentUser?.name || 'ThS. Trịnh Minh Phú';

    Swal.fire({
      title: `
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-base">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <div class="text-base font-bold text-slate-900">Lập Phiếu Báo Hỏng Thiết Bị</div>
            <div class="text-xs text-slate-500 font-normal">Ghi nhận sự cố và thông báo Tổ Kỹ thuật xử lý</div>
          </div>
        </div>
      `,
      html: `
        <form id="form-create-incident" class="text-left space-y-3 text-xs max-h-[72vh] overflow-y-auto pr-1 pt-1">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Thiết bị gặp sự cố *</label>
            <select id="modal-inc-comp" class="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-blue-700 focus:ring-1 focus:ring-blue-500">
              ${computersOptions}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên *</label>
              <select id="modal-inc-priority" class="w-full p-2 bg-white border border-slate-300 rounded font-bold">
                <option value="high">🟡 Mức cao (Ảnh hưởng trực tiếp ca học)</option>
                <option value="critical">🔴 Khẩn cấp (Cháy nổ, hỏng nguồn, nguy hiểm)</option>
                <option value="low">⚪ Bình thường (Chuột, phím, dây mạng lỏng)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Người lập phiếu *</label>
              <input type="text" id="modal-inc-reporter" value="${defaultReporter}" class="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-slate-800">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Hiện tượng / Tiêu đề sự cố *</label>
            <input type="text" id="modal-inc-title" placeholder="VD: Màn hình không lên nguồn, máy tính tự tắt sau 5 phút..." class="w-full p-2 bg-white border border-slate-300 rounded font-bold text-slate-900">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Mô tả chi tiết triệu chứng & Dấu hiệu nhận biết *</label>
            <textarea id="modal-inc-desc" rows="3" placeholder="Mô tả cụ thể thời điểm phát sinh lỗi, đèn nguồn chớp đỏ, quạt phát tiếng kêu..." class="w-full p-2 bg-white border border-slate-300 rounded"></textarea>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Phân công kỹ thuật viên phụ trách ban đầu</label>
            <input type="text" id="modal-inc-assigned" value="Tổ Kỹ thuật Phòng máy TNUS" class="w-full p-2 bg-white border border-slate-300 rounded font-medium text-slate-700">
          </div>
        </form>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-paper-plane mr-1.5"></i>Gửi Phiếu Báo Hỏng',
      confirmButtonColor: '#e11d48',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const compId = document.getElementById('modal-inc-comp').value;
        const priority = document.getElementById('modal-inc-priority').value;
        const reporter = document.getElementById('modal-inc-reporter').value.trim();
        const title = document.getElementById('modal-inc-title').value.trim();
        const desc = document.getElementById('modal-inc-desc').value.trim();
        const assignedTo = document.getElementById('modal-inc-assigned').value.trim() || 'Tổ Kỹ thuật Phòng máy';

        if (!title || !desc || !reporter) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ tiêu đề lỗi, mô tả chi tiết và người lập phiếu!');
          return false;
        }

        const comp = window.appState.computers.find(c => c.id === compId);
        const newId = `INC-${new Date().getFullYear()}-${String(window.appState.maintenance.length + 1).padStart(3, '0')}`;

        return {
          id: newId,
          computerId: compId,
          labId: comp ? comp.labId : 'PM1',
          reportedBy: reporter,
          reportDate: new Date().toISOString().split('T')[0],
          priority,
          title,
          description: desc,
          status: 'pending',
          assignedTo,
          solution: '',
          sparePart: '',
          cost: ''
        };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        window.appState.maintenance.unshift(res.value);

        // Tự động đồng bộ trạng thái máy tính sang 'broken' hoặc 'warning'
        const comp = window.appState.computers.find(c => c.id === res.value.computerId);
        if (comp) {
          comp.status = res.value.priority === 'low' ? 'warning' : 'broken';
          comp.issue = res.value.title;
          if (comp.status === 'broken') comp.powerState = 'off';

          if (!comp.history) comp.history = [];
          comp.history.unshift({
            date: res.value.reportDate,
            action: `Ghi nhận sự cố: ${res.value.title}`,
            technician: res.value.reportedBy,
            note: res.value.description
          });
        }

        window.saveStateToLocalStorage();
        this.loadMaintenanceTable();
        if (window.labSimulation) {
          window.labSimulation.loadLab(window.labSimulation.currentLabId);
        }
        if (typeof window.updateDashboardKPIs === 'function') {
          window.updateDashboardKPIs();
        }

        Swal.fire({
          icon: 'success',
          title: 'Đã lập phiếu sự cố thành công!',
          html: `
            <div class="text-left text-xs space-y-1.5 pt-1">
              <p>Mã phiếu: <strong>${res.value.id}</strong></p>
              <p>Thiết bị: <strong class="text-blue-700">${res.value.computerId}</strong> (Phòng ${res.value.labId})</p>
              <p class="text-slate-500">Đã cập nhật trạng thái thiết bị sang <strong>${comp.status === 'broken' ? 'Đang hỏng' : 'Cần kiểm tra'}</strong>.</p>
            </div>
          `,
          timer: 2200,
          showConfirmButton: false
        });
      }
    });
  }

  // =========================================================================
  // CẬP NHẬT TIẾN ĐỘ & NGHIỆM THU HOÀN TẤT (UPDATE INCIDENT STATUS)
  // =========================================================================
  updateIncidentStatus(incidentId) {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('resolve_ticket', 'Cập nhật tiến độ xử lý / Hoàn tất sửa chữa')) return;
    const item = window.appState.maintenance.find(m => m.id === incidentId);
    if (!item) return;

    Swal.fire({
      title: `
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
            <i class="fa-solid fa-clipboard-check"></i>
          </div>
          <div>
            <div class="text-base font-bold text-slate-900">Cập Nhật Tiến Độ Phiếu ${item.id}</div>
            <div class="text-xs text-slate-500 font-normal">Thiết bị: ${item.computerId} • ${item.title}</div>
          </div>
        </div>
      `,
      html: `
        <form id="form-update-incident" class="text-left space-y-3 text-xs max-h-[72vh] overflow-y-auto pr-1 pt-1">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tiến độ xử lý hiện tại *</label>
            <select id="modal-update-status" class="w-full p-2 bg-white border border-slate-300 rounded font-bold text-slate-800">
              <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>⏳ Chờ xử lý (Pending)</option>
              <option value="in_progress" ${item.status === 'in_progress' ? 'selected' : ''}>⚙️ Đang sửa chữa / Thay thế linh kiện (In Progress)</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>✅ Đã sửa chữa hoàn tất & Nghiệm thu OK (Done)</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Kỹ thuật viên thực hiện *</label>
              <input type="text" id="modal-update-tech" value="${item.assignedTo || (window.appState.currentUser?.name || 'KTV. Chu Tuấn Hưng')}" class="w-full p-2 bg-white border border-slate-300 rounded font-semibold">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Linh kiện thay thế (nếu có)</label>
              <input type="text" id="modal-update-spare" value="${item.sparePart || ''}" placeholder="VD: Nguồn Huntkey 400W, RAM 8GB DDR4..." class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nội dung khắc phục kỹ thuật & Giải pháp *</label>
            <textarea id="modal-update-solution" rows="3" placeholder="Ghi chú chi tiết: Đã vệ sinh quạt, thay keo tản nhiệt, tra lại cáp mạng, test Windows đạt chuẩn..." class="w-full p-2 bg-white border border-slate-300 rounded">${item.solution || ''}</textarea>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Chi phí vật tư / Phụ tùng (VNĐ - nếu có)</label>
            <input type="text" id="modal-update-cost" value="${item.cost || ''}" placeholder="VD: 350.000" class="w-full p-2 bg-white border border-slate-300 rounded font-mono">
          </div>
        </form>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk mr-1.5"></i>Lưu Cập Nhật',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const status = document.getElementById('modal-update-status').value;
        const assignedTo = document.getElementById('modal-update-tech').value.trim();
        const sparePart = document.getElementById('modal-update-spare').value.trim();
        const solution = document.getElementById('modal-update-solution').value.trim();
        const cost = document.getElementById('modal-update-cost').value.trim();

        if (status === 'completed' && !solution) {
          Swal.showValidationMessage('Vui lòng ghi rõ giải pháp khắc phục khi đánh dấu Đã hoàn thành!');
          return false;
        }

        return { status, assignedTo, sparePart, solution, cost };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        Object.assign(item, res.value);

        // NẾU ĐÃ HOÀN THÀNH -> TỰ ĐỘNG KHÔI PHỤC MÁY TÍNH SANG 'good'
        if (item.status === 'completed') {
          const comp = window.appState.computers.find(c => c.id === item.computerId);
          if (comp) {
            comp.status = 'good';
            comp.issue = null;
            comp.powerState = 'on';

            if (!comp.history) comp.history = [];
            comp.history.unshift({
              date: new Date().toISOString().split('T')[0],
              action: 'Sửa chữa hoàn tất & Nghiệm thu OK',
              technician: item.assignedTo,
              note: item.solution || 'Đã khắc phục hoàn toàn sự cố.'
            });
          }
        }

        window.saveStateToLocalStorage();
        this.loadMaintenanceTable();
        if (window.labSimulation) {
          window.labSimulation.loadLab(window.labSimulation.currentLabId);
        }
        if (typeof window.updateDashboardKPIs === 'function') {
          window.updateDashboardKPIs();
        }

        Swal.fire({
          icon: 'success',
          title: 'Đã lưu cập nhật!',
          text: item.status === 'completed' ? `Máy tính ${item.computerId} đã khôi phục trạng thái Hoạt động tốt.` : 'Đã ghi nhận tiến độ sửa chữa.',
          timer: 1800,
          showConfirmButton: false
        });
      }
    });
  }

  // =========================================================================
  // XÓA / HỦY PHIẾU SỰ CỐ
  // =========================================================================
  deleteIncident(incidentId) {
    const curUser = window.appState?.currentUser;
    const curRole = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const canDeleteTicket = (curRole === 'admin' || curRole === 'lab_manager');
    if (!canDeleteTicket) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Truy cập bị từ chối',
          html: 'Chỉ <strong>Quản trị viên (Admin)</strong> và <strong>Quản lý phòng máy</strong> mới có thẩm quyền xóa hủy phiếu sự cố khỏi hệ thống lưu trữ.'
        });
      }
      return;
    }
    if (typeof window.checkPermission === 'function' && !window.checkPermission('resolve_ticket', 'Xóa phiếu sự cố bảo trì')) return;
    const item = window.appState.maintenance.find(m => m.id === incidentId);
    if (!item) return;

    Swal.fire({
      title: 'Hủy phiếu sự cố này?',
      html: `Bạn có chắc muốn xóa phiếu <strong>${item.id}</strong> (${item.computerId}) khỏi hệ thống?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#e11d48'
    }).then(res => {
      if (res.isConfirmed) {
        window.appState.maintenance = window.appState.maintenance.filter(m => m.id !== incidentId);

        // Khôi phục máy về good nếu không còn phiếu nào khác
        const comp = window.appState.computers.find(c => c.id === item.computerId);
        if (comp && (comp.status === 'broken' || comp.status === 'warning')) {
          const hasOtherInc = window.appState.maintenance.some(m => m.computerId === comp.id && m.status !== 'completed');
          if (!hasOtherInc) {
            comp.status = 'good';
            comp.issue = null;
          }
        }

        window.saveStateToLocalStorage();
        this.loadMaintenanceTable();
        if (window.labSimulation) {
          window.labSimulation.loadLab(window.labSimulation.currentLabId);
        }
        if (typeof window.updateDashboardKPIs === 'function') {
          window.updateDashboardKPIs();
        }
        Swal.fire('Đã xóa', 'Phiếu sự cố đã được gỡ khỏi danh sách.', 'success');
      }
    });
  }

  // =========================================================================
  // XUẤT BÁO CÁO SỰ CỐ & BẢO TRÌ EXCEL
  // =========================================================================
  exportMaintenanceToExcel() {
    if (typeof XLSX === 'undefined') {
      Swal.fire('Lỗi', 'Thư viện xuất Excel chưa tải xong.', 'error');
      return;
    }

    const exportList = this.getFilteredIncidents();
    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };

    const statusMap = {
      'pending': 'Chờ xử lý',
      'in_progress': 'Đang sửa chữa',
      'completed': 'Đã hoàn thành'
    };

    const priorityMap = {
      'critical': 'Khẩn cấp',
      'high': 'Mức cao',
      'low': 'Bình thường'
    };

    const exportData = exportList.map((m, idx) => ({
      'STT': idx + 1,
      'Mã phiếu': m.id,
      'Mã thiết bị': m.computerId,
      'Phòng máy': labNames[m.labId] || m.labId,
      'Vị trí': 'Tầng 5, Nhà A1',
      'Mức độ ưu tiên': priorityMap[m.priority] || m.priority,
      'Tiêu đề sự cố': m.title,
      'Mô tả chi tiết': m.description,
      'Người lập phiếu': m.reportedBy,
      'Ngày báo hỏng': m.reportDate,
      'Kỹ thuật viên phụ trách': m.assignedTo || '',
      'Linh kiện thay thế': m.sparePart || '',
      'Giải pháp xử lý': m.solution || '',
      'Chi phí vật tư': m.cost || '',
      'Tiến độ': statusMap[m.status] || m.status,
      'Cán bộ phụ trách 4 phòng': 'ThS. Trịnh Minh Phú (0975.090.666)'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCao_BaoTri_TNUS");

    const fileName = `TNUS_BaoCao_BaoTri_SuCo_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    Swal.fire({
      icon: 'success',
      title: 'Xuất Excel thành công!',
      text: `Đã lưu tệp ${fileName} (${exportList.length} sự cố)`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // =========================================================================
  // NHẬP SỰ CỐ TỪ EXCEL
  // =========================================================================
  handleExcelImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
      Swal.fire('Lỗi', 'Thư viện XLSX chưa được tải.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        if (!rows || rows.length === 0) {
          Swal.fire('Thông báo', 'Tệp Excel không có dữ liệu sự cố.', 'warning');
          return;
        }

        let addedCount = 0;
        rows.forEach((row, idx) => {
          const compId = (row['Mã thiết bị'] || row['Mã máy'] || row['computerId'] || 'PM1-01').toString().trim().toUpperCase();
          const comp = window.appState.computers.find(c => c.id === compId);
          const labId = comp ? comp.labId : 'PM1';
          const title = (row['Tiêu đề sự cố'] || row['Hiện tượng'] || row['title'] || 'Sự cố thiết bị').toString().trim();
          const desc = (row['Mô tả chi tiết'] || row['Mô tả'] || row['description'] || 'Cần kiểm tra kỹ thuật').toString().trim();
          const priority = (row['Mức độ ưu tiên'] || row['priority'] || 'high').toString().toLowerCase().includes('khẩn') ? 'critical' : 'high';
          const reporter = (row['Người lập phiếu'] || row['Người báo'] || row['reportedBy'] || 'KTV Phòng máy').toString().trim();
          const assigned = (row['Kỹ thuật viên phụ trách'] || row['KTV'] || 'Tổ Kỹ thuật TNUS').toString().trim();

          const newId = `INC-IMP-${Date.now().toString().slice(-4)}-${idx}`;
          window.appState.maintenance.unshift({
            id: newId,
            computerId: compId,
            labId,
            reportedBy: reporter,
            reportDate: new Date().toISOString().split('T')[0],
            priority,
            title,
            description: desc,
            status: 'pending',
            assignedTo: assigned,
            solution: '',
            sparePart: '',
            cost: ''
          });

          if (comp) {
            comp.status = 'warning';
            comp.issue = title;
          }
          addedCount++;
        });

        window.saveStateToLocalStorage();
        this.loadMaintenanceTable();
        if (window.labSimulation) {
          window.labSimulation.loadLab(window.labSimulation.currentLabId);
        }
        if (typeof window.updateDashboardKPIs === 'function') {
          window.updateDashboardKPIs();
        }

        Swal.fire({
          icon: 'success',
          title: 'Nhập dữ liệu thành công!',
          text: `Đã thêm mới ${addedCount} phiếu sự cố từ file Excel.`
        });
      } catch (err) {
        console.error('Lỗi khi đọc file Excel:', err);
        Swal.fire('Lỗi', 'Không thể đọc tệp Excel này.', 'error');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // =========================================================================
  // IN PHIẾU YÊU CẦU & BIÊN BẢN BÀN GIAO SỬA CHỮA (PRINT WORK ORDER)
  // =========================================================================
  printMaintenanceTicket(incidentId) {
    const item = window.appState.maintenance.find(m => m.id === incidentId);
    if (!item) return;

    const comp = window.appState.computers.find(c => c.id === item.computerId);
    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };
    const labName = labNames[item.labId] || item.labId;

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      Swal.fire('Lỗi', 'Trình duyệt chặn mở cửa sổ in.', 'warning');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Phiếu Yêu Cầu Bảo Trì & Sửa Chữa - ${item.id}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; color: #0f172a; font-size: 13px; line-height: 1.5; }
          .header-table { width: 100%; margin-bottom: 25px; }
          .title { text-align: center; font-size: 17px; font-weight: bold; text-transform: uppercase; margin: 15px 0 5px 0; }
          .sub-title { text-align: center; font-size: 12px; font-style: italic; margin-bottom: 25px; }
          .box { border: 1px solid #334155; padding: 12px; margin-bottom: 15px; border-radius: 4px; }
          .box-title { font-weight: bold; text-transform: uppercase; font-size: 12px; border-bottom: 1px dashed #94a3b8; padding-bottom: 4px; margin-bottom: 8px; color: #1e3a8a; }
          .grid { display: flex; flex-wrap: wrap; margin-bottom: 4px; }
          .grid-item { width: 50%; box-sizing: border-box; }
          .signature-section { margin-top: 40px; width: 100%; page-break-inside: avoid; }
          .no-print { margin-bottom: 20px; padding: 12px; background: #e0f2fe; border: 1px solid #0284c7; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
          .btn-print { background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 4px; font-weight: bold; cursor: pointer; }
          @media print { .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div><strong>Phiếu Yêu Cầu Sửa Chữa & Bàn Giao Thiết Bị CNTT (TNUS)</strong></div>
          <button onclick="window.print()" class="btn-print">In Ngay (Print)</button>
        </div>

        <table class="header-table">
          <tr>
            <td style="text-align: center; width: 45%;">
              <strong>TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)</strong><br>
              <strong>KHOA TOÁN - TIN</strong><br>
              <strong>TỔ QUẢN TRỊ PHÒNG MÁY</strong><br>
              --------------------
            </td>
            <td style="text-align: center; width: 55%;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
              --------------------
            </td>
          </tr>
        </table>

        <div class="title">PHIẾU YÊU CẦU BẢO TRÌ & BIÊN BẢN SỬA CHỮA THIẾT BỊ</div>
        <div class="sub-title">Mã số phiếu: <strong>${item.id}</strong> • Ngày lập: ${item.reportDate}</div>

        <!-- 1. THÔNG TIN THIẾT BỊ -->
        <div class="box">
          <div class="box-title">I. Thông Tin Thiết Bị Gặp Sự Cố</div>
          <div class="grid">
            <div class="grid-item">Mã thiết bị: <strong>${item.computerId}</strong></div>
            <div class="grid-item">Phòng thực hành: <strong>${labName}</strong> (Tầng 5, Nhà A1)</div>
          </div>
          <div class="grid">
            <div class="grid-item">Chủng loại / Hãng: ${comp ? comp.brand + ' ' + comp.model : 'Máy tính đồng bộ'}</div>
            <div class="grid-item">Số Serial máy: ${comp ? (comp.serialNumber || 'SN-' + comp.id) : 'N/A'}</div>
          </div>
          <div class="grid">
            <div class="grid-item">Cấu hình: ${comp ? comp.cpu + ' • ' + comp.ram + ' • ' + comp.storage : 'Core i5'}</div>
            <div class="grid-item">Địa chỉ IP / MAC: ${comp ? comp.ipAddress + ' • ' + comp.macAddress : '192.168.1.x'}</div>
          </div>
        </div>

        <!-- 2. NỘI DUNG SỰ CỐ -->
        <div class="box">
          <div class="box-title">II. Hiện Trạng Sự Cố & Triệu Chứng Ban Đầu</div>
          <div style="margin-bottom: 6px;"><strong>Hiện tượng:</strong> ${item.title}</div>
          <div style="margin-bottom: 6px;"><strong>Mô tả chi tiết:</strong> ${item.description}</div>
          <div class="grid">
            <div class="grid-item">Mức độ ưu tiên: <strong>${item.priority === 'critical' ? 'Khẩn cấp' : (item.priority === 'high' ? 'Mức độ cao' : 'Bình thường')}</strong></div>
            <div class="grid-item">Người báo hỏng: <strong>${item.reportedBy}</strong></div>
          </div>
        </div>

        <!-- 3. KẾT QUẢ XỬ LÝ -->
        <div class="box">
          <div class="box-title">III. Kết Quả Khắc Phục Kỹ Thuật & Vật Tư Thay Thế</div>
          <div style="margin-bottom: 6px;"><strong>Kỹ thuật viên thực hiện:</strong> ${item.assignedTo || 'KTV. Tổ Phòng máy'}</div>
          <div style="margin-bottom: 6px;"><strong>Linh kiện thay thế:</strong> ${item.sparePart || 'Không thay thế vật tư (Vệ sinh / Cài đặt phần mềm)'}</div>
          <div style="margin-bottom: 6px;"><strong>Giải pháp kỹ thuật:</strong> ${item.solution || 'Đang trong quá trình kiểm tra khắc phục...'}</div>
          <div class="grid">
            <div class="grid-item">Dự toán chi phí: <strong>${item.cost ? item.cost + ' VNĐ' : 'Vật tư kho trường'}</strong></div>
            <div class="grid-item">Kết quả kiểm tra: <strong>${item.status === 'completed' ? 'ĐÃ NGHIỆM THU HOẠT ĐỘNG TỐT' : 'Đang sửa chữa'}</strong></div>
          </div>
        </div>

        <!-- 4. CHỮ KÝ -->
        <table class="signature-section">
          <tr>
            <td style="text-align: center; width: 33%; vertical-align: top;">
              <strong>NGƯỜI BÁO HỎNG</strong><br>
              <em>(Ký, ghi rõ họ tên)</em><br><br><br><br>
              <strong>${item.reportedBy}</strong>
            </td>
            <td style="text-align: center; width: 33%; vertical-align: top;">
              <strong>KỸ THUẬT VIÊN SỬA CHỮA</strong><br>
              <em>(Ký, ghi rõ họ tên)</em><br><br><br><br>
              <strong>${item.assignedTo || 'KTV. Phạm Văn Hải'}</strong>
            </td>
            <td style="text-align: center; width: 34%; vertical-align: top;">
              <em>Thái Nguyên, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em><br>
              <strong>CÁN BỘ PHỤ TRÁCH 4 PHÒNG MÁY</strong><br>
              <em>(Ký, ghi rõ họ tên)</em><br><br><br><br>
              <strong>ThS. Trịnh Minh Phú</strong><br>
              <span style="font-size: 11px;">(SĐT: 0975.090.666)</span>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  }
}

if (typeof window !== 'undefined') {
  window.MaintenanceManager = MaintenanceManager;
} else if (typeof globalThis !== 'undefined') {
  globalThis.MaintenanceManager = MaintenanceManager;
}
