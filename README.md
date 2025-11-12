# Operator Onboarding Web Component

A complete, self-contained web component for operator onboarding with WIO email verification, 4-step stepper form, file uploads, validations, and success page.

## Installation

```html
<script src="https://cdn.jsdelivr.net/npm/web-components-moov@1.0.17/component.js"></script>
```

## Basic Usage

### Minimal Setup (No Callbacks)
The simplest way to use the component:

```html
<script src="https://cdn.jsdelivr.net/npm/web-components-moov@1.0.17/component.js"></script>
<operator-onboarding></operator-onboarding>
```

When submitted, form data is automatically logged to console and success page is shown.

---

## Configuration

The component can be configured with optional attributes for API integration:

```html
<operator-onboarding 
  api-base-url="https://your-api-domain.com"
  embeddable-key="your-embeddable-key">
</operator-onboarding>
```

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `api-base-url` | `String` | `https://bison-jib-development.azurewebsites.net` | Base URL for API endpoints |
| `embeddable-key` | `String` | Default key provided | Authentication key for API requests |
| `on-success` | `String` | - | Name of global function to call on success |
| `on-error` | `String` | - | Name of global function to call on error |
| `on-load` | `String` | - | JSON string or global variable name for initial data |

---

## Form Flow

The onboarding process consists of two phases:

### Phase 1: WIO Email Verification (Pre-Stepper)
Before the main form, users must verify their WIO (Wealth & Income Opportunities) email address:
- Single field: `wioEmail`
- Real-time validation
- Async verification with your API
- Error handling for invalid WIO emails
- Auto-skip if `wioEmail` is provided in `onLoad`

### Phase 2: 4-Step Stepper Form
After verification, users complete the main form:

1. **Business Details** - Company information and address
2. **Representatives** (Optional) - Add business representatives
3. **Bank Account** - Link bank account details
4. **Underwriting** - Upload required documents

---

## Form Steps in Detail

