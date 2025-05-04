import { NotificationService, StorageService } from '@services'
import { Employee } from '@models'
import { EVENTS } from '@constants'
import { localize } from '@i18n'

/**
 * Service for managing employee data
 */
export class EmployeeService {
	/**
	 * Storage key for employees data
	 *
	 * @type {string}
	 * @static
	 * @private
	 */
	static STORAGE_KEY = 'employees'

	/**
	 * Creates an instance of EmployeeService
	 *
	 * @param {StorageService} storageService - The storage service instance to use
	 */
	constructor(storageService = new StorageService()) {
		this.storageService = storageService
		this.employees = this._loadFromStorage()
	}

	/**
	 * Gets all employees
	 *
	 * @returns {Employee[]} Array of employees
	 */
	getAll() {
		return [...this.employees]
	}

	/**
	 * Gets an employee by ID
	 *
	 * @param {string} id - Employee ID
	 * @returns {Employee|null} The employee or null if not found
	 */
	getById(id) {
		const employee = this.employees.find((employee) => employee.id === id)
		return employee ? new Employee(employee) : null
	}

	/**
	 * Creates a new employee
	 *
	 * @param {Employee|Object} employeeData - The employee data
	 * @returns {Employee|false} The created employee or false if creation failed
	 */
	create(employeeData) {
		try {
			if (!employeeData) {
				const errorMessage = localize('errors.validation.missingData')
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			// Ensure we have an Employee instance
			const employee = employeeData instanceof Employee ? employeeData : new Employee(employeeData)

			// Validate required fields
			const missingFields = []
			if (!employee.firstName) missingFields.push(localize('employee.fields.firstName'))
			if (!employee.lastName) missingFields.push(localize('employee.fields.lastName'))
			if (!employee.email) missingFields.push(localize('employee.fields.email'))
			if (!employee.phoneNumber) missingFields.push(localize('employee.fields.phoneNumber'))
			if (!employee.dateOfEmployment) missingFields.push(localize('employee.fields.dateOfEmployment'))
			if (!employee.dateOfBirth) missingFields.push(localize('employee.fields.dateOfBirth'))
			if (!employee.department) missingFields.push(localize('employee.fields.department'))
			if (!employee.position) missingFields.push(localize('employee.fields.position'))

			if (missingFields.length > 0) {
				const errorMessage = `${localize('errors.validation.missingFields')}: ${missingFields.join(', ')}`
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			// Check for duplicate email
			const emailExists = this.employees.some((emp) => emp.email === employee.email && emp.id !== employee.id)

			if (emailExists) {
				const errorMessage = localize('errors.data.emailInUse').replace('{email}', employee.email)
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			this.employees.push(employee)
			this._saveToStorage()

			// Dispatch event to notify of employee creation
			this._dispatchEvent(EVENTS.EMPLOYEE.CREATED, { employee })

			return employee
		} catch (error) {
			console.error('Error creating employee:', error)

			// Add more context to the error
			let userMessage
			if (error.message.includes('Invalid employee data')) {
				userMessage = localize('errors.userMessage.checkRequiredInfo')
			} else {
				userMessage = localize('errors.userMessage.createProblem')
			}

			NotificationService.error(userMessage)
			this._dispatchErrorEvent(userMessage)
			return false
		}
	}

	/**
	 * Updates an existing employee
	 *
	 * @param {string} id - Employee ID
	 * @param {Employee|Object} employeeData - Updated employee data
	 * @returns {Employee|false} The updated employee or false if update failed
	 */
	update(id, employeeData) {
		try {
			if (!id) {
				const errorMessage = localize('errors.validation.invalidId')
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			if (!employeeData) {
				const errorMessage = localize('errors.validation.missingData')
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			const index = this.employees.findIndex((employee) => employee.id === id)

			if (index === -1) {
				console.warn(`Employee with ID ${id} not found`)
				const errorMessage = localize('errors.data.notFound')
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			// Ensure we have an Employee instance with the correct ID
			const updatedEmployee = employeeData instanceof Employee ? employeeData : new Employee({ ...employeeData, id })

			// Validate required fields
			const missingFields = []
			if (!updatedEmployee.firstName) missingFields.push(localize('employee.fields.firstName'))
			if (!updatedEmployee.lastName) missingFields.push(localize('employee.fields.lastName'))
			if (!updatedEmployee.email) missingFields.push(localize('employee.fields.email'))
			if (!updatedEmployee.phoneNumber) missingFields.push(localize('employee.fields.phoneNumber'))
			if (!updatedEmployee.dateOfEmployment) missingFields.push(localize('employee.fields.dateOfEmployment'))
			if (!updatedEmployee.dateOfBirth) missingFields.push(localize('employee.fields.dateOfBirth'))
			if (!updatedEmployee.department) missingFields.push(localize('employee.fields.department'))
			if (!updatedEmployee.position) missingFields.push(localize('employee.fields.position'))

			if (missingFields.length > 0) {
				const errorMessage = `${localize('errors.validation.missingFields')}: ${missingFields.join(', ')}`
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			// Check for duplicate email (excluding this employee)
			const emailExists = this.employees.some((emp) => emp.email === updatedEmployee.email && emp.id !== id)

			if (emailExists) {
				const errorMessage = localize('errors.data.emailInUse').replace('{email}', updatedEmployee.email)
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			// Backup previous state in case storage fails
			const previousEmployee = this.employees[index]

			try {
				this.employees[index] = updatedEmployee
				this._saveToStorage()

				// Dispatch event to notify of employee update
				this._dispatchEvent(EVENTS.EMPLOYEE.UPDATED, { employee: updatedEmployee })

				return updatedEmployee
			} catch (storageError) {
				// Rollback changes if storage fails
				if (previousEmployee) {
					this.employees[index] = previousEmployee
				}
				const errorMessage = `${localize('errors.storage.failed')}: ${storageError.message}`
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}
		} catch (error) {
			console.error('Error updating employee:', error)

			// Add more context to the error
			let userMessage
			if (error.message.includes('Invalid employee ID')) {
				userMessage = localize('errors.userMessage.cannotIdentifyEmployee')
			} else if (error.message.includes('not found')) {
				userMessage = localize('errors.data.notFound')
			} else if (error.message.includes('Missing required fields')) {
				userMessage = localize('errors.validation.missingFields')
			} else if (error.message.includes('already in use')) {
				userMessage = localize('errors.userMessage.emailAlreadyRegistered')
			} else if (error.message.includes('Failed to save')) {
				userMessage = localize('errors.userMessage.savingProblem')
			} else {
				userMessage = localize('errors.userMessage.updateProblem')
			}

			NotificationService.error(userMessage)
			this._dispatchErrorEvent(userMessage)
			return false
		}
	}

	/**
	 * Deletes an employee
	 *
	 * @param {string} id - Employee ID
	 * @returns {boolean} True if deleted, false if failed
	 */
	delete(id) {
		try {
			if (!id) {
				const errorMessage = localize('errors.validation.invalidId')
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			const index = this.employees.findIndex((employee) => employee.id === id)

			if (index === -1) {
				console.warn(`Employee with ID ${id} not found for deletion`)
				const errorMessage = localize('errors.data.notFound')
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}

			const deletedEmployee = this.employees[index]
			this.employees.splice(index, 1)

			try {
				this._saveToStorage()

				// Dispatch event to notify of employee deletion
				this._dispatchEvent(EVENTS.EMPLOYEE.DELETED, {
					employee: deletedEmployee,
					timestamp: new Date().toISOString(),
				})

				return true
			} catch (storageError) {
				// If saving to storage fails, try to restore the deleted employee
				this.employees.splice(index, 0, deletedEmployee)
				const errorMessage = `${localize('errors.storage.failed')}: ${storageError.message}`
				NotificationService.error(errorMessage)
				this._dispatchErrorEvent(errorMessage)
				return false
			}
		} catch (error) {
			console.error('Error deleting employee:', error)

			// Add more context to the error
			let userMessage
			if (error.message.includes('Invalid employee ID')) {
				userMessage = localize('errors.userMessage.cannotIdentifyEmployee')
			} else if (error.message.includes('not found')) {
				userMessage = localize('errors.data.notFound')
			} else if (error.message.includes('Failed to save')) {
				userMessage = localize('errors.userMessage.savingProblem')
			} else {
				userMessage = localize('errors.userMessage.deleteProblem')
			}

			NotificationService.error(userMessage)
			this._dispatchErrorEvent(userMessage)
			return false
		}
	}

	/**
	 * Searches employees by term
	 *
	 * @param {string} term - Search term
	 * @returns {Employee[]} Matching employees
	 */
	search(term) {
		if (!term) {
			return this.getAll()
		}

		const searchTerm = term.toLowerCase()

		return this.employees.filter((employee) => {
			return (
				employee.firstName.toLowerCase().includes(searchTerm) ||
				employee.lastName.toLowerCase().includes(searchTerm) ||
				employee.email.toLowerCase().includes(searchTerm) ||
				employee.department.toLowerCase().includes(searchTerm) ||
				employee.position.toLowerCase().includes(searchTerm)
			)
		})
	}

	/**
	 * Loads employee data from storage
	 *
	 * @returns {Employee[]} Loaded employees
	 * @private
	 */
	_loadFromStorage() {
		const data = this.storageService.get(EmployeeService.STORAGE_KEY)
		return (data || []).map((employeeData) => new Employee(employeeData))
	}

	/**
	 * Saves employees to storage
	 *
	 * @private
	 */
	_saveToStorage() {
		this.storageService.set(EmployeeService.STORAGE_KEY, this.employees)
	}

	/**
	 * Dispatches a custom event
	 *
	 * @param {string} eventName - Name of the event
	 * @param {Object} detail - Event details
	 * @private
	 */
	_dispatchEvent(eventName, detail) {
		const event = new window.CustomEvent(eventName, {
			bubbles: true,
			composed: true,
			detail,
		})
		document.dispatchEvent(event)
	}

	/**
	 * Dispatches error event to notify components to reset their state
	 *
	 * @param {string} message - Error message
	 * @private
	 */
	_dispatchErrorEvent(message) {
		// Create a custom event for form errors
		const event = new window.CustomEvent('employee-service-error', {
			bubbles: true,
			composed: true,
			detail: { message },
		})
		document.dispatchEvent(event)
	}
}
