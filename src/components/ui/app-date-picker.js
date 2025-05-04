import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { validators } from '@utils'
import { getCurrentLanguage } from '@i18n'

/**
 * Date picker component with input and calendar
 * @element app-date-picker
 *
 * @prop {String} label - Date picker label
 * @prop {String} name - Input name
 * @prop {String} value - Selected date value (ISO format)
 * @prop {String} placeholder - Input placeholder
 * @prop {Boolean} required - Whether the date is required
 * @prop {String} errorMessage - Custom error message
 * @prop {Boolean} disabled - Whether the date picker is disabled
 * @prop {String} min - Minimum allowed date (ISO format)
 * @prop {String} max - Maximum allowed date (ISO format)
 *
 * @fires change - Fires when date changes
 * @fires validate - Fires after validation with validation result
 */
export class AppDatePicker extends BaseComponent {
	static get properties() {
		return {
			label: { type: String },
			name: { type: String },
			value: { type: String },
			placeholder: { type: String },
			required: { type: Boolean },
			errorMessage: { type: String },
			disabled: { type: Boolean },
			min: { type: String },
			max: { type: String },
			_touched: { type: Boolean, state: true },
			_showCalendar: { type: Boolean, state: true },
			_currentMonth: { type: Number, state: true },
			_currentYear: { type: Number, state: true },
			_selectedDate: { type: Object, state: true },
		}
	}

	constructor() {
		super()
		this.label = ''
		this.name = ''
		this.value = ''
		this.placeholder = ''
		this.required = false
		this.errorMessage = ''
		this.disabled = false
		this.min = ''
		this.max = ''
		this._touched = false
		this._showCalendar = false

		// Initialize with current date
		const today = new Date()
		this._currentMonth = today.getMonth()
		this._currentYear = today.getFullYear()

		// Initialize selected date from value if available
		this._selectedDate = null

		// Bind methods
		this._handleDocumentClick = this._handleDocumentClick.bind(this)
	}

	updated(changedProperties) {
		// If value changes, update the selectedDate
		if (changedProperties.has('value') && this.value) {
			try {
				this._selectedDate = new Date(this.value)
				// Also update the current view to show the selected month/year
				this._currentMonth = this._selectedDate.getMonth()
				this._currentYear = this._selectedDate.getFullYear()
			} catch (e) {
				console.error('Error parsing date value:', e)
			}
		}
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('click', this._handleDocumentClick)

		// Listen for ui-component-opened event
		this._boundHandleComponentOpened = this._handleComponentOpened.bind(this)
		document.addEventListener('ui-component-opened', this._boundHandleComponentOpened)

		// Initialize selected date from value if available
		if (this.value) {
			try {
				this._selectedDate = new Date(this.value)
				this._currentMonth = this._selectedDate.getMonth()
				this._currentYear = this._selectedDate.getFullYear()
			} catch (e) {
				console.error('Error initializing date picker with value:', e)
			}
		}
	}

	disconnectedCallback() {
		document.removeEventListener('click', this._handleDocumentClick)
		document.removeEventListener('ui-component-opened', this._boundHandleComponentOpened)
		super.disconnectedCallback()
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					margin-bottom: var(--spacing-m);
				}

				.date-picker-container {
					position: relative;
				}

				label {
					display: block;
					font-size: var(--font-size-body2);
					margin-bottom: var(--spacing-xs);
					color: var(--text-primary);
				}

				.required-mark {
					color: var(--error-color);
					margin-left: 2px;
				}

