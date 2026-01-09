/**
 * WioBankAccount Web Component
 *
 * A simple web component that provides a button to directly trigger the Plaid flow
 * and calls the getAccountByEmail API when an email prop is provided.
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from component.js)
 *
 * @example
 * ```html
 * <script src="component.js"></script>
 * <script src="wio-bank-account.js"></script>
 *
 * <wio-bank-account id="linking" email="user@example.com" button-text="Link Bank Account"></wio-bank-account>
 * <script>
 *   const linking = document.getElementById('linking');
 *   linking.addEventListener('plaid-link-success', (e) => {
 *     console.log('Success:', e.detail);
 *   });
 * </script>
 * ```
 */

class WioBankAccount extends HTMLElement {
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
        "WioBankAccount: BisonJibPayAPI is not available. Please ensure component.js is loaded before wio-bank-account.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Internal state
    this._state = {
      email: null,
      buttonText: this.getAttribute("button-text") || "Link Bank Account",
      isLoading: false,
      accountData: null,
      moovAccountId: null,
      error: null,
      plaidLoaded: false,
      plaidLinkToken: null,
      initializationError: false,
      isRefetchingPaymentMethods: false,
    };

    // Render the component
    this.render();
  }

  // ==================== STATIC PROPERTIES ====================

  static get observedAttributes() {
    return ["email", "api-base-url", "embeddable-key", "button-text"];
  }

  // ==================== PROPERTY GETTERS/SETTERS ====================

  get email() {
    return this._state.email;
  }

  get moovAccountId() {
    return this._state.moovAccountId;
  }

  get buttonText() {
    return this._state.buttonText;
  }

  set email(value) {
    console.log("WioBankAccount: Setting email to:", value);
    const oldEmail = this._state.email;
    this._state.email = value;

    const currentAttr = this.getAttribute("email");
    if (currentAttr !== value) {
      if (value) {
        this.setAttribute("email", value);
      } else {
        this.removeAttribute("email");
      }
    }

    if (value && value !== oldEmail && this.isConnected) {
      this.initializeAccount();
    }
  }

  set buttonText(value) {
    const nextValue = value == null ? "" : String(value);
    const oldValue = this._state.buttonText;

    this._state.buttonText = nextValue || "Link Bank Account";

    const currentAttr = this.getAttribute("button-text");
    if (currentAttr !== nextValue) {
      if (nextValue) {
        this.setAttribute("button-text", nextValue);
      } else {
        this.removeAttribute("button-text");
      }
    }

    if (oldValue !== this._state.buttonText) {
      this.updateButtonLabel();
    }
  }

  // ==================== LIFECYCLE METHODS ====================

  connectedCallback() {
    const emailAttr = this.getAttribute("email");
    if (emailAttr && !this._state.email) {
      this._state.email = emailAttr;
    }

    this.ensurePlaidSDK();
    this.setupEventListeners();

    if (this._state.email) {
      this.initializeAccount();
    }
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "email":
        this._state.email = newValue;
        if (newValue && this.isConnected) {
          this.initializeAccount();
        }
        break;

      case "api-base-url":
        this.apiBaseURL = newValue;
        if (this.api) {
          this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        }
        if (this._state.email && this.isConnected) {
          this.initializeAccount();
        }
        break;

      case "embeddable-key":
        this.embeddableKey = newValue;
        if (this.api) {
          this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
        }
        if (this._state.email && this.isConnected) {
          this.initializeAccount();
        }
        break;

      case "button-text":
        this._state.buttonText = newValue || "Link Bank Account";
        this.updateButtonLabel();
        break;
    }
  }

  // ==================== PLAID SDK LOADING ====================

  async ensurePlaidSDK() {
    if (window.Plaid) {
      this._state.plaidLoaded = true;
      return Promise.resolve();
    }

    const existingScript = document.querySelector(
      'script[src*="plaid.com/link"]'
    );
    if (existingScript) {
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

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this._state.plaidLoaded = true;
        resolve();
      };

      script.onerror = () => {
        const error = new Error("Failed to load Plaid SDK from CDN");
        this._state.error = error.message;
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  // ==================== EVENT HANDLING ====================

  setupEventListeners() {
    const button = this.shadowRoot.querySelector(".link-payment-btn");
    if (button) {
      button.addEventListener("click", this.openPlaidLink.bind(this));
    }
  }

  removeEventListeners() {
    // No specific global listeners to remove
  }

  // ==================== INITIALIZATION METHODS ====================

  async initializeAccount() {
    if (!this._state.email) {
      console.warn("WioBankAccount: Email is required for initialization");
      return;
    }

    if (!this.api) {
      console.error(
        "WioBankAccount: BisonJibPayAPI is not available."
      );
      this._state.initializationError = true;
      this.updateMainButtonState();
      return;
    }

    try {
      this._state.isLoading = true;
      this._state.error = null;
      this._state.initializationError = false;

      this.updateMainButtonState();

      const result = await this.api.getAccountByEmail(this._state.email);
      this._state.accountData = result.data;
      this._state.moovAccountId = result.data.moovAccountId || null;

      this.updateMainButtonState();

      await this.initializePlaidToken();
    } catch (error) {
      this._state.isLoading = false;
      this._state.error = error.message || "Failed to fetch account data";
      this._state.initializationError = true;
      console.error("WioBankAccount: Account initialization failed", error);
      this.updateMainButtonState();
    }
  }

  async initializePlaidToken() {
    try {
      const plaidLinkResult = await this.api.generatePlaidToken(
        this._state.email
      );

      if (!plaidLinkResult.success) {
        throw new Error(
          plaidLinkResult.message ||
          "Error occurred while generating Plaid Link token"
        );
      }

      this._state.plaidLinkToken = plaidLinkResult.data.linkToken;
      this._state.isLoading = false;
      this.updateMainButtonState();
    } catch (error) {
      this._state.isLoading = false;
      this._state.error = error.message || "Failed to generate Plaid token";
      this._state.initializationError = true;
      this.updateMainButtonState();
    }
  }

  async openPlaidLink() {
    if (!this._state.plaidLoaded) {
      try {
        await this.ensurePlaidSDK();
      } catch (error) {
        console.error("WioBankAccount: Failed to load Plaid SDK:", error);
        return;
      }
    }

    if (!this._state.plaidLinkToken) {
      console.error("WioBankAccount: Plaid Link token not available");
      return;
    }

    const handler = window.Plaid.create({
      token: this._state.plaidLinkToken,
      onSuccess: async (public_token, metadata) => {
        const moovAccountId = this._state.moovAccountId;

        if (!moovAccountId) {
          console.error("WioBankAccount: Moov Account ID not found");
          return;
        }

        // Show spinner on button while adding account
        this._state.isLoading = true;
        this.updateMainButtonState();

        requestAnimationFrame(async () => {
          try {
            console.log("WioBankAccount: Adding Plaid account to Moov...");

            const result = await this.api.addPlaidAccountToMoov(
              public_token,
              metadata.account_id,
              moovAccountId
            );

            console.log("WioBankAccount: Plaid Link success", result);

            this._state.isLoading = false;
            this.updateMainButtonState();

            this.dispatchEvent(
              new CustomEvent("plaid-link-success", {
                detail: { public_token, metadata, result },
                bubbles: true,
                composed: true,
              })
            );
          } catch (error) {
            console.error(
              "WioBankAccount: Failed to add Plaid account to Moov",
              error
            );

            this._state.isLoading = false;
            this.updateMainButtonState();

            this.dispatchEvent(
              new CustomEvent("plaid-link-error", {
                detail: { error: error.message, metadata },
                bubbles: true,
                composed: true,
              })
            );
          }
        });
      },
      onExit: (err, metadata) => {
        console.log("WioBankAccount: Plaid Link exit", err, metadata);
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
    });

    handler.open();
  }

  updateMainButtonState() {
    const button = this.shadowRoot.querySelector(".link-payment-btn");
    if (!button) return;

    if (this._state.isLoading) {
      button.classList.add("loading");
      button.classList.remove("error");
      button.disabled = true;
    } else if (this._state.initializationError) {
      button.classList.remove("loading");
      button.classList.add("error");
      button.disabled = true;
    } else {
      button.classList.remove("loading");
      button.classList.remove("error");
      button.disabled = false;
    }
  }

  updateButtonLabel() {
    const label = this.shadowRoot.querySelector(".link-payment-label");
    if (label) {
      label.textContent = this._state.buttonText || "Link Bank Account";
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
          color: var(--color-secondary, #5f6e78);
        }
        
        .link-payment-btn {
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
        
        .link-payment-btn:hover:not(.error):not(.loading) {
          background: var(--color-primary-hover, #436c57);
        }
        
        .link-payment-btn:active:not(.error):not(.loading) {
          background: var(--color-primary-active, #3d624f);
          transform: translateY(0);
        }
        
        .link-payment-btn.error {
          background: var(--color-gray-400, #9ca3af);
          cursor: not-allowed;
        }
        
        .link-payment-btn.loading {
          background: var(--color-primary-soft, #678f7a);
          cursor: wait;
        }
        
        .link-payment-btn .loading-spinner {
          display: none;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: var(--color-white, #fff);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          box-sizing: border-box;
        }
        
        .link-payment-btn.loading .loading-spinner {
          display: inline-block;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      </style>

      <button class="link-payment-btn" id="mainButton">
        <span class="loading-spinner"></span>
        <span class="link-payment-label">${this._state.buttonText}</span>
        <svg class="broken-link-icon" style="display:none; width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    `;
  }
}

customElements.define("wio-bank-account", WioBankAccount);
