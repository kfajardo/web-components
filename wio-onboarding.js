/**
 * WIO Onboarding Web Component
 *
 * A web component that captures WIO information via inline stepper form
 * with necessary field validations. This displays the form directly without
 * requiring a button to open a modal.
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from api.js)
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @example
 * ```html
 * <script src="api.js"></script>
 * <script src="wio-onboarding.js"></script>
 *
 * <wio-onboarding id="onboarding"></wio-onboarding>
 * <script>
 *   const onboarding = document.getElementById('onboarding');
 *   onboarding.onSuccess = (data) => console.log('Success!', data);
 *   onboarding.onError = (error) => console.error('Error:', error);
 * </script>
 * ```
 */

class WioOnboarding extends HTMLElement {
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
    const BisonJibPayAPIClass =
      typeof BisonJibPayAPI !== "undefined"
        ? BisonJibPayAPI
        : typeof window !== "undefined" && window.BisonJibPayAPI;

    if (!BisonJibPayAPIClass) {
      console.error(
        "WioOnboarding: BisonJibPayAPI is not available. Please ensure api.js is loaded before wio-onboarding.js"
      );
      console.error(
        "Available global objects:",
        Object.keys(window).filter((k) => k.includes("Bison"))
      );
      this.api = null;
    } else {
      console.log(
        "✅ WioOnboarding: BisonJibPayAPI found, initializing API client"
      );
      this.api = new BisonJibPayAPIClass(this.apiBaseURL, this.embeddableKey);
      console.log("✅ WioOnboarding: API client initialized successfully");
    }

    // Initialize state (no isModalOpen needed for inline component)
    this.state = {
      currentStep: 0,
      totalSteps: 5, // Personal, Business, Bank, Representatives, Business Verification
      isSubmitted: false,
      isFailed: false,
      isSubmissionFailed: false,
      formData: {
        personalDetails: {
          firstName: "",
          lastName: "",
          password: "",
          confirmPassword: "",
        },
        businessDetails: {
          businessName: "",
          doingBusinessAs: "",
          ein: "",
          businessWebsite: "",
          businessPhoneNumber: "",
          businessEmail: "",
          BusinessAddress1: "",
          businessAddress2: "",
          businessCity: "",
          businessState: "",
          businessPostalCode: "",
        },
        representativeDetails: {
          representativeFirstName: "",
          representativeLastName: "",
        },
        businessVerification: {
          verificationDocuments: [],
        },
        bankDetails: {
          bankAccountHolderName: "",
          bankAccountType: "checking",
          bankRoutingNumber: "",
          bankAccountNumber: "",
        },
      },
      validationState: {
        step0: { isValid: false, errors: {} }, // Personal Details
        step1: { isValid: false, errors: {} }, // Business Details
        step2: { isValid: false, errors: {} }, // Bank Details
        step3: { isValid: false, errors: {} }, // Representatives
        step4: { isValid: false, errors: {} }, // Business Verification (required)
      },
      completedSteps: new Set(),
      uiState: {
        isLoading: false,
        showErrors: false,
        errorMessage: null,
      },
    };

    // Step configuration
    this.STEPS = [
      {
        id: "personal-details",
        title: "Personal",
        description: "Your personal information",
        canSkip: false,
      },
      {
        id: "business-details",
        title: "Business",
        description: "Provide your business details",
        canSkip: false,
      },
      {
        id: "bank-details",
        title: "Bank Account",
        description: "Link your bank account",
        canSkip: false,
      },
      {
        id: "representative-details",
        title: "Representative",
        description: "Add representative information (optional)",
        canSkip: true,
      },
      {
        id: "business-verification",
        title: "Business Verification",
        description: "Upload required documents for verification",
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

  // ==================== GETTERS/SETTERS ====================

  get onSuccess() {
    return this._onSuccessCallback;
  }

  set onSuccess(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onSuccessCallback = callback;
    }
  }

  get onError() {
    return this._onErrorCallback;
  }

  set onError(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onErrorCallback = callback;
    }
  }

  get onSubmit() {
    return this._onSubmitCallback;
  }

