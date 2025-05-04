import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MODAL } from '@constants'
// First import the base component to resolve the dependency chain
import '@components/common/base-component.js'
// Then import the component under test
import '@components/ui/app-modal.js'

/* global document, window */

describe('AppModal', () => {
  let element
  let originalBodyStyle

  beforeEach(() => {
    // Save original body style
    originalBodyStyle = document.body.style.overflow
    
    element = document.createElement('app-modal')
    document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
    
    // Restore original body style
    document.body.style.overflow = originalBodyStyle
  })

  it('renders with default properties', async () => {
    const content = 'Modal Content'
    element.innerHTML = content
    await element.updateComplete

    expect(element.title).toBe('')
    expect(element.open).toBe(false)
    expect(element.closable).toBe(true)
    expect(element.size).toBe(MODAL.SIZE.MEDIUM)

    const modalBackdrop = element.shadowRoot.querySelector('.modal-backdrop')
    expect(modalBackdrop).toBeTruthy()
    
    const modalContainer = element.shadowRoot.querySelector('.modal-container')
    expect(modalContainer).toBeTruthy()
    expect(modalContainer.classList.contains(`size-${MODAL.SIZE.MEDIUM}`)).toBe(true)
    
    // Title should be empty
    const modalTitle = element.shadowRoot.querySelector('.modal-title')
    expect(modalTitle.textContent.trim()).toBe('')
  })

  it('renders with title when provided', async () => {
    const title = 'Modal Title'
    element.title = title
    await element.updateComplete

    const modalTitle = element.shadowRoot.querySelector('.modal-title')
    expect(modalTitle.textContent.trim()).toBe(title)
  })

  it('applies size class correctly', async () => {
    element.size = MODAL.SIZE.LARGE
    await element.updateComplete

    const modalContainer = element.shadowRoot.querySelector('.modal-container')
    expect(modalContainer.classList.contains(`size-${MODAL.SIZE.LARGE}`)).toBe(true)
  })

  it('shows close button when closable is true', async () => {
    element.closable = true
    await element.updateComplete

    const closeButton = element.shadowRoot.querySelector('.close-button')
    expect(closeButton).toBeTruthy()
  })

  it('hides close button when closable is false', async () => {
    element.closable = false
    await element.updateComplete

    const closeButton = element.shadowRoot.querySelector('.close-button')
    expect(closeButton).toBeFalsy()
  })

  it('shows modal when show() is called', async () => {
    expect(element.open).toBe(false)
    
    element.show()
    await element.updateComplete
    
    expect(element.open).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes modal when close() is called', async () => {
    // First open the modal
    element.show()
    await element.updateComplete
    expect(element.open).toBe(true)
    
    // Then close it
    element.close()
    await element.updateComplete
    
    expect(element.open).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('does not close modal when closable is false', async () => {
    element.closable = false
    element.show()
    await element.updateComplete
    expect(element.open).toBe(true)
    
    element.close()
    await element.updateComplete
    
    // Modal should still be open
    expect(element.open).toBe(true)
  })

  it('dispatches modal-open event when show() is called', async () => {
    let eventFired = false
    element.addEventListener(MODAL.EVENT.OPEN, () => {
      eventFired = true
    })
    
    element.show()
    
    expect(eventFired).toBe(true)
  })

  it('dispatches modal-close event when close() is called', async () => {
    let eventFired = false
    element.addEventListener(MODAL.EVENT.CLOSE, () => {
      eventFired = true
    })
    
    // First open the modal
    element.show()
    await element.updateComplete
    
    // Then close it
    element.close()
    
    expect(eventFired).toBe(true)
  })

  it('closes when backdrop is clicked and closable is true', async () => {
    element.closable = true
    element.show()
    await element.updateComplete
    
    const backdrop = element.shadowRoot.querySelector('.modal-backdrop')
    const event = new MouseEvent('click', {
      bubbles: true,
      composed: true
    })
    
    // Mock the event.target and currentTarget to be the backdrop
    Object.defineProperty(event, 'target', { value: backdrop })
    Object.defineProperty(event, 'currentTarget', { value: backdrop })
    
    backdrop.dispatchEvent(event)
    await element.updateComplete
    
    expect(element.open).toBe(false)
  })

  it('does not close when modal content is clicked', async () => {
    element.closable = true
    element.show()
    await element.updateComplete
    
    const backdrop = element.shadowRoot.querySelector('.modal-backdrop')
    const container = element.shadowRoot.querySelector('.modal-container')
    const event = new MouseEvent('click', {
      bubbles: true,
      composed: true
    })
    
    // Mock the event.target to be the container, but currentTarget is still the backdrop
    Object.defineProperty(event, 'target', { value: container })
    Object.defineProperty(event, 'currentTarget', { value: backdrop })
    
    backdrop.dispatchEvent(event)
    await element.updateComplete
    
    expect(element.open).toBe(true)
  })

  it('closes when escape key is pressed and closable is true', async () => {
    element.closable = true
    element.show()
    await element.updateComplete
    
    const event = new KeyboardEvent('keydown', {
      key: MODAL.KEY.ESCAPE,
      bubbles: true
    })
    
    document.dispatchEvent(event)
    await element.updateComplete
    
    expect(element.open).toBe(false)
  })

  it('does not close when escape key is pressed and closable is false', async () => {
    element.closable = false
    element.show()
    await element.updateComplete
    
    const event = new KeyboardEvent('keydown', {
      key: MODAL.KEY.ESCAPE,
      bubbles: true
    })
    
    document.dispatchEvent(event)
    await element.updateComplete
    
    expect(element.open).toBe(true)
  })

  it('renders slotted content correctly', async () => {
    const slottedContent = '<p>Paragraph inside modal</p><button>Action Button</button>'
    element.innerHTML = slottedContent
    await element.updateComplete

    const slot = element.shadowRoot.querySelector('.modal-body slot')
    expect(slot).toBeTruthy()
  })

  it('renders footer slot correctly', async () => {
    const footerContent = '<button slot="footer">Save</button><button slot="footer">Cancel</button>'
    element.innerHTML = footerContent
    await element.updateComplete

    const footerSlot = element.shadowRoot.querySelector('.modal-footer slot[name="footer"]')
    expect(footerSlot).toBeTruthy()
  })
})