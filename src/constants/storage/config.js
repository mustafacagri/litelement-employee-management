/**
 * Storage service configuration constants
 */

export const STORAGE_CONFIG = {
	TEST_KEY: '__storage_test__',
	ERROR: {
		KEY_REQUIRED: 'Storage key is required',
		KEY_REQUIRED_REMOVAL: 'Storage key is required for removal',
		QUOTA_EXCEEDED: 'Storage quota exceeded. Cannot save additional data.',
		SECURITY_ERROR: 'Storage access denied due to security restrictions',
		INSUFFICIENT_SPACE: 'Insufficient storage space',
	},
	ERROR_TYPE: {
		SECURITY_ERROR: 'SecurityError',
		QUOTA_EXCEEDED_ERROR: 'QuotaExceededError',
	},
	LARGE_VALUE_THRESHOLD: 1000000, // 1MB safety threshold
}
