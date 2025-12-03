/**
 * API Service for BisonJibPay Embeddable Endpoints
 *
 * This class provides a centralized way to interact with the BisonJibPay API.
 * It handles authentication via embeddable keys and provides methods for
 * common operations like operator validation, registration, and token generation.
 *
 * @class BisonJibPayAPI
 * @author @kfajardo
 * @version 1.0.0
 *
 * @example
 * // Initialize the API
 * const api = new BisonJibPayAPI(
 *   'https://your-api.com',
 *   'your-embeddable-key'
 * );
 *
 * // Validate operator email
 * const result = await api.validateOperatorEmail('operator@example.com');
 *
 * // Generate Moov token
 * const token = await api.generateMoovToken('operator@example.com');
 */
class BisonJibPayAPI {
  constructor(baseURL, embeddableKey) {
    this.baseURL = baseURL || "https://bison-jib-development.azurewebsites.net";
    this.embeddableKey = embeddableKey;
  }

  /**
   * Make authenticated API request
   * @private
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "X-Embeddable-Key": this.embeddableKey,
      ...options.headers,
    };

    // Don't add Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          data: data,
        };
      }

      return data;
    } catch (error) {
      // Re-throw with structured error
      if (error.status) throw error;
      throw {
        status: 500,
        data: {
          success: false,
          message: "Network error occurred",
          errors: [error.message],
        },
      };
    }
  }

  /**
   * Validate operator email
   */
  async validateOperatorEmail(email) {
    return this.request("/api/embeddable/validate/operator-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Register operator
   */
  async registerOperator(formData) {
    return this.request("/api/embeddable/operator-registration", {
      method: "POST",
      body: formData, // FormData object
    });
  }

  async getAccountByEmail(operatorEmail) {
    const param = new URLSearchParams();
    param.append("email", operatorEmail);

    return this.request(`/api/embeddable/moov-account-id?${param.toString()}`, {
      method: "GET",
    });
  }

  /**
   * Generate Moov access token for operator
   *
   * This method calls the backend API to generate a Moov token for payment operations.
   * The backend handles the secure communication with Moov's API.
   *
   * @param {string} operatorEmail - Operator's email address
   * @returns {Promise<{access_token: string, expires_in?: number, scope?: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const tokenData = await api.generateMoovToken('operator@example.com');
   * console.log(tokenData.access_token);
   */
  async generateMoovToken(operatorEmail, moovAccountId = null) {
    console.log("CALLED GENERATE MOOV TOKEN");

    // Use provided moovAccountId or fetch it if not provided
    let accountId = moovAccountId;
    if (!accountId) {
      const account = await this.getAccountByEmail(operatorEmail);
      accountId = account.data.moovAccountId;
    }
    console.log("MOOV ACCOUNT ID", accountId);
    let accountScopes = [
      "/accounts/{ACCOUNT_ID}/bank-accounts.read",
      "/accounts/{ACCOUNT_ID}/bank-accounts.write",
      "/accounts/{ACCOUNT_ID}/capabilities.read",
      "/accounts/{ACCOUNT_ID}/capabilities.write",
      "/accounts/{ACCOUNT_ID}/cards.read",
      "/accounts/{ACCOUNT_ID}/cards.write",
      "/accounts/{ACCOUNT_ID}/profile.read",
      "/accounts/{ACCOUNT_ID}/profile.write",
      "/accounts/{ACCOUNT_ID}/representatives.read",
      "/accounts/{ACCOUNT_ID}/representatives.write",
    ];

    if (accountId) {
      accountScopes = accountScopes.map((value) =>
        value.replace("{ACCOUNT_ID}", accountId)
      );
    }

    return this.request("/api/embeddable/moov-access-token", {
      method: "POST",
      body: JSON.stringify({
        email: operatorEmail,
        scopes: [
          "/accounts.read",
          "/accounts.write",
          "/fed.read",
          "/profile-enrichment.read",
          ...accountScopes,
        ],
      }),
    });
  }

  /**
   * Generate Plaid Link token for WIO
   *
   * This method calls the backend API to generate a Plaid Link token for bank account linking.
   * The token is used to initialize Plaid Link in the Moov payment drop.
   *
   * @param {string} wioEmail - WIO's email address
   * @returns {Promise<{link_token: string, expiration?: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const tokenData = await api.generatePlaidToken('wio@example.com');
   * console.log(tokenData.link_token);
   */
  async generatePlaidToken(wioEmail) {
    return this.request("/api/embeddable/plaid/link-token", {
      method: "POST",
      body: JSON.stringify({
        clientName: wioEmail,
        countryCodes: ["US"],
        user: {
          clientUserId: "wio-email",
          legalName: "Wio User",
        },
        products: ["transactions"],
        client_name: "Personal Finance App",
      }),
    });
  }

  /**
   * Create Plaid processor token
   *
   * Exchanges a Plaid public token for a processor token that can be used with Moov.
   * This is called during the Plaid Link flow after the user selects their bank account.
   *
   * @param {string} publicToken - Plaid public token from Link flow
   * @param {string} bankAccountId - Selected bank account ID
   * @returns {Promise<{processor_token: string, bank_account_id: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const result = await api.createProcessorToken(publicToken, accountId);
   * console.log(result.processor_token);
   */
  async createProcessorToken(publicToken, bankAccountId) {
    return this.request("/api/embeddable/plaid/processor-token", {
      method: "POST",
      body: JSON.stringify({
        publicToken,
        accountId: bankAccountId,
      }),
    });
  }

  async addPlaidAccountToMoov(publicToken, bankAccountId, moovAccountId) {
    return this.request("/api/embeddable/plaid/add-to-moov", {
      method: "POST",
      body: JSON.stringify({
        publicToken,
        moovAccountId,
        accountId: bankAccountId,
      }),
    });
  }

  /**
   * Get payment methods by moovAccountId directly
   *
   * This method fetches all available payment methods for the given moovAccountId.
   * Use this when you already have the moovAccountId cached to avoid extra API calls.
   *
   * @param {string} moovAccountId - The Moov account ID
   * @returns {Promise<{success: boolean, message: string, data: Array<{paymentMethodID: string, paymentMethodType: string, wallet?: object, bankAccount?: object, card?: object, applePay?: object}>, errors: string[], timestamp: string, traceId: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const paymentMethods = await api.getPaymentMethodsByAccountId('moov-account-id');
   * console.log(paymentMethods.data); // Array of payment methods
   */
  async getPaymentMethodsByAccountId(moovAccountId) {
    if (!moovAccountId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "Moov account ID is required",
          errors: ["moovAccountId parameter is missing"],
        },
      };
    }

    return this.request(`/api/embeddable/payment-methods/${moovAccountId}`, {
      method: "GET",
    });
  }

