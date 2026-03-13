const WELCOME_SEEN_PREFIX = 'bison_operator_welcome_seen_'
const LUCIDE_CDN_BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@latest/icons'

const BANKING_TABS = [
  { id: 'verification', label: 'Verification' },
  { id: 'bank-account', label: 'Bank Account' },
]

const SECTION_DEFS = [
  {
    key: 'business',
    title: 'Business Profile',
    description: 'Company details, address, EIN, and industry',
    icon: 'building2',
    required: true,
  },
  {
    key: 'officer',
    title: 'Control Officer',
    description: 'Identity verification for the primary account controller',
    icon: 'user',
    required: true,
  },
  {
    key: 'owners',
    title: 'Beneficial Owners',
    description: 'Anyone owning 25% or more of the business',
    icon: 'users',
    required: true,
  },
  {
    key: 'volume',
    title: 'Processing Volume',
    description: 'Estimated transaction volume for underwriting',
    icon: 'bar-chart-3',
    required: true,
  },
  {
    key: 'bank',
    title: 'Bank Account',
    description: 'Connect a bank account for receiving deposits',
    icon: 'landmark',
    required: true,
  },
  {
    key: 'docs',
    title: 'Documents',
    description: 'Additional documents if auto-verification needs help',
    icon: 'file-text',
    required: false,
  },
]

const STATUS_CONFIG = {
  complete: { label: 'Complete', tone: 'success' },
  'in-progress': { label: 'In Progress', tone: 'warning' },
  'not-started': { label: 'Not Started', tone: 'secondary' },
  'not-required': { label: 'Not Required Yet', tone: 'secondary' },
  submitted: { label: 'Submitted', tone: 'blue' },
  'pending-review': { label: 'Pending Review', tone: 'blue' },
  verified: { label: 'Verified', tone: 'success', icon: 'check-circle' },
  'action-required': { label: 'Action Required', tone: 'error', icon: 'alert-circle' },
  'document-requested': { label: 'Document Requested', tone: 'warning' },
}

const DEMO_STATUSES_LOOKUP = {
  business: 'action-required',
  officer: 'verified',
  owners: 'verified',
  volume: 'verified',
  bank: 'pending-review',
  docs: 'document-requested',
}

const DEMO_STATUS_MESSAGES = {
  business: {
    title: 'EIN could not be verified',
    body: 'EIN could not be verified. Please check that your legal business name and EIN match your IRS records exactly.',
    actionLabel: 'Edit & Resubmit',
  },
  bank: {
    title: 'Bank account verification in progress',
    body: 'Bank account verification in progress. Micro-deposits typically arrive in 1-2 business days.',
  },
  docs: {
    title: 'IRS EIN Letter requested',
    body: 'Upload a copy of your IRS EIN confirmation letter (CP 575 or 147C).',
    actionLabel: 'Upload Document',
  },
}

const VERIFIED_STATUSES = {
  business: 'verified',
  officer: 'verified',
  owners: 'verified',
  volume: 'verified',
  bank: 'verified',
  docs: 'not-required',
}

const PAYMENT_METHODS = [
  {
    id: 'cards',
    icon: 'credit-card',
    title: 'Credit & Debit Cards',
    description: 'Instant confirmation, 2-3 day settlement',
  },
  {
    id: 'ach',
    icon: 'building2',
    title: 'ACH Transfer',
    description: 'Low-cost bank transfers, 2-3 day settlement',
  },
  {
    id: 'wire',
    icon: 'arrow-right-left',
    title: 'Wire Transfer',
    description: 'Same-day for high-value payments',
  },
  {
    id: 'rtp',
    icon: 'zap',
    title: 'Real-Time Payments (RTP)',
    description: 'Instant settlement, 24/7/365',
  },
]

const WELCOME_VERIFICATION_STEPS = [
  {
    title: 'Complete verification',
    description: 'Business details, identity, and bank account — takes about 10 minutes',
  },
  {
    title: 'Get verified',
    description: "We'll verify your info automatically, usually within a minute",
  },
  {
    title: 'Start receiving payments',
    description: 'Once verified, your working interest owners can pay you through Bison',
  },
]

const ICON_CDN_MAP = {
  building2: 'building-2',
  user: 'user',
  users: 'users',
  'bar-chart-3': 'bar-chart-3',
  landmark: 'landmark',
  'file-text': 'file-text',
  'chevron-down': 'chevron-down',
  'check-circle': 'check-circle',
  check: 'check',
  'alert-circle': 'alert-circle',
  clock: 'clock-3',
  'credit-card': 'credit-card',
  'arrow-right-left': 'arrow-right-left',
  zap: 'zap',
  plus: 'plus',
  pencil: 'pencil',
  trash: 'trash-2',
  lock: 'lock',
  upload: 'upload',
  x: 'x',
  loader: 'loader-circle',
  eye: 'eye',
  'eye-off': 'eye-off',
}

const PAYMENT_METHOD_STATUSES = {
  'new-account': { cards: 'pending', ach: 'pending', wire: 'pending', rtp: 'pending' },
  'mid-verification': { cards: 'available', ach: 'available', wire: 'pending', rtp: 'not-eligible' },
  'all-verified': { cards: 'available', ach: 'available', wire: 'available', rtp: 'not-eligible' },
}

const METHOD_STATUS_CONFIG = {
  available: { label: 'Available', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  'not-eligible': { label: 'Not Eligible', tone: 'neutral' },
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const BUSINESS_TYPES = [
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'soleProprietorship', label: 'Sole Proprietorship' },
]

const INDUSTRIES = [
  { value: 'oil_gas_extraction', label: 'Oil & Gas Extraction' },
  { value: 'crude_petroleum', label: 'Crude Petroleum & Natural Gas' },
  { value: 'natural_gas_distribution', label: 'Natural Gas Distribution' },
  { value: 'other', label: 'Other' },
]

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
]

function defaultBusiness() {
  return {
    legalName: '',
    dba: '',
    businessType: '',
    ein: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
    industry: '',
  }
}

function defaultOfficer() {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    dob: '',
    ssn: '',
    jobTitle: '',
  }
}

function defaultOwners() {
  return {
    owners: [],
    noOwnersAbove25: false,
  }
}

function defaultVolume() {
  return {
    monthlyTransactionCount: '',
    monthlyDollarVolume: '',
    avgTransactionSize: '',
  }
}

function defaultBank() {
  return {
    routingNumber: '',
    accountNumber: '',
    accountType: '',
    connectedViaPlaid: false,
  }
}

function emptyOwner() {
  return {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    dob: '',
    ssn: '',
    jobTitle: '',
    ownershipPercent: 25,
  }
}

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `owner-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function formatEIN(value) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}-${digits.slice(2)}`
}

function formatZip(value) {
  return value.replace(/\D/g, '').slice(0, 5)
}

function formatDOB(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function formatSSN(value) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

function formatCurrencyInput(value) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10)
  return `$${num.toLocaleString('en-US')}`
}

function formatRoutingNumber(value) {
  return value.replace(/\D/g, '').slice(0, 9)
}

function formatCount(value) {
  return value.replace(/\D/g, '')
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidDOB(dob) {
  const digits = dob.replace(/\D/g, '')
  if (digits.length !== 8) return { valid: false, error: 'Enter a complete date (MM/DD/YYYY)' }

  const month = parseInt(digits.slice(0, 2), 10)
  const day = parseInt(digits.slice(2, 4), 10)
  const year = parseInt(digits.slice(4, 8), 10)

  if (month < 1 || month > 12) return { valid: false, error: 'Invalid month' }
  if (day < 1 || day > 31) return { valid: false, error: 'Invalid day' }
  if (year < 1900 || year > new Date().getFullYear()) return { valid: false, error: 'Invalid year' }

  const date = new Date(year, month - 1, day)
  if (date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, error: 'Invalid date' }
  }

  const today = new Date()
  const age = today.getFullYear() - year - (today < new Date(today.getFullYear(), month - 1, day) ? 1 : 0)
  if (age < 18) return { valid: false, error: 'Must be at least 18 years old' }

  return { valid: true }
}

function validateBusiness(form) {
  const errors = {}

  if (!form.legalName.trim()) errors.legalName = 'Legal business name is required'
  if (!form.businessType) errors.businessType = 'Business type is required'

  const einDigits = form.ein.replace(/\D/g, '')
  if (!einDigits) errors.ein = 'EIN is required'
  else if (einDigits.length !== 9) errors.ein = 'EIN must be 9 digits'

  if (!form.address.trim()) errors.address = 'Business address is required'
  if (!form.city.trim()) errors.city = 'City is required'
  if (!form.state) errors.state = 'State is required'

  const zipDigits = form.zip.replace(/\D/g, '')
  if (!zipDigits) errors.zip = 'ZIP code is required'
  else if (zipDigits.length !== 5) errors.zip = 'ZIP must be 5 digits'

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (!phoneDigits) errors.phone = 'Phone number is required'
  else if (phoneDigits.length !== 10) errors.phone = 'Phone must be 10 digits'

  if (!form.website.trim()) errors.website = 'Website or description is required'
  if (!form.industry) errors.industry = 'Industry is required'

  return errors
}

function validateOfficer(form) {
  const errors = {}

  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'

  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address'

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (!phoneDigits) errors.phone = 'Phone is required'
  else if (phoneDigits.length !== 10) errors.phone = 'Phone must be 10 digits'

  if (!form.address.trim()) errors.address = 'Residential address is required'
  if (!form.city.trim()) errors.city = 'City is required'
  if (!form.state) errors.state = 'State is required'

  const zipDigits = form.zip.replace(/\D/g, '')
  if (!zipDigits) errors.zip = 'ZIP code is required'
  else if (zipDigits.length !== 5) errors.zip = 'ZIP must be 5 digits'

  if (!form.dob.trim()) {
    errors.dob = 'Date of birth is required'
  } else {
    const dobResult = isValidDOB(form.dob)
    if (!dobResult.valid) errors.dob = dobResult.error
  }

  const ssnDigits = form.ssn.replace(/\D/g, '')
  if (!ssnDigits) errors.ssn = 'SSN is required'
  else if (ssnDigits.length !== 9) errors.ssn = 'SSN must be 9 digits'

  if (!form.jobTitle.trim()) errors.jobTitle = 'Job title is required'

  return errors
}

function validateOwner(form) {
  const errors = {}

  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'

  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address'

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (!phoneDigits) errors.phone = 'Phone is required'
  else if (phoneDigits.length !== 10) errors.phone = 'Phone must be 10 digits'

  if (!form.address.trim()) errors.address = 'Address is required'
  if (!form.city.trim()) errors.city = 'City is required'
  if (!form.state) errors.state = 'State is required'

  const zipDigits = form.zip.replace(/\D/g, '')
  if (!zipDigits) errors.zip = 'ZIP code is required'
  else if (zipDigits.length !== 5) errors.zip = 'ZIP must be 5 digits'

  if (!form.dob.trim()) {
    errors.dob = 'Date of birth is required'
  } else {
    const dobResult = isValidDOB(form.dob)
    if (!dobResult.valid) errors.dob = dobResult.error
  }

  const ssnDigits = form.ssn.replace(/\D/g, '')
  if (!ssnDigits) errors.ssn = 'SSN is required'
  else if (ssnDigits.length !== 9) errors.ssn = 'SSN must be 9 digits'

  if (!form.jobTitle.trim()) errors.jobTitle = 'Job title is required'

  if (form.ownershipPercent < 25 || form.ownershipPercent > 100) {
    errors.ownershipPercent = 'Must be between 25% and 100%'
  }

  return errors
}

function validateVolume(form) {
  const errors = {}

  const countDigits = form.monthlyTransactionCount.replace(/\D/g, '')
  if (!countDigits) errors.monthlyTransactionCount = 'Monthly transaction count is required'
  else if (parseInt(countDigits, 10) <= 0) errors.monthlyTransactionCount = 'Must be greater than 0'

  const volumeDigits = form.monthlyDollarVolume.replace(/\D/g, '')
  if (!volumeDigits) errors.monthlyDollarVolume = 'Monthly dollar volume is required'
  else if (parseInt(volumeDigits, 10) <= 0) errors.monthlyDollarVolume = 'Must be greater than 0'

  const sizeDigits = form.avgTransactionSize.replace(/\D/g, '')
  if (!sizeDigits) errors.avgTransactionSize = 'Average transaction size is required'
  else if (parseInt(sizeDigits, 10) <= 0) errors.avgTransactionSize = 'Must be greater than 0'

  return errors
}

function validateBank(form) {
  const errors = {}

  const routingDigits = form.routingNumber.replace(/\D/g, '')
  if (!routingDigits) errors.routingNumber = 'Routing number is required'
  else if (routingDigits.length !== 9) errors.routingNumber = 'Routing number must be 9 digits'

  if (!form.accountNumber.trim()) errors.accountNumber = 'Account number is required'
  if (!form.accountType) errors.accountType = 'Account type is required'

  return errors
}

