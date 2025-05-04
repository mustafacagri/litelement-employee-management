import { html, css } from 'lit'
import { BaseComponent } from './base-component.js'

/**
 * Pagination component to navigate through multiple pages of data
 * @element app-pagination
 *
 * @prop {Number} totalItems - Total number of items
 * @prop {Number} pageSize - Number of items per page
 * @prop {Number} currentPage - Current active page (1-based)
 * @prop {Number} visiblePages - Number of page buttons to show
 *
 * @fires page-change - Fired when page is changed with new page number in detail
 */
export class AppPagination extends BaseComponent {
	static get properties() {
		return {
			totalItems: { type: Number },
			pageSize: { type: Number },
			currentPage: { type: Number },
			visiblePages: { type: Number },
		}
	}

	constructor() {
		super()
		this.totalItems = 0
		this.pageSize = 10
		this.currentPage = 1
		this.visiblePages = 5
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
				}

				.pagination {
					display: flex;
					justify-content: center;
					align-items: center;
					gap: var(--spacing-xs);
					flex-wrap: wrap;
				}

				button {
					min-width: 36px;
					height: 36px;
					border-radius: var(--border-radius-small);
					border: 1px solid var(--neutral-dark);
					background-color: var(--neutral-light);
					color: var(--text-primary);
					cursor: pointer;
					font-family: var(--font-family);
					font-size: var(--font-size-body2);
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all var(--animation-quick) ease;
				}

				button:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				button.active {
					background-color: var(--primary-color);
					border-color: var(--primary-color);
					color: var(--text-inverse);
				}

				button:not(:disabled):hover {
					background-color: var(--neutral-dark);
				}

				button.active:hover {
					background-color: var(--primary-dark);
				}

				.page-info {
					margin: 0.5rem var(--spacing-s);
					font-size: var(--font-size-caption);
					color: var(--text-secondary);
					text-align: center;
				}

				@media (max-width: 768px) {
					.page-number {
						display: none;
					}

					.page-number.active {
						display: flex;
					}

					.ellipsis {
						display: none;
					}
				}
			`,
		]
	}

	render() {
		const totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize))
		const pages = this._getVisiblePages(totalPages)

		return html`
			<div class="pagination">
				<button @click="${() => this._changePage(1)}" ?disabled="${this.currentPage === 1}" aria-label="First page">
					&laquo;
				</button>

				<button
					@click="${() => this._changePage(this.currentPage - 1)}"
					?disabled="${this.currentPage === 1}"
					aria-label="Previous page"
				>
					&lsaquo;
				</button>

				${pages.map((page) => {
					if (page === '...') {
						return html`<span class="ellipsis">...</span>`
					}

					return html`
						<button
							@click="${() => this._changePage(page)}"
							class="page-number ${page === this.currentPage ? 'active' : ''}"
							?disabled="${page === this.currentPage}"
						>
							${page}
						</button>
					`
				})}

				<button
					@click="${() => this._changePage(this.currentPage + 1)}"
					?disabled="${this.currentPage === totalPages}"
					aria-label="Next page"
				>
					&rsaquo;
				</button>

				<button
					@click="${() => this._changePage(totalPages)}"
					?disabled="${this.currentPage === totalPages}"
					aria-label="Last page"
				>
					&raquo;
				</button>
			</div>

			<div class="page-info">${this._getPageInfoText()}</div>
		`
	}

	/**
	 * Creates the array of page numbers to display
	 *
	 * @param {Number} totalPages - Total number of pages
	 * @returns {Array} Array of page numbers or ellipsis
	 * @private
	 */
	_getVisiblePages(totalPages) {
		const visiblePages = []
		const halfVisible = Math.floor(this.visiblePages / 2)

		let startPage = Math.max(1, this.currentPage - halfVisible)
		let endPage = Math.min(totalPages, startPage + this.visiblePages - 1)

		// Adjust start page if we're at the end
		if (endPage === totalPages) {
			startPage = Math.max(1, endPage - this.visiblePages + 1)
		}

		// Add first page and ellipsis if needed
		if (startPage > 1) {
			visiblePages.push(1)
			if (startPage > 2) {
				visiblePages.push('...')
			}
		}

		// Add visible page numbers
		for (let i = startPage; i <= endPage; i++) {
			visiblePages.push(i)
		}

		// Add ellipsis and last page if needed
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				visiblePages.push('...')
			}
			visiblePages.push(totalPages)
		}

		return visiblePages
	}

	/**
	 * Get the text for page info
	 *
	 * @returns {String} Page info text
	 * @private
	 */
	_getPageInfoText() {
		const start = (this.currentPage - 1) * this.pageSize + 1
		const end = Math.min(this.currentPage * this.pageSize, this.totalItems)

		return (
			this.t('employee.list.pagination', {
				start,
				end,
				total: this.totalItems,
			}) || `${start}-${end} of ${this.totalItems} items`
		)
	}

	/**
	 * Change to a new page
	 *
	 * @param {Number} page - Page to change to
	 * @private
	 */
	_changePage(page) {
		if (page === this.currentPage) return

		const totalPages = Math.ceil(this.totalItems / this.pageSize)
		if (page < 1 || page > totalPages) return

		this.currentPage = page

		this.dispatch('page-change', {
			page: this.currentPage,
			pageSize: this.pageSize,
		})
	}
}

customElements.define('app-pagination', AppPagination)
