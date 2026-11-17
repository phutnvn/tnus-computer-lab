/**
 * SCHEDULE MODULE - QUẢN LÝ THỜI KHÓA BIỂU & TỰ ĐỘNG VẬN HÀNH CA HỌC THEO GIỜ
 * Khoa Toán - Tin • Trường Đại học Khoa học (TNUS)
 * Hệ thống tự động vào ca khi đến giờ học (Auto Shift Activation & Wake-on-LAN),
 * Tự động trả phòng & giải phóng máy khi hết giờ, Ma trận thời khóa biểu 4 phòng máy,
 * Thuật toán phát hiện xung đột phòng/giảng viên, Kiểm tra công suất máy tính,
 * Xuất & Nhập Excel, In TKB chuẩn Đại học.
 */

// Cấu hình Hệ thống Tự Động Vào Ca Khi Đến Giờ
const _scheduleScope = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
_scheduleScope.autoShiftConfig = {
  enabled: true,            // Bật tính năng tự động vào ca khi đến giờ
  autoWakeOnLan: true,      // Tự động bật nguồn máy tính (Wake-on-LAN) khi vào ca
  autoReleaseOnEnd: true,   // Tự động trả phòng & giải phóng máy tính khi hết giờ
  soundNotification: true,  // Phát chuông báo hiệu khi vào ca
  simulatedTime: null,      // null: dùng giờ thực tế hệ thống; hoặc chuỗi 'HH:mm' khi thử nghiệm mô phỏng
  notifiedIds: new Set()    // Tránh thông báo lặp lại cho cùng một ca học
};

class ScheduleManager {
  constructor() {
    this.container = document.getElementById('schedule-module-container');
    this.selectedLab = 'all';
    
    // Khởi tạo ngày thực tế hiện hành theo đồng hồ hệ thống
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    this.todayStr = `${y}-${m}-${d}`;
    this.selectedDate = this.todayStr;

    this.selectedSession = 'all';     // all, sang, chieu, toi
    this.selectedStatus = 'all';      // all, live, upcoming, completed
    this.searchQuery = '';
    this.viewMode = 'matrix';         // 'matrix' (Ma trận TKB) hoặc 'list' (Danh sách)
    this.currentPage = 1;
    this.pageSize = 15;
    this.autoCheckInterval = null;
  }

  getTodayDateStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDateLabel(dateStr, includeTodayTag = true) {
    if (!dateStr || dateStr === 'all') return 'Tất cả các ngày trong kỳ';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayNames[d.getDay()] || '';
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    const isToday = dateStr === this.getTodayDateStr();
    if (includeTodayTag && isToday) {
      return `${dayName} (${formatted} - Hôm nay)`;
    }
    return `${dayName} (${formatted})`;
  }

  getDateOptionsHtml() {
    const schedules = window.appState && window.appState.schedules ? window.appState.schedules : [];
    const datesSet = new Set(schedules.map(s => s.date).filter(Boolean));
    const today = this.getTodayDateStr();
    datesSet.add(today);
    const sortedDates = Array.from(datesSet).sort();

    let html = `<option value="all">📅 Tất cả các ngày (${schedules.length} ca)</option>`;
    sortedDates.forEach(date => {
      const isSelected = this.selectedDate === date;
      const label = this.formatDateLabel(date, true);
      html += `<option value="${date}" ${isSelected ? 'selected' : ''}>${label}</option>`;
    });
    return html;
  }

  init() {
    this.todayStr = this.getTodayDateStr();

    // Luôn ưu tiên chọn ngày thực tế hôm nay nếu có lịch, hoặc ngày gần nhất
    if (window.appState && window.appState.schedules) {
      if (window.appState.schedules.some(s => s.date === this.todayStr)) {
        this.selectedDate = this.todayStr;
      } else {
        const allDates = [...new Set(window.appState.schedules.map(s => s.date))].sort();
        this.selectedDate = allDates[allDates.length - 1] || this.todayStr;
      }
    }

    this.renderView();
    this.bindEvents();
    this.initAutoShiftScheduler();
  }

  // Khởi động Daemon kiểm tra thời gian thực để Tự Động Vào Ca
  initAutoShiftScheduler() {
    if (this.autoCheckInterval) clearInterval(this.autoCheckInterval);

    // Chạy kiểm tra ngay khi nạp trang
    setTimeout(() => {
      this.checkAndAutoActivateShifts();
    }, 500);

    // Định kỳ quét mỗi 10 giây để đảm bảo vào ca chính xác từng phút
    this.autoCheckInterval = setInterval(() => {
      this.checkAndAutoActivateShifts();
    }, 10000);
  }

