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
      totalSteps: 4, // Business, Representatives, Underwriting, Bank (verification is pre-stepper)
      isSubmitted: false,
      isFailed: false,
      isSubmissionFailed: false,
      isVerified: false, // Track if WIO verification is complete
      verificationSkipped: false, // Track if verification was skipped via onLoad
      formData: {
        verification: {
          wioEmail: "",
        },
        businessDetails: {
          businessName: "",
          doingBusinessAs: "",
          ein: "",
          businessWebsite: "",
          businessPhoneNumber: "",
          businessEmail: "",
          businessStreet: "",
          businessCity: "",
          businessState: "",
          businessPostalCode: "",
        },
        representatives: [],
        underwriting: {
          // TODO: Add underwriting fields here as needed
          // Example: industryType: "",
          // Example: estimatedMonthlyRevenue: "",
        },
        bankDetails: {
          accountHolderName: "",
          accountType: "checking",
          routingNumber: "",
          accountNumber: "",
        },
      },
      validationState: {
        verification: { isValid: false, errors: {} }, // Pre-stepper validation
        step0: { isValid: false, errors: {} }, // Business Details
        step1: { isValid: true, errors: {} }, // Representatives (optional)
        step2: { isValid: false, errors: {} }, // Bank Details
        step3: { isValid: true, errors: {} }, // Underwriting (optional)
      },
      completedSteps: new Set(),
      uiState: {
        isLoading: false,
        verificationStatus: null,
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
        description: "Underwriting information",
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
    
    if (typeof stepIdentifier === 'number') {
      step = this.STEPS[stepIdentifier];
      stepKey = `step${stepIdentifier}`;
    } else if (stepIdentifier === 'verification') {
      // Special case for verification (pre-stepper)
      step = { id: 'verification', fields: ['wioEmail'] };
      stepKey = 'verification';
    } else {
      step = this.STEPS.find(s => s.id === stepIdentifier);
      stepKey = stepIdentifier;
    }
    
    if (!step) return false;
    
    let isValid = true;
    const errors = {};
    
    // Validation logic for verification step
    if (step.id === "verification") {
      const email = this.state.formData.verification.wioEmail;
      const error = this.validateField(email, ["required", "email"], "WIO Email");
      if (error) {
        errors.wioEmail = error;
        isValid = false;
      }
    }
    
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

    if (stepId === "verification") {
      const email = this.state.formData.verification.wioEmail;
      const error = this.validateField(
        email,
        ["required", "email"],
        "WIO Email"
      );
      if (error) {
        errors.wioEmail = error;
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
    } else if (stepId === "underwriting") {
      // TODO: Add underwriting field validation here
      // Example:
      // const data = this.state.formData.underwriting;
      // const fields = [
      //   { name: "industryType", validators: ["required"], label: "Industry Type" },
      // ];
      // fields.forEach((field) => {
      //   const error = this.validateField(data[field.name], field.validators, field.label);
      //   if (error) {
      //     errors[field.name] = error;
      //     isValid = false;
      //   }
      // });

      // For now, mark as valid since no fields are required yet
      isValid = true;
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

    // Update verification status to success
    this.setState({
      uiState: { isLoading: false, verificationStatus: "success" },
    });

    // Show "Proceeding to onboarding" message (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mark as verified and proceed to stepper form
    this.setState({
      isVerified: true,
      currentStep: 0, // Start at first step of stepper (Business Details)
      uiState: { verificationStatus: null, showErrors: false, isLoading: false },
    });
  }

  handleVerificationFailure() {
    const email = this.state.formData.verification.wioEmail;
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

  resetToVerification() {
    // Reset the failure state and return to verification step
    this.setState({
      currentStep: 0,
      isFailed: false,
      isVerified: false, // Stay in pre-stepper verification
      uiState: {
        isLoading: false,
        verificationStatus: null,
        showErrors: false,
        errorMessage: null,
      },
    });
  }

  // Attach event listeners for standalone verification form
  attachVerificationListeners() {
    const shadow = this.shadowRoot;
    
    // Handle verification form submission
    const verifyButton = shadow.querySelector('[data-action="verify"]');
    if (verifyButton) {
      verifyButton.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        // Capture email value from input
        const emailInput = shadow.querySelector('input[name="wioEmail"]');
        if (emailInput) {
          this.setState({
            formData: {
              verification: {
                wioEmail: emailInput.value,
              },
            },
          });
        }
        
        // Validate the verification step
        const isValid = this.validateStep("verification");
        if (isValid) {
          this.handleVerification(false);
        } else {
          this.setState({
            uiState: { showErrors: true },
          });
        }
      });
    }

    // Handle fail verification button (for demo)
    const failButton = shadow.querySelector('[data-action="fail-verify"]');
    if (failButton) {
      failButton.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        // Capture email value from input
        const emailInput = shadow.querySelector('input[name="wioEmail"]');
        if (emailInput) {
          this.setState({
            formData: {
              verification: {
                wioEmail: emailInput.value,
              },
            },
          });
        }
        
        // Validate the verification step
        const isValid = this.validateStep("verification");
        if (isValid) {
          this.handleVerification(true);
        } else {
          this.setState({
            uiState: { showErrors: true },
          });
        }
      });
    }

    // Handle field input for verification step
    const wioEmailInput = shadow.querySelector('[name="wioEmail"]');
    if (wioEmailInput) {
      wioEmailInput.addEventListener("input", (e) => {
        // Update state in real-time
        this.state.formData.verification.wioEmail = e.target.value;
        
        // Real-time validation if showErrors is true
        if (this.state.uiState.showErrors) {
          const error = this.validateField(e.target.value, ["required", "email"], "WIO Email");
          
          // Initialize validation state if needed
          if (!this.state.validationState.verification) {
            this.state.validationState.verification = { isValid: true, errors: {} };
          }
          
          if (error) {
            this.state.validationState.verification.errors.wioEmail = error;
          } else {
            delete this.state.validationState.verification.errors.wioEmail;
          }
          
          // Update error message in DOM without full re-render
          this.updateFieldErrorDisplay(e.target, error);
        }
      });
      
      wioEmailInput.addEventListener("blur", () => {
        this.setState({
          uiState: { showErrors: true },
        });
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
      newFormData.verification.wioEmail = data.wioEmail;
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
    const stateUpdate = {
      formData: newFormData,
      verificationSkipped: hasWioEmail, // Mark that verification will be auto-skipped
    };

    // If wioEmail exists, trigger automatic verification
    if (hasWioEmail) {
      stateUpdate.isVerified = false; // Ensure we show verification UI
      stateUpdate.uiState = {
        isLoading: true,
        verificationStatus: "pending",
      };
    }

    this.setState(stateUpdate);

    // Trigger automatic verification if wioEmail was provided
    if (hasWioEmail) {
      // Small delay to allow UI to render loading state
      setTimeout(() => {
        this.handleVerification(false); // false = success, can be changed for testing
      }, 100);
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
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
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
    
    // For verification step (pre-stepper)
    if (!this.state.isVerified) {
      const errors = this.state.validationState.verification?.errors || {};
      return errors[fieldName] || "";
    }
    
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
      verification: this.state.formData.verification,
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
    // Show failure page if verification failed
    if (this.state.isFailed) {
      this.shadowRoot.innerHTML = `
        ${this.renderStyles()}
        <div class="onboarding-container">
          ${this.renderFailurePage()}
        </div>
      `;
      this.attachFailurePageListeners();
      return;
    }

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
    if (this.state.uiState.isLoading && this.state.isVerified) {
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

    // If NOT verified, show standalone verification flow
    if (!this.state.isVerified) {
      this.shadowRoot.innerHTML = `
        ${this.renderStyles()}
        <div class="onboarding-container">
          ${this.renderVerificationStep()}
        </div>
      `;
      this.attachVerificationListeners();
      return;
    }

    // If verified, show main stepper form
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
          background: #325240e6;
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

    /**
     * DEVELOPER GUIDE: Adding Underwriting Fields
     *
     * To add fields to this step, follow these steps:
     *
     * 1. ADD FIELD TO STATE (line ~38-42):
     *    In the constructor's formData.underwriting object, add your field:
     *    underwriting: {
     *      yourFieldName: "",  // Add your field here
     *    }
     *
     * 2. ADD VALIDATION (in validateCurrentStep method, around line 471):
     *    Add validation for underwriting fields
     *
     * 3. ADD FIELD HANDLING IN handleFieldInput (around line 2409):
     *    Already implemented - will handle your fields automatically
     *
     * 4. ADD FIELD HANDLING IN handleFieldBlur (around line 2369):
     *    Already implemented - will handle your fields automatically
     *
     * 5. ADD REAL-TIME VALIDATION CONFIG (in handleFieldInput, around line 2501):
     *    Add your field validation configuration
     *
     * 6. RENDER FIELDS BELOW:
     *    Use this.renderField() to add input fields in the form grid below
     */

    return `
      <div class="step-content">
        <div class="form-logo">
          <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
        </div>
        <h2>Underwriting</h2>
        <p>Underwriting information</p>
        
        <div class="form-grid">
          <div class="empty-state full-width">
            <p>Underwriting fields will be added here by the developer.</p>
            <p style="font-size: 12px; color: var(--gray-medium); margin-top: var(--spacing-sm);">
              See renderUnderwritingStep() method for implementation guide.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderVerificationStep() {
    const { wioEmail } = this.state.formData.verification;
    const errors = this.state.validationState.verification?.errors || {};
    const showErrors = this.state.uiState.showErrors;
    const { isLoading, verificationStatus } = this.state.uiState;

    // Show loading screen during verification
    if (isLoading) {
      return `
        <div class="step-content" style="text-align: center; padding: calc(var(--spacing-lg) * 2);">
          <div class="form-logo">
            <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
          </div>
          <h2>Verifying WIO Email...</h2>
          <p style="color: var(--gray-medium); margin-bottom: var(--spacing-lg);">
            Please wait while we verify: <strong>${wioEmail || 'your email'}</strong>
          </p>
          <div class="loading-spinner"></div>
        </div>
      `;
    }

    // Show success message before transitioning to stepper
    if (verificationStatus === "success") {
      return `
        <div class="success-container">
          <div class="success-icon">
            <svg viewBox="0 0 52 52">
              <path d="M14 27l7 7 16-16"/>
            </svg>
          </div>
          <h2>Verification Successful!</h2>
          <p>Proceeding to onboarding...</p>
        </div>
      `;
    }

    // Show standalone verification form
    return `
      <div class="step-content">
        <div class="form-logo">
          <img src="https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png" alt="Logo" />
        </div>
        <h2>Verify WIO Email</h2>
        <p>Enter your WIO email address to begin the operator onboarding process.</p>
        
        <div class="form-field ${showErrors && errors.wioEmail ? "has-error" : ""}">
          <label for="wioEmail">WIO Email <span class="required-asterisk">*</span></label>
          <input
            type="email"
            id="wioEmail"
            name="wioEmail"
            value="${wioEmail}"
            placeholder="your.email@company.com"
          />
          ${showErrors && errors.wioEmail ? `<span class="error-message">${errors.wioEmail}</span>` : ""}
        </div>
        
        <div class="verification-buttons">
          <button type="button" class="btn-verify" data-action="verify">Verify Email</button>
          <button type="button" class="btn-fail" data-action="fail-verify">Fail Verify (Demo)</button>
        </div>
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
            name: "accountHolderName",
            label: "Account Holder Name *",
            value: data.accountHolderName,
            error: this.getFieldError("accountHolderName"),
            className: "full-width",
          })}
          
          <div class="form-field full-width">
            <label>Account Type <span class="required-asterisk">*</span></label>
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

    // Hide back button if we're on first step (Business Details)
    // Since verification is now pre-stepper, there's nothing to go back to
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
        ${isLastStep ? '<button type="button" class="btn-fail-submit" style="margin-left: var(--spacing-sm); background: var(--error-color);">Fail Submit (Demo)</button>' : ""}
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
    const { wioEmail } = this.state.formData.verification;
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
          <p><strong>Email:</strong> ${wioEmail}</p>
          <p><strong>Issue:</strong> ${
            errorMessage || "This WIO email does not exist in our system."
          }</p>
          <p style="margin-top: var(--spacing-md);">
            Please ensure you have a valid WIO associated with this email address before attempting to onboard an operator.
          </p>
        </div>
        
        <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-sm); justify-content: center;">
          <button type="button" class="btn-back-to-verification" style="
            padding: 12px 24px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">Try Again</button>
        </div>
        
        <p style="margin-top: var(--spacing-md); font-size: 12px; color: var(--gray-medium);">
          Or you can close this dialog.
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

    // Back to verification button (on failure page)
    const backToVerificationBtn = shadow.querySelector(".btn-back-to-verification");
    if (backToVerificationBtn) {
      backToVerificationBtn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        this.resetToVerification();
      });
    }
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

    // Verify button - ensure field is captured before validation
    const verifyBtn = shadow.querySelector(".btn-verify");
    if (verifyBtn) {
      verifyBtn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent blur from interfering
        // Capture email value from input before validating
        const emailInput = shadow.querySelector('input[name="wioEmail"]');
        if (emailInput) {
          this.setState({
            formData: {
              verification: {
                wioEmail: emailInput.value,
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
      failBtn.addEventListener("mousedown", async (e) => {
        e.preventDefault(); // Prevent blur from interfering
        // Capture email value from input before validating
        const emailInput = shadow.querySelector('input[name="wioEmail"]');
        if (emailInput) {
          this.setState({
            formData: {
              verification: {
                wioEmail: emailInput.value,
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

    // Fail Submit button - for demo purposes
    const failSubmitBtn = shadow.querySelector(".btn-fail-submit");
    if (failSubmitBtn) {
      failSubmitBtn.addEventListener("mousedown", async (e) => {
        e.preventDefault(); // Prevent blur from interfering
        // Validate the field first
        if (!this.validateCurrentStep()) return;

        // Trigger failure submission
        await this.handleFormCompletion(true);
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

    if (stepId === "verification") {
      this.state.formData.verification[name] = value;
    } else if (stepId === "business-details") {
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

      if (stepId === "verification") {
        if (name === "wioEmail") {
          validators = ["required", "email"];
          fieldLabel = "WIO Email";
        }
      } else if (stepId === "business-details") {
        const fieldConfigs = {
          businessName: { validators: ["required"], label: "Business Name" },
          doingBusinessAs: { validators: ["required"], label: "Doing Business As (DBA)" },
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
          businessStreet: { validators: ["required"], label: "Street Address" },
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
 * Standalone function to verify a WIO email
 * This can be used to check WIO email status before rendering the onboarding form
 *
 * @param {string} wioEmail - The WIO email address to verify
 * @param {boolean} mockResult - Mock result for testing (true = verified, false = not verified)
 * @returns {boolean} - Returns true if WIO email is verified, false otherwise
 *
 * @example
 * // Check if WIO email is verified
 * const isVerified = verifyWIO('wio@example.com', true);
 * if (isVerified) {
 *   // Show onboarding form
 * } else {
 *   // Show error message
 * }
 */
function verifyWIO(wioEmail, mockResult) {
  if (!wioEmail || typeof wioEmail !== "string") {
    console.error("verifyWIO: wioEmail must be a non-empty string");
    return false;
  }

  if (typeof mockResult !== "boolean") {
    console.error("verifyWIO: mockResult must be a boolean");
    return false;
  }

  // Log verification attempt
  console.log(`Verifying WIO email: ${wioEmail}`, { result: mockResult });

  // Return the mock result
  return mockResult;
}

// Export for module usage (if using ES modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { OperatorOnboarding, verifyWIO };
}

// Also make available globally for script tag usage
if (typeof window !== "undefined") {
  window.verifyWIO = verifyWIO;
}
