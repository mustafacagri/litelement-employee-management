import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { MODAL } from '@constants'

/**
 * Modal dialog component
 * @element app-modal
 *
 * @prop {String} title - Modal title
 * @prop {Boolean} open - Whether the modal is open
 * @prop {Boolean} closable - Whether the modal can be closed by clicking X, pressing ESC, or clicking backdrop
 * @prop {String} size - Modal size (small, medium, large)
 *
 * @fires modal-close - Fired when modal is closed
 * @fires modal-open - Fired when modal is opened
 */
export class AppModal extends BaseComponent {
	static get properties() {
		return {
			title: { type: String },
			open: { type: Boolean, reflect: true },
			closable: { type: Boolean },
			size: { type: String },
		}
	}

	constructor() {
		super()
		this.title = ''
		this.open = false
		this.closable = true
		this.size = MODAL.SIZE.MEDIUM
		this._keyDownHandler = this._handleKeyDown.bind(this)
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('keydown', this._keyDownHandler)
	}

	disconnectedCallback() {
		document.removeEventListener('keydown', this._keyDownHandler)
		super.disconnectedCallback()
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
				}

				.modal-backdrop {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-color: rgba(0, 0, 0, 0.5);
					z-index: 1000;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: var(--spacing-m);
					box-sizing: border-box;
					opacity: 0;
					visibility: hidden;
					transition:
						opacity var(--animation-standard) ease,
						visibility var(--animation-standard) ease;
				}

				:host([open]) .modal-backdrop {
					opacity: 1;
					visibility: visible;
				}

				.modal-container {
					background-color: var(--neutral-light);
					border-radius: var(--border-radius-medium);
					box-shadow: var(--shadow-medium);
					display: flex;
					flex-direction: column;
					max-height: calc(100vh - var(--spacing-xl));
					transform: translateY(20px);
					transition: transform var(--animation-standard) ease;
					width: 100%;
					overflow: hidden;
				}

				:host([open]) .modal-container {
					transform: translateY(0);
				}

				.size-small {
					max-width: 400px;
				}

				.size-medium {
					max-width: 600px;
				}

				.size-large {
					max-width: 800px;
				}

				.modal-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: var(--spacing-m);
					border-bottom: 1px solid var(--neutral-dark);
				}

				.modal-title {
					font-size: var(--font-size-h3);
					font-weight: var(--font-weight-medium);
					margin: 0;
				}

				.close-button {
					background: none;
					border: none;
					cursor: pointer;
					font-size: 24px;
					line-height: 1;
					padding: 0;
					color: var(--text-secondary);
					width: 24px;
					height: 24px;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: color var(--animation-quick) ease;
				}

				.close-button:hover {
					color: var(--text-primary);
				}

				.modal-body {
					padding: var(--spacing-m);
					overflow-y: auto;
					flex: 1;
				}

				.modal-footer {
					padding: var(--spacing-m);
					border-top: 1px solid var(--neutral-dark);
					display: flex;
					justify-content: flex-end;
					gap: var(--spacing-s);
				}

				:host(:not([open])) {
					pointer-events: none;
				}
			`,
		]
	}

	render() {
		return html`
			<div class="${MODAL.CLASS.BACKDROP}" @click="${this._handleBackdropClick}">
				<div class="${MODAL.CLASS.CONTAINER} ${MODAL.CLASS.SIZE_PREFIX}${this.size}">
					<div class="${MODAL.CLASS.HEADER}">
						<h3 class="${MODAL.CLASS.TITLE}">${this.title}</h3>
						${this.closable
							? html` <button class="${MODAL.CLASS.CLOSE_BUTTON}" @click="${this.close}" aria-label="Close">×</button> `
							: ''}
					</div>
					<div class="${MODAL.CLASS.BODY}">
						<slot></slot>
					</div>
					<div class="${MODAL.CLASS.FOOTER}">
						<slot name="footer"></slot>
					</div>
				</div>
			</div>
		`
	}

	_handleBackdropClick(e) {
		// Only close if the backdrop itself was clicked, not the modal content
		if (e.target === e.currentTarget && this.closable) {
			this.close()
		}
	}

	_handleKeyDown(e) {
		if (e.key === MODAL.KEY.ESCAPE && this.open && this.closable) {
			this.close()
		}
	}

	/**
	 * Opens the modal
	 */
	show() {
		this.open = true
		document.body.style.overflow = 'hidden'
		this.dispatch(MODAL.EVENT.OPEN)
	}

	/**
	 * Closes the modal
	 */
	close() {
		if (!this.closable) return

		this.open = false
		document.body.style.overflow = ''
		this.dispatch(MODAL.EVENT.CLOSE)
	}

	/**
	 * Toggles the modal
	 */
	toggle() {
		if (this.open) {
			this.close()
		} else {
			this.show()
		}
	}
}

customElements.define('app-modal', AppModal)
