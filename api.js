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
  async generateMoovToken(operatorEmail) {
    return this.request("/api/embeddable/moov/generate-token", {
      method: "POST",
      body: JSON.stringify({ operatorEmail }),
    });
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