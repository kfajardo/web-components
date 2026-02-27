/**
 * BisonOperatorPayments Web Component
 *
 * Drop-in embeddable payment linking modal.
 * Ported from embeddable/link-bank-account with animations preserved.
 * Uses Shadow DOM with inline styles following the suite pattern.
 *
 * ATTRIBUTES:
 *   open – boolean, controls visibility
 *
 * EVENTS:
 *   bop-close   – emitted when the user closes the modal
 *   bop-success – emitted on successful link, detail: { bankName, accountType, lastFour }
 *
 * @author @kfajardo
 * @version 1.0.0
 */

const BOP_BISON_LOGO = 'data:image/png;base64,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';
const BOP_BANKS = [
  { id: 'column', name: 'Column', bg: '#2563eb', logo: 'data:image/webp;base64,UklGRo4EAABXRUJQVlA4IIIEAADQJQCdASrIAMgAPjEYikOiIaESynxIIAMEs7dwuZ1mfbbyf9bv6EjLhT0o7frzAecmThWHxnmv7wDLZTwKhEWVszsp4FQiLK2Z2U8CoAYHdb1FyfKwcyAvtZKhmzMQSUkX1hDNlWUo1xG/MvAqAIUPlSz0acNJIcHJAJy+ivRfBtU1Z/w1jgLBTwSdeUz0KuNFIqihDq1U5wtIROb4RbrcGstLGqG09CNfPZoMGyc5Dc7oG+M8RLHjBiYg8ocJqFnBhqVz91eATvib57qJwO6aGJ/AdhZ0/PG8/9TzH0Y7DCyd0tEtIFWk1lbMvf31T5Q3ujiIRXKWQA3SSIbeEynin4eoY3lWd3wVBM1AVCIFIjLNJ06OE0VEmg/6iTHTjsgj1UlPArNNhAqERZWzOyngVCIsrZnY0AD+/zpn//+2h/+tD/9aH+Ln//5Bjxu8bprgAANIFMnvK97f+Ocf625lz4qecTpAln1+EgNH0XafLP9v+4Q0Z+d5bHqp3j4UKo1Do0ogL+UyH6v8TZ0FT+NuXrzP/pkDZnqpixf0hQnUExChC0Q5ZGH5jxarFFhlhN2xMWzddI4im3tOtbqWkSiX34Sk5Cn/oa/pzlAj+1Z7+D+aVTl18MYs6vw+SbmUMQ4H9EfJ6vFVOs6Rn+y5RD8dAYB2mN2UKdmxuxqQLFOuFoH9zGCozB9SjacV4gUX0j5Z5PsHlRZoCth7KSpyRs+xp5tDMMfe3zOPea03PuJE1BJDZi2icCrlz9e9UkEYCgXM1XDAbEHNKN38CS4kHgLEqKjd4CZ6h7Tsg8v/ZaDGaODkm+/57hPvrZJBf+rA/uxNslwmOLriu3OK5TKwuT7ynS/h+vlmNYEST8KgNeuEByWjTdunfORavneYy5lhI9akGBlGgkh7YEHOlDaL19CFHOri3pO8K+pv+5LFYo8C5eVVXQo9n2UavnkEkk8Nf7b0669sSzL+7bnehT/pH5Jn/x/53dtME2+2ijNgFmL26ibzskf52xaK1VjIiDSVOXWh6Zsf444o2Qy0n38LXhFGhf78GtA/KwPGuF0moTkcsJZkGxFv8z9rAmJKS+PLPfDvJeyegzkfrI4YCdcCGnvXT9RBwBskcY3ZtNJGx41DVGUCr2tIZvKmXXWPR7vvyfmbS0EqJcD0IrGd4gLXPkZJA/BeAw3Q7sSR/Jiy+L6vD3m5/wete8XXQitH3savoIxtgpoHEGWQNZiDyxNWhG7YTvED/PtDzJeifaxt3MDdtHBs7bXdX8EC1vKxZ1l9vtXI6LZcd7kQONBYygMp+/B7+9PGNlIkPgCZ7/JNAKirsm1rKscJThY3hIdFwfMDh0ERh9fHV0U5/cyO5G4hexQ58X47WQhq+XuJNssRAgiTTDS+s8gU4hArLi6ZogddiwDtcGz8SAJV+CRF7cVAgoYM3U5jfY7v8W4TAax6VVCElRPdbNIodskBfgzlsm0nF6n6Nr0ntcFlVrKAOxLcyNOHIyqd+rXAa6BWTYcjIwsP4yT6kieJqzk4W0rH+egAAAAAAA==' },
  { id: 'moov', name: 'Moov', bg: '#76d657', logo: 'data:image/webp;base64,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' },
];

const BOP_BRAND_BANK = {
  id: 'bison',
  name: 'Bison',
  bg: 'linear-gradient(135deg,#4c7b63 0%,#3f6c56 48%,#5a8c72 100%)',
  text: '#4c7b63',
  logo: BOP_BISON_LOGO,
};

const BOP_ICONS = {
  x: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  building: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  buildingSm: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  buildingLg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  alert: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
  loader: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>',
  checkSm: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  unlink: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
};

