import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatters } from '@utils'
import { TEXT_FORMAT } from '@constants'
import * as i18n from '@i18n'

describe('Formatters', () => {
  
  describe('date formatter', () => {
    beforeEach(() => {
      // Mock getCurrentLanguage to return a consistent locale for testing
      vi.spyOn(i18n, 'getCurrentLanguage').mockReturnValue('en-US')
      
      // Mock Intl.DateTimeFormat
      global.Intl = {
        DateTimeFormat: vi.fn().mockImplementation(() => ({
          format: (date) => '01/01/2023' // Fixed date for testing
        }))
      }
    })
    
    afterEach(() => {
      vi.restoreAllMocks()
    })
    
    it('formats dates correctly', () => {
      const testDate = new Date(2023, 0, 1) // January 1, 2023
      const result = formatters.date(testDate)
      
      expect(result).toBe('01/01/2023')
      expect(i18n.getCurrentLanguage).toHaveBeenCalled()
      expect(Intl.DateTimeFormat).toHaveBeenCalledWith('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    })
    
    it('accepts date strings', () => {
      const result = formatters.date('2023-01-01')
      expect(result).toBe('01/01/2023')
    })
    
    it('returns empty string for falsy values', () => {
      expect(formatters.date(null)).toBe('')
      expect(formatters.date(undefined)).toBe('')
      expect(formatters.date('')).toBe('')
    })
    
    it('handles errors gracefully', () => {
      // Mock console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock Intl.DateTimeFormat to throw an error
      global.Intl.DateTimeFormat = vi.fn().mockImplementation(() => {
        throw new Error('DateTimeFormat error')
      })
      
      const result = formatters.date('invalid-date')
      
      expect(result).toBe('invalid-date') // Returns input on error
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
  
  describe('capitalize formatter', () => {
    it('capitalizes the first letter of a string', () => {
      expect(formatters.capitalize('hello')).toBe('Hello')
      expect(formatters.capitalize('hello world')).toBe('Hello world')
    })
    
    it('handles already capitalized strings', () => {
      expect(formatters.capitalize('Hello')).toBe('Hello')
    })
    
    it('returns empty string for falsy values', () => {
      expect(formatters.capitalize(null)).toBe('')
      expect(formatters.capitalize(undefined)).toBe('')
      expect(formatters.capitalize('')).toBe('')
    })
    
    it('handles non-alphabetic first characters', () => {
      expect(formatters.capitalize('123abc')).toBe('123abc')
      expect(formatters.capitalize(' abc')).toBe(' abc')
    })
  })
  
  describe('truncate formatter', () => {
    it('truncates text that exceeds the length', () => {
      const longText = 'This is a long text that should be truncated'
      const expectedLength = TEXT_FORMAT.TRUNCATE.DEFAULT_LENGTH
      const result = formatters.truncate(longText)
      
      expect(result.length).toBe(expectedLength)
      expect(result.endsWith(TEXT_FORMAT.TRUNCATE.DEFAULT_SUFFIX)).toBe(true)
    })
    
    it('does not truncate text shorter than limit', () => {
      const shortText = 'Short text'
      expect(formatters.truncate(shortText)).toBe(shortText)
    })
    
    it('handles custom length and suffix', () => {
      const longText = 'This is a very long text that needs to be truncated with custom parameters'
      const customLength = 20
      const customSuffix = '---'
      const result = formatters.truncate(longText, customLength, customSuffix)
      
      expect(result.length).toBe(customLength)
      expect(result.endsWith(customSuffix)).toBe(true)
    })
    
    it('returns empty string for falsy values', () => {
      expect(formatters.truncate(null)).toBe('')
      expect(formatters.truncate(undefined)).toBe('')
      expect(formatters.truncate('')).toBe('')
    })
    
    it('handles edge cases with suffix length', () => {
      // When suffix is longer than requested length
      const result = formatters.truncate('Long text', 5, '......')
      expect(result).toBe('......') // Suffix only
    })
  })
})