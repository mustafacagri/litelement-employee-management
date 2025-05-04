import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { formatters } from '@utils'

import '@components/ui/index.all.js'
/**
 * Table view for displaying employee records
 * @element employee-table-view
 *
 * @prop {Array} employees - Array of employee objects to display
 *
 * @fires edit-employee - When edit button is clicked for an employee
 * @fires delete-employee - When delete button is clicked for an employee
 */
export class EmployeeTableView extends BaseComponent {
	static get properties() {
		return {
			employees: {
				type: Array,
				hasChanged: (newVal, oldVal) => {
					// Only trigger update if the references are different and the arrays have different lengths
					// or the employees IDs have changed
					if (newVal === oldVal) return false
					if (!newVal || !oldVal) return true
					if (newVal.length !== oldVal.length) return true

					// Compare IDs of the first and last elements for a quick check
					// This is a performance optimization to avoid deep comparison of the whole array
					if (newVal.length > 0 && oldVal.length > 0) {
						if (newVal[0].id !== oldVal[0].id || newVal[newVal.length - 1].id !== oldVal[oldVal.length - 1].id) {
							return true
						}
					}

					return false
				},
			},
			_employeesCache: { state: true },
		}
	}

	constructor() {
		super()
		this.employees = []
		this._employeesCache = new Map()
		this._renderCount = 0
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					overflow-x: auto;
					border-radius: var(--border-radius-small);
					box-shadow: var(--shadow-light);
				}

				.table-container {
					position: relative;
					overflow-x: auto;
					-webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
				}

				.table-scroll-indicator {
					display: none;
					position: absolute;
					right: 10px;
					top: 50%;
					transform: translateY(-50%);
					background-color: rgba(0, 0, 0, 0.5);
					color: white;
					padding: 5px 8px;
					border-radius: 4px;
					font-size: var(--font-size-caption);
					pointer-events: none;
					animation: fadeInOut 2s infinite;
				}

				@keyframes fadeInOut {
					0%,
					100% {
						opacity: 0.3;
					}
					50% {
						opacity: 0.8;
					}
				}

				@media (max-width: 768px) {
					.table-scroll-indicator {
						display: block;
					}
				}

				table {
					width: 100%;
					border-collapse: collapse;
					margin-bottom: var(--spacing-m);
					min-width: 760px; /* Prevents columns from getting too narrow */
				}

				th,
				td {
					text-align: left;
					padding: var(--spacing-s) var(--spacing-m);
					border-bottom: 1px solid var(--neutral-dark);
				}

				th {
					background-color: var(--neutral-dark);
					font-weight: var(--font-weight-medium);
					color: var(--text-primary);
					white-space: nowrap;
					position: sticky;
					top: 0;
					z-index: 1;
				}

				tr:nth-child(even) {
					background-color: var(--neutral-light);
				}

				tr:nth-child(odd) {
					background-color: var(--neutral-color);
				}

				tr:hover {
					background-color: var(--neutral-dark);
				}

				tr:focus-within {
					outline: 2px solid var(--primary-color);
					outline-offset: -2px;
				}

				.empty-message {
					padding: var(--spacing-l);
					text-align: center;
					color: var(--text-secondary);
					font-style: italic;
				}

				.actions {
					white-space: nowrap;
					display: flex;
					gap: var(--spacing-xs);
				}

