/**
 * Global component registration file for tests
 * 
 * This file imports all components that will be used in tests.
 * It's important to register components before testing to ensure
 * custom elements are properly defined.
 * 
 * Note: Import order matters! Base components must be imported before
 * components that extend them.
 */

// First import base components to resolve dependency chain
import '@components/common/base-component.js'

// Then import feature components
import '@components/common/app-pagination.js'

// UI Components
import '@components/ui/app-button.js'
import '@components/ui/app-card.js'
import '@components/ui/app-modal.js'
import '@components/ui/app-input.js'
import '@components/ui/app-dropdown.js'
import '@components/ui/app-date-picker.js'

// Configure any global test setup here
window.customElements.define = window.customElements.define || function() {}