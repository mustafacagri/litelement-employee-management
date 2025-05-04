import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NotificationService } from '@services'
import { NOTIFICATION } from '@constants'

describe('NotificationService', () => {
	let originalDocument
	let originalTimeout

	beforeEach(() => {
		// Save original methods
		originalDocument = { ...document }
		originalTimeout = global.setTimeout

		// Mock DOM methods
		document.createElement = vi.fn().mockImplementation((tagName) => {
			if (tagName === 'div') {
				return {
					id: '',
					className: '',
					textContent: '',
					style: {},
					addEventListener: vi.fn(),
					appendChild: vi.fn(),
					parentNode: {
						removeChild: vi.fn(),
					},
				}
			}
			if (tagName === 'style') {
				return {
					textContent: '',
				}
			}
			return {}
		})

		document.getElementById = vi.fn().mockReturnValue(null)

		// Mock document.body.appendChild instead of trying to replace document.body
		document.body.appendChild = vi.fn()

		// Mock document.head.appendChild instead of trying to replace document.head
		document.head.appendChild = vi.fn()

		// Mock setTimeout
		global.setTimeout = vi.fn().mockImplementation((callback, duration) => {
			return 123 // mock timer id
		})
	})

	afterEach(() => {
		// Restore original methods
		document.createElement = originalDocument.createElement
		document.getElementById = originalDocument.getElementById

		// Only restore if they exist in the original document
		if (originalDocument.body && originalDocument.body.appendChild) {
			document.body.appendChild = originalDocument.body.appendChild
		}

		if (originalDocument.head && originalDocument.head.appendChild) {
			document.head.appendChild = originalDocument.head.appendChild
		}
		global.setTimeout = originalTimeout

		// Clear mocks
		vi.clearAllMocks()
	})

	describe('show method', () => {
		it('creates a container if one does not exist', () => {
			NotificationService.show({ message: 'Test message' })

			expect(document.createElement).toHaveBeenCalledWith('div')
			expect(document.getElementById).toHaveBeenCalledWith(NOTIFICATION.CONTAINER_ID)
			expect(document.body.appendChild).toHaveBeenCalled()
		})

		it('reuses existing container if one exists', () => {
			const container = {
				appendChild: vi.fn(),
			}
			document.getElementById = vi.fn().mockReturnValue(container)

			NotificationService.show({ message: 'Test message' })

			expect(document.createElement).toHaveBeenCalledTimes(1) // Only for the notification, not the container
			expect(document.body.appendChild).not.toHaveBeenCalled()
			expect(container.appendChild).toHaveBeenCalled()
		})

		it('creates notification with the provided message', () => {
			const message = 'Test notification message'
			NotificationService.show({ message })

			const mockDivCall = document.createElement.mock.calls.find((call) => call[0] === 'div' && call.length === 1)
			expect(mockDivCall).toBeTruthy()

			// Second call is the notification div (first is container)
			const notificationDiv = document.createElement.mock.results[1].value
			expect(notificationDiv.textContent).toBe(message)
		})

		it('uses the provided type for notification class', () => {
			NotificationService.show({
				message: 'Warning message',
				type: NOTIFICATION.TYPE.WARNING,
			})

			const notificationDiv = document.createElement.mock.results[1].value
			expect(notificationDiv.className).toBe(`notification notification-${NOTIFICATION.TYPE.WARNING}`)
		})

		it('sets a timeout to auto-dismiss notification', () => {
			const customDuration = 5000
			NotificationService.show({
				message: 'Auto-dismiss test',
				duration: customDuration,
			})

			expect(global.setTimeout).toHaveBeenCalled()
			expect(global.setTimeout.mock.calls[0][1]).toBe(customDuration)
		})

		it('adds a click handler to dismiss the notification', () => {
			NotificationService.show({ message: 'Click to dismiss' })

			const notificationDiv = document.createElement.mock.results[1].value
			expect(notificationDiv.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
		})

		it('sets different background colors based on type', () => {
			// Test success type
			NotificationService.show({
				message: 'Success message',
				type: NOTIFICATION.TYPE.SUCCESS,
			})

			let notificationDiv = document.createElement.mock.results[1].value
			expect(notificationDiv.style.backgroundColor).toBe('var(--success-color, #4CAF50)')
			expect(notificationDiv.style.color).toBe('white')

			vi.clearAllMocks()

			// Test error type
			NotificationService.show({
				message: 'Error message',
				type: NOTIFICATION.TYPE.ERROR,
			})

			notificationDiv = document.createElement.mock.results[1].value
			expect(notificationDiv.style.backgroundColor).toBe('var(--error-color, #F44336)')
			expect(notificationDiv.style.color).toBe('white')

			vi.clearAllMocks()

			// Test warning type
			NotificationService.show({
				message: 'Warning message',
				type: NOTIFICATION.TYPE.WARNING,
			})

			notificationDiv = document.createElement.mock.results[1].value
			expect(notificationDiv.style.backgroundColor).toBe('var(--warning-color, #FFC107)')
			expect(notificationDiv.style.color).toBe('black')

			vi.clearAllMocks()

			// Test info type
			NotificationService.show({
				message: 'Info message',
				type: NOTIFICATION.TYPE.INFO,
			})

			notificationDiv = document.createElement.mock.results[1].value
			expect(notificationDiv.style.backgroundColor).toBe('var(--info-color, #2196F3)')
			expect(notificationDiv.style.color).toBe('white')
		})
	})

	describe('dismiss method', () => {
		it('sets fadeOut animation and adds animationend event listener', () => {
			const notification = {
				style: {},
				addEventListener: vi.fn(),
				parentNode: {
					removeChild: vi.fn(),
				},
			}

			NotificationService.dismiss(notification)

			expect(notification.style.animation).toBe('fadeOut 0.3s ease-out')
			expect(notification.addEventListener).toHaveBeenCalledWith('animationend', expect.any(Function))
		})

		it('removes notification from parent when animation ends', () => {
			const removeChildMock = vi.fn()
			const notification = {
				style: {},
				addEventListener: vi.fn(),
				parentNode: {
					removeChild: removeChildMock,
				},
			}

			NotificationService.dismiss(notification)

			// Get the callback function passed to addEventListener
			const animationEndCallback = notification.addEventListener.mock.calls[0][1]

			// Call the callback to simulate animation end
			animationEndCallback()

			expect(removeChildMock).toHaveBeenCalledWith(notification)
		})
	})

	describe('helper methods', () => {
		it('success method calls show with success type', () => {
			// Spy on show method
			const showSpy = vi.spyOn(NotificationService, 'show')

			const message = 'Success test'
			NotificationService.success(message)

			expect(showSpy).toHaveBeenCalledWith({
				message,
				type: NOTIFICATION.TYPE.SUCCESS,
				duration: NotificationService.DEFAULT_DURATION,
			})
		})

		it('error method calls show with error type', () => {
			const showSpy = vi.spyOn(NotificationService, 'show')

			const message = 'Error test'
			NotificationService.error(message)

			expect(showSpy).toHaveBeenCalledWith({
				message,
				type: NOTIFICATION.TYPE.ERROR,
				duration: NotificationService.DEFAULT_DURATION,
			})
		})

		it('warning method calls show with warning type', () => {
			const showSpy = vi.spyOn(NotificationService, 'show')

			const message = 'Warning test'
			NotificationService.warning(message)

			expect(showSpy).toHaveBeenCalledWith({
				message,
				type: NOTIFICATION.TYPE.WARNING,
				duration: NotificationService.DEFAULT_DURATION,
			})
		})

		it('info method calls show with info type', () => {
			const showSpy = vi.spyOn(NotificationService, 'show')

			const message = 'Info test'
			NotificationService.info(message)

			expect(showSpy).toHaveBeenCalledWith({
				message,
				type: NOTIFICATION.TYPE.INFO,
				duration: NotificationService.DEFAULT_DURATION,
			})
		})

		it('accepts custom duration in helper methods', () => {
			const showSpy = vi.spyOn(NotificationService, 'show')

			const message = 'Custom duration test'
			const customDuration = 10000
			NotificationService.success(message, customDuration)

			expect(showSpy).toHaveBeenCalledWith({
				message,
				type: NOTIFICATION.TYPE.SUCCESS,
				duration: customDuration,
			})
		})
	})
})
