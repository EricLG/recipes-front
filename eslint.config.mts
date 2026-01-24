import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import { configs } from 'typescript-eslint';

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
    configs.recommended,
]);
