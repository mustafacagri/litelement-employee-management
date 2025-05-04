import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/ui/app-date-picker.js'

describe('AppDatePicker', () => {
  let element

  beforeEach(async () => {
    // Spy on document methods before creating element
    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')
    vi.spyOn(document, 'dispatchEvent')
    
    // Create the date picker
    element = document.createElement('app-date-picker')
    document.body.appendChild(element)
    await element.updateComplete
    
    // Spy on the dispatch method
    vi.spyOn(element, 'dispatch')
  })

  afterEach(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element)
    }
    vi.clearAllMocks()
  })

  describe('Test Group 1: Core Functionality', () => {
    it('has proper initialization and event handling', () => {
      // Default properties
      expect(element.label).toBe('')
      expect(element.name).toBe('')
      expect(element.value).toBe('')
      expect(element.placeholder).toBe('')
      expect(element.required).toBe(false)
      expect(element.errorMessage).toBe('')
      expect(element.disabled).toBe(false)
      expect(element.min).toBe('')
      expect(element.max).toBe('')
      expect(element._touched).toBe(false)
      expect(element._showCalendar).toBe(false)
      
      // Event listeners
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
      expect(document.addEventListener).toHaveBeenCalledWith('ui-component-opened', expect.any(Function))
      
      // Cleanup
      element.disconnectedCallback()
      expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
      expect(document.removeEventListener).toHaveBeenCalledWith('ui-component-opened', expect.any(Function))
    })

    it('renders UI components correctly', async () => {
      // Default rendering
      const defaultLabel = element.shadowRoot.querySelector('label')
      expect(defaultLabel).toBeNull() // No label when label prop is empty
      
      const input = element.shadowRoot.querySelector('.date-input')
      expect(input).toBeTruthy()
      
      const calendar = element.shadowRoot.querySelector('.calendar-container')
      expect(calendar).toBeTruthy()
      expect(calendar.classList.contains('show')).toBe(false)
      
      // With label and required
      element.label = 'Test Label'
      element.required = true
      await element.updateComplete
      
      const label = element.shadowRoot.querySelector('label')
      expect(label).toBeTruthy()
      expect(label.textContent).toContain('Test Label')
      
      const requiredMark = element.shadowRoot.querySelector('.required-mark')
      expect(requiredMark).toBeTruthy()
      
      // With placeholder
      element.placeholder = 'Select a date'
      await element.updateComplete
      
      const inputText = element.shadowRoot.querySelector('.date-input span')
      expect(inputText.textContent.trim()).toBe('Select a date')
      expect(inputText.classList.contains('placeholder')).toBe(true)
      
      // With error
      element._touched = true
      element.errorMessage = 'Required field'
      await element.updateComplete
      
      const errorElement = element.shadowRoot.querySelector('.error-message')
      expect(errorElement.textContent).toBe('Required field')
      
      const container = element.shadowRoot.querySelector('.date-picker-container')
      expect(container.classList.contains('date-error')).toBe(true)
    })

    it('handles calendar visibility and clicks properly', async () => {
      const input = element.shadowRoot.querySelector('.date-input')
      
      // Toggle calendar by clicking input
      input.click()
      await element.updateComplete
      
      let calendar = element.shadowRoot.querySelector('.calendar-container')
      expect(calendar.classList.contains('show')).toBe(true)
      expect(document.dispatchEvent).toHaveBeenCalled()
      
      // Disabled state prevents toggle
      element._showCalendar = false
      element.disabled = true
      await element.updateComplete
      
      input.click()
      await element.updateComplete
      
      calendar = element.shadowRoot.querySelector('.calendar-container')
      expect(calendar.classList.contains('show')).toBe(false)
      
      // Outside click handling
      element.disabled = false
      element._showCalendar = true
      await element.updateComplete
      
      // Mock contains method for outside click
      const originalContains = element.contains
      element.contains = vi.fn().mockReturnValue(false)
      
      document.dispatchEvent(new Event('click'))
      expect(element._showCalendar).toBe(false)
      
      // Inside click shouldn't close
      element._showCalendar = true
      element.contains = vi.fn().mockReturnValue(true)
      
      document.dispatchEvent(new Event('click'))
      expect(element._showCalendar).toBe(true)
      
      // Restore original method
      element.contains = originalContains
    })
  })
  
  describe('Test Group 2: Month Navigation and Date Selection', () => {
    it('navigates between months correctly', async () => {
      element._showCalendar = true
      element._currentMonth = 5 // June
      element._currentYear = 2023
      await element.updateComplete
      
      // Navigate to previous month
      const prevButton = element.shadowRoot.querySelector('.calendar-header .nav-button')
      const prevClickEvent = new Event('click')
      prevClickEvent.stopPropagation = vi.fn()
      prevButton.dispatchEvent(prevClickEvent)
      
      expect(prevClickEvent.stopPropagation).toHaveBeenCalled()
      expect(element._currentMonth).toBe(4) // Should now be May
      expect(element._currentYear).toBe(2023)
      
      // Year change when going from January to December
      element._currentMonth = 0 // January
      element._currentYear = 2023
      await element.updateComplete
      
      const prevYearClickEvent = new Event('click')
      prevYearClickEvent.stopPropagation = vi.fn()
      prevButton.dispatchEvent(prevYearClickEvent)
      
      expect(element._currentMonth).toBe(11) // December
      expect(element._currentYear).toBe(2022)
      
      // Navigate to next month
      element._currentMonth = 5 // June
      element._currentYear = 2023
      await element.updateComplete
      
      const nextButton = element.shadowRoot.querySelectorAll('.calendar-header .nav-button')[1]
      const nextClickEvent = new Event('click')
      nextClickEvent.stopPropagation = vi.fn()
      nextButton.dispatchEvent(nextClickEvent)
      
      expect(nextClickEvent.stopPropagation).toHaveBeenCalled()
      expect(element._currentMonth).toBe(6) // Should now be July
      expect(element._currentYear).toBe(2023)
      
      // Year change when going from December to January
      element._currentMonth = 11 // December
      element._currentYear = 2023
      await element.updateComplete
      
      const nextYearClickEvent = new Event('click')
      nextYearClickEvent.stopPropagation = vi.fn()
      nextButton.dispatchEvent(nextYearClickEvent)
      
      expect(element._currentMonth).toBe(0) // January
      expect(element._currentYear).toBe(2024)
    })
    
    it('validates dates correctly', async () => {
      // Required validation
      element.required = true
      element.name = 'test-date'
      
      let isValid = element.validate()
      
      expect(isValid).toBe(false)
      expect(element._touched).toBe(true)
      expect(element.errorMessage).not.toBe('')
      expect(element.dispatch).toHaveBeenCalledWith('validate', {
        name: 'test-date',
        value: '',
        isValid: false
      })
      
      // Min date validation
      element.min = '2023-10-01'
      element.value = '2023-09-15' // Before min date
      
      isValid = element.validate()
      
      expect(isValid).toBe(false)
      expect(element.errorMessage).not.toBe('')
      
      // Max date validation
      element.min = ''
      element.max = '2023-10-01'
      element.value = '2023-10-15' // After max date
      
      isValid = element.validate()
      
      expect(isValid).toBe(false)
      expect(element.errorMessage).not.toBe('')
      
      // Valid date
      element.min = '2023-01-01'
      element.max = '2023-12-31'
      element.value = '2023-06-15' // Within range
      
      isValid = element.validate()
      
      expect(isValid).toBe(true)
      expect(element.errorMessage).toBe('')
    })
    
    it('has working helper methods for date operations', () => {
      // Today check
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      expect(element._isToday(today)).toBe(true)
      expect(element._isToday(yesterday)).toBe(false)
      
      // Selected date check
      const selectedDate = new Date('2023-05-15')
      element._selectedDate = selectedDate
      
      const sameDate = new Date('2023-05-15')
      const differentDate = new Date('2023-05-16')
      
      expect(element._isSelected(sameDate)).toBe(true)
      expect(element._isSelected(differentDate)).toBe(false)
      
      // Disabled date check
      element.min = '2023-05-10'
      element.max = '2023-05-20'
      
      const beforeMin = new Date('2023-05-09')
      const afterMax = new Date('2023-05-21')
      const withinRange = new Date('2023-05-15')
      
      expect(element._isDateDisabled(beforeMin)).toBe(true)
      expect(element._isDateDisabled(afterMax)).toBe(true)
      expect(element._isDateDisabled(withinRange)).toBe(false)
      
      // Date formatting
      const originalGetMonthNames = element._getMonthNames
      element._getMonthNames = vi.fn().mockReturnValue([
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ])
      
      const dateStr = '2023-05-15T00:00:00.000Z'
      const formatted = element._formatDateForDisplay(dateStr)
      
      expect(formatted).toContain('May')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2023')
      
      // Restore original function
      element._getMonthNames = originalGetMonthNames
    })
  })
})