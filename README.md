# Operator Onboarding Web Component

A complete, self-contained web component for operator onboarding with a 4-step stepper form, validations, and success page.

## Installation

### Via CDN (jsdelivr)
```html
<script src="https://cdn.jsdelivr.net/npm/web-components-moov@1.0.3/component.js"></script>
```

### Via npm
```bash
npm install web-components-moov
```

## Basic Usage

### Minimal Setup (No Callbacks)
The simplest way to use the component:

```html
<script src="https://cdn.jsdelivr.net/npm/web-components-moov@1.0.3/component.js"></script>
<operator-onboarding></operator-onboarding>
```

When submitted, form data is automatically logged to console and success page is shown.

---

## Pre-populating Form Data

### Method 1: Direct Property Assignment (Recommended)

```javascript
const component = document.querySelector('operator-onboarding');

// Pre-populate with existing data
component.onLoad = {
  verification: {
    businessEmail: 'existing@company.com'
  },
  businessDetails: {
    businessName: 'Acme Corp',
    businessPhoneNumber: '5551234567',
    businessStreet: '123 Main St',
    businessCity: 'San Francisco',
    businessState: 'CA',
    businessPostalCode: '94105'
  },
  representatives: [
    {
      representativeFirstName: 'John',
      representativeLastName: 'Doe',
      representativeEmail: 'john@company.com'
      // ... other fields
    }
  ],
  bankDetails: {
    accountHolderName: 'Acme Corp',
    accountType: 'checking',
    routingNumber: '123456789',
    accountNumber: '987654321'
  }
};
```

### Method 2: HTML Attribute with JSON

```html
<operator-onboarding on-load='{"businessDetails":{"businessName":"Acme Corp"}}'></operator-onboarding>
```

### Method 3: HTML Attribute with Global Variable

```html
<script>
  const initialData = {
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

// Simply assign a function to the onSuccess property
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
```

### Method 2: HTML Attribute

Good for simple cases with global functions:

```html
<operator-onboarding on-success="handleSuccess"></operator-onboarding>

<script>
  function handleSuccess(data) {
    console.log('Success!', data);
    closeModal();
  }
</script>
```

### Method 3: Event Listener

Listen to the `formComplete` custom event:

```javascript
component.addEventListener('formComplete', (event) => {
  const formData = event.detail;
  console.log('Form completed!', formData);
  closeModal();
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
      // Direct property assignment
      componentRef.current.onSuccess = (data) => {
        console.log('Onboarding complete:', data);
        
        // Send to API
        fetch('/api/onboard', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        // Close modal
        onClose();
      };
    }
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <operator-onboarding ref={componentRef}></operator-onboarding>
    </div>
  );
}
```

### Alternative: Callback Ref Pattern

```jsx
function OnboardingModal({ isOpen, onClose }) {
  const handleSuccess = (data) => {
    console.log('Complete!', data);
    fetch('/api/onboard', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <operator-onboarding 
        ref={(el) => {
          if (el) el.onSuccess = handleSuccess;
        }}
      />
    </div>
  );
}
```

---

## Form Steps

### Step 1: Email Verification
- Single field: `businessEmail`
- Fake async verification (2 seconds)
- Success message display
- Auto-progression to Step 2

### Step 2: Business Details
- Business name, DBA, website
- Phone number (U.S. format with auto-formatting)
- Email (read-only from Step 1)
- Full address (street, city, state, ZIP)

### Step 3: Representatives (Optional)
- Add/remove multiple representatives
- Full CRUD interface
- All fields required if any field is filled
- Can skip entire step

### Step 4: Bank Details
- Account holder name
- Account type (checking/savings)
- Routing number (9 digits)
- Account number (4-17 digits)

---

## Data Structure

The component returns a complete data object:

```javascript
{
  "verification": {
    "businessEmail": "test@company.com"
  },
  "businessDetails": {
    "businessName": "Acme Corp",
    "doingBusinessAs": "Acme",
    "businessWebsite": "https://acme.com",
    "businessPhoneNumber": "(555) 123-4567",
    "businessEmail": "test@company.com",
    "businessStreet": "123 Main St",
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
  "bankDetails": {
    "accountHolderName": "Acme Corp",
    "accountType": "checking",
    "routingNumber": "123456789",
    "accountNumber": "987654321"
  }
}
```

