'use client'

import { Button, EmptyState, KpiCard, SectionCard, StatusPill } from '@/app/components/ui'
import { colors, fonts, formGrid, grid, mainScroll, pageHeader, tdStyle, thStyle, titleStyle } from '@/app/lib/theme'
import { currentQuarterKey, fmtCurrency, invoiceIsUnpaid, invoiceTotals, quarterKeyForDate, resolveInvoiceStatus, useInvoices } from '@/app/lib/data'

const monthLabels = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

export default function FinancieelPage() {
  const [invoices] = useInvoices()
  const enriched = invoices.map((invoice) => ({ invoice, status: resolveInvoiceStatus(invoice), totals: invoiceTotals(invoice) }))
  const paidRevenue = enriched.filter((item) => item.status === 'betaald').reduce((sum, item) => sum + item.totals.total, 0)
  const openRevenue = enriched.filter((item) => invoiceIsUnpaid(item.status)).reduce((sum, item) => sum + item.totals.total, 0)
  const currentQuarter = currentQuarterKey()
  const currentQuarterVat = enriched.filter((item) => item.status !== 'concept' && quarterKeyForDate(item.invoice.date) === currentQuarter).reduce((sum, item) => sum + item.totals.vat, 0)
  const quarterlyVat = Object.entries(
    enriched
      .filter((item) => item.status !== 'concept')
      .reduce<Record<string, number>>((acc, item) => {
        const key = quarterKeyForDate(item.invoice.date)
        acc[key] = (acc[key] || 0) + item.totals.vat
        return acc
      }, {}),
  ).sort((a, b) => a[0].localeCompare(b[0]))
  const monthly = monthLabels.map((label, index) => ({
    label,
    value: enriched
      .filter((item) => new Date(`${item.invoice.date}T00:00:00`).getMonth() === index)
      .reduce((sum, item) => sum + item.totals.total, 0),
  }))
  const maxMonthly = Math.max(...monthly.map((item) => item.value), 1)
  const statusCounts = ['concept', 'verzonden', 'betaald', 'verlopen', 'incasso'].map((status) => ({
    status,
    count: enriched.filter((item) => item.status === status).length,
  }))
  const clients = Object.entries(
    enriched.reduce<Record<string, number>>((acc, item) => {
      const key = item.invoice.clientName || 'Onbekend'
      acc[key] = (acc[key] || 0) + item.totals.total
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])

  return (
    <main style={mainScroll}>
      <div style={pageHeader}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Financieel</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Omzet, BTW en openstaande posten berekend uit facturen.</div>
        </div>
        <Button href="/facturen/nieuw" icon="plus">Nieuwe factuur</Button>
      </div>

      <div style={{ ...grid(190), marginBottom: 22 }}>
        <KpiCard label="Totale omzet" value={fmtCurrency(paidRevenue)} sub="Betaalde facturen" color={colors.blue} />
        <KpiCard label="Openstaand" value={fmtCurrency(openRevenue)} sub="Nog te ontvangen" color={colors.amber} />
        <KpiCard label="BTW dit kwartaal" value={fmtCurrency(currentQuarterVat)} sub={`Kwartaal ${currentQuarter}`} color={colors.red} />
        <KpiCard label="Facturen totaal" value={String(invoices.length)} sub="Uit localStorage geladen" color={colors.green} />
      </div>

      <div style={{ ...formGrid(280, 2, 18), marginBottom: 18 }}>
        <SectionCard title="Omzet per maand">
          <div style={{ height: 260, display: 'flex', alignItems: 'end', gap: 10, padding: 20 }}>
            {monthly.map((item) => (
              <div key={item.label} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: '100%', height: Math.max(8, (item.value / maxMonthly) * 190), background: item.value > 0 ? colors.blue : colors.surface2, borderRadius: 6, border: `0.5px solid ${colors.border2}` }} />
                <div style={{ color: colors.muted, fontSize: 11 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Betalingsstatus">
          <div style={{ padding: 20, display: 'grid', gap: 12 }}>
            {statusCounts.map((item) => (
              <div key={item.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <StatusPill status={item.status} />
                <div style={{ color: '#fff', fontFamily: fonts.heading, fontWeight: 800 }}>{item.count}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div style={formGrid(300, 2, 18)}>
        <SectionCard title="Openstaande posten">
          {enriched.filter((item) => item.status !== 'betaald' && item.status !== 'concept').length === 0 ? (
            <EmptyState compact icon="invoice" title="Geen openstaande posten" body="Alle verstuurde facturen zijn voldaan of er zijn nog geen facturen." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
                <thead>
                  <tr><th style={thStyle}>Factuur</th><th style={thStyle}>Klant</th><th style={thStyle}>Status</th><th style={{ ...thStyle, textAlign: 'right' }}>Bedrag</th></tr>
                </thead>
                <tbody>
                  {enriched.filter((item) => item.status !== 'betaald' && item.status !== 'concept').slice(0, 8).map((item) => (
                    <tr key={item.invoice.id}>
                      <td style={tdStyle}>{item.invoice.number}</td>
                      <td style={tdStyle}>{item.invoice.clientName}</td>
                      <td style={tdStyle}><StatusPill status={item.status} /></td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fonts.heading }}>{fmtCurrency(item.totals.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Omzet per klant">
          {clients.length === 0 ? (
            <EmptyState compact icon="users" title="Geen klantomzet" body="Klantomzet verschijnt zodra facturen zijn aangemaakt." />
          ) : (
            <div style={{ padding: 18, display: 'grid', gap: 12 }}>
              {clients.slice(0, 8).map(([name, value]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: colors.white }}>{name}</span>
                    <span style={{ color: colors.white, fontFamily: fonts.heading }}>{fmtCurrency(value)}</span>
                  </div>
                  <div style={{ height: 7, background: colors.surface2, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(5, (value / Math.max(clients[0][1], 1)) * 100)}%`, height: '100%', background: colors.blue }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="BTW per kwartaal" style={{ marginTop: 18 }}>
        {quarterlyVat.length === 0 ? (
          <EmptyState compact icon="finance" title="Geen BTW-gegevens" body="BTW wordt zichtbaar zodra er facturen met BTW zijn opgeslagen." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Kwartaal</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>BTW af te dragen</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyVat.map(([quarter, value]) => (
                  <tr key={quarter}>
                    <td style={tdStyle}>{quarter}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fonts.heading }}>{fmtCurrency(value)}</td>
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
