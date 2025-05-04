import { html } from 'lit'
import { BaseComponent } from '@components'

// Import UI component definitions
import '@components/ui/index.all.js'

/**
 * Modal dialog for confirming employee deletion
 * @element employee-delete-modal
 *
 * @prop {Object} employee - Employee to delete
 *
 * @fires confirm - When deletion is confirmed
 * @fires cancel - When deletion is cancelled
 */
export class EmployeeDeleteModal extends BaseComponent {
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
			<app-modal title="${this.t('actions.delete')}" ?open="${this._open}" @modal-close="${this._handleCancel}">
				<p>${this.t('employee.form.deleteConfirm')}</p>
				<p>
					<strong>${employeeName}</strong>
				</p>

				<div slot="footer">
					<app-button variant="text" @click="${this._handleCancel}"> ${this.t('actions.cancel')} </app-button>

					<app-button variant="danger" @click="${this._handleConfirm}"> ${this.t('actions.confirm')} </app-button>
				</div>
			</app-modal>
		`
	}

	/**
	 * Open the deletion confirmation modal
	 *
	 * @param {Object} employee - Employee to delete
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
		this.dispatch('confirm', {
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
		this.dispatch('cancel')
		this.close()
	}
}

customElements.define('employee-delete-modal', EmployeeDeleteModal)
