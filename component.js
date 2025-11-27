/**
 * BisonJibPay Web Components - Barrel Export
 *
 * This file serves as a convenient entry point that imports and re-exports
 * all BisonJibPay web components from their individual module files.
 *
 * Usage:
 *   <script src="component.js"></script>
 *
 * This will load all components:
 *   - BisonJibPayAPI (API client)
 *   - <operator-onboarding> (Onboarding form component)
 *   - <operator-payment> (Payment methods component)
 *   - <wio-payment> (WIO payment methods with Plaid component)
 *
 * For individual component loading, import directly:
 *   <script src="api.js"></script>
 *   <script src="operator-onboarding.js"></script>
 *   <script src="operator-payment.js"></script>
 *   <script src="wio-payment.js"></script>
 *
 * @version 2.0.0
 * @license MIT
 */

// Import and re-export BisonJibPayAPI
import { BisonJibPayAPI } from "./api.js";

// Import web components (they auto-register when imported)
import "./operator-onboarding.js";
import "./operator-payment.js";
import "./wio-payment.js";
import "./wio-payment-linking.js";

// Re-export the API class for programmatic access
export { BisonJibPayAPI };

// Also make available globally for non-module usage
if (typeof window !== "undefined") {
  window.BisonJibPayAPI = BisonJibPayAPI;
}