				.actions app-button {
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.actions img {
					display: block;
					vertical-align: middle;
				}

				/* Make icons white when on dark button backgrounds */
				.actions app-button[variant='primary'] img,
				.actions app-button[variant='danger'] img {
					filter: brightness(0) invert(1);
				}

				/* Change icon color to white on hover */
				.actions app-button:hover img {
					filter: brightness(0) invert(1) !important;
				}

				.employee-name {
					white-space: nowrap;
					font-weight: var(--font-weight-medium);
				}

				/* Show email as truncated on smaller screens */
				@media (max-width: 1024px) {
					.mobile-hidden {
						display: none;
					}

					.email-cell {
						max-width: 150px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}

				@media (max-width: 768px) {
					th,
					td {
						padding: var(--spacing-xs) var(--spacing-s);
					}

					.email-cell {
						max-width: 120px;
					}

					.actions {
						flex-direction: column;
						gap: var(--spacing-xs);
					}
				}

				/* Accessibility improvements */
				@media (prefers-reduced-motion: reduce) {
					tr:hover {
						background-color: var(--neutral-dark);
						transition: none;
					}
				}
			`,
		]
	}

	render() {
		if (!this.employees.length) {
			return html`<div class="empty-message">${this.t('employee.list.empty')}</div>`
		}

		return html`
			<div class="table-container" role="region" aria-labelledby="employee-table-caption" tabindex="0">
				<div class="table-scroll-indicator" aria-hidden="true">${this.t('ui.swipe')}</div>
				<table>
					<caption id="employee-table-caption" class="hidden">
						${this.t('employee.list.caption')}
					</caption>
					<thead>
						<tr>
							<th scope="col">${this.t('employee.fields.firstName')}</th>
							<th scope="col">${this.t('employee.fields.lastName')}</th>
							<th class="mobile-hidden" scope="col">${this.t('employee.fields.dateOfEmployment')}</th>
							<th class="mobile-hidden" scope="col">${this.t('employee.fields.dateOfBirth')}</th>
							<th scope="col">${this.t('employee.fields.phone')}</th>
							<th scope="col">${this.t('employee.fields.email')}</th>
							<th scope="col">${this.t('employee.fields.department')}</th>
							<th scope="col">${this.t('employee.fields.position')}</th>
							<th scope="col">${this.t('actions.label')}</th>
						</tr>
					</thead>
					<tbody>
						${this.employees.map((employee) => this._renderEmployeeRow(employee))}
					</tbody>
				</table>
			</div>
		`
	}

	/**
	 * Renders a table row for an employee
	 *
	 * @param {Object} employee - Employee data
	 * @returns {TemplateResult} Table row template
	 * @private
	 */
	_renderEmployeeRow(employee) {
		// Check if this employee row is already cached
		if (this._employeesCache.has(employee.id)) {
			return this._employeesCache.get(employee.id)
		}

		const fullName = `${employee.firstName} ${employee.lastName}`

		// Create the template for this employee
		const rowTemplate = html`
			<tr>
				<td class="employee-name">${employee.firstName}</td>
				<td>${employee.lastName}</td>
				<td class="mobile-hidden">${formatters.date(employee.dateOfEmployment)}</td>
				<td class="mobile-hidden">${formatters.date(employee.dateOfBirth)}</td>
				<td>${employee.phoneCode} ${employee.phoneNumber}</td>
				<td class="email-cell" title="${employee.email}">${employee.email}</td>
				<td>${this.t(`employee.departments.${employee.department}`)}</td>
				<td>${this.t(`employee.positions.${employee.position}`)}</td>
				<td class="actions">
					<app-button
						variant="primary"
						size="small"
						@click="${() => this._handleEdit(employee)}"
						aria-label="${this.t('actions.editWithName', { name: fullName })}"
					>
						<img src="/icons/edit.svg" alt="${this.t('actions.edit')}" width="18" height="18" />
					</app-button>

					<app-button
						variant="danger"
						size="small"
						@click="${() => this._handleDelete(employee)}"
						aria-label="${this.t('actions.deleteWithName', { name: fullName })}"
					>
						<img src="/icons/delete.svg" alt="${this.t('actions.delete')}" width="18" height="18" />
					</app-button>
				</td>
			</tr>
		`

		// Cache the row template for future renders
		this._employeesCache.set(employee.id, rowTemplate)
		return rowTemplate
	}

	/**
	 * Handle edit button click
	 *
	 * @param {Object} employee - Employee to edit
	 * @private
	 */
	_handleEdit(employee) {
		this.dispatch('edit-employee', { employee })
	}

	/**
	 * Handle delete button click
	 *
	 * @param {Object} employee - Employee to delete
	 * @private
	 */
	_handleDelete(employee) {
		this.dispatch('delete-employee', { employee })
	}

	/**
	 * Lifecycle callback when the component's properties change
	 * Clear cache when employees array changes
	 */
	updated(changedProperties) {
		super.updated(changedProperties)

		if (changedProperties.has('employees')) {
			// Clear the entire cache when employees array changes
			// This ensures we don't keep stale rows in memory
			this._employeesCache.clear()
		}

		// For development: log render count to monitor performance
		this._renderCount++
	}
}

customElements.define('employee-table-view', EmployeeTableView)
