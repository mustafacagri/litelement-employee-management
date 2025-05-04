import { html, css } from 'lit'
import { BaseComponent } from '@components'

/**
 * Toggle component for switching between table and card views
 * @element employee-view-toggle
 *
 * @prop {String} view - Current view (table or card)
 *
 * @fires view-change - When view is changed with new view in detail
 */
export class EmployeeViewToggle extends BaseComponent {
	static get properties() {
		return {
			view: { type: String, reflect: true },
		}
	}

	constructor() {
		super()
		this.view = 'table' // Default view
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: flex;
					align-items: center;
				}

				.toggle-container {
					display: flex;
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-small);
					overflow: hidden;
				}

				.toggle-button {
					background: var(--neutral-light);
					border: none;
					padding: var(--spacing-s);
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all var(--animation-quick) ease;
					color: var(--text-secondary);
					min-width: 40px;
				}

				.toggle-button svg {
					width: 20px;
					height: 20px;
					fill: currentColor;
				}

				.toggle-button.active {
					background: var(--primary-color);
					color: var(--text-inverse);
				}

				.toggle-button:hover:not(.active) {
					background: var(--neutral-dark);
				}

				.toggle-button:first-child {
					border-right: 1px solid var(--neutral-dark);
				}
			`,
		]
	}

	render() {
		return html`
			<div class="toggle-container">
				<button
					class="toggle-button ${this.view === 'table' ? 'active' : ''}"
					@click="${() => this._changeView('table')}"
					aria-label="${this.t('employee.list.view.table')}"
					title="${this.t('employee.list.view.table')}"
				>
					<svg viewBox="0 0 24 24">
						<path d="M3 5v14h18V5H3zm16 2v3H5V7h14zm0 5v3H5v-3h14zm0 5v2H5v-2h14z" />
					</svg>
				</button>

				<button
					class="toggle-button ${this.view === 'card' ? 'active' : ''}"
					@click="${() => this._changeView('card')}"
					aria-label="${this.t('employee.list.view.card')}"
					title="${this.t('employee.list.view.card')}"
				>
					<svg viewBox="0 0 24 24">
						<path
							d="M3 5v14h18V5H3zm5 12H5v-2h3v2zm0-4H5v-2h3v2zm0-4H5V7h3v2zm10 8H10v-2h8v2zm0-4H10v-2h8v2zm0-4H10V7h8v2z"
						/>
					</svg>
				</button>
			</div>
		`
	}

	/**
	 * Change the current view
	 *
	 * @param {String} newView - View to change to (table or card)
	 * @private
	 */
	_changeView(newView) {
		if (this.view === newView) return

		this.view = newView

		this.dispatch('view-change', { view: this.view })

		// Store the preference in localStorage
		try {
			localStorage.setItem('employee-view-preference', this.view)
		} catch (error) {
			console.error('Failed to save view preference:', error)
		}
	}

	/**
	 * Load saved view preference when component is connected
	 */
	connectedCallback() {
		super.connectedCallback()

		try {
			const savedView = localStorage.getItem('employee-view-preference')
			if (savedView && (savedView === 'table' || savedView === 'card')) {
				this.view = savedView
			}
		} catch (error) {
			console.error('Failed to load view preference:', error)
		}
	}
}

customElements.define('employee-view-toggle', EmployeeViewToggle)
