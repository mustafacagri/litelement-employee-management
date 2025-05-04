import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { EmployeeService, StorageService, NotificationService } from '@services'
import { Router } from '@vaadin/router'

// Import component definitions
import '@components/employee/index.all.js'

/**
 * Employee form view component for adding and editing employees
 * @element employee-form-view
 */
export class EmployeeFormView extends BaseComponent {
	static get properties() {
		return {
			_employee: { type: Object, state: true },
			_employeeService: { type: Object, state: true },
			_isEdit: { type: Boolean, state: true },
			_isLoading: { type: Boolean, state: true },
			_isSaving: { type: Boolean, state: true },
		}
	}

	constructor() {
		super()
		this._employee = null
		this._isEdit = false
		this._isLoading = true
		this._isSaving = false

		// Initialize services
		this._storageService = new StorageService()
		this._employeeService = new EmployeeService(this._storageService)
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					padding: var(--spacing-m);
					overflow: visible;
				}

				.page {
					position: relative;
					overflow: visible;
				}

				.loading {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: 200px;
					color: var(--text-secondary);
				}
			`,
		]
	}

	render() {
		if (this._isLoading) {
			return html` <div class="loading">${this.t('app.loading')}</div> `
		}

		return html`
			<div class="page">
				<employee-form
					.employee="${this._employee}"
					?isEdit="${this._isEdit}"
					@save="${this._handleSave}"
					@cancel="${this._handleCancel}"
				></employee-form>

				<employee-update-modal
					@confirm="${this._confirmUpdate}"
					@cancel="${this._cancelUpdate}"
				></employee-update-modal>
			</div>
		`
	}

	/**
	 * Load employee data when component is connected to DOM
	 */
	connectedCallback() {
		super.connectedCallback()
		this._loadEmployeeData()

		// Listen for employee-service-error events
		document.addEventListener('employee-service-error', this._handleServiceError.bind(this))
	}

	disconnectedCallback() {
		// Remove event listener
		document.removeEventListener('employee-service-error', this._handleServiceError.bind(this))
		super.disconnectedCallback()
	}

	/**
	 * Handle service error events
	 *
	 * @private
	 */
	_handleServiceError() {
		// Reset saving flag on error
		this._isSaving = false

		// Reset the loading state on the form
		const form = this.shadowRoot.querySelector('employee-form')
		if (form) {
			form._loading = false
		}
	}

	/**
	 * Load employee data based on the route parameters
	 *
	 * @private
	 */
	_loadEmployeeData() {
		this._isLoading = true

		// Get route parameters from the URL
		const path = window.location.pathname

		// Check if we're in edit mode
		if (path.includes('/employee/') && path.includes('/edit')) {
			this._isEdit = true
			// Extract the ID from the path
			const pathParts = path.split('/')
			const employeeIndex = pathParts.indexOf('employee')
			if (employeeIndex !== -1 && pathParts.length > employeeIndex + 1) {
				const employeeId = pathParts[employeeIndex + 1]

				// Get employee from service
				this._employee = this._employeeService.getById(employeeId)

				// If employee doesn't exist, redirect to list view
				if (!this._employee) {
					console.error(`Employee with id ${employeeId} not found`)
					Router.go('/')
					return
				}
			}
		} else {
			// We're in create mode
			this._isEdit = false
			this._employee = null
		}

		this._isLoading = false
	}

	/**
	 * Handle save action from the form
	 *
	 * @param {CustomEvent} e - Save event with employee data
	 * @private
	 */
	_handleSave(e) {
		// Check if we're already processing a save operation
		if (this._isSaving) {
			return
		}

		// Set saving flag to prevent multiple submissions
		this._isSaving = true
		const { employee } = e.detail

		try {
			if (this._isEdit) {
				// In edit mode, show confirmation modal before saving
				const updateModal = this.shadowRoot.querySelector('employee-update-modal')
				if (updateModal) {
					updateModal.open(employee)
				} else {
					console.error('Update modal not found in the shadow DOM')
					// Fallback to direct save if modal not found
					this._saveEmployee(employee)
				}
			} else {
				// In create mode, save directly
				this._saveEmployee(employee)
			}
		} catch (error) {
			console.error('Error handling save action:', error)
			this._showNotification('error')
			// Reset saving flag on error
			this._isSaving = false

			// Reset the loading state on the form
			const form = this.shadowRoot.querySelector('employee-form')
			if (form) {
				form._loading = false
			}
		}
	}

	/**
	 * Save employee to service
	 *
	 * @param {Object} employee - Employee data to save
	 * @private
	 */
	_saveEmployee(employee) {
		try {
			let result

			if (this._isEdit) {
				// Update existing employee
				result = this._employeeService.update(employee.id, employee)
				if (result) {
					this._showNotification('updateSuccess')
				}
			} else {
				// Create new employee
				result = this._employeeService.create(employee)
				if (result) {
					this._showNotification('createSuccess')
				}
			}

			// If operation was successful, navigate back to employee list
			if (result) {
				// Navigate back to employee list after a short delay to allow notifications to be seen
				setTimeout(() => {
					// Reset loading states before navigation
					this._isSaving = false

					// Reset the form loading state
					const employeeForm = this.shadowRoot.querySelector('employee-form')
					if (employeeForm) {
						employeeForm._loading = false
					}

					Router.go('/')
				}, 500)
			} else {
				// Operation failed but notification already shown by the service
				this._isSaving = false

				// Reset the loading state on the form
				const form = this.shadowRoot.querySelector('employee-form')
				if (form) {
					form._loading = false
				}
			}
		} catch (error) {
			// This should rarely happen now since the service handles most errors
			console.error('Unexpected error saving employee:', error)
			this._showNotification('error')

			// Reset saving flag on error
			this._isSaving = false

			// Reset the loading state on the form
			const form = this.shadowRoot.querySelector('employee-form')
			if (form) {
				form._loading = false
			}
		}
	}

	/**
	 * Handle cancel action from the form
	 *
	 * @private
	 */
	_handleCancel() {
		// Navigate back to employee list
		Router.go('/')
	}

	/**
	 * Confirm employee update
	 *
	 * @param {CustomEvent} e - Confirm event with employee data
	 * @private
	 */
	_confirmUpdate(e) {
		const { employee } = e.detail
		this._saveEmployee(employee)
	}

	/**
	 * Cancel employee update
	 *
	 * @private
	 */
	_cancelUpdate() {
		// Reset saving flag when update is cancelled
		this._isSaving = false
	}

	/**
	 * Show a notification message
	 *
	 * @param {String} key - Translation key for the notification message
	 * @private
	 */
	_showNotification(key) {
		const message = this.t(`notifications.${key}`)

		if (key.includes('Success')) {
			NotificationService.success(message)
		} else {
			NotificationService.error(message)
		}
	}
}

customElements.define('employee-form-view', EmployeeFormView)
