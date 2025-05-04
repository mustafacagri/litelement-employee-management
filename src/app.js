import { LitElement, html, css } from 'lit'
import { initRouter } from '@router'
import { DEFAULT_LOCALE, APP } from '@constants'

// Ensure layout components are registered
import '@components/layout/index.all.js'

/**
 * Main application component
 */
export class EmployeeApp extends LitElement {
	static get properties() {
		return {
			/**
			 * Current application title
			 * @type {string}
			 */
			title: { type: String },
		}
	}

	constructor() {
		super()
		this.title = APP.TITLE
	}

	connectedCallback() {
		super.connectedCallback()
		// Set initial language on document if not already set
		if (!document.documentElement.lang) {
			document.documentElement.lang = DEFAULT_LOCALE
		}
	}

	firstUpdated() {
		// Initialize router with main content element as outlet
		const outlet = this.shadowRoot.querySelector('#router-outlet')
		this.router = initRouter(outlet)
	}

	static get styles() {
		return css`
			:host {
				display: block;
				height: 100%;
			}

			#router-outlet {
				height: 100%;
			}
		`
	}

	render() {
		return html`
			<app-layout>
				<div id="router-outlet">
					<!-- Router outlet -->
				</div>
			</app-layout>
		`
	}
}

customElements.define('employee-app', EmployeeApp)
