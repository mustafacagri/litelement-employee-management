import { html } from 'lit'
import { BaseComponent } from '@components'

/**
 * Not found view - displayed when navigating to non-existent routes
 */
export class NotFoundView extends BaseComponent {
	render() {
		return html`
			<div class="page">
				<h2>${this.t('notFound.title') || 'Page Not Found'}</h2>
				<p>${this.t('notFound.message') || 'The page you requested could not be found.'}</p>
				<a href="/">${this.t('notFound.backToHome') || 'Return to Home'}</a>
			</div>
		`
	}
}

customElements.define('not-found-view', NotFoundView)
