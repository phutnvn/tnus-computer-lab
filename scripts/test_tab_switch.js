const fs = require('fs');
const vm = require('vm');

const panels = {
  'tab-pane-dashboard': { id: 'tab-pane-dashboard', classList: { add: () => {}, remove: () => {} } },
  'tab-pane-simulation': { id: 'tab-pane-simulation', classList: { add: () => {}, remove: () => {} } },
  'tab-pane-computers': { id: 'tab-pane-computers', classList: { add: () => {}, remove: () => {} } },
  'tab-pane-schedule': { id: 'tab-pane-schedule', classList: { add: () => {}, remove: () => {} } },
  'tab-pane-maintenance': { id: 'tab-pane-maintenance', classList: { add: () => {}, remove: () => {} } },
  'tab-pane-users': { id: 'tab-pane-users', classList: { add: () => {}, remove: () => {} } }
};

const navBtns = [
  { getAttribute: () => 'dashboard', classList: { add: () => {}, remove: () => {} } },
  { getAttribute: () => 'simulation', classList: { add: () => {}, remove: () => {} } },
  { getAttribute: () => 'computers', classList: { add: () => {}, remove: () => {} } },
  { getAttribute: () => 'schedule', classList: { add: () => {}, remove: () => {} } },
  { getAttribute: () => 'maintenance', classList: { add: () => {}, remove: () => {} } },
  { getAttribute: () => 'users', classList: { add: () => {}, remove: () => {} } }
];

const context = {
  window: {},
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    readyState: 'complete',
    getElementById: (id) => panels[id] || ({
      id,
      textContent: '',
      innerHTML: '',
      value: '',
      classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
      style: {},
      querySelectorAll: () => [],
      querySelector: () => null,
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      offsetWidth: 960,
      offsetHeight: 610,
      clientWidth: 960,
      clientHeight: 610
    }),
    querySelectorAll: (sel) => {
      if (sel === '.nav-tab-link') return navBtns;
      if (sel === '.tab-content-panel') return Object.values(panels);
      return [];
    },
    querySelector: () => null,
    createElement: (tag) => ({
      tagName: tag,
      classList: { add: () => {}, remove: () => {} },
      setAttribute: () => {},
      style: {},
      appendChild: () => {}
    }),
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  localStorage: {
    data: {},
    getItem: function(k) { return this.data[k] || null; },
    setItem: function(k, v) { this.data[k] = v; },
    removeItem: function(k) { delete this.data[k]; }
  },
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  console: console,
  Chart: function() { return { update: () => {}, destroy: () => {} }; },
  Swal: { fire: () => Promise.resolve({ isConfirmed: true, value: {} }) },
  XLSX: { utils: { json_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: () => {} }, writeFile: () => {} }
};
context.window = context;

const code = [
  fs.readFileSync('js/data.js', 'utf8'),
  fs.readFileSync('js/lab-simulation.js', 'utf8'),
  fs.readFileSync('js/chart-manager.js', 'utf8'),
  fs.readFileSync('js/schedule.js', 'utf8'),
  fs.readFileSync('js/maintenance.js', 'utf8'),
  fs.readFileSync('js/app.js', 'utf8')
].join('\n\n');

vm.createContext(context);
vm.runInContext(code, context);

console.log('Testing window.switchTab for all 6 tabs:');
const tabs = ['simulation', 'computers', 'schedule', 'maintenance', 'users', 'dashboard'];
tabs.forEach(tab => {
  context.window.switchTab(tab);
  console.log('  -> Switched to tab [' + tab + '] successfully. Current tab: ' + context.window.appState.currentTab);
});
console.log('ALL TABS SWITCHED WITH ZERO ERRORS!');
