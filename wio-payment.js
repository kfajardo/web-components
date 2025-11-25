/**
 * WioPayment Web Component
 *
 * A web component that integrates Moov payment methods with Plaid Link for
 * Worker-Independent Operators (WIOs) to securely link their bank accounts.
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from component.js)
 *
 * @example
 * ```html
 * <script src="component.js"></script>
 * <script src="wio-payment.js"></script>
 *
 * <wio-payment id="payment"></wio-payment>
 * <script>
 *   const payment = document.getElementById('payment');
 *   payment.wioEmail = 'wio@example.com';
 *   payment.env = 'sandbox';
 *   payment.onSuccess = (data) => console.log('Success!', data);
 *   payment.onError = ({ errorType, error }) => console.error(errorType, error);
 *   payment.open = true;
 * </script>
 * ```
 */

class WioPayment extends HTMLElement {
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
        "WioPayment: BisonJibPayAPI is not available. Please ensure component.js is loaded before wio-payment.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Internal state
    this._state = {
      wioEmail: null,
      env: 'sandbox',
      redirectURL: typeof window !== 'undefined' ? window.location.origin : '',
      moovToken: null,
      plaidToken: null,
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
    return ["wio-email", "env", "redirect-url", "on-success", "on-error", "open", "api-base-url", "embeddable-key"];
  }

  // ==================== PROPERTY GETTERS/SETTERS ====================

  /**
   * Get the WIO email
   * @returns {string|null}
   */
  get wioEmail() {
    return this._state.wioEmail;
  }

  /**
   * Set the WIO email (triggers initialization)
   * @param {string} value - WIO's email address
   */
  set wioEmail(value) {
    if (this._state.wioEmail !== value) {
      this._state.wioEmail = value;
      this._state.isInitialized = false;

      // Reinitialize if already connected and email is provided
      if (this.isConnected && value && this._state.env) {
        this.initializeMoovDrop();
      }
    }
  }

  /**
   * Get the Plaid environment
   * @returns {string}
   */
  get env() {
    return this._state.env;
  }

  /**
   * Set the Plaid environment (required for Plaid integration)
   * @param {string} value - Plaid environment ('sandbox', 'development', or 'production')
   */
  set env(value) {
    if (this._state.env !== value) {
      this._state.env = value;
      this._state.isInitialized = false;

      // Reinitialize if already connected and both email and env are provided
      if (this.isConnected && this._state.wioEmail && value) {
        this.initializeMoovDrop();
      }
    }
  }

  /**
   * Get the redirect URL
   * @returns {string}
   */
  get redirectURL() {
    return this._state.redirectURL;
  }

  /**
   * Set the redirect URL for Plaid OAuth flow
   * @param {string} value - URL to redirect to after Plaid OAuth
   */
  set redirectURL(value) {
    this._state.redirectURL = value;
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
   * @param {Function} callback - Called when bank account is successfully linked
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
      // Initialize if both wioEmail and env are already set
      if (this._state.wioEmail && this._state.env && !this._state.isInitialized) {
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
      case "wio-email":
        this.wioEmail = newValue;
        break;

      case "env":
        this.env = newValue;
        break;

      case "redirect-url":
        this.redirectURL = newValue;
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
      console.log("WioPayment: Moov SDK already loaded");
      return Promise.resolve();
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="moov.js"]');
    if (existingScript) {
      console.log(
        "WioPayment: Moov SDK script found, waiting for load..."
      );
      return new Promise((resolve, reject) => {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () =>
          reject(new Error("Failed to load Moov SDK"))
        );
      });
    }

