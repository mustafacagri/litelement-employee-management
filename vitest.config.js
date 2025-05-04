import { defineConfig } from 'vitest/config'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

// Create dirname equivalent for ESM
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		include: ['test/**/*.test.js'],
		setupFiles: ['./test/setup-test-environment.js'],
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@components': resolve(__dirname, './src/components'),
			'@utils': resolve(__dirname, './src/utils'),
			'@services': resolve(__dirname, './src/services'),
			'@views': resolve(__dirname, './src/views'),
			'@styles': resolve(__dirname, './src/styles'),
			'@models': resolve(__dirname, './src/models'),
			'@i18n': resolve(__dirname, './src/i18n'),
			'@router': resolve(__dirname, './src/router'),
			'@stores': resolve(__dirname, './src/stores'),
			'@constants': resolve(__dirname, './src/constants'),
		},
	},
})
