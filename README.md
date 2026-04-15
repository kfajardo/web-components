# Bison Web Components

Browser-native custom elements for Bison JIB operator onboarding, WIO onboarding, bank account linking, payment management, underwriting history, and invoice UI flows.

This repository is currently a mix of:

- legacy embeddable components built around `api.js` and `/api/embeddable/*`
- newer Bison-branded experiences with Enverus lookup, KYB endpoints, and operator bank-account endpoints

## Current State

- The repo is plain JavaScript and Shadow DOM. There is no build step, no framework runtime, and no package scripts.
- `package.json` is `type: "module"`, so the components should be loaded as ES modules.
- `component.js` is the main barrel entry point, but it does **not** load every component in the repo.
- Several files still contain development defaults. In practice, you should pass your own API base URL and embeddable key instead of relying on fallback values.

## Loading The Components

### Browser

```html
<script>
  window.BISON_JIB_PAY_CONFIG = {
    apiBaseURL: "https://your-api.example.com",
    embeddableKey: "your-embeddable-key",
  };
</script>

<script type="module">
  import "./component.js";

  // Not included by component.js today:
  import "./wio-onboarding.js";
  import "./bison-operator-onboarding.js";
</script>
```

### Bundler

```js
import "./component.js";
import "./wio-onboarding.js";
import "./bison-operator-onboarding.js";
```

## Barrel Coverage

`component.js` currently imports and registers:

- `api.js`
- `operator-onboarding.js`
- `operator-payment.js`
- `operator-underwriting.js`
- `operator-management.js`
- `wio-payment.js`
- `wio-payment-linking.js`
- `operator-bank-account.js`
- `wio-bank-account.js`
- `bison-operator-payments.js`
- `bison-wio-invoices.js`

`component.js` currently does **not** import:

- `wio-onboarding.js`
- `bison-operator-onboarding.js`

If you need either of those, import them directly.

## Shared Configuration

There is no single normalized config contract across all files yet.

- Most legacy components use `api-base-url` and `embeddable-key`.
- `operator-bank-account` uses `api-url` instead of `api-base-url`.
- Bison-branded components use `x-embeddable-key`.
- Bison-branded components can also read `window.BISON_JIB_PAY_CONFIG = { apiBaseURL, embeddableKey }`.
- Some Bison components can reuse `window.__bisonApi` if an API instance is already present.

Recommended rule: always pass the API URL and embeddable key explicitly.

## Component Map

| File / Element | In `component.js` | Main Inputs | What It Does |
| --- | --- | --- | --- |
| `api.js` / `BisonJibPayAPI` | Yes | `baseURL`, `embeddableKey` | Shared API client for validation, registration, Plaid, Moov, underwriting, operator lookup, and bank-account endpoints. |
| `operator-onboarding.js` / `<operator-onboarding>` | Yes | `on-success`, `on-error`, `on-submit`, `on-load`, `api-base-url`, `embeddable-key` | Legacy operator onboarding modal with a 4-step form. |
| `operator-management.js` / `<operator-management>` | Yes | `operator-email`, `api-base-url`, `embeddable-key` | Checks whether the operator already has an account and switches between onboarding and underwriting. |
| `operator-underwriting.js` / `<operator-underwriting>` | Yes | `operator-email`, `api-base-url`, `embeddable-key` | Validates the operator, resolves `moovAccountId`, and shows underwriting history in a modal. |
| `operator-payment.js` / `<operator-payment>` | Yes | `operator-email`, `operator-id`, `api-base-url`, `embeddable-key` | Legacy operator payment-method manager with existing-account listing, delete flows, and Moov drop linking. |
| `operator-bank-account.js` / `<operator-bank-account>` | Yes | `email`, `operator-id`, `client-id`, `api-url`, `embeddable-key` | Narrower operator add-bank button that verifies the operator and opens Moov directly. |
| `wio-onboarding.js` / `<wio-onboarding>` | No | `on-success`, `on-error`, `on-submit`, `on-load`, `on-done`, `done-button-text`, `api-base-url`, `embeddable-key` | Inline WIO onboarding flow with business, representative, and verification-document steps. |
| `wio-payment.js` / `<wio-payment>` | Yes | `wio-email`, `env`, `redirect-url`, `on-success`, `on-error`, `api-base-url`, `embeddable-key` | WIO bank-account linking via `moov-payment-methods` configured for Plaid. |
| `wio-payment-linking.js` / `<wio-payment-linking>` | Yes | `email`, `button-text`, `api-base-url`, `embeddable-key` | WIO modal for listing linked bank accounts, launching Plaid Link, and deleting payment methods. |
| `wio-bank-account.js` / `<wio-bank-account>` | Yes | `email`, `button-text`, `api-base-url`, `embeddable-key` | Button-only Plaid flow that adds the selected WIO bank account to Moov. |
| `bison-operator-onboarding.js` / `<bison-operator-onboarding>` | No | `op-org-id`, `x-embeddable-key`, `api-base-url` | New Bison-branded operator verification and bank-account setup experience. |
| `bison-operator-payments.js` / `<bison-operator-payments>` | Yes | `op-org-id` or `org-number`, `x-embeddable-key`, `api-base-url` | New Bison-branded bank-account management modal with Enverus lookup, Plaid linking, manual entry, and unlink flows. |
| `bison-wio-invoices.js` / `<bison-wio-invoices>` | Yes | `open` | UI-only invoice review and bulk-pay/delete modal backed by local mock data. |

