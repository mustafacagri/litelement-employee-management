/**
 * Test environment setup file
 * This file ensures the proper loading of components with dependency order
 */

// Import BaseComponent
import { BaseComponent } from '../src/components/common/base-component.js'

// Set production mode - access via globalThis to avoid linter errors
globalThis.process = globalThis.process || {}
globalThis.process.env = globalThis.process.env || {}
globalThis.process.env.NODE_ENV = 'production'

// Explicitly define BaseComponent in global scope to ensure it's available
globalThis.BaseComponent = BaseComponent

// Define global mocks if needed
globalThis.customElements = globalThis.customElements || {
	define: () => {},
}

// Disable certain console messages during tests
const originalConsoleWarn = globalThis.console.warn
globalThis.console.warn = function (...args) {
	// Filter out all Lit dev mode warnings
	const isLitWarning = args.some(
		(arg) =>
			typeof arg === 'string' &&
			(arg.includes('Lit is in dev mode') ||
				arg.includes('Lit is in development mode') ||
				arg.includes('lit.dev/msg/dev-mode'))
	)

	if (!isLitWarning) {
		originalConsoleWarn.apply(globalThis.console, args)
	}
}

// Silence all stderr during tests if it's related to Lit dev mode
if (globalThis.process && globalThis.process.stderr) {
	const originalStdErrWrite = globalThis.process.stderr.write
	globalThis.process.stderr.write = function (chunk, encoding, callback) {
		if (typeof chunk === 'string' && (chunk.includes('Lit is in dev mode') || chunk.includes('lit.dev/msg/dev-mode'))) {
			// Skip writing these warnings to stderr
			if (callback) callback()
			return true
		}
		return originalStdErrWrite.apply(globalThis.process.stderr, arguments)
	}
}
