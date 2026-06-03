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
  canCreateOffer,
  createId,
  fmtCurrency,
  invoiceTotals,
  nextOfferNumber,
  todayIso,
  type Invoice,
  type InvoiceLine,
  type InvoiceStatus,
  useClients,
  useCompanies,
  useOffers,
  usePlan,
} from '@/app/lib/data'
import { downloadInvoicePdf } from '@/app/lib/invoice-pdf'

const OFFER_VALID_DAYS = 30
const PREVIEW_SCALE = 0.52

export default function NieuweOffertePage() {
  const router = useRouter()
  const [clients] = useClients()
  const [companies] = useCompanies()
  const [offers, setOffers] = useOffers()
  const [plan] = usePlan()
  const [companyId, setCompanyId] = useState('')
  const [clientId, setClientId] = useState('')
  const [manualClient, setManualClient] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [date, setDate] = useState(todayIso())
  const [validUntil, setValidUntil] = useState(addDays(todayIso(), OFFER_VALID_DAYS))
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<InvoiceLine[]>([blankLine(21)])
  const [toast, setToast] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [downloadBusy, setDownloadBusy] = useState(false)

  const company = companies.find((item) => item.id === companyId) || companies[0]
  const client = clients.find((item) => item.id === clientId)
  const defaultVat = company?.defaultVat || 21
  const offerNumber = nextOfferNumber(offers, company)
  const totals = useMemo(() => invoiceTotals({ lines }), [lines])
  const offerAllowed = canCreateOffer(plan)
  const previewHeight = `${297 * PREVIEW_SCALE}mm`
  const previewWidth = `${210 * PREVIEW_SCALE}mm`

  useEffect(() => {
    if (!companyId && companies[0]) setCompanyId(companies[0].id)
  }, [companies, companyId])

  useEffect(() => {
    setValidUntil(addDays(date, OFFER_VALID_DAYS))
  }, [date])

  useEffect(() => {
    if (!offerAllowed) setUpgradeOpen(true)
  }, [offerAllowed])

  if (!offerAllowed) {
    return (
      <main style={mainScroll}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>Nieuwe offerte</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Offertes zijn niet beschikbaar in dit plan.</div>
          </div>
        </div>
        <EmptyState
          icon="quote"
          title="Offertes uitgeschakeld"
          body="Upgrade naar Basis of Professional om offertes aan te maken."
          action={<Button icon="quote" onClick={() => setUpgradeOpen(true)}>Plan bekijken</Button>}
        />
        <PlanRestrictionModal
          open={upgradeOpen}
          plan={plan}
          title="Offertes niet beschikbaar"
          message="Offertes zijn beschikbaar vanaf het Basis abonnement."
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

  function buildOffer(status: InvoiceStatus): Invoice {
    const clientName = client?.name || manualClient.trim()
    return {
      id: createId('offerte'),
      number: offerNumber,
      date,
      dueDate: validUntil,
      clientId: client?.id || '',
      clientName,
      clientEmail: client?.email || manualEmail,
      companyId: company?.id || '',
      companyName: company?.name || 'CDS Facturen',
      reference,
      status,
      lines: lines.map((line) => ({
        ...line,
        quantity: Number(line.quantity || 0),
        price: Number(line.price || 0),
        vatRate: Number(line.vatRate || 0),
      })),
      notes,
      createdAt: new Date().toISOString(),
    }
  }

  function save(status: InvoiceStatus) {
    if (!offerAllowed) {
      setUpgradeOpen(true)
      return
    }
    const clientName = client?.name || manualClient.trim()
    if (!clientName) {
      setToast('Selecteer een klant of vul een klantnaam in.')
      return
    }
    if (lines.every((line) => !line.description.trim())) {
      setToast('Voeg minimaal een offerteregel toe.')
      return
    }

    const offer = buildOffer(status)
    setOffers((current) => [offer, ...current])
    router.push('/offertes')
  }

  async function downloadPdf() {
    setDownloadBusy(true)
    try {
      await downloadInvoicePdf({
        company,
        client,
        invoice: buildOffer('concept'),
        type: 'offerte',
      })
    } catch {
      setToast('PDF downloaden mislukt.')
    } finally {
      setDownloadBusy(false)
    }
  }

  return (
    <main style={{ ...mainScroll, padding: 0, display: 'flex', flexWrap: 'wrap', minHeight: 0, alignItems: 'stretch' }}>
      <form onSubmit={preventDefault(() => save('openstaand'))} style={{ flex: '1 1 560px', minWidth: 0, overflow: 'auto', padding: 'clamp(16px, 3vw, 32px)' }}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>Nieuwe offerte</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Offertedetails, regels en voorbeeldweergave.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" icon="download" onClick={downloadPdf} disabled={downloadBusy}>
              {downloadBusy ? 'PDF wordt gemaakt' : 'PDF downloaden'}
            </Button>
            <Button variant="secondary" onClick={() => save('concept')}>Concept bewaren</Button>
            <Button type="submit" icon="check">Offerte opslaan</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, width: '100%', overflow: 'hidden' }}>
          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: fonts.heading, fontSize: 15 }}>Klant en offertegegevens</h2>
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
              <Field label="Offertenummer">
                <TextInput value={offerNumber} onChange={() => undefined} placeholder="OFF-0001" />
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
              <Field label="Offertedatum">
                <TextInput value={date} onChange={setDate} placeholder="2026-06-02" type="date" />
              </Field>
              <Field label="Geldig tot">
                <TextInput value={validUntil} onChange={setValidUntil} placeholder="2026-07-02" type="date" />
              </Field>
            </div>
          </section>

          <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '16px 18px', borderBottom: `0.5px solid ${colors.border2}` }}>
              <h2 style={{ margin: 0, fontFamily: fonts.heading, fontSize: 15 }}>Offerteregels</h2>
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
            <Field label="Opmerkingen">
              <TextArea value={notes} onChange={setNotes} placeholder="Bijv. leveringsvoorwaarden of toelichting" rows={4} />
            </Field>
          </section>
        </div>
      </form>

      <aside style={{ width: 'min(430px, 100%)', flex: '0 1 430px', minWidth: 0, overflow: 'auto', background: colors.navy2, borderLeft: `0.5px solid ${colors.border2}`, padding: 'clamp(16px, 2.5vw, 24px)' }}>
        <div style={{ position: 'sticky', top: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 15, color: '#fff' }}>PDF preview</div>
              <div style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Exact A4-voorbeeld van de offerte.</div>
            </div>
            <div style={{ color: colors.muted, fontSize: 11 }}>210 x 297 mm</div>
          </div>
          <div style={{ width: `calc(${previewWidth} + 10px)`, maxWidth: '100%', height: `calc(${previewHeight} + 10px)`, overflow: 'auto', border: `1px solid ${colors.border2}`, borderRadius: 8, background: '#e5e7eb', padding: 5 }}>
            <div style={{ width: '210mm', height: '297mm', transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', background: '#fff' }}>
              <InvoiceDocument company={company} client={client} invoice={buildOffer('concept')} type="offerte" />
            </div>
          </div>
        </div>
      </aside>
      <Toast message={toast} />
    </main>
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
