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
    required: true,
  },
]

const STATUS_CONFIG = {
  complete: { label: 'Complete', tone: 'success' },
  'in-progress': { label: 'In Progress', tone: 'warning' },
  'not-started': { label: 'Not Started', tone: 'secondary' },
  'not-required': { label: 'Not Required', tone: 'secondary' },
  submitted: { label: 'Submitted', tone: 'blue' },
  'pending-review': { label: 'Pending Review', tone: 'blue' },
  verified: { label: 'Completed', tone: 'success' },
  'action-required': { label: 'Action Required', tone: 'error', icon: 'alert-circle' },
  'document-requested': { label: 'Document Requested', tone: 'warning' },
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
  'shield-check': 'shield-check',
  check: 'check',
  star: 'star',
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

const INDUSTRY_NAICS_MAP = {
  oil_gas_extraction: '211120',
  crude_petroleum: '211120',
  natural_gas_distribution: '221210',
  other: '999990',
}

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
    dobOnFile: false,
    ssnOnFile: false,
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
    accountHolderName: '',
    accountHolderType: 'business',
    routingNumber: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountType: 'checking',
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
    dobOnFile: false,
    ssnOnFile: false,
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

async function readJsonResponse(response) {
  if (!response || response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch (_error) {
    return null
  }
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
    if (!form.dobOnFile) errors.dob = 'Date of birth is required'
  } else {
    const dobResult = isValidDOB(form.dob)
    if (!dobResult.valid) errors.dob = dobResult.error
  }

  const ssnDigits = form.ssn.replace(/\D/g, '')
  if (!ssnDigits) {
    if (!form.ssnOnFile) errors.ssn = 'SSN is required'
  } else if (ssnDigits.length !== 9) errors.ssn = 'SSN must be 9 digits'

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
    if (!form.dobOnFile) errors.dob = 'Date of birth is required'
  } else {
    const dobResult = isValidDOB(form.dob)
    if (!dobResult.valid) errors.dob = dobResult.error
  }

  const ssnDigits = form.ssn.replace(/\D/g, '')
  if (!ssnDigits) {
    if (!form.ssnOnFile) errors.ssn = 'SSN is required'
  } else if (ssnDigits.length !== 9) errors.ssn = 'SSN must be 9 digits'

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

  if (!String(form.accountHolderName || '').trim()) {
    errors.accountHolderName = 'Account holder name is required'
  }

  const routingDigits = form.routingNumber.replace(/\D/g, '')
  if (!routingDigits) errors.routingNumber = 'Routing number is required'
  else if (routingDigits.length !== 9) errors.routingNumber = 'Routing number must be 9 digits'

  if (!form.accountNumber.trim()) errors.accountNumber = 'Account number is required'
  if (!String(form.confirmAccountNumber || '').trim()) {
    errors.confirmAccountNumber = 'Please confirm the account number'
  } else if (String(form.confirmAccountNumber) !== String(form.accountNumber)) {
    errors.confirmAccountNumber = 'Account numbers do not match'
  }
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
    this._operatorId = null
    this._isPlaidLinkInProgress = false
    this._plaidLinkToken = null
    this._plaidScriptPromise = null
    this._plaidLinkHandler = null
    this._linkedBankAccount = null
    this._operatorBankAccounts = []
    this._bankAccountsPromise = null
    this._isBankAccountsLoading = false
    this._kybStatus = null
    this._kybStatusPromise = null
    this._isStatusLoading = false
    this._isProfileLocked = false
    this._welcomeSaveRequestId = 0
    this._welcomeToastTimer = null
    this._welcomeAdvanceTimer = null
    this._bankDefaultActionSeq = 0
    this._bankToastTimer = null
    this._bankDeleteSeq = 0
    this._controlOfficerRepId = null
    this._officerGovernmentIdProvided = false
    this._prefetchedDocs = null
    this._industriesPromise = null
    this._industryOptions = []
    this._industryCatalog = {}
    this._industryNaicsMap = { ...INDUSTRY_NAICS_MAP }
    this._businessIndustryNaics = ''
    this._isIndustriesLoading = false
    this._industryLoadError = null
    this._fetchedSectionSnapshots = {
      business: null,
      officer: null,
      owners: null,
      volume: null,
    }

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
      this._resetFetchedSectionSnapshots()
      this._embeddableKey = (newVal || '').trim() || null
      if (this._ownsApiInstance && this._api && this._embeddableKey) {
        this._api.embeddableKey = this._embeddableKey
      } else if (!this._ownsApiInstance && this._api) {
        const isSharedGlobal = typeof window !== 'undefined' && this._api === window.__bisonApi
        if (isSharedGlobal) this._api = null
      }
      this._resetIndustryCatalog()
      this._evaluateOperatorAttributes()
      this.render()
      return
    }

    if (name === 'api-base-url') {
      this._resetFetchedSectionSnapshots()
      if (this._ownsApiInstance) this._api = null
      this._resetIndustryCatalog()
      this._evaluateOperatorAttributes()
      this.render()
      return
    }

    if (name === 'op-org-id') {
      this._resetFetchedSectionSnapshots()
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
    this.resetBankDefaultActionState()
    this.resetBankDeleteModalState()
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
    // Built-in fallback: call the Enverus lookup endpoint directly so the
    // component works without importing api.js.
    const embeddableKey = this._getResolvedEmbeddableKey()
    if (embeddableKey) {
      return (opOrgId) => this._fetchOperatorFromEnverusBuiltIn(opOrgId, embeddableKey)
    }
    return null
  }

  async _fetchOperatorFromEnverusBuiltIn(opOrgId, embeddableKey) {
    let baseUrl = (this.getAttribute('api-base-url') || '').trim()
    if (!baseUrl && typeof window !== 'undefined' && window.BISON_JIB_PAY_CONFIG?.apiBaseURL) {
      baseUrl = window.BISON_JIB_PAY_CONFIG.apiBaseURL
    }
    if (!baseUrl) {
      baseUrl = 'https://bison-backend-development-hhgrdbhcbwhahdfk.southeastasia-01.azurewebsites.net'
    }

    const params = new URLSearchParams()
    if (opOrgId) params.append('opOrgId', opOrgId)
    const queryString = params.toString() ? `?${params.toString()}` : ''

    const response = await fetch(`${baseUrl}/api/enverus/operators/lookup${queryString}`, {
      method: 'GET',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw { status: response.status, data }
    }

    return data
  }

  _getResolvedBaseUrl() {
    let baseUrl = (this.getAttribute('api-base-url') || '').trim()
    if (!baseUrl && typeof window !== 'undefined' && window.BISON_JIB_PAY_CONFIG?.apiBaseURL) {
      baseUrl = window.BISON_JIB_PAY_CONFIG.apiBaseURL
    }
    if (!baseUrl) {
      baseUrl = 'https://bison-backend-development-hhgrdbhcbwhahdfk.southeastasia-01.azurewebsites.net'
    }
    return baseUrl
  }

  _resetBankAccountState() {
    this._linkedBankAccount = null
    this._operatorBankAccounts = []
    this._bankAccountsPromise = null
    this._isBankAccountsLoading = false

    if (this.state?.savedAt) this.state.savedAt.bank = null
    if (this.state?.data?.bank) this.state.data.bank.connectedViaPlaid = false
    if (this.state?.ui?.bank) {
      this.state.ui.bank.entryMode = 'choices'
      this.state.ui.bank.saveError = null
    }
    this.resetBankDefaultActionState()
    this.resetBankDeleteModalState()
  }

  _extractOperatorBankAccounts(response) {
    const data = response?.data || response
    return Array.isArray(data) ? data : []
  }

  _extractOperatorBankAccount(response) {
    const data = response?.data || response
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null
  }

  _getBankAccountTypeLabel(accountType) {
    const normalized = String(accountType || '').trim().toLowerCase()
    const match = ACCOUNT_TYPES.find((option) => option.value === normalized)
    if (match) return match.label
    if (!normalized) return 'Bank Account'
    return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
  }

  _getBankAccountMask(accountNumber) {
    const digits = String(accountNumber || '').replace(/\D/g, '')
    if (digits) return digits.slice(-4)

    const trimmed = String(accountNumber || '').trim()
    return trimmed ? trimmed.slice(-4) : ''
  }

  _formatBankAccountConnectedDate(dateValue) {
    if (!dateValue) return ''

    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) return ''

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  _getBankAccountFlag(value) {
    return value === true || value === 'true' || value === 1 || value === '1'
  }

  _getPreferredOperatorBankAccount(accounts) {
    const normalizedAccounts = Array.isArray(accounts) ? accounts : []
    return normalizedAccounts.find((account) => this._getBankAccountFlag(account?.isDefault)) || normalizedAccounts[0] || null
  }

  _getOperatorBankAccountId(account) {
    if (!account || typeof account !== 'object') return ''
    return String(account.id || account.externalId || '').trim()
  }

  _applyOperatorBankAccounts(accounts) {
    this._operatorBankAccounts = Array.isArray(accounts) ? accounts : []

    const preferredAccount = this._getPreferredOperatorBankAccount(this._operatorBankAccounts)
    this._linkedBankAccount = this._mapOperatorBankAccount(preferredAccount)
    this.state.savedAt.bank = preferredAccount ? (preferredAccount.createdAt || new Date().toISOString()) : null
    this.state.data.bank.connectedViaPlaid = Boolean(preferredAccount)
    if (!preferredAccount && this.state?.ui?.bank) {
      this.state.ui.bank.entryMode = 'choices'
    }
  }

  _mapOperatorBankAccount(account) {
    if (!account || typeof account !== 'object') return null

    const accountTypeLabel = this._getBankAccountTypeLabel(account.accountType)
    const accountName = String(account.accountName || '').trim()
    const mask = this._getBankAccountMask(account.accountNumber)

    return {
      id: this._getOperatorBankAccountId(account),
      institutionName: String(account.bankName || '').trim() || 'Bank Account',
      accountName: accountName || accountTypeLabel,
      mask,
      subtype: String(account.accountType || '').trim().toLowerCase() || 'checking',
      connectedAt: this._formatBankAccountConnectedDate(account.createdAt || account.updatedAt),
      isVerified: this._getBankAccountFlag(account.isVerified),
      isDefault: this._getBankAccountFlag(account.isDefault),
    }
  }

  async _fetchOperatorBankAccountsBuiltIn(operatorId) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${operatorId}/bank-accounts`, {
      method: 'GET',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    if (!response.ok) {
      throw { status: response.status, data }
    }

    return data
  }

  _buildOperatorManualBankAccountPayload(manualBankAccountData = {}) {
    if (!manualBankAccountData || typeof manualBankAccountData !== 'object' || Array.isArray(manualBankAccountData)) {
      throw {
        status: 400,
        data: {
          success: false,
          message: 'Manual bank account details are required.',
          errors: ['manualBankAccountData must be an object'],
        },
      }
    }

    const holderName = String(
      manualBankAccountData.holderName ?? manualBankAccountData.accountHolderName ?? ''
    ).trim()
    const holderType = String(
      manualBankAccountData.holderType ?? manualBankAccountData.accountHolderType ?? ''
    ).trim().toLowerCase()
    const routingNumber = String(manualBankAccountData.routingNumber ?? '').replace(/\D/g, '')
    const accountNumber = String(manualBankAccountData.accountNumber ?? '').replace(/\s+/g, '').trim()
    const bankAccountType = String(
      manualBankAccountData.bankAccountType ?? manualBankAccountData.accountType ?? ''
    ).trim().toLowerCase()
    const initiateVerification =
      typeof manualBankAccountData.initiateVerification === 'boolean'
        ? manualBankAccountData.initiateVerification
        : undefined

    const errors = []
    if (!holderName) errors.push('holderName is required')
    if (!routingNumber) errors.push('routingNumber is required')
    else if (!/^\d{9}$/.test(routingNumber)) errors.push('routingNumber must be 9 digits')
    if (!accountNumber) errors.push('accountNumber is required')

    if (errors.length > 0) {
      throw {
        status: 400,
        data: {
          success: false,
          message: 'Manual bank account details are invalid.',
          errors,
        },
      }
    }

    const payload = {
      holderName,
      routingNumber,
      accountNumber,
    }

    if (holderType) payload.holderType = holderType
    if (bankAccountType) payload.bankAccountType = bankAccountType
    if (typeof initiateVerification === 'boolean') payload.initiateVerification = initiateVerification

    return payload
  }

  _buildOptimisticManualBankAccount(manualBankAccountData = {}, createdBankAccount = null) {
    const holderName = String(manualBankAccountData.accountHolderName ?? manualBankAccountData.holderName ?? '').trim()
    const accountNumber = String(
      manualBankAccountData.accountNumber ?? createdBankAccount?.accountNumber ?? ''
    ).replace(/\s+/g, '').trim()
    const accountType = String(
      manualBankAccountData.accountType ?? manualBankAccountData.bankAccountType ?? createdBankAccount?.accountType ?? ''
    ).trim().toLowerCase() || 'checking'
    const now = new Date().toISOString()
    const optimisticAccount = createdBankAccount && typeof createdBankAccount === 'object'
      ? { ...createdBankAccount }
      : {}

    optimisticAccount.bankName = holderName || String(optimisticAccount.bankName || '').trim() || 'Bank Account'
    optimisticAccount.accountName = this._getBankAccountTypeLabel(accountType)
    optimisticAccount.accountNumber = accountNumber
    optimisticAccount.accountType = accountType
    optimisticAccount.createdAt = now
    optimisticAccount.updatedAt = now

    return optimisticAccount
  }

  async _addOperatorManualBankAccountBuiltIn(operatorId, manualBankAccountData) {
    const normalizedOperatorId = String(operatorId || '').trim()
    if (!normalizedOperatorId) {
      throw {
        status: 400,
        data: {
          success: false,
          message: 'Operator ID is required.',
          errors: ['operatorId parameter is missing'],
        },
      }
    }

    const payload = this._buildOperatorManualBankAccountPayload(manualBankAccountData)
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${normalizedOperatorId}/bank-accounts/manual`, {
      method: 'POST',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await readJsonResponse(response)
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  async _setOperatorBankAccountDefaultBuiltIn(operatorId, bankAccountId) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${operatorId}/bank-accounts/${bankAccountId}/set-default`, {
      method: 'PUT',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  async _unlinkOperatorBankAccountBuiltIn(operatorId, bankAccountId) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${operatorId}/bank-accounts/${bankAccountId}`, {
      method: 'DELETE',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
    })

    const data = await readJsonResponse(response)
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  async _listOperatorBankAccounts(operatorId) {
    const api = await this._getApi()
    if (api && typeof api.getOperatorBankAccounts === 'function') {
      const response = await api.getOperatorBankAccounts(operatorId)
      return this._extractOperatorBankAccounts(response)
    }

    const response = await this._fetchOperatorBankAccountsBuiltIn(operatorId)
    return this._extractOperatorBankAccounts(response)
  }

  async _setOperatorBankAccountDefault(operatorId, bankAccountId) {
    return this._setOperatorBankAccountDefaultBuiltIn(operatorId, bankAccountId)
  }

  async _addOperatorManualBankAccount(operatorId, manualBankAccountData) {
    return this._addOperatorManualBankAccountBuiltIn(operatorId, manualBankAccountData)
  }

  async _unlinkOperatorBankAccount(operatorId, bankAccountId) {
    return this._unlinkOperatorBankAccountBuiltIn(operatorId, bankAccountId)
  }

  _getActionErrorMessage(error, fallback) {
    const errors = Array.isArray(error?.data?.errors) ? error.data.errors : []
    const firstError = errors.find((item) => typeof item === 'string' && item.trim())
    if (firstError) return firstError.trim()

    const apiMessage = typeof error?.data?.message === 'string' ? error.data.message.trim() : ''
    if (apiMessage) return apiMessage

    const errorMessage = typeof error?.message === 'string' ? error.message.trim() : ''
    if (errorMessage) return errorMessage

    return fallback
  }

  resetBankDefaultActionState() {
    this._bankDefaultActionSeq += 1
    if (this._bankToastTimer) {
      clearTimeout(this._bankToastTimer)
      this._timers.delete(this._bankToastTimer)
      this._bankToastTimer = null
    }

    if (this.state?.ui?.bank) {
      this.state.ui.bank.pendingDefaultId = ''
      this.state.ui.bank.pendingDefaultPhase = ''
      this.state.ui.bank.actionToast = null
    }
  }

  resetBankDeleteModalState() {
    this._bankDeleteSeq += 1

    if (this.state?.ui?.bank) {
      this.state.ui.bank.removingAccountId = ''
      this.state.ui.bank.deleteModal = {
        isOpen: false,
        bankAccountId: '',
        bankName: '',
        accountLabel: '',
        isSubmitting: false,
        errorMessage: '',
      }
    }
  }

  waitForUiDelay(delay) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this._timers.delete(timer)
        resolve()
      }, delay)
      this._timers.add(timer)
    })
  }

  queueBankActionToastDismiss(requestId, delay = 2400) {
    if (this._bankToastTimer) {
      clearTimeout(this._bankToastTimer)
      this._timers.delete(this._bankToastTimer)
    }

    const timer = setTimeout(() => {
      this._timers.delete(timer)
      if (this._bankToastTimer === timer) this._bankToastTimer = null
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return
      this.state.ui.bank.actionToast = null
      this.render()
    }, delay)

    this._bankToastTimer = timer
    this._timers.add(timer)
  }

  openBankDeleteModal(bankAccountId) {
    const normalizedBankAccountId = String(bankAccountId || '').trim()
    if (!normalizedBankAccountId) return

    const bankUi = this.state.ui.bank
    if (bankUi.pendingDefaultId || bankUi.removingAccountId) return

    const account = this._operatorBankAccounts
      .map((item) => this._mapOperatorBankAccount(item))
      .find((item) => item && item.id === normalizedBankAccountId)

    if (!account) {
      bankUi.actionToast = {
        tone: 'error',
        message: 'We could not find that bank account.',
      }
      this.render()
      this.queueBankActionToastDismiss(this._bankDefaultActionSeq)
      return
    }

    bankUi.deleteModal = {
      isOpen: true,
      bankAccountId: normalizedBankAccountId,
      bankName: account.institutionName,
      accountLabel: `${account.accountName}${account.mask ? ` ••••${account.mask}` : ''}`,
      isSubmitting: false,
      errorMessage: '',
    }
    this.render()
  }

  closeBankDeleteModal(force = false) {
    const deleteModal = this.state?.ui?.bank?.deleteModal
    if (!deleteModal?.isOpen) return
    if (deleteModal.isSubmitting && !force) return

    this.state.ui.bank.deleteModal = {
      isOpen: false,
      bankAccountId: '',
      bankName: '',
      accountLabel: '',
      isSubmitting: false,
      errorMessage: '',
    }
  }

  async confirmUnlinkOperatorBankAccount() {
    const bankUi = this.state.ui.bank
    const deleteModal = bankUi.deleteModal
    if (!deleteModal.isOpen || deleteModal.isSubmitting) return

    const bankAccountId = String(deleteModal.bankAccountId || '').trim()
    if (!this._operatorId || !bankAccountId) {
      deleteModal.errorMessage = 'Operator account not found. Please complete the operator lookup first.'
      this.render()
      return
    }

    this._bankDeleteSeq += 1
    const requestId = this._bankDeleteSeq
    deleteModal.isSubmitting = true
    deleteModal.errorMessage = ''
    this.render()

    try {
      await this._unlinkOperatorBankAccount(this._operatorId, bankAccountId)
      if (requestId !== this._bankDeleteSeq || !this.isConnected || !this._isOpen) return

      this.closeBankDeleteModal(true)
      bankUi.removingAccountId = bankAccountId
      this.render()

      await this.waitForUiDelay(220)
      if (requestId !== this._bankDeleteSeq || !this.isConnected || !this._isOpen) return

      const filteredAccounts = this._operatorBankAccounts.filter(
        (account) => this._getOperatorBankAccountId(account) !== bankAccountId
      )
      this._applyOperatorBankAccounts(filteredAccounts)
      bankUi.removingAccountId = ''
      this.render()

      this._listOperatorBankAccounts(this._operatorId)
        .then((accounts) => {
          if (requestId !== this._bankDeleteSeq || !this.isConnected || !this._isOpen) return
          this._applyOperatorBankAccounts(accounts)
          this.render()
        })
        .catch(() => {
          // Keep optimistic removal if refresh fails.
        })
    } catch (error) {
      if (requestId !== this._bankDeleteSeq || !this.isConnected || !this._isOpen) return

      deleteModal.isSubmitting = false
      deleteModal.errorMessage = this._getActionErrorMessage(error, 'We could not unlink this bank account.')
      this.render()
    }
  }

  async setDefaultOperatorBankAccount(bankAccountId) {
    const normalizedBankAccountId = String(bankAccountId || '').trim()
    const bankUi = this.state.ui.bank
    if (!normalizedBankAccountId) return
    if (bankUi.pendingDefaultId) return

    const targetAccount = Array.isArray(this._operatorBankAccounts)
      ? this._operatorBankAccounts.find((account) => this._getOperatorBankAccountId(account) === normalizedBankAccountId)
      : null

    if (!targetAccount) {
      bankUi.actionToast = {
        tone: 'error',
        message: 'We could not find that bank account.',
      }
      this.render()
      this.queueBankActionToastDismiss(this._bankDefaultActionSeq)
      return
    }

    if (!this._getBankAccountFlag(targetAccount.isVerified)) {
      bankUi.actionToast = {
        tone: 'error',
        message: 'Only verified bank accounts can be set as default.',
      }
      this.render()
      this.queueBankActionToastDismiss(this._bankDefaultActionSeq)
      return
    }

    this._bankDefaultActionSeq += 1
    const requestId = this._bankDefaultActionSeq
    bankUi.pendingDefaultId = normalizedBankAccountId
    bankUi.pendingDefaultPhase = 'actions-out'
    bankUi.actionToast = null
    this.render()

    try {
      await this.waitForUiDelay(160)
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      bankUi.pendingDefaultPhase = 'spinner-in'
      this.render()

      const requestPromise = this._operatorId && normalizedBankAccountId
        ? this._setOperatorBankAccountDefault(this._operatorId, normalizedBankAccountId)
        : Promise.reject({
            message: 'Operator account not found. Please complete the operator lookup first.',
          })

      await this.waitForUiDelay(160)
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      bankUi.pendingDefaultPhase = 'spinner'
      this.render()

      await requestPromise
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      bankUi.pendingDefaultPhase = 'spinner-out-success'
      this.render()

      await this.waitForUiDelay(160)
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      const optimisticAccounts = this._operatorBankAccounts.map((account) => ({
        ...account,
        isDefault: this._getOperatorBankAccountId(account) === normalizedBankAccountId,
      }))
      this._applyOperatorBankAccounts(optimisticAccounts)
      bankUi.pendingDefaultPhase = 'default-in'
      this.render()

      this._listOperatorBankAccounts(this._operatorId)
        .then((accounts) => {
          if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return
          this._applyOperatorBankAccounts(accounts)
          this.render()
        })
        .catch(() => {
          // Keep the optimistic default selection if the refresh request fails.
        })

      await this.waitForUiDelay(180)
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      bankUi.pendingDefaultId = ''
      bankUi.pendingDefaultPhase = ''
      this.render()
    } catch (error) {
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      bankUi.pendingDefaultPhase = 'spinner-out-fail'
      this.render()

      await this.waitForUiDelay(160)
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      bankUi.pendingDefaultPhase = 'actions-in'
      bankUi.actionToast = {
        tone: 'error',
        message: this._getActionErrorMessage(error, 'We could not set this bank account as default.'),
      }
      this.render()
      this.queueBankActionToastDismiss(requestId)

      await this.waitForUiDelay(180)
      if (requestId !== this._bankDefaultActionSeq || !this.isConnected || !this._isOpen) return

      bankUi.pendingDefaultId = ''
      bankUi.pendingDefaultPhase = ''
      this.render()
    }
  }

  async _fetchOperatorBankAccounts(force = false) {
    if (!this._operatorId) {
      this._resetBankAccountState()
      this.render()
      return []
    }

    if (this._bankAccountsPromise && !force) return this._bankAccountsPromise

    const operatorId = this._operatorId
    let requestPromise = null
    requestPromise = (async () => {
      this._isBankAccountsLoading = true
      this.render()

      try {
        const accounts = await this._listOperatorBankAccounts(operatorId)
        if (operatorId !== this._operatorId) return this._operatorBankAccounts

        this._applyOperatorBankAccounts(accounts)

        return this._operatorBankAccounts
      } catch (_err) {
        return this._operatorBankAccounts
      } finally {
        if (operatorId !== this._operatorId) return
        this._isBankAccountsLoading = false
        if (this._bankAccountsPromise === requestPromise) this._bankAccountsPromise = null
        this.render()
      }
    })()

    this._bankAccountsPromise = requestPromise
    return requestPromise
  }

  async _plaidApiRequest(path, body) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  async _kybGet(path) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${this._operatorId}/kyb/${path}`, {
      method: 'GET',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  async _kybPost(path, body) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${this._operatorId}/kyb/${path}`, {
      method: 'POST',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  async _kybPostFormData(path, formData) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${this._operatorId}/kyb/${path}`, {
      method: 'POST',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        // No Content-Type — browser sets multipart boundary automatically
      },
      body: formData,
    })
    const data = await response.json()
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  async _fetchIndustriesBuiltIn() {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/kyb/industries`, {
      method: 'GET',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  _resetIndustryCatalog() {
    this._industriesPromise = null
    this._industryOptions = []
    this._industryCatalog = {}
    this._industryNaicsMap = { ...INDUSTRY_NAICS_MAP }
    this._isIndustriesLoading = false
    this._industryLoadError = null
  }

  _getIndustryOptions() {
    return Array.isArray(this._industryOptions) ? this._industryOptions : []
  }

  _getSelectedIndustryDetails(industryValue = this.state?.data?.business?.industry) {
    const value = String(industryValue || '').trim()
    if (!value) return null
    return this._industryCatalog?.[value] || null
  }

  _getSelectedIndustryNaics(industryValue = this.state?.data?.business?.industry) {
    const value = String(industryValue || '').trim()
    if (!value) return String(this._businessIndustryNaics || '').trim()

    const details = this._getSelectedIndustryDetails(value)
    if (details?.naics) return String(details.naics).trim()

    const apiNaics = this._industryNaicsMap?.[value]
    if (apiNaics) return String(apiNaics).trim()

    const fallbackNaics = INDUSTRY_NAICS_MAP[value]
    if (fallbackNaics) return String(fallbackNaics).trim()

    return String(this._businessIndustryNaics || '').trim()
  }

  _getIndustryValueByNaics(naics) {
    const target = String(naics || '').trim()
    if (!target) return ''

    const currentMatch = Object.entries(this._industryNaicsMap || {}).find(
      ([, value]) => String(value || '').trim() === target
    )
    if (currentMatch) return currentMatch[0]

    const fallbackMatch = Object.entries(INDUSTRY_NAICS_MAP).find(
      ([, value]) => String(value || '').trim() === target
    )
    return fallbackMatch ? fallbackMatch[0] : ''
  }

  _syncBusinessIndustrySelection() {
    const currentValue = String(this.state?.data?.business?.industry || '').trim()
    const hasCurrentOption = this._getIndustryOptions().some((option) => option.value === currentValue)
    if (currentValue && hasCurrentOption) return false

    const targetNaics = currentValue
      ? this._getSelectedIndustryNaics(currentValue)
      : this._businessIndustryNaics
    const mappedValue = this._getIndustryValueByNaics(targetNaics)
    if (!mappedValue || mappedValue === currentValue) return false

    this.state.data.business.industry = mappedValue
    return true
  }

  _normalizeIndustryOption(industry) {
    const label = String(industry?.title || industry?.name || '').trim()
    const naics = String(industry?.naics || '').trim()
    const mcc = String(industry?.mcc || '').trim()
    const sic = String(industry?.sic || '').trim()
    const value = String(industry?.name || '').trim()

    if (!label || !value) return null
    return { value, label, naics, mcc, sic }
  }

  async _ensureIndustriesLoaded(force = false) {
    const embeddableKey = this._getResolvedEmbeddableKey()
    if (!embeddableKey) return null
    if (this._industriesPromise && !force) return this._industriesPromise

    let loadPromise = null
    loadPromise = (async () => {
      this._isIndustriesLoading = true
      this._industryLoadError = null
      this.render()
      try {
        const response = await this._fetchIndustriesBuiltIn()
        const payload = response || {}
        if (payload?.success === false || !payload?.data) {
          this._industryLoadError = payload?.message || 'Unable to load industries.'
          return null
        }

        const catalog = payload.data
        if (catalog?.success === false) {
          this._industryLoadError = catalog?.errorMessage || 'Unable to load industries.'
          return null
        }

        const normalizedIndustries = (Array.isArray(catalog?.industries) ? catalog.industries : [])
          .map((industry) => this._normalizeIndustryOption(industry))
          .filter(Boolean)

        if (!normalizedIndustries.length) {
          this._industryLoadError = 'No industries were returned.'
          return null
        }

        this._industryOptions = normalizedIndustries.map(({ value, label }) => ({ value, label }))
        this._industryCatalog = normalizedIndustries.reduce((map, industry) => {
          map[industry.value] = industry
          return map
        }, {})
        this._industryNaicsMap = normalizedIndustries.reduce((map, { value, naics }) => {
          if (naics) map[value] = naics
          return map
        }, {})

        if (!this._businessIndustryNaics) {
          this._businessIndustryNaics = this._getSelectedIndustryNaics()
        }
        this._syncBusinessIndustrySelection()
        this.render()
        return normalizedIndustries
      } catch (err) {
        this._industryLoadError = err?.message || 'Unable to load industries.'
        return null
      } finally {
        this._isIndustriesLoading = false
        if (this._industriesPromise === loadPromise) this._industriesPromise = null
        this.render()
      }
    })()

    this._industriesPromise = loadPromise
    return loadPromise
  }

  async _putOperatorPaymentMethods(methods) {
    const baseUrl = this._getResolvedBaseUrl()
    const embeddableKey = this._getResolvedEmbeddableKey()
    const response = await fetch(`${baseUrl}/api/operators/${this._operatorId}`, {
      method: 'PUT',
      headers: {
        'X-Embeddable-Key': embeddableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedPaymentMethods: methods }),
    })
    const data = await response.json()
    if (!response.ok) throw { status: response.status, data }
    return data
  }

  _fetchKybStatus() {
    if (!this._operatorId) return
    this._kybStatusPromise = this._doFetchKybStatus()
    return this._kybStatusPromise
  }

  async _doFetchKybStatus() {
    this._isStatusLoading = true
    this.render()
    try {
      const response = await this._kybGet('status')
      this._kybStatus = response?.data || response || null
      this._isProfileLocked = !!(this._kybStatus?.isProfileLocked)

      if (this._kybStatus) {
        this._prefillDocsFromStatus(this._kybStatus)
        this._triggerSectionPrefills(this._kybStatus)

        // If selectedPaymentMethods was already saved, never show the welcome screen again
        const saved = this._kybStatus.selectedPaymentMethods
        if (Array.isArray(saved) && saved.length > 0) {
          this.state.ui.welcome.isOpen = false
        }
      }
    } catch (_err) {
      this._kybStatus = null
      this._isProfileLocked = false
    } finally {
      this._isStatusLoading = false
      this.render()
    }
  }

  _prefillDocsFromStatus(kybStatus) {
    const docs = Array.isArray(kybStatus?.documents) ? kybStatus.documents : []
    this._prefetchedDocs = docs.length > 0 ? docs[0] : null
  }

  _triggerSectionPrefills(kybStatus) {
    const ks = kybStatus
    if (ks.businessProfileStatus === 'Completed') this._prefillBusinessFromApi()
    if (ks.controlOfficerStatus === 'Completed') this._prefillOfficerFromApi()
    if (ks.beneficialOwnersStatus === 'Completed') this._prefillOwnersFromApi()
    if (ks.processingVolumeStatus === 'Completed') this._prefillVolumeFromApi()
  }

  _getFormattedBirthDate(value) {
    if (!value || typeof value !== 'object') return ''

    const month = value.birthMonth ?? value.birthDate?.month
    const day = value.birthDay ?? value.birthDate?.day
    const year = value.birthYear ?? value.birthDate?.year

    if (month != null && day != null && year != null) {
      const mm = String(month).padStart(2, '0')
      const dd = String(day).padStart(2, '0')
      return `${mm}/${dd}/${year}`
    }

    const rawBirthDate = value.birthDate
    if (typeof rawBirthDate === 'string' && rawBirthDate.trim()) {
      const trimmed = rawBirthDate.trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [yyyy, mm, dd] = trimmed.split('-')
        return `${mm}/${dd}/${yyyy}`
      }
      return formatDOB(trimmed)
    }

    return ''
  }

  _getFormattedSsn(value) {
    if (!value || typeof value !== 'object') return ''

    const directSsn = typeof value.ssn === 'string'
      ? value.ssn
      : typeof value.ssn?.full === 'string'
        ? value.ssn.full
        : ''

    const nestedSsn = typeof value.governmentID?.ssn === 'string'
      ? value.governmentID.ssn
      : typeof value.governmentID?.ssn?.full === 'string'
        ? value.governmentID.ssn.full
        : typeof value.governmentId?.ssn === 'string'
          ? value.governmentId.ssn
          : typeof value.governmentId?.ssn?.full === 'string'
            ? value.governmentId.ssn.full
            : ''

    const raw = String(directSsn || nestedSsn || '').trim()
    return raw ? formatSSN(raw) : ''
  }

  _getProcessingVolumeResponseData(response) {
    const topLevel = response?.data || response || {}
    const candidate = topLevel?.data && typeof topLevel.data === 'object' ? topLevel.data : topLevel
    return candidate && typeof candidate === 'object' ? candidate : {}
  }

  _resetFetchedSectionSnapshots() {
    this._fetchedSectionSnapshots = {
      business: null,
      officer: null,
      owners: null,
      volume: null,
    }
  }

  _storeFetchedSectionSnapshot(sectionKey) {
    if (sectionKey === 'business') {
      this._fetchedSectionSnapshots.business = {
        data: { ...this.state.data.business },
        industryNaics: String(this._businessIndustryNaics || '').trim(),
      }
      return
    }

    if (sectionKey === 'officer') {
      this._fetchedSectionSnapshots.officer = {
        data: { ...this.state.data.officer },
      }
      return
    }

    if (sectionKey === 'owners') {
      this._fetchedSectionSnapshots.owners = {
        data: {
          noOwnersAbove25: !!this.state.data.owners.noOwnersAbove25,
          owners: this.state.data.owners.owners.map((owner) => ({ ...owner })),
        },
      }
      return
    }

    if (sectionKey === 'volume') {
      this._fetchedSectionSnapshots.volume = {
        data: { ...this.state.data.volume },
      }
    }
  }

  _restoreFetchedSectionSnapshot(sectionKey) {
    const snapshot = this._fetchedSectionSnapshots?.[sectionKey]
    if (!snapshot?.data) return false

    if (sectionKey === 'business') {
      this.state.data.business = { ...snapshot.data }
      this._businessIndustryNaics = String(snapshot.industryNaics || '').trim()
      this.state.ui.business = { errors: {}, touched: {}, submitAttempted: false, isSaving: false }
      return true
    }

    if (sectionKey === 'officer') {
      this.state.data.officer = { ...snapshot.data }
      this.state.ui.officer = { errors: {}, touched: {}, submitAttempted: false, isSaving: false }
      return true
    }

    if (sectionKey === 'owners') {
      this.state.data.owners = {
        noOwnersAbove25: !!snapshot.data.noOwnersAbove25,
        owners: Array.isArray(snapshot.data.owners)
          ? snapshot.data.owners.map((owner) => ({ ...owner }))
          : [],
      }
      this.stopOwnerEdit()
      return true
    }

    if (sectionKey === 'volume') {
      this.state.data.volume = { ...snapshot.data }
      this.state.ui.volume = { errors: {}, touched: {}, submitAttempted: false, isSaving: false }
      return true
    }

    return false
  }

  _resetCompletedSectionEdits() {
    const statuses = this.getSectionStatuses()
    const resettableStatuses = new Set(['complete', 'verified', 'pending-review', 'action-required'])
    const sections = ['business', 'officer', 'owners', 'volume']

    for (const sectionKey of sections) {
      if (!resettableStatuses.has(statuses[sectionKey])) continue
      if (this.isSectionSaving(sectionKey)) continue
      this._restoreFetchedSectionSnapshot(sectionKey)
    }
  }

  _parseProcessingVolumeCount(value) {
    if (value == null || value === '') return ''
    const parsed = parseInt(String(value).replace(/\D/g, ''), 10)
    return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : ''
  }

  _formatProcessingVolumeCurrency(value) {
    if (value == null || value === '') return ''
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) return ''

    // KYB processing-volume amounts are submitted in cents; format them back
    // to whole-dollar input strings for the UI.
    const dollars = Math.round(parsed / 100)
    return dollars > 0 ? formatCurrencyInput(String(dollars)) : ''
  }

  async _prefillBusinessFromApi() {
    if (!this._operatorId) return
    try {
      const response = await this._kybGet('business-profile')
      const data = response?.data || response || {}
      const b = this.state.data.business

      const set = (field, value) => {
        if (value == null || value === '') return
        b[field] = String(value)
      }

      set('legalName', data.legalBusinessName || data.legalName)
      set('dba', data.doingBusinessAs || data.dba)
      set('businessType', data.businessType)
      set('address', data.addressLine1 || data.address)
      set('city', data.city)
      set('state', data.state)
      set('zip', formatZip(String(data.zipCode || data.zip || '')))
      set('phone', formatPhone(String(data.phone || '')))
      set('website', data.website || data.description)

      if (data.ein) set('ein', formatEIN(String(data.ein)))
      if (data.industry) {
        const industryValue = String(data.industry).trim()
        const optionMatch = this._getIndustryOptions().find(
          (option) => option.value === industryValue || option.label === industryValue
        )
        b.industry = optionMatch ? optionMatch.value : industryValue
      }

      // Only fall back to code-based matching when the API did not send the
      // explicit industry value used by the dropdown catalog.
      if (!b.industry && data.industryNaics) {
        this._businessIndustryNaics = String(data.industryNaics).trim()
        const industryValue = this._getIndustryValueByNaics(this._businessIndustryNaics)
        if (industryValue) b.industry = industryValue
      }

      this.state.savedAt.business = this.state.savedAt.business || new Date().toISOString()
      this._storeFetchedSectionSnapshot('business')
      this.render()
    } catch (_err) {
      // Prefill is best-effort; ignore failures
    }
  }

  async _prefillOfficerFromApi() {
    if (!this._operatorId) return
    try {
      const response = await this._kybGet('control-officer')
      const data = response?.data || response || {}
      const o = this.state.data.officer

      const set = (field, value) => {
        if (value == null || value === '') return
        o[field] = String(value)
      }

      set('firstName', data.firstName)
      set('lastName', data.lastName)
      set('email', data.email)
      set('phone', formatPhone(String(data.phone || '')))
      set('address', data.addressLine1 || data.address)
      set('city', data.city)
      set('state', data.state)
      set('zip', formatZip(String(data.zipCode || data.zip || '')))
      set('jobTitle', data.jobTitle)
      const dob = this._getFormattedBirthDate(data)
      const ssn = this._getFormattedSsn(data)
      o.dob = ''
      o.ssn = ''
      o.dobOnFile = !!(dob || data.birthDateProvided)
      o.ssnOnFile = !!(
        ssn ||
        data.governmentIdProvided ||
        data.governmentIDProvided ||
        data.governmentID?.ssn?.lastFour ||
        data.governmentId?.ssn?.lastFour ||
        data.ssn?.lastFour
      )

      this.state.savedAt.officer = this.state.savedAt.officer || new Date().toISOString()
      this._officerGovernmentIdProvided = o.ssnOnFile
      this._storeFetchedSectionSnapshot('officer')
      this.render()
    } catch (_err) {
      // Prefill is best-effort; ignore failures
    }
  }

  async _prefillOwnersFromApi() {
    if (!this._operatorId) return
    try {
      const response = await this._kybGet('beneficial-owners')
      const raw = response?.data || response || {}
      const list = Array.isArray(raw) ? raw : Array.isArray(raw.owners) ? raw.owners : []

      if (list.length === 0) {
        this.state.data.owners.noOwnersAbove25 = true
      } else {
        this.state.data.owners.owners = list.map((item) => {
          const owner = emptyOwner()
          const set = (field, value) => {
            if (value == null || value === '') return
            owner[field] = String(value)
          }

          set('firstName', item.firstName)
          set('lastName', item.lastName)
          set('email', item.email)
          set('phone', formatPhone(String(item.phone || '')))
          set('address', item.addressLine1 || item.address)
          set('city', item.city)
          set('state', item.state)
          set('zip', formatZip(String(item.zipCode || item.zip || '')))
          set('jobTitle', item.jobTitle)

          if (item.ownershipPercentage != null) {
            owner.ownershipPercent = Number(item.ownershipPercentage) || 25
          }

          const dob = this._getFormattedBirthDate(item)
          const ssn = this._getFormattedSsn(item)
          owner.dob = ''
          owner.ssn = ''
          owner.dobOnFile = !!(dob || item.birthDateProvided)
          owner.ssnOnFile = !!(
            ssn ||
            item.governmentIdProvided ||
            item.governmentIDProvided ||
            item.governmentID?.ssn?.lastFour ||
            item.governmentId?.ssn?.lastFour ||
            item.ssn?.lastFour
          )

          owner.id = item.id || item.representativeId || makeId()
          return owner
        })
        this.state.data.owners.noOwnersAbove25 = false
      }

      this._storeFetchedSectionSnapshot('owners')
      this.render()
    } catch (_err) {
      // Prefill is best-effort; ignore failures
    }
  }

  async _prefillVolumeFromApi() {
    if (!this._operatorId) return
    try {
      const response = await this._kybGet('processing-volume')
      const data = this._getProcessingVolumeResponseData(response)
      const v = this.state.data.volume
      let didPrefill = false

      const monthlyTransactionCount = this._parseProcessingVolumeCount(
        data.averageMonthlyTransactionCount ??
        data.monthlyTransactionCount ??
        data.averageTransactionCount ??
        data.transactionCount ??
        data.averageMonthlyTransactionVolume
      )
      const monthlyDollarVolume = this._formatProcessingVolumeCurrency(
        data.averageMonthlyDollarVolume ??
        data.averageMonthlyTransactionVolume ??
        data.monthlyDollarVolume
      )
      const avgTransactionSize = this._formatProcessingVolumeCurrency(
        data.averageIndividualTransactionSize ??
        data.averageTransactionSize ??
        data.avgTransactionSize
      )

      if (monthlyTransactionCount) {
        v.monthlyTransactionCount = monthlyTransactionCount
        didPrefill = true
      }
      if (monthlyDollarVolume) {
        v.monthlyDollarVolume = monthlyDollarVolume
        didPrefill = true
      }
      if (avgTransactionSize) {
        v.avgTransactionSize = avgTransactionSize
        didPrefill = true
      }

      if (didPrefill) {
        this.state.savedAt.volume = this.state.savedAt.volume || new Date().toISOString()
        this._storeFetchedSectionSnapshot('volume')
      }
      this.render()
    } catch (_err) {
      // Prefill is best-effort; ignore failures
    }
  }

  async _generatePlaidLinkTokenBuiltIn(operatorId) {
    const params = new URLSearchParams({ entityId: operatorId })
    return this._plaidApiRequest(`/api/plaid/embeddable/create-token?${params.toString()}`, {
      clientName: 'BisonJibPay',
      language: 'en',
      products: ['auth'],
      countryCodes: ['US'],
      user: { clientUserId: operatorId },
    })
  }

  async _registerPlaidBankAccountBuiltIn(publicToken, accountId, accountType, companyName) {
    const payload = {
      publicToken,
      accountId,
      entityType: 1,
      entityId: this._operatorId,
      accountType,
      description: 'Linked via Plaid Link',
    }
    if (companyName) payload.accountHolderName = companyName
    return this._plaidApiRequest('/api/plaid/embeddable/register-bank-account', payload)
  }

  async _ensurePlaidLinkLoaded() {
    if (typeof window !== 'undefined' && window.Plaid && typeof window.Plaid.create === 'function') {
      return
    }
    if (!this._plaidScriptPromise) {
      this._plaidScriptPromise = new Promise((resolve, reject) => {
        const scriptSrc = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
        const existingScript = document.querySelector(`script[src="${scriptSrc}"]`)
        const handleLoad = () => {
          if (window.Plaid && typeof window.Plaid.create === 'function') {
            resolve()
          } else {
            reject(new Error('Plaid Link script loaded but window.Plaid is not available.'))
          }
        }
        const handleError = () => reject(new Error('Failed to load Plaid Link script.'))
        const timeout = setTimeout(() => reject(new Error('Timed out while loading Plaid Link script.')), 10000)
        const cleanup = () => clearTimeout(timeout)
        if (existingScript) {
          existingScript.addEventListener('load', () => { cleanup(); handleLoad() }, { once: true })
          existingScript.addEventListener('error', () => { cleanup(); handleError() }, { once: true })
          if (window.Plaid && typeof window.Plaid.create === 'function') {
            cleanup(); resolve(); return
          }
        } else {
          const script = document.createElement('script')
          script.src = scriptSrc
          script.onload = () => { cleanup(); handleLoad() }
          script.onerror = () => { cleanup(); handleError() }
          document.head.appendChild(script)
        }
      })
    }
    try {
      await this._plaidScriptPromise
    } catch (error) {
      this._plaidScriptPromise = null
      throw error
    }
    if (!window.Plaid || typeof window.Plaid.create !== 'function') {
      throw new Error('Plaid Link is not available after script load.')
    }
  }

  async _handlePlaidLinkClick() {
    if (this._isPlaidLinkInProgress) return
    if (!this._operatorId) {
      alert('Operator account not found. Please complete the operator lookup first.')
      return
    }

    this._isPlaidLinkInProgress = true
    this.render()

    try {
      const tokenResponse = await this._generatePlaidLinkTokenBuiltIn(this._operatorId)
      const tokenData = tokenResponse?.data || tokenResponse || {}
      this._plaidLinkToken = tokenData.linkToken || tokenData.link_token || null

      if (!this._plaidLinkToken) throw new Error('Failed to create Plaid Link token.')

      await this._ensurePlaidLinkLoaded()

      const linkResult = await new Promise((resolve, reject) => {
        let settled = false
        let successStarted = false
        const resolveOnce = (val) => { if (settled) return; settled = true; resolve(val) }
        const rejectOnce = (err) => { if (settled) return; settled = true; reject(err) }

        try {
          this._plaidLinkHandler = window.Plaid.create({
            token: this._plaidLinkToken,
            onSuccess: async (publicToken, metadata) => {
              successStarted = true
              try {
                const plaidAccountId = metadata?.accounts?.[0]?.id
                if (!plaidAccountId) throw new Error('Plaid did not return an accountId.')

                const metadataAccount = metadata?.accounts?.[0] || {}
                const subtype = (metadataAccount.subtype || '').toLowerCase()
                const accountType = subtype.includes('savings') ? 'Savings' : 'Checking'
                const companyName = (this._operatorLookupData?.companyName || this.state.data.business.legalName || '').trim()

                const registerResponse = await this._registerPlaidBankAccountBuiltIn(
                  publicToken,
                  plaidAccountId,
                  accountType,
                  companyName
                )
                resolveOnce({ registerResponse, metadata, metadataAccount })
              } catch (err) {
                rejectOnce(err)
              }
            },
            onExit: (error) => {
              if (successStarted) return
              if (error) { rejectOnce(error); return }
              resolveOnce(null)
            },
          })
          this._plaidLinkHandler.open()
        } catch (err) {
          rejectOnce(err)
        }
      })

      // User exited without completing
      if (!linkResult) return

      await this._fetchOperatorBankAccounts(true)
      this.persist()

      if (typeof this.onBankLinked === 'function' && this._linkedBankAccount) {
        this.onBankLinked(this._linkedBankAccount)
      }
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Unable to link bank account.'
      alert(message)
    } finally {
      this._isPlaidLinkInProgress = false
      this.render()
    }
  }

  _evaluateOperatorAttributes() {
    const opOrgId = (this.getAttribute('op-org-id') || '').trim()
    const resolvedEmbeddableKey = this._getResolvedEmbeddableKey()
    this._embeddableKey = resolvedEmbeddableKey || null

    if (!resolvedEmbeddableKey || !opOrgId) {
      this._resetBankAccountState()
      this._operatorId = null
      this._isOperatorLookupPending = false
      this._operatorLookupData = null
      this._operatorLookupError = !resolvedEmbeddableKey
        ? { message: 'Missing embeddable key for operator lookup.' }
        : { message: 'Missing op-org-id for operator lookup.' }
      this._activeLookupRequestId = ++this._lookupRequestId
      return
    }

    this._resetBankAccountState()
    this._operatorId = null
    this._ensureIndustriesLoaded()
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
    if (this._isStatusLoading) return 'Initializing...'

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

    applyIfEmpty('legalName', lookupData.companyName || lookupData.legalName || lookupData.operatorName || lookupData.name)
    applyIfEmpty('dba', lookupData.dba || lookupData.doingBusinessAs)
    applyIfEmpty('ein', lookupData.taxId || lookupData.ein || lookupData.taxIdentifier, formatEIN)
    applyIfEmpty('address', lookupData.address || lookupData.address1 || lookupData.street || lookupData.mailingAddress1)
    applyIfEmpty('city', lookupData.city || lookupData.mailingCity)
    applyIfEmpty('state', lookupData.state || lookupData.mailingState)
    applyIfEmpty('zip', lookupData.zipCode || lookupData.zip || lookupData.postalCode || lookupData.mailingPostalCode, formatZip)
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
      this._operatorId = data?.operatorId || null
      if (this._operatorId) {
        this._fetchKybStatus()
        this._fetchOperatorBankAccounts(true)
      }
      const didHydrateBusiness = this._applyLookupDataToBusiness(data)
      if (didHydrateBusiness) {
        this.persist()
      }

      this._dispatchLookupEvent({ status: 'success', data: result })
      if (typeof this.onLookupSuccess === 'function') this.onLookupSuccess(data)
    } catch (err) {
      if (requestId !== this._activeLookupRequestId || !this.isConnected) return
      const errData = err?.data || err
      this._operatorId = null
      this._resetBankAccountState()
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
    this._ensureIndustriesLoaded(true)
    this._isOpen = true
    this._isClosing = false
    this._welcomeAnimateIn = true
    this._modalAnimateIn = true
    this._accordionHeights = {}
    this._lastOpenSection = null
    this._setupModalHeight = null
    this.cancelAccordionHeightSync()
    this._welcomeSaveRequestId += 1
    this.clearWelcomeFeedbackTimers()
    this.resetBankDefaultActionState()
    this.resetBankDeleteModalState()
    this.state.openSection = null
    this.state.ui.welcome.step = 1
    this.state.ui.welcome.direction = 1
    this.state.ui.welcome.isSaving = false
    this.state.ui.welcome.toast = null

    if (this._kybStatusPromise && this._kybStatus === null && this._isStatusLoading) {
      // KYB status is still loading — render without the modal content until
      // the status resolves, then show the correct view with no flash.
      this.state.ui.welcome.isOpen = false
      this.render()
      this._kybStatusPromise.then(() => {
        if (!this._isOpen) return
        const email = this.getUserEmailFromState(this.state)
        this.state.ui.welcome.isOpen = this.shouldShowWelcome(email)
        this.render()
        if (typeof this.onOpen === 'function') this.onOpen()
      })
      return
    }

    const email = this.getUserEmailFromState(this.state)
    this.state.ui.welcome.isOpen = this.shouldShowWelcome(email)
    if (this._operatorId) this._fetchOperatorBankAccounts(true)
    this.render()
    if (typeof this.onOpen === 'function') this.onOpen()
  }

  close() {
    const deleteModal = this.state?.ui?.bank?.deleteModal
    if (deleteModal?.isOpen) {
      if (deleteModal.isSubmitting) return
      this.closeBankDeleteModal(true)
      this.render()
      return
    }

    if (!this._isOpen || this._isClosing) return
    this._welcomeSaveRequestId += 1
    this.clearWelcomeFeedbackTimers()
    this.resetBankDefaultActionState()
    this.resetBankDeleteModalState()
    this.state.ui.welcome.isSaving = false
    this.state.ui.welcome.toast = null
    this._isClosing = true
    this._modalTransitioning = false
    this.render()

    const timer = setTimeout(() => {
      this._timers.delete(timer)
      this._isOpen = false
      this._isClosing = false
      this._modalAnimateIn = true
      this._resetCompletedSectionEdits()
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
        bank: {
          errors: {},
          touched: {},
          submitAttempted: false,
          isSaving: false,
          saveError: null,
          entryMode: 'choices',
          pendingDefaultId: '',
          pendingDefaultPhase: '',
          actionToast: null,
          removingAccountId: '',
          deleteModal: {
            isOpen: false,
            bankAccountId: '',
            bankName: '',
            accountLabel: '',
            isSubmitting: false,
            errorMessage: '',
          },
        },
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
          file: null,
          isDragging: false,
          isUploading: false,
          uploadError: null,
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
          isSaving: false,
          toast: null,
        },
      },
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
    // If the operator has already saved payment methods, never show the welcome screen
    const savedMethods = this._kybStatus?.selectedPaymentMethods
    if (Array.isArray(savedMethods) && savedMethods.length > 0) return false

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

  clearWelcomeFeedbackTimers() {
    if (this._welcomeToastTimer) {
      clearTimeout(this._welcomeToastTimer)
      this._timers.delete(this._welcomeToastTimer)
      this._welcomeToastTimer = null
    }

    if (this._welcomeAdvanceTimer) {
      clearTimeout(this._welcomeAdvanceTimer)
      this._timers.delete(this._welcomeAdvanceTimer)
      this._welcomeAdvanceTimer = null
    }
  }

  queueWelcomeToastDismiss(requestId, delay = 2200) {
    if (this._welcomeToastTimer) {
      clearTimeout(this._welcomeToastTimer)
      this._timers.delete(this._welcomeToastTimer)
    }

    const timer = setTimeout(() => {
      this._timers.delete(timer)
      if (this._welcomeToastTimer === timer) this._welcomeToastTimer = null
      if (requestId !== this._welcomeSaveRequestId || !this.isConnected || !this._isOpen) return
      this.state.ui.welcome.toast = null
      this.render()
    }, delay)

    this._welcomeToastTimer = timer
    this._timers.add(timer)
  }

  persistWelcomeMethodsAndAdvance(methods) {
    const welcome = this.state.ui.welcome
    if (welcome.isSaving) return

    this._welcomeSaveRequestId += 1
    const requestId = this._welcomeSaveRequestId
    this.clearWelcomeFeedbackTimers()
    welcome.toast = null

    if (!this._operatorId) {
      welcome.isSaving = false
      welcome.toast = {
        tone: 'error',
        message: 'Operator account not found. Please complete the operator lookup first.',
      }
      this.render()
      this.queueWelcomeToastDismiss(requestId)
      return
    }

    welcome.isSaving = true
    this.render()

    this._putOperatorPaymentMethods(methods)
      .then(() => {
        if (requestId !== this._welcomeSaveRequestId || !this.isConnected || !this._isOpen) return

        welcome.isSaving = false
        welcome.toast = {
          tone: 'success',
          message: 'Payment methods saved.',
        }
        this.render()

        const timer = setTimeout(() => {
          this._timers.delete(timer)
          if (this._welcomeAdvanceTimer === timer) this._welcomeAdvanceTimer = null
          if (requestId !== this._welcomeSaveRequestId || !this.isConnected || !this._isOpen) return

          welcome.toast = null
          welcome.step = 2
          welcome.direction = 1
          this.render()
        }, 900)

        this._welcomeAdvanceTimer = timer
        this._timers.add(timer)
      })
      .catch((err) => {
        if (requestId !== this._welcomeSaveRequestId || !this.isConnected || !this._isOpen) return

        welcome.isSaving = false
        welcome.toast = {
          tone: 'error',
          message: err?.data?.message || err?.message || 'Unable to save payment methods.',
        }
        this.render()
        this.queueWelcomeToastDismiss(requestId)
      })
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
    const isProgressComplete = progress >= 100
    const isVerified = this.isKybVerified()

    return { statuses, statusMessages, progress, isProgressComplete, isVerified }
  }

  renderSetupModalContent(statuses, statusMessages, progress, isProgressComplete, isVerified) {
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
        ? this.renderVerificationTab(statuses, statusMessages, progress, isProgressComplete, isVerified)
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

    const { statuses, statusMessages, progress, isProgressComplete, isVerified } = this.getSetupRenderContext()
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
          ${this.renderSetupModalContent(statuses, statusMessages, progress, isProgressComplete, isVerified)}
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
      bank: this._linkedBankAccount ? 'complete' : 'not-started',
      docs: 'not-required',
    }
  }

  getSectionStatusesFromState(state) {
    if (!this._kybStatus) return this.getRealStatusesFromState(state)

    const mapStatus = (apiStatus) => {
      if (apiStatus === 'Completed') return 'complete'
      if (apiStatus === 'InProgress') return 'in-progress'
      return 'not-started'
    }

    const ks = this._kybStatus
    const capabilities = Array.isArray(ks.capabilities) ? ks.capabilities : []

    const refineComplete = (baseStatus) => {
      if (baseStatus !== 'complete') return baseStatus
      if (capabilities.some((c) => c.status === 'enabled')) return 'verified'
      if (capabilities.some((c) => c.status === 'pending')) return 'pending-review'
      if (capabilities.some((c) => c.status === 'disabled' && c.disabledReason === 'requirements-not-met')) return 'action-required'
      return 'complete'
    }

    return {
      business: refineComplete(mapStatus(ks.businessProfileStatus)),
      officer: refineComplete(mapStatus(ks.controlOfficerStatus)),
      owners: refineComplete(mapStatus(ks.beneficialOwnersStatus)),
      volume: refineComplete(mapStatus(ks.processingVolumeStatus)),
      bank: this._linkedBankAccount ? 'complete' : 'not-started',
      docs: this.getDocumentsSectionStatus(ks),
    }
  }

  getSectionStatuses() {
    return this.getSectionStatusesFromState(this.state)
  }

  getStatusMessages() {
    return {}
  }

  getNormalizedVerificationStatus(status = this._kybStatus) {
    return String(status?.verificationStatus || status?.status || '').trim().toLowerCase()
  }

  hasAllCapabilitiesEnabled(status = this._kybStatus) {
    const capabilities = Array.isArray(status?.capabilities) ? status.capabilities : []
    return capabilities.length > 0 && capabilities.every(
      (capability) => String(capability?.status || '').trim().toLowerCase() === 'enabled'
    )
  }

  isKybVerified(status = this._kybStatus) {
    if (!status) return false

    const verificationStatus = this.getNormalizedVerificationStatus(status)
    if (verificationStatus === 'verified' || verificationStatus === 'completed' || verificationStatus === 'complete') {
      return true
    }

    return status.isComplete === true && this.hasAllCapabilitiesEnabled(status)
  }

  getDocumentsSectionStatus(status = this._kybStatus) {
    if (!status) return 'not-started'

    const documents = Array.isArray(status.documents) ? status.documents : []
    if (documents.length > 0) {
      const documentStatuses = documents.map((document) => String(document?.status || '').trim().toLowerCase())
      const allApproved = documentStatuses.every((documentStatus) => documentStatus === 'approved')
      const anyRejected = documentStatuses.some((documentStatus) => documentStatus === 'rejected')

      if (allApproved) return 'complete'
      if (anyRejected) return 'action-required'
      return 'pending-review'
    }

    const capabilities = Array.isArray(status.capabilities) ? status.capabilities : []
    const documentRequested = capabilities.some(
      (capability) => Array.isArray(capability?.currentlyDue) && capability.currentlyDue.includes('document.merchant-underwriting')
    )

    return documentRequested ? 'document-requested' : 'not-required'
  }

  getVerificationProgressFromState(state) {
    const statuses = this.getSectionStatusesFromState(state)
    const required = ['business', 'officer', 'owners', 'volume', 'bank', 'docs']
    const countable = ['complete', 'submitted', 'pending-review', 'verified', 'not-required']
    const final = ['complete', 'verified', 'not-required']
    const completed = required.filter((key) => countable.includes(statuses[key])).length
    const rawProgress = Math.round((completed / required.length) * 100)
    const hasPendingRequiredSection = required.some((key) => !final.includes(statuses[key]))

    if (rawProgress >= 100 && hasPendingRequiredSection) {
      return 95
    }

    return rawProgress
  }

  getVerificationProgress() {
    return this.getVerificationProgressFromState(this.state)
  }

  isComplete() {
    return this.isKybVerified()
  }

  findFirstIncompleteSection(statuses) {
    const first = SECTION_DEFS.find((section) => {
      const status = statuses[section.key]
      return status === 'not-started' || status === 'in-progress'
    })
    return first ? first.key : null
  }

  maybeAutoAdvanceOpenSection(prevStatuses) {
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

  isSectionSaving(sectionKey) {
    if (sectionKey === 'owners') return !!this.state.ui.ownerEditor.isSaving
    if (sectionKey === 'bank') return !!(this.state.ui.bank.isSaving || this._isPlaidLinkInProgress)
    if (sectionKey === 'docs') return !!this.state.ui.docs.isUploading
    const meta = this.getFormMeta(sectionKey)
    return !!(meta && meta.isSaving)
  }

  updateFormField(formName, field, value) {
    if (formName === 'business') {
      this.state.data.business[field] = value
      if (field === 'industry') {
        this._businessIndustryNaics = this._getSelectedIndustryNaics(value)
      }
    }
    if (formName === 'officer') this.state.data.officer[field] = value
    if (formName === 'volume') this.state.data.volume[field] = value
    if (formName === 'bank') {
      this.state.data.bank[field] = value
      this.state.ui.bank.saveError = null
    }
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
        accountHolderName: this.state.data.bank.accountHolderName,
        routingNumber: this.state.data.bank.routingNumber,
        accountNumber: this.state.data.bank.accountNumber,
        confirmAccountNumber: this.state.data.bank.confirmAccountNumber,
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

  _buildBusinessPayload() {
    const b = this.state.data.business
    const selectedIndustry = this._getSelectedIndustryDetails(b.industry)
    const phoneDigits = b.phone.replace(/\D/g, '')
    const einDigits = b.ein.replace(/\D/g, '')
    const isUrl = /^https?:\/\//i.test(b.website.trim()) || /^www\./i.test(b.website.trim())
    const payload = {
      legalBusinessName: b.legalName.trim(),
      businessType: b.businessType,
      ein: einDigits,
      addressLine1: b.address.trim(),
      city: b.city.trim(),
      state: b.state,
      zipCode: b.zip.replace(/\D/g, ''),
      phone: phoneDigits,
    }
    if (b.industry) payload.industry = b.industry
    const industryNaics = this._getSelectedIndustryNaics(b.industry)
    if (industryNaics) payload.industryNaics = industryNaics
    if (selectedIndustry?.mcc) payload.industryMcc = selectedIndustry.mcc
    if (selectedIndustry?.sic) payload.industrySic = selectedIndustry.sic
    if (b.dba.trim()) payload.doingBusinessAs = b.dba.trim()
    if (isUrl) payload.website = b.website.trim()
    else if (b.website.trim()) payload.description = b.website.trim()
    const selectedMethods = this.state.ui.welcome.selectedMethods
    if (selectedMethods.length > 0) payload.selectedPaymentMethods = selectedMethods
    return payload
  }

  _buildOfficerPayload() {
    const o = this.state.data.officer
    const parts = (o.dob || '').split('/')
    const phoneDigits = o.phone.replace(/\D/g, '')
    const payload = {
      firstName: o.firstName.trim(),
      lastName: o.lastName.trim(),
      jobTitle: o.jobTitle.trim(),
    }
    if (o.email.trim()) payload.email = o.email.trim()
    if (phoneDigits) payload.phone = phoneDigits
    if (o.address.trim()) payload.addressLine1 = o.address.trim()
    if (o.city.trim()) payload.city = o.city.trim()
    if (o.state) payload.state = o.state
    if (o.zip) payload.zipCode = o.zip.replace(/\D/g, '')
    if (parts.length === 3) {
      payload.birthMonth = parseInt(parts[0], 10)
      payload.birthDay = parseInt(parts[1], 10)
      payload.birthYear = parseInt(parts[2], 10)
    }
    const ssnDigits = o.ssn.replace(/\D/g, '')
    if (ssnDigits) payload.ssn = ssnDigits
    return payload
  }

  _buildOwnerPayload(owner) {
    const parts = (owner.dob || '').split('/')
    const phoneDigits = (owner.phone || '').replace(/\D/g, '')
    const payload = {
      firstName: owner.firstName.trim(),
      lastName: owner.lastName.trim(),
      ownershipPercentage: Number(owner.ownershipPercent) || 25,
    }
    if (owner.email.trim()) payload.email = owner.email.trim()
    if (phoneDigits) payload.phone = phoneDigits
    if (owner.address.trim()) payload.addressLine1 = owner.address.trim()
    if (owner.city.trim()) payload.city = owner.city.trim()
    if (owner.state) payload.state = owner.state
    if (owner.zip) payload.zipCode = owner.zip.replace(/\D/g, '')
    if (owner.jobTitle.trim()) payload.jobTitle = owner.jobTitle.trim()
    if (parts.length === 3) {
      payload.birthMonth = parseInt(parts[0], 10)
      payload.birthDay = parseInt(parts[1], 10)
      payload.birthYear = parseInt(parts[2], 10)
    }
    const ssnDigits = (owner.ssn || '').replace(/\D/g, '')
    if (ssnDigits) payload.ssn = ssnDigits
    return payload
  }

  _parseDollarsToCents(str) {
    const cleaned = String(str).replace(/[^0-9.]/g, '')
    return Math.round(parseFloat(cleaned || '0') * 100)
  }

  _buildVolumePayload() {
    const v = this.state.data.volume
    return {
      averageMonthlyTransactionCount: parseInt(String(v.monthlyTransactionCount).replace(/\D/g, '') || '0', 10),
      averageMonthlyDollarVolume: this._parseDollarsToCents(v.monthlyDollarVolume),
      averageIndividualTransactionSize: this._parseDollarsToCents(v.avgTransactionSize),
    }
  }

  _isSectionLocked(sectionKey) {
    if (!this._isProfileLocked) return false
    const statuses = this.getSectionStatuses()
    const s = statuses[sectionKey]
    return s === 'complete' || s === 'verified'
  }

  saveForm(formName) {
    if (this._isSectionLocked(formName)) return

    const meta = this.getFormMeta(formName)
    if (!meta) return
    if (meta.isSaving) return

    meta.submitAttempted = true
    const errors = this.validateByForm(formName)
    meta.errors = errors

    if (Object.keys(errors).length > 0) {
      this.render()
      return
    }

    meta.isSaving = true
    meta.saveError = null

    // Capture the open accordion height before innerHTML replacement so the
    // section doesn't jump to 0 and re-animate while the request is in-flight.
    this.captureOpenAccordionHeight(this.state.openSection)

    this.render()

    this._saveFormAsync(formName, meta)
  }

  async _saveFormAsync(formName, meta) {
    try {
      if (formName === 'business') {
        const payload = this._buildBusinessPayload()
        await this._kybPost('business-profile', payload)
        this.state.savedAt.business = new Date().toISOString()
      } else if (formName === 'officer') {
        const payload = this._buildOfficerPayload()
        await this._kybPost('control-officer', payload)
        this.state.savedAt.officer = new Date().toISOString()
        // Clear sensitive values from local state after successful save.
        this.state.data.officer.dobOnFile = this.state.data.officer.dobOnFile || !!this.state.data.officer.dob
        this.state.data.officer.ssnOnFile = this.state.data.officer.ssnOnFile || !!this.state.data.officer.ssn
        this.state.data.officer.dob = ''
        this.state.data.officer.ssn = ''
        this._officerGovernmentIdProvided = true
      } else if (formName === 'volume') {
        const payload = this._buildVolumePayload()
        await this._kybPost('processing-volume', payload)
        this.state.savedAt.volume = new Date().toISOString()
      } else if (formName === 'bank') {
        if (!this._operatorId) {
          throw {
            message: 'Operator account not found. Please complete the operator lookup first.',
          }
        }

        const manualBankSnapshot = {
          accountHolderName: this.state.data.bank.accountHolderName,
          accountHolderType: this.state.data.bank.accountHolderType,
          routingNumber: this.state.data.bank.routingNumber,
          accountNumber: this.state.data.bank.accountNumber,
          accountType: this.state.data.bank.accountType,
        }
        const createResponse = await this._addOperatorManualBankAccount(this._operatorId, {
          ...manualBankSnapshot,
          initiateVerification: true,
        })

        const createdBankAccount = this._extractOperatorBankAccount(createResponse)
        const optimisticBankAccount = this._buildOptimisticManualBankAccount(manualBankSnapshot, createdBankAccount)
        const existingAccounts = Array.isArray(this._operatorBankAccounts) ? this._operatorBankAccounts : []
        const optimisticBankAccountId = this._getOperatorBankAccountId(optimisticBankAccount)
        const nextAccounts = optimisticBankAccountId
          ? [
              ...existingAccounts.filter((account) => this._getOperatorBankAccountId(account) !== optimisticBankAccountId),
              optimisticBankAccount,
            ]
          : [...existingAccounts, optimisticBankAccount]
        this._applyOperatorBankAccounts(nextAccounts)

        this._listOperatorBankAccounts(this._operatorId)
          .then((accounts) => {
            if (!this.isConnected || !this._isOpen) return
            this._applyOperatorBankAccounts(accounts)
            this.render()
          })
          .catch(() => {
            // Keep the optimistic linked state if the follow-up refresh fails.
          })

        this.state.data.bank = {
          ...defaultBank(),
          connectedViaPlaid: this.state.data.bank.connectedViaPlaid,
        }
        meta.entryMode = 'choices'
        meta.errors = {}
        meta.touched = {}
        meta.submitAttempted = false
      }

      const prevStatuses = this.getSectionStatuses()
      meta.isSaving = false
      meta.saveError = null
      this.persist()
      this.maybeAutoAdvanceOpenSection(prevStatuses)
      this.render()
      this._fetchKybStatus()
    } catch (error) {
      meta.isSaving = false
      meta.saveError = this._getActionErrorMessage(error, 'We could not link this bank account.')
      this.render()
    }
  }

  saveOwner() {
    if (this._isSectionLocked('owners')) return

    const meta = this.state.ui.ownerEditor
    if (meta.isSaving) return
    meta.submitAttempted = true

    const errors = validateOwner(meta.form)
    meta.errors = errors
    if (Object.keys(errors).length > 0) {
      this.render()
      return
    }

    meta.isSaving = true
    meta.saveError = null
    this.captureOpenAccordionHeight(this.state.openSection)
    this.render()

    this._saveOwnerAsync(meta)
  }

  async _saveOwnerAsync(meta) {
    try {
      // Commit owner to local state first (add or update)
      const owner = { ...meta.form, id: meta.form.id || makeId() }
      const existingIndex = this.state.data.owners.owners.findIndex((item) => item.id === owner.id)
      if (existingIndex >= 0) {
        this.state.data.owners.owners = this.state.data.owners.owners.map((item, i) =>
          i === existingIndex ? owner : item
        )
      } else {
        this.state.data.owners.owners = [...this.state.data.owners.owners, owner]
      }
      this.state.data.owners.noOwnersAbove25 = false

      // POST full owners list to API
      await this._submitOwnersToApi()

      // Clear sensitive values from local owner state after successful save.
      this.state.data.owners.owners = this.state.data.owners.owners.map((o) => ({
        ...o,
        dobOnFile: o.dobOnFile || !!o.dob,
        ssnOnFile: o.ssnOnFile || !!o.ssn,
        dob: '',
        ssn: '',
      }))

      const prevStatuses = this.getSectionStatuses()
      meta.isSaving = false
      meta.saveError = null
      this.stopOwnerEdit()
      this.persist()
      this.maybeAutoAdvanceOpenSection(prevStatuses)
      this.render()
      this._fetchKybStatus()
    } catch (err) {
      // Roll back the owner we just added on failure
      if (!meta.form.id) {
        this.state.data.owners.owners = this.state.data.owners.owners.filter(
          (o) => o.id !== meta.form.id
        )
      }
      meta.isSaving = false
      this.render()
    }
  }

  async _submitOwnersToApi() {
    const { owners, noOwnersAbove25 } = this.state.data.owners
    const body = noOwnersAbove25 ? [] : owners.map((o) => this._buildOwnerPayload(o))
    await this._kybPost(`beneficial-owners?noOwnersAbove25=${noOwnersAbove25}`, body)
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
      if (this.state.ui.welcome.isSaving) return
      const methodId = target.getAttribute('data-method-id')
      if (!methodId) return

      const selected = this.state.ui.welcome.selectedMethods
      if (selected.includes(methodId)) {
        this.state.ui.welcome.selectedMethods = selected.filter((id) => id !== methodId)
      } else {
        this.state.ui.welcome.selectedMethods = [...selected, methodId]
      }
      this.state.ui.welcome.toast = null
      this.persistWelcomeState()
      this.render()
      return
    }

    if (action === 'welcome-continue') {
      const methods = this.state.ui.welcome.selectedMethods
      if (methods.length === 0) return
      this.persistWelcomeMethodsAndAdvance(methods)
      return
    }

    if (action === 'welcome-start-verification') {
      this.transitionWelcomeToSetup()
      return
    }

    if (action === 'welcome-close') {
      this.closeWelcomeModal()
      this.close()
      return
    }

    if (action === 'tab-switch') {
      const tab = target.getAttribute('data-tab')
      if (!tab) return
      this.state.activeTab = tab
      this.render()
      return
    }

    if (action === 'bank-account-set-default') {
      const bankAccountId = target.getAttribute('data-bank-account-id')
      if (!bankAccountId) return
      this.setDefaultOperatorBankAccount(bankAccountId)
      return
    }

    if (action === 'bank-account-remove') {
      const bankAccountId = target.getAttribute('data-bank-account-id')
      if (!bankAccountId) return
      this.openBankDeleteModal(bankAccountId)
      return
    }

    if (action === 'bank-delete-cancel') {
      this.closeBankDeleteModal()
      this.render()
      return
    }

    if (action === 'bank-delete-confirm') {
      this.confirmUnlinkOperatorBankAccount()
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
      this.saveForm(form)
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
      if (this._operatorId) {
        this.state.ui.ownerEditor.isSaving = true
        this.captureOpenAccordionHeight(this.state.openSection)
        this.render()
        this._submitOwnersToApi()
          .then(() => {
            this.state.ui.ownerEditor.isSaving = false
            this.render()
            this._fetchKybStatus()
          })
          .catch(() => {
            this.state.ui.ownerEditor.isSaving = false
            this.render()
          })
      } else {
        this.render()
      }
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

    if (action === 'manual-bank-set-holder-type') {
      const value = String(target.getAttribute('data-value') || '').trim()
      if (!value) return
      this.updateFormField('bank', 'accountHolderType', value)
      this.render()
      return
    }

    if (action === 'manual-bank-set-account-type') {
      const value = String(target.getAttribute('data-value') || '').trim()
      if (!value) return
      this.updateFormField('bank', 'accountType', value)
      this.render()
      return
    }

    if (action === 'bank-show-manual-entry') {
      this.captureOpenAccordionHeight(this.state.openSection)
      this.state.ui.bank.entryMode = 'manual'
      this.state.ui.bank.saveError = null
      this.render()
      return
    }

    if (action === 'bank-show-entry-options') {
      if (this.state.ui.bank.isSaving) return
      this.captureOpenAccordionHeight(this.state.openSection)
      this.state.ui.bank.entryMode = 'choices'
      this.state.ui.bank.saveError = null
      this.state.ui.bank.errors = {}
      this.state.ui.bank.touched = {}
      this.state.ui.bank.submitAttempted = false
      this.render()
      return
    }

    if (action === 'connect-via-plaid') {
      this._handlePlaidLinkClick()
      return
    }

    if (action === 'docs-open-file') {
      if (this.state.ui.docs.isUploading) return
      const input = this.shadowRoot.querySelector('#docs-file-input')
      if (input) input.click()
      return
    }

    if (action === 'docs-clear-file') {
      if (this.state.ui.docs.isUploading) return
      this.state.ui.docs.fileName = ''
      this.state.ui.docs.file = null
      this.state.ui.docs.uploadError = null
      this.render()
      return
    }

    if (action === 'docs-upload') {
      this._uploadDocument()
      return
    }
  }

  async _uploadDocument() {
    const docs = this.state.ui.docs
    if (!docs.file || !this._operatorId) return

    docs.isUploading = true
    docs.uploadError = null
    this.render()

    try {
      const formData = new FormData()
      formData.append('file', docs.file)
      formData.append('purpose', 'merchant_underwriting')
      await this._kybPostFormData('documents', formData)

      docs.fileName = ''
      docs.file = null
      docs.isUploading = false
      docs.uploadError = null
      this.render()
      this._fetchKybStatus()
    } catch (err) {
      docs.isUploading = false
      docs.uploadError = err?.data?.message || err?.message || 'Upload failed. Please try again.'
      this.render()
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
      this.state.data.owners.noOwnersAbove25 = target.checked
      if (this._operatorId) {
        this.state.ui.ownerEditor.isSaving = true
        this.captureOpenAccordionHeight(this.state.openSection)
      }
      this.render()
      if (this._operatorId) {
        this._submitOwnersToApi()
          .then(() => {
            const prevStatuses = this.getSectionStatuses()
            this.state.ui.ownerEditor.isSaving = false
            this.persist()
            this.maybeAutoAdvanceOpenSection(prevStatuses)
            this.render()
            this._fetchKybStatus()
          })
          .catch(() => {
            this.state.ui.ownerEditor.isSaving = false
            this.render()
          })
      }
      return
    }

    if (target.id === 'docs-file-input') {
      if (this.state.ui.docs.isUploading) return
      const file = target.files && target.files[0]
      if (file) {
        this.state.ui.docs.fileName = file.name
        this.state.ui.docs.file = file
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
      this.state.ui.docs.file = file
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
    const attrs = `${this.testId(`icon-${name}`)} class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`
    if (name === 'unlink') {
      return `<svg ${attrs}><path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"></path><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"></path><line x1="8" y1="2" x2="8" y2="5"></line><line x1="2" y1="8" x2="5" y2="8"></line><line x1="16" y1="19" x2="16" y2="22"></line><line x1="19" y1="16" x2="22" y2="16"></line></svg>`
    }

    const cdnName = this.getCdnIconName(name)
    const cachedSvg = this._iconCache.get(cdnName)
    if (cachedSvg) {
      const injectedAttrs =
        `${this.testId(`icon-${name}`)} class="${escapeHTML(className)}" aria-hidden="true"`
      return cachedSvg
        .replace(/<!--[\s\S]*?-->\s*/g, '')
        .replace(/<svg\b([^>]*)>/i, (_match, attrs) => {
          const sanitizedAttrs = attrs
            .replace(/\sclass=(['"]).*?\1/gi, '')
            .replace(/\saria-hidden=(['"]).*?\1/gi, '')
          return `<svg ${injectedAttrs}${sanitizedAttrs}>`
        })
        .replace(/\n/g, '')
    }

    this.requestLucideIcon(name)

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
    if (name === 'shield-check') {
      return `<svg ${attrs}><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3 8 3z"></path><path d="m9 12 2 2 4-4"></path></svg>`
    }
    if (name === 'check') {
      return `<svg ${attrs}><polyline points="20 6 9 17 4 12"></polyline></svg>`
    }
    if (name === 'star') {
      return `<svg ${attrs}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
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
      return `<svg ${attrs}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`
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

  renderSensitiveFieldNote(isOnFile) {
    if (!isOnFile) return ''
    return `<p class="field-note">On file and hidden for your safety. Leave blank to keep the current value, or enter a new one to replace it.</p>`
  }

  renderSensitiveVerifiedNotice(testIdPrefix) {
    return `
      <div class="info-box info-box-blue icon-box" ${this.testId(`${testIdPrefix}-verified-box`)}>
        ${this.icon('lock', 'icon-4')}
        <p ${this.testId(`${testIdPrefix}-verified-text`)}>
          Date of birth and SSN have already been verified. Those sensitive values are not stored in this form.
        </p>
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
    const controlsDisabled = readOnly || meta.isSaving
    const industryPlaceholder = this._isIndustriesLoading
      ? 'Loading industries...'
      : this._industryLoadError
        ? 'Unable to load industries'
        : 'Select industry...'
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
            disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
            disabled: controlsDisabled,
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
            disabled: controlsDisabled,
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
            placeholder: industryPlaceholder,
            options: this._getIndustryOptions(),
            disabled: controlsDisabled || this._isIndustriesLoading,
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
    const controlsDisabled = readOnly || meta.isSaving
    const dobOnFile = !form.dob && !!form.dobOnFile
    const ssnOnFile = !form.ssn && !!form.ssnOnFile
    const hideSensitiveFields = dobOnFile && ssnOnFile
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
            disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
              error: !!error('zip'),
            }),
          })}
        </div>

        ${
          hideSensitiveFields
            ? this.renderSensitiveVerifiedNotice('officer-sensitive')
            : `<div class="grid-two" ${this.testId('officer-row-dob-ssn')}>
                ${this.renderField({
                  form: 'officer',
                  field: 'dob',
                  label: 'Date of Birth',
                  required: !dobOnFile,
                  error: error('dob'),
                  controlHTML:
                    this.renderTextInput({
                      form: 'officer',
                      field: 'dob',
                      value: form.dob,
                      placeholder: dobOnFile ? 'On file. Enter new DOB to update' : 'MM/DD/YYYY',
                      formatter: 'dob',
                      disabled: controlsDisabled,
                      error: !!error('dob'),
                    }) + this.renderSensitiveFieldNote(dobOnFile),
                })}
                ${this.renderField({
                  form: 'officer',
                  field: 'ssn',
                  label: 'Full SSN',
                  required: !ssnOnFile,
                  error: error('ssn'),
                  controlHTML:
                    this.renderPasswordInput({
                      form: 'officer',
                      field: 'ssn',
                      value: form.ssn,
                      placeholder: ssnOnFile ? 'On file. Enter new SSN to update' : 'XXX-XX-XXXX',
                      formatter: 'ssn',
                      disabled: controlsDisabled,
                      error: !!error('ssn'),
                      passwordFieldKey: 'officerSsn',
                    }) + this.renderSensitiveFieldNote(ssnOnFile),
                })}
              </div>

              <div class="info-box info-box-blue icon-box" ${this.testId('officer-security-box')}>
                ${this.icon('lock', 'icon-4')}
                <p ${this.testId('officer-security-text')}>
                  Sensitive identity fields like date of birth and SSN are hidden after save for your safety. Enter a new value only if you need to replace what is already on file.
                </p>
              </div>`
        }

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
            disabled: controlsDisabled,
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

  renderOwnerFormInline(readOnly = false) {
    const meta = this.state.ui.ownerEditor
    const form = meta.form
    const controlsDisabled = readOnly || meta.isSaving
    const dobOnFile = !form.dob && !!form.dobOnFile
    const ssnOnFile = !form.ssn && !!form.ssnOnFile
    const hideSensitiveFields = dobOnFile && ssnOnFile
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
            disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
              error: !!error('zip'),
            }),
          })}
        </div>

        ${
          hideSensitiveFields
            ? this.renderSensitiveVerifiedNotice('owner-sensitive')
            : `<div class="grid-two" ${this.testId('owner-row-dob-ssn')}>
                ${this.renderField({
                  form: 'owner',
                  field: 'dob',
                  label: 'Date of Birth',
                  required: !dobOnFile,
                  error: error('dob'),
                  controlHTML:
                    this.renderTextInput({
                      form: 'owner',
                      field: 'dob',
                      value: form.dob,
                      placeholder: dobOnFile ? 'On file. Enter new DOB to update' : 'MM/DD/YYYY',
                      formatter: 'dob',
                      disabled: controlsDisabled,
                      error: !!error('dob'),
                    }) + this.renderSensitiveFieldNote(dobOnFile),
                })}
                ${this.renderField({
                  form: 'owner',
                  field: 'ssn',
                  label: 'Full SSN',
                  required: !ssnOnFile,
                  error: error('ssn'),
                  controlHTML:
                    this.renderPasswordInput({
                      form: 'owner',
                      field: 'ssn',
                      value: form.ssn,
                      placeholder: ssnOnFile ? 'On file. Enter new SSN to update' : 'XXX-XX-XXXX',
                      formatter: 'ssn',
                      disabled: controlsDisabled,
                      error: !!error('ssn'),
                      passwordFieldKey: 'ownerSsn',
                    }) + this.renderSensitiveFieldNote(ssnOnFile),
                })}
              </div>

              <div class="info-box info-box-blue icon-box" ${this.testId('owner-security-box')}>
                ${this.icon('lock', 'icon-4')}
                <p ${this.testId('owner-security-text')}>
                  Sensitive identity fields like date of birth and SSN are hidden after save for your safety. Enter a new value only if you need to replace what is already on file.
                </p>
              </div>`
        }

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
              disabled: controlsDisabled,
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
              disabled: controlsDisabled,
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
            ${controlsDisabled ? 'disabled' : ''}
          >
            Cancel
          </button>
          <button
            ${this.testId('owner-save-button')}
            class="btn btn-primary"
            type="button"
            data-action="owner-save"
            ${controlsDisabled ? 'disabled' : ''}
          >
            ${meta.isSaving ? `${this.icon('loader', 'icon-4 spin')}<span>Saving...</span>` : '<span>Save Owner</span>'}
          </button>
        </div>
      </div>
    `
  }

  renderOwnerCard(owner, disabled = false) {
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
            ${disabled ? 'disabled' : ''}
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
            ${disabled ? 'disabled' : ''}
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
    const controlsDisabled = readOnly || editor.isSaving
    const isShowingForm = !!editor.mode

    const ownerRows = ownersData.owners
      .map((owner) => {
        if (!readOnly && editor.mode === 'edit' && editor.editingId === owner.id) {
          return this.renderOwnerFormInline(readOnly)
        }
        return this.renderOwnerCard(owner, controlsDisabled)
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
            ? `<div ${this.testId('owner-add-form-wrap')}>${this.renderOwnerFormInline(readOnly)}</div>`
            : ''
        }

        ${
          !readOnly && !isShowingForm
            ? `<button
                ${this.testId('owner-add-button')}
                type="button"
                data-action="owner-add"
                class="add-owner-btn"
                ${ownersData.noOwnersAbove25 || controlsDisabled ? 'disabled' : ''}
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
                  ${controlsDisabled ? 'disabled' : ''}
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
    const controlsDisabled = readOnly || meta.isSaving
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
            disabled: controlsDisabled,
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
            disabled: controlsDisabled,
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
            disabled: controlsDisabled,
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
    const meta = this.state.ui.bank
    const controlsDisabled = readOnly || this._isPlaidLinkInProgress || this._isBankAccountsLoading || meta.isSaving
    const linked = this._linkedBankAccount

    if (this._isBankAccountsLoading && !linked) {
      return `
        <div class="form-stack bank-form-stack" ${this.testId('bank-form')}>
          <div class="connected-card" ${this.testId('bank-loading-card-verification')}>
            <div class="connected-main" ${this.testId('bank-loading-main-verification')}>
              <div class="connected-icon" ${this.testId('bank-loading-icon-verification')}>${this.icon('loader', 'icon-5 spin')}</div>
              <div class="connected-copy" ${this.testId('bank-loading-copy-verification')}>
                <p class="connected-title" ${this.testId('bank-loading-title-verification')}>Loading bank account</p>
                <p class="connected-meta" ${this.testId('bank-loading-meta-verification')}>Checking for a linked operator bank account.</p>
              </div>
            </div>
          </div>
        </div>
      `
    }

    if (linked) {
      return `
        <div class="form-stack bank-form-stack" ${this.testId('bank-form')}>
          <div class="connected-card" ${this.testId('bank-connected-card-verification')}>
            <div class="connected-main" ${this.testId('bank-connected-main-verification')}>
              <div class="connected-icon" ${this.testId('bank-connected-icon-verification')}>${this.icon('landmark', 'icon-5')}</div>
              <div class="connected-copy" ${this.testId('bank-connected-copy-verification')}>
                <p class="connected-title" ${this.testId('bank-connected-title-verification')}>${escapeHTML(linked.institutionName)}</p>
                <p class="connected-meta" ${this.testId('bank-connected-meta-verification')}>${escapeHTML(linked.accountName)}${linked.mask ? ` ••••${escapeHTML(linked.mask)}` : ''}</p>
                ${linked.connectedAt ? `<p class="connected-date" ${this.testId('bank-connected-date-verification')}>Added ${escapeHTML(linked.connectedAt)}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      `
    }

    if (readOnly) return ''

    const form = this.state.data.bank
    const error = (field) => this.getVisibleError(meta, field)
    const holderType = String(form.accountHolderType || 'business').trim() || 'business'
    const accountType = String(form.accountType || 'checking').trim() || 'checking'
    const accountHolderName = form.accountHolderName || ''
    const holderTypeOptions = [
      { value: 'business', label: 'Business' },
      { value: 'individual', label: 'Individual' },
    ]
    const accountTypeOptions = [
      { value: 'checking', label: 'Checking' },
      { value: 'savings', label: 'Savings' },
    ]
    const entryMode = meta.entryMode === 'manual' ? 'manual' : 'choices'
    const renderChoiceButtons = (options, selectedValue, action, testIdPrefix) =>
      options.map((option) => `
        <button
          ${this.testId(`${testIdPrefix}-${option.value}`)}
          class="manual-choice-pill ${selectedValue === option.value ? 'is-selected' : ''}"
          type="button"
          data-action="${escapeHTML(action)}"
          data-value="${escapeHTML(option.value)}"
          aria-pressed="${selectedValue === option.value ? 'true' : 'false'}"
          ${controlsDisabled ? 'disabled' : ''}
        >
          ${escapeHTML(option.label)}
        </button>
      `).join('')
    const choiceScreenMarkup = `
        <div class="bank-entry-screen bank-entry-screen-choices" ${this.testId('bank-entry-screen-choices')}>
          <div class="bank-entry-choice-grid" ${this.testId('bank-entry-choice-grid')}>
          <button
            ${this.testId('plaid-connect-button')}
            type="button"
            class="bank-entry-choice-card"
            data-action="connect-via-plaid"
            ${controlsDisabled ? 'disabled' : ''}
          >
            <div class="bank-entry-choice-icon" ${this.testId('plaid-icon-wrap')}>
              ${this._isPlaidLinkInProgress ? this.icon('loader', 'icon-6 spin') : this.icon('landmark', 'icon-6')}
            </div>
            <div class="bank-entry-choice-copy" ${this.testId('plaid-copy')}>
              <p class="bank-entry-choice-title" ${this.testId('plaid-title')}>
                ${this._isPlaidLinkInProgress ? 'Connecting...' : 'Connect bank via Plaid'}
              </p>
              <p class="bank-entry-choice-desc" ${this.testId('plaid-desc')}>
                Secure, instant verification
              </p>
            </div>
          </button>

          <button
            ${this.testId('bank-entry-choice-manual')}
            type="button"
            class="bank-entry-choice-card bank-entry-choice-card-secondary"
            data-action="bank-show-manual-entry"
            ${controlsDisabled ? 'disabled' : ''}
          >
            <div class="bank-entry-choice-icon bank-entry-choice-icon-secondary" ${this.testId('bank-entry-choice-manual-icon')}>
              ${this.icon('pencil', 'icon-6')}
            </div>
            <div class="bank-entry-choice-copy" ${this.testId('bank-entry-choice-manual-copy')}>
              <p class="bank-entry-choice-title" ${this.testId('bank-entry-choice-manual-title')}>
                Enter Manually
              </p>
              <p class="bank-entry-choice-desc" ${this.testId('bank-entry-choice-manual-desc')}>
                Routing and account number entry
              </p>
            </div>
          </button>
        </div>
      </div>
    `
    const manualScreenMarkup = `
      <div class="bank-entry-screen manual-bank-entry" ${this.testId('bank-manual-entry')}>
        <div class="manual-bank-panel" aria-busy="${meta.isSaving ? 'true' : 'false'}" ${this.testId('bank-manual-panel')}>
          <div class="manual-bank-panel-header" ${this.testId('bank-manual-panel-header')}>
            <button
              ${this.testId('bank-manual-back')}
              class="manual-bank-back"
              type="button"
              data-action="bank-show-entry-options"
              ${controlsDisabled ? 'disabled' : ''}
            >
              Back
            </button>
            <div>
              <h5 class="manual-bank-panel-title" ${this.testId('bank-manual-panel-title')}>Enter Bank Details</h5>
              <p class="manual-bank-panel-subtitle" ${this.testId('bank-manual-panel-subtitle')}>
                Verification via micro-deposits (1-3 business days)
              </p>
            </div>
          </div>

          ${meta.saveError
            ? `<div class="info-box info-box-error manual-bank-error" role="alert" ${this.testId('bank-manual-error')}>
                 ${this.icon('alert-circle', 'icon-4')}
                 <p ${this.testId('bank-manual-error-copy')}>${escapeHTML(meta.saveError)}</p>
               </div>`
            : ''}

          ${this.renderField({
            form: 'bank',
            field: 'accountHolderName',
            label: 'Account Holder Name',
            controlHTML: this.renderTextInput({
              form: 'bank',
              field: 'accountHolderName',
              value: accountHolderName,
              placeholder: 'Legal business or individual name',
              disabled: controlsDisabled,
              error: !!error('accountHolderName'),
            }),
            error: error('accountHolderName'),
            fieldTestId: 'field-bank-account-holder-name',
          })}

          <div class="field" ${this.testId('field-bank-account-holder-type')}>
            <label class="field-label" ${this.testId('label-bank-account-holder-type')}>Account Holder Type</label>
            <div class="manual-choice-grid" ${this.testId('bank-account-holder-type-options')}>
              ${renderChoiceButtons(holderTypeOptions, holderType, 'manual-bank-set-holder-type', 'bank-account-holder-type')}
            </div>
          </div>

          ${this.renderField({
            form: 'bank',
            field: 'routingNumber',
            label: 'Routing Number',
            controlHTML: this.renderTextInput({
              form: 'bank',
              field: 'routingNumber',
              value: form.routingNumber,
              placeholder: '123456789',
              formatter: 'routing',
              disabled: controlsDisabled,
              error: !!error('routingNumber'),
            }),
            error: error('routingNumber'),
          })}

          ${this.renderField({
            form: 'bank',
            field: 'accountNumber',
            label: 'Account Number',
            controlHTML: this.renderTextInput({
              form: 'bank',
              field: 'accountNumber',
              value: form.accountNumber,
              placeholder: 'Enter account number',
              disabled: controlsDisabled,
              error: !!error('accountNumber'),
            }),
            error: error('accountNumber'),
          })}

          ${this.renderField({
            form: 'bank',
            field: 'confirmAccountNumber',
            label: 'Confirm Account Number',
            controlHTML: this.renderTextInput({
              form: 'bank',
              field: 'confirmAccountNumber',
              value: form.confirmAccountNumber || '',
              placeholder: 'Re-enter account number',
              disabled: controlsDisabled,
              error: !!error('confirmAccountNumber'),
            }),
            error: error('confirmAccountNumber'),
            fieldTestId: 'field-bank-confirm-account-number',
          })}

          <div class="field" ${this.testId('field-bank-account-type-pill')}>
            <label class="field-label" ${this.testId('label-bank-account-type-pill')}>Account Type</label>
            <div class="manual-choice-grid" ${this.testId('bank-account-type-options')}>
              ${renderChoiceButtons(accountTypeOptions, accountType, 'manual-bank-set-account-type', 'bank-account-type')}
            </div>
          </div>

          <div class="info-box manual-bank-info" ${this.testId('bank-manual-info')}>
            ${this.icon('alert-circle', 'icon-4 manual-bank-info-icon')}
            <p ${this.testId('bank-manual-info-copy')}>
              After submitting, two small deposits will be sent to your bank account within 1-3 business days.
              You'll need to enter a verification code from those deposits to complete the linking process.
            </p>
          </div>

          <button
            ${this.testId('bank-manual-submit')}
            class="btn btn-primary full-width manual-bank-submit"
            type="button"
            data-action="save-form"
            data-form="bank"
            ${controlsDisabled ? 'disabled' : ''}
          >
            ${meta.isSaving ? `${this.icon('loader', 'icon-4 spin')}<span>Linking bank account...</span>` : 'Link Bank Account'}
          </button>
        </div>
      </div>
    `

    return `
      <div class="form-stack bank-form-stack" ${this.testId('bank-form')}>
        ${entryMode === 'manual' ? manualScreenMarkup : choiceScreenMarkup}
      </div>
    `
  }

  renderDocumentsSection(readOnly, statuses, statusMessages) {
    const docsStatus = statuses.docs

    // Show prefetched document from API
    if (this._prefetchedDocs) {
      const doc = this._prefetchedDocs
      const docName = doc.filename || doc.fileName || doc.name || 'Document'
      const docSize = doc.size ? this._formatFileSize(doc.size) : null
      const docStatus = doc.status || doc.purpose || null
      return `
        <div class="form-stack" ${this.testId('documents-prefetched-ui')}>
          <div class="file-preview" ${this.testId('documents-prefetched-preview')}>
            <div class="file-preview-icon" ${this.testId('documents-prefetched-icon')}>${this.icon('file-text', 'icon-5')}</div>
            <div class="file-preview-copy" ${this.testId('documents-prefetched-copy')}>
              <p class="file-name" ${this.testId('documents-prefetched-name')}>${escapeHTML(docName)}</p>
              <p class="file-status" ${this.testId('documents-prefetched-meta')}>
                ${docSize ? escapeHTML(docSize) : ''}${docSize && docStatus ? ' · ' : ''}${docStatus ? escapeHTML(docStatus) : 'Submitted'}
              </p>
            </div>
          </div>
        </div>
      `
    }

    if (!readOnly) {
      const fileName = this.state.ui.docs.fileName
      const isDragging = this.state.ui.docs.isDragging
      const isUploading = this.state.ui.docs.isUploading
      const uploadError = this.state.ui.docs.uploadError
      return `
        <div class="form-stack" ${this.testId('documents-upload-ui')}>
          ${docsStatus === 'document-requested' ? `
          <div class="info-box info-box-warning" ${this.testId('documents-need-box')}>
            ${this.icon('clock', 'icon-4')}
            <div>
              <p class="docs-title" ${this.testId('documents-title')}>Missing Information</p>
              <p class="docs-text" ${this.testId('documents-text')}>Business Verification Documents</p>
            </div>
          </div>` : ''}

          <div class="docs-subsection" ${this.testId('documents-verification-section')}>
            <div class="docs-subsection-header">
              <p class="docs-subsection-title" ${this.testId('documents-verification-title')}>Business Verification</p>
              <span class="badge badge-warning" ${this.testId('documents-verification-badge')}>Required</span>
            </div>
            <p class="docs-subsection-desc" ${this.testId('documents-verification-desc')}>
              Upload business verification documents required by Moov to verify your business. Accepted formats: PDF, PNG, JPG, CSV (max 20MB each).
            </p>

            ${uploadError ? `<p class="form-error" ${this.testId('documents-upload-error')}>${escapeHTML(uploadError)}</p>` : ''}

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
                      ${isUploading ? 'disabled' : ''}
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
                    <p class="dropzone-title" ${this.testId('documents-dropzone-title')}>Select file or drop here</p>
                    <p class="dropzone-subtitle" ${this.testId('documents-dropzone-subtitle')}>PDF, CSV, JPEG, PNG accepted (20MB max)</p>
                    <input
                      ${this.testId('documents-file-input')}
                      id="docs-file-input"
                      type="file"
                      accept=".pdf,.csv,.jpg,.jpeg,.png"
                      class="hidden"
                      ${isUploading ? 'disabled' : ''}
                    />
                  </div>`
            }
          </div>

          <div class="docs-submit-row" ${this.testId('documents-submit-row')}>
            <button
              class="btn btn-primary"
              type="button"
              data-action="docs-upload"
              ${!fileName || isUploading ? 'disabled' : ''}
              ${this.testId('documents-upload-button')}
            >
              ${isUploading ? this.icon('loader', 'icon-4 spin') : ''}
              <span>${isUploading ? 'Uploading...' : 'Submit Documents'}</span>
            </button>
          </div>
        </div>
      `
    }

    return `
      <div class="documents-empty" ${this.testId('documents-empty')}>
        ${this.icon('file-text', 'icon-8 muted-icon')}
        <p ${this.testId('documents-empty-copy')}>
          ${
            readOnly
              ? 'No additional documents were needed for verification.'
              : "No documents are currently required for verification. If that changes, we'll show you exactly what to upload here."
          }
        </p>
      </div>
    `
  }

  _formatFileSize(bytes) {
    const n = Number(bytes)
    if (!n || !Number.isFinite(n)) return ''
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    return `${(n / (1024 * 1024)).toFixed(1)} MB`
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

        // Don't resize while a save is in-flight — the content height may
        // temporarily differ (spinner vs. submit button) and would cause a jump.
        if (this.isSectionSaving(sectionKey)) return

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

    const isSaving = this.isSectionSaving(section.key)

    return `
      <div class="section-card ${isSaving ? 'section-card--saving' : ''}" aria-busy="${isSaving ? 'true' : 'false'}" ${this.testId(`section-${section.key}`)}>
        <button
          ${this.testId(`section-toggle-${section.key}`)}
          type="button"
          data-action="toggle-section"
          data-section="${escapeHTML(section.key)}"
          class="section-toggle"
          ${isSaving ? 'disabled' : ''}
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
          ${isSaving
            ? `<span class="section-saving-spinner" ${this.testId(`section-saving-spinner-${section.key}`)}>${this.icon('loader', 'icon-5 spin')}</span>`
            : `<span class="chevron ${isOpen ? 'open' : ''}" ${this.testId(`section-chevron-${section.key}`)}>${this.icon('chevron-down', 'icon-5')}</span>`
          }
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

  renderVerificationTab(statuses, statusMessages, progress, isProgressComplete, isVerified) {
    const statusStage = isVerified ? 'complete' : 'progress'
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
              <span class="progress-value ${isProgressComplete ? 'progress-success' : 'progress-warning'}" ${this.testId('progress-value')}>
                ${escapeHTML(String(progress))}% complete
              </span>
            </div>
            <div class="progress-track" ${this.testId('progress-track')}>
              <div class="progress-fill ${isProgressComplete ? 'progress-success-bg' : 'progress-warning-bg'}" style="width: ${escapeHTML(
        String(progress)
      )}%;" ${this.testId('progress-fill')}></div>
            </div>
            <p class="progress-copy" ${this.testId('progress-copy')}>
              Verification is automatic once all required info is submitted. Most accounts are verified within a minute.
            </p>
          </div>

          ${
            isVerified
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

        ${this._isStatusLoading ? `<div class="kyb-status-loading kyb-status-loading--visible" aria-live="polite" ${this.testId('kyb-status-loading')}>
          ${this.icon('loader', 'icon-4 spin')} Loading verification status...
        </div>` : ''}

        <div class="section-list" ${this.testId(sectionListTestId)}>
          ${SECTION_DEFS.map((section) => {
            const sectionStatus = statuses[section.key] || 'not-started'
            const lockedByProfile = this._isProfileLocked && (sectionStatus === 'complete' || sectionStatus === 'verified')
            const sectionReadOnly = isVerified || lockedByProfile
            return this.renderSection(section, sectionReadOnly, statuses, statusMessages, isVerified || this._isStatusLoading)
          }).join('')}
        </div>
      </div>
    `
  }

  renderBankAccountTab(statuses) {
    void statuses
    const bankUi = this.state.ui.bank
    const bankAccounts = this._operatorBankAccounts
      .map((account) => this._mapOperatorBankAccount(account))
      .filter(Boolean)
    const hasBankConnected = bankAccounts.length > 0
    const hasDefaultBankAccount = bankAccounts.some((account) => account.isDefault)
    const pendingDefaultId = String(bankUi.pendingDefaultId || '').trim()
    const pendingDefaultPhase = String(bankUi.pendingDefaultPhase || '').trim()
    const bankActionToast = bankUi.actionToast
    const removingAccountId = String(bankUi.removingAccountId || '').trim()
    const deleteModal = bankUi.deleteModal
    const savedMethods = this._kybStatus?.selectedPaymentMethods
    const paymentStatuses = PAYMENT_METHOD_STATUSES['new-account']
    const paymentRows = PAYMENT_METHODS.filter((method) =>
      !Array.isArray(savedMethods) || savedMethods.length === 0 || savedMethods.includes(method.id)
    ).map((method) => {
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

    const bankCards = bankAccounts.map((account, index) => {
      const accountKey = account.id || `account-${index + 1}`
      const isPendingDefault = pendingDefaultId === accountKey
      const isRemovingAccount = removingAccountId === accountKey
      const areBankActionsDisabled = !!pendingDefaultId || this._isBankAccountsLoading || !!removingAccountId || !!deleteModal.isSubmitting
      const verifiedChipMarkup = account.isVerified
        ? `<span class="bank-account-chip bank-account-chip-verified" ${this.testId(`bank-account-verified-${accountKey}`)}>
             ${this.icon('shield-check', 'icon-3')}
             Verified
           </span>`
        : ''
      const verifyButtonMarkup = account.isVerified
        ? ''
        : `<button
             ${this.testId(`bank-account-verify-${accountKey}`)}
             class="bank-account-verify-btn"
             type="button"
             data-action="bank-account-verify"
             data-bank-account-id="${escapeHTML(accountKey)}"
             ${areBankActionsDisabled ? 'disabled' : ''}
           >
             Verify
           </button>`
      const setDefaultButtonMarkup = account.isVerified
        ? `<button
             ${this.testId(`bank-account-set-default-${accountKey}`)}
             class="icon-btn icon-btn-primary"
             type="button"
             data-action="bank-account-set-default"
             data-bank-account-id="${escapeHTML(accountKey)}"
             aria-label="Set ${escapeHTML(account.institutionName)} as default bank account"
             ${areBankActionsDisabled ? 'disabled' : ''}
           >
             ${this.icon('star', 'icon-4')}
           </button>`
        : ''
      const actionsMarkup = `<div class="bank-account-actions" ${this.testId(`bank-account-actions-${accountKey}`)}>
                   ${verifyButtonMarkup}
                   ${setDefaultButtonMarkup}
                   <button
                     ${this.testId(`bank-account-remove-${accountKey}`)}
                     class="icon-btn icon-btn-error"
                     type="button"
                     data-action="bank-account-remove"
                     data-bank-account-id="${escapeHTML(accountKey)}"
                     aria-label="Unlink ${escapeHTML(account.institutionName)} bank account"
                     ${areBankActionsDisabled ? 'disabled' : ''}
                   >
                     ${this.icon('unlink', 'icon-4')}
                   </button>
                 </div>`
      const spinnerMarkup = `<span class="bank-account-spinner" ${this.testId(`bank-account-spinner-${accountKey}`)}>
                   ${this.icon('loader', 'icon-4 spin')}
                 </span>`
      const defaultMarkup = `<div class="bank-account-side-group" ${this.testId(`bank-account-side-group-${accountKey}`)}>
                   ${verifyButtonMarkup}
                   <span class="bank-account-chip bank-account-chip-default" ${this.testId(`bank-account-default-${accountKey}`)}>Default</span>
                 </div>`
      let sideContent = defaultMarkup
      let sideSurfaceClass = 'bank-account-side-surface'

      if (account.isDefault) {
        if (isPendingDefault && pendingDefaultPhase === 'default-in') {
          sideSurfaceClass += ' bank-account-side-enter-left'
        }
      } else if (isPendingDefault) {
        if (pendingDefaultPhase === 'actions-out') {
          sideContent = actionsMarkup
          sideSurfaceClass += ' bank-account-side-exit-right'
        } else if (pendingDefaultPhase === 'actions-in') {
          sideContent = actionsMarkup
          sideSurfaceClass += ' bank-account-side-enter-left'
        } else {
          sideContent = spinnerMarkup
          if (pendingDefaultPhase === 'spinner-in') {
            sideSurfaceClass += ' bank-account-side-enter-left'
          } else if (pendingDefaultPhase === 'spinner-out-success' || pendingDefaultPhase === 'spinner-out-fail') {
            sideSurfaceClass += ' bank-account-side-exit-right'
          }
        }
      } else {
        sideContent = actionsMarkup
      }

      return `
        <div class="connected-card bank-account-card ${isRemovingAccount ? 'bank-account-card-removing' : ''}" ${this.testId(`bank-account-card-${accountKey}`)}>
          <div class="connected-main" ${this.testId(`bank-account-main-${accountKey}`)}>
            <div class="connected-icon" ${this.testId(`bank-account-icon-${accountKey}`)}>${this.icon('landmark', 'icon-5')}</div>
            <div class="connected-copy" ${this.testId(`bank-account-copy-${accountKey}`)}>
              <p class="connected-title" ${this.testId(`bank-account-title-${accountKey}`)}>${escapeHTML(account.institutionName)}</p>
              <p class="connected-meta" ${this.testId(`bank-account-meta-${accountKey}`)}>${escapeHTML(account.accountName)}${account.mask ? ` ••••${escapeHTML(account.mask)}` : ''}</p>
              <div class="connected-meta-row" ${this.testId(`bank-account-meta-row-${accountKey}`)}>
                ${account.connectedAt ? `<p class="connected-date" ${this.testId(`bank-account-date-${accountKey}`)}>Added ${escapeHTML(account.connectedAt)}</p>` : ''}
                ${verifiedChipMarkup}
              </div>
            </div>
          </div>
          <div class="connected-side" ${this.testId(`bank-account-side-${accountKey}`)}>
            <div class="${sideSurfaceClass}" ${this.testId(`bank-account-side-surface-${accountKey}`)}>
              ${sideContent}
            </div>
          </div>
        </div>
      `
    }).join('')

    const bankActionToastHTML = bankActionToast?.message
      ? `<div class="bank-action-toast-layer" ${this.testId('bank-action-toast-layer')}>
           <div class="bank-action-toast bank-action-toast-${escapeHTML(bankActionToast.tone || 'error')}" role="alert" aria-live="polite" ${this.testId('bank-action-toast')}>
             <span class="bank-action-toast-icon" ${this.testId('bank-action-toast-icon')}>${this.icon('alert-circle', 'icon-4')}</span>
             <span class="bank-action-toast-copy" ${this.testId('bank-action-toast-copy')}>${escapeHTML(bankActionToast.message)}</span>
           </div>
         </div>`
      : ''

    return `
      <div class="bank-tab-stack" ${this.testId('bank-tab')}>
        ${
          this._isBankAccountsLoading && !hasBankConnected
            ? `<div class="connected-card" ${this.testId('bank-loading-card')}>
                <div class="connected-main" ${this.testId('bank-loading-main')}>
                  <div class="connected-icon" ${this.testId('bank-loading-icon')}>${this.icon('loader', 'icon-5 spin')}</div>
                  <div class="connected-copy" ${this.testId('bank-loading-copy')}>
                    <p class="connected-title" ${this.testId('bank-loading-title')}>Loading bank account</p>
                    <p class="connected-meta" ${this.testId('bank-loading-meta')}>Checking for a linked operator bank account.</p>
                  </div>
                </div>
              </div>`
            : hasBankConnected
            ? `<div class="bank-account-wrap" ${this.testId('bank-account-wrap')}>
                ${bankActionToastHTML}
                ${
                  hasDefaultBankAccount
                    ? ''
                    : `<div class="info-box info-box-warning bank-alert" ${this.testId('bank-no-default-banner')}>
                         ${this.icon('alert-circle', 'icon-5')}
                         <div class="bank-alert-copy" ${this.testId('bank-no-default-copy-wrap')}>
                           <p class="bank-alert-title" ${this.testId('bank-no-default-title')}>No default bank account</p>
                           <p class="bank-alert-text" ${this.testId('bank-no-default-text')}>
                             Please set a default bank account to receive payments from your working interest owners.
                           </p>
                         </div>
                       </div>`
                }
                <div class="connected-list" ${this.testId('bank-account-list')}>
                  ${bankCards}
                </div>
              </div>
              ${hasDefaultBankAccount
                ? `<p class="help-text" ${this.testId('bank-connected-help')}>
                     Deposits from your working interest owners are sent to your default bank account.
                   </p>`
                : ''}`
            : `<div class="bank-empty" ${this.testId('bank-empty')}>
                ${this.icon('landmark', 'icon-8 muted-icon')}
                <h3 class="bank-empty-title" ${this.testId('bank-empty-title')}>No bank account connected</h3>
                <p class="bank-empty-copy" ${this.testId('bank-empty-copy')}>
                  Connect a bank account to receive payments from your WIOs
                </p>
                <button class="btn btn-primary btn-sm" type="button" data-action="connect-via-plaid" ${this._isPlaidLinkInProgress ? 'disabled' : ''} ${this.testId('bank-connect-plaid')}>${this._isPlaidLinkInProgress ? `${this.icon('loader', 'icon-4 spin')}<span>Connecting...</span>` : 'Connect via Plaid'}</button>
              </div>`
        }

        <div class="methods-wrap" ${this.testId('payment-methods-wrap')}>
          <h3 class="methods-label" ${this.testId('payment-methods-label')}>Accepted Payment Methods</h3>
          <div class="methods-list" ${this.testId('payment-methods-list')}>
            ${paymentRows}
          </div>
          <p class="help-text" ${this.testId('payment-methods-help')}>
            Payment method availability is determined during verification.
          </p>
        </div>
      </div>
    `
  }

  renderBankDeleteModal() {
    const deleteModal = this.state.ui.bank.deleteModal
    if (!deleteModal.isOpen) return ''

    const accountName = deleteModal.bankName || 'this bank account'
    const accountLabel = deleteModal.accountLabel ? `<p class="bank-delete-account" ${this.testId('bank-delete-account')}>${escapeHTML(deleteModal.accountLabel)}</p>` : ''

    return `
      <div class="bo-submodal-layer" ${this.testId('bank-delete-modal-layer')}>
        <div class="bo-submodal-backdrop" ${this.testId('bank-delete-modal-backdrop')} data-action="bank-delete-cancel"></div>
        <div class="bo-submodal" role="dialog" aria-modal="true" aria-labelledby="bank-delete-title" ${this.testId('bank-delete-modal')}>
          <div class="bo-submodal-header" ${this.testId('bank-delete-modal-header')}>
            <div class="bo-submodal-icon" ${this.testId('bank-delete-modal-icon')}>${this.icon('unlink', 'icon-5')}</div>
            <div class="bo-submodal-copy" ${this.testId('bank-delete-modal-copy')}>
              <h3 class="bo-submodal-title" id="bank-delete-title" ${this.testId('bank-delete-title')}>Unlink bank account?</h3>
              <p class="bo-submodal-text" ${this.testId('bank-delete-text')}>
                This will unlink ${escapeHTML(accountName)} from the operator.
              </p>
              ${accountLabel}
            </div>
          </div>

          ${deleteModal.errorMessage ? `<p class="bank-delete-error" ${this.testId('bank-delete-error')}>${escapeHTML(deleteModal.errorMessage)}</p>` : ''}

          <div class="bo-submodal-actions" ${this.testId('bank-delete-actions')}>
            <button
              class="btn btn-ghost"
              type="button"
              data-action="bank-delete-cancel"
              ${deleteModal.isSubmitting ? 'disabled' : ''}
              ${this.testId('bank-delete-cancel')}
            >
              Cancel
            </button>
            <button
              class="btn btn-danger"
              type="button"
              data-action="bank-delete-confirm"
              ${deleteModal.isSubmitting ? 'disabled' : ''}
              ${this.testId('bank-delete-confirm')}
            >
              ${deleteModal.isSubmitting ? `${this.icon('loader', 'icon-4 spin')}<span>Unlinking...</span>` : 'Yes, unlink bank account'}
            </button>
          </div>
        </div>
      </div>
    `
  }

  renderWelcomeModal() {
    const welcome = this.state.ui.welcome
    if (!welcome.isOpen) return ''

    const step = welcome.step === 2 ? 2 : 1
    const selectedMethods = welcome.selectedMethods
    const isSaving = !!welcome.isSaving
    const toast = welcome.toast
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
          aria-pressed="${isSelected ? 'true' : 'false'}"
          aria-disabled="${isSaving ? 'true' : 'false'}"
          ${isSaving ? 'disabled' : ''}
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

    const toastHTML = toast?.message
      ? `<div class="welcome-toast welcome-toast-${escapeHTML(toast.tone || 'success')}" role="${toast.tone === 'error' ? 'alert' : 'status'}" aria-live="polite" ${this.testId('welcome-toast')}>
          <span class="welcome-toast-icon" ${this.testId('welcome-toast-icon')}>${
            toast.tone === 'error' ? this.icon('alert-circle', 'icon-4') : this.icon('check-circle', 'icon-4')
          }</span>
          <span class="welcome-toast-copy" ${this.testId('welcome-toast-copy')}>${escapeHTML(toast.message)}</span>
        </div>`
      : ''

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

                  ${toastHTML}

                  <div class="welcome-actions" ${this.testId('welcome-actions-step-1')}>
                    <button
                      ${this.testId('welcome-continue-button')}
                      type="button"
                      class="btn btn-primary full-width"
                      data-action="welcome-continue"
                      ${selectedMethods.length === 0 || isSaving ? 'disabled' : ''}
                    >
                      ${
                        isSaving
                          ? `${this.icon('loader', 'icon-4 spin')}<span>Saving...</span>`
                          : 'Continue →'
                      }
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

        .bo-submodal-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 3;
        }

        .bo-submodal-backdrop {
          position: absolute;
          inset: 0;
          background: rgb(15 42 57 / 0.28);
          backdrop-filter: blur(2px);
        }

        .bo-submodal {
          position: relative;
          width: min(100%, 28rem);
          border-radius: 1rem;
          border: 1px solid var(--color-border);
          background: #fff;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.22);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: boSubmodalIn 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bo-submodal-header {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
        }

        .bo-submodal-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          background: rgb(221 82 75 / 0.08);
          color: var(--color-error);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bo-submodal-copy {
          min-width: 0;
        }

        .bo-submodal-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 1rem;
          font-weight: 600;
        }

        .bo-submodal-text {
          margin: 0.375rem 0 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
          line-height: 1.45;
        }

        .bank-delete-account {
          margin: 0.5rem 0 0;
          color: var(--color-headline);
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .bank-delete-error {
          margin: 0;
          color: var(--color-error);
          font-size: 0.8125rem;
          line-height: 1.4;
        }

        .bo-submodal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
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

        .welcome-method-card:disabled {
          cursor: not-allowed;
          opacity: 0.7;
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

        .welcome-toast {
          margin-top: 0.875rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          padding: 0.75rem 0.875rem;
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          font-size: 0.8125rem;
          line-height: 1.4;
        }

        .welcome-toast-success {
          background: rgb(76 123 99 / 0.08);
          border-color: rgb(76 123 99 / 0.16);
          color: var(--color-primary);
        }

        .welcome-toast-error {
          background: rgb(221 82 75 / 0.08);
          border-color: rgb(221 82 75 / 0.16);
          color: var(--color-error);
        }

        .welcome-toast-icon {
          flex-shrink: 0;
          display: inline-flex;
          margin-top: 0.0625rem;
        }

        .welcome-toast-copy {
          color: inherit;
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

        .kyb-status-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--color-secondary);
          font-size: 0.875rem;
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--duration-normal);
        }

        .kyb-status-loading--visible {
          opacity: 1;
          pointer-events: auto;
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
          gap: 0.75rem;
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

        .status-progress-block {
          position: relative;
          z-index: 1;
          transition:
            opacity 240ms ease,
            transform 240ms ease,
            max-height 280ms ease,
            margin 280ms ease;
          max-height: 8rem;
        }

        .verification-status-card[data-status-stage="complete"] .status-progress-block {
          opacity: 0;
          transform: translateY(-10px);
          max-height: 0;
          margin: 0;
          overflow: hidden;
          pointer-events: none;
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

        .section-toggle:disabled {
          cursor: default;
        }

        .section-card--saving {
          opacity: 0.85;
          transition: opacity var(--duration-normal);
        }

        .section-card--saving .accordion-grid {
          transition: none;
        }

        .section-saving-spinner {
          color: var(--color-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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

        .badge .icon-3 {
          width: 0.625rem;
          height: 0.625rem;
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

        .field-note {
          margin: 0.375rem 0 0;
          color: var(--color-copy);
          font-size: 0.75rem;
          line-height: 1.45;
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
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
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

        .info-box-error {
          background: rgb(221 82 75 / 0.05);
          border-color: rgb(221 82 75 / 0.18);
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

        .btn-danger {
          background: var(--color-error);
          color: #fff;
          border-color: var(--color-error);
        }

        .btn-danger:hover:not(:disabled) {
          background: rgb(221 82 75 / 0.9);
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

        .icon-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .icon-btn-primary:hover:not(:disabled) {
          color: var(--color-primary);
          background: rgb(76 123 99 / 0.05);
        }

        .icon-btn-error:hover:not(:disabled) {
          color: var(--color-error);
          background: rgb(221 82 75 / 0.05);
        }

        .icon-btn-ghost:hover:not(:disabled) {
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

        .bank-entry-screen {
          animation: bankEntryScreenIn 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bank-entry-choice-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .bank-entry-choice-card {
          width: 100%;
          min-height: 12.5rem;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          background: transparent;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          text-align: center;
          cursor: pointer;
          transition:
            border-color var(--duration-normal),
            background-color var(--duration-normal),
            transform var(--duration-normal),
            box-shadow var(--duration-normal);
        }

        .bank-entry-choice-card:hover:not(:disabled) {
          border-color: rgb(76 123 99 / 0.35);
          background: rgb(76 123 99 / 0.04);
          box-shadow: 0 12px 24px rgb(15 42 57 / 0.06);
          transform: translateY(-1px);
        }

        .bank-entry-choice-card:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .bank-entry-choice-card-secondary:hover:not(:disabled) {
          border-color: rgb(15 42 57 / 0.2);
          background: rgb(15 42 57 / 0.03);
        }

        .bank-entry-choice-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(76 123 99 / 0.1);
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .bank-entry-choice-icon-secondary {
          background: rgb(15 42 57 / 0.08);
          color: var(--color-headline);
        }

        .bank-entry-choice-copy {
          min-width: 0;
          text-align: center;
        }

        .bank-entry-choice-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 1rem;
          font-weight: 600;
        }

        .bank-entry-choice-desc {
          margin: 0.25rem 0 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
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

        .plaid-connect-btn:hover:not(:disabled) {
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

        .manual-bank-entry {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .manual-bank-heading {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .manual-bank-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 1rem;
          font-weight: 600;
        }

        .manual-bank-copy {
          margin: 0;
          color: var(--color-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .manual-bank-panel {
          border: 1px solid rgb(232 232 232 / 0.9);
          border-radius: 1rem;
          background: rgb(250 250 250 / 0.88);
          box-shadow: 0 16px 36px rgb(15 42 57 / 0.06);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .manual-bank-panel-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.875rem;
        }

        .manual-bank-back {
          border: 0;
          background: transparent;
          color: var(--color-secondary);
          padding: 0;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color var(--duration-normal);
        }

        .manual-bank-back:hover:not(:disabled) {
          color: var(--color-headline);
        }

        .manual-bank-back:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .manual-bank-panel-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 1rem;
          font-weight: 600;
        }

        .manual-bank-panel-subtitle {
          margin: 0.25rem 0 0;
          color: var(--color-secondary);
          font-size: 0.75rem;
          line-height: 1.45;
        }

        .manual-choice-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .manual-choice-pill {
          min-height: 2.9rem;
          padding: 0.7rem 1rem;
          border: 2px solid var(--color-border);
          border-radius: 0.75rem;
          background: #fff;
          color: var(--color-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
          transition:
            border-color var(--duration-fast) var(--ease-default),
            background-color var(--duration-fast) var(--ease-default),
            color var(--duration-fast) var(--ease-default);
        }

        .manual-choice-pill:hover:not(:disabled) {
          border-color: rgb(76 123 99 / 0.3);
        }

        .manual-choice-pill.is-selected {
          border-color: var(--color-primary);
          background: rgb(76 123 99 / 0.05);
          color: var(--color-primary);
        }

        .manual-choice-pill:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .manual-bank-info {
          border-color: var(--color-border);
          background: var(--color-sidebar);
        }

        .manual-bank-info-icon {
          color: var(--color-warning);
          flex-shrink: 0;
          margin-top: 0.0625rem;
        }

        .manual-bank-info p {
          font-size: 0.75rem;
          line-height: 1.55;
        }

        .manual-bank-submit {
          min-height: 3rem;
          font-size: 0.95rem;
          font-weight: 600;
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

        .docs-subsection {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }

        .docs-subsection-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .docs-subsection-title {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-headline);
        }

        .docs-subsection-desc {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-secondary);
        }

        .badge-warning {
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #fed7aa;
        }

        .docs-submit-row {
          display: flex;
          justify-content: flex-end;
          padding-top: 0.25rem;
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

        .bank-account-wrap {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .connected-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .bank-account-card {
          align-items: center;
        }

        .bank-account-card-removing {
          pointer-events: none;
          animation: bankCardRemove 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .bank-account-card .connected-main {
          flex: 1;
        }

        .connected-side {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          min-width: 5rem;
        }

        .bank-account-side-surface {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          min-width: 5rem;
          will-change: opacity, transform;
        }

        .bank-account-actions {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.25rem;
        }

        .bank-account-side-group {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
        }

        .bank-account-spinner {
          color: var(--color-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1rem;
          min-height: 1rem;
        }

        .bank-account-side-enter-left {
          animation: bankSideInFromLeft 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bank-account-side-exit-right {
          animation: bankSideOutToRight 160ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .connected-meta-row {
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .bank-account-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          border: 1px solid transparent;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
        }

        .bank-account-chip .icon-3 {
          width: 0.75rem;
          height: 0.75rem;
        }

        .bank-account-chip-verified {
          background: rgb(34 197 94 / 0.08);
          border-color: rgb(34 197 94 / 0.18);
          color: var(--color-success);
        }

        .bank-account-chip-default {
          background: rgb(95 110 120 / 0.08);
          border-color: rgb(95 110 120 / 0.18);
          color: var(--color-secondary);
        }

        .bank-account-verify-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          border: 1px solid rgb(34 197 94 / 0.3);
          background: #fff;
          color: var(--color-success);
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
          cursor: pointer;
          transition:
            border-color var(--duration-normal),
            background-color var(--duration-normal),
            color var(--duration-normal);
        }

        .bank-account-verify-btn:hover:not(:disabled) {
          border-color: rgb(34 197 94 / 0.42);
          background: rgb(34 197 94 / 0.06);
        }

        .bank-account-verify-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .bank-alert-copy {
          min-width: 0;
        }

        .bank-action-toast-layer {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 2;
          pointer-events: none;
        }

        .bank-action-toast {
          max-width: min(20rem, calc(100vw - 3rem));
          border-radius: var(--radius-md);
          border: 1px solid rgb(221 82 75 / 0.18);
          background: #fff;
          box-shadow: 0 12px 28px rgb(15 23 42 / 0.14);
          color: var(--color-headline);
          display: inline-flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem 0.875rem;
          animation: bankToastIn 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bank-action-toast-icon {
          color: var(--color-error);
          flex-shrink: 0;
          display: inline-flex;
          margin-top: 0.0625rem;
        }

        .bank-action-toast-copy {
          color: inherit;
          font-size: 0.8125rem;
          line-height: 1.4;
        }

        .bank-alert .icon-5 {
          color: var(--color-warning);
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .bank-alert-title {
          margin: 0;
          color: var(--color-headline);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .bank-alert-text {
          margin: 0.25rem 0 0;
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
          display: block;
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
          display: inline-block;
          animation: spin 0.9s linear infinite;
          transform-box: fill-box;
          transform-origin: center center;
          will-change: transform;
          flex-shrink: 0;
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

        @keyframes bankSideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bankSideOutToRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(16px);
          }
        }

        @keyframes bankToastIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bankEntryScreenIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bankCardRemove {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(18px);
          }
        }

        @keyframes boSubmodalIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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

          .bank-entry-choice-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
    // No-op: verification no longer uses an intermediate loading state.
  }

  syncVerificationStatusStage(progress, isVerified, activeTab) {
    void progress
    void activeTab
    this.clearVerificationStatusTimers()
    this._verificationStatusStage = isVerified ? 'complete' : 'progress'
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
      let submodalMarkup = ''

      if (!showingWelcome) {
        if (!this._setupModalHeight) {
          const targetRect = this.measureSetupModalRect()
          if (targetRect) this._setupModalHeight = targetRect.height
        }

        modalStyleAttr = this.getSetupModalStyleAttr()
        const { statuses, statusMessages, progress, isProgressComplete, isVerified } = this.getSetupRenderContext()
        this.syncVerificationStatusStage(progress, isVerified, this.state.activeTab)
        renderedProgress = progress
        shouldAnimateProgress = this.state.activeTab === 'verification' && (!isProgressComplete || this._verificationStatusStage === 'progress')
        modalBodyContent = this.renderSetupModalContent(statuses, statusMessages, progress, isProgressComplete, isVerified)
        submodalMarkup = this.renderBankDeleteModal()
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
          ${submodalMarkup}
        </dialog>
      `
    }

    // Preserve scroll position across innerHTML replacement so the modal body
    // doesn't jump back to the top on every render (e.g. after _fetchKybStatus).
    const prevScrollTop = this.shadowRoot.querySelector('.bo-modal-body-setup')?.scrollTop ?? 0

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

    if (prevScrollTop > 0) {
      const newBody = this.shadowRoot.querySelector('.bo-modal-body-setup')
      if (newBody) newBody.scrollTop = prevScrollTop
    }

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
