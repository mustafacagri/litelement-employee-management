import { ANIMATION } from '@constants'

/**
 * DOM utility functions
 */

// DOM-related global constructors for type checking
const { Node, HTMLElement, Text } = window

/**
 * Requests an animation frame and returns a promise
 *
 * @returns {Promise} Promise that resolves on next animation frame
 */
export function nextAnimationFrame() {
	return new Promise((resolve) => window.requestAnimationFrame(resolve))
}

/**
 * Creates a DOM element with attributes and properties
 *
 * @param {string} tag - Element tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Array|Node} children - Child elements or text
 * @returns {HTMLElement} The created element
 */
export function createElement(tag, attributes = {}, children = null) {
	const element = document.createElement(tag)

	// Set attributes
	for (const [key, value] of Object.entries(attributes)) {
		if (key === 'className') {
			element.className = value
		} else if (key === 'style' && typeof value === 'object') {
			Object.assign(element.style, value)
		} else {
			element.setAttribute(key, value)
		}
	}

	// Add children
	if (children) {
		if (typeof children === 'string') {
			element.textContent = children
		} else if (Array.isArray(children)) {
			children.forEach((child) => {
				if (child instanceof HTMLElement || child instanceof Text) {
					element.appendChild(child)
				} else if (typeof child === 'string') {
					element.appendChild(document.createTextNode(child))
				}
			})
		} else if (children instanceof Node) {
			element.appendChild(children)
		}
	}

	return element
}

/**
 * Adds a ripple effect to an element
 *
 * @param {Event} event - Mouse event
 * @param {HTMLElement} element - Element to add ripple to
 * @param {number} duration - Animation duration in ms
 */
export function addRippleEffect(event, element, duration = ANIMATION.RIPPLE.DEFAULT_DURATION) {
	const rect = element.getBoundingClientRect()
	const diameter = Math.max(rect.width, rect.height)
	const radius = diameter / 2

	const circle = createElement('span', {
		className: ANIMATION.RIPPLE.CLASS_NAME,
		style: {
			width: `${diameter}px`,
			height: `${diameter}px`,
			left: `${event.clientX - rect.left - radius}px`,
			top: `${event.clientY - rect.top - radius}px`,
		},
	})

	// Remove existing ripples
	const existingRipple = element.querySelector(`.${ANIMATION.RIPPLE.CLASS_NAME}`)
	if (existingRipple) {
		existingRipple.remove()
	}

	element.appendChild(circle)

	// Remove the ripple after animation completes
	window.setTimeout(() => {
		if (circle) {
			circle.remove()
		}
	}, duration)
}
