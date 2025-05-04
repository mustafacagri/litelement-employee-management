import { html, css } from 'lit'
import { BaseComponent } from '@components'

/**
 * Card component for content containers
 * @element app-card
 *
 * @prop {String} title - Card title
 * @prop {Boolean} elevated - Whether the card has stronger shadow
 * @prop {Boolean} noPadding - Whether to remove internal padding
 */
export class AppCard extends BaseComponent {
	static get properties() {
		return {
			title: { type: String },
			elevated: { type: Boolean },
			noPadding: { type: Boolean },
		}
	}

	constructor() {
		super()
		this.title = ''
		this.elevated = false
		this.noPadding = false
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					margin-bottom: var(--spacing-m);
				}

				.card {
					background-color: var(--neutral-light);
					border: 1px solid var(--neutral-dark);
					border-radius: var(--border-radius-medium);
					box-shadow: var(--shadow-light);
					overflow: visible;
					transition: all var(--animation-quick) ease;
					height: 100%; /* Make card fill the height of its container */
					display: flex;
					flex-direction: column; /* Allow card content to expand */
				}

				.card.elevated {
					box-shadow: var(--shadow-medium);
				}

				.card-title {
					font-size: var(--font-size-h4);
					font-weight: var(--font-weight-medium);
					padding: var(--spacing-m);
					border-bottom: 1px solid var(--neutral-dark);
					margin: 0;
				}

				.card-content {
					padding: var(--spacing-m);
					flex: 1; /* Allow content to expand to fill space */
					overflow: visible;
					position: relative;
				}

				.card-content.no-padding {
					padding: 0;
				}

				/* When a title is not provided, remove the top padding from content */
				.card:not(.has-title) .card-content:not(.no-padding) {
					padding-top: var(--spacing-m);
				}

				/* Responsive styling */
				@media (max-width: 768px) {
					.card-title {
						font-size: calc(var(--font-size-h4) * 0.9);
						padding: var(--spacing-s) var(--spacing-m);
					}

					.card-content:not(.no-padding) {
						padding: var(--spacing-s);
					}
				}

				/* Focus outline for accessibility */
				:host(:focus-within) .card {
					outline: 2px solid var(--primary-color);
					outline-offset: 2px;
				}

				/* Hover effect for interactive cards */
				.card:hover {
					transform: translateY(-2px);
				}
			`,
		]
	}

	render() {
		const hasTitle = !!this.title.trim()
		const cardClasses = ['card', this.elevated ? 'elevated' : '', hasTitle ? 'has-title' : ''].join(' ')

		const contentClasses = ['card-content', this.noPadding ? 'no-padding' : ''].join(' ')

		return html`
			<div class="${cardClasses}">
				${hasTitle ? html`<h3 class="card-title">${this.title}</h3>` : ''}
				<div class="${contentClasses}">
					<slot></slot>
				</div>
			</div>
		`
	}
}

customElements.define('app-card', AppCard)
