'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import InvoiceDocument from '@/app/components/InvoiceDocument'
import { Button, EmptyState, Field, SelectInput, TextArea, TextInput, Toast, preventDefault } from '@/app/components/ui'
import { colors, fonts, formGrid, inputStyle, mainScroll, pageHeader, tdStyle, thStyle, titleStyle } from '@/app/lib/theme'
import {
  addDays,
  blankLine,
  canUseIncasso,
  createId,
  fmtCurrency,
  fmtDate,
  invoiceTotals,
  nextInvoiceNumber,
  todayIso,
  type InvoiceLine,
  type PaymentMethods,
  type RecurringInvoice,
  type RecurringSendDay,
  useClients,
  useCompanies,
  usePlan,
  useRecurringInvoices,
} from '@/app/lib/data'
import { downloadInvoicePdf } from '@/app/lib/invoice-pdf'

const defaultPaymentMethods: PaymentMethods = {
  ideal: true,
  bankTransfer: true,
  directDebit: false,
}

const sendDayOptions: Array<{ value: RecurringSendDay; label: string }> = [
  { value: 'first', label: '1e van de maand' },
  { value: 'fifteenth', label: '15e van de maand' },
  { value: 'twentyFirst', label: '21e van de maand' },
  { value: 'custom', label: 'Aangepaste datum' },
]

const PREVIEW_SCALE = 0.52

