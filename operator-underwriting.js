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

    // Validate API is available
    if (!this.api) {
      console.error(
        "OperatorUnderwriting: BisonJibPayAPI is not available. Please ensure api.js is loaded first."
      );
      this._state.isError = true;
      this._state.error = "API not available";
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
  openModal() {
    this._state.isModalOpen = true;
    const modal = this.shadowRoot.querySelector(".modal");
    if (modal) {
      modal.style.display = "flex";
    }

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
      modal.style.display = "none";
    }

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
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
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
          margin-bottom: 24px;
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
        
        /* Timeline Container - Scrollable */
        .timeline-container {
          width: 100%;
          flex: 1;
          overflow-y: auto;
          min-height: 0;
          padding-right: 8px;
        }
        
        /* Custom scrollbar for timeline */
        .timeline-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .timeline-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .timeline-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .timeline-container::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        /* Timeline */
        .timeline {
          position: relative;
          padding-left: 32px;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }
        
        /* Timeline Item */
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        
        /* Timeline Icon */
        .timeline-icon {
          position: absolute;
          left: -32px;
          top: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        
        .timeline-icon.completed {
          background: #10b981;
        }
        
        .timeline-icon.in-progress {
          background: #3b82f6;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .timeline-icon.pending {
          background: #9ca3af;
        }
        
        .timeline-icon.error {
          background: #ef4444;
        }
        
        .timeline-icon svg {
          width: 14px;
          height: 14px;
          stroke: white;
          fill: none;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }
        
        /* Timeline Card */
        .timeline-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s ease;
        }
        
        .timeline-card:hover {
          border-color: #325240;
          background: #f3f4f6;
        }
        
        .timeline-card.active {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .timeline-card.error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .card-title {
          font-weight: 600;
          font-size: 15px;
          color: #1f2937;
          margin: 0;
        }
        
        .card-status {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .card-status.completed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .card-status.in-progress {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .card-status.pending {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .card-status.error {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .card-description {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }
        
        .card-timestamp {
          font-size: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .card-timestamp svg {
          width: 12px;
          height: 12px;
        }
        
        /* Powered By Footer - Static */
        .powered-by {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
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
        <span class="tooltip">Operator is not integrated to the Bison system</span>
        <button class="underwriting-btn">
          <span class="loading-spinner"></span>
          <svg class="broken-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
          Start Underwriting
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
          
          <!-- Timeline Container -->
          <div class="timeline-container">
            <div class="timeline" id="underwritingTimeline">
              ${this.renderTimeline()}
            </div>
          </div>
          
          <!-- Powered By Footer -->
          <div class="powered-by">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Powered by <span>Bison</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the timeline with mock underwriting status logs
   * @returns {string} HTML string for timeline
   */
  renderTimeline() {
    // Mock timeline data showing underwriting status progression
    const timelineItems = [
      {
        title: "Application Submitted",
        description:
          "Your underwriting application has been received and is being processed.",
        status: "completed",
        timestamp: "Nov 27, 2025 • 10:30 AM",
      },
      {
        title: "Document Verification",
        description:
          "Our team is reviewing the documents you submitted for verification.",
        status: "completed",
        timestamp: "Nov 27, 2025 • 11:45 AM",
      },
      {
        title: "Identity Verification",
        description: "Verifying business identity and ownership information.",
        status: "completed",
        timestamp: "Nov 27, 2025 • 2:15 PM",
      },
      {
        title: "Risk Assessment",
        description:
          "Evaluating risk profile based on business type and transaction volume.",
        status: "in-progress",
        timestamp: "In Progress",
      },
      {
        title: "Compliance Review",
        description:
          "Final compliance check and regulatory requirements verification.",
        status: "pending",
        timestamp: "Pending",
      },
      {
        title: "Approval Decision",
        description: "Final underwriting decision and account activation.",
        status: "pending",
        timestamp: "Pending",
      },
    ];

    return timelineItems.map((item) => this.renderTimelineItem(item)).join("");
  }

  /**
   * Render a single timeline item
   * @param {Object} item - Timeline item data
   * @returns {string} HTML string for timeline item
   */
  renderTimelineItem(item) {
    const iconSvg = this.getStatusIcon(item.status);
    const cardClass =
      item.status === "in-progress"
        ? "active"
        : item.status === "error"
        ? "error"
        : "";

    return `
      <div class="timeline-item">
        <div class="timeline-icon ${item.status}">
          ${iconSvg}
        </div>
        <div class="timeline-card ${cardClass}">
          <div class="card-header">
            <h4 class="card-title">${item.title}</h4>
            <span class="card-status ${item.status}">${this.formatStatus(
      item.status
    )}</span>
          </div>
          <p class="card-description">${item.description}</p>
          <div class="card-timestamp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${item.timestamp}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get SVG icon based on status
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
   * Format status for display
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
