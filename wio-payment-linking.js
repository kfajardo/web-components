/**
 * WioPaymentLinking Web Component
 *
 * A simple web component that provides a button to open a modal and
 * calls the getAccountByEmail API when an email prop is provided.
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from component.js)
 *
 * @example
 * ```html
 * <script src="component.js"></script>
 * <script src="wio-payment-linking.js"></script>
 *
 * <wio-payment-linking id="linking" email="user@example.com"></wio-payment-linking>
 * <script>
 *   const linking = document.getElementById('linking');
 *   linking.addEventListener('payment-linking-success', (e) => {
 *     console.log('Account data:', e.detail);
 *   });
 *   linking.addEventListener('payment-linking-error', (e) => {
 *     console.error('Error:', e.detail);
 *   });
 * </script>
 * ```
 */

class WioPaymentLinking extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // API Configuration
    this.apiBaseURL =
      this.getAttribute("api-base-url") || "http://localhost:5120";
    this.embeddableKey =
      this.getAttribute("embeddable-key") ||
      "R80WMkbNN8457RofiMYx03DL65P06IaVT30Q2emYJUBQwYCzRC";

    // Check if BisonJibPayAPI is available
    if (typeof BisonJibPayAPI === "undefined") {
      console.error(
        "WioPaymentLinking: BisonJibPayAPI is not available. Please ensure component.js is loaded before wio-payment-linking.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Internal state
    this._state = {
      email: null,
      isOpen: false,
      isLoading: false,
      accountData: null,
      moovAccountId: null,
      error: null,
      plaidLoaded: false,
    };

    // Render the component
    this.render();
  }

  // ==================== STATIC PROPERTIES ====================

  static get observedAttributes() {
    return ["email", "api-base-url", "embeddable-key"];
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
   * Get the moovAccountId
   * @returns {string|null}
   */
  get moovAccountId() {
    return this._state.moovAccountId;
  }

  /**
   * Set the email
   * @param {string} value - Email address
   */
  set email(value) {
    console.log("WioPaymentLinking: Setting email to:", value);

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

    console.log("WioPaymentLinking: Email state after set:", this._state.email);
  }

  /**
   * Get the open state
   * @returns {boolean}
   */
  get isOpen() {
    return this._state.isOpen;
  }

  // ==================== LIFECYCLE METHODS ====================

  connectedCallback() {
    // Initialize email from attribute if present
    const emailAttr = this.getAttribute("email");
    if (emailAttr && !this._state.email) {
      this._state.email = emailAttr;
    }

    // Load Plaid SDK
    this.ensurePlaidSDK();

    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "email":
        console.log(
          "WioPaymentLinking: attributeChangedCallback - email:",
          newValue
        );
        this._state.email = newValue;
        break;

      case "api-base-url":
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

  // ==================== PLAID SDK LOADING ====================

  /**
   * Ensure Plaid SDK is loaded
   *
   * This method dynamically loads the Plaid Link SDK from the CDN if not already present.
   * This eliminates the need for consumers to manually include the script tag.
   *
   * @returns {Promise<void>} Resolves when SDK is ready
   */
  async ensurePlaidSDK() {
    // Check if Plaid is already loaded
    if (window.Plaid) {
      console.log("WioPaymentLinking: Plaid SDK already loaded");
      this._state.plaidLoaded = true;
      return Promise.resolve();
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="plaid.com/link"]'
    );
    if (existingScript) {
      console.log(
        "WioPaymentLinking: Plaid SDK script found, waiting for load..."
      );
      return new Promise((resolve, reject) => {
        existingScript.addEventListener("load", () => {
          this._state.plaidLoaded = true;
          resolve();
        });
        existingScript.addEventListener("error", () =>
          reject(new Error("Failed to load Plaid SDK"))
        );
      });
    }

    // Load the SDK
    console.log("WioPaymentLinking: Loading Plaid SDK from CDN...");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("WioPaymentLinking: Plaid SDK loaded successfully");
        this._state.plaidLoaded = true;
        resolve();
      };

      script.onerror = () => {
        const error = new Error("Failed to load Plaid SDK from CDN");
        console.error("WioPaymentLinking:", error);
        this._state.error = error.message;
        this.dispatchEvent(
          new CustomEvent("payment-linking-error", {
            detail: {
              error: error.message,
              type: "sdk",
            },
            bubbles: true,
            composed: true,
          })
        );
        reject(error);
      };

      // Append to document head
      document.head.appendChild(script);
    });
  }

  // ==================== EVENT HANDLING ====================

  setupEventListeners() {
    const button = this.shadowRoot.querySelector(".link-payment-btn");
    const closeBtn = this.shadowRoot.querySelector(".close-btn");
    const overlay = this.shadowRoot.querySelector(".modal-overlay");

    if (button) {
      button.addEventListener("click", this.handleButtonClick.bind(this));
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", this.closeModal.bind(this));
    }

    if (overlay) {
      overlay.addEventListener("click", this.closeModal.bind(this));
    }

    // ESC key to close modal
    this._escHandler = (e) => {
      if (e.key === "Escape" && this._state.isOpen) {
        this.closeModal();
      }
    };
    document.addEventListener("keydown", this._escHandler);
  }

  removeEventListeners() {
    if (this._escHandler) {
      document.removeEventListener("keydown", this._escHandler);
    }
  }

  /**
   * Handle button click - validate email and open modal
   */
  async handleButtonClick() {
    console.log(
      "WioPaymentLinking: Button clicked, current email state:",
      this._state.email
    );

    // Validate Plaid SDK is loaded
    if (!this._state.plaidLoaded) {
      console.log("WioPaymentLinking: Plaid SDK not loaded yet, waiting...");
      try {
        await this.ensurePlaidSDK();
      } catch (error) {
        console.error("WioPaymentLinking: Failed to load Plaid SDK:", error);
        return;
      }
    }

    // Validate email
    if (!this._state.email) {
      const error = "Email is required to link payment";
      this._state.error = error;
      this.dispatchEvent(
        new CustomEvent("payment-linking-error", {
          detail: { error, type: "validation" },
          bubbles: true,
          composed: true,
        })
      );
      console.warn("WioPaymentLinking:", error);
      return;
    }

    // Validate API availability
    if (!this.api) {
      const error =
        "BisonJibPayAPI is not available. Please ensure component.js is loaded first.";
      this._state.error = error;
      this.dispatchEvent(
        new CustomEvent("payment-linking-error", {
          detail: { error, type: "initialization" },
          bubbles: true,
          composed: true,
        })
      );
      console.error("WioPaymentLinking:", error);
      return;
    }

    // Open modal
    this.openModal();

    // Call API
    await this.callAPI();
  }

  /**
   * Open the modal
   */
  openModal() {
    this._state.isOpen = true;
    const modal = this.shadowRoot.querySelector(".modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }

  /**
   * Close the modal
   */
  closeModal() {
    this._state.isOpen = false;
    this._state.isLoading = false;
    const modal = this.shadowRoot.querySelector(".modal");
    if (modal) {
      modal.style.display = "none";
    }

    // Dispatch close event
    this.dispatchEvent(
      new CustomEvent("payment-linking-close", {
        detail: {
          moovAccountId: this._state.moovAccountId,
          accountData: this._state.accountData,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Call the getAccountByEmail API
   */
  async callAPI() {
    try {
      this._state.isLoading = true;
      this._state.error = null;

      console.log(
        "WioPaymentLinking: Calling getAccountByEmail for",
        this._state.email
      );

      const result = await this.api.getAccountByEmail(this._state.email);
      this._state.accountData = result.data;
      this._state.moovAccountId = result.data.moovAccountId || null;
      this._state.isLoading = false;

      console.log("WioPaymentLinking: API call successful", result.data);
      console.log(
        "WioPaymentLinking: Stored moovAccountId:",
        this._state.moovAccountId
      );

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent("payment-linking-success", {
          detail: {
            ...result.data,
            moovAccountId: this._state.moovAccountId,
          },
          bubbles: true,
          composed: true,
        })
      );

      // Generate Plaid Link token
      console.log("WioPaymentLinking: Generating Plaid Link token...");
      const plaidLinkResult = await this.api.generatePlaidToken(
        this._state.email
      );

      if (!plaidLinkResult.success) {
        throw new Error(
          plaidLinkResult.message ||
            "Error occurred while generating Plaid Link token"
        );
      }

      const plaidLinkToken = plaidLinkResult.data.linkToken;
      console.log("WioPaymentLinking: Plaid Link token generated successfully");

      // Initialize Plaid Link
      const handler = window.Plaid.create({
        token: plaidLinkToken,
        onSuccess: (public_token, metadata) => {
          console.log("WioPaymentLinking: Plaid Link success", metadata);
          this.dispatchEvent(
            new CustomEvent("plaid-link-success", {
              detail: { public_token, metadata },
              bubbles: true,
              composed: true,
            })
          );
        },
        onExit: (err, metadata) => {
          console.log("WioPaymentLinking: Plaid Link exit", err, metadata);
          if (err) {
            this.dispatchEvent(
              new CustomEvent("plaid-link-error", {
                detail: { error: err, metadata },
                bubbles: true,
                composed: true,
              })
            );
          }
        },
        onEvent: (eventName, metadata) => {
          console.log(
            "WioPaymentLinking: Plaid Link event",
            eventName,
            metadata
          );
        },
      });

      // Open Plaid Link
      handler.open();
    } catch (error) {
      this._state.isLoading = false;
      this._state.error = error.message || "Failed to fetch account data";

      console.error("WioPaymentLinking: API call failed", error);

      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent("payment-linking-error", {
          detail: {
            error: this._state.error,
            type: "api",
            originalError: error,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  // ==================== RENDERING ====================

  /**
   * Render the component (Shadow DOM)
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .link-payment-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .link-payment-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        
        .link-payment-btn:active {
          transform: translateY(0);
        }
        
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          align-items: center;
          justify-content: center;
        }
        
        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          min-height: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 10001;
        }
        
        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 28px;
          color: #999;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .close-btn:hover {
          background: #f0f0f0;
          color: #333;
        }
      </style>
      
      <!-- Button -->
      <button class="link-payment-btn">Link Payment</button>
      
      <!-- Modal -->
      <div class="modal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <button class="close-btn">×</button>
          <!-- Empty modal content - ready for future implementation -->
        </div>
      </div>
    `;
  }
}

// Register the custom element
customElements.define("wio-payment-linking", WioPaymentLinking);

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { WioPaymentLinking };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.WioPaymentLinking = WioPaymentLinking;
}