export default function NieuweTerugkerendeFactuurPage() {
  const router = useRouter()
  const [clients] = useClients()
  const [companies, setCompanies] = useCompanies()
  const [, setRecurringInvoices] = useRecurringInvoices()
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>(defaultPaymentMethods)
  const [sendDay, setSendDay] = useState<RecurringSendDay>('first')
  const [firstSendDate, setFirstSendDate] = useState(todayIso())
  const [ongoing, setOngoing] = useState(true)
  const [endDate, setEndDate] = useState(addDays(todayIso(), 365))
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [downloadBusy, setDownloadBusy] = useState(false)

  const company = companies.find((item) => item.id === companyId) || companies[0]
  const client = clients.find((item) => item.id === clientId)
  const defaultVat = company?.defaultVat || 21
  const invoiceNumber = nextInvoiceNumber(company)
  const totals = useMemo(() => invoiceTotals({ lines }), [lines])
  const nextSendDate = useMemo(() => calculateNextSendDate(sendDay, firstSendDate), [firstSendDate, sendDay])
  const nextSendText = !ongoing && endDate && nextSendDate > endDate ? 'Geen verzending binnen einddatum' : fmtDate(nextSendDate)
  const incassoAllowed = canUseIncasso(plan)
  const recurringInterval = sendDayOptions.find((option) => option.value === sendDay)?.label || 'aangepaste interval'
  const previewHeight = `${297 * PREVIEW_SCALE}mm`
  const previewWidth = `${210 * PREVIEW_SCALE}mm`

  useEffect(() => {
    if (!companyId && companies[0]) setCompanyId(companies[0].id)
  }, [companies, companyId])

  useEffect(() => {
    setDueDate(addDays(date, company?.paymentTerm || 14))
  }, [company?.paymentTerm, date])

  useEffect(() => {
    if (!incassoAllowed) setUpgradeOpen(true)
  }, [incassoAllowed])

  if (!incassoAllowed) {
    return (
      <main style={mainScroll}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>Nieuwe terugkerende factuur</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Terugkerende incasso-facturen zijn beschikbaar in Professional.</div>
          </div>
        </div>
        <EmptyState
          icon="repeat"
          title="Terugkerend uitgeschakeld"
          body="Upgrade naar Professional om terugkerende incasso-facturen te gebruiken."
          action={<Button icon="repeat" onClick={() => setUpgradeOpen(true)}>Plan bekijken</Button>}
        />
        <PlanRestrictionModal
          open={upgradeOpen}
          plan={plan}
          title="Incasso niet beschikbaar"
          message="Terugkerende incasso-facturen zijn beschikbaar in het Professional abonnement."
          onClose={() => setUpgradeOpen(false)}
        />
      </main>
    )
  }

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
    if (key === 'directDebit') return
    setPaymentMethods((current) => ({ ...current, [key]: !current[key] }))
  }

  function buildRecurringInvoice(): RecurringInvoice {
    const clientName = client?.name || manualClient.trim()
    return {
      id: createId('terugkerend'),
      number: invoiceNumber,
      date,
      dueDate,
      clientId: client?.id || '',
      clientName,
      clientEmail: client?.email || manualEmail,
      companyId: company?.id || '',
      companyName: company?.name || 'CDS Facturen',
      reference,
      status: 'openstaand',
      lines: lines.map((line) => ({
        ...line,
        quantity: Number(line.quantity || 0),
        price: Number(line.price || 0),
        vatRate: Number(line.vatRate || 0),
      })),
      paymentMethods,
      notes,
      createdAt: new Date().toISOString(),
      active: true,
      schedule: {
        sendDay,
        firstSendDate,
        endDate: ongoing ? '' : endDate,
        ongoing,
        nextSendDate,
      },
    }
  }

  function save() {
    if (!incassoAllowed) {
      setUpgradeOpen(true)
      return
    }
    const clientName = client?.name || manualClient.trim()
    if (!clientName) {
      setToast('Selecteer een klant of vul een klantnaam in.')
      return
    }
    if (lines.every((line) => !line.description.trim())) {
      setToast('Voeg minimaal een factuurregel toe.')
      return
    }
    if (!ongoing && endDate && nextSendDate > endDate) {
      setToast('Kies een einddatum na de volgende verzending.')
      return
    }

    const recurringInvoice = buildRecurringInvoice()
    setRecurringInvoices((current) => [recurringInvoice, ...current])
    if (company) {
      setCompanies((current) => current.map((item) => (item.id === company.id ? { ...item, nextNumber: (item.nextNumber || 1) + 1 } : item)))
    }
    router.push('/terugkerend')
  }

  async function downloadPdf() {
    setDownloadBusy(true)
    try {
      await downloadInvoicePdf({
        company,
        client,
        invoice: buildRecurringInvoice(),
        type: 'terugkerend',
        recurringInterval,
      })
    } catch {
      setToast('PDF downloaden mislukt.')
    } finally {
      setDownloadBusy(false)
    }
  }

  return (
    <main style={{ ...mainScroll, padding: 0, display: 'flex', flexWrap: 'wrap', minHeight: 0, alignItems: 'stretch' }}>
      <form onSubmit={preventDefault(save)} style={{ flex: '1 1 560px', minWidth: 0, overflow: 'auto', padding: 'clamp(16px, 3vw, 32px)' }}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>Nieuwe terugkerende factuur</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Factuurtemplate, planning en voorbeeldweergave.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" icon="download" onClick={downloadPdf} disabled={downloadBusy}>
              {downloadBusy ? 'PDF wordt gemaakt' : 'PDF downloaden'}
            </Button>
            <Button variant="secondary" href="/terugkerend">Annuleren</Button>
            <Button type="submit" icon="check">Reeks opslaan</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, width: '100%', overflow: 'hidden' }}>
          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: fonts.heading, fontSize: 15 }}>Klant en factuurgegevens</h2>
            <div style={formGrid(230, 2)}>
              <Field label="Bedrijfsprofiel">
                <SelectInput value={companyId} onChange={setCompanyId}>
                  {companies.length === 0 ? <option value="">Geen bedrijfsprofiel</option> : null}
                  {companies.map((item) => <option key={item.id} value={item.id}>{item.name || item.legalName}</option>)}
                </SelectInput>
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
                <TextInput value={reference} onChange={setReference} placeholder="Bijv. abonnement of contractnummer" />
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
            <h2 style={{ margin: '0 0 16px', fontFamily: fonts.heading, fontSize: 15 }}>Automatisch verzenden</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 10 }}>
                {sendDayOptions.map((option) => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      border: `0.5px solid ${sendDay === option.value ? 'rgba(36,86,255,0.55)' : colors.border2}`,
                      borderRadius: 8,
                      background: sendDay === option.value ? colors.blueSoft : colors.surface,
                      padding: 12,
                      cursor: 'pointer',
                      color: sendDay === option.value ? colors.white : colors.muted,
                      fontSize: 13,
                    }}
                  >
                    <input type="radio" name="sendDay" checked={sendDay === option.value} onChange={() => setSendDay(option.value)} style={{ accentColor: colors.blue }} />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <div style={formGrid(220, 2)}>
                <Field label="Eerste verzending">
                  <TextInput value={firstSendDate} onChange={setFirstSendDate} placeholder="2026-06-02" type="date" />
                </Field>
                <Field label="Einddatum">
                  {ongoing ? (
                    <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', minHeight: 39, color: colors.muted }}>Doorlopend</div>
                  ) : (
                    <TextInput value={endDate} onChange={setEndDate} placeholder="2027-06-02" type="date" />
                  )}
                </Field>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.white, fontSize: 13 }}>
                <input type="checkbox" checked={ongoing} onChange={(event) => setOngoing(event.target.checked)} style={{ accentColor: colors.blue }} />
                Doorlopend
              </label>

              <div style={{ border: `0.5px solid ${colors.border2}`, borderRadius: 8, background: colors.blueSoft, padding: 14, color: colors.white, fontSize: 13 }}>
                Volgende factuur wordt verzonden op: <strong>{nextSendText}</strong>
              </div>
            </div>
          </section>

          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: fonts.heading, fontSize: 15 }}>Betaalmethode</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <PaymentMethodRow
                checked={paymentMethods.ideal}
                title="iDEAL betaallink"
                body="Klant ontvangt betaallink via e-mail"
                onChange={() => togglePaymentMethod('ideal')}
              />
              <PaymentMethodRow
                checked={paymentMethods.bankTransfer}
                title="Bankoverschrijving"
                body="IBAN wordt op de factuur getoond"
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
              <h2 style={{ margin: 0, fontFamily: fonts.heading, fontSize: 15 }}>Factuurregels</h2>
              <Button variant="secondary" icon="plus" onClick={addLine}>Regel toevoegen</Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Omschrijving</th>
                    <th style={{ ...thStyle, width: 92 }}>Aantal</th>
                    <th style={{ ...thStyle, width: 130 }}>Prijs</th>
                    <th style={{ ...thStyle, width: 104 }}>BTW</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Totaal</th>
                    <th style={{ ...thStyle, width: 54 }} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const subtotal = Number(line.quantity || 0) * Number(line.price || 0)
                    const total = subtotal * (1 + Number(line.vatRate || 0) / 100)
                    return (
                      <tr key={line.id}>
                        <td style={tdStyle}>
                          <input value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} placeholder="Omschrijving van product of dienst" style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input type="number" min="0" step="0.01" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) })} placeholder="1" style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input type="number" min="0" step="0.01" value={line.price} onChange={(event) => updateLine(line.id, { price: Number(event.target.value) })} placeholder="0.00" style={inputStyle} />
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
              <div style={{ width: 'min(280px, 100%)', display: 'grid', gap: 8 }}>
                <TotalRow label="Subtotaal" value={fmtCurrency(totals.subtotal)} />
                <TotalRow label="BTW" value={fmtCurrency(totals.vat)} />
                <TotalRow label="Totaal" value={fmtCurrency(totals.total)} strong />
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
              <div style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Exact A4-voorbeeld van de terugkerende factuur.</div>
            </div>
            <div style={{ color: colors.muted, fontSize: 11 }}>210 x 297 mm</div>
          </div>
          <div style={{ width: `calc(${previewWidth} + 10px)`, maxWidth: '100%', height: `calc(${previewHeight} + 10px)`, overflow: 'auto', border: `1px solid ${colors.border2}`, borderRadius: 8, background: '#e5e7eb', padding: 5 }}>
            <div style={{ width: '210mm', height: '297mm', transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', background: '#fff' }}>
              <InvoiceDocument company={company} client={client} invoice={buildRecurringInvoice()} type="terugkerend" recurringInterval={recurringInterval} />
            </div>
          </div>
        </div>
      </aside>
      <Toast message={toast} />
    </main>
  )
}

