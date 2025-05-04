/**
 * Error message keys for validation and services
 * Organized by domain and error type for more granular error handling
 */

export const ERROR_KEYS = {
	// Validation errors
	VALIDATION: {
		MISSING_DATA: 'errors.validation.missingData',
		MISSING_FIELDS: 'errors.validation.missingFields',
		REQUIRED_FIELD: 'errors.validation.requiredField',
		INVALID_FORMAT: 'errors.validation.invalidFormat',
		INVALID_ID: 'errors.validation.invalidId',
	},

	// Data errors
	DATA: {
		NOT_FOUND: 'errors.data.notFound',
		ALREADY_EXISTS: 'errors.data.alreadyExists',
		EMAIL_IN_USE: 'errors.data.emailInUse',
	},

	// Storage errors
	STORAGE: {
		FAILED: 'errors.storage.failed',
		READ_ERROR: 'errors.storage.readError',
		WRITE_ERROR: 'errors.storage.writeError',
	},

	// User messages (more specific error messages for UI)
	USER_MESSAGE: {
		CHECK_REQUIRED_INFO: 'errors.userMessage.checkRequiredInfo',
		EMAIL_ALREADY_REGISTERED: 'errors.userMessage.emailAlreadyRegistered',
		CANNOT_IDENTIFY_EMPLOYEE: 'errors.userMessage.cannotIdentifyEmployee',
		SAVING_PROBLEM: 'errors.userMessage.savingProblem',
		CREATE_PROBLEM: 'errors.userMessage.createProblem',
		UPDATE_PROBLEM: 'errors.userMessage.updateProblem',
		DELETE_PROBLEM: 'errors.userMessage.deleteProblem',
	},
}
