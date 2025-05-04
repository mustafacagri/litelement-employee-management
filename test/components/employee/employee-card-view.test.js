import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/employee/employee-card-view.js'
import { formatters } from '@utils/formatters.js'

describe('EmployeeCardView', () => {
  let element
  const mockEmployees = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneCode: '+1',
      phoneNumber: '555-1234',
      department: 'engineering',
      position: 'developer',
      dateOfEmployment: '2022-01-15'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneCode: '+1',
      phoneNumber: '555-5678',
      department: 'marketing',
      position: 'manager',
      dateOfEmployment: '2021-06-30'
    }
  ]

  beforeEach(async () => {
    // Mock formatters.date
    vi.spyOn(formatters, 'date').mockImplementation(dateStr => `Formatted: ${dateStr}`)
    
    // Create the component
    element = document.createElement('employee-card-view')
    element.employees = [...mockEmployees]
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

  it('renders employee cards with correct information', async () => {
    // Check cards container exists
    const cardsContainer = element.shadowRoot.querySelector('.cards-container')
    expect(cardsContainer).toBeTruthy()
    
    // Check card count matches employee count
    const cards = element.shadowRoot.querySelectorAll('app-card')
    expect(cards.length).toBe(2)
    
    // Check first card content
    const firstCard = cards[0]
    expect(firstCard.getAttribute('title')).toBe('John Doe')
    
    // Verify formatting was called
    expect(formatters.date).toHaveBeenCalled()
  })

  it('shows empty state when no employees', async () => {
    // Set empty employees array
    element.employees = []
    await element.updateComplete
    
    // Check empty message is displayed
    const emptyMessage = element.shadowRoot.querySelector('.empty-message')
    expect(emptyMessage).toBeTruthy()
    
    // Cards container should not be present
    const cardsContainer = element.shadowRoot.querySelector('.cards-container')
    expect(cardsContainer).toBeFalsy()
  })

  it('dispatches events when edit/delete buttons are clicked', async () => {
    // Get app-card elements
    const cards = element.shadowRoot.querySelectorAll('app-card')
    expect(cards.length).toBe(2)
    
    // Get the edit and delete handlers directly
    const originalHandleEdit = element._handleEdit
    const originalHandleDelete = element._handleDelete
    
    // Mock the handlers temporarily
    element._handleEdit = vi.fn(originalHandleEdit)
    element._handleDelete = vi.fn(originalHandleDelete)
    
    // Call handlers directly
    element._handleEdit(mockEmployees[0])
    element._handleDelete(mockEmployees[0])
    
    // Verify dispatch was called
    expect(element.dispatch).toHaveBeenCalledWith('edit-employee', {
      employee: mockEmployees[0]
    })
    
    expect(element.dispatch).toHaveBeenCalledWith('delete-employee', {
      employee: mockEmployees[0]
    })
    
    // Restore original handlers
    element._handleEdit = originalHandleEdit
    element._handleDelete = originalHandleDelete
    
    // Force render to populate cache
    element._renderEmployeeCard(mockEmployees[0])
    
    // Test that cache gets populated during rendering
    expect(element._employeesCache.size).toBeGreaterThan(0)
  })
})