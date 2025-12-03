/**
 * OperatorManagement Web Component
 *
 * A hybrid web component that dynamically shows either operator-onboarding or
 * operator-underwriting based on whether the operator email exists in the system.
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from api.js)
 * @requires OperatorOnboarding - Must be loaded (from operator-onboarding.js)
 * @requires OperatorUnderwriting - Must be loaded (from operator-underwriting.js)
 *
 * @example
 * ```html
 * <script type="module" src="component.js"></script>
 *
 * <operator-management
 *   operator-email="operator@example.com"
 *   api-base-url="https://api.example.com"
 *   embeddable-key="your-key">
 * </operator-management>
 *
 * <script>
 *   const management = document.querySelector('operator-management');
 *   management.addEventListener('management-mode-determined', (e) => {
 *     console.log('Mode:', e.detail.mode); // 'onboarding' or 'underwriting'
 *   });
 * </script>
 * ```
 */

class OperatorManagement extends HTMLElement {
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
        "OperatorManagement: BisonJibPayAPI is not available. Please ensure api.js is loaded before operator-management.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Internal state
    this._state = {
      operatorEmail: null,
      moovAccountId: null,
      isLoading: false,
      isError: false,
      mode: null, // 'onboarding' | 'underwriting' | null
      error: null,
    };

    // Data to pre-populate the onboarding form
    this._onboardingData = null;

    // Callbacks for onboarding component
    this._onboardingSuccess = null;
    this._onboardingError = null;
    this._onboardingSubmit = null;
    this._onboardingConfirm = null;

