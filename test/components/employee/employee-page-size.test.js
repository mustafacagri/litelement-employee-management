import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/employee/employee-page-size.js'

describe('EmployeePageSize', () => {
	let element

	// Mock localStorage
	const localStorageMock = {
		getItem: vi.fn(),
		setItem: vi.fn(),
		clear: vi.fn(),
	}

	beforeEach(async () => {
		// Save original localStorage
		const originalLocalStorage = global.localStorage

		// Replace with mock
		Object.defineProperty(global, 'localStorage', {
			value: localStorageMock,
			writable: true,
		})

		// Reset localStorage mock calls
		localStorageMock.getItem.mockReset()
		localStorageMock.setItem.mockReset()

		// Mock the default behavior to return '25' for pageSize preference
		localStorageMock.getItem.mockImplementation((key) => {
			if (key === 'employee-page-size-preference') return '25'
			return null
		})

		// Create the component
		element = document.createElement('employee-page-size')
		document.body.appendChild(element)

		// Spy on dispatch method
		vi.spyOn(element, 'dispatch')

		await element.updateComplete

		// Restore localStorage
		Object.defineProperty(global, 'localStorage', {
			value: originalLocalStorage,
			writable: true,
		})
	})

	afterEach(() => {
		if (element && element.parentNode) {
			element.parentNode.removeChild(element)
		}
		vi.clearAllMocks()
	})

	it('initializes with correct default properties', async () => {
		// Check default properties
		expect(element.pageSize).toBe(25)
		expect(element.options).toEqual([5, 10, 25, 50])

		// Check rendering
		const label = element.shadowRoot.querySelector('label')
		expect(label).toBeTruthy()

		const select = element.shadowRoot.querySelector('select')
		expect(select).toBeTruthy()
		expect(select.value).toBe('25')

		// Check options are rendered
		const options = element.shadowRoot.querySelectorAll('option')
		expect(options.length).toBe(4)

		// 25 should be selected by default now
		expect(options[2].selected).toBe(true)
		expect(options[2].value).toBe('25')
	})

	it('loads preferences from localStorage when connected', async () => {
		// Mock localStorage to return a saved preference
		localStorageMock.getItem.mockReturnValue('25')

		// Create a new element to test localStorage loading
		const newElement = document.createElement('employee-page-size')

		// Mock connectedCallback to capture localStorage access
		const originalConnectedCallback = newElement.connectedCallback
		newElement.connectedCallback = vi.fn(() => {
			originalConnectedCallback.call(newElement)
		})

		document.body.appendChild(newElement)
		await newElement.updateComplete

		// Check that localStorage was accessed
		expect(localStorageMock.getItem).toHaveBeenCalledWith('employee-page-size-preference')

		// Check that the preference was applied
		expect(newElement.pageSize).toBe(25)

		// Clean up
		if (newElement.parentNode) {
			newElement.parentNode.removeChild(newElement)
		}
	})

	it('handles page size changes and dispatches events', async () => {
		// Get the select element
		const select = element.shadowRoot.querySelector('select')

		// Change the value
		select.value = '25'
		select.dispatchEvent(new Event('change'))
		await element.updateComplete

		// Check pageSize was updated
		expect(element.pageSize).toBe(25)

		// Check event was dispatched
		expect(element.dispatch).toHaveBeenCalledWith('page-size-change', {
			pageSize: 25,
		})

		// Check localStorage was updated
		expect(localStorageMock.setItem).toHaveBeenCalledWith('employee-page-size-preference', '25')

		// Should not dispatch during initialization
		element._initializing = true
		element.pageSize = 50
		await element.updateComplete

		// Dispatch should not be called again
		expect(element.dispatch).toHaveBeenCalledTimes(1)
	})
})
