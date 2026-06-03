'use client'

import { useEffect, useState } from 'react'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import { Button, Field, SelectInput, TextArea, TextInput, Toast } from '@/app/components/ui'
import { Icon } from '@/app/components/Icon'
import { colors, fonts, formGrid, grid, inputStyle, mainScroll, pageHeader, titleStyle } from '@/app/lib/theme'
import {
  blankCompany,
  companyProfileLabel,
  fmtCurrency,
  invoiceTotals,
  maxCompanyProfiles,
  resolveActiveCompanyIndex,
  type CompanyProfile,
  useActiveCompanyIndex,
  useCompanies,
  useInvoices,
  usePlan,
} from '@/app/lib/data'

const DEFAULT_BRAND_COLOR = '#2456ff'
const DEFAULT_BRAND_TEXT_COLOR = '#ffffff'

export default function BedrijfsprofielenPage() {
  const [companies, setCompanies] = useCompanies()
  const [invoices] = useInvoices()
  const [plan] = usePlan()
  const [activeCompanyIndex, setActiveCompanyIndex] = useActiveCompanyIndex()
  const [creatingNew, setCreatingNew] = useState(false)
  const [draft, setDraft] = useState<CompanyProfile>(blankCompanyDraft())
  const [limitOpen, setLimitOpen] = useState(false)
  const [toast, setToast] = useState('')

  const resolvedActiveIndex = resolveActiveCompanyIndex(companies, activeCompanyIndex)
  const active = creatingNew ? undefined : companies[resolvedActiveIndex]
  const companyInvoices = invoices.filter((invoice) => invoice.companyId === draft.id || invoice.companyName === draft.name)
  const revenue = companyInvoices.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0)
  const profileLimit = maxCompanyProfiles(plan)
  const limitReached = profileLimit !== null && companies.length >= profileLimit
  const limitLabel = profileLimit === null ? 'onbeperkt' : String(profileLimit)
  const limitMessage = companyLimitMessage(plan)

  useEffect(() => {
    if (companies.length === 0) {
      if (activeCompanyIndex !== 0) setActiveCompanyIndex(0)
      if (!creatingNew) setCreatingNew(true)
      return
    }

    if (activeCompanyIndex !== resolvedActiveIndex) {
      setActiveCompanyIndex(resolvedActiveIndex)
      return
    }

    if (!creatingNew) {
      setDraft(normalizeCompanyProfile(companies[resolvedActiveIndex]))
    }
  }, [activeCompanyIndex, companies, creatingNew, resolvedActiveIndex, setActiveCompanyIndex])

  function update<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateBrandColor(value: string) {
    setDraft((current) => ({ ...current, brandColor: value, accentColor: value }))
  }

  function save() {
    const normalizedDraft = normalizeCompanyProfile(draft)
    const limit = maxCompanyProfiles(plan)
    const existingIndex = companies.findIndex((company) => company.id === normalizedDraft.id)
    if (existingIndex === -1 && limit !== null && companies.length >= limit) {
      setLimitOpen(true)
      return
    }

    setCompanies((current) => {
      const exists = current.some((company) => company.id === normalizedDraft.id)
      return exists ? current.map((company) => (company.id === normalizedDraft.id ? normalizedDraft : company)) : [normalizedDraft, ...current]
    })
    setCreatingNew(false)
    setDraft(normalizedDraft)
    setActiveCompanyIndex(existingIndex === -1 ? 0 : existingIndex)
    setToast('Bedrijfsprofiel opgeslagen')
  }

  function createNew() {
    if (limitReached) {
      setLimitOpen(true)
      return
    }
    const next = blankCompanyDraft()
    setCreatingNew(true)
    setDraft(next)
  }

  function selectCompany(index: number) {
    const selected = companies[index]
    if (!selected) return
    setCreatingNew(false)
    setActiveCompanyIndex(index)
    setDraft(normalizeCompanyProfile(selected))
  }

  function deleteActiveProfile() {
    if (!active) return
    if (companies.length <= 1) {
      setToast('Je kunt het enige bedrijfsprofiel niet verwijderen.')
      return
    }
    if (!window.confirm(`Bedrijfsprofiel "${companyProfileLabel(active)}" verwijderen?`)) return

    const nextCompanies = companies.filter((company) => company.id !== active.id)
    const nextIndex = resolveActiveCompanyIndex(nextCompanies, resolvedActiveIndex)
    setCompanies(nextCompanies)
    setActiveCompanyIndex(nextIndex)
    setCreatingNew(false)
    setDraft(normalizeCompanyProfile(nextCompanies[nextIndex]))
    setToast('Bedrijfsprofiel verwijderd')
  }

  function handleLogo(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('logoDataUrl', String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const brandColor = draft.brandColor || draft.accentColor || DEFAULT_BRAND_COLOR
  const brandTextColor = draft.brandTextColor || DEFAULT_BRAND_TEXT_COLOR
  const nextInvoicePreview = `${draft.invoicePrefix || 'FAC-'}${String(draft.nextNumber || 1).padStart(4, '0')}`

  return (
    <main style={mainScroll}>
      <div style={pageHeader}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Bedrijfsprofielen</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Beheer bedrijfsgegevens, huisstijl en factuurinstellingen.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!creatingNew && active ? <Button variant="danger" icon="trash" onClick={deleteActiveProfile}>Verwijderen</Button> : null}
          <Button icon="check" onClick={save}>Opslaan</Button>
        </div>
      </div>

      <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ padding: '14px 16px', borderBottom: `0.5px solid ${colors.border2}`, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: fonts.heading, fontWeight: 800, color: '#fff', fontSize: 14 }}>Profielen</div>
            <div style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>{companies.length} van {limitLabel} gebruikt</div>
          </div>
          {limitReached && limitMessage ? (
            <div style={{ color: '#6f8cff', background: colors.blueSoft, border: `0.5px solid rgba(36,86,255,0.35)`, borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 700 }}>
              {limitMessage}
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: 14 }}>
          {companies.map((company, index) => {
            const selected = !creatingNew && index === resolvedActiveIndex
            const color = company.brandColor || company.accentColor || DEFAULT_BRAND_COLOR
            const name = companyProfileLabel(company)
            return (
              <button
                type="button"
                key={company.id}
                onClick={() => selectCompany(index)}
                style={profileTabStyle(selected)}
              >
                <div style={{ width: 42, height: 42, borderRadius: 8, background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.heading, fontWeight: 800, overflow: 'hidden', flexShrink: 0 }}>
                  {company.logoDataUrl ? <img src={company.logoDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{company.invoicePrefix || 'FAC-'}{String(company.nextNumber || 1).padStart(4, '0')}</div>
                  {selected ? <ActiveTabLabel /> : null}
                </div>
              </button>
            )
          })}
          <button
            type="button"
            onClick={createNew}
            style={profileTabStyle(creatingNew)}
          >
            <div style={{ width: 42, height: 42, borderRadius: 8, background: colors.blueSoft, color: '#6f8cff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="plus" size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Nieuw profiel</div>
              <div style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{limitReached ? 'Limiet bereikt' : 'Lege form openen'}</div>
              {creatingNew ? <ActiveTabLabel /> : null}
            </div>
          </button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 18, width: '100%', overflow: 'hidden' }}>
          <div style={{ ...grid(190), marginBottom: 2 }}>
            <MiniKpi label="Facturen" value={String(companyInvoices.length)} />
            <MiniKpi label="Omzet" value={fmtCurrency(revenue)} />
            <MiniKpi label="Volgend nummer" value={nextInvoicePreview} />
          </div>

          <Panel title="Bedrijfsgegevens">
            <div style={formGrid(230)}>
              <Field label="Publieke naam">
                <TextInput value={draft.name} onChange={(value) => update('name', value)} placeholder="Bijv. CDS Facturen" />
              </Field>
              <Field label="Juridische naam">
                <TextInput value={draft.legalName} onChange={(value) => update('legalName', value)} placeholder="Volledige bedrijfsnaam" />
              </Field>
              <Field label="E-mail">
                <TextInput value={draft.email} onChange={(value) => update('email', value)} placeholder="info@uwbedrijf.nl" type="email" />
              </Field>
              <Field label="Telefoon">
                <TextInput value={draft.phone} onChange={(value) => update('phone', value)} placeholder="+31 6 00000000" />
              </Field>
              <Field label="Website">
                <TextInput value={draft.website} onChange={(value) => update('website', value)} placeholder="https://uwbedrijf.nl" />
              </Field>
              <Field label="KvK">
                <TextInput value={draft.kvk} onChange={(value) => update('kvk', value)} placeholder="12345678" />
              </Field>
              <Field label="BTW-nummer">
                <TextInput value={draft.btw} onChange={(value) => update('btw', value)} placeholder="NL000000000B01" />
              </Field>
              <Field label="IBAN">
                <TextInput value={draft.iban} onChange={(value) => update('iban', value)} placeholder="NL00 BANK 0000 0000 00" />
              </Field>
              <Field label="Straat en huisnummer">
                <TextInput value={draft.address} onChange={(value) => update('address', value)} placeholder="Straatnaam 1" />
              </Field>
              <Field label="Postcode">
                <TextInput value={draft.postalCode} onChange={(value) => update('postalCode', value)} placeholder="1234 AB" />
              </Field>
              <Field label="Plaats">
                <TextInput value={draft.city} onChange={(value) => update('city', value)} placeholder="Amsterdam" />
              </Field>
              <Field label="Land">
                <SelectInput value={draft.country} onChange={(value) => update('country', value)}>
                  <option value="">Selecteer land</option>
                  <option>Nederland</option>
                  <option>Belgie</option>
                  <option>Duitsland</option>
                </SelectInput>
              </Field>
            </div>
          </Panel>

          <Panel title="Huisstijl">
            <div style={{ ...formGrid(220, 2, 20), alignItems: 'start' }}>
              <div>
                <div style={{ color: colors.muted, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Logo</div>
                <label style={{ height: 150, border: `0.5px dashed ${colors.border2}`, borderRadius: 8, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                  {draft.logoDataUrl ? (
                    <img src={draft.logoDataUrl} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 14 }} />
                  ) : (
                    <div style={{ color: colors.muted, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Icon name="upload" size={22} />
                      <span style={{ fontSize: 12 }}>Logo uploaden</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(event) => handleLogo(event.target.files?.[0])} style={{ display: 'none' }} />
                </label>
              </div>
              <div>
                <Field label="Merkkleur">
                  <ColorControl value={draft.brandColor || draft.accentColor} fallback={DEFAULT_BRAND_COLOR} onChange={updateBrandColor} />
                </Field>
                <Field label="Letterkleur">
                  <ColorControl value={draft.brandTextColor} fallback={DEFAULT_BRAND_TEXT_COLOR} onChange={(value) => update('brandTextColor', value)} />
                </Field>
                <div style={{ marginTop: 18 }}>
                  <div style={{ color: colors.muted, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Factuurkop preview</div>
                  <div style={{ minHeight: 70, background: safeHexColor(brandColor, DEFAULT_BRAND_COLOR), color: safeHexColor(brandTextColor, DEFAULT_BRAND_TEXT_COLOR), borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, overflow: 'hidden' }}>
                    <div style={{ width: 58, height: 48, borderRadius: 8, border: '1px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {draft.logoDataUrl ? <img src={draft.logoDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontFamily: fonts.heading, fontWeight: 800 }}>{(draft.name || 'BD').slice(0, 2).toUpperCase()}</span>}
                    </div>
                    <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 18, textAlign: 'right', overflowWrap: 'anywhere' }}>{draft.name || 'Bedrijfsnaam'}</div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Factuurinstellingen">
            <div style={formGrid(210)}>
              <Field label="Factuurprefix">
                <TextInput value={draft.invoicePrefix} onChange={(value) => update('invoicePrefix', value)} placeholder="F-" />
              </Field>
              <Field label="Volgend nummer">
                <TextInput value={draft.nextNumber || ''} onChange={(value) => update('nextNumber', Number(value || 0))} placeholder="1" type="number" />
              </Field>
              <Field label="Betaaltermijn">
                <TextInput value={draft.paymentTerm || ''} onChange={(value) => update('paymentTerm', Number(value || 0))} placeholder="14" type="number" />
              </Field>
              <Field label="Standaard BTW">
                <SelectInput value={draft.defaultVat || ''} onChange={(value) => update('defaultVat', Number(value || 0))}>
                  <option value="">Selecteer BTW</option>
                  <option value={0}>0%</option>
                  <option value={9}>9%</option>
                  <option value={21}>21%</option>
                </SelectInput>
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="Voettekst">
                <TextArea value={draft.footerText} onChange={(value) => update('footerText', value)} placeholder="Bijv. bedankt voor uw vertrouwen." rows={4} />
              </Field>
            </div>
          </Panel>
      </section>

      <Toast message={toast} />
      <PlanRestrictionModal
        open={limitOpen}
        plan={plan}
        title="Bedrijfsprofiel limiet bereikt"
        message={limitMessage || 'Dit plan staat geen extra bedrijfsprofielen toe.'}
        onClose={() => setLimitOpen(false)}
        showUpgradeButton
      />
    </main>
  )
}

function blankCompanyDraft(): CompanyProfile {
  return {
    ...blankCompany(),
    country: '',
    accentColor: '',
    brandColor: '',
    brandTextColor: '',
    invoicePrefix: '',
    nextNumber: 0,
    paymentTerm: 0,
    defaultVat: 0,
    footerText: '',
  }
}

function normalizeCompanyProfile(company: CompanyProfile): CompanyProfile {
  return {
    ...company,
    accentColor: company.accentColor || company.brandColor || '',
    brandColor: company.brandColor || company.accentColor || '',
    brandTextColor: company.brandTextColor || '',
    nextNumber: Number(company.nextNumber || 0),
    paymentTerm: Number(company.paymentTerm || 0),
    defaultVat: Number(company.defaultVat || 0),
  }
}

function companyLimitMessage(plan: string) {
  if (plan === 'gratis') {
    return 'Je Gratis account ondersteunt maximaal 1 bedrijfsprofiel. Upgrade naar Basis voor maximaal 3 profielen.'
  }
  if (plan === 'basis') {
    return 'Je Basis account ondersteunt maximaal 3 bedrijfsprofielen. Upgrade naar Professional voor onbeperkte profielen.'
  }
  return ''
}

function profileTabStyle(selected: boolean) {
  return {
    width: 230,
    minWidth: 210,
    minHeight: 82,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: selected ? colors.blueSoft : colors.surface,
    border: `0.5px solid ${selected ? 'rgba(36,86,255,0.55)' : colors.border2}`,
    borderRadius: 8,
    color: colors.white,
    padding: 12,
    textAlign: 'left' as const,
    cursor: 'pointer',
  }
}

function ActiveTabLabel() {
  return (
    <div style={{ marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6f8cff', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: colors.blue }} />
      Actief
    </div>
  )
}

function ColorControl({
  value,
  fallback,
  onChange,
}: {
  value: string
  fallback: string
  onChange: (value: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <input type="color" value={safeHexColor(value, fallback)} onChange={(event) => onChange(event.target.value)} style={{ width: 46, height: 38, border: 0, padding: 0, background: 'transparent' }} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={fallback} style={inputStyle} />
    </div>
  )
}

function safeHexColor(value: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 20 }}>
      <h2 style={{ margin: '0 0 16px', fontFamily: fonts.heading, color: '#fff', fontSize: 15 }}>{title}</h2>
      {children}
    </section>
  )
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 15 }}>
      <div style={{ color: colors.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 }}>{label}</div>
      <div style={{ color: '#fff', fontFamily: fonts.heading, fontWeight: 800, fontSize: 20 }}>{value}</div>
    </div>
  )
}
