/**
 * API Service for BisonJibPay Embeddable Endpoints
 */
class BisonJibPayAPI {
  constructor(baseURL, embeddableKey) {
    this.baseURL = baseURL || "https://bison-jib-development.azurewebsites.net";
    this.embeddableKey = embeddableKey;
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "X-Embeddable-Key": this.embeddableKey,
      ...options.headers,
    };

    // Don't add Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          data: data,
        };
      }

      return data;
    } catch (error) {
      // Re-throw with structured error
      if (error.status) throw error;
      throw {
        status: 500,
        data: {
          success: false,
          message: "Network error occurred",
          errors: [error.message],
        },
      };
    }
  }

  /**
   * Validate operator email
   */
  async validateOperatorEmail(email) {
    return this.request("/api/embeddable/validate/operator-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Register operator
   */
  async registerOperator(formData) {
    return this.request("/api/embeddable/operator-registration", {
      method: "POST",
      body: formData, // FormData object
    });
  }
}

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

    // API Configuration
    this.apiBaseURL =
      this.getAttribute("api-base-url") ||
      "https://bison-jib-development.azurewebsites.net";
    this.embeddableKey =
      this.getAttribute("embeddable-key") ||
      "R80WMkbNN8457RofiMYx03DL65P06IaVT30Q2emYJUBQwYCzRC";
    this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);

    // Initialize state
    this.state = {
      currentStep: 0,
      totalSteps: 4, // Business, Representatives, Bank, Underwriting
      isSubmitted: false,
      isFailed: false,
      isSubmissionFailed: false,
      formData: {
        businessDetails: {
          businessName: "",
          doingBusinessAs: "",
          ein: "",
          businessWebsite: "",
          businessPhoneNumber: "",
          businessEmail: "",
          BusinessAddress1: "",
          businessCity: "",
          businessState: "",
          businessPostalCode: "",
        },
        representatives: [],
        underwriting: {
          underwritingDocuments: [], // File upload support for underwriting documents
        },
        bankDetails: {
          bankAccountHolderName: "",
          bankAccountType: "checking",
          bankRoutingNumber: "",
          bankAccountNumber: "",
        },
      },
      validationState: {
        step0: { isValid: false, errors: {} }, // Business Details
        step1: { isValid: true, errors: {} }, // Representatives (optional)
        step2: { isValid: false, errors: {} }, // Bank Details
        step3: { isValid: false, errors: {} }, // Underwriting (required)
      },
      completedSteps: new Set(),
      uiState: {
        isLoading: false,
        showErrors: false,
        errorMessage: null,
      },
    };

    // Step configuration (Verification is now pre-stepper)
    this.STEPS = [
      {
        id: "business-details",
        title: "Business",
        description: "Provide your business details",
        canSkip: false,
      },
      {
        id: "representatives",
        title: "Representatives",
        description: "Add business representatives (optional)",
        canSkip: true,
      },
      {
        id: "bank-details",
        title: "Bank Account",
        description: "Link your bank account",
        canSkip: false,
      },
      {
        id: "underwriting",
        title: "Underwriting",
        description: "Upload required documents",
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

    ein: (value) => {
      const cleaned = value.replace(/\D/g, "");
      return {
        isValid: cleaned.length === 9,
        error: "EIN must be 9 digits",
      };
    },

    url: (value) => {
      if (!value) return { isValid: true, error: "" }; // Optional

      // Trim whitespace
      const trimmed = value.trim();
      if (!trimmed) return { isValid: true, error: "" };

      // Pattern for basic domain validation
      // Accepts: domain.com, www.domain.com, subdomain.domain.com
      const domainPattern = /^(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

      // Check if it's already a full URL
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        try {
          new URL(trimmed);
          return { isValid: true, error: "", normalizedValue: trimmed };
        } catch {
          return { isValid: false, error: "Please enter a valid URL" };
        }
      }

      // Check if it matches domain pattern (without protocol)
      if (domainPattern.test(trimmed)) {
        // Auto-normalize by adding https://
        const normalized = `https://${trimmed}`;
        try {
          new URL(normalized); // Validate the normalized URL
          return { isValid: true, error: "", normalizedValue: normalized };
        } catch {
          return { isValid: false, error: "Please enter a valid URL" };
        }
      }

      return {
        isValid: false,
        error:
          "Please enter a valid URL (e.g., example.com, www.example.com, or https://example.com)",
      };
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

  validateStep(stepIdentifier) {
    // Handle both step index (number) and step id (string)
    let step;
    let stepKey;

    if (typeof stepIdentifier === "number") {
      step = this.STEPS[stepIdentifier];
      stepKey = `step${stepIdentifier}`;
    } else {
      step = this.STEPS.find((s) => s.id === stepIdentifier);
      stepKey = stepIdentifier;
    }

    if (!step) return false;

    let isValid = true;
    const errors = {};

    // Update validation state
    this.setState({
      validationState: {
        [stepKey]: { isValid, errors },
      },
      uiState: { showErrors: !isValid },
    });

    return isValid;
  }

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

    if (stepId === "business-details") {
      const data = this.state.formData.businessDetails;
      const fields = [
        {
          name: "businessName",
          validators: ["required"],
          label: "Business Name",
        },
        {
          name: "doingBusinessAs",
          validators: ["required"],
          label: "Doing Business As (DBA)",
        },
        {
          name: "ein",
          validators: ["required", "ein"],
          label: "EIN",
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
          name: "businessEmail",
          validators: ["required", "email"],
          label: "Business Email",
        },
        {
          name: "BusinessAddress1",
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
    } else if (stepId === "underwriting") {
      // Validate that at least one document is uploaded
      const data = this.state.formData.underwriting;
      if (
        !data.underwritingDocuments ||
        data.underwritingDocuments.length === 0
      ) {
        errors.underwritingDocuments = "At least one document is required";
        isValid = false;
      }
    } else if (stepId === "bank-details") {
      const data = this.state.formData.bankDetails;
      const fields = [
        {
          name: "bankAccountHolderName",
          validators: ["required"],
          label: "Account Holder Name",
        },
        {
          name: "bankAccountType",
          validators: ["required"],
          label: "Account Type",
        },
        {
          name: "bankRoutingNumber",
          validators: ["required", "bankRoutingNumber"],
          label: "Routing Number",
        },
        {
          name: "bankAccountNumber",
          validators: ["required", "bankAccountNumber"],
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
    // Validate current step
    const isValid = this.validateCurrentStep();

    console.log("🔍 Validation Result:", {
      currentStep: this.state.currentStep,
      stepId: this.STEPS[this.state.currentStep].id,
      isValid,
      errors:
        this.state.validationState[`step${this.state.currentStep}`]?.errors,
    });

    if (!isValid) {
      console.warn("❌ Validation failed - cannot proceed to next step");
      return;
    }

    // Mark step complete
    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(this.state.currentStep);

    // Progress to next step
    if (this.state.currentStep < this.state.totalSteps - 1) {
      console.log("✅ Moving to next step:", this.state.currentStep + 1);
      this.setState({
        currentStep: this.state.currentStep + 1,
        completedSteps,
        uiState: { showErrors: false },
      });
    } else {
      console.log("✅ Final step - submitting form");
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

    // Load business details
    if (data.businessDetails) {
      newFormData.businessDetails = {
        ...newFormData.businessDetails,
        ...data.businessDetails,
      };
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

    // Load underwriting
    if (data.underwriting) {
      newFormData.underwriting = {
        ...newFormData.underwriting,
        ...data.underwriting,
      };
    }

    // Load bank details
    if (data.bankDetails) {
      newFormData.bankDetails = {
        ...newFormData.bankDetails,
        ...data.bankDetails,
      };
    }

    // Update state with loaded data
    this.setState({
      formData: newFormData
    });
  }

  // ==================== UTILITIES ====================

  formatPhoneNumber(value) {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);

    // Format progressively as (XXX) XXX-XXXX
    if (limited.length === 0) {
      return "";
    } else if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(
        6
      )}`;
    }
  }

  formatEIN(value) {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Limit to 9 digits
    const limited = cleaned.slice(0, 9);

    // Format as XX-XXXXXXX
    if (limited.length <= 2) {
      return limited;
    } else {
      return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    }
  }

  getFieldError(fieldName, repIndex = null) {
    if (!this.state.uiState.showErrors) return "";

    // For stepper steps
    const errors =
      this.state.validationState[`step${this.state.currentStep}`]?.errors || {};

    if (repIndex !== null) {
      return errors[`rep${repIndex}`]?.[fieldName] || "";
    }

    return errors[fieldName] || "";
  }

  // ==================== FORM COMPLETION ====================

  async handleFormCompletion(shouldFail = false) {
    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(this.state.currentStep);

    // Show loading state
    this.setState({
      completedSteps,
      uiState: { isLoading: true },
    });

    // Simulate processing (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Log all form data to console
    const formData = {
      businessDetails: this.state.formData.businessDetails,
      representatives: this.state.formData.representatives,
      underwriting: this.state.formData.underwriting,
      bankDetails: this.state.formData.bankDetails,
    };

    console.log("Form Submission - Complete Data:", formData);

    if (shouldFail) {
      // Handle submission failure
      this.handleSubmissionFailure(formData);
      return;
    }

    // Update state to show success page
    this.setState({
      isSubmitted: true,
      uiState: { isLoading: false },
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

  handleSubmissionFailure(formData) {
    const errorData = {
      formData,
      message: "Form submission failed. Please try again.",
      timestamp: new Date().toISOString(),
    };

    // Log error to console
    console.error("Submission Failed:", errorData);

    // Update state to show failure page
    this.setState({
      isSubmissionFailed: true,
      uiState: {
        ...this.state.uiState,
        isLoading: false,
        errorMessage: errorData.message,
        showErrors: false,
      },
    });

    // Emit custom error event
    this.dispatchEvent(
      new CustomEvent("submissionFailed", {
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

  // ==================== RENDERING ====================

  render() {
    // Show submission failure page
    if (this.state.isSubmissionFailed) {
      this.shadowRoot.innerHTML = `
        ${this.renderStyles()}
        <div class="onboarding-container">
          ${this.renderSubmissionFailurePage()}
        </div>
      `;
      this.attachSubmissionFailureListeners();
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

    // Show loading during submission
    if (this.state.uiState.isLoading) {
      this.shadowRoot.innerHTML = `
        ${this.renderStyles()}
        <div class="onboarding-container">
          <div class="step-content" style="text-align: center; padding: calc(var(--spacing-lg) * 2);">
            <h2>Submitting Your Application...</h2>
            <p style="color: var(--gray-medium); margin-bottom: var(--spacing-lg);">
              Please wait while we process your information.
            </p>
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
      return;
    }

    // Show main stepper form
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
          --primary-color: #325240;
          --success-color: #325240;
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
          max-width: 900px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }
        
        /* Logo inside form */
        .form-logo {
          text-align: center;
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
        }
        
        .form-logo img {
          max-width: 140px;
          height: auto;
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
          padding: calc(var(--spacing-lg) * 1.5);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          margin-bottom: var(--spacing-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
        
        /* Red asterisk for required fields */
        .required-asterisk {
          color: var(--error-color);
          font-weight: bold;
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
        
        /* Drag and Drop Styles */
        .drag-drop-area {
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: calc(var(--spacing-lg) * 2);
          text-align: center;
          background: var(--gray-light);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .drag-drop-area:hover {
          border-color: var(--primary-color);
          background: #f0f7f4;
        }
        
        .drag-drop-area.drag-over {
          border-color: var(--primary-color);
          background: #e6f2ed;
          border-style: solid;
        }
        
        .drag-drop-content {
          pointer-events: none;
        }
        
        .btn-browse:hover {
          background: #2a4536;
        }
        
        .uploaded-files {
          margin-top: var(--spacing-md);
        }
        
        .file-item:hover {
          background: #e9ecef;
        }
        
        .btn-remove-file:hover {
          text-decoration: underline;
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
      case "business-details":
        return this.renderBusinessDetailsStep();
      case "representatives":
        return this.renderRepresentativesStep();
      case "bank-details":
        return this.renderBankDetailsStep();
      case "underwriting":
        return this.renderUnderwritingStep();
      default:
        return "";
    }
  }

  renderUnderwritingStep() {
    const data = this.state.formData.underwriting;
    const underwritingDocuments = data.underwritingDocuments || [];
    const error = this.getFieldError("underwritingDocuments");
    const showErrors = this.state.uiState.showErrors;

    return `
      <div class="step-content">
        <div class="form-logo">
          <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
        </div>
        <h2>Underwriting Documents</h2>
        <p>Upload supporting documents (required, max 10 files, 10MB each)</p>
        
        <div class="form-grid">
          <div class="form-field full-width ${
            showErrors && error ? "has-error" : ""
          }">
            <label for="underwritingDocs">
              Upload Documents <span class="required-asterisk">*</span>
              <span style="font-size: 12px; color: var(--gray-medium); font-weight: normal;">
                (PDF, JPG, PNG, DOC, DOCX - Max 10MB each)
              </span>
            </label>
            
            <div class="drag-drop-area" id="dragDropArea">
              <div class="drag-drop-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto var(--spacing-sm); display: block; color: var(--gray-medium);">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p style="margin-bottom: var(--spacing-sm); color: #333; font-weight: 500;">
                  Drag and drop files here
                </p>
                <p style="font-size: 14px; color: var(--gray-medium); margin-bottom: var(--spacing-md);">
                  or
                </p>
                <button type="button" class="btn-browse" style="
                  padding: 10px 20px;
                  background: var(--primary-color);
                  color: white;
                  border: none;
                  border-radius: var(--border-radius-sm);
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                ">Browse Files</button>
                <input
                  type="file"
                  id="underwritingDocs"
                  name="underwritingDocs"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style="display: none;"
                />
              </div>
            </div>
            
            <div id="fileList" style="margin-top: var(--spacing-md);">
              ${
                underwritingDocuments.length > 0
                  ? this.renderFileList(underwritingDocuments)
                  : ""
              }
            </div>
            
            ${
              showErrors && error
                ? `<span class="error-message">${error}</span>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  }

  renderFileList(files) {
    return `
      <div class="uploaded-files">
        <p style="font-size: 14px; font-weight: 500; margin-bottom: var(--spacing-sm); color: #333;">
          ${files.length} file(s) uploaded:
        </p>
        ${files
          .map(
            (file, index) => `
          <div class="file-item" data-index="${index}" style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-sm);
            background: var(--gray-light);
            border-radius: var(--border-radius-sm);
            margin-bottom: var(--spacing-sm);
          ">
            <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex: 1; min-width: 0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              <span style="font-size: 14px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${file.name}
              </span>
              <span style="font-size: 12px; color: var(--gray-medium); white-space: nowrap;">
                (${(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button type="button" class="btn-remove-file" data-index="${index}" style="
              background: none;
              border: none;
              color: var(--error-color);
              cursor: pointer;
              padding: var(--spacing-sm);
              font-size: 14px;
              flex-shrink: 0;
            ">✕</button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  renderBusinessDetailsStep() {
    const data = this.state.formData.businessDetails;

    return `
      <div class="step-content">
        <div class="form-logo">
          <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
        </div>
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
            label: "Doing Business As (DBA) *",
            value: data.doingBusinessAs,
            error: this.getFieldError("doingBusinessAs"),
          })}
          
          ${this.renderField({
            name: "ein",
            label: "EIN *",
            value: data.ein,
            error: this.getFieldError("ein"),
            placeholder: "12-3456789",
            maxLength: 10,
            dataFormat: "ein",
            className: "full-width",
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
            error: this.getFieldError("businessEmail"),
            readOnly: false,
          })}
          
          ${this.renderField({
            name: "BusinessAddress1",
            label: "Street Address *",
            value: data.BusinessAddress1,
            error: this.getFieldError("BusinessAddress1"),
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
            <label for="businessState">State <span class="required-asterisk">*</span></label>
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
        <div class="form-logo">
          <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
        </div>
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
              <label for="representativeState-${index}">State <span class="required-asterisk">*</span></label>
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
        <div class="form-logo">
          <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
        </div>
        <h2>Bank Account</h2>
        <p>Link your bank account</p>
        
        <div class="form-grid">
          ${this.renderField({
            name: "bankAccountHolderName",
            label: "Account Holder Name *",
            value: data.bankAccountHolderName,
            error: this.getFieldError("bankAccountHolderName"),
            className: "full-width",
          })}
          
          <div class="form-field full-width">
            <label>Account Type <span class="required-asterisk">*</span></label>
            <div class="radio-group">
              <div class="radio-option">
                <input type="radio" id="checking" name="bankAccountType" value="checking" ${
                  data.bankAccountType === "checking" ? "checked" : ""
                }>
                <label for="checking">Checking</label>
              </div>
              <div class="radio-option">
                <input type="radio" id="savings" name="bankAccountType" value="savings" ${
                  data.bankAccountType === "savings" ? "checked" : ""
                }>
                <label for="savings">Savings</label>
              </div>
            </div>
          </div>
          
          ${this.renderField({
            name: "bankRoutingNumber",
            label: "Routing Number *",
            value: data.bankRoutingNumber,
            error: this.getFieldError("bankRoutingNumber"),
            placeholder: "123456789",
            maxLength: 9,
          })}
          
          ${this.renderField({
            name: "bankAccountNumber",
            label: "Account Number *",
            value: data.bankAccountNumber,
            error: this.getFieldError("bankAccountNumber"),
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
        <label for="${fieldId}">${label.replace(
      " *",
      ' <span class="required-asterisk">*</span>'
    )}</label>
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
    console.log("[FORM DATA]: ", this.state.formData);

    // Hide back button on first step (Business Details)
    const showBack = !isFirstStep;

    return `
      <div class="navigation-footer">
        ${
          showBack ? '<button type="button" class="btn-back">Back</button>' : ""
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
              bankDetails.bankAccountType === "checking"
                ? "Checking"
                : "Savings"
            } (****${bankDetails.bankAccountNumber.slice(-4)})</span>
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

  renderSubmissionFailurePage() {
    const { errorMessage } = this.state.uiState;

    return `
      <div class="error-container">
        <div class="error-icon">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none"/>
            <path d="M16 16 L36 36 M36 16 L16 36"/>
          </svg>
        </div>
        
        <h2>Submission Failed</h2>
        <p>Your onboarding submission could not be processed.</p>
        
        <div class="error-details">
          <h3>Error Details</h3>
          <p><strong>Issue:</strong> ${
            errorMessage || "The submission failed due to a server error."
          }</p>
          <p style="margin-top: var(--spacing-md);">
            Please try submitting again. If the problem persists, contact support.
          </p>
        </div>
        
        <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-sm); justify-content: center;">
          <button type="button" class="btn-resubmit" style="
            padding: 12px 24px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">Resubmit</button>
        </div>
        
        <p style="margin-top: var(--spacing-md); font-size: 12px; color: var(--gray-medium);">
          Or you can close this dialog.
        </p>
      </div>
    `;
  }

  // ==================== EVENT HANDLING ====================

  attachSubmissionFailureListeners() {
    const shadow = this.shadowRoot;

    // Resubmit button (on submission failure page)
    const resubmitBtn = shadow.querySelector(".btn-resubmit");
    if (resubmitBtn) {
      resubmitBtn.addEventListener("mousedown", async (e) => {
        e.preventDefault(); // Prevent blur from interfering
        // Call onError callback with resubmit action
        if (this.onError && typeof this.onError === "function") {
          this.onError({ action: "resubmit", formData: this.state.formData });
        }

        // For now, just reset to last step
        // TODO: Implement actual resubmission logic
        this.setState({
          isSubmissionFailed: false,
          currentStep: this.state.totalSteps - 1,
          uiState: { showErrors: false, errorMessage: null },
        });
      });
    }
  }

  attachFailurePageListeners() {
    const shadow = this.shadowRoot;
    // This method is currently unused but kept for future error handling
  }

  attachEventListeners() {
    const shadow = this.shadowRoot;

    // Form inputs - blur validation
    shadow.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("blur", (e) => this.handleFieldBlur(e));
      input.addEventListener("input", (e) => this.handleFieldInput(e));
    });

    // Navigation buttons - use mousedown to prevent blur interference
    const nextBtn = shadow.querySelector(".btn-next");
    if (nextBtn) {
      nextBtn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        this.goToNextStep();
      });
    }

    const backBtn = shadow.querySelector(".btn-back");
    if (backBtn) {
      backBtn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        this.goToPreviousStep();
      });
    }

    const skipBtn = shadow.querySelector(".btn-skip");
    if (skipBtn) {
      skipBtn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        this.skipStep();
      });
    }

    // Step indicators (for navigation)
    shadow.querySelectorAll("[data-step]").forEach((indicator) => {
      indicator.addEventListener("click", (e) => {
        const stepIndex = parseInt(e.currentTarget.dataset.step);
        this.goToStep(stepIndex);
      });
    });

    // Representative CRUD - use mousedown to prevent blur interference
    const addBtn = shadow.querySelector(".add-representative-btn");
    if (addBtn) {
      addBtn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        this.addRepresentative();
      });
    }

    shadow.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        const index = parseInt(e.target.dataset.index);
        this.removeRepresentative(index);
      });
    });

    // File upload handlers for underwriting documents
    const fileInput = shadow.querySelector("#underwritingDocs");
    const dragDropArea = shadow.querySelector("#dragDropArea");
    const browseBtn = shadow.querySelector(".btn-browse");

    if (fileInput && dragDropArea) {
      // Browse button click
      if (browseBtn) {
        browseBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          fileInput.click();
        });
      }

      // Click on drag area
      dragDropArea.addEventListener("click", () => {
        fileInput.click();
      });

      // Drag and drop events
      dragDropArea.addEventListener("dragenter", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.classList.add("drag-over");
      });

      dragDropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.classList.add("drag-over");
      });

      dragDropArea.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === dragDropArea) {
          dragDropArea.classList.remove("drag-over");
        }
      });

      dragDropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDropArea.classList.remove("drag-over");

        const files = Array.from(e.dataTransfer.files);
        this.handleFileUpload(files);
      });

      // File input change
      fileInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        this.handleFileUpload(files);
      });
    }

    // Remove file buttons
    shadow.querySelectorAll(".btn-remove-file").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.removeFile(index);
      });
    });
  }

  handleFileUpload(files) {
    // Validate files
    const errors = [];
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 10;
    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];

    // Get existing documents
    const existingDocs =
      this.state.formData.underwriting.underwritingDocuments || [];
    const totalFiles = existingDocs.length + files.length;

    if (totalFiles > maxFiles) {
      errors.push(
        `Maximum ${maxFiles} files allowed (you have ${existingDocs.length} already)`
      );
    }

    files.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds 10MB limit`);
      } else if (file.size === 0) {
        errors.push(`${file.name} is empty`);
      } else {
        // Check file type
        const ext = "." + file.name.split(".").pop().toLowerCase();
        if (allowedTypes.includes(ext)) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name} is not an allowed file type`);
        }
      }
    });

    // Combine with existing documents
    const allDocs = [...existingDocs, ...validFiles].slice(0, maxFiles);

    console.log("[FILE UPLOAD ERRORS]: ", errors);

    // Update state with valid files
    this.setState({
      formData: {
        underwriting: {
          ...this.state.formData.underwriting,
          underwritingDocuments: allDocs,
        },
      },
      uiState: {
        errorMessage: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    // Show errors if any
    if (errors.length > 0) {
      const fileList = this.shadowRoot.querySelector("#fileList");
      if (fileList) {
        const errorDiv = document.createElement("div");
        errorDiv.style.color = "var(--error-color)";
        errorDiv.style.fontSize = "12px";
        errorDiv.style.marginTop = "var(--spacing-sm)";
        errorDiv.textContent = errors.join("; ");
        fileList.prepend(errorDiv);

        // Remove error message after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
      }
    }
  }

  removeFile(index) {
    const underwritingDocuments = [
      ...this.state.formData.underwriting.underwritingDocuments,
    ];

    underwritingDocuments.splice(index, 1);

    this.setState({
      formData: {
        underwriting: {
          ...this.state.formData.underwriting,
          underwritingDocuments,
        },
      },
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

    // EIN formatting on blur
    if (input.dataset.format === "ein") {
      input.value = this.formatEIN(value);
    }

    // URL normalization on blur
    if (input.type === "url" && value) {
      const validationResult = this.validators.url(value);
      if (validationResult.isValid && validationResult.normalizedValue) {
        input.value = validationResult.normalizedValue;
      }
    }

    // Update state based on step
    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "business-details") {
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
    } else if (stepId === "underwriting") {
      // TODO: Add underwriting field handling here when fields are added
      this.setState({
        formData: {
          underwriting: {
            ...this.state.formData.underwriting,
            [name]: input.value,
          },
        },
      });
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
    let value = input.value;
    const repIndex = input.dataset.repIndex;

    // Apply real-time formatting for EIN
    if (input.dataset.format === "ein") {
      const cursorPosition = input.selectionStart;
      const oldValue = value;
      value = this.formatEIN(value);
      input.value = value;

      // Adjust cursor position after formatting
      if (oldValue.length < value.length) {
        // If a hyphen was added, move cursor after it
        input.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      } else {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }

    // Apply real-time formatting for phone numbers
    if (input.dataset.format === "phone") {
      const cursorPosition = input.selectionStart;
      const oldValue = value;
      value = this.formatPhoneNumber(value);
      input.value = value;

      // Adjust cursor position after formatting
      const diff = value.length - oldValue.length;
      if (diff > 0) {
        // Characters were added (formatting), move cursor forward
        input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
      } else {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }

    // Update state in real-time
    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = value;
    } else if (stepId === "representatives" && repIndex !== undefined) {
      const idx = parseInt(repIndex);
      if (this.state.formData.representatives[idx]) {
        this.state.formData.representatives[idx][name] = value;
      }
    } else if (stepId === "underwriting") {
      // TODO: Add underwriting field handling here when fields are added
      this.state.formData.underwriting[name] = value;
    } else if (stepId === "bank-details") {
      this.state.formData.bankDetails[name] = value;
    }

    // Real-time validation: validate the field and update error state
    const stepKey = `step${this.state.currentStep}`;

    // Initialize errors object if it doesn't exist
    if (!this.state.validationState[stepKey]) {
      this.state.validationState[stepKey] = { isValid: true, errors: {} };
    }
    if (!this.state.validationState[stepKey].errors) {
      this.state.validationState[stepKey].errors = {};
    }

    // Only validate if showErrors is true (after first submit attempt)
    if (this.state.uiState.showErrors) {
      // Get field configuration for validation
      let validators = [];
      let fieldLabel = name;

      if (stepId === "business-details") {
        const fieldConfigs = {
          businessName: { validators: ["required"], label: "Business Name" },
          doingBusinessAs: {
            validators: ["required"],
            label: "Doing Business As (DBA)",
          },
          ein: { validators: ["required", "ein"], label: "EIN" },
          businessWebsite: { validators: ["url"], label: "Business Website" },
          businessPhoneNumber: {
            validators: ["required", "usPhone"],
            label: "Business Phone",
          },
          businessEmail: {
            validators: ["required", "email"],
            label: "Business Email",
          },
          BusinessAddress1: {
            validators: ["required"],
            label: "Street Address",
          },
          businessCity: { validators: ["required"], label: "City" },
          businessState: { validators: ["required"], label: "State" },
          businessPostalCode: {
            validators: ["required", "postalCode"],
            label: "ZIP Code",
          },
        };
        if (fieldConfigs[name]) {
          validators = fieldConfigs[name].validators;
          fieldLabel = fieldConfigs[name].label;
        }
      } else if (stepId === "representatives" && repIndex !== undefined) {
        const fieldConfigs = {
          representativeFirstName: {
            validators: ["required"],
            label: "First Name",
          },
          representativeLastName: {
            validators: ["required"],
            label: "Last Name",
          },
          representativeJobTitle: {
            validators: ["required"],
            label: "Job Title",
          },
          representativePhone: {
            validators: ["required", "usPhone"],
            label: "Phone",
          },
          representativeEmail: {
            validators: ["required", "email"],
            label: "Email",
          },
          representativeDateOfBirth: {
            validators: ["required"],
            label: "Date of Birth",
          },
          representativeAddress: { validators: ["required"], label: "Address" },
          representativeCity: { validators: ["required"], label: "City" },
          representativeState: { validators: ["required"], label: "State" },
          representativeZip: {
            validators: ["required", "postalCode"],
            label: "ZIP Code",
          },
        };
        if (fieldConfigs[name]) {
          validators = fieldConfigs[name].validators;
          fieldLabel = fieldConfigs[name].label;
        }
      } else if (stepId === "underwriting") {
        // TODO: Add underwriting field validation configs here when fields are added
        // Example:
        // const fieldConfigs = {
        //   industryType: { validators: ["required"], label: "Industry Type" },
        // };
        // if (fieldConfigs[name]) {
        //   validators = fieldConfigs[name].validators;
        //   fieldLabel = fieldConfigs[name].label;
        // }
      } else if (stepId === "bank-details") {
        const fieldConfigs = {
          accountHolderName: {
            validators: ["required"],
            label: "Account Holder Name",
          },
          accountType: { validators: ["required"], label: "Account Type" },
          routingNumber: {
            validators: ["required", "routingNumber"],
            label: "Routing Number",
          },
          accountNumber: {
            validators: ["required", "accountNumber"],
            label: "Account Number",
          },
        };
        if (fieldConfigs[name]) {
          validators = fieldConfigs[name].validators;
          fieldLabel = fieldConfigs[name].label;
        }
      }

      // Validate the field
      if (validators.length > 0) {
        const error = this.validateField(value, validators, fieldLabel);

        if (repIndex !== undefined) {
          // Handle representative field errors
          const repKey = `rep${repIndex}`;
          if (!this.state.validationState[stepKey].errors[repKey]) {
            this.state.validationState[stepKey].errors[repKey] = {};
          }

          if (error) {
            this.state.validationState[stepKey].errors[repKey][name] = error;
          } else {
            delete this.state.validationState[stepKey].errors[repKey][name];
            // If no more errors for this rep, remove the rep key
            if (
              Object.keys(this.state.validationState[stepKey].errors[repKey])
                .length === 0
            ) {
              delete this.state.validationState[stepKey].errors[repKey];
            }
          }
        } else {
          // Handle regular field errors
          if (error) {
            this.state.validationState[stepKey].errors[name] = error;
          } else {
            delete this.state.validationState[stepKey].errors[name];
          }
        }

        // Update error message in DOM without full re-render
        this.updateFieldErrorDisplay(input, error);
      }
    }
  }

  updateFieldErrorDisplay(input, error) {
    // Find the parent form-field div
    const formField = input.closest(".form-field");
    if (!formField) return;

    // Update has-error class
    if (error) {
      formField.classList.add("has-error");
    } else {
      formField.classList.remove("has-error");
    }

    // Find or create error message element
    let errorSpan = formField.querySelector(".error-message");

    if (error) {
      if (errorSpan) {
        // Update existing error message
        errorSpan.textContent = error;
      } else {
        // Create new error message
        errorSpan = document.createElement("span");
        errorSpan.className = "error-message";
        errorSpan.textContent = error;
        formField.appendChild(errorSpan);
      }
    } else {
      // Remove error message if exists
      if (errorSpan) {
        errorSpan.remove();
      }
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
 * Standalone function to verify an operator email
 * This can be used to check operator email status
 *
 * @param {string} operatorEmail - The operator email address to verify
 * @param {boolean} mockResult - Mock result for testing (true = verified, false = not verified)
 * @returns {boolean} - Returns true if operator email is verified, false otherwise
 *
 * @example
 * // Check if operator email is verified
 * const isVerified = verifyOperator('operator@example.com', true);
 * if (isVerified) {
 *   // Proceed with operation
 * } else {
 *   // Show error message
 * }
 */
function verifyOperator(operatorEmail, mockResult) {
  if (!operatorEmail || typeof operatorEmail !== "string") {
    console.error("verifyOperator: operatorEmail must be a non-empty string");
    return false;
  }

  if (typeof mockResult !== "boolean") {
    console.error("verifyOperator: mockResult must be a boolean");
    return false;
  }

  // Log verification attempt
  console.log(`Verifying operator email: ${operatorEmail}`, {
    result: mockResult,
  });

  // Return the mock result
  return mockResult;
}

// Export for module usage (if using ES modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BisonJibPayAPI, OperatorOnboarding, verifyOperator };
}

// Also make available globally for script tag usage
if (typeof window !== "undefined") {
  window.BisonJibPayAPI = BisonJibPayAPI;
  window.verifyOperator = verifyOperator;
}
