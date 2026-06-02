import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // The data-fetch-on-mount pattern calls setState synchronously inside
      // an effect to reset loading state. This is intentional and the
      // alternative (key-prop remount) is heavier. Re-enable selectively
      // for components that don't fetch on mount.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
