/**
 * BisonWioInvoices Web Component
 *
 * UI-only animated invoice modal for WIO invoice review, payment, and deletion.
 *
 * @author @kfajardo
 * @version 1.0.0
 */

const BWI_ICONS = {
  x: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  arrowLeft:
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
  loader:
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  invoice:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v4h4"/><path d="M8 12h8"/><path d="M8 16h5"/><path d="M8 8h2"/></svg>',
  wallet:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 1 0 0 4h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M16 12h6"/><path d="M18 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0 1 12 0"/></svg>',
  spark:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z"/><path d="m5 19 .9 2 .9-2 2-.9-2-.9-.9-2-.9 2-2 .9 2 .9Z"/><path d="m18 18 1.1 2.5L20.2 18l2.5-1.1-2.5-1.1L19.1 13l-1.1 2.8-2.8 1.1L18 18Z"/></svg>',
};

const BWI_MODAL_SIZES = {
  invoices: { width: 840, height: 720 },
  invoice: { width: 720, height: 680 },
  "bulk-pay": { width: 520, height: 640 },
  "bulk-delete": { width: 520, height: 640 },
  "payment-loading": { width: 460, height: 560 },
  "delete-loading": { width: 460, height: 560 },
  "payment-success": { width: 400, height: 480 },
  "delete-success": { width: 400, height: 480 },
};

const BWI_CONFIRM_SIZES = {
  pay: { width: 420, height: 400 },
  delete: { width: 420, height: 400 },
};

const BWI_STATUS_META = {
  draft: { label: "Draft" },
  paid: { label: "Paid" },
  pending: { label: "Pending" },
  processing: { label: "Processing" },
  overdue: { label: "Overdue" },
};

const BWI_MOCK_INVOICES = [
  {
    id: "WIO-41028",
    invoiceNumber: "INV-41028",
    operatorName: "Red Mesa Water Services LLC",
    date: "2026-03-05",
    status: "pending",
    subtotal: 1380,
    tax: 110.4,
    amount: 1490.4,
    items: [
      { label: "Compressor standby", qty: 2, unitPrice: 320, total: 640 },
      { label: "Water hauling", qty: 4, unitPrice: 135, total: 540 },
      { label: "Fuel surcharge", qty: 1, unitPrice: 200, total: 200 },
    ],
  },
  {
    id: "WIO-41031",
    invoiceNumber: "INV-41031",
    operatorName: "Northline Site Services Inc.",
    date: "2026-03-07",
    status: "draft",
    subtotal: 760,
    tax: 60.8,
    amount: 820.8,
    items: [
      { label: "Site prep labor", qty: 2, unitPrice: 240, total: 480 },
      { label: "Pad cleanup", qty: 1, unitPrice: 180, total: 180 },
      { label: "Waste manifest", qty: 1, unitPrice: 100, total: 100 },
    ],
  },
  {
    id: "WIO-41034",
    invoiceNumber: "INV-41034",
    operatorName: "Iron Creek Equipment Co.",
    date: "2026-03-08",
    status: "processing",
    subtotal: 1125,
    tax: 90,
    amount: 1215,
    items: [
      { label: "Frac tank rental", qty: 3, unitPrice: 225, total: 675 },
      { label: "Pressure wash", qty: 2, unitPrice: 140, total: 280 },
      { label: "Travel charge", qty: 1, unitPrice: 170, total: 170 },
    ],
  },
  {
    id: "WIO-41039",
    invoiceNumber: "INV-41039",
    operatorName: "Blue Prairie Logistics Group",
    date: "2026-03-09",
    status: "pending",
    subtotal: 1740,
    tax: 139.2,
    amount: 1879.2,
    items: [
      { label: "Hot shot runs", qty: 6, unitPrice: 180, total: 1080 },
      { label: "Expedite dispatch", qty: 2, unitPrice: 180, total: 360 },
      { label: "Liftgate access", qty: 3, unitPrice: 100, total: 300 },
    ],
  },
  {
    id: "WIO-41042",
    invoiceNumber: "INV-41042",
    operatorName: "High Desert Field Operations Ltd.",
    date: "2026-03-10",
    status: "paid",
    subtotal: 980,
    tax: 78.4,
    amount: 1058.4,
    items: [
      { label: "Mud motor assist", qty: 2, unitPrice: 280, total: 560 },
      { label: "Crew support", qty: 2, unitPrice: 130, total: 260 },
      { label: "Safety review", qty: 1, unitPrice: 160, total: 160 },
    ],
  },
  {
    id: "WIO-41044",
    invoiceNumber: "INV-41044",
    operatorName: "Clearspan Washout & Recovery LLC",
    date: "2026-03-12",
    status: "draft",
    subtotal: 610,
    tax: 48.8,
    amount: 658.8,
    items: [
      { label: "Equipment washdown", qty: 2, unitPrice: 170, total: 340 },
      { label: "Mud disposal", qty: 1, unitPrice: 190, total: 190 },
      { label: "Gate access", qty: 1, unitPrice: 80, total: 80 },
    ],
  },
  {
    id: "WIO-41049",
    invoiceNumber: "INV-41049",
    operatorName: "West Basin Power Rental Co.",
    date: "2026-03-14",
    status: "overdue",
    subtotal: 1230,
    tax: 98.4,
    amount: 1328.4,
    items: [
      { label: "Generator rental", qty: 3, unitPrice: 250, total: 750 },
      { label: "Delivery fee", qty: 2, unitPrice: 120, total: 240 },
      { label: "Containment kit", qty: 2, unitPrice: 120, total: 240 },
    ],
  },
];

