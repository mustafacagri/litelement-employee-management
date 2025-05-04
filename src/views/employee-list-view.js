import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { EmployeeService, StorageService, NotificationService } from '@services'
import { Router } from '@vaadin/router'
import { addSampleEmployees, hasSampleData } from '@utils'

// Import necessary component definitions
import '@components/employee/index.all.js'
import '@components/common/index.all.js'
import '@components/ui/index.all.js'

/**
 * Employee list view component
 * @element employee-list-view
 */
export class EmployeeListView extends BaseComponent {
	static get properties() {
		return {
			_employees: { type: Array, state: true },
			_filteredEmployees: { type: Array, state: true },
			_displayedEmployees: { type: Array, state: true },
			_storageService: { type: Object, state: true },
			_employeeService: { type: Object, state: true },
			_currentView: { type: String, state: true },
			_searchTerm: { type: String, state: true },
			_isLoading: { type: Boolean, state: true },
			_isDeleting: { type: Boolean, state: true },
			_currentPage: { type: Number, state: true },
			_pageSize: { type: Number, state: true },
		}
	}

	constructor() {
		super()
		this._employees = []
		this._filteredEmployees = []
		this._displayedEmployees = []
		this._currentView = 'table'
		this._searchTerm = ''
		this._isLoading = true
		this._isDeleting = false
		this._currentPage = 1
		this._pageSize = 10 // Default page size

		// Initialize services
		this._storageService = new StorageService()
		this._employeeService = new EmployeeService(this._storageService)

		// Bind event handlers
		this._handleDeleteEmployeeEvent = this._handleDeleteEmployeeEvent.bind(this)
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					padding: var(--spacing-m);
				}

