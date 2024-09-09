module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'error',
    'react-refresh/only-export-components': [
      'error',
      { allowConstantExport: true },
    ],
    "no-unused-vars": "error",
    "react/prop-types": "error",
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "react/no-unescaped-entities": "error",
    "react/no-children-prop": "error",
    "react/no-array-index-key": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
}