/**
 * Utility functions for handling events
 */

/**
 * Creates and dispatches a custom event
 *
 * @param {string} eventName - Name of the event
 * @param {Object} detail - Event details
 * @param {Element|Document} target - Element to dispatch from (defaults to document)
 * @param {boolean} bubbles - Whether the event bubbles (defaults to true)
 * @param {boolean} composed - Whether the event crosses shadow DOM boundary (defaults to true)
 * @returns {CustomEvent} The dispatched event
 */
export function dispatchCustomEvent(eventName, detail = {}, target = document, bubbles = true, composed = true) {
	// Use the global CustomEvent constructor
	const event = new window.CustomEvent(eventName, {
		detail,
		bubbles,
		composed,
	})

	target.dispatchEvent(event)
	return event
}

/**
 * Debounces a function call
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
	let timeout

	return function executedFunction(...args) {
		const later = () => {
			window.clearTimeout(timeout)
			func(...args)
		}

		window.clearTimeout(timeout)
		timeout = window.setTimeout(later, wait)
	}
}
