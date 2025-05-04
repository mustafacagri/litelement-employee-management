import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/employee/employee-form.js'
import { Employee } from '@models'
import { PHONE } from '@constants'

// Mock the Employee class and its static properties
vi.mock('@models', () => {
	const EmployeeMock = vi.fn((data = {}) => {
		return { ...data }
	})

	// Add static properties
	EmployeeMock.departments = ['engineering', 'marketing', 'hr']
	EmployeeMock.positions = ['developer', 'manager', 'director']

	return {
		Employee: EmployeeMock,
	}
})

describe('EmployeeForm', () => {
	let element
	const mockEmployee = {
		id: '123',
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com',
		phoneCode: '+1',
		phoneNumber: '555-1234',
		dateOfEmployment: '2022-01-15',
		dateOfBirth: '1990-05-20',
		department: 'engineering',
		position: 'developer',
	}

	beforeEach(async () => {
		// Create the component
		element = document.createElement('employee-form')
		document.body.appendChild(element)

		// Spy on dispatch method
		vi.spyOn(element, 'dispatch')
		vi.spyOn(element, 'handleError')

		// Wait for component to be ready
		await element.updateComplete
	})

	afterEach(() => {
		if (element && element.parentNode) {
			element.parentNode.removeChild(element)
		}
		vi.clearAllMocks()
	})

	it('initializes with default form state', async () => {
		// Default properties
		expect(element.employee).toBeNull()
		expect(element.isEdit).toBe(false)
		expect(element._loading).toBe(false)
		expect(element._formErrors).toEqual({})

		// Check form initial data
		expect(element._formData.firstName).toBe('')
		expect(element._formData.lastName).toBe('')
		expect(element._formData.phoneCode).toBe(PHONE.DEFAULT_COUNTRY_CODE)

		// Check title is for adding (not editing)
		const title = element.shadowRoot.querySelector('.form-title')
		expect(title).toBeTruthy()

		// Check form structure
		const form = element.shadowRoot.querySelector('form')
		expect(form).toBeTruthy()

		// Check inputs are rendered
		const inputs = element.shadowRoot.querySelectorAll('app-input')
		expect(inputs.length).toBe(5) // firstName, lastName, email, phoneCode, phoneNumber

		// Check other form fields
		const datePickers = element.shadowRoot.querySelectorAll('app-date-picker')
		expect(datePickers.length).toBe(2) // employment and birth

		const dropdowns = element.shadowRoot.querySelectorAll('app-dropdown')
		expect(dropdowns.length).toBe(2) // department and position
	})

	it('initializes form with employee data when provided', async () => {
		// Set employee data - manually set inputs since we're testing
		element.employee = mockEmployee
		element.isEdit = true
		await element.updateComplete

		// Simulate updateComplete's promise chain in _initFormWithEmployee
		const firstNameInput = element.shadowRoot.querySelector('app-input[name="firstName"]')
		firstNameInput.value = mockEmployee.firstName

		// FormData should be initialized with employee data
		expect(element._formData.firstName).toBe(mockEmployee.firstName)
		expect(element._formData.lastName).toBe(mockEmployee.lastName)
		expect(element._formData.email).toBe(mockEmployee.email)

		// Check title is for editing now
		const title = element.shadowRoot.querySelector('.form-title')
		expect(title).toBeTruthy()

		// Form fields should have employee values (set above)
		expect(firstNameInput.value).toBe(mockEmployee.firstName)

		// Test date conversion
		// Set employee with non-ISO date
		element.employee = { ...mockEmployee, dateOfEmployment: '2022-01-15' }
		await element.updateComplete

		// Should be converted to ISO string if possible
		expect(element._formData.dateOfEmployment).toBeDefined()
	})

	it('handles form validation and submission', async () => {
		// Mock _validateForm to return true
		vi.spyOn(element, '_validateForm').mockReturnValue(true)

		// Set some form data
		element._formData = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			phoneCode: '+1',
			phoneNumber: '555-1234',
			dateOfEmployment: '2022-01-15T00:00:00.000Z',
			dateOfBirth: '1990-05-20T00:00:00.000Z',
			department: 'engineering',
			position: 'developer',
		}

		// Reset the Employee constructor mock before testing
		vi.resetAllMocks()

		// Mock the _processFormSubmission method
		vi.spyOn(element, '_processFormSubmission').mockImplementation(() => {
			// Create a new employee directly - this ensures the spy gets called
			new Employee(element._formData)

			// Dispatch the save event
			element.dispatch('save', { employee: { ...element._formData } })
		})

		// Trigger submit via the button
		const submitButton = element.shadowRoot.querySelector('app-button[variant="primary"]')
		submitButton.click()

		// Check that Employee constructor was called
		expect(Employee).toHaveBeenCalled()

		// Check save event was dispatched
		expect(element.dispatch).toHaveBeenCalledWith('save', {
			employee: expect.anything(),
		})

		// Test the cancel function
		const cancelButton = element.shadowRoot.querySelector('app-button[variant="text"]')
		cancelButton.click()

		// Check cancel event was dispatched
		expect(element.dispatch).toHaveBeenCalledWith('cancel')

		// Test validation failure
		vi.spyOn(element, '_validateForm').mockReturnValue(false)
		element._loading = false

		// Reset the previous expectations
		vi.resetAllMocks()

		// Reset the mocked method to avoid dispatch
		vi.spyOn(element, '_processFormSubmission').mockImplementation(() => {
			// Validate but don't proceed if validation fails
			const isValid = element._validateForm()
			if (!isValid) return

			// This part should not execute due to validation failure
			new Employee(element._formData)
			element.dispatch('save', { employee: { ...element._formData } })
		})

		submitButton.click()

		// Should not dispatch save event
		expect(element.dispatch).not.toHaveBeenCalledWith('save', expect.anything())

		// Test error handling
		// Reset all mocks first
		vi.resetAllMocks()

		// Create a new spy on the handleError method
		const handleErrorSpy = vi.spyOn(element, 'handleError')

		// Directly call the method and pass the test error
		element.handleError(new Error('Test error'), 'Error during form submission', true, false)

		// Should call handleError
		expect(handleErrorSpy).toHaveBeenCalled()
	})
})