    // Render the component
    this.render();
  }

  // ==================== STATIC PROPERTIES ====================

  static get observedAttributes() {
    return ["operator-email", "api-base-url", "embeddable-key"];
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
   * Set the operator email
   * @param {string} value - Operator email address
   */
  set operatorEmail(value) {
    console.log("OperatorManagement: Setting operator email to:", value);

    const oldEmail = this._state.operatorEmail;

    // Update internal state
    this._state.operatorEmail = value;

    // Update attribute only if different to prevent circular updates
    const currentAttr = this.getAttribute("operator-email");
    if (currentAttr !== value) {
      if (value) {
        this.setAttribute("operator-email", value);
      } else {
        this.removeAttribute("operator-email");
      }
    }

    // Trigger check if email changed and component is connected
    if (value && value !== oldEmail && this.isConnected) {
      this.checkOperatorStatus();
    }
  }

  /**
   * Get the moov account ID (if exists)
   * @returns {string|null}
   */
  get moovAccountId() {
    return this._state.moovAccountId;
  }

  /**
   * Get the current mode
   * @returns {string|null} 'onboarding' | 'underwriting' | null
   */
  get mode() {
    return this._state.mode;
  }

  /**
   * Check if currently loading
   * @returns {boolean}
   */
  get isLoading() {
    return this._state.isLoading;
  }

  /**
   * Get the onboarding pre-population data
   * @returns {Object|null}
   */
  get onboardingData() {
    return this._onboardingData;
  }

  /**
   * Set data to pre-populate the onboarding form
   * @param {Object} data - Data object matching operator-onboarding's onLoad format
   * @example
   * management.onboardingData = {
   *   businessDetails: {
   *     businessName: "Acme Corp",
   *     businessEmail: "contact@acme.com",
   *     // ... other business fields
   *   },
   *   representatives: [...],
   *   bankDetails: {...},
   *   underwriting: {...}
   * };
   */
  set onboardingData(data) {
    if (data && typeof data === "object") {
      this._onboardingData = data;

      // If onboarding component already exists, apply data immediately
      const onboarding = this.shadowRoot.querySelector("operator-onboarding");
      if (onboarding) {
        onboarding.onLoad = data;
      }
    } else {
      this._onboardingData = null;
    }
  }

  /**
   * Get the onboarding success callback
   * @returns {Function|null}
   */
  get onboardingSuccess() {
    return this._onboardingSuccess;
  }

  /**
   * Set callback for successful onboarding submission
   * @param {Function} callback - Called with submission data on success
   */
  set onboardingSuccess(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onboardingSuccess = callback;

      // If onboarding component already exists, apply callback immediately
      const onboarding = this.shadowRoot.querySelector("operator-onboarding");
      if (onboarding) {
        onboarding.onSuccess = callback;
      }
    }
  }

  /**
   * Get the onboarding error callback
   * @returns {Function|null}
   */
  get onboardingError() {
    return this._onboardingError;
  }

  /**
   * Set callback for onboarding errors
   * @param {Function} callback - Called with error data on failure
   */
  set onboardingError(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onboardingError = callback;

      // If onboarding component already exists, apply callback immediately
      const onboarding = this.shadowRoot.querySelector("operator-onboarding");
      if (onboarding) {
        onboarding.onError = callback;
      }
    }
  }

  /**
   * Get the onboarding submit callback
   * @returns {Function|null}
   */
  get onboardingSubmit() {
    return this._onboardingSubmit;
  }

  /**
   * Set callback for pre-submission handling
   * @param {Function} callback - Called before form submission
   */
  set onboardingSubmit(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onboardingSubmit = callback;

      // If onboarding component already exists, apply callback immediately
      const onboarding = this.shadowRoot.querySelector("operator-onboarding");
      if (onboarding) {
        onboarding.onSubmit = callback;
      }
    }
  }

  /**
   * Get the onboarding confirm callback
   * @returns {Function|null}
   */
  get onboardingConfirm() {
    return this._onboardingConfirm;
  }

  /**
   * Set callback for when user clicks Done on success screen
   * @param {Function} callback - Called when user confirms successful onboarding
   */
  set onboardingConfirm(callback) {
    if (typeof callback === "function" || callback === null) {
      this._onboardingConfirm = callback;

      // If onboarding component already exists, apply callback immediately
      const onboarding = this.shadowRoot.querySelector("operator-onboarding");
      if (onboarding) {
        onboarding.onConfirm = callback;
      }
    }
  }

  // ==================== LIFECYCLE METHODS ====================

  connectedCallback() {
    // Initialize email from attribute if present
    const emailAttr = this.getAttribute("operator-email");
    if (emailAttr && !this._state.operatorEmail) {
      this._state.operatorEmail = emailAttr;
      // Trigger API call when email is set
      this.checkOperatorStatus();
    }
  }

  disconnectedCallback() {
    // Cleanup if needed
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "operator-email":
        console.log(
          "OperatorManagement: attributeChangedCallback - operator-email:",
          newValue
        );
        this._state.operatorEmail = newValue;
        // Reset state when email changes
        this._state.moovAccountId = null;
        this._state.mode = null;
        this._state.isError = false;
        this._state.error = null;
        // Trigger API call
        if (newValue && this.isConnected) {
          this.checkOperatorStatus();
        } else if (!newValue) {
          this.render();
        }
        break;

      case "api-base-url":
        this.apiBaseURL = newValue;
        if (typeof BisonJibPayAPI !== "undefined") {
          this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        }
        break;

      case "embeddable-key":
        this.embeddableKey = newValue;
        if (typeof BisonJibPayAPI !== "undefined") {
          this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        }
        break;
    }
  }

  // ==================== API INTEGRATION ====================

  /**
   * Check operator status by calling getAccountByEmail API
   * Determines whether to show onboarding or underwriting
   */
  async checkOperatorStatus() {
    // Validate email is set
    if (!this._state.operatorEmail) {
      console.warn("OperatorManagement: Email is required");
      return;
    }

    // Validate API is available
    if (!this.api) {
      console.error(
        "OperatorManagement: BisonJibPayAPI is not available. Please ensure api.js is loaded first."
      );
      this._state.isError = true;
      this._state.error = "API not available";
      this.render();
      return;
    }

    // Set loading state
    this._state.isLoading = true;
    this._state.isError = false;
    this._state.error = null;
    this._state.mode = null;
    this.render();

    try {
      console.log(
        "OperatorManagement: Checking account status for:",
        this._state.operatorEmail
      );

      const response = await this.api.getAccountByEmail(
        this._state.operatorEmail
      );

      // Success: Account exists - show underwriting (keep loading state)
      this._state.moovAccountId =
        response.data?.moovAccountId || response.moovAccountId;
      // Keep isLoading = true, will be set to false when underwriting-ready event fires
      this._state.mode = "underwriting";

      console.log(
        "OperatorManagement: Account exists, showing underwriting. MoovAccountId:",
        this._state.moovAccountId
      );

      // Emit mode determined event
      this.dispatchEvent(
        new CustomEvent("management-mode-determined", {
          detail: {
            mode: "underwriting",
            moovAccountId: this._state.moovAccountId,
            operatorEmail: this._state.operatorEmail,
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      // Failure: Account doesn't exist - show onboarding (stop loading immediately)
      this._state.isLoading = false;
      this._state.moovAccountId = null;
      this._state.mode = "onboarding";

      console.log(
        "OperatorManagement: Account doesn't exist, showing onboarding"
      );

      // Emit mode determined event
      this.dispatchEvent(
        new CustomEvent("management-mode-determined", {
          detail: {
            mode: "onboarding",
            operatorEmail: this._state.operatorEmail,
            error: error.data?.message || error.message,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    this.render();
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
        
        .management-container {
          width: 100%;
        }
        
        .loading-button-container {
          display: inline-block;
        }
        
        .unified-loading-button {
          padding: 12px 24px;
          background: #6b8f7a;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: wait;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          box-sizing: border-box;
        }
        
        .unified-loading-button:disabled {
          cursor: not-allowed;
        }
        
        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          box-sizing: border-box;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 12px;
        }
        
        .empty-icon {
          width: 64px;
          height: 64px;
          color: #9ca3af;
          margin-bottom: 16px;
        }
        
        .empty-text {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }
        
        .empty-subtext {
          font-size: 14px;
          color: #9ca3af;
          margin-top: 8px;
        }
        
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 12px;
        }
        
        .error-icon {
          width: 64px;
          height: 64px;
          color: #ef4444;
          margin-bottom: 16px;
        }
        
        .error-text {
          font-size: 16px;
          color: #991b1b;
          margin: 0;
        }
        
        .error-subtext {
          font-size: 14px;
          color: #dc2626;
          margin-top: 8px;
        }
      </style>
      
      <div class="management-container">
        ${this.renderContent()}
      </div>
    `;

    console.log("OperatorManagement: render() called", {
      mode: this._state.mode,
      isLoading: this._state.isLoading,
      operatorEmail: this._state.operatorEmail,
    });

    // Setup event forwarding after render, with a delay to ensure child components are ready
    setTimeout(() => this.setupEventForwarding(), 0);
  }

  /**
   * Render the appropriate content based on state
   */
  renderContent() {
    // No email provided
    if (!this._state.operatorEmail) {
      return `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <p class="empty-text">No operator email provided</p>
          <p class="empty-subtext">Set the operator-email attribute to get started</p>
        </div>
      `;
    }

    // Error state (API not available)
    if (this._state.isError) {
      return `
        <div class="error-container">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p class="error-text">Unable to check operator status</p>
          <p class="error-subtext">${
            this._state.error || "Please try again later"
          }</p>
        </div>
      `;
    }

    // Show appropriate component based on mode
    if (this._state.mode === "onboarding") {
      return `
        <operator-onboarding
          api-base-url="${this.apiBaseURL}"
          embeddable-key="${this.embeddableKey}">
        </operator-onboarding>
      `;
    }

    if (this._state.mode === "underwriting") {
      // Show loading button overlay while underwriting is initializing
      const loadingOverlay = this._state.isLoading
        ? `
        <div class="loading-button-container">
          <button class="unified-loading-button" disabled>
            <span class="button-spinner"></span>
            Checking operator status...
          </button>
        </div>
      `
        : "";

      return `
        ${loadingOverlay}
        <operator-underwriting
          operator-email="${this._state.operatorEmail}"
          api-base-url="${this.apiBaseURL}"
          embeddable-key="${this.embeddableKey}"
          style="${
            this._state.isLoading
              ? "visibility: hidden; position: absolute;"
              : ""
          }">
        </operator-underwriting>
      `;
    }

    // Loading state - show unified loading button (only if no mode determined yet)
    if (this._state.isLoading) {
      return `
        <div class="loading-button-container">
          <button class="unified-loading-button" disabled>
            <span class="button-spinner"></span>
            Checking operator status...
          </button>
        </div>
      `;
    }

    // Default empty state (shouldn't reach here normally)
    return `
      <div class="empty-state">
        <p class="empty-text">Initializing...</p>
      </div>
    `;
  }

  /**
   * Setup event forwarding from child components
   */
  setupEventForwarding() {
    // Forward onboarding events
    const onboarding = this.shadowRoot.querySelector("operator-onboarding");

    console.log("OperatorManagement: setupEventForwarding called", {
      onboardingFound: !!onboarding,
      hasSuccessCallback: !!this._onboardingSuccess,
      hasErrorCallback: !!this._onboardingError,
      hasSubmitCallback: !!this._onboardingSubmit,
      hasOnboardingData: !!this._onboardingData,
    });

    if (onboarding) {
      // Pre-populate form data if onboardingData was set
      if (this._onboardingData) {
        onboarding.onLoad = this._onboardingData;
      }

      // Apply callbacks if they were set
      if (this._onboardingSuccess) {
        console.log("OperatorManagement: Applying onSuccess callback to onboarding");
        onboarding.onSuccess = this._onboardingSuccess;
      }
      if (this._onboardingError) {
        onboarding.onError = this._onboardingError;
      }
      if (this._onboardingSubmit) {
        onboarding.onSubmit = this._onboardingSubmit;
      }
      if (this._onboardingConfirm) {
        onboarding.onConfirm = this._onboardingConfirm;
      }

      onboarding.addEventListener("formComplete", (e) => {
        this.dispatchEvent(
          new CustomEvent("onboarding-complete", {
            detail: {
              ...e.detail,
              operatorEmail: this._state.operatorEmail,
            },
            bubbles: true,
            composed: true,
          })
        );
        // Note: checkOperatorStatus is now triggered when user clicks "Done" button
      });

      // Listen for confirm button click to re-check status
      onboarding.addEventListener("onboardingConfirmed", (e) => {
        this.dispatchEvent(
          new CustomEvent("onboarding-confirmed", {
            detail: {
              ...e.detail,
              operatorEmail: this._state.operatorEmail,
            },
            bubbles: true,
            composed: true,
          })
        );

        // After user confirms, re-check status to potentially switch to underwriting
        console.log(
          "OperatorManagement: Onboarding confirmed, re-checking status..."
        );
        // Give the backend time to process
        setTimeout(() => this.checkOperatorStatus(), 1000);
      });

      onboarding.addEventListener("submissionFailed", (e) => {
        this.dispatchEvent(
          new CustomEvent("onboarding-failed", {
            detail: e.detail,
            bubbles: true,
            composed: true,
          })
        );
      });
    }

    // Forward underwriting events
    const underwriting = this.shadowRoot.querySelector("operator-underwriting");
    if (underwriting) {
      underwriting.addEventListener("underwriting-ready", (e) => {
        // Hide the unified loading button when underwriting is ready
        this._state.isLoading = false;

        // Just hide the loading overlay and show the underwriting component
        const loadingOverlay = this.shadowRoot.querySelector(
          ".loading-button-container"
        );
        if (loadingOverlay) {
          loadingOverlay.style.display = "none";
        }
        underwriting.style.visibility = "visible";
        underwriting.style.position = "static";

        this.dispatchEvent(
          new CustomEvent("underwriting-ready", {
            detail: e.detail,
            bubbles: true,
            composed: true,
          })
        );
      });

      underwriting.addEventListener("underwriting-error", (e) => {
        // Hide the unified loading button on error too
        this._state.isLoading = false;

        // Just hide the loading overlay and show the underwriting component
        const loadingOverlay = this.shadowRoot.querySelector(
          ".loading-button-container"
        );
        if (loadingOverlay) {
          loadingOverlay.style.display = "none";
        }
        underwriting.style.visibility = "visible";
        underwriting.style.position = "static";

        this.dispatchEvent(
          new CustomEvent("underwriting-error", {
            detail: e.detail,
            bubbles: true,
            composed: true,
          })
        );
      });

      underwriting.addEventListener("underwriting-modal-open", (e) => {
        this.dispatchEvent(
          new CustomEvent("underwriting-modal-open", {
            detail: e.detail,
            bubbles: true,
            composed: true,
          })
        );
      });

      underwriting.addEventListener("underwriting-modal-close", (e) => {
        this.dispatchEvent(
          new CustomEvent("underwriting-modal-close", {
            detail: e.detail,
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }
}

// Register the custom element
customElements.define("operator-management", OperatorManagement);

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { OperatorManagement };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.OperatorManagement = OperatorManagement;
}

// Export for ES6 modules
export { OperatorManagement };
