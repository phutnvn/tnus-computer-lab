/**
 * CHART MANAGER - THỐNG KÊ & BIỂU ĐỒ TRỰC QUAN TNUS
 * Sử dụng thư viện Chart.js v4 để vẽ các biểu đồ phân tích phòng máy
 */

class ChartManager {
  constructor() {
    this.statusChart = null;
    this.labComparisonChart = null;
  }

  // Khởi tạo và cập nhật tất cả biểu đồ Dashboard
  initDashboardCharts() {
    this.renderStatusDoughnutChart();
    this.renderLabBarChart();
  }

  // 1. Biểu đồ tròn: Tỷ lệ trạng thái 104 máy tính
  renderStatusDoughnutChart() {
    const canvas = document.getElementById('chart-status-doughnut');
    if (!canvas) return;

    // Đếm số lượng máy theo trạng thái
    const counts = { good: 0, in_use: 0, warning: 0, broken: 0, inactive: 0 };
    window.appState.computers.forEach(c => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });

    const data = {
      labels: [
        STATUS_CONFIG.good.label,
        STATUS_CONFIG.in_use.label,
        STATUS_CONFIG.warning.label,
        STATUS_CONFIG.broken.label,
        STATUS_CONFIG.inactive.label
      ],
      datasets: [{
        data: [counts.good, counts.in_use, counts.warning, counts.broken, counts.inactive],
        backgroundColor: [
          STATUS_CONFIG.good.color,
          STATUS_CONFIG.in_use.color,
          STATUS_CONFIG.warning.color,
          STATUS_CONFIG.broken.color,
          STATUS_CONFIG.inactive.color
        ],
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    if (this.statusChart) {
      this.statusChart.data = data;
      this.statusChart.update();
      return;
    }

    if (typeof Chart === 'undefined') {
      console.warn('Thư viện Chart.js chưa được nạp sẵn, tạm hoãn vẽ biểu đồ tỷ lệ.');
      return;
    }

    if (typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        borderRadius: 4,
        spacing: 2,
        plugins: {
          legend: {
            display: false // Chúng ta sẽ render custom badge legend trực quan hơn bên cạnh
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw;
                const percentage = ((val / total) * 100).toFixed(1);
                return ` ${context.label}: ${val} máy (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // 2. Biểu đồ cột: So sánh tình trạng thiết bị giữa 4 phòng máy
  renderLabBarChart() {
    const canvas = document.getElementById('chart-lab-bar');
    if (!canvas) return;

    const labs = ['PM1', 'PM2', 'PM3', 'PM4'];
    const goodData = [];
    const inUseData = [];
    const warningData = [];
    const brokenData = [];
    const inactiveData = [];

    labs.forEach(labId => {
      const comps = window.appState.computers.filter(c => c.labId === labId);
      goodData.push(comps.filter(c => c.status === 'good').length);
      inUseData.push(comps.filter(c => c.status === 'in_use').length);
      warningData.push(comps.filter(c => c.status === 'warning').length);
      brokenData.push(comps.filter(c => c.status === 'broken').length);
      inactiveData.push(comps.filter(c => c.status === 'inactive').length);
    });

    const data = {
      labels: ['PM 1 (A1-503)', 'PM2 (A1-504)', 'PM3 (A1-505)', 'PM4 (A1-506)'],
      datasets: [
        {
          label: STATUS_CONFIG.good.label,
          data: goodData,
          backgroundColor: STATUS_CONFIG.good.color,
          borderRadius: 4
        },
        {
          label: STATUS_CONFIG.in_use.label,
          data: inUseData,
          backgroundColor: STATUS_CONFIG.in_use.color,
          borderRadius: 4
        },
        {
          label: STATUS_CONFIG.warning.label,
          data: warningData,
          backgroundColor: STATUS_CONFIG.warning.color,
          borderRadius: 4
        },
        {
          label: STATUS_CONFIG.broken.label,
          data: brokenData,
          backgroundColor: STATUS_CONFIG.broken.color,
          borderRadius: 4
        },
        {
          label: STATUS_CONFIG.inactive.label,
          data: inactiveData,
          backgroundColor: STATUS_CONFIG.inactive.color,
          borderRadius: 4
        }
      ]
    };

    if (this.labComparisonChart) {
      this.labComparisonChart.data = data;
      this.labComparisonChart.update();
      return;
    }

    if (typeof Chart === 'undefined') {
      console.warn('Thư viện Chart.js chưa được nạp sẵn, tạm hoãn vẽ biểu đồ so sánh.');
      return;
    }

    if (typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    this.labComparisonChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 35,
            ticks: { stepSize: 5 }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 12,
              font: { size: 12 }
            }
          }
        }
      }
    });
  }

  // Cập nhật lại toàn bộ biểu đồ khi dữ liệu thay đổi
  refresh() {
    this.renderStatusDoughnutChart();
    this.renderLabBarChart();
  }
}

if (typeof window !== 'undefined') {
  window.ChartManager = ChartManager;
} else if (typeof globalThis !== 'undefined') {
  globalThis.ChartManager = ChartManager;
}
