'use client'

import { useEffect, useState } from 'react'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import { Button, EmptyState, KpiCard, SectionCard, Toast } from '@/app/components/ui'
import { colors, grid, mainScroll, pageHeader, titleStyle } from '@/app/lib/theme'
import { canUseIncasso, fmtCurrency, fmtDate, invoiceTotals, resolveInvoiceStatus, type RecurringSendDay, useClients, useCompanies, useInvoices, usePlan, useRecurringInvoices } from '@/app/lib/data'
import { downloadInvoicePdf } from '@/app/lib/invoice-pdf'

const sendDayLabels: Record<RecurringSendDay, string> = {
  first: '1e van de maand',
  fifteenth: '15e van de maand',
  twentyFirst: '21e van de maand',
  custom: 'aangepaste datum',
}

export default function TerugkerendPage() {
  const [clients] = useClients()
  const [companies] = useCompanies()
  const [invoices] = useInvoices()
  const [recurringInvoices] = useRecurringInvoices()
  const [plan] = usePlan()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [toast, setToast] = useState('')
  const incassoAllowed = canUseIncasso(plan)
  const incassoClients = clients.filter((client) => client.incasso)
  const activeRecurring = recurringInvoices.filter((invoice) => invoice.active)
  const activeAmount = activeRecurring.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0)
  const openAmount = invoices
    .filter((invoice) => resolveInvoiceStatus(invoice) === 'verzonden')
    .reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0)

  useEffect(() => {
    if (!incassoAllowed) setUpgradeOpen(true)
  }, [incassoAllowed])

  if (!incassoAllowed) {
    return (
      <main style={mainScroll}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>Terugkerend</h1>
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

  return (
    <main style={mainScroll}>
      <div style={pageHeader}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Terugkerend</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Voor periodieke facturatie en abonnementen.</div>
        </div>
        <Button href="/terugkerend/nieuw">+ Terugkerende factuur</Button>
      </div>

      <div style={{ ...grid(190), marginBottom: 20 }}>
        <KpiCard label="Actieve reeksen" value={String(activeRecurring.length)} sub="Opgeslagen templates" color={colors.blue} />
        <KpiCard label="Maandwaarde" value={fmtCurrency(activeAmount)} sub="Terugkerende facturen" color={colors.green} />
        <KpiCard label="Openstaand" value={fmtCurrency(openAmount)} sub="Niet periodiek verwerkt" color={colors.amber} />
        <KpiCard label="Machtigingen" value={String(incassoClients.length)} sub="Klanten geschikt" color={colors.red} />
      </div>

      <SectionCard title="Reeksen">
        {recurringInvoices.length === 0 ? (
          <EmptyState
            icon="repeat"
            title="Geen terugkerende facturen"
            body="Maak een terugkerende factuur aan voor periodieke verzending."
            action={<Button href="/terugkerend/nieuw">+ Terugkerende factuur</Button>}
          />
        ) : (
          <div style={{ padding: 18, display: 'grid', gap: 12 }}>
            {recurringInvoices.map((invoice) => (
              <div key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', flexWrap: 'wrap', border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 14 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 700, overflowWrap: 'anywhere' }}>{invoice.clientName}</div>
                  <div style={{ color: colors.muted, fontSize: 12, overflowWrap: 'anywhere' }}>
                    {invoice.number} - {sendDayLabels[invoice.schedule.sendDay]} - volgende verzending {fmtDate(invoice.schedule.nextSendDate)}
                    {invoice.schedule.ongoing ? ' - doorlopend' : ` - tot ${fmtDate(invoice.schedule.endDate)}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
                  <div style={{ color: '#fff', fontWeight: 800 }}>{fmtCurrency(invoiceTotals(invoice).total)}</div>
                  <Button
                    variant="secondary"
                    icon="download"
                    style={{ minHeight: 30, padding: '6px 10px' }}
                    onClick={() => downloadInvoicePdf({
                      company: companies.find((company) => company.id === invoice.companyId),
                      client: clients.find((client) => client.id === invoice.clientId),
                      invoice,
                      type: 'terugkerend',
                      recurringInterval: sendDayLabels[invoice.schedule.sendDay],
                    }).catch(() => setToast('PDF downloaden mislukt.'))}
                  >
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <Toast message={toast} />
    </main>
  )
}