  set onSubmit(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onSubmitCallback = callback;
    }
  }

  get onConfirm() {
    return this._onConfirmCallback;
  }

  set onConfirm(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onConfirmCallback = callback;
    }
  }

  get onLoad() {
    return this._initialData;
  }

  set onLoad(data) {
    if (data && typeof data === "object") {
      this._initialData = data;
      this.loadInitialData(data);
    }
  }

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
      if (!value) return { isValid: true, error: "" };

      const trimmed = value.trim();
      if (!trimmed) return { isValid: true, error: "" };

      const domainPattern = /^(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        try {
          new URL(trimmed);
          return { isValid: true, error: "", normalizedValue: trimmed };
        } catch {
          return { isValid: false, error: "Please enter a valid URL" };
        }
      }

      if (domainPattern.test(trimmed)) {
        const normalized = `https://${trimmed}`;
        try {
          new URL(normalized);
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

    password: (value) => {
      const checks = {
        minLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      };

      const allValid = Object.values(checks).every((check) => check);

      return {
        isValid: allValid,
        error: allValid ? "" : "Password does not meet requirements",
        checks,
      };
    },
  };

  // Password strength calculation
  calculatePasswordStrength(password) {
    if (!password) {
      return {
        strength: 0,
        label: "",
        color: "",
        checks: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecial: false,
        },
      };
    }

    const checks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const validChecks = Object.values(checks).filter(Boolean).length;
    const strength = (validChecks / 5) * 100;

    let label = "";
    let color = "";

    if (strength === 0) {
      label = "";
      color = "";
    } else if (strength <= 40) {
      label = "Weak";
      color = "#dc3545";
    } else if (strength <= 60) {
      label = "Fair";
      color = "#ffc107";
    } else if (strength <= 80) {
      label = "Good";
      color = "#17a2b8";
    } else {
      label = "Strong";
      color = "#28a745";
    }

    return { strength, label, color, checks };
  }

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

    if (stepId === "personal-details") {
      const data = this.state.formData.personalDetails;
      const fields = [
        {
          name: "firstName",
          validators: ["required"],
          label: "First Name",
        },
        {
          name: "lastName",
          validators: ["required"],
          label: "Last Name",
        },
        {
          name: "password",
          validators: ["required", "password"],
          label: "Password",
        },
        {
          name: "confirmPassword",
          validators: ["required"],
          label: "Confirm Password",
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

      // Check if passwords match
      if (
        data.password &&
        data.confirmPassword &&
        data.password !== data.confirmPassword
      ) {
        errors.confirmPassword = "Passwords do not match";
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
          name: "doingBusinessAs",
          validators: ["required"],
          label: "Doing Business As (DBA)",
        },
        { name: "ein", validators: ["required", "ein"], label: "EIN" },
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
    } else if (stepId === "business-verification") {
      const data = this.state.formData.businessVerification;
      if (
        !data.verificationDocuments ||
        data.verificationDocuments.length === 0
      ) {
        errors.verificationDocuments = "At least one document is required";
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
          validators: ["required", "routingNumber"],
          label: "Routing Number",
        },
        {
          name: "bankAccountNumber",
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
    } else if (stepId === "representative-details") {
      const data = this.state.formData.representativeDetails;
      const hasFirstName = data.representativeFirstName && data.representativeFirstName.trim();
      const hasLastName = data.representativeLastName && data.representativeLastName.trim();

      // If either field has a value, both become required
      if (hasFirstName || hasLastName) {
        if (!hasFirstName) {
          errors.representativeFirstName = "Representative First Name is required";
          isValid = false;
        }
        if (!hasLastName) {
          errors.representativeLastName = "Representative Last Name is required";
          isValid = false;
        }
      }
      // If both are empty, step is valid (optional step)
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
    const isValid = this.validateCurrentStep();

    if (!isValid) {
      console.warn("❌ Validation failed - cannot proceed to next step");
      return;
    }

    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(this.state.currentStep);

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

  // ==================== INITIAL DATA LOADING ====================

  loadInitialData(data) {
    const newFormData = { ...this.state.formData };

    if (data.personalDetails) {
      newFormData.personalDetails = {
        ...newFormData.personalDetails,
        ...data.personalDetails,
      };
    }

    if (data.businessDetails) {
      newFormData.businessDetails = {
        ...newFormData.businessDetails,
        ...data.businessDetails,
      };
    }

    if (data.businessVerification) {
      newFormData.businessVerification = {
        ...newFormData.businessVerification,
        ...data.businessVerification,
      };
    }

    if (data.bankDetails) {
      newFormData.bankDetails = {
        ...newFormData.bankDetails,
        ...data.bankDetails,
      };
    }

    if (data.representativeDetails) {
      newFormData.representativeDetails = {
        ...newFormData.representativeDetails,
        ...data.representativeDetails,
      };
    }

    const newState = {
      formData: newFormData,
    };

    if (
      typeof data.initialStep === "number" &&
      data.initialStep >= 0 &&
      data.initialStep < this.state.totalSteps
    ) {
      newState.currentStep = data.initialStep;
    }

    this.setState(newState);
  }

  resetForm() {
    const defaultFormData = {
      personalDetails: {
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
      },
      businessDetails: {
        businessName: "",
        doingBusinessAs: "",
        ein: "",
        businessWebsite: "",
        businessPhoneNumber: "",
        businessEmail: "",
        BusinessAddress1: "",
        businessAddress2: "",
        businessCity: "",
        businessState: "",
        businessPostalCode: "",
      },
      representativeDetails: {
        representativeFirstName: "",
        representativeLastName: "",
      },
      businessVerification: {
        verificationDocuments: [],
      },
      bankDetails: {
        bankAccountHolderName: "",
        bankAccountType: "checking",
        bankRoutingNumber: "",
        bankAccountNumber: "",
      },
    };

    const defaultValidationState = {
      step0: { isValid: false, errors: {} },
      step1: { isValid: false, errors: {} },
      step2: { isValid: false, errors: {} },
      step3: { isValid: false, errors: {} },
      step4: { isValid: false, errors: {} },
    };

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

    if (this._initialData) {
      this.loadInitialData(this._initialData);
    }
  }

  // ==================== UTILITIES ====================

  formatPhoneNumber(value) {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 10);

    if (limited.length === 0) {
      return "";
    } else if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  }

  formatEIN(value) {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 9);

    if (limited.length <= 2) {
      return limited;
    } else {
      return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    }
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

  async handleFormCompletion(shouldFail = false) {
    console.log("WioOnboarding: handleFormCompletion STARTED");

    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(this.state.currentStep);

    const formData = {
      personalDetails: this.state.formData.personalDetails,
      businessDetails: this.state.formData.businessDetails,
      representativeDetails: this.state.formData.representativeDetails,
      businessVerification: this.state.formData.businessVerification,
      bankDetails: this.state.formData.bankDetails,
    };

    let processedData = formData;
    if (this.onSubmit && typeof this.onSubmit === "function") {
      try {
        const result = await this.onSubmit(formData);

        if (result === false) {
          console.log("Form submission cancelled by onSubmit callback");
          return;
        }

        if (result && typeof result === "object") {
          processedData = result;
        }
      } catch (error) {
        console.error("Error in onSubmit callback:", error);
        this.handleSubmissionFailure(formData);
        return;
      }
    }

    this.setState({
      completedSteps,
      uiState: { isLoading: true },
    });

    // Ensure API is available (with fallback initialization)
    if (!this.api) {
      console.warn(
        "WioOnboarding: API was null, attempting to reinitialize..."
      );
      const BisonJibPayAPIClass =
        typeof BisonJibPayAPI !== "undefined"
          ? BisonJibPayAPI
          : typeof window !== "undefined" && window.BisonJibPayAPI;

      if (BisonJibPayAPIClass) {
        console.log("✅ Found BisonJibPayAPI, reinitializing...");
        this.api = new BisonJibPayAPIClass(this.apiBaseURL, this.embeddableKey);
      } else {
        console.error("❌ WioOnboarding: BisonJibPayAPI class not found");
        console.error(
          "Available globals:",
          typeof window !== "undefined"
            ? Object.keys(window).filter((k) =>
                k.toLowerCase().includes("bison")
              )
            : "N/A"
        );
        this.handleSubmissionFailure(processedData);
        return;
      }
    }

    if (!this.api) {
      console.error("❌ WioOnboarding: API initialization failed completely");
      this.handleSubmissionFailure(processedData);
      return;
    }

    try {
      const businessDetails = processedData.businessDetails;
      const bankDetails = processedData.bankDetails;
      const representativeDetails = processedData.representativeDetails;
      const businessVerification = processedData.businessVerification;

      // Debug: Log the extracted data objects
      console.log("=== DATA EXTRACTION DEBUG ===");
      console.log("businessDetails:", JSON.stringify(businessDetails, null, 2));
      console.log("bankDetails:", JSON.stringify(bankDetails, null, 2));
      console.log("representativeDetails:", JSON.stringify(representativeDetails, null, 2));
      console.log("businessVerification files count:", businessVerification?.verificationDocuments?.length || 0);
      console.log("=== END DATA EXTRACTION DEBUG ===");

      // Build FormData for API submission
      const payload = new FormData();

      // Add business details
      payload.append("businessName", businessDetails.businessName || "");
      payload.append("doingBusinessAs", businessDetails.doingBusinessAs || "");
      payload.append("ein", businessDetails.ein || "");
      payload.append("businessWebsite", businessDetails.businessWebsite || "");
      payload.append("businessPhoneNumber", businessDetails.businessPhoneNumber || "");
      payload.append("businessEmail", businessDetails.businessEmail || "");
      payload.append("businessAddress1", businessDetails.BusinessAddress1 || "");
      payload.append("businessAddress2", businessDetails.businessAddress2 || "");
      payload.append("businessCity", businessDetails.businessCity || "");
      payload.append("businessState", businessDetails.businessState || "");
      payload.append("businessPostalCode", businessDetails.businessPostalCode || "");

      // Add representative details
      payload.append("representativeFirstName", representativeDetails.representativeFirstName || "");
      payload.append("representativeLastName", representativeDetails.representativeLastName || "");

      // Add bank details
      payload.append("bankAccountHolderName", bankDetails.bankAccountHolderName || "");
      payload.append("bankRoutingNumber", bankDetails.bankRoutingNumber || "");
      payload.append("bankAccountNumber", bankDetails.bankAccountNumber || "");
      payload.append("bankAccountType", bankDetails.bankAccountType || "checking");

      // Add business verification documents (files)
      const verificationDocs = businessVerification.verificationDocuments || [];
      verificationDocs.forEach((file) => {
        if (file instanceof File) {
          payload.append("businessVerificationDocuments", file);
        }
      });

      // Enhanced debugging - Log payload
      console.log("=== WIO REGISTRATION DEBUG START ===");
      console.log("FormData entries:");
      for (const [key, value] of payload.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }

      console.log("\nCalling API: registerWIO");
      const response = await this.api.registerWIO(payload);

      console.log("\n=== API RESPONSE DEBUG ===");
      console.log("Full response object:", JSON.stringify(response, null, 2));
      console.log("Response type:", typeof response);
      console.log("Response.success:", response?.success);
      console.log("Response.data:", response?.data);
      console.log("Response.message:", response?.message);
      console.log("Response.errors:", response?.errors);
      console.log("=== WIO REGISTRATION DEBUG END ===\n");

      // Check if response indicates success
      const isSuccess =
        response && (response.success === true || response.success === "true");

      if (shouldFail || !isSuccess) {
        console.error("❌ WioOnboarding: Submission failed");
        console.error(
          "Reason: shouldFail =",
          shouldFail,
          "| isSuccess =",
          isSuccess
        );
        console.error("Full response:", response);
        this.handleSubmissionFailure(processedData);
        return;
      }

      console.log("✅ WioOnboarding: Submission successful!");

      this.setState({
        isSubmitted: true,
        uiState: { isLoading: false },
      });

      this.dispatchEvent(
        new CustomEvent("formComplete", {
          detail: { ...processedData, apiResponse: response },
          bubbles: true,
          composed: true,
        })
      );

      if (this.onSuccess && typeof this.onSuccess === "function") {
        this.onSuccess({ ...processedData, apiResponse: response });
      }
    } catch (error) {
      console.error("WioOnboarding: registerWIO API error", error);
      this.handleSubmissionFailure(processedData);
    }
  }

  handleSubmissionFailure(formData) {
    const errorData = {
      formData,
      message: "Form submission failed. Please try again.",
      timestamp: new Date().toISOString(),
    };

    console.error("Submission Failed:", errorData);

    this.setState({
      isSubmissionFailed: true,
      uiState: {
        ...this.state.uiState,
        isLoading: false,
        errorMessage: errorData.message,
        showErrors: false,
      },
    });

    this.dispatchEvent(
      new CustomEvent("submissionFailed", {
        detail: errorData,
        bubbles: true,
        composed: true,
      })
    );

    if (this.onError && typeof this.onError === "function") {
      this.onError(errorData);
    }
  }

  handleSuccessConfirm() {
    const confirmData = {
      formData: this.state.formData,
      timestamp: new Date().toISOString(),
    };

    this.dispatchEvent(
      new CustomEvent("onboardingConfirmed", {
        detail: confirmData,
        bubbles: true,
        composed: true,
      })
    );

    if (this.onConfirm && typeof this.onConfirm === "function") {
      this.onConfirm(confirmData);
    }

    // Reset form after confirmation
    this.resetForm();
  }

  // ==================== FILE HANDLING ====================

  handleFileUpload(files) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FILES = 10;
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const currentFiles =
      this.state.formData.businessVerification.verificationDocuments || [];
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (currentFiles.length + validFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 10MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      this.setState({
        formData: {
          businessVerification: {
            verificationDocuments: [...currentFiles, ...validFiles],
          },
        },
      });
    }
  }

  removeFile(index) {
    const files = [
      ...this.state.formData.businessVerification.verificationDocuments,
    ];
    files.splice(index, 1);

    this.setState({
      formData: {
        businessVerification: {
          verificationDocuments: files,
        },
      },
    });
  }

  // ==================== FIELD HANDLERS ====================

  handleFieldInput(e) {
    const input = e.target;
    const name = input.name;
    let value = input.value;

    if (input.dataset.format === "ein") {
      const cursorPosition = input.selectionStart;
      const oldValue = value;
      value = this.formatEIN(value);
      input.value = value;

      if (oldValue.length < value.length) {
        input.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      } else {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }

    if (input.dataset.format === "phone") {
      const cursorPosition = input.selectionStart;
      const oldValue = value;
      const oldDigits = oldValue.replace(/\D/g, "");

      value = this.formatPhoneNumber(value);
      input.value = value;

      const newDigits = value.replace(/\D/g, "");

      // Calculate new cursor position based on digit count before cursor
      const digitsBeforeCursor = oldValue
        .substring(0, cursorPosition)
        .replace(/\D/g, "").length;

      let newCursorPos = 0;
      let digitCount = 0;

      for (
        let i = 0;
        i < value.length && digitCount < digitsBeforeCursor;
        i++
      ) {
        if (/\d/.test(value[i])) {
          digitCount++;
        }
        newCursorPos = i + 1;
      }

      // If we added digits, move cursor to end of new content
      if (newDigits.length > oldDigits.length) {
        newCursorPos = value.length;
      }

      input.setSelectionRange(newCursorPos, newCursorPos);
    }

    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "personal-details") {
      this.state.formData.personalDetails[name] = input.value;

      // Trigger re-render for password field to update strength indicator
      if (name === "password") {
        this.updatePasswordStrengthIndicator(input.value);
      }
    } else if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = input.value;
    } else if (stepId === "bank-details") {
      this.state.formData.bankDetails[name] = input.value;
    } else if (stepId === "representative-details") {
      this.state.formData.representativeDetails[name] = input.value;
    }
  }

  updatePasswordStrengthIndicator(password) {
    const shadow = this.shadowRoot;
    const passwordField = shadow.querySelector("#password");

    if (!passwordField) return;

    // Find the password field container
    const passwordContainer = passwordField.closest(".form-field");
    if (!passwordContainer) return;

    // Find existing strength indicator or requirements
    const existingStrength =
      passwordContainer.querySelector(".password-strength");
    const existingRequirements = passwordContainer.querySelector(
      ".password-requirements"
    );
    const errorMessage = passwordContainer.querySelector(".error-message");

    // If password is empty, show requirements
    if (!password) {
      if (existingStrength) {
        existingStrength.remove();
      }
      if (!existingRequirements) {
        const requirementsHTML = `<div class="password-requirements">
           <p style="font-size: 12px; color: var(--gray-medium); margin-top: 8px;">
             Password must contain:
           </p>
           <ul style="font-size: 12px; color: var(--gray-medium); margin: 4px 0 0 20px; padding: 0;">
             <li>At least 8 characters</li>
             <li>One uppercase letter (A-Z)</li>
             <li>One lowercase letter (a-z)</li>
             <li>One number (0-9)</li>
             <li>One special character (!@#$%^&*)</li>
           </ul>
         </div>`;

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = requirementsHTML;
        const newRequirements = tempDiv.firstElementChild;

        if (errorMessage) {
          passwordContainer.insertBefore(newRequirements, errorMessage);
        } else {
          passwordContainer.appendChild(newRequirements);
        }
      }
      return;
    }

    // Remove requirements if showing
    if (existingRequirements) {
      existingRequirements.remove();
    }

    // Calculate new strength values
    const { strength, label, color, checks } =
      this.calculatePasswordStrength(password);

    // If strength indicator already exists, just update its values smoothly
    if (existingStrength) {
      const fillBar = existingStrength.querySelector(".password-strength-fill");
      const strengthLabel = existingStrength.querySelector(
        ".password-strength-label span:first-child"
      );
      const strengthPercentage = existingStrength.querySelector(
        ".password-strength-label span:last-child"
      );
      const checkItems = existingStrength.querySelectorAll(
        ".password-check-item"
      );

      // Update fill bar with smooth transition
      if (fillBar) {
        fillBar.style.width = `${strength}%`;
        fillBar.style.backgroundColor = color;
      }

      // Update label and percentage
      if (strengthLabel) {
        strengthLabel.textContent = label;
        strengthLabel.style.color = color;
      }
      if (strengthPercentage) {
        strengthPercentage.textContent = `${strength.toFixed(0)}%`;
      }

      // Update check items
      const checkKeys = [
        "minLength",
        "hasUppercase",
        "hasLowercase",
        "hasNumber",
        "hasSpecial",
      ];
      checkItems.forEach((item, index) => {
        const checkKey = checkKeys[index];
        const isValid = checks[checkKey];
        const icon = item.querySelector(".password-check-icon");

        if (isValid) {
          item.classList.add("valid");
          if (icon) icon.textContent = "✓";
        } else {
          item.classList.remove("valid");
          if (icon) icon.textContent = "○";
        }
      });
    } else {
      // Create new indicator HTML if it doesn't exist
      const strengthHTML = this.renderPasswordStrength(password);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = strengthHTML;
      const newIndicator = tempDiv.firstElementChild;

      // Insert before error message if it exists, otherwise append to container
      if (errorMessage) {
        passwordContainer.insertBefore(newIndicator, errorMessage);
      } else {
        passwordContainer.appendChild(newIndicator);
      }
    }
  }

  handleFieldBlur(e) {
    const input = e.target;
    const name = input.name;
    const value = input.value;

    if (input.dataset.format === "phone") {
      input.value = this.formatPhoneNumber(value);
    }

    if (input.dataset.format === "ein") {
      input.value = this.formatEIN(value);
    }

    if (input.type === "url" && value) {
      const validationResult = this.validators.url(value);
      if (validationResult.isValid && validationResult.normalizedValue) {
        input.value = validationResult.normalizedValue;
      }
    }

    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "personal-details") {
      this.state.formData.personalDetails[name] = input.value;
    } else if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = input.value;
    } else if (stepId === "bank-details") {
      this.state.formData.bankDetails[name] = input.value;
    } else if (stepId === "representative-details") {
      this.state.formData.representativeDetails[name] = input.value;
    }
  }

  attachSubmissionFailureListeners() {
    const shadow = this.shadowRoot;

    const resubmitBtn = shadow.querySelector(".btn-resubmit");
    if (resubmitBtn) {
      resubmitBtn.addEventListener("click", () => {
        this.setState({
          isSubmissionFailed: false,
          uiState: {
            isLoading: false,
            showErrors: false,
            errorMessage: null,
          },
        });
      });
    }
  }

  // ==================== RENDERING ====================

  render() {
    let content;

    if (this.state.isSubmissionFailed) {
      content = this.renderSubmissionFailurePage();
    } else if (this.state.isSubmitted) {
      content = this.renderSuccessPage();
    } else if (this.state.uiState.isLoading) {
      content = `
        <div class="loading-content">
          <h2>Submitting Your Application...</h2>
          <p style="color: var(--gray-medium); margin-bottom: var(--spacing-lg);">
            Please wait while we process your information.
          </p>
          <div class="loading-spinner"></div>
        </div>
      `;
    } else {
      content = `
        <div class="form-container">
          <div class="form-header">
            <div class="form-logo">
              <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
            </div>
            ${this.renderStepperHeader()}
          </div>
          <div class="form-body">
            ${this.renderFormContent()}
          </div>
          <div class="form-footer">
            ${this.renderNavigationFooter()}
          </div>
        </div>
      `;
    }

    this.shadowRoot.innerHTML = `
      ${this.renderStyles()}
      ${content}
    `;

    this.attachEventListeners();
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

  renderFormContent() {
    const stepId = this.STEPS[this.state.currentStep].id;

    switch (stepId) {
      case "personal-details":
        return this.renderPersonalDetailsForm();
      case "business-details":
        return this.renderBusinessDetailsForm();
      case "bank-details":
        return this.renderBankDetailsForm();
      case "representative-details":
        return this.renderRepresentativeDetailsForm();
      case "business-verification":
        return this.renderBusinessVerificationForm();
      default:
        return "";
    }
  }

  renderPasswordStrength(password) {
    const { strength, label, color, checks } =
      this.calculatePasswordStrength(password);

    return `
      <div class="password-strength">
        <div class="password-strength-bar">
          <div class="password-strength-fill" style="width: ${strength}%; background-color: ${color};"></div>
        </div>
        <div class="password-strength-label">
          <span style="color: ${color};">${label}</span>
          <span>${strength.toFixed(0)}%</span>
        </div>
        <div class="password-check">
          <div class="password-check-item ${checks.minLength ? "valid" : ""}">
            <span class="password-check-icon">${checks.minLength ? "✓" : "○"}</span>
            <span>8+ characters</span>
          </div>
          <div class="password-check-item ${checks.hasUppercase ? "valid" : ""}">
            <span class="password-check-icon">${checks.hasUppercase ? "✓" : "○"}</span>
            <span>Uppercase (A-Z)</span>
          </div>
          <div class="password-check-item ${checks.hasLowercase ? "valid" : ""}">
            <span class="password-check-icon">${checks.hasLowercase ? "✓" : "○"}</span>
            <span>Lowercase (a-z)</span>
          </div>
          <div class="password-check-item ${checks.hasNumber ? "valid" : ""}">
            <span class="password-check-icon">${checks.hasNumber ? "✓" : "○"}</span>
            <span>Number (0-9)</span>
          </div>
          <div class="password-check-item ${checks.hasSpecial ? "valid" : ""}">
            <span class="password-check-icon">${checks.hasSpecial ? "✓" : "○"}</span>
            <span>Special (!@#$%...)</span>
          </div>
        </div>
      </div>
    `;
  }

  renderPersonalDetailsForm() {
    const data = this.state.formData.personalDetails;

    return `
      <div class="form-section">
        <h2>Personal Information</h2>
        <p>Provide your personal details</p>

        <div class="form-grid">
          ${this.renderField({
            name: "firstName",
            label: "First Name *",
            value: data.firstName,
            error: this.getFieldError("firstName"),
          })}

          ${this.renderField({
            name: "lastName",
            label: "Last Name *",
            value: data.lastName,
            error: this.getFieldError("lastName"),
          })}

          <div class="form-field full-width ${
            this.getFieldError("password") ? "has-error" : ""
          }">
            <label for="password">Password <span class="required-asterisk">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              value="${data.password}"
              autocomplete="new-password"
            />
            ${
              data.password
                ? this.renderPasswordStrength(data.password)
                : `<div class="password-requirements">
                    <p style="font-size: 12px; color: var(--gray-medium); margin-top: 8px;">
                      Password must contain:
                    </p>
                    <ul style="font-size: 12px; color: var(--gray-medium); margin: 4px 0 0 20px; padding: 0;">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>One number (0-9)</li>
                      <li>One special character (!@#$%^&*)</li>
                    </ul>
                  </div>`
            }
            ${
              this.getFieldError("password")
                ? `<span class="error-message">${this.getFieldError("password")}</span>`
                : ""
            }
          </div>

          ${this.renderField({
            name: "confirmPassword",
            label: "Confirm Password *",
            type: "password",
            value: data.confirmPassword,
            error: this.getFieldError("confirmPassword"),
            className: "full-width",
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
            name: "businessAddress2",
            label: "Street Address 2 (Optional)",
            value: data.businessAddress2,
            error: this.getFieldError("businessAddress2"),
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

  renderRepresentativeDetailsForm() {
    const data = this.state.formData.representativeDetails;

    return `
      <div class="form-section">
        <h2>Representative Information</h2>
        <p>Add representative details (optional - if started, both fields become required)</p>

        <div class="form-grid">
          ${this.renderField({
            name: "representativeFirstName",
            label: "Representative First Name",
            value: data.representativeFirstName,
            error: this.getFieldError("representativeFirstName"),
          })}

          ${this.renderField({
            name: "representativeLastName",
            label: "Representative Last Name",
            value: data.representativeLastName,
            error: this.getFieldError("representativeLastName"),
          })}
        </div>
      </div>
    `;
  }

  renderBusinessVerificationForm() {
    const data = this.state.formData.businessVerification;
    const verificationDocuments = data.verificationDocuments || [];
    const error = this.getFieldError("verificationDocuments");
    const showErrors = this.state.uiState.showErrors;

    return `
      <div class="form-section">
        <h2>Business Verification</h2>
        <p>Upload supporting documents for verification (required, max 10 files, 10MB each)</p>

        <div class="form-grid">
          <div class="form-field full-width ${
            showErrors && error ? "has-error" : ""
          }">
            <label for="verificationDocs">
              Upload Verification Documents <span class="required-asterisk">*</span>
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
                  id="verificationDocs"
                  name="verificationDocs"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style="display: none;"
                />
              </div>
            </div>

            <div id="fileList" style="margin-top: var(--spacing-md);">
              ${
                verificationDocuments.length > 0
                  ? this.renderFileList(verificationDocuments)
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

  renderNavigationFooter() {
    const isFirstStep = this.state.currentStep === 0;
    const isLastStep = this.state.currentStep === this.state.totalSteps - 1;
    const canSkip = this.STEPS[this.state.currentStep].canSkip;

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
    const { businessDetails, bankDetails } = this.state.formData;

    return `
      <div class="success-container">
        <div class="success-icon">
          <svg viewBox="0 0 52 52">
            <path d="M14 27l7 7 16-16"/>
          </svg>
        </div>

        <h2>Onboarding Complete! 🎉</h2>
        <p>Your WIO application has been successfully submitted.</p>

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
      </div>
    `;
  }

  // ==================== EVENT LISTENERS ====================

  attachEventListeners() {
    const shadow = this.shadowRoot;

    // Success confirmation button
    const confirmBtn = shadow.querySelector(".btn-confirm-success");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.handleSuccessConfirm());
    }

    // Submission failure resubmit button
    if (this.state.isSubmissionFailed) {
      this.attachSubmissionFailureListeners();
    }

    // Form inputs - blur validation
    shadow.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("blur", (e) => this.handleFieldBlur(e));
      input.addEventListener("input", (e) => this.handleFieldInput(e));
    });

    // Navigation buttons - use mousedown to prevent blur interference
    const nextBtn = shadow.querySelector(".btn-next");
    if (nextBtn) {
      nextBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.goToNextStep();
      });
    }

    const backBtn = shadow.querySelector(".btn-back");
    if (backBtn) {
      backBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.goToPreviousStep();
      });
    }

    const skipBtn = shadow.querySelector(".btn-skip");
    if (skipBtn) {
      skipBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
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

    // File upload handlers for business verification documents
    const fileInput = shadow.querySelector("#verificationDocs");
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
          display: block;
        }

        /* Form Container (Inline Display) */
        .form-container {
          background: white;
          border-radius: var(--border-radius-lg);
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .form-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
          background: white;
        }

        .form-body {
          padding: var(--spacing-lg);
          max-height: 600px;
          overflow-y: auto;
        }

        .form-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
          background: white;
        }

        /* Loading State */
        .loading-content {
          text-align: center;
          padding: calc(var(--spacing-lg) * 3);
          background: white;
          border-radius: var(--border-radius-lg);
          max-width: 500px;
          margin: 0 auto;
        }

        .loading-content h2 {
          margin-bottom: var(--spacing-md);
          color: #333;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--gray-light);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: var(--spacing-lg) auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Form Logo */
        .form-logo {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .form-logo img {
          height: 40px;
          width: auto;
        }

        /* Stepper Header */
        .stepper-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .step-indicator {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          position: relative;
        }

        .step-indicator::after {
          content: '';
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border-color);
          z-index: 0;
        }

        .step-indicator:last-child::after {
          display: none;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gray-light);
          color: var(--gray-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          border: 2px solid var(--border-color);
          z-index: 1;
          position: relative;
          transition: all 0.2s ease;
        }

        .step-indicator.active .step-circle {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .step-indicator.complete .step-circle {
          background: var(--success-color);
          color: white;
          border-color: var(--success-color);
        }

        .step-indicator.clickable {
          cursor: pointer;
        }

        .step-indicator.clickable:hover .step-circle {
          transform: scale(1.1);
        }

        .step-label {
          font-size: 12px;
          color: var(--gray-medium);
          text-align: center;
          font-weight: 500;
        }

        .step-indicator.active .step-label {
          color: var(--primary-color);
          font-weight: 600;
        }

        /* Form Sections */
        .form-section {
          margin-bottom: var(--spacing-lg);
        }

        .form-section h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: var(--spacing-sm);
        }

        .form-section > p {
          color: var(--gray-medium);
          margin-bottom: var(--spacing-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .required-asterisk {
          color: var(--error-color);
        }

        .form-field input,
        .form-field select {
          padding: 9px 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s ease;
          height: 39px;
          box-sizing: border-box;
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .form-field.has-error input,
        .form-field.has-error select {
          border-color: var(--error-color);
        }

        .error-message {
          font-size: 12px;
          color: var(--error-color);
        }

        /* Password Strength Indicator */
        .password-strength {
          margin-top: 8px;
        }

        .password-strength-bar {
          height: 6px;
          background: var(--gray-light);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .password-strength-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
          border-radius: 3px;
        }

        .password-strength-label {
          font-size: 12px;
          font-weight: 500;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .password-requirements {
          margin-top: 8px;
        }

        .password-requirements ul {
          list-style: disc;
        }

        .password-requirements li {
          line-height: 1.6;
        }

        .password-check {
          font-size: 12px;
          color: var(--gray-medium);
          margin-top: 6px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
        }

        .password-check-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .password-check-item.valid {
          color: #28a745;
        }

        .password-check-icon {
          font-size: 14px;
        }

        /* Radio Group */
        .radio-group {
          display: flex;
          gap: var(--spacing-lg);
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .radio-option input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .radio-option label {
          cursor: pointer;
          margin: 0;
        }

        /* Representatives */
        .representatives-list {
          margin-bottom: var(--spacing-md);
        }

        .empty-state {
          padding: var(--spacing-lg);
          text-align: center;
          background: var(--gray-light);
          border-radius: var(--border-radius);
          color: var(--gray-medium);
        }

        .representative-card {
          background: var(--gray-light);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .card-header h3 {
          font-size: 16px;
          color: #333;
        }

        .remove-btn {
          background: var(--error-color);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: opacity 0.2s ease;
        }

        .remove-btn:hover {
          opacity: 0.9;
        }

        .add-representative-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          transition: opacity 0.2s ease;
        }

        .add-representative-btn:hover {
          opacity: 0.9;
        }

        /* File Upload */
        .drag-drop-area {
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .drag-drop-area:hover,
        .drag-drop-area.drag-over {
          border-color: var(--primary-color);
          background: rgba(50, 82, 64, 0.05);
        }

        .drag-drop-content {
          pointer-events: none;
        }

        .uploaded-files {
          margin-top: var(--spacing-md);
        }

        /* Navigation Footer */
        .navigation-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
        }

        .btn-back,
        .btn-skip {
          padding: 12px 24px;
          background: white;
          color: var(--gray-medium);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-back:hover,
        .btn-skip:hover {
          background: var(--gray-light);
        }

        .btn-next {
          padding: 12px 24px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s ease;
        }

        .btn-next:hover {
          opacity: 0.9;
        }

        /* Success Page */
        .success-container {
          text-align: center;
          padding: calc(var(--spacing-lg) * 2);
          background: white;
          border-radius: var(--border-radius-lg);
          max-width: 600px;
          margin: 0 auto;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #d4edda;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-lg);
        }

        .success-icon svg {
          width: 40px;
          height: 40px;
          stroke: var(--success-color);
          stroke-width: 3;
          fill: none;
        }

        .success-container h2 {
          font-size: 28px;
          color: #333;
          margin-bottom: var(--spacing-sm);
        }

        .success-container > p {
          color: var(--gray-medium);
          margin-bottom: var(--spacing-lg);
        }

        .success-details {
          background: var(--gray-light);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
          text-align: left;
        }

        .success-details h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: var(--spacing-md);
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
          font-weight: 500;
          color: var(--gray-medium);
        }

        .detail-value {
          color: #333;
        }

        .btn-confirm-success {
          padding: 12px 32px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          margin-top: var(--spacing-lg);
          transition: opacity 0.2s ease;
        }

        .btn-confirm-success:hover {
          opacity: 0.9;
        }

        /* Error Page */
        .error-container {
          text-align: center;
          padding: calc(var(--spacing-lg) * 2);
          background: white;
          border-radius: var(--border-radius-lg);
          max-width: 600px;
          margin: 0 auto;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f8d7da;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-lg);
        }

        .error-icon svg {
          width: 40px;
          height: 40px;
          stroke: var(--error-color);
          stroke-width: 3;
          fill: none;
        }

        .error-container h2 {
          font-size: 28px;
          color: #333;
          margin-bottom: var(--spacing-sm);
        }

        .error-container > p {
          color: var(--gray-medium);
          margin-bottom: var(--spacing-lg);
        }

        .error-details {
          background: #f8d7da;
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
          text-align: left;
        }

        .error-details h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: var(--spacing-md);
        }

        .error-details p {
          color: #721c24;
          line-height: 1.5;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .stepper-header {
            gap: var(--spacing-sm);
          }

          .step-label {
            font-size: 10px;
          }

          .step-circle {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }

          .form-body {
            max-height: 500px;
          }
        }
      </style>
    `;
  }
}

// Register the custom element
customElements.define("wio-onboarding", WioOnboarding);

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { WioOnboarding };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.WioOnboarding = WioOnboarding;
}
