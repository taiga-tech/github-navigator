export default [
    {
        ignores: ['dist', 'node_modules', '*.config.js', '*.config.ts'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                chrome: 'readonly',
                window: 'readonly',
                document: 'readonly',
                fetch: 'readonly',
                crypto: 'readonly',
                btoa: 'readonly',
                atob: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': 'off',
        },
    },
]
