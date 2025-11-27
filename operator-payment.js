/**
 * OperatorPayment Web Component
 *
 * A web component for operator payment management with a consistent UI.
 * Provides a button to open a modal with payment methods management,
 * using Moov for the underlying payment infrastructure.
 *
 * @author @kfajardo
 * @version 2.0.0
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from component.js)
 *
 * @example
 * ```html
 * <script src="component.js"></script>
 * <script src="operator-payment.js"></script>
 *
 * <operator-payment id="payment" operator-email="operator@example.com"></operator-payment>
 * <script>
 *   const payment = document.getElementById('payment');
 *   payment.addEventListener('payment-linking-success', (e) => {
 *     console.log('Account data:', e.detail);
 *   });
 *   payment.addEventListener('payment-linking-error', (e) => {
 *     console.error('Error:', e.detail);
 *   });
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
        "OperatorPayment: BisonJibPayAPI is not available. Please ensure component.js is loaded before operator-payment.js"
      );
      this.api = null;
    } else {
      this.api = new BisonJibPayAPI(this.apiBaseURL, this.embeddableKey);
    }

    // Internal state
    this._state = {
      operatorEmail: null,
      isOpen: false,
      isLoading: false,
      accountData: null,
      moovAccountId: null,
      moovToken: null,
      error: null,
      initializationError: false,
      // Mock bank accounts data (will be replaced with real data from Moov)
      bankAccounts: [
        {
          id: "1",
          bankName: "Chase Bank",
          holderName: "Operator Business",
          bankAccountType: "checking",
          lastFourAccountNumber: "4532",
          status: "verified",
        },
        {
          id: "2",
          bankName: "Bank of America",
          holderName: "Operator Business",
          bankAccountType: "savings",
          lastFourAccountNumber: "7891",
          status: "pending",
        },
      ],
    };

    // Moov drop reference
    this._moovRef = null;

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
   * Get the moovAccountId
   * @returns {string|null}
   */
  get moovAccountId() {
    return this._state.moovAccountId;
  }

  /**
   * Set the operator email
   * @param {string} value - Operator email address
   */
  set operatorEmail(value) {
    console.log("OperatorPayment: Setting operator email to:", value);

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

    console.log(
      "OperatorPayment: Email state after set:",
      this._state.operatorEmail
    );

    // Trigger initialization if email changed and component is connected
    if (value && value !== oldEmail && this.isConnected) {
      this.initializeAccount();
    }
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
    const emailAttr = this.getAttribute("operator-email");
    if (emailAttr && !this._state.operatorEmail) {
      this._state.operatorEmail = emailAttr;
    }

    // Load Moov SDK (preload for faster access later)
    this.ensureMoovSDK();

    this.setupEventListeners();

    // No longer auto-initialize - token generation is deferred to when "Add Bank Account" is clicked
    // This prevents the button from being disabled due to API errors during page load
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "operator-email":
        console.log(
          "OperatorPayment: attributeChangedCallback - operator-email:",
          newValue
        );
        this._state.operatorEmail = newValue;
        // Clear any existing token when email changes (new email = new account)
        this._state.moovToken = null;
        this._state.moovAccountId = null;
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

  // ==================== MOOV SDK LOADING ====================

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
        existingScript.addEventListener("load", () => {
          console.log("OperatorPayment: Moov SDK loaded from existing script");
          resolve();
        });
        existingScript.addEventListener("error", () =>
          reject(new Error("Failed to load Moov SDK"))
        );
      });
    }

    // Load the SDK
    console.log("OperatorPayment: Loading Moov SDK from CDN...");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.moov.io/v1";
      script.crossOrigin = "anonymous";
      script.async = true;

      script.onload = () => {
        console.log("OperatorPayment: Moov SDK loaded successfully");
        resolve();
      };

      script.onerror = () => {
        const error = new Error("Failed to load Moov SDK from CDN");
        console.error("OperatorPayment:", error);
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
    const addBankBtn = this.shadowRoot.querySelector(".add-bank-btn");

    if (button) {
      button.addEventListener("click", this.handleButtonClick.bind(this));
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", this.closeModal.bind(this));
    }

    if (overlay) {
      overlay.addEventListener("click", this.closeModal.bind(this));
    }

    if (addBankBtn) {
      addBankBtn.addEventListener("click", this.openMoovDrop.bind(this));
    }

    // Setup menu event listeners
    this.setupMenuListeners();

    // ESC key to close modal
    this._escHandler = (e) => {
      if (e.key === "Escape" && this._state.isOpen) {
        this.closeModal();
      }
    };
    document.addEventListener("keydown", this._escHandler);

    // Click outside to close menu dropdowns
    this._outsideClickHandler = (e) => {
      const menus = this.shadowRoot.querySelectorAll(".menu-dropdown.open");
      menus.forEach((menu) => {
        const menuContainer = menu.closest(".menu-container");
        if (menuContainer && !menuContainer.contains(e.target)) {
          menu.classList.remove("open");
        }
      });
    };
    this.shadowRoot.addEventListener("click", this._outsideClickHandler);
  }

  /**
   * Setup event listeners for menu buttons
   */
  setupMenuListeners() {
    const menuBtns = this.shadowRoot.querySelectorAll(".menu-btn");
    const deleteItems = this.shadowRoot.querySelectorAll(
      '.menu-item[data-action="delete"]'
    );
    const setDefaultItems = this.shadowRoot.querySelectorAll(
      '.menu-item[data-action="set-default"]'
    );

    menuBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const accountId = btn.dataset.accountId;
        this.toggleMenu(accountId);
      });
    });

    deleteItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const accountId = item.dataset.accountId;
        this.handleDeleteAccount(accountId);
      });
    });

    setDefaultItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const accountId = item.dataset.accountId;
        this.handleSetDefault(accountId);
      });
    });
  }

  /**
   * Toggle menu dropdown visibility
   * @param {string} accountId - Account ID to toggle menu for
   */
  toggleMenu(accountId) {
    // Close all other menus first
    const allMenus = this.shadowRoot.querySelectorAll(".menu-dropdown");
    allMenus.forEach((menu) => {
      if (menu.dataset.menuId !== accountId) {
        menu.classList.remove("open");
      }
    });

    // Toggle the target menu
    const targetMenu = this.shadowRoot.querySelector(
      `.menu-dropdown[data-menu-id="${accountId}"]`
    );
    if (targetMenu) {
      const isOpening = !targetMenu.classList.contains("open");
      targetMenu.classList.toggle("open");

      // Position the menu when opening
      if (isOpening) {
        const menuBtn = this.shadowRoot.querySelector(
          `.menu-btn[data-account-id="${accountId}"]`
        );
        if (menuBtn) {
          const rect = menuBtn.getBoundingClientRect();
          targetMenu.style.top = `${rect.bottom + 4}px`;
          targetMenu.style.right = `${window.innerWidth - rect.right}px`;
        }
      }
    }
  }

  /**
   * Handle delete account action
   * @param {string} accountId - Account ID to delete
   */
  handleDeleteAccount(accountId) {
    console.log("OperatorPayment: Delete account requested for:", accountId);

    // Close the menu
    const menu = this.shadowRoot.querySelector(
      `.menu-dropdown[data-menu-id="${accountId}"]`
    );
    if (menu) {
      menu.classList.remove("open");
    }

    // Dispatch delete event for consumer to handle
    this.dispatchEvent(
      new CustomEvent("payment-method-delete", {
        detail: {
          accountId,
          account: this._state.bankAccounts.find((a) => a.id === accountId),
        },
        bubbles: true,
        composed: true,
      })
    );

    // For demo purposes, remove from local state
    // In production, this would call Moov API to delete the payment method
    this._state.bankAccounts = this._state.bankAccounts.filter(
      (a) => a.id !== accountId
    );
    this.updateBankAccountsList();
  }

  /**
   * Handle set default account action
   * @param {string} accountId - Account ID to set as default
   */
  handleSetDefault(accountId) {
    console.log("OperatorPayment: Set default requested for:", accountId);

    // Close the menu
    const menu = this.shadowRoot.querySelector(
      `.menu-dropdown[data-menu-id="${accountId}"]`
    );
    if (menu) {
      menu.classList.remove("open");
    }

    // Find the account and move it to the first position
    const accountIndex = this._state.bankAccounts.findIndex(
      (a) => a.id === accountId
    );
    if (accountIndex > 0) {
      const account = this._state.bankAccounts.splice(accountIndex, 1)[0];
      this._state.bankAccounts.unshift(account);
    }

    // Dispatch set default event for consumer to handle
    this.dispatchEvent(
      new CustomEvent("payment-method-set-default", {
        detail: {
          accountId,
          account: this._state.bankAccounts.find((a) => a.id === accountId),
        },
        bubbles: true,
        composed: true,
      })
    );

    // Update the UI
    this.updateBankAccountsList();
  }

  /**
   * Update the bank accounts list in the DOM
   */
  updateBankAccountsList() {
    const container = this.shadowRoot.querySelector("#bankAccountsList");
    if (container) {
      container.innerHTML = this.renderBankAccounts();
      this.setupMenuListeners();
    }
  }

  removeEventListeners() {
    if (this._escHandler) {
      document.removeEventListener("keydown", this._escHandler);
    }
  }

  /**
   * Handle button click - just open modal
   * Token generation is deferred to when "Add Bank Account" is clicked
   */
  handleButtonClick() {
    console.log(
      "OperatorPayment: Button clicked, current email state:",
      this._state.operatorEmail
    );

    // Validate email is set before opening modal
    if (!this._state.operatorEmail) {
      console.warn(
        "OperatorPayment: Cannot open modal - operator email is not set"
      );
      this.dispatchEvent(
        new CustomEvent("payment-linking-error", {
          detail: { error: "Operator email is required", type: "validation" },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    // Validate API is available
    if (!this.api) {
      console.warn("OperatorPayment: Cannot open modal - API is not available");
      this.dispatchEvent(
        new CustomEvent("payment-linking-error", {
          detail: {
            error: "BisonJibPayAPI is not available",
            type: "initialization",
          },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    // Open modal
    this.openModal();
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

  // ==================== INITIALIZATION METHODS ====================

  /**
   * Initialize account - validates email is set (no longer auto-generates token)
   * Token generation is deferred to when "Add Bank Account" is clicked
   */
  async initializeAccount() {
    // Validate email
    if (!this._state.operatorEmail) {
      console.warn("OperatorPayment: Email is required for initialization");
      return;
    }

    // Validate API availability
    if (!this.api) {
      console.error(
        "OperatorPayment: BisonJibPayAPI is not available. Please ensure component.js is loaded first."
      );
      this._state.initializationError = true;
      this.updateMainButtonState();
      return;
    }

    // Email is set and API is available - button should be enabled
    // Token generation is deferred to openMoovDrop for lazy initialization
    console.log(
      "OperatorPayment: Account ready for",
      this._state.operatorEmail
    );

    this._state.isLoading = false;
    this._state.initializationError = false;
    this.updateMainButtonState();

    // Dispatch ready event
    this.dispatchEvent(
      new CustomEvent("payment-linking-ready", {
        detail: {
          operatorEmail: this._state.operatorEmail,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Initialize Moov token - generates access token for Moov API
   * Called lazily when "Add Bank Account" is clicked
   * @returns {Promise<boolean>} True if token was generated successfully
   */
  async initializeMoovToken() {
    // If we already have a token, return true
    if (this._state.moovToken) {
      console.log("OperatorPayment: Using existing Moov token");
      return true;
    }

    try {
      console.log("OperatorPayment: Generating Moov token...");
      const tokenResult = await this.api.generateMoovToken(
        this._state.operatorEmail
      );

      if (!tokenResult || !tokenResult.access_token) {
        throw new Error("Failed to generate Moov token");
      }

      this._state.moovToken = tokenResult.access_token;
      this._state.moovAccountId = tokenResult.accountID || null;
      console.log("OperatorPayment: Moov token generated successfully");

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent("payment-linking-success", {
          detail: {
            moovAccountId: this._state.moovAccountId,
            hasToken: true,
          },
          bubbles: true,
          composed: true,
        })
      );

      return true;
    } catch (error) {
      this._state.error = error.message || "Failed to generate Moov token";

      console.error("OperatorPayment: Moov token generation failed", error);

      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent("payment-linking-error", {
          detail: {
            error: this._state.error,
            type: "token",
            originalError: error,
          },
          bubbles: true,
          composed: true,
        })
      );

      return false;
    }
  }

  /**
   * Open Moov Drop - triggered by Add Bank Account button click
   */
  async openMoovDrop() {
    // Ensure Moov SDK is loaded
    if (!window.Moov) {
      console.log("OperatorPayment: Moov SDK not loaded yet, waiting...");
      try {
        await this.ensureMoovSDK();
      } catch (error) {
        console.error("OperatorPayment: Failed to load Moov SDK:", error);
        return;
      }
    }

    // Lazy initialization: Generate token if not already available
    if (!this._state.moovToken) {
      console.log("OperatorPayment: Generating Moov token on demand...");
      const success = await this.initializeMoovToken();
      if (!success) {
        console.error("OperatorPayment: Failed to generate Moov token");
        return;
      }
    }

    console.log("OperatorPayment: Opening Moov payment methods drop...");

    // Get or create the moov-payment-methods element
    let moovDrop = this.shadowRoot.querySelector("moov-payment-methods");
    if (!moovDrop) {
      moovDrop = document.createElement("moov-payment-methods");
      this.shadowRoot.appendChild(moovDrop);
    }

    // Configure the Moov drop
    moovDrop.token = this._state.moovToken;
    moovDrop.accountID = this._state.moovAccountId;
    moovDrop.microDeposits = false;

    // Set up callbacks
    moovDrop.onResourceCreated = (result) => {
      console.log("OperatorPayment: Payment method successfully added", result);

      // Add to local bank accounts list
      const newAccount = {
        id: result.paymentMethodID || Date.now().toString(),
        bankName: result.bankName || "Bank Account",
        holderName: result.holderName || "Account Holder",
        bankAccountType: result.bankAccountType || "checking",
        lastFourAccountNumber: result.lastFourAccountNumber || "****",
        status: result.status || "pending",
      };
      this._state.bankAccounts.push(newAccount);
      this.updateBankAccountsList();

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent("moov-link-success", {
          detail: result,
          bubbles: true,
          composed: true,
        })
      );

      // Close the Moov drop
      moovDrop.open = false;
    };

    moovDrop.onError = ({ errorType, error }) => {
      console.error("OperatorPayment: Moov error", errorType, error);
      this.dispatchEvent(
        new CustomEvent("moov-link-error", {
          detail: { errorType, error },
          bubbles: true,
          composed: true,
        })
      );
    };

    // Open the Moov drop
    moovDrop.open = true;
  }

  /**
   * Update main button state
   * With lazy initialization, the button is always enabled if email and API are available
   */
  updateMainButtonState() {
    const button = this.shadowRoot.querySelector(".link-payment-btn");
    const wrapper = this.shadowRoot.querySelector(".btn-wrapper");
    if (!button) return;

    // Button is disabled only if API is not available
    const apiUnavailable = !this.api;

    if (apiUnavailable) {
      button.classList.add("error");
      button.disabled = true;
      if (wrapper) wrapper.classList.add("has-error");
    } else {
      button.classList.remove("loading");
      button.classList.remove("error");
      button.disabled = false;
      if (wrapper) wrapper.classList.remove("has-error");
    }
  }

  // ==================== RENDERING ====================

  /**
   * Get account type label
   * @param {string} type - Account type (checking/savings)
   * @returns {string} Formatted label
   */
  getAccountTypeLabel(type) {
    const labels = {
      checking: "Checking",
      savings: "Savings",
    };
    return labels[type] || type;
  }

  /**
   * Mask account number
   * @param {string} lastFour - Last 4 digits of account number
   * @returns {string} Masked account number
   */
  maskAccountNumber(lastFour) {
    return `••••${lastFour}`;
  }

  /**
   * Render bank account cards
   * @returns {string} HTML string for bank accounts
   */
  renderBankAccounts() {
    const accounts = this._state.bankAccounts || [];

    if (accounts.length === 0) {
      return `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="10" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M12 3L2 10h20L12 3z"></path>
          </svg>
          <p>No bank accounts linked yet</p>
        </div>
      `;
    }

    return accounts
      .map(
        (account, index) => `
      <div class="bank-account-card" data-account-id="${account.id}">
        <div class="bank-account-info">
          <div class="bank-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="10" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M12 3L2 10h20L12 3z"></path>
              <line x1="12" y1="14" x2="12" y2="17"></line>
              <line x1="7" y1="14" x2="7" y2="17"></line>
              <line x1="17" y1="14" x2="17" y2="17"></line>
            </svg>
          </div>
          <div class="bank-account-details">
            <div class="bank-name-row">
              <span class="bank-name">${account.bankName}</span>
              ${
                account.status === "verified"
                  ? `
                <svg class="verified-icon" viewBox="0 0 24 24" fill="#10b981" stroke="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              `
                  : ""
              }
            </div>
            <span class="holder-name">${account.holderName}</span>
            <span class="account-meta">${this.getAccountTypeLabel(
              account.bankAccountType
            )} • ${this.maskAccountNumber(account.lastFourAccountNumber)}</span>
          </div>
        </div>
        <div class="card-actions">
          ${
            index === 0
              ? `<span class="status-badge verified">Ready</span>`
              : `<span class="status-badge ${account.status}">${account.status}</span>`
          }
          <div class="menu-container">
            <button class="menu-btn" data-account-id="${
              account.id
            }" aria-label="More options">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
              </svg>
            </button>
            <div class="menu-dropdown" data-menu-id="${account.id}">
              ${
                index !== 0
                  ? `
              <button class="menu-item" data-action="set-default" data-account-id="${account.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Set as default
              </button>
              `
                  : ""
              }
              <button class="menu-item danger" data-action="delete" data-account-id="${
                account.id
              }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

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
          background: #325240;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .link-payment-btn:hover:not(.error):not(.loading) {
          background: #2a4536;
        }
        
        .link-payment-btn:active:not(.error):not(.loading) {
          background: #1e3328;
        }
        
        .link-payment-btn.error {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .link-payment-btn.loading {
          background: #6b8f7a;
          cursor: wait;
        }
        
        .link-payment-btn .broken-link-icon {
          display: none;
        }
        
        .link-payment-btn.error .broken-link-icon {
          display: inline-block;
        }
        
        .link-payment-btn .loading-spinner {
          display: none;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .link-payment-btn.loading .loading-spinner {
          display: inline-block;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .btn-wrapper {
          position: relative;
          display: inline-block;
        }
        
        .tooltip {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #374151;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          white-space: nowrap;
          margin-bottom: 8px;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          z-index: 10002;
        }
        
        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #374151;
        }
        
        .btn-wrapper:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }
        
        .btn-wrapper:not(.has-error) .tooltip {
          display: none;
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
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
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
        
        .add-bank-btn {
          padding: 12px 24px;
          background: #325240;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        
        .add-bank-btn:hover {
          background: #2a4536;
        }
        
        .add-bank-btn:active {
          background: #1e3328;
        }
        
        .add-bank-btn .bank-icon {
          width: 20px;
          height: 20px;
        }
        
        .modal-header {
          width: 100%;
          text-align: center;
          margin-bottom: var(--spacing-lg, 24px);
          padding-bottom: var(--spacing-md, 16px);
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        
        .modal-header p {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        
        .bank-accounts-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .bank-account-card {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .bank-account-card:hover {
          border-color: #325240;
          background: #f3f4f6;
        }
        
        .bank-account-info {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .bank-icon-wrapper {
          padding: 10px;
          background: rgba(50, 82, 64, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .bank-icon-wrapper svg {
          width: 20px;
          height: 20px;
          color: #325240;
          stroke: #325240;
        }
        
        .bank-account-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .bank-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .bank-name {
          font-weight: 500;
          font-size: 15px;
          color: #1f2937;
        }
        
        .verified-icon {
          width: 16px;
          height: 16px;
          color: #10b981;
        }
        
        .holder-name {
          font-size: 14px;
          color: #6b7280;
          text-align: left;
        }
        
        .account-meta {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
          text-align: left;
        }
        
        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .status-badge.verified {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .menu-container {
          position: relative;
        }
        
        .menu-btn {
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }
        
        .menu-btn:hover {
          background: #e5e7eb;
        }
        
        .menu-btn svg {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }
        
        .menu-dropdown {
          position: fixed;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 150px;
          z-index: 10100;
          display: none;
          overflow: hidden;
        }
        
        .menu-dropdown.open {
          display: block;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: background 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        
        .menu-item:hover {
          background: #f3f4f6;
        }
        
        .menu-item.danger {
          color: #dc2626;
        }
        
        .menu-item.danger:hover {
          background: #fef2f2;
        }
        
        .menu-item svg {
          width: 16px;
          height: 16px;
        }
        
        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: #6b7280;
        }
        
        .empty-state-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          color: #d1d5db;
        }
        
        .empty-state p {
          font-size: 14px;
          margin: 0;
        }
        
        .divider {
          width: 100%;
          height: 1px;
          background: #e5e7eb;
          margin: 16px 0;
        }
        
        .add-bank-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .add-bank-section p {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }
        
        .powered-by {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          padding-top: 16px;
          font-size: 11px;
          color: #9ca3af;
        }
        
        .powered-by svg {
          width: 16px;
          height: 16px;
        }
        
        .powered-by span {
          font-weight: 500;
          color: #6b7280;
        }
        
        /* Hide the Moov drop by default, it will be shown when "Add Bank" is clicked */
        moov-payment-methods {
          display: none;
        }
      </style>
      
      <!-- Main Button -->
      <div class="btn-wrapper">
        <span class="tooltip">Operator is not integrated to the Bison system</span>
        <button class="link-payment-btn">
          <span class="loading-spinner"></span>
          <svg class="broken-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
          Manage Payments
        </button>
      </div>
      
      <!-- Modal -->
      <div class="modal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <button class="close-btn">×</button>
          
          <!-- Modal Header -->
          <div class="modal-header">
            <h2>Payment Methods</h2>
            <p>Manage your operator payment accounts</p>
          </div>
          
          <!-- Bank Accounts List -->
          <div class="bank-accounts-list" id="bankAccountsList">
            ${this.renderBankAccounts()}
          </div>
          
          <!-- Divider -->
          <div class="divider"></div>
          
          <!-- Add Bank Section -->
          <div class="add-bank-section">
            <button class="add-bank-btn">
              <svg class="bank-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Bank Account
            </button>
            <p>Connect a new bank account via Moov</p>
          </div>
          
          <!-- Powered by Bison -->
          <div class="powered-by">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Powered by <span>Bison</span>
          </div>
        </div>
      </div>
      
      <!-- Hidden Moov payment methods drop (will be shown when Add Bank is clicked) -->
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
