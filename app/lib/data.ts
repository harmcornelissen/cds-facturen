'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

export type ClientKind = 'bedrijf' | 'particulier'
export type InvoiceStatus = 'concept' | 'verzonden' | 'betaald' | 'verlopen' | 'incasso' | 'openstaand'
export type PriceInputMode = 'excl' | 'incl'
export type RecurringSendDay = 'first' | 'fifteenth' | 'twentyFirst' | 'custom'

export type PaymentMethods = {
  ideal: boolean
  bankTransfer: boolean
  directDebit: boolean
}

export type Client = {
  id: string
  kind: ClientKind
  name: string
  email: string
  phone: string
  website: string
  address: string
  postalCode: string
  city: string
  country: string
  kvk: string
  btw: string
  iban: string
  color: string
  note: string
  incasso: boolean
  priceInputMode?: PriceInputMode
  createdAt: string
}

export type CompanyProfile = {
  id: string
  name: string
  legalName: string
  email: string
  phone: string
  website: string
  address: string
  postalCode: string
  city: string
  country: string
  kvk: string
  btw: string
  iban: string
  logoDataUrl: string
  accentColor: string
  brandColor: string
  brandTextColor: string
  invoicePrefix: string
  nextNumber: number
  paymentTerm: number
  defaultVat: number
  footerText: string
  createdAt: string
}

export type InvoiceLine = {
  id: string
  description: string
  quantity: number
  price: number
  vatRate: number
}

export type Invoice = {
  id: string
  number: string
  date: string
  dueDate: string
  clientId: string
  clientName: string
  clientEmail: string
  companyId: string
  companyName: string
  reference: string
  status: InvoiceStatus
  lines: InvoiceLine[]
  priceInputMode?: PriceInputMode
  paymentMethods?: PaymentMethods
  notes: string
  createdAt: string
}

export type RecurringInvoice = Invoice & {
  active: boolean
  schedule: {
    sendDay: RecurringSendDay
    firstSendDate: string
    endDate: string
    ongoing: boolean
    nextSendDate: string
  }
}

export type Plan = 'gratis' | 'basis' | 'professional'

export type StoredUser = {
  id: string
  naam: string
  email: string
  wachtwoord: string
  plan: Plan
  aangemaakt: string
  premiumGegeven: boolean
}

export type AuthSession = Pick<StoredUser, 'id' | 'naam' | 'email' | 'plan'>

export type PlanLimits = {
  invoiceLimitPerMonth: number | null
  idealEnabled: boolean
  offerEnabled: boolean
  incassoEnabled: boolean
  companyProfiles: number | null
}

export const STORAGE_KEYS = {
  clients: 'cds_klanten',
  companies: 'cds_bedrijven',
  invoices: 'cds_facturen',
  offers: 'cds_offertes',
  recurring: 'cds_terugkerend',
  activeCompany: 'cds_actief_bedrijf',
  plan: 'cds_plan',
  users: 'cds_users',
  auth: 'cds_auth',
} as const

const STORAGE_EVENT = 'cds-storage'
const DEFAULT_TEST_PASSWORD = 'Q2RzRmFjdHVyZW4yMDI2'

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  gratis: {
    invoiceLimitPerMonth: 5,
    idealEnabled: false,
    offerEnabled: false,
    incassoEnabled: false,
    companyProfiles: 1,
  },
  basis: {
    invoiceLimitPerMonth: null,
    idealEnabled: true,
    offerEnabled: true,
    incassoEnabled: false,
    companyProfiles: 3,
  },
  professional: {
    invoiceLimitPerMonth: null,
    idealEnabled: true,
    offerEnabled: true,
    incassoEnabled: true,
    companyProfiles: null,
  },
}

export const clientColors = [
  '#2456ff',
  '#10b981',
  '#7c3aed',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

function readStoredValue<T>(key: string, fallback: T) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
}

function removeStoredValue(key: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
}

function createStoredSnapshot<T>(key: string, fallback: T) {
  let cachedValue = fallback
  let cachedString: string | null = null

  return () => {
    if (typeof window === 'undefined') return fallback

    try {
      const stored = window.localStorage.getItem(key)
      if (stored === cachedString) return cachedValue

      cachedString = stored
      cachedValue = stored ? (JSON.parse(stored) as T) : fallback
      return cachedValue
    } catch {
      cachedValue = fallback
      return cachedValue
    }
  }
}