  // Thuật toán cốt lõi: Quét thời gian & Tự động vào ca / Trả phòng
  checkAndAutoActivateShifts() {
    if (!window.autoShiftConfig.enabled) {
      this.updateAutoShiftBannerUI();
      return;
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const actualToday = `${y}-${m}-${d}`;
    this.todayStr = actualToday;

    // Lấy thời gian hiện tại (hoặc giờ mô phỏng nếu người dùng đang thử nghiệm)
    let currentTimeStr = '';
    if (window.autoShiftConfig.simulatedTime) {
      currentTimeStr = window.autoShiftConfig.simulatedTime;
    } else {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      currentTimeStr = `${hh}:${mm}`;
    }

    const schedules = window.appState.schedules || [];
    let stateChanged = false;
    let newlyActivated = [];
    let newlyCompleted = [];

    // Tự động kiểm tra và cập nhật trạng thái thời gian thực cho TẤT CẢ các ca học
    schedules.forEach(sch => {
      // 1. Nếu ngày học trong quá khứ (< actualToday): Đã hoàn thành
      if (sch.date < actualToday) {
        if (sch.status !== 'Đã hoàn thành') {
          sch.status = 'Đã hoàn thành';
          stateChanged = true;
        }
        return;
      }

      // 2. Nếu ngày học trong tương lai (> actualToday): Chưa diễn ra
      if (sch.date > actualToday) {
        if (sch.status === 'Đang diễn ra') {
          sch.status = 'Chưa diễn ra';
          stateChanged = true;
        }
        return;
      }

      // 3. Nếu là ngày hôm nay (=== actualToday): So khớp chính xác theo giờ phút
      const start = sch.startTime || '07:24';
      const end = sch.endTime || '12:14';

      // 3.1. ĐIỀU KIỆN VÀO CA: startTime <= currentTime < endTime
      if (currentTimeStr >= start && currentTimeStr < end) {
        if (sch.status !== 'Đang diễn ra') {
          sch.status = 'Đang diễn ra';
          stateChanged = true;
          newlyActivated.push(sch);

          // Tự động kích hoạt các máy tính trong phòng sang "Đang sử dụng"
          window.appState.computers.forEach(comp => {
            if (comp.labId === sch.labId && (comp.status === 'good' || comp.status === 'in_use')) {
              comp.status = 'in_use';
              if (window.autoShiftConfig.autoWakeOnLan) {
                comp.powerState = 'on';
              }
            }
          });
        }
      }
      // 3.2. ĐIỀU KIỆN TRẢ PHÒNG KHI HẾT GIỜ: currentTime >= endTime
      else if (currentTimeStr >= end) {
        if (sch.status === 'Đang diễn ra') {
          sch.status = 'Đã hoàn thành';
          stateChanged = true;
          newlyCompleted.push(sch);

          // Kiểm tra xem phòng đó có ca nào khác đang học cùng lúc không
          const hasOtherActive = schedules.some(s => s.id !== sch.id && s.labId === sch.labId && s.date === actualToday && s.status === 'Đang diễn ra');
          if (!hasOtherActive && window.autoShiftConfig.autoReleaseOnEnd) {
            window.appState.computers.forEach(comp => {
              if (comp.labId === sch.labId && comp.status === 'in_use') {
                comp.status = 'good';
              }
            });
          }
        }
      }
      // 3.3. ĐIỀU KIỆN SẮP DIỄN RA HOẶC CHƯA HỌC: currentTime < startTime
      else if (currentTimeStr < start) {
        const [curH, curM] = currentTimeStr.split(':').map(Number);
        const [stH, stM] = start.split(':').map(Number);
        const diffMinutes = (stH * 60 + stM) - (curH * 60 + curM);
        if (diffMinutes <= 30 && diffMinutes > 0) {
          if (sch.status !== 'Sắp diễn ra') {
            sch.status = 'Sắp diễn ra';
            stateChanged = true;
          }
        } else {
          if (sch.status !== 'Chưa diễn ra') {
            sch.status = 'Chưa diễn ra';
            stateChanged = true;
          }
        }
      }
    });

    if (stateChanged) {
      window.saveStateToLocalStorage();
      this.renderMainContent();
      this.updateKPIs();
      if (typeof window.updateDashboardKPIs === 'function') {
        window.updateDashboardKPIs();
      }
      if (window.labSimulation && typeof window.labSimulation.loadLab === 'function') {
        window.labSimulation.loadLab(window.labSimulation.currentLabId);
      }
    }

    // Xử lý thông báo Toast và Chuông khi có ca vừa Tự Động Kích Hoạt
    if (newlyActivated.length > 0) {
      newlyActivated.forEach(sch => {
        const key = `start_${sch.id}_${sch.date}_${currentTimeStr}`;
        if (!window.autoShiftConfig.notifiedIds.has(key)) {
          window.autoShiftConfig.notifiedIds.add(key);
          this.playSchoolChime();
          this.showAutoShiftToast('start', sch);
        }
      });
    }

    // Xử lý thông báo Toast khi có ca vừa Tự Động Kết Thúc
    if (newlyCompleted.length > 0) {
      newlyCompleted.forEach(sch => {
        const key = `end_${sch.id}_${sch.date}_${currentTimeStr}`;
        if (!window.autoShiftConfig.notifiedIds.has(key)) {
          window.autoShiftConfig.notifiedIds.add(key);
          this.showAutoShiftToast('end', sch);
        }
      });
    }

    this.updateAutoShiftBannerUI();
  }

  // Phát âm thanh chuông báo giờ vào ca học (Web Audio API)
  playSchoolChime() {
    if (!window.autoShiftConfig.soundNotification) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Hợp âm Đô trưởng sáng)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.16);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.16 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.16);
        osc.stop(ctx.currentTime + idx * 0.16 + 0.36);
      });
    } catch (e) {
      // Bỏ qua nếu trình duyệt yêu cầu tương tác người dùng trước
    }
  }

  // Hiển thị thông báo Toast góc màn hình khi tự động vào ca / trả phòng
  showAutoShiftToast(type, sch) {
    if (typeof Swal === 'undefined') return;
    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };
    const labName = labNames[sch.labId] || sch.labId;

    if (type === 'start') {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `<span class="font-bold text-xs uppercase text-emerald-800"><i class="fa-solid fa-bell mr-1 animate-bounce text-amber-500"></i> Tự Động Vào Ca Học!</span>`,
        html: `
          <div class="text-left text-xs space-y-1">
            <div>Phòng: <strong class="text-blue-700">${labName}</strong> (${sch.shift})</div>
            <div>Môn: <strong>${sch.subject}</strong> (${sch.className})</div>
            <div class="text-[11px] text-slate-500">GV: ${sch.lecturer} • Máy tính đã được kích hoạt.</div>
          </div>
        `,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true
      });
    } else if (type === 'end') {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `<span class="font-bold text-xs uppercase text-slate-800"><i class="fa-solid fa-door-open mr-1 text-blue-600"></i> Tự Động Trả Phòng (Hết Giờ)</span>`,
        html: `
          <div class="text-left text-xs space-y-1">
            <div>Phòng: <strong class="text-slate-800">${labName}</strong> đã hoàn thành ca học.</div>
            <div>Môn: ${sch.subject} (${sch.className})</div>
            <div class="text-[11px] text-emerald-600 font-semibold">Đã giải phóng máy tính về trạng thái Hoạt động tốt.</div>
          </div>
        `,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true
      });
    }
  }

  // Chuyển đổi giữa chế độ Ma trận và Danh sách
  switchViewMode(mode) {
    this.viewMode = mode;
    this.renderMainContent();
    this.updateViewModeButtons();
  }

  updateViewModeButtons() {
    const btnMatrix = document.getElementById('sch-view-matrix');
    const btnList = document.getElementById('sch-view-list');
    if (btnMatrix && btnList) {
      if (this.viewMode === 'matrix') {
        btnMatrix.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs transition';
        btnList.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition';
      } else {
        btnMatrix.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition';
        btnList.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs transition';
      }
    }
  }

  // Thiết lập giờ mô phỏng để người dùng thử nghiệm tính năng tự động vào ca
  setSimulatedTime(timeStr) {
    window.autoShiftConfig.simulatedTime = timeStr;
    this.checkAndAutoActivateShifts();
    this.renderMainContent();
    this.updateKPIs();
  }

  // Cập nhật giao diện Banner Tự Động Hóa
  updateAutoShiftBannerUI() {
    const now = new Date();
    let curTime = '';
    if (window.autoShiftConfig.simulatedTime) {
      curTime = window.autoShiftConfig.simulatedTime + ' (Giờ mô phỏng)';
    } else {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      curTime = `${hh}:${mm}:${ss}`;
    }

    const curTimeEl = document.getElementById('auto-shift-current-time');
    if (curTimeEl) curTimeEl.textContent = curTime;

    // Tìm ca tiếp theo sắp diễn ra
    const schedules = window.appState.schedules || [];
    const todayTarget = this.selectedDate === 'all' ? (this.todayStr || '2026-11-17') : this.selectedDate;
    const todaySchedules = schedules.filter(s => s.date === todayTarget);

    const compareTime = window.autoShiftConfig.simulatedTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const upcomingSchedules = todaySchedules
      .filter(s => (s.startTime || '07:24') > compareTime)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const nextShiftEl = document.getElementById('auto-shift-next-countdown');
    if (nextShiftEl) {
      if (upcomingSchedules.length > 0) {
        const next = upcomingSchedules[0];
        const [curH, curM] = compareTime.split(':').map(Number);
        const [stH, stM] = (next.startTime || '07:24').split(':').map(Number);
        const diffMinutes = (stH * 60 + stM) - (curH * 60 + curM);
        const diffH = Math.floor(diffMinutes / 60);
        const diffM = diffMinutes % 60;
        const countdownStr = diffH > 0 ? `${diffH} giờ ${diffM} phút` : `${diffM} phút`;

        nextShiftEl.innerHTML = `
          <span class="text-amber-300 font-bold">Ca tiếp theo:</span> 
          <strong class="text-white">[${next.courseCode || next.labId}] ${next.subject}</strong> tại <strong class="text-blue-300">${next.labId}</strong> 
          • Bắt đầu lúc <span class="font-mono font-bold text-amber-300">${next.startTime}</span> (Còn ${countdownStr})
        `;
      } else {
        nextShiftEl.innerHTML = `<span class="text-slate-300">Đã hoàn thành tất cả các ca học trong ngày hôm nay.</span>`;
      }
    }
  }

  // Mở hộp thoại cài đặt tham số Tự Động Vào Ca
  openAutoShiftSettingsModal() {
    const cfg = window.autoShiftConfig;
    Swal.fire({
      title: `
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
            <i class="fa-solid fa-sliders"></i>
          </div>
          <div>
            <div class="text-base font-bold text-slate-900">Cài Đặt Tự Động Vào Ca Khi Đến Giờ</div>
            <div class="text-xs text-slate-500 font-normal">Điều khiển thông minh vòng đời ca thực hành phòng máy TNUS</div>
          </div>
        </div>
      `,
      html: `
        <div class="text-left space-y-3.5 text-xs pt-1">
          <!-- Switch 1: Tự động vào ca -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-800 text-sm flex items-center">
                <i class="fa-solid fa-bolt text-blue-600 mr-1.5"></i>Tự động vào ca khi đến giờ
              </div>
              <div class="text-slate-500 text-[11px] mt-0.5">Quét thời gian thực và kích hoạt ca học khi chạm mốc bắt đầu</div>
            </div>
            <input type="checkbox" id="cfg-auto-shift-enabled" ${cfg.enabled ? 'checked' : ''} class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
          </div>

          <!-- Switch 2: Wake-on-LAN -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-800 text-sm flex items-center">
                <i class="fa-solid fa-power-off text-emerald-600 mr-1.5"></i>Tự động bật nguồn máy tính (Wake-on-LAN)
              </div>
              <div class="text-slate-500 text-[11px] mt-0.5">Tự động khởi động toàn bộ máy tính trong phòng khi đến giờ học</div>
            </div>
            <input type="checkbox" id="cfg-auto-wol" ${cfg.autoWakeOnLan ? 'checked' : ''} class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
          </div>

          <!-- Switch 3: Tự động trả phòng -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-800 text-sm flex items-center">
                <i class="fa-solid fa-door-open text-indigo-600 mr-1.5"></i>Tự động trả phòng & giải phóng máy khi hết giờ
              </div>
              <div class="text-slate-500 text-[11px] mt-0.5">Đánh dấu ca đã xong và đưa máy tính về trạng thái Hoạt động tốt</div>
            </div>
            <input type="checkbox" id="cfg-auto-release" ${cfg.autoReleaseOnEnd ? 'checked' : ''} class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
          </div>

          <!-- Switch 4: Chuông âm thanh -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-800 text-sm flex items-center">
                <i class="fa-solid fa-bell text-amber-500 mr-1.5"></i>Phát âm thanh chuông báo vào ca
              </div>
              <div class="text-slate-500 text-[11px] mt-0.5">Phát hiệu ứng chuông vào lớp để báo hiệu giảng viên & sinh viên</div>
            </div>
            <input type="checkbox" id="cfg-auto-sound" ${cfg.soundNotification ? 'checked' : ''} class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
          </div>
        </div>
      `,
      width: '560px',
      showCancelButton: true,
      confirmButtonText: 'Lưu Cài Đặt',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        return {
          enabled: document.getElementById('cfg-auto-shift-enabled').checked,
          autoWakeOnLan: document.getElementById('cfg-auto-wol').checked,
          autoReleaseOnEnd: document.getElementById('cfg-auto-release').checked,
          soundNotification: document.getElementById('cfg-auto-sound').checked
        };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        Object.assign(window.autoShiftConfig, res.value);
        this.checkAndAutoActivateShifts();
        Swal.fire({
          icon: 'success',
          title: 'Đã lưu cấu hình tự động!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  // Khởi tạo khung giao diện chính của Phân hệ Lịch Thực hành
  renderView() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="space-y-4">
        <!-- 1. THANH TỔNG QUAN CHỈ SỐ VẬN HÀNH THỜI KHÓA BIỂU (KPI CARDS) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng Số Ca Học Kỳ I</div>
            <div class="text-xl font-black text-slate-800 mt-0.5">
              <span id="sch-kpi-total">100</span> <span class="text-xs font-semibold text-slate-500">ca</span>
            </div>
            <div class="text-[10px] text-blue-600 font-medium mt-1">4 phòng thực hành Tầng 5, A1</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ca Học Ngày Đang Chọn</div>
            <div class="text-xl font-black text-indigo-600 mt-0.5">
              <span id="sch-kpi-today">16</span> <span class="text-xs font-semibold text-slate-500">ca</span>
            </div>
            <div class="text-[10px] text-slate-500 font-medium mt-1" id="sch-kpi-date-label">14/11/2026 (Thứ Bảy)</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đang Diễn Ra (Live)</div>
            <div class="text-xl font-black text-emerald-600 mt-0.5">
              <span id="sch-kpi-live">0</span> <span class="text-xs font-semibold text-slate-500">phòng</span>
            </div>
            <div class="text-[10px] text-emerald-700 font-medium mt-1">Máy tính tự động kích hoạt</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng Lượt Sinh Viên</div>
            <div class="text-xl font-black text-amber-600 mt-0.5">
              <span id="sch-kpi-students">2,284</span> <span class="text-xs font-semibold text-slate-500">lượt</span>
            </div>
            <div class="text-[10px] text-slate-500 font-medium mt-1">Trung bình 23 SV / ca</div>
          </div>

          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Công Suất Phòng Máy</div>
            <div class="text-xl font-black text-cyan-600 mt-0.5">
              <span id="sch-kpi-occupancy">91.8%</span>
            </div>
            <div class="text-[10px] text-teal-700 font-medium mt-1">Tỷ lệ lấp đầy các ca học</div>
          </div>
        </div>

        <!-- 2. BANNER BỘ TỰ ĐỘNG VẬN HÀNH CA HỌC THEO GIỜ (SMART SHIFT AUTOMATION BAR) -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-3.5 rounded-xl border border-blue-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                TỰ ĐỘNG VÀO CA: ĐANG BẬT
              </span>
              <span class="text-xs text-slate-300">• Đồng hồ: <span id="auto-shift-current-time" class="font-mono font-bold text-cyan-300">--:--:--</span></span>
            </div>
            <div id="auto-shift-next-countdown" class="text-xs text-slate-200">
              Đang xác định ca học tiếp theo...
            </div>
          </div>

          <!-- Các nút mô phỏng & điều khiển nhanh -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="text-slate-400 font-semibold text-[11px] mr-1 hidden sm:inline">Mô phỏng giờ:</span>
            <button onclick="window.scheduleManager.setSimulatedTime(null)" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-medium transition" title="Dùng giờ thực tế hệ thống">
              ⏱ Thực tế
            </button>
            <button onclick="window.scheduleManager.setSimulatedTime('07:30')" class="px-2 py-1 bg-blue-900/60 hover:bg-blue-800 border border-blue-500/50 text-blue-200 rounded font-mono font-bold transition" title="Thử nghiệm vào Ca 1 sáng">
              07:30 (Ca 1)
            </button>
            <button onclick="window.scheduleManager.setSimulatedTime('09:30')" class="px-2 py-1 bg-blue-900/60 hover:bg-blue-800 border border-blue-500/50 text-blue-200 rounded font-mono font-bold transition" title="Thử nghiệm vào Ca 2 sáng">
              09:30 (Ca 2)
            </button>
            <button onclick="window.scheduleManager.setSimulatedTime('13:30')" class="px-2 py-1 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 text-indigo-200 rounded font-mono font-bold transition" title="Thử nghiệm vào Ca 3 chiều">
              13:30 (Ca 3)
            </button>
            <button onclick="window.scheduleManager.setSimulatedTime('15:30')" class="px-2 py-1 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 text-indigo-200 rounded font-mono font-bold transition" title="Thử nghiệm vào Ca 4 chiều">
              15:30 (Ca 4)
            </button>
            <button onclick="window.scheduleManager.openAutoShiftSettingsModal()" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition flex items-center space-x-1 shadow-xs ml-1" title="Cài đặt cơ chế tự động">
              <i class="fa-solid fa-gear"></i>
              <span>Cài đặt</span>
            </button>
          </div>
        </div>

        <!-- 3. THANH CÔNG CỤ ĐIỀU HƯỚNG & BỘ LỌC THÔNG MINH -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-800 flex items-center">
                <i class="fa-solid fa-calendar-check text-blue-600 mr-2"></i>Quản Lý Thời Khóa Biểu Thực Hành Phòng Máy
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Khoa Toán - Tin • Quản trị phòng máy Tầng 5, Nhà A1 • Cán bộ phụ trách: <strong>ThS. Trịnh Minh Phú (0975.090.666)</strong>
              </p>
            </div>

            <!-- Các nút hành động chính -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Nút chuyển chế độ xem -->
              <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button id="sch-view-matrix" onclick="window.scheduleManager.switchViewMode('matrix')" 
                  class="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs transition flex items-center space-x-1" title="Xem dạng ma trận thời khóa biểu">
                  <i class="fa-solid fa-table-cells"></i>
                  <span>Ma trận TKB</span>
                </button>
                <button id="sch-view-list" onclick="window.scheduleManager.switchViewMode('list')" 
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center space-x-1" title="Xem dạng bảng danh sách">
                  <i class="fa-solid fa-list-ul"></i>
                  <span>Danh sách</span>
                </button>
              </div>

              <!-- In Thời khóa biểu -->
              <button id="btn-print-schedule" onclick="window.scheduleManager.printSchedule()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs">
                <i class="fa-solid fa-print text-slate-600"></i>
                <span>In TKB</span>
              </button>

              <!-- Nhập Excel -->
              <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer">
                <i class="fa-solid fa-file-import text-blue-600"></i>
                <span>Nhập TKB Excel</span>
                <input type="file" id="input-import-schedule" accept=".xlsx, .xls, .csv" class="hidden">
              </label>

              <!-- Xuất Excel -->
              <button id="btn-export-schedule" onclick="window.scheduleManager.exportScheduleToExcel()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs">
                <i class="fa-solid fa-file-excel"></i>
                <span>Xuất Excel</span>
              </button>

              <!-- Đăng ký ca mới -->
              <button id="btn-add-schedule" onclick="window.scheduleManager.showAddScheduleModal()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5">
                <i class="fa-solid fa-calendar-plus"></i>
                <span>Xếp Lịch Mới</span>
              </button>
            </div>
          </div>

          <!-- Bộ lọc chi tiết -->
          <div class="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
            <!-- Nút chọn Hôm nay nhanh -->
            <button onclick="window.scheduleManager.selectTodayQuick()" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold transition flex items-center space-x-1">
              <i class="fa-solid fa-sun text-amber-500"></i>
              <span>Hôm nay (${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')})</span>
            </button>

            <!-- Chọn ngày trong học kỳ -->
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">Ngày học:</span>
              <select id="sch-date-select" class="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-blue-700">
                ${this.getDateOptionsHtml()}
              </select>
            </div>

            <!-- Lọc theo phòng máy -->
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">Phòng:</span>
              <select id="sch-lab-filter" class="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium">
                <option value="all">Tất cả phòng (4 phòng)</option>
                <option value="PM1">PM 1 (A1-503) - 30 máy</option>
                <option value="PM2">PM2 (A1-504) - 26 máy</option>
                <option value="PM3">PM3 (A1-505) - 24 máy</option>
                <option value="PM4">PM4 (A1-506) - 24 máy</option>
              </select>
            </div>

            <!-- Lọc theo buổi -->
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">Buổi:</span>
              <select id="sch-session-filter" class="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium">
                <option value="all">Tất cả các buổi</option>
                <option value="sang">Buổi Sáng (Tiết 1 - 5)</option>
                <option value="chieu">Buổi Chiều (Tiết 7 - 11)</option>
                <option value="toi">Buổi Tối (Tiết 10 - 12)</option>
              </select>
            </div>

            <!-- Lọc theo trạng thái -->
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">Trạng thái:</span>
              <select id="sch-status-filter" class="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium">
                <option value="all">Tất cả trạng thái</option>
                <option value="live">🔵 Đang diễn ra</option>
                <option value="upcoming">🟡 Sắp diễn ra / Chưa học</option>
                <option value="completed">⚪ Đã hoàn thành</option>
              </select>
            </div>

            <!-- Ô tìm kiếm thông minh -->
            <div class="relative w-48 sm:w-56 ml-auto">
              <i class="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input type="text" id="sch-search-input" placeholder="Tìm môn, mã HP, giảng viên..." class="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
          </div>
        </div>

        <!-- 4. KHU VỰC NỘI DUNG CHÍNH (DYNAMIC CONTAINER CHO MATRIX HOẶC LIST) -->
        <div id="sch-dynamic-container">
          <!-- Render qua renderMainContent() -->
        </div>
      </div>
    `;

    this.renderMainContent();
    this.updateKPIs();
  }

  // Cập nhật các thẻ KPI đầu trang
  updateKPIs() {
    const schedules = window.appState.schedules || [];
    const total = schedules.length;
    const todayTarget = this.selectedDate === 'all' ? this.getTodayDateStr() : this.selectedDate;
    const todayList = schedules.filter(s => s.date === todayTarget);
    const liveCount = schedules.filter(s => s.status === 'Đang diễn ra').length;
    const totalStudents = schedules.reduce((sum, s) => sum + (parseInt(s.studentCount, 10) || 0), 0);

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('sch-kpi-total', total);
    setEl('sch-kpi-today', todayList.length);
    setEl('sch-kpi-live', liveCount);
    setEl('sch-kpi-students', totalStudents.toLocaleString('vi-VN'));

    setEl('sch-kpi-date-label', this.formatDateLabel(this.selectedDate, true));
  }

  // Chọn ngày hôm nay nhanh
  selectTodayQuick() {
    this.selectedDate = this.getTodayDateStr();
    const dateSelect = document.getElementById('sch-date-select');
    if (dateSelect) dateSelect.value = this.selectedDate;
    this.renderMainContent();
    this.updateKPIs();
  }

  // Gán sự kiện cho các điều khiển
  bindEvents() {
    const dateSelect = document.getElementById('sch-date-select');
    const labFilter = document.getElementById('sch-lab-filter');
    const sessionFilter = document.getElementById('sch-session-filter');
    const statusFilter = document.getElementById('sch-status-filter');
    const searchInput = document.getElementById('sch-search-input');
    const importInput = document.getElementById('input-import-schedule');

    if (dateSelect) {
      dateSelect.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.currentPage = 1;
        this.renderMainContent();
        this.updateKPIs();
      });
    }

    if (labFilter) {
      labFilter.addEventListener('change', (e) => {
        this.selectedLab = e.target.value;
        this.currentPage = 1;
        this.renderMainContent();
      });
    }

    if (sessionFilter) {
      sessionFilter.addEventListener('change', (e) => {
        this.selectedSession = e.target.value;
        this.currentPage = 1;
        this.renderMainContent();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.selectedStatus = e.target.value;
        this.currentPage = 1;
        this.renderMainContent();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toUpperCase();
        this.currentPage = 1;
        this.renderMainContent();
      });
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        this.handleExcelImport(e);
      });
    }
  }

  // Lọc danh sách ca học theo các tiêu chí kết hợp
  getFilteredSchedules() {
    let list = [...(window.appState.schedules || [])];

    if (this.selectedDate && this.selectedDate !== 'all') {
      list = list.filter(s => s.date === this.selectedDate);
    }

    if (this.selectedLab !== 'all') {
      list = list.filter(s => s.labId === this.selectedLab);
    }

    if (this.selectedSession !== 'all') {
      list = list.filter(s => {
        const shiftStr = (s.shift || '').toLowerCase();
        const start = s.startTime || '07:00';
        const hour = parseInt(start.split(':')[0], 10);
        if (this.selectedSession === 'sang') return hour < 12 || shiftStr.includes('sáng');
        if (this.selectedSession === 'chieu') return (hour >= 12 && hour < 18) || shiftStr.includes('chiều');
        if (this.selectedSession === 'toi') return hour >= 18 || shiftStr.includes('tối');
        return true;
      });
    }

    if (this.selectedStatus !== 'all') {
      list = list.filter(s => {
        if (this.selectedStatus === 'live') return s.status === 'Đang diễn ra';
        if (this.selectedStatus === 'upcoming') return s.status === 'Sắp diễn ra' || s.status === 'Chưa diễn ra';
        if (this.selectedStatus === 'completed') return s.status === 'Đã hoàn thành';
        return true;
      });
    }

    if (this.searchQuery) {
      const q = this.searchQuery;
      list = list.filter(s => 
        (s.subject && s.subject.toUpperCase().includes(q)) ||
        (s.courseCode && s.courseCode.toUpperCase().includes(q)) ||
        (s.className && s.className.toUpperCase().includes(q)) ||
        (s.lecturer && s.lecturer.toUpperCase().includes(q)) ||
        (s.id && s.id.toUpperCase().includes(q))
      );
    }

    return list;
  }

  // Render nội dung chính theo viewMode hiện tại
  renderMainContent() {
    const container = document.getElementById('sch-dynamic-container');
    if (!container) return;

    if (this.viewMode === 'matrix') {
      container.innerHTML = this.buildMatrixViewHtml();
    } else {
      container.innerHTML = this.buildListViewHtml();
    }
  }

  loadScheduleTable() {
    this.renderMainContent();
    this.updateKPIs();
    this.checkAndAutoActivateShifts();
  }

  // =========================================================================
  // VIEW MODE 1: MA TRẬN THỜI KHÓA BIỂU 4 PHÒNG MÁY (WEEKLY MATRIX VIEW)
  // =========================================================================
  buildMatrixViewHtml() {
    const targetDate = this.selectedDate === 'all' ? this.getTodayDateStr() : this.selectedDate;
    const dateSchedules = (window.appState.schedules || []).filter(s => s.date === targetDate);

    // Danh sách 4 phòng máy chuẩn TNUS (Tầng 5, Nhà A1)
    const labs = [
      { id: 'PM1', name: 'PM 1 (A1-503)', cap: 30, brand: 'FPT Elead Core i5-14400', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
      { id: 'PM2', name: 'PM2 (A1-504)', cap: 26, brand: 'Asus & FPT Elead', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      { id: 'PM3', name: 'PM3 (A1-505)', cap: 24, brand: 'Dell OptiPlex Core i5', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      { id: 'PM4', name: 'PM4 (A1-506)', cap: 24, brand: 'Dell OptiPlex Core i5', badge: 'bg-teal-50 text-teal-700 border-teal-200' }
    ];

    // Khung các ca thực hành chuẩn trong ngày
    const timeSlots = [
      { id: 'shift-1', label: 'Ca 1 (Sáng)', time: '07:24 - 09:14', periods: 'Tiết 1-2', session: 'Sáng' },
      { id: 'shift-2', label: 'Ca 2 (Sáng)', time: '09:24 - 11:14', periods: 'Tiết 3-4', session: 'Sáng' },
      { id: 'shift-full-am', label: 'Ca Dài (Sáng)', time: '07:24 - 12:14', periods: 'Tiết 1-5', session: 'Sáng' },
      { id: 'shift-mid', label: 'Ca Chuyển Tiếp', time: '11:24 - 13:14', periods: 'Tiết 5-6', session: 'Trưa' },
      { id: 'shift-3', label: 'Ca 3 (Chiều)', time: '13:24 - 15:14', periods: 'Tiết 7-8', session: 'Chiều' },
      { id: 'shift-4', label: 'Ca 4 (Chiều)', time: '15:24 - 17:14', periods: 'Tiết 9-10', session: 'Chiều' },
      { id: 'shift-full-pm', label: 'Ca Dài (Chiều)', time: '13:24 - 18:14', periods: 'Tiết 7-11', session: 'Chiều' },
      { id: 'shift-5', label: 'Ca 5 (Tối)', time: '16:24 - 19:14', periods: 'Tiết 10-12', session: 'Tối' }
    ];

    let displaySlots = timeSlots;
    if (this.selectedSession === 'sang') {
      displaySlots = timeSlots.filter(t => t.session === 'Sáng');
    } else if (this.selectedSession === 'chieu') {
      displaySlots = timeSlots.filter(t => t.session === 'Chiều' || t.session === 'Trưa');
    } else if (this.selectedSession === 'toi') {
      displaySlots = timeSlots.filter(t => t.session === 'Tối');
    }

    let displayLabs = labs;
    if (this.selectedLab !== 'all') {
      displayLabs = labs.filter(l => l.id === this.selectedLab);
    }

    return `
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Tiêu đề ngày trên Ma trận -->
        <div class="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-blue-600"></span>
            <span class="font-bold text-slate-800 text-sm">Thời Khóa Biểu Ngày ${this.formatDateLabel(targetDate, true)}</span>
            <span class="text-xs text-slate-500 font-medium">(${dateSchedules.length} ca học đã được xếp phòng)</span>
          </div>
          <div class="flex items-center space-x-3 text-xs">
            <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5 animate-pulse"></span>Đang diễn ra</span>
            <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>Sắp diễn ra</span>
            <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-slate-400 mr-1.5"></span>Đã hoàn thành</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th class="p-3 w-40 text-center border-r border-slate-200 uppercase tracking-wider text-[11px]">
                  Khung Giờ / Ca
                </th>
                ${displayLabs.map(lab => `
                  <th class="p-3 border-r border-slate-200 last:border-r-0 min-w-[240px]">
                    <div class="flex items-center justify-between">
                      <span onclick="window.navigateToLab('${lab.id}')" class="font-black text-slate-800 text-sm hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1.5 transition" title="Mở Sơ đồ 2D phòng ${lab.id}">
                        ${lab.name} <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-blue-500 opacity-70"></i>
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${lab.badge}">${lab.cap} Máy</span>
                    </div>
                    <div class="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">${lab.brand}</div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${displaySlots.map(slot => {
                return `
                  <tr class="hover:bg-slate-50/50 transition">
                    <!-- Cột Ca học & Khung giờ -->
                    <td class="p-3 bg-slate-50/60 border-r border-slate-200 text-center align-top font-mono">
                      <div class="font-bold text-slate-800 text-xs">${slot.label}</div>
                      <div class="text-blue-700 font-semibold text-[11px] mt-0.5">${slot.time}</div>
                      <div class="text-[10px] text-slate-500 font-sans mt-0.5">${slot.periods}</div>
                    </td>

                    <!-- Các ô phòng máy -->
                    ${displayLabs.map(lab => {
                      const item = dateSchedules.find(s => {
                        if (s.labId !== lab.id) return false;
                        const sShift = (s.shift || '').toLowerCase();
                        if (slot.time.includes('07:24 - 09:14') && sShift.includes('07:24 - 09:14')) return true;
                        if (slot.time.includes('09:24 - 11:14') && sShift.includes('09:24 - 11:14')) return true;
                        if (slot.time.includes('07:24 - 12:14') && sShift.includes('07:24 - 12:14')) return true;
                        if (slot.time.includes('11:24 - 13:14') && sShift.includes('11:24 - 13:14')) return true;
                        if (slot.time.includes('13:24 - 15:14') && sShift.includes('13:24 - 15:14')) return true;
                        if (slot.time.includes('15:24 - 17:14') && sShift.includes('15:24 - 17:14')) return true;
                        if (slot.time.includes('13:24 - 18:14') && sShift.includes('13:24 - 18:14')) return true;
                        if (slot.time.includes('16:24 - 19:14') && sShift.includes('16:24 - 19:14')) return true;
                        return false;
                      });

                      if (item) {
                        const isLive = item.status === 'Đang diễn ra';
                        const isUpcoming = item.status === 'Sắp diễn ra';
                        const borderStyle = isLive ? 'border-2 border-blue-500 bg-blue-50/60 shadow-xs' : 
                                            (isUpcoming ? 'border border-amber-300 bg-amber-50/40' : 'border border-slate-200 bg-slate-50/40 text-slate-600');
                        
                        return `
                          <td class="p-2.5 border-r border-slate-200 last:border-r-0 align-top">
                            <div class="p-2.5 rounded-xl ${borderStyle} transition hover:shadow-md flex flex-col justify-between" style="min-height: 140px;">
                              <div>
                                <div class="flex items-center justify-between mb-1.5">
                                  <span class="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-white border border-slate-200 text-slate-800">
                                    ${item.courseCode || 'TIN-TNUS'}
                                  </span>
                                  ${isLive ? `
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                                      <span class="w-1.5 h-1.5 rounded-full bg-white mr-1"></span>Đang học
                                    </span>
                                  ` : (isUpcoming ? `
                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      Sắp tới
                                    </span>
                                  ` : `
                                    <span class="text-[10px] text-slate-400 font-medium">Đã xong</span>
                                  `)}
                                </div>

                                <div class="font-bold text-slate-900 text-xs leading-snug line-clamp-2 hover:text-blue-700 cursor-pointer" onclick="window.scheduleManager.showScheduleDetailModal('${item.id}')">
                                  ${item.subject}
                                </div>
                                <div class="text-[11px] text-slate-600 font-medium mt-1 truncate" title="${item.className}">
                                  Lớp: ${item.className}
                                </div>
                                <div class="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                                  <span><i class="fa-solid fa-user-tie mr-1 text-slate-400"></i>${item.lecturer}</span>
                                  <span class="font-mono font-bold text-blue-700">${item.studentCount} SV</span>
                                </div>
                              </div>

                              <!-- Nút hành động nhanh trên ô -->
                              <div class="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                                <div class="flex items-center space-x-1">
                                  <button onclick="window.scheduleManager.showScheduleDetailModal('${item.id}')" class="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Xem chi tiết">
                                    <i class="fa-regular fa-eye"></i>
                                  </button>
                                  <button onclick="window.scheduleManager.showEditScheduleModal('${item.id}')" class="p-1 text-amber-600 hover:bg-amber-100 rounded" title="Chỉnh sửa ca học">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                  </button>
                                  <button onclick="window.scheduleManager.deleteSchedule('${item.id}')" class="p-1 text-rose-500 hover:bg-rose-100 rounded" title="Hủy ca học">
                                    <i class="fa-regular fa-trash-can"></i>
                                  </button>
                                </div>

                                ${isLive ? `
                                  <button onclick="window.scheduleManager.toggleSessionActive('${item.id}', false)" 
                                    class="px-2 py-0.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-[10px] transition shadow-xs">
                                    Trả phòng
                                  </button>
                                ` : `
                                  <button onclick="window.scheduleManager.toggleSessionActive('${item.id}', true)" 
                                    class="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition shadow-xs flex items-center">
                                    <i class="fa-solid fa-play text-[9px] mr-1"></i>Vào ca
                                  </button>
                                `}
                              </div>
                            </div>
                          </td>
                        `;
                      } else {
                        // Ô trống: Hiển thị nút xếp lịch trực tiếp
                        return `
                          <td class="p-2.5 border-r border-slate-200 last:border-r-0 align-middle text-center">
                            <div onclick="window.scheduleManager.showAddScheduleModal('${lab.id}', '${slot.time} (${slot.periods})', '${targetDate}')" 
                              class="border border-dashed border-slate-200 rounded-xl p-3 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 cursor-pointer transition flex flex-col items-center justify-center space-y-1 group" style="min-height: 140px;">
                              <div class="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-plus text-slate-400 group-hover:text-blue-600"></i>
                              </div>
                              <span class="text-[11px] font-semibold">Phòng trống</span>
                              <span class="text-[10px] text-slate-400 group-hover:text-blue-500">Bấm để xếp lịch</span>
                            </div>
                          </td>
                        `;
                      }
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // VIEW MODE 2: DANH SÁCH THỜI KHÓA BIỂU CHI TIẾT (LIST / TABLE VIEW)
  // =========================================================================
  buildListViewHtml() {
    const list = this.getFilteredSchedules();
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageItems = list.slice(startIndex, startIndex + this.pageSize);

    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };

    let tableRows = '';
    if (pageItems.length === 0) {
      tableRows = `
        <tr>
          <td colspan="9" class="py-12 text-center text-slate-400">
            <i class="fa-regular fa-calendar-xmark text-3xl mb-2 block text-slate-300"></i>
            <span class="text-sm font-semibold">Không tìm thấy ca thực hành nào phù hợp với bộ lọc hiện tại.</span>
            <p class="text-xs text-slate-400 mt-1">Vui lòng thử chọn lại ngày, phòng máy hoặc từ khóa tìm kiếm.</p>
          </td>
        </tr>
      `;
    } else {
      tableRows = pageItems.map(item => {
        let statusBadge = '';
        if (item.status === 'Đang diễn ra') {
          statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 animate-pulse">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>Đang diễn ra
          </span>`;
        } else if (item.status === 'Sắp diễn ra') {
          statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>Sắp diễn ra
          </span>`;
        } else {
          statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
            Chưa diễn ra
          </span>`;
        }

        return `
          <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.scheduleManager.showScheduleDetailModal('${item.id}')">
            <td class="py-3 px-3 font-mono font-bold text-blue-600">${item.id}</td>
            <td class="py-3 px-3 font-bold">
              <span onclick="event.stopPropagation(); window.navigateToLab('${item.labId}')" 
                class="px-2 py-0.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded font-mono text-[11px] cursor-pointer transition flex items-center gap-1 w-max" title="Mở sơ đồ 2D phòng ${item.labId}">
                ${labNames[item.labId] || item.labId} <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              </span>
            </td>
            <td class="py-3 px-3 font-mono text-slate-700 text-[11px]">${item.date}</td>
            <td class="py-3 px-3 font-semibold text-slate-800 text-[11px]">${item.shift}</td>
            <td class="py-3 px-3">
              <div class="font-bold text-slate-800 flex items-center">
                ${item.courseCode ? `<span class="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] rounded mr-1.5 font-bold">${item.courseCode}</span>` : ''}
                ${item.subject}
              </div>
              <div class="text-[11px] text-slate-500 font-mono mt-0.5">Lớp: ${item.className}</div>
            </td>
            <td class="py-3 px-3 font-medium text-slate-700">
              <i class="fa-solid fa-user-tie text-slate-400 mr-1"></i>${item.lecturer}
            </td>
            <td class="py-3 px-3 text-center font-bold font-mono text-blue-700">${item.studentCount} SV</td>
            <td class="py-3 px-3 text-center">${statusBadge}</td>
            <td class="py-3 px-3 text-right space-x-1" onclick="event.stopPropagation()">
              ${item.status === 'Đang diễn ra' ? `
                <button onclick="window.scheduleManager.toggleSessionActive('${item.id}', false)" 
                  class="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-bold transition shadow-xs" title="Kết thúc ca học, giải phóng máy">
                  Trả phòng
                </button>
              ` : `
                <button onclick="window.scheduleManager.toggleSessionActive('${item.id}', true)" 
                  class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-[11px] font-bold transition" title="Kích hoạt phòng máy đang sử dụng">
                  <i class="fa-solid fa-play mr-1"></i>Vào ca
                </button>
              `}
              <button onclick="window.navigateToLab('${item.labId}')" 
                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Xem sơ đồ 2D phòng ${item.labId}">
                <i class="fa-solid fa-desktop"></i>
              </button>
              <button onclick="window.scheduleManager.showEditScheduleModal('${item.id}')" 
                class="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition" title="Chỉnh sửa ca học">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="window.scheduleManager.deleteSchedule('${item.id}')" 
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Hủy ca học">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <button onclick="window.scheduleManager.changePage(${i})" class="px-2.5 py-1 text-xs rounded border ${i === this.currentPage ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
          ${i}
        </button>
      `;
    }

    return `
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-3">Mã lịch</th>
                <th class="py-3 px-3">Phòng máy</th>
                <th class="py-3 px-3">Ngày học</th>
                <th class="py-3 px-3">Ca thực hành</th>
                <th class="py-3 px-3">Lớp & Môn học</th>
                <th class="py-3 px-3">Giảng viên</th>
                <th class="py-3 px-3 text-center">Sĩ số</th>
                <th class="py-3 px-3 text-center">Trạng thái</th>
                <th class="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              ${tableRows}
            </tbody>
          </table>
        </div>

        <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div>Hiển thị ${pageItems.length}/${totalItems} ca học (${this.selectedDate === 'all' ? 'Toàn bộ học kỳ' : 'Ngày ' + this.selectedDate})</div>
          <div class="flex items-center space-x-1">
            ${paginationHtml}
          </div>
        </div>
      </div>
    `;
  }

  changePage(page) {
    this.currentPage = page;
    this.renderMainContent();
  }

  // =========================================================================
  // CHI TIẾT CA HỌC (SCHEDULE DETAIL MODAL)
  // =========================================================================
  showScheduleDetailModal(scheduleId) {
    const item = window.appState.schedules.find(s => s.id === scheduleId);
    if (!item) return;

    const labMap = {
      'PM1': { name: 'PM 1 (A1-503)', cap: 30, room: 'Phòng A1-503 • Tầng 5, Nhà A1', config: 'FPT Elead Core i5-14400, RAM 16GB' },
      'PM2': { name: 'PM2 (A1-504)', cap: 26, room: 'Phòng A1-504 • Tầng 5, Nhà A1', config: 'Asus & FPT Elead Core i5' },
      'PM3': { name: 'PM3 (A1-505)', cap: 24, room: 'Phòng A1-505 • Tầng 5, Nhà A1', config: 'Dell OptiPlex Core i5-10505, RAM 8GB' },
      'PM4': { name: 'PM4 (A1-506)', cap: 24, room: 'Phòng A1-506 • Tầng 5, Nhà A1', config: 'Dell OptiPlex Core i5-10505, RAM 8GB' }
    };
    const lab = labMap[item.labId] || { name: item.labId, cap: 30, room: 'Tầng 5, Nhà A1', config: 'Máy đồng bộ' };
    const isLive = item.status === 'Đang diễn ra';

    Swal.fire({
      title: `
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
            <i class="fa-solid fa-calendar-day"></i>
          </div>
          <div>
            <div class="text-base font-bold text-slate-900">${item.subject}</div>
            <div class="text-xs text-slate-500 font-normal">Mã lịch: ${item.id} • ${item.courseCode || 'TIN-TNUS'}</div>
          </div>
        </div>
      `,
      html: `
        <div class="text-left space-y-3.5 text-xs pt-1">
          <!-- Trạng thái ca -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Trạng thái vận hành</div>
              <div class="font-bold text-sm text-slate-800 mt-0.5">${item.status}</div>
            </div>
            <div>
              ${isLive ? `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white animate-pulse">
                  <span class="w-2 h-2 rounded-full bg-white mr-1.5"></span>Đang học trực tiếp
                </span>
              ` : `
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                  Chưa vào ca
                </span>
              `}
            </div>
          </div>

          <!-- Thông tin phòng & thời gian -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <div class="text-[10px] text-blue-700 font-bold uppercase mb-1">Phòng Thực Hành</div>
              <div class="text-sm font-black text-blue-900">${lab.name}</div>
              <div class="text-slate-600 mt-0.5">${lab.room}</div>
              <div class="text-[10px] text-slate-500 mt-1">Sức chứa: <strong>${lab.cap} máy tính</strong> (${lab.config})</div>
            </div>

            <div class="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
              <div class="text-[10px] text-indigo-700 font-bold uppercase mb-1">Thời Gian Ca Học</div>
              <div class="text-sm font-black text-indigo-900">${item.date}</div>
              <div class="text-indigo-800 font-semibold mt-0.5">${item.shift}</div>
              <div class="text-[10px] text-slate-500 mt-1">Tiết học: ${item.startPeriod || 1} đến ${item.endPeriod || 4}</div>
            </div>
          </div>

          <!-- Thông tin Giảng viên & Lớp -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-slate-500">Giảng viên phụ trách:</span>
                <div class="font-bold text-slate-900 text-sm mt-0.5">
                  <i class="fa-solid fa-chalkboard-user text-blue-600 mr-1"></i>${item.lecturer}
                </div>
              </div>
              <div>
                <span class="text-slate-500">Lớp học phần:</span>
                <div class="font-bold text-slate-900 text-sm mt-0.5">${item.className}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <div>
                <span class="text-slate-500">Sĩ số sinh viên:</span>
                <strong class="text-blue-700 font-mono text-sm ml-1">${item.studentCount} SV</strong>
              </div>
              <div>
                <span class="text-slate-500">Cán bộ phụ trách phòng:</span>
                <strong class="text-slate-800 ml-1">ThS. Trịnh Minh Phú</strong>
              </div>
            </div>
          </div>

          <!-- Ghi chú / Phần mềm cần thiết -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div class="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Nội dung bài thực hành & Yêu cầu phần mềm</div>
            <div class="text-slate-700">${item.note || 'Cần cài đặt MS Office, Dev C++, Visual Studio Code, Python 3.12.'}</div>
          </div>

          <!-- Liên kết đồng bộ sang Sơ đồ phòng máy -->
          <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <button type="button" onclick="Swal.close(); window.navigateToLab('${item.labId}')" 
              class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
              <i class="fa-solid fa-desktop text-blue-600"></i>Xem sơ đồ phòng ${item.labId}
            </button>
            <span class="text-[11px] text-slate-400 font-mono">Tầng 5, Nhà A1</span>
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: isLive ? '<i class="fa-solid fa-door-open mr-1"></i>Kết Thúc & Trả Phòng' : '<i class="fa-solid fa-play mr-1"></i>Bắt Đầu Vào Ca Học',
      confirmButtonColor: isLive ? '#1e293b' : '#059669',
      cancelButtonText: 'Đóng'
    }).then(res => {
      if (res.isConfirmed) {
        this.toggleSessionActive(item.id, !isLive);
      }
    });
  }

  // =========================================================================
  // ĐĂNG KÝ LỊCH THỰC HÀNH MỚI (VỚI THUẬT TOÁN KIỂM TRA TRÙNG PHÒNG & QUÁ TẢI)
  // =========================================================================
  showAddScheduleModal(prefillLab = null, prefillShift = null, prefillDate = null) {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('manage_schedule', 'Đăng ký ca thực hành mới')) return;
    const defaultDate = prefillDate || (this.selectedDate === 'all' ? this.getTodayDateStr() : this.selectedDate);

    Swal.fire({
      title: `
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
            <i class="fa-solid fa-calendar-plus"></i>
          </div>
          <div>
            <div class="text-base font-bold text-slate-900">Xếp Lịch Thực Hành Mới</div>
            <div class="text-xs text-slate-500 font-normal">Đăng ký sử dụng phòng máy Khoa Toán - Tin TNUS</div>
          </div>
        </div>
      `,
      html: `
        <form id="form-add-schedule" class="text-left space-y-3 text-xs max-h-[72vh] overflow-y-auto pr-1 pt-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Phòng máy thực hành *</label>
              <select id="modal-sch-lab" class="w-full p-2 bg-white border border-slate-300 rounded font-bold text-blue-700 focus:ring-1 focus:ring-blue-500">
                <option value="PM1" ${prefillLab === 'PM1' ? 'selected' : ''}>PM 1 (A1-503) - 30 máy (FPT Elead)</option>
                <option value="PM2" ${prefillLab === 'PM2' ? 'selected' : ''}>PM2 (A1-504) - 26 máy (Asus / FPT)</option>
                <option value="PM3" ${prefillLab === 'PM3' ? 'selected' : ''}>PM3 (A1-505) - 24 máy (Dell OptiPlex)</option>
                <option value="PM4" ${prefillLab === 'PM4' ? 'selected' : ''}>PM4 (A1-506) - 24 máy (Dell OptiPlex)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Ngày thực hành *</label>
              <input type="date" id="modal-sch-date" value="${defaultDate}" class="w-full p-2 bg-white border border-slate-300 rounded font-bold focus:ring-1 focus:ring-blue-500">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Khung ca học *</label>
              <select id="modal-sch-shift" class="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-slate-800">
                <option value="07:24 - 09:14 (Tiết 1-2)" ${prefillShift && prefillShift.includes('07:24 - 09:14') ? 'selected' : ''}>Sáng: 07:24 - 09:14 (Tiết 1-2)</option>
                <option value="09:24 - 11:14 (Tiết 3-4)" ${prefillShift && prefillShift.includes('09:24 - 11:14') ? 'selected' : ''}>Sáng: 09:24 - 11:14 (Tiết 3-4)</option>
                <option value="07:24 - 12:14 (Tiết 1-5)" ${prefillShift && prefillShift.includes('07:24 - 12:14') ? 'selected' : ''}>Sáng: 07:24 - 12:14 (Tiết 1-5 Suốt Sáng)</option>
                <option value="11:24 - 13:14 (Tiết 5-6)" ${prefillShift && prefillShift.includes('11:24 - 13:14') ? 'selected' : ''}>Trưa: 11:24 - 13:14 (Tiết 5-6)</option>
                <option value="13:24 - 15:14 (Tiết 7-8)" ${prefillShift && prefillShift.includes('13:24 - 15:14') ? 'selected' : ''}>Chiều: 13:24 - 15:14 (Tiết 7-8)</option>
                <option value="15:24 - 17:14 (Tiết 9-10)" ${prefillShift && prefillShift.includes('15:24 - 17:14') ? 'selected' : ''}>Chiều: 15:24 - 17:14 (Tiết 9-10)</option>
                <option value="13:24 - 18:14 (Tiết 7-11)" ${prefillShift && prefillShift.includes('13:24 - 18:14') ? 'selected' : ''}>Chiều: 13:24 - 18:14 (Tiết 7-11 Suốt Chiều)</option>
                <option value="16:24 - 19:14 (Tiết 10-12)" ${prefillShift && prefillShift.includes('16:24 - 19:14') ? 'selected' : ''}>Tối: 16:24 - 19:14 (Tiết 10-12)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sĩ số sinh viên dự kiến *</label>
              <input type="number" id="modal-sch-count" value="24" min="1" max="45" class="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block font-semibold text-slate-700 mb-1">Tên môn học thực hành *</label>
              <input type="text" id="modal-sch-subject" placeholder="VD: Lập trình Python & Cấu trúc dữ liệu" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Mã học phần</label>
              <input type="text" id="modal-sch-code" placeholder="VD: GIF131" class="w-full p-2 bg-white border border-slate-300 rounded font-mono uppercase">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Lớp học phần *</label>
              <input type="text" id="modal-sch-class" placeholder="VD: K20 CNTT B" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Giảng viên giảng dạy *</label>
              <input type="text" id="modal-sch-lecturer" value="ThS. Trịnh Minh Phú" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Yêu cầu phần mềm & Ghi chú kỹ thuật</label>
            <textarea id="modal-sch-note" rows="2" placeholder="Cần cài đặt trước Visual Studio Code, Python, MySQL..." class="w-full p-2 bg-white border border-slate-300 rounded"></textarea>
          </div>
        </form>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-check mr-1.5"></i>Lưu & Xếp Lịch',
      cancelButtonText: 'Hủy bỏ',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const labId = document.getElementById('modal-sch-lab').value;
        const date = document.getElementById('modal-sch-date').value;
        const shift = document.getElementById('modal-sch-shift').value;
        const subject = document.getElementById('modal-sch-subject').value.trim();
        const courseCode = document.getElementById('modal-sch-code').value.trim().toUpperCase() || 'TIN-TNUS';
        const className = document.getElementById('modal-sch-class').value.trim();
        const lecturer = document.getElementById('modal-sch-lecturer').value.trim();
        const studentCount = parseInt(document.getElementById('modal-sch-count').value, 10) || 24;
        const note = document.getElementById('modal-sch-note').value.trim();

        if (!subject || !className || !lecturer || !date) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ Tên môn học, Lớp, Giảng viên và Ngày thực hành!');
          return false;
        }

        // KIỂM TRA QUÁ TẢI CÔNG SUẤT PHÒNG
        const labCapacityMap = { 'PM1': 30, 'PM2': 26, 'PM3': 24, 'PM4': 24 };
        const maxCap = labCapacityMap[labId] || 30;
        if (studentCount > maxCap) {
          Swal.showValidationMessage(`CẢNH BÁO QUÁ TẢI: Phòng ${labId} chỉ có ${maxCap} máy tính khả dụng. Sĩ số đăng ký (${studentCount} SV) vượt quá số lượng máy!`);
          return false;
        }

        // THUẬT TOÁN PHÁT HIỆN TRÙNG LỊCH PHÒNG MÁY (CONFLICT DETECTION)
        const conflict = window.appState.schedules.find(s => s.labId === labId && s.date === date && s.shift === shift);
        if (conflict) {
          Swal.showValidationMessage(`CẢNH BÁO TRÙNG PHÒNG! Phòng ${labId} vào ngày ${date} (${shift}) đã được xếp cho lớp [${conflict.className} - GV: ${conflict.lecturer}]. Vui lòng chọn ca hoặc phòng khác!`);
          return false;
        }

        // KIỂM TRA TRÙNG GIẢNG VIÊN (1 GV không thể dạy 2 phòng cùng lúc)
        const lecturerConflict = window.appState.schedules.find(s => s.lecturer === lecturer && s.date === date && s.shift === shift);
        if (lecturerConflict) {
          Swal.showValidationMessage(`CẢNH BÁO TRÙNG GIẢNG VIÊN! Thầy/Cô ${lecturer} đã có lịch dạy tại phòng ${lecturerConflict.labId} trong khung giờ này!`);
          return false;
        }

        const newId = `LICH-NEW-${Date.now().toString().slice(-4)}-${labId}`;
        return {
          id: newId,
          labId,
          date,
          shift,
          courseCode,
          subject,
          className,
          lecturer,
          studentCount,
          note,
          status: 'Sắp diễn ra',
          type: 'Thực hành chính khóa'
        };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        window.appState.schedules.unshift(result.value);
        window.saveStateToLocalStorage();
        this.renderMainContent();
        this.updateKPIs();
        this.checkAndAutoActivateShifts();
        Swal.fire({
          icon: 'success',
          title: 'Xếp lịch thành công!',
          text: `Đã xếp lịch môn ${result.value.subject} tại phòng ${result.value.labId}.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    });
  }

  // =========================================================================
  // CHỈNH SỬA CA HỌC (EDIT SCHEDULE MODAL)
  // =========================================================================
  showEditScheduleModal(scheduleId) {
    const item = window.appState.schedules.find(s => s.id === scheduleId);
    if (!item) return;

    Swal.fire({
      title: `
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-base">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          <div>
            <div class="text-base font-bold text-slate-900">Điều Chỉnh Lịch Thực Hành</div>
            <div class="text-xs text-slate-500 font-normal">Cập nhật ca học mã: ${item.id}</div>
          </div>
        </div>
      `,
      html: `
        <form id="form-edit-schedule" class="text-left space-y-3 text-xs max-h-[72vh] overflow-y-auto pr-1 pt-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Phòng máy thực hành *</label>
              <select id="edit-sch-lab" class="w-full p-2 bg-white border border-slate-300 rounded font-bold text-blue-700">
                <option value="PM1" ${item.labId === 'PM1' ? 'selected' : ''}>PM 1 (A1-503) - 30 máy</option>
                <option value="PM2" ${item.labId === 'PM2' ? 'selected' : ''}>PM2 (A1-504) - 26 máy</option>
                <option value="PM3" ${item.labId === 'PM3' ? 'selected' : ''}>PM3 (A1-505) - 24 máy</option>
                <option value="PM4" ${item.labId === 'PM4' ? 'selected' : ''}>PM4 (A1-506) - 24 máy</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Ngày thực hành *</label>
              <input type="date" id="edit-sch-date" value="${item.date}" class="w-full p-2 bg-white border border-slate-300 rounded font-bold">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Ca thực hành *</label>
              <select id="edit-sch-shift" class="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-slate-800">
                <option value="07:24 - 09:14 (Tiết 1-2)" ${item.shift.includes('07:24 - 09:14') ? 'selected' : ''}>07:24 - 09:14 (Tiết 1-2)</option>
                <option value="09:24 - 11:14 (Tiết 3-4)" ${item.shift.includes('09:24 - 11:14') ? 'selected' : ''}>09:24 - 11:14 (Tiết 3-4)</option>
                <option value="07:24 - 12:14 (Tiết 1-5)" ${item.shift.includes('07:24 - 12:14') ? 'selected' : ''}>07:24 - 12:14 (Tiết 1-5)</option>
                <option value="11:24 - 13:14 (Tiết 5-6)" ${item.shift.includes('11:24 - 13:14') ? 'selected' : ''}>11:24 - 13:14 (Tiết 5-6)</option>
                <option value="13:24 - 15:14 (Tiết 7-8)" ${item.shift.includes('13:24 - 15:14') ? 'selected' : ''}>13:24 - 15:14 (Tiết 7-8)</option>
                <option value="15:24 - 17:14 (Tiết 9-10)" ${item.shift.includes('15:24 - 17:14') ? 'selected' : ''}>15:24 - 17:14 (Tiết 9-10)</option>
                <option value="13:24 - 18:14 (Tiết 7-11)" ${item.shift.includes('13:24 - 18:14') ? 'selected' : ''}>13:24 - 18:14 (Tiết 7-11)</option>
                <option value="16:24 - 19:14 (Tiết 10-12)" ${item.shift.includes('16:24 - 19:14') ? 'selected' : ''}>16:24 - 19:14 (Tiết 10-12)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sĩ số sinh viên</label>
              <input type="number" id="edit-sch-count" value="${item.studentCount}" min="1" max="45" class="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block font-semibold text-slate-700 mb-1">Tên môn học</label>
              <input type="text" id="edit-sch-subject" value="${item.subject}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Mã học phần</label>
              <input type="text" id="edit-sch-code" value="${item.courseCode || ''}" class="w-full p-2 bg-white border border-slate-300 rounded font-mono uppercase">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Lớp học phần</label>
              <input type="text" id="edit-sch-class" value="${item.className}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Giảng viên giảng dạy</label>
              <input type="text" id="edit-sch-lecturer" value="${item.lecturer}" class="w-full p-2 bg-white border border-slate-300 rounded">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nội dung bài thực hành & Phần mềm</label>
            <textarea id="edit-sch-note" rows="2" class="w-full p-2 bg-white border border-slate-300 rounded">${item.note || ''}</textarea>
          </div>
        </form>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Lưu Thay Đổi',
      cancelButtonText: 'Hủy bỏ',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const labId = document.getElementById('edit-sch-lab').value;
        const date = document.getElementById('edit-sch-date').value;
        const shift = document.getElementById('edit-sch-shift').value;
        const subject = document.getElementById('edit-sch-subject').value.trim();
        const courseCode = document.getElementById('edit-sch-code').value.trim().toUpperCase() || 'TIN-TNUS';
        const className = document.getElementById('edit-sch-class').value.trim();
        const lecturer = document.getElementById('edit-sch-lecturer').value.trim();
        const studentCount = parseInt(document.getElementById('edit-sch-count').value, 10) || 24;
        const note = document.getElementById('edit-sch-note').value.trim();

        if (!subject || !className || !lecturer) {
          Swal.showValidationMessage('Vui lòng không để trống môn học, lớp hoặc giảng viên!');
          return false;
        }

        const conflict = window.appState.schedules.find(s => s.id !== item.id && s.labId === labId && s.date === date && s.shift === shift);
        if (conflict) {
          Swal.showValidationMessage(`CẢNH BÁO TRÙNG PHÒNG! Phòng ${labId} vào ngày ${date} (${shift}) đã có lớp [${conflict.className}].`);
          return false;
        }

        return { labId, date, shift, subject, courseCode, className, lecturer, studentCount, note };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        Object.assign(item, res.value);
        window.saveStateToLocalStorage();
        this.renderMainContent();
        this.updateKPIs();
        this.checkAndAutoActivateShifts();
        Swal.fire('Thành công', 'Đã lưu thông tin điều chỉnh ca học.', 'success');
      }
    });
  }

  // =========================================================================
  // THỦ CÔNG: VÀO CA HỌC / TRẢ PHÒNG THEO YÊU CẦU GIẢNG VIÊN
  // =========================================================================
  toggleSessionActive(scheduleId, activate) {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('start_shift', activate ? 'Kích hoạt vào ca thực hành' : 'Trả phòng & kết thúc ca')) return;
    const item = window.appState.schedules.find(s => s.id === scheduleId);
    if (!item) return;

    if (activate) {
      item.status = 'Đang diễn ra';
      let turnedOnCount = 0;
      window.appState.computers.forEach(comp => {
        if (comp.labId === item.labId && (comp.status === 'good' || comp.status === 'in_use')) {
          comp.status = 'in_use';
          comp.powerState = 'on';
          turnedOnCount++;
        }
      });
      this.playSchoolChime();
      Swal.fire({
        icon: 'success',
        title: 'Bắt đầu ca thực hành!',
        html: `
          <div class="text-left text-xs space-y-1.5 pt-1">
            <p>Phòng <strong>${item.labId}</strong> đã chuyển sang trạng thái <strong>Đang diễn ra</strong>.</p>
            <p class="text-emerald-700 font-bold">• Đã kích hoạt ${turnedOnCount} máy tính sẵn sàng cho sinh viên.</p>
            <p class="text-slate-500">• Giảng viên: ${item.lecturer} | Môn: ${item.subject}</p>
          </div>
        `
      });
    } else {
      item.status = 'Đã hoàn thành';
      let releasedCount = 0;
      window.appState.computers.forEach(comp => {
        if (comp.labId === item.labId && comp.status === 'in_use') {
          comp.status = 'good';
          releasedCount++;
        }
      });
      Swal.fire({
        icon: 'info',
        title: 'Kết thúc ca học!',
        html: `
          <div class="text-left text-xs space-y-1 pt-1">
            <p>Đã trả phòng <strong>${item.labId}</strong> và giải phóng ${releasedCount} máy tính về trạng thái Hoạt động tốt.</p>
            <p class="text-slate-500">Ca học đã được đánh dấu Đã hoàn thành.</p>
          </div>
        `
      });
    }

    window.saveStateToLocalStorage();
    this.renderMainContent();
    this.updateKPIs();
    if (window.labSimulation) {
      window.labSimulation.loadLab(window.labSimulation.currentLabId);
    }
    if (typeof window.updateDashboardKPIs === 'function') {
      window.updateDashboardKPIs();
    }
  }

  // =========================================================================
  // XÓA / HỦY CA THỰC HÀNH
  // =========================================================================
  deleteSchedule(scheduleId) {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('manage_schedule', 'Hủy ca thực hành')) return;
    const item = window.appState.schedules.find(s => s.id === scheduleId);
    if (!item) return;

    Swal.fire({
      title: 'Hủy ca thực hành này?',
      html: `Bạn có chắc chắn muốn hủy lịch môn <strong>${item.subject}</strong> (Lớp ${item.className}) tại phòng ${item.labId}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý hủy',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#e11d48'
    }).then(res => {
      if (res.isConfirmed) {
        window.appState.schedules = window.appState.schedules.filter(s => s.id !== scheduleId);
        window.saveStateToLocalStorage();
        this.renderMainContent();
        this.updateKPIs();
        Swal.fire('Đã hủy', 'Ca thực hành đã được gỡ khỏi thời khóa biểu.', 'success');
      }
    });
  }

  // =========================================================================
  // XUẤT THỜI KHÓA BIỂU RA FILE EXCEL CHUẨN ĐÀO TẠO TNUS
  // =========================================================================
  exportScheduleToExcel() {
    if (typeof XLSX === 'undefined') {
      Swal.fire('Lỗi', 'Thư viện SheetJS XLSX chưa được nạp.', 'error');
      return;
    }

    const exportList = this.getFilteredSchedules();
    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };

    const exportData = exportList.map((s, idx) => ({
      'STT': idx + 1,
      'Mã lịch': s.id,
      'Phòng máy': labNames[s.labId] || s.labId,
      'Vị trí': 'Tầng 5, Nhà A1',
      'Ngày học': s.date,
      'Ca thực hành': s.shift,
      'Mã học phần': s.courseCode || '',
      'Tên môn học': s.subject,
      'Lớp học phần': s.className,
      'Giảng viên giảng dạy': s.lecturer,
      'Sĩ số SV': s.studentCount,
      'Loại hình': s.type || 'Chính khóa',
      'Trạng thái': s.status,
      'Cán bộ phụ trách': 'ThS. Trịnh Minh Phú (0975.090.666)',
      'Ghi chú / Yêu cầu': s.note || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ThoiKhoaBieu_TNUS");

    const fileName = `TNUS_ThoiKhoaBieu_PhongMay_${this.selectedDate === 'all' ? 'ToanBo' : this.selectedDate}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    Swal.fire({
      icon: 'success',
      title: 'Xuất Excel thành công!',
      text: `Đã lưu tệp ${fileName} (${exportList.length} ca học)`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // =========================================================================
  // NHẬP THỜI KHÓA BIỂU TỪ FILE EXCEL
  // =========================================================================
  handleExcelImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
      Swal.fire('Lỗi', 'Thư viện SheetJS XLSX chưa được tải.', 'error');
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
          Swal.fire('Thông báo', 'Tệp Excel không có dữ liệu thời khóa biểu.', 'warning');
          return;
        }

        let addedCount = 0;
        let conflictCount = 0;

        rows.forEach((row, idx) => {
          const labRaw = (row['Phòng máy'] || row['Phòng'] || row['labId'] || 'PM1').toString().trim().toUpperCase();
          let labId = 'PM1';
          if (labRaw.includes('PM2') || labRaw.includes('504')) labId = 'PM2';
          else if (labRaw.includes('PM3') || labRaw.includes('505')) labId = 'PM3';
          else if (labRaw.includes('PM4') || labRaw.includes('506')) labId = 'PM4';

          const date = (row['Ngày học'] || row['Ngày'] || row['date'] || this.getTodayDateStr()).toString().trim();
          const shift = (row['Ca thực hành'] || row['Ca học'] || row['shift'] || '07:24 - 09:14 (Tiết 1-2)').toString().trim();
          const subject = (row['Tên môn học'] || row['Môn học'] || row['subject'] || 'Tin học ứng dụng').toString().trim();
          const courseCode = (row['Mã học phần'] || row['Mã môn'] || row['courseCode'] || 'TIN-TNUS').toString().trim().toUpperCase();
          const className = (row['Lớp học phần'] || row['Lớp'] || row['className'] || 'K20 CNTT').toString().trim();
          const lecturer = (row['Giảng viên giảng dạy'] || row['Giảng viên'] || row['lecturer'] || 'ThS. Trịnh Minh Phú').toString().trim();
          const studentCount = parseInt(row['Sĩ số SV'] || row['Sĩ số'] || row['studentCount'] || 24, 10);
          const note = (row['Ghi chú'] || row['Yêu cầu'] || row['note'] || '').toString().trim();

          const conflict = window.appState.schedules.find(s => s.labId === labId && s.date === date && s.shift === shift);
          if (conflict) {
            conflictCount++;
          } else {
            window.appState.schedules.push({
              id: `LICH-IMP-${Date.now().toString().slice(-4)}-${idx}`,
              labId,
              date,
              shift,
              courseCode,
              subject,
              className,
              lecturer,
              studentCount,
              note,
              status: 'Sắp diễn ra',
              type: 'Thực hành chính khóa'
            });
            addedCount++;
          }
        });

        window.saveStateToLocalStorage();
        this.renderMainContent();
        this.updateKPIs();
        this.checkAndAutoActivateShifts();

        Swal.fire({
          icon: 'success',
          title: 'Nhập thời khóa biểu thành công!',
          html: `
            <div class="text-left text-xs space-y-1.5 pt-1">
              <p>Đã xử lý xong tệp <strong>${file.name}</strong>:</p>
              <p class="text-emerald-600 font-bold">• Thêm mới: ${addedCount} ca học</p>
              ${conflictCount > 0 ? `<p class="text-amber-600">• Bỏ qua do trùng phòng: ${conflictCount} ca</p>` : ''}
              <p class="text-slate-500 pt-2 border-t mt-2">Tổng số ca học hiện tại: <strong>${window.appState.schedules.length} ca</strong></p>
            </div>
          `
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
  // IN BẢN THỜI KHÓA BIỂU CHUẨN ĐẠI HỌC (PRINT TIMETABLE)
  // =========================================================================
  printSchedule() {
    const targetDate = this.selectedDate === 'all' ? this.getTodayDateStr() : this.selectedDate;
    const list = this.getFilteredSchedules();
    const labNames = {
      'PM1': 'PM 1 (A1-503)',
      'PM2': 'PM2 (A1-504)',
      'PM3': 'PM3 (A1-505)',
      'PM4': 'PM4 (A1-506)'
    };

    const rowsHtml = list.map((s, idx) => `
      <tr>
        <td style="border: 1px solid #334155; padding: 6px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #334155; padding: 6px; font-weight: bold; font-family: monospace;">${labNames[s.labId] || s.labId}</td>
        <td style="border: 1px solid #334155; padding: 6px; text-align: center; font-family: monospace;">${s.date}</td>
        <td style="border: 1px solid #334155; padding: 6px; font-weight: bold;">${s.shift}</td>
        <td style="border: 1px solid #334155; padding: 6px; font-weight: bold;">
          ${s.courseCode ? `[${s.courseCode}] ` : ''}${s.subject}
          <div style="font-size: 11px; font-weight: normal; color: #475569;">Lớp: ${s.className}</div>
        </td>
        <td style="border: 1px solid #334155; padding: 6px;">${s.lecturer}</td>
        <td style="border: 1px solid #334155; padding: 6px; text-align: center; font-weight: bold; font-family: monospace;">${s.studentCount} SV</td>
        <td style="border: 1px solid #334155; padding: 6px; text-align: center;">${s.status}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      Swal.fire('Lỗi', 'Trình duyệt chặn mở cửa sổ in.', 'warning');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Thời Khóa Biểu Thực Hành Phòng Máy - TNUS</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 15px; color: #0f172a; font-size: 13px; line-height: 1.4; }
          .header-table { width: 100%; margin-bottom: 20px; }
          .title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 15px 0 5px 0; }
          .sub-title { text-align: center; font-size: 13px; font-style: italic; margin-bottom: 20px; }
          table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table.data-table th { border: 1px solid #0f172a; background-color: #f1f5f9; padding: 8px; font-size: 12px; }
          .signature-section { margin-top: 40px; width: 100%; page-break-inside: avoid; }
          .no-print { margin-bottom: 20px; padding: 10px; background: #e0f2fe; border: 1px solid #0284c7; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
          .btn-print { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; }
          @media print { .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div><strong>Bản In Thời Khóa Biểu Phòng Máy Tính TNUS</strong> (Khổ ngang A4)</div>
          <button onclick="window.print()" class="btn-print">In Ngay (Print)</button>
        </div>

        <table class="header-table">
          <tr>
            <td style="text-align: center; width: 45%;">
              <strong>TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)</strong><br>
              <strong>KHOA TOÁN - TIN</strong><br>
              --------------------
            </td>
            <td style="text-align: center; width: 55%;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
              --------------------
            </td>
          </tr>
        </table>

        <div class="title">LỊCH THỰC HÀNH PHÒNG MÁY TÍNH (TẦNG 5, NHÀ A1)</div>
        <div class="sub-title">Học kỳ I, Năm học 2026 - 2027 • ${this.selectedDate === 'all' ? 'Toàn bộ học kỳ' : 'Ngày thực hiện: ' + targetDate}</div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px;">STT</th>
              <th style="width: 100px;">Phòng máy</th>
              <th style="width: 85px;">Ngày</th>
              <th style="width: 120px;">Ca / Khung giờ</th>
              <th>Học phần & Lớp thực hành</th>
              <th style="width: 130px;">Giảng viên</th>
              <th style="width: 60px;">Sĩ số</th>
              <th style="width: 90px;">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <table class="signature-section">
          <tr>
            <td style="text-align: center; width: 33%; vertical-align: top;">
              <strong>TRƯỜNG BỘ MÔN TIN HỌC</strong><br><br><br><br>
              <strong>TS. Lê Hoàng Nam</strong>
            </td>
            <td style="text-align: center; width: 33%; vertical-align: top;">
              <strong>CÁN BỘ PHỤ TRÁCH PHÒNG MÁY</strong><br><br><br><br>
              <strong>ThS. Trịnh Minh Phú</strong><br>
              <span style="font-size: 11px;">(SĐT: 0975.090.666)</span>
            </td>
            <td style="text-align: center; width: 34%; vertical-align: top;">
              <em>Thái Nguyên, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em><br>
              <strong>TRƯỞNG KHOA TOÁN - TIN</strong><br><br><br><br>
              <strong>PGS.TS. Nguyễn Văn A</strong>
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
  window.ScheduleManager = ScheduleManager;
} else if (typeof globalThis !== 'undefined') {
  globalThis.ScheduleManager = ScheduleManager;
}
