import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        extends: [
            'js/recommended',
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
        ],
        settings: {
            "import/resolver": {
            "typescript": true,
            "node": true,
            },
        },
        languageOptions: { globals: globals.browser },
        rules: {
            "indent": ["error", 4],
            "import/order": ["error", {
                "newlines-between": "always",
                "groups": [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
                "alphabetize": { "order": "asc", "caseInsensitive": true }
            }],
            "import/newline-after-import": ["error", { "count": 1 }],
            "import/no-absolute-path": "error",
        },
    },
    tseslint.configs.recommended,
]);
