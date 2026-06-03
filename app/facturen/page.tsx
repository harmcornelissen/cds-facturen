'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import { Button, EmptyState, Modal, StatusPill, Toast } from '@/app/components/ui'
import { Icon } from '@/app/components/Icon'
import { colors, fonts, mainScroll, pageHeader, tdStyle, thStyle, titleStyle } from '@/app/lib/theme'
import {
  canUseIncasso,
  createId,
  fmtCurrency,
  fmtDate,
  invoiceTotals,
  nextInvoiceNumber,
  resolveInvoiceStatus,
  todayIso,
  type Invoice,
  type InvoiceStatus,
  useClients,
  useCompanies,
  useInvoices,
  usePlan,
} from '@/app/lib/data'
import { downloadInvoicePdf } from '@/app/lib/invoice-pdf'

const tabs: Array<{ value: 'alle' | InvoiceStatus; label: string }> = [
  { value: 'alle', label: 'Alle' },
  { value: 'concept', label: 'Concept' },
  { value: 'verzonden', label: 'Verzonden' },
  { value: 'betaald', label: 'Betaald' },
  { value: 'verlopen', label: 'Verlopen' },
  { value: 'incasso', label: 'Incasso' },
]

export default function FacturenPage() {
  const [invoices, setInvoices] = useInvoices()
  const [clients] = useClients()
  const [companies, setCompanies] = useCompanies()
  const [plan] = usePlan()
  const [activeTab, setActiveTab] = useState<'alle' | InvoiceStatus>('alle')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [toast, setToast] = useState('')

  const enriched = useMemo(
    () => invoices.map((invoice) => ({ invoice, status: resolveInvoiceStatus(invoice), totals: invoiceTotals(invoice) })),
    [invoices],
  )

  const counts = tabs.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.value] = tab.value === 'alle' ? enriched.length : enriched.filter((item) => item.status === tab.value).length
    return acc
  }, {})

  const visible = enriched.filter(({ invoice, status }) => {
    if (activeTab !== 'alle' && status !== activeTab) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [invoice.number, invoice.clientName, invoice.reference, invoice.companyName].some((value) => value.toLowerCase().includes(q))
  })

  const selectedOverdue = visible.filter(({ invoice, status }) => selectedIds.has(invoice.id) && status === 'verlopen')
  const allowIncasso = canUseIncasso(plan)

  function toggle(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(visible.map(({ invoice }) => invoice.id)) : new Set())
  }

  function updateSelected(status: InvoiceStatus) {
    if (status === 'incasso' && !allowIncasso) {
      setUpgradeOpen(true)
      return
    }
    setInvoices((current) => current.map((invoice) => (selectedIds.has(invoice.id) ? { ...invoice, status } : invoice)))
    setSelectedIds(new Set())
  }

  function deleteSelected() {
    setInvoices((current) => current.filter((invoice) => !selectedIds.has(invoice.id)))
    setSelectedIds(new Set())
  }

  function markPaid(id: string) {
    setInvoices((current) => current.map((item) => (item.id === id ? { ...item, status: 'betaald' } : item)))
  }

  function createCreditNote(source: Invoice) {
    const sourceCompany = companies.find((company) => company.id === source.companyId)
    const number = nextInvoiceNumber(sourceCompany)
    const date = todayIso()
    const credit: Invoice = {
      ...source,
      id: createId('factuur'),
      number,
      date,
      dueDate: date,
      reference: `Creditnota ${source.number}`,
      status: 'concept',
      lines: source.lines.map((line) => ({
        ...line,
        id: createId('regel'),
        description: `Credit ${line.description}`,
        price: -Math.abs(Number(line.price || 0)),
      })),
      notes: `Creditnota voor factuur ${source.number}.`,
      createdAt: new Date().toISOString(),
    }

    setInvoices((current) => [credit, ...current])
    if (sourceCompany) {
      setCompanies((current) => current.map((company) => (company.id === sourceCompany.id ? { ...company, nextNumber: (company.nextNumber || 1) + 1 } : company)))
    }
    setToast(`Creditnota ${number} aangemaakt als concept.`)
  }

  function sendReminder() {
    if (!reminderInvoice) return
    setToast(`Herinnering voor ${reminderInvoice.number} staat klaar.`)
    setReminderInvoice(null)
  }

  return (
    <main style={{ ...mainScroll, padding: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...pageHeader, padding: 'clamp(16px, 3vw, 32px) clamp(16px, 3vw, 32px) 0', marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Facturen</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Zoeken, filteren en acties voor concepten, verzonden facturen en betalingen.</div>
        </div>
        <Button href="/facturen/nieuw" icon="plus">
          Nieuwe factuur
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', padding: '0 clamp(16px, 3vw, 32px) 15px', borderBottom: `0.5px solid ${colors.border2}`, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon="download" onClick={() => undefined}>Exporteren</Button>
          <Button variant="secondary" icon="mail" onClick={() => setReminderInvoice(selectedOverdue[0]?.invoice || null)} disabled={selectedOverdue.length === 0}>Herinneren</Button>
        </div>
        <label style={{ position: 'relative', width: 330, maxWidth: '100%' }}>
          <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: 11, color: colors.muted }} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek op klant, nummer of referentie..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: colors.surface,
              border: `0.5px solid ${colors.border2}`,
              color: colors.white,
              borderRadius: 8,
              outline: 'none',
              padding: '10px 12px 10px 34px',
              fontFamily: fonts.body,
              fontSize: 13,
            }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 clamp(16px, 3vw, 32px)', overflowX: 'auto', borderBottom: `0.5px solid ${colors.border2}` }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setActiveTab(tab.value)
                setSelectedIds(new Set())
              }}
              style={{
                background: 'transparent',
                border: 0,
                borderBottom: `2px solid ${active ? colors.blue : 'transparent'}`,
                color: active ? colors.white : colors.muted,
                cursor: 'pointer',
                padding: '12px 16px',
                fontFamily: fonts.body,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                marginBottom: -1,
              }}
            >
              {tab.label}
              <span style={{ fontSize: 10, borderRadius: 999, background: active ? colors.blueSoft : colors.surface2, color: active ? '#6f8cff' : colors.muted, padding: '2px 7px', fontWeight: 700 }}>
                {counts[tab.value] || 0}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {invoices.length === 0 ? (
          <EmptyState
            icon="invoice"
            title="Nog geen facturen"
            body="Maak uw eerste factuur aan. Daarna verschijnen status, bedragen, vervaldatum en acties hier."
            action={<Button href="/facturen/nieuw" icon="plus">Eerste factuur aanmaken</Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState icon="search" title="Geen resultaten" body="Er zijn geen facturen gevonden die overeenkomen met uw filter of zoekopdracht." />
        ) : (
          <table style={{ width: '100%', minWidth: 1060, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, paddingLeft: 32, width: 44 }}>
                  <input type="checkbox" checked={visible.length > 0 && visible.every(({ invoice }) => selectedIds.has(invoice.id))} onChange={(event) => toggleAll(event.target.checked)} style={{ accentColor: colors.blue }} />
                </th>
                <th style={thStyle}>Factuur</th>
                <th style={thStyle}>Klant</th>
                <th style={thStyle}>Datum</th>
                <th style={thStyle}>Vervaldatum</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Excl.</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Incl.</th>
                <th style={{ ...thStyle, textAlign: 'right', paddingRight: 32 }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ invoice, status, totals }) => {
                const selected = selectedIds.has(invoice.id)
                const isConcept = invoice.status === 'concept'
                return (
                  <tr key={invoice.id} style={{ background: selected ? colors.blueSoft : 'transparent' }}>
                    <td style={{ ...tdStyle, paddingLeft: 32 }}>
                      <input type="checkbox" checked={selected} onChange={(event) => toggle(invoice.id, event.target.checked)} style={{ accentColor: colors.blue }} />
                    </td>
                    <td style={tdStyle}>
                      {isConcept ? (
                        <Link href={`/facturen/nieuw?edit=${invoice.id}`} style={{ fontFamily: fonts.heading, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>{invoice.number}</Link>
                      ) : (
                        <div style={{ fontFamily: fonts.heading, fontWeight: 800, color: '#fff' }}>{invoice.number}</div>
                      )}
                      <div style={{ color: colors.muted, fontSize: 11 }}>{invoice.reference || invoice.companyName || 'Geen referentie'}</div>
                    </td>
                    <td style={tdStyle}>
                      <div>{invoice.clientName}</div>
                      <div style={{ color: colors.muted, fontSize: 11 }}>{invoice.clientEmail || 'Geen e-mail'}</div>
                    </td>
                    <td style={tdStyle}>{fmtDate(invoice.date)}</td>
                    <td style={tdStyle}>{fmtDate(invoice.dueDate)}</td>
                    <td style={tdStyle}><StatusPill status={status} /></td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fonts.heading }}>{fmtCurrency(totals.subtotal)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: fonts.heading, fontWeight: 800 }}>{fmtCurrency(totals.total)}</td>
                    <td style={{ ...tdStyle, paddingRight: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 7, flexWrap: 'wrap' }}>
                        {isConcept ? (
                          <Button href={`/facturen/nieuw?edit=${invoice.id}`} variant="secondary" icon="edit" style={{ minHeight: 30, padding: '6px 10px', fontFamily: fonts.body }}>Bewerken</Button>
                        ) : (
                          <Button variant="secondary" icon="invoice" style={{ minHeight: 30, padding: '6px 10px', fontFamily: fonts.body }} onClick={() => createCreditNote(invoice)}>Creditnota aanmaken</Button>
                        )}
                        <IconButton title="PDF downloaden" onClick={() => downloadInvoicePdf({ company: companies.find((company) => company.id === invoice.companyId), client: clients.find((client) => client.id === invoice.clientId), invoice }).catch(() => setToast('PDF downloaden mislukt.'))} icon="download" />
                        {status === 'verlopen' ? (
                          <Button variant="secondary" icon="mail" style={{ minHeight: 30, padding: '6px 10px', fontFamily: fonts.body }} onClick={() => setReminderInvoice(invoice)}>Herinnering sturen</Button>
                        ) : null}
                        {!isConcept && status !== 'betaald' ? (
                          <Button variant="secondary" style={{ minHeight: 30, padding: '6px 10px', fontFamily: fonts.body }} onClick={() => markPaid(invoice.id)}>
                            Betaald
                          </Button>
                        ) : null}
                        <Button variant="danger" style={{ minHeight: 30, padding: '6px 10px', fontFamily: fonts.body }} onClick={() => setInvoices((current) => current.filter((item) => item.id !== invoice.id))}>
                          <Icon name="trash" size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedIds.size > 0 ? (
        <div style={{ flexShrink: 0, background: 'rgba(13,18,36,0.97)', borderTop: `0.5px solid ${colors.border2}`, padding: '12px clamp(16px, 3vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ color: colors.muted, fontSize: 13 }}>
            <strong style={{ color: '#fff' }}>{selectedIds.size}</strong> geselecteerd
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" icon="mail" onClick={() => setReminderInvoice(selectedOverdue[0]?.invoice || null)} disabled={selectedOverdue.length === 0}>Herinnering sturen</Button>
            <Button variant="secondary" icon="check" onClick={() => updateSelected('betaald')}>Markeer betaald</Button>
            <Button variant="secondary" icon="bank" onClick={() => updateSelected('incasso')}>Naar incasso</Button>
            <Button variant="danger" icon="trash" onClick={deleteSelected}>Verwijderen</Button>
          </div>
        </div>
      ) : null}

      <ReminderModal invoice={reminderInvoice} onClose={() => setReminderInvoice(null)} onSend={sendReminder} />
      <PlanRestrictionModal
        open={upgradeOpen}
        plan={plan}
        title="Incasso niet beschikbaar"
        message="Automatische incasso is beschikbaar in het Professional abonnement."
        onClose={() => setUpgradeOpen(false)}
      />
      <Toast message={toast} />
    </main>
  )
}

function IconButton({ title, icon, onClick }: { title: string; icon: 'download'; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: `0.5px solid ${colors.border2}`,
        background: colors.surface,
        color: colors.white,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={14} />
    </button>
  )
}

function ReminderModal({ invoice, onClose, onSend }: { invoice: Invoice | null; onClose: () => void; onSend: () => void }) {
  const totals = invoice ? invoiceTotals(invoice) : { total: 0 }

  return (
    <Modal
      open={Boolean(invoice)}
      title="Herinnering sturen"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuleren</Button>
          <Button icon="mail" onClick={onSend}>Herinnering sturen</Button>
        </>
      }
    >
      {invoice ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 14, display: 'grid', gap: 8, fontSize: 13 }}>
            <div><span style={{ color: colors.muted }}>Aan:</span> {invoice.clientEmail || invoice.clientName}</div>
            <div><span style={{ color: colors.muted }}>Onderwerp:</span> Betalingsherinnering factuur {invoice.number}</div>
          </div>
          <div style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 16, color: colors.white, lineHeight: 1.65, fontSize: 13 }}>
            <p style={{ margin: '0 0 12px' }}>Beste {invoice.clientName},</p>
            <p style={{ margin: '0 0 12px' }}>
              Volgens onze administratie staat factuur {invoice.number} van {fmtDate(invoice.date)} nog open. De vervaldatum was {fmtDate(invoice.dueDate)}.
            </p>
            <p style={{ margin: '0 0 12px' }}>
              Het openstaande bedrag is {fmtCurrency(totals.total)}. Wilt u dit bedrag alsnog voldoen?
            </p>
            <p style={{ margin: 0 }}>Met vriendelijke groet,<br />{invoice.companyName || 'CDS Facturen'}</p>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
