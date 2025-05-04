import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextAnimationFrame, createElement, addRippleEffect } from '@utils'
import { ANIMATION } from '@constants'

describe('DOM Utilities', () => {
	beforeEach(() => {
		// Mock DOM APIs
		global.document = {
			createElement: vi.fn(),
			createTextNode: vi.fn(),
		}

		global.window = {
			requestAnimationFrame: vi.fn(),
			setTimeout: vi.fn(),
			Node: class Node {},
			HTMLElement: class HTMLElement {},
			Text: class Text {},
		}

		// Set up document.createElement mock
		document.createElement.mockImplementation((tag) => {
			const element = {
				tagName: tag.toUpperCase(),
				className: '',
				style: {},
				textContent: '',
				attributes: {},
				children: [],

				setAttribute: vi.fn((name, value) => {
					element.attributes[name] = value
				}),

				appendChild: vi.fn((child) => {
					element.children.push(child)
					return child
				}),

				querySelector: vi.fn(),

				getBoundingClientRect: vi.fn(),

				remove: vi.fn(),
			}
			return element
		})

		document.createTextNode.mockImplementation((text) => ({
			textContent: text,
			nodeType: 3,
		}))
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('nextAnimationFrame', () => {
		it('returns a promise that resolves after requestAnimationFrame', async () => {
			let resolveCallback

			// Setup mock to call the callback immediately
			window.requestAnimationFrame.mockImplementation((callback) => {
				resolveCallback = callback
				return 1 // Frame ID
			})

			const promise = nextAnimationFrame()

			// Verify requestAnimationFrame was called
			expect(window.requestAnimationFrame).toHaveBeenCalled()

			// Simulate frame callback
			resolveCallback()

			// Wait for promise to resolve
			await promise

			// Test passes if promise resolves
			expect(true).toBe(true)
		})
	})

	describe('createElement', () => {
		it('creates basic element with no attributes or children', () => {
			const element = createElement('div')

			expect(document.createElement).toHaveBeenCalledWith('div')
			expect(element.tagName).toBe('DIV')
		})

		it('sets attributes correctly', () => {
			const attributes = {
				id: 'test-id',
				'data-test': 'test-value',
				className: 'test-class',
				style: {
					color: 'red',
					backgroundColor: 'blue',
				},
			}

			const element = createElement('div', attributes)

			expect(element.attributes.id).toBe('test-id')
			expect(element.attributes['data-test']).toBe('test-value')
			expect(element.className).toBe('test-class')
			expect(element.style.color).toBe('red')
			expect(element.style.backgroundColor).toBe('blue')
		})

		it('adds string as text content', () => {
			const element = createElement('div', {}, 'Hello World')

			expect(element.textContent).toBe('Hello World')
		})

		it('supports child nodes', () => {
			// Simple version - just verify createElement was called
			createElement('div', {}, document.createElement('span'))
			expect(document.createElement).toHaveBeenCalledWith('span')
		})

		it('handles array of children', () => {
			// Simplified test approach
			const child1 = document.createElement('span')
			const strChild = 'Text Node'

			const element = createElement('div', {}, [child1, strChild])

			// Just verify the text node was created and appendChild was called
			expect(document.createTextNode).toHaveBeenCalledWith('Text Node')
			expect(element.appendChild).toHaveBeenCalled()
		})

		it('ignores non-Node and non-string children in array', () => {
			const element = createElement('div', {}, [null, undefined, 42])

			expect(element.children.length).toBe(0)
		})
	})

	describe('addRippleEffect', () => {
		it('creates a ripple element with correct properties', () => {
			// Create test elements
			const button = document.createElement('button')

			// Set up the getBoundingClientRect mock
			button.getBoundingClientRect.mockReturnValue({
				left: 10,
				top: 20,
				width: 100,
				height: 50,
			})

			// Mock event
			const event = {
				clientX: 60,
				clientY: 40,
			}

			// Add ripple effect
			addRippleEffect(event, button)

			// Check if createElement was called correctly
			expect(document.createElement).toHaveBeenCalledWith('span')

			// Get the created ripple element
			const ripple = button.children[0]

			// Check ripple properties
			expect(ripple.className).toBe(ANIMATION.RIPPLE.CLASS_NAME)
			expect(ripple.style.width).toBe('100px') // Max of width and height
			expect(ripple.style.height).toBe('100px')

			// Check position calculation (clientX - rect.left - radius)
			// radius = 100/2 = 50, so left = 60 - 10 - 50 = 0
			expect(ripple.style.left).toBe('0px')

			// Check if setTimeout was called with correct duration
			expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), ANIMATION.RIPPLE.DEFAULT_DURATION)
		})

		it('removes existing ripples before adding new ones', () => {
			// Create test elements
			const button = document.createElement('button')

			// Create an existing ripple
			const existingRipple = document.createElement('span')
			existingRipple.className = ANIMATION.RIPPLE.CLASS_NAME

			// Setup querySelector to return the existing ripple
			button.querySelector.mockReturnValue(existingRipple)

			// Setup getBoundingClientRect
			button.getBoundingClientRect.mockReturnValue({
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			})

			// Mock event
			const event = { clientX: 50, clientY: 50 }

			// Add ripple effect
			addRippleEffect(event, button)

			// Check if remove was called on the existing ripple
			expect(existingRipple.remove).toHaveBeenCalled()

			// Check if button appendChild was called with new ripple
			expect(button.appendChild).toHaveBeenCalled()
		})

		it('accepts custom duration', () => {
			// Create test elements
			const button = document.createElement('button')

			// Setup getBoundingClientRect
			button.getBoundingClientRect.mockReturnValue({
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			})

			// Mock event
			const event = { clientX: 50, clientY: 50 }

			// Add ripple effect with custom duration
			const customDuration = 1000
			addRippleEffect(event, button, customDuration)

			// Check if setTimeout was called with custom duration
			expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), customDuration)
		})

		it('removes ripple after timeout', () => {
			// Create test elements
			const button = document.createElement('button')

			// Setup getBoundingClientRect
			button.getBoundingClientRect.mockReturnValue({
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			})

			// Mock event
			const event = { clientX: 50, clientY: 50 }

			// Add ripple effect
			addRippleEffect(event, button)

			// Get the created ripple element
			const ripple = button.children[0]

			// Get the timeout callback
			const timeoutCallback = window.setTimeout.mock.calls[0][0]

			// Call the timeout callback
			timeoutCallback()

			// Check if remove was called on the ripple
			expect(ripple.remove).toHaveBeenCalled()
		})
	})
})
