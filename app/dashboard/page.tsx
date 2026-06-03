'use client'

import Link from 'next/link'
import { Button, EmptyState, KpiCard, SectionCard, StatusPill } from '@/app/components/ui'
import { colors, fonts, grid, mainScroll, pageHeader, tdStyle, thStyle, titleStyle } from '@/app/lib/theme'
import { fmtCurrency, fmtDate, invoiceTotals, resolveInvoiceStatus, useInvoices } from '@/app/lib/data'

export default function DashboardPage() {
  const [invoices] = useInvoices()
  const enriched = invoices.map((invoice) => ({ invoice, status: resolveInvoiceStatus(invoice), totals: invoiceTotals(invoice) }))
  const unpaid = enriched.filter((item) => item.status === 'verzonden' || item.status === 'openstaand' || item.status === 'verlopen' || item.status === 'incasso')
  const paidRevenue = enriched.filter((item) => item.status === 'betaald').reduce((sum, item) => sum + item.totals.total, 0)
  const recent = [...enriched].sort((a, b) => (b.invoice.createdAt || b.invoice.date).localeCompare(a.invoice.createdAt || a.invoice.date)).slice(0, 5)

  return (
    <main style={mainScroll}>
      <div style={pageHeader}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Dashboard</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Uw facturatie in een compact overzicht.</div>
        </div>
        <Button href="/facturen/nieuw" icon="plus">
          Nieuwe factuur
        </Button>
      </div>

      <div style={{ ...grid(190), marginBottom: 22 }}>
        <KpiCard label="Open facturen" value={String(unpaid.length)} sub="Nog niet voldaan" color={colors.amber} />
        <KpiCard label="Openstaand bedrag" value={fmtCurrency(unpaid.reduce((sum, item) => sum + item.totals.total, 0))} sub="Uitstaande posten" color={colors.red} />
        <KpiCard label="Betaalde omzet" value={fmtCurrency(paidRevenue)} sub="Uit localStorage geladen" color={colors.green} />
        <KpiCard label="Facturen totaal" value={String(invoices.length)} sub="Alle opgeslagen facturen" color={colors.blue} />
      </div>

      <SectionCard
        title="Recente facturen"
        action={
          <Link href="/facturen" style={{ color: '#6f8cff', fontSize: 12, textDecoration: 'none' }}>
            Alle facturen
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            icon="invoice"
            title="Nog geen facturen"
            body="Maak uw eerste factuur aan om omzet, openstaande posten en betaalstatussen te volgen."
            action={<Button href="/facturen/nieuw" icon="plus">Eerste factuur aanmaken</Button>}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Factuur</th>
                  <th style={thStyle}>Klant</th>
                  <th style={thStyle}>Datum</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Bedrag</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(({ invoice, status, totals }) => (
                  <tr key={invoice.id}>
                    <td style={tdStyle}>
                      <div style={{ fontFamily: fonts.heading, fontWeight: 700 }}>{invoice.number}</div>
                      <div style={{ color: colors.muted, fontSize: 11 }}>{invoice.reference || 'Geen referentie'}</div>
                    </td>
                    <td style={tdStyle}>{invoice.clientName || 'Onbekende klant'}</td>
                    <td style={tdStyle}>{fmtDate(invoice.date)}</td>
                    <td style={tdStyle}><StatusPill status={status} /></td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fonts.heading, fontWeight: 700 }}>{fmtCurrency(totals.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </main>
  )
}
