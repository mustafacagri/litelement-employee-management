import { html, css } from 'lit'
import { BaseComponent } from '@components'

import '@components/ui/index.all.js'
/**
 * Component displayed when no employees are found
 * @element employee-empty-state
 *
 * @prop {Boolean} isSearching - Whether the empty state is due to a search with no results
 * @prop {String} searchTerm - The search term that yielded no results
 *
 * @fires add-employee - When add employee button is clicked
 * @fires clear-search - When clear search button is clicked
 */
export class EmployeeEmptyState extends BaseComponent {
	static get properties() {
		return {
			isSearching: { type: Boolean },
			searchTerm: { type: String },
		}
	}

	constructor() {
		super()
		this.isSearching = false
		this.searchTerm = ''
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					padding: var(--spacing-xl) var(--spacing-m);
					text-align: center;
					background-color: var(--neutral-color);
					border-radius: var(--border-radius-medium);
				}

				.empty-icon {
					width: 80px;
					height: 80px;
					margin-bottom: var(--spacing-m);
					fill: var(--text-tertiary);
				}

				h3 {
					margin: 0 0 var(--spacing-s) 0;
					color: var(--text-primary);
					font-size: var(--font-size-h3);
				}

				p {
					margin: 0 0 var(--spacing-l) 0;
					color: var(--text-secondary);
				}

				.actions {
					display: flex;
					justify-content: center;
					gap: var(--spacing-m);
					flex-wrap: wrap;
				}

				.search-term {
					font-weight: var(--font-weight-bold);
				}
			`,
		]
	}

	render() {
		if (this.isSearching) {
			return this._renderSearchEmpty()
		}

		return this._renderTrulyEmpty()
	}

	/**
	 * Render empty state when no employees exist
	 *
	 * @returns {TemplateResult} Empty state template
	 * @private
	 */
	_renderTrulyEmpty() {
		return html`
			<div>
				<svg class="empty-icon" viewBox="0 0 24 24">
					<path
						d="M16 9v4h1v2h-5v-2h1V9h-1V7h4v2h-1zm-6.5 6c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm3-7c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm-3-3c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm3 10c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm0-8c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm-3 4c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
					/>
				</svg>

				<h3>${this.t('employee.list.emptyStateTitle') || 'No Employees Yet'}</h3>
				<p>${this.t('employee.list.emptyStateMessage') || 'Add your first employee to get started.'}</p>

				<div class="actions">
					<app-button variant="primary" @click="${this._handleAddEmployee}"> ${this.t('nav.addEmployee')} </app-button>
				</div>
			</div>
		`
	}

	/**
	 * Render empty state when search has no results
	 *
	 * @returns {TemplateResult} Search empty state template
	 * @private
	 */
	_renderSearchEmpty() {
		return html`
			<div>
				<svg class="empty-icon" viewBox="0 0 24 24">
					<path
						d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
					/>
				</svg>

				<h3>${this.t('employee.list.noSearchResults') || 'No Results Found'}</h3>
				<p>
					${this.t('employee.list.noSearchResultsFor') || 'No results found for'}
					<span class="search-term">"${this.searchTerm}"</span>
				</p>

				<div class="actions">
					<app-button variant="secondary" @click="${this._handleClearSearch}">
						${this.t('employee.list.clearSearch') || 'Clear Search'}
					</app-button>

					<app-button variant="primary" @click="${this._handleAddEmployee}"> ${this.t('nav.addEmployee')} </app-button>
				</div>
			</div>
		`
	}

	/**
	 * Handle add employee button click
	 *
	 * @private
	 */
	_handleAddEmployee() {
		this.dispatch('add-employee')
	}

	/**
	 * Handle clear search button click
	 *
	 * @private
	 */
	_handleClearSearch() {
		this.dispatch('clear-search')
	}
}

customElements.define('employee-empty-state', EmployeeEmptyState)
