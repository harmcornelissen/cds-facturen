'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button, Field, SectionCard, SelectInput, TextInput, Toast } from '@/app/components/ui'
import { colors, fonts, formGrid, grid, mainScroll, pageHeader, titleStyle } from '@/app/lib/theme'
import { clearAuthSession, fmtCurrency, invoiceTotals, STORAGE_KEYS, useClients, useCompanies, useInvoices } from '@/app/lib/data'

export default function InstellingenPage() {
  const router = useRouter()
  const [clients] = useClients()
  const [companies] = useCompanies()
  const [invoices] = useInvoices()
  const [settings, setSettings] = useState({
    name: 'Harm Cuppens',
    email: 'harm@example.nl',
    language: 'nl',
    timezone: 'Europe/Amsterdam',
    defaultStatus: 'verzonden',
    reminders: '7',
    sender: 'facturen@cds.nl',
  })
  const [toast, setToast] = useState('')
  const totals = useMemo(() => invoices.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0), [invoices])

  function update(key: keyof typeof settings, value: string) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function save() {
    setToast('Instellingen opgeslagen voor deze sessie')
  }

  async function exportData() {
    try {
      const xlsx = await import('xlsx')
      const workbook = xlsx.utils.book_new()
      const sheets = [
        ['Facturen', readStorageArray(STORAGE_KEYS.invoices)],
        ['Klanten', readStorageArray(STORAGE_KEYS.clients)],
        ['Bedrijven', readStorageArray(STORAGE_KEYS.companies)],
        ['Offertes', readStorageArray(STORAGE_KEYS.offers)],
        ['Terugkerend', readStorageArray(STORAGE_KEYS.recurring)],
      ] as const

      sheets.forEach(([name, rows]) => {
        const sheetRows = normalizeRows(rows)
        const worksheet = xlsx.utils.json_to_sheet(sheetRows.length > 0 ? sheetRows : [{ status: 'Geen data' }])
        xlsx.utils.book_append_sheet(workbook, worksheet, name)
      })

      const date = new Date().toISOString().slice(0, 10)
      xlsx.writeFile(workbook, `CDS-Facturen-Export-${date}.xlsx`)
      setToast('Data export aangemaakt.')
    } catch {
      setToast('Data exporteren mislukt.')
    }
  }

  function logout() {
    clearAuthSession()
    router.push('/login')
  }

  return (
    <main style={mainScroll}>
      <div style={pageHeader}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Instellingen</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Account, factuurvoorkeuren en lokale data.</div>
        </div>
        <Button icon="check" onClick={save}>Opslaan</Button>
      </div>

      <div style={{ ...grid(180), marginBottom: 20 }}>
        <Stat label="Klanten" value={String(clients.length)} />
        <Stat label="Bedrijfsprofielen" value={String(companies.length)} />
        <Stat label="Facturen" value={String(invoices.length)} />
        <Stat label="Totaal gefactureerd" value={fmtCurrency(totals)} />
      </div>

      <div style={formGrid(300, 2, 18)}>
        <SectionCard title="Account">
          <div style={{ padding: 18, display: 'grid', gap: 14, width: '100%', overflow: 'hidden' }}>
            <Field label="Naam">
              <TextInput value={settings.name} onChange={(value) => update('name', value)} placeholder="Voornaam Achternaam" />
            </Field>
            <Field label="E-mail">
              <TextInput value={settings.email} onChange={(value) => update('email', value)} placeholder="naam@bedrijf.nl" type="email" />
            </Field>
            <Field label="Taal">
              <SelectInput value={settings.language} onChange={(value) => update('language', value)}>
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </SelectInput>
            </Field>
            <Field label="Tijdzone">
              <SelectInput value={settings.timezone} onChange={(value) => update('timezone', value)}>
                <option>Europe/Amsterdam</option>
                <option>Europe/Brussels</option>
                <option>Europe/Berlin</option>
              </SelectInput>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Facturatie">
          <div style={{ padding: 18, display: 'grid', gap: 14, width: '100%', overflow: 'hidden' }}>
            <Field label="Standaard status na opslaan">
              <SelectInput value={settings.defaultStatus} onChange={(value) => update('defaultStatus', value)}>
                <option value="verzonden">Verzonden</option>
                <option value="concept">Concept</option>
              </SelectInput>
            </Field>
            <Field label="Herinnering na dagen">
              <TextInput value={settings.reminders} onChange={(value) => update('reminders', value)} placeholder="7" type="number" />
            </Field>
            <Field label="Afzender e-mail">
              <TextInput value={settings.sender} onChange={(value) => update('sender', value)} placeholder="facturen@bedrijf.nl" type="email" />
            </Field>
            <div style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 14, color: colors.muted, fontSize: 13, lineHeight: 1.55 }}>
              Lokale opslag wordt gebruikt voor klanten, bedrijfsprofielen en facturen. Een backend kan later dezelfde datastructuren overnemen.
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Lokale data" style={{ marginTop: 18 }}>
        <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: fonts.heading, color: '#fff', fontWeight: 800, marginBottom: 5 }}>Storage keys</div>
            <div style={{ color: colors.muted, fontSize: 13, overflowWrap: 'anywhere' }}>Gebruikt: cds_klanten, cds_bedrijven, cds_facturen, cds_offertes en cds_terugkerend.</div>
          </div>
          <Button variant="secondary" icon="download" onClick={exportData}>Data exporteren</Button>
        </div>
      </SectionCard>

      <SectionCard title="Uitloggen" style={{ marginTop: 18 }}>
        <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: fonts.heading, color: '#fff', fontWeight: 800, marginBottom: 5 }}>Account sessie</div>
            <div style={{ color: colors.muted, fontSize: 13 }}>Verwijdert alleen de lokale sessie. Uw klanten, facturen en profielen blijven bewaard.</div>
          </div>
          <Button variant="danger" onClick={logout}>Uitloggen</Button>
        </div>
      </SectionCard>

      <Toast message={toast} />
    </main>
  )
}

function readStorageArray(key: string) {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeRows(rows: unknown[]) {
  return rows.map((row) => {
    if (!row || typeof row !== 'object') return { waarde: serializeCell(row) }
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, serializeCell(value)]))
  })
}

function serializeCell(value: unknown) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'ja' : 'nee'
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 16 }}>
      <div style={{ color: colors.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 }}>{label}</div>
      <div style={{ color: '#fff', fontFamily: fonts.heading, fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  )
}