## Internal Workflow Map

### Legacy Operator Flow

#### `operator-management`

`operator-management` is the router for the older operator flow.

1. It takes `operator-email`.
2. It calls `getAccountByEmail`.
3. If an account exists, it switches to `operator-underwriting`.
4. If no account exists, it switches to `operator-onboarding`.
5. It forwards important child events like onboarding completion and underwriting readiness.

#### `operator-onboarding`

`operator-onboarding` is a legacy modal-based 4-step flow:

1. Business details
2. Representatives
3. Bank account
4. Underwriting documents

Current behavior:

- Supports `onLoad` prefill data.
- Supports `onSubmit` as a pre-submit interception point.
- Submits to `registerOperator`.
- Emits `formComplete`, `submissionFailed`, `onboardingConfirmed`, `onboarding-modal-open`, and `onboarding-modal-close`.
- Uses callback properties `onSuccess`, `onError`, `onSubmit`, and `onConfirm`.

#### `operator-underwriting`

`operator-underwriting` is a read-focused modal flow:

1. Resolve operator by email.
2. Cache `moovAccountId`.
3. Open a modal on user action.
4. Load underwriting history with `fetchUnderwritingByAccountId`.

It emits:

- `underwriting-ready`
- `underwriting-error`
- `underwriting-modal-open`
- `underwriting-modal-close`
- `underwriting-history-loaded`
- `underwriting-history-error`

#### `operator-payment`

`operator-payment` is the legacy operator bank-account manager.

Current internal sequence:

1. Validate `operator-email` and `operator-id`.
2. Call `verifyOperator`.
3. Resolve `moovAccountId` from `getAccountByEmail`.
4. Pre-fetch a Moov access token.
5. Fetch and render linked payment methods.
6. Open the Moov drop to add another account.
7. Support delete flows for linked accounts.

Important events:

- `payment-linking-ready`
- `payment-linking-success`
- `payment-linking-error`
- `payment-linking-close`
- `payment-method-delete`
- `payment-method-deleted`
- `payment-method-delete-error`
- `moov-link-success`
- `moov-link-error`
- `moov-link-close`

#### `operator-bank-account`

`operator-bank-account` is the smallest operator flow:

1. Verify the operator using `email`, `operator-id`, or `client-id`.
2. Resolve `moovAccountId`.
3. Generate a Moov token.
4. Open `moov-payment-methods`.

Callback properties:

- `onSuccess`
- `onFail`

Important events:

- `operator-bank-account-ready`
- `operator-bank-account-error`
- `bank-account-added`
- `bank-account-error`
- `moov-drop-close`

### Legacy WIO Flow

#### `wio-onboarding`

