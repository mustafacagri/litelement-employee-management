import { getCurrentLanguage } from '@i18n'
import { TEXT_FORMAT } from '@constants'

/**
 * Collection of formatting utilities
 */
export const formatters = {
	/**
	 * Formats a date to localized string
	 *
	 * @param {string|Date} date - Date to format
	 * @param {Object} options - Intl.DateTimeFormat options
	 * @returns {string} Formatted date
	 */
	date: (date, options = { year: 'numeric', month: '2-digit', day: '2-digit' }) => {
		if (!date) return ''

		try {
			const dateObj = date instanceof Date ? date : new Date(date)
			return new Intl.DateTimeFormat(getCurrentLanguage(), options).format(dateObj)
		} catch (error) {
			console.error('Error formatting date:', error)
			return String(date)
		}
	},

	/**
	 * Capitalizes the first letter of a string
	 *
	 * @param {string} text - Text to capitalize
	 * @returns {string} Capitalized text
	 */
	capitalize: (text) => {
		if (!text) return ''
		return text.charAt(0).toUpperCase() + text.slice(1)
	},

	/**
	 * Truncates text to a specified length
	 *
	 * @param {string} text - Text to truncate
	 * @param {number} length - Maximum length
	 * @param {string} suffix - Suffix to add when truncated
	 * @returns {string} Truncated text
	 */
	truncate: (text, length = TEXT_FORMAT.TRUNCATE.DEFAULT_LENGTH, suffix = TEXT_FORMAT.TRUNCATE.DEFAULT_SUFFIX) => {
		if (!text) return ''
		if (text.length <= length) return text
		return text.substring(0, length - suffix.length) + suffix
	},
}
