# OperatorOnboarding Stepper Form - Architecture Design

## Executive Summary

This document outlines the comprehensive architecture for transforming the [`OperatorOnboarding`](component.js) web component into a robust multi-step stepper form with validations. The design focuses on maintainability, extensibility, and user experience while maintaining the simplicity of vanilla web components.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architectural Goals](#architectural-goals)
3. [State Management Architecture](#state-management-architecture)
4. [Validation System Architecture](#validation-system-architecture)
5. [Stepper Navigation Logic](#stepper-navigation-logic)
6. [Form Data Structure](#form-data-structure)
7. [UI Component Breakdown](#ui-component-breakdown)
8. [Technical Specifications](#technical-specifications)
9. [Implementation Considerations](#implementation-considerations)
10. [Recommendations](#recommendations)

---

## Current State Analysis

### Existing Implementation

The current [`OperatorOnboarding`](component.js) component demonstrates a basic multi-step form pattern with the following characteristics:

**Strengths:**
- Uses Shadow DOM for encapsulation
- Basic step progression logic
- FormData API for collecting form values
- Custom event emission for parent communication
- Simple, understandable structure

**Limitations:**
- No validation system
- Hardcoded HTML strings in steps array
- No backward navigation
- No field-level error handling
- No loading states or async operations
- Limited accessibility features
- Duplicated styles across steps
- No state persistence between steps

### Key Patterns Identified

1. **Template-based rendering**: Each step is a string template
2. **Event-driven progression**: Form submission triggers step changes
3. **Data accumulation**: [`operatorData`](component.js:81) object merges data from all steps
4. **Shadow DOM re-rendering**: [`innerHTML`](component.js:107) replacement for step transitions

---

## Architectural Goals

1. **Maintainability**: Separate concerns (rendering, validation, state management)
2. **Extensibility**: Easy to add/remove steps or fields
3. **User Experience**: Clear feedback, intuitive navigation, progressive disclosure
4. **Type Safety**: Well-defined data structures
5. **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
6. **Performance**: Minimize re-renders, efficient validation

---

## State Management Architecture

### State Structure

```javascript
{
  // Current step index (0-based)
  currentStep: 0,
  
  // Total number of steps
  totalSteps: 4,
  
  // Form data organized by step
  formData: {
    step1: { /* business details */ },
    step2: { representatives: [] },
    step3: { /* bank details */ },
    step4: { /* underwriting */ }
  },
  
  // Validation state per step
  validationState: {
    step1: { isValid: false, errors: {} },
    step2: { isValid: true, errors: {} }, // Optional step
    step3: { isValid: false, errors: {} },
    step4: { isValid: false, errors: {} }
  },
  
  // Step completion tracking
  completedSteps: new Set(),
  
  // UI state
  uiState: {
    isLoading: false,
    showErrors: false
  }
}
```

### State Management Pattern

**Centralized State Object:**
- Single source of truth for all component state
- Immutable updates using spread operators
- Computed properties for derived state

**State Update Flow:**
```
User Action → Validation → State Update → Re-render → DOM Update
```

**Key Methods:**
- [`setState(newState)`](component.js): Merge new state and trigger re-render
- [`getStepData(stepIndex)`](component.js): Get data for specific step
- [`setStepData(stepIndex, data)`](component.js): Update step data
- [`markStepComplete(stepIndex)`](component.js): Mark step as completed
- [`resetStep(stepIndex)`](component.js): Clear step data and validation

---

## Validation System Architecture

### Validation Strategy

**Custom Validators Pattern:**
- Lightweight, no external dependencies
- Synchronous validation for immediate feedback
- Composable validator functions
- Field-level and form-level validation

### Validator Structure

```javascript
const validators = {
  // Required field validator
  required: (value, fieldName) => ({
    isValid: value && value.trim().length > 0,
    error: `${fieldName} is required`
  }),
  
  // Email validator
  email: (value) => ({
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    error: 'Please enter a valid email address'
  }),
  
  // US Phone validator (flexible format)
  usPhone: (value) => {
    const cleaned = value.replace(/\D/g, '');
    return {
      isValid: cleaned.length === 10,
      error: 'Please enter a valid 10-digit U.S. phone number'
    };
  },
  
  // Routing number validator (9 digits)
  routingNumber: (value) => {
    const cleaned = value.replace(/\D/g, '');
    return {
      isValid: cleaned.length === 9,
      error: 'Routing number must be 9 digits'
    };
  },
  
  // Account number validator
  accountNumber: (value) => {
    const cleaned = value.replace(/\D/g, '');
    return {
      isValid: cleaned.length >= 4 && cleaned.length <= 17,
      error: 'Account number must be 4-17 digits'
    };
  },
  
  // URL validator
  url: (value) => {
    try {
      new URL(value);
      return { isValid: true, error: '' };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  },
  
  // Postal code validator (5 or 9 digits)
  postalCode: (value) => {
    const cleaned = value.replace(/\D/g, '');
    return {
      isValid: cleaned.length === 5 || cleaned.length === 9,
      error: 'Please enter a valid 5 or 9-digit ZIP code'
    };
  }
};
```

### Field Configuration

Each field will have validation rules defined:

```javascript
const fieldConfig = {
  businessEmail: {
    label: 'Business Email',
    type: 'email',
    validators: ['required', 'email'],
    placeholder: 'business@example.com'
  },
  businessPhoneNumber: {
    label: 'Business Phone',
    type: 'tel',
    validators: ['required', 'usPhone'],
    placeholder: '(555) 123-4567',
    formatOnBlur: true // Auto-format to (555) 123-4567
  },
  routingNumber: {
    label: 'Routing Number',
    type: 'text',
    validators: ['required', 'routingNumber'],
    placeholder: '123456789',
    maxLength: 9
  }
};
```

### Validation Execution

**When to Validate:**
1. **On blur**: Validate individual field when user leaves it
2. **On submit**: Validate entire step before progression
3. **On input** (optional): Real-time validation for immediate feedback

**Validation Flow:**
```
Field Value Change
    ↓
Get Field Config
    ↓
Run Validators in Sequence
    ↓
Stop on First Failure (OR collect all errors)
    ↓
Update Validation State
    ↓
Render Error Messages
```

---

## Stepper Navigation Logic

### Step Definitions

```javascript
const STEPS = [
  {
    id: 'business-details',
    title: 'Business Information',
    description: 'Provide your business details',
    canSkip: false,
    requiresValidation: true,
    hasAsyncOperation: false
  },
  {
    id: 'representatives',
    title: 'Business Representatives',
    description: 'Add business representatives (optional)',
    canSkip: true,
    requiresValidation: false, // Optional but validates if filled
    hasAsyncOperation: false
  },
  {
    id: 'bank-details',
    title: 'Bank Account',
    description: 'Link your bank account',
    canSkip: false,
    requiresValidation: true,
    hasAsyncOperation: false
  },
  {
    id: 'underwriting',
    title: 'Underwriting',
    description: 'Upload required documents',
    canSkip: false,
    requiresValidation: true,
    hasAsyncOperation: false
  }
];
```

### Navigation Methods

```javascript
// Navigate to next step
async goToNextStep() {
  // 1. Validate current step
  const isValid = await this.validateCurrentStep();
  if (!isValid) {
    this.setState({ uiState: { showErrors: true } });
    return;
  }
  
  // 2. Mark step complete
  this.markStepComplete(this.state.currentStep);
  
  // 3. Progress to next step
  if (this.state.currentStep < this.state.totalSteps - 1) {
    this.setState({
      currentStep: this.state.currentStep + 1,
      uiState: { showErrors: false }
    });
  } else {
    this.handleFormCompletion();
  }
}

// Navigate to previous step
goToPreviousStep() {
  if (this.state.currentStep > 0) {
    this.setState({ 
      currentStep: this.state.currentStep - 1,
      uiState: { showErrors: false }
    });
  }
}

// Navigate to specific step (only if already completed)
goToStep(stepIndex) {
  if (this.state.completedSteps.has(stepIndex) || stepIndex < this.state.currentStep) {
    this.setState({ 
      currentStep: stepIndex,
      uiState: { showErrors: false }
    });
  }
}

// Skip optional step
skipStep() {
  if (STEPS[this.state.currentStep].canSkip) {
    this.markStepComplete(this.state.currentStep);
    this.goToNextStep();
  }
}
```

### Navigation UI Component

```
┌─────────────────────────────────────────┐
│  ○━━━━━━━━○━━━━━━━━○━━━━━━━━○          │
│  Step 1    Step 2    Step 3    Step 4   │
│ (Active) (Complete) (Pending) (Pending) │
└─────────────────────────────────────────┘
```

**Visual States:**
- **Completed**: Green checkmark, clickable
- **Active**: Blue circle, current step indicator
- **Pending**: Gray circle, not yet accessible
- **Optional**: Badge or label indicating skippable

---

## Form Data Structure

### Comprehensive Data Model

```javascript
{
  // Step 1: Business Details
  businessDetails: {
    businessName: '',
    doingBusinessAs: '', // Optional
    businessWebsite: '',
    businessPhoneNumber: '',
    businessEmail: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    }
  },
  
  // Step 2: Representatives (Array of objects)
  representatives: [
    {
      id: 'uuid-v4', // Unique identifier
      firstName: '',
      lastName: '',
      jobTitle: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: ''
      }
    }
  ],
  
  // Step 3: Bank Details
  bankDetails: {
    accountHolderName: '',
    accountType: 'checking' | 'savings',
    routingNumber: '',
    accountNumber: ''
  },
  
  // Step 4: Underwriting
  underwriting: {
    underwritingDocuments: [] // Array of File objects
  },
  
  // Metadata
  metadata: {
    createdAt: '2025-11-07T06:10:00Z',
    lastModifiedAt: '2025-11-07T06:15:00Z',
    completionPercentage: 75,
    currentStepId: 'representatives'
  }
}
```

### Data Normalization

**Benefits:**
- Flat structure for easy access
- Grouped by logical sections
- Nested objects for complex data (addresses)
- Arrays for repeatable items (representatives)

**Data Access Pattern:**
```javascript
// Get specific section
this.state.formData.businessDetails.businessName

// Update specific field
this.setStepData(2, {
  ...this.state.formData.businessDetails,
  businessName: 'New Value'
});
```

---

## UI Component Breakdown

### Component Hierarchy

```
OperatorOnboarding (Web Component)
├── StepperHeader
│   ├── StepIndicator (x4)
│   └── ProgressBar
├── StepContainer
│   ├── Step1: VerificationForm
│   │   ├── EmailInput
│   │   ├── VerifyButton
│   │   └── LoadingSpinner
│   ├── Step2: BusinessDetailsForm
│   │   ├── TextInput (x5)
│   │   ├── PhoneInput
│   │   └── AddressFields
│   ├── Step3: RepresentativesForm
│   │   ├── RepresentativeCard[] (dynamic)
│   │   │   ├── FormFields
│   │   │   └── RemoveButton
│   │   └── AddRepresentativeButton
│   └── Step4: BankDetailsForm
│       ├── TextInput (x2)
│       ├── SelectInput (account type)
│       └── NumberInput (x2)
└── NavigationFooter
    ├── BackButton
    ├── SkipButton (conditional)
    └── NextButton / SubmitButton
```

### Render Methods Architecture

```javascript
class OperatorOnboarding extends HTMLElement {
  // Main render method
  render() {
    this.shadowRoot.innerHTML = `
      ${this.renderStyles()}
      <div class="onboarding-container">
        ${this.renderStepperHeader()}
        ${this.renderCurrentStep()}
        ${this.renderNavigationFooter()}
      </div>
    `;
    this.attachEventListeners();
  }
  
  // Stepper header
  renderStepperHeader() {
    return `
      <div class="stepper-header">
        ${STEPS.map((step, index) => this.renderStepIndicator(step, index)).join('')}
      </div>
    `;
  }
  
  // Individual step indicator
  renderStepIndicator(step, index) {
    const isComplete = this.state.completedSteps.has(index);
    const isCurrent = this.state.currentStep === index;
    const isClickable = isComplete || index < this.state.currentStep;
    
    return `
      <div class="step-indicator ${isCurrent ? 'active' : ''} ${isComplete ? 'complete' : ''}"
           ${isClickable ? `data-step="${index}"` : ''}>
        <div class="step-circle">
          ${isComplete ? '✓' : index + 1}
        </div>
        <div class="step-label">${step.title}</div>
      </div>
    `;
  }
  
  // Current step content
  renderCurrentStep() {
    const stepId = STEPS[this.state.currentStep].id;
    
    switch(stepId) {
      case 'business-details':
        return this.renderBusinessDetailsStep();
      case 'representatives':
        return this.renderRepresentativesStep();
      case 'bank-details':
        return this.renderBankDetailsStep();
      case 'underwriting':
        return this.renderUnderwritingStep();
    }
  }
  
  // Representatives step with CRUD
  renderRepresentativesStep() {
    const representatives = this.state.formData.representatives;
    
    return `
      <div class="step-content">
        <h2>Business Representatives</h2>
        <p>Add business representatives (optional)</p>
        
        <div class="representatives-list">
          ${representatives.map((rep, index) => this.renderRepresentativeCard(rep, index)).join('')}
        </div>
        
        <button type="button" class="add-representative-btn">
          + Add Representative
        </button>
      </div>
    `;
  }
  
  // Individual representative card
  renderRepresentativeCard(representative, index) {
    return `
      <div class="representative-card" data-index="${index}">
        <div class="card-header">
          <h3>Representative ${index + 1}</h3>
          <button type="button" class="remove-btn" data-index="${index}">Remove</button>
        </div>
        <div class="card-body">
          ${this.renderField({ name: 'firstName', label: 'First Name', value: representative.firstName })}
          ${this.renderField({ name: 'lastName', label: 'Last Name', value: representative.lastName })}
          ${this.renderField({ name: 'jobTitle', label: 'Job Title', value: representative.jobTitle })}
          ${this.renderField({ name: 'phone', label: 'Phone', type: 'tel', value: representative.phone })}
          ${this.renderField({ name: 'email', label: 'Email', type: 'email', value: representative.email })}
          ${this.renderField({ name: 'dateOfBirth', label: 'Date of Birth', type: 'date', value: representative.dateOfBirth })}
          <!-- Address fields -->
        </div>
      </div>
    `;
  }
  
  // Reusable field renderer
  renderField({ name, label, type = 'text', value = '', error = '', readOnly = false, placeholder = '' }) {
    return `
      <div class="form-field ${error ? 'has-error' : ''}">
        <label for="${name}">${label}</label>
        <input 
          type="${type}" 
          id="${name}" 
          name="${name}" 
          value="${value}"
          ${readOnly ? 'readonly' : ''}
          ${placeholder ? `placeholder="${placeholder}"` : ''}
        />
        ${error ? `<span class="error-message">${error}</span>` : ''}
      </div>
    `;
  }
  
  // Navigation footer
  renderNavigationFooter() {
    const isFirstStep = this.state.currentStep === 0;
    const isLastStep = this.state.currentStep === this.state.totalSteps - 1;
    const canSkip = STEPS[this.state.currentStep].canSkip;
    
    return `
      <div class="navigation-footer">
        ${!isFirstStep ? '<button type="button" class="btn-back">Back</button>' : ''}
        ${canSkip ? '<button type="button" class="btn-skip">Skip</button>' : ''}
        <button type="button" class="btn-next">
          ${isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    `;
  }
}
```

### Styling Architecture

**CSS Structure:**
- Base styles (typography, colors, spacing)
- Layout styles (stepper, grid, flexbox)
- Component styles (buttons, inputs, cards)
- State styles (active, error, disabled)
- Responsive styles

**CSS Variables for Theming:**
```css
:host {
  --primary-color: #007bff;
  --success-color: #28a745;
  --error-color: #dc3545;
  --border-color: #ddd;
  --border-radius: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

---

## Technical Specifications

### Step 2: Representative CRUD Operations

```javascript
// Add new representative
addRepresentative() {
  const newRep = {
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    jobTitle: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: { street: '', city: '', state: '', postalCode: '' }
  };
  
  this.setState({
    formData: {
      representatives: [...this.state.formData.representatives, newRep]
    }
  });
}

// Update representative
updateRepresentative(index, field, value) {
  const representatives = [...this.state.formData.representatives];
  representatives[index] = {
    ...representatives[index],
    [field]: value
  };
  
  this.setState({ formData: { representatives } });
}

// Remove representative
removeRepresentative(index) {
  const representatives = this.state.formData.representatives.filter((_, i) => i !== index);
  this.setState({ formData: { representatives } });
}

// Validate representative (if any field is filled, all required fields must be filled)
validateRepresentative(representative) {
  const hasAnyValue = Object.values(representative).some(v => v && v.trim());
  if (!hasAnyValue) return { isValid: true, errors: {} }; // Empty is OK
  
  // If any value exists, validate all required fields
  const errors = {};
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  
  requiredFields.forEach(field => {
    if (!representative[field] || !representative[field].trim()) {
      errors[field] = `${field} is required`;
    }
  });
  
  return { 
    isValid: Object.keys(errors).length === 0, 
    errors 
  };
}
```

### Phone Number Formatting

```javascript
// Format phone number on blur
formatPhoneNumber(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  }
  return value;
}

// Handle phone input
handlePhoneInput(event) {
  const input = event.target;
  const formatted = this.formatPhoneNumber(input.value);
  input.value = formatted;
}
```

### Event Handling Pattern

```javascript
attachEventListeners() {
  const shadow = this.shadowRoot;
  
  // Form inputs
  shadow.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', (e) => this.handleFieldBlur(e));
    input.addEventListener('input', (e) => this.handleFieldInput(e));
  });
  
  // Navigation buttons
  shadow.querySelector('.btn-next')?.addEventListener('click', () => this.goToNextStep());
  shadow.querySelector('.btn-back')?.addEventListener('click', () => this.goToPreviousStep());
  shadow.querySelector('.btn-skip')?.addEventListener('click', () => this.skipStep());
  
  // Step indicators (for navigation)
  shadow.querySelectorAll('[data-step]').forEach(indicator => {
    indicator.addEventListener('click', (e) => {
      const stepIndex = parseInt(e.currentTarget.dataset.step);
      this.goToStep(stepIndex);
    });
  });
  
  // Representative CRUD
  shadow.querySelector('.add-representative-btn')?.addEventListener('click', () => this.addRepresentative());
  shadow.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      this.removeRepresentative(index);
    });
  });
}
```

---

## Implementation Considerations

### Accessibility (a11y)

**ARIA Attributes:**
```html
<!-- Stepper -->
<div role="navigation" aria-label="Form steps">
  <div role="list">
    <div role="listitem" aria-current="step">Step 1</div>
  </div>
</div>

<!-- Form fields -->
<input 
  type="email" 
  aria-required="true"
  aria-invalid="false"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">Error message</span>

<!-- Loading state -->
<div role="status" aria-live="polite" aria-label="Verifying email...">
  <div class="spinner"></div>
</div>
```

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for step navigation (optional)
- Escape to cancel operations

### Performance Optimization

1. **Debouncing**: For real-time validation
2. **Event Delegation**: Single listener for dynamic elements
3. **Selective Re-rendering**: Only update changed portions
4. **Lazy Validation**: Validate on-demand, not on every keystroke

### Error Handling

```javascript
handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  
  // Show user-friendly message
  this.setState({
    uiState: {
      error: {
        message: 'Something went wrong. Please try again.',
        context
      }
    }
  });
  
  // Optional: Send to error tracking service
  // trackError(error, context);
}
```

### Browser Compatibility

- Use standard Web Components APIs (supported in modern browsers)
- Polyfills not required for evergreen browsers
- Shadow DOM v1 support
- CSS custom properties support

---

## Recommendations

### Phase 1: Core Implementation
1. Build state management system
2. Implement basic step navigation
3. Create form rendering for all steps
4. Add field-level validation

### Phase 2: Enhanced Features
1. Add representative CRUD functionality
2. Implement phone number formatting
3. Add accessibility features

### Phase 3: Polish & Optimization
1. Refine UI/UX with transitions
2. Add comprehensive error handling
3. Optimize performance
4. Add unit tests

### Testing Strategy

**Unit Tests:**
- Validation functions
- State management methods
- Data transformation utilities

**Integration Tests:**
- Step navigation flow
- Form submission
- Representative CRUD operations

**E2E Tests:**
- Complete onboarding flow
- Error scenarios
- Backward navigation

### Code Organization

```
component.js
├── Class Definition
├── Constructor & Lifecycle
├── State Management
│   ├── setState()
│   ├── getStepData()
│   └── setStepData()
├── Validation
│   ├── validators object
│   ├── validateField()
│   └── validateStep()
├── Navigation
│   ├── goToNextStep()
│   ├── goToPreviousStep()
│   └── goToStep()
├── Representative CRUD
│   ├── addRepresentative()
│   ├── updateRepresentative()
│   └── removeRepresentative()
├── Rendering
│   ├── render()
│   ├── renderStepperHeader()
│   ├── renderCurrentStep()
│   ├── renderBusinessDetailsStep()
│   ├── renderRepresentativesStep()
│   ├── renderBankDetailsStep()
│   ├── renderUnderwritingStep()
│   └── renderNavigationFooter()
├── Event Handling
│   ├── attachEventListeners()
│   ├── handleFieldBlur()
│   └── handleFieldInput()
└── Utilities
    ├── formatPhoneNumber()
    └── getFieldError()
```

---

## Conclusion

This architecture provides a comprehensive blueprint for transforming the [`OperatorOnboarding`](component.js) component into a robust, user-friendly stepper form. The design emphasizes:

- **Maintainability** through clear separation of concerns
- **Scalability** with extensible validation and state management
- **User Experience** with intuitive navigation and feedback
- **Code Quality** with well-defined patterns and best practices

The proposed architecture can be implemented incrementally, allowing for iterative development and testing at each phase.

---

## Appendix

### State Diagram

```
┌─────────────┐
│ Step 1      │
│ (Business)  │──────┐
└─────────────┘      │
                     ↓ (validate & next)
              ┌─────────────┐
              │ Step 2      │
              │ (Reps)      │──────┐
              └─────────────┘      │
                     ↑             ↓ (next or skip)
                     │      ┌─────────────┐
                  (back)    │ Step 3      │
                     │      │ (Bank)      │──────┐
                     │      └─────────────┘      │
                     │             ↑             ↓ (validate & next)
                     │             │      ┌─────────────┐
                     │          (back)    │ Step 4      │
                     │             │      │(Underwrite) │
                     │             │      └─────────────┘
                     │             │             │
                     │             │             ↓ (submit)
                     │             │      ┌─────────────┐
                     └─────────────┴──────┤  Complete   │
                                          └─────────────┘
```

### Field Summary Table

| Step | Field Name | Type | Validation | Optional |
|------|-----------|------|-----------|----------|
| 1 | businessName | text | required | No |
| 1 | doingBusinessAs | text | - | Yes |
| 1 | ein | text | required, ein | No |
| 1 | businessWebsite | url | url | Yes |
| 1 | businessPhoneNumber | tel | required, usPhone | No |
| 1 | businessEmail | email | required, email | No |
| 1 | businessStreet | text | required | No |
| 1 | businessCity | text | required | No |
| 1 | businessState | text | required | No |
| 1 | businessPostalCode | text | required, postalCode | No |
| 2 | representatives[] | array | conditional | Yes (entire step) |
| 3 | accountHolderName | text | required | No |
| 3 | accountType | select | required | No |
| 3 | routingNumber | text | required, routingNumber | No |
| 3 | accountNumber | text | required, accountNumber | No |
| 4 | underwritingDocuments | file | required | No |

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-07  
**Author:** Architecture Team