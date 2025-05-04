import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { applyMask, validators } from '@utils'
import { REGEX, INPUT } from '@constants'

/**
 * Input field component with validation support
 * @element app-input
 *
 * @prop {String} label - Input label
 * @prop {String} type - Input type (text, email, tel, date, etc.)
 * @prop {String} name - Input name
 * @prop {String} value - Input value
 * @prop {String} placeholder - Input placeholder
 * @prop {Boolean} required - Whether the input is required
 * @prop {String} errorMessage - Custom error message
 * @prop {String} validationType - Type of validation to perform (email, phone, required, etc.)
 * @prop {Boolean} disabled - Whether the input is disabled
 * @prop {String} mask - Input mask pattern (e.g., "+90 (000) 000 00 00" for phone)
 * @prop {String} prefix - Static prefix to display before the input (e.g., "+(90)" for Turkish phone numbers)
 *
 * @fires input - Fires when the input value changes
 * @fires change - Fires when the input value is committed
 * @fires validate - Fires after validation with validation result
 */
export class AppInput extends BaseComponent {
	static get properties() {
		return {
			label: { type: String },
			type: { type: String },
			name: { type: String },
			value: { type: String },
			placeholder: { type: String },
			required: { type: Boolean },
			errorMessage: { type: String },
			validationType: { type: String },
			disabled: { type: Boolean },
			mask: { type: String },
			prefix: { type: String },
			_touched: { type: Boolean, state: true },
		}
	}

	constructor() {
		super()
		this.label = ''
		this.type = INPUT.TYPE.TEXT
		this.name = ''
		this.value = ''
		this.placeholder = ''
		this.required = false
		this.errorMessage = ''
		this.validationType = ''
		this.disabled = false
		this.mask = ''
		this.prefix = ''
		this._touched = false
		this._maskCleanup = null
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
				}

				.input-container {
					position: relative;
				}

				label {
					display: block;
					font-size: var(--font-size-body2);
					margin-bottom: var(--spacing-xs);
					color: var(--text-primary);
					white-space: nowrap;
				}