export class BisonOperatorOnboarding extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this._isOpen = false
    this._timers = new Set()
    this._iconCache = new Map()
    this._iconFetchInFlight = new Set()
    this._lucidePreloadStarted = false
    this._pendingIconPreloads = 0
    this._welcomeAnimateIn = true
    this._modalAnimateIn = true
    this._isClosing = false
    this._modalTransitioning = false
    this._listenersAttached = false
    this._lastRenderedProgress = null
    this._progressAnimationFrame = null
    this._verificationStatusStage = 'progress'
    this._verificationLoadingTimer = null
    this._verificationCompletionTimer = null
    this._accordionHeights = {}
    this._accordionSyncFrame = null
    this._lastOpenSection = null
    this._setupModalHeight = null
    this._api = null
    this._ownsApiInstance = false
    this._embeddableKey = (this.getAttribute('x-embeddable-key') || '').trim() || null
    this._lookupRequestId = 0
    this._activeLookupRequestId = 0
    this._isOperatorLookupPending = false
    this._operatorLookupData = null
    this._operatorLookupError = null

    this.state = this.buildInitialState()

    this.onClick = this.onClick.bind(this)
    this.onInput = this.onInput.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onFocusOut = this.onFocusOut.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
    this.onDragLeave = this.onDragLeave.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
  }

  static get observedAttributes() {
    return [
      'x-embeddable-key',
      'api-base-url',
      'op-org-id',
      'on-lookup-success',
      'on-lookup-error',
    ]
  }

  static get _callbackAttrMap() {
    return {
      'on-lookup-success': 'onLookupSuccess',
      'on-lookup-error': 'onLookupError',
    }
  }

  _resolveCallbackAttr(attrName, fnName) {
    const propName = BisonOperatorOnboarding._callbackAttrMap[attrName]
    if (!propName) return
    if (!fnName) {
      this[propName] = null
      return
    }
    const fn = typeof window !== 'undefined' ? window[fnName] : undefined
    if (typeof fn === 'function') {
      this[propName] = fn
    }
  }

  _seedCallbackAttributes() {
    for (const attrName of Object.keys(BisonOperatorOnboarding._callbackAttrMap)) {
      const propName = BisonOperatorOnboarding._callbackAttrMap[attrName]
      if (typeof this[propName] === 'function') continue
      const val = this.getAttribute(attrName)
      if (val) this._resolveCallbackAttr(attrName, val.trim())
    }
  }

  _upgradeProperty(prop) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = this[prop]
      delete this[prop]
      this[prop] = value
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return

    if (name === 'x-embeddable-key') {
      this._embeddableKey = (newVal || '').trim() || null
      if (this._ownsApiInstance && this._api && this._embeddableKey) {
        this._api.embeddableKey = this._embeddableKey
      } else if (!this._ownsApiInstance && this._api) {
        const isSharedGlobal = typeof window !== 'undefined' && this._api === window.__bisonApi
        if (isSharedGlobal) this._api = null
      }
      this._evaluateOperatorAttributes()
      this.render()
      return
    }

    if (name === 'api-base-url') {
      if (this._ownsApiInstance) this._api = null
      this._evaluateOperatorAttributes()
      this.render()
      return
    }

    if (name === 'op-org-id') {
      this._evaluateOperatorAttributes()
      this.render()
      return
    }

    if (name in BisonOperatorOnboarding._callbackAttrMap) {
      this._resolveCallbackAttr(name, (newVal || '').trim() || null)
    }
  }

  connectedCallback() {
    this._upgradeProperty('fetchOperatorFromEnverus')
    this._upgradeProperty('onLookupSuccess')
    this._upgradeProperty('onLookupError')
    this._seedCallbackAttributes()

    if (!this._listenersAttached) {
      this.shadowRoot.addEventListener('click', this.onClick)
      this.shadowRoot.addEventListener('input', this.onInput)
      this.shadowRoot.addEventListener('change', this.onChange)
      this.shadowRoot.addEventListener('focusout', this.onFocusOut)
      this.shadowRoot.addEventListener('dragover', this.onDragOver)
      this.shadowRoot.addEventListener('dragleave', this.onDragLeave)
      this.shadowRoot.addEventListener('drop', this.onDrop)
      window.addEventListener('resize', this.onWindowResize)
      this._listenersAttached = true
    }

    this.preloadLucideIcons()
    this._evaluateOperatorAttributes()
    this.render()
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener('click', this.onClick)
    this.shadowRoot.removeEventListener('input', this.onInput)
    this.shadowRoot.removeEventListener('change', this.onChange)
    this.shadowRoot.removeEventListener('focusout', this.onFocusOut)
    this.shadowRoot.removeEventListener('dragover', this.onDragOver)
    this.shadowRoot.removeEventListener('dragleave', this.onDragLeave)
    this.shadowRoot.removeEventListener('drop', this.onDrop)
    window.removeEventListener('resize', this.onWindowResize)
    this._listenersAttached = false

    for (const timer of this._timers) {
      clearTimeout(timer)
    }
    this._timers.clear()

    if (this._progressAnimationFrame) {
      cancelAnimationFrame(this._progressAnimationFrame)
      this._progressAnimationFrame = null
    }

    this.cancelAccordionHeightSync()
    this.clearVerificationStatusTimers()
    this._activeLookupRequestId = ++this._lookupRequestId
    this._isOperatorLookupPending = false
  }

  async _getApi() {
    if (this._api) {
      if (this._ownsApiInstance && this._embeddableKey) {
        this._api.embeddableKey = this._embeddableKey
      }
      return this._api
    }

    let baseUrl = this.getAttribute('api-base-url') || ''
    let globalKey = this._embeddableKey

    if (typeof window !== 'undefined' && window.BISON_JIB_PAY_CONFIG) {
      baseUrl = baseUrl || window.BISON_JIB_PAY_CONFIG.apiBaseURL || ''
      if (!globalKey && window.BISON_JIB_PAY_CONFIG.embeddableKey) {
        globalKey = window.BISON_JIB_PAY_CONFIG.embeddableKey
        this._embeddableKey = globalKey
      }
    }

    if (typeof window !== 'undefined' && window.__bisonApi) {
      const sharedApi = window.__bisonApi
      const hasLookup =
        typeof sharedApi.fetchOperatorFromEnverus === 'function' ||
        typeof sharedApi.findOperatorFromEnverus === 'function'
      const sharedKey =
        typeof sharedApi.embeddableKey === 'string' ? sharedApi.embeddableKey.trim() : null
      const canReuseShared =
        hasLookup && (!this._embeddableKey || !sharedKey || sharedKey === this._embeddableKey)

      if (canReuseShared) {
        this._api = sharedApi
        this._ownsApiInstance = false
        return this._api
      }
    }

    if (typeof window === 'undefined' || typeof window.BisonJibPayAPI !== 'function') {
      this._ownsApiInstance = false
      return null
    }

    try {
      const instance = new window.BisonJibPayAPI(baseUrl, globalKey)
      this._api = instance
      this._ownsApiInstance = true
      if (!window.__bisonApi) window.__bisonApi = instance
      return this._api
    } catch (_err) {
      this._ownsApiInstance = false
      return null
    }
  }

  _resolveOperatorLookupHandler(api) {
    if (typeof this.fetchOperatorFromEnverus === 'function') {
      return (opOrgId, embeddableKey) =>
        this.fetchOperatorFromEnverus(embeddableKey, opOrgId)
    }
    if (api && typeof api.fetchOperatorFromEnverus === 'function') {
      return (opOrgId) => api.fetchOperatorFromEnverus(opOrgId, null)
    }
    if (api && typeof api.findOperatorFromEnverus === 'function') {
      return (opOrgId) => api.findOperatorFromEnverus(opOrgId, null)
    }
    return null
  }

  _evaluateOperatorAttributes() {
    const opOrgId = (this.getAttribute('op-org-id') || '').trim()
    const resolvedEmbeddableKey = this._getResolvedEmbeddableKey()
    this._embeddableKey = resolvedEmbeddableKey || null

    if (!resolvedEmbeddableKey || !opOrgId) {
      this._isOperatorLookupPending = false
      this._operatorLookupData = null
      this._operatorLookupError = !resolvedEmbeddableKey
        ? { message: 'Missing embeddable key for operator lookup.' }
        : { message: 'Missing op-org-id for operator lookup.' }
      this._activeLookupRequestId = ++this._lookupRequestId
      return
    }

    this._isOperatorLookupPending = true
    this._operatorLookupError = null
    const requestId = ++this._lookupRequestId
    this._activeLookupRequestId = requestId
    this._performOperatorLookup(opOrgId, resolvedEmbeddableKey, requestId)
  }

  _getResolvedEmbeddableKey() {
    if (this._embeddableKey) return String(this._embeddableKey).trim()
    if (typeof window !== 'undefined' && window.BISON_JIB_PAY_CONFIG?.embeddableKey) {
      return String(window.BISON_JIB_PAY_CONFIG.embeddableKey).trim()
    }
    return ''
  }

  _getTriggerDisabledReason() {
    const embeddableKey = this._getResolvedEmbeddableKey()
    if (!embeddableKey) return 'Missing embeddable key'
    const opOrgId = (this.getAttribute('op-org-id') || '').trim()
    if (!opOrgId) return 'Missing op-org-id'
    if (this._isOperatorLookupPending) return 'Initializing...'

    const lookupErrorMessage = this._getLookupErrorMessage(this._operatorLookupError)
    if (lookupErrorMessage) return lookupErrorMessage

    return ''
  }

  _getLookupErrorMessage(errorData) {
    if (!errorData) return ''
    if (typeof errorData === 'string') return errorData.trim()
    if (typeof errorData?.message === 'string' && errorData.message.trim()) {
      return errorData.message.trim()
    }
    if (Array.isArray(errorData?.errors) && typeof errorData.errors[0] === 'string') {
      return errorData.errors[0].trim()
    }
    return 'Operator lookup failed'
  }

  _applyLookupDataToBusiness(lookupData) {
    if (!lookupData || typeof lookupData !== 'object') return false
    const business = this.state?.data?.business
    if (!business || typeof business !== 'object') return false

    const textValue = (value) => {
      if (value == null) return ''
      return String(value).trim()
    }

    let changed = false
    const applyIfEmpty = (field, value, formatter = null) => {
      if (!Object.prototype.hasOwnProperty.call(business, field)) return
      const current = textValue(business[field])
      if (current) return
      const nextRaw = textValue(value)
      if (!nextRaw) return
      const next = formatter ? formatter(nextRaw) : nextRaw
      if (!textValue(next)) return
      business[field] = next
      changed = true
    }

    applyIfEmpty('legalName', lookupData.legalName || lookupData.operatorName || lookupData.name || lookupData.companyName)
    applyIfEmpty('dba', lookupData.dba || lookupData.doingBusinessAs)
    applyIfEmpty('ein', lookupData.ein || lookupData.taxId || lookupData.taxIdentifier, formatEIN)
    applyIfEmpty('address', lookupData.address1 || lookupData.address || lookupData.street || lookupData.mailingAddress1)
    applyIfEmpty('city', lookupData.city || lookupData.mailingCity)
    applyIfEmpty('state', lookupData.state || lookupData.mailingState)
    applyIfEmpty('zip', lookupData.zip || lookupData.postalCode || lookupData.mailingPostalCode, formatZip)
    applyIfEmpty('phone', lookupData.phone || lookupData.phoneNumber || lookupData.businessPhone, formatPhone)
    applyIfEmpty('website', lookupData.website || lookupData.webSite || lookupData.url)

    return changed
  }

  _dispatchLookupEvent(detail) {
    this.dispatchEvent(
      new CustomEvent('bop-operator-lookup', {
        bubbles: true,
        composed: true,
        detail,
      })
    )
  }

  async _performOperatorLookup(opOrgId, embeddableKey, requestId) {
    const api = await this._getApi()
    const lookupHandler = this._resolveOperatorLookupHandler(api)

    if (typeof lookupHandler !== 'function') {
      const err = { message: 'No fetchOperatorFromEnverus handler is available.' }
      if (requestId !== this._activeLookupRequestId || !this.isConnected) return
      this._isOperatorLookupPending = false
      this._operatorLookupData = null
      this._operatorLookupError = err
      this._dispatchLookupEvent({ status: 'error', error: err })
      if (typeof this.onLookupError === 'function') this.onLookupError(err)
      this.render()
      return
    }

    try {
      const result = await lookupHandler(opOrgId, embeddableKey)
      if (requestId !== this._activeLookupRequestId || !this.isConnected) return

      const data = result?.data || result || null
      this._operatorLookupData = data
      this._operatorLookupError = null
      const didHydrateBusiness = this._applyLookupDataToBusiness(data)
      if (didHydrateBusiness) {
        this.persist()
      }

      this._dispatchLookupEvent({ status: 'success', data: result })
      if (typeof this.onLookupSuccess === 'function') this.onLookupSuccess(data)
    } catch (err) {
      if (requestId !== this._activeLookupRequestId || !this.isConnected) return
      const errData = err?.data || err
      this._operatorLookupData = null
      this._operatorLookupError = errData
      this._dispatchLookupEvent({ status: 'error', error: errData })
      if (typeof this.onLookupError === 'function') this.onLookupError(errData)
    } finally {
      if (requestId !== this._activeLookupRequestId || !this.isConnected) return
      this._isOperatorLookupPending = false
      this.render()
    }
  }

  open() {
    if (this._isOpen && !this._isClosing) return
    this._isOpen = true
    this._isClosing = false
    this._welcomeAnimateIn = true
    this._modalAnimateIn = true
    this._accordionHeights = {}
    this._lastOpenSection = null
    this._setupModalHeight = null
    this.cancelAccordionHeightSync()
    this.state.openSection = null
    this.state.ui.welcome.isOpen = true
    this.state.ui.welcome.step = 1
    this.state.ui.welcome.direction = 1
    this.render()
    if (typeof this.onOpen === 'function') this.onOpen()
  }

  close() {
    if (!this._isOpen || this._isClosing) return
    this._isClosing = true
    this._modalTransitioning = false
    this.render()

    const timer = setTimeout(() => {
      this._timers.delete(timer)
      this._isOpen = false
      this._isClosing = false
      this._modalAnimateIn = true
      this.render()
      if (typeof this.onClose === 'function') this.onClose()
    }, 280)

    this._timers.add(timer)
  }

  get isOpen() {
    return this._isOpen
  }

  buildInitialState() {
    const state = {
      demoMode: 'new-account',
      activeTab: 'verification',
      openSection: null,
      data: {
        business: defaultBusiness(),
        officer: defaultOfficer(),
        owners: defaultOwners(),
        volume: defaultVolume(),
        bank: defaultBank(),
      },
      savedAt: {
        business: null,
        officer: null,
        volume: null,
        bank: null,
      },
      ui: {
        business: { errors: {}, touched: {}, submitAttempted: false, isSaving: false },
        officer: { errors: {}, touched: {}, submitAttempted: false, isSaving: false },
        volume: { errors: {}, touched: {}, submitAttempted: false, isSaving: false },
        bank: { errors: {}, touched: {}, submitAttempted: false, isSaving: false },
        ownerEditor: {
          mode: null,
          editingId: '',
          form: emptyOwner(),
          errors: {},
          touched: {},
          submitAttempted: false,
          isSaving: false,
        },
        docs: {
          fileName: '',
          isDragging: false,
        },
        passwordVisibility: {
          officerSsn: false,
          ownerSsn: false,
        },
        welcome: {
          isOpen: true,
          step: 1,
          direction: 1,
          selectedMethods: [],
        },
      },
    }

    try {
      const signupRaw = localStorage.getItem('jibpay_signup_data')
      if (signupRaw) {
        const signup = JSON.parse(signupRaw)
        const nameParts = String(signup.fullName || '').split(' ')
        state.data.officer.firstName = nameParts[0] || ''
        state.data.officer.lastName = nameParts.slice(1).join(' ') || ''
        state.data.officer.email = signup.email || ''
      }
    } catch (_err) {
      // ignore localStorage parse issues
    }

    const progress = this.getVerificationProgressFromState(state)
    state.activeTab = progress >= 100 ? 'bank-account' : 'verification'
    state.openSection = null

    const email = this.getUserEmailFromState(state)
    state.ui.welcome.isOpen = this.shouldShowWelcome(email)

    return state
  }

  testId(id) {
    const safe = escapeHTML(id)
    return `test-id="${safe}" data-testid="${safe}"`
  }

  getUserEmailFromState(state) {
    const email = String(state?.data?.officer?.email || '').trim().toLowerCase()
    return email || 'default'
  }

  getWelcomeStorageKey(email) {
    return `${WELCOME_SEEN_PREFIX}${email || 'default'}`
  }

  shouldShowWelcome(email) {
    try {
      return localStorage.getItem(this.getWelcomeStorageKey(email)) !== 'true'
    } catch (_err) {
      return true
    }
  }

  getSavedWelcomeMethods(email) {
    void email
    return []
  }

  persistWelcomeState() {
    const email = this.getUserEmailFromState(this.state)
    try {
      localStorage.setItem(this.getWelcomeStorageKey(email), this.state.ui.welcome.isOpen ? 'false' : 'true')
    } catch (_err) {
      // ignore localStorage write issues
    }
  }

  closeWelcomeModal() {
    this.state.ui.welcome.isOpen = false
    this.persistWelcomeState()
  }

  transitionWelcomeToSetup() {
    if (this._modalTransitioning) return

    const modal = this.shadowRoot.querySelector('.bo-modal')
    const welcomeView = this.shadowRoot.querySelector('[data-bo-view="welcome"]')
    const modalTitle = this.shadowRoot.querySelector('[data-testid="bo-modal-title"]')
    const targetRect = this.measureSetupModalRect()

    if (!(modal instanceof HTMLElement) || !(welcomeView instanceof HTMLElement) || !targetRect) {
      this.state.activeTab = 'verification'
      this.closeWelcomeModal()
      this.render()
      return
    }

    this._modalTransitioning = true
    this._setupModalHeight = targetRect.height
    welcomeView.setAttribute('data-exit', 'forward')
    if (modalTitle instanceof HTMLElement) {
      modalTitle.setAttribute('data-exit', 'forward')
    }

    const timer = setTimeout(() => {
      this._timers.delete(timer)
      if (!this.isOpen) {
        this._modalTransitioning = false
        return
      }

      this.resizeModalToTarget(modal, targetRect, () => {
        if (!this.isOpen) {
          this._modalTransitioning = false
          return
        }

        this.state.activeTab = 'verification'
        this.closeWelcomeModal()
        this.render()
        this.animateSetupViewEntrance()
        this.animateSetupTitleEntrance()
        this._modalTransitioning = false
      })
    }, 220)

    this._timers.add(timer)
  }

  resizeModalToTarget(modal, targetRect, onComplete) {
    if (!(modal instanceof HTMLElement)) {
      if (typeof onComplete === 'function') onComplete()
      return
    }

    const startRect = modal.getBoundingClientRect()
    modal.classList.add('bo-modal-transitioning')
    modal.style.width = `${Math.round(startRect.width)}px`
    modal.style.height = `${Math.round(startRect.height)}px`
    void modal.offsetHeight

    requestAnimationFrame(() => {
      modal.style.width = `${Math.round(targetRect.width)}px`
      modal.style.height = `${Math.round(targetRect.height)}px`
    })

    const finish = () => {
      modal.removeEventListener('transitionend', onResizeComplete)
      if (typeof onComplete === 'function') onComplete()
    }

    let finished = false
    const onResizeComplete = (event) => {
      if (event.target !== modal) return
      if (event.propertyName !== 'width' && event.propertyName !== 'height') return
      if (finished) return
      finished = true
      finish()
    }

    modal.addEventListener('transitionend', onResizeComplete)

    const fallbackTimer = setTimeout(() => {
      this._timers.delete(fallbackTimer)
      if (finished) return
      finished = true
      finish()
    }, 700)

    this._timers.add(fallbackTimer)
  }

  animateSetupViewEntrance() {
    const setupView = this.shadowRoot.querySelector('[data-bo-view="setup"]')
    if (!(setupView instanceof HTMLElement)) return

    setupView.removeAttribute('data-hold')
    setupView.setAttribute('data-enter', 'forward')

    const timer = setTimeout(() => {
      this._timers.delete(timer)
      if (setupView instanceof HTMLElement) {
        setupView.removeAttribute('data-enter')
      }
    }, 700)

    this._timers.add(timer)
  }

  animateSetupTitleEntrance() {
    const modalTitle = this.shadowRoot.querySelector('[data-testid="bo-modal-title"]')
    if (!(modalTitle instanceof HTMLElement)) return

    modalTitle.removeAttribute('data-exit')
    modalTitle.setAttribute('data-enter', 'forward')

    const timer = setTimeout(() => {
      this._timers.delete(timer)
      if (modalTitle instanceof HTMLElement) {
        modalTitle.removeAttribute('data-enter')
      }
    }, 300)

    this._timers.add(timer)
  }

  getSetupRenderContext() {
    const statuses = this.getSectionStatuses()
    const statusMessages = this.getStatusMessages()
    const progress = this.getVerificationProgress()
    const isComplete = progress >= 100

    return { statuses, statusMessages, progress, isComplete }
  }

  renderSetupModalContent(statuses, statusMessages, progress, isComplete) {
    const desktopTabs = BANKING_TABS.map(
      (tab) => `
        <button
          ${this.testId(`tab-button-${tab.id}`)}
          type="button"
          class="tab-btn ${this.state.activeTab === tab.id ? 'active' : ''}"
          data-action="tab-switch"
          data-tab="${escapeHTML(tab.id)}"
        >
          ${escapeHTML(tab.label)}
        </button>
      `
    ).join('')

    const mobileOptions = BANKING_TABS.map(
      (tab) =>
        `<option value="${escapeHTML(tab.id)}" ${this.state.activeTab === tab.id ? 'selected' : ''}>${escapeHTML(
          tab.label
        )}</option>`
    ).join('')

    const verificationView =
      this.state.activeTab === 'verification'
        ? this.renderVerificationTab(statuses, statusMessages, progress, isComplete)
        : ''

    const bankView = this.state.activeTab === 'bank-account' ? this.renderBankAccountTab(statuses) : ''

    return `
      <div
        class="bo-view bo-view-setup"
        data-bo-view="setup"
        ${this.testId('bo-view-setup')}
      >
        <div class="root" ${this.testId('bison-operator-onboarding-root')}>
          <div class="header" ${this.testId('page-header')}>
            <div ${this.testId('page-title-wrap')}>
              <h1 class="title" ${this.testId('page-title')}>Banking</h1>
              <p class="subtitle" ${this.testId('page-subtitle')}>Account verification and payment setup</p>
            </div>
            <div class="demo-toggle" ${this.testId('demo-toggle')}>
              <button
                ${this.testId('demo-new-account')}
                type="button"
                class="demo-btn ${this.state.demoMode === 'new-account' ? 'active' : ''}"
                data-action="demo-toggle"
                data-mode="new-account"
              >
                New Account
              </button>
              <button
                ${this.testId('demo-mid-verification')}
                type="button"
                class="demo-btn ${this.state.demoMode === 'mid-verification' ? 'active' : ''}"
                data-action="demo-toggle"
                data-mode="mid-verification"
              >
                Mid-Verification
              </button>
              <button
                ${this.testId('demo-all-verified')}
                type="button"
                class="demo-btn ${this.state.demoMode === 'all-verified' ? 'active' : ''}"
                data-action="demo-toggle"
                data-mode="all-verified"
              >
                All Verified
              </button>
            </div>
          </div>

          <div class="card tabs-card" ${this.testId('main-card')}>
            <div class="tabs-mobile" ${this.testId('tabs-mobile')}>
              <select
                ${this.testId('tab-select-mobile')}
                class="tab-select"
                data-action="tab-select"
              >
                ${mobileOptions}
              </select>
            </div>

            <div class="tabs-desktop" ${this.testId('tabs-desktop')}>
              <nav class="tabs-desktop-nav" ${this.testId('tabs-desktop-nav')}>
                ${desktopTabs}
              </nav>
            </div>

            <div class="tab-panel" ${this.testId('tab-panel')}>
              ${verificationView}
              ${bankView}
            </div>
          </div>
        </div>
      </div>
    `
  }

  measureSetupModalRect() {
    if (!this.shadowRoot) return null

    const previousWelcomeState = this.state.ui.welcome.isOpen
    const previousTab = this.state.activeTab
    this.state.ui.welcome.isOpen = false
    this.state.activeTab = 'verification'

    const { statuses, statusMessages, progress, isComplete } = this.getSetupRenderContext()
    const measureWrap = document.createElement('div')
    measureWrap.className = 'bo-modal-measure-wrap'
    measureWrap.innerHTML = `
      <div class="bo-modal bo-modal-setup bo-modal-measure">
        <div class="bo-modal-header">
          <p class="bo-modal-title">Operator Banking Setup</p>
          <button class="bo-close-btn" type="button" aria-hidden="true" tabindex="-1">
            ${this.icon('x', 'icon-5')}
          </button>
        </div>
        <div class="bo-modal-body bo-modal-body-setup">
          ${this.renderSetupModalContent(statuses, statusMessages, progress, isComplete)}
        </div>
      </div>
    `

    this.shadowRoot.appendChild(measureWrap)
    const measuredModal = measureWrap.querySelector('.bo-modal')
    const rect =
      measuredModal instanceof HTMLElement
        ? {
            width: measuredModal.getBoundingClientRect().width,
            height: this.getClampedSetupModalHeight(measuredModal.getBoundingClientRect().height),
          }
        : null
    measureWrap.remove()

    this.state.ui.welcome.isOpen = previousWelcomeState
    this.state.activeTab = previousTab

    return rect
  }

  getClampedSetupModalHeight(height) {
    const numericHeight = Math.round(Number(height) || 0)
    if (!numericHeight) return 0

    const viewportHeight =
      typeof window !== 'undefined' && Number.isFinite(window.innerHeight)
        ? Math.floor(window.innerHeight * 0.92)
        : numericHeight

    return Math.min(numericHeight, viewportHeight)
  }

  getSetupModalStyleAttr() {
    if (!Number.isFinite(this._setupModalHeight) || this._setupModalHeight <= 0) return ''
    return `style="height: min(92vh, ${Math.round(this._setupModalHeight)}px);"`
  }

  persist() {
    // Keep onboarding state in memory only during the current session.
  }

  getRealStatusesFromState(state) {
    return {
      business: state.savedAt.business ? 'complete' : 'not-started',
      officer: state.savedAt.officer ? 'complete' : 'not-started',
      owners: state.data.owners.noOwnersAbove25 || state.data.owners.owners.length > 0 ? 'complete' : 'not-started',
      volume: state.savedAt.volume ? 'complete' : 'not-started',
      bank: state.savedAt.bank ? 'complete' : 'not-started',
      docs: 'not-required',
    }
  }

  getSectionStatusesFromState(state) {
    if (state.demoMode === 'mid-verification') return DEMO_STATUSES_LOOKUP
    if (state.demoMode === 'all-verified') return VERIFIED_STATUSES
    return this.getRealStatusesFromState(state)
  }

  getSectionStatuses() {
    return this.getSectionStatusesFromState(this.state)
  }

  getStatusMessages() {
    if (this.state.demoMode === 'mid-verification') return DEMO_STATUS_MESSAGES
    return {}
  }

  getVerificationProgressFromState(state) {
    const statuses = this.getSectionStatusesFromState(state)
    const required = ['business', 'officer', 'owners', 'volume', 'bank']
    const countable = ['complete', 'submitted', 'pending-review', 'verified']
    const completed = required.filter((key) => countable.includes(statuses[key])).length
    return Math.round((completed / required.length) * 100)
  }

  getVerificationProgress() {
    return this.getVerificationProgressFromState(this.state)
  }

  isComplete() {
    return this.getVerificationProgress() >= 100
  }

  findFirstIncompleteSection(statuses) {
    const first = SECTION_DEFS.find((section) => {
      const status = statuses[section.key]
      return status === 'not-started' || status === 'in-progress'
    })
    return first ? first.key : null
  }

  maybeAutoAdvanceOpenSection(prevStatuses) {
    if (this.state.demoMode !== 'new-account') return

    const statuses = this.getSectionStatuses()
    const justCompleted = SECTION_DEFS.find(
      (section) => statuses[section.key] === 'complete' && prevStatuses[section.key] !== 'complete'
    )

    if (!justCompleted) return

    const startIndex = SECTION_DEFS.findIndex((section) => section.key === justCompleted.key)
    const next = SECTION_DEFS.slice(startIndex + 1).find((section) => {
      const status = statuses[section.key]
      return status === 'not-started' || status === 'in-progress'
    })

    this.state.openSection = next ? next.key : null
  }

  clearFieldError(formName, field) {
    const meta = this.getFormMeta(formName)
    if (!meta) return
    if (meta.errors[field]) {
      delete meta.errors[field]
    }
  }

  getFormMeta(formName) {
    if (formName === 'business') return this.state.ui.business
    if (formName === 'officer') return this.state.ui.officer
    if (formName === 'volume') return this.state.ui.volume
    if (formName === 'bank') return this.state.ui.bank
    if (formName === 'owner') return this.state.ui.ownerEditor
    return null
  }

  updateFormField(formName, field, value) {
    if (formName === 'business') this.state.data.business[field] = value
    if (formName === 'officer') this.state.data.officer[field] = value
    if (formName === 'volume') this.state.data.volume[field] = value
    if (formName === 'bank') this.state.data.bank[field] = value
    if (formName === 'owner') this.state.ui.ownerEditor.form[field] = value
    this.clearFieldError(formName, field)
    this.persist()
  }

  applyFormatter(formatter, value) {
    if (formatter === 'phone') return formatPhone(value)
    if (formatter === 'ein') return formatEIN(value)
    if (formatter === 'zip') return formatZip(value)
    if (formatter === 'dob') return formatDOB(value)
    if (formatter === 'ssn') return formatSSN(value)
    if (formatter === 'currency') return formatCurrencyInput(value)
    if (formatter === 'routing') return formatRoutingNumber(value)
    if (formatter === 'count') return formatCount(value)
    return value
  }

  validateByForm(formName) {
    if (formName === 'business') return validateBusiness(this.state.data.business)
    if (formName === 'officer') return validateOfficer(this.state.data.officer)
    if (formName === 'volume') return validateVolume(this.state.data.volume)
    if (formName === 'bank')
      return validateBank({
        routingNumber: this.state.data.bank.routingNumber,
        accountNumber: this.state.data.bank.accountNumber,
        accountType: this.state.data.bank.accountType,
      })
    if (formName === 'owner') return validateOwner(this.state.ui.ownerEditor.form)
    return {}
  }

  validateField(formName, field) {
    const meta = this.getFormMeta(formName)
    if (!meta) return

    const errors = this.validateByForm(formName)
    if (errors[field]) meta.errors[field] = errors[field]
    else delete meta.errors[field]
  }

  getVisibleError(meta, field) {
    if (!meta) return ''
    return meta.touched[field] || meta.submitAttempted ? meta.errors[field] || '' : ''
  }

  setDemoMode(mode) {
    this.state.demoMode = mode
    this.state.activeTab = mode === 'all-verified' ? 'bank-account' : 'verification'
    this.state.openSection = null
  }

  startOwnerAdd() {
    this.state.ui.ownerEditor = {
      mode: 'add',
      editingId: '',
      form: emptyOwner(),
      errors: {},
      touched: {},
      submitAttempted: false,
      isSaving: false,
    }
  }

  startOwnerEdit(ownerId) {
    const owner = this.state.data.owners.owners.find((item) => item.id === ownerId)
    if (!owner) return
    this.state.ui.ownerEditor = {
      mode: 'edit',
      editingId: ownerId,
      form: { ...owner },
      errors: {},
      touched: {},
      submitAttempted: false,
      isSaving: false,
    }
  }

  stopOwnerEdit() {
    this.state.ui.ownerEditor = {
      mode: null,
      editingId: '',
      form: emptyOwner(),
      errors: {},
      touched: {},
      submitAttempted: false,
      isSaving: false,
    }
  }

  saveForm(formName, delayMs) {
    const meta = this.getFormMeta(formName)
    if (!meta) return

    meta.submitAttempted = true
    const errors = this.validateByForm(formName)
    meta.errors = errors

    if (Object.keys(errors).length > 0) {
      this.render()
      return
    }

    meta.isSaving = true
    this.render()

    const timer = setTimeout(() => {
      const prevStatuses = this.getSectionStatuses()

      if (formName === 'business') this.state.savedAt.business = new Date().toISOString()
      if (formName === 'officer') this.state.savedAt.officer = new Date().toISOString()
      if (formName === 'volume') this.state.savedAt.volume = new Date().toISOString()
      if (formName === 'bank') {
        this.state.savedAt.bank = new Date().toISOString()
        this.state.data.bank.connectedViaPlaid = false
      }

      meta.isSaving = false
      this.persist()
      this.maybeAutoAdvanceOpenSection(prevStatuses)
      this.render()

      this._timers.delete(timer)
    }, delayMs)

    this._timers.add(timer)
  }

  saveOwner() {
    const meta = this.state.ui.ownerEditor
    meta.submitAttempted = true

    const errors = validateOwner(meta.form)
    meta.errors = errors
    if (Object.keys(errors).length > 0) {
      this.render()
      return
    }

    meta.isSaving = true
    this.render()

    const timer = setTimeout(() => {
      const prevStatuses = this.getSectionStatuses()
      const owner = {
        ...meta.form,
        id: meta.form.id || makeId(),
      }

      const existingIndex = this.state.data.owners.owners.findIndex((item) => item.id === owner.id)
      if (existingIndex >= 0) {
        this.state.data.owners.owners = this.state.data.owners.owners.map((item, index) =>
          index === existingIndex ? owner : item
        )
      } else {
        this.state.data.owners.owners = [...this.state.data.owners.owners, owner]
      }

      this.state.data.owners.noOwnersAbove25 = false
      this.stopOwnerEdit()
      this.persist()
      this.maybeAutoAdvanceOpenSection(prevStatuses)
      this.render()

      this._timers.delete(timer)
    }, 300)

    this._timers.add(timer)
  }

  onClick(event) {
    const target = event.target instanceof Element ? event.target.closest('[data-action]') : null
    if (!target) return

    const action = target.getAttribute('data-action')
    if (!action) return

    if (target instanceof HTMLButtonElement && target.disabled) return

    if (action === 'open-modal') {
      this.open()
      return
    }

    if (action === 'close-modal') {
      this.close()
      return
    }

    if (action === 'welcome-toggle-method') {
      const methodId = target.getAttribute('data-method-id')
      if (!methodId) return

      const selected = this.state.ui.welcome.selectedMethods
      if (selected.includes(methodId)) {
        this.state.ui.welcome.selectedMethods = selected.filter((id) => id !== methodId)
      } else {
        this.state.ui.welcome.selectedMethods = [...selected, methodId]
      }
      this.persistWelcomeState()
      this.render()
      return
    }

    if (action === 'welcome-continue') {
      if (this.state.ui.welcome.selectedMethods.length === 0) return
      this.transitionWelcomeToSetup()
      return
    }

    if (action === 'welcome-start-verification') {
      this.state.activeTab = 'verification'
      this.closeWelcomeModal()
      this.render()
      return
    }

    if (action === 'welcome-close') {
      this.closeWelcomeModal()
      this.close()
      return
    }

    if (action === 'demo-toggle') {
      const mode = target.getAttribute('data-mode')
      if (!mode) return
      this.setDemoMode(mode)
      this.render()
      return
    }

    if (action === 'tab-switch') {
      const tab = target.getAttribute('data-tab')
      if (!tab) return
      this.state.activeTab = tab
      this.render()
      return
    }

    if (action === 'toggle-section') {
      const section = target.getAttribute('data-section')
      if (!section) return
      this.captureOpenAccordionHeight(this.state.openSection)
      this.state.openSection = this.state.openSection === section ? null : section
      this.render()
      return
    }

    if (action === 'status-message-action') {
      const section = target.getAttribute('data-section')
      if (!section) return
      this.state.openSection = section
      this.render()
      return
    }

    if (action === 'save-form') {
      const form = target.getAttribute('data-form')
      if (!form) return
      this.saveForm(form, 400)
      return
    }

    if (action === 'owner-add') {
      if (this.state.data.owners.noOwnersAbove25) return
      this.startOwnerAdd()
      this.render()
      return
    }

    if (action === 'owner-edit') {
      const ownerId = target.getAttribute('data-owner-id')
      if (!ownerId) return
      this.startOwnerEdit(ownerId)
      this.render()
      return
    }

    if (action === 'owner-remove') {
      const ownerId = target.getAttribute('data-owner-id')
      if (!ownerId) return

      this.state.data.owners.owners = this.state.data.owners.owners.filter((item) => item.id !== ownerId)
      if (this.state.ui.ownerEditor.mode === 'edit' && this.state.ui.ownerEditor.editingId === ownerId) {
        this.stopOwnerEdit()
      }
      this.persist()
      this.render()
      return
    }

    if (action === 'owner-cancel') {
      this.stopOwnerEdit()
      this.render()
      return
    }

    if (action === 'owner-save') {
      this.saveOwner()
      return
    }

    if (action === 'toggle-password') {
      const field = target.getAttribute('data-password-field')
      if (!field) return
      const current = this.state.ui.passwordVisibility[field]
      this.state.ui.passwordVisibility[field] = !current
      this.render()
      return
    }

    if (action === 'docs-open-file') {
      const input = this.shadowRoot.querySelector('#docs-file-input')
      if (input) input.click()
      return
    }

    if (action === 'docs-clear-file') {
      this.state.ui.docs.fileName = ''
      this.render()
      return
    }
  }

  onInput(event) {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return

    const form = target.getAttribute('data-form')
    const field = target.getAttribute('data-field')
    if (!form || !field) return

    let value = target.value
    const formatter = target.getAttribute('data-formatter')
    if (formatter) {
      value = this.applyFormatter(formatter, value)
      if (target.value !== value) target.value = value
    }

    if (form === 'owner' && field === 'ownershipPercent') {
      const num = parseInt(value, 10)
      const clamped = Number.isNaN(num) ? 0 : Math.min(100, Math.max(0, num))
      this.updateFormField(form, field, clamped)
      return
    }

    this.updateFormField(form, field, value)
  }

  onChange(event) {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return

    const action = target.getAttribute('data-action')
    if (action === 'tab-select') {
      this.state.activeTab = target.value
      this.render()
      return
    }

    if (action === 'no-owners-checkbox') {
      const prevStatuses = this.getSectionStatuses()
      this.state.data.owners.noOwnersAbove25 = target.checked
      this.persist()
      this.maybeAutoAdvanceOpenSection(prevStatuses)
      this.render()
      return
    }

    if (target.id === 'docs-file-input') {
      const file = target.files && target.files[0]
      if (file) {
        this.state.ui.docs.fileName = file.name
        this.render()
      }
      return
    }

    const form = target.getAttribute('data-form')
    const field = target.getAttribute('data-field')
    if (!form || !field) return

    this.onInput(event)
  }

  onFocusOut(event) {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return

    const form = target.getAttribute('data-form')
    const field = target.getAttribute('data-field')
    if (!form || !field) return

    const meta = this.getFormMeta(form)
    if (!meta) return

    meta.touched[field] = true
    this.validateField(form, field)
    this.render()
  }

  onDragOver(event) {
    const zone = event.target instanceof Element ? event.target.closest('[data-dropzone="docs"]') : null
    if (!zone) return
    event.preventDefault()
    if (!this.state.ui.docs.isDragging) {
      this.state.ui.docs.isDragging = true
      this.render()
    }
  }

  onDragLeave(event) {
    const zone = event.target instanceof Element ? event.target.closest('[data-dropzone="docs"]') : null
    if (!zone) return

    const related = event.relatedTarget
    if (related && zone.contains(related)) return

    if (this.state.ui.docs.isDragging) {
      this.state.ui.docs.isDragging = false
      this.render()
    }
  }

  onDrop(event) {
    const zone = event.target instanceof Element ? event.target.closest('[data-dropzone="docs"]') : null
    if (!zone) return
    event.preventDefault()

    this.state.ui.docs.isDragging = false
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]
    if (file) {
      this.state.ui.docs.fileName = file.name
    }
    this.render()
  }

  wireModalOverlay() {
    const overlay = this.shadowRoot.querySelector('.bo-overlay')
    if (!(overlay instanceof HTMLDialogElement)) return

    overlay.addEventListener('cancel', (event) => {
      event.preventDefault()
      this.close()
    })

    overlay.setAttribute('open', '')
  }

  getCdnIconName(name) {
    return ICON_CDN_MAP[name] || name
  }

  requestLucideIcon(name) {
    const cdnName = this.getCdnIconName(name)
    if (this._iconCache.has(cdnName) || this._iconFetchInFlight.has(cdnName)) return

    this._iconFetchInFlight.add(cdnName)
    fetch(`${LUCIDE_CDN_BASE}/${cdnName}.svg`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${cdnName}`)
        return res.text()
      })
      .then((svg) => {
        // Basic safety: only cache valid svg payloads.
        if (svg && svg.includes('<svg')) {
          this._iconCache.set(cdnName, svg)
          this.render()
        }
      })
      .catch(() => {
        // Keep inline fallback if CDN icon fails.
      })
      .finally(() => {
        this._iconFetchInFlight.delete(cdnName)
      })
  }

  preloadLucideIcons() {
    if (this._lucidePreloadStarted) return
    this._lucidePreloadStarted = true

    const uniqueIcons = [...new Set(Object.values(ICON_CDN_MAP))]
    const iconsToFetch = uniqueIcons.filter(
      (cdnName) => !this._iconCache.has(cdnName) && !this._iconFetchInFlight.has(cdnName)
    )
    this._pendingIconPreloads = iconsToFetch.length

    if (this._pendingIconPreloads === 0) return

    iconsToFetch.forEach((cdnName) => {
      if (this._iconCache.has(cdnName) || this._iconFetchInFlight.has(cdnName)) return
      this._iconFetchInFlight.add(cdnName)
      fetch(`${LUCIDE_CDN_BASE}/${cdnName}.svg`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${cdnName}`)
          return res.text()
        })
        .then((svg) => {
          if (svg && svg.includes('<svg')) {
            this._iconCache.set(cdnName, svg)
          }
        })
        .catch(() => {
          // Keep inline fallback if CDN icon fails.
        })
        .finally(() => {
          this._iconFetchInFlight.delete(cdnName)
          this._pendingIconPreloads = Math.max(0, this._pendingIconPreloads - 1)
          if (this._pendingIconPreloads === 0 && this.isConnected) {
            this.render()
          }
        })
    })
  }

  icon(name, className = 'icon') {
    const cdnName = this.getCdnIconName(name)
    const cachedSvg = this._iconCache.get(cdnName)
    if (cachedSvg) {
      return cachedSvg
        .replace(
          '<svg ',
          `<svg ${this.testId(`icon-${name}`)} class="${escapeHTML(className)}" aria-hidden="true" `
        )
        .replace(/\n/g, '')
    }

    this.requestLucideIcon(name)

    const attrs = `${this.testId(`icon-${name}`)} class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`
    if (name === 'building2') {
      return `<svg ${attrs}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v8h4"></path><path d="M18 9h2a2 2 0 0 1 2 2v11h-4"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>`
    }
    if (name === 'user') {
      return `<svg ${attrs}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    }
    if (name === 'users') {
      return `<svg ${attrs}><path d="M16 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2"></path><circle cx="8" cy="7" r="4"></circle><path d="M20 8v6"></path><path d="M23 11h-6"></path></svg>`
    }
    if (name === 'bar-chart-3') {
      return `<svg ${attrs}><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>`
    }
    if (name === 'landmark') {
      return `<svg ${attrs}><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>`
    }
    if (name === 'file-text') {
      return `<svg ${attrs}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>`
    }
    if (name === 'chevron-down') {
      return `<svg ${attrs}><polyline points="6 9 12 15 18 9"></polyline></svg>`
    }
    if (name === 'check-circle') {
      return `<svg ${attrs}><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>`
    }
    if (name === 'check') {
      return `<svg ${attrs}><polyline points="20 6 9 17 4 12"></polyline></svg>`
    }
    if (name === 'alert-circle') {
      return `<svg ${attrs}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    }
    if (name === 'clock') {
      return `<svg ${attrs}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
    }
    if (name === 'credit-card') {
      return `<svg ${attrs}><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`
    }
    if (name === 'arrow-right-left') {
      return `<svg ${attrs}><line x1="17" y1="10" x2="3" y2="10"></line><polyline points="7 6 3 10 7 14"></polyline><line x1="7" y1="14" x2="21" y2="14"></line><polyline points="17 18 21 14 17 10"></polyline></svg>`
    }
    if (name === 'zap') {
      return `<svg ${attrs}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
    }
    if (name === 'plus') {
      return `<svg ${attrs}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
    }
    if (name === 'pencil') {
      return `<svg ${attrs}><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`
    }
    if (name === 'trash') {
      return `<svg ${attrs}><polyline points="3 6 5 6 21 6"></polyline><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>`
    }
    if (name === 'lock') {
      return `<svg ${attrs}><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
    }
    if (name === 'upload') {
      return `<svg ${attrs}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
    }
    if (name === 'x') {
      return `<svg ${attrs}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
    }
    if (name === 'loader') {
      return `<svg ${attrs}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`
    }
    if (name === 'eye') {
      return `<svg ${attrs}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
    }
    if (name === 'eye-off') {
      return `<svg ${attrs}><path d="M17.94 17.94A10.83 10.83 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94"></path><path d="M9.9 4.24A10.93 10.93 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
    }
    return `<svg ${attrs}><circle cx="12" cy="12" r="10"></circle></svg>`
  }

  badgeClass(tone) {
    if (tone === 'success') return 'badge badge-success'
    if (tone === 'warning') return 'badge badge-warning'
    if (tone === 'error') return 'badge badge-error'
    if (tone === 'blue') return 'badge badge-blue'
    if (tone === 'neutral') return 'badge badge-neutral'
    return 'badge badge-secondary'
  }

  renderField({
    form,
    field,
    label,
    required = false,
    controlHTML,
    error = '',
    fieldTestId,
  }) {
    return `
      <div class="field" ${this.testId(fieldTestId || `field-${form}-${field}`)}>
        <label class="field-label" ${this.testId(`label-${form}-${field}`)}>
          ${escapeHTML(label)}${required ? '<span class="required">*</span>' : ''}
        </label>
        ${controlHTML}
        ${
          error
            ? `<p class="field-error" ${this.testId(`error-${form}-${field}`)}>${this.icon('alert-circle', 'icon-3')}<span>${escapeHTML(error)}</span></p>`
            : ''
        }
      </div>
    `
  }

  renderTextInput({
    form,
    field,
    value,
    placeholder = '',
    type = 'text',
    formatter = '',
    min = '',
    max = '',
    disabled = false,
    error = false,
    inputTestId,
  }) {
    return `
      <input
        ${this.testId(inputTestId || `input-${form}-${field}`)}
        class="input ${error ? 'input-error' : ''}"
        type="${escapeHTML(type)}"
        value="${escapeHTML(value)}"
        placeholder="${escapeHTML(placeholder)}"
        ${formatter ? `data-formatter="${escapeHTML(formatter)}"` : ''}
        ${min !== '' ? `min="${escapeHTML(min)}"` : ''}
        ${max !== '' ? `max="${escapeHTML(max)}"` : ''}
        data-form="${escapeHTML(form)}"
        data-field="${escapeHTML(field)}"
        ${disabled ? 'disabled' : ''}
      />
    `
  }

  renderPasswordInput({
    form,
    field,
    value,
    placeholder = '',
    formatter = '',
    disabled = false,
    error = false,
    passwordFieldKey,
  }) {
    const visible = !!this.state.ui.passwordVisibility[passwordFieldKey]
    return `
      <div class="password-wrap" ${this.testId(`password-wrap-${form}-${field}`)}>
        <input
          ${this.testId(`input-${form}-${field}`)}
          class="input password-input ${error ? 'input-error' : ''}"
          type="${visible ? 'text' : 'password'}"
          value="${escapeHTML(value)}"
          placeholder="${escapeHTML(placeholder)}"
          ${formatter ? `data-formatter="${escapeHTML(formatter)}"` : ''}
          data-form="${escapeHTML(form)}"
          data-field="${escapeHTML(field)}"
          ${disabled ? 'disabled' : ''}
        />
        <button
          ${this.testId(`toggle-password-${form}-${field}`)}
          class="password-toggle"
          type="button"
          data-action="toggle-password"
          data-password-field="${escapeHTML(passwordFieldKey)}"
          ${disabled ? 'disabled' : ''}
        >
          ${this.icon(visible ? 'eye-off' : 'eye', 'icon-5')}
        </button>
      </div>
    `
  }

  renderSelectInput({
    form,
    field,
    value,
    placeholder = 'Select...',
    options,
    disabled = false,
    error = false,
    selectTestId,
  }) {
    const optionHTML = options
      .map(
        (option) =>
          `<option value="${escapeHTML(option.value)}" ${
            value === option.value ? 'selected' : ''
          }>${escapeHTML(option.label)}</option>`
      )
      .join('')

    return `
      <select
        ${this.testId(selectTestId || `select-${form}-${field}`)}
        class="select ${error ? 'input-error' : ''} ${!value ? 'placeholder' : ''}"
        data-form="${escapeHTML(form)}"
        data-field="${escapeHTML(field)}"
        ${disabled ? 'disabled' : ''}
      >
        <option value="">${escapeHTML(placeholder)}</option>
        ${optionHTML}
      </select>
    `
  }

  renderSaveButton({
    form,
    label,
    isSaving = false,
    action = 'save-form',
    buttonClass = 'btn btn-primary',
    buttonTestId,
  }) {
    return `
      <button
        ${this.testId(buttonTestId || `button-save-${form}`)}
        class="${buttonClass}"
        type="button"
        data-action="${escapeHTML(action)}"
        data-form="${escapeHTML(form)}"
        ${isSaving ? 'disabled' : ''}
      >
        ${isSaving ? `${this.icon('loader', 'icon-4 spin')}<span>Saving...</span>` : `<span>${escapeHTML(label)}</span>`}
      </button>
    `
  }

  renderBusinessForm(readOnly) {
    const form = this.state.data.business
    const meta = this.state.ui.business
    const error = (field) => this.getVisibleError(meta, field)

    return `
      <div class="form-stack" ${this.testId('business-form')}>
        <div class="grid-two" ${this.testId('business-row-legal')}>
          ${this.renderField({
            form: 'business',
            field: 'legalName',
            label: 'Legal Business Name',
            required: true,
            error: error('legalName'),
            controlHTML: this.renderTextInput({
              form: 'business',
              field: 'legalName',
              value: form.legalName,
              placeholder: 'Must match IRS records exactly',
              disabled: readOnly,
              error: !!error('legalName'),
            }),
          })}
          ${this.renderField({
            form: 'business',
            field: 'dba',
            label: 'Doing Business As',
            controlHTML: this.renderTextInput({
              form: 'business',
              field: 'dba',
              value: form.dba,
              placeholder: 'DBA or trade name',
              disabled: readOnly,
            }),
          })}
        </div>

        <div class="grid-two" ${this.testId('business-row-type-ein')}>
          ${this.renderField({
            form: 'business',
            field: 'businessType',
            label: 'Business Type',
            required: true,
            error: error('businessType'),
            controlHTML: this.renderSelectInput({
              form: 'business',
              field: 'businessType',
              value: form.businessType,
              placeholder: 'Select business type...',
              options: BUSINESS_TYPES,
              disabled: readOnly,
              error: !!error('businessType'),
            }),
          })}
          ${this.renderField({
            form: 'business',
            field: 'ein',
            label: 'EIN',
            required: true,
            error: error('ein'),
            controlHTML: this.renderTextInput({
              form: 'business',
              field: 'ein',
              value: form.ein,
              placeholder: 'XX-XXXXXXX',
              formatter: 'ein',
              disabled: readOnly,
              error: !!error('ein'),
            }),
          })}
        </div>

        ${this.renderField({
          form: 'business',
          field: 'address',
          label: 'Physical Business Address',
          required: true,
          error: error('address'),
          controlHTML: this.renderTextInput({
            form: 'business',
            field: 'address',
            value: form.address,
            placeholder: 'Street address (no PO boxes)',
            disabled: readOnly,
            error: !!error('address'),
          }),
        })}

        <div class="grid-city-state" ${this.testId('business-row-city-state-zip')}>
          ${this.renderField({
            form: 'business',
            field: 'city',
            label: 'City',
            required: true,
            error: error('city'),
            controlHTML: this.renderTextInput({
              form: 'business',
              field: 'city',
              value: form.city,
              placeholder: 'City',
              disabled: readOnly,
              error: !!error('city'),
            }),
          })}
          ${this.renderField({
            form: 'business',
            field: 'state',
            label: 'State',
            required: true,
            error: error('state'),
            controlHTML: this.renderSelectInput({
              form: 'business',
              field: 'state',
              value: form.state,
              placeholder: 'State...',
              options: US_STATES,
              disabled: readOnly,
              error: !!error('state'),
            }),
          })}
          ${this.renderField({
            form: 'business',
            field: 'zip',
            label: 'ZIP',
            required: true,
            error: error('zip'),
            controlHTML: this.renderTextInput({
              form: 'business',
              field: 'zip',
              value: form.zip,
              placeholder: 'XXXXX',
              formatter: 'zip',
              disabled: readOnly,
              error: !!error('zip'),
            }),
          })}
        </div>

        ${this.renderField({
          form: 'business',
          field: 'phone',
          label: 'Business Phone',
          required: true,
          error: error('phone'),
          controlHTML: this.renderTextInput({
            form: 'business',
            field: 'phone',
            value: form.phone,
            placeholder: '(XXX) XXX-XXXX',
            type: 'tel',
            formatter: 'phone',
            disabled: readOnly,
            error: !!error('phone'),
          }),
        })}

        ${this.renderField({
          form: 'business',
          field: 'website',
          label: 'Website or Business Description',
          required: true,
          error: error('website'),
          controlHTML: this.renderTextInput({
            form: 'business',
            field: 'website',
            value: form.website,
            placeholder: 'URL or short description — at least one required',
            disabled: readOnly,
            error: !!error('website'),
          }),
        })}

        ${this.renderField({
          form: 'business',
          field: 'industry',
          label: 'Industry',
          required: true,
          error: error('industry'),
          controlHTML: this.renderSelectInput({
            form: 'business',
            field: 'industry',
            value: form.industry,
            placeholder: 'Select industry...',
            options: INDUSTRIES,
            disabled: readOnly,
            error: !!error('industry'),
          }),
        })}

        ${
          readOnly
            ? ''
            : `<div class="save-row" ${this.testId('business-save-row')}>
                ${this.renderSaveButton({
                  form: 'business',
                  label: 'Save Business Profile',
                  isSaving: this.state.ui.business.isSaving,
                })}
              </div>`
        }
      </div>
    `
  }

  renderOfficerForm(readOnly) {
    const form = this.state.data.officer
    const meta = this.state.ui.officer
    const error = (field) => this.getVisibleError(meta, field)

    return `
      <div class="form-stack" ${this.testId('officer-form')}>
        <div class="info-box info-box-primary" ${this.testId('officer-context-box')}>
          <p ${this.testId('officer-context-text')}>
            As the account creator, we need to verify your identity. This is required by federal banking regulations.
          </p>
        </div>

        <div class="grid-two" ${this.testId('officer-row-name')}>
          ${this.renderField({
            form: 'officer',
            field: 'firstName',
            label: 'First Name',
            required: true,
            error: error('firstName'),
            controlHTML: this.renderTextInput({
              form: 'officer',
              field: 'firstName',
              value: form.firstName,
              placeholder: 'First name',
              disabled: readOnly,
              error: !!error('firstName'),
            }),
          })}
          ${this.renderField({
            form: 'officer',
            field: 'lastName',
            label: 'Last Name',
            required: true,
            error: error('lastName'),
            controlHTML: this.renderTextInput({
              form: 'officer',
              field: 'lastName',
              value: form.lastName,
              placeholder: 'Last name',
              disabled: readOnly,
              error: !!error('lastName'),
            }),
          })}
        </div>

        <div class="grid-two" ${this.testId('officer-row-contact')}>
          ${this.renderField({
            form: 'officer',
            field: 'email',
            label: 'Email',
            required: true,
            error: error('email'),
            controlHTML: this.renderTextInput({
              form: 'officer',
              field: 'email',
              value: form.email,
              placeholder: 'email@company.com',
              type: 'email',
              disabled: readOnly,
              error: !!error('email'),
            }),
          })}
          ${this.renderField({
            form: 'officer',
            field: 'phone',
            label: 'Phone',
            required: true,
            error: error('phone'),
            controlHTML: this.renderTextInput({
              form: 'officer',
              field: 'phone',
              value: form.phone,
              placeholder: '(XXX) XXX-XXXX',
              type: 'tel',
              formatter: 'phone',
              disabled: readOnly,
              error: !!error('phone'),
            }),
          })}
        </div>

        ${this.renderField({
          form: 'officer',
          field: 'address',
          label: 'Residential Address',
          required: true,
          error: error('address'),
          controlHTML: this.renderTextInput({
            form: 'officer',
            field: 'address',
            value: form.address,
            placeholder: 'Home address — no PO boxes or commercial addresses',
            disabled: readOnly,
            error: !!error('address'),
          }),
        })}

        <div class="grid-city-state" ${this.testId('officer-row-city-state-zip')}>
          ${this.renderField({
            form: 'officer',
            field: 'city',
            label: 'City',
            required: true,
            error: error('city'),
            controlHTML: this.renderTextInput({
              form: 'officer',
              field: 'city',
              value: form.city,
              placeholder: 'City',
              disabled: readOnly,
              error: !!error('city'),
            }),
          })}
          ${this.renderField({
            form: 'officer',
            field: 'state',
            label: 'State',
            required: true,
            error: error('state'),
            controlHTML: this.renderSelectInput({
              form: 'officer',
              field: 'state',
              value: form.state,
              placeholder: 'State...',
              options: US_STATES,
              disabled: readOnly,
              error: !!error('state'),
            }),
          })}
          ${this.renderField({
            form: 'officer',
            field: 'zip',
            label: 'ZIP',
            required: true,
            error: error('zip'),
            controlHTML: this.renderTextInput({
              form: 'officer',
              field: 'zip',
              value: form.zip,
              placeholder: 'XXXXX',
              formatter: 'zip',
              disabled: readOnly,
              error: !!error('zip'),
            }),
          })}
        </div>

        <div class="grid-two" ${this.testId('officer-row-dob-ssn')}>
          ${this.renderField({
            form: 'officer',
            field: 'dob',
            label: 'Date of Birth',
            required: true,
            error: error('dob'),
            controlHTML: this.renderTextInput({
              form: 'officer',
              field: 'dob',
              value: form.dob,
              placeholder: 'MM/DD/YYYY',
              formatter: 'dob',
              disabled: readOnly,
              error: !!error('dob'),
            }),
          })}
          ${this.renderField({
            form: 'officer',
            field: 'ssn',
            label: 'Full SSN',
            required: true,
            error: error('ssn'),
            controlHTML: this.renderPasswordInput({
              form: 'officer',
              field: 'ssn',
              value: form.ssn,
              placeholder: 'XXX-XX-XXXX',
              formatter: 'ssn',
              disabled: readOnly,
              error: !!error('ssn'),
              passwordFieldKey: 'officerSsn',
            }),
          })}
        </div>

        <div class="info-box info-box-blue icon-box" ${this.testId('officer-security-box')}>
          ${this.icon('lock', 'icon-4')}
          <p ${this.testId('officer-security-text')}>
            Your SSN is encrypted end-to-end and sent directly to our payment processor. Never stored on our servers.
          </p>
        </div>

        ${this.renderField({
          form: 'officer',
          field: 'jobTitle',
          label: 'Job Title',
          required: true,
          error: error('jobTitle'),
          controlHTML: this.renderTextInput({
            form: 'officer',
            field: 'jobTitle',
            value: form.jobTitle,
            placeholder: 'e.g. CEO, Managing Partner, CFO',
            disabled: readOnly,
            error: !!error('jobTitle'),
          }),
        })}

        ${
          readOnly
            ? ''
            : `<div class="save-row" ${this.testId('officer-save-row')}>
                ${this.renderSaveButton({
                  form: 'officer',
                  label: 'Save Representative Info',
                  isSaving: this.state.ui.officer.isSaving,
                })}
              </div>`
        }
      </div>
    `
  }

  renderOwnerFormInline() {
    const meta = this.state.ui.ownerEditor
    const form = meta.form
    const error = (field) => this.getVisibleError(meta, field)

    return `
      <div class="owner-inline-form" ${this.testId('owner-inline-form')}>
        <div class="grid-two" ${this.testId('owner-row-name')}>
          ${this.renderField({
            form: 'owner',
            field: 'firstName',
            label: 'First Name',
            required: true,
            error: error('firstName'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'firstName',
              value: form.firstName,
              placeholder: 'First name',
              error: !!error('firstName'),
            }),
          })}
          ${this.renderField({
            form: 'owner',
            field: 'lastName',
            label: 'Last Name',
            required: true,
            error: error('lastName'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'lastName',
              value: form.lastName,
              placeholder: 'Last name',
              error: !!error('lastName'),
            }),
          })}
        </div>

        <div class="grid-two" ${this.testId('owner-row-contact')}>
          ${this.renderField({
            form: 'owner',
            field: 'email',
            label: 'Email',
            required: true,
            error: error('email'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'email',
              value: form.email,
              placeholder: 'email@company.com',
              type: 'email',
              error: !!error('email'),
            }),
          })}
          ${this.renderField({
            form: 'owner',
            field: 'phone',
            label: 'Phone',
            required: true,
            error: error('phone'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'phone',
              value: form.phone,
              placeholder: '(XXX) XXX-XXXX',
              type: 'tel',
              formatter: 'phone',
              error: !!error('phone'),
            }),
          })}
        </div>

        ${this.renderField({
          form: 'owner',
          field: 'address',
          label: 'Residential Address',
          required: true,
          error: error('address'),
          controlHTML: this.renderTextInput({
            form: 'owner',
            field: 'address',
            value: form.address,
            placeholder: 'Home address — no PO boxes or commercial addresses',
            error: !!error('address'),
          }),
        })}

        <div class="grid-city-state" ${this.testId('owner-row-city-state-zip')}>
          ${this.renderField({
            form: 'owner',
            field: 'city',
            label: 'City',
            required: true,
            error: error('city'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'city',
              value: form.city,
              placeholder: 'City',
              error: !!error('city'),
            }),
          })}
          ${this.renderField({
            form: 'owner',
            field: 'state',
            label: 'State',
            required: true,
            error: error('state'),
            controlHTML: this.renderSelectInput({
              form: 'owner',
              field: 'state',
              value: form.state,
              placeholder: 'State...',
              options: US_STATES,
              error: !!error('state'),
            }),
          })}
          ${this.renderField({
            form: 'owner',
            field: 'zip',
            label: 'ZIP',
            required: true,
            error: error('zip'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'zip',
              value: form.zip,
              placeholder: 'XXXXX',
              formatter: 'zip',
              error: !!error('zip'),
            }),
          })}
        </div>

        <div class="grid-two" ${this.testId('owner-row-dob-ssn')}>
          ${this.renderField({
            form: 'owner',
            field: 'dob',
            label: 'Date of Birth',
            required: true,
            error: error('dob'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'dob',
              value: form.dob,
              placeholder: 'MM/DD/YYYY',
              formatter: 'dob',
              error: !!error('dob'),
            }),
          })}
          ${this.renderField({
            form: 'owner',
            field: 'ssn',
            label: 'Full SSN',
            required: true,
            error: error('ssn'),
            controlHTML: this.renderPasswordInput({
              form: 'owner',
              field: 'ssn',
              value: form.ssn,
              placeholder: 'XXX-XX-XXXX',
              formatter: 'ssn',
              error: !!error('ssn'),
              passwordFieldKey: 'ownerSsn',
            }),
          })}
        </div>

        <div class="info-box info-box-blue icon-box" ${this.testId('owner-security-box')}>
          ${this.icon('lock', 'icon-4')}
          <p ${this.testId('owner-security-text')}>
            Your SSN is encrypted end-to-end and sent directly to our payment processor. Never stored on our servers.
          </p>
        </div>

        <div class="grid-two" ${this.testId('owner-row-job-ownership')}>
          ${this.renderField({
            form: 'owner',
            field: 'jobTitle',
            label: 'Job Title',
            required: true,
            error: error('jobTitle'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'jobTitle',
              value: form.jobTitle,
              placeholder: 'e.g. CEO, Managing Partner, CFO',
              error: !!error('jobTitle'),
            }),
          })}
          ${this.renderField({
            form: 'owner',
            field: 'ownershipPercent',
            label: 'Ownership Percentage',
            required: true,
            error: error('ownershipPercent'),
            controlHTML: this.renderTextInput({
              form: 'owner',
              field: 'ownershipPercent',
              value: form.ownershipPercent ? String(form.ownershipPercent) : '',
              placeholder: '25–100',
              type: 'number',
              min: '25',
              max: '100',
              error: !!error('ownershipPercent'),
            }),
          })}
        </div>

        <div class="inline-actions" ${this.testId('owner-inline-actions')}>
          <button
            ${this.testId('owner-cancel-button')}
            class="btn btn-ghost"
            type="button"
            data-action="owner-cancel"
            ${meta.isSaving ? 'disabled' : ''}
          >
            Cancel
          </button>
          <button
            ${this.testId('owner-save-button')}
            class="btn btn-primary"
            type="button"
            data-action="owner-save"
            ${meta.isSaving ? 'disabled' : ''}
          >
            ${meta.isSaving ? `${this.icon('loader', 'icon-4 spin')}<span>Saving...</span>` : '<span>Save Owner</span>'}
          </button>
        </div>
      </div>
    `
  }

  renderOwnerCard(owner) {
    return `
      <div class="owner-card" ${this.testId(`owner-card-${owner.id}`)}>
        <div class="owner-card-info" ${this.testId(`owner-card-info-${owner.id}`)}>
          <p class="owner-name" ${this.testId(`owner-name-${owner.id}`)}>${escapeHTML(owner.firstName)} ${escapeHTML(owner.lastName)}</p>
          <p class="owner-meta" ${this.testId(`owner-meta-${owner.id}`)}>${escapeHTML(
      String(owner.ownershipPercent)
    )}% ownership · ${escapeHTML(owner.email)}</p>
        </div>
        <div class="owner-card-actions" ${this.testId(`owner-card-actions-${owner.id}`)}>
          <button
            ${this.testId(`owner-edit-${owner.id}`)}
            class="icon-btn icon-btn-primary"
            type="button"
            data-action="owner-edit"
            data-owner-id="${escapeHTML(owner.id)}"
            aria-label="Edit ${escapeHTML(owner.firstName)} ${escapeHTML(owner.lastName)}"
          >
            ${this.icon('pencil', 'icon-4')}
          </button>
          <button
            ${this.testId(`owner-remove-${owner.id}`)}
            class="icon-btn icon-btn-error"
            type="button"
            data-action="owner-remove"
            data-owner-id="${escapeHTML(owner.id)}"
            aria-label="Remove ${escapeHTML(owner.firstName)} ${escapeHTML(owner.lastName)}"
          >
            ${this.icon('trash', 'icon-4')}
          </button>
        </div>
      </div>
    `
  }

  renderOwnersForm(readOnly) {
    const ownersData = this.state.data.owners
    const editor = this.state.ui.ownerEditor
    const isShowingForm = !!editor.mode

    const ownerRows = ownersData.owners
      .map((owner) => {
        if (!readOnly && editor.mode === 'edit' && editor.editingId === owner.id) {
          return this.renderOwnerFormInline()
        }
        return this.renderOwnerCard(owner)
      })
      .join('')

    return `
      <div class="form-stack" ${this.testId('owners-form')}>
        <div class="info-box info-box-primary" ${this.testId('owners-context-box')}>
          <p ${this.testId('owners-context-text')}>
            Federal regulations require verification of all individuals who own 25% or more of the business.
          </p>
        </div>

        ${
          ownersData.owners.length > 0
            ? `<div class="owner-list" ${this.testId('owners-list')}>${ownerRows}</div>`
            : ''
        }

        ${
          !readOnly && editor.mode === 'add'
            ? `<div ${this.testId('owner-add-form-wrap')}>${this.renderOwnerFormInline()}</div>`
            : ''
        }

        ${
          !readOnly && !isShowingForm
            ? `<button
                ${this.testId('owner-add-button')}
                type="button"
                data-action="owner-add"
                class="add-owner-btn"
                ${ownersData.noOwnersAbove25 ? 'disabled' : ''}
              >
                ${this.icon('plus', 'icon-5')}
                <span class="add-owner-title">${
                  ownersData.owners.length > 0 ? 'Add Another Owner' : 'Add Beneficial Owner'
                }</span>
                ${
                  ownersData.owners.length === 0
                    ? '<span class="add-owner-subtitle">Anyone owning 25% or more</span>'
                    : ''
                }
              </button>`
            : ''
        }

        ${
          !readOnly && ownersData.owners.length === 0 && editor.mode !== 'add'
            ? `<label class="no-owner-checkbox-row" ${this.testId('no-owner-checkbox-row')}>
                <input
                  ${this.testId('no-owner-checkbox')}
                  type="checkbox"
                  data-action="no-owners-checkbox"
                  ${ownersData.noOwnersAbove25 ? 'checked' : ''}
                />
                <span ${this.testId('no-owner-checkbox-text')}>No individual owns 25% or more of this business</span>
              </label>`
            : ''
        }
      </div>
    `
  }

  renderVolumeForm(readOnly) {
    const form = this.state.data.volume
    const meta = this.state.ui.volume
    const error = (field) => this.getVisibleError(meta, field)

    return `
      <div class="form-stack" ${this.testId('volume-form')}>
        <p class="help-text" ${this.testId('volume-help-text')}>
          Help us understand your expected payment volume. These are estimates — you won't be held to them.
        </p>

        ${this.renderField({
          form: 'volume',
          field: 'monthlyTransactionCount',
          label: 'Average Monthly Transaction Count',
          required: true,
          error: error('monthlyTransactionCount'),
          controlHTML: this.renderTextInput({
            form: 'volume',
            field: 'monthlyTransactionCount',
            value: form.monthlyTransactionCount,
            placeholder: 'e.g. 50',
            formatter: 'count',
            disabled: readOnly,
            error: !!error('monthlyTransactionCount'),
          }),
        })}

        ${this.renderField({
          form: 'volume',
          field: 'monthlyDollarVolume',
          label: 'Average Monthly Dollar Volume',
          required: true,
          error: error('monthlyDollarVolume'),
          controlHTML: this.renderTextInput({
            form: 'volume',
            field: 'monthlyDollarVolume',
            value: form.monthlyDollarVolume,
            placeholder: 'e.g. $500,000',
            formatter: 'currency',
            disabled: readOnly,
            error: !!error('monthlyDollarVolume'),
          }),
        })}

        ${this.renderField({
          form: 'volume',
          field: 'avgTransactionSize',
          label: 'Average Individual Transaction Size',
          required: true,
          error: error('avgTransactionSize'),
          controlHTML: this.renderTextInput({
            form: 'volume',
            field: 'avgTransactionSize',
            value: form.avgTransactionSize,
            placeholder: 'e.g. $10,000',
            formatter: 'currency',
            disabled: readOnly,
            error: !!error('avgTransactionSize'),
          }),
        })}

        ${
          readOnly
            ? ''
            : `<div class="save-row" ${this.testId('volume-save-row')}>
                ${this.renderSaveButton({
                  form: 'volume',
                  label: 'Save Volume Estimates',
                  isSaving: this.state.ui.volume.isSaving,
                })}
              </div>`
        }
      </div>
    `
  }

  renderBankForm(readOnly) {
    const form = this.state.data.bank
    const meta = this.state.ui.bank
    const error = (field) => this.getVisibleError(meta, field)

    return `
      <div class="form-stack bank-form-stack" ${this.testId('bank-form')}>
        ${
          readOnly
            ? ''
            : `<button
                ${this.testId('plaid-connect-button')}
                type="button"
                class="plaid-connect-btn"
              >
                <div class="plaid-icon-wrap" ${this.testId('plaid-icon-wrap')}>${this.icon('landmark', 'icon-6')}</div>
                <div class="plaid-copy" ${this.testId('plaid-copy')}>
                  <p class="plaid-title" ${this.testId('plaid-title')}>Connect bank via Plaid</p>
                  <p class="plaid-desc" ${this.testId('plaid-desc')}>Secure, instant verification</p>
                </div>
              </button>

              <div class="divider-row" ${this.testId('bank-divider-row')}>
                <div class="divider-line"></div>
                <span class="divider-label">Or enter manually</span>
                <div class="divider-line"></div>
              </div>`
        }

        <div class="form-stack" ${this.testId('bank-manual-fields')}>
          <div class="grid-two" ${this.testId('bank-row-routing-account')}>
            ${this.renderField({
              form: 'bank',
              field: 'routingNumber',
              label: 'Routing Number',
              required: true,
              error: error('routingNumber'),
              controlHTML: this.renderTextInput({
                form: 'bank',
                field: 'routingNumber',
                value: form.routingNumber,
                placeholder: '9 digits',
                formatter: 'routing',
                disabled: readOnly,
                error: !!error('routingNumber'),
              }),
            })}
            ${this.renderField({
              form: 'bank',
              field: 'accountNumber',
              label: 'Account Number',
              required: true,
              error: error('accountNumber'),
              controlHTML: this.renderTextInput({
                form: 'bank',
                field: 'accountNumber',
                value: form.accountNumber,
                placeholder: 'Account number',
                disabled: readOnly,
                error: !!error('accountNumber'),
              }),
            })}
          </div>

          <div class="half-width" ${this.testId('bank-account-type-wrap')}>
            ${this.renderField({
              form: 'bank',
              field: 'accountType',
              label: 'Account Type',
              required: true,
              error: error('accountType'),
              controlHTML: this.renderSelectInput({
                form: 'bank',
                field: 'accountType',
                value: form.accountType,
                placeholder: 'Select account type...',
                options: ACCOUNT_TYPES,
                disabled: readOnly,
                error: !!error('accountType'),
              }),
            })}
          </div>
        </div>

        ${
          readOnly
            ? ''
            : `<div class="save-row" ${this.testId('bank-save-row')}>
                ${this.renderSaveButton({
                  form: 'bank',
                  label: 'Save Bank Account',
                  isSaving: this.state.ui.bank.isSaving,
                })}
              </div>`
        }
      </div>
    `
  }

  renderDocumentsSection(readOnly, statuses, statusMessages) {
    const docsStatus = statuses.docs
    const docsMessage = statusMessages.docs

    if (!readOnly && docsStatus === 'document-requested' && docsMessage) {
      const fileName = this.state.ui.docs.fileName
      const isDragging = this.state.ui.docs.isDragging
      return `
        <div class="form-stack" ${this.testId('documents-upload-ui')}>
          <div class="info-box info-box-warning" ${this.testId('documents-need-box')}>
            <p class="docs-title" ${this.testId('documents-title')}>IRS EIN Letter</p>
            <p class="docs-text" ${this.testId('documents-text')}>
              Requested by Business Profile verification — ${escapeHTML(docsMessage.body)}
            </p>
          </div>

          ${
            fileName
              ? `<div class="file-preview" ${this.testId('documents-file-preview')}>
                  <div class="file-preview-icon" ${this.testId('documents-file-icon')}>${this.icon('file-text', 'icon-5')}</div>
                  <div class="file-preview-copy" ${this.testId('documents-file-copy')}>
                    <p class="file-name" ${this.testId('documents-file-name')}>${escapeHTML(fileName)}</p>
                    <p class="file-status" ${this.testId('documents-file-status')}>Ready to upload</p>
                  </div>
                  <button
                    ${this.testId('documents-file-clear')}
                    type="button"
                    class="icon-btn icon-btn-ghost"
                    data-action="docs-clear-file"
                  >
                    ${this.icon('x', 'icon-4')}
                  </button>
                </div>`
              : `<div
                  class="dropzone ${isDragging ? 'dragging' : ''}"
                  ${this.testId('documents-dropzone')}
                  data-action="docs-open-file"
                  data-dropzone="docs"
                >
                  ${this.icon('upload', 'icon-8')}
                  <p class="dropzone-title" ${this.testId('documents-dropzone-title')}>Drop your file here or click to browse</p>
                  <p class="dropzone-subtitle" ${this.testId('documents-dropzone-subtitle')}>PDF, JPG, or PNG up to 10MB</p>
                  <input
                    ${this.testId('documents-file-input')}
                    id="docs-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="hidden"
                  />
                </div>`
          }

          ${
            fileName
              ? `<button class="btn btn-primary full-width" type="button" ${this.testId('documents-upload-button')}>
                  ${this.icon('upload', 'icon-4')}
                  <span>Upload Document</span>
                </button>`
              : ''
          }
        </div>
      `
    }

    return `
      <div class="documents-empty" ${this.testId('documents-empty')}>
        ${this.icon('file-text', 'icon-8 muted-icon')}
        <p ${this.testId('documents-empty-copy')}>
          ${
            readOnly
              ? 'No additional documents were required for verification.'
              : "No documents needed right now. If auto-verification can't confirm your business info, we'll let you know what to upload here — typically an IRS EIN letter, articles of incorporation, or a tax document."
          }
        </p>
      </div>
    `
  }

  renderSectionContent(sectionKey, readOnly, statuses, statusMessages) {
    if (sectionKey === 'business') return this.renderBusinessForm(readOnly)
    if (sectionKey === 'officer') return this.renderOfficerForm(readOnly)
    if (sectionKey === 'owners') return this.renderOwnersForm(readOnly)
    if (sectionKey === 'volume') return this.renderVolumeForm(readOnly)
    if (sectionKey === 'bank') return this.renderBankForm(readOnly)
    if (sectionKey === 'docs') return this.renderDocumentsSection(readOnly, statuses, statusMessages)
    return ''
  }

  getAccordionRenderHeight(sectionKey, isOpen) {
    const storedHeight = this._accordionHeights[sectionKey]
    if (!Number.isFinite(storedHeight) || storedHeight <= 0) return 0
    if (isOpen || this._lastOpenSection === sectionKey) return Math.round(storedHeight)
    return 0
  }

  cancelAccordionHeightSync() {
    if (this._accordionSyncFrame) {
      cancelAnimationFrame(this._accordionSyncFrame)
      this._accordionSyncFrame = null
    }
  }

  syncAccordionHeights() {
    this.cancelAccordionHeightSync()

    this._accordionSyncFrame = requestAnimationFrame(() => {
      this._accordionSyncFrame = null

      const accordions = this.shadowRoot.querySelectorAll('[data-accordion-section]')
      accordions.forEach((accordion) => {
        if (!(accordion instanceof HTMLElement)) return

        const sectionKey = accordion.dataset.accordionSection
        if (!sectionKey) return

        const inner = accordion.querySelector('.accordion-inner')
        if (!(inner instanceof HTMLElement)) return

        const isOpen = accordion.dataset.open === 'true'
        const nextHeight = isOpen ? Math.ceil(inner.scrollHeight) : 0
        const currentHeight = Math.round(accordion.getBoundingClientRect().height)

        if (currentHeight !== nextHeight) {
          accordion.style.height = `${currentHeight}px`
          void accordion.offsetHeight
        }

        this._accordionHeights[sectionKey] = nextHeight
        accordion.style.height = `${nextHeight}px`
      })
    })
  }

  captureOpenAccordionHeight(sectionKey) {
    if (!sectionKey || !this.shadowRoot) return

    const accordion = this.shadowRoot.querySelector(`[data-accordion-section="${sectionKey}"]`)
    if (!(accordion instanceof HTMLElement)) return

    const inner = accordion.querySelector('.accordion-inner')
    if (!(inner instanceof HTMLElement)) return

    const measuredHeight = Math.ceil(inner.scrollHeight)
    if (!measuredHeight) return

    this._accordionHeights[sectionKey] = measuredHeight
    accordion.style.height = `${measuredHeight}px`
  }

  onWindowResize() {
    if (!this.isOpen || this.state.ui.welcome.isOpen || this.state.activeTab !== 'verification') return
    this.syncAccordionHeights()
  }

  renderStatusMessage(sectionKey, status, message, isExpanded) {
    const isError = status === 'action-required'
    const toneClass = isError ? 'status-message status-message-error' : 'status-message status-message-warning'
    const icon = isError ? 'alert-circle' : 'clock'
    return `
      <div class="${toneClass}" ${this.testId(`status-message-${sectionKey}`)}>
        <div class="status-message-row" ${this.testId(`status-message-row-${sectionKey}`)}>
          ${this.icon(icon, 'icon-4')}
          <div class="status-message-copy" ${this.testId(`status-message-copy-${sectionKey}`)}>
            <p class="status-message-title" ${this.testId(`status-message-title-${sectionKey}`)}>${escapeHTML(message.title)}</p>
            ${isExpanded ? `<p class="status-message-body" ${this.testId(`status-message-body-${sectionKey}`)}>${escapeHTML(message.body)}</p>` : ''}
          </div>
          ${
            !isExpanded && message.actionLabel
              ? `<button
                  ${this.testId(`status-message-action-${sectionKey}`)}
                  type="button"
                  data-action="status-message-action"
                  data-section="${escapeHTML(sectionKey)}"
                  class="status-action-btn ${isError ? 'status-action-error' : 'status-action-warning'}"
                >
                  ${escapeHTML(message.actionLabel)}
                </button>`
              : ''
          }
        </div>
      </div>
    `
  }

  renderSection(section, readOnly, statuses, statusMessages, showMessages) {
    const status = statuses[section.key] || 'not-started'
    const isOpen = this.state.openSection === section.key
    const badge = STATUS_CONFIG[status] || STATUS_CONFIG['not-started']
    const statusMessage = statusMessages[section.key]
    const badgeIcon = badge.icon ? this.icon(badge.icon, 'icon-3') : ''
    const accordionHeight = this.getAccordionRenderHeight(section.key, isOpen)

    return `
      <div class="section-card" ${this.testId(`section-${section.key}`)}>
        <button
          ${this.testId(`section-toggle-${section.key}`)}
          type="button"
          data-action="toggle-section"
          data-section="${escapeHTML(section.key)}"
          class="section-toggle"
        >
          <div class="section-leading-icon" ${this.testId(`section-icon-wrap-${section.key}`)}>
            ${this.icon(section.icon, 'icon-5')}
          </div>
          <div class="section-copy" ${this.testId(`section-copy-${section.key}`)}>
            <div class="section-title" ${this.testId(`section-title-${section.key}`)}>${escapeHTML(section.title)}</div>
            <div class="section-description" ${this.testId(`section-description-${section.key}`)}>${escapeHTML(section.description)}</div>
          </div>
          <span class="${this.badgeClass(badge.tone)}" ${this.testId(`section-badge-${section.key}`)}>
            ${badgeIcon}
            ${escapeHTML(badge.label)}
          </span>
          <span class="chevron ${isOpen ? 'open' : ''}" ${this.testId(`section-chevron-${section.key}`)}>
            ${this.icon('chevron-down', 'icon-5')}
          </span>
        </button>

        ${showMessages && statusMessage ? this.renderStatusMessage(section.key, status, statusMessage, isOpen) : ''}

        <div
          class="accordion-grid"
          data-accordion-section="${escapeHTML(section.key)}"
          data-open="${isOpen ? 'true' : 'false'}"
          aria-hidden="${isOpen ? 'false' : 'true'}"
          style="height: ${accordionHeight}px;"
          ${this.testId(`section-accordion-${section.key}`)}
        >
          <div class="accordion-inner" ${this.testId(`section-accordion-inner-${section.key}`)}>
            <div class="section-content" ${this.testId(`section-content-${section.key}`)}>
              ${this.renderSectionContent(section.key, readOnly, statuses, statusMessages)}
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderVerificationTab(statuses, statusMessages, progress, isComplete) {
    const statusStage = isComplete ? this._verificationStatusStage : 'progress'
    const isVerified = statusStage === 'complete'
    const wrapperTestId = isVerified ? 'verification-complete' : 'verification-incomplete'
    const sectionListTestId = isVerified ? 'verification-complete-sections' : 'verification-sections'

    return `
      <div class="verification-stack" ${this.testId(wrapperTestId)}>
        <div
          class="card progress-card verification-status-card"
          data-status-stage="${escapeHTML(statusStage)}"
          ${this.testId('progress-card')}
        >
          <div class="status-progress-block" ${this.testId('status-progress-block')}>
            <div class="progress-head" ${this.testId('progress-head')}>
              <span class="progress-label" ${this.testId('progress-label')}>Overall Progress</span>
              <span class="progress-value ${isComplete ? 'progress-success' : 'progress-warning'}" ${this.testId('progress-value')}>
                ${escapeHTML(String(progress))}% complete
              </span>
            </div>
            <div class="progress-track" ${this.testId('progress-track')}>
              <div class="progress-fill ${isComplete ? 'progress-success-bg' : 'progress-warning-bg'}" style="width: ${escapeHTML(
        String(progress)
      )}%;" ${this.testId('progress-fill')}></div>
            </div>
            <p class="progress-copy" ${this.testId('progress-copy')}>
              Verification is automatic once all required info is submitted. Most accounts are verified within a minute.
            </p>
          </div>

          ${
            isComplete
              ? `<div class="status-loading-block" ${this.testId('status-loading-block')}>
                  <div class="status-loading-shell" ${this.testId('status-loading-shell')}>
                    <div class="status-loading-badge" ${this.testId('status-loading-badge')}>Final checks</div>
                    <div class="status-loading-main" ${this.testId('status-loading-main')}>
                      <div class="status-loading-icon-wrap" ${this.testId('status-loading-icon-wrap')}>
                        ${this.icon('loader', 'icon-5 status-loading-spinner')}
                      </div>
                      <div class="status-loading-copy" ${this.testId('status-loading-copy')}>
                        <p class="status-loading-title" ${this.testId('status-loading-title')}>Verifying your account</p>
                        <p class="status-loading-body" ${this.testId('status-loading-body')}>
                          Running final verification checks and confirming your banking setup.
                        </p>
                      </div>
                    </div>
                    <div class="status-loading-meter" ${this.testId('status-loading-meter')}>
                      <span class="status-loading-meter-bar" ${this.testId('status-loading-meter-bar')}></span>
                    </div>
                    <div class="status-loading-steps" ${this.testId('status-loading-steps')}>
                      <span class="status-loading-step" ${this.testId('status-loading-step-business')}>Business details</span>
                      <span class="status-loading-step" ${this.testId('status-loading-step-identity')}>Identity</span>
                      <span class="status-loading-step" ${this.testId('status-loading-step-banking')}>Banking setup</span>
                    </div>
                  </div>
                </div>`
              : ''
          }

          ${
            isComplete
              ? `<div class="verified-banner" ${this.testId('verified-banner')}>
                  <div class="verified-icon-wrap" ${this.testId('verified-banner-icon-wrap')}>
                    ${this.icon('check-circle', 'icon-5')}
                  </div>
                  <div class="verified-copy" ${this.testId('verified-banner-copy')}>
                    <p class="verified-title" ${this.testId('verified-title')}>Account Verified</p>
                    <p class="verified-date" ${this.testId('verified-date')}>Verified on Mar 3, 2026</p>
                  </div>
                </div>`
              : ''
          }
        </div>

        <div class="section-list" ${this.testId(sectionListTestId)}>
          ${SECTION_DEFS.map((section) => this.renderSection(section, isVerified, statuses, statusMessages, !isVerified)).join('')}
        </div>
      </div>
    `
  }

  renderBankAccountTab(statuses) {
    const bankStatus = statuses.bank || 'not-started'
    const hasBankConnected = bankStatus !== 'not-started'
    const paymentStatuses = PAYMENT_METHOD_STATUSES[this.state.demoMode]
    const paymentRows = PAYMENT_METHODS.map((method) => {
      const status = paymentStatuses[method.id]
      const badge = METHOD_STATUS_CONFIG[status]
      const dotClass =
        status === 'available' ? 'dot-success' : status === 'pending' ? 'dot-warning' : 'dot-secondary'

      return `
        <div class="method-row" ${this.testId(`method-row-${method.id}`)}>
          <div class="method-main" ${this.testId(`method-main-${method.id}`)}>
            <div class="method-icon" ${this.testId(`method-icon-${method.id}`)}>
              ${this.icon(method.icon, 'icon-4')}
            </div>
            <div class="method-copy" ${this.testId(`method-copy-${method.id}`)}>
              <p class="method-title" ${this.testId(`method-title-${method.id}`)}>${escapeHTML(method.title)}</p>
              <p class="method-desc" ${this.testId(`method-desc-${method.id}`)}>${escapeHTML(method.description)}</p>
            </div>
          </div>
          <span class="${this.badgeClass(badge.tone)}" ${this.testId(`method-badge-${method.id}`)}>
            <span class="status-dot ${dotClass}"></span>
            ${escapeHTML(badge.label)}
          </span>
        </div>
      `
    }).join('')

    return `
      <div class="bank-tab-stack" ${this.testId('bank-tab')}>
        ${
          hasBankConnected
            ? `<div class="connected-card" ${this.testId('bank-connected-card')}>
                <div class="connected-main" ${this.testId('bank-connected-main')}>
                  <div class="connected-icon" ${this.testId('bank-connected-icon')}>${this.icon('landmark', 'icon-5')}</div>
                  <div class="connected-copy" ${this.testId('bank-connected-copy')}>
                    <p class="connected-title" ${this.testId('bank-connected-title')}>Chase Business Checking</p>
                    <p class="connected-meta" ${this.testId('bank-connected-meta')}>••••4892 · Connected via Plaid</p>
                    <p class="connected-date" ${this.testId('bank-connected-date')}>Connected Nov 15, 2025</p>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm" type="button" ${this.testId('bank-change-button')}>Change</button>
              </div>
              <p class="help-text" ${this.testId('bank-connected-help')}>
                Deposits from your working interest owners are sent to this account.
              </p>`
            : `<div class="bank-empty" ${this.testId('bank-empty')}>
                ${this.icon('landmark', 'icon-8 muted-icon')}
                <h3 class="bank-empty-title" ${this.testId('bank-empty-title')}>No bank account connected</h3>
                <p class="bank-empty-copy" ${this.testId('bank-empty-copy')}>
                  Connect a bank account to receive payments from your WIOs
                </p>
                <button class="btn btn-primary btn-sm" type="button" ${this.testId('bank-connect-plaid')}>Connect via Plaid</button>
                <button class="text-link" type="button" ${this.testId('bank-enter-manually')}>Enter manually</button>
              </div>`
        }

        <div class="methods-wrap" ${this.testId('payment-methods-wrap')}>
          <h3 class="methods-label" ${this.testId('payment-methods-label')}>Accepted Payment Methods</h3>
          <div class="methods-list" ${this.testId('payment-methods-list')}>
            ${paymentRows}
          </div>
          <p class="help-text" ${this.testId('payment-methods-help')}>
            ${
              this.state.demoMode === 'new-account'
                ? 'Payment method availability is determined during verification.'
                : 'Payment method availability is determined by your account verification and business type.'
            }
          </p>
        </div>
      </div>
    `
  }

  renderWelcomeModal() {
    const welcome = this.state.ui.welcome
    if (!welcome.isOpen) return ''

    const step = welcome.step === 2 ? 2 : 1
    const selectedMethods = welcome.selectedMethods
    const stepClass = step === 2 ? (welcome.direction > 0 ? 'welcome-step-forward' : 'welcome-step-backward') : ''
    const entryClass = this._welcomeAnimateIn ? 'welcome-animate-in' : ''

    const methodsHTML = PAYMENT_METHODS.map((method) => {
      const isSelected = selectedMethods.includes(method.id)
      return `
        <button
          ${this.testId(`welcome-method-${method.id}`)}
          type="button"
          data-action="welcome-toggle-method"
          data-method-id="${escapeHTML(method.id)}"
          class="welcome-method-card ${isSelected ? 'selected' : ''}"
        >
          ${
            isSelected
              ? `<span class="welcome-selected-check" ${this.testId(`welcome-method-check-${method.id}`)}>${this.icon(
                  'check',
                  'icon-3'
                )}</span>`
              : ''
          }
          <span class="welcome-method-icon-wrap" ${this.testId(`welcome-method-icon-wrap-${method.id}`)}>
            ${this.icon(method.icon, 'icon-4')}
          </span>
          <span class="welcome-method-title" ${this.testId(`welcome-method-title-${method.id}`)}>${escapeHTML(method.title)}</span>
          <span class="welcome-method-desc" ${this.testId(`welcome-method-desc-${method.id}`)}>${escapeHTML(method.description)}</span>
        </button>
      `
    }).join('')

    const stepsHTML = WELCOME_VERIFICATION_STEPS.map((item, index) => {
      return `
        <div class="welcome-checklist-item" ${this.testId(`welcome-checklist-item-${index + 1}`)}>
          <span class="welcome-checklist-number" ${this.testId(`welcome-checklist-number-${index + 1}`)}>
            ${index + 1}
          </span>
          <span class="welcome-checklist-copy" ${this.testId(`welcome-checklist-copy-${index + 1}`)}>
            <span class="welcome-checklist-title" ${this.testId(`welcome-checklist-title-${index + 1}`)}>${escapeHTML(item.title)}</span>
            <span class="welcome-checklist-desc" ${this.testId(`welcome-checklist-desc-${index + 1}`)}>${escapeHTML(item.description)}</span>
          </span>
        </div>
      `
    }).join('')

    return `
      <div class="bo-view welcome-overlay ${entryClass}" data-bo-view="welcome" ${this.testId('welcome-overlay')}>
        <div class="welcome-modal" role="region" aria-label="Accept payments setup" ${this.testId('welcome-modal')}>
          <div class="welcome-logo-row" ${this.testId('welcome-logo-row')}>
            <img src="/bison-logo.svg" alt="Bison" class="welcome-logo" ${this.testId('welcome-logo')} />
          </div>

          ${
            step === 1
              ? `<div class="welcome-step ${stepClass}" ${this.testId('welcome-step-1')}>
                  <h2 class="welcome-title" ${this.testId('welcome-title-step-1')}>Accept payments from your WIOs</h2>
                  <p class="welcome-subtitle" ${this.testId('welcome-subtitle-step-1')}>
                    Select the payment methods you'd like to accept from your WIOs.
                  </p>

                  <p class="welcome-helper" ${this.testId('welcome-helper-step-1')}>Choose one or more</p>

                  <div class="welcome-method-grid" ${this.testId('welcome-method-grid')}>
                    ${methodsHTML}
                  </div>

                  <p class="welcome-footnote" ${this.testId('welcome-footnote-step-1')}>
                    Payment methods are configured during verification.
                  </p>

                  <div class="welcome-actions" ${this.testId('welcome-actions-step-1')}>
                    <button
                      ${this.testId('welcome-continue-button')}
                      type="button"
                      class="btn btn-primary full-width"
                      data-action="welcome-continue"
                      ${selectedMethods.length === 0 ? 'disabled' : ''}
                    >
                      Continue →
                    </button>
                  </div>
                </div>`
              : `<div class="welcome-step ${stepClass}" ${this.testId('welcome-step-2')}>
                  <h2 class="welcome-title" ${this.testId('welcome-title-step-2')}>Get set up in 3 steps</h2>
                  <p class="welcome-subtitle" ${this.testId('welcome-subtitle-step-2')}>
                    Your operator account is ready. Here's what to do next:
                  </p>

                  <div class="welcome-checklist" ${this.testId('welcome-checklist')}>
                    ${stepsHTML}
                  </div>

                  <div class="welcome-actions welcome-actions-gap" ${this.testId('welcome-actions-step-2')}>
                    <button
                      ${this.testId('welcome-start-verification-button')}
                      type="button"
                      class="btn btn-primary full-width"
                      data-action="welcome-start-verification"
                    >
                      Start Verification →
                    </button>
                    <button
                      ${this.testId('welcome-later-button')}
                      type="button"
                      class="welcome-later-btn"
                      data-action="welcome-close"
                    >
                      I'll do this later
                    </button>
                  </div>
                </div>`
          }

          <div class="welcome-dots" ${this.testId('welcome-dots')}>
            <span class="welcome-dot ${step === 1 ? 'active' : ''}" ${this.testId('welcome-dot-1')}></span>
            <span class="welcome-dot ${step === 2 ? 'active' : ''}" ${this.testId('welcome-dot-2')}></span>
          </div>
        </div>
      </div>
    `
  }

  renderStyles() {
    return `
      <style>
        :host {
          --color-primary: #4c7b63;
          --color-primary-light: #e8f0eb;
          --color-headline: #0f2a39;
          --color-secondary: #5f6e78;
          --color-success: #22c55e;
          --color-warning: #f59e0b;
          --color-error: #dd524b;
          --color-sidebar: #fafafa;
          --color-border: #e8e8e8;
          --duration-fast: 150ms;
          --duration-normal: 200ms;
          --duration-slow: 300ms;
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          display: block;
          color: var(--color-secondary);
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        * {
          box-sizing: border-box;
        }

        .trigger-wrap {
          position: relative;
          display: inline-block;
        }

        .trigger-btn {
          border: 0;
          border-radius: 9999px;
          background: var(--color-primary);
          color: #fff;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.75rem 1.25rem;
          min-height: 2.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgb(76 123 99 / 0.28);
          transition: transform var(--duration-fast), background-color var(--duration-normal);
        }

        .trigger-btn:hover {
          background: #3f6c56;
          transform: translateY(-1px);
        }

        .trigger-btn:active {
          transform: translateY(0);
        }

        .trigger-btn:disabled {
          cursor: not-allowed;
          background: #94a3ad;
          box-shadow: none;
          transform: none;
        }

        .trigger-wrap.is-disabled .trigger-btn:hover {
          background: #94a3ad;
          transform: none;
        }

        .trigger-tooltip {
          position: absolute;
          left: 50%;
          top: calc(100% + 8px);
          transform: translateX(-50%);
          background: #0f2a39;
          color: #fff;
          border-radius: 6px;
          padding: 0.35rem 0.5rem;
          font-size: 0.74rem;
          line-height: 1.2;
          white-space: nowrap;
          box-shadow: 0 8px 20px rgb(15 42 57 / 0.24);
          z-index: 2;
        }

        .bo-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          border: 0;
          background: transparent;
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          margin: 0;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bo-overlay[data-state='open'] {
          pointer-events: auto;
        }

        .bo-overlay[data-state='closing'] {
          pointer-events: none;
        }

        .bo-overlay::backdrop {
          background: transparent;
        }

        .bo-backdrop {
          position: absolute;
          inset: 0;
          background: rgb(15 42 57 / 0.45);
          backdrop-filter: blur(4px);
        }

        .bo-modal {
          position: relative;
          width: min(100%, 70rem);
          max-height: 92vh;
          border-radius: 1rem;
          background: #fff;
          border: 1px solid var(--color-border);
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 560ms cubic-bezier(0.16, 1, 0.3, 1), height 560ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bo-modal-welcome {
          width: min(100%, 34rem);
        }

        .bo-modal-setup {
          width: min(100%, 70rem);
        }

        .bo-modal-measure-wrap {
          position: fixed;
          inset: 0;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          visibility: hidden;
          pointer-events: none;
          z-index: -1;
        }

        .bo-modal-measure {
          position: relative;
          max-height: none;
        }

        .bo-modal-transitioning {
          will-change: width, height;
        }

        .bo-modal-transitioning .bo-modal-body-setup {
          overflow: hidden;
        }

        .bo-overlay.bo-overlay-animate-in .bo-backdrop {
          animation: boBackdropIn 280ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .bo-overlay.bo-overlay-animate-in .bo-modal {
          animation: boModalIn 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bo-overlay[data-state='closing'] .bo-backdrop {
          animation: boBackdropOut 240ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .bo-overlay[data-state='closing'] .bo-modal {
          animation: boModalOut 260ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .bo-modal-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-shrink: 0;
          background: #fff;
        }

        .bo-modal-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 1rem;
          font-weight: 600;
          will-change: transform, opacity;
        }

        .bo-modal-title[data-enter='forward'] {
          animation: boTitleInForward 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bo-modal-title[data-exit='forward'] {
          animation: boTitleOutForward 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .bo-close-btn {
          border: 0;
          background: transparent;
          color: var(--color-secondary);
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color var(--duration-normal), background-color var(--duration-normal);
        }

        .bo-close-btn:hover {
          color: var(--color-headline);
          background: var(--color-sidebar);
        }

        .bo-modal-body {
          overflow: auto;
          padding: 1.25rem;
        }

        .bo-modal-body-welcome {
          padding: 0;
          overflow: hidden;
        }

        .bo-modal-body-setup {
          padding: 1.25rem;
          overflow: auto;
        }

        .bo-view {
          position: relative;
        }

        .bo-view:not(.bo-view-setup)[data-enter='forward'] {
          animation: boViewInForward 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bo-view[data-exit='forward'] {
          animation: boViewOutForward 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .bo-view[data-hold='true'] {
          opacity: 0;
        }

        .bo-view-setup[data-enter='forward'] .title,
        .bo-view-setup[data-enter='forward'] .subtitle,
        .bo-view-setup[data-enter='forward'] .demo-toggle,
        .bo-view-setup[data-enter='forward'] .tabs-card {
          opacity: 0;
          will-change: opacity, transform;
          animation: boSetupContentIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bo-view-setup[data-enter='forward'] .title {
          animation-delay: 0ms;
        }

        .bo-view-setup[data-enter='forward'] .subtitle {
          animation-delay: 90ms;
        }

        .bo-view-setup[data-enter='forward'] .demo-toggle,
        .bo-view-setup[data-enter='forward'] .tabs-card {
          animation-delay: 180ms;
        }

        .root {
          max-width: none;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .welcome-overlay {
          width: 100%;
          display: block;
        }

        .welcome-modal {
          position: relative;
          width: 100%;
          border-radius: 0;
          background: #fff;
          box-shadow: none;
          margin-inline: 0;
          padding: 2rem 1.5rem;
        }

        .welcome-overlay.welcome-animate-in .welcome-modal {
          animation: welcomePopIn var(--duration-normal) ease-out;
        }

        .welcome-logo-row {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .welcome-logo {
          height: 2rem;
          width: auto;
        }

        .welcome-step {
          animation-duration: 250ms;
          animation-timing-function: ease-in-out;
          animation-fill-mode: both;
        }

        .welcome-step-forward {
          animation-name: welcomeSlideForward;
        }

        .welcome-step-backward {
          animation-name: welcomeSlideBackward;
        }

        .welcome-title {
          margin: 0;
          text-align: center;
          color: var(--color-headline);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .welcome-subtitle {
          margin: 0.5rem 0 0;
          text-align: center;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .welcome-helper {
          margin: 1rem 0 0;
          text-align: center;
          color: rgb(95 110 120 / 0.7);
          font-size: 0.75rem;
        }

        .welcome-method-grid {
          margin-top: 0.75rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .welcome-method-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: #fff;
          text-align: left;
          padding: 1rem;
          cursor: pointer;
          position: relative;
          transition: border-color var(--duration-normal), background-color var(--duration-normal);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .welcome-method-card.selected {
          border-color: var(--color-primary);
          background: rgb(76 123 99 / 0.05);
        }

        .welcome-selected-check {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 9999px;
          background: var(--color-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .welcome-method-icon-wrap {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 9999px;
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .welcome-method-title {
          color: var(--color-headline);
          font-size: 0.875rem;
          font-weight: 500;
          display: block;
        }

        .welcome-method-desc {
          color: var(--color-secondary);
          font-size: 0.75rem;
          display: block;
          margin-top: 0.125rem;
        }

        .welcome-footnote {
          margin: 1rem 0 0;
          text-align: center;
          color: var(--color-secondary);
          font-size: 0.75rem;
        }

        .welcome-actions {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .welcome-actions-gap {
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .welcome-later-btn {
          border: 0;
          background: transparent;
          color: var(--color-secondary);
          cursor: pointer;
          font-size: 0.875rem;
          transition: color var(--duration-normal);
        }

        .welcome-later-btn:hover {
          color: var(--color-headline);
        }

        .welcome-checklist {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .welcome-checklist-item {
          display: flex;
          gap: 0.75rem;
        }

        .welcome-checklist-number {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 9999px;
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .welcome-checklist-copy {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .welcome-checklist-title {
          color: var(--color-headline);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .welcome-checklist-desc {
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .welcome-dots {
          margin-top: 1.5rem;
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .welcome-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background: var(--color-border);
          transition: background-color var(--duration-normal);
        }

        .welcome-dot.active {
          background: var(--color-primary);
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .title {
          margin: 0;
          color: var(--color-headline);
          font-weight: 600;
          font-size: 1.5rem;
          line-height: 1.25;
        }

        .subtitle {
          margin: 0.25rem 0 0;
          color: var(--color-secondary);
        }

        .demo-toggle {
          display: flex;
          align-items: center;
          background: var(--color-sidebar);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0.25rem;
          flex-shrink: 0;
          gap: 0.125rem;
        }

        .demo-btn {
          border: 0;
          background: transparent;
          color: var(--color-secondary);
          border-radius: 6px;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          transition: color var(--duration-normal), background-color var(--duration-normal), box-shadow var(--duration-normal);
          cursor: pointer;
        }

        .demo-btn:hover {
          color: var(--color-headline);
        }

        .demo-btn.active {
          background: #fff;
          color: var(--color-headline);
          box-shadow: var(--shadow-sm);
        }

        .card {
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .tabs-card {
          overflow: hidden;
        }

        .tabs-desktop {
          border-bottom: 1px solid var(--color-border);
          padding: 0 1.5rem;
          display: none;
        }

        .tabs-desktop-nav {
          display: flex;
          gap: 1.5rem;
          margin-bottom: -1px;
        }

        .tab-btn {
          border: 0;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: var(--color-secondary);
          padding: 1rem 0;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color var(--duration-normal), border-color var(--duration-normal);
        }

        .tab-btn:hover {
          color: var(--color-headline);
          border-color: var(--color-border);
        }

        .tab-btn.active {
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        .tabs-mobile {
          border-bottom: 1px solid var(--color-border);
          padding: 0.75rem 1rem;
          display: block;
        }

        .tab-select {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0.625rem 0.75rem;
          font-size: 1rem;
          color: var(--color-headline);
          background: #fff;
          outline: none;
          transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
        }

        .tab-select:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgb(76 123 99 / 0.2);
        }

        .tab-panel {
          padding: 1.5rem;
        }

        .verification-stack,
        .bank-tab-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .verification-status-card {
          position: relative;
          overflow: hidden;
          padding: 1.5rem;
          border: 1px solid var(--color-border);
          background:
            radial-gradient(circle at top right, rgb(74 222 128 / 0), transparent 46%),
            linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
          transition:
            padding 360ms cubic-bezier(0.22, 1, 0.36, 1),
            background 360ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 360ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 360ms cubic-bezier(0.22, 1, 0.36, 1),
            min-height 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .verification-status-card[data-status-stage="complete"] {
          padding: 1rem;
          border-color: rgb(34 197 94 / 0.28);
          background:
            radial-gradient(circle at top right, rgb(74 222 128 / 0.18), transparent 46%),
            linear-gradient(180deg, rgb(240 253 244 / 0.96) 0%, rgb(236 253 245 / 0.98) 100%);
          box-shadow: 0 18px 36px rgb(34 197 94 / 0.12);
        }

        .verification-status-card[data-status-stage="loading"] {
          border-color: rgb(76 123 99 / 0.22);
          background:
            radial-gradient(circle at top right, rgb(76 123 99 / 0.12), transparent 44%),
            linear-gradient(180deg, rgb(248 251 249 / 0.98) 0%, rgb(242 248 244 / 0.98) 100%);
          box-shadow: 0 16px 32px rgb(15 42 57 / 0.08);
        }

        .status-progress-block,
        .status-loading-block {
          position: relative;
          z-index: 1;
          transition:
            opacity 240ms ease,
            transform 240ms ease,
            max-height 280ms ease,
            margin 280ms ease;
            max-height: 8rem;
        }

        .status-loading-block {
          display: block;
          max-height: 0;
          opacity: 0;
          transform: translateY(10px) scale(0.98);
          overflow: hidden;
          pointer-events: none;
        }

        .verification-status-card[data-status-stage="complete"] .status-progress-block {
          opacity: 0;
          transform: translateY(-10px);
          max-height: 0;
          margin: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .verification-status-card[data-status-stage="loading"] .status-progress-block {
          opacity: 0;
          transform: translateY(-10px);
          max-height: 0;
          margin: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .verification-status-card[data-status-stage="loading"] .status-loading-block {
          max-height: 12rem;
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .status-loading-shell {
          border: 1px solid rgb(76 123 99 / 0.14);
          border-radius: 0.875rem;
          background:
            radial-gradient(circle at top right, rgb(76 123 99 / 0.1), transparent 42%),
            linear-gradient(180deg, rgb(255 255 255 / 0.96) 0%, rgb(245 249 246 / 0.98) 100%);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .status-loading-badge {
          align-self: flex-start;
          border-radius: 9999px;
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.3rem 0.55rem;
          text-transform: uppercase;
        }

        .status-loading-main {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .status-loading-icon-wrap {
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.92), rgb(230 240 233 / 0.9)),
            rgb(76 123 99 / 0.08);
          color: var(--color-primary);
          flex-shrink: 0;
          box-shadow:
            inset 0 1px 0 rgb(255 255 255 / 0.75),
            0 8px 18px rgb(76 123 99 / 0.14);
        }

        .status-loading-spinner {
          display: block;
          animation: spin 900ms linear infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .status-loading-copy {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-loading-title {
          margin: 0;
          color: var(--color-headline);
          font-weight: 600;
        }

        .status-loading-body {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .status-loading-meter {
          height: 0.4rem;
          border-radius: 9999px;
          overflow: hidden;
          background: rgb(76 123 99 / 0.12);
        }

        .status-loading-meter-bar {
          display: block;
          width: 42%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, rgb(76 123 99 / 0.18), rgb(76 123 99 / 0.82), rgb(153 211 172 / 0.62));
          background-size: 180% 100%;
          animation: statusLoadingSweep 1.2s ease-in-out infinite;
        }

        .status-loading-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .status-loading-step {
          border-radius: 9999px;
          background: rgb(255 255 255 / 0.9);
          border: 1px solid rgb(76 123 99 / 0.14);
          color: var(--color-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.6rem;
          animation: statusLoadingPulse 1.4s ease-in-out infinite;
        }

        .status-loading-step:nth-child(2) {
          animation-delay: 0.18s;
        }

        .status-loading-step:nth-child(3) {
          animation-delay: 0.36s;
        }

        .verified-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          padding: 0;
          border: 0;
          background: transparent;
          opacity: 0;
          transform: translateY(16px) scale(0.98);
          max-height: 0;
          overflow: hidden;
          transition:
            max-height 320ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .verification-status-card[data-status-stage="complete"] .verified-banner {
          max-height: 5rem;
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .verified-icon-wrap {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(34 197 94 / 0.1);
          color: var(--color-success);
          flex-shrink: 0;
          transform: scale(0.84) rotate(-8deg);
          transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .verification-status-card[data-status-stage="complete"] .verified-icon-wrap {
          transform: scale(1) rotate(0deg);
        }

        .verified-copy {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .verified-title {
          margin: 0;
          color: var(--color-headline);
          font-weight: 600;
        }

        .verified-date {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .progress-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .progress-label {
          color: var(--color-headline);
          font-weight: 600;
        }

        .progress-value {
          font-weight: 500;
        }

        .progress-warning {
          color: var(--color-warning);
        }

        .progress-success {
          color: var(--color-success);
        }

        .progress-track {
          height: 0.5rem;
          border-radius: 9999px;
          overflow: hidden;
          background: var(--color-border);
        }

        .progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: width;
        }

        .progress-warning-bg {
          background: var(--color-warning);
        }

        .progress-success-bg {
          background: var(--color-success);
        }

        .progress-copy {
          margin: 0.75rem 0 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .section-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .section-toggle {
          width: 100%;
          border: 0;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
          padding: 1rem;
          cursor: pointer;
          transition: background-color var(--duration-normal);
        }

        .section-toggle:hover {
          background: rgb(250 250 250 / 0.7);
        }

        .section-leading-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--radius-md);
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-copy {
          flex: 1;
          min-width: 0;
        }

        .section-title {
          color: var(--color-headline);
          font-weight: 600;
        }

        .section-description {
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .badge-success {
          background: rgb(34 197 94 / 0.1);
          color: var(--color-success);
        }

        .badge-warning {
          background: rgb(245 158 11 / 0.1);
          color: var(--color-warning);
        }

        .badge-error {
          background: rgb(221 82 75 / 0.1);
          color: var(--color-error);
        }

        .badge-secondary {
          background: rgb(95 110 120 / 0.1);
          color: var(--color-secondary);
        }

        .badge-blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .badge-neutral {
          background: #f3f4f6;
          color: var(--color-secondary);
        }

        .chevron {
          color: var(--color-secondary);
          transition: transform var(--duration-normal);
          flex-shrink: 0;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .status-message {
          border-top: 1px solid var(--color-border);
          border-left-width: 4px;
          border-left-style: solid;
          padding: 0.75rem 1rem;
        }

        .status-message-error {
          background: rgb(221 82 75 / 0.05);
          border-left-color: var(--color-error);
          color: var(--color-error);
        }

        .status-message-warning {
          background: rgb(245 158 11 / 0.05);
          border-left-color: var(--color-warning);
          color: var(--color-warning);
        }

        .status-message-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .status-message-copy {
          flex: 1;
          min-width: 0;
        }

        .status-message-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-message-body {
          margin: 0.25rem 0 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .status-action-btn {
          border: 0;
          border-radius: var(--radius-md);
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color var(--duration-normal);
          flex-shrink: 0;
        }

        .status-action-error {
          background: rgb(221 82 75 / 0.1);
          color: var(--color-error);
        }

        .status-action-error:hover {
          background: rgb(221 82 75 / 0.2);
        }

        .status-action-warning {
          background: rgb(245 158 11 / 0.1);
          color: var(--color-warning);
        }

        .status-action-warning:hover {
          background: rgb(245 158 11 / 0.2);
        }

        .accordion-grid {
          height: 0;
          overflow: hidden;
          overflow-anchor: none;
          will-change: height;
          transition: height 360ms cubic-bezier(0.32, 0.72, 0, 1);
        }

        .accordion-grid[data-open='false'] {
          pointer-events: none;
        }

        .accordion-inner {
          overflow: hidden;
        }

        .section-content {
          border-top: 1px solid var(--color-border);
          padding: 1rem;
        }

        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field-label {
          display: block;
          margin-bottom: 0.375rem;
          color: var(--color-headline);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .required {
          color: var(--color-error);
          margin-left: 2px;
        }

        .input,
        .select {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--color-headline);
          background: #fff;
          transition: border-color var(--duration-normal), box-shadow var(--duration-normal), background-color var(--duration-normal);
          outline: none;
        }

        .select {
          padding-right: 2.25rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }

        .select.placeholder,
        .input::placeholder {
          color: rgb(95 110 120 / 0.6);
        }

        .input:focus,
        .select:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgb(76 123 99 / 0.2);
        }

        .input-error {
          border-color: var(--color-error);
        }

        .input:disabled,
        .select:disabled {
          background: var(--color-sidebar);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .field-error {
          margin: 0.25rem 0 0;
          color: var(--color-error);
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .password-wrap {
          position: relative;
        }

        .password-input {
          padding-right: 2.75rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: color var(--duration-normal);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.125rem;
        }

        .password-toggle:hover {
          color: #6b7280;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .info-box {
          border-radius: var(--radius-md);
          border: 1px solid;
          padding: 1rem;
          font-size: 0.875rem;
        }

        .info-box p {
          margin: 0;
          color: var(--color-secondary);
        }

        .info-box-primary {
          background: rgb(76 123 99 / 0.05);
          border-color: rgb(76 123 99 / 0.1);
        }

        .info-box-blue {
          background: #eff6ff;
          border-color: #dbeafe;
        }

        .info-box-blue p {
          color: #1d4ed8;
          font-size: 0.75rem;
        }

        .info-box-warning {
          background: rgb(245 158 11 / 0.05);
          border-color: rgb(245 158 11 / 0.2);
        }

        .icon-box {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .save-row {
          display: flex;
          justify-content: flex-end;
          padding-top: 0.5rem;
        }

        .btn {
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.625rem 1rem;
          cursor: pointer;
          transition: background-color var(--duration-normal), color var(--duration-normal), border-color var(--duration-normal);
          outline: none;
        }

        .btn:focus {
          box-shadow: 0 0 0 3px rgb(76 123 99 / 0.2);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
        }

        .btn-primary:hover:not(:disabled) {
          background: rgb(76 123 99 / 0.9);
        }

        .btn-ghost {
          background: #fff;
          color: var(--color-headline);
          border-color: var(--color-border);
        }

        .btn-ghost:hover:not(:disabled) {
          background: var(--color-sidebar);
        }

        .btn-sm {
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
        }

        .full-width {
          width: 100%;
        }

        .inline-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 0.5rem;
        }

        .owner-inline-form {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .owner-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .owner-card {
          background: var(--color-sidebar);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .owner-card-info {
          flex: 1;
          min-width: 0;
        }

        .owner-name {
          margin: 0;
          color: var(--color-headline);
          font-weight: 500;
        }

        .owner-meta {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .owner-card-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .icon-btn {
          border: 0;
          background: transparent;
          border-radius: var(--radius-md);
          padding: 0.5rem;
          cursor: pointer;
          transition: background-color var(--duration-normal), color var(--duration-normal);
          color: var(--color-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn-primary:hover {
          color: var(--color-primary);
          background: rgb(76 123 99 / 0.05);
        }

        .icon-btn-error:hover {
          color: var(--color-error);
          background: rgb(221 82 75 / 0.05);
        }

        .icon-btn-ghost:hover {
          background: #fff;
          color: var(--color-headline);
        }

        .add-owner-btn {
          width: 100%;
          border: 2px dashed var(--color-border);
          background: transparent;
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          color: var(--color-secondary);
          cursor: pointer;
          transition: color var(--duration-normal), border-color var(--duration-normal), background-color var(--duration-normal);
        }

        .add-owner-btn:hover:not(:disabled) {
          border-color: rgb(76 123 99 / 0.3);
          color: var(--color-primary);
          background: rgb(76 123 99 / 0.05);
        }

        .add-owner-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-owner-title {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .add-owner-subtitle {
          font-size: 0.75rem;
        }

        .no-owner-checkbox-row {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          transition: background-color var(--duration-normal);
        }

        .no-owner-checkbox-row:hover {
          background: rgb(250 250 250 / 0.6);
        }

        .no-owner-checkbox-row input[type="checkbox"] {
          appearance: none;
          width: 1rem;
          height: 1rem;
          margin-top: 0.125rem;
          border: 1.5px solid var(--color-border);
          border-radius: 4px;
          background: #fff;
          flex-shrink: 0;
          background-repeat: no-repeat;
          background-position: center;
        }

        .no-owner-checkbox-row input[type="checkbox"]:checked {
          border-color: var(--color-primary);
          background-color: var(--color-primary);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
          background-size: 12px;
        }

        .no-owner-checkbox-row span {
          color: var(--color-secondary);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .help-text {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .bank-form-stack {
          gap: 1.5rem;
        }

        .plaid-connect-btn {
          width: 100%;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          background: transparent;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: border-color var(--duration-normal), background-color var(--duration-normal);
        }

        .plaid-connect-btn:hover {
          border-color: rgb(76 123 99 / 0.4);
          background: rgb(76 123 99 / 0.05);
        }

        .plaid-icon-wrap {
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
        }

        .plaid-copy {
          text-align: center;
        }

        .plaid-title {
          margin: 0;
          color: var(--color-headline);
          font-weight: 600;
        }

        .plaid-desc {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: var(--color-secondary);
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .divider-line {
          height: 1px;
          flex: 1;
          background: var(--color-border);
        }

        .divider-label {
          color: var(--color-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .half-width {
          width: 100%;
        }

        .documents-empty {
          background: var(--color-sidebar);
          border-radius: var(--radius-md);
          padding: 2rem;
          text-align: center;
        }

        .documents-empty p {
          margin: 0;
          max-width: 36rem;
          margin-inline: auto;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .docs-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .docs-text {
          margin: 0.25rem 0 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .dropzone {
          border: 2px dashed var(--color-border);
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: border-color var(--duration-normal), background-color var(--duration-normal);
        }

        .dropzone:hover,
        .dropzone.dragging {
          border-color: var(--color-primary);
          background: rgb(76 123 99 / 0.05);
        }

        .dropzone-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .dropzone-subtitle {
          margin: 0.25rem 0 0;
          color: var(--color-secondary);
          font-size: 0.75rem;
        }

        .file-preview {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          background: var(--color-sidebar);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .file-preview-icon {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: var(--radius-md);
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .file-preview-copy {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          margin: 0;
          color: var(--color-headline);
          font-weight: 500;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-status {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.75rem;
        }

        .connected-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .connected-main {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .connected-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(34 197 94 / 0.1);
          color: var(--color-success);
          flex-shrink: 0;
        }

        .connected-copy {
          min-width: 0;
        }

        .connected-title {
          margin: 0;
          color: var(--color-headline);
          font-weight: 500;
        }

        .connected-meta {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .connected-date {
          margin: 0.125rem 0 0;
          color: var(--color-secondary);
          font-size: 0.75rem;
        }

        .bank-empty {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          padding: 2rem;
          text-align: center;
        }

        .bank-empty-title {
          margin: 0;
          color: var(--color-headline);
          font-weight: 600;
          font-size: 1rem;
        }

        .bank-empty-copy {
          margin: 0.25rem 0 1rem;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .text-link {
          border: 0;
          background: transparent;
          color: var(--color-primary);
          font-size: 0.875rem;
          margin-top: 0.5rem;
          cursor: pointer;
          text-decoration: none;
        }

        .text-link:hover {
          text-decoration: underline;
        }

        .methods-wrap {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .methods-label {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .methods-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .method-row {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .method-main {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .method-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .method-copy {
          min-width: 0;
        }

        .method-title {
          margin: 0;
          color: var(--color-headline);
          font-weight: 500;
        }

        .method-desc {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
        }

        .status-dot {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 9999px;
          display: inline-block;
        }

        .dot-success {
          background: var(--color-success);
        }

        .dot-warning {
          background: var(--color-warning);
        }

        .dot-secondary {
          background: rgb(95 110 120 / 0.5);
        }

        .icon {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }

        .icon-3 {
          width: 0.75rem;
          height: 0.75rem;
        }

        .icon-4 {
          width: 1rem;
          height: 1rem;
        }

        .icon-5 {
          width: 1.25rem;
          height: 1.25rem;
        }

        .icon-6 {
          width: 1.5rem;
          height: 1.5rem;
        }

        .icon-8 {
          width: 2rem;
          height: 2rem;
          margin-inline: auto;
          margin-bottom: 0.75rem;
        }

        .muted-icon {
          color: rgb(95 110 120 / 0.4);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        .hidden {
          display: none;
        }

        @keyframes welcomeFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes welcomePopIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes welcomeSlideForward {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes welcomeSlideBackward {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes boViewInForward {
          from {
            opacity: 0;
            transform: translateX(28px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes boViewOutForward {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(-24px) scale(0.98);
          }
        }

        @keyframes boTitleInForward {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes boTitleOutForward {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-18px);
          }
        }

        @keyframes boSetupContentIn {
          from {
            opacity: 0;
            transform: translateX(22px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes statusLoadingSweep {
          0% {
            transform: translateX(-18%);
            background-position: 100% 50%;
          }
          50% {
            transform: translateX(28%);
            background-position: 0% 50%;
          }
          100% {
            transform: translateX(-18%);
            background-position: 100% 50%;
          }
        }

        @keyframes statusLoadingPulse {
          0%,
          100% {
            transform: translateY(0);
            border-color: rgb(76 123 99 / 0.14);
            color: var(--color-secondary);
          }
          50% {
            transform: translateY(-1px);
            border-color: rgb(76 123 99 / 0.28);
            color: var(--color-headline);
          }
        }

        @keyframes boBackdropIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes boBackdropOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes boModalIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes boModalOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
        }

        .grid-two,
        .grid-city-state {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }

        @media (min-width: 640px) {
          .tabs-mobile {
            display: none;
          }

          .tabs-desktop {
            display: block;
          }

          .grid-two {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .grid-city-state {
            grid-template-columns: 1fr 1fr auto;
          }

          .half-width {
            width: 50%;
          }
        }

        @media (max-width: 639px) {
          .trigger-wrap {
            width: 100%;
          }

          .trigger-btn {
            width: 100%;
            justify-content: center;
          }

          .bo-overlay {
            padding: 0.5rem;
          }

          .bo-modal {
            max-height: 95vh;
            border-radius: 0.75rem;
          }

          .bo-modal-body-setup {
            padding: 1rem;
          }

          .welcome-modal {
            padding: 1.5rem 1rem;
            margin-inline: 0;
          }

          .welcome-method-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.5rem;
          }

          .welcome-method-card {
            padding: 0.75rem;
          }

          .header {
            flex-direction: column;
          }

          .demo-toggle {
            width: 100%;
            overflow: auto;
          }

          .demo-btn {
            white-space: nowrap;
          }

          .tab-panel {
            padding: 1rem;
          }

          .method-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .connected-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .status-loading-main {
            align-items: flex-start;
          }

          .status-loading-shell {
            padding: 0.875rem;
          }
        }
      </style>
    `
  }

  animateProgressBar(progress) {
    const fill = this.shadowRoot.querySelector('[data-testid="progress-fill"]')
    if (!(fill instanceof HTMLElement)) {
      this._lastRenderedProgress = progress
      return
    }

    const from = typeof this._lastRenderedProgress === 'number' ? this._lastRenderedProgress : progress
    fill.style.width = `${from}%`
    void fill.offsetWidth

    if (this._progressAnimationFrame) {
      cancelAnimationFrame(this._progressAnimationFrame)
    }

    this._progressAnimationFrame = requestAnimationFrame(() => {
      fill.style.width = `${progress}%`
      this._progressAnimationFrame = null
    })

    this._lastRenderedProgress = progress
  }

  clearVerificationStatusTimers() {
    if (this._verificationLoadingTimer) {
      clearTimeout(this._verificationLoadingTimer)
      this._timers.delete(this._verificationLoadingTimer)
      this._verificationLoadingTimer = null
    }

    if (!this._verificationCompletionTimer) return
    clearTimeout(this._verificationCompletionTimer)
    this._timers.delete(this._verificationCompletionTimer)
    this._verificationCompletionTimer = null
  }

  syncVerificationStatusStage(progress, activeTab) {
    if (progress < 100) {
      this.clearVerificationStatusTimers()
      this._verificationStatusStage = 'progress'
      return
    }

    if (activeTab !== 'verification') {
      this.clearVerificationStatusTimers()
      this._verificationStatusStage = 'complete'
      return
    }

    if (this._verificationStatusStage === 'loading' || this._verificationStatusStage === 'complete') return
    if (this._verificationLoadingTimer || this._verificationCompletionTimer) return

    const canAnimate =
      this._verificationStatusStage !== 'complete' &&
      typeof this._lastRenderedProgress === 'number' &&
      this._lastRenderedProgress < 100

    if (!canAnimate) {
      this.clearVerificationStatusTimers()
      this._verificationStatusStage = 'complete'
      return
    }

    this._verificationStatusStage = 'progress'

    const loadingTimer = setTimeout(() => {
      this._timers.delete(loadingTimer)
      this._verificationLoadingTimer = null

      if (this.getVerificationProgress() < 100) {
        this._verificationStatusStage = 'progress'
        this.render()
        return
      }

      this._verificationStatusStage = 'loading'
      this.render()

      const completionTimer = setTimeout(() => {
        this._timers.delete(completionTimer)
        this._verificationCompletionTimer = null

        if (this.getVerificationProgress() < 100) {
          this._verificationStatusStage = 'progress'
          this.render()
          return
        }

        this._verificationStatusStage = 'complete'
        this.render()
      }, 2000)

      this._verificationCompletionTimer = completionTimer
      this._timers.add(completionTimer)
    }, 460)

    this._verificationLoadingTimer = loadingTimer
    this._timers.add(loadingTimer)
  }

  render() {
    const triggerDisabledReason = this._getTriggerDisabledReason()
    const isTriggerDisabled = Boolean(triggerDisabledReason)

    let modalMarkup = ''
    let renderedProgress = null
    let shouldAnimateProgress = false

    if (this.isOpen) {
      const showingWelcome = this.state.ui.welcome.isOpen
      const overlayClass = `bo-overlay${this._modalAnimateIn && !this._isClosing ? ' bo-overlay-animate-in' : ''}`
      const overlayState = this._isClosing ? 'closing' : 'open'
      const modalClass = showingWelcome ? 'bo-modal bo-modal-welcome' : 'bo-modal bo-modal-setup'
      const bodyClass = showingWelcome ? 'bo-modal-body bo-modal-body-welcome' : 'bo-modal-body bo-modal-body-setup'
      const modalTitle = showingWelcome ? 'Accept Payments' : 'Operator Banking Setup'
      let modalStyleAttr = ''
      let modalBodyContent = this.renderWelcomeModal()

      if (!showingWelcome) {
        if (!this._setupModalHeight) {
          const targetRect = this.measureSetupModalRect()
          if (targetRect) this._setupModalHeight = targetRect.height
        }

        modalStyleAttr = this.getSetupModalStyleAttr()
        const { statuses, statusMessages, progress, isComplete } = this.getSetupRenderContext()
        this.syncVerificationStatusStage(progress, this.state.activeTab)
        renderedProgress = progress
        shouldAnimateProgress = this.state.activeTab === 'verification' && (!isComplete || this._verificationStatusStage === 'progress')
        modalBodyContent = this.renderSetupModalContent(statuses, statusMessages, progress, isComplete)
      }

      modalMarkup = `
        <dialog class="${overlayClass}" data-state="${overlayState}" ${this.testId('bo-overlay')}>
          <div class="bo-backdrop" ${this.testId('bo-backdrop')} data-action="close-modal"></div>
          <div class="${modalClass}" ${modalStyleAttr} ${this.testId('bo-modal')}>
            <div class="bo-modal-header" ${this.testId('bo-modal-header')}>
              <p class="bo-modal-title" ${this.testId('bo-modal-title')}>${escapeHTML(modalTitle)}</p>
              <button
                ${this.testId('bo-modal-close')}
                class="bo-close-btn"
                type="button"
                data-action="close-modal"
                aria-label="Close onboarding modal"
              >
                ${this.icon('x', 'icon-5')}
              </button>
            </div>
            <div class="${bodyClass}" ${this.testId('bo-modal-body')}>
              ${modalBodyContent}
            </div>
          </div>
        </dialog>
      `
    }

    this.shadowRoot.innerHTML = `
      ${this.renderStyles()}
      <div class="trigger-wrap ${isTriggerDisabled ? 'is-disabled' : ''}" ${this.testId('onboarding-trigger-wrap')}>
        <button
          ${this.testId('onboarding-trigger-button')}
          class="trigger-btn"
          type="button"
          data-action="open-modal"
          ${isTriggerDisabled ? 'disabled aria-disabled="true"' : ''}
        >
          ${this.icon('landmark', 'icon-4')}
          <span>Open Operator Onboarding</span>
        </button>
        ${isTriggerDisabled ? `<span class="trigger-tooltip">${escapeHTML(triggerDisabledReason)}</span>` : ''}
      </div>
      ${modalMarkup}
    `

    if (this.isOpen && this.state.ui.welcome.isOpen) {
      this._welcomeAnimateIn = false
    }

    if (this.isOpen && this._modalAnimateIn && !this._isClosing) {
      this._modalAnimateIn = false
    }

    if (this.isOpen) {
      this.wireModalOverlay()
    }

    if (this.isOpen && !this.state.ui.welcome.isOpen && this.state.activeTab === 'verification') {
      this.syncAccordionHeights()
    } else {
      this.cancelAccordionHeightSync()
    }

    this._lastOpenSection = this.state.openSection

    if (typeof renderedProgress === 'number') {
      if (shouldAnimateProgress) this.animateProgressBar(renderedProgress)
      else this._lastRenderedProgress = renderedProgress
    }
  }
}

if (!customElements.get('bison-operator-onboarding')) {
  customElements.define('bison-operator-onboarding', BisonOperatorOnboarding)
}
