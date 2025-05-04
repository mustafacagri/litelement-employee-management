import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { Employee } from '@models'
import { PHONE, MASK_FORMAT } from '@constants'

// Import UI component definitions
import '@components/ui/index.all.js'

/**
 * Employee form component for adding and editing employees
 * @element employee-form
 *
 * @prop {Object} employee - Employee data for editing (null for creating)
 * @prop {Boolean} isEdit - Whether the form is in edit mode
 *
 * @fires save - When the form is submitted with employee data
 * @fires cancel - When the form is cancelled
 */
export class EmployeeForm extends BaseComponent {
	static get properties() {
		return {
			employee: { type: Object },
			isEdit: { type: Boolean },
			_formData: { type: Object, state: true },
			_formErrors: { type: Object, state: true },
			_loading: { type: Boolean, state: true },
		}
	}

	constructor() {
		super()
		this.employee = null
		this.isEdit = false
		this._formData = this._getInitialFormData()
		this._formErrors = {}
		this._loading = false
	}

	updated(changedProperties) {
		if (changedProperties.has('employee') && this.employee) {
			this._initFormWithEmployee()
		}
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
				}

				.form-container {
					max-width: 800px;
					margin: 0 auto;
					position: relative; /* For proper dropdown positioning */
					overflow: visible; /* Ensure dropdowns can extend outside */
				}

				.form-title {
					margin-bottom: var(--spacing-m);
					font-size: var(--font-size-h2);
					color: var(--text-primary);
				}

