import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { BUTTON } from '@constants'

/**
 * Button component with different variants
 * @element app-button
 *
 * @prop {String} variant - Button variant (primary, secondary, text, danger)
 * @prop {Boolean} disabled - Whether the button is disabled
 * @prop {Boolean} full - Whether the button should take full width
 * @prop {String} size - Button size (small, medium, large)
 *
 * @fires click - Forwards the native click event
 */
export class AppButton extends BaseComponent {
	static get properties() {
		return {
			variant: { type: String },
			disabled: { type: Boolean },
			full: { type: Boolean },
			size: { type: String },
		}
	}

	constructor() {
		super()
		this.variant = BUTTON.VARIANT.PRIMARY
		this.disabled = false
		this.full = false
		this.size = BUTTON.SIZE.MEDIUM
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: inline-block;
				}

				:host([full]) {
					display: block;
					width: 100%;
				}

				button {
					font-family: var(--font-family);
					font-size: var(--font-size-body2);
					font-weight: var(--font-weight-medium);
					border-radius: var(--border-radius-small);
					cursor: pointer;
					transition: all var(--animation-standard) ease;
					border: none;
					outline: none;
					padding: 0;
					background: none;
					width: 100%;
					text-align: center;
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					overflow: hidden;
					transform: translateZ(0); /* Enable hardware acceleration */
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}

				button::after {
					content: '';
					display: block;
					position: absolute;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
					pointer-events: none;
					background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
					background-repeat: no-repeat;
					background-position: 50%;
					transform: scale(10, 10);
					opacity: 0;
					transition:
						transform 0.5s,
						opacity 0.8s;
				}

				button:active::after {
					transform: scale(0, 0);
					opacity: 0.3;
					transition: 0s;
				}

				button:focus {
					outline: 2px solid var(--primary-color);
					outline-offset: 2px;
				}

				/* Size variants */
				.size-small {
					padding: 4px 12px;
					font-size: var(--font-size-caption);
				}

				.size-medium {
					padding: var(--spacing-s) var(--spacing-m);
				}

				.size-large {
					padding: 12px 24px;
					font-size: var(--font-size-body1);
				}

				/* Button variants */
				.primary {
					background-color: var(--primary-color);
					color: var(--text-inverse);
					transform: translateY(0);
					transition:
						transform 0.2s ease,
						background-color 0.3s ease,
						box-shadow 0.3s ease;
				}

				.primary:hover:not(:disabled) {
					background-color: var(--primary-dark);
					transform: translateY(-2px);
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
				}

				.primary:active:not(:disabled) {
					transform: translateY(0);
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				}

				.secondary {
					background-color: transparent;
					border: 1px solid var(--primary-color);
					color: var(--primary-color);
					transition:
						background-color 0.3s ease,
						color 0.3s ease,
						transform 0.2s ease;
				}

				.secondary:hover:not(:disabled) {
					background-color: var(--primary-light);
					color: var(--primary-dark);
					transform: translateY(-1px);
				}

				.secondary:active:not(:disabled) {
					transform: translateY(0);
				}

				.text {
					background-color: transparent;
					color: var(--primary-color);
					padding-left: var(--spacing-s);
					padding-right: var(--spacing-s);
					box-shadow: none;
					transition:
						background-color 0.3s ease,
						color 0.3s ease;
				}

				.text:hover:not(:disabled) {
					background-color: rgba(var(--primary-color-rgb, 255, 87, 34), 0.05);
				}

				.danger {
					background-color: var(--error-color);
					color: var(--text-inverse);
					transition:
						background-color 0.3s ease,
						transform 0.2s ease;
				}

				.danger:hover:not(:disabled) {
					background-color: #d32f2f;
					transform: translateY(-1px);
				}

				.danger:active:not(:disabled) {
					transform: translateY(0);
				}

				button:disabled {
					opacity: 0.6;
					cursor: not-allowed;
					box-shadow: none;
				}

				/* Ripple effect */
				.ripple {
					position: absolute;
					border-radius: 50%;
					background-color: rgba(255, 255, 255, 0.25);
					transform: scale(0);
					animation: ripple 0.6s linear;
					pointer-events: none;
				}

				@keyframes ripple {
					to {
						transform: scale(4);
						opacity: 0;
					}
				}
			`,
		]
	}

	render() {
		const buttonClasses = [this.variant, `size-${this.size}`].join(' ')

		return html`
			<button
				class="${buttonClasses}"
				?disabled="${this.disabled}"
				@click="${this._onClick}"
				@mousedown="${this._onMouseDown}"
			>
				<slot></slot>
			</button>
		`
	}

	_onClick(e) {
		// Just pass through the click event
		if (!this.disabled) {
			this.dispatch('click', { originalEvent: e })
		}
	}

	_onMouseDown(e) {
		if (this.disabled) return

		const button = e.currentTarget
		const circle = document.createElement('span')
		const diameter = Math.max(button.clientWidth, button.clientHeight)
		const radius = diameter / 2

		circle.style.width = circle.style.height = `${diameter}px`
		circle.style.left = `${e.clientX - button.offsetLeft - radius}px`
		circle.style.top = `${e.clientY - button.offsetTop - radius}px`
		circle.classList.add('ripple')

		// Remove existing ripples
		const ripple = button.querySelector('.ripple')
		if (ripple) {
			ripple.remove()
		}

		button.appendChild(circle)

		// Remove the ripple after animation completes
		setTimeout(() => {
			if (circle) {
				circle.remove()
			}
		}, 600)
	}
}

customElements.define('app-button', AppButton)