function cloneInvoice(invoice) {
  return {
    ...invoice,
    items: invoice.items.map((item) => ({ ...item })),
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

class BisonWioInvoices extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._open = false;
    this._screen = "invoices";
    this._screenData = {};
    this._direction = 1;
    this._history = [];
    this._searchQuery = "";
    this._selectedIds = new Set();
    this._invoices = BWI_MOCK_INVOICES.map(cloneInvoice);
    this._confirmState = null;

    this._overlayEl = null;
    this._modalEl = null;
    this._stageEl = null;
    this._confirmLayerEl = null;
    this._currentScreenEl = null;
    this._backButtonEl = null;
    this._closeButtonEl = null;

    this._invoiceListEl = null;
    this._invoiceMetaEl = null;
    this._bulkDockEl = null;
    this._searchInputEl = null;
    this._progressFillEl = null;
    this._invoiceCardMap = new Map();

    this._pendingProgress = null;
    this._progressToken = 0;
    this._transitionToken = 0;
    this._bulkDockTransitionToken = 0;
    this._timeoutIds = new Set();
    this._rafIds = new Set();

    this._handleWindowKeydown = this._handleWindowKeydown.bind(this);

    this._renderShell();
  }

  static get observedAttributes() {
    return ["open"];
  }

  connectedCallback() {
    this._upgradeProperty("open");

    if (this.hasAttribute("open")) {
      this._open = false;
      this.open = true;
    }
  }

  disconnectedCallback() {
    this._teardownWindowListeners();
    this._clearScheduledWork();
    this._overlayEl = null;
    this._modalEl = null;
    this._stageEl = null;
    this._confirmLayerEl = null;
    this._currentScreenEl = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "open" || oldValue === newValue) return;
    const shouldOpen = newValue !== null;
    if (this._open === shouldOpen) return;

    this._open = shouldOpen;
    if (shouldOpen) {
      this._openModal();
    } else {
      this._closeModal(true);
    }
  }

  get open() {
    return this._open;
  }

  set open(value) {
    if (Boolean(value)) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  _upgradeProperty(prop) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  _renderShell() {
    this.shadowRoot.innerHTML = `
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <style>
        :host{
          --bwi-green:#2f7a4b;
          --bwi-green-deep:#205836;
          --bwi-green-soft:#d9f2e1;
          --bwi-red:#c44c4c;
          --bwi-red-deep:#983737;
          --bwi-red-soft:#f8dfdf;
          --bwi-ink:#162018;
          --bwi-muted:#66746c;
          --bwi-muted-soft:#8a968f;
          --bwi-line:rgba(27,47,36,.1);
          --bwi-line-strong:rgba(27,47,36,.16);
          --bwi-paper:#fffdf7;
          --bwi-paper-soft:#f7f2e8;
          --bwi-gray-hover:rgba(19,25,22,.06);
          --bwi-shadow-sm:0 12px 28px rgba(24,38,30,.08);
          --bwi-shadow-lg:0 24px 60px rgba(12,20,15,.18);
          --bwi-ease:cubic-bezier(.22,1,.36,1);
          display:inline-block;
          font-family:"Avenir Next","Segoe UI",sans-serif;
          color:var(--bwi-ink);
        }

        *{box-sizing:border-box}

        button,input{font:inherit}

        .bwi-root{position:relative}

        .bwi-btn{
          position:relative;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          padding:8px 16px;
          border:none;
          border-radius:16px;
          cursor:pointer;
          transition:transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease, opacity .2s ease;
          white-space:nowrap;
          text-decoration:none;
        }

        .bwi-btn:disabled{
          cursor:not-allowed;
          opacity:.56;
          box-shadow:none;
          transform:none;
        }

        .bwi-btn:not(:disabled):hover{
          transform:translateY(-1px);
        }

        .bwi-btn-primary{
          background:linear-gradient(135deg,var(--bwi-green) 0%,var(--bwi-green-deep) 100%);
          color:#fff;
          box-shadow:0 12px 24px rgba(47,122,75,.24);
        }

        .bwi-btn-primary:not(:disabled):hover{
          box-shadow:0 18px 30px rgba(47,122,75,.28), 0 0 0 4px rgba(47,122,75,.09);
        }

        .bwi-btn-secondary{
          background:transparent;
          color:#111;
        }

        .bwi-btn-secondary:not(:disabled):hover{
          background:var(--bwi-gray-hover);
        }

        .bwi-btn-error{
          background:linear-gradient(135deg,var(--bwi-red) 0%,var(--bwi-red-deep) 100%);
          color:#fff;
          box-shadow:0 12px 24px rgba(196,76,76,.22);
        }

        .bwi-btn-error:not(:disabled):hover{
          box-shadow:0 18px 30px rgba(196,76,76,.24), 0 0 0 4px rgba(196,76,76,.08);
        }

        .bwi-icon-btn{
          min-width:36px;
          width:36px;
          height:36px;
          padding:8px;
          border-radius:12px;
        }

        .bwi-trigger{
          min-height:44px;
          font-weight:700;
          letter-spacing:.01em;
          overflow:hidden;
        }

        .bwi-trigger::after{
          content:"";
          position:absolute;
          inset:-40% auto -40% -45%;
          width:40%;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,.34),transparent);
          transform:skewX(-18deg);
          animation:bwiTriggerSweep 3.8s linear infinite;
          pointer-events:none;
        }

        .bwi-portal{position:relative;z-index:50}

        .bwi-overlay{
          position:fixed;
          inset:0;
          z-index:999;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:12px;
          opacity:0;
          transition:opacity .28s ease;
        }

        .bwi-overlay[data-state="open"]{opacity:1}

        .bwi-backdrop{
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at top left, rgba(96,164,120,.18), transparent 32%),
            radial-gradient(circle at right center, rgba(255,239,194,.16), transparent 28%),
            rgba(11,18,14,.58);
          backdrop-filter:blur(14px);
        }

        .bwi-dialog-shell{
          position:relative;
          z-index:1;
          width:100%;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .bwi-modal{
          --bwi-modal-width:880px;
          --bwi-modal-height:760px;
          position:relative;
          width:min(calc(100vw - 24px), var(--bwi-modal-width));
          height:min(calc(100vh - 24px), var(--bwi-modal-height));
          background:
            radial-gradient(circle at top right, rgba(86,150,109,.11), transparent 34%),
            radial-gradient(circle at left 20%, rgba(255,224,145,.12), transparent 26%),
            linear-gradient(180deg,#fffcf5 0%,#f6efe2 100%);
          border:1px solid rgba(255,255,255,.58);
          border-radius:32px;
          box-shadow:var(--bwi-shadow-lg);
          overflow:hidden;
          display:flex;
          flex-direction:column;
          transition:width .42s var(--bwi-ease), height .42s var(--bwi-ease), transform .28s var(--bwi-ease), filter .28s ease;
          transform:translateY(20px) scale(.96);
        }

        .bwi-overlay[data-state="open"] .bwi-modal{
          transform:translateY(0) scale(1);
        }

        .bwi-modal::before,
        .bwi-modal::after{
          content:"";
          position:absolute;
          border-radius:999px;
          filter:blur(10px);
          opacity:.58;
          pointer-events:none;
        }

        .bwi-modal::before{
          width:240px;
          height:240px;
          background:radial-gradient(circle, rgba(94,160,118,.18), transparent 70%);
          top:-110px;
          right:-60px;
        }

        .bwi-modal::after{
          width:200px;
          height:200px;
          background:radial-gradient(circle, rgba(231,190,88,.14), transparent 68%);
          bottom:-90px;
          left:-50px;
        }

        .bwi-header{
          position:relative;
          z-index:1;
          min-height:84px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          padding:20px 24px 16px;
          border-bottom:1px solid rgba(28,46,36,.08);
          background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.52));
          backdrop-filter:blur(12px);
        }

        .bwi-header-left{
          display:flex;
          align-items:center;
          gap:12px;
          min-width:0;
        }

        .bwi-header .bwi-btn-secondary{color:#1b2620}

        .bwi-stage{
          position:relative;
          flex:1;
          min-height:0;
          overflow:hidden;
        }

        .bwi-screen{
          position:absolute;
          inset:0;
          display:flex;
          flex-direction:column;
          gap:8px;
          padding:24px;
          opacity:0;
          transform:translateX(28px) scale(.985);
          transition:opacity .32s ease, transform .32s var(--bwi-ease);
        }

        .bwi-screen[data-enter="backward"]{
          transform:translateX(-28px) scale(.985);
        }

        .bwi-screen.is-active{
          opacity:1;
          transform:translateX(0) scale(1);
        }

        .bwi-screen.is-leaving[data-leave="forward"]{
          opacity:0;
          transform:translateX(-24px) scale(.985);
        }

        .bwi-screen.is-leaving[data-leave="backward"]{
          opacity:0;
          transform:translateX(24px) scale(.985);
        }

        .bwi-screen-head{
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .bwi-kicker{
          margin:0;
          display:inline-flex;
          align-items:center;
          gap:8px;
          font-size:11px;
          letter-spacing:.14em;
          text-transform:uppercase;
          font-weight:700;
          color:var(--bwi-green);
        }

        .bwi-kicker svg{opacity:.85}

        .bwi-screen-title{
          margin:0;
          font-family:"Iowan Old Style","Palatino Linotype",Georgia,serif;
          font-size:44px;
          line-height:.94;
          letter-spacing:-.02em;
          color:#151f18;
        }

        .bwi-screen-copy,
        .bwi-empty-copy,
        .bwi-detail-note,
        .bwi-review-copy,
        .bwi-loading-copy,
        .bwi-success-copy{
          margin:0;
          font-size:14px;
          line-height:1.55;
          color:var(--bwi-muted);
        }

        .bwi-search-shell{
          position:relative;
          margin-top:8px;
        }

        .bwi-search-shell svg{
          position:absolute;
          left:16px;
          top:50%;
          transform:translateY(-50%);
          color:var(--bwi-muted-soft);
          pointer-events:none;
        }

        .bwi-search-input{
          width:100%;
          min-height:48px;
          padding:12px 16px 12px 44px;
          border:1px solid rgba(26,42,33,.1);
          border-radius:18px;
          background:rgba(255,255,255,.76);
          color:#18211b;
          box-shadow:var(--bwi-shadow-sm);
          outline:none;
          transition:border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .bwi-search-input:focus{
          border-color:rgba(47,122,75,.32);
          box-shadow:0 0 0 4px rgba(47,122,75,.08), var(--bwi-shadow-sm);
          background:#fff;
        }

        .bwi-invoice-meta{
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          padding:8px 4px 4px;
          color:var(--bwi-muted);
          font-size:13px;
        }

        .bwi-meta-count{
          font-weight:700;
          color:#243229;
        }

        .bwi-invoice-list{
          flex:1;
          min-height:0;
          max-height:480px;
          overflow:auto;
          display:flex;
          flex-direction:column;
          gap:12px;
          padding:4px 4px 8px;
          mask-image:linear-gradient(to bottom, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%);
        }

        .bwi-invoice-list::-webkit-scrollbar,
        .bwi-review-strip::-webkit-scrollbar{
          height:10px;
          width:10px;
        }

        .bwi-invoice-list::-webkit-scrollbar-thumb,
        .bwi-review-strip::-webkit-scrollbar-thumb{
          background:rgba(34,52,41,.18);
          border-radius:999px;
          border:2px solid transparent;
          background-clip:padding-box;
        }

        .bwi-invoice-card{
          position:relative;
          display:grid;
          grid-template-columns:24px minmax(0,1fr) auto;
          gap:16px;
          padding:20px;
          border-radius:24px;
          border:1px solid rgba(26,42,33,.08);
          background:rgba(255,255,255,.8);
          box-shadow:var(--bwi-shadow-sm);
          cursor:pointer;
          transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease, background .2s ease;
          animation:bwiCardRise .42s var(--bwi-ease) both;
        }

        .bwi-invoice-card:hover{
          transform:translateY(-2px);
          border-color:rgba(47,122,75,.24);
          box-shadow:0 20px 34px rgba(16,31,23,.1);
        }

        .bwi-invoice-card.is-selected{
          background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(224,245,233,.9));
          border-color:rgba(47,122,75,.26);
          box-shadow:0 24px 38px rgba(27,68,43,.14), inset 0 0 0 1px rgba(255,255,255,.5);
        }

        .bwi-select-indicator{
          display:flex;
          align-items:flex-start;
          justify-content:center;
          padding-top:4px;
        }

        .bwi-select-mark{
          width:20px;
          height:20px;
          border-radius:999px;
          border:1px solid rgba(28,46,36,.18);
          background:#fff;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#fff;
          transition:background .2s ease, border-color .2s ease, transform .2s ease;
        }

        .bwi-invoice-card.is-selected .bwi-select-mark{
          background:var(--bwi-green);
          border-color:var(--bwi-green);
          transform:scale(1.04);
        }

        .bwi-card-main{
          min-width:0;
          display:flex;
          flex-direction:column;
          gap:.75rem;
        }

        .bwi-card-top{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:1rem;
        }

        .bwi-card-label{
          margin:0;
          font-size:11px;
          font-weight:700;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:var(--bwi-muted-soft);
        }

        .bwi-card-name{
          margin:0;
          font-size:21px;
          font-weight:700;
          line-height:1.12;
          color:#152018;
        }

        .bwi-card-total-label{
          margin:0;
          font-size:11px;
          font-weight:700;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:var(--bwi-muted-soft);
        }

        .bwi-card-total{
          margin:0;
          font-size:28px;
          font-weight:800;
          line-height:.96;
          color:#152018;
          text-align:right;
        }

        .bwi-card-meta{
          display:flex;
          flex-wrap:wrap;
          gap:6px 14px;
          align-items:center;
          color:var(--bwi-muted);
          font-size:13px;
        }

        .bwi-card-meta-text{
          margin:0;
          color:var(--bwi-muted);
          white-space:nowrap;
        }

        .bwi-meta-chip{
          display:inline-flex;
          align-items:center;
          gap:4px;
        }

        .bwi-status-pill{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:4px 12px;
          border-radius:999px;
          font-size:12px;
          font-weight:700;
          letter-spacing:.04em;
          text-transform:uppercase;
        }

        .bwi-status-pill.is-draft{background:#efe7ff;color:#5b3aa2}
        .bwi-status-pill.is-paid{background:#dff5e7;color:#215938}
        .bwi-status-pill.is-pending{background:#fff2cc;color:#8b5a00}
        .bwi-status-pill.is-processing{background:#ddecff;color:#235b9d}
        .bwi-status-pill.is-overdue{background:#fbe3cf;color:#a34816}

        .bwi-card-actions{
          display:flex;
          align-items:flex-start;
          justify-content:flex-end;
          align-self:flex-start;
        }

        .bwi-card-actions .bwi-btn{min-height:36px}

        .bwi-card-top-main{
          min-width:0;
          display:flex;
          flex-direction:column;
          gap:.5rem;
          flex:1;
        }

        .bwi-card-top-side{
          display:flex;
          flex-direction:column;
          align-items:flex-end;
          gap:.625rem;
          flex-shrink:0;
        }

        .bwi-card-total-block{
          display:flex;
          flex-direction:column;
          align-items:flex-end;
          gap:.3rem;
        }

        .bwi-bulk-dock{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          max-height:0;
          padding:0 .25rem;
          overflow:hidden;
          border-radius:0;
          background:rgba(22,32,24,.96);
          color:#fff;
          box-shadow:none;
          border-top:0 solid rgba(232,232,232,.5);
          transform:translateY(8px);
          opacity:0;
          pointer-events:none;
          transition:
            max-height .18s var(--bwi-ease),
            padding .18s var(--bwi-ease),
            border-top-width 0s linear .18s,
            opacity .18s var(--bwi-ease),
            transform .18s var(--bwi-ease);
        }

        .bwi-bulk-dock.is-visible{
          max-height:88px;
          padding:1rem .25rem .5rem;
          overflow:visible;
          border-top-width:1px;
          transform:translateY(0);
          opacity:1;
          pointer-events:auto;
          transition:
            max-height .18s var(--bwi-ease),
            padding .18s var(--bwi-ease),
            border-top-width 0s linear 0s,
            opacity .18s var(--bwi-ease),
            transform .18s var(--bwi-ease);
        }

        .bwi-bulk-copy{
          display:flex;
          flex-direction:column;
          gap:4px;
          min-width:0;
        }

        .bwi-bulk-title{
          margin:0;
          font-size:16px;
          font-weight:700;
          color:#fff;
        }

        .bwi-bulk-note{
          margin:0;
          color:rgba(255,255,255,.74);
          font-size:13px;
        }

        .bwi-bulk-actions{
          display:flex;
          align-items:center;
          gap:8px;
          flex-wrap:wrap;
          justify-content:flex-end;
        }

        .bwi-detail-shell,
        .bwi-review-shell{
          display:flex;
          flex-direction:column;
          gap:20px;
          min-height:0;
          height:100%;
        }

        .bwi-detail-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
          padding:4px 4px 0;
        }

        .bwi-detail-overline{
          margin:0 0 8px;
          font-size:12px;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:var(--bwi-muted-soft);
        }

        .bwi-detail-title{
          margin:0;
          font-size:34px;
          font-weight:800;
          line-height:.98;
          color:#172219;
        }

        .bwi-detail-subline{
          margin:8px 0 0;
          display:flex;
          flex-wrap:wrap;
          gap:8px 12px;
          font-size:13px;
          color:var(--bwi-muted);
        }

        .bwi-detail-grid{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px;
        }

        .bwi-stat-card,
        .bwi-review-stat{
          padding:18px 20px;
          border-radius:24px;
          border:1px solid rgba(26,42,33,.08);
          background:rgba(255,255,255,.78);
          box-shadow:var(--bwi-shadow-sm);
        }

        .bwi-stat-label,
        .bwi-review-stat-label{
          margin:0 0 8px;
          font-size:12px;
          font-weight:700;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:var(--bwi-muted-soft);
        }

        .bwi-stat-value,
        .bwi-review-stat-value{
          margin:0;
          font-size:26px;
          font-weight:800;
          line-height:1;
          color:#152118;
        }

        .bwi-detail-table{
          flex:1;
          min-height:0;
          overflow:auto;
          display:flex;
          flex-direction:column;
          gap:12px;
          padding-right:4px;
        }

        .bwi-line-item,
        .bwi-total-row{
          display:grid;
          grid-template-columns:minmax(0,1fr) 90px 110px;
          gap:12px;
          align-items:center;
          padding:16px 18px;
          border-radius:20px;
          background:rgba(255,255,255,.76);
          border:1px solid rgba(26,42,33,.08);
        }

        .bwi-line-title,
        .bwi-total-title{
          margin:0 0 4px;
          font-size:16px;
          font-weight:700;
          color:#192219;
        }

        .bwi-line-subtitle{
          margin:0;
          font-size:13px;
          color:var(--bwi-muted);
        }

        .bwi-line-qty,
        .bwi-total-qty{
          font-weight:700;
          color:#213126;
          text-align:right;
        }

        .bwi-line-total,
        .bwi-total-value{
          font-weight:800;
          color:#18211b;
          text-align:right;
        }

        .bwi-total-row.is-grand{
          background:linear-gradient(180deg,#eff8f2,#dff2e5);
          border-color:rgba(47,122,75,.16);
        }

        .bwi-detail-footer{
          display:flex;
          flex-direction:column;
          gap:12px;
        }

        .bwi-detail-footer .bwi-btn{
          width:100%;
          min-height:48px;
        }

        .bwi-review-top{
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .bwi-review-title{
          margin:0;
          font-family:"Iowan Old Style","Palatino Linotype",Georgia,serif;
          font-size:38px;
          line-height:.98;
          color:#162119;
        }

        .bwi-review-stats{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:12px;
        }

        .bwi-review-strip{
          display:flex;
          gap:12px;
          overflow-x:auto;
          padding:4px 4px 8px;
          scroll-snap-type:x proximity;
        }

        .bwi-strip-card{
          min-width:228px;
          scroll-snap-align:start;
          padding:18px;
          border-radius:24px;
          background:rgba(255,255,255,.82);
          border:1px solid rgba(26,42,33,.08);
          box-shadow:var(--bwi-shadow-sm);
          display:flex;
          flex-direction:column;
          gap:12px;
          animation:bwiCardRise .42s var(--bwi-ease) both;
        }

        .bwi-strip-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
        }

        .bwi-strip-number{
          margin:0 0 6px;
          font-size:12px;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:var(--bwi-muted-soft);
        }

        .bwi-strip-name{
          margin:0;
          font-size:18px;
          font-weight:700;
          line-height:1.08;
        }

        .bwi-strip-amount{
          margin:0;
          font-size:20px;
          font-weight:800;
          line-height:1;
          text-align:right;
        }

        .bwi-strip-meta{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          color:var(--bwi-muted);
          font-size:13px;
        }

        .bwi-review-actions{
          margin-top:auto;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
        }

        .bwi-review-actions .bwi-btn{
          min-height:44px;
        }

        .bwi-loading-shell,
        .bwi-success-shell{
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:center;
          gap:20px;
        }

        .bwi-loading-head,
        .bwi-success-head{
          display:flex;
          align-items:center;
          gap:16px;
        }

        .bwi-loading-orb,
        .bwi-success-orb{
          width:72px;
          height:72px;
          border-radius:24px;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          color:#fff;
          background:linear-gradient(135deg,var(--bwi-green) 0%,#173f2d 100%);
          box-shadow:0 20px 34px rgba(24,66,43,.26);
        }

        .bwi-loading-orb svg{
          animation:bwiSpin 1s linear infinite;
        }

        .bwi-loading-title,
        .bwi-success-title{
          margin:0 0 8px;
          font-family:"Iowan Old Style","Palatino Linotype",Georgia,serif;
          font-size:36px;
          line-height:.98;
          color:#172119;
        }

        .bwi-progress-card{
          display:flex;
          flex-direction:column;
          gap:12px;
          padding:20px;
          border-radius:24px;
          background:rgba(255,255,255,.82);
          border:1px solid rgba(26,42,33,.08);
          box-shadow:var(--bwi-shadow-sm);
        }

        .bwi-progress-meta{
          display:flex;
          align-items:center;
          justify-content:flex-start;
          gap:8px;
        }

        .bwi-progress-label{
          margin:0;
          font-size:13px;
          font-weight:700;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:var(--bwi-muted-soft);
        }

        .bwi-progress-track{
          position:relative;
          height:12px;
          border-radius:999px;
          overflow:hidden;
          background:rgba(19,30,24,.08);
        }

        .bwi-progress-fill{
          position:absolute;
          inset:0 auto 0 0;
          width:100%;
          border-radius:999px;
          background:linear-gradient(90deg,#2f7a4b 0%,#54a96e 55%,#d8f2df 100%);
          transform:scaleX(0);
          transform-origin:left center;
          transition:transform .08s linear;
        }

        .bwi-progress-copy{
          margin:0;
          font-size:13px;
          color:var(--bwi-muted);
        }

        .bwi-success-badges{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }

        .bwi-success-badge{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:8px 12px;
          border-radius:999px;
          background:rgba(255,255,255,.82);
          border:1px solid rgba(26,42,33,.08);
          color:#203027;
          font-size:13px;
          font-weight:700;
        }

        .bwi-confirm-layer{
          position:absolute;
          inset:0;
          z-index:3;
          pointer-events:none;
        }

        .bwi-confirm-wrap{
          position:absolute;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          pointer-events:auto;
        }

        .bwi-confirm-backdrop{
          position:absolute;
          inset:0;
          background:rgba(13,20,16,.24);
        }

        .bwi-confirm{
          --bwi-confirm-width:440px;
          --bwi-confirm-height:320px;
          position:relative;
          width:min(calc(100vw - 48px), var(--bwi-confirm-width));
          min-height:min(calc(100vh - 48px), var(--bwi-confirm-height));
          max-height:calc(100vh - 48px);
          border-radius:28px;
          padding:24px;
          background:linear-gradient(180deg,#fffefb 0%,#f6f0e5 100%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 26px 64px rgba(11,19,15,.24);
          display:flex;
          flex-direction:column;
          gap:16px;
          overflow:auto;
          transform:translateY(20px) scale(.94);
          opacity:0;
          animation:bwiConfirmIn .26s var(--bwi-ease) forwards;
        }

        .bwi-confirm-icon{
          width:56px;
          height:56px;
          border-radius:18px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#fff;
        }

        .bwi-confirm-icon.is-pay{
          background:linear-gradient(135deg,var(--bwi-green) 0%,#173f2d 100%);
        }

        .bwi-confirm-icon.is-delete{
          background:linear-gradient(135deg,var(--bwi-red) 0%,#7f2f2f 100%);
        }

        .bwi-confirm-title{
          margin:0;
          font-family:"Iowan Old Style","Palatino Linotype",Georgia,serif;
          font-size:30px;
          line-height:1;
          color:#172119;
        }

        .bwi-confirm-copy{
          margin:0;
          font-size:14px;
          line-height:1.55;
          color:var(--bwi-muted);
        }

        .bwi-confirm-meta{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }

        .bwi-confirm-chip{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:8px 12px;
          border-radius:999px;
          background:rgba(255,255,255,.78);
          border:1px solid rgba(26,42,33,.08);
          font-size:13px;
          font-weight:700;
          color:#203027;
        }

        .bwi-confirm-actions{
          margin-top:auto;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:8px;
          flex-wrap:wrap;
        }

        .bwi-empty-state{
          flex:1;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:12px;
          padding:24px;
          border-radius:24px;
          background:rgba(255,255,255,.72);
          border:1px dashed rgba(26,42,33,.14);
          text-align:center;
        }

        .bwi-empty-icon{
          width:72px;
          height:72px;
          border-radius:24px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--bwi-green);
          background:rgba(217,242,225,.78);
        }

        .bwi-empty-title{
          margin:0;
          font-size:24px;
          font-weight:800;
          color:#1b2720;
        }

        /* BOP-aligned visual overrides */
        :host{
          --bwi-primary:#4c7b63;
          --bwi-primary-light:#e8f0eb;
          --bwi-headline:#0f2a39;
          --bwi-secondary:#5f6e78;
          --bwi-success:#22c55e;
          --bwi-error:#dd524b;
          --bwi-sidebar:#fafafa;
          --bwi-border:#e8e8e8;
          --bwi-radius-sm:0.25rem;
          --bwi-radius-md:0.5rem;
          --bwi-radius-lg:0.75rem;
          --bwi-radius-xl:1rem;
          --bwi-radius-full:9999px;
          --bwi-shadow-sm:0 1px 2px 0 rgb(0 0 0 / 0.05);
          --bwi-shadow-md:0 4px 6px -1px rgb(0 0 0 / 0.1);
          --bwi-shadow-2xl:0 25px 50px -12px rgb(0 0 0 / 0.25);
          --bwi-dur-fast:150ms;
          --bwi-dur-norm:200ms;
          --bwi-dur-slow:300ms;
          --bwi-ease:cubic-bezier(0.4,0,0.2,1);
          --bwi-ease-spring:cubic-bezier(0.16,1,0.3,1);
          --bwi-font:var(--font-sans,"Inter",system-ui,sans-serif);
          --bwi-mono:var(--font-mono,ui-monospace,"SF Mono","Menlo",monospace);
          --bwi-xs:0.75rem;
          --bwi-sm:0.875rem;
          --bwi-base:1rem;
          --bwi-lg:1.125rem;
          --bwi-2xl:1.5rem;
          font-family:var(--bwi-font);
        }

        .bwi-btn{
          border-radius:var(--bwi-radius-xl);
          font-size:var(--bwi-sm);
          font-weight:600;
          font-family:var(--bwi-font);
          transition:all var(--bwi-dur-norm) var(--bwi-ease);
        }

        .bwi-btn-primary{
          background:var(--bwi-primary);
          box-shadow:0 4px 12px rgba(76,123,99,.3);
        }

        .bwi-btn-primary:not(:disabled):hover{
          background:rgba(76,123,99,.9);
          box-shadow:0 6px 16px rgba(76,123,99,.4);
        }

        .bwi-btn-secondary{
          color:var(--bwi-secondary);
          background:transparent;
          box-shadow:none;
        }

        .bwi-btn-secondary:not(:disabled):hover{
          color:var(--bwi-headline);
          background:var(--bwi-sidebar);
        }

        .bwi-btn-error{
          background:var(--bwi-error);
          box-shadow:0 4px 12px rgba(221,82,75,.3);
        }

        .bwi-btn-error:not(:disabled):hover{
          background:#c9403a;
          box-shadow:0 6px 16px rgba(221,82,75,.4);
        }

        .bwi-icon-btn{
          border-radius:var(--bwi-radius-md);
          min-width:2rem;
          width:2rem;
          height:2rem;
          padding:.375rem;
        }

        .bwi-trigger{
          height:40px;
          min-height:40px;
          padding:12px 24px;
          border-radius:var(--bwi-radius-xl);
          box-shadow:0 4px 12px rgba(76,123,99,.3);
        }

        .bwi-overlay{
          padding:1rem;
        }

        .bwi-backdrop{
          background:rgba(0,0,0,.4);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        }

        .bwi-modal{
          background:#fff;
          border:1px solid var(--bwi-border);
          border-radius:var(--bwi-radius-xl);
          box-shadow:var(--bwi-shadow-2xl);
          transform:translateY(20px) scale(.95);
          transition:
            width .4s var(--bwi-ease-spring),
            height .4s var(--bwi-ease-spring),
            transform .28s var(--bwi-ease-spring),
            filter .2s var(--bwi-ease);
        }

        .bwi-overlay[data-state="open"] .bwi-modal{
          transform:translateY(0) scale(1);
        }

        .bwi-modal::before,
        .bwi-modal::after{
          display:none;
        }

        .bwi-header{
          min-height:auto;
          padding:1rem 1.5rem;
          border-bottom:1px solid rgba(250,250,250,.5);
          background:rgba(255,255,255,.5);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
        }

        .bwi-header-left{
          gap:.75rem;
          height:2rem;
        }

        .bwi-stage{
          background:rgba(248,250,252,.3);
        }

        .bwi-screen{
          gap:1rem;
          padding:0 1.5rem 1.5rem;
        }

        .bwi-screen-head{
          gap:.5rem;
        }

        .bwi-kicker{
          font-size:var(--bwi-xs);
          font-weight:600;
          letter-spacing:.05em;
          color:var(--bwi-secondary);
        }

        .bwi-screen-title,
        .bwi-review-title,
        .bwi-loading-title,
        .bwi-success-title{
          font-family:var(--bwi-font);
          font-size:var(--bwi-2xl);
          font-weight:700;
          line-height:1.2;
          letter-spacing:0;
          color:var(--bwi-headline);
        }

        .bwi-screen-title--invoices{
          font-size:2.125rem;
          line-height:1.05;
        }

        .bwi-screen-copy,
        .bwi-empty-copy,
        .bwi-detail-note,
        .bwi-review-copy,
        .bwi-loading-copy,
        .bwi-success-copy,
        .bwi-panel-copy{
          font-size:var(--bwi-sm);
          color:var(--bwi-secondary);
        }

        .bwi-search-shell{
          margin-top:0;
        }

        .bwi-search-shell svg{
          left:.875rem;
          color:var(--bwi-secondary);
        }

        .bwi-search-input{
          padding:.75rem 1rem .75rem 2.5rem;
          border:1px solid var(--bwi-border);
          border-radius:var(--bwi-radius-xl);
          font-size:var(--bwi-sm);
          font-family:var(--bwi-font);
          color:var(--bwi-headline);
          background:#fff;
          box-shadow:var(--bwi-shadow-sm);
          transition:all var(--bwi-dur-norm) var(--bwi-ease);
        }

        .bwi-search-input::placeholder{
          color:rgba(95,110,120,.6);
        }

        .bwi-search-input:focus{
          border-color:var(--bwi-primary);
          box-shadow:0 0 0 3px rgba(76,123,99,.2);
        }

        .bwi-invoice-meta{
          padding:0 .25rem;
          font-size:var(--bwi-xs);
          color:var(--bwi-secondary);
        }

        .bwi-meta-count{
          color:var(--bwi-headline);
        }

        .bwi-invoice-list{
          gap:.75rem;
          padding:0 .25rem 1rem;
          scrollbar-width:none;
          -ms-overflow-style:none;
          mask-image:none;
        }

        .bwi-invoice-list::-webkit-scrollbar{
          display:none;
        }

        .bwi-invoice-card{
          padding:1rem;
          border-radius:var(--bwi-radius-xl);
          border:2px solid transparent;
          background:#fff;
          box-shadow:var(--bwi-shadow-sm);
          transition:all var(--bwi-dur-norm) var(--bwi-ease);
        }

        .bwi-invoice-card:hover{
          border-color:rgba(76,123,99,.2);
          box-shadow:var(--bwi-shadow-md);
          transform:none;
        }

        .bwi-invoice-card.is-selected{
          border-color:var(--bwi-primary);
          background:rgba(76,123,99,.05);
          box-shadow:var(--bwi-shadow-sm);
        }

        .bwi-select-mark{
          width:1.5rem;
          height:1.5rem;
          border:2px solid var(--bwi-border);
          background:#fff;
        }

        .bwi-invoice-card.is-selected .bwi-select-mark{
          background:var(--bwi-primary);
          border-color:var(--bwi-primary);
        }

        .bwi-card-main{
          gap:.5rem;
        }

        .bwi-card-label,
        .bwi-detail-overline,
        .bwi-stat-label,
        .bwi-review-stat-label,
        .bwi-strip-number,
        .bwi-progress-label{
          font-size:var(--bwi-xs);
          font-weight:600;
          letter-spacing:.05em;
          text-transform:uppercase;
          color:var(--bwi-secondary);
        }

        .bwi-card-name,
        .bwi-detail-title,
        .bwi-strip-name{
          font-size:var(--bwi-base);
          font-weight:600;
          color:var(--bwi-headline);
        }

        .bwi-card-total,
        .bwi-stat-value,
        .bwi-review-stat-value,
        .bwi-strip-amount{
          font-size:var(--bwi-lg);
          font-weight:600;
          color:var(--bwi-headline);
        }

        .bwi-card-meta,
        .bwi-detail-subline,
        .bwi-strip-meta,
        .bwi-line-subtitle,
        .bwi-progress-copy{
          font-size:var(--bwi-xs);
          color:var(--bwi-secondary);
        }

        .bwi-card-name{
          font-size:1.125rem;
          line-height:1.2;
        }

        .bwi-card-total-label{
          font-size:.6875rem;
          font-weight:600;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:var(--bwi-secondary);
        }

        .bwi-card-total{
          font-size:1.5rem;
          font-weight:700;
          line-height:1;
        }

        .bwi-card-meta,
        .bwi-card-meta-text{
          font-size:.8125rem;
        }

        .bwi-card-top-side{
          gap:.5rem;
        }

        .bwi-meta-chip{
          gap:.375rem;
        }

        .bwi-status-pill{
          padding:.25rem .625rem;
          border-radius:var(--bwi-radius-full);
          font-size:.6875rem;
          font-weight:600;
          letter-spacing:.05em;
        }

        .bwi-status-pill.is-draft{
          background:#f3f4f6;
          color:#6b7280;
        }

        .bwi-status-pill.is-paid{
          background:#dcfce7;
          color:#16a34a;
        }

        .bwi-status-pill.is-pending{
          background:#fffbeb;
          color:#d97706;
        }

        .bwi-status-pill.is-processing{
          background:#eff6ff;
          color:#2563eb;
        }

        .bwi-status-pill.is-overdue{
          background:#fef2f2;
          color:#dc2626;
        }

        .bwi-bulk-dock{
          background:rgba(255,255,255,.5);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
          box-shadow:none;
          color:var(--bwi-headline);
        }

        .bwi-bulk-title{
          color:var(--bwi-headline);
          font-size:var(--bwi-sm);
        }

        .bwi-bulk-note{
          color:var(--bwi-secondary);
          font-size:var(--bwi-xs);
        }

        .bwi-detail-shell,
        .bwi-review-shell{
          gap:1.25rem;
        }

        .bwi-detail-head{
          padding:0;
        }

        .bwi-detail-title{
          font-size:var(--bwi-2xl);
        }

        .bwi-detail-grid,
        .bwi-review-stats{
          gap:.75rem;
        }

        .bwi-stat-card,
        .bwi-review-stat,
        .bwi-line-item,
        .bwi-total-row,
        .bwi-strip-card,
        .bwi-progress-card,
        .bwi-success-badge{
          background:#fff;
          border:1px solid var(--bwi-border);
          border-radius:var(--bwi-radius-xl);
          box-shadow:var(--bwi-shadow-sm);
        }

        .bwi-stat-card,
        .bwi-review-stat,
        .bwi-progress-card{
          padding:.875rem;
        }

        .bwi-line-item,
        .bwi-total-row{
          padding:.875rem;
          border-radius:var(--bwi-radius-xl);
        }

        .bwi-total-row.is-grand{
          background:rgba(76,123,99,.05);
          border-color:rgba(76,123,99,.2);
        }

        .bwi-line-title,
        .bwi-total-title{
          font-size:var(--bwi-sm);
          font-weight:600;
          color:var(--bwi-headline);
        }

        .bwi-line-qty,
        .bwi-total-qty,
        .bwi-line-total,
        .bwi-total-value,
        .bwi-confirm-chip{
          font-size:var(--bwi-sm);
          font-weight:600;
          color:var(--bwi-headline);
        }

        .bwi-review-strip{
          gap:.75rem;
          padding:0 .25rem 1rem;
          scrollbar-width:none;
        }

        .bwi-review-strip::-webkit-scrollbar{
          display:none;
        }

        .bwi-strip-card{
          min-width:82%;
          padding:.875rem;
          border-radius:var(--bwi-radius-xl);
        }

        .bwi-review-actions{
          gap:.625rem;
        }

        .bwi-loading-shell,
        .bwi-success-shell{
          justify-content:center;
          gap:1.5rem;
          background:#fff;
        }

        .bwi-loading-shell{
          gap:1rem;
          align-items:stretch;
          text-align:center;
        }

        .bwi-success-shell{
          gap:1rem;
          align-items:center;
          justify-content:center;
          text-align:center;
          overflow:auto;
          padding:.25rem 0;
        }

        .bwi-loading-head,
        .bwi-success-head{
          gap:1rem;
        }

        .bwi-loading-head{
          flex-direction:column;
          align-items:center;
          text-align:center;
          gap:.75rem;
        }

        .bwi-success-head{
          flex-direction:column;
          align-items:center;
          text-align:center;
          gap:.75rem;
        }

        .bwi-loading-orb,
        .bwi-success-orb{
          width:4.5rem;
          height:4.5rem;
          border-radius:1.25rem;
          background:var(--bwi-primary);
          box-shadow:var(--bwi-shadow-md);
        }

        .bwi-loading-orb{
          width:3.5rem;
          height:3.5rem;
          border-radius:1rem;
        }

        .bwi-success-orb{
          width:3.75rem;
          height:3.75rem;
          border-radius:1rem;
        }

        .bwi-loading-title{
          font-size:1.25rem;
          margin:0 0 .375rem;
          line-height:1.1;
        }

        .bwi-loading-copy{
          font-size:var(--bwi-xs);
          line-height:1.45;
        }

        .bwi-success-title{
          font-size:1.25rem;
          margin:0 0 .375rem;
          line-height:1.1;
        }

        .bwi-success-copy{
          font-size:var(--bwi-xs);
          line-height:1.45;
        }

        .bwi-loading-shell .bwi-review-strip{
          width:100%;
          gap:.5rem;
          padding:0 0 .25rem;
          overflow-x:auto;
          overflow-y:hidden;
        }

        .bwi-loading-shell .bwi-strip-card{
          min-width:88%;
          padding:.75rem;
        }

        .bwi-loading-shell .bwi-strip-name{
          font-size:var(--bwi-sm);
        }

        .bwi-loading-shell .bwi-strip-amount{
          font-size:1rem;
        }

        .bwi-loading-shell .bwi-strip-meta{
          font-size:.6875rem;
        }

        .bwi-loading-shell .bwi-progress-card{
          gap:.625rem;
          padding:.75rem;
          width:100%;
        }

        .bwi-confirm .bwi-review-strip{
          width:100%;
          gap:.5rem;
          padding:0 0 .125rem;
          overflow-x:auto;
          overflow-y:hidden;
        }

        .bwi-confirm .bwi-strip-card{
          min-width:84%;
          padding:.625rem;
        }

        .bwi-confirm .bwi-strip-name{
          font-size:var(--bwi-sm);
        }

        .bwi-confirm .bwi-strip-amount{
          font-size:1rem;
        }

        .bwi-confirm .bwi-strip-meta{
          font-size:.6875rem;
        }

        .bwi-success-badges{
          width:100%;
          max-width:18rem;
          flex-direction:column;
          flex-wrap:nowrap;
          align-items:stretch;
          gap:.5rem;
          overflow:auto;
          padding-right:.125rem;
        }

        .bwi-success-badge{
          width:100%;
          justify-content:center;
          padding:.625rem .75rem;
          font-size:var(--bwi-xs);
        }

        .bwi-progress-track{
          height:.75rem;
          background:var(--bwi-sidebar);
        }

        .bwi-loading-shell .bwi-progress-track{
          height:.5rem;
        }

        .bwi-loading-shell .bwi-progress-copy{
          font-size:.6875rem;
          line-height:1.4;
        }

        .bwi-progress-fill{
          background:linear-gradient(90deg,var(--bwi-primary),rgba(76,123,99,.7));
        }

        .bwi-confirm{
          background:#fff;
          border:1px solid var(--bwi-border);
          border-radius:var(--bwi-radius-xl);
          box-shadow:0 20px 60px rgba(0,0,0,.25);
          padding:1rem;
          gap:.75rem;
        }

        .bwi-confirm-icon{
          width:3rem;
          height:3rem;
          border-radius:var(--bwi-radius-full);
        }

        .bwi-confirm-icon.is-pay{
          background:rgba(76,123,99,.12);
          color:var(--bwi-primary);
        }

        .bwi-confirm-icon.is-delete{
          background:#fef2f2;
          color:var(--bwi-error);
        }

        .bwi-confirm-title{
          font-family:var(--bwi-font);
          font-size:1rem;
          font-weight:700;
          line-height:1.25;
          color:var(--bwi-headline);
        }

        .bwi-confirm-copy{
          font-size:var(--bwi-xs);
          line-height:1.45;
          color:var(--bwi-secondary);
        }

        .bwi-confirm-meta{
          gap:.375rem;
        }

        .bwi-confirm-chip{
          padding:.5rem .625rem;
          font-size:var(--bwi-xs);
        }

        .bwi-confirm-actions{
          margin-top:.25rem;
          gap:.5rem;
        }

        @keyframes bwiTriggerSweep{
          0%{transform:translateX(0) skewX(-18deg)}
          22%{transform:translateX(260%) skewX(-18deg)}
          100%{transform:translateX(260%) skewX(-18deg)}
        }

        @keyframes bwiCardRise{
          from{opacity:0;transform:translateY(14px) scale(.985)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }

        @keyframes bwiSpin{
          from{transform:rotate(0)}
          to{transform:rotate(360deg)}
        }

        @keyframes bwiConfirmIn{
          from{opacity:0;transform:translateY(20px) scale(.94)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }

        @media (max-width: 900px){
          .bwi-screen{padding:0 20px 20px}
          .bwi-screen-title{font-size:38px}
          .bwi-screen-title--invoices{font-size:2rem}
          .bwi-review-title,
          .bwi-loading-title,
          .bwi-success-title{font-size:32px}
          .bwi-detail-title{font-size:30px}
          .bwi-invoice-card{grid-template-columns:24px minmax(0,1fr)}
          .bwi-card-actions{grid-column:1 / -1;justify-content:flex-end}
          .bwi-detail-grid,
          .bwi-review-stats{grid-template-columns:1fr}
          .bwi-detail-head{flex-direction:column}
        }

        @media (max-width: 640px){
          .bwi-header{padding:16px}
          .bwi-screen{padding:0 16px 16px}
          .bwi-screen-title{font-size:34px}
          .bwi-screen-title--invoices{font-size:1.875rem}
          .bwi-invoice-card{padding:16px;border-radius:20px}
          .bwi-card-top{flex-direction:column}
          .bwi-card-top-side{
            width:100%;
            flex-direction:row;
            align-items:flex-end;
            justify-content:space-between;
          }
          .bwi-card-total-block{align-items:flex-start}
          .bwi-card-total{text-align:left}
          .bwi-bulk-dock,
          .bwi-review-actions,
          .bwi-confirm-actions{
            flex-direction:column;
            align-items:stretch;
          }
          .bwi-bulk-actions,
          .bwi-review-actions .bwi-btn,
          .bwi-confirm-actions .bwi-btn{
            width:100%;
          }
          .bwi-line-item,
          .bwi-total-row{
            grid-template-columns:minmax(0,1fr);
          }
          .bwi-line-qty,
          .bwi-line-total,
          .bwi-total-qty,
          .bwi-total-value{text-align:left}
          .bwi-loading-head,
          .bwi-success-head{flex-direction:column;align-items:flex-start}
        }
      </style>
      <div class="bwi-root">
        <button class="bwi-btn bwi-btn-primary bwi-trigger" type="button">
          Pay Invoices
        </button>
        <div class="bwi-portal"></div>
      </div>
    `;

    this._triggerEl = this.shadowRoot.querySelector(".bwi-trigger");
    this._portalEl = this.shadowRoot.querySelector(".bwi-portal");

    this._triggerEl.addEventListener("click", () => {
      this.open = true;
    });
  }

  _scheduleTimeout(fn, delay) {
    const id = setTimeout(() => {
      this._timeoutIds.delete(id);
      fn();
    }, delay);
    this._timeoutIds.add(id);
    return id;
  }

  _scheduleAnimationFrame(fn) {
    const id = requestAnimationFrame((ts) => {
      this._rafIds.delete(id);
      fn(ts);
    });
    this._rafIds.add(id);
    return id;
  }

  _clearScheduledWork() {
    for (const id of this._timeoutIds) clearTimeout(id);
    this._timeoutIds.clear();
    for (const id of this._rafIds) cancelAnimationFrame(id);
    this._rafIds.clear();
    this._pendingProgress = null;
    this._progressToken++;
  }

  _setupWindowListeners() {
    window.addEventListener("keydown", this._handleWindowKeydown);
  }

  _teardownWindowListeners() {
    window.removeEventListener("keydown", this._handleWindowKeydown);
  }

  _handleWindowKeydown(event) {
    if (event.key !== "Escape" || !this._open) return;

    if (this._confirmState && !this._isBusyScreen()) {
      this._closeConfirm();
      return;
    }

    if (!this._isBusyScreen()) {
      this.open = false;
    }
  }

  _openModal() {
    this._clearScheduledWork();
    this._teardownWindowListeners();
    this._setupWindowListeners();
    this._resetViewState();
    this._mountModal();
    this._setScreen("invoices", {}, { animate: false, pushHistory: false, resetHistory: true });
    this._scheduleAnimationFrame(() => {
      if (this._overlayEl) {
        this._overlayEl.dataset.state = "open";
      }
    });
  }

  _closeModal(force = false) {
    if (!force && this._isBusyScreen()) return;

    this._clearScheduledWork();
    this._confirmState = null;
    this._renderConfirm();
    this._teardownWindowListeners();

    if (!this._overlayEl) return;

    const overlay = this._overlayEl;
    overlay.dataset.state = "closing";
    this._scheduleTimeout(() => {
      if (overlay.isConnected) overlay.remove();
    }, 220);

    this._overlayEl = null;
    this._modalEl = null;
    this._stageEl = null;
    this._confirmLayerEl = null;
    this._currentScreenEl = null;
    this._backButtonEl = null;
    this._closeButtonEl = null;
    this._clearScreenRefs();
  }

  _resetViewState() {
    this._screen = "invoices";
    this._screenData = {};
    this._history = [];
    this._direction = 1;
    this._searchQuery = "";
    this._selectedIds.clear();
    this._confirmState = null;
  }

  _mountModal() {
    if (this._overlayEl?.isConnected) {
      this._overlayEl.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "bwi-overlay";
    overlay.dataset.state = "closed";
    overlay.innerHTML = `
      <div class="bwi-backdrop"></div>
      <div class="bwi-dialog-shell">
        <section class="bwi-modal" role="dialog" aria-modal="true" aria-label="Invoices">
          <header class="bwi-header">
            <div class="bwi-header-left">
              <button class="bwi-btn bwi-btn-secondary bwi-icon-btn bwi-back-btn" type="button" aria-label="Go back">
                ${BWI_ICONS.arrowLeft}
              </button>
            </div>
            <button class="bwi-btn bwi-btn-secondary bwi-icon-btn bwi-close-btn" type="button" aria-label="Close invoices">
              ${BWI_ICONS.x}
            </button>
          </header>
          <div class="bwi-stage"></div>
          <div class="bwi-confirm-layer"></div>
        </section>
      </div>
    `;

    this._portalEl.appendChild(overlay);

    this._overlayEl = overlay;
    this._modalEl = overlay.querySelector(".bwi-modal");
    this._stageEl = overlay.querySelector(".bwi-stage");
    this._confirmLayerEl = overlay.querySelector(".bwi-confirm-layer");
    this._backButtonEl = overlay.querySelector(".bwi-back-btn");
    this._closeButtonEl = overlay.querySelector(".bwi-close-btn");

    overlay.querySelector(".bwi-backdrop").addEventListener("click", () => {
      if (this._confirmState && !this._isBusyScreen()) {
        this._closeConfirm();
        return;
      }

      if (!this._isBusyScreen()) {
        this.open = false;
      }
    });

    this._backButtonEl.addEventListener("click", () => this._goBack());
    this._closeButtonEl.addEventListener("click", () => {
      if (!this._isBusyScreen()) this.open = false;
    });
  }

  _clearScreenRefs() {
    this._invoiceListEl = null;
    this._invoiceMetaEl = null;
    this._bulkDockEl = null;
    this._searchInputEl = null;
    this._progressFillEl = null;
    this._invoiceCardMap = new Map();
    this._bulkDockTransitionToken++;
  }

  _setScreen(screen, data = {}, options = {}) {
    if (!this._stageEl || !this._modalEl) return;

    const {
      animate = true,
      direction = 1,
      pushHistory = true,
      resetHistory = false,
    } = options;

    const previousScreen = this._screen;
    const previousData = this._screenData;

    if (resetHistory) {
      this._history = [];
    } else if (
      pushHistory &&
      previousScreen &&
      (previousScreen !== screen ||
        JSON.stringify(previousData) !== JSON.stringify(data))
    ) {
      this._history.push({
        screen: previousScreen,
        data: previousData,
      });
    }

    this._screen = screen;
    this._screenData = { ...data };
    this._direction = direction;
    this._applyModalSize(screen);
    this._renderHeader();

    const nextScreenEl = this._buildScreen(screen);
    const previousEl = this._currentScreenEl;
    const transitionId = ++this._transitionToken;

    if (!previousEl || !animate) {
      this._stageEl.innerHTML = "";
      nextScreenEl.classList.add("is-active");
      this._stageEl.appendChild(nextScreenEl);
      this._currentScreenEl = nextScreenEl;
      this._afterScreenRendered(screen);
      return;
    }

    nextScreenEl.dataset.enter = direction > 0 ? "forward" : "backward";
    this._stageEl.appendChild(nextScreenEl);
    this._currentScreenEl = nextScreenEl;

    this._scheduleAnimationFrame(() => {
      if (transitionId !== this._transitionToken) return;
      previousEl.dataset.leave = direction > 0 ? "forward" : "backward";
      previousEl.classList.add("is-leaving");
      nextScreenEl.classList.add("is-active");
    });

    this._scheduleTimeout(() => {
      if (transitionId !== this._transitionToken) return;
      if (previousEl.isConnected) previousEl.remove();
      this._afterScreenRendered(screen);
    }, 320);
  }

  _afterScreenRendered(screen) {
    if (screen === "invoices" && this._searchInputEl) {
      this._scheduleAnimationFrame(() => {
        if (this._searchInputEl) this._searchInputEl.focus({ preventScroll: true });
      });
    }

    if (
      (screen === "payment-loading" || screen === "delete-loading") &&
      this._pendingProgress
    ) {
      const pending = this._pendingProgress;
      this._pendingProgress = null;
      this._startProgressFlow(pending.type, pending.invoiceIds);
    }
  }

  _applyModalSize(screen) {
    const size = BWI_MODAL_SIZES[screen] || BWI_MODAL_SIZES.invoices;
    this._modalEl.style.setProperty("--bwi-modal-width", `${size.width}px`);
    this._modalEl.style.setProperty("--bwi-modal-height", `${size.height}px`);
  }

  _renderHeader() {
    if (!this._backButtonEl || !this._closeButtonEl) return;

    const canGoBack = this._history.length > 0 && !this._isBusyScreen();
    this._backButtonEl.style.visibility = canGoBack ? "visible" : "hidden";
    this._backButtonEl.disabled = !canGoBack;
    this._closeButtonEl.disabled = this._isBusyScreen();
  }

  _buildScreen(screen) {
    this._clearScreenRefs();

    switch (screen) {
      case "invoice":
        return this._buildInvoiceDetailScreen();
      case "bulk-pay":
        return this._buildActionReviewScreen("pay");
      case "bulk-delete":
        return this._buildActionReviewScreen("delete");
      case "payment-loading":
        return this._buildLoadingScreen("pay");
      case "delete-loading":
        return this._buildLoadingScreen("delete");
      case "payment-success":
        return this._buildSuccessScreen("pay");
      case "delete-success":
        return this._buildSuccessScreen("delete");
      default:
        return this._buildInvoicesScreen();
    }
  }

  _buildInvoicesScreen() {
    const screen = document.createElement("section");
    screen.className = "bwi-screen";

    screen.innerHTML = `
      <div class="bwi-screen-head">
        <h1 class="bwi-screen-title bwi-screen-title--invoices">Invoices</h1>
        <p class="bwi-screen-copy">Search, inspect, and batch-process invoice records with a fixed animated modal frame.</p>
      </div>
      <label class="bwi-search-shell">
        ${BWI_ICONS.search}
        <input class="bwi-search-input" type="text" placeholder="Invoice #, ID, etc.">
      </label>
      <div class="bwi-invoice-meta"></div>
      <div class="bwi-invoice-list"></div>
      <div class="bwi-bulk-dock"></div>
    `;

    this._searchInputEl = screen.querySelector(".bwi-search-input");
    this._invoiceMetaEl = screen.querySelector(".bwi-invoice-meta");
    this._invoiceListEl = screen.querySelector(".bwi-invoice-list");
    this._bulkDockEl = screen.querySelector(".bwi-bulk-dock");
    this._searchInputEl.value = this._searchQuery;

    this._searchInputEl.addEventListener("input", (event) => {
      this._searchQuery = event.target.value;
      this._renderInvoiceList();
      this._renderBulkDock();
    });

    this._renderInvoiceList();
    this._renderBulkDock();
    return screen;
  }

  _renderInvoiceList() {
    if (!this._invoiceListEl || !this._invoiceMetaEl) return;

    const invoices = this._getFilteredInvoices();
    const pendingCount = this._invoices.filter((invoice) => invoice.status === "pending").length;
    const draftCount = this._invoices.filter((invoice) => invoice.status === "draft").length;

    this._invoiceMetaEl.innerHTML = `
      <span class="bwi-meta-count">${invoices.length} visible invoice${invoices.length !== 1 ? "s" : ""}</span>
      <span>${pendingCount} pending · ${draftCount} draft</span>
    `;

    this._invoiceListEl.innerHTML = "";
    this._invoiceCardMap = new Map();

    if (!invoices.length) {
      this._invoiceListEl.innerHTML = `
        <div class="bwi-empty-state">
          <div class="bwi-empty-icon">${BWI_ICONS.invoice}</div>
          <h3 class="bwi-empty-title">No matching invoices</h3>
          <p class="bwi-empty-copy">Try a broader query or clear the search to restore the full invoice queue.</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    invoices.forEach((invoice, index) => {
      const card = document.createElement("article");
      const isSelected = this._selectedIds.has(invoice.id);

      card.className = `bwi-invoice-card${isSelected ? " is-selected" : ""}`;
      card.style.animationDelay = `${index * 48}ms`;
      card.tabIndex = 0;
      card.setAttribute("data-id", invoice.id);
      card.setAttribute("aria-pressed", String(isSelected));

      card.innerHTML = `
        <div class="bwi-select-indicator">
          <span class="bwi-select-mark">${BWI_ICONS.check}</span>
        </div>
        <div class="bwi-card-main">
          <div class="bwi-card-top">
            <div class="bwi-card-top-main">
              <p class="bwi-card-label">${invoice.invoiceNumber}</p>
              <h3 class="bwi-card-name">${invoice.operatorName}</h3>
              <div class="bwi-card-meta">
                <span class="bwi-meta-chip">${BWI_ICONS.invoice}<span>${invoice.id}</span></span>
                <span class="bwi-meta-chip">${BWI_ICONS.calendar}<span>${formatDate(invoice.date)}</span></span>
                <span class="bwi-card-meta-text">${invoice.items.length} line item${invoice.items.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div class="bwi-card-top-side">
              <div class="bwi-card-total-block">
                <p class="bwi-card-total-label">Outstanding</p>
                <p class="bwi-card-total">${formatCurrency(invoice.amount)}</p>
              </div>
              <span class="bwi-status-pill is-${invoice.status}">${BWI_STATUS_META[invoice.status].label}</span>
            </div>
          </div>
        </div>
        <div class="bwi-card-actions">
          <button class="bwi-btn bwi-btn-secondary bwi-icon-btn" type="button" data-action="view" aria-label="View invoice">
            ${BWI_ICONS.eye}
          </button>
        </div>
      `;

      card.addEventListener("click", () => this._toggleSelection(invoice.id));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this._toggleSelection(invoice.id);
      });

      card.querySelector('[data-action="view"]').addEventListener("click", (event) => {
        event.stopPropagation();
        this._openInvoice(invoice.id);
      });

      this._invoiceCardMap.set(invoice.id, card);
      fragment.appendChild(card);
    });

    this._invoiceListEl.appendChild(fragment);
  }

  _renderBulkDock() {
    if (!this._bulkDockEl) return;

    const selectedInvoices = this._getSelectedInvoices();
    const count = selectedInvoices.length;
    const canDelete = count > 0 && selectedInvoices.every((invoice) => invoice.status === "draft");
    const canPay = count > 0 && selectedInvoices.every((invoice) => invoice.status === "pending");

    if (!count) {
      if (
        !this._bulkDockEl.innerHTML.trim() &&
        !this._bulkDockEl.classList.contains("is-visible")
      ) {
        return;
      }

      const transitionToken = ++this._bulkDockTransitionToken;
      this._bulkDockEl.className = "bwi-bulk-dock";
      this._bulkDockEl.setAttribute("aria-hidden", "true");
      this._scheduleTimeout(() => {
        if (transitionToken !== this._bulkDockTransitionToken) return;
        if (this._selectedIds.size > 0 || !this._bulkDockEl) return;
        this._bulkDockEl.innerHTML = "";
      }, 180);
      return;
    }

    ++this._bulkDockTransitionToken;
    let note = "Selection active.";
    if (canDelete) {
      note = "Every selected invoice is draft and can be deleted.";
    } else if (canPay) {
      note = "Every selected invoice is pending and ready for payment.";
    } else {
      note = "Mixed statuses selected. Use all pending to pay or all draft to delete.";
    }

    this._bulkDockEl.className = "bwi-bulk-dock is-visible";
    this._bulkDockEl.setAttribute("aria-hidden", "false");
    this._bulkDockEl.innerHTML = `
      <div class="bwi-bulk-copy">
        <p class="bwi-bulk-title">${count} invoice${count !== 1 ? "s" : ""} selected</p>
        <p class="bwi-bulk-note">${note}</p>
      </div>
      <div class="bwi-bulk-actions">
        <button class="bwi-btn bwi-btn-secondary" type="button" data-action="clear">Clear</button>
        ${canDelete ? '<button class="bwi-btn bwi-btn-error" type="button" data-action="delete">Delete</button>' : ""}
        ${canPay ? '<button class="bwi-btn bwi-btn-primary" type="button" data-action="pay">Pay</button>' : ""}
      </div>
    `;

    this._bulkDockEl.querySelector('[data-action="clear"]').addEventListener("click", () => {
      this._selectedIds.clear();
      this._syncInvoiceSelectionState();
      this._renderBulkDock();
    });

    const deleteButton = this._bulkDockEl.querySelector('[data-action="delete"]');
    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        this._startActionReview("delete", selectedInvoices.map((invoice) => invoice.id));
      });
    }

    const payButton = this._bulkDockEl.querySelector('[data-action="pay"]');
    if (payButton) {
      payButton.addEventListener("click", () => {
        this._startActionReview("pay", selectedInvoices.map((invoice) => invoice.id));
      });
    }
  }

  _buildInvoiceDetailScreen() {
    const invoice = this._getInvoiceById(this._screenData.invoiceId);
    if (!invoice) {
      return this._buildInvoicesScreen();
    }

    const screen = document.createElement("section");
    screen.className = "bwi-screen";

    const actionMarkup =
      invoice.status === "pending"
        ? '<button class="bwi-btn bwi-btn-primary" type="button" data-action="pay">Pay Now</button>'
        : invoice.status === "draft"
          ? '<button class="bwi-btn bwi-btn-error" type="button" data-action="delete">Delete</button>'
          : `<p class="bwi-detail-note">This invoice is currently <strong>${BWI_STATUS_META[invoice.status].label.toLowerCase()}</strong>, so no direct action is shown on this screen.</p>`;

    screen.innerHTML = `
      <div class="bwi-detail-shell">
        <div class="bwi-detail-head">
          <div>
            <p class="bwi-detail-overline">${invoice.invoiceNumber}</p>
            <h1 class="bwi-detail-title">${invoice.operatorName}</h1>
            <div class="bwi-detail-subline">
              <span class="bwi-meta-chip">${BWI_ICONS.invoice}<span>${invoice.id}</span></span>
              <span class="bwi-meta-chip">${BWI_ICONS.calendar}<span>${formatDate(invoice.date)}</span></span>
            </div>
          </div>
          <span class="bwi-status-pill is-${invoice.status}">${BWI_STATUS_META[invoice.status].label}</span>
        </div>
        <div class="bwi-detail-grid">
          <div class="bwi-stat-card">
            <p class="bwi-stat-label">Subtotal</p>
            <p class="bwi-stat-value">${formatCurrency(invoice.subtotal)}</p>
          </div>
          <div class="bwi-stat-card">
            <p class="bwi-stat-label">Tax</p>
            <p class="bwi-stat-value">${formatCurrency(invoice.tax)}</p>
          </div>
          <div class="bwi-stat-card">
            <p class="bwi-stat-label">Outstanding Balance</p>
            <p class="bwi-stat-value">${formatCurrency(invoice.amount)}</p>
          </div>
        </div>
        <div class="bwi-detail-table">
          ${invoice.items
            .map(
              (item) => `
                <div class="bwi-line-item">
                  <div>
                    <p class="bwi-line-title">${item.label}</p>
                    <p class="bwi-line-subtitle">${formatCurrency(item.unitPrice)} each</p>
                  </div>
                  <div class="bwi-line-qty">Qty ${item.qty}</div>
                  <div class="bwi-line-total">${formatCurrency(item.total)}</div>
                </div>
              `
            )
            .join("")}
          <div class="bwi-total-row">
            <div>
              <p class="bwi-total-title">Tax</p>
            </div>
            <div class="bwi-total-qty"></div>
            <div class="bwi-total-value">${formatCurrency(invoice.tax)}</div>
          </div>
          <div class="bwi-total-row is-grand">
            <div>
              <p class="bwi-total-title">Outstanding Balance</p>
            </div>
            <div class="bwi-total-qty"></div>
            <div class="bwi-total-value">${formatCurrency(invoice.amount)}</div>
          </div>
        </div>
        <div class="bwi-detail-footer">
          ${actionMarkup}
        </div>
      </div>
    `;

    const payButton = screen.querySelector('[data-action="pay"]');
    if (payButton) {
      payButton.addEventListener("click", () => {
        this._startActionReview("pay", [invoice.id]);
      });
    }

    const deleteButton = screen.querySelector('[data-action="delete"]');
    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        this._startActionReview("delete", [invoice.id]);
      });
    }

    return screen;
  }

  _buildActionReviewScreen(type) {
    const invoices = this._getInvoicesByIds(this._screenData.invoiceIds);
    const count = invoices.length;
    const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const isPay = type === "pay";

    const screen = document.createElement("section");
    screen.className = "bwi-screen";

    screen.innerHTML = `
      <div class="bwi-review-shell">
        <div class="bwi-review-top">
          <p class="bwi-kicker">${isPay ? BWI_ICONS.wallet : BWI_ICONS.trash}<span>${isPay ? "Bulk pay invoice screen" : "Bulk delete invoice screen"}</span></p>
          <h1 class="bwi-review-title">${count > 1 ? (isPay ? "Bulk Pay Invoices" : "Bulk Delete Invoices") : (isPay ? "Pay Invoice" : "Delete Invoice")}</h1>
          <p class="bwi-review-copy">${isPay ? "Review the invoices queued for payment. Confirming will mark them as processing after the fixed three-second animation run." : "Review the draft invoices queued for deletion. Confirming will remove them after the fixed three-second animation run."}</p>
        </div>
        <div class="bwi-review-stats">
          <div class="bwi-review-stat">
            <p class="bwi-review-stat-label">Invoices</p>
            <p class="bwi-review-stat-value">${count}</p>
          </div>
          <div class="bwi-review-stat">
            <p class="bwi-review-stat-label">${isPay ? "Total Amount" : "Delete Scope"}</p>
            <p class="bwi-review-stat-value">${isPay ? formatCurrency(total) : `${count} draft${count !== 1 ? "s" : ""}`}</p>
          </div>
        </div>
        <div class="bwi-review-strip">
          ${this._getStripCardsMarkup(invoices)}
        </div>
        <div class="bwi-review-actions">
          <button class="bwi-btn bwi-btn-secondary" type="button" data-action="back">Back</button>
          <button class="bwi-btn ${isPay ? "bwi-btn-primary" : "bwi-btn-error"}" type="button" data-action="confirm">
            ${isPay ? "Open Confirmation" : "Open Confirmation"}
          </button>
        </div>
      </div>
    `;

    screen.querySelector('[data-action="back"]').addEventListener("click", () => this._goBack());
    screen.querySelector('[data-action="confirm"]').addEventListener("click", () => this._openConfirm(type));
    return screen;
  }

  _buildLoadingScreen(type) {
    const invoices = this._getInvoicesByIds(this._screenData.invoiceIds);
    const isPay = type === "pay";
    const screen = document.createElement("section");
    screen.className = "bwi-screen";

    screen.innerHTML = `
      <div class="bwi-loading-shell">
        <div class="bwi-loading-head">
          <div class="bwi-loading-orb">${BWI_ICONS.loader}</div>
          <div>
            <h1 class="bwi-loading-title">${isPay ? "Processing Payments" : "Removing Drafts"}</h1>
            <p class="bwi-loading-copy">${isPay ? "Queued invoices are moving into the payment pipeline." : "Selected draft invoices are being removed from the queue."}</p>
          </div>
        </div>
        <div class="bwi-review-strip">
          ${this._getStripCardsMarkup(invoices)}
        </div>
        <div class="bwi-progress-card">
          <div class="bwi-progress-meta">
            <p class="bwi-progress-label">${isPay ? "Payment Progress" : "Deletion Progress"}</p>
          </div>
          <div class="bwi-progress-track">
            <div class="bwi-progress-fill"></div>
          </div>
          <p class="bwi-progress-copy">Fixed runtime: 3 seconds. A short success state follows before returning to the invoice list.</p>
        </div>
      </div>
    `;

    this._progressFillEl = screen.querySelector(".bwi-progress-fill");
    return screen;
  }

  _buildSuccessScreen(type) {
    const invoices = this._getInvoicesByIds(this._screenData.invoiceIds);
    const isPay = type === "pay";
    const screen = document.createElement("section");
    screen.className = "bwi-screen";

    screen.innerHTML = `
      <div class="bwi-success-shell">
        <div class="bwi-success-head">
          <div class="bwi-success-orb">${BWI_ICONS.check}</div>
          <div>
            <h1 class="bwi-success-title">${isPay ? "Payment Queue Updated" : "Invoices Deleted"}</h1>
            <p class="bwi-success-copy">${isPay ? "Selected invoices are now marked as processing." : "Selected draft invoices have been removed from the invoice list."}</p>
          </div>
        </div>
        <div class="bwi-success-badges">
          ${invoices
            .map(
              (invoice) => `
                <span class="bwi-success-badge">${BWI_ICONS.invoice}<span>${invoice.invoiceNumber}</span></span>
              `
            )
            .join("")}
        </div>
      </div>
    `;

    return screen;
  }

  _getStripCardsMarkup(invoices) {
    return invoices
      .map(
        (invoice, index) => `
          <article class="bwi-strip-card" style="animation-delay:${index * 55}ms">
            <div class="bwi-strip-head">
              <div>
                <p class="bwi-strip-number">${invoice.invoiceNumber}</p>
                <h3 class="bwi-strip-name">${invoice.operatorName}</h3>
              </div>
              <p class="bwi-strip-amount">${formatCurrency(invoice.amount)}</p>
            </div>
            <div class="bwi-strip-meta">
              <span class="bwi-meta-chip">${BWI_ICONS.invoice}<span>${invoice.id}</span></span>
              <span class="bwi-meta-chip">${BWI_ICONS.calendar}<span>${formatDate(invoice.date)}</span></span>
              <span class="bwi-status-pill is-${invoice.status}">${BWI_STATUS_META[invoice.status].label}</span>
            </div>
          </article>
        `
      )
      .join("");
  }

  _toggleSelection(invoiceId) {
    if (this._selectedIds.has(invoiceId)) {
      this._selectedIds.delete(invoiceId);
    } else {
      this._selectedIds.add(invoiceId);
    }

    this._syncInvoiceSelectionState(invoiceId);
    this._renderBulkDock();
  }

  _syncInvoiceSelectionState(invoiceId = null) {
    if (!this._invoiceCardMap.size) return;

    if (invoiceId) {
      const card = this._invoiceCardMap.get(invoiceId);
      if (!card) return;
      const isSelected = this._selectedIds.has(invoiceId);
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
      return;
    }

    for (const [id, card] of this._invoiceCardMap.entries()) {
      const isSelected = this._selectedIds.has(id);
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
    }
  }

  _openInvoice(invoiceId) {
    this._setScreen("invoice", { invoiceId }, { direction: 1, pushHistory: true });
  }

  _startActionReview(type, invoiceIds) {
    const uniqueIds = [...new Set(invoiceIds)];
    if (!uniqueIds.length) return;

    this._openConfirm(type, { invoiceIds: uniqueIds });
  }

  _openConfirm(type, options = {}) {
    const invoiceIds = options.invoiceIds || this._getActionInvoiceIds();
    if (!invoiceIds.length || !this._confirmLayerEl) return;
    this._confirmState = {
      type,
      invoiceIds,
    };
    this._renderConfirm();
  }

  _closeConfirm() {
    this._confirmState = null;
    this._renderConfirm();
  }

  _renderConfirm() {
    if (!this._confirmLayerEl || !this._modalEl) return;

    this._confirmLayerEl.innerHTML = "";

    if (!this._confirmState) return;

    const { type, invoiceIds } = this._confirmState;
    const invoices = this._getInvoicesByIds(invoiceIds);
    const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const isPay = type === "pay";
    const isBulk = invoiceIds.length > 1;
    const size = BWI_CONFIRM_SIZES[type];
    const title = isPay
      ? isBulk
        ? "Confirm Bulk Pay Invoices"
        : "Confirm Pay Invoice"
      : isBulk
        ? "Confirm Bulk Delete Invoices"
        : "Confirm Delete Invoice";
    const copy = isPay
      ? isBulk
        ? "These pending invoices will move into processing after the fixed loading run."
        : "This pending invoice will move into processing after the fixed loading run."
      : isBulk
        ? "These draft invoices will be removed from the queue after the fixed loading run."
        : "This draft invoice will be removed from the queue after the fixed loading run.";
    const confirmLabel = isPay
      ? isBulk
        ? "Confirm Bulk Pay Invoices"
        : "Confirm Pay Invoice"
      : isBulk
        ? "Confirm Bulk Delete Invoices"
        : "Confirm Delete Invoice";

    const layer = document.createElement("div");
    layer.className = "bwi-confirm-wrap";
    layer.innerHTML = `
      <div class="bwi-confirm-backdrop"></div>
      <div class="bwi-confirm" style="--bwi-confirm-width:${size.width}px;--bwi-confirm-height:${size.height}px;">
        <div class="bwi-confirm-icon ${isPay ? "is-pay" : "is-delete"}">
          ${isPay ? BWI_ICONS.wallet : BWI_ICONS.trash}
        </div>
        <h3 class="bwi-confirm-title">${title}</h3>
        <p class="bwi-confirm-copy">${copy}</p>
        <div class="bwi-confirm-meta">
          <span class="bwi-confirm-chip">${BWI_ICONS.invoice}<span>${invoiceIds.length} invoice${invoiceIds.length !== 1 ? "s" : ""}</span></span>
          <span class="bwi-confirm-chip">${isPay ? BWI_ICONS.wallet : BWI_ICONS.trash}<span>${isPay ? formatCurrency(total) : "Draft only"}</span></span>
        </div>
        <div class="bwi-review-strip">
          ${this._getStripCardsMarkup(invoices)}
        </div>
        <div class="bwi-confirm-actions">
          <button class="bwi-btn bwi-btn-secondary" type="button" data-action="cancel">Cancel</button>
          <button class="bwi-btn ${isPay ? "bwi-btn-primary" : "bwi-btn-error"}" type="button" data-action="confirm">
            ${confirmLabel}
          </button>
        </div>
      </div>
    `;

    layer.querySelector(".bwi-confirm-backdrop").addEventListener("click", () => {
      if (!this._isBusyScreen()) this._closeConfirm();
    });

    layer.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      this._closeConfirm();
    });

    layer.querySelector('[data-action="confirm"]').addEventListener("click", () => {
      this._confirmAction(type, invoiceIds);
    });

    this._confirmLayerEl.appendChild(layer);
  }

  _confirmAction(type, invoiceIds) {
    this._confirmState = null;
    this._renderConfirm();
    this._pendingProgress = { type, invoiceIds };
    this._setScreen(type === "pay" ? "payment-loading" : "delete-loading", { invoiceIds }, { direction: 1, pushHistory: false });
  }

  _startProgressFlow(type, invoiceIds) {
    const token = ++this._progressToken;
    const startedAt = performance.now();
    const duration = 3000;

    const tick = (now) => {
      if (token !== this._progressToken) return;
      const elapsed = Math.min(duration, now - startedAt);
      const progress = this._getArbitraryProgress(elapsed, duration);
      this._syncProgress(progress);

      if (elapsed < duration) {
        this._scheduleAnimationFrame(tick);
        return;
      }

      this._applyActionResult(type, invoiceIds);
      this._setScreen(type === "pay" ? "payment-success" : "delete-success", { invoiceIds }, { direction: 1, pushHistory: false });
      this._scheduleTimeout(() => {
        this._setScreen("invoices", {}, { direction: -1, pushHistory: false, resetHistory: true });
      }, 1000);
    };

    this._scheduleAnimationFrame(tick);
  }

  _syncProgress(progress) {
    if (this._progressFillEl) {
      this._progressFillEl.style.transform = `scaleX(${progress})`;
    }
  }

  _getArbitraryProgress(elapsed, duration) {
    const progressStops = [
      { at: 0, value: 0 },
      { at: 0.08, value: 0.04 },
      { at: 0.18, value: 0.11 },
      { at: 0.31, value: 0.21 },
      { at: 0.44, value: 0.49 },
      { at: 0.58, value: 0.58 },
      { at: 0.7, value: 0.79 },
      { at: 0.82, value: 0.86 },
      { at: 0.91, value: 0.94 },
      { at: 0.97, value: 0.97 },
      { at: 1, value: 1 },
    ];
    const normalizedElapsed = duration ? elapsed / duration : 1;

    for (let index = 1; index < progressStops.length; index++) {
      const previousStop = progressStops[index - 1];
      const currentStop = progressStops[index];

      if (normalizedElapsed > currentStop.at) continue;

      const segmentSpan = currentStop.at - previousStop.at || 1;
      const segmentProgress = (normalizedElapsed - previousStop.at) / segmentSpan;
      const easedSegmentProgress = 1 - (1 - segmentProgress) ** 3;

      return previousStop.value + (currentStop.value - previousStop.value) * easedSegmentProgress;
    }

    return 1;
  }

  _applyActionResult(type, invoiceIds) {
    if (type === "pay") {
      this._invoices = this._invoices.map((invoice) =>
        invoiceIds.includes(invoice.id) ? { ...invoice, status: "processing" } : invoice
      );
    } else {
      this._invoices = this._invoices.filter((invoice) => !invoiceIds.includes(invoice.id));
    }

    invoiceIds.forEach((invoiceId) => this._selectedIds.delete(invoiceId));
  }

  _goBack() {
    if (this._isBusyScreen()) return;

    if (this._confirmState) {
      this._closeConfirm();
      return;
    }

    const previous = this._history.pop();
    if (!previous) {
      this._setScreen("invoices", {}, { direction: -1, pushHistory: false, resetHistory: true });
      return;
    }

    this._setScreen(previous.screen, previous.data, { direction: -1, pushHistory: false });
  }

  _isBusyScreen() {
    return [
      "payment-loading",
      "delete-loading",
      "payment-success",
      "delete-success",
    ].includes(this._screen);
  }

  _getInvoiceById(invoiceId) {
    return this._invoices.find((invoice) => invoice.id === invoiceId) || null;
  }

  _getInvoicesByIds(invoiceIds = []) {
    return invoiceIds
      .map((invoiceId) => this._getInvoiceById(invoiceId))
      .filter(Boolean);
  }

  _getSelectedInvoices() {
    return this._getInvoicesByIds([...this._selectedIds]);
  }

  _getFilteredInvoices() {
    const query = this._searchQuery.trim().toLowerCase();
    if (!query) return this._invoices;

    return this._invoices.filter((invoice) => {
      return [
        invoice.invoiceNumber,
        invoice.id,
        invoice.operatorName,
        invoice.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }

  _getActionInvoiceIds() {
    if (
      [
        "bulk-pay",
        "bulk-delete",
        "payment-loading",
        "delete-loading",
        "payment-success",
        "delete-success",
      ].includes(this._screen)
    ) {
      return this._screenData.invoiceIds || [];
    }

    return [];
  }
}

if (!customElements.get("bison-wio-invoices")) {
  customElements.define("bison-wio-invoices", BisonWioInvoices);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { BisonWioInvoices };
}

if (typeof window !== "undefined") {
  window.BisonWioInvoices = BisonWioInvoices;
}

export { BisonWioInvoices };