  /**
   * Get payment methods for an operator by email
   *
   * This method first retrieves the operator's moovAccountId by email,
   * then fetches all available payment methods for that account.
   * Note: If you already have the moovAccountId, use getPaymentMethodsByAccountId() instead
   * to avoid the extra API call.
   *
   * @param {string} operatorEmail - Operator's email address
   * @returns {Promise<{success: boolean, message: string, data: Array<{paymentMethodID: string, paymentMethodType: string, wallet?: object, bankAccount?: object, card?: object, applePay?: object}>, errors: string[], timestamp: string, traceId: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const paymentMethods = await api.getPaymentMethods('operator@example.com');
   * console.log(paymentMethods.data); // Array of payment methods
   */
  async getPaymentMethods(operatorEmail) {
    // First, get the account by email to retrieve moovAccountId
    const account = await this.getAccountByEmail(operatorEmail);
    const moovAccountId = account.data?.moovAccountId || account.moovAccountId;

    if (!moovAccountId) {
      throw {
        status: 404,
        data: {
          success: false,
          message: "Moov account ID not found for the given email",
          errors: ["No moovAccountId associated with this operator"],
        },
      };
    }

    // Use the direct method to fetch payment methods
    return this.getPaymentMethodsByAccountId(moovAccountId);
  }

