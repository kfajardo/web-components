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
      totalSteps: 3, // Business, Representatives, Business Verification
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
          businessAddress2: "",
          businessCity: "",
          businessState: "",
          businessPostalCode: "",
        },
        representatives: [],
        businessVerification: {
          verificationDocuments: [],
        },

      },
      validationState: {
        step0: { isValid: false, errors: {} }, // Business Details
        step1: { isValid: false, errors: {} }, // Representatives
        step2: { isValid: false, errors: {} }, // Business Verification (required)
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
        id: "business-details",
        title: "Business",
        description: "Provide your business details",
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
    this._onDoneCallback = null;
    this._initialData = null;
    this._doneButtonText = "Done";

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

  get onDone() {
    return this._onDoneCallback;
  }

  set onDone(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onDoneCallback = callback;
    }
  }

  get doneButtonText() {
    return this._doneButtonText;
  }

  set doneButtonText(value) {
    this._doneButtonText = value;
    this.render();
  }

  static get observedAttributes() {
    return [
      "on-success",
      "on-error",
      "on-submit",
      "on-load",
      "on-done",
      "done-button-text",
      "api-base-url",
      "embeddable-key",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "done-button-text":
        this.doneButtonText = newValue;
        break;

      case "api-base-url": {
        const fallbackURL = "https://bison-jib-development.azurewebsites.net";
        this.apiBaseURL = newValue || fallbackURL;
        const BisonJibPayAPIClass =
          typeof BisonJibPayAPI !== "undefined"
            ? BisonJibPayAPI
            : typeof window !== "undefined" && window.BisonJibPayAPI;
        if (BisonJibPayAPIClass) {
          this.api = new BisonJibPayAPIClass(
            this.apiBaseURL,
            this.embeddableKey
          );
        }
        break;
      }

      case "embeddable-key": {
        const fallbackKey =
          "R80WMkbNN8457RofiMYx03DL65P06IaVT30Q2emYJUBQwYCzRC";
        this.embeddableKey = newValue || fallbackKey;
        const BisonJibPayAPIClass =
          typeof BisonJibPayAPI !== "undefined"
            ? BisonJibPayAPI
            : typeof window !== "undefined" && window.BisonJibPayAPI;
        if (BisonJibPayAPIClass) {
          this.api = new BisonJibPayAPIClass(
            this.apiBaseURL,
            this.embeddableKey
          );
        }
        break;
      }
    }
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
        { name: "ein", validators: ["required", "ein"], label: "EIN" },
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
    } else if (stepId === "business-verification") {
      const data = this.state.formData.businessVerification;
      if (
        !data.verificationDocuments ||
        data.verificationDocuments.length === 0
      ) {
        errors.verificationDocuments = "At least one document is required";
        isValid = false;
      }
    } else if (stepId === "representative-details") {
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
      isStaged: false,
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
      // Reset staged status when any field changes
      isStaged: false,
    };

    this.setState({
      formData: { representatives },
    });
  }

  /**
   * Validate a single representative's fields
   * @param {number} index - The index of the representative to validate
   * @returns {{isValid: boolean, errors: Object}} Validation result
   */
  validateSingleRepresentative(index) {
    const rep = this.state.formData.representatives[index];
    if (!rep) return { isValid: false, errors: {} };

    const errors = {};
    let isValid = true;

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
        errors[field.name] = error;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  /**
   * Stage a representative after validation and email check
   * @param {number} index - The index of the representative to stage
   */
  async stageRepresentative(index) {
    const rep = this.state.formData.representatives[index];
    if (!rep) return;

    // Step 1: Validate all fields for this representative
    const { isValid, errors } = this.validateSingleRepresentative(index);

    if (!isValid) {
      // Show validation errors for this representative
      const currentErrors = this.state.validationState[`step${this.state.currentStep}`]?.errors || {};
      this.setState({
        validationState: {
          [`step${this.state.currentStep}`]: {
            isValid: false,
            errors: {
              ...currentErrors,
              [`rep${index}`]: errors,
            },
          },
        },
        uiState: { showErrors: true },
      });
      return;
    }

    // Step 2: Call validateUserEmail API
    if (!this.api) {
      console.error("API not initialized");
      return;
    }

    try {
      const response = await this.api.validateUserEmail(rep.representativeEmail);

      // Step 3: Check if email exists
      if (response.data?.exists === true) {
        // Add error to the representative email field
        const currentErrors = this.state.validationState[`step${this.state.currentStep}`]?.errors || {};
        this.setState({
          validationState: {
            [`step${this.state.currentStep}`]: {
              isValid: false,
              errors: {
                ...currentErrors,
                [`rep${index}`]: {
                  representativeEmail: "A representative with this email already exists",
                },
              },
            },
          },
          uiState: { showErrors: true },
        });
        return;
      }

      // Email doesn't exist - mark representative as staged
      const representatives = [...this.state.formData.representatives];
      representatives[index] = {
        ...representatives[index],
        isStaged: true,
      };

      // Clear any previous errors for this representative
      const currentErrors = this.state.validationState[`step${this.state.currentStep}`]?.errors || {};
      const updatedErrors = { ...currentErrors };
      delete updatedErrors[`rep${index}`];

      this.setState({
        formData: { representatives },
        validationState: {
          [`step${this.state.currentStep}`]: {
            isValid: Object.keys(updatedErrors).length === 0,
            errors: updatedErrors,
          },
        },
        uiState: { showErrors: Object.keys(updatedErrors).length > 0 },
      });

      console.log(`✅ Representative ${index + 1} staged successfully`);
    } catch (error) {
      console.error("Error validating user email:", error);
      // Show API error
      const currentErrors = this.state.validationState[`step${this.state.currentStep}`]?.errors || {};
      this.setState({
        validationState: {
          [`step${this.state.currentStep}`]: {
            isValid: false,
            errors: {
              ...currentErrors,
              [`rep${index}`]: {
                representativeEmail: error.data?.message || "Failed to validate email. Please try again.",
              },
            },
          },
        },
        uiState: { showErrors: true },
      });
    }
  }

  /**
   * Check if there's an active (non-staged) representative form
   * An "active" form means the user has added a representative but hasn't confirmed/staged it yet
   * @returns {boolean} True if there's at least one non-staged representative
   */
  hasActiveRepresentativeForm() {
    return this.state.formData.representatives.some((rep) => rep.isStaged !== true);
  }

  /**
   * Discard an active (non-staged) representative form
   * @param {number} index - The index of the representative to discard
   */
  discardRepresentative(index) {
    const rep = this.state.formData.representatives[index];
    if (!rep || rep.isStaged) return; // Can only discard non-staged representatives

    const representatives = this.state.formData.representatives.filter(
      (_, i) => i !== index
    );

    // Clear any previous errors for this representative
    const currentErrors = this.state.validationState[`step${this.state.currentStep}`]?.errors || {};
    const updatedErrors = { ...currentErrors };
    delete updatedErrors[`rep${index}`];

    this.setState({
      formData: { representatives },
      validationState: {
        [`step${this.state.currentStep}`]: {
          isValid: Object.keys(updatedErrors).length === 0,
          errors: updatedErrors,
        },
      },
      uiState: { showErrors: Object.keys(updatedErrors).length > 0 },
    });

    console.log(`✅ Representative ${index + 1} discarded`);
  }

  // ==================== INITIAL DATA LOADING ====================

  loadInitialData(data) {
    const newFormData = { ...this.state.formData };

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
        isStaged: rep.isStaged || false,
      }));
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
      representatives: [],
      businessVerification: {
        verificationDocuments: [],
      },

    };

    const defaultValidationState = {
      step0: { isValid: false, errors: {} },
      step1: { isValid: false, errors: {} },
      step2: { isValid: false, errors: {} },
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
      businessDetails: this.state.formData.businessDetails,
      representatives: this.state.formData.representatives,
      businessVerification: this.state.formData.businessVerification,
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
      const representativeDetails = processedData.representativeDetails;
      const businessVerification = processedData.businessVerification;

      // Debug: Log the extracted data objects
      console.log("=== DATA EXTRACTION DEBUG ===");
      console.log("businessDetails:", JSON.stringify(businessDetails, null, 2));
      console.log(
        "representativeDetails:",
        JSON.stringify(representativeDetails, null, 2)
      );
      console.log(
        "businessVerification files count:",
        businessVerification?.verificationDocuments?.length || 0
      );
      console.log("=== END DATA EXTRACTION DEBUG ===");

      // Build FormData for API submission
      const payload = new FormData();

      // Add business details
      payload.append("businessName", businessDetails.businessName || "");
      payload.append("doingBusinessAs", businessDetails.doingBusinessAs || "");
      payload.append("ein", businessDetails.ein || "");
      payload.append("businessWebsite", businessDetails.businessWebsite || "");
      payload.append(
        "businessPhoneNumber",
        businessDetails.businessPhoneNumber || ""
      );
      payload.append("businessEmail", businessDetails.businessEmail || "");
      payload.append(
        "businessAddress1",
        businessDetails.BusinessAddress1 || ""
      );
      payload.append(
        "businessAddress2",
        businessDetails.businessAddress2 || ""
      );
      payload.append("businessCity", businessDetails.businessCity || "");
      payload.append("businessState", businessDetails.businessState || "");
      payload.append(
        "businessPostalCode",
        businessDetails.businessPostalCode || ""
      );

      // Add representatives as JSON string
      if (
        processedData.representatives &&
        processedData.representatives.length > 0
      ) {
        payload.append(
          "representatives",
          JSON.stringify(processedData.representatives)
        );
      }

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
        console.log(
          `  ${key}:`,
          value instanceof File ? `File(${value.name})` : value
        );
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

        // Determine status code from response
        let statusCode = 500; // Default to server error
        if (response?.errors?.length > 0) {
          // Check for authentication errors
          const hasAuthError = response.errors.some(
            (err) =>
              err.toLowerCase().includes("unauthorized") ||
              err.toLowerCase().includes("authentication")
          );
          if (hasAuthError) {
            statusCode = 401;
          } else {
            // Assume validation/bad request error
            statusCode = 400;
          }
        }

        this.handleSubmissionFailure(processedData, {
          statusCode,
          success: response?.success ?? false,
          message: response?.message || null,
          errors: response?.errors || [],
          timestamp: response?.timestamp || new Date().toISOString(),
          traceId: response?.traceId || null,
        });
        return;
      }

      console.log("✅ WioOnboarding: Submission successful!");

      // Extract data from 201 success response matching Swagger schema
      const responseData = response?.data || {};
      const successData = {
        // Form data
        formData: processedData,
        // API response metadata
        success: response.success,
        message: response.message || null,
        timestamp: response.timestamp,
        traceId: response.traceId || null,
        // WIO registration data from response.data
        userId: responseData.userId || null,
        wioId: responseData.wioId || null,
        tenantId: responseData.tenantId || null,
        moovAccountId: responseData.moovAccountId || null,
        moovBankAccountId: responseData.moovBankAccountId || null,
        uploadedDocumentsCount: responseData.uploadedDocumentsCount || 0,
        uploadErrors: responseData.uploadErrors || [],
        requiresOnboarding: responseData.requiresOnboarding ?? false,
        // Legacy fields for backward compatibility
        email: processedData.businessDetails.businessEmail,
        apiResponse: response,
      };

      console.log("Success data:", successData);

      this.setState({
        isSubmitted: true,
        submissionEmail: successData.email,
        submissionMoovAccountId: successData.moovAccountId,
        submissionData: successData,
        uiState: { isLoading: false },
      });

      this.dispatchEvent(
        new CustomEvent("formComplete", {
          detail: successData,
          bubbles: true,
          composed: true,
        })
      );

      if (this.onSuccess && typeof this.onSuccess === "function") {
        await this.onSuccess(successData);
      }
    } catch (error) {
      console.error("WioOnboarding: registerWIO API error", error);

      // Handle network or unexpected errors
      this.handleSubmissionFailure(processedData, {
        statusCode: 500,
        success: false,
        message: error.message || "An unexpected error occurred",
        errors: [error.message || "Network error or server unavailable"],
        timestamp: new Date().toISOString(),
        traceId: null,
      });
    }
  }

  async handleSubmissionFailure(formData, apiError = null) {
    // Build structured error data matching Swagger schema
    const errorData = {
      formData,
      // API error response fields
      statusCode: apiError?.statusCode || 500,
      success: apiError?.success ?? false,
      message: apiError?.message || null,
      errors: apiError?.errors || [],
      timestamp: apiError?.timestamp || new Date().toISOString(),
      traceId: apiError?.traceId || null,
    };

    // Build user-friendly error message
    let displayMessage = "Form submission failed. Please try again.";

    if (errorData.statusCode === 400) {
      displayMessage = "Validation failed. Please check your information and try again.";
    } else if (errorData.statusCode === 401) {
      displayMessage = "Authentication failed. Please check your credentials.";
    } else if (errorData.statusCode === 500) {
      displayMessage = "Server error. Please try again later.";
    }

    // Use API message if available, otherwise use status-based message
    if (errorData.message) {
      displayMessage = errorData.message;
    }

    // Append specific errors if available
    const errorDetails =
      errorData.errors.length > 0 ? errorData.errors.join("; ") : null;

    console.error("Submission Failed:", errorData);

    this.setState({
      isSubmissionFailed: true,
      submissionError: errorData,
      uiState: {
        ...this.state.uiState,
        isLoading: false,
        errorMessage: displayMessage,
        errorDetails: errorDetails,
        statusCode: errorData.statusCode,
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
      await this.onError(errorData);
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
    if (this.onDone && typeof this.onDone === "function") {
      this.onDone(confirmData);
    }
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

    if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = input.value;
    } else if (stepId === "representative-details") {
      const repIndex = input.dataset.repIndex;
      if (repIndex !== undefined) {
        const idx = parseInt(repIndex);
        if (this.state.formData.representatives[idx]) {
          this.state.formData.representatives[idx][name] = input.value;
        }
      }
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

    if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = input.value;
    } else if (stepId === "representative-details") {
      const repIndex = input.dataset.repIndex;
      if (repIndex !== undefined) {
        const idx = parseInt(repIndex);
        if (this.state.formData.representatives[idx]) {
          this.state.formData.representatives[idx][name] = input.value;
        }
      }
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
      `;
    }

    this.shadowRoot.innerHTML = `
      ${this.renderStyles()}
      <div class="form-container">
        ${content}
      </div>
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
      <div class="step-indicator ${isCurrent ? "active" : ""} ${isComplete ? "complete" : ""
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
      case "business-details":
        return this.renderBusinessDetailsForm();
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

          <div class="form-field full-width ${this.getFieldError("password") ? "has-error" : ""
      }">
            <label for="password">Password <span class="required-asterisk">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              value="${data.password}"
              autocomplete="new-password"
            />
            ${data.password
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
            ${this.getFieldError("password")
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

          ${this._initialData?.businessDetails?.businessEmail ? `
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
      name: "ein",
      label: "EIN *",
      value: data.ein,
      error: this.getFieldError("ein"),
      placeholder: "12-3456789",
      maxLength: 10,
      dataFormat: "ein",
    })}
          ` : `
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
          `}

          ${this.renderField({
      name: "businessWebsite",
      label: "Business Website",
      type: "url",
      value: data.businessWebsite,
      error: this.getFieldError("businessWebsite"),
      placeholder: "https://example.com",
      className: "full-width",
    })}

          ${!this._initialData?.businessDetails?.businessEmail ? `
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
          ` : ``}

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

          <div class="form-field ${this.getFieldError("businessState") ? "has-error" : ""
      }">
            <label for="businessState">State <span class="required-asterisk">*</span></label>
            <select id="businessState" name="businessState">
              <option value="">Select State</option>
              ${this.US_STATES.map(
        (state) => `
                <option value="${state}" ${data.businessState === state ? "selected" : ""
          }>${state}</option>
              `
      ).join("")}
            </select>
            ${this.getFieldError("businessState")
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



  renderRepresentativeDetailsForm() {
    const representatives = this.state.formData.representatives;

    return `
      <div class="form-section">
        <h2>Business Representatives</h2>
        <p>Add business representatives (optional)</p>
        
        <div class="representatives-list">
          ${representatives.length === 0
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
    const isStaged = representative.isStaged === true;

    return `
      <div class="representative-card ${isStaged ? 'staged' : ''}" data-index="${index}">
        <div class="card-header">
          <h3>Representative ${index + 1}${isStaged ? ' <span class="staged-badge">✓ Staged</span>' : ''}</h3>
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
            
            <div class="form-field ${this.getFieldError("representativeState", index)
        ? "has-error"
        : ""
      }">
              <label for="representativeState-${index}">State <span class="required-asterisk">*</span></label>
              <select id="representativeState-${index}" name="representativeState" data-rep-index="${index}">
                <option value="">Select State</option>
                ${this.US_STATES.map(
        (state) => `
                  <option value="${state}" ${representative.representativeState === state
            ? "selected"
            : ""
          }>${state}</option>
                `
      ).join("")}
              </select>
              ${this.getFieldError("representativeState", index)
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
        <div class="card-footer">
          ${isStaged
        ? `<div class="staged-status">
                <span class="staged-icon">✓</span>
                <span>Representative validated and staged</span>
              </div>`
        : `<div class="card-footer-actions">
                <button type="button" class="btn-discard-representative" data-index="${index}">
                  Discard
                </button>
                <button type="button" class="btn-stage-representative" data-index="${index}">
                  Confirm Representative
                </button>
              </div>`
      }
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
          <div class="form-field full-width ${showErrors && error ? "has-error" : ""
      }">
            <label for="verificationDocs">
              Upload Verification Documents <span class="required-asterisk">*</span>
              <span style="font-size: 12px; color: var(--gray-medium); font-weight: normal;">
                (PDF, JPG, PNG, DOC, DOCX - Max 10MB each)
              </span>
            </label>

            <div class="drag-drop-area" id="dragDropArea">
              <div class="drag-drop-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p style="margin-bottom: var(--spacing-sm, 0.5rem); color: var(--color-headline, #0f2a39); font-weight: 500; font-size: 16px;">
                  Drag and drop files here
                </p>
                <p style="font-size: 14px; color: var(--gray-medium); margin-bottom: var(--spacing-md, 1rem);">
                  or
                </p>
                <button type="button" class="btn-browse" style="
                  padding: 10px 20px;
                  background: var(--primary-color);
                  color: var(--color-white, #fff);
                  border: none;
                  border-radius: var(--border-radius-sm, 0.5rem);
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
              ${verificationDocuments.length > 0
        ? this.renderFileList(verificationDocuments)
        : ""
      }
            </div>

            ${showErrors && error
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
        <p style="font-size: 14px; font-weight: 500; margin-bottom: var(--spacing-sm); color: var(--color-headline, #0f2a39);">
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
              <span style="font-size: 14px; color: var(--color-headline, #0f2a39); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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
    const stepId = this.STEPS[this.state.currentStep].id;

    const showBack = !isFirstStep;

    // Disable Next button on representative step if there are active (non-staged) forms
    const hasActiveRepForm = stepId === 'representative-details' && this.hasActiveRepresentativeForm();
    const isNextDisabled = hasActiveRepForm;

    return `
      <div class="navigation-footer">
        ${showBack ? '<button type="button" class="btn-back">Back</button>' : ""
      }
        ${canSkip ? '<button type="button" class="btn-skip">Skip</button>' : ""}
        <button type="button" class="btn-next" ${isNextDisabled ? 'disabled' : ''}>
          ${isLastStep ? "Submit" : "Next"}
        </button>
        ${hasActiveRepForm ? '<p class="next-disabled-hint">Please confirm or discard all representatives before proceeding</p>' : ''}
      </div>
    `;
  }

  renderSuccessPage() {
    const { businessDetails } = this.state.formData;

    return `
      <div class="success-container">
        <div class="success-icon">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <h2>Bison Account Created! 🎉</h2>
        <p style="color: var(--color-headline, #0f2a39); font-size: 16px; margin-bottom: var(--spacing-lg);">
          Your WIO onboarding has been successfully completed.
        </p>

        <div class="success-actions">
          <button class="btn-confirm-success" type="button">
            ${this.doneButtonText || "Done"}
          </button>
        </div>
      </div>
    `;
  }

  renderSubmissionFailurePage() {
    const { errorMessage, errorDetails, statusCode } = this.state.uiState;
    const submissionError = this.state.submissionError || {};

    // Determine error title based on status code
    let errorTitle = "Submission Failed";
    let errorSubtitle = "Your onboarding submission could not be processed.";

    if (statusCode === 400) {
      errorTitle = "Validation Error";
      errorSubtitle = "Some of your information needs to be corrected.";
    } else if (statusCode === 401) {
      errorTitle = "Authentication Error";
      errorSubtitle = "Your session may have expired or credentials are invalid.";
    } else if (statusCode === 500) {
      errorTitle = "Server Error";
      errorSubtitle = "We encountered an issue processing your request.";
    }

    // Build error list HTML if there are specific errors
    const errorsListHtml =
      submissionError.errors && submissionError.errors.length > 0
        ? `
          <ul style="
            text-align: left;
            margin: var(--spacing-md) 0;
            padding-left: var(--spacing-lg);
            color: var(--color-error-dark, #991b1b);
            font-size: 14px;
            line-height: 1.6;
          ">
            ${submissionError.errors.map((err) => `<li>${err}</li>`).join("")}
          </ul>
        `
        : "";

    // Show trace ID if available (for support reference)
    const traceIdHtml = submissionError.traceId
      ? `<p style="
            margin-top: var(--spacing-sm);
            font-size: 12px;
            color: var(--gray-medium);
          ">Reference ID: <code style="background: var(--gray-light, #f3f4f6); padding: 2px 6px; border-radius: 4px;">${submissionError.traceId}</code></p>`
      : "";

    return `
      <div class="error-container">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.2"></circle>
            <path d="M12 8v4m0 4h.01" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>

        <h2>${errorTitle}</h2>
        <p>${errorSubtitle}</p>

        <div class="error-details">
          <h3>Error Details</h3>
          <p><strong>Issue:</strong> ${errorMessage || "The submission failed due to a server error."}</p>
          ${errorsListHtml}
          ${traceIdHtml}
          <p style="margin-top: var(--spacing-md); color: var(--color-error-dark, #991b1b);">
            Please try submitting again. If the problem persists, contact support.
          </p>
        </div>

        <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-sm); justify-content: center; width: 100%;">
          <button type="button" class="btn-resubmit" style="
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--color-white, #fff);
            border: none;
            border-radius: var(--border-radius-sm);
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
          ">Try Again</button>
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

    // Representative CRUD - use mousedown to prevent blur interference
    const addBtn = shadow.querySelector(".add-representative-btn");
    if (addBtn) {
      addBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.addRepresentative();
      });
    }

    shadow.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const index = parseInt(e.target.dataset.index);
        this.removeRepresentative(index);
      });
    });

    // Stage representative buttons
    shadow.querySelectorAll(".btn-stage-representative").forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const index = parseInt(e.target.dataset.index);
        this.stageRepresentative(index);
      });
    });

    // Discard representative buttons
    shadow.querySelectorAll(".btn-discard-representative").forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const index = parseInt(e.target.dataset.index);
        this.discardRepresentative(index);
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
          --primary-color: var(--color-primary, #4c7b63);
          --primary-hover: var(--color-primary-dark, #3a614e);
          --success-color: var(--color-success, #22c55e);
          --error-color: var(--color-error, #dd524b);
          --border-color: var(--color-border, #e5e7eb);
          --gray-light: var(--color-gray-50, #f9fafb);
          --gray-medium: var(--color-gray-500, #6b7280);
          --border-radius: var(--radius-xl, 0.75rem);
          --border-radius-sm: var(--radius-lg, 0.5rem);
          --border-radius-lg: var(--radius-2xl, 1rem);
          --spacing-sm: 0.75rem;
          --spacing-md: 1.25rem;
          --spacing-lg: 2rem;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --focus-ring: 0 0 0 4px rgba(76, 123, 99, 0.2);
          font-family: var(--font-sans, 'Inter', system-ui, -apple-system, sans-serif);
          color: var(--color-secondary, #374151);
          display: block;
        }

        /* Form Container (Inline Display) */
        .form-container {
          background: var(--color-white, #fff);
          border-radius: var(--border-radius-lg);
          max-width: 900px;
          margin: 0 auto;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 600px;
        }

        .form-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
          background: var(--color-white, #fff);
        }

        .form-body {
          padding: var(--spacing-lg);
          flex: 1; /* Allow body to take available space */
          overflow-y: auto;
        }

        .form-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
          background: var(--gray-light); /* Slight contrast for footer */
        }

        /* Loading State - Centered */
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: var(--spacing-lg);
          max-width: 600px;
          margin: 40px auto;
        }
        
        /* ... existing styles ... */
        
        /* Success Page - Centered & Polished */
        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--spacing-lg);
          max-width: 600px;
          margin: 0 auto;
          min-height: 500px;
        }

        /* ... existing styles ... */

        /* Error Page */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-lg);
          max-width: 600px;
          margin: 0 auto;
          min-height: 500px;
          text-align: center;
        }

        .error-icon {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: #fee2e2; /* Red 100 */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-lg);
        }

        .error-icon svg {
          width: 48px;
          height: 48px;
          stroke: var(--error-color);
        }

        .error-container h2 {
          font-size: 32px;
          color: var(--color-headline, #0f2a39);
          margin-bottom: 0.75rem;
        }

        .error-container > p {
          color: var(--gray-medium);
          margin-bottom: var(--spacing-lg);
        }
        
        .error-details {
          background: #fef2f2; /* Red 50 */
          border: 1px solid #fee2e2;
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
          text-align: left;
          width: 100%;
        }

        .error-details h3 {
          font-size: 16px;
          color: var(--color-error-dark, #991b1b);
          margin-bottom: var(--spacing-md);
        }

        .error-details p {
          color: var(--color-headline, #0f2a39);
          line-height: 1.5;
        }
        .loading-content h2 {
          margin-bottom: var(--spacing-md);
          color: var(--color-headline, #111827);
          font-size: 24px;
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
          height: 48px; /* Slightly larger */
          width: auto;
        }

        /* Stepper Header */
        .stepper-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start; /* Align to top */
          margin-bottom: var(--spacing-md);
          position: relative; /* For line positioning context if needed */
        }

        .step-indicator {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          position: relative;
          z-index: 1;
        }

        .step-indicator::after {
          content: '';
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border-color);
          z-index: -1;
        }

        .step-indicator:last-child::after {
          display: none;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-white, #fff); /* White background for clean look */
          color: var(--gray-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          border: 2px solid var(--border-color);
          transition: all 0.3s ease;
          box-shadow: var(--shadow-sm);
        }

        .step-indicator.active .step-circle {
          background: var(--primary-color);
          color: var(--color-white, #fff);
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(76, 123, 99, 0.2); /* Focus ring effect */
        }

        .step-indicator.complete .step-circle {
          background: var(--success-color);
          color: var(--color-white, #fff);
          border-color: var(--success-color);
        }

        .step-indicator.clickable {
          cursor: pointer;
        }

        .step-indicator.clickable:hover .step-circle {
          transform: translateY(-2px);
          border-color: var(--primary-color);
        }

        .step-label {
          font-size: 13px;
          color: var(--gray-medium);
          text-align: center;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .step-indicator.active .step-label {
          color: var(--primary-color);
          font-weight: 700;
        }

        /* Form Sections */
        .form-section {
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-md);
        }

        .form-section h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-headline, #111827);
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .form-section > p {
          color: var(--gray-medium);
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: var(--spacing-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg); /* Increased gap */
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-headline, #374151);
        }

        .required-asterisk {
          color: var(--error-color);
          margin-left: 2px;
        }

        .form-field input,
        .form-field select {
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          font-size: 15px;
          font-family: inherit;
          line-height: 1.5;
          transition: all 0.2s ease;
          height: 48px; /* Taller inputs */
          box-shadow: var(--shadow-sm);
          width: 100%;
          background-color: var(--color-white, #fff);
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: var(--focus-ring);
        }

        .form-field.has-error input,
        .form-field.has-error select {
          border-color: var(--error-color);
        }

        .form-field input:disabled,
        .form-field input[readonly] {
          background-color: var(--gray-light);
          color: var(--gray-medium);
          cursor: not-allowed;
        }

        .error-message {
          font-size: 13px;
          line-height: 1.4;
          color: var(--error-color);
          margin-top: 4px;
        }

        /* Password Strength Indicator */
        .password-strength {
          margin-top: 12px;
          background: var(--gray-light);
          padding: 12px;
          border-radius: var(--border-radius-sm);
        }
        
        /* ... (Password strength styles mostly same, just slight spacing tweaks if needed) ... */
        .password-strength-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .password-strength-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
          border-radius: 3px;
        }
        
        .password-strength-label a { /* Target text directly if needed or keep structure */ } 
        
        .password-check {
            margin-top: 8px;
            gap: 8px;
        }


        /* Radio Group */
        .radio-group {
          display: flex;
          gap: var(--spacing-lg);
          padding: 8px 0;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .radio-option input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--primary-color);
          margin: 0;
          box-shadow: none; /* Reset specialized input shadow */
        }

        .radio-option label {
          cursor: pointer;
          font-weight: 500;
        }

        /* Representatives */
        .representatives-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          background: var(--gray-light);
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius);
          color: var(--gray-medium);
        }

        .representative-card {
          background: var(--color-white, #fff);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s ease;
        }
        
        .representative-card:hover {
            box-shadow: var(--shadow-md);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color);
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-headline, #0f2a39);
        }

        .remove-btn {
          background: transparent;
          color: var(--error-color);
          border: 1px solid var(--error-color);
          padding: 6px 16px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: var(--error-color);
          color: white;
        }

        .add-representative-btn {
          background: transparent;
          color: var(--primary-color);
          border: 2px dashed var(--primary-color);
          padding: 16px;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          width: 100%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .add-representative-btn:hover {
          background: var(--color-primary-light, #f0fdf4);
          border-style: solid;
        }

        /* Staged Representative Styles */
        .representative-card.staged {
          border-color: var(--success-color);
          background: linear-gradient(to bottom, rgba(34, 197, 94, 0.05), var(--color-white, #fff));
        }

        .staged-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          color: var(--success-color);
          background: rgba(34, 197, 94, 0.1);
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 8px;
          vertical-align: middle;
        }

        .card-footer {
          padding-top: var(--spacing-md);
          margin-top: var(--spacing-md);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }

        .btn-stage-representative {
          background: var(--primary-color);
          color: var(--color-white, #fff);
          border: none;
          padding: 10px 20px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-stage-representative:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .card-footer-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-discard-representative {
          background: transparent;
          color: var(--gray-medium);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-discard-representative:hover {
          background: var(--gray-light);
          border-color: var(--gray-medium);
          color: var(--error-color);
        }

        .next-disabled-hint {
          font-size: 13px;
          color: var(--gray-medium);
          margin-top: 8px;
          text-align: center;
          width: 100%;
        }

        .staged-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--success-color);
          font-size: 14px;
          font-weight: 500;
        }

        .staged-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: var(--success-color);
          color: white;
          border-radius: 50%;
          font-size: 12px;
        }

        /* File Upload */
        .drag-drop-area {
          border: 2px dashed var(--border-color);
          border-radius: var(--border-radius);
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-light);
        }

        .drag-drop-area:hover,
        .drag-drop-area.drag-over {
          border-color: var(--primary-color);
          background: #f0fdf4; /* Light green tint */
        }

        .btn-browse {
            margin-top: 1rem;
            padding: 10px 24px !important;
            background: var(--color-white, #fff) !important;
            color: var(--primary-color) !important;
            border: 1px solid var(--border-color) !important;
            box-shadow: var(--shadow-sm);
            transition: all 0.2s ease;
        }
        
        .btn-browse:hover {
            border-color: var(--primary-color) !important;
            box-shadow: var(--shadow-md);
        }

        .uploaded-files {
          margin-top: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Navigation Footer */
        .navigation-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1.5rem; /* Explicit larger gap */
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-back,
        .btn-skip {
          padding: 12px 24px;
          background: var(--color-white, #fff);
          color: var(--gray-medium);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .btn-back:hover,
        .btn-skip:hover {
          background: var(--gray-light);
          border-color: var(--gray-medium);
          color: var(--color-headline, #111827);
        }

        .btn-next {
          padding: 12px 32px;
          background: var(--primary-color);
          color: var(--color-white, #fff);
          border: none;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
          min-width: 120px;
          box-shadow: var(--shadow-sm);
        }

        .btn-next:hover:not(:disabled) {
          background-color: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-next:disabled {
          background: var(--gray-medium);
          cursor: not-allowed;
          opacity: 0.6;
          transform: none;
          box-shadow: none;
        }

        /* Success Page - Centered & Polished */
        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--spacing-lg);
          max-width: 600px;
          margin: 0 auto;
          min-height: 500px;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin-bottom: var(--spacing-lg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #fff;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px var(--success-color);
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }

        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: var(--success-color);
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 50px var(--success-color);
          }
        }

        .success-container h2 {
          font-size: 32px;
          margin-bottom: 0.75rem;
        }
        
        .verification-notice {
            background: #ecfdf5; /* Green 50 */
            border: 1px solid #d1fae5;
            padding: var(--spacing-lg);
            width: 100%;
            border-radius: var(--border-radius);
            margin: var(--spacing-lg) 0;
        }

        .success-details {
          width: 100%;
          background: var(--gray-light);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
        }

        .success-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            width: 100%;
            justify-content: center;
        }

        .btn-confirm-success {
            padding: 12px 32px;
            background: var(--primary-color);
            color: var(--color-white, #fff);
            border: none;
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s ease;
            min-width: 120px;
            box-shadow: var(--shadow-sm);
        }

        .btn-confirm-success:hover {
            background-color: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }

        /* Error Page */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-lg);
          max-width: 600px;
          margin: 0 auto;
          min-height: 500px;
          text-align: center;
        }
        
        .error-details {
            width: 100%;
            text-align: left;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .step-label {
            display: none; /* Hide labels on mobile for cleaner look */
          }
          
          .navigation-footer {
              justify-content: space-between;
          }
          
          .btn-back, .btn-next {
              flex: 1;
          }
          
          .success-actions {
              flex-direction: column;
          }
          
          .btn-confirm-success {
              max-width: 100%;
          }
        }
      </style>
    `;

  }
}

// Register the custom element only if it hasn't been registered yet
if (!customElements.get("wio-onboarding")) {
  customElements.define("wio-onboarding", WioOnboarding);
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { WioOnboarding };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.WioOnboarding = WioOnboarding;
}