				.header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: var(--spacing-m);
					flex-wrap: wrap;
					gap: var(--spacing-m);
				}

				.title {
					margin: 0;
					font-size: var(--font-size-h2);
					color: var(--text-primary);
				}

				.actions {
					display: flex;
					align-items: center;
					gap: var(--spacing-s);
				}

				.search-bar-container {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: var(--spacing-m);
				}

				.pagination-container {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-top: var(--spacing-m);
					flex-wrap: wrap;
					gap: var(--spacing-m);
				}

				.loading {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: 200px;
					color: var(--text-secondary);
				}

				/* Responsive adjustments */
				@media (max-width: 768px) {
					.header {
						flex-direction: column;
						align-items: flex-start;
					}

					.pagination-container {
						flex-direction: column;
						align-items: center;
					}
				}
			`,
		]
	}

	render() {
		if (this._isLoading) {
			return html` <div class="loading">${this.t('app.loading')}</div> `
		}

		const hasEmployees = this._employees.length > 0
		const hasFilteredEmployees = this._filteredEmployees.length > 0
		const isSearching = this._searchTerm !== ''

		return html`
			<div class="page">
				<div class="header">
					<h2 class="title">${this.t('employee.list.title')}</h2>
					<div class="actions">
						<app-button variant="primary" @click="${this._navigateToAddEmployee}">
							${this.t('nav.addEmployee')}
						</app-button>
					</div>
				</div>

				${hasEmployees
					? html`
							<employee-search-bar .value="${this._searchTerm}" @search="${this._handleSearch}">
								<employee-view-toggle
									.view="${this._currentView}"
									@view-change="${this._handleViewChange}"
								></employee-view-toggle>
							</employee-search-bar>

							${!hasFilteredEmployees && isSearching
								? html`
										<employee-empty-state
											.isSearching="${true}"
											.searchTerm="${this._searchTerm}"
											@clear-search="${this._handleClearSearch}"
											@add-employee="${this._navigateToAddEmployee}"
										></employee-empty-state>
									`
								: html`
										${this._currentView === 'table'
											? html`
													<employee-table-view
														.employees="${this._displayedEmployees}"
														@edit-employee="${this._handleEditEmployee}"
														@delete-employee="${this._handleDeleteEmployee}"
													></employee-table-view>
												`
											: html`
													<employee-card-view
														.employees="${this._displayedEmployees}"
														@edit-employee="${this._handleEditEmployee}"
														@delete-employee="${this._handleDeleteEmployee}"
													></employee-card-view>
												`}
										${hasFilteredEmployees
											? html`
													<div class="pagination-container">
														<employee-page-size
															.pageSize="${this._pageSize}"
															@page-size-change="${this._handlePageSizeChange}"
														></employee-page-size>

														<app-pagination
															.totalItems="${this._filteredEmployees.length}"
															.pageSize="${this._pageSize}"
															.currentPage="${this._currentPage}"
															@page-change="${this._handlePageChange}"
														></app-pagination>
													</div>
												`
											: ''}
									`}
						`
					: html` <employee-empty-state @add-employee="${this._navigateToAddEmployee}"></employee-empty-state> `}

				<!-- Delete confirmation modal -->
				<employee-delete-modal
					@confirm="${this._confirmDelete}"
					@cancel="${this._cancelDelete}"
				></employee-delete-modal>
			</div>
		`
	}

	/**
	 * Load employee data when component is connected to DOM
	 */
	connectedCallback() {
		super.connectedCallback()
		this._loadPreferences()
		this._loadEmployees()

		// Listen for global employee events
		document.addEventListener('employee-deleted', this._handleDeleteEmployeeEvent)
		// Listen for employee-service-error events
		document.addEventListener('employee-service-error', this._handleServiceError.bind(this))
	}

	/**
	 * Clean up event listeners when component is disconnected
	 */
	disconnectedCallback() {
		document.removeEventListener('employee-deleted', this._handleDeleteEmployeeEvent)
		document.removeEventListener('employee-service-error', this._handleServiceError.bind(this))
		super.disconnectedCallback()
	}

	/**
	 * Load user preferences from localStorage
	 *
	 * @private
	 */
	_loadPreferences() {
		try {
			// Load view preference
			const savedView = localStorage.getItem('employee-view-preference')
			if (savedView && ['table', 'card'].includes(savedView)) this._currentView = savedView

			// Load page size preference
			const savedPageSize = localStorage.getItem('employee-page-size-preference')
			if (savedPageSize) {
				const size = parseInt(savedPageSize, 10)
				if (!isNaN(size) && [5, 10, 25, 50].includes(size)) this._pageSize = size
			}
		} catch (error) {
			console.error('Failed to load preferences:', error)
		}
	}

	/**
	 * Load employees from service
	 *
	 * @private
	 */
	_loadEmployees() {
		this._isLoading = true

		try {
			// Check if we have sample data, if not add some for demo purposes
			if (!hasSampleData()) {
				addSampleEmployees()
				window.location.reload()
			}

			this._employees = this._employeeService.getAll()
			this._applyFilters()
		} catch (error) {
			console.error('Error loading employees:', error)
			this._employees = []
			this._filteredEmployees = []
			this._displayedEmployees = []
		} finally {
			this._isLoading = false
		}
	}

	/**
	 * Apply filters and pagination to employees
	 *
	 * @private
	 */
	_applyFilters() {
		// Apply search filter if search term exists
		if (this._searchTerm) {
			this._filteredEmployees = this._employeeService.search(this._searchTerm)
		} else {
			this._filteredEmployees = [...this._employees]
		}

		// Apply pagination
		this._applyPagination()
	}

	/**
	 * Apply pagination to filtered employees
	 *
	 * @private
	 */
	_applyPagination() {
		const startIndex = (this._currentPage - 1) * this._pageSize
		const endIndex = startIndex + this._pageSize

		this._displayedEmployees = this._filteredEmployees.slice(startIndex, endIndex)

		// If current page is now empty but there are results, go to previous page
		if (this._displayedEmployees.length === 0 && this._filteredEmployees.length > 0) {
			this._currentPage = Math.max(1, this._currentPage - 1)
			this._applyPagination()
		}
	}

	/**
	 * Handle search input
	 *
	 * @param {CustomEvent} e - Search event
	 * @private
	 */
	_handleSearch(e) {
		this._searchTerm = e.detail.value
		this._currentPage = 1 // Reset to first page on new search
		this._applyFilters()
	}

	/**
	 * Clear search and show all employees
	 *
	 * @private
	 */
	_handleClearSearch() {
		this._searchTerm = ''
		this._currentPage = 1
		this._applyFilters()
	}

	/**
	 * Handle view change (table/card)
	 *
	 * @param {CustomEvent} e - View change event
	 * @private
	 */
	_handleViewChange(e) {
		this._currentView = e.detail.view
	}

	/**
	 * Handle page change
	 *
	 * @param {CustomEvent} e - Page change event
	 * @private
	 */
	_handlePageChange(e) {
		this._currentPage = e.detail.page
		this._applyPagination()
	}

	/**
	 * Handle page size change
	 *
	 * @param {CustomEvent} e - Page size change event
	 * @private
	 */
	_handlePageSizeChange(e) {
		this._pageSize = e.detail.pageSize
		// Reset to first page to avoid confusion
		this._currentPage = 1
		this._applyPagination()
	}

	/**
	 * Handle edit employee action
	 *
	 * @param {CustomEvent} e - Edit event with employee data
	 * @private
	 */
	_handleEditEmployee(e) {
		const employeeId = e.detail.employee.id
		Router.go(`/employee/${employeeId}/edit`)
	}

	/**
	 * Handle delete employee action
	 *
	 * @param {CustomEvent} e - Delete event with employee data
	 * @private
	 */
	_handleDeleteEmployee(e) {
		// Prevent multiple clicks
		if (this._isDeleting) {
			return
		}

		const employee = e.detail.employee

		// Get the delete modal and open it
		const deleteModal = this.shadowRoot.querySelector('employee-delete-modal')
		deleteModal.open(employee)
	}

	/**
	 * Confirm and execute employee deletion
	 *
	 * @param {CustomEvent} e - Confirm event with employee data
	 * @private
	 */
	_confirmDelete(e) {
		// Prevent multiple delete operations
		if (this._isDeleting) {
			return
		}

		this._isDeleting = true
		const employee = e.detail.employee

		try {
			// Set loading state while deleting
			this._isLoading = true

			const deleted = this._employeeService.delete(employee.id)

			if (deleted) {
				// Show success notification using the notification service
				this._showNotification('deleteSuccess')
			}

			// Always refresh the list, as the employee service handles error notifications
			this._loadEmployees()
		} catch (error) {
			// This should rarely happen now since the service handles errors
			console.error('Unexpected error deleting employee:', error)
			this._showNotification('error')
		} finally {
			this._isLoading = false
			this._isDeleting = false
		}
	}

	/**
	 * Handle cancel delete action
	 *
	 * @private
	 */
	_cancelDelete() {
		// User cancelled the delete operation, no action needed
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

	/**
	 * Navigate to add employee page
	 *
	 * @private
	 */
	_navigateToAddEmployee() {
		Router.go('/employee/new')
	}

	/**
	 * Handle employee deleted event
	 *
	 * @private
	 */
	_handleDeleteEmployeeEvent() {
		// Refresh the employee list
		this._loadEmployees()
	}

	/**
	 * Handle service error events
	 *
	 * @private
	 */
	_handleServiceError() {
		// Reset loading and deleting flags on error
		this._isLoading = false
		this._isDeleting = false
	}
}

customElements.define('employee-list-view', EmployeeListView)
