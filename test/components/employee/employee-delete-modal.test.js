import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/employee/employee-delete-modal.js'

describe('EmployeeDeleteModal', () => {
  let element
  const mockEmployee = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    department: 'engineering',
    position: 'developer'
  }

  beforeEach(async () => {
    // Create the component
    element = document.createElement('employee-delete-modal')
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

  it('initializes with correct default properties', async () => {
    // Check default properties
    expect(element.employee).toBeNull()
    expect(element._open).toBe(false)
    
    // When employee is null, app-modal should not be rendered
    const modal = element.shadowRoot.querySelector('app-modal')
    expect(modal).toBeNull()
  })

  it('renders correctly when opened with employee data', async () => {
    // Open the modal
    element.open(mockEmployee)
    await element.updateComplete
    
    // Check that modal is open
    expect(element._open).toBe(true)
    
    // Find the app-modal component
    const modal = element.shadowRoot.querySelector('app-modal')
    expect(modal).toBeTruthy()
    expect(modal.getAttribute('open')).toBe('')
    
    // Check that employee name is displayed
    const strongElement = element.shadowRoot.querySelector('p strong')
    expect(strongElement).toBeTruthy()
    expect(strongElement.textContent).toBe('John Doe')
    
    // Check that buttons are rendered
    const buttons = element.shadowRoot.querySelectorAll('app-button')
    expect(buttons.length).toBe(2)
    
    // First button should be cancel
    const cancelButton = buttons[0]
    expect(cancelButton.getAttribute('variant')).toBe('text')
    
    // Second button should be confirm (danger)
    const confirmButton = buttons[1]
    expect(confirmButton.getAttribute('variant')).toBe('danger')
  })

  it('handles confirmation and cancellation correctly', async () => {
    // Open the modal
    element.open(mockEmployee)
    await element.updateComplete
    
    // Find the buttons
    const buttons = element.shadowRoot.querySelectorAll('app-button')
    const cancelButton = buttons[0]
    const confirmButton = buttons[1]
    
    // Test cancel
    cancelButton.click()
    expect(element.dispatch).toHaveBeenCalledWith('cancel')
    expect(element._open).toBe(false)
    
    // Reopen for confirm test
    element.open(mockEmployee)
    await element.updateComplete
    
    // Test confirm
    confirmButton.click()
    expect(element.dispatch).toHaveBeenCalledWith('confirm', {
      employee: mockEmployee
    })
    expect(element._open).toBe(false)
    
    // Test close method directly
    element.open(mockEmployee)
    await element.updateComplete
    element.close()
    expect(element._open).toBe(false)
  })
})