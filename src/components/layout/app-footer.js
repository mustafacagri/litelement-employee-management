import { html, css } from 'lit'
import { BaseComponent } from '@components'

/**
 * Application footer component
 * @element app-footer
 */
export class AppFooter extends BaseComponent {
	static get styles() {
		return [
			BaseComponent.baseStyles,
			css`
				:host {
					display: block;
					margin-top: auto;
				}

				footer {
					background-color: var(--neutral-dark);
					color: var(--text-secondary);
					padding: var(--spacing-m);
					text-align: center;
					font-size: var(--font-size-caption);
				}

				.footer-content {
					display: flex;
					justify-content: space-between;
					align-items: center;
					max-width: 1400px;
					margin: 0 auto;
				}

				footer a {
					color: var(--text-secondary);
					text-decoration: none;
				}

				footer a:hover {
					color: var(--text-primary);
					text-decoration: underline;
				}

				@media (max-width: 768px) {
					.footer-content {
						flex-direction: column;
						gap: var(--spacing-m);
					}
				}
			`,
		]
	}

	render() {
		const currentYear = new Date().getFullYear()

		return html`
			<footer>
				<div class="footer-content">
					<div>${this.t('app.title')} &copy; ${currentYear}</div>
					<div>
						Created with LitElement and JavaScript — with ❤️ by
						<a href="https://github.com/mustafacagri" target="_blank">Mustafa Çağrı</a> in Istanbul.
					</div>
				</div>
			</footer>
		`
	}
}

customElements.define('app-footer', AppFooter)
