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

const BOP_BANKS = [
  { id: 'chase', name: 'Chase', bg: '#2563eb' },
  // { id: 'bofa', name: 'Bank of America', bg: '#dc2626' },
  // { id: 'wells', name: 'Wells Fargo', bg: '#eab308', text: '#ca8a04' },
  // { id: 'citi', name: 'Citibank', bg: '#3b82f6' },
  // { id: 'usbank', name: 'US Bank', bg: '#4f46e5' },
  // { id: 'capital', name: 'Capital One', bg: '#ef4444' },
  // { id: 'pnc', name: 'PNC Bank', bg: '#f97316' },
  // { id: 'td', name: 'TD Bank', bg: '#16a34a' },
];

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
};

class BisonOperatorPayments extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._step = this._isSingleBank ? 'loading' : 'select-bank';
    this._direction = 1;
    this._searchQuery = '';
    this._selectedBank = this._isSingleBank ? BOP_BANKS[0] : null;
    this._isLoading = false;
    this._mockAccounts = [];
    this._selectedAccounts = new Set();
    this._linkedAccount = null;
    this._isClosing = false;
  }

  get _isSingleBank() { return BOP_BANKS.length === 1; }

  static get observedAttributes() { return ['open']; }

  connectedCallback() {
    this._injectStyles();
    this._renderTrigger();
    if (this.isOpen) this._renderModal();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open') {
      if (newVal !== null) { this._isClosing = false; this._render(); }
      else { this._animateClose(); }
    }
  }

  get isOpen() { return this.hasAttribute('open'); }

  _generateMockAccounts() {
    return [
      { id: '1', type: 'Checking', lastFour: String(Math.floor(1000 + Math.random() * 9000)), balance: Math.floor(5000 + Math.random() * 20000) },
      { id: '2', type: 'Savings', lastFour: String(Math.floor(1000 + Math.random() * 9000)), balance: Math.floor(10000 + Math.random() * 50000) },
    ];
  }

  _resetState() {
    this._step = this._isSingleBank ? 'loading' : 'select-bank'; this._direction = 1; this._searchQuery = '';
    this._selectedBank = this._isSingleBank ? BOP_BANKS[0] : null;
    this._isLoading = false;
    this._mockAccounts = []; this._selectedAccounts = new Set(); this._linkedAccount = null;
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

  _handleClose() { this._animateClose(); }

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
    this._renderAccountCards(); this._renderAccountsButton();
  }

  async _handleLinkAccounts() {
    if (this._selectedAccounts.size === 0) return;
    this._isLoading = true; this._renderAccountsButton();
    await new Promise(r => setTimeout(r, 1200));
    const firstId = Array.from(this._selectedAccounts)[0];
    const account = this._mockAccounts.find(a => a.id === firstId);
    if (account) this._linkedAccount = account;
    this._isLoading = false; this._navigateStep('success', 1);
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
    if (this._step === 'select-accounts') {
      if (this._isSingleBank) { this._handleClose(); return; }
      this._mockAccounts = []; this._selectedAccounts = new Set();
      this._navigateStep('select-bank', -1);
    }
  }

  _getHeaderTitle() {
    switch (this._step) {
      case 'select-bank': return 'Link Bank Account';
      case 'loading': return this._selectedBank?.name || 'Connecting';
      case 'select-accounts': return 'Select Accounts';
      case 'success': return 'Account Linked';
      default: return '';
    }
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
:host{--bop-primary:#4c7b63;--bop-primary-light:#e8f0eb;--bop-headline:#0f2a39;--bop-secondary:#5f6e78;--bop-success:#22c55e;--bop-error:#dd524b;--bop-sidebar:#fafafa;--bop-border:#e8e8e8;--bop-radius-sm:0.25rem;--bop-radius-md:0.5rem;--bop-radius-lg:0.75rem;--bop-radius-xl:1rem;--bop-radius-full:9999px;--bop-shadow-sm:0 1px 2px 0 rgb(0 0 0/0.05);--bop-shadow-md:0 4px 6px -1px rgb(0 0 0/0.1);--bop-shadow-2xl:0 25px 50px -12px rgb(0 0 0/0.25);--bop-dur-fast:150ms;--bop-dur-norm:200ms;--bop-dur-slow:300ms;--bop-ease:cubic-bezier(0.4,0,0.2,1);--bop-ease-spring:cubic-bezier(0.16,1,0.3,1);--bop-font:var(--font-sans,'Inter',system-ui,sans-serif);--bop-mono:var(--font-mono,ui-monospace,'SF Mono','Menlo',monospace);--bop-xs:0.75rem;--bop-sm:0.875rem;--bop-base:1rem;--bop-lg:1.125rem;--bop-2xl:1.5rem;font-family:var(--bop-font);display:inline-block}
.bop-trigger-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;font-size:var(--bop-sm);font-weight:600;font-family:var(--bop-font);color:#fff;background:var(--bop-primary);border:none;border-radius:var(--bop-radius-xl);cursor:pointer;box-shadow:0 4px 12px rgba(76,123,99,.3);transition:all var(--bop-dur-norm) var(--bop-ease);height:40px;line-height:1}
.bop-trigger-btn:hover{background:rgba(76,123,99,.9);box-shadow:0 6px 16px rgba(76,123,99,.4);transform:translateY(-1px)}
.bop-trigger-btn:active{transform:scale(.98) translateY(0)}
.bop-trigger-btn svg{width:18px;height:18px;flex-shrink:0}
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
@keyframes bopExpandIn{from{opacity:0;max-height:0;padding-top:0;padding-bottom:0}to{opacity:1;max-height:60px;padding-top:.75rem;padding-bottom:.75rem}}

.bop-overlay{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:1rem}
.bop-overlay[data-state="open"]{pointer-events:auto}
.bop-overlay[data-state="closed"]{pointer-events:none}
.bop-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:bopBackdropIn .3s var(--bop-ease) forwards}
.bop-overlay[data-state="closing"] .bop-backdrop{animation:bopBackdropOut .3s var(--bop-ease) forwards}
.bop-modal{position:relative;width:100%;max-width:28rem;height:520px;background:#fff;border:1px solid var(--bop-border);box-shadow:var(--bop-shadow-2xl);border-radius:var(--bop-radius-xl);overflow:hidden;display:flex;flex-direction:column;max-height:90vh;animation:bopModalIn .3s var(--bop-ease-spring) forwards;transition:max-width .4s var(--bop-ease-spring),height .4s var(--bop-ease-spring)}
.bop-modal.bop-modal-wide{max-width:34rem;height:720px}
.bop-overlay[data-state="closing"] .bop-modal{animation:bopModalOut .3s var(--bop-ease-spring) forwards}

.bop-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;border-bottom:1px solid rgba(250,250,250,.5);background:rgba(255,255,255,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:10;flex-shrink:0}
.bop-header-left{display:flex;align-items:center;gap:.75rem;height:2rem}
.bop-back-btn{padding:.375rem;margin-left:-.375rem;color:var(--bop-secondary);background:transparent;border:none;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color var(--bop-dur-norm) var(--bop-ease),background var(--bop-dur-norm) var(--bop-ease);animation:bopSlideFromLeft .2s var(--bop-ease) forwards}
.bop-back-btn:hover{color:var(--bop-headline);background:var(--bop-sidebar)}
.bop-header-title{font-size:var(--bop-lg);font-weight:600;color:var(--bop-headline);animation:bopFadeInUp .25s var(--bop-ease) forwards}
.bop-close-btn{padding:.375rem;margin-right:-.375rem;color:var(--bop-secondary);background:transparent;border:none;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color var(--bop-dur-norm) var(--bop-ease),background var(--bop-dur-norm) var(--bop-ease)}
.bop-close-btn:hover{color:var(--bop-headline);background:var(--bop-sidebar)}

.bop-content{position:relative;flex:1;overflow:hidden;min-height:460px;background:rgba(248,250,252,.3);transition:opacity .2s var(--bop-ease)}
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
.bop-bank-logo{width:2.5rem;height:2.5rem;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--bop-shadow-sm);outline:1px solid rgba(0,0,0,.05)}
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

.bop-accounts{padding:1.5rem}
.bop-accounts-header{flex-shrink:0;margin-bottom:1.5rem}
.bop-accounts-bank{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem}
.bop-accounts-bank-logo{width:2rem;height:2rem;border-radius:var(--bop-radius-md);display:flex;align-items:center;justify-content:center;color:#fff;outline:1px solid rgba(0,0,0,.05)}
.bop-accounts-bank-name{font-weight:500;color:var(--bop-headline)}
.bop-accounts-desc{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.5}
.bop-account-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem;padding:0 .25rem 1rem;scrollbar-width:none}
.bop-account-list::-webkit-scrollbar{display:none}
.bop-account-card{width:100%;display:flex;align-items:center;padding:1rem;border-radius:var(--bop-radius-xl);border:2px solid transparent;background:#fff;box-shadow:var(--bop-shadow-sm);cursor:pointer;transition:all var(--bop-dur-norm) var(--bop-ease);font-family:var(--bop-font);text-align:left;animation:bopItemFade .3s var(--bop-ease) forwards;opacity:0}
.bop-account-card:hover{border-color:rgba(76,123,99,.2);box-shadow:var(--bop-shadow-md)}
.bop-account-card[data-selected="true"]{border-color:var(--bop-primary);background:rgba(76,123,99,.05)}
.bop-card-inner{display:flex;align-items:center;gap:1rem;flex:1}
.bop-check-circle{width:1.5rem;height:1.5rem;border-radius:var(--bop-radius-full);border:2px solid var(--bop-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all var(--bop-dur-norm) var(--bop-ease)}
.bop-account-card:hover .bop-check-circle{border-color:rgba(76,123,99,.5)}
.bop-account-card[data-selected="true"] .bop-check-circle{background:var(--bop-primary);border-color:var(--bop-primary);transform:scale(1.1)}
.bop-check-icon{color:#fff;display:none}
.bop-account-card[data-selected="true"] .bop-check-icon{display:block;animation:bopCheckPop .25s var(--bop-ease-spring) forwards}
.bop-account-details{flex:1}
.bop-account-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.25rem}
.bop-account-type{font-size:var(--bop-sm);font-weight:600;color:var(--bop-headline);display:flex;align-items:center;gap:.5rem}
.bop-account-balance{font-size:var(--bop-sm);font-weight:700;color:var(--bop-headline)}
.bop-account-number{font-size:var(--bop-xs);color:var(--bop-secondary);font-family:var(--bop-mono);background:var(--bop-sidebar);padding:.125rem .5rem;border-radius:.375rem;display:inline-block}
.bop-accounts-footer{padding:1rem .25rem .5rem;border-top:1px solid rgba(232,232,232,.5);background:rgba(255,255,255,.5);backdrop-filter:blur(8px)}

.bop-success-view{padding:2rem;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#fff}
.bop-success-icon{width:5rem;height:5rem;background:#ecfdf5;border-radius:var(--bop-radius-full);display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;position:relative;animation:bopSuccessPop .6s var(--bop-ease-spring) forwards}
.bop-success-ring{position:absolute;inset:0;border-radius:var(--bop-radius-full);border:4px solid rgba(16,185,129,.2);animation:bopPulseRing 2s ease-in-out infinite}
.bop-success-icon svg{color:#10b981}
.bop-success-title{font-size:var(--bop-2xl);font-weight:700;color:var(--bop-headline);margin-bottom:.5rem}
.bop-success-card{background:rgba(248,250,252,1);border:1px solid var(--bop-border);border-radius:var(--bop-radius-xl);padding:1rem;width:100%;margin-bottom:2rem;margin-top:.5rem}
.bop-success-bank{display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:var(--bop-sm);color:var(--bop-headline);font-weight:500;margin-bottom:.25rem}
.bop-success-four{font-size:var(--bop-xs);color:var(--bop-secondary);font-family:var(--bop-mono)}
.bop-success-desc{font-size:var(--bop-sm);color:var(--bop-secondary);margin-bottom:2rem;line-height:1.5}

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
.bop-loading-logo{width:4.5rem;height:4.5rem;border-radius:1.25rem;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--bop-shadow-md);outline:1px solid rgba(0,0,0,.05);animation:bopFadeInUp .5s var(--bop-ease-spring) forwards,bopBreath 2s ease-in-out .5s infinite}
.bop-loading-body{display:flex;flex-direction:column;align-items:center;gap:.375rem;opacity:0;animation:bopFadeInUp .4s var(--bop-ease) .15s forwards}
.bop-loading-title{font-size:var(--bop-base);font-weight:600;color:var(--bop-headline)}
.bop-loading-text{font-size:var(--bop-sm);color:var(--bop-secondary);line-height:1.5}
.bop-loading-bar-wrap{width:11rem;height:3px;background:var(--bop-sidebar);border-radius:var(--bop-radius-full);overflow:hidden;opacity:0;animation:bopFadeIn .3s var(--bop-ease) .3s forwards}
.bop-loading-bar{height:100%;width:0;background:var(--bop-primary);border-radius:var(--bop-radius-full);animation:bopBarFill 1s cubic-bezier(.4,0,.2,1) .15s forwards}
.bop-loading-secure{display:flex;align-items:center;gap:.375rem;font-size:var(--bop-xs);color:var(--bop-secondary);opacity:0;animation:bopFadeIn .3s var(--bop-ease) .45s forwards}
.bop-loading-secure svg{color:#10b981}
@keyframes bopBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes bopBarFill{0%{width:0}50%{width:65%}100%{width:95%}}
`;
  }

  // ==================== RENDER ====================
  _renderTrigger() {
    const existing = this.shadowRoot.querySelector('.bop-trigger-btn');
    if (existing) return;
    const btn = document.createElement('button');
    btn.className = 'bop-trigger-btn';
    btn.innerHTML = `${BOP_ICONS.building} Link Bank Account`;
    btn.addEventListener('click', () => this.setAttribute('open', ''));
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
    const showBack = this._step === 'select-accounts' && !this._isSingleBank;
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
      if (this._step === 'select-accounts') modal.classList.add('bop-modal-wide');
      else modal.classList.remove('bop-modal-wide');
    }
    switch (this._step) {
      case 'select-bank': this._renderSelectBank(); break;
      case 'loading': this._renderLoading(); break;
      case 'select-accounts': this._renderSelectAccounts(); break;
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
      btn.innerHTML = `<div class="bop-bank-item-left"><div class="bop-bank-logo" style="background:${bank.bg}">${BOP_ICONS.building}</div><span class="bop-bank-name">${bank.name}</span></div><span class="bop-chevron">${BOP_ICONS.chevron}</span>`;
      btn.addEventListener('click', () => this._handleBankSelect(bank));
      this._bankListEl.appendChild(btn);
    });
  }

  _renderLoading() {
    const step = document.createElement('div');
    step.className = 'bop-step bop-loading-view';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    step.innerHTML = `
      <div class="bop-loading-logo" style="background:${this._selectedBank?.bg || '#2563eb'}">${BOP_ICONS.buildingLg}</div>
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
      this._selectedAccounts = new Set([this._mockAccounts[0].id]);
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
          });
        }, 400);
      }, 200);
    }, 1000);
  }

  _renderSelectAccounts() {
    const step = document.createElement('div');
    step.className = 'bop-step bop-accounts';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    const inner = document.createElement('div');
    inner.style.cssText = 'flex:1;display:flex;flex-direction:column;min-height:0;';
    const hd = document.createElement('div'); hd.className = 'bop-accounts-header';
    hd.innerHTML = `<div class="bop-accounts-bank"><div class="bop-accounts-bank-logo" style="background:${this._selectedBank?.bg || ''}">${BOP_ICONS.buildingSm}</div><span class="bop-accounts-bank-name">${this._selectedBank?.name || ''}</span></div><p class="bop-accounts-desc">Select the accounts you want to use for deposits and payments.</p>`;
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

  _renderAccountCards() {
    if (!this._accountListEl) return;
    this._accountListEl.innerHTML = '';
    this._mockAccounts.forEach((acct, i) => {
      const sel = this._selectedAccounts.has(acct.id);
      const card = document.createElement('button'); card.className = 'bop-account-card';
      card.style.animationDelay = `${i * 100}ms`;
      card.setAttribute('data-selected', String(sel));
      card.innerHTML = `<div class="bop-card-inner"><div class="bop-check-circle"><span class="bop-check-icon">${BOP_ICONS.checkSm}</span></div><div class="bop-account-details"><div class="bop-account-top"><p class="bop-account-type">${BOP_ICONS.wallet} ${acct.type}</p><p class="bop-account-balance">$${acct.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div><p class="bop-account-number">•••• ${acct.lastFour}</p></div></div>`;
      card.addEventListener('click', () => this._handleAccountToggle(acct.id));
      this._accountListEl.appendChild(card);
    });
  }

  _renderAccountsButton() {
    if (!this._accountsFooterEl) return;
    this._accountsFooterEl.innerHTML = '';
    const btn = document.createElement('button'); btn.className = 'bop-btn';
    btn.disabled = this._selectedAccounts.size === 0 || this._isLoading;
    if (this._isLoading) {
      btn.innerHTML = `<span class="bop-btn-loading">${BOP_ICONS.loader.replace('width="20"','width="20" class="bop-spinner"')}<span>Linking Accounts...</span></span>`;
    } else {
      const c = this._selectedAccounts.size;
      btn.innerHTML = `<span class="bop-btn-label">Continue with ${c} Account${c !== 1 ? 's' : ''}</span>`;
    }
    btn.addEventListener('click', () => this._handleLinkAccounts());
    this._accountsFooterEl.appendChild(btn);
  }

  _renderSuccess() {
    const step = document.createElement('div');
    step.className = 'bop-step bop-success-view';
    step.setAttribute('data-direction', this._direction > 0 ? 'forward' : 'backward');
    const tc = this._selectedBank?.text || this._selectedBank?.bg || '';
    step.innerHTML = `<div class="bop-success-icon"><div class="bop-success-ring"></div>${BOP_ICONS.check}</div><h3 class="bop-success-title">Successfully Linked!</h3><div class="bop-success-card"><div class="bop-success-bank"><span style="color:${tc}">${this._selectedBank?.name || ''}</span><span>•</span><span>${this._linkedAccount?.type || ''}</span></div><p class="bop-success-four">•••• ${this._linkedAccount?.lastFour || ''}</p></div><p class="bop-success-desc">Your account is now ready to use for deposits and payments across the platform.</p>`;
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
