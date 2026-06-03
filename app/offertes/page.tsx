'use client'

import { useEffect, useState } from 'react'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import { Button, EmptyState, SectionCard, StatusPill, Toast } from '@/app/components/ui'
import { colors, fonts, mainScroll, pageHeader, tdStyle, thStyle, titleStyle } from '@/app/lib/theme'
import { canCreateOffer, fmtCurrency, fmtDate, invoiceTotals, resolveInvoiceStatus, useClients, useCompanies, useOffers, usePlan } from '@/app/lib/data'
import { downloadInvoicePdf } from '@/app/lib/invoice-pdf'

export default function OffertesPage() {
  const [offers] = useOffers()
  const [clients] = useClients()
  const [companies] = useCompanies()
  const [plan] = usePlan()
  const [search, setSearch] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [toast, setToast] = useState('')
  const offerAllowed = canCreateOffer(plan)
  const visible = offers.filter((offer) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [offer.number, offer.clientName, offer.reference].some((value) => value.toLowerCase().includes(q))
  })

  useEffect(() => {
    if (!offerAllowed) setUpgradeOpen(true)
  }, [offerAllowed])

  if (!offerAllowed) {
    return (
      <main style={mainScroll}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>Offertes</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Offertes zijn beschikbaar vanaf het Basis abonnement.</div>
          </div>
        </div>
        <EmptyState
          icon="quote"
          title="Offertes uitgeschakeld"
          body="Upgrade naar Basis of Professional om offertes aan te maken en te beheren."
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

  return (
    <main style={mainScroll}>
      <div style={pageHeader}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Offertes</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Offertes zoeken, opvolgen en aanmaken.</div>
        </div>
        <Button href="/offertes/nieuw" icon="plus">Nieuwe offerte</Button>
      </div>

      <SectionCard
        title="Offerte-overzicht"
        action={
          <label style={{ display: 'block', width: 320, maxWidth: '100%' }}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek op klant, nummer of referentie..." style={{ width: '100%', boxSizing: 'border-box', background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, color: colors.white, padding: '8px 10px', outline: 'none', fontFamily: fonts.body, fontSize: 13 }} />
          </label>
        }
      >
        {visible.length === 0 ? (
          <EmptyState
            icon="quote"
            title="Geen offertes"
            body="Maak een offerte aan om deze hier te beheren."
            action={<Button href="/offertes/nieuw" icon="plus">Offerte aanmaken</Button>}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={thStyle}>Nummer</th><th style={thStyle}>Klant</th><th style={thStyle}>Datum</th><th style={thStyle}>Geldig tot</th><th style={thStyle}>Status</th><th style={{ ...thStyle, textAlign: 'right' }}>Bedrag</th><th style={{ ...thStyle, textAlign: 'right' }}>Acties</th></tr>
              </thead>
              <tbody>
                {visible.map((offer) => {
                  const totals = invoiceTotals(offer)
                  const status = resolveInvoiceStatus(offer)
                  return (
                    <tr key={offer.id}>
                      <td style={tdStyle}>{offer.number}</td>
                      <td style={tdStyle}>{offer.clientName}</td>
                      <td style={tdStyle}>{fmtDate(offer.date)}</td>
                      <td style={tdStyle}>{fmtDate(offer.dueDate)}</td>
                      <td style={tdStyle}><StatusPill status={status} /></td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fonts.heading }}>{fmtCurrency(totals.total)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          icon="download"
                          style={{ minHeight: 30, padding: '6px 10px', fontFamily: fonts.body }}
                          onClick={() => downloadInvoicePdf({
                            company: companies.find((company) => company.id === offer.companyId),
                            client: clients.find((client) => client.id === offer.clientId),
                            invoice: offer,
                            type: 'offerte',
                          }).catch(() => setToast('PDF downloaden mislukt.'))}
                        >
                          PDF
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
      <Toast message={toast} />
    </main>
  )
}
