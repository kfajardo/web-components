/**
 * OperatorPayment Web Component
 *
 * A lightweight wrapper around Moov's payment-methods drop that simplifies
 * operator payment integration with built-in token management.
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from component.js)
 *
 * @example
 * ```html
 * <script src="component.js"></script>
 * <script src="payments-operator.js"></script>
 *
 * <operator-payment id="payment"></operator-payment>
 * <script>
 *   const payment = document.getElementById('payment');
 *   payment.operatorEmail = 'operator@example.com';
 *   payment.onSuccess = (data) => console.log('Success!', data);
 *   payment.onError = ({ errorType, error }) => console.error(errorType, error);
 *   payment.open = true;
 * </script>
 * ```
 */

class OperatorPayment extends HTMLElement {
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
        "OperatorPayment: BisonJibPayAPI is not available. Please ensure component.js is loaded before payments-operator.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Internal state
    this._state = {
      operatorEmail: null,
      moovToken: null,
      isInitialized: false,
      isLoading: false,
      error: null,
    };

    // Callback references
    this._onSuccessCallback = null;
    this._onErrorCallback = null;

    // Moov drop reference
    this._moovRef = null;

    // Render the component
    this.render();
  }

  // ==================== STATIC PROPERTIES ====================

  static get observedAttributes() {
    return ["operator-email", "on-success", "on-error", "open", "api-base-url", "embeddable-key"];
  }

  // ==================== PROPERTY GETTERS/SETTERS ====================

  /**
   * Get the operator email
   * @returns {string|null}
   */
  get operatorEmail() {
    return this._state.operatorEmail;
  }

  /**
   * Set the operator email (triggers initialization)
   * @param {string} value - Operator's email address
   */
  set operatorEmail(value) {
    if (this._state.operatorEmail !== value) {
      this._state.operatorEmail = value;
      this._state.isInitialized = false;

      // Reinitialize if already connected and email is provided
      if (this.isConnected && value) {
        this.initializeMoovDrop();
      }
    }
  }

  /**
   * Get the onSuccess callback
   * @returns {Function|null}
   */
  get onSuccess() {
    return this._onSuccessCallback;
  }

  /**
   * Set the onSuccess callback
   * @param {Function} callback - Called when payment method is added
   */
  set onSuccess(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onSuccessCallback = callback;
    }
  }

  /**
   * Get the onError callback
   * @returns {Function|null}
   */
  get onError() {
    return this._onErrorCallback;
  }

  /**
   * Set the onError callback
   * @param {Function} callback - Called when an error occurs
   */
  set onError(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onErrorCallback = callback;
    }
  }

  /**
   * Get the open state of the payment drop
   * @returns {boolean}
   */
  get open() {
    return this._moovRef?.open || false;
  }

  /**
   * Set the open state of the payment drop
   * @param {boolean} value - Whether to show the drop
   */
  set open(value) {
    const shouldOpen = Boolean(value);

    // Initialize if not yet initialized and trying to open
    if (!this._state.isInitialized && shouldOpen) {
      this.initializeMoovDrop().then(() => {
        if (this._moovRef) {
          this._moovRef.open = shouldOpen;
        }
      });
    } else if (this._moovRef) {
      this._moovRef.open = shouldOpen;
    }
  }

  // ==================== LIFECYCLE METHODS ====================

  connectedCallback() {
    // Load Moov SDK if not already loaded
    this.ensureMoovSDK().then(() => {
      // Initialize if operator email is already set
      if (this._state.operatorEmail && !this._state.isInitialized) {
        this.initializeMoovDrop();
      }
    });
  }

  disconnectedCallback() {
    // Cleanup if needed
    this._moovRef = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "operator-email":
        this.operatorEmail = newValue;
        break;

      case "on-success":
        // Attribute-based callback (function name in global scope)
        if (newValue && window[newValue]) {
          this.onSuccess = window[newValue];
        }
        break;

      case "on-error":
        // Attribute-based callback (function name in global scope)
        if (newValue && window[newValue]) {
          this.onError = window[newValue];
        }
        break;

      case "open":
        this.open = newValue !== null;
        break;

      case "api-base-url":
        this.apiBaseURL = newValue;
        this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        break;

      case "embeddable-key":
        this.embeddableKey = newValue;
        this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        break;
    }
  }

  // ==================== CORE METHODS ====================

  /**
   * Ensure Moov SDK is loaded
   *
   * This method dynamically loads the Moov SDK from the CDN if not already present.
   * This eliminates the need for consumers to manually include the script tag.
   *
   * @returns {Promise<void>} Resolves when SDK is ready
   */
  async ensureMoovSDK() {
    // Check if Moov is already loaded
    if (window.Moov) {
      console.log("OperatorPayment: Moov SDK already loaded");
      return Promise.resolve();
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="moov.js"]');
    if (existingScript) {
      console.log(
        "OperatorPayment: Moov SDK script found, waiting for load..."
      );
      return new Promise((resolve, reject) => {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () =>
          reject(new Error("Failed to load Moov SDK"))
        );
      });
    }

    // Load the SDK
    console.log("OperatorPayment: Loading Moov SDK from CDN...");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.moov.io/v1/moov.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("OperatorPayment: Moov SDK loaded successfully");
        resolve();
      };

      script.onerror = () => {
        const error = new Error("Failed to load Moov SDK from CDN");
        console.error("OperatorPayment:", error);
        this.handleError({
          errorType: "sdk",
          error: error.message,
        });
        reject(error);
      };

      // Append to document head
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize the Moov payment methods drop
   *
   * This method:
   * 1. Validates prerequisites (operatorEmail, Moov SDK)
   * 2. Generates a Moov access token
   * 3. Configures the moov-payment-methods element
   * 4. Sets up success/error callbacks
   */
  async initializeMoovDrop() {
    // 1. Validate prerequisites
    if (!this._state.operatorEmail) {
      console.warn("OperatorPayment: operatorEmail is required");
      return;
    }

    if (!window.Moov) {
      this.handleError({
        errorType: "sdk",
        error: "Moov SDK not loaded. Please include the Moov SDK script.",
      });
      return;
    }

    // 2. Generate token using BisonJibPayAPI
    if (!this.api) {
      this.handleError({
        errorType: "initialization",
        error: "BisonJibPayAPI is not available. Please ensure component.js is loaded first.",
      });
      return;
    }

    try {
      this._state.isLoading = true;
      const tokenResult = await this.api.generateMoovToken(
        this._state.operatorEmail
      );
      this._state.moovToken = tokenResult.access_token;
    } catch (error) {
      this.handleError({
        errorType: "token",
        error: error.message || "Failed to generate Moov token",
      });
      return;
    } finally {
      this._state.isLoading = false;
    }

    // 3. Get reference to moov-payment-methods element
    this._moovRef = this.shadowRoot.querySelector("moov-payment-methods");

    if (!this._moovRef) {
      console.error(
        "OperatorPayment: moov-payment-methods element not found in shadow DOM"
      );
      return;
    }

    // 4. Configure the Moov drop
    this._moovRef.token = this._state.moovToken;
    this._moovRef.accountID = this._state.operatorEmail;
    this._moovRef.microDeposits = false;

    // 5. Set up callbacks
    this._moovRef.onResourceCreated = (result) => {
      console.log("OperatorPayment: Payment method successfully added", result);

      // Call user's success callback
      if (this._onSuccessCallback) {
        this._onSuccessCallback(result);
      }

      // Auto-close after success
      this.open = false;
    };

    this._moovRef.onError = ({ errorType, error }) => {
      console.error("OperatorPayment: Moov error", errorType, error);
      this.handleError({ errorType, error });
    };

    // 6. Mark as initialized
    this._state.isInitialized = true;
    console.log("OperatorPayment: Initialized for", this._state.operatorEmail);
  }

  /**
   * Handle errors
   * @param {Object} errorData - Error information
   * @param {string} errorData.errorType - Type of error
   * @param {string|Error} errorData.error - Error message or object
   */
  handleError({ errorType, error }) {
    // Store error in state
    this._state.error = { errorType, error };

    // Log to console
    console.error(`OperatorPayment Error (${errorType}):`, error);

    // Call user's error callback
    if (this._onErrorCallback) {
      this._onErrorCallback({ errorType, error });
    }

    // Emit custom event
    this.dispatchEvent(
      new CustomEvent("payment-error", {
        detail: { errorType, error },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ==================== RENDERING ====================

  /**
   * Render the component (Shadow DOM)
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        /* Ensure moov-payment-methods is properly contained */
        moov-payment-methods {
          display: block;
          width: 100%;
        }
      </style>
      
      <!-- Moov payment methods drop -->
      <moov-payment-methods></moov-payment-methods>
    `;
  }
}

// Register the custom element
customElements.define("operator-payment", OperatorPayment);

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { OperatorPayment };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.OperatorPayment = OperatorPayment;
}
