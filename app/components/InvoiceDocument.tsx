'use client'

import type { CSSProperties, ReactNode } from 'react'
import {
  fmtCurrency,
  fmtDate,
  initials,
  invoiceTotals,
  lineTotals,
  vatBreakdown,
  type Client,
  type CompanyProfile,
  type InvoiceLine,
  type PaymentMethods,
  type PriceInputMode,
} from '@/app/lib/data'
import { fonts } from '@/app/lib/theme'

export type InvoiceDocumentData = {
  number: string
  date: string
  dueDate: string
  reference: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  clientPostalCode?: string
  clientCity?: string
  clientCountry?: string
  lines: InvoiceLine[]
  priceInputMode?: PriceInputMode
  paymentMethods?: PaymentMethods
  mollieConnected?: boolean
  idealPaymentUrl?: string
  notes: string
}

export type InvoicePDFType = 'factuur' | 'offerte' | 'terugkerend'

export function InvoicePDF({
  company,
  client,
  invoice,
  type = 'factuur',
  recurringInterval,
  className,
  hidePoweredByFooter,
  style,
}: {
  company?: CompanyProfile
  client?: Client
  invoice: InvoiceDocumentData
  type?: InvoicePDFType
  recurringInterval?: string
  className?: string
  hidePoweredByFooter?: boolean
  style?: CSSProperties
}) {
  const isOffer = type === 'offerte'
  const isRecurring = type === 'terugkerend'
  const companyName = company?.name || company?.legalName || 'CDS Facturen'
  const visibleLines = invoice.lines.filter((line) => line.description.trim())
  const totals = invoiceTotals({ lines: invoice.lines, priceInputMode: invoice.priceInputMode || 'excl' })
  const vatRows = vatBreakdown({ lines: invoice.lines, priceInputMode: invoice.priceInputMode || 'excl' })
  const priceMode = invoice.priceInputMode || 'excl'
  const rootClassName = ['invoice-document', className].filter(Boolean).join(' ')
  const brandColor = company?.brandColor || company?.accentColor || '#2456ff'
  const brandTextColor = company?.brandTextColor || '#ffffff'
  const bankTransferEnabled = !isOffer && Boolean(invoice.paymentMethods?.bankTransfer)
  const idealEnabled = !isOffer && Boolean(invoice.paymentMethods?.ideal)
  const idealPaymentUrl = invoice.idealPaymentUrl?.trim() || ''
  const hasLiveIdealPaymentUrl = Boolean(invoice.mollieConnected && idealPaymentUrl)
  const idealPaymentText = hasLiveIdealPaymentUrl ? `Betaallink: ${idealPaymentUrl}` : 'Betaallink: [wordt aangemaakt na verzenden]'
  const bankTransferInstruction = bankTransferEnabled
    ? `Gelieve over te maken op IBAN: ${company?.iban || '-'} t.n.v. ${companyName}`
    : ''
  const badgeLabel = isOffer ? 'OFFERTE' : 'FACTUUR'
  const documentLabel = isOffer ? 'Offerte' : 'Factuur'
  const dateLabel = isOffer ? 'Geldig tot' : 'Vervaldatum'
  const offerFooterText = 'Bedankt voor uw interesse.'

  const companyRows = [
    company?.address,
    [company?.postalCode, company?.city].filter(Boolean).join(' '),
    company?.country,
    company?.kvk ? `KvK ${company.kvk}` : '',
    company?.btw ? `BTW ${company.btw}` : '',
    !isOffer && company?.iban ? `IBAN ${company.iban}` : '',
    company?.phone ? `Tel. ${company.phone}` : '',
    company?.email,
  ].filter((row): row is string => Boolean(row))

  const clientRows = [
    invoice.clientAddress || client?.address,
    [invoice.clientPostalCode || client?.postalCode, invoice.clientCity || client?.city].filter(Boolean).join(' '),
    invoice.clientCountry || client?.country,
    client?.email || invoice.clientEmail,
  ].filter((row): row is string => Boolean(row))

  return (
    <article
      className={rootClassName}
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        background: '#fff',
        color: '#111827',
        padding: 0,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 11,
        lineHeight: 1.45,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <style>{`
        .invoice-powered-link:hover,
        .invoice-ideal-link:hover {
          text-decoration: underline !important;
        }
      `}</style>
      <header style={{ minHeight: 104, background: brandColor, color: brandTextColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '10mm 12mm', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <div
            style={{
              width: 96,
              height: 80,
              border: `1px solid ${brandTextColor}33`,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          >
            {company?.logoDataUrl ? (
              <img src={company.logoDataUrl} alt="Bedrijfslogo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
            ) : (
              <span style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 28, color: brandTextColor }}>{initials(companyName)}</span>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 0, fontFamily: fonts.heading, fontSize: 29, fontWeight: 800, lineHeight: 1.08, overflowWrap: 'anywhere' }}>
          {companyName}
        </div>
      </header>

      <div style={{ padding: '12mm 12mm 20mm' }}>
      <section style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #111827', borderRadius: 999, padding: '3px 9px', fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
            {badgeLabel}
          </div>
          <div style={{ fontFamily: fonts.heading, fontSize: 27, fontWeight: 800, lineHeight: 1.1, color: '#111827', overflowWrap: 'anywhere' }}>
            {documentLabel} #{invoice.number}
          </div>
          {isRecurring ? (
            <div style={{ marginTop: 7, color: '#4b5563', fontSize: 10.5, fontWeight: 700 }}>
              Terugkerende factuur - {recurringInterval || 'interval niet ingesteld'}
            </div>
          ) : null}
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, maxWidth: 300 }}>
            <MetaBlock label="Datum" value={fmtDate(invoice.date)} />
            <MetaBlock label={dateLabel} value={fmtDate(invoice.dueDate)} />
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <InfoPanel title="Klant">
          <div style={panelName}>{invoice.clientName || client?.name || '-'}</div>
          {clientRows.length > 0 ? clientRows.map((row) => <div key={row} style={panelRow}>{row}</div>) : <div style={panelRow}>-</div>}
        </InfoPanel>
        <InfoPanel title="Bedrijf">
          <div style={panelName}>{companyName}</div>
          {companyRows.length > 0 ? companyRows.map((row) => <div key={row} style={panelRow}>{row}</div>) : <div style={panelRow}>-</div>}
        </InfoPanel>
      </section>

      {visibleLines.length > 0 ? (
        <section style={{ marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.8 }}>
            <thead>
              <tr>
                {['Omschrijving', 'Aantal', 'Prijs excl. BTW', 'BTW%', 'Totaal'].map((header, index) => (
                  <th
                    key={header}
                    style={{
                      textAlign: index === 0 ? 'left' : 'right',
                      padding: '8px 8px',
                      borderTop: '1px solid #d1d5db',
                      borderBottom: '1px solid #d1d5db',
                      background: '#fafafa',
                      fontSize: 9.5,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleLines.map((line, index) => {
                const totalsForLine = lineTotals(line, priceMode)
                const basePrice = priceMode === 'incl' && line.vatRate >= 0 ? totalsForLine.subtotal / Math.max(Number(line.quantity || 0), 1) : Number(line.price || 0)
                return (
                  <tr key={line.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={cellLeft}>{line.description}</td>
                    <td style={cellRight}>{Number(line.quantity || 0)}</td>
                    <td style={cellRight}>{fmtCurrency(basePrice)}</td>
                    <td style={cellRight}>{Number(line.vatRate || 0)}%</td>
                    <td style={cellRight}>{fmtCurrency(totalsForLine.total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section style={{ border: '1px dashed #d1d5db', borderRadius: 8, padding: 18, color: '#6b7280', fontSize: 10.5, marginBottom: 16 }}>
          Geen factuurregels toegevoegd.
        </section>
      )}

      <section style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <div style={{ width: 210, display: 'grid', gap: 6 }}>
          <TotalRow label="Subtotaal excl. BTW" value={fmtCurrency(totals.subtotal)} />
          {vatRows.map((row) => (
            <TotalRow key={row.rate} label={`BTW ${row.rate}%`} value={fmtCurrency(row.vat)} />
          ))}
          <div style={{ height: 1, background: '#d1d5db', margin: '4px 0' }} />
          <TotalRow label="Totaal incl. BTW" value={fmtCurrency(totals.total)} strong />
        </div>
      </section>

      {isOffer ? (
        <section style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'grid', gap: 8, color: '#374151' }}>
          {invoice.notes ? (
            <div style={{ fontSize: 10.5, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {invoice.notes}
            </div>
          ) : null}
          <div style={{ fontSize: 11, fontWeight: 800, color: '#111827' }}>{offerFooterText}</div>
        </section>
      ) : (
        <section style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'grid', gap: 8, color: '#374151' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, color: '#111827' }}>Betalingsinstructies</div>
          <div style={{ fontSize: 10.5, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {invoice.notes || 'Gelieve het openstaande bedrag binnen de betaaltermijn te voldoen.'}
          </div>
          {idealEnabled ? (
            <div style={{ border: '1px solid #bfdbfe', borderRadius: 8, background: '#eff6ff', color: '#1e3a8a', padding: '9px 11px', display: 'grid', gap: 7, overflow: 'hidden' }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, color: '#1e3a8a' }}>Betalen via iDEAL:</div>
              {hasLiveIdealPaymentUrl ? (
                <a
                  className="invoice-ideal-link"
                  href={idealPaymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    border: '1px solid #2563eb',
                    borderRadius: 8,
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '8px 10px',
                    fontSize: 10.5,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    textAlign: 'center',
                    textDecoration: 'none',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {idealPaymentText}
                </a>
              ) : (
                <div
                  style={{
                    border: '1px solid #2563eb',
                    borderRadius: 8,
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '8px 10px',
                    fontSize: 10.5,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    textAlign: 'center',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {idealPaymentText}
                </div>
              )}
              {!hasLiveIdealPaymentUrl ? (
                <div style={{ color: '#1e40af', fontSize: 9.2, lineHeight: 1.35 }}>
                  Betaallink wordt gegenereerd na koppeling met Mollie
                </div>
              ) : null}
              <div style={{ color: '#64748b', fontSize: 9.2, lineHeight: 1.35 }}>
                iDEAL betaling via Mollie - beschikbaar zodra Mollie gekoppeld is
              </div>
            </div>
          ) : null}
          {bankTransferInstruction ? (
            <div style={{ border: '1px solid #bfdbfe', borderRadius: 8, background: '#eff6ff', color: '#1e3a8a', padding: '9px 11px', fontSize: 11, fontWeight: 800, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
              {bankTransferInstruction}
            </div>
          ) : null}
        </section>
      )}
      </div>
      {!hidePoweredByFooter ? (
        <footer style={{ position: 'absolute', left: '12mm', right: '12mm', bottom: '7mm', textAlign: 'center' }}>
          <a
            className="invoice-powered-link"
            href="https://cdsfacturen.nl/"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#6b7280', fontSize: 9.5, textDecoration: 'none' }}
          >
            Powered by CDS Facturen
          </a>
        </footer>
      ) : null}
    </article>
  )
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginTop: 2 }}>{value}</div>
    </div>
  )
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontWeight: strong ? 800 : 600, fontFamily: strong ? fonts.heading : 'Arial, Helvetica, sans-serif', fontSize: strong ? 12.5 : 10.8, color: '#111827' }}>
      <span style={{ color: strong ? '#111827' : '#4b5563' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const panelName: CSSProperties = {
  fontWeight: 800,
  color: '#111827',
  marginBottom: 6,
  overflowWrap: 'anywhere',
}

const panelRow: CSSProperties = {
  color: '#4b5563',
  fontSize: 10.5,
  lineHeight: 1.5,
  overflowWrap: 'anywhere',
}

const cellLeft: CSSProperties = {
  padding: '8px 8px',
  borderBottom: '1px solid #e5e7eb',
  verticalAlign: 'top',
  textAlign: 'left',
}

const cellRight: CSSProperties = {
  padding: '8px 8px',
  borderBottom: '1px solid #e5e7eb',
  verticalAlign: 'top',
  textAlign: 'right',
  whiteSpace: 'nowrap',
}

export default InvoicePDF
