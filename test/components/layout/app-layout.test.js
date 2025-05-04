import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import '@components/layout/app-layout.js'

describe('AppLayout', () => {
  let element

  beforeEach(async () => {
    // Create the component
    element = document.createElement('app-layout')
    document.body.appendChild(element)
    await element.updateComplete
  })

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
  })

  it('renders with correct structure and child components', async () => {
    // Should render app-header
    const header = element.shadowRoot.querySelector('app-header')
    expect(header).toBeTruthy()
    
    // Should render main content area
    const main = element.shadowRoot.querySelector('main')
    expect(main).toBeTruthy()
    
    // Should render slot for content
    const slot = main.querySelector('slot')
    expect(slot).toBeTruthy()
    
    // Should render app-footer
    const footer = element.shadowRoot.querySelector('app-footer')
    expect(footer).toBeTruthy()
  })

  it('passes slot content correctly', async () => {
    // Add content to the slot
    const content = document.createElement('div')
    content.textContent = 'Test content'
    content.id = 'test-content'
    element.appendChild(content)
    
    await element.updateComplete
    
    // Check that content is being rendered through the slot
    const slot = element.shadowRoot.querySelector('slot')
    const assignedNodes = slot.assignedNodes()
    
    // Should have our div in the assigned nodes
    const hasContent = Array.from(assignedNodes).some(node => 
      node.nodeType === Node.ELEMENT_NODE && node.id === 'test-content'
    )
    
    expect(hasContent).toBe(true)
  })

  it('applies appropriate layout styles', () => {
    // Check element has flex layout
    const styles = element.constructor.styles[1].cssText
    
    // It should be a flex container
    expect(styles).toContain('display: flex')
    expect(styles).toContain('flex-direction: column')
    expect(styles).toContain('min-height: 100vh')
    
    // Main content should be flexible
    expect(styles).toContain('main {')
    expect(styles).toContain('flex: 1')
    
    // Container should have max width
    expect(styles).toContain('max-width: 1400px')
  })
})