`wio-onboarding` is an inline 3-step flow:

1. Business details
2. Representative details
3. Business verification documents

Current behavior:

- Submits through `registerWIO`.
- Supports `onLoad` data hydration.
- Supports `onSuccess`, `onError`, `onSubmit`, `onConfirm`, and `onDone`.
- Supports `done-button-text`.
- Emits `formComplete`, `submissionFailed`, and `onboardingConfirmed`.

#### `wio-payment`

`wio-payment` is the direct Moov + Plaid embed.

Current internal sequence:

1. Generate a Plaid token with `generatePlaidToken`.
2. Generate a Moov token with `generateMoovToken`.
3. Configure `moov-payment-methods` for Plaid.
4. Return success through the `onSuccess` callback when `onResourceCreated` fires.

It emits `payment-error` on failures. Success is callback-first.

#### `wio-payment-linking`

`wio-payment-linking` is the richer WIO modal manager.

Current internal sequence:

1. Resolve the WIO account by email.
2. Fetch existing payment methods.
3. Open a modal for account management.
4. Launch Plaid Link for new bank accounts.
5. Support delete confirmation for existing methods.

Important events:

- `payment-linking-success`
- `payment-linking-error`
- `payment-linking-close`
- `payment-method-delete`
- `payment-method-deleted`
- `payment-method-delete-error`
- `payment-account-search-error`
- `plaid-link-success`
- `plaid-link-error`

#### `wio-bank-account`

`wio-bank-account` is the narrow button-only WIO bank-linking flow.

Current internal sequence:

1. Resolve the WIO account by email.
2. Generate a Plaid Link token.
3. Launch Plaid.
4. Exchange the selected account into Moov with `addPlaidAccountToMoov`.

Callback property:

- `onPlaidSuccess`

Important events:

- `plaid-link-success`
- `plaid-link-error`

### Bison-Branded Flow

#### `bison-operator-onboarding`

`bison-operator-onboarding` is the most complete workflow in the repo right now.

Current internal sequence:

1. Require `op-org-id` plus an embeddable key.
2. Resolve operator data from Enverus.
3. Hydrate empty business fields from lookup results.
4. Load the industry catalog.
5. Load KYB status and saved payment-method selections.
6. Load operator bank accounts.
7. Drive the verification experience across these sections:
   - business profile
   - control officer
   - beneficial owners
   - processing volume
   - bank account
   - documents
8. Split the UI into `verification` and `bank-account` tabs.
9. Support Plaid linking, manual bank entry, default-account selection, and unlinking inside the bank section.

Current public surface:

- attributes: `op-org-id`, `x-embeddable-key`, `api-base-url`
- methods: `open()`, `close()`
- callbacks: `onLookupSuccess`, `onLookupError`
- optional property hook: `onBankLinked`
- event: `bop-operator-lookup`

It can use:

- a consumer-supplied `fetchOperatorFromEnverus` handler
- a shared `window.__bisonApi`
- `window.BisonJibPayAPI`
- or its own built-in Enverus lookup fallback

#### `bison-operator-payments`

`bison-operator-payments` is the newer standalone bank-account management modal.

Current internal sequence:

1. Require `op-org-id` or `org-number` plus `x-embeddable-key`.
2. Resolve the operator through Enverus lookup.
3. Fetch operator bank accounts.
4. Open a branded modal.
5. Support:
   - account selection
   - Plaid Link bank linking
   - retry after embeddable Plaid registration failures
   - manual bank entry modal
   - unlink confirmation
   - success state

Current public surface:

- attributes: `op-org-id`, `org-number`, `x-embeddable-key`, `api-base-url`
- methods: `open()`, `close()`
- events: `bop-operator-lookup`, `bop-close`, `bop-success`
- callbacks: `onOpen`, `onClose`, `onLookupSuccess`, `onLookupError`, `onBankFetchSuccess`, `onBankFetchError`, `onLinkSuccess`, `onLinkError`, `onUnlinkSuccess`, `onUnlinkError`

#### `bison-wio-invoices`

`bison-wio-invoices` is currently UI-only.

