import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { TIMEOUT, EVENTS } from '@constants'

import '@components/ui/index.all.js'
/**
 * Search bar component for employee list
 * @element employee-search-bar
 *
 * @prop {String} value - Current search value
 * @prop {String} placeholder - Placeholder text for the search input
 *
 * @fires search - When search is triggered (on input or button click)
 */
export class EmployeeSearchBar extends BaseComponent {
	static get properties() {
		return {
			value: { type: String },
			placeholder: { type: String },
		}
	}

	constructor() {
		super()
		this.value = ''
		this.placeholder = ''
		this._debounceTimeout = null
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					margin-bottom: var(--spacing-m);
				}

				.search-container {
					display: flex;
					align-items: center;
					gap: var(--spacing-s);
					width: 100%;
				}

				.search-input {
					flex: 1;
					position: relative;
				}

				input {
					width: 100%;
					padding: var(--spacing-s) var(--spacing-m);
					padding-left: calc(var(--spacing-m) + 20px); /* Space for search icon */
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-small);
					font-family: var(--font-family);
					font-size: var(--font-size-body2);
					box-sizing: border-box;
					transition: border-color var(--animation-quick) ease;
				}

				input:focus {
					outline: none;
					border-color: var(--primary-color);
					box-shadow: 0 0 0 1px var(--primary-color);
				}

				.search-icon {
					position: absolute;
					left: var(--spacing-s);
					top: 50%;
					transform: translateY(-50%);
					width: 16px;
					height: 16px;
					color: var(--text-secondary);
				}

				.view-toggle {
					display: flex;
					gap: var(--spacing-xs);
				}

				.clear-button {
					position: absolute;
					right: var(--spacing-s);
					top: 50%;
					transform: translateY(-50%);
					background: none;
					border: none;
					cursor: pointer;
					color: var(--text-secondary);
					padding: var(--spacing-xs);
					display: flex;
					align-items: center;
					justify-content: center;
					visibility: hidden;
					opacity: 0;
					transition: opacity var(--animation-quick) ease;
				}

				input:not(:placeholder-shown) ~ .clear-button {
					visibility: visible;
					opacity: 1;
				}

				@media (max-width: 640px) {
					.search-container {
						flex-direction: column;
						align-items: stretch;
					}

					.view-toggle {
						justify-content: flex-end;
					}
				}
			`,
		]
	}

	render() {
		return html`
			<div class="search-container">
				<div class="search-input">
					<span class="search-icon">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
							/>
						</svg>
					</span>

					<input
						type="text"
						.value="${this.value}"
						placeholder="${this.placeholder || this.t('employee.list.search')}"
						@input="${this._handleInput}"
						@keydown="${this._handleKeyDown}"
					/>

					<button class="clear-button" @click="${this._handleClear}" aria-label="${this.t('actions.clear') || 'Clear'}">
						✕
					</button>
				</div>

				<div class="view-toggle">
					<slot></slot>
				</div>
			</div>
		`
	}

	/**
	 * Handle input changes with debounce
	 *
	 * @param {Event} e - Input event
	 * @private
	 */
	_handleInput(e) {
		this.value = e.target.value

		// Debounce search to avoid too many events while typing
		if (this._debounceTimeout) {
			window.clearTimeout(this._debounceTimeout)
		}

		this._debounceTimeout = window.setTimeout(() => {
			this._dispatchSearch()
		}, TIMEOUT.DEBOUNCE_SEARCH)
	}

	/**
	 * Handle keydown events (search on Enter)
	 *
	 * @param {KeyboardEvent} e - Keyboard event
	 * @private
	 */
	_handleKeyDown(e) {
		const KEY = {
			ENTER: 'Enter',
			ESCAPE: 'Escape',
		}

		if (e.key === KEY.ENTER) {
			if (this._debounceTimeout) {
				window.clearTimeout(this._debounceTimeout)
			}
			this._dispatchSearch()
		} else if (e.key === KEY.ESCAPE) {
			this._handleClear()
		}
	}

	/**
	 * Clear the search input
	 *
	 * @private
	 */
	_handleClear() {
		if (this.value) {
			this.value = ''
			this._dispatchSearch()
		}
	}

	/**
	 * Dispatch search event
	 *
	 * @private
	 */
	_dispatchSearch() {
		this.dispatch(EVENTS.SEARCH, {
			value: this.value,
		})
	}
}

customElements.define('employee-search-bar', EmployeeSearchBar)