				.date-input {
					width: 100%;
					font-family: var(--font-family);
					font-size: var(--font-size-body2);
					padding: var(--spacing-s) var(--spacing-m);
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-small);
					background-color: var(--neutral-light);
					box-sizing: border-box;
					transition: all var(--animation-quick) ease;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: space-between;
				}

				.date-input:focus {
					outline: none;
					border-color: var(--primary-color);
					box-shadow: 0 0 0 1px var(--primary-color);
				}

				.date-input:disabled {
					background-color: var(--neutral-color);
					opacity: 0.7;
					cursor: not-allowed;
				}

				.error-message {
					color: var(--error-color);
					font-size: var(--font-size-caption);
					margin-top: var(--spacing-xs);
					min-height: 16px;
				}

				.date-error .date-input {
					border-color: var(--error-color);
				}

				.date-error .date-input:focus {
					box-shadow: 0 0 0 1px var(--error-color);
				}

				.calendar-icon {
					width: 16px;
					height: 16px;
					fill: var(--text-secondary);
				}

				.calendar-container {
					position: absolute;
					top: calc(100% + 4px);
					left: 0;
					width: 280px;
					background-color: var(--neutral-light);
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-small);
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					z-index: 100;
					display: none;
				}

				.calendar-container.show {
					display: block;
				}

				.calendar-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: var(--spacing-s);
					border-bottom: 1px solid var(--neutral-dark);
				}

				.month-year {
					font-weight: var(--font-weight-medium);
				}

				.nav-button {
					background: none;
					border: none;
					cursor: pointer;
					padding: var(--spacing-xs);
					border-radius: var(--border-radius-small);
				}

				.nav-button:hover {
					background-color: var(--neutral-dark);
				}

				.weekdays {
					display: grid;
					grid-template-columns: repeat(7, 1fr);
					text-align: center;
					font-weight: var(--font-weight-medium);
					border-bottom: 1px solid var(--neutral-dark);
				}

				.weekday {
					padding: var(--spacing-xs);
					font-size: var(--font-size-caption);
					color: var(--text-secondary);
				}

				.days {
					display: grid;
					grid-template-columns: repeat(7, 1fr);
					text-align: center;
				}

				.day {
					padding: var(--spacing-xs);
					font-size: var(--font-size-caption);
					cursor: pointer;
					border-radius: var(--border-radius-small);
				}

				.day:hover:not(.outside-month):not(.selected) {
					background-color: var(--neutral-dark);
				}

				.day.outside-month {
					color: var(--text-tertiary);
				}

				.day.today {
					font-weight: var(--font-weight-bold);
				}

				.day.selected {
					background-color: var(--primary-color);
					color: white;
				}

				.day.disabled {
					color: var(--text-tertiary);
					cursor: not-allowed;
					text-decoration: line-through;
				}

				.placeholder {
					color: var(--text-tertiary);
				}

				.hidden-input {
					position: absolute;
					opacity: 0;
					height: 0;
					width: 0;
				}
			`,
		]
	}

	render() {
		const formattedDateForDisplay = this.value ? this._formatDateForDisplay(this.value) : ''
		const showPlaceholder = !formattedDateForDisplay
		const hasError = this._touched && this.errorMessage

		// Prepare calendar days
		const days = this._getDaysInMonth()

		return html`
			<div class="date-picker-container ${hasError ? 'date-error' : ''}">
				${this.label
					? html`<label for="date-${this.name}">
							${this.label}${this.required ? html`<span class="required-mark">*</span>` : ''}
						</label>`
					: ''}

				<div class="date-input" @click="${this._toggleCalendar}" ?disabled="${this.disabled}">
					<span class="${showPlaceholder ? 'placeholder' : ''}">
						${showPlaceholder ? this.placeholder || this.t('ui.selectDate', 'Select date') : formattedDateForDisplay}
					</span>
					<svg class="calendar-icon" viewBox="0 0 24 24">
						<path
							d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"
						/>
					</svg>
				</div>

				<div class="calendar-container ${this._showCalendar ? 'show' : ''}">
					<div class="calendar-header">
						<button class="nav-button" @click="${this._prevMonth}">
							<svg viewBox="0 0 24 24" width="16" height="16">
								<path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" fill="currentColor" />
							</svg>
						</button>
						<div class="month-year">${this._getCurrentMonthName()} ${this._currentYear}</div>
						<button class="nav-button" @click="${this._nextMonth}">
							<svg viewBox="0 0 24 24" width="16" height="16">
								<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" fill="currentColor" />
							</svg>
						</button>
					</div>

					<div class="weekdays">${this._getWeekdaysShort().map((day) => html`<div class="weekday">${day}</div>`)}</div>

					<div class="days">
						${days.map(
							(day) => html`
								<div
									class="day ${day.outsideMonth ? 'outside-month' : ''} 
                                      ${day.isToday ? 'today' : ''} 
                                      ${day.isSelected ? 'selected' : ''} 
                                      ${day.isDisabled ? 'disabled' : ''}"
									@click="${day.isDisabled || day.outsideMonth ? null : () => this._selectDay(day.date)}"
								>
									${day.dayNumber}
								</div>
							`
						)}
					</div>
				</div>

				<div class="error-message">${hasError ? this.errorMessage : ''}</div>
			</div>
		`
	}

	/**
	 * Get array of month names in current language
	 * @returns {Array} Array of month names
	 */
	_getMonthNames() {
		return (
			this.t('ui.months') || [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			]
		)
	}

	/**
	 * Get current month name in current language
	 * @returns {String} Month name
	 */
	_getCurrentMonthName() {
		return this._getMonthNames()[this._currentMonth]
	}

	/**
	 * Get array of weekday names in current language
	 * @returns {Array} Array of weekday names
	 */
	_getWeekdaysShort() {
		return this.t('ui.weekdaysShort') || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	}

	/**
	 * Generate array of days for the current month view
	 * @returns {Array} Array of day objects
	 */
	_getDaysInMonth() {
		const result = []
		const daysInWeek = 7

		// Get first and last day of the current month
		const firstDay = new Date(this._currentYear, this._currentMonth, 1)
		const lastDay = new Date(this._currentYear, this._currentMonth + 1, 0)
		const daysInMonth = lastDay.getDate()

		// Get first day of the week (0-6 where 0 is Sunday)
		const firstDayOfWeek = firstDay.getDay()

		// Get the last day of the previous month
		const prevMonth = new Date(this._currentYear, this._currentMonth, 0)
		const prevMonthDays = prevMonth.getDate()

		// Add days from previous month to fill the first row
		if (firstDayOfWeek > 0) {
			for (let i = 0; i < firstDayOfWeek; i++) {
				const day = prevMonthDays - firstDayOfWeek + i + 1
				const date = new Date(
					this._currentMonth === 0 ? this._currentYear - 1 : this._currentYear,
					this._currentMonth === 0 ? 11 : this._currentMonth - 1,
					day
				)

				result.push({
					dayNumber: day,
					date,
					outsideMonth: true,
					isToday: this._isToday(date),
					isSelected: this._isSelected(date),
					isDisabled: this._isDateDisabled(date),
				})
			}
		}

		// Add days of current month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(this._currentYear, this._currentMonth, day)

			result.push({
				dayNumber: day,
				date,
				outsideMonth: false,
				isToday: this._isToday(date),
				isSelected: this._isSelected(date),
				isDisabled: this._isDateDisabled(date),
			})
		}

		// Calculate how many days we need from the next month to complete the grid
		const remainingDays = (daysInWeek - (result.length % daysInWeek)) % daysInWeek

		// Add days from next month to complete the grid
		if (remainingDays > 0) {
			for (let day = 1; day <= remainingDays; day++) {
				const date = new Date(
					this._currentMonth === 11 ? this._currentYear + 1 : this._currentYear,
					this._currentMonth === 11 ? 0 : this._currentMonth + 1,
					day
				)

				result.push({
					dayNumber: day,
					date,
					outsideMonth: true,
					isToday: this._isToday(date),
					isSelected: this._isSelected(date),
					isDisabled: this._isDateDisabled(date),
				})
			}
		}

		return result
	}

	/**
	 * Check if a date is today
	 * @param {Date} date - Date to check
	 * @returns {Boolean} Whether the date is today
	 */
	_isToday(date) {
		const today = new Date()
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		)
	}

	/**
	 * Check if a date is the selected date
	 * @param {Date} date - Date to check
	 * @returns {Boolean} Whether the date is selected
	 */
	_isSelected(date) {
		if (!this._selectedDate || !date) return false

		// Compare the date parts only (not time)
		return (
			date.getDate() === this._selectedDate.getDate() &&
			date.getMonth() === this._selectedDate.getMonth() &&
			date.getFullYear() === this._selectedDate.getFullYear()
		)
	}

	/**
	 * Check if a date is disabled
	 * @param {Date} date - Date to check
	 * @returns {Boolean} Whether the date is disabled
	 */
	_isDateDisabled(date) {
		if (this.min) {
			const minDate = new Date(this.min)
			if (date < minDate) return true
		}

		if (this.max) {
			const maxDate = new Date(this.max)
			if (date > maxDate) return true
		}

		return false
	}

	/**
	 * Toggle calendar visibility
	 */
	_toggleCalendar(e) {
		if (this.disabled) return

		e.stopPropagation()
		this._showCalendar = !this._showCalendar

		// If opening the calendar and we have a value, navigate to that month/year
		if (this._showCalendar) {
			if (this.value) {
				const date = new Date(this.value)
				this._currentMonth = date.getMonth()
				this._currentYear = date.getFullYear()
			}

			// Notify other components that this component is open
			// Using the global CustomEvent constructor that's available in all modern browsers
			document.dispatchEvent(
				new window.CustomEvent('ui-component-opened', {
					detail: {
						component: 'app-date-picker',
						name: this.name,
						instance: this,
					},
				})
			)
		}
	}

	/**
	 * Handle another UI component opening
	 */
	_handleComponentOpened(e) {
		// Only close if it's not this instance that opened
		if (e.detail.instance !== this && this._showCalendar) {
			this._showCalendar = false
		}
	}

	/**
	 * Handle document click to close calendar when clicking outside
	 */
	_handleDocumentClick(e) {
		if (this._showCalendar && !this.contains(e.target)) {
			this._showCalendar = false
		}
	}

	/**
	 * Go to previous month
	 */
	_prevMonth(e) {
		e.stopPropagation()
		this._currentMonth--
		if (this._currentMonth < 0) {
			this._currentMonth = 11
			this._currentYear--
		}
	}

	/**
	 * Go to next month
	 */
	_nextMonth(e) {
		e.stopPropagation()
		this._currentMonth++
		if (this._currentMonth > 11) {
			this._currentMonth = 0
			this._currentYear++
		}
	}

	/**
	 * Select a day from the calendar
	 */
	_selectDay(date) {
		this._selectedDate = date

		// Create an ISO string
		const isoString = date.toISOString()
		this.value = isoString

		this._showCalendar = false
		this._touched = true

		this._validate()

		// Dispatch the change event with the ISO string value
		this.dispatch('change', {
			name: this.name,
			value: isoString,
		})
	}

	/**
	 * Formats a date string to YYYY-MM-DD for the input element
	 *
	 * @param {string} dateString - Date in ISO format or other valid date string
	 * @returns {string} Date formatted as YYYY-MM-DD or empty string if invalid
	 * @private
	 */
	_formatDateForInput(dateString) {
		if (!dateString) return ''

		try {
			const date = new Date(dateString)
			if (isNaN(date.getTime())) return ''

			return date.toISOString().split('T')[0]
		} catch (error) {
			console.error('Error formatting date for input:', error)
			return ''
		}
	}

	/**
	 * Format date for display according to current language
	 *
	 * @param {string} dateString - Date in ISO format
	 * @returns {string} Formatted date
	 * @private
	 */
	_formatDateForDisplay(dateString) {
		if (!dateString) return ''

		try {
			const date = new Date(dateString)
			if (isNaN(date.getTime())) {
				return ''
			}

			const lang = getCurrentLanguage()
			const day = date.getDate()
			const month = this._getMonthNames()[date.getMonth()]
			const year = date.getFullYear()

			if (lang === 'tr') {
				return `${day} ${month} ${year}`
			} else {
				return `${month} ${day}, ${year}`
			}
		} catch (e) {
			console.error('Error formatting date for display:', e)
			return ''
		}
	}

	_validate() {
		let isValid = true
		let errorMessage = ''

		// Check required validation
		if (this.required && validators.required(this.value) !== true) {
			isValid = false
			errorMessage = this.t('employee.validation.required') || 'This field is required'
		}

		// Check date validation
		if (isValid && this.value && validators.date(this.value) !== true) {
			isValid = false
			errorMessage = this.t('employee.validation.date') || 'Please enter a valid date'
		}

		// Check min date
		if (isValid && this.value && this.min) {
			const valueDate = new Date(this.value)
			const minDate = new Date(this.min)

			if (valueDate < minDate) {
				isValid = false
				errorMessage =
					this.t('employee.validation.minDate', {
						min: this._formatDateForDisplay(this.min),
					}) || `Date must be on or after ${this._formatDateForDisplay(this.min)}`
			}
		}

		// Check max date
		if (isValid && this.value && this.max) {
			const valueDate = new Date(this.value)
			const maxDate = new Date(this.max)

			if (valueDate > maxDate) {
				isValid = false
				errorMessage =
					this.t('employee.validation.maxDate', {
						max: this._formatDateForDisplay(this.max),
					}) || `Date must be on or before ${this._formatDateForDisplay(this.max)}`
			}
		}

		// Update error message
		this.errorMessage = errorMessage

		// Dispatch validation event
		this.dispatch('validate', {
			name: this.name,
			value: this.value,
			isValid,
		})

		return isValid
	}

	/**
	 * Manually validate the input
	 * @returns {boolean} Whether the input is valid
	 */
	validate() {
		this._touched = true
		return this._validate()
	}
}

customElements.define('app-date-picker', AppDatePicker)
