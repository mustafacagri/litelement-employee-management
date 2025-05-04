import { localize } from '@i18n/i18n.js'
import { REGEX } from '@constants'

/**
 * Collection of form field validators
 */
export const validators = {
	/**
	 * Validates that a field is not empty
	 *
	 * @param {string} value - Field value
	 * @returns {boolean|string} True if valid, error message if invalid
	 */
	required: (value) => {
		return value !== null && value !== undefined && value.toString().trim() !== ''
			? true
			: localize('employee.validation.required')
	},

	/**
	 * Validates an email address
	 *
	 * @param {string} value - Email address
	 * @returns {boolean|string} True if valid, error message if invalid
	 */
	email: (value) => {
		if (!value) return true // Optional unless combined with required

		return REGEX.EMAIL.test(value) ? true : localize('employee.validation.email')
	},

	/**
	 * Validates a phone number
	 *
	 * @param {string} value - Phone number
	 * @returns {boolean|string} True if valid, error message if invalid
	 */
	phone: (value) => {
		if (!value) return true // Optional unless combined with required

		// Allows formats like: +90 532 123 45 67, (555) 123-4567, 555-123-4567, etc.
		return REGEX.PHONE.test(value) ? true : localize('employee.validation.phone')
	},

	/**
	 * Validates a date string
	 *
	 * @param {string} value - Date string
	 * @returns {boolean|string} True if valid, error message if invalid
	 */
	date: (value) => {
		if (!value) return true // Optional unless combined with required

		const date = new Date(value)
		return !isNaN(date.getTime()) ? true : localize('employee.validation.date')
	},

	/**
	 * Combines multiple validators
	 *
	 * @param {...Function} validators - Validator functions to combine
	 * @returns {Function} Combined validator function
	 */
	compose: (...validators) => {
		return (value) => {
			for (const validator of validators) {
				const result = validator(value)
				if (result !== true) {
					return result
				}
			}
			return true
		}
	},
}

/**
 * Validates a form data object using the provided validation schema
 *
 * @param {Object} formData - The form data to validate
 * @param {Object} validationSchema - Validation schema with field names as keys and validator functions as values
 * @returns {Object} Validation result with isValid flag and errors object
 */
export function validateForm(formData, validationSchema) {
	const errors = {}
	let isValid = true

	for (const [field, validator] of Object.entries(validationSchema)) {
		const value = formData[field]
		const result = validator(value)

		if (result !== true) {
			errors[field] = result
			isValid = false
		}
	}

	return { isValid, errors }
}
