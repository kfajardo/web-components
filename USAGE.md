# BisonJibPay Web Components - Usage Guide

Complete guide for integrating BisonJibPay web components into your application.

## 📦 Installation Options

### Option 1: Barrel Export (Recommended for Simplicity)

Use the barrel export file that loads all components via imports:

```html
<!-- Load all components via barrel export -->
<script type="module" src="https://cdn.your-domain.com/component.js"></script>

<!-- Use components -->
<operator-onboarding id="onboarding"></operator-onboarding>
<operator-payment id="payment"></operator-payment>
```

**Benefits:**
- ✅ Simple single import
- ✅ Leverages native ES modules
- ✅ Browser caching per component
- ✅ All components included

**Note:** This requires `type="module"` and loads `api.js`, `operator-onboarding.js`, and `operator-payment.js` via ES module imports.

### Option 2: Individual Files (Development)

Load components separately for better development experience:

```html
<!-- Load dependencies in order -->
<script src="api.js"></script>
<script src="operator-onboarding.js"></script>
<script src="operator-payment.js"></script>

<!-- Use components -->
<operator-onboarding id="onboarding"></operator-onboarding>
<operator-payment id="payment"></operator-payment>
```

**Benefits:**
- ✅ Better code organization
- ✅ Selective loading (load only what you need)
- ✅ Better caching
- ✅ Easier debugging

### Option 3: ES Modules (Modern Build Tools)

For Webpack, Vite, Rollup, etc.:

```javascript
// Import from barrel export (loads all components)
import { BisonJibPayAPI } from './component.js';
// Components auto-register when imported

// Or import specific components
import { BisonJibPayAPI } from './api.js';
import './operator-onboarding.js';
import './operator-payment.js';
```

---

## 🏗️ Component: Operator Onboarding

Multi-step onboarding form for capturing operator information.

### Basic Usage

```html
<operator-onboarding 
  id="onboarding"
  api-base-url="https://your-api.com"
  embeddable-key="your-key-here">
</operator-onboarding>

<script>
  const onboarding = document.getElementById('onboarding');
  
  // Success callback
  onboarding.onSuccess = (formData) => {
    console.log('Onboarding completed!', formData);
    // formData contains: businessDetails, representatives, bankDetails, underwriting
  };
  
  // Error callback
  onboarding.onError = (error) => {
    console.error('Onboarding failed:', error);
  };
</script>
```

### With Pre-filled Data

```html
<operator-onboarding id="onboarding"></operator-onboarding>

<script>
  const onboarding = document.getElementById('onboarding');
  
  // Load existing data
  onboarding.onLoad = {
    businessDetails: {
      businessName: "Acme Corp",
      businessEmail: "info@acme.com",
      businessPhoneNumber: "(555) 123-4567",
      // ... other fields
    },
    representatives: [
      {
        representativeFirstName: "John",
        representativeLastName: "Doe",
        representativeEmail: "john@acme.com",
        // ... other fields
      }
    ]
  };
</script>
```

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `api-base-url` | string | `https://bison-jib-development.azurewebsites.net` | API base URL |
| `embeddable-key` | string | (dev key) | Your embeddable API key |
| `on-success` | string | - | Global function name for success callback |
| `on-error` | string | - | Global function name for error callback |

### Properties

```javascript
const onboarding = document.getElementById('onboarding');

// Callbacks
onboarding.onSuccess = (data) => { /* ... */ };
onboarding.onError = (error) => { /* ... */ };

// Pre-fill data
onboarding.onLoad = { /* data object */ };
```

### Events

```javascript
// Custom events (bubbles and composed)
onboarding.addEventListener('formComplete', (event) => {
  console.log('Form completed:', event.detail);
});

onboarding.addEventListener('submissionFailed', (event) => {
  console.log('Submission failed:', event.detail);
});
```

---

## 💳 Component: Operator Payment

Payment methods integration using Moov's drop-in component.

### Basic Usage

```html
<operator-payment 
  id="payment"
  api-base-url="https://your-api.com"
  embeddable-key="your-key-here">
</operator-payment>

<script>
  const payment = document.getElementById('payment');
  
  // Set operator email
  payment.operatorEmail = 'operator@example.com';
  
  // Success callback
  payment.onSuccess = (result) => {
    console.log('Payment method added!', result);
  };
  
  // Error callback
  payment.onError = ({ errorType, error }) => {
    console.error(`Error (${errorType}):`, error);
  };
  
  // Open the payment modal
  payment.open = true;
</script>
```

### Programmatic Control

```javascript
const payment = document.getElementById('payment');

// Set email and open
payment.operatorEmail = 'user@example.com';
payment.open = true;

// Check if open
console.log(payment.open); // true/false

// Close programmatically
payment.open = false;
```

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `operator-email` | string | - | Operator's email address |
| `api-base-url` | string | `https://bison-jib-development.azurewebsites.net` | API base URL |
| `embeddable-key` | string | (dev key) | Your embeddable API key |
| `on-success` | string | - | Global function name for success callback |
| `on-error` | string | - | Global function name for error callback |
| `open` | boolean | false | Whether the modal is open |

### Properties

