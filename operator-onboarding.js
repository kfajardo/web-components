/**
 * Operator Onboarding Web Component
 *
 * A web component that captures operator information via stepper form
 * with necessary field validations. This serves as the simplified approach
 * in comparison to the Moov Onboarding Drop.
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from api.js)
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @example
 * ```html
 * <script src="api.js"></script>
 * <script src="operator-onboarding.js"></script>
 *
 * <operator-onboarding id="onboarding"></operator-onboarding>
 * <script>
 *   const onboarding = document.getElementById('onboarding');
 *   onboarding.onSuccess = (data) => console.log('Success!', data);
 *   onboarding.onError = (error) => console.error('Error:', error);
 * </script>
 * ```
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

    // Check if BisonJibPayAPI is available
    if (typeof BisonJibPayAPI === "undefined") {
      console.error(
        "OperatorOnboarding: BisonJibPayAPI is not available. Please ensure api.js is loaded before operator-onboarding.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Initialize state
    this.state = {
      isModalOpen: false,
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
    this._onSubmitCallback = null;
    this._onConfirmCallback = null;
    this._initialData = null;

    this.render();
  }

  // Getter and setter for onSuccess property (for easy framework integration)
  get onSuccess() {
    return this._onSuccessCallback;
  }

  set onSuccess(callback) {
    console.log("OperatorOnboarding: onSuccess setter called", {
      callbackType: typeof callback,
      isFunction: typeof callback === "function",
    });
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

  // Getter and setter for onSubmit property (for pre-submission handling)
  get onSubmit() {
    return this._onSubmitCallback;
  }

  set onSubmit(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onSubmitCallback = callback;
    }
  }

  // Getter and setter for onConfirm property (for success confirmation button)
  get onConfirm() {
    return this._onConfirmCallback;
  }

  set onConfirm(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onConfirmCallback = callback;
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
    return ["on-success", "on-error", "on-submit", "on-load"];
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
    const wasModalOpen = this.state.isModalOpen;

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

    // Track if modal was already open to skip animations on content updates
    this._skipModalAnimation = wasModalOpen && this.state.isModalOpen;
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
          validators: ["required", "url"],
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

    // Update state with loaded data and initial step if provided
    const newState = {
      formData: newFormData,
    };

    // Set initial step if provided (0-indexed)
    if (typeof data.initialStep === "number" && data.initialStep >= 0 && data.initialStep < this.state.totalSteps) {
      newState.currentStep = data.initialStep;
    }

    this.setState(newState);
  }

  /**
   * Reset form to initial state or to onLoad values if provided
   */
  resetForm() {
    // Default empty form data
    const defaultFormData = {
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
        underwritingDocuments: [],
      },
      bankDetails: {
        bankAccountHolderName: "",
        bankAccountType: "checking",
        bankRoutingNumber: "",
        bankAccountNumber: "",
      },
    };

    // Default validation state
    const defaultValidationState = {
      step0: { isValid: false, errors: {} },
      step1: { isValid: true, errors: {} },
      step2: { isValid: false, errors: {} },
      step3: { isValid: false, errors: {} },
    };

    // Reset to defaults
    this.state = {
      ...this.state,
      currentStep: 0,
      isSubmitted: false,
      isFailed: false,
      isSubmissionFailed: false,
      formData: defaultFormData,
      validationState: defaultValidationState,
      completedSteps: new Set(),
      uiState: {
        isLoading: false,
        showErrors: false,
        errorMessage: null,
      },
    };

    // If we have initial data from onLoad, re-apply it
    if (this._initialData) {
      this.loadInitialData(this._initialData);
    }
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
    console.log("OperatorOnboarding: handleFormCompletion STARTED");

    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(this.state.currentStep);

    // Prepare form data
    const formData = {
      businessDetails: this.state.formData.businessDetails,
      representatives: this.state.formData.representatives,
      underwriting: this.state.formData.underwriting,
      bankDetails: this.state.formData.bankDetails,
    };

    // Call onSubmit callback if provided (before submission)
    let processedData = formData;
    if (this.onSubmit && typeof this.onSubmit === "function") {
      try {
        const result = await this.onSubmit(formData);

        // If callback returns false, cancel submission
        if (result === false) {
          console.log("Form submission cancelled by onSubmit callback");
          return;
        }

        // If callback returns modified data, use it
        if (result && typeof result === "object") {
          processedData = result;
        }
      } catch (error) {
        console.error("Error in onSubmit callback:", error);
        this.handleSubmissionFailure(formData);
        return;
      }
    }

    // Show loading state
    this.setState({
      completedSteps,
      uiState: { isLoading: true },
    });

    console.log("Form Submission - Complete Data:", processedData);

    // Check if API is available
    if (!this.api) {
      console.error("OperatorOnboarding: API not available for registration");
      this.handleSubmissionFailure(processedData);
      return;
    }

    try {
      // Build FormData for API submission
      const apiFormData = new FormData();

      // Add business details
      const businessDetails = processedData.businessDetails;
      apiFormData.append("businessName", businessDetails.businessName || "");
      apiFormData.append("doingBusinessAs", businessDetails.doingBusinessAs || "");
      apiFormData.append("ein", businessDetails.ein || "");
      apiFormData.append("businessWebsite", businessDetails.businessWebsite || "");
      apiFormData.append("businessPhoneNumber", businessDetails.businessPhoneNumber || "");
      apiFormData.append("businessEmail", businessDetails.businessEmail || "");
      apiFormData.append("businessAddress1", businessDetails.BusinessAddress1 || "");
      apiFormData.append("businessCity", businessDetails.businessCity || "");
      apiFormData.append("businessState", businessDetails.businessState || "");
      apiFormData.append("businessPostalCode", businessDetails.businessPostalCode || "");

      // Add representatives as JSON string
      if (processedData.representatives && processedData.representatives.length > 0) {
        apiFormData.append("representatives", JSON.stringify(processedData.representatives));
      }

      // Add bank details
      const bankDetails = processedData.bankDetails;
      apiFormData.append("bankAccountHolderName", bankDetails.bankAccountHolderName || "");
      apiFormData.append("bankAccountType", bankDetails.bankAccountType || "checking");
      apiFormData.append("bankRoutingNumber", bankDetails.bankRoutingNumber || "");
      apiFormData.append("bankAccountNumber", bankDetails.bankAccountNumber || "");

      // Add underwriting documents (files)
      const underwritingDocs = processedData.underwriting?.underwritingDocuments || [];
      underwritingDocs.forEach((file) => {
        if (file instanceof File) {
          apiFormData.append("underwritingDocuments", file);
        }
      });

      console.log("OperatorOnboarding: Calling registerOperator API");
      console.log("OperatorOnboarding: FormData entries:");
      for (const [key, value] of apiFormData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }
      const response = await this.api.registerOperator(apiFormData);
      console.log("OperatorOnboarding: registerOperator API response", response);

      if (shouldFail || !response.success) {
        // Handle submission failure
        this.handleSubmissionFailure(processedData);
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
          detail: { ...processedData, apiResponse: response },
          bubbles: true,
          composed: true,
        })
      );

      // Call onSuccess callback if provided
      console.log("OperatorOnboarding: Checking onSuccess callback", {
        hasCallback: !!this.onSuccess,
        callbackType: typeof this.onSuccess,
      });
      if (this.onSuccess && typeof this.onSuccess === "function") {
        console.log("OperatorOnboarding: Calling onSuccess callback");
        this.onSuccess({ ...processedData, apiResponse: response });
      }
    } catch (error) {
      console.error("OperatorOnboarding: registerOperator API error", error);
      this.handleSubmissionFailure(processedData);
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

  /**
   * Handle success confirmation button click
   * Dispatches event and calls onConfirm callback, then closes modal
   */
  handleSuccessConfirm() {
    const confirmData = {
      formData: this.state.formData,
      timestamp: new Date().toISOString(),
    };

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent("onboardingConfirmed", {
        detail: confirmData,
        bubbles: true,
        composed: true,
      })
    );

    // Call onConfirm callback if provided
    if (this.onConfirm && typeof this.onConfirm === "function") {
      this.onConfirm(confirmData);
    }

    // Close the modal
    this.closeModal();
  }

  // ==================== MODAL METHODS ====================

  openModal() {
    this.setState({ isModalOpen: true });

    // Apply animation classes after modal is rendered
    requestAnimationFrame(() => {
      const modal = this.shadowRoot.querySelector(".modal-overlay");
      if (modal) {
        modal.classList.add("show", "animating-in");
        setTimeout(() => {
          modal.classList.remove("animating-in");
        }, 200);
      }
    });

    this.dispatchEvent(
      new CustomEvent("onboarding-modal-open", {
        bubbles: true,
        composed: true,
      })
    );
  }

  closeModal() {
    // Clean up escape key handler
    if (this._escapeHandler) {
      document.removeEventListener("keydown", this._escapeHandler);
      this._escapeHandler = null;
    }

    // Get the modal overlay for animation
    const overlay = this.shadowRoot.querySelector(".modal-overlay");

    if (overlay) {
      // Add animating-out class to trigger exit animation
      overlay.classList.add("animating-out");
      overlay.classList.remove("show");

      // Wait for animation to complete before removing from DOM
      setTimeout(() => {
        // Reset form to initial state (or onLoad values if provided)
        this.resetForm();

        // Update state to remove modal from DOM
        this.setState({ isModalOpen: false });

        // Restore body scroll
        document.body.style.overflow = "";

        // Dispatch close event
        this.dispatchEvent(
          new CustomEvent("onboarding-modal-close", {
            bubbles: true,
            composed: true,
          })
        );
      }, 150); // Match the fadeOut animation duration (150ms)
    } else {
      // Reset form to initial state (or onLoad values if provided)
      this.resetForm();

      // Fallback if overlay not found - close immediately
      this.setState({ isModalOpen: false });
      document.body.style.overflow = "";
      this.dispatchEvent(
        new CustomEvent("onboarding-modal-close", {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  // ==================== RENDERING ====================

  render() {
    // Always render the button + modal structure
    this.shadowRoot.innerHTML = `
      ${this.renderStyles()}
      ${this.renderButton()}
      ${this.state.isModalOpen ? this.renderModal() : ""}
    `;
    this.attachEventListeners();
  }

  renderButton() {
    return `
      <button class="onboarding-trigger-btn" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Start Onboarding
      </button>
    `;
  }

  renderModal() {
    // Add 'show' class if modal was already open to prevent flash during re-renders
    const showClass = this._skipModalAnimation ? "show" : "";
    // Hide close button during submission and on success screen (require confirm button)
    const hideCloseButton = this.state.uiState.isLoading || this.state.isSubmitted;

    return `
      <div class="modal-overlay ${showClass}">
        <div class="modal-container">
          ${!hideCloseButton ? `
            <button class="modal-close-btn" type="button" aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : ''}
          ${this.renderModalContent()}
        </div>
      </div>
    `;
  }

  renderModalContent() {
    // Show submission failure page
    if (this.state.isSubmissionFailed) {
      return `
        <div class="modal-body-full">
          ${this.renderSubmissionFailurePage()}
        </div>
      `;
    }

    // Show success page if form is submitted
    if (this.state.isSubmitted) {
      return `
        <div class="modal-body-full">
          ${this.renderSuccessPage()}
        </div>
      `;
    }

    // Show loading during submission
    if (this.state.uiState.isLoading) {
      return `
        <div class="modal-body-full">
          <div class="loading-content">
            <h2>Submitting Your Application...</h2>
            <p style="color: var(--gray-medium); margin-bottom: var(--spacing-lg);">
              Please wait while we process your information.
            </p>
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
    }

    // Show main stepper form with fixed header/footer layout
    return `
      <div class="modal-layout">
        <div class="modal-header">
          <div class="form-logo">
            <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
          </div>
          ${this.renderStepperHeader()}
        </div>
        <div class="modal-body">
          ${this.renderFormContent()}
        </div>
        <div class="modal-footer">
          ${this.renderNavigationFooter()}
        </div>
      </div>
    `;
  }

  renderFormContent() {
    const stepId = this.STEPS[this.state.currentStep].id;

    switch (stepId) {
      case "business-details":
        return this.renderBusinessDetailsForm();
      case "representatives":
        return this.renderRepresentativesForm();
      case "bank-details":
        return this.renderBankDetailsForm();
      case "underwriting":
        return this.renderUnderwritingForm();
      default:
        return "";
    }
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
          display: inline-block;
        }

        /* Trigger Button */
        .onboarding-trigger-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 40px;
          box-sizing: border-box;
        }

        .onboarding-trigger-btn:hover {
          background: #2a4536;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(50, 82, 64, 0.3);
        }

        .onboarding-trigger-btn:active {
          transform: translateY(0);
        }

        .onboarding-trigger-btn svg {
          flex-shrink: 0;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          opacity: 0;
        }

        .modal-overlay.show {
          opacity: 1;
        }

        .modal-overlay.animating-in {
          animation: fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .modal-overlay.animating-out {
          animation: fadeOut 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        /* Modal Container */
        .modal-container {
          background: white;
          border-radius: var(--border-radius-lg);
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }

        .modal-overlay.show .modal-container {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .modal-overlay.animating-in .modal-container {
          animation: slideInScale 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .modal-overlay.animating-out .modal-container {
          animation: slideOutScale 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideOutScale {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }

        /* Modal Layout - Fixed Header/Footer with Scrollable Body */
        .modal-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 90vh;
          overflow: hidden;
        }

        .modal-header {
          flex-shrink: 0;
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
          background: white;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
          min-height: 0;
        }

        .modal-footer {
          flex-shrink: 0;
          padding: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
          background: white;
        }

        .modal-body-full {
          padding: var(--spacing-lg);
          overflow-y: auto;
          max-height: calc(90vh - 60px);
        }

        .loading-content {
          text-align: center;
          padding: calc(var(--spacing-lg) * 2);
        }


        /* Modal Close Button */
        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          color: var(--gray-medium);
          transition: all 0.2s ease;
          z-index: 10;
        }

        .modal-close-btn:hover {
          background: var(--gray-light);
          color: #333;
        }
        
        .onboarding-container {
          max-width: 900px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }
        
        /* Logo inside modal header */
        .form-logo {
          text-align: center;
          margin-bottom: var(--spacing-md);
        }
        
        .form-logo img {
          max-width: 140px;
          height: auto;
        }
        
        /* Stepper Header */
        .stepper-header {
          display: flex;
          justify-content: space-between;
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

        /* Form Section - for scrollable content in modal */
        .form-section {
          background: white;
        }

        .form-section h2 {
          margin-bottom: var(--spacing-sm);
          color: #333;
        }

        .form-section > p {
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
          margin: 0;
        }
        
        .navigation-footer button {
          padding: 12px 24px;
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          height: 40px;
          box-sizing: border-box;
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

        /* Success Confirmation Button */
        .btn-confirm-success {
          margin-top: var(--spacing-lg);
          padding: 14px 32px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-confirm-success:hover {
          background: #2a4536;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(50, 82, 64, 0.3);
        }

        .btn-confirm-success:active {
          transform: translateY(0);
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

        /* ==================== MOBILE RESPONSIVE STYLES ==================== */

        /* Tablet breakpoint (768px and below) */
        @media screen and (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }

          .modal-container {
            max-height: 95vh;
            border-radius: var(--border-radius);
          }

          .modal-header {
            padding: var(--spacing-md);
          }

          .modal-body {
            padding: var(--spacing-md);
          }

          .modal-footer {
            padding: var(--spacing-md);
          }

          .modal-body-full {
            padding: var(--spacing-md);
            max-height: calc(95vh - 50px);
          }

          .modal-close-btn {
            top: 12px;
            right: 12px;
            padding: 6px;
          }

          /* Stepper - show only current step label on tablet */
          .stepper-header {
            gap: var(--spacing-sm);
          }

          .step-circle {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }

          .step-label {
            font-size: 11px;
          }

          /* Form grid - single column on tablet */
          .form-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-sm);
          }

          .step-content {
            padding: var(--spacing-md);
          }

          .step-content h2 {
            font-size: 20px;
          }

          /* Representative cards */
          .representative-card {
            padding: var(--spacing-sm);
          }

          .card-header h3 {
            font-size: 14px;
          }

          /* Navigation footer */
          .navigation-footer {
            flex-wrap: wrap;
            gap: var(--spacing-sm);
          }

          .navigation-footer button {
            padding: 10px 16px;
            font-size: 13px;
            height: 38px;
          }

          /* Drag drop area */
          .drag-drop-area {
            padding: var(--spacing-lg);
          }

          /* Success/Error containers */
          .success-icon,
          .error-icon {
            width: 100px;
            height: 100px;
          }

          .success-container h2,
          .error-container h2 {
            font-size: 24px;
          }

          .success-details {
            padding: var(--spacing-md);
          }
        }

        /* Mobile breakpoint (480px and below) */
        @media screen and (max-width: 480px) {
          .modal-overlay {
            padding: 0;
          }

          .modal-container {
            max-height: 100vh;
            height: 100vh;
            border-radius: 0;
          }

          .modal-layout {
            max-height: 100vh;
          }

          .modal-body-full {
            max-height: calc(100vh - 50px);
          }

          .modal-header {
            padding: var(--spacing-sm) var(--spacing-md);
          }

          .modal-body {
            padding: var(--spacing-sm) var(--spacing-md);
          }

          .modal-footer {
            padding: var(--spacing-sm) var(--spacing-md);
          }

          .modal-close-btn {
            top: 8px;
            right: 8px;
          }

          /* Stepper - compact mobile version */
          .stepper-header {
            justify-content: center;
            gap: 4px;
          }

          .stepper-header::before {
            top: 16px;
          }

          .step-indicator {
            flex: 0 0 auto;
            min-width: 50px;
          }

          .step-circle {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }

          .step-label {
            font-size: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 60px;
          }

          /* Form fields */
          .form-field {
            margin-bottom: var(--spacing-sm);
          }

          .form-field label {
            font-size: 13px;
            margin-bottom: 4px;
          }

          .form-field input,
          .form-field select {
            padding: 8px;
            font-size: 16px; /* Prevents iOS zoom on focus */
          }

          .step-content {
            padding: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
          }

          .step-content h2 {
            font-size: 18px;
          }

          .step-content > p {
            font-size: 13px;
            margin-bottom: var(--spacing-sm);
          }

          .form-section h2 {
            font-size: 18px;
          }

          .form-section > p {
            font-size: 13px;
          }

          /* Representative cards */
          .representative-card {
            padding: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
          }

          .card-header {
            margin-bottom: var(--spacing-sm);
            padding-bottom: 4px;
          }

          .card-header h3 {
            font-size: 13px;
          }

          .remove-btn {
            font-size: 12px;
            padding: 4px;
          }

          .add-representative-btn {
            padding: 10px;
            font-size: 13px;
          }

          /* Navigation footer - stack buttons on mobile */
          .navigation-footer {
            flex-direction: column-reverse;
            gap: var(--spacing-sm);
          }

          .navigation-footer button {
            width: 100%;
            padding: 12px;
            font-size: 14px;
            height: 44px; /* Touch-friendly height */
          }

          .btn-skip {
            margin-left: 0;
          }

          /* Radio group - stack on mobile */
          .radio-group {
            flex-direction: column;
            gap: var(--spacing-sm);
          }

          /* Drag drop area */
          .drag-drop-area {
            padding: var(--spacing-md);
          }

          .drag-drop-content svg {
            width: 40px;
            height: 40px;
          }

          /* File items */
          .file-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
          }

          /* Success/Error containers */
          .success-icon,
          .error-icon {
            width: 80px;
            height: 80px;
          }

          .success-icon svg,
          .error-icon svg {
            width: 40px;
            height: 40px;
          }

          .success-container h2,
          .error-container h2 {
            font-size: 20px;
          }

          .success-container p,
          .error-container p {
            font-size: 14px;
          }

          .success-details {
            padding: var(--spacing-sm);
            margin: var(--spacing-md) 0;
          }

          .success-details h3 {
            font-size: 16px;
          }

          .detail-item {
            flex-direction: column;
            gap: 4px;
          }

          .detail-label,
          .detail-value {
            font-size: 13px;
          }

          /* Trigger button - full width on mobile */
          .onboarding-trigger-btn {
            width: 100%;
            justify-content: center;
          }
        }

        /* Small mobile breakpoint (320px and below) */
        @media screen and (max-width: 320px) {
          .step-label {
            display: none;
          }

          .step-circle {
            width: 28px;
            height: 28px;
            font-size: 11px;
          }

          .stepper-header::before {
            top: 14px;
          }

          .step-content h2,
          .form-section h2 {
            font-size: 16px;
          }

          .navigation-footer button {
            font-size: 13px;
          }
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
    // This method is kept for backwards compatibility
    // but the modal now uses renderFormContent() instead
    return this.renderFormContent();
  }

  renderUnderwritingStep() {
    return this.renderUnderwritingForm();
  }

  renderUnderwritingForm() {
    const data = this.state.formData.underwriting;
    const underwritingDocuments = data.underwritingDocuments || [];
    const error = this.getFieldError("underwritingDocuments");
    const showErrors = this.state.uiState.showErrors;

    return `
      <div class="form-section">
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

  renderBusinessDetailsStep() {
    return this.renderBusinessDetailsForm();
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

  renderBusinessDetailsForm() {
    const data = this.state.formData.businessDetails;

    return `
      <div class="form-section">
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
            label: "Business Website *",
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
    return this.renderRepresentativesForm();
  }

  renderRepresentativesForm() {
    const representatives = this.state.formData.representatives;

    return `
      <div class="form-section">
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
    return this.renderBankDetailsForm();
  }

  renderBankDetailsForm() {
    const data = this.state.formData.bankDetails;

    return `
      <div class="form-section">
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

        <button class="btn-confirm-success" type="button">
          Done
        </button>
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

    // Trigger button to open modal
    const triggerBtn = shadow.querySelector(".onboarding-trigger-btn");
    if (triggerBtn) {
      triggerBtn.addEventListener("click", () => this.openModal());
    }

    // Modal close button
    const closeBtn = shadow.querySelector(".modal-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }

    // Close on overlay click (outside modal) - stop event from bubbling from modal-container
    // Prevent closing during submission and on success screen (require confirm button)
    const overlay = shadow.querySelector(".modal-overlay");
    const modalContainer = shadow.querySelector(".modal-container");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        // Prevent closing during submission or on success screen
        if (this.state.uiState.isLoading || this.state.isSubmitted) {
          return;
        }
        // Only close if clicking exactly on the overlay, not inside the modal
        if (e.target === overlay) {
          this.closeModal();
        }
      });

      // Prevent clicks inside modal container from bubbling to overlay
      if (modalContainer) {
        modalContainer.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      }
    }

    // Close on Escape key (prevent during submission and on success screen)
    if (this.state.isModalOpen) {
      this._escapeHandler = (e) => {
        // Prevent closing during submission or on success screen
        if (this.state.uiState.isLoading || this.state.isSubmitted) {
          return;
        }
        if (e.key === "Escape") {
          this.closeModal();
        }
      };
      document.addEventListener("keydown", this._escapeHandler);
    }

    // Attach submission failure listeners if needed
    if (this.state.isSubmissionFailed) {
      this.attachSubmissionFailureListeners();
    }

    // Success confirmation button
    const confirmBtn = shadow.querySelector(".btn-confirm-success");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.handleSuccessConfirm());
    }

    // Form inputs - blur validation (only when modal is open)
    if (this.state.isModalOpen) {
      shadow.querySelectorAll("input, select").forEach((input) => {
        input.addEventListener("blur", (e) => this.handleFieldBlur(e));
        input.addEventListener("input", (e) => this.handleFieldInput(e));
      });
    }

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

    // Update state based on step - directly modify state without re-rendering
    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = input.value;
    } else if (stepId === "representatives" && repIndex !== undefined) {
      const idx = parseInt(repIndex);
      if (this.state.formData.representatives[idx]) {
        this.state.formData.representatives[idx][name] = input.value;
      }
    } else if (stepId === "underwriting") {
      this.state.formData.underwriting[name] = input.value;
    } else if (stepId === "bank-details") {
      this.state.formData.bankDetails[name] = input.value;
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
    // Clean up escape key handler
    if (this._escapeHandler) {
      document.removeEventListener("keydown", this._escapeHandler);
    }
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

    // Handle on-submit attribute
    if (name === "on-submit" && newValue) {
      // Use the setter to assign the callback from window scope
      this.onSubmit = window[newValue];
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

// Export for module usage (ES6)
export { OperatorOnboarding };

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.OperatorOnboarding = OperatorOnboarding;
}

// Export for CommonJS (Node.js)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { OperatorOnboarding };
}
