/**
 * Validation regular expressions
 */

export const REGEX = {
	EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	PHONE: /^(\+\d{1,3}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}$/,
	DIGITS_ONLY: /[^0-9]/g,
}
