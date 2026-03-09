/**
 * API Service for BisonJibPay Embeddable Endpoints
 *
 * This class provides a centralized way to interact with the BisonJibPay API.
 * It handles authentication via embeddable keys and provides methods for
 * common operations like operator validation, registration, and token generation.
 *
 * @class BisonJibPayAPI
 * @author @kfajardo
 * @version 1.6.0
 *
 * @example
 * // Initialize the API
 * const api = new BisonJibPayAPI(
 *   'https://your-api.com',
 *   'your-embeddable-key'
 * );
 *
 * // Validate operator email
 * const result = await api.validateOperatorEmail(
 *   'operator@example.com',
 *   'OP123456'
 * );
 *
 * // Generate Moov token
 * const token = await api.generateMoovToken('operator@example.com');
 */
class BisonJibPayAPI {
  constructor(baseURL, embeddableKey) {
    if (!embeddableKey || typeof embeddableKey !== 'string' || !embeddableKey.trim()) {
      throw new Error("Missing required 'x-embeddable-key' for BisonJibPayAPI");
    }
    this.baseURL = baseURL || "https://bison-jib-development.azurewebsites.net";
    this.embeddableKey = embeddableKey;
  }

  /**
   * Make authenticated API request
   * @private
   */
  async request(endpoint, options = {}) {
    if (!this.embeddableKey || !this.embeddableKey.trim()) {
      throw new Error("Missing required 'x-embeddable-key' for BisonJibPayAPI request");
    }

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
   *
   * @param {string} email - Operator's email address
   * @param {string} operatorId - Operator's ID
   * @param {string|null} clientId - Optional client ID
   */
  async validateOperatorEmail(email, operatorId, clientId = null) {
    const payload = { email, operatorId };
    if (clientId) payload.clientId = clientId;
    return this.request("/api/embeddable/validate/operator-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Validate user email
   *
   * Checks if a user email exists in the system.
   *
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, message: string, data: {exists: boolean, message: string}, errors: string[], timestamp: string, traceId: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const result = await api.validateUserEmail('user@example.com');
   * if (result.data.exists) {
   *   console.log('User email exists');
   * }
   */
  async validateUserEmail(email) {
    return this.request("/api/embeddable/validate/user-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Verify operator email
   * Checks if an operator is registered/onboarded in the system
   *
   * @param {string} email - Operator's email address
   * @param {string} operatorId - Operator's ID
   * @param {string|null} clientId - Optional client ID
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const result = await api.verifyOperator('operator@example.com', 'OP123456');
   * if (result.success) {
   *   console.log('Operator is verified');
   * }
   */
  async verifyOperator(email, operatorId, clientId = null) {
    return this.validateOperatorEmail(email, operatorId, clientId);
  }

  /**
   * Verify WIO email
   * Checks if a WIO (Worker Independent Operator) has an account in the system
   *
   * @param {string} email - WIO's email address
   * @returns {Promise<{success: boolean, message: string, data?: {moovAccountId: string}}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const result = await api.verifyWio('wio@example.com');
   * if (result.success && result.data?.moovAccountId) {
   *   console.log('WIO is verified with account:', result.data.moovAccountId);
   * }
   */
  async verifyWio(email) {
    return this.getAccountByEmail(email);
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

  /**
   * Register WIO
   */
  async registerWIO(payload) {
    return this.request("/api/embeddable/wio-registration", {
      method: "POST",
      body: payload, // FormData object
    });
  }

  async getAccountByEmail(operatorEmail) {
    const param = new URLSearchParams();
    param.append("email", operatorEmail);

    return this.request(`/api/embeddable/moov-account-id?${param.toString()}`, {
      method: "GET",
    });
  }

  async getAccountByOperatorId(operatorId) {
    const param = new URLSearchParams();
    param.append("operatorId", operatorId);

    return this.request(`/api/embeddable/moov-account-id?${param.toString()}`, {
      method: "GET",
    });
  }

  async getAccountByClientId(clientId) {
    const param = new URLSearchParams();
    param.append("clientId", clientId);

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
   * @param {string|null} moovAccountId - Optional Moov account ID
   * @param {string|null} operatorId - Optional operator ID
   * @param {string|null} clientId - Optional client ID
   * @returns {Promise<{access_token: string, expires_in?: number, scope?: string}>}
   *
   * @example
   * const api = new BisonJibPayAPI(baseURL, embeddableKey);
   * const tokenData = await api.generateMoovToken('operator@example.com');
   * console.log(tokenData.access_token);
   */
  async generateMoovToken(operatorEmail, moovAccountId = null, operatorId = null, clientId = null) {
    console.log("CALLED GENERATE MOOV TOKEN");

    // Use provided moovAccountId or fetch it if not provided
    let accountId = moovAccountId;
    if (!accountId) {
      if (operatorEmail) {
        const account = await this.getAccountByEmail(operatorEmail);
        accountId = account.data.moovAccountId;
      } else if (operatorId) {
        const account = await this.getAccountByOperatorId(operatorId);
        accountId = account.data.moovAccountId;
      } else if (clientId) {
        const account = await this.getAccountByClientId(clientId);
        accountId = account.data.moovAccountId;
      } else {
        throw {
          status: 400,
          data: {
            success: false,
            message: "Email, operator ID, or client ID is required to generate a token",
            errors: ["Missing operator identifier"],
          },
        };
      }
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

    const tokenPayload = {
      scopes: [
        "/accounts.read",
        "/accounts.write",
        "/fed.read",
        "/profile-enrichment.read",
        ...accountScopes,
      ],
    };

    if (operatorEmail) {
      tokenPayload.email = operatorEmail;
    }

    if (operatorId) {
      tokenPayload.operatorId = operatorId;
    }

    if (clientId) {
      tokenPayload.clientId = clientId;
    }

    return this.request("/api/embeddable/moov-access-token", {
      method: "POST",
      body: JSON.stringify(tokenPayload),
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
   * Create Plaid Link token
   *
   * Creates a Plaid Link token using the new API flow.
   *
   * @param {Object} payload - Plaid create-token request payload
   * @param {string} payload.clientName - Client name shown in Plaid Link
   * @param {string} payload.language - Language code (e.g., "en")
   * @param {string[]} payload.products - Plaid products (e.g., ["auth"])
   * @param {string[]} payload.countryCodes - Country codes (e.g., ["US"])
   * @param {{clientUserId: string}} payload.user - Plaid user object
   * @returns {Promise<any>}
   */
  async createPlaidLinkToken(payload) {
    if (!payload?.user?.clientUserId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "user.clientUserId is required",
          errors: ["payload.user.clientUserId parameter is missing"],
        },
      };
    }

    return this.request("/api/plaid/create-token", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Generate Plaid embeddable Link token
   *
   * Calls POST /api/plaid/embeddable/create-token with entityId as query param.
   *
   * Response codes:
   * - 200: Link token created successfully
   * - 400: Invalid request data or missing entityId
   * - 401: Missing or invalid X-Embeddable-Key header
   *
   * @param {string} entityId - Entity UUID (required)
   * @param {Object} payload - Plaid create-token request payload
   * @param {string|null} [payload.clientName]
   * @param {string|null} [payload.language]
   * @param {string[]} [payload.products]
   * @param {(string|null)[]} [payload.countryCodes]
   * @param {{clientUserId?: string|null, legalName?: string|null, phoneNumber?: string|null, emailAddress?: string|null}} [payload.user]
   * @param {string|null} [payload.redirectUri]
   * @param {string|null} [payload.webhook]
   * @returns {Promise<{success: boolean, message: string, data: {linkToken: string, expiration: string, requestId: string} | string, errors: string[], timestamp: string, traceId: string}>}
   */
  async generatePlaidLinkToken(entityId, payload = {}) {
    if (!entityId || typeof entityId !== "string" || !entityId.trim()) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityId is required",
          errors: ["entityId parameter is missing"],
        },
      };
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        entityId
      );
    if (!isUuid) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityId must be a valid UUID",
          errors: ["entityId parameter must be a UUID"],
        },
      };
    }

    const params = new URLSearchParams();
    params.append("entityId", entityId);

    return this.request(`/api/plaid/embeddable/create-token?${params.toString()}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Register Plaid-linked bank account
   *
   * Registers a bank account after Plaid Link success using publicToken and accountId.
   *
   * @param {Object} payload - Bank account registration payload
   * @param {string} payload.publicToken - Plaid public token
   * @param {string} payload.accountId - Plaid account ID
   * @param {number} payload.entityType - 0 for WIO, 1 for Operator
   * @param {string} payload.entityId - WIO or Operator entity GUID
   * @param {string} [payload.moovAccountId] - Optional Moov account ID
   * @param {string} [payload.accountType] - Account type (e.g., "Checking")
   * @param {string} [payload.description] - Description for registration
   * @param {string} [payload.accountHolderName] - Account holder full name
   * @returns {Promise<any>}
   */
  async registerPlaidBankAccount(payload) {
    if (!payload?.publicToken) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "publicToken is required",
          errors: ["payload.publicToken parameter is missing"],
        },
      };
    }

    if (!payload?.accountId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "accountId is required",
          errors: ["payload.accountId parameter is missing"],
        },
      };
    }

    if (payload?.entityType !== 0 && payload?.entityType !== 1) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityType must be 0 (WIO) or 1 (Operator)",
          errors: ["payload.entityType must be 0 or 1"],
        },
      };
    }

    if (!payload?.entityId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityId is required",
          errors: ["payload.entityId parameter is missing"],
        },
      };
    }

    return this.request("/api/plaid/register-bank-account", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Register Plaid-linked bank account (embeddable)
   *
   * Calls POST /api/plaid/embeddable/register-bank-account.
   *
   * Response codes:
   * - 200: Bank account registered across processors
   * - 400: Invalid request data or missing entityId
   * - 401: Missing or invalid X-Embeddable-Key header
   * - 500: Internal server error during registration
   *
   * @param {Object} payload - Bank account registration payload
   * @param {string|null} [payload.publicToken]
   * @param {string|null} [payload.accountId]
   * @param {number} payload.entityType - 0 for WIO, 1 for Operator
   * @param {string} payload.entityId - Entity ID
   * @param {string|null} [payload.accountType]
   * @param {string|null} [payload.description]
   * @param {string|null} [payload.accountHolderName]
   * @returns {Promise<{success: boolean, message: string, data: {registrations: Array<{provider: string, success: boolean, externalId: string, bankAccountId: string, errorMessage: string}>, allSucceeded: boolean, isTokenizedAccount: boolean, persistentAccountId: string, plaidItemId: string, isDuplicate: boolean} | string, errors: string[], timestamp: string, traceId: string}>}
   */
  async registerEmbeddablePlaidBankAccount(payload = {}) {
    if (payload?.entityType !== 0 && payload?.entityType !== 1) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityType must be 0 (WIO) or 1 (Operator)",
          errors: ["payload.entityType must be 0 or 1"],
        },
      };
    }

    if (!payload?.entityId || typeof payload.entityId !== "string" || !payload.entityId.trim()) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityId is required",
          errors: ["payload.entityId parameter is missing"],
        },
      };
    }

    return this.request("/api/plaid/embeddable/register-bank-account", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Retry Plaid bank account registration (embeddable)
   *
   * Calls POST /api/plaid/embeddable/retry-registration.
   *
   * Response codes:
   * - 200: Retry registration completed
   * - 400: Invalid request data or missing entityId
   * - 401: Missing or invalid X-Embeddable-Key header
   * - 404: Plaid item not found
   * - 500: Internal server error during retry
   *
   * @param {Object} payload - Retry registration payload
   * @param {string|null} [payload.plaidItemId]
   * @param {string|null} [payload.accountId]
   * @param {number} payload.entityType - 0 for WIO, 1 for Operator
   * @param {string} payload.entityId - Entity ID
   * @param {string[]} payload.providers - Provider names to retry against
   * @returns {Promise<{success: boolean, message: string, data: {registrations: Array<{provider: string, success: boolean, externalId: string, bankAccountId: string, errorMessage: string}>, allSucceeded: boolean, isTokenizedAccount: boolean, persistentAccountId: string, plaidItemId: string, isDuplicate: boolean} | string, errors: string[], timestamp: string, traceId: string}>}
   */
  async retryEmbeddablePlaidRegistration(payload = {}) {
    if (payload?.entityType !== 0 && payload?.entityType !== 1) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityType must be 0 (WIO) or 1 (Operator)",
          errors: ["payload.entityType must be 0 or 1"],
        },
      };
    }

    if (!payload?.entityId || typeof payload.entityId !== "string" || !payload.entityId.trim()) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "entityId is required",
          errors: ["payload.entityId parameter is missing"],
        },
      };
    }

    if (
      !Array.isArray(payload?.providers) ||
      payload.providers.length === 0 ||
      payload.providers.some((provider) => typeof provider !== "string" || !provider.trim())
    ) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "providers is required",
          errors: ["payload.providers must be a non-empty string array"],
        },
      };
    }

    return this.request("/api/plaid/embeddable/retry-registration", {
      method: "POST",
      body: JSON.stringify(payload),
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

  /**
   * Find operator from Enverus
   *
   * @param {string|number} [opOrgId] - Optional Operator Org ID
   * @param {string} [orgNumber] - Optional Org Number
   * @returns {Promise<any>}
   */
  async findOperatorFromEnverus(opOrgId = null, orgNumber = null) {
    const params = new URLSearchParams();
    if (opOrgId) params.append("opOrgId", opOrgId);
    if (orgNumber) params.append("orgNumber", orgNumber);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    
    return this.request(`/api/enverus/operators/lookup${queryString}`, {
      method: "GET",
    });
  }

  /**
   * List all bank accounts for an operator
   *
   * @param {string} operatorId - The internal GUID of the operator
   * @returns {Promise<any>}
   */
  async getOperatorBankAccounts(operatorId) {
    if (!operatorId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "Operator ID is required",
          errors: ["operatorId parameter is missing"],
        },
      };
    }

    return this.request(`/api/operators/${operatorId}/bank-accounts`, {
      method: "GET",
    });
  }

  /**
   * Add a new bank account for an operator
   *
   * @param {string} operatorId - The internal GUID of the operator
   * @param {Object} bankAccountData - The bank account details to add
   * @returns {Promise<any>}
   */
  async addOperatorBankAccount(operatorId, bankAccountData) {
    if (!operatorId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "Operator ID is required",
          errors: ["operatorId parameter is missing"],
        },
      };
    }

    return this.request(`/api/operators/${operatorId}/bank-accounts`, {
      method: "POST",
      body: JSON.stringify(bankAccountData),
    });
  }

  /**
   * Delete/unlink a bank account for an operator
   *
   * @param {string} operatorId - The internal GUID of the operator
   * @param {string} bankAccountId - The ID of the bank account to delete
   * @returns {Promise<any>}
   */
  async deleteOperatorBankAccount(operatorId, bankAccountId) {
    if (!operatorId || !bankAccountId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: "Operator ID and Bank Account ID are required",
          errors: ["operatorId or bankAccountId parameter is missing"],
        },
      };
    }

    return this.request(`/api/operators/${operatorId}/bank-accounts/${bankAccountId}`, {
      method: "DELETE",
    });
  }
}

// Export for ES6 modules (primary export method for modern bundlers)
export { BisonJibPayAPI };

// Make available globally for script tag usage
if (typeof window !== "undefined") {
  window.BisonJibPayAPI = BisonJibPayAPI;
}

// Export for CommonJS (Node.js)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BisonJibPayAPI };
}
