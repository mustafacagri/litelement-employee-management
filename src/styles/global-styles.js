import { css } from 'lit'
import { theme } from '@styles/theme.js'

export const globalStyles = css`
	${theme}

	* {
		box-sizing: border-box;
	}

	html,
	body {
		height: 100%;
		margin: 0;
		padding: 0;
		font-family: var(--font-family);
		font-size: var(--font-size-body1);
		line-height: var(--line-height-body1);
		color: var(--text-primary);
		background-color: var(--neutral-light);
	}

	h1 {
		font-size: var(--font-size-h1);
		line-height: var(--line-height-h1);
		font-weight: var(--font-weight-bold);
		margin: var(--spacing-l) 0 var(--spacing-m);
	}

	h2 {
		font-size: var(--font-size-h2);
		line-height: var(--line-height-h2);
		font-weight: var(--font-weight-bold);
		margin: var(--spacing-m) 0 var(--spacing-s);
	}

	h3 {
		font-size: var(--font-size-h3);
		line-height: var(--line-height-h3);
		font-weight: var(--font-weight-medium);
		margin: var(--spacing-m) 0 var(--spacing-s);
	}

	h4 {
		font-size: var(--font-size-h4);
		line-height: var(--line-height-h4);
		font-weight: var(--font-weight-medium);
		margin: var(--spacing-s) 0 var(--spacing-s);
	}

	p {
		margin: 0 0 var(--spacing-m);
	}

	a {
		color: var(--primary-color);
		text-decoration: none;
		transition: color var(--animation-quick) ease;
	}

	a:hover {
		color: var(--primary-dark);
		text-decoration: underline;
	}

	button {
		font-family: var(--font-family);
		font-size: var(--font-size-body2);
		cursor: pointer;
	}

	/* Responsive grid */
	.container {
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 var(--spacing-m);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		margin: 0 calc(-1 * var(--spacing-s));
	}

	.col {
		flex: 1 0 0%;
		padding: 0 var(--spacing-s);
	}

	/* Responsive utils */
	@media (max-width: 768px) {
		.hidden-mobile {
			display: none !important;
		}
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		.hidden-tablet {
			display: none !important;
		}
	}

	@media (min-width: 1025px) {
		.hidden-desktop {
			display: none !important;
		}
	}

	/* Page Transitions */
	.page {
		min-height: 100%;
		width: 100%;
	}

	.page-enter {
		opacity: 0;
		transform: translateY(20px);
	}

	.page-enter-active {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity var(--animation-medium) ease-out,
			transform var(--animation-medium) ease-out;
	}

	.page-exit {
		opacity: 1;
		transform: translateY(0);
	}

	.page-exit-active {
		opacity: 0;
		transform: translateY(-20px);
		transition:
			opacity var(--animation-medium) ease-in,
			transform var(--animation-medium) ease-in;
	}

	/* Fade transitions */
	.fade-in {
		animation: fadeIn var(--animation-standard) ease-in forwards;
	}

	.fade-out {
		animation: fadeOut var(--animation-standard) ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	/* Slide transitions */
	.slide-in-right {
		animation: slideInRight var(--animation-emphasis) ease forwards;
	}

	.slide-out-right {
		animation: slideOutRight var(--animation-emphasis) ease forwards;
	}

	@keyframes slideInRight {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes slideOutRight {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(100%);
		}
	}
`

// Inject global styles into the document
const styleElement = document.createElement('style')
styleElement.textContent = globalStyles.toString()
document.head.appendChild(styleElement)

export default globalStyles
