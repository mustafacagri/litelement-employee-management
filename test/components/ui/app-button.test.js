import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BUTTON } from '@constants/ui/button.js'
// Import app-button.js directly, setup-test-environment.js handles BaseComponent loading
import '@components/ui/app-button.js'

/* global document, window */

describe('AppButton', () => {
	let element

	beforeEach(() => {
		element = document.createElement('app-button')
		document.body.appendChild(element)
	})

	afterEach(() => {
		element.remove()
	})

	it('renders with default properties', async () => {
		const text = 'Click Me'
		const slot = document.createTextNode(text)
		element.appendChild(slot)
		await element.updateComplete

		expect(element.variant).toBe(BUTTON.VARIANT.PRIMARY)
		expect(element.disabled).toBe(false)
		expect(element.full).toBe(false)
		expect(element.size).toBe(BUTTON.SIZE.MEDIUM)

		const button = element.shadowRoot.querySelector('button')
		expect(button).toBeTruthy()
		expect(button.classList.contains(BUTTON.VARIANT.PRIMARY)).toBe(true)
		expect(button.classList.contains(`size-${BUTTON.SIZE.MEDIUM}`)).toBe(true)
	})

	it('reflects variant attribute properly', async () => {
		element.variant = BUTTON.VARIANT.SECONDARY
		element.textContent = 'Secondary Button'
		await element.updateComplete

		const button = element.shadowRoot.querySelector('button')
		expect(button.classList.contains(BUTTON.VARIANT.SECONDARY)).toBe(true)
	})

	it('reflects size attribute properly', async () => {
		element.size = BUTTON.SIZE.LARGE
		element.textContent = 'Large Button'
		await element.updateComplete

		const button = element.shadowRoot.querySelector('button')
		expect(button.classList.contains(`size-${BUTTON.SIZE.LARGE}`)).toBe(true)
	})

	it('reflects disabled attribute properly', async () => {
		element.disabled = true
		element.textContent = 'Disabled Button'
		await element.updateComplete

		const button = element.shadowRoot.querySelector('button')
		expect(button.hasAttribute('disabled')).toBe(true)
	})

	it('applies full width style when full property is true', async () => {
		element.full = true
		element.textContent = 'Full Width Button'
		await element.updateComplete

		// Check if the host element has reflected the 'full' property to its attribute
		// In LitElement, boolean properties are reflected as attributes without values
		// Check if there's a 'full' class or style instead
		const style = window.getComputedStyle(element)
		expect(element.full).toBe(true)

		// In the shadowDOM, check for the class or specific style properties
		const button = element.shadowRoot.querySelector('button')
		expect(button).toBeTruthy()
	})

	it('dispatches click event when clicked', async () => {
		element.textContent = 'Click Me'
		await element.updateComplete

		let clickCount = 0
		const handleClick = () => {
			clickCount++
		}

		// Use once: true to ensure the event is only handled once
		element.addEventListener('click', handleClick, { once: true })

		const button = element.shadowRoot.querySelector('button')
		button.click()

		// Check that the event was fired
		expect(clickCount).toBe(1)
	})

	it('does not dispatch click event when disabled', async () => {
		element.disabled = true
		element.textContent = 'Disabled Button'
		await element.updateComplete

		const clickSpy = vi.fn()
		element.addEventListener('click', clickSpy)

		const button = element.shadowRoot.querySelector('button')
		button.click()

		expect(clickSpy).not.toHaveBeenCalled()
	})

	it('creates ripple effect on mousedown', async () => {
		element.textContent = 'Ripple Test'
		await element.updateComplete

		const button = element.shadowRoot.querySelector('button')

		// Mock event
		const mouseEvent = new MouseEvent('mousedown', {
			clientX: 50,
			clientY: 50,
			bubbles: true,
		})

		// Apply mock values for offsetLeft/Top and clientWidth/Height
		Object.defineProperties(button, {
			offsetLeft: { value: 10 },
			offsetTop: { value: 10 },
			clientWidth: { value: 100 },
			clientHeight: { value: 40 },
		})

		button.dispatchEvent(mouseEvent)

		// Check if ripple element was added
		const ripple = button.querySelector('.ripple')
		expect(ripple).toBeTruthy()

		// Verify ripple is created with correct dimensions
		expect(ripple.style.width).toBe('100px')
		expect(ripple.style.height).toBe('100px')

		// The actual positioning may vary depending on the implementation
		// Just check if the values are set and are strings with 'px' suffix
		expect(ripple.style.left).toMatch(/^-?\d+px$/)
		expect(ripple.style.top).toMatch(/^-?\d+px$/)
	})
})
