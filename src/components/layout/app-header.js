import { html, css } from 'lit'
import { BaseComponent } from '@components'
import { setLanguage, getCurrentLanguage, getAvailableLanguages } from '@i18n/i18n.js'
import './app-nav.js'

/**
 * Application header component
 * @element app-header
 */
export class AppHeader extends BaseComponent {
	static get properties() {
		return {
			currentLang: { type: String },
			availableLanguages: { type: Array },
		}
	}

	constructor() {
		super()
		this.currentLang = getCurrentLanguage()
		this.availableLanguages = getAvailableLanguages()
	}

	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
					position: relative;
					z-index: 10;
				}

				header {
					background-color: var(--primary-color);
					color: var(--text-inverse);
					position: relative;
				}

				.header-actions {
					display: flex;
					align-items: center;
					gap: var(--spacing-s);
					padding: var(--spacing-xs) var(--spacing-m);
					background-color: var(--primary-dark);
					justify-content: flex-end;
					height: auto;
					min-height: 32px;
					position: relative;
					z-index: 20;
				}

				.lang-selector {
					background-color: rgba(255, 255, 255, 0.1);
					color: var(--text-inverse);
					border: 1px solid rgba(255, 255, 255, 0.3);
					border-radius: var(--border-radius-small);
					padding: 2px 6px;
					font-size: var(--font-size-small);
					cursor: pointer;
				}

				.lang-selector:hover {
					background-color: rgba(255, 255, 255, 0.2);
				}

				.lang-selector option {
					background-color: var(--primary-dark);
					color: var(--text-inverse);
				}

				@media (max-width: 768px) {
					:host {
						z-index: 100;
					}

					header {
						display: flex;
						flex-direction: column;
						overflow: hidden;
						min-width: 100%;
					}

					.header-actions {
						padding: var(--spacing-xs) var(--spacing-m);
						min-height: 40px;
						justify-content: flex-end;
						position: sticky;
						top: 0;
					}

					.lang-selector {
						font-size: 14px;
						padding: 4px 8px;
					}
				}
			`,
		]
	}

	render() {
		return html`
			<header>
				<div class="header-actions">
					<select class="lang-selector" @change="${this._handleLanguageChange}" aria-label="${this.t('app.language')}">
						${this.availableLanguages.map(
							(lang) => html`
								<option value="${lang.code}" ?selected="${this.currentLang === lang.code}">${lang.name}</option>
							`
						)}
					</select>
				</div>
				<app-nav></app-nav>
			</header>
		`
	}

	_handleLanguageChange(e) {
		const newLang = e.target.value
		this.currentLang = newLang
		setLanguage(newLang)
	}
}

customElements.define('app-header', AppHeader)
