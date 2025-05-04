/**
 * Input mask utility for standardizing inputs like phone numbers, credit cards, etc.
 * Uses IMask library for professional input masking
 * @module utils/input-mask
 */

import IMask from 'imask'
import { MASK_FORMAT } from '@constants'

/**
 * Apply a mask to an input element
 *
 * @param {HTMLInputElement} inputElement - Input element to mask
 * @param {string} maskPattern - Mask pattern (e.g. "000 000 00 00")
 * @param {Object} options - Additional options
 * @param {Function} options.onChange - Called when mask value changes
 * @returns {Function} Cleanup function
 */
export const applyMask = (inputElement, maskPattern, options = {}) => {
	if (!inputElement || !maskPattern) return () => {}

	// Create mask configuration
	const maskConfig = {
		mask: maskPattern,
		lazy: false,
		placeholderChar: ' ',
		definitions: {
			D: /[0-9]/,
			X: /[0-9a-zA-Z]/,
		},
	}

	// Create the mask instance
	const maskInstance = IMask(inputElement, maskConfig)

	// Set initial value if it exists
	if (inputElement.value) {
		maskInstance.value = inputElement.value
	}

	// Handle change events
	if (options.onChange) {
		maskInstance.on('input', () => {
			options.onChange(maskInstance.value)
		})

		maskInstance.on('complete', () => {
			// When mask is complete, call onChange to update validation state
			options.onChange(maskInstance.value)
		})
	}

	// Return cleanup function
	return () => {
		maskInstance.destroy()
	}
}

/**
 * Create a phone mask with format XXX XXX XX XX
 *
 * @param {HTMLInputElement} inputElement - Input element to mask
 * @param {Object} options - Additional options
 * @returns {Function} Cleanup function
 */
export const applyPhoneMask = (inputElement, options = {}) => {
	return applyMask(inputElement, MASK_FORMAT.PHONE, options)
}

/**
 * Apply a credit card mask
 *
 * @param {HTMLInputElement} inputElement - Input element to mask
 * @param {Object} options - Additional options
 * @returns {Function} Cleanup function
 */
export const applyCreditCardMask = (inputElement, options = {}) => {
	return applyMask(inputElement, MASK_FORMAT.CREDIT_CARD, options)
}

/**
 * Apply a date mask (DD/MM/YYYY)
 *
 * @param {HTMLInputElement} inputElement - Input element to mask
 * @param {Object} options - Additional options
 * @returns {Function} Cleanup function
 */
export const applyDateMask = (inputElement, options = {}) => {
	return applyMask(inputElement, MASK_FORMAT.DATE, options)
}
