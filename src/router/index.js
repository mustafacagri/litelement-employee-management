import { Router } from '@vaadin/router'

// Define application routes
const routes = [
	{
		path: '/',
		component: 'employee-list-view',
		action: () => import('@views/employee-list-view.js'),
	},
	{
		path: '/employee/new',
		component: 'employee-form-view',
		action: () => import('@views/employee-form-view.js'),
	},
	{
		path: '/employee/:id/edit',
		component: 'employee-form-view',
		action: () => import('@views/employee-form-view.js'),
	},
	{
		path: '(.*)',
		component: 'not-found-view',
		action: () => import('@views/not-found-view.js'),
	},
]

/**
 * Initializes the router
 *
 * @param {HTMLElement} outlet - The router outlet element
 * @returns {Router} The initialized router instance
 */
export function initRouter(outlet) {
	// Create router instance
	const router = new Router(outlet)

	// Add transition hooks for page animations
	router.ready.then(() => {
		// Add page transition classes
		const addPageTransitionClasses = () => {
			const currentPage = outlet.querySelector('.page')
			if (currentPage) {
				currentPage.classList.add('page-enter')
				setTimeout(() => {
					currentPage.classList.add('page-enter-active')
					currentPage.classList.remove('page-enter')
				}, 50)
			}
		}

		// Handle initial page load
		addPageTransitionClasses()

		// Create navigation event listener to handle page transitions
		window.addEventListener('vaadin-router-location-changed', () => {
			const oldPage = outlet.querySelector('.page')

			if (oldPage) {
				// Start exit animation
				oldPage.classList.add('page-exit')
				setTimeout(() => {
					oldPage.classList.add('page-exit-active')
				}, 50)

				// After exit animation completes, handle new page
				setTimeout(() => {
					// Wait for page transition to complete before adding enter classes to new page
					setTimeout(addPageTransitionClasses, 50)
				}, 300) // Slightly longer than the animation duration
			} else {
				// If no previous page, just add enter classes
				setTimeout(addPageTransitionClasses, 50)
			}
		})
	})

	// Set routes
	router.setRoutes(routes)
	return router
}

export default routes
