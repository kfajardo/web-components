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
    if (typeof BisonJibPayAPI === "undefined") {
      console.error(
        "WioOnboarding: BisonJibPayAPI is not available. Please ensure api.js is loaded before wio-onboarding.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Initialize state (no isModalOpen needed for inline component)
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
          underwritingDocuments: [],
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

    // Step configuration
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
      "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
      "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
      "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
      "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
      "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
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
        { name: "businessName", validators: ["required"], label: "Business Name" },
        { name: "doingBusinessAs", validators: ["required"], label: "Doing Business As (DBA)" },
        { name: "ein", validators: ["required", "ein"], label: "EIN" },
        { name: "businessWebsite", validators: ["required", "url"], label: "Business Website" },
        { name: "businessPhoneNumber", validators: ["required", "usPhone"], label: "Business Phone" },
        { name: "businessEmail", validators: ["required", "email"], label: "Business Email" },
        { name: "BusinessAddress1", validators: ["required"], label: "Street Address" },
        { name: "businessCity", validators: ["required"], label: "City" },
        { name: "businessState", validators: ["required"], label: "State" },
        { name: "businessPostalCode", validators: ["required", "postalCode"], label: "ZIP Code" },
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
      this.state.formData.representatives.forEach((rep, index) => {
        const hasAnyValue = Object.values(rep).some(
          (v) =>
            (typeof v === "string" && v.trim()) ||
            (typeof v === "object" &&
              Object.values(v).some((av) => av && av.trim()))
        );

        if (hasAnyValue) {
          const requiredFields = [
            { name: "representativeFirstName", validators: ["required"], label: "First Name" },
            { name: "representativeLastName", validators: ["required"], label: "Last Name" },
            { name: "representativeJobTitle", validators: ["required"], label: "Job Title" },
            { name: "representativePhone", validators: ["required", "usPhone"], label: "Phone" },
            { name: "representativeEmail", validators: ["required", "email"], label: "Email" },
            { name: "representativeDateOfBirth", validators: ["required"], label: "Date of Birth" },
            { name: "representativeAddress", validators: ["required"], label: "Address" },
            { name: "representativeCity", validators: ["required"], label: "City" },
            { name: "representativeState", validators: ["required"], label: "State" },
            { name: "representativeZip", validators: ["required", "postalCode"], label: "ZIP Code" },
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
        { name: "bankAccountHolderName", validators: ["required"], label: "Account Holder Name" },
        { name: "bankAccountType", validators: ["required"], label: "Account Type" },
        { name: "bankRoutingNumber", validators: ["required", "routingNumber"], label: "Routing Number" },
        { name: "bankAccountNumber", validators: ["required", "accountNumber"], label: "Account Number" },
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

    if (data.businessDetails) {
      newFormData.businessDetails = {
        ...newFormData.businessDetails,
        ...data.businessDetails,
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
      }));
    }

    if (data.underwriting) {
      newFormData.underwriting = {
        ...newFormData.underwriting,
        ...data.underwriting,
      };
    }

    if (data.bankDetails) {
      newFormData.bankDetails = {
        ...newFormData.bankDetails,
        ...data.bankDetails,
      };
    }

    const newState = {
      formData: newFormData,
    };

    if (typeof data.initialStep === "number" && data.initialStep >= 0 && data.initialStep < this.state.totalSteps) {
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

    const defaultValidationState = {
      step0: { isValid: false, errors: {} },
      step1: { isValid: true, errors: {} },
      step2: { isValid: false, errors: {} },
      step3: { isValid: false, errors: {} },
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
      underwriting: this.state.formData.underwriting,
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

    if (!this.api) {
      console.error("WioOnboarding: API not available for registration");
      this.handleSubmissionFailure(processedData);
      return;
    }

    try {
      const apiFormData = new FormData();

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

      if (processedData.representatives && processedData.representatives.length > 0) {
        apiFormData.append("representatives", JSON.stringify(processedData.representatives));
      }

      const bankDetails = processedData.bankDetails;
      apiFormData.append("bankAccountHolderName", bankDetails.bankAccountHolderName || "");
      apiFormData.append("bankAccountType", bankDetails.bankAccountType || "checking");
      apiFormData.append("bankRoutingNumber", bankDetails.bankRoutingNumber || "");
      apiFormData.append("bankAccountNumber", bankDetails.bankAccountNumber || "");

      const underwritingDocs = processedData.underwriting?.underwritingDocuments || [];
      underwritingDocs.forEach((file) => {
        if (file instanceof File) {
          apiFormData.append("underwritingDocuments", file);
        }
      });

      const response = await this.api.registerOperator(apiFormData);
      console.log("WioOnboarding: registerOperator API response", response);

      if (shouldFail || !response.success) {
        this.handleSubmissionFailure(processedData);
        return;
      }

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
      console.error("WioOnboarding: registerOperator API error", error);
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

    const currentFiles = this.state.formData.underwriting.underwritingDocuments || [];
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
          underwriting: {
            underwritingDocuments: [...currentFiles, ...validFiles],
          },
        },
      });
    }
  }

  removeFile(index) {
    const files = [...this.state.formData.underwriting.underwritingDocuments];
    files.splice(index, 1);

    this.setState({
      formData: {
        underwriting: {
          underwritingDocuments: files,
        },
      },
    });
  }

  // ==================== FIELD HANDLERS ====================

  handleFieldInput(e) {
    const input = e.target;
    const name = input.name;
    let value = input.value;
    const repIndex = input.dataset.repIndex;

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
      value = this.formatPhoneNumber(value);
      input.value = value;

      const oldDigits = oldValue.replace(/\D/g, "").length;
      const newDigits = value.replace(/\D/g, "").length;

      if (newDigits > oldDigits) {
        const adjustment = value.length - oldValue.length;
        input.setSelectionRange(cursorPosition + adjustment, cursorPosition + adjustment);
      } else {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }

    const stepId = this.STEPS[this.state.currentStep].id;

    if (stepId === "business-details") {
      this.state.formData.businessDetails[name] = input.value;
    } else if (stepId === "representatives" && repIndex !== undefined) {
      const idx = parseInt(repIndex);
      this.state.formData.representatives[idx][name] = input.value;
    } else if (stepId === "bank-details") {
      this.state.formData.bankDetails[name] = input.value;
    }
  }

  handleFieldBlur(e) {
    const input = e.target;
    const name = input.name;
    const value = input.value;
    const repIndex = input.dataset.repIndex;

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
    } else if (stepId === "representatives" && repIndex !== undefined) {
      const idx = parseInt(repIndex);
      this.state.formData.representatives[idx][name] = input.value;
    } else if (stepId === "bank-details") {
      this.state.formData.bankDetails[name] = input.value;
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
          left: 60%;
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
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s ease;
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
