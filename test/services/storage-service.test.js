import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StorageService } from '@services'
import { STORAGE_CONFIG } from '@constants'

describe('StorageService', () => {
	let service
	let mockStorage

	beforeEach(() => {
		// Create a mock storage object
		mockStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		}

		// Create a new service instance with the mock storage
		service = new StorageService(mockStorage)

		// Spy on console methods
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('constructor', () => {
		it('uses the provided storage', () => {
			expect(service.storage).toBe(mockStorage)
		})

		it('uses localStorage by default if no storage provided', () => {
			// Create global mock for localStorage if needed
			const originalLocalStorage = global.localStorage

			// Mock localStorage
			global.localStorage = { test: 'value' }

			const defaultService = new StorageService()
			expect(defaultService.storage).toBe(global.localStorage)

			// Restore original
			global.localStorage = originalLocalStorage
		})
	})

	describe('get method', () => {
		it('handles undefined keys', () => {
			const result = service.get(undefined)
			expect(result).toBeNull()
			expect(console.error).toHaveBeenCalled()
		})

		it('returns null if item not found', () => {
			mockStorage.getItem.mockReturnValue(null)

			const result = service.get('nonexistent')

			expect(mockStorage.getItem).toHaveBeenCalledWith('nonexistent')
			expect(result).toBeNull()
		})

		it('parses and returns JSON data', () => {
			const testData = { name: 'Test', value: 42 }
			mockStorage.getItem.mockReturnValue(JSON.stringify(testData))

			const result = service.get('test-key')

			expect(mockStorage.getItem).toHaveBeenCalledWith('test-key')
			expect(result).toEqual(testData)
		})

		it('handles JSON parsing errors', () => {
			// Reset mock behavior from previous tests
			mockStorage.getItem.mockReset()

			// Return invalid JSON that will trigger parse error
			mockStorage.getItem.mockReturnValue('invalid json')

			// Should not throw but log error and return null
			const result = service.get('test-key')
			expect(result).toBeNull()
			expect(console.error).toHaveBeenCalled()
		})

		it('re-throws serious storage errors', () => {
			const securityError = new Error('Security violation')
			securityError.name = STORAGE_CONFIG.ERROR_TYPE.SECURITY_ERROR

			mockStorage.getItem.mockImplementation(() => {
				throw securityError
			})

			expect(() => service.get('test-key')).toThrow(securityError)
			expect(console.error).toHaveBeenCalled()
		})
	})

	describe('set method', () => {
		it('throws an error if key is not provided', () => {
			expect(() => service.set()).toThrow(STORAGE_CONFIG.ERROR.KEY_REQUIRED)
		})

		it('stores value as JSON', () => {
			const testData = { name: 'Test', value: 42 }

			service.set('test-key', testData)

			expect(mockStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData))
		})

		it('handles undefined values by storing null', () => {
			service.set('test-key', undefined)

			expect(mockStorage.setItem).toHaveBeenCalledWith('test-key', 'null')
		})

		it('throws an error if serialization fails', () => {
			// Create circular reference to cause JSON stringify to fail
			const circular = {}
			circular.self = circular

			expect(() => service.set('test-key', circular)).toThrow(/Failed to serialize/)
			expect(console.error).toHaveBeenCalled()
		})

		it('throws a quota error when storage is full', () => {
			const quotaError = new Error('Quota exceeded')
			quotaError.name = STORAGE_CONFIG.ERROR_TYPE.QUOTA_EXCEEDED_ERROR

			mockStorage.setItem.mockImplementation(() => {
				throw quotaError
			})

			expect(() => service.set('test-key', 'large-value')).toThrow(STORAGE_CONFIG.ERROR.QUOTA_EXCEEDED)
			expect(console.error).toHaveBeenCalled()
		})

		it('checks space for large values', () => {
			// Reset previous mocks
			mockStorage.setItem.mockReset()

			// Create a custom implementation for setItem that throws an error when comparing space
			mockStorage.setItem.mockImplementation(() => {
				// Success, doesn't throw
			})

			// Mock _getEstimatedRemainingSpace to always return a small value
			service._getEstimatedRemainingSpace = vi.fn().mockReturnValue(1000) // Only 1KB remaining

			// Large value should check space but still attempt to store
			const largeValue = 'x'.repeat(STORAGE_CONFIG.LARGE_VALUE_THRESHOLD + 500)
			service.set('test-key', largeValue)

			// Verify the space estimation was performed
			expect(service._getEstimatedRemainingSpace).toHaveBeenCalled()
			expect(console.warn).toHaveBeenCalled() // Should warn about space
		})
	})

	describe('remove method', () => {
		it('handles missing key', () => {
			// In our implementation, trying to remove with falsy key returns false
			const result = service.remove()
			expect(result).toBe(false)
			expect(console.error).toHaveBeenCalled()
		})

		it('removes item from storage', () => {
			service.remove('test-key')

			expect(mockStorage.removeItem).toHaveBeenCalledWith('test-key')
		})

		it('succeeds if item does not exist', () => {
			mockStorage.getItem.mockReturnValue(null)

			const result = service.remove('nonexistent')

			expect(result).toBe(true)
			expect(mockStorage.removeItem).not.toHaveBeenCalled()
		})

		it('handles security errors', () => {
			const securityError = new Error('Security violation')
			securityError.name = STORAGE_CONFIG.ERROR_TYPE.SECURITY_ERROR

			mockStorage.removeItem.mockImplementation(() => {
				throw securityError
			})

			expect(() => service.remove('test-key')).toThrow(STORAGE_CONFIG.ERROR.SECURITY_ERROR)
		})
	})

	describe('clear method', () => {
		it('clears all items from storage', () => {
			service.clear()

			expect(mockStorage.clear).toHaveBeenCalled()
		})

		it('handles security errors', () => {
			const securityError = new Error('Security violation')
			securityError.name = STORAGE_CONFIG.ERROR_TYPE.SECURITY_ERROR

			mockStorage.clear.mockImplementation(() => {
				throw securityError
			})

			expect(() => service.clear()).toThrow(STORAGE_CONFIG.ERROR.SECURITY_ERROR)
		})
	})

	describe('isAvailable method', () => {
		it('returns true if storage is available', () => {
			mockStorage.setItem.mockImplementation(() => {})
			mockStorage.getItem.mockReturnValue('test')
			mockStorage.removeItem.mockImplementation(() => {})

			const result = service.isAvailable()

			expect(result).toBe(true)
			expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_CONFIG.TEST_KEY, 'test')
			expect(mockStorage.getItem).toHaveBeenCalledWith(STORAGE_CONFIG.TEST_KEY)
			expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_CONFIG.TEST_KEY)
		})

		it('returns false if storage throws errors', () => {
			mockStorage.setItem.mockImplementation(() => {
				throw new Error('Storage unavailable')
			})

			const result = service.isAvailable()

			expect(result).toBe(false)
		})
	})

	describe('_getEstimatedRemainingSpace', () => {
		it('estimates available space correctly', () => {
			// Mock storage functions for the test
			mockStorage.key = vi.fn().mockImplementation((index) => `key${index}`)
			mockStorage.getItem = vi.fn().mockImplementation((key) => 'value')
			mockStorage.length = 2

			// Let setItem succeed a few times then fail with quota error
			let callCount = 0
			mockStorage.setItem = vi.fn().mockImplementation((key, value) => {
				callCount++
				if (callCount > 3) {
					const err = new Error('Quota exceeded')
					err.name = STORAGE_CONFIG.ERROR_TYPE.QUOTA_EXCEEDED_ERROR
					throw err
				}
			})

			const result = service._getEstimatedRemainingSpace()

			// Should be a multiple of STEP_SIZE
			expect(result % (100 * 1024)).toBe(0)
			expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_CONFIG.TEST_KEY)
		})

		it('handles estimation failures', () => {
			// Reset mocks from previous tests
			mockStorage.key.mockReset()
			mockStorage.setItem.mockReset()
			mockStorage.removeItem.mockReset()

			// Force an error during the estimation loop
			mockStorage.setItem.mockImplementation(() => {
				throw new Error('Storage error')
			})

			// Run the function - it should complete without errors, returning whatever
			// size it calculated before the error
			const result = service._getEstimatedRemainingSpace()

			// We're mainly checking that the function handles errors gracefully
			expect(mockStorage.setItem).toHaveBeenCalled()
			expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_CONFIG.TEST_KEY) // Should clean up
		})
	})
})
