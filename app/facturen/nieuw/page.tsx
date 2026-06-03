'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import InvoiceDocument from '@/app/components/InvoiceDocument'
import { Button, Field, SelectInput, TextArea, TextInput, Toast, preventDefault } from '@/app/components/ui'
import { colors, fonts, formGrid, inputStyle, mainScroll, pageHeader, thStyle, tdStyle, titleStyle } from '@/app/lib/theme'
import {
  addDays,
  blankLine,
  canCreateInvoice,
  canUseIdeal,
  companyProfileLabel,
  createId,
  fmtCurrency,
  invoiceTotals,
  lineTotals,
  nextInvoiceNumber,
  resolveActiveCompanyIndex,
  todayIso,
  type Invoice,
  type InvoiceLine,
  type InvoiceStatus,
  type PaymentMethods,
  type PriceInputMode,
  useActiveCompanyIndex,
  useClients,
  useCompanies,
  useInvoices,
  usePlan,
} from '@/app/lib/data'
import { downloadInvoicePdf } from '@/app/lib/invoice-pdf'

const defaultPaymentMethods: PaymentMethods = {
  ideal: true,
  bankTransfer: true,
  directDebit: false,
}

const PREVIEW_SCALE = 0.52

export default function NieuweFactuurPage() {
  return (
    <Suspense fallback={null}>
      <NieuweFactuurForm />
    </Suspense>
  )
}

function NieuweFactuurForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit') || ''
  const requestedClientId = searchParams.get('client') || ''
  const [clients] = useClients()
  const [companies, setCompanies] = useCompanies()
  const [activeCompanyIndex, setActiveCompanyIndex] = useActiveCompanyIndex()
  const [invoices, setInvoices] = useInvoices()
  const [plan] = usePlan()
  const [companyId, setCompanyId] = useState('')
  const [clientId, setClientId] = useState('')
  const [manualClient, setManualClient] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [date, setDate] = useState(todayIso())
  const [dueDate, setDueDate] = useState(addDays(todayIso(), 14))
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<InvoiceLine[]>([blankLine(21)])
  const [priceInputMode, setPriceInputMode] = useState<PriceInputMode>('excl')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>(defaultPaymentMethods)
  const [loadedEditId, setLoadedEditId] = useState('')
  const [toast, setToast] = useState('')
  const [limitOpen, setLimitOpen] = useState(false)
  const [downloadBusy, setDownloadBusy] = useState(false)

  const editingInvoice = editId ? invoices.find((item) => item.id === editId) : undefined
  const isEditing = Boolean(editingInvoice && editingInvoice.status === 'concept')
  const resolvedActiveCompanyIndex = resolveActiveCompanyIndex(companies, activeCompanyIndex)
  const activeCompany = companies[resolvedActiveCompanyIndex]
  const company = companies.find((item) => item.id === companyId) || activeCompany
  const client = clients.find((item) => item.id === clientId)
  const defaultVat = company?.defaultVat || 21
  const invoiceNumber = editingInvoice?.number || nextInvoiceNumber(company)
  const totals = useMemo(() => invoiceTotals({ lines, priceInputMode }), [lines, priceInputMode])
  const idealAllowed = canUseIdeal(plan)
  const effectivePaymentMethods = useMemo(
    () => ({ ...paymentMethods, ideal: idealAllowed ? paymentMethods.ideal : false }),
    [idealAllowed, paymentMethods],
  )

  const previewInvoice = useMemo<Invoice>(
    () => ({
      id: editingInvoice?.id || createId('factuur-preview'),
      number: invoiceNumber,
      date,
      dueDate,
      clientId: client?.id || '',
      clientName: client?.name || manualClient,
      clientEmail: client?.email || manualEmail,
      companyId: company?.id || '',
      companyName: company?.name || company?.legalName || 'CDS Facturen',
      reference,
      status: 'concept',
      lines,
      priceInputMode,
      paymentMethods: effectivePaymentMethods,
      notes,
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
    }),
    [client?.email, client?.id, client?.name, company?.id, company?.legalName, company?.name, date, dueDate, editingInvoice?.createdAt, editingInvoice?.id, effectivePaymentMethods, invoiceNumber, lines, manualClient, manualEmail, notes, priceInputMode, reference],
  )

  useEffect(() => {
    if (companies.length === 0) {
      if (companyId) setCompanyId('')
      if (activeCompanyIndex !== 0) setActiveCompanyIndex(0)
      return
    }

    if (activeCompanyIndex !== resolvedActiveCompanyIndex) {
      setActiveCompanyIndex(resolvedActiveCompanyIndex)
      return
    }

    if (!editId && (!companyId || !companies.some((item) => item.id === companyId))) {
      setCompanyId(activeCompany?.id || '')
    }
  }, [activeCompany?.id, activeCompanyIndex, companies, companyId, editId, resolvedActiveCompanyIndex, setActiveCompanyIndex])

  useEffect(() => {
    if (!editId && requestedClientId && clients.some((item) => item.id === requestedClientId)) {
      setClientId(requestedClientId)
    }
  }, [clients, editId, requestedClientId])

  useEffect(() => {
    setDueDate(addDays(date, company?.paymentTerm || 14))
  }, [company?.paymentTerm, date])

  useEffect(() => {
    if (!editId || loadedEditId === editId) return
    const invoice = invoices.find((item) => item.id === editId)
    if (!invoice) {
      setLoadedEditId(editId)
      setToast('Conceptfactuur niet gevonden.')
      return
    }
    if (invoice.status !== 'concept') {
      setLoadedEditId(editId)
      setToast('Alleen conceptfacturen kunnen worden bewerkt.')
      router.push('/facturen')
      return
    }

    setCompanyId(invoice.companyId)
    setClientId(invoice.clientId)
    setManualClient(invoice.clientId ? '' : invoice.clientName)
    setManualEmail(invoice.clientId ? '' : invoice.clientEmail)
    setDate(invoice.date)
    setDueDate(invoice.dueDate)
    setReference(invoice.reference)
    setNotes(invoice.notes)
    setLines(invoice.lines.length > 0 ? invoice.lines : [blankLine(defaultVat)])
    setPriceInputMode(invoice.priceInputMode || 'excl')
    setPaymentMethods({ ...defaultPaymentMethods, ...invoice.paymentMethods })
    setLoadedEditId(editId)
  }, [defaultVat, editId, invoices, loadedEditId, router])

  useEffect(() => {
    if (client) {
      setPriceInputMode(client.priceInputMode || 'excl')
    } else if (!editId) {
      setPriceInputMode('excl')
    }
  }, [client, editId])

  useEffect(() => {
    if (!idealAllowed && paymentMethods.ideal) {
      setPaymentMethods((current) => ({ ...current, ideal: false }))
    }
  }, [idealAllowed, paymentMethods.ideal])

  function updateLine(id: string, patch: Partial<InvoiceLine>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function removeLine(id: string) {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.id !== id)))
  }

  function addLine() {
    setLines((current) => [...current, blankLine(defaultVat)])
  }

  function togglePaymentMethod(key: keyof PaymentMethods) {
    if (key === 'ideal' && !idealAllowed) return
    if (key === 'directDebit') return
    setPaymentMethods((current) => ({ ...current, [key]: !current[key] }))
  }

  function selectCompany(nextCompanyId: string) {
    setCompanyId(nextCompanyId)
    const nextIndex = companies.findIndex((item) => item.id === nextCompanyId)
    if (nextIndex >= 0) setActiveCompanyIndex(nextIndex)
  }

  function buildInvoice(status: InvoiceStatus): Invoice {
    return {
      ...previewInvoice,
      status: status === 'openstaand' ? 'verzonden' : status,
      lines: lines.map((line) => ({
        ...line,
        quantity: Number(line.quantity || 0),
        price: Number(line.price || 0),
        vatRate: Number(line.vatRate || 0),
      })),
      createdAt: editingInvoice?.createdAt || previewInvoice.createdAt,
    }
  }

  function save(status: InvoiceStatus) {
    const clientName = client?.name || manualClient.trim()
    if (!clientName) {
      setToast('Selecteer een klant of vul een klantnaam in.')
      return
    }
    if (lines.every((line) => !line.description.trim())) {
      setToast('Voeg minimaal een factuurregel toe.')
      return
    }

    const limit = canCreateInvoice(plan, invoices, editingInvoice?.id)
    if (!limit.allowed) {
      setLimitOpen(true)
      return
    }

    const invoice = buildInvoice(status)
    if (editingInvoice) {
      setInvoices((current) => current.map((item) => (item.id === editingInvoice.id ? invoice : item)))
    } else {
      setInvoices((current) => [invoice, ...current])
      if (company) {
        setCompanies((current) => current.map((item) => (item.id === company.id ? { ...item, nextNumber: (item.nextNumber || 1) + 1 } : item)))
      }
    }
    router.push('/facturen')
  }

  async function downloadPdf() {
    setDownloadBusy(true)
    try {
      await downloadInvoicePdf({
        company,
        client,
        invoice: buildInvoice('concept'),
      })
    } catch {
      setToast('PDF downloaden mislukt.')
    } finally {
      setDownloadBusy(false)
    }
  }

  const previewHeight = `${297 * PREVIEW_SCALE}mm`
  const previewWidth = `${210 * PREVIEW_SCALE}mm`

  return (
    <main style={{ ...mainScroll, padding: 0, display: 'flex', flexWrap: 'wrap', minHeight: 0, alignItems: 'stretch' }}>
      <form onSubmit={preventDefault(() => save('verzonden'))} style={{ flex: '1 1 560px', minWidth: 0, overflow: 'auto', padding: 'clamp(16px, 3vw, 32px)' }}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>{isEditing ? 'Concept bewerken' : 'Nieuwe factuur'}</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Factuurdetails, regels en exact A4-voorbeeld.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" icon="download" onClick={downloadPdf} disabled={downloadBusy}>
              {downloadBusy ? 'PDF wordt gemaakt' : 'PDF downloaden'}
            </Button>
            <Button variant="secondary" onClick={() => save('concept')}>{isEditing ? 'Concept bijwerken' : 'Concept opslaan'}</Button>
            <Button type="submit" icon="check">Opslaan als verzonden</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, width: '100%', overflow: 'hidden' }}>
          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: fonts.heading, fontSize: 15 }}>Klant en factuurgegevens</h2>
            <div style={formGrid(230, 2)}>
              <Field label="Bedrijfsprofiel">
                {companies.length === 0 ? (
                  <div style={{ ...inputStyle, minHeight: 39, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', color: colors.muted }}>
                    <span>Geen bedrijfsprofielen -</span>
                    <Link href="/bedrijfsprofielen" style={{ color: '#6f8cff', fontWeight: 800, textDecoration: 'none' }}>maak er eerst een aan</Link>
                  </div>
                ) : (
                  <SelectInput value={company?.id || companyId} onChange={selectCompany}>
                    {companies.map((item) => <option key={item.id} value={item.id}>{companyProfileLabel(item)}</option>)}
                  </SelectInput>
                )}
              </Field>
              <Field label="Klant">
                <SelectInput value={clientId} onChange={setClientId}>
                  <option value="">Handmatig invoeren</option>
                  {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </SelectInput>
              </Field>
              <Field label="Factuurnummer">
                <TextInput value={invoiceNumber} onChange={() => undefined} placeholder="F-2026-001" />
              </Field>
              <Field label="Referentie">
                <TextInput value={reference} onChange={setReference} placeholder="Bijv. projectnaam of PO-nummer" />
              </Field>
              {!client ? (
                <>
                  <Field label="Klantnaam">
                    <TextInput value={manualClient} onChange={setManualClient} placeholder="Bedrijfsnaam of volledige naam" />
                  </Field>
                  <Field label="Klant e-mail">
                    <TextInput value={manualEmail} onChange={setManualEmail} placeholder="klant@bedrijf.nl" />
                  </Field>
                </>
              ) : null}
              <Field label="Factuurdatum">
                <TextInput value={date} onChange={setDate} placeholder="2026-06-02" type="date" />
              </Field>
              <Field label="Vervaldatum">
                <TextInput value={dueDate} onChange={setDueDate} placeholder="2026-06-16" type="date" />
              </Field>
            </div>
          </section>

          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: fonts.heading, fontSize: 15 }}>Betaalmethode</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <PaymentMethodRow
                checked={effectivePaymentMethods.ideal}
                title="iDEAL betaallink"
                body="Klant ontvangt betaallink via e-mail - via Mollie"
                disabled={!idealAllowed}
                tooltip={!idealAllowed ? 'iDEAL betaallink is beschikbaar vanaf het Basis abonnement' : undefined}
                onChange={() => togglePaymentMethod('ideal')}
              />
              <PaymentMethodRow
                checked={paymentMethods.bankTransfer}
                title="Bankoverschrijving"
                body={company?.iban ? `IBAN ${company.iban} wordt op de factuur getoond` : 'IBAN uit het bedrijfsprofiel wordt op de factuur getoond'}
                onChange={() => togglePaymentMethod('bankTransfer')}
              />
              <PaymentMethodRow
                checked={paymentMethods.directDebit}
                title="Automatische incasso"
                body="Binnenkort beschikbaar"
                disabled
                onChange={() => togglePaymentMethod('directDebit')}
              />
            </div>
          </section>

          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '16px 18px', borderBottom: `0.5px solid ${colors.border2}` }}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontFamily: fonts.heading, fontSize: 15 }}>Factuurregels</h2>
                <div style={{ color: colors.muted, fontSize: 11.5, marginTop: 4 }}>{client ? 'Prijsinvoer volgens klantvoorkeur.' : 'Prijsinvoer handmatig ingesteld.'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <PriceModeSwitch value={priceInputMode} onChange={setPriceInputMode} />
                <Button variant="secondary" icon="plus" onClick={addLine}>Regel toevoegen</Button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Omschrijving</th>
                    <th style={{ ...thStyle, width: 92 }}>Aantal</th>
                    <th style={{ ...thStyle, width: 150 }}>Prijs {priceInputMode === 'incl' ? 'incl. BTW' : 'excl. BTW'}</th>
                    <th style={{ ...thStyle, width: 104 }}>BTW</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Totaal incl.</th>
                    <th style={{ ...thStyle, width: 54 }} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const total = lineTotals(line, priceInputMode).total
                    return (
                      <tr key={line.id}>
                        <td style={tdStyle}>
                          <input value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} placeholder="Omschrijving van product of dienst" style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input type="number" step="0.01" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) })} placeholder="1" style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input type="number" step="0.01" value={line.price} onChange={(event) => updateLine(line.id, { price: Number(event.target.value) })} placeholder="0.00" style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <select value={line.vatRate} onChange={(event) => updateLine(line.id, { vatRate: Number(event.target.value) })} style={inputStyle}>
                            <option value={0}>0%</option>
                            <option value={9}>9%</option>
                            <option value={21}>21%</option>
                          </select>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fonts.heading, fontWeight: 800 }}>{fmtCurrency(total)}</td>
                        <td style={tdStyle}>
                          <Button variant="danger" onClick={() => removeLine(line.id)} style={{ minHeight: 32, padding: '6px 9px' }}>X</Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 18 }}>
              <div style={{ width: 'min(300px, 100%)', display: 'grid', gap: 8 }}>
                <TotalRow label="Subtotaal excl. BTW" value={fmtCurrency(totals.subtotal)} />
                <TotalRow label="BTW" value={fmtCurrency(totals.vat)} />
                <TotalRow label="Totaal incl. BTW" value={fmtCurrency(totals.total)} strong />
              </div>
            </div>
          </section>

          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 20 }}>
            <Field label="Betalingsinstructies">
              <TextArea value={notes} onChange={setNotes} placeholder="Bijv. gelieve binnen 14 dagen te betalen" rows={4} />
            </Field>
          </section>
        </div>
      </form>

      <aside style={{ width: 'min(430px, 100%)', flex: '0 1 430px', minWidth: 0, overflow: 'auto', background: colors.navy2, borderLeft: `0.5px solid ${colors.border2}`, padding: 'clamp(16px, 2.5vw, 24px)' }}>
        <div style={{ position: 'sticky', top: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 15, color: '#fff' }}>PDF preview</div>
              <div style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Exact A4-voorbeeld, live bijgewerkt.</div>
            </div>
            <div style={{ color: colors.muted, fontSize: 11 }}>210 x 297 mm</div>
          </div>
          <div style={{ width: `calc(${previewWidth} + 10px)`, maxWidth: '100%', height: `calc(${previewHeight} + 10px)`, overflow: 'auto', border: `1px solid ${colors.border2}`, borderRadius: 8, background: '#e5e7eb', padding: 5 }}>
            <div style={{ width: '210mm', height: '297mm', transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', background: '#fff' }}>
              <InvoiceDocument company={company} client={client} invoice={previewInvoice} />
            </div>
          </div>
        </div>
      </aside>

      <PlanRestrictionModal
        open={limitOpen}
        plan={plan}
        title="Factuurlimiet bereikt"
        message="Je hebt het maximum van 5 facturen per maand bereikt voor het Gratis plan. Upgrade naar Basis voor onbeperkt factureren."
        onClose={() => setLimitOpen(false)}
      />

      <Toast message={toast} />
    </main>
  )
}

