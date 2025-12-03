/**
 * OperatorUnderwriting Web Component
 *
 * A web component for operator underwriting with a button that opens a modal.
 * Validates operator email via API and manages button state based on response.
 *
 * @author @kfajardo
 * @version 1.0.0
 *
 * @requires BisonJibPayAPI - Must be loaded before this component (from api.js)
 *
 * @example
 * ```html
 * <script type="module" src="component.js"></script>
 *
 * <operator-underwriting
 *   operator-email="operator@example.com"
 *   api-base-url="https://api.example.com"
 *   embeddable-key="your-key">
 * </operator-underwriting>
 *
 * <script>
 *   const underwriting = document.querySelector('operator-underwriting');
 *   underwriting.addEventListener('underwriting-ready', (e) => {
 *     console.log('Account validated:', e.detail.moovAccountId);
 *   });
 *   underwriting.addEventListener('underwriting-error', (e) => {
 *     console.error('Validation failed:', e.detail.error);
 *   });
 * </script>
 * ```
 */

class OperatorUnderwriting extends HTMLElement {
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
        "OperatorUnderwriting: BisonJibPayAPI is not available. Please ensure api.js is loaded before operator-underwriting.js"
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
      isModalOpen: false,
      error: null,
      underwritingHistory: null,
      isLoadingUnderwritingHistory: false,
      underwritingHistoryError: null,
      hasInitialized: false, // Guard to prevent multiple initializations
    };

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
    console.log("OperatorUnderwriting: Setting operator email to:", value);

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

    // Trigger initialization if email changed and component is connected
    if (value && value !== oldEmail && this.isConnected) {
      this.initializeAccount();
    }
  }

  /**
   * Get the moov account ID
   * @returns {string|null}
   */
  get moovAccountId() {
    return this._state.moovAccountId;
  }

  /**
   * Check if the component is ready (account validated)
   * @returns {boolean}
   */
  get isReady() {
    return (
      !this._state.isLoading &&
      !this._state.isError &&
      !!this._state.moovAccountId
    );
  }

  /**
   * Get the open state
   * @returns {boolean}
   */
  get isOpen() {
    return this._state.isModalOpen;
  }

  // ==================== LIFECYCLE METHODS ====================

  connectedCallback() {
    // Initialize email from attribute if present
    const emailAttr = this.getAttribute("operator-email");
    if (emailAttr && !this._state.operatorEmail) {
      this._state.operatorEmail = emailAttr;
      // Trigger API call when email is set
      this.initializeAccount();
    }

    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "operator-email":
        console.log(
          "OperatorUnderwriting: attributeChangedCallback - operator-email:",
          newValue
        );
        this._state.operatorEmail = newValue;
        // Reset state when email changes
        this._state.moovAccountId = null;
        this._state.isError = false;
        this._state.error = null;
        this._state.hasInitialized = false; // Allow re-initialization for new email
        // Trigger API call
        if (newValue && this.isConnected) {
          this.initializeAccount();
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
   * Initialize account by calling getAccountByEmail API
   * Called when operator-email attribute is set
   */
  async initializeAccount() {
    // Validate email is set
    if (!this._state.operatorEmail) {
      console.warn(
        "OperatorUnderwriting: Email is required for initialization"
      );
      return;
    }

    // Prevent multiple simultaneous initializations
    if (this._state.isLoading || this._state.hasInitialized) {
      console.log(
        "OperatorUnderwriting: Already initializing or initialized, skipping"
      );
      return;
    }

    // Validate API is available
    if (!this.api) {
      console.error(
        "OperatorUnderwriting: BisonJibPayAPI is not available. Please ensure api.js is loaded first."
      );
      this._state.isError = true;
      this._state.error = "API not available";
      this._state.hasInitialized = true;
      this.updateButtonState();
      return;
    }

    // Set loading state
    this._state.isLoading = true;
    this._state.isError = false;
    this._state.error = null;
    this.updateButtonState();

    try {
      console.log(
        "OperatorUnderwriting: Calling getAccountByEmail for:",
        this._state.operatorEmail
      );

      const response = await this.api.getAccountByEmail(
        this._state.operatorEmail
      );

      // Success: Store moov account ID
      this._state.moovAccountId =
        response.data?.moovAccountId || response.moovAccountId;
      this._state.isLoading = false;
      this._state.isError = false;
      this._state.hasInitialized = true;

      console.log(
        "OperatorUnderwriting: Account validated, moovAccountId:",
        this._state.moovAccountId
      );

      // Emit success event
      this.dispatchEvent(
        new CustomEvent("underwriting-ready", {
          detail: {
            moovAccountId: this._state.moovAccountId,
            operatorEmail: this._state.operatorEmail,
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      // Failure: Set error state
      this._state.isError = true;
      this._state.isLoading = false;
      this._state.moovAccountId = null;
      this._state.hasInitialized = true;
      this._state.error =
        error.data?.message || error.message || "Failed to validate operator";

      console.error("OperatorUnderwriting: API call failed:", error);

      // Emit error event
      this.dispatchEvent(
        new CustomEvent("underwriting-error", {
          detail: {
            error: this._state.error,
            operatorEmail: this._state.operatorEmail,
            originalError: error,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    this.updateButtonState();
  }

  // ==================== EVENT HANDLING ====================

  setupEventListeners() {
    const button = this.shadowRoot.querySelector(".underwriting-btn");
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
      if (e.key === "Escape" && this._state.isModalOpen) {
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
   * Handle button click - open modal if ready
   */
  handleButtonClick() {
    console.log("OperatorUnderwriting: Button clicked");

    // Only open modal if not loading and not in error state
    if (this._state.isLoading || this._state.isError) {
      console.warn(
        "OperatorUnderwriting: Cannot open modal - button is disabled"
      );
      return;
    }

    // Validate we have an account ID
    if (!this._state.moovAccountId) {
      console.warn("OperatorUnderwriting: Cannot open modal - no account ID");
      return;
    }

    this.openModal();
  }

  /**
   * Open the modal
   */
  async openModal() {
    this._state.isModalOpen = true;
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

    // Fetch underwriting history when modal opens
    await this.fetchUnderwritingHistory();

    // Emit modal open event
    this.dispatchEvent(
      new CustomEvent("underwriting-modal-open", {
        detail: {
          moovAccountId: this._state.moovAccountId,
          operatorEmail: this._state.operatorEmail,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Close the modal
   */
  closeModal() {
    this._state.isModalOpen = false;
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

    // Emit modal close event
    this.dispatchEvent(
      new CustomEvent("underwriting-modal-close", {
        detail: {
          moovAccountId: this._state.moovAccountId,
          operatorEmail: this._state.operatorEmail,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Fetch underwriting history using the saved moovAccountId
   */
  async fetchUnderwritingHistory() {
    // Validate we have a moovAccountId
    if (!this._state.moovAccountId) {
      console.warn(
        "OperatorUnderwriting: Cannot fetch underwriting history - no moovAccountId"
      );
      return;
    }

    // Validate API is available
    if (!this.api) {
      console.error(
        "OperatorUnderwriting: BisonJibPayAPI is not available for fetching underwriting history"
      );
      return;
    }

    // Set loading state
    this._state.isLoadingUnderwritingHistory = true;
    this._state.underwritingHistoryError = null;
    this.updateModalContent();

    try {
      console.log(
        "OperatorUnderwriting: Fetching underwriting history for moovAccountId:",
        this._state.moovAccountId
      );

      const response = await this.api.fetchUnderwritingByAccountId(
        this._state.moovAccountId
      );

      // Success: Store underwriting history
      this._state.underwritingHistory = response.data || [];
      this._state.isLoadingUnderwritingHistory = false;

      console.log(
        "OperatorUnderwriting: Underwriting history fetched successfully:",
        this._state.underwritingHistory
      );

      // Emit success event
      this.dispatchEvent(
        new CustomEvent("underwriting-history-loaded", {
          detail: {
            moovAccountId: this._state.moovAccountId,
            history: this._state.underwritingHistory,
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      // Failure: Set error state
      this._state.isLoadingUnderwritingHistory = false;
      this._state.underwritingHistoryError =
        error.data?.message ||
        error.message ||
        "Failed to load underwriting history";

      console.error(
        "OperatorUnderwriting: Failed to fetch underwriting history:",
        error
      );

      // Emit error event
      this.dispatchEvent(
        new CustomEvent("underwriting-history-error", {
          detail: {
            error: this._state.underwritingHistoryError,
            moovAccountId: this._state.moovAccountId,
            originalError: error,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    this.updateModalContent();
  }

  /**
   * Update modal content based on underwriting history state
   */
  updateModalContent() {
    const modalBody = this.shadowRoot.querySelector(".modal-body");
    if (!modalBody) return;

    if (this._state.isLoadingUnderwritingHistory) {
      modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center;">
          <div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: #325240; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;"></div>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">Loading underwriting history...</p>
        </div>
      `;
    } else if (this._state.underwritingHistoryError) {
      modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px;">
          <svg style="width: 64px; height: 64px; color: #ef4444; margin-bottom: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p style="font-size: 16px; color: #991b1b; margin: 0;">Failed to load underwriting history</p>
          <p style="font-size: 14px; color: #dc2626; margin-top: 8px;">${this._state.underwritingHistoryError}</p>
        </div>
      `;
    } else if (
      this._state.underwritingHistory &&
      this._state.underwritingHistory.length > 0
    ) {
      // Log underwriting data when available
      console.log(
        "OperatorUnderwriting: Underwriting data:",
        this._state.underwritingHistory
      );

      modalBody.innerHTML = this.renderUnderwritingTimeline(
        this._state.underwritingHistory
      );
    } else {
      modalBody.innerHTML = `
        <div style="display: flex; margin: 24px 0; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 12px;">
          <svg style="width: 64px; height: 64px; color: #9ca3af; margin-bottom: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">No underwriting history found</p>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 8px;">This operator has no underwriting records yet</p>
        </div>
      `;
    }
  }

  /**
   * Update button state based on current state
   */
  updateButtonState() {
    const button = this.shadowRoot.querySelector(".underwriting-btn");
    const wrapper = this.shadowRoot.querySelector(".btn-wrapper");
    if (!button) return;

    // Remove all state classes
    button.classList.remove("loading", "error");

    if (this._state.isLoading) {
      button.classList.add("loading");
      button.disabled = true;
      if (wrapper) wrapper.classList.remove("has-error");
    } else if (this._state.isError) {
      button.classList.add("error");
      button.disabled = true;
      if (wrapper) wrapper.classList.add("has-error");
    } else {
      button.disabled = false;
      if (wrapper) wrapper.classList.remove("has-error");
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
        
        .underwriting-btn {
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
        
        .underwriting-btn:hover:not(.error):not(.loading):not(:disabled) {
          background: #2a4536;
        }
        
        .underwriting-btn:active:not(.error):not(.loading):not(:disabled) {
          background: #1e3328;
        }
        
        .underwriting-btn.error {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .underwriting-btn.loading {
          background: #6b8f7a;
          cursor: wait;
        }
        
        .underwriting-btn .broken-link-icon {
          display: none;
        }
        
        .underwriting-btn.error .broken-link-icon {
          display: inline-block;
        }
        
        .underwriting-btn .loading-spinner {
          display: none;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          box-sizing: border-box;
        }
        
        .underwriting-btn.loading .loading-spinner {
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
          height: 80vh;
          max-height: 600px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 10001;
          display: flex;
          flex-direction: column;
          padding: 40px;
          overflow: hidden;
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
        
        /* Modal Header - Static */
        .modal-header {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }
        
        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        
        .modal-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        /* Modal Body */
        .modal-body {
          width: 100%;
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }
        
        
        /* Powered By Footer - Static */
        .powered-by {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #9ca3af;
          flex-shrink: 0;
        }
        
        .powered-by svg {
          width: 16px;
          height: 16px;
        }
        
        .powered-by span {
          font-weight: 500;
          color: #6b7280;
        }
      </style>
      
      <!-- Main Button -->
      <div class="btn-wrapper">
        <span class="tooltip">Operator is not onboarded to the Bison system</span>
        <button class="underwriting-btn">
          <span class="loading-spinner"></span>
          <svg class="broken-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
          View Underwriting Status
        </button>
      </div>
      
      <!-- Modal -->
      <div class="modal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <button class="close-btn">×</button>
          
          <!-- Modal Header -->
          <div class="modal-header">
            <h2>Underwriting Status</h2>
            <p>Track your underwriting application progress</p>
          </div>
          
          <!-- Content Area -->
          <div class="modal-body">
          </div>
          
          <!-- Powered By Footer -->
          <div class="powered-by">
            Powered by
            <img src="./bison_logo.png" alt="Bison" style="height: 16px; margin-left: 4px;" onerror="this.onerror=null; this.src='https://bisonpaywell.com/lovable-uploads/28831244-e8b3-4e7b-8dbb-c016f9f9d54f.png';">
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the timeline with payment methods
   * @returns {string} HTML string for timeline
   */
  renderTimeline() {
    // Show loading state
    if (this._state.isLoadingPaymentMethods) {
      return `
        <div class="timeline-loading">
          <div class="loading-spinner-large"></div>
          <p>Loading payment methods...</p>
        </div>
      `;
    }

    // Show error state
    if (this._state.paymentMethodsError) {
      return `
        <div class="timeline-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>${this._state.paymentMethodsError}</p>
          <button class="retry-btn">Retry</button>
        </div>
      `;
    }

    // Show empty state
    if (
      !this._state.paymentMethods ||
      this._state.paymentMethods.length === 0
    ) {
      return `
        <div class="timeline-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <p>No payment methods linked yet</p>
        </div>
      `;
    }

    // Render payment methods as timeline items
    return this._state.paymentMethods
      .map((method) => this.renderPaymentMethodItem(method))
      .join("");
  }

  /**
   * Render a single payment method as timeline item
   * @param {Object} method - Payment method data
   * @returns {string} HTML string for timeline item
   */
  renderPaymentMethodItem(method) {
    const icon = this.getPaymentMethodIcon(method.paymentMethodType);
    const title = this.formatPaymentMethodTitle(method);
    const description = this.formatPaymentMethodDescription(method);
    const paymentMethodId = method.paymentMethodID;

    return `
      <div class="timeline-item">
        <div class="timeline-icon completed">
          ${this.getPaymentTypeIconSvg(method.paymentMethodType)}
        </div>
        <div class="timeline-card">
          <div class="card-header">
            <h4 class="card-title">
              <span class="payment-type-icon">${icon}</span>
              ${title}
            </h4>
            <button class="delete-btn" data-payment-method-id="${paymentMethodId}" title="Delete payment method">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
          <p class="card-description">${description}</p>
          <div class="card-timestamp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${this.formatPaymentMethodTimestamp(method)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get emoji icon based on payment method type
   * @param {string} type - Payment method type
   * @returns {string} Emoji icon
   */
  getPaymentMethodIcon(type) {
    const icons = {
      card: "💳",
      bankAccount: "🏦",
      wallet: "💰",
      applePay: "🍎",
      moovWallet: "💰",
    };
    return icons[type] || "💳";
  }

  /**
   * Get SVG icon for timeline based on payment type
   * @param {string} type - Payment method type
   * @returns {string} SVG HTML string
   */
  getPaymentTypeIconSvg(type) {
    switch (type) {
      case "card":
        return `<svg viewBox="0 0 24 24" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
      case "bankAccount":
        return `<svg viewBox="0 0 24 24" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"></path></svg>`;
      case "wallet":
      case "moovWallet":
        return `<svg viewBox="0 0 24 24" stroke-width="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z"></path><path d="M16 12h.01"></path></svg>`;
      case "applePay":
        return `<svg viewBox="0 0 24 24" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path><path d="M12 6v2M12 16v2M6 12h2M16 12h2"></path></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
  }

  /**
   * Format payment method title based on type
   * @param {Object} method - Payment method data
   * @returns {string} Formatted title
   */
  formatPaymentMethodTitle(method) {
    switch (method.paymentMethodType) {
      case "card":
        if (method.card) {
          const brand = method.card.brand || method.card.cardType || "Card";
          return `${this.capitalizeFirst(brand)}`;
        }
        return "Credit/Debit Card";
      case "bankAccount":
        if (method.bankAccount) {
          return method.bankAccount.bankName || "Bank Account";
        }
        return "Bank Account";
      case "wallet":
      case "moovWallet":
        return "Moov Wallet";
      case "applePay":
        return "Apple Pay";
      default:
        return "Payment Method";
    }
  }

  /**
   * Format payment method description with details
   * @param {Object} method - Payment method data
   * @returns {string} Formatted description
   */
  formatPaymentMethodDescription(method) {
    switch (method.paymentMethodType) {
      case "card":
        if (method.card) {
          const lastFour = method.card.lastFourCardNumber || "****";
          const expiry = method.card.expiration
            ? `Expires ${method.card.expiration.month}/${method.card.expiration.year}`
            : "";
          return `Ending in ****${lastFour}${expiry ? ` • ${expiry}` : ""}`;
        }
        return "Card details unavailable";
      case "bankAccount":
        if (method.bankAccount) {
          const lastFour = method.bankAccount.lastFourAccountNumber || "****";
          const type = method.bankAccount.bankAccountType || "";
          return `${this.capitalizeFirst(
            type
          )} account ending in ****${lastFour}`;
        }
        return "Bank account details unavailable";
      case "wallet":
      case "moovWallet":
        if (method.wallet) {
          return `Available balance: $${
            (method.wallet.availableBalance?.value || 0) / 100
          }`;
        }
        return "Digital wallet for payments";
      case "applePay":
        if (method.applePay) {
          return `${method.applePay.brand || "Card"} via Apple Pay`;
        }
        return "Apple Pay enabled device";
      default:
        return "Payment method linked to your account";
    }
  }

  /**
   * Format timestamp for payment method
   * @param {Object} method - Payment method data
   * @returns {string} Formatted timestamp
   */
  formatPaymentMethodTimestamp(method) {
    // Try to get creation date from various possible fields
    const dateStr = method.createdOn || method.createdAt || method.addedAt;

    if (dateStr) {
      try {
        const date = new Date(dateStr);
        return `Added ${date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      } catch (e) {
        return "Date unavailable";
      }
    }

    return "Recently added";
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Get SVG icon based on status (kept for backwards compatibility)
   * @param {string} status - Status type
   * @returns {string} SVG HTML string
   */
  getStatusIcon(status) {
    switch (status) {
      case "completed":
        return `<svg viewBox="0 0 24 24" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      case "in-progress":
        return `<svg viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="3"></circle></svg>`;
      case "error":
        return `<svg viewBox="0 0 24 24" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      case "pending":
      default:
        return `<svg viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="1"></circle></svg>`;
    }
  }

  /**
   * Format status for display (kept for backwards compatibility)
   * @param {string} status - Status type
   * @returns {string} Formatted status text
   */
  formatStatus(status) {
    const statusMap = {
      completed: "Completed",
      "in-progress": "In Progress",
      pending: "Pending",
      error: "Error",
    };
    return statusMap[status] || status;
  }

  /**
   * Render underwriting history as a timeline
   * @param {Array} history - Array of underwriting status records
   * @returns {string} HTML string for timeline
   */
  renderUnderwritingTimeline(history) {
    if (!history || history.length === 0) {
      return `
        <div style="display: flex; margin: 24px 0; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 12px;">
          <svg style="width: 64px; height: 64px; color: #9ca3af; margin-bottom: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">No underwriting history found</p>
        </div>
      `;
    }

    // Sort by changedAt (oldest first, will be reversed in display)
    const sortedHistory = [...history].sort((a, b) => {
      const dateA = new Date(a.changedAt);
      const dateB = new Date(b.changedAt);
      return dateA - dateB;
    });

    // Reverse to show newest at top
    const reversedHistory = [...sortedHistory].reverse();

    const timelineItems = reversedHistory
      .map((item, index) => {
        const isNewest = index === 0;
        const isOldest = index === reversedHistory.length - 1;
        return this.renderUnderwritingTimelineItem(item, isNewest, isOldest);
      })
      .join("");

    return `
      <style>
        .underwriting-timeline {
          padding: 16px;
          position: relative;
        }
        
        .timeline-item {
          display: flex;
          gap: 12px;
          position: relative;
          padding-bottom: 24px;
        }
        
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        
        .timeline-icon-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        
        .timeline-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          position: relative;
          background: #E5E7EB;
          color: #6B7280;
        }
        
        .timeline-icon.approved {
          background: #D1FAE5;
          color: #10B981;
        }
        
        .timeline-icon.pending {
          background: #FEF3C7;
          color: #F59E0B;
        }
        
        .timeline-icon.latest::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0.6;
          animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          75%, 100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        .timeline-line {
          position: absolute;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: calc(100% - 0px);
          background: #E5E7EB;
          z-index: 1;
        }
        
        .timeline-content {
          flex: 1;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .timeline-status {
          font-size: 13px;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 4px 0;
        }
        
        .timeline-date {
          font-size: 12px;
          color: #9CA3AF;
          margin: 0;
        }
        
        .timeline-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
          margin-top: 6px;
        }
        
        .timeline-badge.newest {
          background: #DBEAFE;
          color: #1E40AF;
        }
        
        .timeline-badge.oldest {
          background: #F3F4F6;
          color: #6B7280;
        }
      </style>
      
      <div class="underwriting-timeline">
        ${timelineItems}
      </div>
    `;
  }

  /**
   * Render a single underwriting timeline item
   * @param {Object} item - Underwriting status record
   * @param {boolean} isNewest - Whether this is the newest status
   * @param {boolean} isOldest - Whether this is the oldest status
   * @returns {string} HTML string for timeline item
   */
  renderUnderwritingTimelineItem(item, isNewest, isOldest) {
    const status = item.status || "unknown";
    const statusDisplay = this.formatUnderwritingStatus(status);
    const icon = this.getUnderwritingStatusIcon(status);
    const formattedDate = this.formatUnderwritingDate(item.changedAt);

    return `
      <div class="timeline-item">
        <div class="timeline-icon-wrapper">
          <div class="timeline-icon ${status} ${isNewest ? "latest" : ""}">
            ${icon}
          </div>
          ${!isOldest ? '<div class="timeline-line"></div>' : ""}
        </div>
        <div class="timeline-content">
          <h4 class="timeline-status">${statusDisplay}</h4>
          <p class="timeline-date">${formattedDate}</p>
          ${isNewest ? '<span class="timeline-badge newest">Latest</span>' : ""}
          ${
            isOldest ? '<span class="timeline-badge oldest">Initial</span>' : ""
          }
        </div>
      </div>
    `;
  }

  /**
   * Format underwriting status for display
   * @param {string} status - Status value
   * @returns {string} Formatted status text
   */
  formatUnderwritingStatus(status) {
    const statusMap = {
      pending: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
      under_review: "Under Review",
      submitted: "Submitted",
    };
    return (
      statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
    );
  }

  /**
   * Get icon SVG for underwriting status
   * @param {string} status - Status value
   * @returns {string} SVG HTML string
   */
  getUnderwritingStatusIcon(status) {
    switch (status) {
      case "approved":
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      case "rejected":
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      case "under_review":
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      case "pending":
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }
  }

  /**
   * Format date for underwriting timeline
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date string
   */
  formatUnderwritingDate(dateStr) {
    if (!dateStr) return "Date unavailable";

    try {
      const date = new Date(dateStr);
      const dateFormatted = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeFormatted = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${dateFormatted} ${timeFormatted}`;
    } catch (e) {
      return dateStr;
    }
  }
}

// Register the custom element
customElements.define("operator-underwriting", OperatorUnderwriting);

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { OperatorUnderwriting };
}

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.OperatorUnderwriting = OperatorUnderwriting;
}

// Export for ES6 modules
export { OperatorUnderwriting };
