// eslint.config.js
import js from '@eslint/js'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintPluginLit from 'eslint-plugin-lit'
import babelParser from '@babel/eslint-parser'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
	js.configs.recommended,

	{
		plugins: {
			lit: eslintPluginLit,
			prettier: eslintPluginPrettier,
		},
		languageOptions: {
			parser: babelParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				requireConfigFile: false,
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				localStorage: 'readonly',
				console: 'readonly',
				customElements: 'readonly',
				setTimeout: 'readonly',
			},
		},
		files: ['src/**/*.js'],
		rules: {
			...eslintPluginLit.configs.recommended.rules,
			'prettier/prettier': 'error',
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
			'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
		},
	},
]