function calculateNextSendDate(sendDay: RecurringSendDay, firstSendDate: string) {
  const start = new Date(`${firstSendDate || todayIso()}T00:00:00`)
  const today = new Date(`${todayIso()}T00:00:00`)
  const baseline = start.getTime() > today.getTime() ? start : today
  const day = sendDay === 'first' ? 1 : sendDay === 'fifteenth' ? 15 : sendDay === 'twentyFirst' ? 21 : start.getDate()
  let candidate = dateInMonth(baseline.getFullYear(), baseline.getMonth(), day)
  if (candidate.getTime() < baseline.getTime()) candidate = dateInMonth(baseline.getFullYear(), baseline.getMonth() + 1, day)
  return candidate.toISOString().slice(0, 10)
}

function dateInMonth(year: number, month: number, day: number) {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

function PaymentMethodRow({
  checked,
  title,
  body,
  disabled,
  onChange,
}: {
  checked: boolean
  title: string
  body: string
  disabled?: boolean
  onChange: () => void
}) {
  return (
    <label
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

function TotalRow({ label, value, strong, dark }: { label: string; value: string; strong?: boolean; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: dark ? '#0f172a' : colors.white, fontSize: strong ? 15 : 13, fontWeight: strong ? 800 : 500, fontFamily: strong ? fonts.heading : fonts.body }}>
      <span style={{ color: strong ? 'inherit' : dark ? '#64748b' : colors.muted }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
