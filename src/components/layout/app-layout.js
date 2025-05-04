import { html, css } from 'lit'
import { BaseComponent } from '@components'
import './app-header.js'
import './app-footer.js'

/**
 * Main application layout component with header, content area, and footer
 * @element app-layout
 */
export class AppLayout extends BaseComponent {
	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: flex;
					flex-direction: column;
					min-height: 100vh;
				}

				main {
					flex: 1;
					padding: var(--spacing-m);
					max-width: 1400px;
					margin: 0 auto;
					width: 100%;
					box-sizing: border-box;
					position: relative;
					overflow: hidden;
				}

				.page-title {
					margin-bottom: var(--spacing-l);
				}

				@media (max-width: 768px) {
					main {
						padding: 0;
					}
				}
			`,
		]
	}

	render() {
		return html`
			<app-header></app-header>

			<main>
				<slot></slot>
			</main>

			<app-footer></app-footer>
		`
	}
}

customElements.define('app-layout', AppLayout)