class BisonOperatorPayments extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._step = 'select-accounts';
    this._direction = 1;
    this._searchQuery = '';
    this._selectedBank = BOP_BRAND_BANK;
    this._isLoading = false;
    this._mockAccounts = [];
    this._selectedAccounts = new Set();
    this._linkedAccount = null;
    this._isClosing = false;
    this._unlinkTarget = null;
    this._unlinkResult = null; // { succeeded: [], failed: [] }
    // Link Account modal state
    this._linkModalOpen = false;
    this._linkModalSubmitting = false;
    this._linkModalResult = null; // null | 'success' | 'error'
    this._linkModalFieldErrors = {}; // { accountName, accountNumber, routingNumber }
    this._linkModalValues = { accountName: '', accountNumber: '', routingNumber: '' };
    this._linkModalDirty = false;
    this._linkModalBeforeUnload = null;
    this._linkModalPopState = null;
    // Accounts list fetch state
    this._isFetchingAccounts = false;
    this._pendingLinkedAccount = null; // Holds new account data post-link until refetch completes
    // Operator lookup state (Enverus)
    this._operatorData = null;          // Holds successful Enverus lookup response
    this._operatorLookupError = null;   // Holds error from failed lookup
    this._isOperatorLookupPending = false; // True while lookup is in-flight
    this._componentDisabled = true;     // Disabled until a valid operator is resolved
  }

  static get observedAttributes() { return ['open', 'org-number', 'op-org-id']; }

  connectedCallback() {
    this._injectStyles();
    this._renderTrigger();
    // Evaluate initial attribute state on connect
    this._evaluateOperatorAttributes();
    if (this.isOpen) this._renderModal();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open') {
      if (newVal !== null) { this._isClosing = false; this._render(); }
      else { this._animateClose(); }
    }
    if (name === 'org-number' || name === 'op-org-id') {
      if (oldVal !== newVal) {
        this._log(`Attribute changed: ${name} → "${newVal}" (was "${oldVal}")`);
        this._evaluateOperatorAttributes();
      }
    }
  }

  get isOpen() { return this.hasAttribute('open'); }

  // ==================== OPERATOR LOOKUP (Enverus) ====================

  /**
   * Evaluates the current orgNumber / opOrgId attributes and triggers
   * the Enverus operator lookup if at least one is present.
   * Priority: opOrgId > orgNumber
   */
  _evaluateOperatorAttributes() {
    const opOrgId  = (this.getAttribute('op-org-id')  || '').trim();
    const orgNumber = (this.getAttribute('org-number') || '').trim();

    if (!opOrgId && !orgNumber) {
      this._log('Both op-org-id and org-number are empty → component DISABLED');
      this._operatorData = null;
      this._operatorLookupError = null;
      this._componentDisabled = true;
      this._updateTriggerState();
      this._dispatchLookupEvent({ status: 'disabled', reason: 'Both opOrgId and orgNumber are empty' });
      return;
    }

    // Determine which identifier to use (opOrgId takes priority)
    const lookupKey = opOrgId ? 'opOrgId' : 'orgNumber';
    const lookupVal = opOrgId || orgNumber;
    this._log(`Operator lookup initiated via ${lookupKey}="${lookupVal}"`);
    this._performOperatorLookup(opOrgId || null, orgNumber || null);
  }

  /**
   * Calls findOperatorFromEnverus on the API and handles success/error.
   * Requires window.BisonJibPayAPI or a pre-wired this._api instance.
   */
  async _performOperatorLookup(opOrgId, orgNumber) {
    // Resolve API instance — consumers can set this._api externally,
    // or the component falls back to a global instance on window.
    const api = this._api || (typeof window !== 'undefined' && window.__bisonApi);
    if (!api || typeof api.findOperatorFromEnverus !== 'function') {
      const msg = 'No API instance available — set component._api or window.__bisonApi';
      this._log(`ERROR: ${msg}`);
      this._operatorData = null;
      this._operatorLookupError = msg;
      this._componentDisabled = true;
      this._updateTriggerState();
      this._dispatchLookupEvent({ status: 'error', error: msg });
      return;
    }

    this._isOperatorLookupPending = true;
    this._componentDisabled = true; // Stay disabled while in-flight
    this._updateTriggerState();

    try {
      const result = await api.findOperatorFromEnverus(opOrgId, orgNumber);
      this._log('Operator lookup SUCCESS', result);
      this._operatorData = result;
      this._operatorLookupError = null;
      this._componentDisabled = false;
      this._dispatchLookupEvent({ status: 'success', data: result });
    } catch (err) {
      const errData = err?.data || err;
      this._log('Operator lookup ERROR', errData);
      this._operatorData = null;
      this._operatorLookupError = errData;
      this._componentDisabled = true;
      this._dispatchLookupEvent({ status: 'error', error: errData });
    } finally {
      this._isOperatorLookupPending = false;
      this._updateTriggerState();
    }
  }

  /** Updates the trigger button disabled/enabled state based on _componentDisabled. */
  _updateTriggerState() {
    const btn = this.shadowRoot?.querySelector('.bop-trigger-btn');
    if (!btn) return;
    btn.disabled = this._componentDisabled;
    if (this._componentDisabled) {
      btn.setAttribute('aria-disabled', 'true');
    } else {
      btn.removeAttribute('aria-disabled');
    }
  }

  /** Emit a custom event with operator-lookup details for external consumers / debug logs. */
  _dispatchLookupEvent(detail) {
    this.dispatchEvent(new CustomEvent('bop-operator-lookup', {
      bubbles: true, composed: true, detail,
    }));
  }

  /** Internal dev-friendly logger, prefixed for easy identification. */
  _log(msg, data) {
    const prefix = '[BOP]';
    if (data !== undefined) {
      console.log(prefix, msg, data);
    } else {
      console.log(prefix, msg);
    }
  }

  _generateMockAccounts() {
    const bankId = this._selectedBank?.id;
    const accountsByProvider = {
      bison: [
        { id: 'bis-1', type: 'Checking',         bankName: 'Chase',           lastFour: '4821', balance: 0 },
        { id: 'bis-2', type: 'Savings',          bankName: 'Bank of America', lastFour: '3390', balance: 0, cannotUnlink: true },
        { id: 'bis-3', type: 'Business Checking', bankName: 'Wells Fargo',    lastFour: '9154', balance: 0 },
        { id: 'bis-4', type: 'Business Savings', bankName: 'Citibank',        lastFour: '2289', balance: 0 },
      ],
      column: [
        { id: 'col-1', type: 'Checking',         bankName: 'Chase',           lastFour: '4821', balance: 0 },
        { id: 'col-2', type: 'Savings',           bankName: 'Bank of America', lastFour: '3390', balance: 0, cannotUnlink: true },
        { id: 'col-3', type: 'Business Checking', bankName: 'Wells Fargo',     lastFour: '9154', balance: 0 },
        { id: 'col-4', type: 'Business Savings',  bankName: 'Citibank',        lastFour: '2289', balance: 0 },
      ],
      moov: [
        { id: 'moov-1', type: 'Checking',         bankName: 'US Bank',         lastFour: '1107', balance: 0 },
        { id: 'moov-2', type: 'Savings',           bankName: 'PNC Bank',        lastFour: '5534', balance: 0 },
        { id: 'moov-3', type: 'Business Checking', bankName: 'TD Bank',         lastFour: '8862', balance: 0, cannotUnlink: true },
        { id: 'moov-4', type: 'Business Savings',  bankName: 'Truist',          lastFour: '2275', balance: 0 },
      ],
    };
    return (accountsByProvider[bankId] ?? [
      { id: `${bankId}-1`, type: 'Checking', bankName: 'Chase',           lastFour: String(Math.floor(1000 + Math.random() * 9000)), balance: 0 },
      { id: `${bankId}-2`, type: 'Savings',  bankName: 'Bank of America', lastFour: String(Math.floor(1000 + Math.random() * 9000)), balance: 0 },
    ]);
  }

  _resetState() {
    this._step = 'select-accounts'; this._direction = 1; this._searchQuery = '';
    this._selectedBank = BOP_BRAND_BANK;
    this._isLoading = false;
    this._mockAccounts = []; this._selectedAccounts = new Set(); this._linkedAccount = null;
    this._unlinkTarget = null;
    this._unlinkResult = null;
    this._isFetchingAccounts = false;
    this._pendingLinkedAccount = null;
    this._resetLinkModal();
  }

  _resetLinkModal() {
    this._linkModalOpen = false;
    this._linkModalSubmitting = false;
    this._linkModalResult = null;
    this._linkModalFieldErrors = {};
    this._linkModalValues = { accountName: '', accountNumber: '', routingNumber: '' };
    this._linkModalDirty = false;
    this._removeLinkModalGuards();
  }

  _installLinkModalGuards() {
    this._linkModalBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    this._linkModalPopState = (e) => {
      if (this._linkModalSubmitting) {
        // Push state back so the navigation doesn't actually go back
        history.pushState(null, '', window.location.href);
        window.alert('Please wait — your account is being linked. You cannot navigate away right now.');
      }
    };
    window.addEventListener('beforeunload', this._linkModalBeforeUnload);
    window.addEventListener('popstate', this._linkModalPopState);
    // Push a dummy state so we can intercept the back button
    history.pushState(null, '', window.location.href);
  }

  _removeLinkModalGuards() {
    if (this._linkModalBeforeUnload) {
      window.removeEventListener('beforeunload', this._linkModalBeforeUnload);
      this._linkModalBeforeUnload = null;
    }
    if (this._linkModalPopState) {
      window.removeEventListener('popstate', this._linkModalPopState);
      this._linkModalPopState = null;
    }
  }

  _navigateStep(newStep, dir) {
    const old = this.shadowRoot.querySelector('.bop-step:not(.bop-hidden)');
    this._direction = dir;
    if (old) {
      old.setAttribute('data-exit', dir > 0 ? 'forward' : 'backward');
      old.addEventListener('animationend', () => {
        this._step = newStep; this._renderContent(); this._renderHeader();
      }, { once: true });
    } else {
      this._step = newStep; this._renderContent(); this._renderHeader();
    }
  }

  _handleClose() {
    if (this._linkModalOpen && this._linkModalSubmitting) {
      // Submitting — cannot close (keep native alert for this blocking case)
      window.alert('Please wait — your account is being linked. You cannot close this window right now.');
      return;
    }
    if (this._linkModalOpen && this._linkModalDirty && !this._linkModalResult) {
      this._showLinkConfirmDialog(
        'You have unsaved changes. If you close now, your progress will be lost.',
        () => { this._forceLinkModalClose(); this._animateClose(); }
      );
      return;
    }
    if (this._linkModalOpen) this._forceLinkModalClose();
    this._animateClose();
  }

  _animateClose() {
    const overlay = this.shadowRoot.querySelector('.bop-overlay');
    if (!overlay || this._isClosing) return;
    this._isClosing = true;
    overlay.setAttribute('data-state', 'closing');
    const modal = overlay.querySelector('.bop-modal');
    if (modal) {
      modal.addEventListener('animationend', () => {
        this._isClosing = false; this.removeAttribute('open');
        setTimeout(() => this._resetState(), 50); this._render();
        this.dispatchEvent(new CustomEvent('bop-close', { bubbles: true, composed: true }));
      }, { once: true });
    } else {
      this._isClosing = false; this.removeAttribute('open'); this._resetState(); this._render();
      this.dispatchEvent(new CustomEvent('bop-close', { bubbles: true, composed: true }));
    }
  }

  _handleBankSelect(bank) {
    this._selectedBank = bank;
    this._navigateStep('loading', 1);
  }

  _handleAccountToggle(id) {
    if (this._selectedAccounts.has(id)) this._selectedAccounts.delete(id);
    else this._selectedAccounts.add(id);
    // Update selection state in-place without re-rendering
    if (this._accountListEl) {
      this._accountListEl.querySelectorAll('.bop-account-card').forEach(card => {
        const cardId = card.dataset.accountId;
        card.setAttribute('data-selected', String(this._selectedAccounts.has(cardId)));
      });
    }
    this._renderAccountsButton();
  }

  async _handleLinkAccounts() {
    if (this._selectedAccounts.size === 0) return;
    this._isLoading = true; this._renderAccountsButton();
    await new Promise(r => setTimeout(r, 1200));
    const firstId = Array.from(this._selectedAccounts)[0];
    const account = this._mockAccounts.find(a => a.id === firstId);
    if (account) this._linkedAccount = account;
    this._isLoading = false;
    // Animated shrink transition to compact success view
    const modal = this.shadowRoot.querySelector('.bop-modal');
    this._contentEl.classList.add('bop-content-fading');
    setTimeout(() => {
      this._contentEl.innerHTML = '';
      if (modal) {
        const currentH = modal.getBoundingClientRect().height;
        modal.style.height = currentH + 'px';
        modal.classList.remove('bop-modal-wide');
        modal.classList.add('bop-modal-compact');
        modal.offsetHeight; // force reflow
        modal.style.height = '480px';
      }
      this._step = 'success';
      this._renderHeader();
      setTimeout(() => {
        this._renderSuccess();
        requestAnimationFrame(() => {
          this._contentEl.classList.remove('bop-content-fading');
          if (modal) modal.style.height = '';
        });
      }, 400);
    }, 200);
  }

  _handleDone() {
    if (this._linkedAccount && this._selectedBank) {
      this.dispatchEvent(new CustomEvent('bop-success', {
        bubbles: true, composed: true,
        detail: { bankName: this._selectedBank.name, accountType: this._linkedAccount.type, lastFour: this._linkedAccount.lastFour },
      }));
    }
    this._handleClose();
  }

  _handleBack() {
    if (this._step === 'confirm-unlink') {
      this._unlinkTarget = null;
      this._navigateStep('select-accounts', -1);
    } else if (this._step === 'unlink-result') {
      this._unlinkResult = null;
      this._navigateStep('select-accounts', -1);
    } else if (this._step === 'select-accounts') {
      this._handleClose();
    }
  }

  _handleUnlinkRequest(accounts) {
    this._unlinkTarget = accounts;
    this._navigateStep('confirm-unlink', 1);
  }

  async _handleConfirmUnlink() {
    if (!this._unlinkTarget || this._unlinkTarget.length === 0) return;
    this._isLoading = true;
    this._renderContent();
    await new Promise(r => setTimeout(r, 1400));

    // Process each account individually — flag cannotUnlink ones as failures
    const succeeded = [];
    const failed = [];
    this._unlinkTarget.forEach(acct => {
      if (acct.cannotUnlink) {
        failed.push({ ...acct, reason: 'This bank account may not be unlinked at this time.' });
      } else {
        succeeded.push(acct);
      }
    });

    // Remove successfully unlinked accounts from the list
    const succeededIds = new Set(succeeded.map(a => a.id));
    this._mockAccounts = this._mockAccounts.filter(a => !succeededIds.has(a.id));
    this._selectedAccounts = new Set();
    this._isLoading = false;
    this._unlinkTarget = null;

    if (failed.length === 0) {
      // All succeeded — go straight back to list
      this._navigateStep('select-accounts', -1);
    } else {
      // Partial or full failure — show result screen
      this._unlinkResult = { succeeded, failed };
      this._navigateStep('unlink-result', 1);
    }
  }

  _handleCancelUnlink() {
    this._unlinkTarget = null;
    this._navigateStep('select-accounts', -1);
  }

  _handleLinkAccountClick() {
    this._openLinkModal();
  }

  _getHeaderTitle() {
    switch (this._step) {
      case 'loading': return this._selectedBank?.name || 'Connecting';
      case 'select-accounts': return 'Manage Accounts';
      case 'confirm-unlink': return 'Unlink Account';
      case 'unlink-result': return this._unlinkResult?.succeeded.length > 0 ? 'Partial Unlink' : 'Unable to Unlink';
      case 'success': return 'Account Linked';
      default: return '';
    }
  }

  // ==================== LINK ACCOUNT MODAL ====================

  _openLinkModal() {
    this._linkModalOpen = true;
    this._linkModalResult = null;
    this._linkModalFieldErrors = {};
    this._linkModalValues = { accountName: '', accountNumber: '', routingNumber: '' };
    this._linkModalDirty = false;
    this._linkModalSubmitting = false;
    this._renderLinkModal();
  }

  _closeLinkModal(force = false) {
    if (!force && this._linkModalSubmitting) {
      window.alert('Please wait — your account is being linked. You cannot close this window right now.');
      return;
    }
    if (!force && this._linkModalDirty && !this._linkModalResult) {
      this._showLinkConfirmDialog(
        'You have unsaved changes. If you go back now, your progress will be lost.',
        () => this._forceLinkModalClose()
      );
      return;
    }
    this._forceLinkModalClose();
  }

  // Closes the link modal unconditionally — bypasses dirty/submitting guards.
  _forceLinkModalClose() {
    const wasSuccess = this._linkModalResult === 'success';
    this._removeLinkModalGuards();
    this._linkModalOpen = false;
    this._linkModalSubmitting = false;
    this._linkModalResult = null;
    this._linkModalFieldErrors = {};
    this._linkModalValues = { accountName: '', accountNumber: '', routingNumber: '' };
    this._linkModalDirty = false;
    const existing = this.shadowRoot.querySelector('.bla-overlay');
    if (existing) {
      existing.setAttribute('data-state', 'closing');
      const blaModal = existing.querySelector('.bla-modal');
      const doRemove = () => {
        existing.remove();
        // After a successful link, trigger a refetch of the accounts list.
        if (wasSuccess) this._refetchAccounts();
      };
      if (blaModal) {
        blaModal.addEventListener('animationend', doRemove, { once: true });
      }
      // Safety fallback
      setTimeout(doRemove, 350);
    }
  }

  // Simulates a post-link accounts refetch with a trailing loader in the list.
  // TODO: When integrating with the real API, replace the mock delay and
  //       _pendingLinkedAccount push below with an actual accounts list API
  //       call (e.g. GET /accounts). On response, replace this._mockAccounts
  //       with the fresh server data and call this._renderAccountCards().
  async _refetchAccounts() {
    if (!this._accountListEl) return;
    // Snapshot the IDs already visible before the refetch starts —
    // these accounts will NOT re-animate on either render pass.
    const existingIds = new Set(this._mockAccounts.map(a => a.id));
    this._isFetchingAccounts = true;
    this._renderAccountCards(existingIds); // Shows loader; existing cards rendered without animation
    await new Promise(r => setTimeout(r, 1200)); // Mocked network delay
    if (this._pendingLinkedAccount) {
      this._mockAccounts.push(this._pendingLinkedAccount);
      this._pendingLinkedAccount = null;
    }
    this._isFetchingAccounts = false;
    this._renderAccountCards(existingIds); // Only the new card fades in
  }

  // Shows a custom confirmation dialog layered inside the link account modal.
  _showLinkConfirmDialog(message, onConfirm) {
    // Remove any existing confirm dialog first
    const existingDialog = this.shadowRoot.querySelector('.bla-confirm-dialog');
    if (existingDialog) existingDialog.remove();

    const blaModal = this.shadowRoot.querySelector('.bla-modal');
    if (!blaModal) return;

    const dialog = document.createElement('div');
    dialog.className = 'bla-confirm-dialog';
    dialog.innerHTML = `
      <div class="bla-confirm-box">
        <p class="bla-confirm-msg">${message}</p>
        <div class="bla-confirm-actions">
          <button class="bla-confirm-btn bla-confirm-btn--danger" id="bla-confirm-yes">Discard & Leave</button>
          <button class="bla-confirm-btn bla-confirm-btn--ghost" id="bla-confirm-no">Keep Editing</button>
        </div>
      </div>
    `;

    dialog.querySelector('#bla-confirm-yes').addEventListener('click', () => {
      dialog.remove();
      onConfirm();
    });
    dialog.querySelector('#bla-confirm-no').addEventListener('click', () => {
      dialog.remove();
    });

    blaModal.appendChild(dialog);
  }

  async _handleLinkAccountSubmit() {
    const { accountName, accountNumber, routingNumber } = this._linkModalValues;
    const errors = {};
    if (!accountName.trim()) errors.accountName = 'Account name is required.';
    if (!accountNumber.trim()) errors.accountNumber = 'Account number is required.';
    else if (!/^\d{4,17}$/.test(accountNumber.trim())) errors.accountNumber = 'Enter a valid account number (4–17 digits).';
    if (!routingNumber.trim()) errors.routingNumber = 'Routing number is required.';
    else if (!/^\d{9}$/.test(routingNumber.trim())) errors.routingNumber = 'Routing number must be exactly 9 digits.';

    if (Object.keys(errors).length > 0) {
      this._linkModalFieldErrors = errors;
      this._renderLinkModal();
      return;
    }

    this._linkModalSubmitting = true;
    this._linkModalFieldErrors = {};
    this._installLinkModalGuards();
    this._renderLinkModal();

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1800));

      // TODO: Integrate with backend API.
      // On success, proceed to success screen.
      // On failure (e.g. HTTP 422 / validation error), handle like this:
      //   const apiErrors = response.errors; // e.g. { accountNumber: 'Account number already linked.' }
      //   this._linkModalSubmitting = false;
      //   this._linkModalFieldErrors = apiErrors; // Maps API field keys to error messages
      //   this._removeLinkModalGuards();
      //   this._linkModalResult = null;
      //   this._renderLinkModal(); // Re-render form with field-level errors highlighted in red
      //   return;                  // Fields will clear errors as the user edits them (onChange)

      this._linkModalSubmitting = false;
      this._removeLinkModalGuards();

      // Store the new account as pending — it will be added to the list after
      // the modal closes and the refetch completes (see _refetchAccounts).
      const submittedNum = this._linkModalValues.accountNumber.trim();
      const lastFour = submittedNum.length >= 4 ? submittedNum.slice(-4) : submittedNum.padStart(4, '0');
      this._pendingLinkedAccount = {
        id: `linked-${Date.now()}`,
        type: this._linkModalValues.accountName.trim() || 'Linked Account',
        lastFour,
        balance: 0,
      };

      this._linkModalResult = 'success';
      this._renderLinkModal();
    } catch (err) {
      this._linkModalSubmitting = false;
      this._removeLinkModalGuards();
      this._linkModalResult = 'error';
      this._renderLinkModal();
    }
  }

  _renderLinkModal() {
    const existing = this.shadowRoot.querySelector('.bla-overlay');
    if (existing) existing.remove();
    if (!this._linkModalOpen) return;

    const overlay = document.createElement('div');
    overlay.className = 'bla-overlay';
    overlay.setAttribute('data-state', 'open');

    // Clicking the backdrop only closes if not submitting
    const backdrop = document.createElement('div');
    backdrop.className = 'bla-backdrop';
    backdrop.addEventListener('click', () => this._closeLinkModal());
    overlay.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.className = 'bla-modal';
    overlay.appendChild(modal);

    // Header
    const header = document.createElement('div');
    header.className = 'bla-header';
    let headerTitle = 'Link Account';
    if (this._linkModalResult === 'success') headerTitle = 'Account Linked';
    if (this._linkModalResult === 'error') headerTitle = 'Something Went Wrong';
    header.innerHTML = `<div class="bla-header-left"><h2 class="bla-header-title">${headerTitle}</h2></div>`;

    if (!this._linkModalSubmitting) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'bla-close-btn';
      closeBtn.innerHTML = BOP_ICONS.x;
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.addEventListener('click', () => this._closeLinkModal());
      header.appendChild(closeBtn);
    }
    modal.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'bla-body';

    if (this._linkModalResult === 'success') {
      body.innerHTML = `
        <div class="bla-result bla-result-success">
          <div class="bla-result-icon-wrap bla-result-icon-wrap--success">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          </div>
          <h3 class="bla-result-title">Account Linked!</h3>
          <p class="bla-result-desc">Your bank account has been successfully connected. You can now use it for deposits and payments.</p>
        </div>
      `;
      const doneBtn = document.createElement('button');
      doneBtn.className = 'bla-btn';
      doneBtn.textContent = 'Done';
      doneBtn.addEventListener('click', () => this._closeLinkModal(true));
      body.appendChild(doneBtn);
    } else if (this._linkModalResult === 'error') {
      body.innerHTML = `
        <div class="bla-result bla-result-error">
          <div class="bla-result-icon-wrap bla-result-icon-wrap--error">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <h3 class="bla-result-title">Unable to Link Account</h3>
          <p class="bla-result-desc">We couldn't connect your account at this time. Please check your details and try again, or contact support if the issue persists.</p>
        </div>
      `;
      const retryBtn = document.createElement('button');
      retryBtn.className = 'bla-btn';
      retryBtn.textContent = 'Try Again';
      retryBtn.addEventListener('click', () => {
        this._linkModalResult = null;
        this._linkModalFieldErrors = {};
        this._renderLinkModal();
      });
      body.appendChild(retryBtn);
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'bla-btn bla-btn-ghost';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => this._closeLinkModal(true));
      body.appendChild(cancelBtn);
    } else {
      // Form view
      const desc = document.createElement('p');
      desc.className = 'bla-form-desc';
      desc.textContent = 'Enter your bank account details below to connect it to your account.';
      body.appendChild(desc);

      const form = document.createElement('form');
      form.className = 'bla-form';
      form.addEventListener('submit', (e) => { e.preventDefault(); this._handleLinkAccountSubmit(); });

      const fields = [
        { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g. My Business Checking' },
        { key: 'accountNumber', label: 'Account Number', type: 'text', inputmode: 'numeric', placeholder: 'Enter account number' },
        { key: 'routingNumber', label: 'Routing Number', type: 'text', inputmode: 'numeric', placeholder: '9-digit routing number' },
      ];

      fields.forEach(({ key, label, type, inputmode, placeholder }) => {
        const fieldWrap = document.createElement('div');
        fieldWrap.className = 'bla-field';

        const lbl = document.createElement('label');
        lbl.className = 'bla-label';
        lbl.textContent = label;
        lbl.setAttribute('for', `bla-${key}`);
        fieldWrap.appendChild(lbl);

        const err = this._linkModalFieldErrors[key];
        const inp = document.createElement('input');
        inp.className = 'bla-input' + (err ? ' bla-input--error' : '');
        inp.type = type;
        if (inputmode) inp.setAttribute('inputmode', inputmode);
        inp.id = `bla-${key}`;
        inp.placeholder = placeholder;
        inp.value = this._linkModalValues[key];
        inp.disabled = this._linkModalSubmitting;
        inp.autocomplete = 'off';
        inp.addEventListener('input', (e) => {
          this._linkModalValues[key] = e.target.value;
          this._linkModalDirty = true;
          // Clear field error on change
          if (this._linkModalFieldErrors[key]) {
            delete this._linkModalFieldErrors[key];
            inp.classList.remove('bla-input--error');
            const errEl = fieldWrap.querySelector('.bla-field-error');
            if (errEl) errEl.remove();
          }
        });
        fieldWrap.appendChild(inp);

        if (err) {
          const errEl = document.createElement('p');
          errEl.className = 'bla-field-error';
          errEl.textContent = err;
          fieldWrap.appendChild(errEl);
        }

        form.appendChild(fieldWrap);
      });

      const actions = document.createElement('div');
      actions.className = 'bla-actions';

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'bla-btn';
      submitBtn.disabled = this._linkModalSubmitting;
      if (this._linkModalSubmitting) {
        submitBtn.innerHTML = `<span class="bla-spinner">${BOP_ICONS.loader}</span><span>Linking Account…</span>`;
      } else {
        submitBtn.textContent = 'Submit';
      }
      actions.appendChild(submitBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'bla-btn bla-btn-ghost';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.disabled = this._linkModalSubmitting;
      cancelBtn.addEventListener('click', () => this._closeLinkModal());
      actions.appendChild(cancelBtn);

      form.appendChild(actions);
      body.appendChild(form);
    }

    modal.appendChild(body);
    this.shadowRoot.querySelector('.bop-overlay').appendChild(overlay);
  }

  // ==================== STYLES ====================
  _injectStyles() {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    this.shadowRoot.appendChild(font);

    const style = document.createElement('style');
    style.textContent = this._getStyles();
    this.shadowRoot.appendChild(style);
  }

  _getStyles() {
    return `
:host{--bop-primary:#4c7b63;--bop-primary-light:#e8f0eb;--bop-headline:#0f2a39;--bop-secondary:#5f6e78;--bop-success:#22c55e;--bop-error:#dd524b;--bop-sidebar:#fafafa;--bop-border:#e8e8e8;--bop-radius-sm:0.25rem;--bop-radius-md:0.5rem;--bop-radius-lg:0.75rem;--bop-radius-xl:1rem;--bop-radius-full:9999px;--bop-shadow-sm:0 1px 2px 0 rgb(0 0 0/0.05);--bop-shadow-md:0 4px 6px -1px rgb(0 0 0/0.1);--bop-shadow-2xl:0 25px 50px -12px rgb(0 0 0/0.25);--bop-dur-fast:150ms;--bop-dur-norm:200ms;--bop-dur-slow:300ms;--bop-ease:cubic-bezier(0.4,0,0.2,1);--bop-ease-spring:cubic-bezier(0.16,1,0.3,1);--bop-font:var(--font-sans,'Inter',system-ui,sans-serif);--bop-mono:var(--font-mono,ui-monospace,'SF Mono','Menlo',monospace);--bop-xs:0.75rem;--bop-sm:0.875rem;--bop-base:1rem;--bop-lg:1.125rem;--bop-2xl:1.5rem;--bop-logo-scale:72%;font-family:var(--bop-font);display:inline-block}
.bop-trigger-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;font-size:var(--bop-sm);font-weight:600;font-family:var(--bop-font);color:#fff;background:var(--bop-primary);border:none;border-radius:var(--bop-radius-xl);cursor:pointer;box-shadow:0 4px 12px rgba(76,123,99,.3);transition:all var(--bop-dur-norm) var(--bop-ease);height:40px;line-height:1}
.bop-trigger-btn:hover{background:rgba(76,123,99,.9);box-shadow:0 6px 16px rgba(76,123,99,.4);transform:translateY(-1px)}
.bop-trigger-btn:active{transform:scale(.98) translateY(0)}
.bop-trigger-btn img.bop-trigger-logo{width:18px;height:18px;object-fit:contain;flex-shrink:0;display:block}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

@keyframes bopBackdropIn{from{opacity:0}to{opacity:1}}
@keyframes bopBackdropOut{from{opacity:1}to{opacity:0}}
@keyframes bopModalIn{from{opacity:0;transform:scale(.95) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes bopModalOut{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0;transform:scale(.95) translateY(20px)}}
@keyframes bopSlideInFwd{from{transform:translateX(50px) scale(.95);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}
@keyframes bopSlideInBwd{from{transform:translateX(-50px) scale(.95);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}
@keyframes bopSlideOutFwd{from{transform:translateX(0) scale(1);opacity:1}to{transform:translateX(-50px) scale(.95);opacity:0}}
@keyframes bopSlideOutBwd{from{transform:translateX(0) scale(1);opacity:1}to{transform:translateX(50px) scale(.95);opacity:0}}
@keyframes bopItemFade{from{opacity:0}to{opacity:1}}
@keyframes bopSuccessPop{0%{transform:scale(0)}50%{transform:scale(1.15)}70%{transform:scale(.95)}100%{transform:scale(1)}}
@keyframes bopPulseRing{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.2);opacity:0}}
@keyframes bopSpin{to{transform:rotate(360deg)}}
@keyframes bopCheckPop{0%{transform:scale(0)}100%{transform:scale(1)}}
@keyframes bopShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes bopFadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes bopSlideFromLeft{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes bopFadeIn{from{opacity:0}to{opacity:1}}
@keyframes bopFadeOut{from{opacity:1}to{opacity:0}}
@keyframes bopExpandIn{from{opacity:0;max-height:0;padding-top:0;padding-bottom:0}to{opacity:1;max-height:60px;padding-top:.75rem;padding-bottom:.75rem}}

.bop-overlay{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:1rem}
.bop-overlay[data-state="open"]{pointer-events:auto}
.bop-overlay[data-state="closed"]{pointer-events:none}
.bop-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:bopBackdropIn .3s var(--bop-ease) forwards}
.bop-overlay[data-state="closing"] .bop-backdrop{animation:bopBackdropOut .3s var(--bop-ease) forwards}
.bop-modal{position:relative;width:100%;max-width:448px;height:520px;background:#fff;border:1px solid var(--bop-border);box-shadow:var(--bop-shadow-2xl);border-radius:var(--bop-radius-xl);overflow:hidden;display:flex;flex-direction:column;max-height:90vh;animation:bopModalIn .3s var(--bop-ease-spring) forwards;transition:max-width .4s var(--bop-ease-spring),height .4s var(--bop-ease-spring)}
.bop-modal.bop-modal-wide{max-width:544px;height:720px}
.bop-modal.bop-modal-compact{max-width:400px;height:480px}
.bop-overlay[data-state="closing"] .bop-modal{animation:bopModalOut .3s var(--bop-ease-spring) forwards}

.bop-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;border-bottom:1px solid rgba(250,250,250,.5);background:rgba(255,255,255,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:10;flex-shrink:0}
.bop-header-left{display:flex;align-items:center;gap:.75rem;height:2rem}
.bop-back-btn{padding:.375rem;margin-left:-.375rem;color:var(--bop-secondary);background:transparent;border:none;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color var(--bop-dur-norm) var(--bop-ease),background var(--bop-dur-norm) var(--bop-ease);animation:bopSlideFromLeft .2s var(--bop-ease) forwards}
.bop-back-btn:hover{color:var(--bop-headline);background:var(--bop-sidebar)}
.bop-header-title{font-size:var(--bop-lg);font-weight:600;color:var(--bop-headline);animation:bopFadeInUp .25s var(--bop-ease) forwards}
.bop-close-btn{padding:.375rem;margin-right:-.375rem;color:var(--bop-secondary);background:transparent;border:none;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color var(--bop-dur-norm) var(--bop-ease),background var(--bop-dur-norm) var(--bop-ease)}
.bop-close-btn:hover{color:var(--bop-headline);background:var(--bop-sidebar)}

.bop-content{position:relative;flex:1;overflow:hidden;min-height:0;background:rgba(248,250,252,.3);transition:opacity .2s var(--bop-ease)}
.bop-content.bop-content-fading{opacity:0}
.bop-step{position:absolute;inset:0;display:flex;flex-direction:column}
.bop-step[data-direction="forward"]{animation:bopSlideInFwd .4s var(--bop-ease-spring) forwards}
.bop-step[data-direction="backward"]{animation:bopSlideInBwd .4s var(--bop-ease-spring) forwards}
.bop-step[data-exit="forward"]{animation:bopSlideOutFwd .3s var(--bop-ease-spring) forwards}
.bop-step[data-exit="backward"]{animation:bopSlideOutBwd .3s var(--bop-ease-spring) forwards}

.bop-select-bank{padding:1.5rem;padding-top:0}
.bop-subtitle{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.5}
.bop-step-inner{flex:1;display:flex;flex-direction:column;gap:1.25rem;min-height:0}
.bop-search{position:relative;flex-shrink:0}
.bop-search-icon{position:absolute;left:.875rem;top:50%;transform:translateY(-50%);color:var(--bop-secondary);transition:color var(--bop-dur-norm) var(--bop-ease);pointer-events:none;display:flex}
.bop-search:focus-within .bop-search-icon{color:var(--bop-primary)}
.bop-search-input{width:100%;padding:.75rem 1rem .75rem 2.5rem;background:#fff;border:1px solid var(--bop-border);border-radius:var(--bop-radius-xl);font-size:var(--bop-sm);font-family:var(--bop-font);color:var(--bop-headline);box-shadow:var(--bop-shadow-sm);transition:all var(--bop-dur-norm) var(--bop-ease);outline:none}
.bop-search-input::placeholder{color:rgba(95,110,120,.6)}
.bop-search-input:focus{border-color:var(--bop-primary);box-shadow:0 0 0 3px rgba(76,123,99,.2)}

.bop-bank-list{flex:1;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none;margin:0 -.5rem;padding:0 .5rem 1rem;display:flex;flex-direction:column;gap:.375rem}
.bop-bank-list::-webkit-scrollbar{display:none}
.bop-bank-item{width:100%;display:flex;align-items:center;justify-content:space-between;padding:.875rem;background:#fff;border:1px solid transparent;border-radius:var(--bop-radius-xl);cursor:pointer;transition:all var(--bop-dur-norm) var(--bop-ease);font-family:var(--bop-font);animation:bopItemFade .3s var(--bop-ease) forwards;opacity:0}
.bop-bank-item:hover{border-color:var(--bop-border);box-shadow:var(--bop-shadow-sm);background:rgba(248,250,252,1)}
.bop-bank-item-left{display:flex;align-items:center;gap:1rem}
.bop-bank-logo{width:2.5rem;height:2.5rem;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--bop-shadow-sm);outline:1px solid rgba(0,0,0,.05);overflow:hidden}
.bop-logo-img{width:var(--bop-logo-scale);height:var(--bop-logo-scale);object-fit:contain}
.bop-bank-name{font-size:var(--bop-sm);font-weight:500;color:var(--bop-headline);transition:color var(--bop-dur-norm) var(--bop-ease)}
.bop-bank-item:hover .bop-bank-name{color:var(--bop-primary)}
.bop-chevron{color:rgba(95,110,120,.5);transition:color var(--bop-dur-norm) var(--bop-ease);display:flex}
.bop-bank-item:hover .bop-chevron{color:var(--bop-primary)}
.bop-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2.5rem 0;opacity:.6}
.bop-empty-text{font-size:var(--bop-sm);color:var(--bop-secondary);margin-top:.75rem}
.bop-security{padding-top:1rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:var(--bop-xs);color:var(--bop-secondary);background:rgba(248,250,252,.5);margin:0 -1.5rem -1.5rem;padding-bottom:1.5rem;padding-left:1.5rem;padding-right:1.5rem;border-top:1px solid var(--bop-sidebar)}
.bop-security svg{color:#10b981}

.bop-login{padding:1.5rem;overflow-y:auto;scrollbar-width:none}
.bop-login::-webkit-scrollbar{display:none}
.bop-login-inner{flex:1;display:flex;flex-direction:column;min-height:max-content;padding-bottom:.5rem}
.bop-login-header{text-align:center;padding-bottom:1.5rem;flex-shrink:0}
.bop-login-logo{width:4rem;height:4rem;border-radius:1rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:#fff;box-shadow:var(--bop-shadow-sm);outline:1px solid rgba(0,0,0,.05)}
.bop-login-desc{font-size:var(--bop-sm);color:var(--bop-secondary);padding:0 2rem;line-height:1.5}
.bop-login-desc strong{font-weight:600;color:var(--bop-headline)}
.bop-form{display:flex;flex-direction:column;gap:1rem;flex-shrink:0;padding:0 .5rem}
.bop-field{display:flex;flex-direction:column}
.bop-label{display:block;font-size:var(--bop-xs);font-weight:600;color:var(--bop-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem}
.bop-input{width:100%;padding:.875rem 1rem;background:#fff;border:1px solid var(--bop-border);border-radius:var(--bop-radius-xl);font-size:var(--bop-sm);font-family:var(--bop-font);color:var(--bop-headline);box-shadow:var(--bop-shadow-sm);transition:all var(--bop-dur-norm) var(--bop-ease);outline:none}
.bop-input::placeholder{color:rgba(95,110,120,.5)}
.bop-input:focus{border-color:var(--bop-primary);box-shadow:0 0 0 3px rgba(76,123,99,.2)}
.bop-input[data-error="true"]{border-color:#fca5a5;background:rgba(254,242,242,.5)}
.bop-input[data-error="true"]:focus{box-shadow:0 0 0 3px rgba(239,68,68,.2);border-color:#ef4444}
.bop-pw-wrap{position:relative}
.bop-pw-wrap .bop-input{padding-right:3rem}
.bop-pw-toggle{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);padding:.375rem;color:var(--bop-secondary);background:transparent;border:none;border-radius:.375rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color var(--bop-dur-norm) var(--bop-ease),background var(--bop-dur-norm) var(--bop-ease)}
.bop-pw-toggle:hover{color:var(--bop-headline);background:var(--bop-sidebar)}
.bop-error{display:flex;align-items:center;gap:.5rem;font-size:var(--bop-xs);color:#dc2626;background:#fef2f2;padding:.75rem;border-radius:var(--bop-radius-md);border:1px solid #fee2e2;animation:bopExpandIn .25s var(--bop-ease) forwards;overflow:hidden}
.bop-login-actions{margin-top:1.5rem;padding:0 .5rem;display:flex;flex-direction:column;gap:1rem;flex-shrink:0;padding-bottom:1rem}
.bop-encrypt{display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:var(--bop-xs);color:var(--bop-secondary)}

.bop-accounts{padding:1.5rem; padding-top: 0;}
.bop-accounts-bank{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem}
.bop-accounts-bank-logo{width:3rem;height:3rem;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;color:#fff;outline:1px solid rgba(0,0,0,.05);overflow:hidden}
.bop-accounts-bank-name{font-weight:500;color:var(--bop-headline)}
.bop-accounts-desc{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.5;text-align:left}
.bop-account-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem;padding:0 .25rem 1rem;scrollbar-width:none}
.bop-account-list::-webkit-scrollbar{display:none}
.bop-accounts-fetch-loader{display:flex;align-items:center;gap:.625rem;padding:.75rem 1rem;background:var(--bop-primary-light);border:1px solid rgba(76,123,99,.18);border-radius:var(--bop-radius-xl);animation:bopFadeInUp .3s var(--bop-ease) forwards}
.bop-accounts-fetch-spinner{display:flex;color:var(--bop-primary);animation:bopSpin 1s linear infinite;flex-shrink:0}
.bop-accounts-fetch-text{font-size:var(--bop-xs);font-weight:500;color:var(--bop-primary)}
.bop-account-card{width:100%;display:flex;align-items:center;padding:1rem;border-radius:var(--bop-radius-xl);border:2px solid transparent;background:#fff;box-shadow:var(--bop-shadow-sm);cursor:pointer;transition:all var(--bop-dur-norm) var(--bop-ease);font-family:var(--bop-font);text-align:left;animation:bopItemFade .3s var(--bop-ease) forwards;opacity:0}
.bop-account-card:hover{border-color:rgba(76,123,99,.2);box-shadow:var(--bop-shadow-md)}
.bop-account-card[data-selected="true"]{border-color:var(--bop-primary);background:rgba(76,123,99,.05)}
.bop-card-inner{display:flex;align-items:center;gap:1rem;flex:1}
.bop-check-circle{width:1.5rem;height:1.5rem;border-radius:var(--bop-radius-full);border:2px solid var(--bop-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all var(--bop-dur-norm) var(--bop-ease)}
.bop-account-card:hover .bop-check-circle{border-color:rgba(76,123,99,.5)}
.bop-account-card[data-selected="true"] .bop-check-circle{background:var(--bop-primary);border-color:var(--bop-primary);transform:scale(1.1)}
.bop-check-icon{color:#fff;display:none;line-height:0}
.bop-account-card[data-selected="true"] .bop-check-icon{display:flex;animation:bopCheckPop .25s var(--bop-ease-spring) forwards}
.bop-account-details{flex:1}
.bop-account-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.25rem}
.bop-account-type{font-size:var(--bop-sm);font-weight:600;color:var(--bop-headline);display:flex;align-items:center;gap:.5rem}
.bop-account-bank{font-size:var(--bop-xs);color:var(--bop-secondary);margin-bottom:.2rem;line-height:1.4}
.bop-account-number{font-size:var(--bop-xs);color:var(--bop-secondary);font-family:var(--bop-mono);background:var(--bop-sidebar);padding:.125rem .5rem;border-radius:.375rem;display:inline-block}
.bop-confirm-unlink{padding:2rem;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#fff}

/* ===== UNLINK RESULT ===== */
.bop-ur{display:flex;flex-direction:column;align-items:stretch;background:#fff;overflow:hidden}
.bop-ur-top{flex-shrink:0;display:flex;flex-direction:column;align-items:center;text-align:center;padding:1.25rem 1.5rem 1rem}
.bop-ur-scroll{flex:1;overflow-y:auto;scrollbar-width:none;padding:0 1.5rem}
.bop-ur-icon{width:3.25rem;height:3.25rem;flex-shrink:0;border-radius:var(--bop-radius-full);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;animation:bopSuccessPop .4s var(--bop-ease-spring) forwards}
.bop-ur-icon--err{background:#fef2f2;color:#dd524b}
.bop-ur-icon--warn{background:#fffbeb;color:#d97706}
.bop-ur-title{font-size:var(--bop-lg);font-weight:700;color:var(--bop-headline);margin-bottom:.375rem}
.bop-ur-desc{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.5;margin-bottom:1.25rem;max-width:280px}
.bop-ur-scroll::-webkit-scrollbar{display:none}
.bop-ur-list{display:flex;flex-direction:column;gap:.625rem;margin-bottom:1rem}
.bop-ur-footer{flex-shrink:0;padding:.75rem 1.5rem 1.25rem;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-top:1px solid var(--bop-border)}
.bop-ur-card{display:flex;align-items:center;gap:.75rem;padding:.75rem;border-radius:var(--bop-radius-xl);border:1px solid var(--bop-border);background:var(--bop-sidebar);animation:bopFadeInUp .3s var(--bop-ease) forwards;opacity:0}
.bop-ur-card--fail{border-color:rgba(221,82,75,.25);background:rgba(254,242,242,.5)}
.bop-ur-card--ok{border-color:rgba(34,197,94,.25);background:rgba(240,253,244,.5)}
.bop-ur-card-icon{width:2.25rem;height:2.25rem;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.bop-ur-card-details{flex:1;min-width:0}
.bop-ur-card-type{font-size:var(--bop-sm);font-weight:600;color:var(--bop-headline);line-height:1.3}
.bop-ur-card-num{font-size:var(--bop-xs);color:var(--bop-secondary);font-family:var(--bop-mono)}
.bop-ur-card-reason{font-size:var(--bop-xs);color:#dd524b;margin-top:.2rem;line-height:1.4}
.bop-ur-badge{width:1.5rem;height:1.5rem;border-radius:var(--bop-radius-full);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.bop-ur-badge--ok{background:#dcfce7;color:#16a34a}
.bop-ur-badge--fail{background:#fef2f2;color:#dd524b}
.bop-ur-actions{display:flex;flex-direction:column;gap:.625rem}
.bop-unlink-icon{width:3.5rem;height:3.5rem;aspect-ratio:1;flex-shrink:0;background:#fef2f2;border-radius:var(--bop-radius-full);display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem;color:#dd524b;animation:bopSuccessPop .4s var(--bop-ease-spring) forwards}
.bop-unlink-title{font-size:var(--bop-lg);font-weight:700;color:var(--bop-headline);margin-bottom:.25rem}
.bop-unlink-desc{font-size:var(--bop-sm);color:var(--bop-secondary);margin-bottom:1.5rem;line-height:1.5;max-width:280px}
.bop-unlink-card{background:var(--bop-sidebar);border:1px solid var(--bop-border);border-radius:var(--bop-radius-xl);padding:.875rem;min-width:82%;flex-shrink:0;display:flex;align-items:center;gap:.75rem;scroll-snap-align:start}
.bop-unlink-card-icon{width:2.25rem;height:2.25rem;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;overflow:hidden}
.bop-unlink-card-icon .bop-logo-img{width:var(--bop-logo-scale);height:var(--bop-logo-scale);object-fit:contain}
.bop-unlink-card-details{text-align:left}
.bop-unlink-card-type{font-size:var(--bop-sm);font-weight:600;color:var(--bop-headline)}
.bop-unlink-card-num{font-size:var(--bop-xs);color:var(--bop-secondary);font-family:var(--bop-mono)}
.bop-unlink-cards-list{display:flex;flex-direction:row;gap:.625rem;width:100%;margin-bottom:1.5rem;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:2px}
.bop-unlink-cards-list[data-single] .bop-unlink-card{min-width:100%}
.bop-unlink-actions{display:flex;flex-direction:column;gap:.625rem;width:100%}
.bop-btn.bop-btn-danger{background:#dd524b;box-shadow:0 4px 12px rgba(221,82,75,.3)}
.bop-btn.bop-btn-danger:hover{background:#c9403a;box-shadow:0 6px 16px rgba(221,82,75,.4)}
.bop-btn.bop-btn-ghost{background:transparent;color:var(--bop-secondary);box-shadow:none;border:1px solid var(--bop-border)}
.bop-btn.bop-btn-ghost:hover{background:var(--bop-sidebar);color:var(--bop-headline)}
.bop-accounts-footer{overflow:hidden;max-height:0;padding:0 .25rem;background:rgba(255,255,255,.5);backdrop-filter:blur(8px);border-top:0px solid rgba(232,232,232,.5);transition:max-height .15s var(--bop-ease),padding .15s var(--bop-ease),border-top-width 0s linear .15s}
.bop-accounts-footer--open{max-height:80px;padding:1rem .25rem .5rem;border-top-width:1px;overflow:visible;transition:max-height .15s var(--bop-ease),padding .15s var(--bop-ease),border-top-width 0s linear 0s}
.bop-btn-animate-in{animation:bopFadeIn .2s var(--bop-ease) forwards}
.bop-accounts-header{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;flex-shrink:0;margin-bottom:1rem}
.bop-accounts-header-text{flex:1;min-width:0}
.bop-link-account-btn{display:inline-flex;align-items:center;gap:.375rem;padding:.5rem .875rem;font-size:var(--bop-xs);font-weight:600;font-family:var(--bop-font);color:var(--bop-primary);background:var(--bop-primary-light);border:1px solid rgba(76,123,99,.25);border-radius:var(--bop-radius-xl);cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all var(--bop-dur-norm) var(--bop-ease);margin-top:.125rem}
.bop-link-account-btn:hover{background:rgba(76,123,99,.18);border-color:rgba(76,123,99,.4)}
.bop-link-account-btn:active{transform:scale(.97)}

.bop-success-view{padding:1.5rem 2rem;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#fff}
.bop-success-icon{width:4.5rem;height:4.5rem;aspect-ratio:1;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem;position:relative;animation:bopSuccessPop .6s var(--bop-ease-spring) forwards}
.bop-success-icon-inner{width:100%;height:100%;border-radius:var(--bop-radius-xl);overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:var(--bop-shadow-md);outline:1px solid rgba(0,0,0,.06)}
.bop-success-icon-inner .bop-logo-img{width:var(--bop-logo-scale);height:var(--bop-logo-scale);object-fit:contain}
.bop-success-icon-inner .bop-success-logo-fallback{color:#fff;display:flex;align-items:center;justify-content:center;width:100%;height:100%}
.bop-success-badge{position:absolute;bottom:-4px;right:-4px;width:1.5rem;height:1.5rem;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;animation:bopCheckPop .3s var(--bop-ease-spring) .4s both;z-index:1}
.bop-success-badge svg{color:#fff;width:12px;height:12px}
.bop-success-title{font-size:var(--bop-2xl);font-weight:700;color:var(--bop-headline);margin-bottom:.375rem}
.bop-success-card{background:rgba(248,250,252,1);border:1px solid var(--bop-border);border-radius:var(--bop-radius-xl);padding:.875rem;width:100%;margin-bottom:1.25rem;margin-top:.375rem}
.bop-success-bank{display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:var(--bop-sm);color:var(--bop-headline);font-weight:500;margin-bottom:.25rem}
.bop-success-four{font-size:var(--bop-xs);color:var(--bop-secondary);font-family:var(--bop-mono)}
.bop-success-desc{font-size:var(--bop-sm);color:var(--bop-secondary);margin-bottom:1.5rem;line-height:1.5}

.bop-btn{width:100%;position:relative;display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.875rem 1.25rem;font-size:var(--bop-sm);font-weight:600;font-family:var(--bop-font);color:#fff;background:var(--bop-primary);border:none;border-radius:var(--bop-radius-xl);cursor:pointer;box-shadow:var(--bop-shadow-sm);transition:all var(--bop-dur-norm) var(--bop-ease);min-height:3rem;overflow:hidden}
.bop-btn:hover{background:rgba(76,123,99,.9)}
.bop-btn:active{transform:scale(.98)}
.bop-btn:disabled{opacity:.5;cursor:not-allowed}
.bop-btn:disabled:active{transform:none}
.bop-btn-done{box-shadow:var(--bop-shadow-md)}
.bop-btn-done:hover{transform:scale(1.02)}
.bop-btn-done:active{transform:scale(.98)}
.bop-btn-label{animation:bopFadeIn .2s var(--bop-ease) forwards}
.bop-btn-loading{display:flex;align-items:center;justify-content:center;gap:.5rem;position:absolute;inset:0;animation:bopFadeIn .2s var(--bop-ease) forwards}
.bop-spinner{animation:bopSpin 1s linear infinite}
.bop-hidden{display:none!important}
.bop-loading-view{padding:2rem;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#fff;gap:1.5rem}
.bop-loading-logo{width:4.5rem;height:4.5rem;border-radius:1.25rem;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--bop-shadow-md);outline:1px solid rgba(0,0,0,.05);overflow:hidden;animation:bopFadeInUp .5s var(--bop-ease-spring) forwards,bopBreath 2s ease-in-out .5s infinite}
.bop-loading-body{display:flex;flex-direction:column;align-items:center;gap:.375rem;opacity:0;animation:bopFadeInUp .4s var(--bop-ease) .15s forwards}
.bop-loading-title{font-size:var(--bop-base);font-weight:600;color:var(--bop-headline)}
.bop-loading-text{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.5}
.bop-loading-bar-wrap{width:11rem;height:3px;background:var(--bop-sidebar);border-radius:var(--bop-radius-full);overflow:hidden;opacity:0;animation:bopFadeIn .3s var(--bop-ease) .3s forwards}
.bop-loading-bar{height:100%;width:0;background:var(--bop-primary);border-radius:var(--bop-radius-full);animation:bopBarFill 1s cubic-bezier(.4,0,.2,1) .15s forwards}
.bop-loading-secure{display:flex;align-items:center;gap:.375rem;font-size:var(--bop-xs);color:var(--bop-secondary);opacity:0;animation:bopFadeIn .3s var(--bop-ease) .45s forwards}
.bop-loading-secure svg{color:#10b981}
@keyframes bopBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes bopBarFill{0%{width:0}50%{width:65%}100%{width:95%}}

/* ==================== LINK ACCOUNT MODAL ==================== */
@keyframes blaBackdropIn{from{opacity:0}to{opacity:1}}
@keyframes blaBackdropOut{from{opacity:1}to{opacity:0}}
@keyframes blaModalIn{from{opacity:0;transform:scale(.96) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes blaModalOut{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0;transform:scale(.96) translateY(16px)}}
@keyframes blaResultPop{0%{transform:scale(0)}55%{transform:scale(1.12)}75%{transform:scale(.96)}100%{transform:scale(1)}}

.bla-overlay{position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:1rem;border-radius:var(--bop-radius-xl)}
.bla-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:var(--bop-radius-xl);animation:blaBackdropIn .25s var(--bop-ease) forwards}
.bla-overlay[data-state="closing"] .bla-backdrop{animation:blaBackdropOut .25s var(--bop-ease) forwards}
.bla-modal{position:relative;width:100%;max-width:400px;background:#fff;border:1px solid var(--bop-border);border-radius:var(--bop-radius-xl);box-shadow:0 20px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;animation:blaModalIn .3s var(--bop-ease-spring) forwards}
.bla-overlay[data-state="closing"] .bla-modal{animation:blaModalOut .25s var(--bop-ease) forwards}

.bla-header{display:flex;align-items:center;justify-content:space-between;padding:.875rem 1.25rem;border-bottom:1px solid var(--bop-border);flex-shrink:0}
.bla-header-left{display:flex;align-items:center;gap:.75rem}
.bla-header-title{font-size:var(--bop-base);font-weight:700;color:var(--bop-headline)}
.bla-close-btn{padding:.375rem;margin-right:-.375rem;color:var(--bop-secondary);background:transparent;border:none;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color var(--bop-dur-norm) var(--bop-ease),background var(--bop-dur-norm) var(--bop-ease)}
.bla-close-btn:hover{color:var(--bop-headline);background:var(--bop-sidebar)}

.bla-body{padding:1.25rem;display:flex;flex-direction:column;gap:.875rem}
.bla-form-desc{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.55;margin-bottom:.125rem}
.bla-form{display:flex;flex-direction:column;gap:.875rem}
.bla-field{display:flex;flex-direction:column;gap:.375rem}
.bla-label{font-size:var(--bop-xs);font-weight:600;color:var(--bop-secondary);text-transform:uppercase;letter-spacing:.05em;text-align:left}
.bla-confirm-dialog{position:absolute;inset:0;background:rgba(255,255,255,.92);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.25rem;border-radius:var(--bop-radius-xl);z-index:10;animation:bopFadeIn .18s var(--bop-ease) forwards}
.bla-confirm-box{width:100%;display:flex;flex-direction:column;gap:1rem;text-align:center}
.bla-confirm-msg{font-size:var(--bop-sm);color:var(--bop-headline);line-height:1.6;font-weight:500}
.bla-confirm-actions{display:flex;flex-direction:column;gap:.5rem}
.bla-confirm-btn{width:100%;padding:.75rem 1rem;font-size:var(--bop-sm);font-weight:600;font-family:var(--bop-font);border:none;border-radius:var(--bop-radius-xl);cursor:pointer;transition:all var(--bop-dur-norm) var(--bop-ease)}
.bla-confirm-btn--danger{background:#dd524b;color:#fff}
.bla-confirm-btn--danger:hover{background:#c9403a}
.bla-confirm-btn--ghost{background:transparent;color:var(--bop-secondary);border:1.5px solid var(--bop-border)}
.bla-confirm-btn--ghost:hover{background:var(--bop-sidebar);color:var(--bop-headline)}
.bla-input{width:100%;padding:.8rem 1rem;background:#fff;border:1.5px solid var(--bop-border);border-radius:var(--bop-radius-xl);font-size:var(--bop-sm);font-family:var(--bop-font);color:var(--bop-headline);outline:none;transition:border-color var(--bop-dur-norm) var(--bop-ease),box-shadow var(--bop-dur-norm) var(--bop-ease)}
.bla-input::placeholder{color:rgba(95,110,120,.45)}
.bla-input:focus{border-color:var(--bop-primary);box-shadow:0 0 0 3px rgba(76,123,99,.18)}
.bla-input:disabled{opacity:.55;cursor:not-allowed;background:var(--bop-sidebar)}
.bla-input--error{border-color:#ef4444!important;background:rgba(254,242,242,.4)}
.bla-input--error:focus{box-shadow:0 0 0 3px rgba(239,68,68,.18)!important}
.bla-field-error{font-size:var(--bop-xs);color:#ef4444;font-weight:500;animation:bopFadeInUp .2s var(--bop-ease) forwards}

.bla-actions{display:flex;flex-direction:column;gap:.625rem;margin-top:.25rem}
.bla-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.875rem 1.25rem;font-size:var(--bop-sm);font-weight:600;font-family:var(--bop-font);color:#fff;background:var(--bop-primary);border:none;border-radius:var(--bop-radius-xl);cursor:pointer;transition:all var(--bop-dur-norm) var(--bop-ease);min-height:3rem}
.bla-btn:hover:not(:disabled){background:rgba(76,123,99,.9)}
.bla-btn:active:not(:disabled){transform:scale(.98)}
.bla-btn:disabled{opacity:.55;cursor:not-allowed}
.bla-btn-ghost{background:transparent;color:var(--bop-secondary);border:1.5px solid var(--bop-border)}
.bla-btn-ghost:hover:not(:disabled){background:var(--bop-sidebar);color:var(--bop-headline)}
.bla-spinner{display:flex;animation:bopSpin 1s linear infinite}

.bla-result{display:flex;flex-direction:column;align-items:center;text-align:center;padding:.5rem 0 .75rem}
.bla-result-icon-wrap{width:4rem;height:4rem;border-radius:var(--bop-radius-full);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;animation:blaResultPop .5s var(--bop-ease-spring) forwards}
.bla-result-icon-wrap--success{background:rgba(34,197,94,.12);color:#16a34a}
.bla-result-icon-wrap--error{background:rgba(239,68,68,.1);color:#dc2626}
.bla-result-title{font-size:var(--bop-lg);font-weight:700;color:var(--bop-headline);margin-bottom:.375rem}
.bla-result-desc{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.6;max-width:280px}
`;
  }

  // ==================== RENDER ====================
  _renderTrigger() {
    const existing = this.shadowRoot.querySelector('.bop-trigger-btn');
    if (existing) return;
    const btn = document.createElement('button');
    btn.className = 'bop-trigger-btn';
    btn.innerHTML = `<img src="${BOP_BISON_LOGO}" alt="Bison" class="bop-trigger-logo"> Manage Bank Accounts`;
    btn.disabled = this._componentDisabled;
    if (this._componentDisabled) btn.setAttribute('aria-disabled', 'true');
    btn.addEventListener('click', () => {
      if (this._componentDisabled) return;
      this.setAttribute('open', '');
    });
    this.shadowRoot.appendChild(btn);
  }

  _render() {
    this._renderModal();
  }

  _renderModal() {
    const existing = this.shadowRoot.querySelector('.bop-overlay');
    if (existing) existing.remove();
    if (!this.isOpen) return;

    const overlay = document.createElement('div');
    overlay.className = 'bop-overlay';
    overlay.setAttribute('data-state', 'open');

    const backdrop = document.createElement('div');
    backdrop.className = 'bop-backdrop';
    backdrop.addEventListener('click', () => this._handleClose());
    overlay.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.className = 'bop-modal';
    overlay.appendChild(modal);

    this._headerEl = document.createElement('div');
    this._headerEl.className = 'bop-header';
    modal.appendChild(this._headerEl);
    this._renderHeader();

    this._contentEl = document.createElement('div');
    this._contentEl.className = 'bop-content';
    modal.appendChild(this._contentEl);
    this._renderContent();

    this.shadowRoot.appendChild(overlay);
  }

  _renderHeader() {
    if (!this._headerEl) return;
    this._headerEl.innerHTML = '';
    const left = document.createElement('div');
    left.className = 'bop-header-left';
    const showBack = this._step === 'confirm-unlink' || this._step === 'unlink-result';
    if (showBack) {
      const back = document.createElement('button');
      back.className = 'bop-back-btn';
      back.innerHTML = BOP_ICONS.arrowLeft;
      back.addEventListener('click', () => this._handleBack());
      left.appendChild(back);
    }
    const title = document.createElement('h2');
    title.className = 'bop-header-title';
    title.textContent = this._getHeaderTitle();
    left.appendChild(title);
    this._headerEl.appendChild(left);
    const close = document.createElement('button');
    close.className = 'bop-close-btn';
    close.innerHTML = BOP_ICONS.x;
    close.addEventListener('click', () => this._handleClose());
    this._headerEl.appendChild(close);
  }

  _renderContent() {
    if (!this._contentEl) return;
    this._contentEl.innerHTML = '';
    const modal = this.shadowRoot.querySelector('.bop-modal');
    if (modal) {
      modal.classList.remove('bop-modal-wide', 'bop-modal-compact');
      if (this._step === 'select-accounts') modal.classList.add('bop-modal-wide');
      if (this._step === 'success') modal.classList.add('bop-modal-compact');
    }
    switch (this._step) {
      case 'loading': this._renderLoading(); break;
      case 'select-accounts': this._renderSelectAccounts(); break;
      case 'confirm-unlink': this._renderConfirmUnlink(); break;
      case 'unlink-result': this._renderUnlinkResult(); break;
      case 'success': this._renderSuccess(); break;
    }
  }

  _renderSelectBank() {
    const step = document.createElement('div');
    step.className = 'bop-step bop-select-bank';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    const inner = document.createElement('div');
    inner.className = 'bop-step-inner';
    const sub = document.createElement('p');
    sub.className = 'bop-subtitle';
    sub.textContent = 'Search for your institution to securely connect your accounts via JIB Pay.';
    inner.appendChild(sub);
    const sw = document.createElement('div');
    sw.className = 'bop-search';
    const si = document.createElement('span');
    si.className = 'bop-search-icon';
    si.innerHTML = BOP_ICONS.search;
    sw.appendChild(si);
    const inp = document.createElement('input');
    inp.className = 'bop-search-input';
    inp.type = 'text'; inp.placeholder = 'Search for your bank...';
    inp.value = this._searchQuery;
    inp.addEventListener('input', (e) => { this._searchQuery = e.target.value; this._renderBankList(); });
    sw.appendChild(inp);
    inner.appendChild(sw);
    this._bankListEl = document.createElement('div');
    this._bankListEl.className = 'bop-bank-list';
    inner.appendChild(this._bankListEl);
    this._renderBankList();
    step.appendChild(inner);
    const footer = document.createElement('div');
    footer.className = 'bop-security';
    footer.innerHTML = `${BOP_ICONS.shield}<span>Secured by JIB Pay Encryption</span>`;
    step.appendChild(footer);
    this._contentEl.appendChild(step);
    requestAnimationFrame(() => inp.focus());
  }

  _renderBankList() {
    if (!this._bankListEl) return;
    this._bankListEl.innerHTML = '';
    const q = this._searchQuery.toLowerCase();
    const filtered = BOP_BANKS.filter(b => b.name.toLowerCase().includes(q));
    if (!filtered.length) {
      const e = document.createElement('div');
      e.className = 'bop-empty';
      e.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--bop-secondary)"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><p class="bop-empty-text">No banks found</p>`;
      this._bankListEl.appendChild(e); return;
    }
    filtered.forEach((bank, i) => {
      const btn = document.createElement('button');
      btn.className = 'bop-bank-item';
      btn.style.animationDelay = `${i * 50}ms`;
      btn.innerHTML = `<div class="bop-bank-item-left"><div class="bop-bank-logo" style="background:${bank.bg}">${bank.logo ? `<img class="bop-logo-img" src="${bank.logo}" alt="${bank.name}">` : BOP_ICONS.building}</div><span class="bop-bank-name">${bank.name}</span></div><span class="bop-chevron">${BOP_ICONS.chevron}</span>`;
      btn.addEventListener('click', () => this._handleBankSelect(bank));
      this._bankListEl.appendChild(btn);
    });
  }

  _renderLoading() {
    const step = document.createElement('div');
    step.className = 'bop-step bop-loading-view';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    step.innerHTML = `
      <div class="bop-loading-logo" style="background:${this._selectedBank?.bg || '#2563eb'}">${this._selectedBank?.logo ? `<img class="bop-logo-img" src="${this._selectedBank.logo}" alt="${this._selectedBank.name}">` : BOP_ICONS.buildingLg}</div>
      <div class="bop-loading-body">
        <p class="bop-loading-title">${this._selectedBank?.name || ''}</p>
        <p class="bop-loading-text">Securely retrieving your accounts</p>
      </div>
      <div class="bop-loading-bar-wrap"><div class="bop-loading-bar"></div></div>
      <div class="bop-loading-secure">${BOP_ICONS.shield} 256-bit encrypted connection</div>
    `;
    this._contentEl.appendChild(step);
    setTimeout(() => {
      if (this._step !== 'loading') return;
      this._mockAccounts = this._generateMockAccounts();
      this._selectedAccounts = new Set();
      const modal = this.shadowRoot.querySelector('.bop-modal');
      // Phase 1: fade out content
      this._contentEl.classList.add('bop-content-fading');
      setTimeout(() => {
        // Phase 2: lock current height, clear content, then transition to target
        this._contentEl.innerHTML = '';
        if (modal) {
          const currentH = modal.getBoundingClientRect().height;
          modal.style.height = currentH + 'px';
          modal.classList.add('bop-modal-wide');
          // Force reflow then set target height
          modal.offsetHeight;
          modal.style.height = '720px';
        }
        this._step = 'select-accounts';
        this._renderHeader();
        // Phase 3: after resize settles, render content & fade in
        setTimeout(() => {
          this._renderSelectAccounts();
          requestAnimationFrame(() => {
            this._contentEl.classList.remove('bop-content-fading');
            if (modal) modal.style.height = '';
          });
        }, 400);
      }, 200);
    }, 1000);
  }

  _renderSelectAccounts() {
    if (this._mockAccounts.length === 0) {
      this._mockAccounts = this._generateMockAccounts();
    }
    const step = document.createElement('div');
    step.className = 'bop-step bop-accounts';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    const inner = document.createElement('div');
    inner.style.cssText = 'flex:1;display:flex;flex-direction:column;min-height:0;';
    const hd = document.createElement('div'); hd.className = 'bop-accounts-header';
    const hdText = document.createElement('div'); hdText.className = 'bop-accounts-header-text';
    hdText.innerHTML = `<div class="bop-accounts-bank"><div class="bop-accounts-bank-logo" style="background:${this._selectedBank?.bg || ''}">${this._selectedBank?.logo ? `<img class="bop-logo-img" src="${this._selectedBank.logo}" alt="${this._selectedBank.name}">` : BOP_ICONS.buildingSm}</div><span class="bop-accounts-bank-name">${this._selectedBank?.name || ''}</span></div><p class="bop-accounts-desc">Add, edit, or remove your linked bank accounts.</p>`;
    hd.appendChild(hdText);
    const linkAccountBtn = document.createElement('button');
    linkAccountBtn.className = 'bop-link-account-btn';
    linkAccountBtn.innerHTML = `${BOP_ICONS.plus} Link Account`;
    linkAccountBtn.addEventListener('click', () => this._handleLinkAccountClick());
    hd.appendChild(linkAccountBtn);
    inner.appendChild(hd);
    this._accountListEl = document.createElement('div');
    this._accountListEl.className = 'bop-account-list';
    inner.appendChild(this._accountListEl);
    this._renderAccountCards();
    this._accountsFooterEl = document.createElement('div');
    this._accountsFooterEl.className = 'bop-accounts-footer';
    inner.appendChild(this._accountsFooterEl);
    this._renderAccountsButton();
    step.appendChild(inner);
    this._contentEl.appendChild(step);
  }

  _renderAccountCards(skipAnimationIds = null) {
    if (!this._accountListEl) return;
    this._accountListEl.innerHTML = '';

    // Trailing loader row shown at the top while refetching accounts after a successful link
    if (this._isFetchingAccounts) {
      const loader = document.createElement('div');
      loader.className = 'bop-accounts-fetch-loader';
      loader.innerHTML = `
        <span class="bop-accounts-fetch-spinner">${BOP_ICONS.loader}</span>
        <span class="bop-accounts-fetch-text">Fetching your accounts…</span>
      `;
      this._accountListEl.appendChild(loader);
    }

    this._mockAccounts.forEach((acct, i) => {
      const sel = this._selectedAccounts.has(acct.id);
      const card = document.createElement('button'); card.className = 'bop-account-card';
      card.dataset.accountId = acct.id;
      // Skip the fade-in animation for accounts that were already visible before this render
      if (skipAnimationIds && skipAnimationIds.has(acct.id)) {
        card.style.animation = 'none';
        card.style.opacity = '1';
      } else {
        card.style.animationDelay = `${i * 100}ms`;
      }
      card.setAttribute('data-selected', String(sel));
      card.innerHTML = `<div class="bop-card-inner"><div class="bop-check-circle"><span class="bop-check-icon">${BOP_ICONS.checkSm}</span></div><div class="bop-account-details"><div class="bop-account-top"><p class="bop-account-type">${BOP_ICONS.wallet} ${acct.type}</p></div>${acct.bankName ? `<p class="bop-account-bank">${acct.bankName}</p>` : ''}<p class="bop-account-number">•••• ${acct.lastFour}</p></div></div>`;
      card.addEventListener('click', () => this._handleAccountToggle(acct.id));
      this._accountListEl.appendChild(card);
    });
  }

  _renderAccountsButton() {
    if (!this._accountsFooterEl) return;
    const c = this._selectedAccounts.size;
    const isOpen = this._accountsFooterEl.classList.contains('bop-accounts-footer--open');

    if (c === 0) {
      const btn = this._accountsFooterEl.querySelector('.bop-btn-unlink');
      if (btn) {
        btn.style.animation = 'bopFadeOut .15s ease forwards';
        setTimeout(() => {
          this._accountsFooterEl.classList.remove('bop-accounts-footer--open');
          this._accountsFooterEl.innerHTML = '';
        }, 150);
      } else {
        this._accountsFooterEl.classList.remove('bop-accounts-footer--open');
        this._accountsFooterEl.innerHTML = '';
      }
      return;
    }

    const label = `${BOP_ICONS.unlink}<span class="bop-btn-label">Unlink ${c} Account${c !== 1 ? 's' : ''}</span>`;
    const existing = this._accountsFooterEl.querySelector('.bop-btn-unlink');

    if (existing) {
      // Already open — just update the label, no rebuild
      existing.innerHTML = label;
      return;
    }

    // Build button, expand footer
    const btn = document.createElement('button');
    btn.className = 'bop-btn bop-btn-danger bop-btn-unlink';
    btn.style.animation = 'bopFadeIn .15s var(--bop-ease) forwards';
    btn.innerHTML = label;
    btn.addEventListener('click', () => {
      const accounts = this._mockAccounts.filter(a => this._selectedAccounts.has(a.id));
      if (accounts.length) this._handleUnlinkRequest(accounts);
    });
    this._accountsFooterEl.innerHTML = '';
    this._accountsFooterEl.appendChild(btn);
    this._accountsFooterEl.classList.add('bop-accounts-footer--open');
    // Scroll last selected card into view after footer transition completes
    setTimeout(() => {
      if (!this._accountListEl) return;
      const selected = this._accountListEl.querySelectorAll('.bop-account-card[data-selected="true"]');
      if (selected.length) selected[selected.length - 1].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 180);
  }

  _renderConfirmUnlink() {
    const accounts = this._unlinkTarget;
    if (!accounts || accounts.length === 0) return;
    const step = document.createElement('div');
    step.className = 'bop-step bop-confirm-unlink';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    const count = accounts.length;
    const plural = count !== 1;

    if (this._isLoading) {
      step.classList.add('bop-loading-view');
      step.innerHTML = `
        <div class="bop-loading-logo" style="background:${this._selectedBank?.bg || '#2563eb'}">${this._selectedBank?.logo ? `<img class="bop-logo-img" src="${this._selectedBank.logo}" alt="${this._selectedBank.name}">` : BOP_ICONS.buildingLg}</div>
        <div class="bop-loading-body">
          <p class="bop-loading-title">Unlinking Account${plural ? 's' : ''}</p>
          <p class="bop-loading-text">Removing ${count} account${plural ? 's' : ''} from your linked accounts</p>
        </div>
        <div class="bop-loading-bar-wrap"><div class="bop-loading-bar"></div></div>
      `;
      this._contentEl.appendChild(step);
      return;
    }

    const bankLogo = this._selectedBank?.logo
      ? `<img class="bop-logo-img" src="${this._selectedBank.logo}" alt="${this._selectedBank.name}">`
      : BOP_ICONS.buildingSm;

    const alertIcon = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    const accountCards = accounts.map(acct => `
      <div class="bop-unlink-card">
        <div class="bop-unlink-card-icon" style="background:${this._selectedBank?.bg || '#2563eb'}">${bankLogo}</div>
        <div class="bop-unlink-card-details">
          <p class="bop-unlink-card-type">${acct.type}</p>
          <p class="bop-unlink-card-num">•••• ${acct.lastFour}</p>
        </div>
      </div>
    `).join('');

    step.innerHTML = `
      <div class="bop-unlink-icon">${alertIcon}</div>
      <h3 class="bop-unlink-title">Unlink ${plural ? count + ' accounts' : 'this account'}?</h3>
      <p class="bop-unlink-desc">This will disconnect ${plural ? 'these accounts' : 'the account'} from your payment methods. You can re-link ${plural ? 'them' : 'it'} anytime.</p>
      <div class="bop-unlink-cards-list"${!plural ? ' data-single' : ''}>${accountCards}</div>
      <div class="bop-unlink-actions"></div>
    `;

    const actions = step.querySelector('.bop-unlink-actions');
    const unlinkBtn = document.createElement('button');
    unlinkBtn.className = 'bop-btn bop-btn-danger';
    unlinkBtn.innerHTML = `${BOP_ICONS.unlink}<span class="bop-btn-label">Unlink ${count} Account${plural ? 's' : ''}</span>`;
    unlinkBtn.addEventListener('click', () => this._handleConfirmUnlink());
    actions.appendChild(unlinkBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'bop-btn bop-btn-ghost';
    cancelBtn.innerHTML = '<span class="bop-btn-label">Cancel</span>';
    cancelBtn.addEventListener('click', () => this._handleCancelUnlink());
    actions.appendChild(cancelBtn);

    this._contentEl.appendChild(step);
  }

  _renderUnlinkResult() {
    const { succeeded, failed } = this._unlinkResult || { succeeded: [], failed: [] };
    const bankLogo = this._selectedBank?.logo
      ? `<img class="bop-logo-img" src="${this._selectedBank.logo}" alt="${this._selectedBank.name}">`
      : BOP_ICONS.buildingSm;
    const bankBg = this._selectedBank?.bg || '#2563eb';

    const makeCard = (acct, status) => `
      <div class="bop-ur-card bop-ur-card--${status}">
        <div class="bop-ur-card-icon" style="background:${bankBg}">${bankLogo}</div>
        <div class="bop-ur-card-details">
          <p class="bop-ur-card-type">${acct.type}${acct.bankName ? ` · ${acct.bankName}` : ''}</p>
          <p class="bop-ur-card-num">•••• ${acct.lastFour}</p>
          ${status === 'fail' && acct.reason ? `<p class="bop-ur-card-reason">${acct.reason}</p>` : ''}
        </div>
        <div class="bop-ur-badge bop-ur-badge--${status}">${status === 'ok' ? BOP_ICONS.checkSm : BOP_ICONS.alert}</div>
      </div>
    `;

    const step = document.createElement('div');
    step.className = 'bop-step bop-ur';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');

    const isFullFail = succeeded.length === 0;
    const icon = isFullFail
      ? `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`
      : `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    const headline = isFullFail ? 'Unable to Unlink' : 'Partially Unlinked';
    const desc = isFullFail
      ? `${failed.length === 1 ? 'This account' : 'These accounts'} could not be unlinked at this time.`
      : `${succeeded.length} account${succeeded.length !== 1 ? 's' : ''} unlinked successfully. ${failed.length} could not be removed.`;

    // Pinned top: icon + title + description
    const top = document.createElement('div');
    top.className = 'bop-ur-top';
    top.innerHTML = `
      <div class="bop-ur-icon bop-ur-icon--${isFullFail ? 'err' : 'warn'}">${icon}</div>
      <h3 class="bop-ur-title">${headline}</h3>
      <p class="bop-ur-desc">${desc}</p>
    `;
    step.appendChild(top);

    // Scrollable middle: card list only
    const scroll = document.createElement('div');
    scroll.className = 'bop-ur-scroll';
    scroll.innerHTML = `
      <div class="bop-ur-list">
        ${failed.map(a => makeCard(a, 'fail')).join('')}
        ${succeeded.map(a => makeCard(a, 'ok')).join('')}
      </div>
    `;
    step.appendChild(scroll);

    // Pinned bottom: Done button
    const footer = document.createElement('div');
    footer.className = 'bop-ur-footer';
    const doneBtn = document.createElement('button');
    doneBtn.className = 'bop-btn';
    doneBtn.innerHTML = '<span class="bop-btn-label">Done</span>';
    doneBtn.addEventListener('click', () => {
      this._unlinkResult = null;
      this._navigateStep('select-accounts', -1);
    });
    footer.appendChild(doneBtn);
    step.appendChild(footer);

    this._contentEl.appendChild(step);
  }

  _renderSuccess() {
    const step = document.createElement('div');
    step.className = 'bop-step bop-success-view';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    const tc = this._selectedBank?.text || this._selectedBank?.bg || '';
    const bankBg = this._selectedBank?.bg || '#2563eb';
    const bankLogo = this._selectedBank?.logo
      ? `<img class="bop-logo-img" src="${this._selectedBank.logo}" alt="${this._selectedBank.name}">`
      : `<span class="bop-success-logo-fallback">${BOP_ICONS.building}</span>`;
    const checkBadge = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
    step.innerHTML = `<div class="bop-success-icon"><div class="bop-success-icon-inner" style="background:${bankBg}">${bankLogo}</div><div class="bop-success-badge">${checkBadge}</div></div><h3 class="bop-success-title">Successfully Linked!</h3><div class="bop-success-card"><div class="bop-success-bank"><span style="color:${tc}">${this._selectedBank?.name || ''}</span><span>•</span><span>${this._linkedAccount?.type || ''}</span></div><p class="bop-success-four">•••• ${this._linkedAccount?.lastFour || ''}</p></div><p class="bop-success-desc">Your account is now ready to use for deposits and payments across the platform.</p>`;
    const done = document.createElement('button');
    done.className = 'bop-btn bop-btn-done';
    done.innerHTML = '<span class="bop-btn-label">Done</span>';
    done.addEventListener('click', () => this._handleDone());
    step.appendChild(done);
    this._contentEl.appendChild(step);
  }
}

// Register only if not already registered
if (!customElements.get('bison-operator-payments')) {
  customElements.define('bison-operator-payments', BisonOperatorPayments);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BisonOperatorPayments };
}

// Global availability
if (typeof window !== 'undefined') {
  window.BisonOperatorPayments = BisonOperatorPayments;
}
