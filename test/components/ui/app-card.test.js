import { describe, it, expect, beforeEach, afterEach } from 'vitest'
// Direct imports to avoid circular dependencies
import '@components/common/base-component.js'
import '@components/ui/app-card.js'

/* global document */

describe('AppCard', () => {
	let element

	beforeEach(() => {
		element = document.createElement('app-card')
		document.body.appendChild(element)
	})

	afterEach(() => {
		element.remove()
	})

	it('renders with default properties', async () => {
		const content = 'Card Content'
		element.innerHTML = content
		await element.updateComplete

		expect(element.title).toBe('')
		expect(element.elevated).toBe(false)
		expect(element.noPadding).toBe(false)

		const card = element.shadowRoot.querySelector('.card')
		expect(card).toBeTruthy()

		const cardContent = element.shadowRoot.querySelector('.card-content')
		expect(cardContent).toBeTruthy()

		// Title should not be rendered
		const cardTitle = element.shadowRoot.querySelector('.card-title')
		expect(cardTitle).toBeFalsy()
	})

	it('renders with title when provided', async () => {
		const title = 'Card Title'
		element.title = title
		await element.updateComplete

		const cardTitle = element.shadowRoot.querySelector('.card-title')
		expect(cardTitle).toBeTruthy()
		expect(cardTitle.textContent.trim()).toBe(title)

		// Card should have has-title class
		const card = element.shadowRoot.querySelector('.card')
		expect(card.classList.contains('has-title')).toBe(true)
	})

	it('applies elevated class when elevated property is true', async () => {
		element.elevated = true
		await element.updateComplete

		const card = element.shadowRoot.querySelector('.card')
		expect(card.classList.contains('elevated')).toBe(true)
	})

	it('applies no-padding class when noPadding property is true', async () => {
		element.noPadding = true
		await element.updateComplete

		const cardContent = element.shadowRoot.querySelector('.card-content')
		expect(cardContent.classList.contains('no-padding')).toBe(true)
	})

	it('trims empty title and does not render title element', async () => {
		element.title = '   '
		await element.updateComplete

		const cardTitle = element.shadowRoot.querySelector('.card-title')
		expect(cardTitle).toBeFalsy()

		const card = element.shadowRoot.querySelector('.card')
		expect(card.classList.contains('has-title')).toBe(false)
	})

	it('renders slotted content correctly', async () => {
		const slottedContent = '<p>Paragraph inside card</p><button>Action Button</button>'
		element.innerHTML = slottedContent
		await element.updateComplete

		const slot = element.shadowRoot.querySelector('slot')
		expect(slot).toBeTruthy()
	})
})
