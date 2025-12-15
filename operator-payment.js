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
      // Payment methods from API
      bankAccounts: [],
      isLoadingPaymentMethods: false,
      paymentMethodsError: null,
      // Delete confirmation modal
      deleteConfirmation: {
        isOpen: false,
        accountId: null,
        account: null,
        isDeleting: false,
      },
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

  /**
   * Refresh the component by re-checking operator status
   * Useful after onboarding is complete to enable the payment button
   * @returns {Promise<void>}
   */
  async refresh() {
    console.log("OperatorPayment: Refreshing component...");

    // Reset error state
    this._state.error = null;
    this._state.initializationError = false;

    // Re-initialize account if email is set
    if (this._state.operatorEmail) {
      await this.initializeAccount();
    }
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

    // Auto-initialize if email is already set to fetch and cache moovAccountId
    if (this._state.operatorEmail) {
      this.initializeAccount();
    }
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
   * Inject Moov Bison theme styles into document body (sibling to moov-payment-methods)
   * This ensures Moov Drops components use the Bison theme
   */
  injectMoovThemeStyles() {
    if (document.getElementById("moov-bison-theme")) {
      return; // Already injected
    }

    const styleTag = document.createElement("style");
    styleTag.id = "moov-bison-theme";
    styleTag.textContent = `
      :root {
        --moov-color-background: #FFFFFF;
        --moov-color-background-secondary: #F9FAFB;
        --moov-color-background-tertiary: #F3F4F6;
        --moov-color-primary: #325240;
        --moov-color-secondary: #2a4536;
        --moov-color-tertiary: #E5E7EB;
        --moov-color-info: #3B82F6;
        --moov-color-warn: #F59E0B;
        --moov-color-danger: #EF4444;
        --moov-color-success: #10B981;
        --moov-color-low-contrast: #9CA3AF;
        --moov-color-medium-contrast: #4B5563;
        --moov-color-high-contrast: #111827;
        --moov-color-graphic-1: #325240;
        --moov-color-graphic-2: #6B7280;
        --moov-color-graphic-3: #3B82F6;
        --moov-radius-small: 8px;
        --moov-radius-large: 12px;
      }
    `;
    // Append to body as sibling to moov-payment-methods
    document.body.appendChild(styleTag);
    console.log("OperatorPayment: Bison theme styles injected");
  }

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
      // script.crossOrigin = "anonymous";
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

    // Setup delete button event listeners
    this.setupMenuListeners();

    // ESC key to close modal
    this._escHandler = (e) => {
      if (e.key === "Escape" && this._state.isOpen) {
        this.closeModal();
      }
    };
    document.addEventListener("keydown", this._escHandler);
  }

  /**
   * Setup event listeners for delete buttons
   */
  setupMenuListeners() {
    const deleteBtns = this.shadowRoot.querySelectorAll(".delete-btn");

    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const accountId = btn.dataset.accountId;
        this.handleDeleteAccount(accountId);
      });
    });
  }

  /**
   * Handle delete account action - shows confirmation modal
   * @param {string} accountId - Account ID to delete
   */
  handleDeleteAccount(accountId) {
    console.log("OperatorPayment: Delete account requested for:", accountId);

    // Find the account to get details for the confirmation modal
    const account = this._state.bankAccounts.find((a) => a.id === accountId);

    // Show confirmation modal
    this._state.deleteConfirmation = {
      isOpen: true,
      accountId,
      account,
      isDeleting: false,
    };
    this.updateDeleteConfirmationModal();
  }

  /**
   * Cancel delete operation
   */
  cancelDelete() {
    this._state.deleteConfirmation = {
      isOpen: false,
      accountId: null,
      account: null,
      isDeleting: false,
    };
    this.updateDeleteConfirmationModal();
  }

  /**
   * Confirm and execute delete operation
   */
  async confirmDelete() {
    const { accountId, account } = this._state.deleteConfirmation;

    if (!accountId) {
      console.warn("OperatorPayment: No account ID for deletion");
      return;
    }

    // Set deleting state
    this._state.deleteConfirmation.isDeleting = true;
    this.updateDeleteConfirmationModal();

    // Dispatch delete event for consumer to handle
    this.dispatchEvent(
      new CustomEvent("payment-method-delete", {
        detail: {
          accountId,
          account,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Call the API to delete the payment method
    // Use cached moovAccountId to avoid extra API call
    if (this.api && this._state.moovAccountId) {
      try {
        console.log("OperatorPayment: Deleting payment method via API...");
        await this.api.deletePaymentMethodByAccountId(
          this._state.moovAccountId,
          accountId
        );
        console.log("OperatorPayment: Payment method deleted successfully");

        // Remove from local state after successful API call
        this._state.bankAccounts = this._state.bankAccounts.filter(
          (a) => a.id !== accountId
        );

        // Close confirmation modal
        this._state.deleteConfirmation = {
          isOpen: false,
          accountId: null,
          account: null,
          isDeleting: false,
        };

        this.updateBankAccountsList();
        this.updateDeleteConfirmationModal();

        // Dispatch success event
        this.dispatchEvent(
          new CustomEvent("payment-method-deleted", {
            detail: {
              accountId,
              account,
            },
            bubbles: true,
            composed: true,
          })
        );
      } catch (error) {
        console.error(
          "OperatorPayment: Failed to delete payment method",
          error
        );

        // Reset deleting state but keep modal open
        this._state.deleteConfirmation.isDeleting = false;
        this.updateDeleteConfirmationModal();

        // Dispatch error event
        this.dispatchEvent(
          new CustomEvent("payment-method-delete-error", {
            detail: {
              accountId,
              account,
              error:
                error.data?.message ||
                error.message ||
                "Failed to delete payment method",
            },
            bubbles: true,
            composed: true,
          })
        );
      }
    } else if (this.api && this._state.operatorEmail) {
      // Fallback to email-based method if moovAccountId is not cached
      try {
        console.log(
          "OperatorPayment: Deleting payment method via API (using email)..."
        );
        await this.api.deletePaymentMethodById(
          this._state.operatorEmail,
          accountId
        );
        console.log("OperatorPayment: Payment method deleted successfully");

        // Remove from local state after successful API call
        this._state.bankAccounts = this._state.bankAccounts.filter(
          (a) => a.id !== accountId
        );

        // Close confirmation modal
        this._state.deleteConfirmation = {
          isOpen: false,
          accountId: null,
          account: null,
          isDeleting: false,
        };

        this.updateBankAccountsList();
        this.updateDeleteConfirmationModal();

        // Dispatch success event
        this.dispatchEvent(
          new CustomEvent("payment-method-deleted", {
            detail: {
              accountId,
              account,
            },
            bubbles: true,
            composed: true,
          })
        );
      } catch (error) {
        console.error(
          "OperatorPayment: Failed to delete payment method",
          error
        );

        // Reset deleting state but keep modal open
        this._state.deleteConfirmation.isDeleting = false;
        this.updateDeleteConfirmationModal();

        // Dispatch error event
        this.dispatchEvent(
          new CustomEvent("payment-method-delete-error", {
            detail: {
              accountId,
              account,
              error:
                error.data?.message ||
                error.message ||
                "Failed to delete payment method",
            },
            bubbles: true,
            composed: true,
          })
        );
      }
    } else {
      // Fallback: remove from local state if no API
      this._state.bankAccounts = this._state.bankAccounts.filter(
        (a) => a.id !== accountId
      );

      // Close confirmation modal
      this._state.deleteConfirmation = {
        isOpen: false,
        accountId: null,
        account: null,
        isDeleting: false,
      };

      this.updateBankAccountsList();
      this.updateDeleteConfirmationModal();
    }
  }

  /**
   * Update the delete confirmation modal in the DOM
   */
  updateDeleteConfirmationModal() {
    const container = this.shadowRoot.querySelector("#deleteConfirmationModal");
    if (container) {
      container.innerHTML = this.renderDeleteConfirmationModal();
      this.setupDeleteConfirmationListeners();
    }
  }

  /**
   * Setup event listeners for delete confirmation modal
   */
  setupDeleteConfirmationListeners() {
    const cancelBtn = this.shadowRoot.querySelector(".delete-cancel-btn");
    const confirmBtn = this.shadowRoot.querySelector(".delete-confirm-btn");
    const overlay = this.shadowRoot.querySelector(
      ".delete-confirmation-overlay"
    );

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.cancelDelete());
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.confirmDelete());
    }

    if (overlay) {
      overlay.addEventListener("click", () => this.cancelDelete());
    }
  }

  /**
   * Render the delete confirmation modal
   * @returns {string} HTML string for the modal
   */
  renderDeleteConfirmationModal() {
    const { isOpen, account, isDeleting } = this._state.deleteConfirmation;

    if (!isOpen) {
      return "";
    }

    const bankName = account?.bankName || "this payment method";
    const lastFour = account?.lastFourAccountNumber || "****";

    return `
      <div class="delete-confirmation-overlay"></div>
      <div class="delete-confirmation-dialog">
        <div class="delete-confirmation-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="delete-confirmation-title">Delete Payment Method?</h3>
        <p class="delete-confirmation-message">
          Are you sure you want to delete <strong>${bankName}</strong> ending in <strong>••••${lastFour}</strong>? This action cannot be undone.
        </p>
        <div class="delete-confirmation-actions">
          <button class="delete-cancel-btn" ${
            isDeleting ? "disabled" : ""
          }>Cancel</button>
          <button class="delete-confirm-btn" ${isDeleting ? "disabled" : ""}>
            ${
              isDeleting
                ? '<span class="delete-spinner"></span> Deleting...'
                : "Delete"
            }
          </button>
        </div>
      </div>
    `;
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
      // Show modal and start animation
      modal.classList.add("show", "animating-in");

      // Remove animating-in class after animation completes
      setTimeout(() => {
        modal.classList.remove("animating-in");
      }, 200);
    }

    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    // Fetch payment methods when modal opens
    this.fetchPaymentMethods();
  }

  /**
   * Fetch payment methods from API
   * Uses cached moovAccountId when available to avoid extra API calls
   */
  async fetchPaymentMethods() {
    if (!this._state.operatorEmail) {
      console.warn(
        "OperatorPayment: Email is required to fetch payment methods"
      );
      return;
    }

    if (!this.api) {
      console.error("OperatorPayment: API not available");
      this._state.paymentMethodsError = "API not available";
      this.updateBankAccountsList();
      return;
    }

    try {
      this._state.isLoadingPaymentMethods = true;
      this._state.paymentMethodsError = null;
      this.updateBankAccountsList();

      console.log(
        "OperatorPayment: Fetching payment methods for",
        this._state.operatorEmail
      );

      // Use the cached moovAccountId (should be set from initializeAccount)
      if (!this._state.moovAccountId) {
        console.warn(
          "OperatorPayment: moovAccountId not cached, account may not be initialized"
        );
        // Fallback: fetch it now if not available
        try {
          const accountResult = await this.api.getAccountByEmail(
            this._state.operatorEmail
          );
          this._state.moovAccountId =
            accountResult.data?.moovAccountId || accountResult.moovAccountId;
          console.log(
            "OperatorPayment: Fetched and cached moovAccountId:",
            this._state.moovAccountId
          );
        } catch (error) {
          console.error(
            "OperatorPayment: Failed to fetch moovAccountId",
            error
          );
          throw error;
        }
      }

      // Use the cached moovAccountId directly
      console.log(
        "OperatorPayment: Using cached moovAccountId:",
        this._state.moovAccountId
      );
      const response = await this.api.getPaymentMethodsByAccountId(
        this._state.moovAccountId
      );

      if (response.success && response.data) {
        // Transform API response to match the expected format
        const allMethods = response.data.map((method) => ({
          // Use the correct ID for deletion based on payment method type
          id: this.getPaymentMethodId(method),
          paymentMethodType: method.paymentMethodType,
          bankName: this.getBankName(method),
          holderName: this.getHolderName(method),
          bankAccountType: method.bankAccount?.bankAccountType || "checking",
          lastFourAccountNumber: this.getLastFour(method),
          status: this.getPaymentMethodStatus(method),
          // Keep original data for reference
          _original: method,
        }));

        // Deduplicate by ID, prioritizing ach-credit-same-day, then ach-credit-standard
        this._state.bankAccounts = this.deduplicatePaymentMethods(allMethods);

        console.log(
          "OperatorPayment: Payment methods fetched successfully",
          this._state.bankAccounts
        );
      } else {
        this._state.bankAccounts = [];
      }

      this._state.isLoadingPaymentMethods = false;
      this.updateBankAccountsList();
    } catch (error) {
      console.error("OperatorPayment: Failed to fetch payment methods", error);
      this._state.isLoadingPaymentMethods = false;
      this._state.paymentMethodsError =
        error.data?.message ||
        error.message ||
        "Failed to fetch payment methods";
      this.updateBankAccountsList();
    }
  }

  /**
   * Deduplicate payment methods by ID, prioritizing certain payment method types
   * Priority: ach-credit-same-day > ach-credit-standard > others
   * @param {Array} methods - Array of payment method objects
   * @returns {Array} Deduplicated array with highest priority method for each ID
   */
  deduplicatePaymentMethods(methods) {
    const priorityOrder = {
      "ach-credit-same-day": 1,
      "ach-credit-standard": 2,
    };

    const methodMap = new Map();

    methods.forEach((method) => {
      const existingMethod = methodMap.get(method.id);

      if (!existingMethod) {
        // First occurrence of this ID
        methodMap.set(method.id, method);
      } else {
        // Compare priorities - lower number = higher priority
        const existingPriority =
          priorityOrder[existingMethod.paymentMethodType] || 999;
        const newPriority = priorityOrder[method.paymentMethodType] || 999;

        if (newPriority < existingPriority) {
          // New method has higher priority, replace
          methodMap.set(method.id, method);
        }
      }
    });

    return Array.from(methodMap.values());
  }

  /**
   * Get bank name from payment method
   * @param {Object} method - Payment method data
   * @returns {string} Bank name
   */
  getBankName(method) {
    if (method.bankAccount) {
      return method.bankAccount.bankName || "Bank Account";
    }
    if (method.card) {
      return method.card.brand || method.card.cardType || "Card";
    }
    if (method.wallet || method.paymentMethodType === "moovWallet") {
      return "Moov Wallet";
    }
    if (method.applePay) {
      return "Apple Pay";
    }
    return "Payment Method";
  }

  /**
   * Get holder name from payment method
   * @param {Object} method - Payment method data
   * @returns {string} Holder name
   */
  getHolderName(method) {
    if (method.bankAccount) {
      return method.bankAccount.holderName || "Account Holder";
    }
    if (method.card) {
      return method.card.holderName || "Card Holder";
    }
    return "Account Holder";
  }

  /**
   * Get last four digits from payment method
   * @param {Object} method - Payment method data
   * @returns {string} Last four digits
   */
  getLastFour(method) {
    if (method.bankAccount) {
      return method.bankAccount.lastFourAccountNumber || "****";
    }
    if (method.card) {
      return method.card.lastFourCardNumber || "****";
    }
    return "****";
  }

  /**
   * Get payment method status
   * @param {Object} method - Payment method data
   * @returns {string} Status
   */
  getPaymentMethodStatus(method) {
    if (method.bankAccount) {
      return method.bankAccount.status || "verified";
    }
    return "verified";
  }

  /**
   * Get the correct ID for a payment method based on its type
   * Used for deletion - bank accounts use bankAccountID, wallets use walletID
   * @param {Object} method - Payment method data
   * @returns {string} The ID to use for deletion
   */
  getPaymentMethodId(method) {
    if (method.bankAccount) {
      return method.bankAccount.bankAccountID;
    }
    if (method.wallet) {
      return method.wallet.walletID;
    }
    if (method.card) {
      return method.card.cardID;
    }
    // Fallback to paymentMethodID if no specific ID is found
    return method.paymentMethodID;
  }

  /**
   * Close the modal
   */
  closeModal() {
    this._state.isOpen = false;
    this._state.isLoading = false;
    const modal = this.shadowRoot.querySelector(".modal");
    if (modal) {
      // Start close animation
      modal.classList.add("animating-out");

      // Hide modal after animation completes
      setTimeout(() => {
        modal.classList.remove("show", "animating-out");
      }, 150);
    }

    // Restore background scrolling when modal is closed
    document.body.style.overflow = "";

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
   * Initialize account - fetches account data and caches moovAccountId
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

    try {
      this._state.isLoading = true;
      this._state.error = null;
      this._state.initializationError = false;
      this.updateMainButtonState();

      console.log(
        "OperatorPayment: Initializing account for",
        this._state.operatorEmail
      );

      // First, verify the operator is registered/onboarded
      console.log("OperatorPayment: Verifying operator...");
      const verifyResult = await this.api.verifyOperator(
        this._state.operatorEmail
      );

      if (!verifyResult.success) {
        throw new Error(
          verifyResult.message || "Operator is not registered in the system"
        );
      }

      console.log(
        "OperatorPayment: Operator verified successfully:",
        verifyResult.message
      );

      // Fetch account by email to get and cache moovAccountId
      const result = await this.api.getAccountByEmail(
        this._state.operatorEmail
      );
      this._state.accountData = result.data;
      this._state.moovAccountId = result.data?.moovAccountId || null;

      console.log(
        "OperatorPayment: Account fetched successfully, moovAccountId:",
        this._state.moovAccountId
      );

      // Pre-fetch Moov token if we have a moovAccountId (optimization for Add Bank Account)
      if (this._state.moovAccountId) {
        console.log("OperatorPayment: Pre-fetching Moov token...");
        await this.initializeMoovToken();
        console.log(
          "OperatorPayment: Token generated and cached during initialization"
        );
      }

      this._state.isLoading = false;
      this.updateMainButtonState();

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

      // Dispatch ready event
      this.dispatchEvent(
        new CustomEvent("payment-linking-ready", {
          detail: {
            operatorEmail: this._state.operatorEmail,
            moovAccountId: this._state.moovAccountId,
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this._state.isLoading = false;
      this._state.error = error.message || "Failed to fetch account data";
      this._state.initializationError = true;

      console.error("OperatorPayment: Account initialization failed", error);
      this.updateMainButtonState();

      // Dispatch error event
      this.dispatchEvent(
        new CustomEvent("payment-linking-error", {
          detail: {
            error: this._state.error,
            type: "initialization",
            originalError: error,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
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
      // Pass the cached moovAccountId to avoid redundant getAccountByEmail call
      const tokenResult = await this.api.generateMoovToken(
        this._state.operatorEmail,
        this._state.moovAccountId
      );

      if (!tokenResult || !tokenResult.data?.accessToken) {
        throw new Error("Failed to generate Moov token");
      }

      this._state.moovToken = tokenResult.data.accessToken;
      // Only update moovAccountId if returned, otherwise keep existing cached value
      if (tokenResult.data?.accountID) {
        this._state.moovAccountId = tokenResult.data.accountID;
      }
      console.log(
        "OperatorPayment: Moov token generated and cached successfully"
      );

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
    console.log("OperatorPayment: Add Bank Account button clicked");
    console.log(
      "OperatorPayment: Current moovToken:",
      this._state.moovToken ? "exists (cached)" : "null (will generate)"
    );

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

    // Inject Bison theme styles as sibling to moov-payment-methods
    this.injectMoovThemeStyles();

    // Remove any existing moov-payment-methods element to ensure fresh state
    const existingMoovDrop = document.getElementById("operator-payment-moov-drop");
    if (existingMoovDrop) {
      existingMoovDrop.remove();
      console.log("OperatorPayment: Removed existing Moov drop element for fresh state");
    }

    // Create a fresh moov-payment-methods element in the document body (light DOM)
    // Moov components need to be in light DOM to properly render their modals
    const moovDrop = document.createElement("moov-payment-methods");
    moovDrop.id = "operator-payment-moov-drop";
    document.body.appendChild(moovDrop);

    // Configure the Moov drop
    moovDrop.token = this._state.moovToken;
    moovDrop.accountID = this._state.moovAccountId;
    moovDrop.microDeposits = false;

    // Set up callbacks
    moovDrop.onResourceCreated = async (result) => {
      console.log("OperatorPayment: Payment method successfully added", result);

      // Optimistic update: add to local bank accounts list immediately
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

      // Refresh the Moov token for subsequent operations
      try {
        const tokenResult = await this.api.generateMoovToken(
          this._state.operatorEmail,
          this._state.moovAccountId
        );
        if (tokenResult?.data?.accessToken) {
          this._state.moovToken = tokenResult.data.accessToken;
          moovDrop.token = this._state.moovToken;
          console.log("OperatorPayment: Moov token refreshed");
        }
      } catch (error) {
        console.error("OperatorPayment: Failed to refresh Moov token", error);
      }

      // Refetch in background to sync with server
      this.fetchPaymentMethods();

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent("moov-link-success", {
          detail: result,
          bubbles: true,
          composed: true,
        })
      );
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

    // Add close handler for when user closes the Moov UI
    moovDrop.onClose = () => {
      console.log("OperatorPayment: Moov UI closed by user");
      moovDrop.open = false;

      // Dispatch close event
      this.dispatchEvent(
        new CustomEvent("moov-link-close", {
          bubbles: true,
          composed: true,
        })
      );
    };

    // Add cancel handler for when user clicks the X button
    moovDrop.onCancel = () => {
      console.log("OperatorPayment: Moov UI cancelled by user (X button)");
      moovDrop.open = false;

      // Dispatch close event
      this.dispatchEvent(
        new CustomEvent("moov-link-close", {
          bubbles: true,
          composed: true,
        })
      );
    };

    moovDrop.paymentMethodTypes = ["bankAccount"];

    // Add click event delegation for modalClose button (inside Moov's shadow DOM)
    // Use document-level listener since element is in shadow DOM
    const handleModalClose = (e) => {
      const target = e.target;

      // Check if the clicked element or any parent has data-testid="modalClose"
      const modalCloseElement =
        target.closest && target.closest('[data-testid="modalClose"]');

      // Only proceed if the modalClose element was clicked
      if (modalCloseElement) {
        console.log(
          'OperatorPayment: [data-testid="modalClose"] element clicked inside Moov UI'
        );
        console.log("Element:", modalCloseElement);
        console.log("Event target:", target);

        // Close the Moov UI by setting moovDrop.open to false
        this.closeMoovDrop();

        console.log("OperatorPayment: Moov UI closed successfully");
      }
    };

    // Add listener to document to catch events from shadow DOM
    document.addEventListener("click", handleModalClose, true);

    // Store handler reference for cleanup
    if (!this._modalCloseHandlers) {
      this._modalCloseHandlers = [];
    }
    this._modalCloseHandlers.push(handleModalClose);

    // Open the Moov drop
    console.log("OperatorPayment: Setting moovDrop.open = true");
    moovDrop.open = true;

    // Store reference to moovDrop for external access
    this._moovRef = moovDrop;
  }

  /**
   * Close the Moov UI
   * Can be called externally to close the Moov drop
   */
  closeMoovDrop() {
    if (this._moovRef && this._moovRef.open) {
      console.log("OperatorPayment: Closing Moov UI");
      this._moovRef.open = false;
      this._moovRef = null;
    }
  }

  /**
   * Update main button state based on initialization status
   */
  updateMainButtonState() {
    const button = this.shadowRoot.querySelector(".link-payment-btn");
    const wrapper = this.shadowRoot.querySelector(".btn-wrapper");
    if (!button) return;

    // Handle loading state
    if (this._state.isLoading) {
      button.classList.add("loading");
      button.classList.remove("error");
      button.disabled = true;
      if (wrapper) wrapper.classList.remove("has-error");
    }
    // Handle error state
    else if (this._state.initializationError) {
      button.classList.remove("loading");
      button.classList.add("error");
      button.disabled = true;
      if (wrapper) wrapper.classList.add("has-error");
    }
    // Handle normal state
    else {
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
    // Show loading state
    if (this._state.isLoadingPaymentMethods) {
      return `
        <div class="loading-state">
          <div class="loading-spinner-large"></div>
          <p>Loading payment methods...</p>
        </div>
      `;
    }

    // Show error state
    if (this._state.paymentMethodsError) {
      return `
        <div class="error-state">
          <svg class="error-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>${this._state.paymentMethodsError}</p>
          <button class="retry-btn" onclick="this.getRootNode().host.fetchPaymentMethods()">Retry</button>
        </div>
      `;
    }

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
          <span class="status-badge ${account.status}">${account.status}</span>
          <button class="delete-btn" data-account-id="${
            account.id
          }" aria-label="Delete payment method">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
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
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          box-sizing: border-box;
        }
        
        .link-payment-btn:hover:not(.error):not(.loading) {
          background: #2a4536;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(50, 82, 64, 0.3);
        }
        
        .link-payment-btn:active:not(.error):not(.loading) {
          background: #1e3328;
          transform: translateY(0);
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
        
        .modal.show {
          display: flex;
        }
        
        .modal.animating-in .modal-overlay {
          animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .modal.animating-in .modal-content {
          animation: slideInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .modal.animating-out .modal-overlay {
          animation: fadeOut 0.15s cubic-bezier(0.4, 0, 1, 1);
        }
        
        .modal.animating-out .modal-content {
          animation: slideOutScale 0.15s cubic-bezier(0.4, 0, 1, 1);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideOutScale {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.98) translateY(-8px);
          }
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
        
        .delete-btn {
          background: transparent;
          border: none;
          padding: 6px;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #9ca3af;
        }
        
        .delete-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .delete-btn svg {
          width: 18px;
          height: 18px;
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
        
        .loading-state {
          text-align: center;
          padding: 32px 16px;
          color: #6b7280;
        }
        
        .loading-spinner-large {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #325240;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }
        
        .loading-state p {
          font-size: 14px;
          margin: 0;
        }
        
        .error-state {
          text-align: center;
          padding: 32px 16px;
          color: #dc2626;
        }
        
        .error-state-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          color: #dc2626;
        }
        
        .error-state p {
          font-size: 14px;
          margin: 0 0 16px 0;
          color: #6b7280;
        }
        
        .retry-btn {
          padding: 8px 16px;
          background: #325240;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .retry-btn:hover {
          background: #2a4536;
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
        
        /* Delete Confirmation Modal */
        .delete-confirmation-container {
          display: contents;
        }
        
        .delete-confirmation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 10200;
        }
        
        .delete-confirmation-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          padding: 32px;
          width: 90%;
          max-width: 400px;
          z-index: 10201;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: deleteModalIn 0.2s ease-out;
        }
        
        @keyframes deleteModalIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .delete-confirmation-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          background: #fef2f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .delete-confirmation-icon svg {
          width: 28px;
          height: 28px;
          color: #dc2626;
        }
        
        .delete-confirmation-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        
        .delete-confirmation-message {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }
        
        .delete-confirmation-message strong {
          color: #374151;
        }
        
        .delete-confirmation-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        
        .delete-cancel-btn {
          padding: 10px 20px;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 40px;
          box-sizing: border-box;
        }
        
        .delete-cancel-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .delete-cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .delete-confirm-btn {
          padding: 10px 20px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 40px;
          box-sizing: border-box;
          min-width: 100px;
        }
        
        .delete-confirm-btn:hover:not(:disabled) {
          background: #b91c1c;
        }
        
        .delete-confirm-btn:disabled {
          background: #f87171;
          cursor: not-allowed;
        }
        
        .delete-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          box-sizing: border-box;
        }
      </style>
      
      <!-- Main Button -->
      <div class="btn-wrapper">
        <span class="tooltip">Operator is not onboarded to the Bison system</span>
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
            Powered by
            <img src="./bison_logo.png" alt="Bison" style="height: 16px; margin-left: 4px;" onerror="this.onerror=null; this.src='https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png';">
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div class="delete-confirmation-container" id="deleteConfirmationModal">
        ${this.renderDeleteConfirmationModal()}
      </div>
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