    // Load the SDK
    console.log("WioPayment: Loading Moov SDK from CDN...");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.moov.io/v1";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("WioPayment: Moov SDK loaded successfully");
        resolve();
      };

      script.onerror = () => {
        const error = new Error("Failed to load Moov SDK from CDN");
        console.error("WioPayment:", error);
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
   * Initialize the Moov payment methods drop with Plaid integration
   *
   * This method:
   * 1. Validates prerequisites (wioEmail, env, Moov SDK)
   * 2. Generates both Plaid and Moov access tokens
   * 3. Configures the moov-payment-methods element with Plaid settings
   * 4. Sets up success/error callbacks
   */
  async initializeMoovDrop() {
    // 1. Validate prerequisites
    if (!this._state.wioEmail) {
      console.warn("WioPayment: wioEmail is required");
      return;
    }

    if (!this._state.env) {
      console.warn("WioPayment: env is required for Plaid integration");
      return;
    }

    if (!window.Moov) {
      this.handleError({
        errorType: "sdk",
        error: "Moov SDK not loaded. Please include the Moov SDK script.",
      });
      return;
    }

    // 2. Validate API availability
    if (!this.api) {
      this.handleError({
        errorType: "initialization",
        error: "BisonJibPayAPI is not available. Please ensure component.js is loaded first.",
      });
      return;
    }

    try {
      this._state.isLoading = true;

      // 3. Generate Plaid token
      console.log("WioPayment: Generating Plaid token...");
      const plaidTokenResult = await this.api.generatePlaidToken(
        this._state.wioEmail
      );
      this._state.plaidToken = plaidTokenResult.link_token;
      console.log("WioPayment: Plaid token generated successfully");

      // 4. Generate Moov token
      console.log("WioPayment: Generating Moov token...");
      const moovTokenResult = await this.api.generateMoovToken(
        this._state.wioEmail
      );
      this._state.moovToken = moovTokenResult.access_token;
      console.log("WioPayment: Moov token generated successfully");

    } catch (error) {
      this.handleError({
        errorType: "token",
        error: error.message || "Failed to generate tokens",
      });
      return;
    } finally {
      this._state.isLoading = false;
    }

    // 5. Get reference to moov-payment-methods element
    this._moovRef = this.shadowRoot.querySelector("moov-payment-methods");

    if (!this._moovRef) {
      console.error(
        "WioPayment: moov-payment-methods element not found in shadow DOM"
      );
      return;
    }

    // 6. Configure Plaid integration
    this._moovRef.plaid = {
      env: this._state.env,
      redirectURL: this._state.redirectURL,
      token: this._state.plaidToken,
      onSuccess: (moovBankAccount) => {
        console.log("WioPayment: Plaid flow completed successfully", moovBankAccount);
      },
      onExit: (err, metadata) => {
        if (err) {
          console.error("WioPayment: Plaid flow exited with error", err);
          this.handleError({
            errorType: "plaid",
            error: err,
          });
        } else {
          console.log("WioPayment: Plaid flow exited by user", metadata);
        }
      },
      onLoad: () => {
        console.log("WioPayment: Plaid Link resource loaded");
      },
      onProcessorTokenRequest: async (public_token, bank_account_id) => {
        console.log(
          "WioPayment: Generating processor token for bank account",
          bank_account_id
        );

        try {
          const result = await this.api.createProcessorToken(
            public_token,
            bank_account_id
          );
          console.log("WioPayment: Processor token generated successfully");
          return result.processor_token;
        } catch (error) {
          console.error("WioPayment: Failed to create processor token", error);
          this.handleError({
            errorType: "plaid",
            error: "Failed to create processor token",
          });
          throw error;
        }
      },
    };

    // 7. Configure the Moov drop
    this._moovRef.token = this._state.moovToken;
    this._moovRef.accountID = this._state.wioEmail;
    this._moovRef.paymentMethodTypes = ["bankAccount"];
    this._moovRef.showLogo = true;

    // 8. Set up callbacks
    this._moovRef.onResourceCreated = (result) => {
      console.log("WioPayment: Bank account successfully linked", result);

      // Call user's success callback
      if (this._onSuccessCallback) {
        this._onSuccessCallback(result);
      }

      // Auto-close after success
      this.open = false;
    };

    this._moovRef.onError = ({ errorType, error }) => {
      console.error("WioPayment: Moov error", errorType, error);
      this.handleError({ errorType, error });
    };

    // 9. Mark as initialized
    this._state.isInitialized = true;
    console.log("WioPayment: Initialized for", this._state.wioEmail, "with env", this._state.env);
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
    console.error(`WioPayment Error (${errorType}):`, error);

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
customElements.define("wio-payment", WioPayment);

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { WioPayment };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.WioPayment = WioPayment;
}