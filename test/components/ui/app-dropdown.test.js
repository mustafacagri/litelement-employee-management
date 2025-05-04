import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/ui/app-dropdown.js'

describe('AppDropdown', () => {
	let element
	const mockOptions = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' },
	]

	beforeEach(async () => {
		// Spy on document methods before creating element
		vi.spyOn(document, 'addEventListener')
		vi.spyOn(document, 'removeEventListener')
		vi.spyOn(document, 'dispatchEvent')

		// Create the dropdown
		element = document.createElement('app-dropdown')
		element.options = mockOptions
		document.body.appendChild(element)
		await element.updateComplete

		// Spy on the dispatch method
		vi.spyOn(element, 'dispatch')
	})

	afterEach(() => {
		if (element.parentNode) {
			element.parentNode.removeChild(element)
		}
		vi.clearAllMocks()
	})

	it('initializes with correct properties and renders UI elements', async () => {
		// Check default properties
		expect(element.label).toBe('')
		expect(element.name).toBe('')
		expect(element.value).toBe('')
		expect(element.required).toBe(false)
		expect(element.errorMessage).toBe('')
		expect(element.disabled).toBe(false)
		expect(element._touched).toBe(false)
		expect(element._open).toBe(false)

		// Check that options are set
		expect(element.options).toEqual(mockOptions)

		// Verify DOM elements
		const container = element.shadowRoot.querySelector('.dropdown-container')
		expect(container).toBeTruthy()

		const selectedValue = element.shadowRoot.querySelector('.selected-value')
		expect(selectedValue).toBeTruthy()

		const placeholder = element.shadowRoot.querySelector('.placeholder')
		expect(placeholder).toBeTruthy()

		const options = element.shadowRoot.querySelector('.options')
		expect(options).toBeTruthy()
		expect(options.classList.contains('open')).toBe(false)

		const optionElements = element.shadowRoot.querySelectorAll('.option')
		expect(optionElements.length).toBe(3)

		// Set label and required, verify rendering
		element.label = 'Test Label'
		element.required = true
		await element.updateComplete

		const label = element.shadowRoot.querySelector('label')
		expect(label).toBeTruthy()
		expect(label.textContent.trim()).toContain('Test Label')

		const requiredMark = element.shadowRoot.querySelector('.required-mark')
		expect(requiredMark).toBeTruthy()

		// Verify event listeners
		expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
		expect(document.addEventListener).toHaveBeenCalledWith('ui-component-opened', expect.any(Function))
	})

	it('handles dropdown opening, selection and validation', async () => {
		// Toggle dropdown
		const selectedValue = element.shadowRoot.querySelector('.selected-value')
		selectedValue.click()
		await element.updateComplete

		// Check that dropdown is open
		expect(element._open).toBe(true)
		const options = element.shadowRoot.querySelector('.options')
		expect(options.classList.contains('open')).toBe(true)
		expect(document.dispatchEvent).toHaveBeenCalled()

		// Select an option
		const optionElements = element.shadowRoot.querySelectorAll('.option')
		optionElements[1].click() // Select "Option 2"
		await element.updateComplete

		// Check that value was updated and dropdown closed
		expect(element.value).toBe('option2')
		expect(element._open).toBe(false)
		expect(element._touched).toBe(true)
		expect(element.dispatch).toHaveBeenCalledWith('change', {
			name: element.name,
			value: 'option2',
		})

		// Get a fresh reference to the element after update
		const updatedSelectedValue = element.shadowRoot.querySelector('.selected-value')
		expect(updatedSelectedValue.textContent.trim()).not.toContain('Select an option')

		// Test validation but don't check error class display
		// This might be more of an integration test
		element.required = true
		element.value = ''
		element._touched = true
		await element.updateComplete

		const isValid = element.validate()
		expect(isValid).toBe(false)
		expect(element.errorMessage).not.toBe('')
		expect(element.dispatch).toHaveBeenCalledWith('validate', {
			name: element.name,
			value: '',
			isValid: false,
		})
	})

	it('handles keyboard navigation and outside clicks', async () => {
		// Open dropdown with Enter key
		const selectedValue = element.shadowRoot.querySelector('.selected-value')
		const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
		selectedValue.dispatchEvent(enterEvent)
		await element.updateComplete

		expect(element._open).toBe(true)

		// Navigate with arrow keys
		element.value = 'option2' // Start with option2 selected
		await element.updateComplete

		const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
		selectedValue.dispatchEvent(arrowUpEvent)
		await element.updateComplete

		// Should go to option1 (previous option)
		expect(element.value).toBe('option1')

		const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
		selectedValue.dispatchEvent(arrowDownEvent)
		await element.updateComplete

		// Close with Escape key
		const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
		selectedValue.dispatchEvent(escapeEvent)
		await element.updateComplete

		expect(element._open).toBe(false)

		// Test outside click
		element._open = true
		await element.updateComplete

		// Mock contains method for outside click
		const originalContains = element.contains
		element.contains = vi.fn().mockReturnValue(false)

		document.dispatchEvent(new Event('click'))
		expect(element._open).toBe(false)

		// Restore original method
		element.contains = originalContains

		// Test disconnectedCallback
		element.disconnectedCallback()
		expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
		expect(document.removeEventListener).toHaveBeenCalledWith('ui-component-opened', expect.any(Function))
	})
})
