// Creates a proxy @next/swc-android-arm64 package in node_modules that
// re-exports @next/swc-wasm-nodejs. Next.js's native binding loader calls
// require('@next/swc-<platform>-<arch>') at bootstrap, and on Termux that
// resolves to @next/swc-android-arm64 — a package that does not exist on
// npm. Without this proxy, Next.js fails before any config (Babel preset,
// swcMinify: false, etc) can take effect.
//
// This script runs as a postinstall hook. It is a no-op on platforms
// where the real native package already exists.

const fs = require('fs');
const path = require('path');

const SWC_WASM = '@next/swc-wasm-nodejs';
const TARGET_DIR = path.join('node_modules', '@next', 'swc-android-arm64');
const PROXY_PKG = {
  name: '@next/swc-android-arm64',
  version: '14.2.33',
  main: 'index.js',
  description: 'Proxy that redirects to @next/swc-wasm-nodejs for Android/Termux builds.',
};
const PROXY_INDEX = `module.exports = require('${SWC_WASM}');\n`;

function main() {
  // Only patch when the wasm package is actually installed; otherwise the
  // proxy would silently point to a missing module and produce a worse error.
  const wasmPath = path.join('node_modules', '@next', 'swc-wasm-nodejs');
  if (!fs.existsSync(wasmPath)) {
    console.log('[patch-swc-android] @next/swc-wasm-nodejs not installed, skipping');
    return;
  }

  if (fs.existsSync(TARGET_DIR) && fs.existsSync(path.join(TARGET_DIR, 'index.js'))) {
    const existing = fs.readFileSync(path.join(TARGET_DIR, 'index.js'), 'utf8');
    if (existing === PROXY_INDEX) {
      console.log('[patch-swc-android] proxy already in place, skipping');
      return;
    }
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });
  fs.writeFileSync(path.join(TARGET_DIR, 'package.json'), JSON.stringify(PROXY_PKG, null, 2) + '\n');
  fs.writeFileSync(path.join(TARGET_DIR, 'index.js'), PROXY_INDEX);
  console.log('[patch-swc-android] created node_modules/@next/swc-android-arm64 -> @next/swc-wasm-nodejs');
}

try {
  main();
} catch (err) {
  // Never fail install over this — on platforms where the real native
  // package is used, any filesystem weirdness here is harmless.
  console.error('[patch-swc-android] error (ignored):', err.message);
}
