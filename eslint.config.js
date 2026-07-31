import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const vitestGlobals = {
  afterAll: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
  suite: 'readonly',
  test: 'readonly',
  vi: 'readonly',
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.config.js', 'playwright.config.js', 'vite.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/setup.js', 'src/shared/lib/__mocks__/**'],
    languageOptions: { globals: { ...globals.browser, ...vitestGlobals, global: 'readonly' } },
  },
])
