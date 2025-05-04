import { STORAGE_CONFIG } from '@constants'

/**
 * Service for handling localStorage operations with error handling and type safety
 */
export class StorageService {
	/**
	 * Creates a new StorageService instance
	 *
	 * @param {Storage} storage - Storage implementation (defaults to localStorage)
	 */
	constructor(storage = localStorage) {
		this.storage = storage
	}

	/**
	 * Gets a value from storage and parses it from JSON
	 *
	 * @param {string} key - The key to retrieve
	 * @returns {*} The parsed value or null if not found or on error
	 * @throws {Error} If the key is invalid or missing
	 */
	get(key) {
		try {
			if (!key) {
				throw new Error(STORAGE_CONFIG.ERROR.KEY_REQUIRED)
			}

			const value = this.storage.getItem(key)

			if (!value) {
				return null // Item not found, return null
			}

			try {
				return JSON.parse(value)
			} catch (parseError) {
				console.error(`Error parsing JSON from storage: ${parseError}`)
				throw new Error(`Invalid data format for key '${key}': ${parseError.message}`)
			}
		} catch (error) {
			console.error(`Error reading from storage: ${error}`)

			// We only return null for "not found" errors, but throw for other errors
			if (
				error.name === STORAGE_CONFIG.ERROR_TYPE.SECURITY_ERROR ||
				error.name === STORAGE_CONFIG.ERROR_TYPE.QUOTA_EXCEEDED_ERROR
			) {
				throw error // Re-throw serious storage errors
			}

			return null
		}
	}

	/**
	 * Sets a value in storage after converting it to JSON
	 *
	 * @param {string} key - The key to store
	 * @param {*} value - The value to store
	 * @returns {boolean} True if successful, false otherwise
	 * @throws {Error} If the key is invalid, missing, or storage fails
	 */
	set(key, value) {
		try {
			if (!key) {
				throw new Error(STORAGE_CONFIG.ERROR.KEY_REQUIRED)
			}

			// Handle undefined values by storing null
			const valueToStore = value === undefined ? null : value

			// Try to serialize to JSON
			let serialized
			try {
				serialized = JSON.stringify(valueToStore)
			} catch (serializeError) {
				throw new Error(`Failed to serialize value for key '${key}': ${serializeError.message}`)
			}

			// Check for quota issues before trying to store
			// This is a rough estimate and not a perfect solution
			if (serialized && serialized.length > STORAGE_CONFIG.LARGE_VALUE_THRESHOLD) {
				// 1MB safety threshold
				try {
					// Try to estimate if we have enough space
					const remaining = this._getEstimatedRemainingSpace()
					if (remaining !== null && serialized.length > remaining) {
						throw new Error(STORAGE_CONFIG.ERROR.INSUFFICIENT_SPACE)
					}
				} catch (storageError) {
					// Fail silently and try the storage operation anyway
					console.warn('Could not estimate remaining storage space:', storageError)
				}
			}

			// Try to store the value
			this.storage.setItem(key, serialized)
			return true
		} catch (error) {
			console.error(`Error writing to storage: ${error}`)

			if (error.name === STORAGE_CONFIG.ERROR_TYPE.QUOTA_EXCEEDED_ERROR) {
				throw new Error(STORAGE_CONFIG.ERROR.QUOTA_EXCEEDED)
			} else if (error.name === STORAGE_CONFIG.ERROR_TYPE.SECURITY_ERROR) {
				throw new Error(STORAGE_CONFIG.ERROR.SECURITY_ERROR)
			}

			throw error // Re-throw the error for the caller to handle
		}
	}

	/**
	 * Estimates remaining localStorage space
	 *
	 * @private
	 * @returns {number|null} Approximate bytes remaining or null if estimation fails
	 */
	_getEstimatedRemainingSpace() {
		try {
			// Try to create increasingly large data until we hit an error
			// This is not perfect but gives a rough estimate
			const testKey = STORAGE_CONFIG.TEST_KEY
			const maxSize = 5 * 1024 * 1024 // 5MB max for most browsers
			const step = 100 * 1024 // 100KB steps

			// Clean up any previous test
			this.storage.removeItem(testKey)

			// Try filling with increasingly large chunks
			const testData = '1'.repeat(step)
			let testSize = 0
			let continueTest = true

			while (continueTest && testSize + step <= maxSize) {
				try {
					this.storage.setItem(testKey, testData.repeat(testSize / step + 1))
					testSize += step
				} catch {
					continueTest = false
				}
			}

			// Clean up the test
			this.storage.removeItem(testKey)

			return testSize
		} catch (estimationError) {
			console.warn('Failed to estimate storage space:', estimationError)
			return null
		}
	}

	/**
	 * Removes a value from storage
	 *
	 * @param {string} key - The key to remove
	 * @returns {boolean} True if successful, false otherwise
	 * @throws {Error} If the operation fails for reasons other than the key not existing
	 */
	remove(key) {
		try {
			if (!key) {
				throw new Error(STORAGE_CONFIG.ERROR.KEY_REQUIRED_REMOVAL)
			}

			// Check if the key exists first
			if (this.storage.getItem(key) === null) {
				// Key doesn't exist, which is not an error
				return true
			}

			this.storage.removeItem(key)
			return true
		} catch (error) {
			console.error(`Error removing from storage: ${error}`)

			// Re-throw serious errors
			if (error.name === STORAGE_CONFIG.ERROR_TYPE.SECURITY_ERROR) {
				throw new Error(STORAGE_CONFIG.ERROR.SECURITY_ERROR)
			}

			return false
		}
	}

	/**
	 * Clears all values from storage
	 *
	 * @returns {boolean} True if successful, false otherwise
	 * @throws {Error} If the operation fails due to security or other serious issues
	 */
	clear() {
		try {
			this.storage.clear()
			return true
		} catch (error) {
			console.error(`Error clearing storage: ${error}`)

			// Re-throw serious errors
			if (error.name === STORAGE_CONFIG.ERROR_TYPE.SECURITY_ERROR) {
				throw new Error(STORAGE_CONFIG.ERROR.SECURITY_ERROR)
			}

			return false
		}
	}

	/**
	 * Checks if the storage is available and working
	 *
	 * @returns {boolean} True if storage is available, false otherwise
	 */
	isAvailable() {
		try {
			const testKey = STORAGE_CONFIG.TEST_KEY
			this.storage.setItem(testKey, 'test')
			const testResult = this.storage.getItem(testKey) === 'test'
			this.storage.removeItem(testKey)
			return testResult
		} catch {
			// Ignore error details and just return false for any storage error
			return false
		}
	}
}