  /**
   * Delete a payment method by moovAccountId and paymentMethodId directly
   *
   * Use this when you already have the moovAccountId cached to avoid extra API calls.
   *
   * @param {string} moovAccountId - The Moov account ID
   * @param {string} paymentMethodId - The ID of the payment method to delete
   * @returns {Promise<{success: boolean, message: string, data: string, errors: string[], timestamp: string, traceId: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const result = await api.deletePaymentMethodByAccountId('moov-account-id', 'pm_123456');
   * console.log(result.success); // true if deleted successfully
   */
  async deletePaymentMethodByAccountId(moovAccountId, paymentMethodId) {
    if (!moovAccountId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "Moov account ID is required",
          errors: ["moovAccountId parameter is missing"],
        },
      };
    }

    if (!paymentMethodId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "Payment method ID is required",
          errors: ["paymentMethodId parameter is missing"],
        },
      };
    }

    return this.request(
      `/api/embeddable/bank-account/${moovAccountId}/${paymentMethodId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Delete a payment method by ID
   *
   * This method first retrieves the operator's moovAccountId by email,
   * then deletes the specified payment method.
   * Note: If you already have the moovAccountId, use deletePaymentMethodByAccountId() instead
   * to avoid the extra API call.
   *
   * @param {string} operatorEmail - Operator's email address
   * @param {string} paymentMethodId - The ID of the payment method to delete
   * @returns {Promise<{success: boolean, message: string, data: string, errors: string[], timestamp: string, traceId: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const result = await api.deletePaymentMethodById('operator@example.com', 'pm_123456');
   * console.log(result.success); // true if deleted successfully
   */
  async deletePaymentMethodById(operatorEmail, paymentMethodId) {
    // First, get the account by email to retrieve moovAccountId
    const account = await this.getAccountByEmail(operatorEmail);
    const moovAccountId = account.data?.moovAccountId || account.moovAccountId;

    if (!moovAccountId) {
      throw {
        status: 404,
        data: {
          success: false,
          message: "Moov account ID not found for the given email",
          errors: ["No moovAccountId associated with this operator"],
        },
      };
    }

    // Use the direct method to delete payment method
    return this.deletePaymentMethodByAccountId(moovAccountId, paymentMethodId);
  }
  /**
   * Fetch underwriting history by moovAccountId
   *
   * This method retrieves the underwriting history for the given moovAccountId.
   * Use this when you already have the moovAccountId cached.
   *
   * Response Codes:
   * - 200: Success with data array (may be empty)
   * - 400: Missing or invalid moovAccountId parameter
   * - 401: Invalid or missing X-Embeddable-Key header
   * - 404: Moov account with specified ID not found
   * - 500: Server error while retrieving underwriting history
   *
   * @param {string} moovAccountId - The Moov account ID
   * @returns {Promise<{success: boolean, message?: string, data: Array|null, errors: string[], timestamp?: string, traceId?: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const history = await api.fetchUnderwritingByAccountId('moov-account-id');
   * console.log(history.data); // Array of underwriting history records
   */
  async fetchUnderwritingByAccountId(moovAccountId) {
    if (!moovAccountId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "Moov account ID is required",
          errors: ["moovAccountId parameter is missing"],
        },
      };
    }

    return this.request(
      `/api/embeddable/underwriting-history/${moovAccountId}`,
      {
        method: "GET",
      }
    );
  }
}

// Export for module usage (ES6)
export { BisonJibPayAPI };

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.BisonJibPayAPI = BisonJibPayAPI;
}

// Export for CommonJS (Node.js)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BisonJibPayAPI };
}
