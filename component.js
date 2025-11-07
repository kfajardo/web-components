/**
 * A web component that captures operator information via stepper form
 * with necessary field validations. This serves as the simplified approach
 * in comparison to the Moov Onboarding Drop.
 *
 * Author @kfajardo
 */

class OperatorOnboarding extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Initialize state
    this.state = {
      currentStep: 0,
      totalSteps: 4,
      isSubmitted: false,
      isFailed: false,
      formData: {
        verification: {
          businessEmail: "",
        },
        businessDetails: {
          businessName: "",
          doingBusinessAs: "",
          businessWebsite: "",
          businessPhoneNumber: "",
          businessEmail: "",
          businessStreet: "",
          businessCity: "",
          businessState: "",
          businessPostalCode: "",
        },
        representatives: [],
        bankDetails: {
          accountHolderName: "",
          accountType: "checking",
          routingNumber: "",
          accountNumber: "",
        },
      },
      validationState: {
        step0: { isValid: false, errors: {} },
        step1: { isValid: false, errors: {} },
        step2: { isValid: true, errors: {} },
        step3: { isValid: false, errors: {} },
      },
      completedSteps: new Set(),
      uiState: {
        isLoading: false,
        verificationStatus: null,
        showErrors: false,
        errorMessage: null,
      },
    };

    // Step configuration
    this.STEPS = [
      {
        id: "verification",
        title: "Verify Email",
        description: "Verify your business email address",
        canSkip: false,
      },
      {
        id: "business-details",
        title: "Business Information",
        description: "Provide your business details",
        canSkip: false,
      },
      {
        id: "representatives",
        title: "Business Representatives",
        description: "Add business representatives (optional)",
        canSkip: true,
      },
      {
        id: "bank-details",
        title: "Bank Account",
        description: "Link your bank account",
        canSkip: false,
      },
    ];

    // US States for dropdown
    this.US_STATES = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    // Internal callback storage
    this._onSuccessCallback = null;
    this._onErrorCallback = null;
    this._initialData = null;

    this.render();
  }

  // Getter and setter for onSuccess property (for easy framework integration)
  get onSuccess() {
    return this._onSuccessCallback;
  }

  set onSuccess(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onSuccessCallback = callback;
    }
  }

  // Getter and setter for onError property (for error handling)
  get onError() {
    return this._onErrorCallback;
  }

  set onError(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onErrorCallback = callback;
    }
  }

  // Getter and setter for onLoad property (for pre-populating form data)
  get onLoad() {
    return this._initialData;
  }

  set onLoad(data) {
    if (data && typeof data === "object") {
      this._initialData = data;
      this.loadInitialData(data);
    }
  }

  // Static getter for observed attributes
  static get observedAttributes() {
    return ["on-success", "on-error", "on-load"];
  }

  // ==================== VALIDATORS ====================

  validators = {
    required: (value, fieldName) => ({
      isValid: value && value.trim().length > 0,
      error: `${fieldName} is required`,
    }),

    email: (value) => ({
      isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      error: "Please enter a valid email address",
    }),

    usPhone: (value) => {
      const cleaned = value.replace(/\D/g, "");
      return {
        isValid: cleaned.length === 10,
        error: "Please enter a valid 10-digit U.S. phone number",
      };
    },

    routingNumber: (value) => {
      const cleaned = value.replace(/\D/g, "");
      return {
        isValid: cleaned.length === 9,
        error: "Routing number must be 9 digits",
      };
    },

    accountNumber: (value) => {
      const cleaned = value.replace(/\D/g, "");
      return {
        isValid: cleaned.length >= 4 && cleaned.length <= 17,
        error: "Account number must be 4-17 digits",
      };
    },

    url: (value) => {
      if (!value) return { isValid: true, error: "" }; // Optional
      try {
        new URL(value);
        return { isValid: true, error: "" };
      } catch {
        return { isValid: false, error: "Please enter a valid URL" };
      }
    },

    postalCode: (value) => {
      const cleaned = value.replace(/\D/g, "");
      return {
        isValid: cleaned.length === 5,
        error: "Please enter a valid 5-digit ZIP code",
      };
    },
  };

  // ==================== STATE MANAGEMENT ====================

  setState(newState) {
    this.state = {
      ...this.state,
      ...newState,
      formData: {
        ...this.state.formData,
        ...(newState.formData || {}),
      },
      validationState: {
        ...this.state.validationState,
        ...(newState.validationState || {}),
      },
      uiState: {
        ...this.state.uiState,
        ...(newState.uiState || {}),
      },
    };
    this.render();
  }

  // ==================== VALIDATION ====================

  validateField(value, validators, fieldName) {
    for (const validatorName of validators) {
      const validator = this.validators[validatorName];
      if (validator) {
        const result = validator(value, fieldName);
        if (!result.isValid) {
          return result.error;
        }
      }
    }
    return "";
  }

  validateCurrentStep() {
    const stepId = this.STEPS[this.state.currentStep].id;
    let isValid = true;
    const errors = {};

    if (stepId === "verification") {
      const email = this.state.formData.verification.businessEmail;
      const error = this.validateField(
        email,
        ["required", "email"],
        "Business Email"
      );
      if (error) {
        errors.businessEmail = error;
        isValid = false;
      }
    } else if (stepId === "business-details") {
      const data = this.state.formData.businessDetails;
      const fields = [
        {
          name: "businessName",
          validators: ["required"],
          label: "Business Name",
        },
        {
          name: "businessWebsite",
          validators: ["url"],
          label: "Business Website",
        },
        {
          name: "businessPhoneNumber",
          validators: ["required", "usPhone"],
          label: "Business Phone",
        },
        {
          name: "businessStreet",
          validators: ["required"],
          label: "Street Address",
        },
        { name: "businessCity", validators: ["required"], label: "City" },
        { name: "businessState", validators: ["required"], label: "State" },
        {
          name: "businessPostalCode",
          validators: ["required", "postalCode"],
          label: "ZIP Code",
        },
      ];

      fields.forEach((field) => {
        const error = this.validateField(
          data[field.name],
          field.validators,
          field.label
        );
        if (error) {
          errors[field.name] = error;
          isValid = false;
        }
      });
    } else if (stepId === "representatives") {
      // Validate each representative if any field is filled
      this.state.formData.representatives.forEach((rep, index) => {
        const hasAnyValue = Object.values(rep).some(
          (v) =>
            (typeof v === "string" && v.trim()) ||
            (typeof v === "object" &&
              Object.values(v).some((av) => av && av.trim()))
        );

        if (hasAnyValue) {
          const requiredFields = [
            {
              name: "representativeFirstName",
              validators: ["required"],
              label: "First Name",
            },
            {
              name: "representativeLastName",
              validators: ["required"],
              label: "Last Name",
            },
            {
              name: "representativeJobTitle",
              validators: ["required"],
              label: "Job Title",
            },
            {
              name: "representativePhone",
              validators: ["required", "usPhone"],
              label: "Phone",
            },
            {
              name: "representativeEmail",
              validators: ["required", "email"],
              label: "Email",
            },
            {
              name: "representativeDateOfBirth",
              validators: ["required"],
              label: "Date of Birth",
            },
            {
              name: "representativeAddress",
              validators: ["required"],
              label: "Address",
            },
            {
              name: "representativeCity",
              validators: ["required"],
              label: "City",
            },
            {
              name: "representativeState",
              validators: ["required"],
              label: "State",
            },
            {
              name: "representativeZip",
              validators: ["required", "postalCode"],
              label: "ZIP Code",
            },
          ];

          requiredFields.forEach((field) => {
            const error = this.validateField(
              rep[field.name],
              field.validators,
              field.label
            );
            if (error) {
              if (!errors[`rep${index}`]) errors[`rep${index}`] = {};
              errors[`rep${index}`][field.name] = error;
              isValid = false;
            }
          });
        }
      });
    } else if (stepId === "bank-details") {
      const data = this.state.formData.bankDetails;
      const fields = [
        {
          name: "accountHolderName",
          validators: ["required"],
          label: "Account Holder Name",
        },
        {
          name: "accountType",
          validators: ["required"],
          label: "Account Type",
        },
        {
          name: "routingNumber",
          validators: ["required", "routingNumber"],
          label: "Routing Number",
        },
        {
          name: "accountNumber",
          validators: ["required", "accountNumber"],
          label: "Account Number",
        },
      ];

      fields.forEach((field) => {
        const error = this.validateField(
          data[field.name],
          field.validators,
          field.label
        );
        if (error) {
          errors[field.name] = error;
          isValid = false;
        }
      });
    }

    this.setState({
      validationState: {
        [`step${this.state.currentStep}`]: { isValid, errors },
      },
      uiState: { showErrors: !isValid },
    });

    return isValid;
  }

  // ==================== NAVIGATION ====================

  async goToNextStep() {
    const stepId = this.STEPS[this.state.currentStep].id;

    // Special handling for verification step
    if (stepId === "verification") {
      if (!this.validateCurrentStep()) return;
      await this.handleVerification();
      return;
    }

    // Validate current step
    if (!this.validateCurrentStep()) return;

    // Mark step complete
    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(this.state.currentStep);

    // Progress to next step
    if (this.state.currentStep < this.state.totalSteps - 1) {
      this.setState({
        currentStep: this.state.currentStep + 1,
        completedSteps,
        uiState: { showErrors: false },
      });
    } else {
      this.handleFormCompletion();
    }
  }

  goToPreviousStep() {
    if (this.state.currentStep > 0) {
      this.setState({
        currentStep: this.state.currentStep - 1,
        uiState: { showErrors: false },
      });
    }
  }

  goToStep(stepIndex) {
    if (
      this.state.completedSteps.has(stepIndex) ||
      stepIndex < this.state.currentStep
    ) {
      this.setState({
        currentStep: stepIndex,
        uiState: { showErrors: false },
      });
    }
  }

  skipStep() {
    if (this.STEPS[this.state.currentStep].canSkip) {
      const completedSteps = new Set(this.state.completedSteps);
      completedSteps.add(this.state.currentStep);

      this.setState({
        currentStep: this.state.currentStep + 1,
        completedSteps,
        uiState: { showErrors: false },
      });
    }
  }

  // ==================== ASYNC OPERATIONS ====================

  async handleVerification(shouldFail = false) {
    // Set loading state
    this.setState({
      uiState: { isLoading: true, verificationStatus: "pending" },
    });

    // Simulate API call (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (shouldFail) {
      // Handle verification failure
      this.handleVerificationFailure();
      return;
    }

    // Update verification status
    this.setState({
      uiState: { isLoading: false, verificationStatus: "success" },
    });

    // Show success message (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mark step as complete and proceed to next step
    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(0);

    this.setState({
      currentStep: 1,
      completedSteps,
      uiState: { verificationStatus: null, showErrors: false },
    });
  }

  handleVerificationFailure() {
    const email = this.state.formData.verification.businessEmail;
    const errorData = {
      email,
      message: "This email is not a valid WIO email.",
      timestamp: new Date().toISOString(),
    };

    // Log error to console
    console.error("Verification Failed:", errorData);

    // Update state to show failure page
    this.setState({
      isFailed: true,
      uiState: {
        isLoading: false,
        verificationStatus: "failed",
        errorMessage: errorData.message,
      },
    });

    // Emit custom error event
    this.dispatchEvent(
      new CustomEvent("verificationFailed", {
        detail: errorData,
        bubbles: true,
        composed: true,
      })
    );

    // Call onError callback if provided
    if (this.onError && typeof this.onError === "function") {
      this.onError(errorData);
    }
  }

  // ==================== REPRESENTATIVES CRUD ====================

  addRepresentative() {
    const newRep = {
      id: crypto.randomUUID(),
      representativeFirstName: "",
      representativeLastName: "",
      representativeJobTitle: "",
      representativePhone: "",
      representativeEmail: "",
      representativeDateOfBirth: "",
      representativeAddress: "",
      representativeCity: "",
      representativeState: "",
      representativeZip: "",
    };

    this.setState({
      formData: {
        representatives: [...this.state.formData.representatives, newRep],
      },
    });
  }

  removeRepresentative(index) {
    const representatives = this.state.formData.representatives.filter(
      (_, i) => i !== index
    );
    this.setState({
      formData: { representatives },
    });
  }

  updateRepresentative(index, field, value) {
    const representatives = [...this.state.formData.representatives];
    representatives[index] = {
      ...representatives[index],
      [field]: value,
    };

    this.setState({
      formData: { representatives },
    });
  }

  // ==================== INITIAL DATA LOADING ====================

  loadInitialData(data) {
    const newFormData = { ...this.state.formData };

    // Check for wioEmail to skip verification step
    const hasWioEmail = data.wioEmail && data.wioEmail.trim().length > 0;

    // Load verification data
    if (data.verification) {
      newFormData.verification = {
        ...newFormData.verification,
        ...data.verification,
      };
    }

    // Load business details
    if (data.businessDetails) {
      newFormData.businessDetails = {
        ...newFormData.businessDetails,
        ...data.businessDetails,
      };
    }

    // If wioEmail exists, pre-populate verification email for skipping step 0
    if (hasWioEmail) {
      newFormData.verification.businessEmail = data.wioEmail;
    } 

    // Load representatives
    if (data.representatives && Array.isArray(data.representatives)) {
      newFormData.representatives = data.representatives.map((rep) => ({
        id: rep.id || crypto.randomUUID(),
        representativeFirstName: rep.representativeFirstName || "",
        representativeLastName: rep.representativeLastName || "",
        representativeJobTitle: rep.representativeJobTitle || "",
        representativePhone: rep.representativePhone || "",
        representativeEmail: rep.representativeEmail || "",
        representativeDateOfBirth: rep.representativeDateOfBirth || "",
        representativeAddress: rep.representativeAddress || "",
        representativeCity: rep.representativeCity || "",
        representativeState: rep.representativeState || "",
        representativeZip: rep.representativeZip || "",
      }));
    }

    // Load bank details
    if (data.bankDetails) {
      newFormData.bankDetails = {
        ...newFormData.bankDetails,
        ...data.bankDetails,
      };
    }

    // Update state with loaded data
    const stateUpdate = {
      formData: newFormData,
    };

    // If wioEmail exists, skip verification step
    if (hasWioEmail) {
      const completedSteps = new Set(this.state.completedSteps);
      completedSteps.add(0); // Mark verification step as completed

      stateUpdate.currentStep = 1; // Start at business details step
      stateUpdate.completedSteps = completedSteps;
    }

    this.setState(stateUpdate);
  }

  // ==================== UTILITIES ====================

  formatPhoneNumber(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return value;
  }

  getFieldError(fieldName, repIndex = null) {
    if (!this.state.uiState.showErrors) return "";
    const errors =
      this.state.validationState[`step${this.state.currentStep}`]?.errors || {};

    if (repIndex !== null) {
      return errors[`rep${repIndex}`]?.[fieldName] || "";
    }

    return errors[fieldName] || "";
  }

  // ==================== FORM COMPLETION ====================

  handleFormCompletion() {
    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(this.state.currentStep);

    // Log all form data to console
    const formData = {
      verification: this.state.formData.verification,
      businessDetails: this.state.formData.businessDetails,
      representatives: this.state.formData.representatives,
      bankDetails: this.state.formData.bankDetails,
    };

    console.log("Form Submission - Complete Data:", formData);

    // Update state to show success page
    this.setState({
      completedSteps,
      isSubmitted: true,
    });

    // Emit custom event
    this.dispatchEvent(
      new CustomEvent("formComplete", {
        detail: formData,
        bubbles: true,
        composed: true,
      })
    );

    // Call onSuccess callback if provided
    if (this.onSuccess && typeof this.onSuccess === "function") {
      this.onSuccess(formData);
    }
  }

  // ==================== RENDERING ====================

  render() {
    // Show failure page if verification failed
    if (this.state.isFailed) {
      this.shadowRoot.innerHTML = `
        ${this.renderStyles()}
        <div class="onboarding-container">
          ${this.renderFailurePage()}
        </div>
      `;
      return;
    }

    // Show success page if form is submitted
    if (this.state.isSubmitted) {
      this.shadowRoot.innerHTML = `
        ${this.renderStyles()}
        <div class="onboarding-container">
          ${this.renderSuccessPage()}
        </div>
      `;
      return;
    }

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

  renderStyles() {
    return `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        :host {
          --primary-color: #007bff;
          --success-color: #28a745;
          --error-color: #dc3545;
          --border-color: #ddd;
          --gray-light: #f8f9fa;
          --gray-medium: #6c757d;
          --border-radius: 12px;
          --border-radius-sm: 8px;
          --border-radius-lg: 16px;
          --spacing-sm: 8px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .onboarding-container {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }
        
        /* Stepper Header */
        .stepper-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
          position: relative;
        }
        
        .stepper-header::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--border-color);
          z-index: 0;
        }
        
        .step-indicator {
          flex: 1;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .step-indicator.clickable {
          cursor: pointer;
        }
        
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-sm);
          font-weight: bold;
          color: var(--gray-medium);
        }
        
        .step-indicator.active .step-circle {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background: var(--primary-color);
          color: white;
        }
        
        .step-indicator.complete .step-circle {
          border-color: var(--success-color);
          background: var(--success-color);
          color: white;
        }
        
        .step-label {
          font-size: 12px;
          color: var(--gray-medium);
        }
        
        .step-indicator.active .step-label {
          color: var(--primary-color);
          font-weight: 600;
        }
        
        /* Step Content */
        .step-content {
          background: white;
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          margin-bottom: var(--spacing-lg);
        }
        
        .step-content h2 {
          margin-bottom: var(--spacing-sm);
          color: #333;
        }
        
        .step-content > p {
          color: var(--gray-medium);
          margin-bottom: var(--spacing-lg);
        }
        
        /* Form Fields */
        .form-field {
          margin-bottom: var(--spacing-md);
        }
        
        .form-field label {
          display: block;
          margin-bottom: var(--spacing-sm);
          font-weight: 500;
          color: #333;
        }
        
        .form-field input,
        .form-field select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          font-size: 14px;
        }
        
        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        
        .form-field input[readonly] {
          background: var(--gray-light);
          cursor: not-allowed;
        }
        
        .form-field.has-error input,
        .form-field.has-error select {
          border-color: var(--error-color);
        }
        
        .error-message {
          display: block;
          color: var(--error-color);
          font-size: 12px;
          margin-top: var(--spacing-sm);
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }
        
        .form-grid .full-width {
          grid-column: 1 / -1;
        }
        
        /* Radio Buttons */
        .radio-group {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .radio-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .radio-option input[type="radio"] {
          width: auto;
        }
        
        /* Representatives */
        .representative-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color);
        }
        
        .card-header h3 {
          font-size: 16px;
          color: #333;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: var(--error-color);
          cursor: pointer;
          font-size: 14px;
          padding: var(--spacing-sm);
        }
        
        .remove-btn:hover {
          text-decoration: underline;
        }
        
        .add-representative-btn {
          width: 100%;
          padding: 12px;
          background: white;
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius);
          color: var(--primary-color);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        
        .add-representative-btn:hover {
          border-color: var(--primary-color);
          background: var(--gray-light);
        }
        
        /* Navigation Footer */
        .navigation-footer {
          display: flex;
          justify-content: space-between;
          gap: var(--spacing-md);
        }
        
        .navigation-footer button {
          padding: 12px 24px;
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .btn-back {
          background: white;
          border: 1px solid var(--border-color);
          color: #333;
        }
        
        .btn-back:hover {
          background: var(--gray-light);
        }
        
        .btn-skip {
          background: white;
          border: 1px solid var(--border-color);
          color: var(--gray-medium);
          margin-left: auto;
        }
        
        .btn-skip:hover {
          background: var(--gray-light);
        }
        
        .btn-next {
          background: var(--primary-color);
          color: white;
        }
        
        .btn-next:hover {
          background: #0056b3;
        }
        
        .btn-verify {
          background: var(--primary-color);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: var(--spacing-md);
        }
        
        .btn-verify:hover {
          background: #0056b3;
        }
        
        .btn-verify:disabled {
          background: var(--gray-medium);
          cursor: not-allowed;
        }
        
        /* Loading & Messages */
        .loading-spinner {
          border: 3px solid var(--gray-light);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: var(--spacing-md) auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .success-message {
          background: #d4edda;
          color: #155724;
          padding: var(--spacing-md);
          border-radius: var(--border-radius);
          margin-top: var(--spacing-md);
          border: 1px solid #c3e6cb;
        }
        
        .empty-state {
          text-align: center;
          padding: var(--spacing-lg);
          color: var(--gray-medium);
        }
        
        /* Error/Failure Styles */
        .error-container {
          text-align: center;
          padding: var(--spacing-lg) 0;
        }
        
        .error-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto var(--spacing-lg);
          background: linear-gradient(135deg, var(--error-color) 0%, #c82333 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: errorPulse 0.6s ease-out;
        }
        
        @keyframes errorPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .error-icon svg {
          width: 70px;
          height: 70px;
          stroke: white;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }
        
        .error-container h2 {
          color: var(--error-color);
          margin-bottom: var(--spacing-md);
          font-size: 32px;
        }
        
        .error-container p {
          color: var(--gray-medium);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: var(--spacing-sm);
        }
        
        .error-details {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
          text-align: left;
        }
        
        .error-details h3 {
          color: var(--error-color);
          margin-bottom: var(--spacing-md);
          font-size: 18px;
        }
        
        .error-details p {
          color: #721c24;
          margin-bottom: var(--spacing-sm);
        }
        
        .btn-fail {
          background: var(--error-color);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: var(--spacing-md);
          margin-left: var(--spacing-sm);
        }
        
        .btn-fail:hover {
          background: #c82333;
        }
        
        .verification-buttons {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }
        
        /* Success Page */
        .success-container {
          text-align: center;
          padding: var(--spacing-lg) 0;
        }
        
        .success-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto var(--spacing-lg);
          background: linear-gradient(135deg, var(--success-color) 0%, #20c997 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: successPulse 0.6s ease-out;
        }
        
        @keyframes successPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .success-icon svg {
          width: 70px;
          height: 70px;
          stroke: white;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.6s ease-out 0.3s forwards;
        }
        
        @keyframes checkmark {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .success-container h2 {
          color: var(--success-color);
          margin-bottom: var(--spacing-md);
          font-size: 32px;
        }
        
        .success-container p {
          color: var(--gray-medium);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: var(--spacing-sm);
        }
        
        .success-details {
          background: var(--gray-light);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
          text-align: left;
        }
        
        .success-details h3 {
          color: #333;
          margin-bottom: var(--spacing-md);
          font-size: 18px;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .detail-item:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          color: var(--gray-medium);
          font-size: 14px;
        }
        
        .detail-value {
          color: #333;
          font-weight: 500;
          font-size: 14px;
        }
      </style>
    `;
  }

  renderStepperHeader() {
    return `
      <div class="stepper-header">
        ${this.STEPS.map((step, index) =>
          this.renderStepIndicator(step, index)
        ).join("")}
      </div>
    `;
  }

  renderStepIndicator(step, index) {
    const isComplete = this.state.completedSteps.has(index);
    const isCurrent = this.state.currentStep === index;
    const isClickable = isComplete || index < this.state.currentStep;

    return `
      <div class="step-indicator ${isCurrent ? "active" : ""} ${
      isComplete ? "complete" : ""
    } ${isClickable ? "clickable" : ""}"
           ${isClickable ? `data-step="${index}"` : ""}>
        <div class="step-circle">
          ${isComplete ? "✓" : index + 1}
        </div>
        <div class="step-label">${step.title}</div>
      </div>
    `;
  }

  renderCurrentStep() {
    const stepId = this.STEPS[this.state.currentStep].id;

    switch (stepId) {
      case "verification":
        return this.renderVerificationStep();
      case "business-details":
        return this.renderBusinessDetailsStep();
      case "representatives":
        return this.renderRepresentativesStep();
      case "bank-details":
        return this.renderBankDetailsStep();
      default:
        return "";
    }
  }

  renderVerificationStep() {
    const { businessEmail } = this.state.formData.verification;
    const { isLoading, verificationStatus } = this.state.uiState;

    return `
      <div class="step-content">
        <h2>Verify WIO Email</h2>
        <p>Enter your WIO's email to get started</p>
        
        ${this.renderField({
          name: "businessEmail",
          label: "Business Email",
          type: "email",
          value: businessEmail,
          error: this.getFieldError("businessEmail"),
          placeholder: "business@example.com",
        })}
        
        ${
          !isLoading && verificationStatus !== "success"
            ? `
          <div class="verification-buttons">
            <button type="button" class="btn-verify">Verify</button>
            <button type="button" class="btn-fail">Fail Verify (Demo)</button>
          </div>
        `
            : ""
        }
        
        ${
          verificationStatus === "success"
            ? `
          <div class="success-message">
            ✓ Operator verified, proceeding to next step...
          </div>
        `
            : ""
        }
        
        ${isLoading ? '<div class="loading-spinner"></div>' : ""}
      </div>
    `;
  }

  renderBusinessDetailsStep() {
    const data = this.state.formData.businessDetails;

    return `
      <div class="step-content">
        <h2>Business Information</h2>
        <p>Provide your business details</p>
        
        <div class="form-grid">
          ${this.renderField({
            name: "businessName",
            label: "Business Name *",
            value: data.businessName,
            error: this.getFieldError("businessName"),
          })}
          
          ${this.renderField({
            name: "doingBusinessAs",
            label: "Doing Business As (DBA)",
            value: data.doingBusinessAs,
          })}
          
          ${this.renderField({
            name: "businessWebsite",
            label: "Business Website",
            type: "url",
            value: data.businessWebsite,
            error: this.getFieldError("businessWebsite"),
            placeholder: "https://example.com",
            className: "full-width",
          })}
          
          ${this.renderField({
            name: "businessPhoneNumber",
            label: "Business Phone *",
            type: "tel",
            value: data.businessPhoneNumber,
            error: this.getFieldError("businessPhoneNumber"),
            placeholder: "(555) 123-4567",
            dataFormat: "phone",
          })}
          
          ${this.renderField({
            name: "businessEmail",
            label: "Business Email *",
            type: "email",
            value: data.businessEmail,
            readOnly: false,
          })}
          
          ${this.renderField({
            name: "businessStreet",
            label: "Street Address *",
            value: data.businessStreet,
            error: this.getFieldError("businessStreet"),
            className: "full-width",
          })}
          
          ${this.renderField({
            name: "businessCity",
            label: "City *",
            value: data.businessCity,
            error: this.getFieldError("businessCity"),
          })}
          
          <div class="form-field ${
            this.getFieldError("businessState") ? "has-error" : ""
          }">
            <label for="businessState">State *</label>
            <select id="businessState" name="businessState">
              <option value="">Select State</option>
              ${this.US_STATES.map(
                (state) => `
                <option value="${state}" ${
                  data.businessState === state ? "selected" : ""
                }>${state}</option>
              `
              ).join("")}
            </select>
            ${
              this.getFieldError("businessState")
                ? `<span class="error-message">${this.getFieldError(
                    "businessState"
                  )}</span>`
                : ""
            }
          </div>
          
          ${this.renderField({
            name: "businessPostalCode",
            label: "ZIP Code *",
            value: data.businessPostalCode,
            error: this.getFieldError("businessPostalCode"),
            placeholder: "12345",
            maxLength: 5,
          })}
        </div>
      </div>
    `;
  }

  renderRepresentativesStep() {
    const representatives = this.state.formData.representatives;

    return `
      <div class="step-content">
        <h2>Business Representatives</h2>
        <p>Add business representatives (optional)</p>
        
        <div class="representatives-list">
          ${
            representatives.length === 0
              ? `
            <div class="empty-state">
              <p>No representatives added yet. Click below to add one.</p>
            </div>
          `
              : ""
          }
          ${representatives
            .map((rep, index) => this.renderRepresentativeCard(rep, index))
            .join("")}
        </div>
        
        <button type="button" class="add-representative-btn">
          + Add Representative
        </button>
      </div>
    `;
  }

  renderRepresentativeCard(representative, index) {
    return `
      <div class="representative-card" data-index="${index}">
        <div class="card-header">
          <h3>Representative ${index + 1}</h3>
          <button type="button" class="remove-btn" data-index="${index}">Remove</button>
        </div>
        <div class="card-body">
          <div class="form-grid">
            ${this.renderField({
              name: "representativeFirstName",
              label: "First Name *",
              value: representative.representativeFirstName,
              error: this.getFieldError("representativeFirstName", index),
              dataRepIndex: index,
            })}
            
            ${this.renderField({
              name: "representativeLastName",
              label: "Last Name *",
              value: representative.representativeLastName,
              error: this.getFieldError("representativeLastName", index),
              dataRepIndex: index,
            })}
            
            ${this.renderField({
              name: "representativeJobTitle",
              label: "Job Title *",
              value: representative.representativeJobTitle,
              error: this.getFieldError("representativeJobTitle", index),
              dataRepIndex: index,
              className: "full-width",
            })}
            
            ${this.renderField({
              name: "representativePhone",
              label: "Phone *",
              type: "tel",
              value: representative.representativePhone,
              error: this.getFieldError("representativePhone", index),
              placeholder: "(555) 123-4567",
              dataRepIndex: index,
              dataFormat: "phone",
            })}
            
            ${this.renderField({
              name: "representativeEmail",
              label: "Email *",
              type: "email",
              value: representative.representativeEmail,
              error: this.getFieldError("representativeEmail", index),
              dataRepIndex: index,
            })}
            
            ${this.renderField({
              name: "representativeDateOfBirth",
              label: "Date of Birth *",
              type: "date",
              value: representative.representativeDateOfBirth,
              error: this.getFieldError("representativeDateOfBirth", index),
              dataRepIndex: index,
              className: "full-width",
            })}
            
            ${this.renderField({
              name: "representativeAddress",
              label: "Address *",
              value: representative.representativeAddress,
              error: this.getFieldError("representativeAddress", index),
              dataRepIndex: index,
              className: "full-width",
            })}
            
            ${this.renderField({
              name: "representativeCity",
              label: "City *",
              value: representative.representativeCity,
              error: this.getFieldError("representativeCity", index),
              dataRepIndex: index,
            })}
            
            <div class="form-field ${
              this.getFieldError("representativeState", index)
                ? "has-error"
                : ""
            }">
              <label for="representativeState-${index}">State *</label>
              <select id="representativeState-${index}" name="representativeState" data-rep-index="${index}">
                <option value="">Select State</option>
                ${this.US_STATES.map(
                  (state) => `
                  <option value="${state}" ${
                    representative.representativeState === state
                      ? "selected"
                      : ""
                  }>${state}</option>
                `
                ).join("")}
              </select>
              ${
                this.getFieldError("representativeState", index)
                  ? `<span class="error-message">${this.getFieldError(
                      "representativeState",
                      index
                    )}</span>`
                  : ""
              }
            </div>
            
            ${this.renderField({
              name: "representativeZip",
              label: "ZIP Code *",
              value: representative.representativeZip,
              error: this.getFieldError("representativeZip", index),
              placeholder: "12345",
              maxLength: 5,
              dataRepIndex: index,
            })}
          </div>
        </div>
      </div>
    `;
  }

  renderBankDetailsStep() {
    const data = this.state.formData.bankDetails;

    return `
      <div class="step-content">
        <h2>Bank Account</h2>
        <p>Link your bank account</p>
        
        <div class="form-grid">
          ${this.renderField({
            name: "accountHolderName",
            label: "Account Holder Name *",
            value: data.accountHolderName,
            error: this.getFieldError("accountHolderName"),
            className: "full-width",
          })}
          
          <div class="form-field full-width">
            <label>Account Type *</label>
            <div class="radio-group">
              <div class="radio-option">
                <input type="radio" id="checking" name="accountType" value="checking" ${
                  data.accountType === "checking" ? "checked" : ""
                }>
                <label for="checking">Checking</label>
              </div>
              <div class="radio-option">
                <input type="radio" id="savings" name="accountType" value="savings" ${
                  data.accountType === "savings" ? "checked" : ""
                }>
                <label for="savings">Savings</label>
              </div>
            </div>
          </div>
          
          ${this.renderField({
            name: "routingNumber",
            label: "Routing Number *",
            value: data.routingNumber,
            error: this.getFieldError("routingNumber"),
            placeholder: "123456789",
            maxLength: 9,
          })}
          
          ${this.renderField({
            name: "accountNumber",
            label: "Account Number *",
            value: data.accountNumber,
            error: this.getFieldError("accountNumber"),
            placeholder: "1234567890",
          })}
        </div>
      </div>
    `;
  }

  renderField({
    name,
    label,
    type = "text",
    value = "",
    error = "",
    readOnly = false,
    placeholder = "",
    className = "",
    maxLength = null,
    dataRepIndex = null,
    dataFormat = null,
  }) {
    const fieldClass = `form-field ${error ? "has-error" : ""} ${className}`;
    const fieldId = dataRepIndex !== null ? `${name}-${dataRepIndex}` : name;

    return `
      <div class="${fieldClass}">
        <label for="${fieldId}">${label}</label>
        <input 
          type="${type}" 
          id="${fieldId}" 
          name="${name}" 
          value="${value}"
          ${readOnly ? "readonly" : ""}
          ${placeholder ? `placeholder="${placeholder}"` : ""}
          ${maxLength ? `maxlength="${maxLength}"` : ""}
          ${dataRepIndex !== null ? `data-rep-index="${dataRepIndex}"` : ""}
          ${dataFormat ? `data-format="${dataFormat}"` : ""}
        />
        ${error ? `<span class="error-message">${error}</span>` : ""}
      </div>
    `;
  }

  renderNavigationFooter() {
    const isFirstStep = this.state.currentStep === 0;
    const isLastStep = this.state.currentStep === this.state.totalSteps - 1;
    const canSkip = this.STEPS[this.state.currentStep].canSkip;
    const stepId = this.STEPS[this.state.currentStep].id;

    // Don't show navigation on verification step
    if (stepId === "verification") {
      return "";
    }

    return `
      <div class="navigation-footer">
        ${
          !isFirstStep
            ? '<button type="button" class="btn-back">Back</button>'
            : ""
        }
        ${canSkip ? '<button type="button" class="btn-skip">Skip</button>' : ""}
        <button type="button" class="btn-next">
          ${isLastStep ? "Submit" : "Next"}
        </button>
      </div>
    `;
  }

  renderSuccessPage() {
    const { businessDetails, representatives, bankDetails } =
      this.state.formData;

    return `
      <div class="success-container">
        <div class="success-icon">
          <svg viewBox="0 0 52 52">
            <path d="M14 27l7 7 16-16"/>
          </svg>
        </div>
        
        <h2>Onboarding Complete! 🎉</h2>
        <p>Your operator application has been successfully submitted.</p>
        <p style="margin-top: var(--spacing-lg); color: #333;">
          <strong>You can now close this dialog.</strong>
        </p>
        
        <div class="success-details">
          <h3>Submission Summary</h3>
          <div class="detail-item">
            <span class="detail-label">Business Name</span>
            <span class="detail-value">${businessDetails.businessName}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Business Email</span>
            <span class="detail-value">${businessDetails.businessEmail}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phone Number</span>
            <span class="detail-value">${
              businessDetails.businessPhoneNumber
            }</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Representatives</span>
            <span class="detail-value">${representatives.length} added</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Bank Account</span>
            <span class="detail-value">${
              bankDetails.accountType === "checking" ? "Checking" : "Savings"
            } (****${bankDetails.accountNumber.slice(-4)})</span>
          </div>
        </div>
        
        <p style="font-size: 14px; color: var(--gray-medium); margin-top: var(--spacing-lg);">
          A confirmation email has been sent to <strong>${
            businessDetails.businessEmail
          }</strong>
        </p>
      </div>
    `;
  }

  renderFailurePage() {
    const { businessEmail } = this.state.formData.verification;
    const { errorMessage } = this.state.uiState;

    return `
      <div class="error-container">
        <div class="error-icon">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none"/>
            <path d="M16 16 L36 36 M36 16 L16 36"/>
          </svg>
        </div>
        
        <h2>Verification Failed</h2>
        <p>This WIO email could not be verified.</p>
        
        <div class="error-details">
          <h3>Error Details</h3>
          <p><strong>Email:</strong> ${businessEmail}</p>
          <p><strong>Issue:</strong> ${
            errorMessage ||
            "This WIO email does not exist in our system."
          }</p>
          <p style="margin-top: var(--spacing-md);">
            Please ensure you have a valid WIO associated with this email address before attempting to onboard an operator.
          </p>
        </div>
        
        <p style="margin-top: var(--spacing-lg); color: #333;">
          <strong>You can now close this dialog.</strong>
        </p>
      </div>
    `;
  }

  // ==================== EVENT HANDLING ====================

  attachEventListeners() {
    const shadow = this.shadowRoot;

    // Form inputs - blur validation
    shadow.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("blur", (e) => this.handleFieldBlur(e));
      input.addEventListener("input", (e) => this.handleFieldInput(e));
    });

    // Navigation buttons
    const nextBtn = shadow.querySelector(".btn-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.goToNextStep());
    }

    const backBtn = shadow.querySelector(".btn-back");
    if (backBtn) {
      backBtn.addEventListener("click", () => this.goToPreviousStep());
    }

    const skipBtn = shadow.querySelector(".btn-skip");
    if (skipBtn) {
      skipBtn.addEventListener("click", () => this.skipStep());
    }

    // Verify button - ensure field is captured before validation
    const verifyBtn = shadow.querySelector(".btn-verify");
    if (verifyBtn) {
      verifyBtn.addEventListener("click", () => {
        // Capture email value from input before validating
        const emailInput = shadow.querySelector('input[name="businessEmail"]');
        if (emailInput) {
          this.setState({
            formData: {
              verification: {
                businessEmail: emailInput.value,
              },
            },
          });
          // Small delay to ensure state is updated before validation
          setTimeout(() => this.goToNextStep(), 0);
        } else {
          this.goToNextStep();
        }
      });
    }

    // Fail Verify button - for demo purposes
    const failBtn = shadow.querySelector(".btn-fail");
    if (failBtn) {
      failBtn.addEventListener("click", async () => {
        // Capture email value from input before validating
        const emailInput = shadow.querySelector('input[name="businessEmail"]');
        if (emailInput) {
          this.setState({
            formData: {
              verification: {
                businessEmail: emailInput.value,
              },
            },
          });
        }

        // Validate the field first
        if (!this.validateCurrentStep()) return;

        // Trigger failure verification
        await this.handleVerification(true);
      });
    }

    // Step indicators (for navigation)
    shadow.querySelectorAll("[data-step]").forEach((indicator) => {
      indicator.addEventListener("click", (e) => {
        const stepIndex = parseInt(e.currentTarget.dataset.step);
        this.goToStep(stepIndex);
      });
    });

    // Representative CRUD
    const addBtn = shadow.querySelector(".add-representative-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.addRepresentative());
    }

    shadow.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeRepresentative(index);
      });
    });
  }

  handleFieldBlur(e) {
    const input = e.target;
    const name = input.name;
    const value = input.value;
    const repIndex = input.dataset.repIndex;

    // Phone number formatting on blur
    if (input.dataset.format === "phone") {
      input.value = this.formatPhoneNumber(value);
    }

    // Update state based on step
    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "verification") {
      this.setState({
        formData: {
          verification: {
            ...this.state.formData.verification,
            [name]: input.value,
          },
        },
      });
    } else if (stepId === "business-details") {
      this.setState({
        formData: {
          businessDetails: {
            ...this.state.formData.businessDetails,
            [name]: input.value,
          },
        },
      });
    } else if (stepId === "representatives" && repIndex !== undefined) {
      this.updateRepresentative(parseInt(repIndex), name, input.value);
    } else if (stepId === "bank-details") {
      this.setState({
        formData: {
          bankDetails: {
            ...this.state.formData.bankDetails,
            [name]: input.value,
          },
        },
      });
    }
  }

  handleFieldInput(e) {
    const input = e.target;
    const name = input.name;
    const value = input.value;
    const repIndex = input.dataset.repIndex;

    // Clear error display when user starts typing
    if (this.state.uiState.showErrors) {
      this.state.uiState.showErrors = false;
    }

    // Update state in real-time
    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "verification") {
      this.state.formData.verification[name] = value;
    } else if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = value;
    } else if (stepId === "representatives" && repIndex !== undefined) {
      const idx = parseInt(repIndex);
      if (this.state.formData.representatives[idx]) {
        this.state.formData.representatives[idx][name] = value;
      }
    } else if (stepId === "bank-details") {
      this.state.formData.bankDetails[name] = value;
    }
  }

  // ==================== LIFECYCLE METHODS ====================

  connectedCallback() {
    // Component is added to the DOM
  }

  disconnectedCallback() {
    // Component is removed from the DOM
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Handle on-success attribute
    if (name === "on-success" && newValue) {
      // Use the setter to assign the callback from window scope
      this.onSuccess = window[newValue];
    }

    // Handle on-error attribute
    if (name === "on-error" && newValue) {
      // Use the setter to assign the callback from window scope
      this.onError = window[newValue];
    }

    // Handle on-load attribute (expects JSON string or global variable name)
    if (name === "on-load" && newValue) {
      try {
        // Try to parse as JSON first
        const data = JSON.parse(newValue);
        this.onLoad = data;
      } catch (e) {
        // If not JSON, try to get from window scope (global variable)
        if (window[newValue]) {
          this.onLoad = window[newValue];
        }
      }
    }
  }

  adoptedCallback() {
    // Component moved to new document
  }
}

