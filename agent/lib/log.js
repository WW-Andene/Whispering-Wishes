// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Logging utility
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const log = {
  info: (msg, ...args) => console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.blue}INFO${COLORS.reset}  ${msg}`, ...args),
  ok: (msg, ...args) => console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.green}OK${COLORS.reset}    ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}WARN${COLORS.reset}  ${msg}`, ...args),
  error: (msg, ...args) => console.error(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.red}ERROR${COLORS.reset} ${msg}`, ...args),
  step: (n, total, msg) => console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.cyan}[${n}/${total}]${COLORS.reset} ${msg}`),
  section: (title) => console.log(`\n${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}\n${COLORS.magenta}  ${title}${COLORS.reset}\n${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}\n`),
  dim: (msg) => console.log(`${COLORS.dim}  ${msg}${COLORS.reset}`),
  json: (label, obj) => {
    console.log(`${COLORS.dim}[${timestamp()}]${COLORS.reset} ${COLORS.blue}DATA${COLORS.reset}  ${label}:`);
    console.log(COLORS.dim + JSON.stringify(obj, null, 2).split('\n').map(l => '  ' + l).join('\n') + COLORS.reset);
  },
};

// Accumulated changes for summary report
const changeLog = [];
const addChange = (category, description, confidence = 'HIGH') => {
  changeLog.push({ category, description, confidence, time: timestamp() });
};
const getChangeLog = () => [...changeLog];
const clearChangeLog = () => changeLog.length = 0;

const safeErrorMessage = (err, maxLen = 300) => {
  const msg = (err?.message || String(err) || 'Unknown error')
    .replace(/sk-ant-[a-zA-Z0-9_-]+/g, 'sk-***')
    .replace(/Bearer\s+[a-zA-Z0-9_-]+/gi, 'Bearer ***')
    .replace(/AIzaSy[a-zA-Z0-9_-]+/g, 'AIza***');
  return msg.length > maxLen ? msg.slice(0, maxLen) + '...' : msg;
};

export { log, addChange, getChangeLog, clearChangeLog, safeErrorMessage };
