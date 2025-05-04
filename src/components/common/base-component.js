import { LitElement, css } from 'lit'
import { localize } from '@i18n'
import { NotificationService } from '@services'
import { ANIMATION, BREAKPOINT, EVENTS } from '@constants'

/**
 * Debounce a function to prevent multiple executions in a short time period
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @param {boolean} immediate - Whether to execute on the leading edge instead of trailing
 * @returns {Function} The debounced function
 */
function debounce(func, wait = 300, immediate = false) {
	let timeout

	return function executedFunction(...args) {
		const context = this

		const later = function () {
			timeout = null
			if (!immediate) func.apply(context, args)
		}

		const callNow = immediate && !timeout

		window.clearTimeout(timeout)
		timeout = window.setTimeout(later, wait)

		if (callNow) func.apply(context, args)
	}
}

/**
 * Base component that extends LitElement with common functionality
 * All application components should extend this base class
 */
export class BaseComponent extends LitElement {
	constructor() {
		super()
		// Track dispatched events to prevent duplicates
		this._eventRegistry = new Map()
	}

	/**
	 * Adds localization support to all components
	 *
	 * @param {string} key - The translation key
	 * @param {object} options - Options for the translation
	 * @returns {string} The localized string
	 */
	t(key, options = {}) {
		const text = localize(key)

		// Replace placeholders in the format {name} with values from options
		if (options && typeof text === 'string') {
			return text.replace(/\{(\w+)\}/g, (match, name) => {
				return options[name] !== undefined ? options[name] : match
			})
		}

		return text
	}

	/**
	 * Convenience method to dispatch custom events
	 *
	 * @param {string} name - Event name
	 * @param {object} detail - Event details
	 * @param {boolean} bubbles - Whether the event bubbles
	 * @param {boolean} composed - Whether the event can cross shadow DOM boundary
	 */
	dispatch(name, detail = {}, bubbles = true, composed = true) {
		// Check if we've recently dispatched a very similar event
		if (this._eventRegistry.has(name)) {
			const lastDispatchTime = this._eventRegistry.get(name)
			// If less than 300ms have passed, ignore this event (debounce)
			if (Date.now() - lastDispatchTime < 300) {
				return
			}
		}

		// Record this event dispatch
		this._eventRegistry.set(name, Date.now())

		// Clean up old events from registry after 1 second
		window.setTimeout(() => {
			if (this._eventRegistry.has(name)) {
				const time = this._eventRegistry.get(name)
				if (Date.now() - time >= 1000) {
					this._eventRegistry.delete(name)
				}
			}
		}, 1000)

		// Dispatch the event
		this.dispatchEvent(
			new window.CustomEvent(name, {
				detail,
				bubbles,
				composed,
			})
		)
	}

	/**
	 * Debounced version of dispatch for events that are prone to duplication
	 *
	 * @param {string} name - Event name
	 * @param {object} detail - Event details
	 * @param {boolean} bubbles - Whether the event bubbles
	 * @param {boolean} composed - Whether the event can cross shadow DOM boundary
	 */
	debouncedDispatch = debounce(function (name, detail = {}, bubbles = true, composed = true) {
		this.dispatchEvent(
			new window.CustomEvent(name, {
				detail,
				bubbles,
				composed,
			})
		)
	}, 300)

	/**
	 * Utility method to create debounced functions
	 *
	 * @param {Function} func - The function to debounce
	 * @param {number} wait - The debounce wait time in ms
	 * @param {boolean} immediate - Whether to execute on the leading edge
	 * @returns {Function} The debounced function
	 */
	debounce(func, wait = 300, immediate = false) {
		return debounce(func.bind(this), wait, immediate)
	}

	/**
	 * Handles errors consistently across components
	 *
	 * @param {Error} error - The error to handle
	 * @param {string} fallbackMessage - Fallback message if error doesn't have a message
	 * @param {boolean} showNotification - Whether to show a notification
	 * @param {boolean} rethrow - Whether to rethrow the error
	 */
	handleError(error, fallbackMessage = 'An error occurred', showNotification = true, rethrow = false) {
		console.error(fallbackMessage, error)

		if (showNotification) {
			const message = error.message || fallbackMessage
			NotificationService.error(message)
		}

		// Set loading state to false if the component has one
		if (this._loading !== undefined) {
			this._loading = false
		}

		if (rethrow) {
			throw error
		}
	}

	/**
	 * Helper to add transition effects to components
	 *
	 * @param {HTMLElement} element - The element to add the transition to
	 * @param {string} animationClass - Animation class to add
	 * @param {number} duration - Duration in ms
	 */
	addTransition(element, animationClass, duration = ANIMATION.MEDIUM) {
		element.classList.add(animationClass)
		window.setTimeout(() => {
			element.classList.remove(animationClass)
		}, duration)
	}

	/**
	 * Default styles for all components
	 */
	static get baseStyles() {
		return css`
			:host {
				display: block;
				font-family: var(--font-family);
			}

			.hidden {
				display: none !important;
			}

			/* Transition classes */
			.fade-in {
				animation: fadeIn var(--animation-standard) ease-in forwards;
			}

			.fade-out {
				animation: fadeOut var(--animation-standard) ease-out forwards;
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}

			@keyframes fadeOut {
				from {
					opacity: 1;
				}
				to {
					opacity: 0;
				}
			}

			/* Responsive util classes */
			@media (max-width: ${BREAKPOINT.MOBILE}px) {
				.hidden-mobile {
					display: none !important;
				}
			}

			@media (min-width: ${BREAKPOINT.MOBILE + 1}px) and (max-width: ${BREAKPOINT.TABLET}px) {
				.hidden-tablet {
					display: none !important;
				}
			}

			@media (min-width: ${BREAKPOINT.DESKTOP}px) {
				.hidden-desktop {
					display: none !important;
				}
			}
		`
	}

	connectedCallback() {
		super.connectedCallback()
		// Add language change listener to all components
		this._boundOnLanguageChanged = this._onLanguageChanged.bind(this)
		window.addEventListener(EVENTS.LANGUAGE_CHANGED, this._boundOnLanguageChanged)
	}

	disconnectedCallback() {
		// Remove language change listener
		window.removeEventListener(EVENTS.LANGUAGE_CHANGED, this._boundOnLanguageChanged)
		super.disconnectedCallback()
	}

	/**
	 * Handler for language changes
	 * Re-renders the component when language changes
	 * @private
	 */
	_onLanguageChanged() {
		this.requestUpdate()
	}
}