### Step 1: Business Details
- Business name *
- Doing Business As (DBA) *
- EIN (Employer Identification Number) * (auto-formatted as XX-XXXXXXX)
- Business website (auto-normalized to include https://)
- Business phone * (auto-formatted as (555) 123-4567)
- Business email *
- Full address * (street, city, state, ZIP)

### Step 2: Representatives (Optional)
- Add/remove multiple representatives
- Full CRUD interface
- Each representative requires:
  - First name, last name *
  - Job title *
  - Phone * (auto-formatted)
  - Email *
  - Date of birth *
  - Full address * (street, city, state, ZIP)
- Can skip entire step if no representatives to add

### Step 3: Bank Account
- Account holder name *
- Account type * (checking/savings)
- Routing number * (9 digits)
- Account number * (4-17 digits)

### Step 4: Underwriting
- Upload supporting documents * (required)
- Drag-and-drop or browse file selection
- Maximum 10 files
- Maximum 10MB per file
- Accepted formats: PDF, JPG, JPEG, PNG, DOC, DOCX

---

## Pre-populating Form Data

### Method 1: Direct Property Assignment (Recommended)

```javascript
const component = document.querySelector('operator-onboarding');

// Pre-populate with existing data
component.onLoad = {
  wioEmail: 'existing@wio-company.com',  // Auto-skips verification
  businessDetails: {
    businessName: 'Acme Corp',
    doingBusinessAs: 'Acme',
    ein: '12-3456789',
    businessWebsite: 'https://acme.com',
    businessPhoneNumber: '5551234567',
    businessEmail: 'contact@acme.com',
    BusinessAddress1: '123 Main St',
    businessCity: 'San Francisco',
    businessState: 'CA',
    businessPostalCode: '94105'
  },
  representatives: [
    {
      representativeFirstName: 'John',
      representativeLastName: 'Doe',
      representativeJobTitle: 'CEO',
      representativePhone: '5559876543',
      representativeEmail: 'john@company.com',
      representativeDateOfBirth: '1980-01-15',
      representativeAddress: '456 Oak Ave',
      representativeCity: 'San Francisco',
      representativeState: 'CA',
      representativeZip: '94105'
    }
  ],
  underwriting: {
    underwritingDocuments: []  // Can be pre-populated with File objects
  },
  bankDetails: {
    bankAccountHolderName: 'Acme Corp',
    bankAccountType: 'checking',
    bankRoutingNumber: '123456789',
    bankAccountNumber: '987654321'
  }
};
```

**Note:** If you provide `wioEmail` in `onLoad`, the verification step will be automatically skipped, and the user will proceed directly to the stepper form.

### Method 2: HTML Attribute with JSON

```html
<operator-onboarding on-load='{"wioEmail":"test@wio.com","businessDetails":{"businessName":"Acme Corp"}}'></operator-onboarding>
```

### Method 3: HTML Attribute with Global Variable

```html
<script>
  const initialData = {
    wioEmail: 'test@wio.com',
    businessDetails: {
      businessName: 'Acme Corp',
      businessEmail: 'test@company.com'
    }
  };
</script>

<operator-onboarding on-load="initialData"></operator-onboarding>
```

---

## Advanced Usage with Callbacks

### Method 1: Direct Property Assignment (Recommended for Frameworks)

**Perfect for React, Vue, Angular, and vanilla JavaScript:**

```javascript
const component = document.querySelector('operator-onboarding');

// Success callback
component.onSuccess = (formData) => {
  console.log('Onboarding complete!', formData);
  
  // Send to your backend
  fetch('/api/operators/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  // Close your modal
  closeModal();
};

// Error callback
component.onError = (errorData) => {
  console.error('Onboarding error:', errorData);
  
  if (errorData.action === 'resubmit') {
    // User clicked resubmit button
    console.log('User wants to retry submission');
  }
};
```

### Method 2: HTML Attribute

Good for simple cases with global functions:

```html
<operator-onboarding 
  on-success="handleSuccess"
  on-error="handleError">
</operator-onboarding>

<script>
  function handleSuccess(data) {
    console.log('Success!', data);
    closeModal();
  }
  
  function handleError(errorData) {
    console.error('Error:', errorData);
  }
</script>
```

### Method 3: Event Listeners

Listen to custom events:

```javascript
// Success event
component.addEventListener('formComplete', (event) => {
  const formData = event.detail;
  console.log('Form completed!', formData);
  closeModal();
});

// Verification failure event
component.addEventListener('verificationFailed', (event) => {
  const errorData = event.detail;
  console.error('Verification failed:', errorData);
});

// Submission failure event
component.addEventListener('submissionFailed', (event) => {
  const errorData = event.detail;
  console.error('Submission failed:', errorData);
});
```

---

## React Integration

### Recommended Pattern (Using useRef)

```jsx
import { useEffect, useRef } from 'react';

function OnboardingModal({ isOpen, onClose }) {
  const componentRef = useRef(null);
  
  useEffect(() => {
    if (componentRef.current) {
      // Success handler
      componentRef.current.onSuccess = (data) => {
        console.log('Onboarding complete:', data);
        
        // Send to API
        fetch('/api/onboard', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        onClose();
      };
      
      // Error handler
      componentRef.current.onError = (errorData) => {
        console.error('Error:', errorData);
        // Handle errors appropriately
      };
    }
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <operator-onboarding 
        ref={componentRef}
        api-base-url="https://your-api.com"
        embeddable-key="your-key">
      </operator-onboarding>
    </div>
  );
}
```

### With Pre-populated Data

```jsx
function EditOperatorModal({ operatorId, isOpen, onClose }) {
  const componentRef = useRef(null);
  const [initialData, setInitialData] = useState(null);
  
  useEffect(() => {
    if (isOpen && operatorId) {
      // Fetch existing operator data
      fetch(`/api/operators/${operatorId}`)
        .then(res => res.json())
        .then(data => setInitialData(data));
    }
  }, [isOpen, operatorId]);
  
  useEffect(() => {
    if (componentRef.current) {
      // Pre-populate form
      if (initialData) {
        componentRef.current.onLoad = initialData;
      }
      
      // Set success handler
      componentRef.current.onSuccess = (updatedData) => {
        fetch(`/api/operators/${operatorId}`, {
          method: 'PUT',
          body: JSON.stringify(updatedData)
        });
        onClose();
      };
    }
  }, [initialData, operatorId, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <operator-onboarding ref={componentRef} />
    </div>
  );
}
```

---

## Data Structure

The component returns a complete data object:

```javascript
{
  "verification": {
    "wioEmail": "test@wio-company.com"
  },
  "businessDetails": {
    "businessName": "Acme Corp",
    "doingBusinessAs": "Acme",
    "ein": "12-3456789",
    "businessWebsite": "https://acme.com",
    "businessPhoneNumber": "(555) 123-4567",
    "businessEmail": "contact@acme.com",
    "BusinessAddress1": "123 Main St",
    "businessCity": "San Francisco",
    "businessState": "CA",
    "businessPostalCode": "94105"
  },
  "representatives": [
    {
      "id": "uuid-here",
      "representativeFirstName": "John",
      "representativeLastName": "Doe",
      "representativeJobTitle": "CEO",
      "representativePhone": "(555) 987-6543",
      "representativeEmail": "john@company.com",
      "representativeDateOfBirth": "1980-01-15",
      "representativeAddress": "456 Oak Ave",
      "representativeCity": "San Francisco",
      "representativeState": "CA",
      "representativeZip": "94105"
    }
  ],
  "underwriting": {
    "underwritingDocuments": [
      // Array of File objects
      File { name: "document.pdf", size: 1234567, type: "application/pdf" }
    ]
  },
  "bankDetails": {
    "bankAccountHolderName": "Acme Corp",
    "bankAccountType": "checking",
    "bankRoutingNumber": "123456789",
    "bankAccountNumber": "987654321"
  }
}
```

---

## Features

✅ **WIO Email Verification** - Pre-stepper email validation  
✅ **4-Step Stepper Form** - Visual progress indicator  
✅ **Field Validation** - Real-time validation on blur  
✅ **Auto-Formatting** - Phone numbers, EIN, URLs  
✅ **File Upload** - Drag-and-drop with validation  
✅ **CRUD Representatives** - Add/remove multiple reps  
✅ **Error Handling** - Verification and submission failures  
✅ **Success Page** - Animated completion screen  
✅ **Framework Friendly** - Easy integration with React, Vue, etc.  
✅ **Shadow DOM** - Fully encapsulated styles  
✅ **Zero Dependencies** - Pure vanilla JavaScript  
✅ **API Integration** - Ready for backend integration  

---

## API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `onSuccess` | `Function` | Callback function called when form is successfully submitted. Receives complete form data as parameter. |
| `onError` | `Function` | Callback function called when verification or submission fails. Receives error data as parameter. |
| `onLoad` | `Object` | Pre-populate form fields with initial data. Accepts partial or complete form data object. If `wioEmail` is provided, verification is automatically skipped. |
| `apiBaseURL` | `String` | Base URL for API endpoints. |
| `embeddableKey` | `String` | Authentication key for API requests. |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `formComplete` | `Object` | Emitted when form is successfully submitted. `event.detail` contains complete form data. |
| `verificationFailed` | `Object` | Emitted when WIO email verification fails. `event.detail` contains error information. |
| `submissionFailed` | `Object` | Emitted when form submission fails. `event.detail` contains error information. |

### Global Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `verifyWIO(wioEmail, mockResult)` | `wioEmail: string`, `mockResult: boolean` | `boolean` | Verify if a WIO email is valid before rendering the form. |
| `verifyOperator(operatorEmail, mockResult)` | `operatorEmail: string`, `mockResult: boolean` | `boolean` | Verify if an operator email exists. |

---

## WIO Email Verification

The component requires WIO email verification before the main form. You can also verify WIO emails programmatically before rendering the component.

### Usage

```javascript
// Check if WIO email is valid before showing form
const isValid = verifyWIO('wio@example.com', true);

if (isValid) {
  // Show the onboarding form
  document.getElementById('container').innerHTML = `
    <operator-onboarding></operator-onboarding>
  `;
} else {
  // Show error message
  document.getElementById('container').innerHTML = `
    <div class="error">Invalid WIO email. Please contact support.</div>
  `;
}
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function OnboardingPage({ wioEmail }) {
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // In production, call your API here
    const valid = window.verifyWIO(wioEmail, true);
    setIsValid(valid);
    setIsChecking(false);
  }, [wioEmail]);
  
  if (isChecking) {
    return <div>Verifying WIO email...</div>;
  }
  
  if (!isValid) {
    return (
      <div className="error">
        <h2>Invalid WIO Email</h2>
        <p>This WIO email is not recognized.</p>
      </div>
    );
  }
  
  return (
    <div className="onboarding-container">
      <operator-onboarding />
    </div>
  );
}
```

### Parameters

- `wioEmail` (string, required): The WIO email to verify
- `mockResult` (boolean, required): Mock result for testing
  - `true`: Email is valid (proceed)
  - `false`: Email is invalid (show error)

### Returns

- `boolean`: `true` if valid, `false` otherwise

**Note:** In production, replace `mockResult` with actual API integration.

---

## Operator Verification

Similar to WIO verification, you can verify operator emails:

```javascript
// Check if operator exists
const exists = verifyOperator('operator@company.com', true);

if (exists) {
  // Proceed with operation
  console.log('Operator verified');
} else {
  // Show error
  console.error('Operator not found');
}
```

---

## Error Handling

The component provides comprehensive error handling:

### Verification Failures

When WIO email verification fails:

```javascript
component.addEventListener('verificationFailed', (event) => {
  const { email, message, timestamp } = event.detail;
  console.error('Verification failed:', message);
  // Show custom error UI
});

// Or use callback
component.onError = (errorData) => {
  if (errorData.message.includes('WIO email')) {
    // Handle verification error
  }
};
```

### Submission Failures

When form submission fails:

```javascript
component.addEventListener('submissionFailed', (event) => {
  const { formData, message, timestamp } = event.detail;
  console.error('Submission failed:', message);
  // Retry or show error
});

// Or use callback
component.onError = (errorData) => {
  if (errorData.action === 'resubmit') {
    // User clicked resubmit button
    // Your retry logic here
  }
};
```

---

## Modal Integration Example

```html
<div id="onboardingModal" class="modal">
  <div class="modal-content">
    <operator-onboarding 
      on-success="closeOnboardingModal"
      on-error="handleOnboardingError">
    </operator-onboarding>
  </div>
</div>

<script>
  function closeOnboardingModal(data) {
    console.log('Onboarding complete for:', data.businessDetails.businessName);
    
    // Close modal
    document.getElementById('onboardingModal').style.display = 'none';
    
    // Send data to backend
    fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
  
  function handleOnboardingError(errorData) {
    console.error('Onboarding error:', errorData);
    // Show error notification
  }
</script>
```

---

## File Upload Validation

The underwriting step includes file upload with the following restrictions:

- **Maximum files:** 10
- **Maximum size per file:** 10MB
- **Allowed formats:** PDF, JPG, JPEG, PNG, DOC, DOCX
- **Validation:** Real-time with error messages

Files are validated on both drag-and-drop and browse selection. Invalid files are rejected with clear error messages.

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any browser supporting Custom Elements V1 and Shadow DOM

---

## BisonJibPayAPI - Direct API Access

In addition to the web component, you can use the `BisonJibPayAPI` class directly for API integration without the UI. This is useful when you need to interact with the BisonJibPay API programmatically.

### Installation & Import

The API class is automatically exported when you load the component:

```javascript
// ES Module
import { BisonJibPayAPI } from './component.js';

// Or access from window (script tag)
const BisonJibPayAPI = window.BisonJibPayAPI;
```

### Basic Usage

```javascript
// Create API instance
const api = new BisonJibPayAPI(
  'https://bison-jib-development.azurewebsites.net',
  'YOUR_EMBEDDABLE_KEY'
);

// Validate WIO email
try {
  const result = await api.validateWIOEmail('wio@example.com');
  console.log('WIO email is valid:', result);
} catch (error) {
  console.error('Validation failed:', error);
}

// Validate operator email
try {
  const result = await api.validateOperatorEmail('operator@example.com');
  console.log('Operator email is valid:', result);
} catch (error) {
  console.error('Validation failed:', error);
}

// Register operator
const formData = new FormData();
formData.append('businessName', 'Acme Corp');
formData.append('businessEmail', 'contact@acme.com');
// ... add more fields

try {
  const result = await api.registerOperator(formData);
  console.log('Operator registered successfully:', result);
} catch (error) {
  console.error('Registration failed:', error);
}
```

### API Methods

#### `validateWIOEmail(email)`
Validates a WIO email address.

**Parameters:**
- `email` (string) - The WIO email address to validate

**Returns:**
- Promise resolving to the API response

**Example:**
```javascript
const result = await api.validateWIOEmail('wio@company.com');
```

#### `validateOperatorEmail(email)`
Validates an operator email address.

**Parameters:**
- `email` (string) - The operator email address to validate

**Returns:**
- Promise resolving to the API response

**Example:**
```javascript
const result = await api.validateOperatorEmail('operator@company.com');
```

#### `registerOperator(formData)`
Registers a new operator with complete form data.

**Parameters:**
- `formData` (FormData) - FormData object containing all operator information

**Returns:**
- Promise resolving to the API response

**Example:**
```javascript
const formData = new FormData();
formData.append('businessName', 'Acme Corp');
formData.append('businessEmail', 'contact@acme.com');
formData.append('ein', '12-3456789');
// ... add all required fields

const result = await api.registerOperator(formData);
```

### React Integration Example

```jsx
import { useEffect, useState } from 'react';
import { BisonJibPayAPI } from './component.js';

function EmailValidator() {
  const [api] = useState(() => new BisonJibPayAPI(
    'https://bison-jib-development.azurewebsites.net',
    'YOUR_KEY'
  ));
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = async () => {
    setIsLoading(true);
    try {
      await api.validateWIOEmail(email);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      console.error('Validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter WIO email"
      />
      <button onClick={validateEmail} disabled={isLoading}>
        {isLoading ? 'Validating...' : 'Validate'}
      </button>
      {isValid !== null && (
        <p>{isValid ? '✓ Valid' : '✗ Invalid'}</p>
      )}
    </div>
  );
}
```

### Error Handling

The API methods throw structured errors that you can catch:

```javascript
try {
  await api.validateWIOEmail('invalid@email.com');
} catch (error) {
  console.error('Status:', error.status);
  console.error('Message:', error.data.message);
  console.error('Errors:', error.data.errors);
}
```

Error structure:
```javascript
{
  status: 400,  // HTTP status code
  data: {
    success: false,
    message: "Validation failed",
    errors: ["Email does not exist in our system"]
  }
}
```

### Using with Different Environments

```javascript
// Development
const devApi = new BisonJibPayAPI(
  'https://bison-jib-development.azurewebsites.net',
  'DEV_KEY'
);

// Production
const prodApi = new BisonJibPayAPI(
  'https://bison-jib-production.azurewebsites.net',
  'PROD_KEY'
);

// Use environment variables
const api = new BisonJibPayAPI(
  process.env.REACT_APP_API_URL,
  process.env.REACT_APP_EMBEDDABLE_KEY
);
```

---

## API Integration

The component is designed to work with the BisonJibPay API. Configure your endpoints:

```html
<operator-onboarding
  api-base-url="https://your-api-domain.com"
  embeddable-key="your-embeddable-key">
</operator-onboarding>
```

### API Endpoints Used

- `POST /api/embeddable/validate/operator-email` - Validate operator email
- `POST /api/embeddable/validate/wio-email` - Validate WIO email
- `POST /api/embeddable/operator-registration` - Register operator with form data

---

## License

MIT

## Author

@kfajardo