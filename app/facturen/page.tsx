'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

type Factuur = {
  id: number
  nummer: string
  datum: string
  klant: string
  klantType: string
  omschrijving: string
  bedrijfsprofiel: string
  status: 'concept' | 'open' | 'betaald' | 'verlopen' | 'incasso'
  bedragExcl: number
  btwPct: number
}

const TABS = ['alle', 'concept', 'open', 'betaald', 'verlopen', 'incasso'] as const
type Tab = (typeof TABS)[number]

function fmt(n: number) {
  return '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatusPill({ status }: { status: Factuur['status'] }) {
  const cfg: Record<Factuur['status'], [string, string]> = {
    concept: ['s-gray', 'Concept'],
    open: ['s-a', 'Openstaand'],
    betaald: ['s-g', 'Betaald'],
    verlopen: ['s-r', 'Verlopen'],
    incasso: ['s-b', 'Incasso'],
  }
  const [cls, lbl] = cfg[status]
  return <span className={`spill ${cls}`}><span className="d" />{lbl}</span>
}

export default function FacturenPage() {
  const [facturen] = useState<Factuur[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('alle')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')

  const visible = facturen.filter(f => {
    if (activeTab !== 'alle' && f.status !== activeTab) return false
    if (search) {
      const q = search.toLowerCase()
      return f.klant.toLowerCase().includes(q) || f.nummer.toLowerCase().includes(q) || f.omschrijving.toLowerCase().includes(q)
    }
    return true
  })

  const counts: Record<Tab, number> = {
    alle: facturen.length,
    concept: facturen.filter(f => f.status === 'concept').length,
    open: facturen.filter(f => f.status === 'open').length,
    betaald: facturen.filter(f => f.status === 'betaald').length,
    verlopen: facturen.filter(f => f.status === 'verlopen').length,
    incasso: facturen.filter(f => f.status === 'incasso').length,
  }

  const tabLabels: Record<Tab, string> = {
    alle: 'Alle', concept: 'Concept', open: 'Openstaand',
    betaald: 'Betaald', verlopen: 'Verlopen', incasso: 'Incasso',
  }

  function toggleSelect(id: number, checked: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(visible.map(f => f.id)) : new Set())
  }

  return (
    <AppLayout>
      <div className="fact-main">
        <div className="page-head">
          <div className="page-title">Facturen</div>
          <Link href="/facturen/nieuw" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuwe factuur
          </Link>
        </div>

        <div className="toolbar">
          <div className="toolbar-left">
            <div className="tb-btn">
              <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Alle
            </div>
            <div className="tb-sep" />
            <div className="tb-btn">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exporteren
            </div>
          </div>
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              type="text"
              placeholder="Zoek op klant, nummer of omschrijving..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="status-tabs">
          {TABS.map(tab => (
            <div
              key={tab}
              className={`stab${activeTab === tab ? ' active' : ''}`}
              onClick={() => { setActiveTab(tab); setSelectedIds(new Set()) }}
            >
              {tabLabels[tab]} <span className="stab-count">{counts[tab]}</span>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          {facturen.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgba(240,244,255,0.45)" strokeWidth="1.4">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="es-title">Nog geen facturen</div>
              <div className="es-sub">Maak uw eerste factuur aan om te beginnen. Facturen worden hier overzichtelijk weergegeven met status, bedrag en betalingshistorie.</div>
              <Link href="/facturen/nieuw" className="btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Eerste factuur aanmaken
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgba(240,244,255,0.45)" strokeWidth="1.4">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div className="es-title">Geen resultaten</div>
              <div className="es-sub">Er zijn geen facturen gevonden die overeenkomen met uw zoekopdracht of filter.</div>
            </div>
          ) : (
            <table className="fact-table">
              <thead>
                <tr>
                  <th><div className="cb-wrap"><input type="checkbox" onChange={e => toggleAll(e.target.checked)} /></div></th>
                  <th>Datum</th><th>Klant</th><th>Omschrijving</th><th>Status</th>
                  <th className="r">Bedrag (excl.)</th><th className="r">Bedrag (incl.)</th><th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(f => {
                  const incl = f.bedragExcl * (1 + f.btwPct / 100)
                  const sel = selectedIds.has(f.id)
                  return (
                    <tr key={f.id} className={sel ? 'selected' : ''}>
                      <td><div className="cb-wrap"><input type="checkbox" checked={sel} onChange={e => toggleSelect(f.id, e.target.checked)} /></div></td>
                      <td>
                        <div className="f-date">{fmtDate(f.datum)}</div>
                        <span className="f-num">{f.nummer}</span>
                      </td>
                      <td>
                        <div className="f-client">{f.klant}</div>
                        <div className="f-client-type">{f.klantType}</div>
                      </td>
                      <td>
                        <div className="f-desc">{f.omschrijving}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{f.bedrijfsprofiel}</div>
                      </td>
                      <td><StatusPill status={f.status} /></td>
                      <td className="r"><div className="f-amount">{fmt(f.bedragExcl)}</div></td>
                      <td className="r">
                        <div className="f-amount">{fmt(incl)}</div>
                        <div className="f-amount-btw">incl. {f.btwPct}% btw</div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <div className="ra-btn">Openen</div>
                          <div className="ra-btn">PDF</div>
                          <div className="ra-btn danger">✕</div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={`bulk-bar${selectedIds.size > 0 ? ' show' : ''}`}>
          <div className="bulk-bar-left"><strong>{selectedIds.size}</strong> geselecteerd</div>
          <div className="bulk-actions">
            <div className="bulk-btn">
              <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Herinnering sturen
            </div>
            <div className="bulk-btn">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exporteren
            </div>
            <div className="bulk-btn danger" onClick={() => setSelectedIds(new Set())}>
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              Verwijderen
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