customElements.define("operator-onboarding", OperatorOnboarding);

/**
 * Standalone function to verify if an operator exists
 * This can be used to check operator status before rendering the onboarding form
 *
 * @param {string} operatorId - The operator ID to verify
 * @param {boolean} mockResult - Mock result for testing (true = verified, false = not verified)
 * @returns {boolean} - Returns true if operator is verified, false otherwise
 *
 * @example
 * // Check if operator is verified
 * const isVerified = verifyOperator('OP123456', true);
 * if (isVerified) {
 *   // Show onboarding form
 * } else {
 *   // Show error message
 * }
 */
function verifyOperator(operatorId, mockResult) {
  if (!operatorId || typeof operatorId !== 'string') {
    console.error('verifyOperator: operatorId must be a non-empty string');
    return false;
  }

  if (typeof mockResult !== 'boolean') {
    console.error('verifyOperator: mockResult must be a boolean');
    return false;
  }

  // Log verification attempt
  console.log(`Verifying operator: ${operatorId}`, { result: mockResult });

  // Return the mock result
  return mockResult;
}

// Export for module usage (if using ES modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OperatorOnboarding, verifyOperator };
}

// Also make available globally for script tag usage
if (typeof window !== 'undefined') {
  window.verifyOperator = verifyOperator;
}
