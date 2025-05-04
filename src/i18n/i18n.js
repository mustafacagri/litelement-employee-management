import { EVENTS, LANGUAGE_STORAGE_KEY } from '@constants'

import { get as getEn } from '@i18n/locales/en.js'
import { get as getTr } from '@i18n/locales/tr.js'

const resources = {
	en: { translation: getEn(), language: 'English' },
	tr: { translation: getTr(), language: 'Türkçe' },
}

/**
 * Gets all available languages with their localized names
 *
 * @returns {Array<{code: string, name: string}>} Array of language objects
 */
export function getAvailableLanguages() {
	return Object.keys(resources).map((code) => ({
		code,
		name: resources[code]?.language || 'Unknown',
	}))
}

/**
 * Gets the current language from local storage, HTML lang attribute, browser preference, or defaults to 'en'
 *
 * @returns {string} The current language code
 */
export function getCurrentLanguage() {
	// Priority 1: Check local storage for saved preference
	const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY)
	if (savedLang && resources[savedLang]) {
		return savedLang
	}

	// Priority 2: Check HTML lang attribute
	const htmlLang = document.documentElement.lang
	if (htmlLang && resources[htmlLang]) {
		return htmlLang
	}

	// Priority 3: Check browser language
	const browserLang = window.navigator?.language?.split('-')[0]
	if (browserLang && resources[browserLang]) {
		return browserLang
	}

	// Default to English
	return 'en'
}

/**
 * Sets the language of the document and saves it to local storage
 *
 * @param {string} lang - Language code to set
 */
export function setLanguage(lang) {
	if (resources[lang]) {
		// Save to local storage
		localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)

		// Update HTML lang attribute
		document.documentElement.lang = lang

		// Dispatch event to notify components that language has changed
		window.dispatchEvent(new window.CustomEvent(EVENTS.LANGUAGE_CHANGED, { detail: { lang } }))
	}
}

/**
 * Translates a key into the current language
 *
 * @param {string} key - The translation key
 * @param {string} [lang] - Optional language override
 * @returns {string} The translated string or the key if translation not found
 */
export function localize(key, lang = getCurrentLanguage()) {
	const translations = resources[lang] || resources.en

	// Support dot notation for nested keys like 'employee.fields.firstName'
	const keys = key.split('.')
	let value = translations.translation

	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k]
		} else {
			return key // Key not found, return the key itself
		}
	}

	return value
}