---

## Features

✅ **4-Step Stepper Form** - Visual progress indicator  
✅ **Field Validation** - Real-time validation on blur  
✅ **Phone Formatting** - Auto-formats to (555) 123-4567  
✅ **Email Verification** - Fake async verification flow  
✅ **CRUD Representatives** - Add/remove multiple reps  
✅ **Success Page** - Animated completion screen  
✅ **Framework Friendly** - Easy integration with React, Vue, etc.  
✅ **Shadow DOM** - Fully encapsulated styles  
✅ **Zero Dependencies** - Pure vanilla JavaScript  

---

## Modal Integration Example

```html
<div id="onboardingModal" class="modal">
  <div class="modal-content">
    <operator-onboarding on-success="closeOnboardingModal"></operator-onboarding>
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
</script>
```

---

## API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `onSuccess` | `Function` | Callback function called when form is successfully submitted. Receives complete form data as parameter. |
| `onLoad` | `Object` | Pre-populate form fields with initial data. Accepts partial or complete form data object. |

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `on-success` | `String` | Name of global function to call on success. |
| `on-load` | `String` | JSON string or name of global variable containing initial form data. |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `formComplete` | `Object` | Emitted when form is successfully submitted. `event.detail` contains complete form data. |

### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `verifyOperator(operatorId, mockResult)` | `operatorId: string`, `mockResult: boolean` | `boolean` | Standalone function to verify if an operator exists. Used to conditionally render the onboarding form. |

---

## Operator Verification

The `verifyOperator` function allows you to check if an operator should be shown the onboarding form before rendering it.

### Usage

```javascript
// Basic usage
const isVerified = verifyOperator('OP123456', true);

if (isVerified) {
  // Show the onboarding form
  document.getElementById('onboarding-container').innerHTML = `
    <operator-onboarding></operator-onboarding>
  `;
} else {
  // Show error message
  document.getElementById('onboarding-container').innerHTML = `
    <div class="error">Operator not found or not eligible for onboarding.</div>
  `;
}
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function OnboardingPage({ operatorId }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // In a real app, you'd call your API here
    // For demo purposes, using the mock function
    const verified = window.verifyOperator(operatorId, true);
    setIsVerified(verified);
    setIsChecking(false);
  }, [operatorId]);
  
  if (isChecking) {
    return <div>Checking operator status...</div>;
  }
  
  if (!isVerified) {
    return (
      <div className="error">
        <h2>Access Denied</h2>
        <p>This operator is not eligible for onboarding.</p>
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

### Vue Example

```vue
<template>
  <div v-if="isChecking">Checking operator status...</div>
  <div v-else-if="!isVerified" class="error">
    <h2>Access Denied</h2>
    <p>This operator is not eligible for onboarding.</p>
  </div>
  <div v-else>
    <operator-onboarding></operator-onboarding>
  </div>
</template>

<script>
export default {
  props: ['operatorId'],
  data() {
    return {
      isVerified: false,
      isChecking: true
    };
  },
  mounted() {
    // In a real app, call your API here
    this.isVerified = window.verifyOperator(this.operatorId, true);
    this.isChecking = false;
  }
};
</script>
```

### Parameters

- `operatorId` (string, required): The operator ID to verify
- `mockResult` (boolean, required): Mock result for testing
  - `true`: Operator is verified (show onboarding form)
  - `false`: Operator is not verified (show error message)

### Returns

- `boolean`: `true` if operator is verified, `false` otherwise

**Note:** In production, replace `mockResult` with an actual API call to your backend to verify the operator.

---

## Complete Example: Edit Mode

Pre-populate form for editing existing operator:

```javascript
// Fetch existing operator data
fetch('/api/operators/123')
  .then(res => res.json())
  .then(existingData => {
    const component = document.querySelector('operator-onboarding');
    
    // Pre-populate with existing data
    component.onLoad = existingData;
    
    // Handle updates
    component.onSuccess = (updatedData) => {
      fetch('/api/operators/123', {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      })
      .then(() => {
        console.log('Operator updated!');
        closeModal();
      });
    };
  });
```

### React Example with Pre-populated Data

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
      // Set initial data
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

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any browser supporting Custom Elements V1 and Shadow DOM

---

## License

MIT

## Author

@kfajardo