				input {
					width: 100%;
					font-family: var(--font-family);
					font-size: var(--font-size-body2);
					padding: var(--spacing-s) var(--spacing-m);
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-small);
					background-color: var(--neutral-light);
					box-sizing: border-box;
					transition: all var(--animation-quick) ease;
				}

				input:focus {
					outline: none;
					border-color: var(--primary-color);
					box-shadow: 0 0 0 1px var(--primary-color);
				}

				input:disabled {
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

				.required-mark {
					color: var(--error-color);
					margin-left: 2px;
				}

				.input-error input {
					border-color: var(--error-color);
				}

				.input-error input:focus {
					box-shadow: 0 0 0 1px var(--error-color);
				}

				/* Prefix styles */
				.input-wrapper {
					display: flex;
					align-items: center;
					position: relative;
				}

				.prefix {
					display: flex;
					align-items: center;
					padding: var(--spacing-s) var(--spacing-s);
					font-size: var(--font-size-body2);
					color: var(--text-secondary);
					background-color: transparent;
					box-sizing: border-box;
					height: 100%;
					user-select: none;
					white-space: nowrap;
				}

				.with-prefix input {
					border-top-left-radius: 0;
					border-bottom-left-radius: 0;
				}
			`,
		]
	}

	render() {
		const hasError = this._touched && this.errorMessage
		const hasPrefix = this.prefix && this.prefix.length > 0

		// Determine valid input types
		const validTypes = Object.values(INPUT.TYPE)

		// Ensure the type is valid, default to text if not
		const inputType = validTypes.includes(this.type) ? this.type : INPUT.TYPE.TEXT

		return html`
			<div class="${INPUT.CLASS.CONTAINER} ${hasError ? INPUT.CLASS.ERROR : ''}">
				${this.label
					? html`
							<label for="input-${this.name}">
								${this.label} ${this.required ? html`<span class="${INPUT.CLASS.REQUIRED_MARK}">*</span>` : ''}
							</label>
						`
					: ''}

				<div class="${INPUT.CLASS.WRAPPER}">
					${hasPrefix ? html`<div class="${INPUT.CLASS.PREFIX}">${this.prefix}</div>` : ''}
					<input
						id="input-${this.name}"
						.type="${inputType}"
						name="${this.name}"
						.value="${this.value}"
						placeholder="${this.placeholder}"
						?required="${this.required}"
						?disabled="${this.disabled}"
						@input="${this._onInput}"
						@blur="${this._onBlur}"
						@change="${this._onChange}"
						class="${hasPrefix ? INPUT.CLASS.WITH_PREFIX : ''}"
					/>
				</div>

				<div class="${INPUT.CLASS.ERROR_MESSAGE}">${hasError ? this.errorMessage : ''}</div>
			</div>
		`
	}

	firstUpdated() {
		this._setupMask()
	}

	updated(changedProperties) {
		if (changedProperties.has('mask')) {
			this._setupMask()
		}
	}

	disconnectedCallback() {
		// Clean up mask when component is removed
		if (this._maskCleanup) {
			this._maskCleanup()
			this._maskCleanup = null
		}
		super.disconnectedCallback()
	}

	_setupMask() {
		// Clean up previous mask if exists
		if (this._maskCleanup) {
			this._maskCleanup()
			this._maskCleanup = null
		}

		// Apply mask if specified
		if (this.mask && this.shadowRoot) {
			const inputElement = this.shadowRoot.querySelector(`#input-${this.name}`)
			if (inputElement) {
				// Apply the mask using the pattern from the component
				this._maskCleanup = applyMask(inputElement, this.mask, {
					onChange: (newValue) => {
						if (this.value !== newValue) {
							this.value = newValue
							this.dispatch(INPUT.EVENT.INPUT, {
								name: this.name,
								value: this.value,
							})
						}
					},
				})
			}
		}
	}

	_onInput(e) {
		// Only handle input directly if no mask is applied
		if (!this.mask) {
			this.value = e.target.value
			this.dispatch(INPUT.EVENT.INPUT, {
				name: this.name,
				value: this.value,
			})
		}

		if (this._touched) {
			this._validate()
		}
	}

	_onChange() {
		this.dispatch(INPUT.EVENT.CHANGE, {
			name: this.name,
			value: this.value,
		})
	}

	_onBlur() {
		this._touched = true
		this._validate()
	}

	_validate() {
		let isValid = true
		let errorMessage = ''

		// For phone validation, check if it matches the mask pattern completely
		const isPhoneWithMask = this.validationType === INPUT.VALIDATION_TYPE.PHONE && this.mask && this.value
		// For Turkish phone numbers, require exactly 10 digits (123 456 78 90 format)
		const phoneDigits = isPhoneWithMask ? this.value.replace(REGEX.DIGITS_ONLY, '').length : 0
		const isMaskComplete = isPhoneWithMask && phoneDigits === 10

		// Check required validation (skip if it's a phone with complete mask)
		if (this.required && !isMaskComplete && validators.required(this.value) !== true) {
			isValid = false
			errorMessage = validators.required(this.value)
		}

		// Check specific validator if set
		if (isValid && this.validationType && validators[this.validationType]) {
			// For phone validation, if it has a mask and enough digits, consider it valid
			if (isPhoneWithMask) {
				if (isMaskComplete) {
					isValid = true
				} else {
					isValid = false
					errorMessage = validators.phone(this.value)
				}
			} else {
				const validationResult = validators[this.validationType](this.value)
				if (validationResult !== true) {
					isValid = false
					errorMessage = validationResult
				}
			}
		}

		// Update error message
		this.errorMessage = errorMessage

		// Dispatch validation event
		this.dispatch(INPUT.EVENT.VALIDATE, {
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

customElements.define('app-input', AppInput)
