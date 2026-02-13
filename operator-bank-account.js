/**
 * OperatorBankAccount Web Component
 *
 * A simple web component that provides a button to add a bank account via Moov.
 * Opens Moov's drop payment method directly when clicked.
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @example
 * ```html
 * <script src="component.js"></script>
 * <script src="operator-bank-account.js"></script>
 *
 * <operator-bank-account
 *   id="addBank"
 *   email="operator@example.com"
 *   operator-id="OP123456"
 *   client-id="CLIENT789"
 *   api-url="https://your-api.com"
 * ></operator-bank-account>
 *
 * Provide at least one of: email, operator-id, or client-id.
 *
 * <script>
 *   const addBank = document.getElementById('addBank');
 *
 *   // Success callback
 *   addBank.onSuccess = (result) => {
 *     console.log('Bank account added:', result);
 *   };
 *
 *   // Fail callback
 *   addBank.onFail = (error) => {
 *     console.error('Failed to add bank account:', error);
 *   };
 * </script>
 * ```
 */

class OperatorBankAccount extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // API Configuration
    this.apiBaseURL =
      this.getAttribute("api-url") ||
      "https://bison-jib-development.azurewebsites.net";
    this.embeddableKey =
      this.getAttribute("embeddable-key") ||
      "R80WMkbNN8457RofiMYx03DL65P06IaVT30Q2emYJUBQwYCzRC";

    // API will be initialized lazily when needed
    this.api = null;

    // Internal state
    this._state = {
      email: null,
      operatorId: null,
      clientId: null,
      isLoading: true, // Loading by default for verification
      moovAccountId: null,
      moovToken: null,
      error: null,
      isVerified: false,
      initializationError: false,
    };

    // Callback functions
    this._onSuccess = null;
    this._onFail = null;

    // Moov drop reference
    this._moovRef = null;

    // Render the component
    this.render();
  }

  // ==================== STATIC PROPERTIES ====================

  static get observedAttributes() {
    return ["email", "operator-id", "client-id", "api-url", "embeddable-key"];
  }

  // ==================== PROPERTY GETTERS/SETTERS ====================

  /**
   * Get the email
   * @returns {string|null}
   */
  get email() {
    return this._state.email;
  }

  /**
   * Set the email
   * @param {string} value - Operator email address
   */
  set email(value) {
    console.log("OperatorBankAccount: Setting email to:", value);

    const oldEmail = this._state.email;

    // Update internal state
    this._state.email = value;

    // Update attribute only if different to prevent circular updates
    const currentAttr = this.getAttribute("email");
    if (currentAttr !== value) {
      if (value) {
        this.setAttribute("email", value);
      } else {
        this.removeAttribute("email");
      }
    }

    // Trigger verification if required fields are set and component is connected
    const missingMessage = this.getMissingOperatorInfoMessage();
    if (!missingMessage && value && value !== oldEmail && this.isConnected) {
      this.verifyAndInitialize();
    } else if (missingMessage && this.isConnected) {
      // Missing required fields, show error state
      this._state.isLoading = false;
      this._state.initializationError = true;
      this._state.error = missingMessage;
      this.updateButtonState();
    }
  }

  /**
   * Get the operatorId
   * @returns {string|null}
   */
  get operatorId() {
    return this._state.operatorId;
  }

  /**
   * Set the operatorId
   * @param {string} value - Operator ID
   */
  set operatorId(value) {
    console.log("OperatorBankAccount: Setting operatorId to:", value);

    const oldOperatorId = this._state.operatorId;

    // Update internal state
    this._state.operatorId = value;

    // Update attribute only if different to prevent circular updates
    const currentAttr = this.getAttribute("operator-id");
    if (currentAttr !== value) {
      if (value) {
        this.setAttribute("operator-id", value);
      } else {
        this.removeAttribute("operator-id");
      }
    }

    // Trigger verification if required fields are set and component is connected
    const missingMessage = this.getMissingOperatorInfoMessage();
    if (
      !missingMessage &&
      value &&
      value !== oldOperatorId &&
      this.isConnected
    ) {
      this.verifyAndInitialize();
    } else if (missingMessage && this.isConnected) {
      // Missing required fields, show error state
      this._state.isLoading = false;
      this._state.initializationError = true;
      this._state.error = missingMessage;
      this.updateButtonState();
    }
  }

  /**
   * Get the clientId
   * @returns {string|null}
   */
  get clientId() {
    return this._state.clientId;
  }

  /**
   * Set the clientId
   * @param {string} value - Client ID
   */
  set clientId(value) {
    console.log("OperatorBankAccount: Setting clientId to:", value);

    const oldClientId = this._state.clientId;

    // Update internal state
    this._state.clientId = value;

    // Update attribute only if different to prevent circular updates
    const currentAttr = this.getAttribute("client-id");
    if (currentAttr !== value) {
      if (value) {
        this.setAttribute("client-id", value);
      } else {
        this.removeAttribute("client-id");
      }
    }

    // Trigger verification if required fields are set and component is connected
    const missingMessage = this.getMissingOperatorInfoMessage();
    if (
      !missingMessage &&
      value &&
      value !== oldClientId &&
      this.isConnected
    ) {
      this.verifyAndInitialize();
    } else if (missingMessage && this.isConnected) {
      // Missing required fields, show error state
      this._state.isLoading = false;
      this._state.initializationError = true;
      this._state.error = missingMessage;
      this.updateButtonState();
    }
  }

  getMissingOperatorInfoMessage() {
    if (!this._state.email && !this._state.operatorId && !this._state.clientId) {
      return "Email, operator ID, or client ID is required";
    }
    return null;
  }

  /**
   * Get the moovAccountId
   * @returns {string|null}
   */
  get moovAccountId() {
    return this._state.moovAccountId;
  }

  /**
   * Get/Set onSuccess callback
   */
  get onSuccess() {
    return this._onSuccess;
  }

  set onSuccess(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onSuccess = callback;
    }
  }

  /**
   * Get/Set onFail callback
   */
  get onFail() {
    return this._onFail;
  }

  set onFail(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onFail = callback;
    }
  }

  /**
   * Get/Set API URL
   */
  get apiUrl() {
    return this.apiBaseURL;
  }

  set apiUrl(value) {
    this.apiBaseURL = value;
    if (this.api) {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }
    // Update attribute
    if (value) {
      this.setAttribute("api-url", value);
    }
  }

  // ==================== LIFECYCLE METHODS ====================

  connectedCallback() {
    // Initialize email from attribute if present
    const emailAttr = this.getAttribute("email");
    if (emailAttr && !this._state.email) {
      this._state.email = emailAttr;
    }

    // Initialize operatorId from attribute if present
    const operatorIdAttr = this.getAttribute("operator-id");
    if (operatorIdAttr && !this._state.operatorId) {
      this._state.operatorId = operatorIdAttr;
    }

    // Initialize clientId from attribute if present
    const clientIdAttr = this.getAttribute("client-id");
    if (clientIdAttr && !this._state.clientId) {
      this._state.clientId = clientIdAttr;
    }

    // Load Moov SDK (preload for faster access later)
    this.ensureMoovSDK();

    this.setupEventListeners();

    // Auto-verify if required fields are already set
    const missingMessage = this.getMissingOperatorInfoMessage();
    if (!missingMessage) {
      this.verifyAndInitialize();
    } else {
      // Missing required fields, show error state with tooltip
      this._state.isLoading = false;
      this._state.initializationError = true;
      this._state.error = missingMessage;
      this.updateButtonState();
    }
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "email":
        console.log(
          "OperatorBankAccount: attributeChangedCallback - email:",
          newValue
        );
        this._state.email = newValue;
        // Reset state when email changes
        this._state.moovToken = null;
        this._state.moovAccountId = null;
        this._state.isVerified = false;
        this._state.isLoading = true;
        this._state.initializationError = false;
        this.updateButtonState();
        // Trigger verification if required fields are set
        if (this.isConnected) {
          const missingMessage = this.getMissingOperatorInfoMessage();
          if (!missingMessage) {
            this.verifyAndInitialize();
          } else {
            this._state.isLoading = false;
            this._state.initializationError = true;
            this._state.error = missingMessage;
            this.updateButtonState();
          }
        }
        break;

      case "operator-id":
        console.log(
          "OperatorBankAccount: attributeChangedCallback - operator-id:",
          newValue
        );
        this._state.operatorId = newValue;
        // Reset state when operator ID changes
        this._state.moovToken = null;
        this._state.moovAccountId = null;
        this._state.isVerified = false;
        this._state.isLoading = true;
        this._state.initializationError = false;
        this.updateButtonState();
        // Trigger verification if required fields are set
        if (this.isConnected) {
          const missingMessage = this.getMissingOperatorInfoMessage();
          if (!missingMessage) {
            this.verifyAndInitialize();
          } else {
            this._state.isLoading = false;
            this._state.initializationError = true;
            this._state.error = missingMessage;
            this.updateButtonState();
          }
        }
        break;

      case "client-id":
        console.log(
          "OperatorBankAccount: attributeChangedCallback - client-id:",
          newValue
        );
        this._state.clientId = newValue;
        // Reset state when client ID changes
        this._state.moovToken = null;
        this._state.moovAccountId = null;
        this._state.isVerified = false;
        this._state.isLoading = true;
        this._state.initializationError = false;
        this.updateButtonState();
        // Trigger verification if required fields are set
        if (this.isConnected) {
          const missingMessage = this.getMissingOperatorInfoMessage();
          if (!missingMessage) {
            this.verifyAndInitialize();
          } else {
            this._state.isLoading = false;
            this._state.initializationError = true;
            this._state.error = missingMessage;
            this.updateButtonState();
          }
        }
        break;

      case "api-url":
        this.apiBaseURL = newValue;
        if (this.api) {
          this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        }
        break;

      case "embeddable-key":
        this.embeddableKey = newValue;
        if (this.api) {
          this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        }
        break;
    }
  }

  // ==================== MOOV SDK LOADING ====================

  /**
   * Inject Moov Bison theme styles into document body
   */
  injectMoovThemeStyles() {
    if (document.getElementById("moov-bison-theme")) {
      return;
    }

    const styleTag = document.createElement("style");
    styleTag.id = "moov-bison-theme";
    styleTag.textContent = `
      :root {
        --moov-color-background: var(--color-white, #fff);
        --moov-color-background-secondary: var(--color-sidebar, #fafafa);
        --moov-color-background-tertiary: var(--color-gray-100, #f3f4f6);
        --moov-color-primary: var(--color-primary, #4c7b63);
        --moov-color-secondary: var(--color-primary-hover, #436c57);
        --moov-color-tertiary: var(--color-border, #e8e8e8);
        --moov-color-info: var(--color-primary, #4c7b63);
        --moov-color-warn: var(--color-warning, #f59e0b);
        --moov-color-danger: var(--color-error, #dd524b);
        --moov-color-success: var(--color-success, #22c55e);
        --moov-color-low-contrast: var(--color-gray-400, #9ca3af);
        --moov-color-medium-contrast: var(--color-gray-600, #4b5563);
        --moov-color-high-contrast: var(--color-headline, #0f2a39);
        --moov-color-graphic-1: var(--color-primary, #4c7b63);
        --moov-color-graphic-2: var(--color-gray-500, #6b7280);
        --moov-color-graphic-3: var(--color-warning, #f59e0b);
        --moov-radius-small: var(--radius-lg, 0.5rem);
        --moov-radius-large: var(--radius-xl, 0.75rem);
      }
    `;
    document.body.appendChild(styleTag);
    console.log("OperatorBankAccount: Bison theme styles injected");
  }

  /**
   * Ensure Moov SDK is loaded
   * @returns {Promise<void>}
   */
  async ensureMoovSDK() {
    if (window.Moov) {
      console.log("OperatorBankAccount: Moov SDK already loaded");
      return Promise.resolve();
    }

    const existingScript = document.querySelector('script[src*="moov.js"]');
    if (existingScript) {
      console.log(
        "OperatorBankAccount: Moov SDK script found, waiting for load..."
      );
      return new Promise((resolve, reject) => {
        existingScript.addEventListener("load", () => {
          console.log(
            "OperatorBankAccount: Moov SDK loaded from existing script"
          );
          resolve();
        });
        existingScript.addEventListener("error", () =>
          reject(new Error("Failed to load Moov SDK"))
        );
      });
    }

    console.log("OperatorBankAccount: Loading Moov SDK from CDN...");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.moov.io/v1";
      script.async = true;

      script.onload = () => {
        console.log("OperatorBankAccount: Moov SDK loaded successfully");
        resolve();
      };

      script.onerror = () => {
        const error = new Error("Failed to load Moov SDK from CDN");
        console.error("OperatorBankAccount:", error);
        this._state.error = error.message;
        this.triggerFail({ errorType: "sdk", error: error.message });
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  // ==================== EVENT HANDLING ====================

  setupEventListeners() {
    const button = this.shadowRoot.querySelector(".add-bank-btn");

    if (button) {
      button.addEventListener("click", this.handleButtonClick.bind(this));
    }
  }

  removeEventListeners() {
    // Clean up modal close handlers
    if (this._modalCloseHandlers) {
      this._modalCloseHandlers.forEach((handler) => {
        document.removeEventListener("click", handler, true);
      });
      this._modalCloseHandlers = [];
    }
  }

  /**
   * Handle button click
   */
  handleButtonClick() {
    console.log("OperatorBankAccount: Button clicked");

    // Validate required fields are set
    const missingMessage = this.getMissingOperatorInfoMessage();
    if (missingMessage) {
      console.warn(
        "OperatorBankAccount: Cannot open - required fields missing"
      );
      this.triggerFail({
        errorType: "validation",
        error: missingMessage,
      });
      return;
    }

    // Validate operator is verified
    if (!this._state.isVerified) {
      console.warn("OperatorBankAccount: Cannot open - operator not verified");
      this.triggerFail({
        errorType: "verification",
        error: "Operator is not verified",
      });
      return;
    }

    // Validate API is available (lazy initialization)
    if (!this.ensureAPI()) {
      console.warn("OperatorBankAccount: Cannot open - API is not available");
      this.triggerFail({
        errorType: "initialization",
        error: "BisonJibPayAPI is not available",
      });
      return;
    }

    // Open Moov drop
    this.openMoovDrop();
  }

  // ==================== VERIFICATION & INITIALIZATION ====================

  /**
   * Ensure API is initialized (lazy initialization)
   * @returns {boolean} True if API is available
   */
  ensureAPI() {
    if (this.api) {
      return true;
    }

    // Try to create API if BisonJibPayAPI is now available
    if (typeof BisonJibPayAPI !== "undefined") {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
      console.log("OperatorBankAccount: API initialized lazily");
      return true;
    }

    console.error(
      "OperatorBankAccount: BisonJibPayAPI is not available. Please ensure component.js is loaded."
    );
    return false;
  }

  /**
   * Verify operator and initialize Moov token
   */
  async verifyAndInitialize() {
    console.log(
      "🔍 OperatorBankAccount: verifyAndInitialize() called with email:",
      this._state.email
    );

    const missingMessage = this.getMissingOperatorInfoMessage();
    if (missingMessage) {
      console.warn(
        "❌ OperatorBankAccount: Required fields are missing for verification"
      );
      this._state.isLoading = false;
      this._state.initializationError = true;
      this._state.error = missingMessage;
      this.updateButtonState();
      return;
    }

    console.log("🔧 OperatorBankAccount: Checking if API is available...");
    // Ensure API is available (lazy initialization)
    if (!this.ensureAPI()) {
      console.error(
        "❌ OperatorBankAccount: ensureAPI() returned false - BisonJibPayAPI is not available"
      );
      console.error("❌ This is why verifyOperator is NOT being called!");
      console.error(
        "💡 Solution: Load component.js with type='module' or use api.js directly"
      );
      this._state.isLoading = false;
      this._state.initializationError = true;
      this.updateButtonState();
      return;
    }

    console.log(
      "✅ OperatorBankAccount: API is available, proceeding with verification..."
    );

    try {
      this._state.isLoading = true;
      this._state.error = null;
      this._state.initializationError = false;
      this.updateButtonState();

      console.log(
        "OperatorBankAccount: Verifying operator:",
        this._state.email
      );

      // Step 1: Verify operator exists
      const verifyResult = await this.api.verifyOperator(
        this._state.email || undefined,
        this._state.operatorId || undefined,
        this._state.clientId || undefined
      );

      if (!verifyResult.success) {
        throw new Error(verifyResult.message || "Operator verification failed");
      }

      console.log("OperatorBankAccount: Operator verified successfully");

      // Step 2: Get account to retrieve moovAccountId
      // Priority: operatorId > clientId > email
      let accountResult;
      if (this._state.operatorId) {
        accountResult = await this.api.getAccountByOperatorId(this._state.operatorId);
      } else if (this._state.clientId) {
        accountResult = await this.api.getAccountByClientId(this._state.clientId);
      } else {
        accountResult = await this.api.getAccountByEmail(this._state.email);
      }

      if (!accountResult.data?.moovAccountId) {
        throw new Error("Operator does not have a Moov account");
      }

      this._state.moovAccountId = accountResult.data.moovAccountId;
      console.log(
        "OperatorBankAccount: moovAccountId:",
        this._state.moovAccountId
      );

      // Step 3: Generate Moov token
      await this.generateMoovToken();

      // Mark as verified
      this._state.isVerified = true;
      this._state.isLoading = false;
      this.updateButtonState();

      // Dispatch ready event
      this.dispatchEvent(
        new CustomEvent("operator-bank-account-ready", {
          detail: {
            email: this._state.email,
            operatorId: this._state.operatorId,
            clientId: this._state.clientId,
            moovAccountId: this._state.moovAccountId,
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      console.error("OperatorBankAccount: Verification failed:", error);

      this._state.isLoading = false;
      this._state.isVerified = false;
      this._state.initializationError = true;
      this._state.error =
        error.data?.message || error.message || "Verification failed";
      this.updateButtonState();

      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent("operator-bank-account-error", {
          detail: {
            error: this._state.error,
            type: "verification",
            originalError: error,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Generate Moov access token
   * @returns {Promise<boolean>}
   */
  async generateMoovToken() {
    try {
      console.log("OperatorBankAccount: Generating Moov token...");

      const tokenResult = await this.api.generateMoovToken(
        this._state.email,
        this._state.moovAccountId,
        this._state.operatorId,
        this._state.clientId
      );

      if (!tokenResult || !tokenResult.data?.accessToken) {
        throw new Error("Failed to generate Moov token");
      }

      this._state.moovToken = tokenResult.data.accessToken;

      if (tokenResult.data?.accountID) {
        this._state.moovAccountId = tokenResult.data.accountID;
      }

      console.log("OperatorBankAccount: Moov token generated successfully");
      return true;
    } catch (error) {
      console.error("OperatorBankAccount: Token generation failed:", error);
      this._state.error = error.message || "Failed to generate Moov token";
      throw error;
    }
  }

  /**
   * Reset and regenerate token (called on Moov drop close)
   */
  async resetAndRefreshToken() {
    console.log("OperatorBankAccount: Resetting token and accountID...");

    // Clear current token
    this._state.moovToken = null;

    // Regenerate token
    try {
      await this.generateMoovToken();
      console.log("OperatorBankAccount: Token refreshed successfully");
    } catch (error) {
      console.error("OperatorBankAccount: Failed to refresh token:", error);
    }
  }

  // ==================== MOOV DROP ====================

  /**
   * Open Moov Drop
   */
  async openMoovDrop() {
    console.log("OperatorBankAccount: Opening Moov drop...");

    // Ensure Moov SDK is loaded
    if (!window.Moov) {
      console.log("OperatorBankAccount: Moov SDK not loaded yet, waiting...");
      try {
        await this.ensureMoovSDK();
      } catch (error) {
        console.error("OperatorBankAccount: Failed to load Moov SDK:", error);
        this.triggerFail({ errorType: "sdk", error: error.message });
        return;
      }
    }

    // Generate token if not available
    if (!this._state.moovToken) {
      console.log("OperatorBankAccount: Generating Moov token on demand...");
      try {
        await this.generateMoovToken();
      } catch (error) {
        console.error("OperatorBankAccount: Failed to generate token:", error);
        this.triggerFail({ errorType: "token", error: error.message });
        return;
      }
    }

    // Inject Bison theme styles
    this.injectMoovThemeStyles();

    // Remove any existing moov-payment-methods element
    const existingMoovDrop = document.getElementById(
      "operator-bank-account-moov-drop"
    );
    if (existingMoovDrop) {
      existingMoovDrop.remove();
      console.log("OperatorBankAccount: Removed existing Moov drop element");
    }

    // Create fresh moov-payment-methods element
    const moovDrop = document.createElement("moov-payment-methods");
    moovDrop.id = "operator-bank-account-moov-drop";
    document.body.appendChild(moovDrop);

    // Configure the Moov drop
    moovDrop.token = this._state.moovToken;
    moovDrop.accountID = this._state.moovAccountId;
    moovDrop.microDeposits = false;
    moovDrop.paymentMethodTypes = ["bankAccount"];

    // Set up callbacks
    moovDrop.onResourceCreated = async (result) => {
      console.log("OperatorBankAccount: Payment method created:", result);

      // Trigger success callback
      this.triggerSuccess(result);

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent("bank-account-added", {
          detail: result,
          bubbles: true,
          composed: true,
        })
      );
    };

    moovDrop.onError = ({ errorType, error }) => {
      console.error("OperatorBankAccount: Moov error:", errorType, error);

      // Trigger fail callback
      this.triggerFail({ errorType, error });

      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent("bank-account-error", {
          detail: { errorType, error },
          bubbles: true,
          composed: true,
        })
      );
    };

    // Close handler - reset token and accountID
    moovDrop.onClose = async () => {
      console.log("OperatorBankAccount: Moov UI closed");
      moovDrop.open = false;

      // Reset and refresh token on every close
      await this.resetAndRefreshToken();

      // Update moov drop with new token if it exists
      if (this._state.moovToken && moovDrop) {
        moovDrop.token = this._state.moovToken;
        moovDrop.accountID = this._state.moovAccountId;
      }

      // Dispatch close event
      this.dispatchEvent(
        new CustomEvent("moov-drop-close", {
          bubbles: true,
          composed: true,
        })
      );
    };

    // Cancel handler
    moovDrop.onCancel = async () => {
      console.log("OperatorBankAccount: Moov UI cancelled");
      moovDrop.open = false;

      // Reset and refresh token on every close
      await this.resetAndRefreshToken();

      // Update moov drop with new token if it exists
      if (this._state.moovToken && moovDrop) {
        moovDrop.token = this._state.moovToken;
        moovDrop.accountID = this._state.moovAccountId;
      }

      // Dispatch close event
      this.dispatchEvent(
        new CustomEvent("moov-drop-close", {
          bubbles: true,
          composed: true,
        })
      );
    };

    // Handle modal close button clicks
    const handleModalClose = async (e) => {
      const target = e.target;
      const modalCloseElement =
        target.closest && target.closest('[data-testid="modalClose"]');

      if (modalCloseElement) {
        console.log("OperatorBankAccount: Modal close button clicked");
        this.closeMoovDrop();
      }
    };

    document.addEventListener("click", handleModalClose, true);

    if (!this._modalCloseHandlers) {
      this._modalCloseHandlers = [];
    }
    this._modalCloseHandlers.push(handleModalClose);

    // Open the Moov drop
    console.log("OperatorBankAccount: Setting moovDrop.open = true");
    moovDrop.open = true;

    // Store reference
    this._moovRef = moovDrop;
  }

  /**
   * Close the Moov UI
   */
  async closeMoovDrop() {
    if (this._moovRef && this._moovRef.open) {
      console.log("OperatorBankAccount: Closing Moov UI");
      this._moovRef.open = false;

      // Reset and refresh token
      await this.resetAndRefreshToken();

      this._moovRef = null;
    }
  }

  // ==================== CALLBACKS ====================

  /**
   * Trigger success callback
   */
  triggerSuccess(result) {
    if (typeof this._onSuccess === "function") {
      this._onSuccess(result);
    }
  }

  /**
   * Trigger fail callback
   */
  triggerFail(error) {
    if (typeof this._onFail === "function") {
      this._onFail(error);
    }
  }

  // ==================== UI UPDATES ====================

  /**
   * Update button state based on verification status
   */
  updateButtonState() {
    const button = this.shadowRoot.querySelector(".add-bank-btn");
    const wrapper = this.shadowRoot.querySelector(".btn-wrapper");
    const tooltip = this.shadowRoot.querySelector(".tooltip");

    if (!button) return;

    // Handle loading state
    if (this._state.isLoading) {
      button.classList.add("loading");
      button.classList.remove("error");
      button.disabled = true;
      if (wrapper) wrapper.classList.remove("has-error");
    }
    // Handle error state (not verified)
    else if (this._state.initializationError || !this._state.isVerified) {
      button.classList.remove("loading");
      button.classList.add("error");
      button.disabled = true;
      if (wrapper) wrapper.classList.add("has-error");

      // Update tooltip text based on error
      if (tooltip && this._state.error) {
        tooltip.textContent = this._state.error;
      }
    }
    // Handle normal state (verified)
    else {
      button.classList.remove("loading", "error");
      button.disabled = false;
      if (wrapper) wrapper.classList.remove("has-error");
    }
  }

  // ==================== RENDERING ====================

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
          color: var(--color-secondary, #5f6e78);
        }

        .btn-wrapper {
          position: relative;
          display: inline-block;
        }

        .add-bank-btn {
          padding: 12px 24px;
          background: var(--color-primary, #4c7b63);
          color: var(--color-white, #fff);
          border: none;
          border-radius: var(--radius-xl, 0.75rem);
          font-size: var(--text-sm, 0.875rem);
          font-weight: var(--font-weight-medium, 500);
          cursor: pointer;
          transition: all var(--duration-normal, 200ms) var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          box-sizing: border-box;
        }

        .add-bank-btn:hover:not(.error):not(.loading) {
          background: var(--color-primary-hover, #436c57);
        }

        .add-bank-btn:active:not(.error):not(.loading) {
          background: var(--color-primary-active, #3d624f);
          transform: translateY(0);
        }

        .add-bank-btn.error {
          background: var(--color-gray-400, #9ca3af);
          cursor: not-allowed;
        }

        .add-bank-btn.loading {
          background: var(--color-primary-soft, #678f7a);
          cursor: wait;
        }

        .add-bank-btn .bank-icon {
          width: 18px;
          height: 18px;
        }

        .add-bank-btn .loading-spinner {
          display: none;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: var(--color-white, #fff);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .add-bank-btn.loading .loading-spinner {
          display: inline-block;
        }

        .add-bank-btn.loading .bank-icon {
          display: none;
        }

        .add-bank-btn .error-icon {
          display: none;
          width: 16px;
          height: 16px;
        }

        .add-bank-btn.error .error-icon {
          display: inline-block;
        }

        .add-bank-btn.error .bank-icon {
          display: none;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .tooltip {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-gray-700, #374151);
          color: var(--color-white, #fff);
          padding: 8px 12px;
          border-radius: var(--radius-lg, 0.5rem);
          font-size: 13px;
          white-space: nowrap;
          margin-bottom: 8px;
          transition: opacity var(--duration-normal, 200ms) var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)),
            visibility var(--duration-normal, 200ms) var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
          z-index: 10002;
        }

        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--color-gray-700, #374151);
        }

        .btn-wrapper:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }

        .btn-wrapper:not(.has-error) .tooltip {
          display: none;
        }
      </style>

      <div class="btn-wrapper">
        <span class="tooltip">Email, operator ID, or client ID is required</span>
        <button class="add-bank-btn error">
          <span class="loading-spinner"></span>
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <svg class="bank-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="10" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M12 3L2 10h20L12 3z"></path>
          </svg>
          Add Bank Account
        </button>
      </div>
    `;
  }
}

// Register the custom element only if it hasn't been registered yet
if (!customElements.get("operator-bank-account")) {
  customElements.define("operator-bank-account", OperatorBankAccount);
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { OperatorBankAccount };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.OperatorBankAccount = OperatorBankAccount;
}
