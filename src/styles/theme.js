import { css } from 'lit'

export const theme = css`
	:root {
		/* Ana Renkler */
		--primary-color: #ff5722;
		--primary-light: #ff8a65;
		--primary-dark: #e64a19;

		--secondary-color: #2196f3;
		--secondary-light: #64b5f6;
		--secondary-dark: #1976d2;

		--neutral-color: #f5f5f5;
		--neutral-light: #ffffff;
		--neutral-dark: #e0e0e0;

		/* Yardımcı Renkler */
		--success-color: #4caf50;
		--info-color: #2196f3;
		--warning-color: #ffc107;
		--error-color: #f44336;

		/* Metin Renkleri */
		--text-primary: #212121;
		--text-secondary: #757575;
		--text-tertiary: #bdbdbd;
		--text-inverse: #ffffff;

		/* Tipografi */
		--font-family: 'Roboto', sans-serif;

		/* Font Boyutları */
		--font-size-h1: 28px;
		--font-size-h2: 24px;
		--font-size-h3: 20px;
		--font-size-h4: 18px;
		--font-size-body1: 16px;
		--font-size-body2: 14px;
		--font-size-caption: 12px;
		--font-size-small: 11px;

		/* Font Line Heights */
		--line-height-h1: 1.2;
		--line-height-h2: 1.2;
		--line-height-h3: 1.3;
		--line-height-h4: 1.3;
		--line-height-body1: 1.5;
		--line-height-body2: 1.5;
		--line-height-caption: 1.4;
		--line-height-small: 1.4;

		/* Font Ağırlıkları */
		--font-weight-light: 300;
		--font-weight-regular: 400;
		--font-weight-medium: 500;
		--font-weight-bold: 700;

		/* Boşluk Sistemi */
		--spacing-xs: 4px;
		--spacing-s: 8px;
		--spacing-m: 16px;
		--spacing-l: 24px;
		--spacing-xl: 32px;
		--spacing-xxl: 48px;

		/* Border Radius */
		--border-radius-small: 4px;
		--border-radius-medium: 8px;

		/* Shadows */
		--shadow-light: 0 2px 4px rgba(0, 0, 0, 0.1);
		--shadow-medium: 0 4px 8px rgba(0, 0, 0, 0.2);

		/* Animations */
		--animation-quick: 100ms;
		--animation-standard: 200ms;
		--animation-medium: 250ms;
		--animation-emphasis: 300ms;

		/* Breakpoints */
		--breakpoint-mobile: 768px;
		--breakpoint-tablet: 1024px;
	}
`
