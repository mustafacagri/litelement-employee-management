# 🚀 LitElement Employee Management App

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-stable-green)
![Tech](https://img.shields.io/badge/tech-LitElement-pink)

A modern, responsive employee management application built with LitElement and Web Components. This application helps HR staff manage company employee information with ease.

## ✨ Features

- 📋 List, filter and search employees
- 👥 Add new employee records
- ✏️ Edit existing employee information
- 🗑️ Delete employee records
- 🔄 Toggle between table and card views
- 📱 Fully responsive design
- 🌐 Localization support (English and Turkish)
- 🔍 Field validation
- 🧩 Modular and reusable component architecture

## 🛠️ Technology Stack

- **Web Components** with [LitElement](https://lit.dev/)
- **Routing** with [Vaadin Router](https://vaadin.com/router)
- **Module Bundling** with [Vite](https://vitejs.dev/)
- **Testing** with Web Test Runner
- **CSS Custom Properties** for theming

## 🎥 Demo Video

https://github.com/user-attachments/assets/d2e9532b-51b4-48bb-9936-0a6ea6ed830f

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start development server
yarn dev
```

### Build

```bash
# Build for production
yarn build
```

### Testing

```bash
# Run all tests
yarn test

# Run specific tests
yarn test -- --group <file-pattern>
```

## 📊 Sample Data

The application includes a sample data generator that populates the app with employee records for testing purposes. Sample data is automatically added if no existing data is found.

### How Sample Data Works

- The app checks for existing employee data in local storage
- If no data exists, it generates a set of sample employees
- Sample data includes random names, emails, departments, and other required fields
- You can view the sample data generation in the browser console

### Disabling Sample Data

If you prefer to start with an empty database, you can reset the storage by clearing your browser's local storage:

1. Open your browser's developer tools (F12)
2. Navigate to the "Application" tab
3. Select "Local Storage" in the sidebar
4. Right-click on the application's URL and select "Clear"

## 🌍 Localization

The application supports multiple languages:

- 🇺🇸 English (default)
- 🇹🇷 Turkish

Language is automatically detected from the browser settings but can be changed using the language selector in the application.

## 📱 Responsive Design

The app is designed to work on various screen sizes:

- 📱 Mobile: < 768px
- 💻 Tablet: 768px - 1024px
- 🖥️ Desktop: > 1024px

No external CSS frameworks are used - all responsive layouts are implemented with CSS Grid and Flexbox.

## 🧪 Testing

The application has extensive test coverage:

```bash
# Run tests with coverage report
yarn test
```

### ✅ Test Results

- 📊 **Test Files**: 23 passed (23 total)
- 🧩 **Tests**: 177 passed (177 total)
- 🚀 **Components Tested**: UI elements, services, utilities, and employee management features

## 📦 Project Structure

```
project/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Generic components
│   │   ├── employee/     # Employee-specific components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI element components
│   ├── constants/        # Application constants
│   │   ├── animation/    # Animation constants
│   │   ├── domain/       # Domain-specific constants
│   │   ├── event/        # Event constants
│   │   ├── format/       # Formatting constants
│   │   ├── localization/ # Localization constants
│   │   ├── routing/      # Routing constants
│   │   ├── storage/      # Storage constants
│   │   ├── ui/           # UI constants
│   │   └── validation/   # Validation constants
│   ├── i18n/             # Localization
│   ├── models/           # Data models
│   ├── router/           # Application routing
│   ├── services/         # Business logic and services
│   ├── stores/           # State management
│   ├── styles/           # Global styles and theme
│   ├── utils/            # Utility functions
│   ├── views/            # Page views
│   ├── app.js            # Main app component
│   └── index.js          # Application entry point
├── test/                 # Test files
├── index.html            # Entry HTML file
└── vite.config.js        # Vite configuration
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## 📜 License

This project is licensed under the MIT License.
