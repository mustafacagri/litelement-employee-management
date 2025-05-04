import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUT } from '@constants'
// First import the base component to resolve the dependency chain
import '@components/common/base-component.js'
// Then import the component under test
import '@components/ui/app-input.js'

/* global document */

describe('AppInput', () => {
  let element

  beforeEach(() => {
    element = document.createElement('app-input')
    document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
  })

  it('renders with default properties', async () => {
    await element.updateComplete

    expect(element.label).toBe('')
    expect(element.type).toBe(INPUT.TYPE.TEXT)
    expect(element.name).toBe('')
    expect(element.value).toBe('')
    expect(element.placeholder).toBe('')
    expect(element.required).toBe(false)
    expect(element.errorMessage).toBe('')
    expect(element.validationType).toBe('')
    expect(element.disabled).toBe(false)
    expect(element.mask).toBe('')
    expect(element.prefix).toBe('')

    const container = element.shadowRoot.querySelector(`.${INPUT.CLASS.CONTAINER}`)
    expect(container).toBeTruthy()

    const input = element.shadowRoot.querySelector('input')
    expect(input).toBeTruthy()
    expect(input.type).toBe(INPUT.TYPE.TEXT)
  })

  it('renders label when provided', async () => {
    const testLabel = 'Test Label'
    element.label = testLabel
    await element.updateComplete

    const label = element.shadowRoot.querySelector('label')
    expect(label).toBeTruthy()
    expect(label.textContent.trim()).toBe(testLabel)
  })

  it('renders required mark when required', async () => {
    element.label = 'Test Label'
    element.required = true
    await element.updateComplete

    const requiredMark = element.shadowRoot.querySelector(`.${INPUT.CLASS.REQUIRED_MARK}`)
    expect(requiredMark).toBeTruthy()
    expect(requiredMark.textContent).toBe('*')
  })

  it('renders with custom type', async () => {
    element.type = INPUT.TYPE.EMAIL
    await element.updateComplete

    const input = element.shadowRoot.querySelector('input')
    expect(input.type).toBe(INPUT.TYPE.EMAIL)
  })

  it('renders with placeholder', async () => {
    const placeholder = 'Enter your text'
    element.placeholder = placeholder
    await element.updateComplete

    const input = element.shadowRoot.querySelector('input')
    expect(input.placeholder).toBe(placeholder)
  })

  it('applies disabled state correctly', async () => {
    element.disabled = true
    await element.updateComplete

    const input = element.shadowRoot.querySelector('input')
    expect(input.disabled).toBe(true)
  })

  it('renders with prefix when provided', async () => {
    const prefix = '+90'
    element.prefix = prefix
    await element.updateComplete

    const prefixElement = element.shadowRoot.querySelector(`.${INPUT.CLASS.PREFIX}`)
    expect(prefixElement).toBeTruthy()
    expect(prefixElement.textContent).toBe(prefix)

    const input = element.shadowRoot.querySelector('input')
    expect(input.classList.contains(INPUT.CLASS.WITH_PREFIX)).toBe(true)
  })

  it('dispatches input event when value changes', async () => {
    const newValue = 'Test Value'
    const inputEventSpy = vi.fn()
    
    element.addEventListener(INPUT.EVENT.INPUT, inputEventSpy)
    
    // Get the input element
    const input = element.shadowRoot.querySelector('input')
    
    // Set the value and trigger input event
    input.value = newValue
    input.dispatchEvent(new Event('input', { bubbles: true }))
    
    // Wait for event to process
    await element.updateComplete
    
    expect(inputEventSpy).toHaveBeenCalled()
    expect(element.value).toBe(newValue)
  })

  it('dispatches change event on blur', async () => {
    const newValue = 'Test Value'
    const changeEventSpy = vi.fn()
    
    element.addEventListener(INPUT.EVENT.CHANGE, changeEventSpy)
    
    // Get the input element
    const input = element.shadowRoot.querySelector('input')
    
    // Set the value
    input.value = newValue
    element.value = newValue
    
    // Trigger change event
    input.dispatchEvent(new Event('change', { bubbles: true }))
    
    // Wait for event to process
    await element.updateComplete
    
    expect(changeEventSpy).toHaveBeenCalled()
  })

  it('validates required field on blur', async () => {
    element.required = true
    await element.updateComplete
    
    const validateEventSpy = vi.fn()
    element.addEventListener(INPUT.EVENT.VALIDATE, validateEventSpy)
    
    // Get the input element
    const input = element.shadowRoot.querySelector('input')
    
    // Trigger blur event without setting a value
    input.dispatchEvent(new Event('blur', { bubbles: true }))
    
    // Wait for validation to occur
    await element.updateComplete
    
    expect(validateEventSpy).toHaveBeenCalled()
    expect(element.errorMessage).not.toBe('')
    
    // Check that error class is applied
    const container = element.shadowRoot.querySelector(`.${INPUT.CLASS.CONTAINER}`)
    expect(container.classList.contains(INPUT.CLASS.ERROR)).toBe(true)
  })

  it('validates email field with correct format', async () => {
    element.validationType = INPUT.VALIDATION_TYPE.EMAIL
    await element.updateComplete
    
    // Get the input element
    const input = element.shadowRoot.querySelector('input')
    
    // Set invalid email and validate directly
    element.value = 'invalid-email'
    const invalidResult = element.validate()
    
    // Wait for validation to occur
    await element.updateComplete
    
    // Check validation results for invalid email
    expect(invalidResult).toBe(false)
    expect(element.errorMessage).not.toBe('')
    
    // Now test with valid email
    element.value = 'valid@example.com'
    const validResult = element.validate()
    
    // Wait for validation to occur
    await element.updateComplete
    
    // Check validation results for valid email
    expect(validResult).toBe(true)
    expect(element.errorMessage).toBe('')
  })

  it('manual validation works via validate() method', async () => {
    element.required = true
    await element.updateComplete
    
    const validateEventSpy = vi.fn()
    element.addEventListener(INPUT.EVENT.VALIDATE, validateEventSpy)
    
    // Call validate method directly
    const isValid = element.validate()
    
    // Wait for validation to occur
    await element.updateComplete
    
    expect(validateEventSpy).toHaveBeenCalled()
    expect(isValid).toBe(false)
    expect(element.errorMessage).not.toBe('')
  })
})