function subscribeToStorage(key: string, callback: () => void) {
  if (typeof window === 'undefined') return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== key) return
    callback()
  }

  const handleStoredStateChange = (event: Event) => {
    const storageEvent = event as CustomEvent<{ key?: string }>
    if (storageEvent.detail?.key !== key) return
    callback()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(STORAGE_EVENT, handleStoredStateChange)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(STORAGE_EVENT, handleStoredStateChange)
  }
}

export function useStoredState<T>(key: string, fallback: T) {
  const subscribe = useCallback((callback: () => void) => subscribeToStorage(key, callback), [key])
  const getSnapshot = useMemo(() => createStoredSnapshot(key, fallback), [fallback, key])
  const getServerSnapshot = useCallback(() => fallback, [fallback])

  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const setValue = useCallback(
    (nextValue: T | ((current: T) => T)) => {
      const current = readStoredValue<T>(key, fallback)
      const resolved = typeof nextValue === 'function' ? (nextValue as (current: T) => T)(current) : nextValue
      writeStoredValue(key, resolved)
    },
    [fallback, key],
  )

  return [value, setValue] as const
}

export function useClients() {
  const fallback = useMemo<Client[]>(() => [], [])
  return useStoredState(STORAGE_KEYS.clients, fallback)
}

export function useCompanies() {
  const fallback = useMemo<CompanyProfile[]>(() => [], [])
  return useStoredState(STORAGE_KEYS.companies, fallback)
}

export function useActiveCompanyIndex() {
  return useStoredState<number>(STORAGE_KEYS.activeCompany, 0)
}

export function useInvoices() {
  const fallback = useMemo<Invoice[]>(() => [], [])
  return useStoredState(STORAGE_KEYS.invoices, fallback)
}

export function useOffers() {
  const fallback = useMemo<Invoice[]>(() => [], [])
  return useStoredState(STORAGE_KEYS.offers, fallback)
}

export function useRecurringInvoices() {
  const fallback = useMemo<RecurringInvoice[]>(() => [], [])
  return useStoredState(STORAGE_KEYS.recurring, fallback)
}

export function useUsers() {
  const fallback = useMemo<StoredUser[]>(() => [], [])
  return useStoredState(STORAGE_KEYS.users, fallback)
}

export function useAuth() {
  const fallback = useMemo<AuthSession | null>(() => null, [])
  const [auth] = useStoredState<AuthSession | null>(STORAGE_KEYS.auth, fallback)

  const setAuth = useCallback((nextValue: AuthSession | null | ((current: AuthSession | null) => AuthSession | null)) => {
    const current = readStoredValue<AuthSession | null>(STORAGE_KEYS.auth, null)
    const resolved = typeof nextValue === 'function'
      ? (nextValue as (current: AuthSession | null) => AuthSession | null)(current)
      : nextValue

    if (resolved) {
      writeStoredValue(STORAGE_KEYS.auth, resolved)
    } else {
      removeStoredValue(STORAGE_KEYS.auth)
    }
  }, [])

  return [auth, setAuth] as const
}

export function usePlan() {
  const [storedPlan, setStoredPlan] = useStoredState<Plan>(STORAGE_KEYS.plan, 'gratis')
  const [auth, setAuth] = useAuth()
  const effectivePlan = auth?.plan || storedPlan

  const setPlan = useCallback(
    (nextValue: Plan | ((current: Plan) => Plan)) => {
      const currentAuth = readStoredValue<AuthSession | null>(STORAGE_KEYS.auth, null)
      const currentPlan = currentAuth?.plan || readStoredValue<Plan>(STORAGE_KEYS.plan, 'gratis')
      const resolved = typeof nextValue === 'function' ? (nextValue as (current: Plan) => Plan)(currentPlan) : nextValue

      setStoredPlan(resolved)
      if (currentAuth) {
        const nextAuth = { ...currentAuth, plan: resolved }
        setAuth(nextAuth)
        updateStoredUser(currentAuth.id, { plan: resolved })
      }
    },
    [setAuth, setStoredPlan],
  )

  return [effectivePlan, setPlan] as const
}

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan]
}