Current internal sequence:

1. Render a trigger button.
2. Open an animated invoice modal.
3. Support list search, single-invoice review, multi-select, bulk pay, and bulk delete confirmation.
4. Operate entirely on local mock invoice data in the component file.

There is no live API integration in this component yet.

## API Client

`api.js` exports `BisonJibPayAPI` and also places it on `window.BisonJibPayAPI`.

```js
import { BisonJibPayAPI } from "./api.js";

const api = new BisonJibPayAPI(
  "https://your-api.example.com",
  "your-embeddable-key",
);
```

Core methods currently exposed:

- Account validation and lookup:
  - `validateOperatorEmail`
  - `validateUserEmail`
  - `verifyOperator`
  - `verifyWio`
  - `getAccountByEmail`
  - `getAccountByOperatorId`
  - `getAccountByClientId`
- Registration:
  - `registerOperator`
  - `registerWIO`
- Plaid and Moov:
  - `generateMoovToken`
  - `generatePlaidToken`
  - `createPlaidLinkToken`
  - `generatePlaidLinkToken`
  - `registerPlaidBankAccount`
  - `registerEmbeddablePlaidBankAccount`
  - `retryEmbeddablePlaidRegistration`
  - `createProcessorToken`
  - `addPlaidAccountToMoov`
- Payment methods:
  - `getPaymentMethodsByAccountId`
  - `getPaymentMethods`
  - `deletePaymentMethodByAccountId`
  - `deletePaymentMethodById`
- Underwriting:
  - `fetchUnderwritingByAccountId`
- Operator lookup and operator bank accounts:
  - `findOperatorFromEnverus`
  - `getOperatorBankAccounts`
  - `addOperatorBankAccount`
  - `addOperatorManualBankAccount`
  - `deleteOperatorBankAccount`
  - `unlinkOperatorBankAccount`
  - `setOperatorBankAccountDefault`

## Practical Usage Examples

### Legacy Operator Router

```html
<operator-management
  operator-email="operator@example.com"
  api-base-url="https://your-api.example.com"
  embeddable-key="your-embeddable-key"
></operator-management>

<script type="module">
  import "./component.js";

  await customElements.whenDefined("operator-management");

  const el = document.querySelector("operator-management");
  el.onboardingSuccess = (data) => console.log("Onboarding complete", data);
  el.addEventListener("management-mode-determined", (event) => {
    console.log("Mode:", event.detail.mode);
  });
</script>
```

### Bison Operator Onboarding

```html
<script>
  window.BISON_JIB_PAY_CONFIG = {
    apiBaseURL: "https://your-api.example.com",
    embeddableKey: "your-embeddable-key",
  };
</script>

<script type="module">
  import "./component.js";
  import "./bison-operator-onboarding.js";
</script>

<bison-operator-onboarding op-org-id="12345"></bison-operator-onboarding>
```

### Bison Operator Payments

```html
<bison-operator-payments
  op-org-id="12345"
  x-embeddable-key="your-embeddable-key"
  api-base-url="https://your-api.example.com"
></bison-operator-payments>

<script type="module">
  import "./component.js";

  await customElements.whenDefined("bison-operator-payments");

  const el = document.querySelector("bison-operator-payments");
  el.onLinkSuccess = (account) => console.log("Linked", account);
  el.onUnlinkSuccess = (accounts) => console.log("Unlinked", accounts);
</script>
```

## Caveats

- Load the files as ES modules. The old non-module README examples are outdated for the current codebase.
- `component.js` is only a partial barrel. `wio-onboarding.js` and `bison-operator-onboarding.js` still need direct imports.
- Config naming is inconsistent across components: `embeddable-key`, `x-embeddable-key`, `api-base-url`, and `api-url` all exist.
- Some legacy onboarding components read config attributes at construction time but do not observe later changes to those config attributes.
- The repo currently contains both legacy and newer Bison experiences. They overlap in purpose but do not share one unified API shape yet.
- `bison-wio-invoices` is mock-data UI only.
- `test.js` and `test.mjs` are simple API probes, not a real automated test suite.
