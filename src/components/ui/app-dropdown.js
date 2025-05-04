import { html, css } from 'lit'
import { BaseComponent } from '@components'

/**
 * Dropdown select component
 * @element app-dropdown
 *
 * @prop {String} label - Dropdown label
 * @prop {String} name - Input name
 * @prop {String} value - Selected value
 * @prop {Array} options - Array of option objects with value and label properties
 * @prop {Boolean} required - Whether the dropdown is required
 * @prop {String} errorMessage - Custom error message
 * @prop {Boolean} disabled - Whether the dropdown is disabled
 *
 * @fires change - Fires when selection changes
 * @fires validate - Fires after validation with validation result
 */
export class AppDropdown extends BaseComponent {
	static get properties() {
		return {
			label: { type: String },
			name: { type: String },
			value: { type: String },
			options: { type: Array },
			required: { type: Boolean },
			errorMessage: { type: String },
			disabled: { type: Boolean },
			_touched: { type: Boolean, state: true },
			_open: { type: Boolean, state: true },
		}
	}

	constructor() {
		super()
		this.label = ''
		this.name = ''
		this.value = ''
		this.options = []
		this.required = false
		this.errorMessage = ''
		this.disabled = false
		this._touched = false
		this._open = false
		this._clickOutsideHandler = this._handleClickOutside.bind(this)
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('click', this._clickOutsideHandler)

		// Listen for ui-component-opened event
		this._boundHandleComponentOpened = this._handleComponentOpened.bind(this)
		document.addEventListener('ui-component-opened', this._boundHandleComponentOpened)
	}

	disconnectedCallback() {
		document.removeEventListener('click', this._clickOutsideHandler)
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
					position: relative;
				}

				.dropdown-container {
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

				.select-container {
					position: relative;
					cursor: pointer;
				}

				.selected-value {
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
					user-select: none;
				}

				.selected-value:focus {
					outline: none;
					border-color: var(--primary-color);
					box-shadow: 0 0 0 1px var(--primary-color);
				}

				.dropdown-error .selected-value {
					border-color: var(--error-color);
				}

				.dropdown-error .selected-value:focus {
					box-shadow: 0 0 0 1px var(--error-color);
				}

				.selected-value:disabled {
					background-color: var(--neutral-color);
					opacity: 0.7;
					cursor: not-allowed;
				}

				.arrow {
					width: 0;
					height: 0;
					border-left: 5px solid transparent;
					border-right: 5px solid transparent;
					border-top: 5px solid var(--text-secondary);
					transition: transform var(--animation-quick) ease;
				}

				.arrow.open {
					transform: rotate(180deg);
				}

				.options {
					position: absolute;
					top: 100%;
					left: 0;
					right: 0;
					max-height: 200px;
					overflow-y: auto;
					background-color: var(--neutral-light);
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-small);
					margin-top: 2px;
					z-index: 100;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					display: none;
				}

				.options.open {
					display: block;
				}

				.option {
					padding: var(--spacing-s) var(--spacing-m);
					cursor: pointer;
					transition: all var(--animation-quick) ease;
				}

				.option:hover {
					background-color: var(--neutral-dark);
				}

				.option.selected {
					background-color: var(--primary-color);
					color: white;
					font-weight: var(--font-weight-medium);
				}

				.error-message {
					color: var(--error-color);
					font-size: var(--font-size-caption);
					margin-top: var(--spacing-xs);
					min-height: 16px;
				}

				.placeholder {
					color: var(--text-tertiary);
				}
			`,
		]
	}

	render() {
		const hasError = this._touched && this.errorMessage
		const selectedOption = this.options.find((opt) => opt.value === this.value)
		const displayValue = selectedOption ? selectedOption.label : ''

		return html`
			<div class="dropdown-container ${hasError ? 'dropdown-error' : ''}">
				${this.label
					? html`
							<label for="dropdown-${this.name}">
								${this.label} ${this.required ? html`<span class="required-mark">*</span>` : ''}
							</label>
						`
					: ''}

				<div class="select-container" @click="${this._toggleDropdown}">
					<div
						id="dropdown-${this.name}"
						class="selected-value"
						?disabled="${this.disabled}"
						tabindex="${this.disabled ? -1 : 0}"
						@keydown="${this._handleKeyDown}"
					>
						${displayValue
							? html`${displayValue}`
							: html`<span class="placeholder">${this.t('ui.selectOption') || 'Select an option'}</span>`}
						<span class="arrow ${this._open ? 'open' : ''}"></span>
					</div>

					<div class="options ${this._open ? 'open' : ''}">
						${this.options.map(
							(option) => html`
								<div
									class="option ${option.value === this.value ? 'selected' : ''}"
									@click="${(e) => {
										e.stopPropagation()
										this._selectOption(option.value)
									}}"
								>
									${option.label}
								</div>
							`
						)}
					</div>
				</div>

				<div class="error-message">${hasError ? this.errorMessage : ''}</div>
			</div>
		`
	}

	_toggleDropdown(e) {
		if (this.disabled) return

		e.stopPropagation()
		this._open = !this._open

		// If opening the dropdown, notify other components
		if (this._open) {
			document.dispatchEvent(
				new window.CustomEvent('ui-component-opened', {
					detail: {
						component: 'app-dropdown',
						name: this.name,
						instance: this,
					},
				})
			)
		}
	}

	_selectOption(value) {
		if (value === this.value) return

		this.value = value
		this._touched = true
		this._open = false

		this._validate()

		this.dispatch('change', {
			name: this.name,
			value: this.value,
		})
	}

	_handleClickOutside(e) {
		if (this._open && !this.contains(e.target)) {
			this._open = false
		}
	}

	_handleKeyDown(e) {
		if (this.disabled) return

		switch (e.key) {
			case 'Enter':
			case ' ':
				e.preventDefault()
				this._open = !this._open
				break
			case 'Escape':
				if (this._open) {
					e.preventDefault()
					this._open = false
				}
				break
			case 'ArrowDown':
				e.preventDefault()
				if (!this._open) {
					this._open = true
				} else {
					this._selectNextOption()
				}
				break
			case 'ArrowUp':
				e.preventDefault()
				if (!this._open) {
					this._open = true
				} else {
					this._selectPreviousOption()
				}
				break
			case 'Tab':
				if (this._open) {
					this._open = false
				}
				break
		}
	}

	_selectNextOption() {
		const currentIndex = this.options.findIndex((opt) => opt.value === this.value)
		const nextIndex = (currentIndex + 1) % this.options.length
		this._selectOption(this.options[nextIndex].value)
	}

	_selectPreviousOption() {
		const currentIndex = this.options.findIndex((opt) => opt.value === this.value)
		const prevIndex = currentIndex <= 0 ? this.options.length - 1 : currentIndex - 1
		this._selectOption(this.options[prevIndex].value)
	}

	_validate() {
		let isValid = true
		let errorMessage = ''

		// Check required validation
		if (this.required && !this.value) {
			isValid = false
			errorMessage = this.t('employee.validation.required') || 'This field is required'
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
	 * Manually validate the dropdown
	 * @returns {boolean} Whether the dropdown is valid
	 */
	validate() {
		this._touched = true
		return this._validate()
	}

	/**
	 * Handle another UI component opening
	 * @private
	 */
	_handleComponentOpened(e) {
		// Only close if it's not this instance that opened
		if (e.detail.instance !== this && this._open) {
			this._open = false
		}
	}
}

customElements.define('app-dropdown', AppDropdown)
