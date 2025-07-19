import js from '@eslint/js'
import pluginNext from '@next/eslint-plugin-next'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
    {
        ignores: [
            'dist',
            'node_modules',
            '*.config.js',
            '*.config.ts',
            'build',
            '.next',
            '.plasmo',
            '.docs',
        ],
    },
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2022,
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
    {
        ...pluginReact.configs.flat.recommended,
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker,
            },
        },
    },
    {
        plugins: {
            '@next/next': pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs['core-web-vitals'].rules,
        },
    },
    {
        plugins: {
            'react-hooks': pluginReactHooks,
        },
        settings: { react: { version: 'detect' } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            // React scope no longer necessary with new JSX transform.
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-hooks/exhaustive-deps': 'error',
        },
    },
]
