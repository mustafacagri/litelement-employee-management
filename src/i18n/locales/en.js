export function get() {
	return {
		app: {
			language: 'English',
			title: 'Employee Management',
			loading: 'Loading...',
		},
		nav: {
			home: 'Home',
			employees: 'Employees',
			addEmployee: 'Add Employee',
		},
		employee: {
			list: {
				title: 'Employee List',
				empty: 'No employees found',
				emptyStateTitle: 'No employees found',
				emptyStateMessage: 'Add a new employee to get started',
				search: 'Search employees',
				caption: 'List of all employees with their details',
				view: {
					table: 'Table View',
					card: 'Card View',
				},
				itemsPerPage: 'Employees per page',
				pagination: 'Showing {start}-{end} of {total} items',
				noSearchResults: 'No employees found matching your search',
				noSearchResultsFor: 'No employees found matching your search for',
				clearSearch: 'Clear search',
			},
			form: {
				addTitle: 'Add Employee',
				editTitle: 'Edit Employee',
				save: 'Save',
				cancel: 'Cancel',
				delete: 'Delete',
				deleteConfirm: 'Are you sure you want to delete this employee?',
				updateConfirm: 'Are you sure you want to update this employee?',
			},
			fields: {
				firstName: 'First Name',
				lastName: 'Last Name',
				dateOfEmployment: 'Date of Employment',
				dateOfBirth: 'Date of Birth',
				phoneCode: 'Country Code',
				phoneNumber: 'Phone Number',
				phone: 'Phone',
				email: 'Email Address',
				department: 'Department',
				position: 'Position',
			},
			departments: {
				analytics: 'Analytics',
				tech: 'Tech',
			},
			positions: {
				junior: 'Junior',
				medior: 'Medior',
				senior: 'Senior',
			},
			validation: {
				required: 'This field is required',
				email: 'Please enter a valid email address',
				phone: 'Please enter a valid phone number',
				date: 'Please enter a valid date',
				minDate: 'Date must be on or after {min}',
				maxDate: 'Date must be on or before {max}',
			},
		},
		actions: {
			edit: 'Edit',
			delete: 'Delete',
			confirm: 'Confirm',
			cancel: 'Cancel',
			label: 'Actions',
			editWithName: 'Edit {name}',
			deleteWithName: 'Delete {name}',
			emailEmployee: 'Send email to {name}',
			callEmployee: 'Call {name}',
		},
		ui: {
			swipe: 'Swipe to see more',
			selectOption: 'Select an option',
			selectDate: 'Select a date',
			months: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			],
			weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		},
		notifications: {
			createSuccess: 'Employee created successfully',
			updateSuccess: 'Employee updated successfully',
			deleteSuccess: 'Employee deleted successfully',
			error: 'An error occurred',
		},
		errors: {
			validation: {
				missingData: 'Required data is missing',
				missingFields: 'Missing required fields',
				requiredField: 'This field is required',
				invalidFormat: 'Invalid format',
				invalidId: 'ID is required',
			},
			data: {
				notFound: 'Record not found',
				alreadyExists: 'Record already exists',
				emailInUse: 'Email address {email} is already in use',
			},
			storage: {
				failed: 'Failed to save changes',
				readError: 'Failed to read data',
				writeError: 'Failed to write data',
			},
			userMessage: {
				checkRequiredInfo: 'Please check that all required information is provided correctly',
				emailAlreadyRegistered: 'This email address is already registered. Please use a different email',
				cannotIdentifyEmployee: 'Cannot identify the employee record. Please try again',
				savingProblem: 'There was a problem saving your changes. Please try again',
				createProblem: 'There was a problem creating the employee record. Please try again',
				updateProblem: 'There was a problem updating the employee record. Please try again',
				deleteProblem: 'There was a problem deleting the employee record. Please try again',
			},
		},
	}
}
