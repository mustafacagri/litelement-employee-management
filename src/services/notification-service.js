import { NOTIFICATION } from '@constants'

/**
 * Service for displaying notifications to the user
 */
export class NotificationService {
	static TYPES = NOTIFICATION.TYPE
	static DEFAULT_DURATION = 3000 // 3 seconds

	/**
	 * Shows a notification
	 *
	 * @param {Object} options - Notification options
	 * @param {string} options.message - The message to display
	 * @param {string} [options.type=success] - The type of notification (success, error, warning, info)
	 * @param {number} [options.duration=3000] - Duration in milliseconds
	 * @returns {Object} The created notification element (for potential manual dismissal)
	 */
	static show({ message, type = NotificationService.TYPES.SUCCESS, duration = NotificationService.DEFAULT_DURATION }) {
		// Create a container for notifications if it doesn't exist
		let container = document.getElementById('notification-container')

		if (!container) {
			container = document.createElement('div')
			container.id = 'notification-container'
			container.style.position = 'fixed'
			container.style.top = '16px'
			container.style.right = '16px'
			container.style.zIndex = '9999'
			document.body.appendChild(container)
		}

		// Create the notification element
		const notification = document.createElement('div')
		notification.className = `notification notification-${type}`
		notification.textContent = message

		// Style the notification
		notification.style.padding = '12px 16px'
		notification.style.marginBottom = '8px'
		notification.style.borderRadius = '4px'
		notification.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
		notification.style.minWidth = '200px'
		notification.style.maxWidth = '400px'
		notification.style.animation = 'fadeIn 0.3s ease-out'
		notification.style.cursor = 'pointer'

		// Set notification color based on type
		switch (type) {
			case NotificationService.TYPES.SUCCESS:
				notification.style.backgroundColor = 'var(--success-color, #4CAF50)'
				notification.style.color = 'white'
				break
			case NotificationService.TYPES.ERROR:
				notification.style.backgroundColor = 'var(--error-color, #F44336)'
				notification.style.color = 'white'
				break
			case NotificationService.TYPES.WARNING:
				notification.style.backgroundColor = 'var(--warning-color, #FFC107)'
				notification.style.color = 'black'
				break
			case NotificationService.TYPES.INFO:
				notification.style.backgroundColor = 'var(--info-color, #2196F3)'
				notification.style.color = 'white'
				break
		}

		// Add click handler to dismiss notification
		notification.addEventListener('click', () => {
			NotificationService.dismiss(notification)
		})

		// Add to container
		container.appendChild(notification)

		// Auto dismiss after duration
		if (duration > 0) {
			setTimeout(() => {
				NotificationService.dismiss(notification)
			}, duration)
		}

		return notification
	}

	/**
	 * Dismisses a notification
	 *
	 * @param {HTMLElement} notification - The notification element to dismiss
	 */
	static dismiss(notification) {
		notification.style.animation = 'fadeOut 0.3s ease-out'

		notification.addEventListener('animationend', () => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification)
			}
		})
	}

	/**
	 * Shows a success notification
	 *
	 * @param {string} message - The message to display
	 * @param {number} [duration=3000] - Duration in milliseconds
	 * @returns {Object} The notification element
	 */
	static success(message, duration = NotificationService.DEFAULT_DURATION) {
		return NotificationService.show({
			message,
			type: NotificationService.TYPES.SUCCESS,
			duration,
		})
	}

	/**
	 * Shows an error notification
	 *
	 * @param {string} message - The message to display
	 * @param {number} [duration=3000] - Duration in milliseconds
	 * @returns {Object} The notification element
	 */
	static error(message, duration = NotificationService.DEFAULT_DURATION) {
		return NotificationService.show({
			message,
			type: NotificationService.TYPES.ERROR,
			duration,
		})
	}

	/**
	 * Shows a warning notification
	 *
	 * @param {string} message - The message to display
	 * @param {number} [duration=3000] - Duration in milliseconds
	 * @returns {Object} The notification element
	 */
	static warning(message, duration = NotificationService.DEFAULT_DURATION) {
		return NotificationService.show({
			message,
			type: NotificationService.TYPES.WARNING,
			duration,
		})
	}

	/**
	 * Shows an info notification
	 *
	 * @param {string} message - The message to display
	 * @param {number} [duration=3000] - Duration in milliseconds
	 * @returns {Object} The notification element
	 */
	static info(message, duration = NotificationService.DEFAULT_DURATION) {
		return NotificationService.show({
			message,
			type: NotificationService.TYPES.INFO,
			duration,
		})
	}
}

// Add animation styles to document
const style = document.createElement('style')
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}
`
document.head.appendChild(style)