export function invoiceMonthKey(invoice: Pick<Invoice, 'createdAt' | 'date'>) {
  const source = invoice.createdAt || invoice.date || todayIso()
  const parsed = new Date(source)
  if (Number.isNaN(parsed.getTime())) return currentMonthKey()
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
}

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function currentQuarterKey(date = new Date()) {
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
}

export function quarterKeyForDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return currentQuarterKey()
  return currentQuarterKey(date)
}

export function invoiceIsUnpaid(status: InvoiceStatus) {
  return status === 'verzonden' || status === 'openstaand' || status === 'verlopen' || status === 'incasso'
}

export function countInvoicesInCurrentMonth(invoices: Pick<Invoice, 'createdAt' | 'date'>[]) {
  const key = currentMonthKey()
  return invoices.filter((invoice) => invoiceMonthKey(invoice) === key).length
}

export function countInvoicesInCurrentMonthExcludingId(invoices: Pick<Invoice, 'createdAt' | 'date' | 'id'>[], excludedId?: string) {
  const key = currentMonthKey()
  return invoices.filter((invoice) => invoice.id !== excludedId && invoiceMonthKey(invoice) === key).length
}

export function getPlanMessage(plan: Plan) {
  if (plan === 'gratis') {
    return 'Je hebt het maximum bereikt voor het Gratis plan. Upgrade naar Basis voor onbeperkt factureren.'
  }
  if (plan === 'basis') {
    return 'Upgrade naar Professional voor automatische incasso en onbeperkte bedrijfsprofielen.'
  }
  return ''
}

export function canCreateInvoice(plan: Plan, invoices: Pick<Invoice, 'createdAt' | 'date' | 'id'>[], editingId?: string) {
  const limits = getPlanLimits(plan)
  if (limits.invoiceLimitPerMonth === null) return { allowed: true, limit: null, used: 0 }
  const used = countInvoicesInCurrentMonthExcludingId(invoices, editingId)
  return { allowed: used < limits.invoiceLimitPerMonth, limit: limits.invoiceLimitPerMonth, used }
}

export function canCreateOffer(plan: Plan) {
  return getPlanLimits(plan).offerEnabled
}

export function canUseIdeal(plan: Plan) {
  return getPlanLimits(plan).idealEnabled
}

export function canUseIncasso(plan: Plan) {
  return getPlanLimits(plan).incassoEnabled
}

export function maxCompanyProfiles(plan: Plan) {
  return getPlanLimits(plan).companyProfiles
}

export function resolveActiveCompanyIndex(companies: CompanyProfile[], activeIndex: number) {
  if (companies.length === 0) return 0
  if (!Number.isFinite(activeIndex)) return 0
  return Math.min(Math.max(Math.trunc(activeIndex), 0), companies.length - 1)
}

export function companyProfileLabel(company?: Pick<CompanyProfile, 'name' | 'legalName'>, fallback = 'Nieuw profiel') {
  return company?.name?.trim() || company?.legalName?.trim() || fallback
}

export function hashPassword(password: string) {
  try {
    return btoa(password)
  } catch {
    return password
  }
}

export function authSessionFromUser(user: StoredUser): AuthSession {
  return {
    id: user.id,
    naam: user.naam,
    email: user.email,
    plan: user.plan,
  }
}

export function readUsersFromStorage() {
  const users = readStoredValue<unknown>(STORAGE_KEYS.users, [])
  return Array.isArray(users) ? (users as StoredUser[]) : []
}

export function writeUsersToStorage(users: StoredUser[]) {
  writeStoredValue(STORAGE_KEYS.users, users)
}

export function writeAuthSession(session: AuthSession) {
  writeStoredValue(STORAGE_KEYS.auth, session)
}

export function readAuthSessionFromStorage() {
  return readStoredValue<AuthSession | null>(STORAGE_KEYS.auth, null)
}

export function ensureDefaultTestUser() {
  if (typeof window === 'undefined') return

  const users = readUsersFromStorage()
  if (users.length > 0) return

  writeUsersToStorage([
    {
      id: 'test-001',
      naam: 'Harm Cornelissen',
      email: 'h.cornelissen230504@gmail.com',
      wachtwoord: DEFAULT_TEST_PASSWORD,
      plan: 'professional',
      aangemaakt: new Date().toISOString(),
      premiumGegeven: true,
    },
  ])
}

