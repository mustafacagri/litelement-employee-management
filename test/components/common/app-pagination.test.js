import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@components'

describe('AppPagination', () => {
	let element

	beforeEach(async () => {
		// Create the element
		element = document.createElement('app-pagination')
		document.body.appendChild(element)

		// Wait for element to be fully initialized
		await element.updateComplete

		// Spy on the dispatch method
		vi.spyOn(element, 'dispatch')
	})

	afterEach(() => {
		// Remove the element from the DOM
		if (element && element.parentNode) {
			element.parentNode.removeChild(element)
		}

		// Clear all mocks
		vi.clearAllMocks()
	})

	describe('properties', () => {
		it('has default property values', () => {
			expect(element.totalItems).toBe(0)
			expect(element.pageSize).toBe(10)
			expect(element.currentPage).toBe(1)
			expect(element.visiblePages).toBe(5)
		})

		it('reflects property changes', async () => {
			element.totalItems = 100
			element.pageSize = 20
			element.currentPage = 2
			element.visiblePages = 3

			await element.updateComplete

			expect(element.totalItems).toBe(100)
			expect(element.pageSize).toBe(20)
			expect(element.currentPage).toBe(2)
			expect(element.visiblePages).toBe(3)
		})
	})

	describe('rendering', () => {
		it('renders pagination buttons', async () => {
			element.totalItems = 100
			element.pageSize = 10
			await element.updateComplete

			const buttons = element.shadowRoot.querySelectorAll('button')

			// Should have first, prev, page numbers, next, last
			expect(buttons.length).toBeGreaterThan(4)
		})

		it('disables prev/first buttons on first page', async () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 1
			await element.updateComplete

			const buttons = Array.from(element.shadowRoot.querySelectorAll('button'))
			const firstButton = buttons[0]
			const prevButton = buttons[1]

			expect(firstButton.hasAttribute('disabled')).toBe(true)
			expect(prevButton.hasAttribute('disabled')).toBe(true)
		})

		it('disables next/last buttons on last page', async () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 10
			await element.updateComplete

			const buttons = Array.from(element.shadowRoot.querySelectorAll('button'))
			const nextButton = buttons[buttons.length - 2]
			const lastButton = buttons[buttons.length - 1]

			expect(nextButton.hasAttribute('disabled')).toBe(true)
			expect(lastButton.hasAttribute('disabled')).toBe(true)
		})

		it('applies active class to current page button', async () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 3
			await element.updateComplete

			const pageButtons = Array.from(element.shadowRoot.querySelectorAll('button.page-number'))
			const activeButton = pageButtons.find((btn) => btn.classList.contains('active'))

			expect(activeButton).toBeTruthy()
			expect(activeButton.textContent.trim()).toBe('3')
		})
	})

	describe('_getVisiblePages', () => {
		it('returns correct pages for middle range', () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 5
			element.visiblePages = 5

			const pages = element._getVisiblePages(10)

			// Should include first and last page with current in middle
			expect(pages).toContain(1)
			expect(pages).toContain(5)
			expect(pages).toContain(10)
		})

		it('handles first pages correctly', () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 1
			element.visiblePages = 3

			const pages = element._getVisiblePages(10)

			// Should include first pages
			expect(pages[0]).toBe(1)
			// Note: The implementation always includes ellipsis if needed,
			// so we're just checking the first element is 1
			expect(pages).toContain(10)
		})

		it('handles last pages correctly', () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 10
			element.visiblePages = 3

			const pages = element._getVisiblePages(10)

			// Should include last pages without ellipsis at end
			expect(pages[0]).toBe(1)
			expect(pages[pages.length - 1]).toBe(10)
		})
	})

	describe('events', () => {
		it('fires page-change event when page changes', async () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 1
			await element.updateComplete

			// Find the "Next" button (usually 4th button)
			const buttons = Array.from(element.shadowRoot.querySelectorAll('button'))
			const nextButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Next page')

			// Click the next button
			nextButton.click()

			// Should dispatch page-change event
			expect(element.dispatch).toHaveBeenCalledWith('page-change', {
				page: 2,
				pageSize: 10,
			})
		})

		it('updates currentPage when a page button is clicked', async () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 1
			await element.updateComplete

			// Find page 3 button
			const pageButtons = Array.from(element.shadowRoot.querySelectorAll('button.page-number'))
			const page3Button = pageButtons.find((btn) => btn.textContent.trim() === '3')

			// Click page 3
			page3Button.click()

			// Should update current page
			expect(element.currentPage).toBe(3)
			expect(element.dispatch).toHaveBeenCalledWith('page-change', {
				page: 3,
				pageSize: 10,
			})
		})
	})

	describe('_getPageInfoText', () => {
		it('returns formatted page info text', () => {
			element.totalItems = 100
			element.pageSize = 10
			element.currentPage = 2

			const infoText = element._getPageInfoText()

			// Should show items 11-20 of 100
			expect(infoText).toContain('11')
			expect(infoText).toContain('20')
			expect(infoText).toContain('100')
		})

		it('handles case where currentPage * pageSize > totalItems', () => {
			element.totalItems = 95
			element.pageSize = 10
			element.currentPage = 10

			const infoText = element._getPageInfoText()

			// Should show items 91-95 of 95
			expect(infoText).toContain('91')
			expect(infoText).toContain('95')
			expect(infoText).toContain('95')
		})
	})
})
