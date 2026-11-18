/**
 * LAB SIMULATION ENGINE - TRỰC QUAN HÓA & MÔ PHỎNG PHÒNG MÁY TÍNH TNUS (2.0)
 * Tương tác cao, sinh động, trực quan với 4 Chế độ Quan sát (Standard, Network, Power, Health)
 * Tích hợp Kịch bản Vận hành Thực tế (Wake-on-LAN tuần tự, Multicast Broadcast, Khóa lớp học, Ping Sweep, Chuẩn đoán sự cố)
 * Khoa Toán - Tin, Trường Đại học Khoa học (TNUS)
 */

class LabSimulation {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.currentLabId = options.initialLabId || 'PM1';
    this.zoom = 1;
    this.panX = 30;
    this.panY = 20;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.selectedComputerId = null;
    this.statusFilter = 'all'; // all, good, warning, broken, inactive, in_use
    this.searchQuery = '';
    this.visualMode = 'standard'; // 'standard', 'network', 'power', 'health'
    this.isScreenLocked = false;
    this.isBroadcasting = false;
    this.soundEnabled = true;
    this.onComputerClick = options.onComputerClick || null;

    this.init();
  }

  init() {
    this.renderToolbarAndStage();
    this.bindEvents();
    this.loadLab(this.currentLabId);
    setTimeout(() => this.fitToScreen(), 80);
  }

  // Âm thanh tổng hợp Web Audio API (Không phụ thuộc file âm thanh ngoài)
  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'wol') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'broadcast') {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.07);
          osc.stop(ctx.currentTime + i * 0.07 + 0.18);
        });
      } else if (type === 'warning') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Bỏ qua nếu trình duyệt hạn chế autoplay âm thanh
    }
  }

  // Tạo thanh công cụ điều khiển sơ đồ và khung vẽ
  renderToolbarAndStage() {
    this.container.innerHTML = `
      <div class="sim-main-wrapper flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <!-- HÀNG 1: CHỌN PHÒNG, TÌM KIẾM, LỌC VÀ ĐIỀU KHIỂN ZOOM -->
        <div class="p-2.5 sm:p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 z-20">
          
          <!-- Chọn phòng máy -->
          <div class="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-lg">
            <button class="lab-tab-btn px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${this.currentLabId === 'PM1' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}" data-lab="PM1">
              <i class="fa-solid fa-desktop mr-1.5 text-blue-500"></i>PM 1 (A1-503)
            </button>
            <button class="lab-tab-btn px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${this.currentLabId === 'PM2' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}" data-lab="PM2">
              <i class="fa-solid fa-desktop mr-1.5 text-indigo-500"></i>PM2 (A1-504)
            </button>
            <button class="lab-tab-btn px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${this.currentLabId === 'PM3' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}" data-lab="PM3">
              <i class="fa-solid fa-desktop mr-1.5 text-cyan-500"></i>PM3 (A1-505)
            </button>
            <button class="lab-tab-btn px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${this.currentLabId === 'PM4' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}" data-lab="PM4">
              <i class="fa-solid fa-desktop mr-1.5 text-teal-500"></i>PM4 (A1-506)
            </button>
          </div>

          <!-- Bộ lọc trạng thái & Tìm kiếm máy -->
          <div class="flex items-center space-x-2 flex-grow sm:flex-grow-0">
            <!-- Ô tìm kiếm mã máy -->
            <div class="relative w-36 sm:w-44">
              <i class="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input type="text" id="sim-search-input" placeholder="Tìm máy (PM1-001)..." 
                class="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white">
            </div>

            <!-- Lọc theo trạng thái -->
            <select id="sim-status-filter" class="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả trạng thái</option>
              <option value="good">🟢 Hoạt động tốt</option>
              <option value="in_use">🔵 Đang sử dụng</option>
              <option value="warning">🟡 Cần kiểm tra</option>
              <option value="broken">🔴 Đang hỏng</option>
              <option value="inactive">⚪ Ngừng sử dụng</option>
            </select>
          </div>

          <!-- Các nút thao tác Zoom & Toàn màn hình -->
          <div class="flex items-center space-x-1.5">
            <div class="flex items-center bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
              <button id="sim-zoom-out" title="Thu nhỏ (Zoom Out) [-]" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded">
                <i class="fa-solid fa-magnifying-glass-minus text-xs"></i>
              </button>
              <span id="sim-zoom-level" class="text-[11px] font-mono font-bold px-1.5 text-slate-600 dark:text-slate-300">100%</span>
              <button id="sim-zoom-in" title="Phóng to (Zoom In) [+]" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded">
                <i class="fa-solid fa-magnifying-glass-plus text-xs"></i>
              </button>
              <button id="sim-zoom-fit" title="Khớp toàn bộ phòng vào màn hình [0]" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded border-l border-slate-200 dark:border-slate-600">
                <i class="fa-solid fa-expand text-xs"></i>
              </button>
              <button id="sim-fullscreen-btn" title="Chế độ toàn màn hình [F]" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded border-l border-slate-200 dark:border-slate-600">
                <i class="fa-solid fa-maximize text-xs"></i>
              </button>
              <button id="sim-zoom-reset" title="Khôi phục góc nhìn chuẩn" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded border-l border-slate-200 dark:border-slate-600">
                <i class="fa-solid fa-arrows-to-eye text-xs"></i>
              </button>
            </div>

            <!-- Bật/Tắt Âm thanh hiệu ứng -->
            <button id="sim-sound-toggle-btn" title="Bật/Tắt âm thanh hiệu ứng mô phỏng" class="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-slate-100 dark:bg-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-600 transition">
              <i class="fa-solid ${this.soundEnabled ? 'fa-volume-high text-blue-600' : 'fa-volume-xmark text-slate-400'} text-xs"></i>
            </button>
          </div>
        </div>

        <!-- HÀNG 2: THANH CHỌN CHẾ ĐỘ QUAN SÁT (VISUAL MODES) & KỊCH BẢN THỬ NGHIỆM THỰC HÀNH -->
        <div class="px-3 py-2 bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 text-xs z-10">
          
          <!-- Nhóm 4 Chế độ lớp phủ quan sát -->
          <div class="flex items-center space-x-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden lg:inline">Chế độ xem:</span>
            <button class="sim-mode-btn px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${this.visualMode === 'standard' ? 'sim-mode-active' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}" data-mode="standard">
              <i class="fa-solid fa-layer-group text-blue-500"></i>
              <span>Mặt bằng chuẩn</span>
            </button>
            <button class="sim-mode-btn px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${this.visualMode === 'network' ? 'sim-mode-active' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}" data-mode="network">
              <i class="fa-solid fa-network-wired text-cyan-500"></i>
              <span>Topo Mạng & IP</span>
            </button>
            <button class="sim-mode-btn px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${this.visualMode === 'power' ? 'sim-mode-active' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}" data-mode="power">
              <i class="fa-solid fa-bolt text-amber-500"></i>
              <span>Điện năng & Tải PDU</span>
            </button>
            <button class="sim-mode-btn px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${this.visualMode === 'health' ? 'sim-mode-active' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}" data-mode="health">
              <i class="fa-solid fa-temperature-half text-emerald-500"></i>
              <span>Cảm biến & Nhiệt độ</span>
            </button>
          </div>

          <!-- Nhóm Kịch bản thao tác thực nghiệm 1-chạm / Tiện ích tra cứu -->
          <div id="sim-scenario-container" class="flex items-center flex-wrap gap-1.5">
            <span id="sim-scenario-label" class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden xl:inline">Thực nghiệm:</span>
            
            <button id="btn-scenario-wol" title="Mô phỏng phát tín hiệu Magic Packet đánh thức máy từ xa theo từng hàng" class="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-md font-semibold text-[11px] transition flex items-center space-x-1">
              <i class="fa-solid fa-bolt-lightning text-amber-500"></i>
              <span>Bật Wake-on-LAN</span>
            </button>

            <button id="btn-scenario-broadcast" title="Mô phỏng phân phối tệp bài tập / đề thi từ máy giảng viên tới toàn bộ máy học sinh" class="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-300 rounded-md font-semibold text-[11px] transition flex items-center space-x-1">
              <i class="fa-solid fa-tower-broadcast text-cyan-500"></i>
              <span>Phát bài giảng (Multicast)</span>
            </button>

            <button id="btn-scenario-lock" title="Mô phỏng phần mềm quản lý lớp học (NetOp/Mythware): Khóa màn hình để giảng bài" class="px-2 py-1 ${this.isScreenLocked ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300'} rounded-md font-semibold text-[11px] transition flex items-center space-x-1">
              <i class="fa-solid ${this.isScreenLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
              <span id="btn-scenario-lock-text">${this.isScreenLocked ? 'Mở khóa lớp học' : 'Khóa màn hình lớp'}</span>
            </button>

            <button id="btn-scenario-ping" title="Quét kiểm tra độ trễ mạng ICMP toàn phòng" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-semibold text-[11px] transition flex items-center space-x-1">
              <i class="fa-solid fa-wifi text-emerald-500"></i>
              <span>Ping Sweep</span>
            </button>

            <button id="btn-scenario-fault" title="Mô phỏng sự cố ngẫu nhiên và kích hoạt hướng dẫn khắc phục" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-md font-semibold text-[11px] transition flex items-center space-x-1">
              <i class="fa-solid fa-triangle-exclamation text-rose-500"></i>
              <span>Tạo lỗi ngẫu nhiên</span>
            </button>

            <!-- Tiện ích riêng dành cho Sinh viên / Khách tra cứu (Rõ ràng, trực quan) -->
            <button id="btn-student-find-available" onclick="window.findAvailableComputersForStudent && window.findAvailableComputersForStudent()" title="Lọc và làm nổi bật các máy tính đang rảnh (Hoạt động tốt) để sinh viên chọn ngồi" class="hidden px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold text-[11px] transition flex items-center space-x-1 shadow-2xs">
              <i class="fa-solid fa-circle-check text-emerald-600"></i>
              <span>Tìm máy trống</span>
            </button>

            <button id="btn-student-report-fault" onclick="window.openStudentReportFaultModal && window.openStudentReportFaultModal()" title="Báo sự cố hỏng hóc máy tính tại phòng cho Kỹ thuật viên" class="hidden px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-md font-bold text-[11px] transition flex items-center space-x-1 shadow-2xs">
              <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
              <span>Báo hỏng máy</span>
            </button>

            <button id="btn-scenario-reset" title="Khôi phục trạng thái chuẩn phòng máy" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 rounded-md font-semibold text-[11px] transition flex items-center space-x-1">
              <i class="fa-solid fa-rotate-right"></i>
              <span id="btn-scenario-reset-text" class="hidden">Làm mới</span>
            </button>
          </div>
        </div>

        <!-- HÀNG 3: CHÚ THÍCH VÀ ĐẾM SỐ LƯỢNG MÁY -->
        <div class="px-4 py-1.5 bg-white/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex flex-wrap items-center gap-3.5">
            <span class="font-semibold text-slate-500 text-[10px] uppercase tracking-wider">Trạng thái:</span>
            <div class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
              <span class="text-slate-700 dark:text-slate-300 text-[11px]">Tốt (<span id="count-legend-good" class="font-bold">0</span>)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span>
              <span class="text-slate-700 dark:text-slate-300 text-[11px]">Đang dùng (<span id="count-legend-in_use" class="font-bold">0</span>)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
              <span class="text-slate-700 dark:text-slate-300 text-[11px]">Cần KT (<span id="count-legend-warning" class="font-bold">0</span>)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse"></span>
              <span class="text-slate-700 dark:text-slate-300 text-[11px]">Hỏng (<span id="count-legend-broken" class="font-bold">0</span>)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></span>
              <span class="text-slate-700 dark:text-slate-300 text-[11px]">Ngừng SD (<span id="count-legend-inactive" class="font-bold">0</span>)</span>
            </div>
          </div>
          <div class="text-[11px] text-slate-400 italic">
            <i class="fa-regular fa-hand-pointer mr-1"></i>Kéo để di chuyển • Cuộn để zoom • Nhấp vào máy để tương tác trực tiếp
          </div>
        </div>

        <!-- Khung Viewport Sơ đồ (Simulation Viewport) -->
        <div id="sim-viewport" class="simulation-viewport flex-grow relative w-full h-[calc(100vh-250px)] min-h-[580px] max-h-[880px] select-none">
          <div id="sim-world" class="absolute transform-gpu origin-top-left transition-transform duration-75">
            <!-- Nội dung sơ đồ phòng máy sẽ được vẽ tại đây -->
          </div>

          <!-- Tooltip thông tin máy khi hover -->
          <div id="sim-tooltip" class="sim-tooltip hidden bg-slate-900/95 text-white text-xs rounded-lg p-2.5 shadow-2xl border border-slate-700 pointer-events-none min-w-[200px]">
            <div id="sim-tooltip-content"></div>
          </div>
        </div>

        <!-- Thanh thông tin dưới cùng của sơ đồ -->
        <div class="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div class="flex items-center space-x-3">
            <span class="font-bold text-slate-800 dark:text-white" id="sim-current-lab-name">PM 1 (A1-503)</span>
            <span>•</span>
            <span id="sim-current-lab-roomcode" class="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold">A1-503</span>
            <span>•</span>
            <span id="sim-current-lab-desc">30 máy đồng bộ FPT Elead</span>
          </div>
          <div class="flex items-center space-x-4">
            <span>Cán bộ phụ trách: <strong class="text-blue-700 dark:text-blue-400" id="sim-current-lab-manager">ThS. Trịnh Minh Phú (0975.090.666)</strong></span>
          </div>
        </div>
      </div>
    `;

    this.viewport = document.getElementById('sim-viewport');
    this.world = document.getElementById('sim-world');
    this.tooltip = document.getElementById('sim-tooltip');
    this.tooltipContent = document.getElementById('sim-tooltip-content');
  }

  // Gán sự kiện tương tác chuột: Pan, Zoom, Filter, Search, Scenarios
  bindEvents() {
    // 1. Chuyển phòng máy bằng Tab
    this.container.querySelectorAll('.lab-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const labId = btn.getAttribute('data-lab');
        this.switchLab(labId);
      });
    });

    // 2. Chuyển chế độ quan sát (Visual Modes: standard, network, power, health)
    this.container.querySelectorAll('.sim-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.playSound('click');
        const mode = btn.getAttribute('data-mode');
        this.setVisualMode(mode);
      });
    });

    // 3. Kéo thả (Pan) trên Viewport
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.no-drag')) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.viewport.style.cursor = 'grab';
      }
    });

    // 4. Cuộn chuột để Phóng to / Thu nhỏ (Zoom)
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.setZoom(this.zoom * zoomFactor);
    }, { passive: false });

    // 5. Nút Zoom Controls, Khớp khung hình & Toàn màn hình
    document.getElementById('sim-zoom-in').addEventListener('click', () => {
      this.playSound('click');
      this.setZoom(this.zoom * 1.15);
    });
    document.getElementById('sim-zoom-out').addEventListener('click', () => {
      this.playSound('click');
      this.setZoom(this.zoom / 1.15);
    });
    const fitBtn = document.getElementById('sim-zoom-fit');
    if (fitBtn) fitBtn.addEventListener('click', () => {
      this.playSound('click');
      this.fitToScreen();
    });
    const fsBtn = document.getElementById('sim-fullscreen-btn');
    if (fsBtn) fsBtn.addEventListener('click', () => {
      this.playSound('click');
      this.toggleFullscreen();
    });
    document.getElementById('sim-zoom-reset').addEventListener('click', () => {
      this.playSound('click');
      this.resetView();
    });

    // Bật/Tắt âm thanh
    const soundBtn = document.getElementById('sim-sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        const icon = soundBtn.querySelector('i');
        if (icon) {
          icon.className = `fa-solid ${this.soundEnabled ? 'fa-volume-high text-blue-600' : 'fa-volume-xmark text-slate-400'} text-xs`;
        }
        if (this.soundEnabled) this.playSound('beep');
      });
    }

    // 6. Lọc theo trạng thái
    document.getElementById('sim-status-filter').addEventListener('change', (e) => {
      this.statusFilter = e.target.value;
      this.applyFilterAndSearch();
    });

    // Tương tác nhấp trực tiếp vào Chú thích để lọc tức thì
    ['good', 'in_use', 'warning', 'broken', 'inactive'].forEach(st => {
      const countEl = document.getElementById(`count-legend-${st}`);
      if (countEl && countEl.parentElement) {
        countEl.parentElement.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
        countEl.parentElement.title = `Nhấp để lọc nhanh máy '${STATUS_CONFIG[st].label}'`;
        countEl.parentElement.addEventListener('click', () => {
          this.playSound('click');
          const filterSelect = document.getElementById('sim-status-filter');
          if (filterSelect) {
            filterSelect.value = (this.statusFilter === st) ? 'all' : st;
            this.statusFilter = filterSelect.value;
            this.applyFilterAndSearch();
          }
        });
      }
    });

    // 7. Tìm kiếm mã máy
    document.getElementById('sim-search-input').addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toUpperCase();
      this.applyFilterAndSearch();
    });

    // 8. Kịch bản thực hành 1-chạm
    document.getElementById('btn-scenario-wol').addEventListener('click', () => this.runWakeOnLanScenario());
    document.getElementById('btn-scenario-broadcast').addEventListener('click', () => this.runBroadcastScenario());
    document.getElementById('btn-scenario-lock').addEventListener('click', () => this.toggleScreenLockScenario());
    document.getElementById('btn-scenario-ping').addEventListener('click', () => this.runPingSweepScenario());
    document.getElementById('btn-scenario-fault').addEventListener('click', () => this.runFaultInjectionScenario());
    document.getElementById('btn-scenario-reset').addEventListener('click', () => this.resetLabScenario());

    // 9. Thao tác cảm ứng (Touch drag & Pinch zoom)
    let touchStartDist = 0;
    let initialZoom = 1;

    this.viewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('.no-drag') && e.touches.length === 1) return;
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.panX;
        this.startY = e.touches[0].clientY - this.panY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = this.zoom;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        this.panX = e.touches[0].clientX - this.startX;
        this.panY = e.touches[0].clientY - this.startY;
        this.applyTransform();
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / touchStartDist;
        this.setZoom(initialZoom * factor);
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        this.isDragging = false;
        touchStartDist = 0;
      }
    });

    // 10. Phím tắt tiện ích: (+/- zoom, 0 fit, F fullscreen)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      if (window.appState && window.appState.currentTab !== 'simulation') return;

      if (e.key === '+' || e.key === '=') {
        this.setZoom(this.zoom * 1.15);
      } else if (e.key === '-' || e.key === '_') {
        this.setZoom(this.zoom / 1.15);
      } else if (e.key === '0') {
        this.fitToScreen();
      } else if (e.key.toLowerCase() === 'f') {
        this.toggleFullscreen();
      }
    });

    // Tự động căn chỉnh khi resize cửa sổ
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        if (window.appState && window.appState.currentTab === 'simulation') {
          this.fitToScreen();
        }
      }, 150);
    });
  }

  // Chuyển đổi chế độ quan sát (standard, network, power, health)
  setVisualMode(mode) {
    this.visualMode = mode;
    this.container.querySelectorAll('.sim-mode-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-mode') === mode;
      btn.className = `sim-mode-btn px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${
        isTarget ? 'sim-mode-active' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
      }`;
    });
    this.loadLab(this.currentLabId);
  }

  // Bật/tắt chế độ toàn màn hình
  toggleFullscreen() {
    const mainWrapper = this.container.querySelector('.sim-main-wrapper');
    if (!mainWrapper) return;
    mainWrapper.classList.toggle('sim-container-fullscreen');
    const isFull = mainWrapper.classList.contains('sim-container-fullscreen');
    const fsBtn = document.getElementById('sim-fullscreen-btn');
    if (fsBtn) {
      fsBtn.innerHTML = isFull ? '<i class="fa-solid fa-compress text-xs"></i>' : '<i class="fa-solid fa-maximize text-xs"></i>';
      fsBtn.title = isFull ? 'Thoát toàn màn hình [F]' : 'Chế độ toàn màn hình [F]';
    }
    setTimeout(() => this.fitToScreen(), 100);
  }

  setZoom(newZoom) {
    this.zoom = Math.min(Math.max(0.45, newZoom), 2.2);
    const zoomEl = document.getElementById('sim-zoom-level');
    if (zoomEl) zoomEl.textContent = `${Math.round(this.zoom * 100)}%`;
    this.applyTransform();
  }

  // Tự động khớp toàn bộ mặt bằng phòng máy vào khung nhìn (Fit View)
  fitToScreen() {
    if (!this.viewport || !this.world) return;
    const roomEl = this.world.querySelector('.relative.bg-white, .relative.bg-slate-850');
    if (!roomEl) return;

    const vpWidth = this.viewport.clientWidth;
    const vpHeight = this.viewport.clientHeight;

    // Nếu tab đang ẩn hoặc chưa hiển thị kích thước thì dừng, không gọi đệ quy lặp vô tận
    if (vpWidth === 0 || vpHeight === 0) return;

    const roomWidth = roomEl.offsetWidth || 960;
    const roomHeight = roomEl.offsetHeight || 610;

    const scaleX = (vpWidth - 36) / roomWidth;
    const scaleY = (vpHeight - 36) / roomHeight;
    let bestZoom = Math.min(scaleX, scaleY);
    bestZoom = Math.min(Math.max(0.45, bestZoom), 1.15);

    this.zoom = parseFloat(bestZoom.toFixed(2));
    this.panX = Math.round((vpWidth - roomWidth * this.zoom) / 2);
    this.panY = Math.max(10, Math.round((vpHeight - roomHeight * this.zoom) / 2));

    const zoomEl = document.getElementById('sim-zoom-level');
    if (zoomEl) zoomEl.textContent = `${Math.round(this.zoom * 100)}%`;
    this.applyTransform();
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    const zoomEl = document.getElementById('sim-zoom-level');
    if (zoomEl) zoomEl.textContent = '100%';
    this.applyTransform();
  }

  applyTransform() {
    if (this.world) {
      this.world.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
  }

  // Chuyển đổi giữa 4 phòng máy
  switchLab(labId) {
    this.playSound('click');
    this.currentLabId = labId;
    this.container.querySelectorAll('.lab-tab-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-lab') === labId;
      btn.className = `lab-tab-btn px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
        isTarget ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
      }`;
    });
    this.loadLab(labId);
    setTimeout(() => this.fitToScreen(), 60);
  }

  // Tải dữ liệu phòng máy và render sơ đồ
  loadLab(labId) {
    const lab = window.appState.labs.find(l => l.id === labId);
    if (!lab) return;

    // Cập nhật thông tin tiêu đề phòng
    const elName = document.getElementById('sim-current-lab-name');
    if (elName) elName.textContent = lab.name;
    const elRoom = document.getElementById('sim-current-lab-roomcode');
    if (elRoom) elRoom.textContent = lab.roomCode;
    const elDesc = document.getElementById('sim-current-lab-desc');
    if (elDesc) elDesc.textContent = lab.hardwareSummary || lab.description;
    const elMgr = document.getElementById('sim-current-lab-manager');
    if (elMgr) elMgr.textContent = `${lab.manager} (0975.090.666)`;

    this.renderLabFloorPlan(lab);
    this.updateLegendCounts();
    this.applyFilterAndSearch();
  }

  // Cập nhật số đếm ở thanh chú thích màu sắc
  updateLegendCounts() {
    const labComputers = window.appState.computers.filter(c => c.labId === this.currentLabId);
    const counts = { good: 0, in_use: 0, warning: 0, broken: 0, inactive: 0 };
    labComputers.forEach(c => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setElText('count-legend-good', counts.good);
    setElText('count-legend-in_use', counts.in_use);
    setElText('count-legend-warning', counts.warning);
    setElText('count-legend-broken', counts.broken);
    setElText('count-legend-inactive', counts.inactive);
  }

  // Vẽ chi tiết mặt bằng phòng máy (Floor Plan)
  renderLabFloorPlan(lab) {
    const labComputers = window.appState.computers.filter(c => c.labId === lab.id);
    
    let roomWidth = 960;
    let roomHeight = 610;
    if (lab.id === 'PM1') {
      roomWidth = 960;
      roomHeight = 610;
    } else if (lab.id === 'PM2') {
      roomWidth = 960;
      roomHeight = 630;
    } else {
      roomWidth = 960;
      roomHeight = 560;
    }

    // Tính toán số liệu thống kê chế độ xem
    const activeComps = labComputers.filter(c => c.powerState === 'on');
    const totalWatts = activeComps.length * 85 + (labComputers.length - activeComps.length) * 2;
    const totalKW = (totalWatts / 1000).toFixed(2);
    const loadPercent = Math.round((activeComps.length / labComputers.length) * 100);
    const amps = (totalWatts / 220).toFixed(1);

    let html = `
      <div class="relative bg-white dark:bg-slate-850 rounded-2xl border-4 border-slate-300 dark:border-slate-700 shadow-2xl p-5" 
           style="width: ${roomWidth}px; min-height: ${roomHeight}px;">
        
        <!-- CỬA RA VÀO PHÒNG MÁY -->
        <div class="absolute -top-3.5 left-14 bg-amber-100 border-2 border-amber-600 px-3 py-1 rounded text-[10px] font-bold text-amber-900 flex items-center shadow-md">
          <i class="fa-solid fa-door-open mr-1.5 text-amber-700"></i>CỬA CHÍNH • HÀNH LANG TẦNG 5, NHÀ A1
        </div>

        <!-- CỬA THOÁT HIỂM / CỬA PHỤ -->
        <div class="absolute -bottom-3.5 right-14 bg-slate-200 border-2 border-slate-500 px-3 py-1 rounded text-[10px] font-bold text-slate-800 flex items-center shadow-md">
          <i class="fa-solid fa-door-closed mr-1.5 text-slate-600"></i>CỬA PHỤ THOÁT HIỂM
        </div>

        <!-- BÌNH PCCC CỨU HỎA -->
        <div class="absolute -bottom-3.5 left-14 bg-rose-50 border-2 border-rose-500 px-2.5 py-0.5 rounded text-[9px] font-bold text-rose-800 flex items-center shadow-md">
          <i class="fa-solid fa-fire-extinguisher mr-1 text-rose-600"></i>BÌNH PCCC CO2
        </div>

        <!-- ĐIỀU HÒA KHÔNG KHÍ 1 & 2 -->
        <div class="absolute top-4 left-6 bg-cyan-50 border border-cyan-300 px-2 py-1 rounded text-[9px] font-semibold text-cyan-800 shadow-sm flex items-center">
          <i class="fa-solid fa-wind mr-1 text-cyan-500 animate-pulse"></i>ĐIỀU HÒA 01 (24°C)
        </div>
        <div class="absolute top-4 right-6 bg-cyan-50 border border-cyan-300 px-2 py-1 rounded text-[9px] font-semibold text-cyan-800 shadow-sm flex items-center">
          <i class="fa-solid fa-wind mr-1 text-cyan-500 animate-pulse"></i>ĐIỀU HÒA 02 (24°C)
        </div>

        <!-- TỦ RACK MẠNG SERVER & SWITCH -->
        <div class="absolute top-14 right-6 w-36 bg-slate-800 text-white rounded-lg p-2 border-2 border-slate-600 shadow-lg text-[10px] z-10">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1 mb-1 font-bold text-blue-300">
            <span><i class="fa-solid fa-server mr-1"></i>TỦ MẠNG RACK</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div class="text-[9px] text-slate-300 space-y-0.5">
            <div>Cisco Catalyst 2960X</div>
            <div>Router Fortinet • Gateway</div>
            <div class="text-emerald-400 font-semibold flex items-center justify-between">
              <span>Online 1 Gbps</span>
              <span class="font-mono text-[8px] bg-slate-700 px-1 rounded">192.168.1.1</span>
            </div>
          </div>
        </div>

        <!-- BANNER THÔNG TIN THEO CHẾ ĐỘ QUAN SÁT (OVERLAY BANNER) -->
        ${this.visualMode === 'network' ? `
          <div class="mb-3 px-3 py-1.5 bg-cyan-900/90 text-cyan-100 rounded-lg border border-cyan-600 flex items-center justify-between text-xs shadow">
            <div class="flex items-center space-x-2">
              <span class="px-1.5 py-0.5 rounded bg-cyan-800 text-cyan-300 font-mono font-bold text-[10px]">TOPO MẠNG HÌNH SAO</span>
              <span>Cáp Cat6 UTP 1Gbps • Switch Cisco 48 Port • Gateway: 192.168.1.1/24</span>
            </div>
            <div class="text-cyan-300 font-mono text-[11px] font-semibold">
              <i class="fa-solid fa-circle-nodes mr-1 text-emerald-400"></i>Kết nối 100% Cổng Switch
            </div>
          </div>
        ` : this.visualMode === 'power' ? `
          <div class="mb-3 px-3 py-1.5 bg-amber-900/90 text-amber-100 rounded-lg border border-amber-600 flex items-center justify-between text-xs shadow">
            <div class="flex items-center space-x-2">
              <span class="px-1.5 py-0.5 rounded bg-amber-800 text-amber-300 font-mono font-bold text-[10px]">LƯỚI ĐIỆN 220V/50Hz</span>
              <span>Tổng tải: <strong class="text-white">${totalKW} kW</strong> (${totalWatts}W) • Dòng: <strong>${amps}A</strong></span>
            </div>
            <div class="text-amber-300 font-mono text-[11px] font-semibold">
              <i class="fa-solid fa-bolt mr-1 text-amber-400"></i>Máy bật: ${activeComps.length}/${labComputers.length} (${loadPercent}%)
            </div>
          </div>
        ` : this.visualMode === 'health' ? `
          <div class="mb-3 px-3 py-1.5 bg-emerald-950/90 text-emerald-100 rounded-lg border border-emerald-600 flex items-center justify-between text-xs shadow">
            <div class="flex items-center space-x-2">
              <span class="px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-300 font-mono font-bold text-[10px]">MÔI TRƯỜNG PHÒNG</span>
              <span>Nhiệt độ phòng: <strong>24.0°C</strong> • Độ ẩm: <strong>55%</strong> • CPU TB: <strong>42.5°C</strong></span>
            </div>
            <div class="text-emerald-300 font-mono text-[11px] font-semibold">
              <i class="fa-solid fa-fan mr-1 text-cyan-400 animate-spin"></i>Quạt tản nhiệt: 1200 RPM Bình thường
            </div>
          </div>
        ` : ''}

        <!-- BỤC GIẢNG VIÊN & MÀN CHIẾU PHÒNG HỌC -->
        <div id="sim-teacher-desk" class="mb-3.5 p-2.5 bg-gradient-to-r from-blue-50/80 via-slate-100/90 to-blue-50/80 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 flex items-center justify-between shadow-inner">
          <!-- Bảng từ chống lóa -->
          <div class="w-48 bg-emerald-900 border-2 border-emerald-950 rounded-lg py-1.5 px-3 text-center text-[10px] text-emerald-100 font-mono shadow">
            <i class="fa-solid fa-chalkboard mr-1 text-emerald-300"></i>BẢNG TỪ • ${lab.name}
          </div>

          <!-- Màn chiếu máy chiếu Projector -->
          <div class="flex-grow mx-4 bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-400 dark:border-slate-500 rounded py-1.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-2">
            <i class="fa-solid fa-video text-blue-600 dark:text-blue-400"></i>
            <span>MÀN CHIẾU TRUNG TÂM • ${lab.name} (TẦNG 5, NHÀ A1)</span>
          </div>

          <!-- Bàn máy Giảng viên -->
          <div class="w-56 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg p-1.5 shadow-sm text-xs">
            <div class="flex items-center space-x-2 font-bold text-amber-900 dark:text-amber-300 border-b border-amber-200 pb-0.5 mb-0.5">
              <i class="fa-solid fa-chalkboard-user text-amber-600"></i>
              <span>BÀN GIẢNG VIÊN</span>
            </div>
            <div class="text-[10px] text-slate-600 dark:text-slate-400 flex justify-between">
              <span>Phụ trách: <strong class="text-blue-700">${lab.manager}</strong></span>
              <span class="text-emerald-600 font-bold">Sẵn sàng</span>
            </div>
          </div>
        </div>

        <!-- KHU VỰC CÁC BÀN MÁY TÍNH HỌC SINH -->
        <div class="relative mt-1">
    `;

    // Render theo cấu trúc riêng của từng phòng
    if (lab.id === 'PM1') {
      html += this.renderGridMatrix(labComputers, 5, 6, 'Dãy máy FPT Elead đồng bộ (30 máy)');
    } else if (lab.id === 'PM2') {
      const asusComputers = labComputers.slice(0, 20);
      const fptComputers = labComputers.slice(20, 26);
      
      html += `
        <div class="mb-2.5">
          <div class="flex items-center space-x-2 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-700">
            <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">KHU VỰC A</span>
            <span class="text-xs text-slate-500 font-medium">20 Máy trạm Asus Pro + Màn hình Dell P2419H IPS</span>
          </div>
          ${this.renderGridMatrix(asusComputers, 4, 5)}
        </div>

        <div class="mt-3 pt-2 border-t-2 border-dashed border-slate-300 dark:border-slate-700">
          <div class="flex items-center space-x-2 mb-1.5 pb-1">
            <span class="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-xs font-bold">KHU VỰC B</span>
            <span class="text-xs text-slate-500 font-medium">06 Máy đồng bộ FPT Elead dự phòng / hỗ trợ</span>
          </div>
          ${this.renderGridMatrix(fptComputers, 1, 6)}
        </div>
      `;
    } else if (lab.id === 'PM3' || lab.id === 'PM4') {
      const brandName = 'Dell OptiPlex Core i5-10505';
      html += this.renderGridMatrix(labComputers, 4, 6, `Hệ thống máy trạm đồng bộ ${brandName} (24 máy)`);
    }

    html += `
        </div>
      </div>
    `;

    this.world.innerHTML = html;
    this.bindWorkstationEvents();
  }

  // Hàm tạo lưới bàn máy (Row x Col) với các chế độ hiển thị linh hoạt
  renderGridMatrix(computers, rows, cols, sectionTitle = '') {
    let html = '';
    if (sectionTitle) {
      html += `
        <div class="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center">
          <span class="mr-2">${sectionTitle}</span>
          <div class="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
        </div>
      `;
    }

    html += `<div class="grid gap-y-2.5 gap-x-2.5" style="grid-template-columns: repeat(${cols}, minmax(0, 1fr));">`;

    computers.forEach(comp => {
      const cfg = STATUS_CONFIG[comp.status] || STATUS_CONFIG.good;
      const isSelected = this.selectedComputerId === comp.id;
      const isPowerOn = comp.powerState === 'on';

      html += `
        <div class="workstation-item no-drag relative flex flex-col items-center group ${isSelected ? 'workstation-selected' : ''}" 
             data-comp-id="${comp.id}" 
             data-status="${comp.status}">
          
          <!-- BÀN MÁY VI TÍNH -->
          <div class="workstation-inner w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 border-2 transition-all shadow-sm group-hover:border-blue-400"
               style="border-color: ${cfg.hex};">
            
            <!-- THANH TIÊU ĐỀ MÃ MÁY, ĐÈN NGUỒN VÀ NÚT POWER NHANH -->
            <div class="flex items-center justify-between mb-1 pb-1 border-b border-slate-200 dark:border-slate-700 text-[10px]">
              <span class="font-bold font-mono text-slate-800 dark:text-slate-100">${comp.id}</span>
              
              <!-- Nút toggle nguồn trực tiếp 1-chạm -->
              <div class="flex items-center space-x-1">
                <button class="btn-quick-toggle-power p-0.5 rounded text-slate-400 hover:text-amber-500 transition" 
                        title="${isPowerOn ? 'Nhấp để Tắt nguồn máy tính này' : 'Nhấp để Bật nguồn máy tính này'}"
                        data-comp-id="${comp.id}">
                  <i class="fa-solid fa-power-off text-[9px] ${isPowerOn ? 'text-emerald-500' : 'text-slate-400'}"></i>
                </button>
                <span class="led-indicator ${isPowerOn ? 'led-on' : 'led-off'}"></span>
              </div>
            </div>

            <!-- MÀN HÌNH MÁY TÍNH VÀ CASE (2.5D Top-down Graphic) -->
            <div class="flex items-center justify-between space-x-1 py-0.5">
              <!-- Màn hình -->
              <div class="flex-grow flex flex-col items-center">
                <div class="w-14 h-9 rounded-sm border-2 flex items-center justify-center transition-colors relative overflow-hidden shadow-inner ${this.isScreenLocked && isPowerOn ? 'screen-locked' : ''}"
                     style="background-color: ${isPowerOn ? (this.isScreenLocked ? '#1e3a8a' : '#0f172a') : '#334155'}; border-color: ${cfg.hex};">
                  
                  <!-- Màn hình trong chế độ Khóa lớp học -->
                  ${this.isScreenLocked && isPowerOn ? `
                    <div class="w-full h-full flex flex-col justify-center items-center text-white">
                      <i class="fa-solid fa-lock text-[9px] animate-pulse"></i>
                      <span class="text-[6.5px] font-bold mt-0.5">KHÓA LỚP</span>
                    </div>
                  ` : this.isBroadcasting && isPowerOn ? `
                    <!-- Màn hình trong chế độ Nhận bài giảng broadcast -->
                    <div class="w-full h-full flex flex-col justify-center items-center text-cyan-300">
                      <i class="fa-solid fa-download text-[9px] animate-bounce"></i>
                      <span class="text-[6px] font-mono font-bold mt-0.5">100% OK</span>
                    </div>
                  ` : isPowerOn ? `
                    <!-- Màn hình bật bình thường -->
                    <div class="w-full h-full flex flex-col justify-between p-0.5">
                      <div class="flex justify-between items-center text-[7px] text-slate-400">
                        <i class="fa-brands fa-windows text-blue-400 text-[8px]"></i>
                        <span class="text-[7px] font-mono text-slate-300">TNUS</span>
                      </div>
                      <div class="flex justify-center items-center">
                        <i class="fa-solid ${cfg.icon} text-xs" style="color: ${cfg.hex};"></i>
                      </div>
                      <div class="w-full h-1 bg-slate-800/80 rounded flex items-center px-0.5">
                        <div class="w-1 h-0.5 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  ` : comp.status === 'broken' ? `
                    <div class="text-[8px] text-rose-500 font-mono font-bold flex items-center justify-center">
                      <i class="fa-solid fa-triangle-exclamation mr-0.5 animate-pulse"></i>ERR
                    </div>
                  ` : `
                    <div class="text-[8px] text-slate-500 font-mono">OFF</div>
                  `}
                </div>
                <!-- Chân đế màn hình -->
                <div class="w-4 h-1 bg-slate-400 dark:bg-slate-600 rounded-b mt-0.5"></div>
              </div>

              <!-- Thùng Case PC bên cạnh -->
              <div class="w-4 h-11 bg-slate-700 dark:bg-slate-900 border border-slate-500 rounded-sm flex flex-col items-center justify-between py-1 shadow-sm">
                <div class="w-1.5 h-1.5 rounded-full ${isPowerOn ? 'bg-blue-400 shadow-sm' : 'bg-slate-600'}"></div>
                <div class="w-2.5 h-0.5 bg-slate-500"></div>
                <div class="text-[6px] text-slate-400 font-mono">PC</div>
              </div>
            </div>

            <!-- BÀN PHÍM VÀ CHUỘT -->
            <div class="flex items-center justify-center space-x-1.5 mt-0.5 pt-0.5 border-t border-slate-200/60 dark:border-slate-700/60">
              <!-- Bàn phím -->
              <div class="w-12 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-xs border border-slate-400 flex items-center justify-center space-x-0.5 px-0.5">
                <div class="w-full h-1 bg-slate-400 dark:bg-slate-600 rounded-[1px]"></div>
              </div>
              <!-- Chuột máy tính -->
              <div class="w-2 h-3 bg-slate-300 dark:bg-slate-700 rounded-full border border-slate-400"></div>
            </div>

            <!-- NỘI DUNG HIỂN THỊ THEO CHẾ ĐỘ QUAN SÁT (VISUAL MODE OVERLAY) -->
            ${this.visualMode === 'network' ? `
              <div class="mt-1 px-1 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-700/60 text-[8px] font-mono flex items-center justify-between">
                <span>${comp.ipAddress ? comp.ipAddress.split('.').slice(2).join('.') : '1.101'}</span>
                <span class="text-emerald-400 font-bold">1G</span>
              </div>
            ` : this.visualMode === 'power' ? `
              <div class="mt-1 px-1 py-0.5 rounded bg-amber-950 text-amber-200 border border-amber-700/60 text-[8px] font-mono flex items-center justify-between">
                <span>${isPowerOn ? '85W' : '2W'}</span>
                <span class="text-amber-300">220V</span>
              </div>
            ` : this.visualMode === 'health' ? `
              <div class="mt-1 px-1 py-0.5 rounded bg-slate-900 text-emerald-300 border border-emerald-700/60 text-[8px] font-mono flex items-center justify-between">
                <span>${isPowerOn ? '42°C' : '--'}</span>
                <span class="text-cyan-300">${isPowerOn ? '45%' : '0%'}</span>
              </div>
            ` : `
              <!-- Chế độ chuẩn: Badge trạng thái dưới bàn -->
              <div class="mt-1 text-center">
                <span class="inline-block text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap text-white"
                      style="background-color: ${cfg.hex};">
                  ${cfg.label}
                </span>
              </div>
            `}

          </div>

          <!-- GHẾ NGỒI XOAY (Chair) -->
          <div class="w-7 h-3 bg-slate-300 dark:bg-slate-700 rounded-b-lg border border-slate-400 mt-0.5 flex items-center justify-center shadow-xs">
            <div class="w-4 h-0.5 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
          </div>

        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  // Gán sự kiện click và hover cho từng workstation
  bindWorkstationEvents() {
    this.container.querySelectorAll('.workstation-item').forEach(item => {
      const compId = item.getAttribute('data-comp-id');

      // Click vào nút toggle nguồn nhanh
      const quickPowerBtn = item.querySelector('.btn-quick-toggle-power');
      if (quickPowerBtn) {
        quickPowerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.playSound('click');
          this.toggleSingleComputerPower(compId);
        });
      }

      // Click vào máy tính -> Mở modal chi tiết & tương tác
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playSound('click');
        this.selectComputer(compId);
        if (typeof this.onComputerClick === 'function') {
          const comp = window.appState.computers.find(c => c.id === compId);
          this.onComputerClick(comp);
        }
      });

      // Hover chuột -> Hiển thị Tooltip nhanh
      item.addEventListener('mouseenter', (e) => {
        const comp = window.appState.computers.find(c => c.id === compId);
        if (!comp) return;

        const cfg = STATUS_CONFIG[comp.status] || STATUS_CONFIG.good;
        const isPowerOn = comp.powerState === 'on';

        this.tooltipContent.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
            <span class="font-bold text-blue-400">${comp.name}</span>
            <span class="text-[10px] font-mono px-1 rounded text-white" style="background-color: ${cfg.hex}">${cfg.label}</span>
          </div>
          <div class="space-y-0.5 text-[11px] text-slate-300">
            <div><strong>Nguồn:</strong> <span class="${isPowerOn ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${isPowerOn ? 'BẬT (Online)' : 'TẮT (Standby)'}</span></div>
            <div><strong>CPU:</strong> ${comp.cpu}</div>
            <div><strong>RAM:</strong> ${comp.ram} | <strong>SSD:</strong> ${comp.storage}</div>
            <div><strong>Địa chỉ IP:</strong> <span class="font-mono text-cyan-300">${comp.ipAddress}</span></div>
            <div><strong>Công suất:</strong> <span class="font-mono text-amber-300">${isPowerOn ? '85 W (220V)' : '2 W'}</span></div>
            ${comp.issue ? `<div class="text-rose-400 mt-1 font-semibold"><i class="fa-solid fa-triangle-exclamation mr-1"></i>${comp.issue}</div>` : ''}
          </div>
        `;

        this.tooltip.classList.remove('hidden');
        this.updateTooltipPosition(e);
      });

      item.addEventListener('mousemove', (e) => {
        this.updateTooltipPosition(e);
      });

      item.addEventListener('mouseleave', () => {
        this.tooltip.classList.add('hidden');
      });
    });
  }

  updateTooltipPosition(e) {
    if (!this.viewport || !this.tooltip) return;
    const rect = this.viewport.getBoundingClientRect();
    const tipWidth = this.tooltip.offsetWidth || 220;
    const tipHeight = this.tooltip.offsetHeight || 130;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (x - tipWidth / 2 < 12) {
      x = tipWidth / 2 + 12;
    } else if (x + tipWidth / 2 > rect.width - 12) {
      x = rect.width - tipWidth / 2 - 12;
    }

    if (y - tipHeight < 10) {
      y = y + 25;
      this.tooltip.style.transform = 'translate(-50%, 0)';
    } else {
      y = y - 12;
      this.tooltip.style.transform = 'translate(-50%, -100%)';
    }

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }

  selectComputer(compId) {
    this.selectedComputerId = compId;
    this.container.querySelectorAll('.workstation-item').forEach(el => {
      if (el.getAttribute('data-comp-id') === compId) {
        el.classList.add('workstation-selected');
      } else {
        el.classList.remove('workstation-selected');
      }
    });
  }

  centerOnComputer(compId) {
    const el = this.container.querySelector(`.workstation-item[data-comp-id="${compId}"]`);
    if (!el || !this.viewport || !this.world) return;

    this.selectComputer(compId);
    const vpRect = this.viewport.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const worldRect = this.world.getBoundingClientRect();
    const elRelX = (elRect.left - worldRect.left) / this.zoom + (el.offsetWidth / 2);
    const elRelY = (elRect.top - worldRect.top) / this.zoom + (el.offsetHeight / 2);

    this.panX = Math.round(vpRect.width / 2 - elRelX * this.zoom);
    this.panY = Math.round(vpRect.height / 2 - elRelY * this.zoom);
    this.applyTransform();

    el.classList.add('workstation-highlight');
    setTimeout(() => {
      el.classList.remove('workstation-highlight');
    }, 2500);
  }

  applyFilterAndSearch() {
    let matchedCompIds = [];

    // Tự động chuyển phòng nếu tìm kiếm khớp phòng khác
    if (this.searchQuery && this.searchQuery.length >= 3) {
      const allComps = window.appState.computers;
      const labMatch = allComps.find(c => c.id.includes(this.searchQuery) || (c.ipAddress && c.ipAddress.includes(this.searchQuery)));
      if (labMatch) {
        const targetLab = labMatch.labId;
        if (targetLab !== this.currentLabId) {
          this.switchLab(targetLab);
          return;
        }
      }
    }

    this.container.querySelectorAll('.workstation-item').forEach(item => {
      const compId = item.getAttribute('data-comp-id');
      const compStatus = item.getAttribute('data-status');
      const comp = window.appState.computers.find(c => c.id === compId);

      const matchesStatus = (this.statusFilter === 'all') || (compStatus === this.statusFilter);
      const matchesSearch = !this.searchQuery || 
        compId.includes(this.searchQuery) || 
        (comp && comp.name.toUpperCase().includes(this.searchQuery)) ||
        (comp && comp.ipAddress && comp.ipAddress.includes(this.searchQuery));

      if (matchesStatus && matchesSearch) {
        item.style.opacity = '1';
        item.style.filter = 'none';
        item.classList.remove('pointer-events-none');
        if (this.searchQuery && (compId === this.searchQuery || compId.endsWith(this.searchQuery))) {
          matchedCompIds.push(compId);
        }
      } else {
        item.style.opacity = '0.18';
        item.style.filter = 'grayscale(80%)';
        item.classList.add('pointer-events-none');
      }
    });

    if (matchedCompIds.length === 1) {
      this.centerOnComputer(matchedCompIds[0]);
    }
  }

  // Bật/tắt nguồn từng máy tính trực tiếp
  toggleSingleComputerPower(compId) {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('control_power', 'Bật / Tắt nguồn máy tính')) return;
    const comp = window.appState.computers.find(c => c.id === compId);
    if (!comp) return;

    comp.powerState = comp.powerState === 'on' ? 'off' : 'on';
    if (comp.powerState === 'on' && comp.status === 'inactive') {
      comp.status = 'good';
    }

    this.playSound(comp.powerState === 'on' ? 'beep' : 'click');
    window.saveStateToLocalStorage();
    this.loadLab(this.currentLabId);
    window.updateDashboardKPIs();
  }

  // =========================================================================
  // CÁC KỊCH BẢN THỰC HÀNH & MÔ PHỎNG QUY TRÌNH THỰC TẾ (SCENARIOS)
  // =========================================================================

  // Kịch bản 1: Khởi động tuần tự Wake-on-LAN (WOL)
  runWakeOnLanScenario() {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('control_power', 'Khởi động Wake-on-LAN tuần tự')) return;
    this.playSound('wol');
    const labComps = window.appState.computers.filter(c => c.labId === this.currentLabId);
    const labTitle = this.currentLabId;

    Swal.fire({
      title: `<span class="text-base font-bold text-amber-700">Mô phỏng Wake-on-LAN Tuần Tự (${labTitle})</span>`,
      html: `
        <div class="text-left text-xs space-y-2.5">
          <p class="text-slate-600">Đang phát tín hiệu <strong>Magic Packet (Broadcast)</strong> từ Tủ Rack trung tâm tới 100% card mạng NIC...</p>
          <div class="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
            <div class="font-bold flex items-center mb-1">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-2"></span>
              Đang khởi động tuần tự từng hàng (Wave sequence)...
            </div>
            <div class="text-[11px] text-amber-800">
              Cơ chế khởi động lần lượt theo từng dãy để <strong>triệt tiêu hiện tượng sụt áp dòng tức thời (Inrush Current)</strong> trên hệ thống điện trường học.
            </div>
          </div>
          <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div id="wol-progress-bar" class="h-full bg-amber-500 transition-all duration-300" style="width: 10%"></div>
          </div>
        </div>
      `,
      timer: 2400,
      showConfirmButton: false,
      didOpen: () => {
        // Khởi động tuần tự từng hàng (Row 1 -> Row 5)
        const rows = [1, 2, 3, 4, 5];
        rows.forEach((r, idx) => {
          setTimeout(() => {
            this.playSound('beep');
            const rowComps = labComps.filter(c => c.position && c.position.row === r);
            rowComps.forEach(c => {
              if (c.status !== 'broken') c.powerState = 'on';
            });
            const pBar = document.getElementById('wol-progress-bar');
            if (pBar) pBar.style.width = `${((idx + 1) / rows.length) * 100}%`;
            this.loadLab(this.currentLabId);
          }, idx * 420);
        });
      },
      didClose: () => {
        window.saveStateToLocalStorage();
        window.updateDashboardKPIs();
        Swal.fire({
          icon: 'success',
          title: 'Khởi động Wake-on-LAN hoàn tất!',
          text: `Toàn bộ máy tính tại ${labTitle} đã được cấp nguồn đồng bộ thành công.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Kịch bản 2: Phân phối Đề thi & Bài giảng qua UDP Multicast
  runBroadcastScenario() {
    if (window.appState && window.appState.currentUser && window.appState.currentUser.role === 'student') {
      if (typeof window.checkPermission === 'function') window.checkPermission('manage_schedule', 'Phát bài giảng & đề thi');
      return;
    }
    this.playSound('broadcast');
    const labTitle = this.currentLabId;
    this.isBroadcasting = true;
    this.loadLab(this.currentLabId);

    Swal.fire({
      title: `<span class="text-base font-bold text-cyan-700">Phát Bài Giảng & Đề Thi (UDP Multicast)</span>`,
      html: `
        <div class="text-left text-xs space-y-2.5">
          <div class="p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-cyan-900">
            <div class="font-bold flex items-center mb-1">
              <i class="fa-solid fa-file-zipper text-cyan-600 mr-2 text-sm"></i>
              Tệp: De-Thi-Thuc-Hanh-Lap-Trinh.zip (48.5 MB)
            </div>
            <div class="text-[11px] text-cyan-800">
              Giao thức <strong>UDP Multicast (IGMP Snooping)</strong>: Máy giảng viên phát 01 luồng dữ liệu duy nhất, Switch Cisco tự động nhân bản ở tầng phần cứng tới toàn bộ máy học sinh, không gây nghẽn băng thông mạng LAN.
            </div>
          </div>
          <div>
            <div class="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
              <span>Tiến độ truyền tệp:</span>
              <span id="broadcast-percent" class="font-mono text-cyan-600">0%</span>
            </div>
            <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div id="broadcast-progress-bar" class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-200" style="width: 0%"></div>
            </div>
          </div>
        </div>
      `,
      timer: 2200,
      showConfirmButton: false,
      didOpen: () => {
        let prog = 0;
        const interval = setInterval(() => {
          prog += 20;
          const pEl = document.getElementById('broadcast-percent');
          const bEl = document.getElementById('broadcast-progress-bar');
          if (pEl) pEl.textContent = `${prog}%`;
          if (bEl) bEl.style.width = `${prog}%`;
          if (prog >= 100) clearInterval(interval);
        }, 350);
      },
      didClose: () => {
        this.isBroadcasting = false;
        this.loadLab(this.currentLabId);
        Swal.fire({
          icon: 'success',
          title: 'Phân phối đề thi thành công!',
          text: `100% máy học sinh tại ${labTitle} đã nhận đủ tệp thực hành và sẵn sàng làm bài.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Kịch bản 3: Khóa / Mở khóa Màn hình Học sinh (Classroom Management Lock)
  toggleScreenLockScenario() {
    if (window.appState && window.appState.currentUser && window.appState.currentUser.role === 'student') {
      if (typeof window.checkPermission === 'function') window.checkPermission('manage_schedule', 'Khóa / Mở khóa màn hình lớp học');
      return;
    }
    this.playSound('beep');
    this.isScreenLocked = !this.isScreenLocked;
    this.loadLab(this.currentLabId);

    const btnText = document.getElementById('btn-scenario-lock-text');
    const btn = document.getElementById('btn-scenario-lock');
    if (btnText) btnText.textContent = this.isScreenLocked ? 'Mở khóa lớp học' : 'Khóa màn hình lớp';
    if (btn) {
      btn.className = `px-2 py-1 ${this.isScreenLocked ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300'} rounded-md font-semibold text-[11px] transition flex items-center space-x-1`;
      const icon = btn.querySelector('i');
      if (icon) icon.className = `fa-solid ${this.isScreenLocked ? 'fa-lock' : 'fa-lock-open'}`;
    }

    Swal.fire({
      icon: this.isScreenLocked ? 'info' : 'success',
      title: this.isScreenLocked ? 'Đã khóa màn hình toàn bộ lớp học!' : 'Đã mở khóa màn hình lớp học!',
      html: `
        <div class="text-left text-xs space-y-1.5 text-slate-600">
          <p>Trạng thái: <strong>${this.isScreenLocked ? 'KHÓA (Tập trung nghe giảng)' : 'MỞ KHÓA (Tự do thực hành)'}</strong></p>
          <div class="p-2.5 bg-slate-50 border rounded-lg text-[11px]">
            <strong>Nguyên lý:</strong> Dịch vụ Classroom Agent chạy ngầm trên Windows chặn tín hiệu bàn phím và chuột (API BlockInput) và hiển thị màn hình khóa giảng viên qua cổng TCP 3000.
          </div>
        </div>
      `,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Kịch bản 4: Quét kiểm tra độ trễ mạng ICMP toàn phòng (Ping Sweep)
  runPingSweepScenario() {
    this.playSound('click');
    const labComps = window.appState.computers.filter(c => c.labId === this.currentLabId);
    let onlineCount = 0;
    let offlineCount = 0;
    const avgLatency = (Math.random() * 0.8 + 0.3).toFixed(1);

    labComps.forEach(c => {
      if (c.powerState === 'on' && c.status !== 'broken') {
        onlineCount++;
      } else {
        offlineCount++;
      }
    });

    Swal.fire({
      title: 'Đang thực hiện Ping Sweep (ICMP)...',
      html: `
        <div class="text-xs text-slate-500 mb-2">Gửi 4 gói tin ICMP Echo Request tới từng IP 192.168.1.x tại ${this.currentLabId}...</div>
        <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div class="bg-blue-600 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
        </div>
      `,
      timer: 1200,
      showConfirmButton: false,
      didClose: () => {
        this.playSound(offlineCount === 0 ? 'beep' : 'warning');
        Swal.fire({
          icon: offlineCount === 0 ? 'success' : 'info',
          title: `Kết quả chẩn đoán mạng LAN: ${this.currentLabId}`,
          html: `
            <div class="text-left text-xs space-y-2">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 font-mono">
                <div>Tổng số máy: <strong>${labComps.length} máy</strong></div>
                <div>Độ trễ trung bình: <strong class="text-emerald-600">${avgLatency} ms</strong></div>
                <div>Phản hồi tốt: <strong class="text-emerald-600">${onlineCount} máy (Online)</strong></div>
                <div>Mất kết nối: <strong class="text-rose-600">${offlineCount} máy (Offline)</strong></div>
              </div>
              <div class="text-slate-500 text-[11px] italic">
                Hạ tầng mạng LAN Cat6 và Switch Cisco Gigabit hoạt động ổn định, độ trễ RTT &lt; 1ms đạt chuẩn đào tạo công nghệ thông tin.
              </div>
            </div>
          `,
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  // Kịch bản 5: Mô phỏng phát sinh sự cố & Hướng dẫn quy trình xử lý
  runFaultInjectionScenario() {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('resolve_ticket', 'Mô phỏng phát sinh sự cố phần cứng')) return;
    this.playSound('warning');
    const candidates = window.appState.computers.filter(c => c.labId === this.currentLabId && ['good', 'in_use'].includes(c.status));
    if (candidates.length === 0) {
      Swal.fire('Thông báo', 'Không có máy nào khả dụng để tạo lỗi thử nghiệm.', 'info');
      return;
    }

    const randomComp = candidates[Math.floor(Math.random() * candidates.length)];
    const faultScenarios = [
      {
        title: 'Mất kết nối cáp mạng LAN',
        symptom: 'Đèn tín hiệu RJ45 tắt, máy tính mất IP tĩnh 192.168.1.x, không vào được mạng nội bộ.',
        cause: 'Đầu bấm mạng RJ45 bị lỏng hoặc đứt ngầm dây tín hiệu.',
        action: 'Bấm lại đầu hạt mạng Cat6 và cắm chặt vào cổng switch tương ứng.'
      },
      {
        title: 'Lỗi bộ nhớ RAM (Màn hình xanh BSOD)',
        symptom: 'Máy tự khởi động lại ngắt quãng, xuất hiện mã lỗi MEMORY_MANAGEMENT.',
        cause: 'Chân tiếp xúc khe RAM bị oxy hóa sau thời gian dài sử dụng.',
        action: 'Vệ sinh chân đồng thanh RAM bằng cồn chuyên dụng và cắm lại chắc chắn.'
      },
      {
        title: 'Nguồn điện chập chờn (Sụt áp)',
        symptom: 'Máy tắt nguồn đột ngột khi học sinh mở phần mềm nặng.',
        cause: 'Bộ nguồn PSU công suất thực bị suy giảm tụ điện.',
        action: 'Đo điện áp đường 12V/5V và thay thế nguồn dự phòng chính hãng.'
      }
    ];

    const fault = faultScenarios[Math.floor(Math.random() * faultScenarios.length)];
    randomComp.status = 'broken';
    randomComp.issue = fault.title;
    randomComp.powerState = 'off';

    // Ghi vào lịch sử bảo trì
    randomComp.history.unshift({
      date: new Date().toISOString().split('T')[0],
      action: 'Thử nghiệm phát sinh sự cố',
      technician: window.appState.currentUser ? window.appState.currentUser.name : 'Hệ thống tự động',
      note: `${fault.title}: ${fault.symptom}`
    });

    window.saveStateToLocalStorage();
    this.loadLab(this.currentLabId);
    window.updateDashboardKPIs();
    this.centerOnComputer(randomComp.id);

    Swal.fire({
      icon: 'warning',
      title: `<span class="text-rose-600">Mô phỏng sự cố: ${randomComp.id}</span>`,
      html: `
        <div class="text-left text-xs space-y-3">
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
            <div class="font-bold text-sm mb-1">${fault.title}</div>
            <div><strong>Triệu chứng:</strong> ${fault.symptom}</div>
          </div>

          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
            <div class="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-700">
              <i class="fa-solid fa-screwdriver-wrench mr-1"></i>Quy trình kỹ thuật xử lý:
            </div>
            <div><strong>1. Nguyên nhân:</strong> ${fault.cause}</div>
            <div><strong>2. Giải pháp khắc phục:</strong> ${fault.action}</div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Khắc phục sự cố này ngay',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b'
    }).then(res => {
      if (res.isConfirmed) {
        this.repairComputer(randomComp.id);
      }
    });
  }

  // Khắc phục máy tính hỏng trở lại trạng thái tốt
  repairComputer(compId) {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('resolve_ticket', 'Khắc phục & bảo trì thiết bị')) return;
    const comp = window.appState.computers.find(c => c.id === compId);
    if (!comp) return;

    comp.status = 'good';
    comp.issue = null;
    comp.powerState = 'on';

    comp.history.unshift({
      date: new Date().toISOString().split('T')[0],
      action: 'Bảo trì & Khắc phục thành công',
      technician: window.appState.currentUser ? window.appState.currentUser.name : 'KTV. Tổ Phòng máy',
      note: 'Đã hoàn tất kiểm tra và đưa máy về trạng thái hoạt động tốt'
    });

    this.playSound('beep');
    window.saveStateToLocalStorage();
    this.loadLab(this.currentLabId);
    window.updateDashboardKPIs();

    Swal.fire({
      icon: 'success',
      title: 'Đã khắc phục thành công!',
      text: `Máy ${comp.id} đã trở lại trạng thái hoạt động tốt và kết nối trực tuyến.`,
      timer: 1800,
      showConfirmButton: false
    });
  }

  // Khôi phục phòng máy về trạng thái chuẩn
  resetLabScenario() {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('control_power', 'Khôi phục trạng thái chuẩn phòng máy')) return;
    this.playSound('click');
    const labComps = window.appState.computers.filter(c => c.labId === this.currentLabId);
    labComps.forEach((c, idx) => {
      c.status = (idx < 20) ? 'good' : (idx < 27 ? 'in_use' : 'good');
      c.powerState = 'on';
      c.issue = null;
    });

    this.isScreenLocked = false;
    this.isBroadcasting = false;
    window.saveStateToLocalStorage();
    this.loadLab(this.currentLabId);
    window.updateDashboardKPIs();

    Swal.fire({
      icon: 'success',
      title: 'Đã khôi phục trạng thái chuẩn!',
      text: `Phòng ${this.currentLabId} đã sẵn sàng phục vụ các ca thực hành tiếp theo.`,
      timer: 1600,
      showConfirmButton: false
    });
  }
}

if (typeof window !== 'undefined') {
  window.LabSimulation = LabSimulation;
} else if (typeof globalThis !== 'undefined') {
  globalThis.LabSimulation = LabSimulation;
}
