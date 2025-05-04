import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components/layout/app-nav.js'

describe('AppNav', () => {
	let element

	beforeEach(async () => {
		// Mock window.location.pathname
		Object.defineProperty(window, 'location', {
			value: { pathname: '/' },
			writable: true,
		})

		// Spy on event listeners BEFORE creating the component
		vi.spyOn(window, 'addEventListener')
		vi.spyOn(window, 'removeEventListener')

		// Create the component
		element = document.createElement('app-nav')
		document.body.appendChild(element)
		await element.updateComplete

		// Spy on event listeners
		vi.spyOn(window, 'addEventListener')
		vi.spyOn(window, 'removeEventListener')
	})

	afterEach(() => {
		if (element && element.parentNode) {
			element.parentNode.removeChild(element)
		}
		vi.clearAllMocks()
	})

	it('renders navigation with correct structure', async () => {
		// Check nav container exists
		const nav = element.shadowRoot.querySelector('nav')
		expect(nav).toBeTruthy()

		// Check logo exists and has correct href
		const logo = element.shadowRoot.querySelector('.logo')
		expect(logo).toBeTruthy()
		expect(logo.getAttribute('href')).toBe('/')

		// Check nav links exist
		const navLinks = element.shadowRoot.querySelectorAll('.nav-links .nav-link')
		expect(navLinks.length).toBeGreaterThan(0)

		// Check first link is active (because we mocked pathname as '/')
		expect(navLinks[0].classList.contains('active')).toBe(true)

		// Check mobile menu exists but is not open
		const mobileMenu = element.shadowRoot.querySelector('.mobile-menu')
		expect(mobileMenu).toBeTruthy()
		expect(mobileMenu.classList.contains('open')).toBe(false)
	})

	it('toggles mobile menu when button is clicked', async () => {
		// Initial state is closed
		expect(element.mobileMenuOpen).toBe(false)

		// Find and click menu button
		const menuButton = element.shadowRoot.querySelector('.mobile-menu-button')
		menuButton.click()
		await element.updateComplete

		// Menu should now be open
		expect(element.mobileMenuOpen).toBe(true)

		// Mobile menu should have open class
		const mobileMenu = element.shadowRoot.querySelector('.mobile-menu')
		expect(mobileMenu.classList.contains('open')).toBe(true)

		// Button should show close icon
		expect(menuButton.textContent.trim()).toBe('✕')
		expect(menuButton.getAttribute('aria-expanded')).toBe('true')

		// Click again to close
		menuButton.click()
		await element.updateComplete

		// Menu should be closed again
		expect(element.mobileMenuOpen).toBe(false)
		expect(mobileMenu.classList.contains('open')).toBe(false)
		expect(menuButton.textContent.trim()).toBe('☰')
		expect(menuButton.getAttribute('aria-expanded')).toBe('false')
	})

	it('handles route changes and listens for navigation events', async () => {
		// Force connectedCallback to be called
		element.disconnectedCallback()

		// Spy on window listeners after component is created
		vi.spyOn(window, 'addEventListener')

		// Explicitly call connectedCallback to trigger the event listener
		element.connectedCallback()

		// Check that event listener is added for route changes
		expect(window.addEventListener).toHaveBeenCalledWith('vaadin-router-location-changed', element._onRouteChanged)

		// Mock a route change event
		const routeEvent = new CustomEvent('vaadin-router-location-changed')

		// Open mobile menu first
		element.mobileMenuOpen = true
		await element.updateComplete

		// Simulate route change
		window.dispatchEvent(routeEvent)

		// Menu should now be closed again
		expect(element.mobileMenuOpen).toBe(false)

		// Change location to test active state updates
		window.location.pathname = '/employee/new'

		// Simulate route change again
		element.requestUpdate = vi.fn()
		window.dispatchEvent(routeEvent)

		// Should have called requestUpdate to refresh the active states
		expect(element.requestUpdate).toHaveBeenCalled()

		// Check disconnectedCallback removes event listener
		element.disconnectedCallback()
		expect(window.removeEventListener).toHaveBeenCalledWith('vaadin-router-location-changed', element._onRouteChanged)
	})
})
