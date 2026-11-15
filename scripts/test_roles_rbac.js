const fs = require('fs');
const vm = require('vm');

const context = {
  window: {},
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    getElementById: (id) => ({
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
    querySelectorAll: () => [],
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
  Swal: {
    fire: () => Promise.resolve({ isConfirmed: true, value: {} }),
    showValidationMessage: () => {}
  },
  XLSX: {
    utils: { json_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: () => {} },
    writeFile: () => {}
  }
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

context.loadState();

console.log('Testing permission check for all 6 roles:');
const roles = ['super_admin', 'admin', 'lab_manager', 'teacher', 'lab_staff', 'student'];
const permissions = [
  'simulation.view', 'simulation.manage',
  'computers.view', 'computers.create', 'computers.edit', 'computers.delete',
  'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.delete',
  'maintenance.view', 'maintenance.create', 'maintenance.edit',
  'users.view', 'users.create', 'users.edit', 'users.delete', 'matrix.manage'
];

roles.forEach(role => {
  context.window.directTestRole(role, 'dashboard');
  let allowedCount = 0;
  permissions.forEach(p => {
    const isAllowed = context.window.checkPermission(p, 'test action', false);
    if (isAllowed) allowedCount++;
  });
  console.log(`  Role [${role}]: ${allowedCount}/${permissions.length} permissions allowed.`);
});

console.log('All role permission checks ran without throwing any error!');
