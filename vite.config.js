// vite.config.js
import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

// Create dirname equivalent for ESM
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: {
				main: 'index.html',
			},
		},
		// Disable dev warnings in production build
		minify: true,
	},
	server: {
		open: true,
	},
	// Configure for production mode
	define: {
		'process.env.NODE_ENV': JSON.stringify('production'),
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
			// Direct file imports for common files
			'@utils/index.js': resolve(__dirname, './src/utils/formatters.js'),
			'@i18n/index.js': resolve(__dirname, './src/i18n/i18n.js'),
		},
	},
})
