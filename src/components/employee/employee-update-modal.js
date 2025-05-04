import { html } from 'lit'
import { BaseComponent } from '@components'
import { EVENTS } from '@constants'

// Import UI component definitions
import '@components/ui/index.all.js'

/**
 * Modal dialog for confirming employee updates
 * @element employee-update-modal
 *
 * @prop {Object} employee - Employee to update
 *
 * @fires confirm - When update is confirmed
 * @fires cancel - When update is cancelled
 */
export class EmployeeUpdateModal extends BaseComponent {
	static get properties() {
		return {
			employee: { type: Object },
			_open: { type: Boolean, state: true },
		}
	}

	constructor() {
		super()
		this.employee = null
		this._open = false
	}

	render() {
		if (!this.employee) return html``

		const employeeName = `${this.employee.firstName} ${this.employee.lastName}`

		return html`
			<app-modal title="${this.t('actions.confirm')}" ?open="${this._open}" @modal-close="${this._handleCancel}">
				<p>${this.t('employee.form.updateConfirm')}</p>
				<p>
					<strong>${employeeName}</strong>
				</p>

				<div slot="footer">
					<app-button variant="text" @click="${this._handleCancel}"> ${this.t('actions.cancel')} </app-button>

					<app-button variant="primary" @click="${this._handleConfirm}"> ${this.t('actions.confirm')} </app-button>
				</div>
			</app-modal>
		`
	}

	/**
	 * Open the update confirmation modal
	 *
	 * @param {Object} employee - Employee to update
	 */
	open(employee) {
		this.employee = employee
		this._open = true
	}

	/**
	 * Close the modal
	 */
	close() {
		this._open = false
	}

	/**
	 * Handle confirmation click
	 *
	 * @private
	 */
	_handleConfirm() {
		this.dispatch(EVENTS.CONFIRM, {
			employee: this.employee,
		})
		this.close()
	}

	/**
	 * Handle cancel click
	 *
	 * @private
	 */
	_handleCancel() {
		this.dispatch(EVENTS.CANCEL)
		this.close()
	}
}

customElements.define('employee-update-modal', EmployeeUpdateModal)
