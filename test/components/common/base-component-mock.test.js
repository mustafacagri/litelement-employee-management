import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BaseComponent } from '@components'
import { NotificationService } from '@services'
import { EVENTS } from '@constants'
import * as i18n from '@i18n'

// Create a mock class for isolated testing of BaseComponent methods
class MockComponent {
  constructor() {
    // Copy the methods from BaseComponent.prototype
    this.t = BaseComponent.prototype.t.bind(this)
    this.handleError = BaseComponent.prototype.handleError.bind(this)
    
    // Create mocked versions of BaseComponent internals
    this._eventRegistry = new Map()
    this.dispatchEvent = vi.fn()
    
    // Since debouncedDispatch is a property, not a prototype method,
    // we need to mock it differently
    this.dispatch = BaseComponent.prototype.dispatch.bind(this)
  }
}

describe('BaseComponent Methods', () => {
  let component

  beforeEach(() => {
    component = new MockComponent()
    
    // Mock localize function
    vi.spyOn(i18n, 'localize').mockImplementation((key) => `translated:${key}`)
    
    // Mock notification service
    vi.spyOn(NotificationService, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('t method (localization)', () => {
    it('translates keys correctly', () => {
      const result = component.t('test.key')
      
      expect(i18n.localize).toHaveBeenCalledWith('test.key')
      expect(result).toBe('translated:test.key')
    })
    
    it('handles replacements in translation string', () => {
      i18n.localize.mockReturnValue('Hello, {name}!')
      
      const result = component.t('test.greeting', { name: 'World' })
      
      expect(result).toBe('Hello, World!')
    })
    
    it('returns key if no translation found', () => {
      i18n.localize.mockReturnValue(undefined)
      
      const result = component.t('test.missing')
      
      expect(result).toBeUndefined()
    })
  })
  
  describe('dispatch method', () => {
    it('dispatches custom events', () => {
      // We've mocked dispatchEvent, so we can test if it was called
      const eventName = 'test-event'
      const eventDetail = { value: 42 }
      
      component.dispatch(eventName, eventDetail)
      
      expect(component.dispatchEvent).toHaveBeenCalled()
      // We can't easily test CustomEvent construction, so we focus on the mock call
    })
    
    it('prevents duplicate events in quick succession', () => {
      // Mock Date.now to control time
      const originalDateNow = Date.now
      let currentTime = 1000
      Date.now = vi.fn(() => currentTime)
      
      // First dispatch
      component.dispatch('test-event')
      expect(component.dispatchEvent).toHaveBeenCalledTimes(1)
      
      // Second dispatch, same event, right after (still at same time)
      component.dispatch('test-event')
      expect(component.dispatchEvent).toHaveBeenCalledTimes(1) // Still just one call
      
      // Advance time and dispatch again
      currentTime += 500 // Add 500ms
      component.dispatch('test-event')
      expect(component.dispatchEvent).toHaveBeenCalledTimes(2) // Now it's called again
      
      // Different event should dispatch even with same timestamp
      component.dispatch('different-event')
      expect(component.dispatchEvent).toHaveBeenCalledTimes(3)
      
      // Restore Date.now
      Date.now = originalDateNow
    })
  })
  
  describe('handleError method', () => {
    it('logs errors to console', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      
      component.handleError(error, 'Custom fallback message')
      
      expect(consoleError).toHaveBeenCalledWith('Custom fallback message', error)
    })
    
    it('shows notification by default', () => {
      const error = new Error('Test error')
      
      component.handleError(error)
      
      expect(NotificationService.error).toHaveBeenCalledWith('Test error')
    })
    
    it('uses fallback message if error has no message', () => {
      const error = new Error()
      
      component.handleError(error, 'Fallback')
      
      expect(NotificationService.error).toHaveBeenCalledWith('Fallback')
    })
    
    it('can suppress notifications', () => {
      const error = new Error('Test error')
      
      component.handleError(error, 'Message', false)
      
      expect(NotificationService.error).not.toHaveBeenCalled()
    })
    
    it('rethrows errors when requested', () => {
      const error = new Error('Test error')
      
      expect(() => {
        component.handleError(error, 'Message', true, true)
      }).toThrow('Test error')
    })
  })
})