				.form-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: var(--spacing-m);
					position: relative; /* For proper dropdown positioning */
					overflow: visible; /* Ensure dropdowns can extend outside */
				}

				.form-field {
					position: relative; /* For proper dropdown positioning */
				}

				.phone-group {
					display: flex;
					gap: var(--spacing-m);
					align-items: flex-start;
				}

				.phone-group .phone-code {
					width: 80px;
					min-width: 80px;
				}

				.form-actions {
					display: flex;
					justify-content: flex-end;
					gap: var(--spacing-m);
					margin-top: var(--spacing-l);
				}

				/* Responsive layout */
				@media (max-width: 768px) {
					.form-grid {
						grid-template-columns: 1fr;
					}

					.phone-group {
						flex-direction: column;
					}
				}
			`,
		]
	}

	render() {
		const title = this.isEdit ? this.t('employee.form.editTitle') : this.t('employee.form.addTitle')

		// Create options for dropdowns
		const departmentOptions = Employee.departments.map((dept) => ({
			value: dept,
			label: this.t(`employee.departments.${dept}`),
		}))

		const positionOptions = Employee.positions.map((pos) => ({
			value: pos,
			label: this.t(`employee.positions.${pos}`),
		}))

		// Format dates for display if they exist
		const dateOfEmployment = this._formData.dateOfEmployment || ''
		const dateOfBirth = this._formData.dateOfBirth || ''

		return html`
			<div class="form-container">
				<app-card>
					<h2 class="form-title">${title}</h2>

					<form @submit="${this._handleSubmit}">
						<div class="form-grid">
							<!-- First name -->
							<app-input
								label="${this.t('employee.fields.firstName')}"
								name="firstName"
								.value="${this._formData.firstName}"
								?required="${true}"
								?disabled="${this._loading}"
								@input="${this._handleInput}"
								@validate="${this._handleValidation}"
								validationType="required"
							></app-input>

							<!-- Last name -->
							<app-input
								label="${this.t('employee.fields.lastName')}"
								name="lastName"
								.value="${this._formData.lastName}"
								?required="${true}"
								?disabled="${this._loading}"
								@input="${this._handleInput}"
								@validate="${this._handleValidation}"
								validationType="required"
							></app-input>

							<!-- Email -->
							<app-input
								label="${this.t('employee.fields.email')}"
								name="email"
								type="email"
								.value="${this._formData.email}"
								?required="${true}"
								?disabled="${this._loading}"
								@input="${this._handleInput}"
								@validate="${this._handleValidation}"
								validationType="email"
							></app-input>

							<!-- Phone Code and Number -->
							<div class="form-field phone-group">
								<!-- Phone country code -->
								<app-input
									label="${this.t('employee.fields.phoneCode')}"
									name="phoneCode"
									class="phone-code"
									.value="${this._formData.phoneCode}"
									?disabled="${true}"
									@input="${this._handleInput}"
									@validate="${this._handleValidation}"
								></app-input>

								<!-- Phone number -->
								<app-input
									label="${this.t('employee.fields.phoneNumber')}"
									name="phoneNumber"
									type="tel"
									.value="${this._formData.phoneNumber}"
									?required="${true}"
									?disabled="${this._loading}"
									@input="${this._handleInput}"
									@validate="${this._handleValidation}"
									validationType="phone"
									mask="${MASK_FORMAT.PHONE}"
									placeholder="555 123 45 67"
									style="flex: 1;"
								></app-input>
							</div>

							<!-- Date of employment -->
							<app-date-picker
								label="${this.t('employee.fields.dateOfEmployment')}"
								name="dateOfEmployment"
								.value="${dateOfEmployment}"
								?required="${true}"
								?disabled="${this._loading}"
								@change="${this._handleInput}"
								@validate="${this._handleValidation}"
							></app-date-picker>

							<!-- Date of birth -->
							<app-date-picker
								label="${this.t('employee.fields.dateOfBirth')}"
								name="dateOfBirth"
								.value="${dateOfBirth}"
								?required="${true}"
								?disabled="${this._loading}"
								max="${new Date().toISOString().split('T')[0]}"
								@change="${this._handleInput}"
								@validate="${this._handleValidation}"
							></app-date-picker>

							<!-- Department -->
							<app-dropdown
								label="${this.t('employee.fields.department')}"
								name="department"
								.value="${this._formData.department}"
								.options="${departmentOptions}"
								?required="${true}"
								?disabled="${this._loading}"
								@change="${this._handleInput}"
								@validate="${this._handleValidation}"
							></app-dropdown>

							<!-- Position -->
							<app-dropdown
								label="${this.t('employee.fields.position')}"
								name="position"
								.value="${this._formData.position}"
								.options="${positionOptions}"
								?required="${true}"
								?disabled="${this._loading}"
								@change="${this._handleInput}"
								@validate="${this._handleValidation}"
							></app-dropdown>
						</div>

						<div class="form-actions">
							<app-button type="button" variant="text" @click="${this._handleCancel}" ?disabled="${this._loading}">
								${this.t('actions.cancel')}
							</app-button>

							<app-button type="button" variant="primary" @click="${this._manualSubmit}" ?disabled="${this._loading}">
								${this.t('employee.form.save')}
							</app-button>
						</div>
					</form>
				</app-card>
			</div>
		`
	}

	/**
	 * Initialize form with default values
	 *
	 * @returns {Object} Initial form data
	 * @private
	 */
	_getInitialFormData() {
		return {
			id: '',
			firstName: '',
			lastName: '',
			email: '',
			phoneCode: PHONE.DEFAULT_COUNTRY_CODE,
			phoneNumber: '',
			dateOfEmployment: '',
			dateOfBirth: '',
			department: '',
			position: '',
		}
	}

	/**
	 * Initialize form with employee data
	 *
	 * @private
	 */
	_initFormWithEmployee() {
		if (!this.employee) return

		// Set loading state while initializing form
		this._loading = true

		try {
			// Make sure date values are properly formatted as ISO strings
			let dateOfEmployment = this.employee.dateOfEmployment || ''
			let dateOfBirth = this.employee.dateOfBirth || ''

			// Ensure dates are valid ISO strings
			if (dateOfEmployment && !dateOfEmployment.includes('T')) {
				try {
					const date = new Date(dateOfEmployment)
					if (!isNaN(date.getTime())) {
						dateOfEmployment = date.toISOString()
					}
				} catch (e) {
					console.error('Error processing dateOfEmployment:', e)
				}
			}

			if (dateOfBirth && !dateOfBirth.includes('T')) {
				try {
					const date = new Date(dateOfBirth)
					if (!isNaN(date.getTime())) {
						dateOfBirth = date.toISOString()
					}
				} catch (e) {
					console.error('Error processing dateOfBirth:', e)
				}
			}

			this._formData = {
				id: this.employee.id || '',
				firstName: this.employee.firstName || '',
				lastName: this.employee.lastName || '',
				email: this.employee.email || '',
				phoneCode: this.employee.phoneCode || PHONE.DEFAULT_COUNTRY_CODE,
				phoneNumber: this.employee.phoneNumber || '',
				dateOfEmployment: dateOfEmployment,
				dateOfBirth: dateOfBirth,
				department: this.employee.department || '',
				position: this.employee.position || '',
			}

			// Reset form errors when loading new data
			this._formErrors = {}

			// Update DOM elements after form data is set
			this.updateComplete.then(() => {
				// Set values in input fields
				const formElements = this.shadowRoot.querySelectorAll('app-input, app-dropdown, app-date-picker')
				formElements.forEach((element) => {
					const name = element.getAttribute('name')
					if (name && this._formData[name] !== undefined) {
						element.value = this._formData[name]
					}
				})
			})
		} catch (error) {
			console.error('Error initializing form with employee data:', error)
		} finally {
			this._loading = false
		}
	}

	/**
	 * Handle input changes
	 *
	 * @param {CustomEvent} e - Input event
	 * @private
	 */
	_handleInput(e) {
		const { name, value } = e.detail ?? {}

		// Process the value based on field type
		let processedValue = value

		// Process dates
		if (['dateOfEmployment', 'dateOfBirth'].includes(name) && value) {
			// If the value is already an ISO string, keep it as is
			// Otherwise, try to convert it to an ISO string
			if (!value.includes('T')) {
				try {
					const date = new Date(value)
					if (!isNaN(date.getTime())) {
						processedValue = date.toISOString()
					}
				} catch (error) {
					console.error(`Error processing date value for ${name}:`, error)
				}
			}
		}
		// Phone numbers are now handled by mask directly without prefix

		this._formData = {
			...this._formData,
			[name]: processedValue,
		}
	}

	/**
	 * Handle validation events
	 *
	 * @param {CustomEvent} e - Validation event
	 * @private
	 */
	_handleValidation(e) {
		const { name, isValid } = e.detail

		if (isValid) {
			// Remove error if field is now valid
			// Using object destructuring with rest to remove a property
			// eslint-disable-next-line no-unused-vars
			const { [name]: unused, ...rest } = this._formErrors
			this._formErrors = rest
		} else {
			// Add or update error
			this._formErrors = {
				...this._formErrors,
				[name]: true,
			}
		}
	}

	/**
	 * Validate all form fields
	 *
	 * @returns {Boolean} Whether the form is valid
	 * @private
	 */
	_validateForm() {
		// Get all form field elements
		const formElements = this.shadowRoot.querySelectorAll('app-input, app-dropdown, app-date-picker')

		// Validate each field
		let isValid = true
		formElements.forEach((element) => {
			const fieldValid = element.validate()
			isValid = isValid && fieldValid
		})

		return isValid
	}

	/**
	 * Handle manual form submission (backup for browsers where form submit might not work properly)
	 *
	 * @param {Event} e - Click event
	 * @private
	 */
	_manualSubmit(e) {
		// Prevent the default button click behavior
		e.preventDefault()
		e.stopPropagation()

		// Call the form submission handler directly
		this._processFormSubmission()
	}

	/**
	 * Handle form submission
	 *
	 * @param {Event} e - Submit event
	 * @private
	 */
	_handleSubmit(e) {
		// Prevent the default form submission
		e.preventDefault()

		// Process the form
		this._processFormSubmission()
	}

	/**
	 * Process the form submission logic (shared between manual and form submit)
	 *
	 * @private
	 */
	_processFormSubmission() {
		// Prevent multiple submissions
		if (this._loading) {
			return
		}

		// Set loading state during validation and submission
		this._loading = true

		try {
			// Validate all fields
			const isValid = this._validateForm()

			if (!isValid) {
				this._loading = false
				return
			}

			// Create employee object from form data
			const employeeData = new Employee(this._formData)

			// Dispatch save event only once
			this.dispatch('save', { employee: employeeData })
		} catch (error) {
			// Use the new base component error handler
			this.handleError(error, this.t('employee.form.submitError'), true, false)
			this._loading = false
		}
	}

	/**
	 * Handle cancel button click
	 *
	 * @param {Event} e - Click event
	 * @private
	 */
	_handleCancel(e) {
		e.preventDefault()
		this.dispatch('cancel')
	}

	/**
	 * Reset the form to initial state
	 */
	reset() {
		this._formData = this._getInitialFormData()
		this._formErrors = {}

		// Reset validation state on form elements
		const formElements = this.shadowRoot.querySelectorAll('app-input, app-dropdown, app-date-picker')

		formElements.forEach((element) => {
			element._touched = false
			element.errorMessage = ''
		})
	}
}

customElements.define('employee-form', EmployeeForm)
