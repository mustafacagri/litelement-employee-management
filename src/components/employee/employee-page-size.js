import { html, css } from 'lit'
import { BaseComponent } from '@components'

/**
 * Component for selecting the number of items per page
 * @element employee-page-size
 *
 * @prop {Number} pageSize - Current page size
 * @prop {Array} options - Available page size options
 *
 * @fires page-size-change - When page size is changed with new size in detail
 */
export class EmployeePageSize extends BaseComponent {
	static get properties() {
		return {
			pageSize: { type: Number, reflect: true },
			options: { type: Array },
			_initializing: { type: Boolean, state: true },
		}
	}

	constructor() {
		super()
		this.pageSize = 25
		this.options = [5, 10, 25, 50]
		this._initializing = true
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: inline-flex;
					align-items: center;
				}

				label {
					margin-right: var(--spacing-s);
					color: var(--text-secondary);
					font-size: var(--font-size-body2);
				}

				select {
					padding: var(--spacing-xs) var(--spacing-s);
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-small);
					background-color: var(--neutral-light);
					font-family: var(--font-family);
					font-size: var(--font-size-body2);
					color: var(--text-primary);
					cursor: pointer;
					transition: border-color var(--animation-quick) ease;
					-webkit-appearance: none;
					-moz-appearance: none;
					appearance: none;
					background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23333'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E");
					background-repeat: no-repeat;
					background-position: right 8px center;
					background-size: 16px;
					padding-right: 28px;
				}

				select:focus {
					outline: none;
					border-color: var(--primary-color);
					box-shadow: 0 0 0 1px var(--primary-color);
				}
			`,
		]
	}

	firstUpdated() {
		// Explicitly set the select value after DOM is available
		const select = this.shadowRoot.querySelector('#page-size-select')
		if (select) {
			select.value = this.pageSize.toString()
		}
	}

	updated(changedProps) {
		if (changedProps.has('pageSize') && !this._initializing) {
			this.dispatch('page-size-change', {
				pageSize: this.pageSize,
			})

			// Store preference in localStorage
			try {
				localStorage.setItem('employee-page-size-preference', this.pageSize.toString())
			} catch (error) {
				console.error('Failed to save page size preference:', error)
			}
		}
	}

	render() {
		return html`
			<label for="page-size-select">${this.t('employee.list.itemsPerPage') || 'Items per page'}: </label>
			<select id="page-size-select" .value="${this.pageSize.toString()}" @change="${this._handleChange}">
				${this.options.map(
					(size) => html` <option value="${size}" ?selected="${size === this.pageSize}">${size}</option> `
				)}
			</select>
		`
	}

	/**
	 * Handle page size change
	 *
	 * @param {Event} e - Change event
	 * @private
	 */
	_handleChange(e) {
		const newSize = parseInt(e.target.value, 10)
		if (newSize !== this.pageSize) {
			this.pageSize = newSize
		}
	}

	/**
	 * Load saved page size preference when component is connected
	 */
	connectedCallback() {
		super.connectedCallback()

		try {
			const savedSize = localStorage.getItem('employee-page-size-preference')
			if (savedSize) {
				const size = parseInt(savedSize, 10)
				if (!isNaN(size) && this.options.includes(size)) {
					this.pageSize = size
				}
			}
		} catch (error) {
			console.error('Failed to load page size preference:', error)
		}

		// After loading preference, mark initialization as complete
		this._initializing = false
	}
}

customElements.define('employee-page-size', EmployeePageSize)
