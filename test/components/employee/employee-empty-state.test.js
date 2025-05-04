import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/employee/employee-empty-state.js'

describe('EmployeeEmptyState', () => {
  let element

  beforeEach(async () => {
    // Create the component
    element = document.createElement('employee-empty-state')
    document.body.appendChild(element)
    
    // Spy on dispatch method
    vi.spyOn(element, 'dispatch')
    
    await element.updateComplete
  })

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
    vi.clearAllMocks()
  })

  it('initializes with correct default properties and renders empty state', async () => {
    // Default properties
    expect(element.isSearching).toBe(false)
    expect(element.searchTerm).toBe('')
    
    // Should render the truly empty state
    const heading = element.shadowRoot.querySelector('h3')
    expect(heading).toBeTruthy()
    
    // Verify empty state message
    const message = element.shadowRoot.querySelector('p')
    expect(message).toBeTruthy()
    
    // Should have an SVG icon
    const icon = element.shadowRoot.querySelector('.empty-icon')
    expect(icon).toBeTruthy()
    
    // Should have one button for add employee
    const buttons = element.shadowRoot.querySelectorAll('app-button')
    expect(buttons.length).toBe(1)
    
    // Button should be the add employee button
    const addButton = buttons[0]
    expect(addButton.getAttribute('variant')).toBe('primary')
  })

  it('renders search empty state when isSearching is true', async () => {
    // Set searching state with a term
    element.isSearching = true
    element.searchTerm = 'test query'
    await element.updateComplete
    
    // Should show search term in the message
    const searchTerm = element.shadowRoot.querySelector('.search-term')
    expect(searchTerm).toBeTruthy()
    expect(searchTerm.textContent).toBe('"test query"')
    
    // Should have two buttons (clear search and add employee)
    const buttons = element.shadowRoot.querySelectorAll('app-button')
    expect(buttons.length).toBe(2)
    
    // First button should be clear search
    const clearButton = buttons[0]
    expect(clearButton.getAttribute('variant')).toBe('secondary')
    
    // Second button should be add employee
    const addButton = buttons[1]
    expect(addButton.getAttribute('variant')).toBe('primary')
  })

  it('dispatches correct events when buttons are clicked', async () => {
    // Click add employee button in default state
    const addButton = element.shadowRoot.querySelector('app-button')
    addButton.click()
    
    // Check that add-employee event was dispatched
    expect(element.dispatch).toHaveBeenCalledWith('add-employee')
    
    // Switch to search state
    element.isSearching = true
    element.searchTerm = 'test query'
    await element.updateComplete
    
    // Get the clear search button and add button again
    const buttons = element.shadowRoot.querySelectorAll('app-button')
    const clearButton = buttons[0]
    const searchStateAddButton = buttons[1]
    
    // Click clear search button
    clearButton.click()
    expect(element.dispatch).toHaveBeenCalledWith('clear-search')
    
    // Click add employee button
    searchStateAddButton.click()
    expect(element.dispatch).toHaveBeenCalledWith('add-employee')
  })
})