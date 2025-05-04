import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/layout/app-footer.js'

describe('AppFooter', () => {
  let element
  
  beforeEach(async () => {
    // Mock Date.getFullYear to return a consistent value
    const originalGetFullYear = Date.prototype.getFullYear
    Date.prototype.getFullYear = vi.fn(() => 2023)
    
    // Create the component
    element = document.createElement('app-footer')
    document.body.appendChild(element)
    
    // Wait for component to update
    await element.updateComplete
    
    // Restore original Date.getFullYear for other tests
    Date.prototype.getFullYear = originalGetFullYear
  })

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
  })

  it('renders with correct structure and content', () => {
    // Check the footer element exists
    const footer = element.shadowRoot.querySelector('footer')
    expect(footer).toBeTruthy()
    
    // Check footer content wrapper exists
    const footerContent = footer.querySelector('.footer-content')
    expect(footerContent).toBeTruthy()
    
    // Check copyright section with year
    const copyrightDiv = footerContent.querySelector('div:first-child')
    expect(copyrightDiv.textContent).toContain('© 2023')
    
    // Check the attribution section
    const attributionDiv = footerContent.querySelector('div:nth-child(2)')
    expect(attributionDiv.textContent).toContain('Created with LitElement')
    
    // Check the author link
    const authorLink = attributionDiv.querySelector('a')
    expect(authorLink).toBeTruthy()
    expect(authorLink.getAttribute('href')).toBe('https://github.com/mustafacagri')
    expect(authorLink.getAttribute('target')).toBe('_blank')
    expect(authorLink.textContent).toBe('Mustafa Çağrı')
  })

  it('applies appropriate CSS styles', () => {
    // Verify component is block level
    const style = window.getComputedStyle(element)
    expect(element.shadowRoot.adoptedStyleSheets).toBeDefined()
    
    // Check the footer has background color
    const footer = element.shadowRoot.querySelector('footer')
    expect(footer).toBeTruthy()
    
    // We can't really test computed styles in JSDOM, so we'll check the CSS text instead
    const styles = element.constructor.styles[1].cssText
    expect(styles).toContain('background-color: var(--neutral-dark)')
    expect(styles).toContain('color: var(--text-secondary)')
    expect(styles).toContain('text-align: center')
    
    // Check responsive styles exist
    expect(styles).toContain('@media (max-width: 768px)')
    expect(styles).toContain('flex-direction: column')
  })

  it('inherits from BaseComponent', () => {
    // Verify the component is extending BaseComponent by checking for BaseComponent methods
    expect(element).toHaveProperty('t')
    expect(element).toHaveProperty('dispatch')
    expect(element).toHaveProperty('handleError')
    
    // Check that styles are applied
    const styles = element.constructor.styles
    expect(styles.length).toBe(2) // Should have BaseComponent.baseStyles + local styles
    expect(styles[1]).toBeDefined() // Local styles should exist
  })
})