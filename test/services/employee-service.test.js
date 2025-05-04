import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EmployeeService } from '@services/employee-service.js'
import { Employee } from '@models'
import { EVENTS } from '@constants'

describe('EmployeeService', () => {
	let employeeService
	let mockStorageService
	let mockEmployees
	let originalConsoleError

	beforeEach(() => {
		// Silence expected error messages in tests
		originalConsoleError = globalThis.console.error
		globalThis.console.error = vi.fn()

		// Mock storage service
		mockStorageService = {
			get: vi.fn(),
			set: vi.fn(),
		}

		// Create mock employees
		mockEmployees = [
			{
				id: '1',
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				phoneNumber: '555-1234',
				phoneCode: '+1',
				dateOfEmployment: '2022-01-01',
				dateOfBirth: '1980-01-01',
				department: 'engineering',
				position: 'developer',
			},
			{
				id: '2',
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'jane@example.com',
				phoneNumber: '555-5678',
				phoneCode: '+1',
				dateOfEmployment: '2022-02-01',
				dateOfBirth: '1985-02-02',
				department: 'marketing',
				position: 'manager',
			},
		]

		// Mock storage get to return our mock employees
		mockStorageService.get.mockReturnValue(mockEmployees)

		// Mock document.dispatchEvent
		vi.spyOn(globalThis.document, 'dispatchEvent')

		// Create employee service instance with mock storage
		employeeService = new EmployeeService(mockStorageService)
	})

	afterEach(() => {
		// Restore console.error
		globalThis.console.error = originalConsoleError
	})

	it('loads and retrieves employees properly', () => {
		// Test constructor loads from storage
		expect(mockStorageService.get).toHaveBeenCalledWith('employees')
		expect(employeeService.employees.length).toBe(2)

		// Test getAll returns a copy of employees
		const allEmployees = employeeService.getAll()
		expect(allEmployees).toEqual(employeeService.employees)
		expect(allEmployees).not.toBe(employeeService.employees) // Should be a different reference

		// Test getById returns the correct employee
		const employee = employeeService.getById('1')
		expect(employee).toBeInstanceOf(Employee)
		expect(employee.firstName).toBe('John')

		// Test getById returns null for non-existent ID
		const nonExistent = employeeService.getById('nonexistent')
		expect(nonExistent).toBeNull()

		// Test search functionality
		const searchResults = employeeService.search('jane')
		expect(searchResults.length).toBe(1)
		expect(searchResults[0].id).toBe('2')

		// Empty search term should return all employees
		expect(employeeService.search('').length).toBe(2)
	})

	it('properly creates, updates and deletes employees', () => {
		// Test creating a new employee
		const newEmployee = {
			firstName: 'New',
			lastName: 'Employee',
			email: 'new@example.com',
			phoneNumber: '555-9999',
			phoneCode: '+1',
			dateOfEmployment: '2023-01-01',
			dateOfBirth: '1990-01-01',
			department: 'hr',
			position: 'specialist',
		}

		const created = employeeService.create(newEmployee)
		expect(created).toBeInstanceOf(Employee)
		expect(created.firstName).toBe('New')
		expect(employeeService.employees.length).toBe(3)
		expect(mockStorageService.set).toHaveBeenCalled()
		expect(globalThis.document.dispatchEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				type: EVENTS.EMPLOYEE.CREATED,
			})
		)

		// Test updating an employee
		const updatedData = {
			...mockEmployees[0],
			firstName: 'Updated',
		}

		const updated = employeeService.update('1', updatedData)
		expect(updated.firstName).toBe('Updated')
		expect(employeeService.employees[0].firstName).toBe('Updated')
		expect(mockStorageService.set).toHaveBeenCalled()
		expect(globalThis.document.dispatchEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				type: EVENTS.EMPLOYEE.UPDATED,
			})
		)

		// Test deleting an employee
		const deleteResult = employeeService.delete('1')
		expect(deleteResult).toBe(true)
		expect(employeeService.employees.length).toBe(2)
		expect(mockStorageService.set).toHaveBeenCalled()
		expect(globalThis.document.dispatchEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				type: EVENTS.EMPLOYEE.DELETED,
			})
		)
	})
})
