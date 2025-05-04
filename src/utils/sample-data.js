import { EmployeeService, StorageService } from '@services'
import { DEPARTMENTS, POSITIONS, PHONE } from '@constants'

// --- Helper Data and Functions ---

const firstNames = [
	'James',
	'Mary',
	'John',
	'Patricia',
	'Robert',
	'Jennifer',
	'Michael',
	'Linda',
	'William',
	'Elizabeth',
	'David',
	'Barbara',
	'Richard',
	'Susan',
	'Joseph',
	'Jessica',
	'Thomas',
	'Sarah',
	'Charles',
	'Karen',
	'Christopher',
	'Nancy',
	'Daniel',
	'Lisa',
	'Matthew',
	'Betty',
	'Anthony',
	'Margaret',
	'Mark',
	'Sandra',
	'Donald',
	'Ashley',
	'Steven',
	'Kimberly',
	'Paul',
	'Emily',
	'Andrew',
	'Donna',
	'Joshua',
	'Michelle',
]

const lastNames = [
	'Smith',
	'Johnson',
	'Williams',
	'Brown',
	'Jones',
	'Garcia',
	'Miller',
	'Davis',
	'Rodriguez',
	'Martinez',
	'Hernandez',
	'Lopez',
	'Gonzalez',
	'Wilson',
	'Anderson',
	'Thomas',
	'Taylor',
	'Moore',
	'Jackson',
	'Martin',
	'Lee',
	'Perez',
	'Thompson',
	'White',
	'Harris',
	'Sanchez',
	'Clark',
	'Ramirez',
	'Lewis',
	'Robinson',
	'Walker',
	'Young',
	'Allen',
	'King',
	'Wright',
	'Scott',
	'Torres',
	'Nguyen',
	'Hill',
	'Flores',
]

const domains = [
	'example.com',
	'mail.com',
	'company.org',
	'test.dev',
	'demo.net',
	'devmail.io',
	'fakemail.xyz',
	'gmail.com',
	'yahoo.com',
	'outlook.com',
]

// Utility: Pick a random element from an array
function getRandomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)]
}

// Generate a random date between two years
function getRandomDate(startYear, endYear) {
	const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear
	const month = Math.floor(Math.random() * 12) + 1
	const day = Math.floor(Math.random() * 28) + 1
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Generate a random ISO date between two dates
function getRandomDateBetween(startDate, endDate) {
	const start = startDate.getTime()
	const end = endDate.getTime()
	const randomTime = start + Math.random() * (end - start)
	const date = new Date(randomTime)
	return date.toISOString().split('T')[0] // Format: YYYY-MM-DD
}

// Generate a Turkish mobile phone number (XXX XXX XX XX)
function getRandomPhoneNumber() {
	let number = '5'
	for (let i = 0; i < 9; i++) {
		number += Math.floor(Math.random() * 10)
	}

	return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 8)} ${number.substring(8, 10)}`
}

// Generate a unique ID (same format as Employee model)
function generateUniqueId() {
	return window?.crypto?.randomUUID() || Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// --- Main Logic ---

/**
 * Adds sample employee data to the storage for development or testing purposes.
 * Only populates if no existing employee data is found.
 *
 * @returns {number} Number of sample employees added
 */
export function addSampleEmployees() {
	const storageService = new StorageService()
	const employeeService = new EmployeeService(storageService)

	if (employeeService.getAll().length === 0) {
		const sampleEmployees = []
		const today = new Date()
		const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())

		const maxBirthYear = today.getFullYear() - 18
		const minBirthYear = today.getFullYear() - 60

		const numberOfEmployees = 55

		for (let i = 0; i < numberOfEmployees; i++) {
			const firstName = getRandomElement(firstNames)
			const lastName = getRandomElement(lastNames)
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${getRandomElement(domains)}`

			const employee = {
				id: generateUniqueId(),
				firstName,
				lastName,
				email,
				phoneCode: PHONE.DEFAULT_COUNTRY_CODE,
				phoneNumber: getRandomPhoneNumber(),
				dateOfEmployment: getRandomDateBetween(twoYearsAgo, today),
				dateOfBirth: getRandomDate(minBirthYear, maxBirthYear),
				department: getRandomElement(Object.values(DEPARTMENTS)),
				position: getRandomElement(Object.values(POSITIONS)),
			}

			sampleEmployees.push(employee)
		}

		// Batch create employees for better performance
		let successCount = 0
		sampleEmployees.forEach((emp) => {
			try {
				employeeService.create(emp)
				successCount++
			} catch (error) {
				console.error(`Error adding employee (ID: ${emp.id}):`, error)
			}
		})

		return successCount
	} else {
		return 0
	}
}

/**
 * Checks whether any sample employee data already exists in the system.
 *
 * @returns {boolean} True if data exists, otherwise false.
 */
export function hasSampleData() {
	const storageService = new StorageService()
	const employeeService = new EmployeeService(storageService)
	return employeeService.getAll().length > 0
}
