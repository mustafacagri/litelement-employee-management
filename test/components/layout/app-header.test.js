import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/layout/app-header.js'
import * as i18n from '@i18n/i18n.js'

describe('AppHeader', () => {
  let element

  beforeEach(async () => {
    // Mock i18n functions
    vi.spyOn(i18n, 'getCurrentLanguage').mockReturnValue('en')
    vi.spyOn(i18n, 'getAvailableLanguages').mockReturnValue([
      { code: 'en', name: 'English' },
      { code: 'tr', name: 'Türkçe' }
    ])
    vi.spyOn(i18n, 'setLanguage').mockImplementation(() => {})
    
    // Create the component
    element = document.createElement('app-header')
    document.body.appendChild(element)
    await element.updateComplete
  })

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
    vi.clearAllMocks()
  })

  it('initializes with correct language settings', async () => {
    // Check that it gets the current language
    expect(i18n.getCurrentLanguage).toHaveBeenCalled()
    expect(element.currentLang).toBe('en')
    
    // Check that it gets available languages
    expect(i18n.getAvailableLanguages).toHaveBeenCalled()
    expect(element.availableLanguages).toEqual([
      { code: 'en', name: 'English' },
      { code: 'tr', name: 'Türkçe' }
    ])
    
    // Check that language selector is rendered with options
    const langSelector = element.shadowRoot.querySelector('.lang-selector')
    expect(langSelector).toBeTruthy()
    
    const options = langSelector.querySelectorAll('option')
    expect(options.length).toBe(2)
    
    // First option should be English and selected
    expect(options[0].value).toBe('en')
    expect(options[0].selected).toBe(true)
    expect(options[0].textContent).toBe('English')
    
    // Second option should be Turkish and not selected
    expect(options[1].value).toBe('tr')
    expect(options[1].selected).toBe(false)
    expect(options[1].textContent).toBe('Türkçe')
  })

  it('renders app-nav component', async () => {
    // Check that app-nav is rendered
    const appNav = element.shadowRoot.querySelector('app-nav')
    expect(appNav).toBeTruthy()
  })

  it('changes language when selector is changed', async () => {
    const langSelector = element.shadowRoot.querySelector('.lang-selector')
    
    // Create a change event with Turkish as the new value
    const changeEvent = new Event('change')
    
    // Mock target.value
    Object.defineProperty(changeEvent, 'target', {
      value: { value: 'tr' }
    })
    
    // Dispatch the event
    langSelector.dispatchEvent(changeEvent)
    
    // Check that currentLang was updated
    expect(element.currentLang).toBe('tr')
    
    // Check that setLanguage was called with the new language
    expect(i18n.setLanguage).toHaveBeenCalledWith('tr')
  })
})