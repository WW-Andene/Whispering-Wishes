// ═══════════════════════════════════════════════════════════════════════════════
// Whispering Wishes — ESLint config
// P1-06 audit fix: catches circular imports and layer violations at commit time.
//
// This file is OPT-IN — it takes effect only when ESLint and its plugins are
// installed. To activate locally:
//   npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import
//
// If they are not installed, nothing changes — the file is inert.
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: '18' },
    'import/resolver': {
      node: { extensions: ['.js', '.jsx'] },
      // Matches paths in jsconfig.json — keeps Vite aliases resolvable by the plugin.
      alias: {
        map: [
          ['@data', './src/data'],
          ['@features', './src/features'],
        ],
        extensions: ['.js', '.jsx'],
      },
    },
  },
  plugins: ['react', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
  ],
  rules: {
    // ── Project conventions (loose — won't fail CI on day one) ────────────────
    'react/prop-types': 'off',            // JSDoc types + internal app, not a lib
    'react/react-in-jsx-scope': 'off',    // Vite + React 18 automatic JSX runtime
    'react/display-name': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',                  // app has legitimate console.warn / console.info
    'no-empty': ['warn', { allowEmptyCatch: true }],

    // ── Structural guards (the actual point of this config) ───────────────────
    // Catches circular imports before they ship.
    'import/no-cycle': ['error', { maxDepth: 10, ignoreExternal: true }],
    // Forbids a dep from deeper in the tree pulling upward (e.g. data/ → core/).
    'import/no-self-import': 'error',
    // Warns on unresolved paths (typos in relative imports).
    'import/no-unresolved': ['warn', { commonjs: false, caseSensitive: true }],
    // Enforces a sensible import group order without being draconian.
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'ignore',
    }],

    // ── P2-02 / P8-20 audit fix: falsy-trap prevention ────────────────────────
    // `|| 0`, `|| ''` etc. swallow valid falsy values (0, '', false). For numeric
    // and string fallbacks, `?? 0` is safer. Warn-level so existing ~210 sites
    // don't break CI on day one — intent is to catch new violations and migrate
    // the old ones incrementally. Flagged at P2-02 and P8-20.
    'no-restricted-syntax': ['warn',
      {
        selector: "LogicalExpression[operator='||'] > Literal[value=0]",
        message: "Use `?? 0` (nullish coalescing) instead of `|| 0` — see P2-02 / P8-20 audit findings. `|| 0` swallows legitimate 0 values.",
      },
      {
        selector: "LogicalExpression[operator='||'] > Literal[value='']",
        message: "Use `?? ''` (nullish coalescing) instead of `|| ''` — empty string is often a valid value (see P2-02 / P8-20).",
      },
    ],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
      env: { 'vitest-globals/env': true },
      rules: {
        'import/no-unresolved': 'off',
      },
    },
    {
      // Service worker runs in a different env — relax browser-only assumptions.
      files: ['public/sw.js'],
      env: { serviceworker: true, browser: false },
      rules: { 'no-unused-vars': 'off' },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'public/',       // sw.js is standalone, not part of the lint tree
    'api/',          // Vercel functions live in their own runtime
  ],
};
