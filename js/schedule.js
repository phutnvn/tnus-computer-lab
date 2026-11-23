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

// =============================================================================
// BỘ TIỆN ÍCH CHUẨN HÓA DỮ LIỆU EXCEL THỜI KHÓA BIỂU TNUS
// =============================================================================
function removeVietnameseDiacritics(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function normalizeScheduleLabId(raw) {
  if (!raw) return 'PM1';
  const clean = removeVietnameseDiacritics(String(raw)).toUpperCase();
  if (clean.includes('503')) return 'PM1';
  if (clean.includes('504')) return 'PM2';
  if (clean.includes('505')) return 'PM3';
  if (clean.includes('506')) return 'PM4';
  if (/PM\s*1\b/i.test(clean)) return 'PM1';
  if (/PM\s*2\b/i.test(clean)) return 'PM2';
  if (/PM\s*3\b/i.test(clean)) return 'PM3';
  if (/PM\s*4\b/i.test(clean)) return 'PM4';
  if (/(PHONG\s*MAY|PHONG|LAB)\s*1\b/i.test(clean)) return 'PM1';
  if (/(PHONG\s*MAY|PHONG|LAB)\s*2\b/i.test(clean)) return 'PM2';
  if (/(PHONG\s*MAY|PHONG|LAB)\s*3\b/i.test(clean)) return 'PM3';
  if (/(PHONG\s*MAY|PHONG|LAB)\s*4\b/i.test(clean)) return 'PM4';
  const numOnly = clean.replace(/[^0-9]/g, '');
  if (numOnly === '1') return 'PM1';
  if (numOnly === '2') return 'PM2';
  if (numOnly === '3') return 'PM3';
  if (numOnly === '4') return 'PM4';
  return 'PM1';
}

function parseExcelScheduleDate(val, currentMonday) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
    const y = jsDate.getFullYear();
    const m = String(jsDate.getMonth() + 1).padStart(2, '0');
    const d = String(jsDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const d = String(dmyMatch[1]).padStart(2, '0');
    const m = String(dmyMatch[2]).padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = String(ymdMatch[2]).padStart(2, '0');
    const d = String(ymdMatch[3]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Xử lý Thứ 2..7 kết hợp ngày Thứ Hai của tuần hiện hành
  const clean = removeVietnameseDiacritics(str).toLowerCase();
  const dayMatch = clean.match(/thu\s*([2-7]|hai|ba|tu|nam|sau|bay)/);
  if (dayMatch && currentMonday) {
    const dayMap = { '2': 0, 'hai': 0, '3': 1, 'ba': 1, '4': 2, 'tu': 2, '5': 3, 'nam': 3, '6': 4, 'sau': 4, '7': 5, 'bay': 5 };
    const offset = dayMap[dayMatch[1]];
    if (offset !== undefined) {
      const [mY, mM, mD] = currentMonday.split('-').map(Number);
      const dt = new Date(mY, mM - 1, mD + offset);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    }
  }
  return null;
}

function matchScheduleColumn(headerName) {
  if (!headerName) return null;
  const noSpace = removeVietnameseDiacritics(String(headerName)).toLowerCase().replace(/[^a-z0-9]/g, '');
  const withSpace = removeVietnameseDiacritics(String(headerName)).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  // 1. Phòng máy (kiểm tra trước 'mã' để tránh dính từ 'máy')
  if (/phong|lab|diadiem|room/.test(noSpace)) return 'labId';

  // 2. Lớp học phần
  if (/lop|class/.test(noSpace)) return 'className';

  // 3. Mã học phần
  if (/(^|\s)(ma|code)(\s|$)|mahocphan|mamon|mahp|malhp|coursecode/.test(withSpace) || /mahocphan|mamon|mahp|malhp/.test(noSpace)) return 'courseCode';

  // 4. Giảng viên / CBGD
  if (/giangvien|cbgd|canbo|gv|lecturer|teacher/.test(noSpace)) return 'lecturer';

  // 5. Ca / Tiết (tránh từ 'thực hành')
  if (/(^|\s)(ca|tiet|khunggio|shift)(\s|$)|cahoc|cathuchanh|tiethoc/.test(withSpace) || /tiet/.test(noSpace)) return 'shift';

  // 6. Tên môn học / Học phần
  if (/tenmon|tenhocphan|monhoc|hocphan|subject|\bmon\b/.test(withSpace) || /monhoc|tenmon|hocphan/.test(noSpace)) return 'subject';

  // 7. Ngày / Thứ
  if (/ngay|date|thoigian|thang|nam|\bthu\s*([2-7]|hai|ba|tu|nam|sau|bay)?\b/i.test(withSpace) || /thu/.test(noSpace)) return 'date';

  // 8. Sĩ số
  if (/siso|sosv|soluong|studentcount|count/.test(noSpace)) return 'studentCount';

  // 9. Ghi chú
  if (/ghichu|yeucau|note/.test(noSpace)) return 'note';

  return null;
}

if (typeof window !== 'undefined') {
  window.removeVietnameseDiacritics = removeVietnameseDiacritics;
  window.normalizeScheduleLabId = normalizeScheduleLabId;
  window.parseExcelScheduleDate = parseExcelScheduleDate;
  window.matchScheduleColumn = matchScheduleColumn;
}

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

  // Phân tích và chuẩn hóa chuỗi Ca học / Tiết học theo khung giờ chuẩn TNUS
  parseShiftTiming(shiftStr) {
    if (typeof window.parseShiftTiming === 'function') {
      return window.parseShiftTiming(shiftStr);
    }
    const periodTimes = {
      '1': { start: '07:00', end: '07:50' },
      '2': { start: '08:00', end: '08:50' },
      '3': { start: '09:00', end: '09:50' },
      '4': { start: '10:00', end: '10:50' },
      '5': { start: '11:00', end: '11:50' },
      '6': { start: '13:00', end: '13:50' },
      '7': { start: '14:00', end: '14:50' },
      '8': { start: '15:00', end: '15:50' },
      '9': { start: '16:00', end: '16:50' },
      '10': { start: '17:00', end: '17:50' },
      '11': { start: '18:00', end: '18:50' },
      '12': { start: '19:00', end: '19:50' }
    };

    let startTime = '07:00';
    let endTime = '11:50';
    let startPeriod = '1';
    let endPeriod = '5';

    if (!shiftStr) return { startTime, endTime, startPeriod, endPeriod, shift: '07:00 - 11:50 (Tiết 1-5)' };

    const str = String(shiftStr).trim();
    const timeMatch = str.match(/(\d{1,2})[:h](\d{2})?\s*[-–—]\s*(\d{1,2})[:h](\d{2})?/i);
    if (timeMatch) {
      const h1 = String(timeMatch[1]).padStart(2, '0');
      const m1 = String(timeMatch[2] || '00').padStart(2, '0');
      const h2 = String(timeMatch[3]).padStart(2, '0');
      const m2 = String(timeMatch[4] || '00').padStart(2, '0');
      startTime = `${h1}:${m1}`;
      endTime = `${h2}:${m2}`;
    }

    const periodRangeMatch = str.match(/ti[ếe]t\s*(\d{1,2})\s*[-–—]\s*(\d{1,2})/i);
    if (periodRangeMatch) {
      startPeriod = String(parseInt(periodRangeMatch[1], 10));
      endPeriod = String(parseInt(periodRangeMatch[2], 10));
      if (!timeMatch && periodTimes[startPeriod] && periodTimes[endPeriod]) {
        startTime = periodTimes[startPeriod].start;
        endTime = periodTimes[endPeriod].end;
      }
    }

    let formattedShift = str;
    if (!formattedShift.includes('Tiết') && !formattedShift.includes('tiết')) {
      formattedShift = `${startTime} - ${endTime} (Tiết ${startPeriod}-${endPeriod})`;
    }
    return { startTime, endTime, startPeriod, endPeriod, shift: formattedShift };
  }

  // TỰ ĐỘNG ĐỒNG BỘ LỊCH THỰC HÀNH THEO DỮ LIỆU ĐÃ ĐƯA LÊN
  syncSemesterSchedulesAuto(showNotice = false) {
    if (!window.appState) return;
    if (!Array.isArray(window.appState.schedules)) window.appState.schedules = [];

    let countAdded = 0;
    let countNormalized = 0;

    // 1. Đồng bộ các ca chuẩn từ INITIAL_SCHEDULES nếu bị thiếu
    if (typeof INITIAL_SCHEDULES !== 'undefined' && Array.isArray(INITIAL_SCHEDULES)) {
      const existingIds = new Set(window.appState.schedules.map(s => s.id));
      INITIAL_SCHEDULES.forEach(s => {
        if (!existingIds.has(s.id)) {
          window.appState.schedules.push(Object.assign({}, s));
          existingIds.add(s.id);
          countAdded++;
        }
      });
    }

    // 2. Kiểm tra tuần hiện tại của đồng hồ hệ thống
    const now = new Date();
    const curToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const curMonday = typeof window.getMondayOfDateStr === 'function' ? window.getMondayOfDateStr(curToday) : '2026-11-23';
    const curSaturday = typeof window.addDaysToDate === 'function' ? window.addDaysToDate(curMonday, 5) : '2026-11-28';

    const hasThisWeek = window.appState.schedules.some(s => s.date >= curMonday && s.date <= curSaturday);
    if (!hasThisWeek && typeof window.generateWeekSchedulesFromBase === 'function' && typeof INITIAL_SCHEDULES !== 'undefined') {
      const weekItems = window.generateWeekSchedulesFromBase(INITIAL_SCHEDULES, curMonday, `W-${curMonday.replace(/-/g, '')}`);
      window.appState.schedules.push(...weekItems);
      countAdded += weekItems.length;
    }

    // 3. Chuẩn hóa 100% ca học: đảm bảo startTime, endTime, startPeriod, endPeriod
    window.appState.schedules.forEach(s => {
      const timing = this.parseShiftTiming(s.shift || `${s.startTime || '07:00'} - ${s.endTime || '11:50'}`);
      if (!s.startTime || !s.endTime || !s.startPeriod || !s.endPeriod || s.shift !== timing.shift) {
        s.shift = timing.shift;
        s.startTime = timing.startTime;
        s.endTime = timing.endTime;
        s.startPeriod = timing.startPeriod;
        s.endPeriod = timing.endPeriod;
        countNormalized++;
      }
    });

    // 4. Lưu vào LocalStorage
    if (typeof window.saveStateToLocalStorage === 'function') {
      window.saveStateToLocalStorage();
    }

    // 5. Cập nhật UI & Trạng thái tức thời
    this.renderView();
    this.checkAndAutoActivateShifts();

    if (typeof window.updateDashboardKPIs === 'function') {
      window.updateDashboardKPIs();
    }
    if (typeof renderDashboardTodaySchedules === 'function') {
      renderDashboardTodaySchedules();
    }
    if (window.labSimulation && typeof window.labSimulation.loadLab === 'function') {
      window.labSimulation.loadLab(window.labSimulation.currentLabId);
    }

    if (showNotice && typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật lịch tự động thành công!',
        html: `
          <div class="text-left text-xs space-y-1.5 pt-1">
            <p>Hệ thống đã đồng bộ thời khóa biểu theo đúng dữ liệu học kỳ:</p>
            <p class="text-blue-600 font-bold">• Bổ sung ca học mới: +${countAdded} ca</p>
            <p class="text-emerald-600 font-bold">• Chuẩn hóa tiết học & thời gian: ${countNormalized} ca</p>
            <p class="text-slate-600 pt-1">• Tuần hiện tại: <strong>${curMonday} đến ${curSaturday}</strong></p>
            <p class="text-slate-500 pt-2 border-t mt-2">Tổng số ca học sẵn sàng vận hành: <strong>${window.appState.schedules.length} ca</strong></p>
          </div>
        `,
        timer: 3500,
        showConfirmButton: true,
        confirmButtonText: 'Đóng'
      });
    }
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

    // Tự động kiểm tra nếu ngày hôm nay chưa có ca học nào, thử đồng bộ tự động một lần
    const currentSchedules = window.appState.schedules || [];
    if (!currentSchedules.some(s => s.date === actualToday) && !this._hasAutoSyncedToday) {
      this._hasAutoSyncedToday = true;
      this.syncSemesterSchedulesAuto(false);
      return;
    }

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
      const start = sch.startTime || '07:00';
      const end = sch.endTime || '11:50';

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
      if (typeof renderDashboardTodaySchedules === 'function') {
        renderDashboardTodaySchedules();
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
      .filter(s => (s.startTime || '07:00') > compareTime)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const nextShiftEl = document.getElementById('auto-shift-next-countdown');
    if (nextShiftEl) {
      if (upcomingSchedules.length > 0) {
        const next = upcomingSchedules[0];
        const [curH, curM] = compareTime.split(':').map(Number);
        const [stH, stM] = (next.startTime || '07:00').split(':').map(Number);
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
    const curUser = window.appState?.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    if (role !== 'admin' && role !== 'lab_manager') {
      Swal.fire({
        icon: 'error',
        title: 'Truy cập bị từ chối',
        html: 'Chỉ <strong>Quản trị viên (Admin)</strong> và <strong>Quản lý phòng máy</strong> mới có thẩm quyền cấu hình cơ chế tự động vào ca và cấp nguồn Wake-on-LAN.'
      });
      return;
    }
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

    const curUser = window.appState?.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const canConfigAuto = (role === 'admin' || role === 'lab_manager');
    const canImportSchedule = (role === 'admin' || role === 'lab_manager');
    const canCreateSchedule = (role === 'admin' || role === 'lab_manager' || role === 'teacher');
    const isStudent = (role === 'student');

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

          ${canConfigAuto ? `
          <!-- Các nút mô phỏng & điều khiển nhanh (Dành riêng cho Quản lý phòng & Quản trị viên) -->
          <div id="sch-simulation-controls" class="flex flex-wrap items-center gap-1.5 text-xs">
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
          </div>` : ''}
        </div>

        <!-- KHUNG GIỜ 10 TIẾT HỌC CHUẨN TNUS (THEO THỜI GIAN THỰC) -->
        <div class="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 rounded-xl p-3 shadow-xs">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2 pb-2 border-b border-blue-100">
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black shadow-xs">
                <i class="fa-solid fa-clock"></i>
              </span>
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">Khung 10 Tiết Học Thực Hành Chuẩn TNUS</span>
              <span class="hidden sm:inline-block text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
                Khoa Toán - Tin • Trường Đại học Khoa học
              </span>
            </div>
            <div class="text-[11px] text-slate-600 flex items-center space-x-3">
              <span><strong class="text-blue-700">Buổi sáng:</strong> 5 tiết (07:00 – 11:50)</span>
              <span><strong class="text-indigo-700">Buổi chiều:</strong> 5 tiết (13:00 – 17:50)</span>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5 text-[11px]">
            <div class="bg-white/90 p-1.5 rounded-lg border border-blue-200/60 text-center shadow-xs">
              <div class="font-bold text-blue-800">Tiết 1</div>
              <div class="font-mono text-slate-600 text-[10px]">07:00 - 07:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-blue-200/60 text-center shadow-xs">
              <div class="font-bold text-blue-800">Tiết 2</div>
              <div class="font-mono text-slate-600 text-[10px]">08:00 - 08:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-blue-200/60 text-center shadow-xs">
              <div class="font-bold text-blue-800">Tiết 3</div>
              <div class="font-mono text-slate-600 text-[10px]">09:00 - 09:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-blue-200/60 text-center shadow-xs">
              <div class="font-bold text-blue-800">Tiết 4</div>
              <div class="font-mono text-slate-600 text-[10px]">10:00 - 10:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-blue-200/60 text-center shadow-xs">
              <div class="font-bold text-blue-800">Tiết 5</div>
              <div class="font-mono text-slate-600 text-[10px]">11:00 - 11:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-indigo-200/60 text-center shadow-xs">
              <div class="font-bold text-indigo-800">Tiết 6</div>
              <div class="font-mono text-slate-600 text-[10px]">13:00 - 13:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-indigo-200/60 text-center shadow-xs">
              <div class="font-bold text-indigo-800">Tiết 7</div>
              <div class="font-mono text-slate-600 text-[10px]">14:00 - 14:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-indigo-200/60 text-center shadow-xs">
              <div class="font-bold text-indigo-800">Tiết 8</div>
              <div class="font-mono text-slate-600 text-[10px]">15:00 - 15:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-indigo-200/60 text-center shadow-xs">
              <div class="font-bold text-indigo-800">Tiết 9</div>
              <div class="font-mono text-slate-600 text-[10px]">16:00 - 16:50</div>
            </div>
            <div class="bg-white/90 p-1.5 rounded-lg border border-indigo-200/60 text-center shadow-xs">
              <div class="font-bold text-indigo-800">Tiết 10</div>
              <div class="font-mono text-slate-600 text-[10px]">17:00 - 17:50</div>
            </div>
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

              ${canImportSchedule ? `
              <!-- Cập nhật tự động từ file Excel -->
              <button id="btn-import-schedule-excel" onclick="window.scheduleManager.openAutoExcelImportModal()" 
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs" 
                title="Cập nhật lịch thực hành tự động khi Admin cung cấp file Excel">
                <i class="fa-solid fa-file-excel"></i>
                <span>Cập Nhật TKB từ Excel</span>
              </button>

              <!-- Tự động đồng bộ lịch học kỳ -->
              <button id="btn-sync-auto-schedule" onclick="window.scheduleManager.syncSemesterSchedulesAuto(true)" 
                class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs" 
                title="Tự động đồng bộ lịch thực hành học kỳ và tuần hiện tại theo dữ liệu đã đưa lên">
                <i class="fa-solid fa-arrows-rotate text-blue-600"></i>
                <span>Đồng Bộ Học Kỳ</span>
              </button>

              <input type="file" id="input-import-schedule" accept=".xlsx, .xls, .csv" class="hidden">` : ''}

              <!-- Xuất Excel -->
              <button id="btn-export-schedule" onclick="window.scheduleManager.exportScheduleToExcel()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs">
                <i class="fa-solid fa-file-excel"></i>
                <span>Xuất Excel</span>
              </button>

              ${canCreateSchedule ? `
              <!-- Đăng ký ca mới -->
              <button id="btn-add-schedule" onclick="window.scheduleManager.showAddScheduleModal()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5">
                <i class="fa-solid fa-calendar-plus"></i>
                <span>Xếp Lịch Mới</span>
              </button>` : ''}
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
                <option value="chieu">Buổi Chiều (Tiết 6 - 10)</option>
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
        if (e.target.files && e.target.files[0]) {
          this.processExcelScheduleFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    this.setupDragAndDrop();
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
    const curUser = window.appState.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const canManageShift = (role === 'admin' || role === 'lab_manager' || role === 'teacher');

    // Danh sách 4 phòng máy chuẩn TNUS (Tầng 5, Nhà A1)
    const labs = [
      { id: 'PM1', name: 'PM 1 (A1-503)', cap: 30, brand: 'FPT Elead Core i5-14400', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
      { id: 'PM2', name: 'PM2 (A1-504)', cap: 26, brand: 'Asus & FPT Elead', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      { id: 'PM3', name: 'PM3 (A1-505)', cap: 24, brand: 'Dell OptiPlex Core i5', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      { id: 'PM4', name: 'PM4 (A1-506)', cap: 24, brand: 'Dell OptiPlex Core i5', badge: 'bg-teal-50 text-teal-700 border-teal-200' }
    ];

    // Khung các ca thực hành chuẩn trong ngày theo quy định tiết học TNUS (Sáng: Ca 1, Ca 2; Chiều: Ca 3, Ca 4; Tối: Ca 5)
    const timeSlots = [
      { id: 'shift-1', label: 'Ca 1 (Sáng)', time: '07:00 - 08:50', periods: 'Tiết 1-2', session: 'Sáng', start: '07:00', end: '08:50' },
      { id: 'shift-2', label: 'Ca 2 (Sáng)', time: '09:00 - 10:50', periods: 'Tiết 3-4', session: 'Sáng', start: '09:00', end: '10:50' },
      { id: 'shift-mid', label: 'Ca Chuyển Tiếp', time: '11:00 - 13:50', periods: 'Tiết 5-6', session: 'Trưa', start: '11:00', end: '13:50' },
      { id: 'shift-3', label: 'Ca 3 (Chiều)', time: '13:00 - 14:50', periods: 'Tiết 6-7', session: 'Chiều', start: '13:00', end: '14:50' },
      { id: 'shift-4', label: 'Ca 4 (Chiều)', time: '15:00 - 16:50', periods: 'Tiết 8-9', session: 'Chiều', start: '15:00', end: '16:50' },
      { id: 'shift-5', label: 'Ca 5 (Tối)', time: '17:00 - 19:50', periods: 'Tiết 10-12', session: 'Tối', start: '17:00', end: '19:50' }
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
                        if (s.startTime && slot.start && s.startTime === slot.start) return true;
                        if (slot.id === 'shift-1' && (sShift.includes('07:00 - 08:50') || sShift.includes('tiết 1-2') || sShift.includes('tiết 1-5') || sShift.includes('07:00 - 11:50'))) return true;
                        if (slot.id === 'shift-2' && (sShift.includes('09:00 - 10:50') || sShift.includes('tiết 3-4') || sShift.includes('tiết 3-5') || sShift.includes('09:00 - 11:50'))) return true;
                        if (slot.id === 'shift-mid' && (sShift.includes('11:00 - 13:50') || sShift.includes('tiết 5-6'))) return true;
                        if (slot.id === 'shift-3' && (sShift.includes('13:00 - 14:50') || sShift.includes('tiết 6-7') || sShift.includes('tiết 6-10') || sShift.includes('tiết 7-8') || sShift.includes('13:00 - 17:50'))) return true;
                        if (slot.id === 'shift-4' && (sShift.includes('15:00 - 16:50') || sShift.includes('tiết 8-9') || sShift.includes('tiết 8-10') || sShift.includes('tiết 9-10') || sShift.includes('15:00 - 17:50'))) return true;
                        if (slot.id === 'shift-5' && (sShift.includes('17:00 - 19:50') || sShift.includes('tiết 10-12') || sShift.includes('tiết 11-12'))) return true;
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
                                ${canManageShift ? `
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
                                ` : `
                                  <button onclick="window.scheduleManager.showScheduleDetailModal('${item.id}')" class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold transition flex items-center gap-1">
                                    <i class="fa-regular fa-eye"></i>Xem chi tiết
                                  </button>
                                  <span class="text-[10px] text-slate-400 font-mono">${isLive ? '🔴 Đang học' : '⚪ Giờ học'}</span>
                                `}
                              </div>
                            </div>
                          </td>
                        `;
                      } else {
                        // Ô trống
                        if (canManageShift) {
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
                        } else {
                          return `
                            <td class="p-2.5 border-r border-slate-200 last:border-r-0 align-middle text-center">
                              <div class="border border-slate-100 rounded-xl p-3 text-slate-400 bg-slate-50/40 flex flex-col items-center justify-center space-y-1" style="min-height: 140px;">
                                <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                  <i class="fa-regular fa-clock"></i>
                                </div>
                                <span class="text-[11px] font-semibold text-slate-500">Phòng trống</span>
                                ${role === 'lab_manager' ? '<span class="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Khả dụng bảo trì</span>' : '<span class="text-[10px] text-slate-400">Chưa có ca học</span>'}
                              </div>
                            </td>
                          `;
                        }
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
    const curUser = window.appState.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const canManageShift = (role === 'admin' || role === 'lab_manager' || role === 'teacher');

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
              ${canManageShift ? `
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
              ` : `
                <button onclick="window.scheduleManager.showScheduleDetailModal('${item.id}')" 
                  class="px-2.5 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded text-[11px] font-bold transition inline-flex items-center gap-1" title="Xem chi tiết ca học">
                  <i class="fa-regular fa-eye"></i>Chi tiết
                </button>
                <button onclick="window.navigateToLab('${item.labId}')" 
                  class="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition" title="Xem sơ đồ 2D phòng ${item.labId}">
                  <i class="fa-solid fa-desktop"></i>
                </button>
              `}
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

    const curUser = window.appState?.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const canManageShift = (role === 'admin' || role === 'lab_manager' || role === 'teacher');

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
      showConfirmButton: canManageShift,
      confirmButtonText: isLive ? '<i class="fa-solid fa-door-open mr-1"></i>Kết Thúc & Trả Phòng' : '<i class="fa-solid fa-play mr-1"></i>Bắt Đầu Vào Ca Học',
      confirmButtonColor: isLive ? '#1e293b' : '#059669',
      cancelButtonText: 'Đóng'
    }).then(res => {
      if (res.isConfirmed && canManageShift) {
        this.toggleSessionActive(item.id, !isLive);
      }
    });
  }

  // =========================================================================
  // ĐĂNG KÝ LỊCH THỰC HÀNH MỚI (VỚI THUẬT TOÁN KIỂM TRA TRÙNG PHÒNG & QUÁ TẢI)
  // =========================================================================
  showAddScheduleModal(prefillLab = null, prefillShift = null, prefillDate = null) {
    const curUser = window.appState.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    if (role === 'student') {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Truy cập bị từ chối',
          html: 'Tài khoản <strong>Sinh viên / Tra cứu</strong> chỉ có quyền xem thời khóa biểu, không có thẩm quyền xếp lịch giảng dạy.'
        });
      }
      return;
    }
    if (typeof window.checkPermission === 'function' && !window.checkPermission('manage_schedule', 'Đăng ký ca thực hành mới')) return;
    const defaultDate = prefillDate || (this.selectedDate === 'all' ? this.getTodayDateStr() : this.selectedDate);
    const defaultLecturer = (curUser && curUser.role === 'teacher') ? (curUser.name || 'Giảng viên') : (curUser?.name || 'ThS. Trịnh Minh Phú');

    const teacherUsers = (window.appState?.users || []).filter(u => {
      const r = window.normalizeRole ? window.normalizeRole(u.role) : u.role;
      return r === 'teacher';
    });
    const teacherDatalistHtml = teacherUsers.map(t => `<option value="${t.name}">@${t.username} - ${t.department || 'Khoa Toán - Tin'}</option>`).join('');

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
                <option value="07:00 - 08:50 (Tiết 1-2)" ${prefillShift && (prefillShift.includes('07:00') || prefillShift.includes('Tiết 1-2')) ? 'selected' : ''}>Sáng: 07:00 - 08:50 (Tiết 1-2)</option>
                <option value="09:00 - 10:50 (Tiết 3-4)" ${prefillShift && (prefillShift.includes('09:00') || prefillShift.includes('Tiết 3-4')) ? 'selected' : ''}>Sáng: 09:00 - 10:50 (Tiết 3-4)</option>
                <option value="11:00 - 13:50 (Tiết 5-6)" ${prefillShift && (prefillShift.includes('11:00') || prefillShift.includes('Tiết 5-6')) ? 'selected' : ''}>Trưa: 11:00 - 13:50 (Tiết 5-6 Chuyển Tiếp)</option>
                <option value="13:00 - 14:50 (Tiết 6-7)" ${prefillShift && (prefillShift.includes('13:00') || prefillShift.includes('Tiết 6-7')) ? 'selected' : ''}>Chiều: 13:00 - 14:50 (Tiết 6-7)</option>
                <option value="15:00 - 16:50 (Tiết 8-9)" ${prefillShift && (prefillShift.includes('15:00') || prefillShift.includes('Tiết 8-9')) ? 'selected' : ''}>Chiều: 15:00 - 16:50 (Tiết 8-9)</option>
                <option value="17:00 - 19:50 (Tiết 10-12)" ${prefillShift && (prefillShift.includes('17:00') || prefillShift.includes('Tiết 10-12')) ? 'selected' : ''}>Tối: 17:00 - 19:50 (Tiết 10-12 Ca Tối)</option>
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
              <input type="text" id="modal-sch-lecturer" list="teachers-datalist" value="${defaultLecturer}" placeholder="Chọn hoặc nhập tên giảng viên..." class="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-slate-800">
              <datalist id="teachers-datalist">
                ${teacherDatalistHtml}
              </datalist>
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
        const timing = this.parseShiftTiming(shift);
        return {
          id: newId,
          labId,
          date,
          shift: timing.shift,
          startTime: timing.startTime,
          endTime: timing.endTime,
          startPeriod: timing.startPeriod,
          endPeriod: timing.endPeriod,
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
        if (typeof window.updateDashboardKPIs === 'function') window.updateDashboardKPIs();
        if (typeof renderDashboardTodaySchedules === 'function') renderDashboardTodaySchedules();
        if (window.labSimulation && typeof window.labSimulation.loadLab === 'function') {
          window.labSimulation.loadLab(window.labSimulation.currentLabId);
        }
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
  // KIỂM TRA QUYỀN SỞ HỮU CA DẠY CỦA GIẢNG VIÊN (RBAC LECTURER OWNERSHIP)
  // =========================================================================
  checkLecturerOwnership(curUser, itemLecturer) {
    if (!curUser || !itemLecturer) return false;
    const role = window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role;
    if (role === 'admin' || role === 'lab_manager') return true;
    if (role !== 'teacher') return false;

    const uName = (curUser.name || '').trim().toLowerCase();
    const iLect = (itemLecturer || '').trim().toLowerCase();

    // 1. So khớp tên đầy đủ hoặc chứa nhau
    if (iLect === uName || iLect.includes(uName) || uName.includes(iLect)) return true;

    // 2. So khớp sau khi bỏ học hàm / học vị (ThS, TS, PGS, GS, CN, KS, MG,...)
    const stripTitle = (s) => (s || '').replace(/^(ths|ts|pgs|gs|cn|ks|mg:?)\.?\s+/i, '').trim();
    const cleanUName = stripTitle(uName);
    const cleanILect = stripTitle(iLect);
    if (cleanILect === cleanUName || cleanILect.includes(cleanUName) || cleanUName.includes(cleanILect)) return true;

    // 3. So khớp không dấu
    const unaccent = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    const uClean = unaccent(cleanUName);
    const lClean = unaccent(cleanILect);
    if (lClean === uClean || lClean.includes(uClean) || uClean.includes(lClean)) return true;

    // 4. So khớp theo Username hoặc Email của giảng viên
    const uname = (curUser.username || '').toLowerCase().replace(/^@+/, '');
    if (uname && (lClean.includes(uname) || cleanILect.toLowerCase().includes(uname))) return true;
    if (curUser.email && (item.creator === curUser.email || (item.lecturer && item.lecturer.toLowerCase().includes(curUser.email.toLowerCase())))) return true;

    return false;
  }

  // =========================================================================
  // CHỈNH SỬA CA HỌC (EDIT SCHEDULE MODAL)
  // =========================================================================
  showEditScheduleModal(scheduleId) {
    const item = window.appState.schedules.find(s => s.id === scheduleId);
    if (!item) return;

    const curUser = window.appState.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const isAdminOrManager = (role === 'admin' || role === 'lab_manager');

    // Giảng viên chỉ có quyền chỉnh sửa ca thực hành của chính mình
    if (!isAdminOrManager) {
      if (role !== 'teacher') {
        Swal.fire('Từ chối', 'Bạn không có quyền chỉnh sửa thời khóa biểu.', 'error');
        return;
      }
      const isOwner = this.checkLecturerOwnership(curUser, item.lecturer);
      if (!isOwner) {
        Swal.fire({
          icon: 'warning',
          title: 'KHÔNG THỂ SỬA CA CỦA GIẢNG VIÊN KHÁC',
          text: `Ca học này do Giảng viên [${item.lecturer}] phụ trách. Giảng viên chỉ có quyền chỉnh sửa ca thực hành do chính mình đảm nhiệm. Vui lòng liên hệ Quản lý phòng máy để được hỗ trợ.`,
          confirmButtonColor: '#2563eb'
        });
        return;
      }
    }

    const teacherEditUsers = (window.appState?.users || []).filter(u => {
      const r = window.normalizeRole ? window.normalizeRole(u.role) : u.role;
      return r === 'teacher';
    });
    const teacherEditDatalistHtml = teacherEditUsers.map(t => `<option value="${t.name}">@${t.username} - ${t.department || 'Khoa Toán - Tin'}</option>`).join('');

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
                <option value="07:00 - 08:50 (Tiết 1-2)" ${item.shift.includes('07:00') || item.shift.includes('Tiết 1-2') ? 'selected' : ''}>Sáng: 07:00 - 08:50 (Tiết 1-2)</option>
                <option value="09:00 - 10:50 (Tiết 3-4)" ${item.shift.includes('09:00') || item.shift.includes('Tiết 3-4') ? 'selected' : ''}>Sáng: 09:00 - 10:50 (Tiết 3-4)</option>
                <option value="11:00 - 13:50 (Tiết 5-6)" ${item.shift.includes('11:00') || item.shift.includes('Tiết 5-6') ? 'selected' : ''}>Trưa: 11:00 - 13:50 (Tiết 5-6 Chuyển Tiếp)</option>
                <option value="13:00 - 14:50 (Tiết 6-7)" ${item.shift.includes('14:50') || item.shift.includes('Tiết 6-7') ? 'selected' : ''}>Chiều: 13:00 - 14:50 (Tiết 6-7)</option>
                <option value="15:00 - 16:50 (Tiết 8-9)" ${item.shift.includes('16:50') || item.shift.includes('Tiết 8-9') ? 'selected' : ''}>Chiều: 15:00 - 16:50 (Tiết 8-9)</option>
                <option value="17:00 - 19:50 (Tiết 10-12)" ${item.shift.includes('19:50') || item.shift.includes('Tiết 10-12') ? 'selected' : ''}>Tối: 17:00 - 19:50 (Tiết 10-12 Ca Tối)</option>
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
              <input type="text" id="edit-sch-lecturer" list="teachers-datalist-edit" value="${item.lecturer}" placeholder="Chọn hoặc nhập tên giảng viên..." class="w-full p-2 bg-white border border-slate-300 rounded">
              <datalist id="teachers-datalist-edit">
                ${teacherEditDatalistHtml}
              </datalist>
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

        const timing = this.parseShiftTiming(shift);
        return {
          labId,
          date,
          shift: timing.shift,
          startTime: timing.startTime,
          endTime: timing.endTime,
          startPeriod: timing.startPeriod,
          endPeriod: timing.endPeriod,
          subject,
          courseCode,
          className,
          lecturer,
          studentCount,
          note
        };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        Object.assign(item, res.value);
        window.saveStateToLocalStorage();
        this.renderMainContent();
        this.updateKPIs();
        this.checkAndAutoActivateShifts();
        if (typeof window.updateDashboardKPIs === 'function') window.updateDashboardKPIs();
        if (typeof renderDashboardTodaySchedules === 'function') renderDashboardTodaySchedules();
        if (window.labSimulation && typeof window.labSimulation.loadLab === 'function') {
          window.labSimulation.loadLab(window.labSimulation.currentLabId);
        }
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

    const curUser = window.appState.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const isAdminOrManager = (role === 'admin' || role === 'lab_manager');

    // Chỉ Quản trị viên, Quản lý phòng máy và Giảng viên phụ trách mới có quyền vào ca hoặc trả phòng
    if (!isAdminOrManager) {
      if (role !== 'teacher') {
        Swal.fire({
          icon: 'error',
          title: 'Từ chối quyền hạn',
          text: 'Chỉ Giảng viên phụ trách ca dạy hoặc Quản lý phòng máy mới có quyền mở ca thực hành hoặc trả phòng.'
        });
        return;
      }
      const isOwner = this.checkLecturerOwnership(curUser, item.lecturer);
      if (!isOwner) {
        Swal.fire({
          icon: 'warning',
          title: 'KHÔNG THỂ THAO TÁC CA DẠY CỦA GIẢNG VIÊN KHÁC',
          text: `Ca học này do Giảng viên [${item.lecturer}] phụ trách. Giảng viên chỉ có quyền vào ca hoặc trả phòng cho ca dạy do chính mình đảm nhiệm.`,
          confirmButtonColor: '#2563eb'
        });
        return;
      }
    }

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

    const curUser = window.appState.currentUser;
    const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
    const isAdminOrManager = (role === 'admin' || role === 'lab_manager');

    // Giảng viên chỉ có quyền hủy ca thực hành của chính mình
    if (!isAdminOrManager) {
      if (role !== 'teacher') {
        Swal.fire('Từ chối', 'Bạn không có quyền hủy ca học.', 'error');
        return;
      }
      const isOwner = this.checkLecturerOwnership(curUser, item.lecturer);
      if (!isOwner) {
        Swal.fire({
          icon: 'warning',
          title: 'KHÔNG THỂ HỦY CA CỦA GIẢNG VIÊN KHÁC',
          text: `Ca học này do Giảng viên [${item.lecturer}] phụ trách. Giảng viên chỉ có quyền hủy ca thực hành do chính mình đảm nhiệm. Vui lòng liên hệ Quản lý phòng máy để được hỗ trợ.`,
          confirmButtonColor: '#2563eb'
        });
        return;
      }
    }

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
  // TRUNG TÂM CẬP NHẬT THỜI KHÓA BIỂU TỰ ĐỘNG TỪ FILE EXCEL (TNUS SMART ENGINE)
  // =========================================================================

  // 1. Mở Modal Cập nhật TKB Tự động từ Excel
  openAutoExcelImportModal() {
    if (typeof window.checkPermission === 'function' && !window.checkPermission('manage_schedule', 'Cập nhật Thời khóa biểu từ Excel')) return;

    const backupRaw = localStorage.getItem('tnus_schedule_backup_last');
    let backupInfo = null;
    if (backupRaw) {
      try {
        backupInfo = JSON.parse(backupRaw);
      } catch (e) {}
    }

    Swal.fire({
      title: `
        <div class="text-center pt-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <i class="fa-solid fa-graduation-cap"></i> KHOA TOÁN - TIN • TRƯỜNG ĐH KHOA HỌC (TNUS)
          </div>
          <div class="text-lg font-extrabold text-slate-800">Cập Nhật Thời Khóa Biểu Tự Động Từ Excel</div>
          <p class="text-xs text-slate-500 font-normal mt-1">Cán bộ phụ trách: <strong>ThS. Trịnh Minh Phú (0975.090.666)</strong></p>
        </div>
      `,
      html: `
        <div class="text-left space-y-4 pt-2 text-xs">
          <!-- 1. Thanh công cụ hỗ trợ tải mẫu & khôi phục -->
          <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <button onclick="window.scheduleManager.downloadScheduleExcelTemplate()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
              <i class="fa-solid fa-file-arrow-down"></i>
              <span>Tải file Excel mẫu chuẩn TNUS</span>
            </button>
            ${backupInfo ? `
            <button onclick="window.scheduleManager.rollbackScheduleBackup()" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5" title="Bản sao lưu lúc ${backupInfo.timeStr} (${backupInfo.count} ca)">
              <i class="fa-solid fa-rotate-left text-amber-600"></i>
              <span>Hoàn tác TKB (${backupInfo.timeStr.split(' ')[0]})</span>
            </button>` : ''}
          </div>

          <!-- 2. Khu vực Kéo & Thả / Chọn tệp từ máy tính -->
          <div id="sch-drop-zone" class="border-2 border-dashed border-blue-300 hover:border-blue-600 rounded-xl p-6 text-center transition bg-blue-50/30 hover:bg-blue-50/70 cursor-pointer" onclick="document.getElementById('modal-input-schedule-excel').click()">
            <i class="fa-solid fa-cloud-arrow-up text-4xl text-blue-600 mb-2 block animate-pulse"></i>
            <div class="font-bold text-slate-800 text-sm">Bấm để chọn tệp Excel hoặc Kéo & Thả tệp vào đây</div>
            <div class="text-slate-500 text-[11px] mt-1">Hỗ trợ tệp <strong>.xlsx, .xls, .csv</strong> từ Phòng Đào tạo / Khoa Toán - Tin</div>
            <input type="file" id="modal-input-schedule-excel" class="hidden" accept=".xlsx, .xls, .csv" onchange="window.scheduleManager.handleExcelFileSelection(event)">
          </div>

          <!-- 3. Tùy chọn nạp từ liên kết trực tuyến -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div class="font-bold text-slate-700 flex items-center gap-1.5">
              <i class="fa-solid fa-link text-blue-600"></i>
              <span>Hoặc cập nhật qua Đường dẫn trực tuyến (Google Sheets / Link Excel):</span>
            </div>
            <div class="flex gap-2">
              <input type="text" id="sch-online-link-input" placeholder="Dán link Google Sheets hoặc link tệp Excel vào đây..." class="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <button onclick="window.scheduleManager.fetchScheduleFromOnlineUrl(document.getElementById('sch-online-link-input').value)" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition flex items-center gap-1 shadow-xs whitespace-nowrap">
                <i class="fa-solid fa-cloud-arrow-down"></i>
                <span>Tải & Nạp</span>
              </button>
            </div>
          </div>

          <!-- 4. Lựa chọn Chế độ cập nhật -->
          <div class="space-y-1.5">
            <div class="font-bold text-slate-700">Lựa chọn chế độ cập nhật dữ liệu:</div>
            <div class="grid grid-cols-1 gap-2 text-[11px]">
              <label class="flex items-start gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-blue-50/30 cursor-pointer">
                <input type="radio" name="sch-import-mode" value="merge_overwrite" checked class="mt-0.5 text-blue-600">
                <div>
                  <div class="font-bold text-slate-800">Cập nhật & Ghi đè thông minh (Khuyên dùng)</div>
                  <div class="text-slate-500 text-[10px]">Nếu ca học bị trùng phòng & khung giờ: ghi đè thông tin mới nhất từ Excel; nếu là ca mới: tự động bổ sung.</div>
                </div>
              </label>
              <label class="flex items-start gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-blue-50/30 cursor-pointer">
                <input type="radio" name="sch-import-mode" value="replace_all" class="mt-0.5 text-blue-600">
                <div>
                  <div class="font-bold text-rose-700">Thay thế toàn bộ Thời khóa biểu</div>
                  <div class="text-slate-500 text-[10px]">Xóa toàn bộ lịch cũ hiện tại và thay thế 100% bằng dữ liệu từ file Excel (phù hợp khi xếp mới cho học kỳ).</div>
                </div>
              </label>
              <label class="flex items-start gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-blue-50/30 cursor-pointer">
                <input type="radio" name="sch-import-mode" value="append_only" class="mt-0.5 text-blue-600">
                <div>
                  <div class="font-bold text-slate-800">Chỉ bổ sung ca mới (Bỏ qua ca trùng)</div>
                  <div class="text-slate-500 text-[10px]">Giữ nguyên toàn bộ ca học hiện tại trên hệ thống, chỉ thêm các ca chưa từng tồn tại.</div>
                </div>
              </label>
            </div>
          </div>

          <!-- 5. Quy tắc nhận diện tự động thông minh -->
          <div class="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-[11px] text-blue-900 space-y-1">
            <div class="font-bold flex items-center gap-1">
              <i class="fa-solid fa-wand-magic-sparkles text-blue-600"></i>
              <span>Cơ chế tự động thông minh của hệ thống:</span>
            </div>
            <div>• Tự động bỏ qua các dòng biểu ngữ tiêu đề trường/khoa ở đầu file.</div>
            <div>• Tự động ánh xạ 4 phòng máy: <strong>PM1</strong> (A1-503), <strong>PM2</strong> (A1-504), <strong>PM3</strong> (A1-505), <strong>PM4</strong> (A1-506).</div>
            <div>• Tự động chuẩn hóa khung 10 tiết học chuẩn TNUS (Sáng 07:00-11:50, Chiều 13:00-17:50) và kích hoạt ngay ca LIVE hôm nay.</div>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '620px',
      didOpen: () => {
        const dropZone = document.getElementById('sch-drop-zone');
        if (dropZone) {
          dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('border-blue-600', 'bg-blue-100/50');
          });
          dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('border-blue-600', 'bg-blue-100/50');
          });
          dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('border-blue-600', 'bg-blue-100/50');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
              window.scheduleManager.processExcelScheduleFile(e.dataTransfer.files[0]);
            }
          });
        }
      }
    });
  }

  // 2. Xử lý khi Admin chọn tệp từ thẻ file input
  handleExcelFileSelection(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    this.processExcelScheduleFile(file);
    event.target.value = '';
  }

  // 3. Tải và nạp tệp Excel từ URL trực tuyến / Google Sheets
  async fetchScheduleFromOnlineUrl(url) {
    if (!url || !url.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập đường dẫn URL tệp Excel hoặc Google Sheets.', 'warning');
      return;
    }

    let fetchUrl = url.trim();
    // Tự động chuyển đổi link Google Sheets sang xuất Excel
    if (fetchUrl.includes('docs.google.com/spreadsheets/d/')) {
      const match = fetchUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
      }
    }

    Swal.fire({
      title: 'Đang tải tệp Excel từ liên kết...',
      text: 'Vui lòng chờ trong giây lát...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const fileName = url.split('/').pop().split('?')[0] || 'LichThucHanh_Online.xlsx';
      const file = new File([blob], fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ? fileName : `${fileName}.xlsx`, { type: blob.type });
      this.processExcelScheduleFile(file);
    } catch (err) {
      console.error('Lỗi tải tệp online:', err);
      Swal.fire({
        icon: 'error',
        title: 'Không thể tải tệp từ liên kết này',
        html: `
          <div class="text-left text-xs space-y-1">
            <p>Lỗi: <strong>${err.message}</strong></p>
            <p class="text-slate-500">Gợi ý: Nếu là Google Sheets, hãy đảm bảo bảng tính đã được bật chế độ <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong> (Public View).</p>
          </div>
        `
      });
    }
  }

  // 4. Thuật toán cốt lõi: Đọc, Phân tích tự động & Chuẩn hóa dữ liệu file Excel
  processExcelScheduleFile(file) {
    if (!file) return;
    if (typeof XLSX === 'undefined') {
      Swal.fire('Lỗi', 'Thư viện SheetJS XLSX chưa sẵn sàng.', 'error');
      return;
    }

    Swal.fire({
      title: 'Đang phân tích tệp Excel...',
      html: `Đang đọc dữ liệu từ tệp <strong>${file.name}</strong>...`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let sheetName = workbook.SheetNames[0];
        const preferred = workbook.SheetNames.find(n => /lich|tkb|schedule|thuchanh/i.test(n));
        if (preferred) sheetName = preferred;

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          Swal.fire('Lỗi', 'Không tìm thấy bảng tính hợp lệ trong tệp Excel.', 'error');
          return;
        }

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (!rawRows || rawRows.length === 0) {
          Swal.fire('Thông báo', 'Tệp Excel không có dòng dữ liệu nào.', 'warning');
          return;
        }

        // Tự động tìm hàng tiêu đề & ánh xạ cột
        let headerRowIdx = -1;
        let colMap = {};
        for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;
          const tempMap = {};
          let matchCount = 0;
          for (let c = 0; c < row.length; c++) {
            const field = matchScheduleColumn(row[c]);
            if (field && tempMap[field] === undefined) {
              tempMap[field] = c;
              matchCount++;
            }
          }
          if (matchCount >= 3 && (tempMap.labId !== undefined || tempMap.subject !== undefined)) {
            headerRowIdx = r;
            colMap = tempMap;
            break;
          }
        }

        const parsedShifts = [];
        const currentMonday = typeof window.getMondayOfDateStr === 'function' ? window.getMondayOfDateStr(this.getTodayDateStr()) : '2026-11-23';

        if (headerRowIdx >= 0) {
          for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!row || row.length === 0) continue;
            
            const rawLab = colMap.labId !== undefined ? row[colMap.labId] : '';
            const rawDate = colMap.date !== undefined ? row[colMap.date] : '';
            const rawShift = colMap.shift !== undefined ? row[colMap.shift] : '';
            const rawSubject = colMap.subject !== undefined ? row[colMap.subject] : '';
            
            if (!rawSubject && !rawLab) continue;

            const labId = normalizeScheduleLabId(rawLab);
            const date = parseExcelScheduleDate(rawDate, currentMonday) || this.getTodayDateStr();
            const timing = this.parseShiftTiming(rawShift || '07:00 - 11:50 (Tiết 1-5)');
            const subject = String(rawSubject || 'Tin học ứng dụng').trim();
            const courseCode = colMap.courseCode !== undefined ? String(row[colMap.courseCode] || '').trim().toUpperCase() : 'TIN-TNUS';
            const className = colMap.className !== undefined ? String(row[colMap.className] || '').trim() : 'Lớp thực hành';
            const lecturer = colMap.lecturer !== undefined ? String(row[colMap.lecturer] || '').trim() : 'ThS. Trịnh Minh Phú';
            const studentCount = colMap.studentCount !== undefined ? parseInt(row[colMap.studentCount], 10) || 24 : 24;
            const note = colMap.note !== undefined ? String(row[colMap.note] || '').trim() : '';

            // Tự động suy luận trạng thái ca học
            const todayStr = this.getTodayDateStr();
            const now = new Date();
            const curTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            let initialStatus = 'Chưa diễn ra';
            if (date < todayStr) {
              initialStatus = 'Đã hoàn thành';
            } else if (date === todayStr) {
              if (curTimeStr >= timing.endTime) {
                initialStatus = 'Đã hoàn thành';
              } else if (curTimeStr >= timing.startTime && curTimeStr < timing.endTime) {
                initialStatus = 'Đang diễn ra';
              } else {
                initialStatus = 'Sắp diễn ra';
              }
            }

            parsedShifts.push({
              id: `LICH-IMP-${Date.now().toString().slice(-4)}-${parsedShifts.length + 1}`,
              labId,
              date,
              shift: timing.shift,
              startTime: timing.startTime,
              endTime: timing.endTime,
              startPeriod: timing.startPeriod,
              endPeriod: timing.endPeriod,
              courseCode: courseCode || 'TIN-TNUS',
              subject,
              className: className || 'K21 CNTT',
              lecturer: lecturer || 'ThS. Trịnh Minh Phú',
              studentCount,
              note,
              status: initialStatus,
              type: 'Thực hành chính khóa',
              creator: 'admin@dhkhoahoc.edu.vn'
            });
          }
        } else {
          // Fallback sheet_to_json
          const jsonRows = XLSX.utils.sheet_to_json(worksheet);
          jsonRows.forEach((row, idx) => {
            const labRaw = (row['Phòng máy'] || row['Phòng'] || row['labId'] || 'PM1').toString();
            const labId = normalizeScheduleLabId(labRaw);
            const date = parseExcelScheduleDate(row['Ngày học'] || row['Ngày'] || row['date'], currentMonday) || this.getTodayDateStr();
            const shift = (row['Ca thực hành'] || row['Ca học'] || row['shift'] || '07:00 - 11:50 (Tiết 1-5)').toString();
            const timing = this.parseShiftTiming(shift);
            const subject = (row['Tên môn học'] || row['Môn học'] || row['subject'] || 'Tin học ứng dụng').toString().trim();
            const courseCode = (row['Mã học phần'] || row['Mã môn'] || row['courseCode'] || 'TIN-TNUS').toString().trim().toUpperCase();
            const className = (row['Lớp học phần'] || row['Lớp'] || row['className'] || 'K21 CNTT').toString().trim();
            const lecturer = (row['Giảng viên giảng dạy'] || row['Giảng viên'] || row['lecturer'] || 'ThS. Trịnh Minh Phú').toString().trim();
            const studentCount = parseInt(row['Sĩ số SV'] || row['Sĩ số'] || row['studentCount'] || 24, 10);
            const note = (row['Ghi chú'] || row['Yêu cầu'] || row['note'] || '').toString().trim();

            const todayStr = this.getTodayDateStr();
            const now = new Date();
            const curTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            let initialStatus = 'Chưa diễn ra';
            if (date < todayStr) {
              initialStatus = 'Đã hoàn thành';
            } else if (date === todayStr) {
              if (curTimeStr >= timing.endTime) {
                initialStatus = 'Đã hoàn thành';
              } else if (curTimeStr >= timing.startTime && curTimeStr < timing.endTime) {
                initialStatus = 'Đang diễn ra';
              } else {
                initialStatus = 'Sắp diễn ra';
              }
            }

            parsedShifts.push({
              id: `LICH-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`,
              labId,
              date,
              shift: timing.shift,
              startTime: timing.startTime,
              endTime: timing.endTime,
              startPeriod: timing.startPeriod,
              endPeriod: timing.endPeriod,
              courseCode: courseCode || 'TIN-TNUS',
              subject,
              className: className || 'K21 CNTT',
              lecturer: lecturer || 'ThS. Trịnh Minh Phú',
              studentCount,
              note,
              status: initialStatus,
              type: 'Thực hành chính khóa',
              creator: 'admin@dhkhoahoc.edu.vn'
            });
          });
        }

        if (parsedShifts.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Không thể phân tích dữ liệu',
            text: 'Tệp Excel không chứa dữ liệu ca thực hành nào hợp lệ. Vui lòng kiểm tra lại tệp hoặc sử dụng tệp mẫu chuẩn của trường.'
          });
          return;
        }

        // Phân tích thống kê & xung đột
        const labCapacityMap = { 'PM1': 30, 'PM2': 26, 'PM3': 24, 'PM4': 24 };
        const existingSchedules = window.appState.schedules || [];
        const conflicts = [];
        const overCapacities = [];
        const dates = [];
        const labsSet = new Set();

        parsedShifts.forEach(s => {
          labsSet.add(s.labId);
          if (s.date) dates.push(s.date);

          const maxCap = labCapacityMap[s.labId] || 30;
          if (s.studentCount > maxCap) {
            overCapacities.push(s);
          }

          const hasConflict = existingSchedules.some(ex => ex.labId === s.labId && ex.date === s.date && ex.shift === s.shift);
          if (hasConflict) {
            conflicts.push(s);
          }
        });

        dates.sort();
        const minDate = dates[0] || this.getTodayDateStr();
        const maxDate = dates[dates.length - 1] || this.getTodayDateStr();

        const analysis = {
          shifts: parsedShifts,
          totalRows: rawRows.length,
          conflicts,
          overCapacities,
          minDate,
          maxDate,
          labsCount: labsSet.size
        };

        this.previewExcelScheduleData(analysis, file);

      } catch (err) {
        console.error('Lỗi khi phân tích Excel:', err);
        Swal.fire('Lỗi', `Không thể đọc tệp Excel: ${err.message}`, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // 5. Hiển thị bảng Xem trước dữ liệu & Lựa chọn xác nhận cập nhật
  previewExcelScheduleData(analysis, file) {
    const { shifts, totalRows, conflicts, overCapacities, minDate, maxDate, labsCount } = analysis;

    const sampleRowsHtml = shifts.slice(0, 6).map((s, idx) => `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="p-2 text-center text-slate-400 font-mono">${idx + 1}</td>
        <td class="p-2 font-bold text-blue-700 font-mono">${s.labId}</td>
        <td class="p-2 text-slate-700 whitespace-nowrap font-mono">${s.date}</td>
        <td class="p-2 text-slate-800 font-medium whitespace-nowrap">${s.shift}</td>
        <td class="p-2 font-semibold text-slate-800">${s.subject}<div class="text-[10px] text-slate-400 font-normal">Lớp: ${s.className || 'Chung'}</div></td>
        <td class="p-2 text-slate-700 whitespace-nowrap">${s.lecturer}</td>
        <td class="p-2 text-center font-bold text-slate-700">${s.studentCount}</td>
      </tr>
    `).join('');

    Swal.fire({
      title: `
        <div class="text-center pt-1">
          <div class="text-base font-extrabold text-slate-800 flex items-center justify-center gap-2">
            <i class="fa-solid fa-list-check text-blue-600"></i>
            <span>Xem Trước Dữ Liệu TKB Phân Tích Từ File</span>
          </div>
          <div class="text-xs text-slate-500 font-normal mt-0.5">Tệp: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</div>
        </div>
      `,
      html: `
        <div class="text-left space-y-3.5 text-xs pt-2">
          <!-- Chỉ số thống kê phân tích -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <div class="text-[10px] uppercase font-bold text-blue-600">Tổng ca phát hiện</div>
              <div class="text-xl font-extrabold text-blue-800 mt-0.5">${shifts.length}</div>
              <div class="text-[10px] text-blue-600">từ ${totalRows} dòng</div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div class="text-[10px] uppercase font-bold text-emerald-600">Số phòng học</div>
              <div class="text-xl font-extrabold text-emerald-800 mt-0.5">${labsCount}</div>
              <div class="text-[10px] text-emerald-600">PM1 đến PM4</div>
            </div>
            <div class="p-2.5 rounded-xl ${conflicts.length > 0 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-slate-50 border border-slate-200 text-slate-700'} text-center">
              <div class="text-[10px] uppercase font-bold ${conflicts.length > 0 ? 'text-amber-600' : 'text-slate-500'}">Ca trùng lịch</div>
              <div class="text-xl font-extrabold mt-0.5">${conflicts.length}</div>
              <div class="text-[10px] ${conflicts.length > 0 ? 'text-amber-600' : 'text-slate-400'}">${conflicts.length > 0 ? 'Ghi đè hoặc bỏ qua' : 'Không trùng'}</div>
            </div>
            <div class="p-2.5 rounded-xl ${overCapacities.length > 0 ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-slate-50 border border-slate-200 text-slate-700'} text-center">
              <div class="text-[10px] uppercase font-bold ${overCapacities.length > 0 ? 'text-rose-600' : 'text-slate-500'}">Cảnh báo sĩ số</div>
              <div class="text-xl font-extrabold mt-0.5">${overCapacities.length}</div>
              <div class="text-[10px] ${overCapacities.length > 0 ? 'text-rose-600' : 'text-slate-400'}">${overCapacities.length > 0 ? 'Vượt máy phòng' : 'Đảm bảo máy'}</div>
            </div>
          </div>

          <!-- Khoảng thời gian -->
          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <span><i class="fa-regular fa-calendar text-blue-600 mr-1"></i>Khoảng thời gian: <strong>${minDate}</strong> đến <strong>${maxDate}</strong></span>
            <span><i class="fa-solid fa-clock text-amber-500 mr-1"></i>Khung 10 tiết chuẩn TNUS</span>
          </div>

          <!-- Bảng xem trước 6 ca tiêu biểu -->
          <div>
            <div class="font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Mẫu 6 ca học đầu tiên được chuẩn hóa:</span>
              <span class="text-[10px] text-slate-400 font-normal">Hiển thị 6 / ${shifts.length} ca</span>
            </div>
            <div class="overflow-x-auto max-h-48 border border-slate-200 rounded-lg">
              <table class="w-full text-[11px]">
                <thead class="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                  <tr>
                    <th class="p-2 text-center">#</th>
                    <th class="p-2 text-left">Phòng</th>
                    <th class="p-2 text-left">Ngày</th>
                    <th class="p-2 text-left">Ca / Tiết</th>
                    <th class="p-2 text-left">Môn học</th>
                    <th class="p-2 text-left">Giảng viên</th>
                    <th class="p-2 text-center">Sĩ số</th>
                  </tr>
                </thead>
                <tbody>
                  ${sampleRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Chế độ cập nhật -->
          <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div class="font-bold text-slate-700">Xác nhận chế độ áp dụng:</div>
            <div class="flex flex-wrap gap-3 text-[11px]">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="sch-preview-mode" value="merge_overwrite" checked class="text-blue-600">
                <span class="font-semibold text-slate-800">Ghi đè thông minh</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="sch-preview-mode" value="replace_all" class="text-blue-600">
                <span class="font-semibold text-rose-700">Thay thế toàn bộ</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="sch-preview-mode" value="append_only" class="text-blue-600">
                <span class="font-semibold text-slate-800">Chỉ thêm mới</span>
              </label>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-cloud-arrow-up mr-1.5"></i> Cập Nhật Lên Hệ Thống Ngay',
      cancelButtonText: 'Chọn tệp khác',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      width: '680px'
    }).then(result => {
      if (result.isConfirmed) {
        const mode = document.querySelector('input[name="sch-preview-mode"]:checked')?.value || 'merge_overwrite';
        this.executeScheduleUpdate(analysis, mode, file.name);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.openAutoExcelImportModal();
      }
    });
  }

  // 6. Thực thi cập nhật dữ liệu tự động lên toàn hệ thống
  executeScheduleUpdate(analysis, mode, fileName) {
    const { shifts } = analysis;
    if (!shifts || shifts.length === 0) return;

    // 1. Lưu bản sao lưu an toàn trước khi cập nhật
    const backup = {
      timestamp: Date.now(),
      timeStr: new Date().toLocaleString('vi-VN'),
      count: (window.appState.schedules || []).length,
      schedules: JSON.parse(JSON.stringify(window.appState.schedules || []))
    };
    localStorage.setItem('tnus_schedule_backup_last', JSON.stringify(backup));

    let addedCount = 0;
    let updatedCount = 0;

    if (mode === 'replace_all') {
      window.appState.schedules = [...shifts];
      addedCount = shifts.length;
    } else if (mode === 'append_only') {
      shifts.forEach(newShift => {
        const conflict = window.appState.schedules.find(s => s.labId === newShift.labId && s.date === newShift.date && s.shift === newShift.shift);
        if (!conflict) {
          window.appState.schedules.push(newShift);
          addedCount++;
        }
      });
    } else {
      // merge_overwrite (mặc định)
      shifts.forEach(newShift => {
        const conflictIndex = window.appState.schedules.findIndex(s => s.labId === newShift.labId && s.date === newShift.date && s.shift === newShift.shift);
        if (conflictIndex >= 0) {
          Object.assign(window.appState.schedules[conflictIndex], newShift);
          updatedCount++;
        } else {
          window.appState.schedules.push(newShift);
          addedCount++;
        }
      });
    }

    // 2. Chuẩn hóa 100% ca học
    window.appState.schedules.forEach(s => {
      const timing = this.parseShiftTiming(s.shift || `${s.startTime || '07:00'} - ${s.endTime || '11:50'}`);
      s.shift = timing.shift;
      s.startTime = s.startTime || timing.startTime;
      s.endTime = s.endTime || timing.endTime;
      s.startPeriod = s.startPeriod || timing.startPeriod;
      s.endPeriod = s.endPeriod || timing.endPeriod;
    });

    // 3. Lưu vào LocalStorage
    window.saveStateToLocalStorage();

    // 4. Kích hoạt tự động vào ca & cập nhật đa phân hệ ngay tức thì
    this.renderMainContent();
    this.updateKPIs();
    this.checkAndAutoActivateShifts();

    if (typeof window.updateDashboardKPIs === 'function') window.updateDashboardKPIs();
    if (typeof renderDashboardTodaySchedules === 'function') renderDashboardTodaySchedules();
    if (window.labSimulation && typeof window.labSimulation.loadLab === 'function') {
      window.labSimulation.loadLab(window.labSimulation.currentLabId);
    }

    // 5. Ghi nhật ký kiểm toán an ninh
    if (typeof window.logUserActivity === 'function') {
      window.logUserActivity('Cập nhật TKB từ Excel', `Admin tự động cập nhật TKB từ tệp [${fileName}] (Chế độ: ${mode}): thêm mới ${addedCount} ca, ghi đè ${updatedCount} ca. Tổng cộng: ${window.appState.schedules.length} ca.`);
    }

    // 6. Thông báo thành công
    const todayStr = this.getTodayDateStr();
    const todayShifts = window.appState.schedules.filter(s => s.date === todayStr);
    const liveShift = todayShifts.find(s => s.status === 'Đang diễn ra');

    Swal.fire({
      icon: 'success',
      title: 'Cập nhật Thời khóa biểu thành công!',
      html: `
        <div class="text-left text-xs space-y-2 pt-1">
          <p class="text-slate-600">Đã hoàn tất phân tích & nạp tự động tệp <strong>${fileName}</strong>:</p>
          <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
            <p><strong>• Thêm mới thành công:</strong> ${addedCount} ca học</p>
            ${updatedCount > 0 ? `<p><strong>• Ghi đè / Cập nhật:</strong> ${updatedCount} ca học</p>` : ''}
            <p><strong>• Tổng số ca toàn hệ thống:</strong> ${window.appState.schedules.length} ca</p>
          </div>
          <div class="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
            <span>Hôm nay (<strong>${todayStr}</strong>): Có <strong>${todayShifts.length}</strong> ca học.</span>
            ${liveShift ? `<div class="font-bold text-emerald-700 mt-0.5">🔵 ĐANG CÓ CA HỌC LIVE: Phòng ${liveShift.labId} - Môn ${liveShift.subject} (Máy trạm đã được kích hoạt tự động).</div>` : ''}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-calendar-days mr-1"></i> Xem Thời Khóa Biểu',
      cancelButtonText: '<i class="fa-solid fa-gauge-high mr-1"></i> Xem Dashboard',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#0f172a'
    }).then(res => {
      if (res.isConfirmed) {
        this.renderView();
      } else if (res.dismiss === Swal.DismissReason.cancel) {
        if (typeof window.switchTab === 'function') {
          window.switchTab('dashboard');
        }
      }
    });
  }

  // 7. Tải xuống tệp Excel mẫu chuẩn đào tạo TNUS
  downloadScheduleExcelTemplate() {
    if (typeof XLSX === 'undefined') {
      Swal.fire('Lỗi', 'Thư viện SheetJS XLSX chưa sẵn sàng.', 'error');
      return;
    }

    const sampleRows = [
      {
        'STT': 1,
        'Phòng máy': 'PM1 (A1-503)',
        'Ngày học': '2026-11-23',
        'Ca thực hành': '07:00 - 08:50 (Tiết 1-2)',
        'Mã học phần': 'TIN101',
        'Tên môn học': 'Lập trình Python cơ bản',
        'Lớp học phần': 'K21 CNTT - Nhóm 1',
        'Giảng viên giảng dạy': 'ThS. Trịnh Minh Phú',
        'Sĩ số SV': 28,
        'Ghi chú / Yêu cầu': 'Cài đặt Python 3.11, VS Code, Git'
      },
      {
        'STT': 2,
        'Phòng máy': 'PM2 (A1-504)',
        'Ngày học': '2026-11-23',
        'Ca thực hành': '09:00 - 10:50 (Tiết 3-4)',
        'Mã học phần': 'MAT204',
        'Tên môn học': 'Toán ứng dụng & Thống kê máy tính',
        'Lớp học phần': 'K20 Toán ứng dụng',
        'Giảng viên giảng dạy': 'TS. Nguyễn Văn A',
        'Sĩ số SV': 24,
        'Ghi chú / Yêu cầu': 'Sử dụng phần mềm R / RStudio'
      },
      {
        'STT': 3,
        'Phòng máy': 'PM3 (A1-505)',
        'Ngày học': '2026-11-23',
        'Ca thực hành': '13:00 - 14:50 (Tiết 6-7)',
        'Mã học phần': 'CS301',
        'Tên môn học': 'Cơ sở dữ liệu & SQL Server',
        'Lớp học phần': 'K21 Tin học',
        'Giảng viên giảng dạy': 'ThS. Trần Thị B',
        'Sĩ số SV': 22,
        'Ghi chú / Yêu cầu': 'SQL Server 2022'
      },
      {
        'STT': 4,
        'Phòng máy': 'PM4 (A1-506)',
        'Ngày học': '2026-11-23',
        'Ca thực hành': '15:00 - 16:50 (Tiết 8-9)',
        'Mã học phần': 'NET205',
        'Tên môn học': 'Mạng máy tính & An toàn thông tin',
        'Lớp học phần': 'K20 CNTT',
        'Giảng viên giảng dạy': 'ThS. Trịnh Minh Phú',
        'Sĩ số SV': 24,
        'Ghi chú / Yêu cầu': 'Cisco Packet Tracer, Wireshark'
      }
    ];

    const wb = XLSX.utils.book_new();

    // Sheet 1: Mẫu nhập TKB
    const ws1 = XLSX.utils.json_to_sheet(sampleRows);
    ws1['!cols'] = [
      { wch: 6 },  // STT
      { wch: 16 }, // Phòng máy
      { wch: 14 }, // Ngày học
      { wch: 28 }, // Ca thực hành
      { wch: 14 }, // Mã học phần
      { wch: 34 }, // Tên môn học
      { wch: 22 }, // Lớp học phần
      { wch: 24 }, // Giảng viên giảng dạy
      { wch: 12 }, // Sĩ số SV
      { wch: 35 }  // Ghi chú
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Mau_ThoiKhoaBieu');

    // Sheet 2: Hướng dẫn khung tiết & phòng máy chuẩn TNUS
    const guideRows = [
      { 'Mục': 'Đơn vị quản lý', 'Quy định / Hướng dẫn': 'KHOA TOÁN - TIN • TRƯỜNG ĐẠI HỌC KHOA HỌC (TNUS)' },
      { 'Mục': 'Cán bộ phụ trách', 'Quy định / Hướng dẫn': 'ThS. Trịnh Minh Phú (SĐT: 0975.090.666)' },
      { 'Mục': 'Khung giờ Buổi Sáng', 'Quy định / Hướng dẫn': '5 Tiết: 07:00 – 11:50 (Tiết 1: 07:00-07:50, Tiết 2: 08:00-08:50, Tiết 3: 09:00-09:50, Tiết 4: 10:00-10:50, Tiết 5: 11:00-11:50)' },
      { 'Mục': 'Khung giờ Buổi Chiều', 'Quy định / Hướng dẫn': '5 Tiết: 13:00 – 17:50 (Tiết 6: 13:00-13:50, Tiết 7: 14:00-14:50, Tiết 8: 15:00-15:50, Tiết 9: 16:00-16:50, Tiết 10: 17:00-17:50)' },
      { 'Mục': 'Phòng máy PM1', 'Quy định / Hướng dẫn': 'Phòng A1-503 (Tầng 5, Nhà A1) - Sức chứa: 30 Máy FPT Elead Core i5-14400, RAM 16GB' },
      { 'Mục': 'Phòng máy PM2', 'Quy định / Hướng dẫn': 'Phòng A1-504 (Tầng 5, Nhà A1) - Sức chứa: 26 Máy (20 Asus Pro + 6 FPT Elead)' },
      { 'Mục': 'Phòng máy PM3', 'Quy định / Hướng dẫn': 'Phòng A1-505 (Tầng 5, Nhà A1) - Sức chứa: 24 Máy đồng bộ Dell OptiPlex' },
      { 'Mục': 'Phòng máy PM4', 'Quy định / Hướng dẫn': 'Phòng A1-506 (Tầng 5, Nhà A1) - Sức chứa: 24 Máy đồng bộ Dell OptiPlex' },
      { 'Mục': 'Quy tắc Ngày học', 'Quy định / Hướng dẫn': 'Hỗ trợ định dạng: YYYY-MM-DD (2026-11-23), DD/MM/YYYY (23/11/2026), hoặc Thứ (Thứ Hai, Thứ 2...)' },
      { 'Mục': 'Quy tắc Ca/Tiết', 'Quy định / Hướng dẫn': 'Hỗ trợ định dạng: 07:00 - 11:50, Tiết 1-5, Tiết 6-10, Tiết 1-3, Tiết 6-8...' }
    ];
    const ws2 = XLSX.utils.json_to_sheet(guideRows);
    ws2['!cols'] = [{ wch: 24 }, { wch: 90 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'HuongDan_QuyDinh_TNUS');

    XLSX.writeFile(wb, 'TNUS_Mau_ThoiKhoaBieu_ThucHanh_PhongMay.xlsx');
  }

  // 8. Khôi phục lại bản sao lưu gần nhất (Rollback)
  rollbackScheduleBackup() {
    const backupRaw = localStorage.getItem('tnus_schedule_backup_last');
    if (!backupRaw) {
      Swal.fire('Thông báo', 'Chưa có bản sao lưu nào để hoàn tác.', 'info');
      return;
    }

    try {
      const backup = JSON.parse(backupRaw);
      Swal.fire({
        title: 'Khôi phục bản sao lưu TKB?',
        html: `
          <div class="text-left text-xs space-y-1.5">
            <p>Hệ thống sẽ hoàn tác lại Thời khóa biểu tại thời điểm:</p>
            <p class="font-bold text-blue-700">• Thời gian: ${backup.timeStr}</p>
            <p class="font-bold text-slate-700">• Số lượng: ${backup.count} ca học</p>
            <p class="text-amber-600 pt-1">Lưu ý: Dữ liệu hiện tại sẽ được thay thế bằng bản sao lưu này.</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý khôi phục',
        cancelButtonText: 'Đóng',
        confirmButtonColor: '#d97706'
      }).then(res => {
        if (res.isConfirmed) {
          window.appState.schedules = [...backup.schedules];
          window.saveStateToLocalStorage();
          this.renderView();
          this.checkAndAutoActivateShifts();
          if (typeof window.updateDashboardKPIs === 'function') window.updateDashboardKPIs();
          if (typeof renderDashboardTodaySchedules === 'function') renderDashboardTodaySchedules();
          if (window.labSimulation && typeof window.labSimulation.loadLab === 'function') {
            window.labSimulation.loadLab(window.labSimulation.currentLabId);
          }
          if (typeof window.logUserActivity === 'function') {
            window.logUserActivity('Hoàn tác TKB', `Đã khôi phục TKB từ bản sao lưu ${backup.timeStr} (${backup.count} ca).`);
          }
          Swal.fire('Thành công', 'Đã khôi phục lại Thời khóa biểu từ bản sao lưu.', 'success');
        }
      });
    } catch (e) {
      Swal.fire('Lỗi', 'Bản sao lưu không hợp lệ.', 'error');
    }
  }

  // 9. Giữ hàm tương thích ngược với các lệnh gọi cũ
  handleExcelImport(event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      this.processExcelScheduleFile(file);
      event.target.value = '';
    }
  }

  // 10. Thiết lập sự kiện Kéo & Thả (Drag & Drop) toàn trang Thời khóa biểu
  setupDragAndDrop() {
    const target = this.container || document.getElementById('schedule-module-container');
    if (!target || target._hasDnDSetup) return;
    target._hasDnDSetup = true;

    ['dragenter', 'dragover'].forEach(name => {
      target.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragleave', 'drop'].forEach(name => {
      target.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    target.addEventListener('drop', (e) => {
      const curUser = window.appState?.currentUser;
      const role = curUser ? (window.normalizeRole ? window.normalizeRole(curUser.role) : curUser.role) : 'student';
      if (role !== 'admin' && role !== 'lab_manager') return;

      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        const file = dt.files[0];
        if (/\.(xlsx|xls|csv)$/i.test(file.name)) {
          this.processExcelScheduleFile(file);
        }
      }
    });
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
