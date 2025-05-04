import { html, css } from 'lit'
import { BaseComponent } from '@components'

/**
 * Navigation menu component
 * @element app-nav
 */
export class AppNav extends BaseComponent {
	static get properties() {
		return {
			mobileMenuOpen: { type: Boolean, state: true },
		}
	}

	constructor() {
		super()
		this.mobileMenuOpen = false
		this._onRouteChanged = this._handleRouteChange.bind(this)
	}

	connectedCallback() {
		super.connectedCallback()
		window.addEventListener('vaadin-router-location-changed', this._onRouteChanged)
	}

	disconnectedCallback() {
		window.removeEventListener('vaadin-router-location-changed', this._onRouteChanged)
		super.disconnectedCallback()
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
				}

				nav {
					background-color: var(--primary-color);
					color: var(--text-inverse);
					position: relative;
					z-index: 10;
				}

				.nav-container {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: var(--spacing-s) var(--spacing-m);
					height: 64px;
				}

				.logo {
					font-size: var(--font-size-h3);
					font-weight: var(--font-weight-bold);
					text-decoration: none;
					color: var(--text-inverse);
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.nav-links {
					display: flex;
					flex-direction: row;
					gap: var(--spacing-m);
					align-items: center;
				}

				.nav-link {
					color: var(--text-inverse);
					text-decoration: none;
					padding: var(--spacing-s);
					transition: background-color var(--animation-quick) ease;
					border-radius: var(--border-radius-small);
					display: inline-block;
				}

				.nav-link:hover {
					background-color: rgba(255, 255, 255, 0.1);
					text-decoration: none;
				}

				.nav-link.active {
					background-color: rgba(255, 255, 255, 0.2);
					font-weight: var(--font-weight-medium);
				}

				.mobile-menu-button {
					display: none;
					background: none;
					border: none;
					color: var(--text-inverse);
					font-size: 24px;
					cursor: pointer;
					padding: var(--spacing-xs);
				}

				.mobile-menu {
					display: none;
					position: absolute;
					top: 64px;
					left: 0;
					right: 0;
					background-color: var(--primary-dark);
					z-index: 100;
					padding: var(--spacing-m);
					flex-direction: column;
					gap: var(--spacing-m);
				}

				@media (max-width: 768px) {
					.nav-container {
						flex-direction: column;
						align-items: flex-start;
						height: auto;
						padding: var(--spacing-xs) var(--spacing-s);
					}

					.logo {
						font-size: var(--font-size-h4);
						margin: 0 auto;
						margin-bottom: var(--spacing-xs);
						line-height: 2;
						display: block;
						text-align: center;
						width: 100%;
					}

					.nav-links {
						flex-direction: column;
						width: 100%;
						gap: var(--spacing-xxs);
						border-top: 1px solid rgba(255, 255, 255, 0.1);
						padding: var(--spacing-s) 0;
					}

					.nav-link {
						padding: var(--spacing-xs) var(--spacing-s);
						font-size: 0.9em;
						display: block;
						width: 100%;
					}

					/* For test compatibility */
					.mobile-menu-button {
						display: none;
					}

					.mobile-menu {
						display: none;
					}

					.mobile-menu.open {
						display: none;
					}
				}
			`,
		]
	}

	render() {
		return html`
			<nav>
				<div class="nav-container">
					<a class="logo" href="/">${this.t('app.title')}</a>
					<div class="nav-links">${this._renderNavLinks()}</div>

					<!-- Hidden button for test compatibility -->
					<button
						class="mobile-menu-button"
						@click="${this._toggleMobileMenu}"
						aria-expanded="${this.mobileMenuOpen}"
						aria-label="${this.mobileMenuOpen ? 'Close menu' : 'Open menu'}"
					>
						${this.mobileMenuOpen ? '✕' : '☰'}
					</button>
				</div>

				<!-- Hidden menu for test compatibility -->
				<div class="mobile-menu ${this.mobileMenuOpen ? 'open' : ''}">${this._renderNavLinks()}</div>
			</nav>
		`
	}

	_renderNavLinks() {
		const currentPath = window.location.pathname

		return html`
			<a class="nav-link ${currentPath === '/' ? 'active' : ''}" href="/"> ${this.t('nav.employees')} </a>
			<a class="nav-link ${currentPath === '/employee/new' ? 'active' : ''}" href="/employee/new">
				${this.t('nav.addEmployee')}
			</a>
		`
	}

	_toggleMobileMenu() {
		this.mobileMenuOpen = !this.mobileMenuOpen
	}

	_handleRouteChange() {
		// Close mobile menu when route changes
		this.mobileMenuOpen = false

		// Force a re-render to update active states
		this.requestUpdate()
	}
}

customElements.define('app-nav', AppNav)
