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
      plaidLinkToken: null,
      initializationError: false,
      // Payment methods from API
      bankAccounts: [],
      isLoadingPaymentMethods: false,
      isRefetchingPaymentMethods: false,
      paymentMethodsError: null,
      // Delete confirmation modal
      deleteConfirmation: {
        isOpen: false,
        accountId: null,
        account: null,
        isDeleting: false,
      },
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

    console.log("WioPaymentLinking: Email state after set:", this._state.email);

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
    const emailAttr = this.getAttribute("email");
    if (emailAttr && !this._state.email) {
      this._state.email = emailAttr;
    }

    // Load Plaid SDK
    this.ensurePlaidSDK();

    this.setupEventListeners();

    // Auto-initialize if email is already set
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
        console.log(
          "WioPaymentLinking: attributeChangedCallback - email:",
          newValue
        );
        this._state.email = newValue;
        // Trigger initialization when email attribute changes
        if (newValue && this.isConnected) {
          this.initializeAccount();
        }
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
      addBankBtn.addEventListener("click", this.openPlaidLink.bind(this));
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
    console.log("WioPaymentLinking: Delete account requested for:", accountId);

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
      console.warn("WioPaymentLinking: No account ID for deletion");
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
        console.log("WioPaymentLinking: Deleting payment method via API...");
        await this.api.deletePaymentMethodByAccountId(
          this._state.moovAccountId,
          accountId
        );
        console.log("WioPaymentLinking: Payment method deleted successfully");

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
          "WioPaymentLinking: Failed to delete payment method",
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
   * Handle button click - just open modal (initialization happens on email set)
   */
  handleButtonClick() {
    console.log(
      "WioPaymentLinking: Button clicked, current email state:",
      this._state.email
    );

    // Don't open modal if there's an initialization error
    if (this._state.initializationError) {
      console.warn(
        "WioPaymentLinking: Cannot open modal due to initialization error"
      );
      return;
    }

    // Don't open modal if still loading
    if (this._state.isLoading) {
      console.warn(
        "WioPaymentLinking: Cannot open modal while initialization is in progress"
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

    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    // Fetch payment methods when modal opens
    this.fetchPaymentMethods();
  }

  /**
   * Fetch payment methods from API
   * Uses cached moovAccountId when available to avoid extra API calls
   * @param {boolean} isRefetch - Whether this is a refetch (keeps existing list visible)
   */
  async fetchPaymentMethods(isRefetch = false) {
    if (!this._state.moovAccountId) {
      console.warn(
        "WioPaymentLinking: moovAccountId is required to fetch payment methods. Ensure initializeAccount() has completed."
      );
      return;
    }

    if (!this.api) {
      console.error("WioPaymentLinking: API not available");
      this._state.paymentMethodsError = "API not available";
      this.updateBankAccountsList();
      return;
    }

    try {
      // Only show full loading state for initial load, not refetch
      if (!isRefetch) {
        this._state.isLoadingPaymentMethods = true;
      }
      this._state.paymentMethodsError = null;
      this.updateBankAccountsList();

      console.log(
        "WioPaymentLinking: Fetching payment methods for moovAccountId:",
        this._state.moovAccountId
      );

      // Use the cached moovAccountId directly to avoid extra API call
      const response = await this.api.getPaymentMethodsByAccountId(
        this._state.moovAccountId
      );

      if (response.success && response.data) {
        // Filter to only include payment methods with paymentMethodType "ach-credit-same-day"
        const achCreditSameDayMethods = response.data.filter(
          (method) => method.paymentMethodType === "ach-credit-same-day"
        );

        // Transform API response to match the expected format
        this._state.bankAccounts = achCreditSameDayMethods.map((method) => ({
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

        console.log(
          "WioPaymentLinking: Payment methods fetched successfully",
          this._state.bankAccounts
        );
      } else {
        this._state.bankAccounts = [];
      }

      this._state.isLoadingPaymentMethods = false;
      this.updateBankAccountsList();
    } catch (error) {
      console.error(
        "WioPaymentLinking: Failed to fetch payment methods",
        error
      );
      this._state.isLoadingPaymentMethods = false;
      this._state.paymentMethodsError =
        error.data?.message ||
        error.message ||
        "Failed to fetch payment methods";
      this.updateBankAccountsList();
    }
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
      modal.style.display = "none";
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
   * Initialize account - auto-called when email is set
   * Fetches account data and generates Plaid token
   */
  async initializeAccount() {
    // Validate email
    if (!this._state.email) {
      console.warn("WioPaymentLinking: Email is required for initialization");
      return;
    }

    // Validate API availability
    if (!this.api) {
      console.error(
        "WioPaymentLinking: BisonJibPayAPI is not available. Please ensure component.js is loaded first."
      );
      this._state.initializationError = true;
      this.updateMainButtonState();
      return;
    }

    try {
      this._state.isLoading = true;
      this._state.error = null;
      this._state.initializationError = false;

      // Update button to loading state
      this.updateMainButtonState();

      console.log(
        "WioPaymentLinking: Initializing account for",
        this._state.email
      );

      // Fetch account by email
      const result = await this.api.getAccountByEmail(this._state.email);
      this._state.accountData = result.data;
      this._state.moovAccountId = result.data.moovAccountId || null;

      console.log(
        "WioPaymentLinking: Account fetched successfully",
        result.data
      );

      // Reset error state after successful account fetch
      this.updateMainButtonState();
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
      await this.initializePlaidToken();
    } catch (error) {
      this._state.isLoading = false;
      this._state.error = error.message || "Failed to fetch account data";
      this._state.initializationError = true;

      console.error("WioPaymentLinking: Account initialization failed", error);

      // Update button to error state
      this.updateMainButtonState();
    }
  }

  /**
   * Initialize Plaid token - called after account fetch succeeds
   */
  async initializePlaidToken() {
    try {
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

      this._state.plaidLinkToken = plaidLinkResult.data.linkToken;
      this._state.isLoading = false;
      console.log("WioPaymentLinking: Plaid Link token generated successfully");

      // Ensure button is enabled after successful initialization
      this.updateMainButtonState();
    } catch (error) {
      this._state.isLoading = false;
      this._state.error = error.message || "Failed to generate Plaid token";
      this._state.initializationError = true;

      console.error("WioPaymentLinking: Plaid token generation failed", error);

      // Update button to error state
      this.updateMainButtonState();
    }
  }

  /**
   * Open Plaid Link - triggered by Add Bank Account button click
   */
  async openPlaidLink() {
    // Ensure Plaid SDK is loaded
    if (!this._state.plaidLoaded) {
      console.log("WioPaymentLinking: Plaid SDK not loaded yet, waiting...");
      try {
        await this.ensurePlaidSDK();
      } catch (error) {
        console.error("WioPaymentLinking: Failed to load Plaid SDK:", error);
        return;
      }
    }

    // Validate token is available
    if (!this._state.plaidLinkToken) {
      console.error("WioPaymentLinking: Plaid Link token not available");
      return;
    }

    console.log("WioPaymentLinking: Opening Plaid Link...");

    // Create Plaid handler
    const handler = window.Plaid.create({
      token: this._state.plaidLinkToken,
      onSuccess: async (public_token, metadata) => {
        const moovAccountId = this._state.moovAccountId;

        if (!moovAccountId) {
          this.dispatchEvent(
            new CustomEvent("payment-account-search-error", {
              detail: {
                error: "Moov Account ID not found",
                type: "api",
              },
              bubbles: true,
              composed: true,
            })
          );
          return;
        }

        // Show refetching state immediately when Plaid Link closes
        this._state.isRefetchingPaymentMethods = true;
        this.updateBankAccountsList();

        console.log(
          "WioPaymentLinking: Plaid Link onSuccess - showing loading indicator"
        );

        // Use requestAnimationFrame to ensure the UI updates before starting async work
        requestAnimationFrame(async () => {
          try {
            console.log("WioPaymentLinking: Adding Plaid account to Moov...");

            const result = await this.api.addPlaidAccountToMoov(
              public_token,
              metadata.account_id,
              moovAccountId
            );

            console.log("WioPaymentLinking: Plaid Link success", result);

            // Refetch payment methods to show the newly added payment method
            await this.fetchPaymentMethods(true);
            this._state.isRefetchingPaymentMethods = false;
            this.updateBankAccountsList();

            this.dispatchEvent(
              new CustomEvent("plaid-link-success", {
                detail: { public_token, metadata, result },
                bubbles: true,
                composed: true,
              })
            );
          } catch (error) {
            console.error(
              "WioPaymentLinking: Failed to add Plaid account to Moov",
              error
            );

            // Reset refetching state on error
            this._state.isRefetchingPaymentMethods = false;
            this.updateBankAccountsList();

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
        console.log("WioPaymentLinking: Plaid Link event", eventName, metadata);
      },
    });

    // Open Plaid Link
    handler.open();
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
    // Show full loading state only for initial load (not refetch)
    if (
      this._state.isLoadingPaymentMethods &&
      !this._state.isRefetchingPaymentMethods
    ) {
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

    // Refetching banner (non-intrusive, shown above existing list)
    const refetchingBanner = this._state.isRefetchingPaymentMethods
      ? `
      <div class="refetching-banner">
        <div class="refetching-spinner"></div>
        <span>Fetching new payment method...</span>
      </div>
    `
      : "";

    if (accounts.length === 0) {
      return `
        ${refetchingBanner}
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="10" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M12 3L2 10h20L12 3z"></path>
          </svg>
          <p>No bank accounts linked yet</p>
        </div>
      `;
    }

    return (
      refetchingBanner +
      accounts
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
        .join("")
    );
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
          height: 40px;
          box-sizing: border-box;
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
          height: 40px;
          box-sizing: border-box;
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
        
        /* Refetching Banner - Non-intrusive loading indicator */
        .refetching-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          margin-bottom: 12px;
          animation: refetchSlideIn 0.3s ease-out;
        }
        
        @keyframes refetchSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .refetching-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #bbf7d0;
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .refetching-banner span {
          font-size: 13px;
          font-weight: 500;
          color: #15803d;
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
        <span class="tooltip">User is not integrated to the Bison system</span>
        <button class="link-payment-btn">
          <span class="loading-spinner"></span>
          <svg class="broken-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
          Link Payment
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
            <p>Manage your linked bank accounts</p>
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
            <p>Connect a new bank account via Plaid</p>
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
      
      <!-- Delete Confirmation Modal -->
      <div class="delete-confirmation-container" id="deleteConfirmationModal">
        ${this.renderDeleteConfirmationModal()}
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
