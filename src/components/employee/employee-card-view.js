import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { formatters, nextAnimationFrame } from '@utils'
import { ANIMATION } from '@constants'
import '@components/ui/index.all.js'

/**
 * Card view for displaying employee records
 * @element employee-card-view
 *
 * @prop {Array} employees - Array of employee objects to display
 *
 * @fires edit-employee - When edit button is clicked for an employee
 * @fires delete-employee - When delete button is clicked for an employee
 */
export class EmployeeCardView extends BaseComponent {
	static get properties() {
		return {
			employees: {
				type: Array,
				hasChanged: (newVal, oldVal) => {
					// Only trigger update if the references are different and the arrays have different lengths
					// or the employee IDs have changed
					if (newVal === oldVal) return false
					if (!newVal || !oldVal) return true
					if (newVal.length !== oldVal.length) return true

					// Compare IDs of a sample of elements for a quick check
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

		// Bind methods that are used in event listeners to avoid recreating them
		this._handleEdit = this._handleEdit.bind(this)
		this._handleDelete = this._handleDelete.bind(this)
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
				}

				.cards-container {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
					gap: var(--spacing-m);
				}

				.employee-card {
					height: 100%;
					transition: all var(--animation-standard) ease;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
					opacity: 0;
					transform: translateY(20px);
					animation: card-enter ${ANIMATION.CARD_ENTER}ms ease forwards;
				}

				.employee-card:hover {
					transform: translateY(-4px);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
				}

				@keyframes card-enter {
					0% {
						opacity: 0;
						transform: translateY(20px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}

				/* Staggered animation for cards */
				.cards-container app-card:nth-child(1) {
					animation-delay: 0.05s;
				}
				.cards-container app-card:nth-child(2) {
					animation-delay: 0.1s;
				}
				.cards-container app-card:nth-child(3) {
					animation-delay: 0.15s;
				}
				.cards-container app-card:nth-child(4) {
					animation-delay: 0.2s;
				}
				.cards-container app-card:nth-child(5) {
					animation-delay: 0.25s;
				}
				.cards-container app-card:nth-child(6) {
					animation-delay: 0.3s;
				}
				.cards-container app-card:nth-child(n + 7) {
					animation-delay: 0.35s;
				}

				.empty-message {
					padding: var(--spacing-l);
					text-align: center;
					color: var(--text-secondary);
					font-style: italic;
					animation: fade-in ${ANIMATION.FADE_IN}ms ease-in;
				}

				.card-content {
					display: flex;
					flex-direction: column;
					gap: var(--spacing-s);
					height: 100%;
				}

				.employee-name {
					font-size: var(--font-size-h4);
					font-weight: var(--font-weight-medium);
					margin: 0 0 var(--spacing-s) 0;
				}

				.employee-info {
					display: flex;
					flex-direction: column;
					gap: var(--spacing-xs);
					margin-bottom: var(--spacing-s);
					flex: 1;
				}

				.info-row {
					display: flex;
					align-items: baseline;
					transition: background-color 0.2s ease;
					padding: 4px;
					border-radius: var(--border-radius-small);
				}

				.info-row:hover {
					background-color: rgba(0, 0, 0, 0.02);
				}

				.info-label {
					font-weight: var(--font-weight-medium);
					color: var(--text-secondary);
					min-width: 100px;
					margin-right: var(--spacing-s);
				}

				.info-value {
					color: var(--text-primary);
					flex: 1;
					word-break: break-word; /* Prevents long emails from overflowing */
				}

				.info-value a {
					text-decoration: none;
					color: var(--primary-color);
					transition:
						color 0.2s ease,
						border-bottom 0.2s ease;
					border-bottom: 1px solid transparent;
				}

				.info-value a:hover {
					color: var(--primary-dark);
					border-bottom: 1px solid var(--primary-dark);
				}

				.card-actions {
					display: flex;
					justify-content: flex-end;
					gap: var(--spacing-s);
					margin-top: auto; /* Push actions to bottom */
					padding-top: var(--spacing-s);
					border-top: 1px solid rgba(0, 0, 0, 0.05);
				}

				.card-actions app-button {
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.card-actions img {
					display: block;
				}

				/* Make icons white when on dark button backgrounds */
				.card-actions app-button[variant='primary'] img,
				.card-actions app-button[variant='danger'] img {
					filter: brightness(0) invert(1);
				}

				/* Make the edit icon orange in card view */
				.card-actions app-button[variant='secondary'] img {
					filter: invert(63%) sepia(45%) saturate(4588%) hue-rotate(1deg) brightness(102%) contrast(107%);
				}

				/* Change icon color to white on hover */
				.card-actions app-button:hover img {
					filter: brightness(0) invert(1) !important;
				}

				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}

				/* Medium sized screens */
				@media (max-width: 768px) {
					.cards-container {
						grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
						gap: var(--spacing-s);
					}

					.info-label {
						min-width: 80px;
					}
				}

				/* For small mobile screens */
				@media (max-width: 480px) {
					.cards-container {
						grid-template-columns: 1fr;
					}

					.card-actions {
						flex-direction: column;
						width: 100%;
					}

					.card-actions app-button {
						width: 100%;
					}
				}

				/* Accessibility improvements */
				@media (prefers-reduced-motion: reduce) {
					.employee-card {
						transition: none;
						animation: fade-in 0.3s ease forwards;
					}
					.employee-card:hover {
						transform: none;
						box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
					}
					.cards-container app-card:nth-child(n) {
						animation-delay: 0s;
					}
				}

				/* Focus styles */
				:host(:focus-within) .employee-card {
					outline: 2px solid var(--primary-color);
					outline-offset: 2px;
				}
			`,
		]
	}

	render() {
		if (!this.employees.length) {
			return html`<div class="empty-message">${this.t('employee.list.empty')}</div>`
		}

		return html`
			<div class="cards-container">${this.employees.map((employee) => this._renderEmployeeCard(employee))}</div>
		`
	}

	/**
	 * Renders a card for an employee
	 *
	 * @param {Object} employee - Employee data
	 * @returns {TemplateResult} Card template
	 * @private
	 */
	_renderEmployeeCard(employee) {
		// Check if this employee card is already cached
		if (this._employeesCache.has(employee.id)) {
			return this._employeesCache.get(employee.id)
		}

		const fullName = `${employee.firstName} ${employee.lastName}`

		// Create the template for this employee
		const cardTemplate = html`
			<app-card title="${fullName}" class="employee-card">
				<div class="card-content">
					<div class="employee-info">
						<div class="info-row">
							<span class="info-label" id="department-${employee.id}">${this.t('employee.fields.department')}:</span>
							<span class="info-value" aria-labelledby="department-${employee.id}"
								>${this.t(`employee.departments.${employee.department}`)}</span
							>
						</div>

						<div class="info-row">
							<span class="info-label" id="position-${employee.id}">${this.t('employee.fields.position')}:</span>
							<span class="info-value" aria-labelledby="position-${employee.id}"
								>${this.t(`employee.positions.${employee.position}`)}</span
							>
						</div>

						<div class="info-row">
							<span class="info-label" id="email-${employee.id}">${this.t('employee.fields.email')}:</span>
							<span class="info-value" aria-labelledby="email-${employee.id}">
								<a href="mailto:${employee.email}" aria-label="${this.t('actions.emailEmployee', { name: fullName })}"
									>${employee.email}</a
								>
							</span>
						</div>

						<div class="info-row">
							<span class="info-label" id="phone-${employee.id}">${this.t('employee.fields.phoneNumber')}:</span>
							<span class="info-value" aria-labelledby="phone-${employee.id}">
								${employee.phoneNumber
									? html`
											<a
												href="tel:${employee.phoneCode}${employee.phoneNumber}"
												aria-label="${this.t('actions.callEmployee', { name: fullName })}"
											>
												${employee.phoneCode} ${employee.phoneNumber}
											</a>
										`
									: '-'}
							</span>
						</div>

						<div class="info-row">
							<span class="info-label" id="employment-${employee.id}"
								>${this.t('employee.fields.dateOfEmployment')}:</span
							>
							<span class="info-value" aria-labelledby="employment-${employee.id}"
								>${formatters.date(employee.dateOfEmployment)}</span
							>
						</div>
					</div>

					<div class="card-actions">
						<app-button
							variant="secondary"
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
					</div>
				</div>
			</app-card>
		`

		// Cache the card template for future renders
		this._employeesCache.set(employee.id, cardTemplate)
		return cardTemplate
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
			// This ensures we don't keep stale cards in memory
			this._employeesCache.clear()
		}

		// Increment render count for internal tracking
		this._renderCount++
	}

	/**
	 * Implement a performUpdate method to potentially defer updates
	 * This can help batch multiple rapid updates together
	 */
	async performUpdate() {
		// Use requestAnimationFrame to batch updates that happen in the same frame
		await nextAnimationFrame()
		super.performUpdate()
	}
}

customElements.define('employee-card-view', EmployeeCardView)