export function updateStoredUser(userId: string, patch: Partial<StoredUser>) {
  const users = readUsersFromStorage()
  writeStoredValue(
    STORAGE_KEYS.users,
    users.map((user) => (user.id === userId ? { ...user, ...patch } : user)),
  )
}

export function clearAuthSession() {
  removeStoredValue(STORAGE_KEYS.auth)
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00`)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

export function fmtCurrency(value: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function fmtDate(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'CD'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export function lineTotals(line: InvoiceLine, priceInputMode: PriceInputMode = 'excl') {
  const quantity = Number(line.quantity || 0)
  const unitPrice = Number(line.price || 0)
  const vatRate = Number(line.vatRate || 0)
  const rawTotal = quantity * unitPrice

  if (priceInputMode === 'incl') {
    const divisor = 1 + vatRate / 100
    const subtotal = divisor > 0 ? rawTotal / divisor : rawTotal
    const vat = rawTotal - subtotal
    return { subtotal, vat, total: rawTotal }
  }

  const subtotal = rawTotal
  const vat = subtotal * (vatRate / 100)
  return { subtotal, vat, total: subtotal + vat }
}

export function invoiceTotals(invoice: Pick<Invoice, 'lines' | 'priceInputMode'>) {
  return invoice.lines.reduce(
    (acc, line) => {
      const totals = lineTotals(line, invoice.priceInputMode || 'excl')
      acc.subtotal += totals.subtotal
      acc.vat += totals.vat
      acc.total += totals.total
      return acc
    },
    { subtotal: 0, vat: 0, total: 0 },
  )
}

export function vatBreakdown(invoice: Pick<Invoice, 'lines' | 'priceInputMode'>) {
  const grouped = invoice.lines.reduce<Record<string, { rate: number; subtotal: number; vat: number }>>((acc, line) => {
    const rate = Number(line.vatRate || 0)
    const key = String(rate)
    const totals = lineTotals(line, invoice.priceInputMode || 'excl')
    if (!acc[key]) acc[key] = { rate, subtotal: 0, vat: 0 }
    acc[key].subtotal += totals.subtotal
    acc[key].vat += totals.vat
    return acc
  }, {})

  return Object.values(grouped).sort((a, b) => a.rate - b.rate)
}

export function resolveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status !== 'openstaand' && invoice.status !== 'verzonden') return invoice.status
  const due = new Date(`${invoice.dueDate}T23:59:59`)
  return due.getTime() < Date.now() ? 'verlopen' : 'verzonden'
}

export function nextInvoiceNumber(company?: CompanyProfile) {
  const prefix = company?.invoicePrefix?.trim() || 'FAC-'
  const number = company?.nextNumber || 1
  const width = /^F-\d{4}-?$/.test(prefix) || /^F-\d{4}-$/.test(prefix) ? 3 : 4
  return `${prefix}${String(number).padStart(width, '0')}`
}

export function nextOfferNumber(offers: Pick<Invoice, 'number' | 'companyId'>[], company?: CompanyProfile) {
  const prefix = 'OFF-'
  const scoped = company ? offers.filter((offer) => offer.companyId === company.id) : offers
  const highest = scoped.reduce((max, offer) => {
    const match = offer.number.match(/(\d+)$/)
    return Math.max(max, match ? Number(match[1]) : 0)
  }, 0)
  return `${prefix}${String(highest + 1).padStart(4, '0')}`
}

export function blankCompany(): CompanyProfile {
  return {
    id: createId('bedrijf'),
    name: '',
    legalName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Nederland',
    kvk: '',
    btw: '',
    iban: '',
    logoDataUrl: '',
    accentColor: '#2456ff',
    brandColor: '#2456ff',
    brandTextColor: '#ffffff',
    invoicePrefix: `F-${new Date().getFullYear()}-`,
    nextNumber: 1,
    paymentTerm: 14,
    defaultVat: 21,
    footerText: 'Bedankt voor uw vertrouwen.',
    createdAt: new Date().toISOString(),
  }
}

export function blankLine(defaultVat = 21): InvoiceLine {
  return {
    id: createId('regel'),
    description: '',
    quantity: 1,
    price: 0,
    vatRate: defaultVat,
  }
}