function PriceModeSwitch({ value, onChange }: { value: PriceInputMode; onChange: (value: PriceInputMode) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 4, flexWrap: 'wrap' }}>
      {[
        ['excl', 'Prijzen invoeren excl. BTW'],
        ['incl', 'Prijzen invoeren incl. BTW'],
      ].map(([mode, label]) => {
        const active = value === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode as PriceInputMode)}
            style={{
              border: 0,
              borderRadius: 7,
              padding: '7px 10px',
              background: active ? colors.blue : 'transparent',
              color: active ? '#fff' : colors.muted,
              cursor: 'pointer',
              fontFamily: fonts.heading,
              fontWeight: 800,
              fontSize: 11.5,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function PaymentMethodRow({
  checked,
  title,
  body,
  disabled,
  tooltip,
  onChange,
}: {
  checked: boolean
  title: string
  body: string
  disabled?: boolean
  tooltip?: string
  onChange: () => void
}) {
  return (
    <label
      title={tooltip}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        border: `0.5px solid ${disabled ? 'rgba(240,244,255,0.08)' : colors.border2}`,
        borderRadius: 8,
        background: disabled ? 'rgba(255,255,255,0.025)' : colors.surface,
        color: disabled ? colors.muted2 : colors.white,
        padding: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.68 : 1,
      }}
    >
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} style={{ marginTop: 2, accentColor: colors.blue }} />
      <span style={{ display: 'grid', gap: 3, minWidth: 0 }}>
        <span style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 13 }}>{title}</span>
        <span style={{ color: disabled ? colors.muted2 : colors.muted, fontSize: 12, lineHeight: 1.4 }}>{body}</span>
      </span>
    </label>
  )
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: colors.white, fontSize: strong ? 15 : 13, fontWeight: strong ? 800 : 500, fontFamily: strong ? fonts.heading : fonts.body }}>
      <span style={{ color: strong ? 'inherit' : colors.muted }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