```javascript
const payment = document.getElementById('payment');

// Email (triggers initialization when set)
payment.operatorEmail = 'user@example.com';

// Open state
payment.open = true;

// Callbacks
payment.onSuccess = (result) => { /* ... */ };
payment.onError = ({ errorType, error }) => { /* ... */ };
```

### Events

```javascript
payment.addEventListener('payment-error', (event) => {
  const { errorType, error } = event.detail;
  console.error(`Payment error (${errorType}):`, error);
});
```

---

## 🔧 BisonJibPayAPI

Direct API access for custom integrations.

### Usage

```javascript
// Initialize API
const api = new BisonJibPayAPI(
  'https://your-api.com',
  'your-embeddable-key'
);

// Validate operator email
try {
  const result = await api.validateOperatorEmail('operator@example.com');
  console.log('Email valid:', result);
} catch (error) {
  console.error('Validation failed:', error);
}

// Register operator
const formData = new FormData();
formData.append('businessName', 'Acme Corp');
// ... add other fields

try {
  const result = await api.registerOperator(formData);
  console.log('Registration successful:', result);
} catch (error) {
  console.error('Registration failed:', error);
}

// Generate Moov token
try {
  const tokenData = await api.generateMoovToken('operator@example.com');
  console.log('Token:', tokenData.access_token);
} catch (error) {
  console.error('Token generation failed:', error);
}
```

### Methods

#### `validateOperatorEmail(email)`
```javascript
const result = await api.validateOperatorEmail('operator@example.com');
// Returns: { valid: boolean, message: string }
```

#### `registerOperator(formData)`
```javascript
const formData = new FormData();
// Add form fields...
const result = await api.registerOperator(formData);
// Returns: { success: boolean, operatorId: string, ... }
```

#### `generateMoovToken(operatorEmail)`
```javascript
const tokenData = await api.generateMoovToken('operator@example.com');
// Returns: { access_token: string, expires_in: number, scope: string }
```

---

## 🎨 Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';

function OnboardingForm() {
  const onboardingRef = useRef(null);

  useEffect(() => {
    const element = onboardingRef.current;
    
    element.onSuccess = (data) => {
      console.log('Success!', data);
    };
    
    element.onError = (error) => {
      console.error('Error:', error);
    };
  }, []);

  return <operator-onboarding ref={onboardingRef} />;
}
```

### Vue

```vue
<template>
  <operator-onboarding 
    ref="onboarding"
    api-base-url="https://your-api.com"
    embeddable-key="your-key">
  </operator-onboarding>
</template>

<script>
export default {
  mounted() {
    this.$refs.onboarding.onSuccess = (data) => {
      console.log('Success!', data);
    };
    
    this.$refs.onboarding.onError = (error) => {
      console.error('Error:', error);
    };
  }
}
</script>
```

### Angular

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-onboarding',
  template: '<operator-onboarding #onboarding></operator-onboarding>'
})
export class OnboardingComponent implements AfterViewInit {
  @ViewChild('onboarding') onboarding!: ElementRef;

  ngAfterViewInit() {
    const element = this.onboarding.nativeElement;
    
    element.onSuccess = (data: any) => {
      console.log('Success!', data);
    };
    
    element.onError = (error: any) => {
      console.error('Error:', error);
    };
  }
}
```

---

## 🔒 Security Best Practices

1. **Never expose your production embeddable key in client code**
   - Use environment variables
   - Implement server-side token validation

2. **Validate all data server-side**
   - Never trust client-side validation alone
   - Implement rate limiting

3. **Use HTTPS in production**
   - Ensure all API calls use HTTPS
   - Enable CORS properly

---

## 🐛 Troubleshooting

### Components not rendering

**Problem:** Web components don't appear on the page.

**Solution:**
```html
<!-- Ensure scripts are loaded BEFORE using components -->
<script src="component.js"></script>

<!-- Then use components -->
<operator-onboarding></operator-onboarding>
```

### BisonJibPayAPI is not defined

**Problem:** `BisonJibPayAPI is not available` error.

**Solution:** Load `api.js` before other component files:
```html
<script src="api.js"></script>
<script src="operator-onboarding.js"></script>
<script src="operator-payment.js"></script>
```

### Token generation fails

**Problem:** `Failed to generate Moov token` error.

**Solution:**
1. Verify your embeddable key is correct
2. Check that your backend endpoint is configured
3. Ensure the backend API is accessible

---

## 📁 File Structure

```
web-components/
├── component.js              # Barrel export (imports all components)
├── api.js                    # BisonJibPayAPI only
├── operator-onboarding.js    # Onboarding component
├── operator-payment.js       # Payment component
├── USAGE.md                  # This file
└── README.md                 # Project overview
```

**Architecture:**
- `component.js` is a lightweight barrel export that imports and re-exports from the individual files
- Each component file (`api.js`, `operator-onboarding.js`, `operator-payment.js`) is standalone
- Load `component.js` for convenience, or load individual files for selective inclusion

---

## 🆘 Support

For issues or questions:
- Check the troubleshooting section above
- Review the code examples
- Contact support at support@bisonjibpay.com

---

## 📝 License

See LICENSE file for details.