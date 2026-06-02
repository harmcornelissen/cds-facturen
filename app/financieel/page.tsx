'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

const MAANDEN = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
const KWARTALEN = ['Q1', 'Q2', 'Q3', 'Q4']

export default function FinancieelPage() {
  const [period, setPeriod] = useState('jaar')
  const [year, setYear] = useState('2026')
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  return (
    <AppLayout>
      <div className="fin-main">
        <div className="fin-page-header">
          <div className="page-title">Financieel overzicht</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="period-select">
              {['jaar', 'kwartaal', 'maand'].map(p => (
                <div key={p} className={`ps-opt${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </div>
              ))}
            </div>
            <select className="year-select" value={year} onChange={e => setYear(e.target.value)}>
              <option>2026</option><option>2025</option><option>2024</option>
            </select>
            <div className="btn-export" onClick={() => showToast('Exportbestand wordt aangemaakt...')}>
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exporteren
            </div>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="kpi-grid" style={{ marginBottom: 22 }}>
          <div className="kpi-card b">
            <div className="kpi-label">Totale omzet</div>
            <div className="kpi-value">€ 0</div>
            <div className="kpi-sub">Nog geen facturen</div>
            <div className="kpi-trend neutral">Voeg facturen toe om te beginnen</div>
          </div>
          <div className="kpi-card g">
            <div className="kpi-label">Ontvangen</div>
            <div className="kpi-value">€ 0</div>
            <div className="kpi-sub">0 facturen betaald</div>
            <div className="kpi-trend neutral">Geen betalingen ontvangen</div>
          </div>
          <div className="kpi-card a">
            <div className="kpi-label">Openstaand</div>
            <div className="kpi-value">€ 0</div>
            <div className="kpi-sub">0 facturen open</div>
            <div className="kpi-trend neutral">Geen openstaande facturen</div>
          </div>
          <div className="kpi-card r">
            <div className="kpi-label">BTW af te dragen</div>
            <div className="kpi-value">€ 0</div>
            <div className="kpi-sub">Huidig kwartaal</div>
            <div className="kpi-trend neutral">Nog geen BTW berekend</div>
          </div>
        </div>

        {/* CHART GRID */}
        <div className="chart-grid">
          <div className="chart-card">
            <div className="card-head">
              <div>
                <div className="card-title">Omzet per maand</div>
                <div className="card-subtitle">{year} — geen data beschikbaar</div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                  <div style={{ width: 10, height: 3, background: 'var(--blue)', borderRadius: 2 }} /> Omzet
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                  <div style={{ width: 10, height: 3, background: 'var(--green)', borderRadius: 2 }} /> Ontvangen
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 8px' }}>
                {MAANDEN.map(m => (
                  <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', background: 'rgba(36,86,255,0.15)', borderRadius: 4, height: 4, border: '1px solid rgba(36,86,255,0.3)' }} />
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{m}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="card-head">
              <div>
                <div className="card-title">Betalingsstatus</div>
                <div className="card-subtitle">Verdeling huidig jaar</div>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 160, height: 160, borderRadius: '50%', border: '18px solid var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: '#fff' }}>0</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>facturen</div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[['Betaald', '#10b981'], ['Openstaand', '#f59e0b'], ['Verlopen', '#ef4444'], ['Concept', 'rgba(255,255,255,0.4)'], ['Incasso', '#2456ff']].map(([lbl, color]) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--muted)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />{lbl}
                    </div>
                    <span style={{ color: 'var(--muted2)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>0</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BTW OVERZICHT */}
        <div className="chart-card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title">BTW-overzicht per kwartaal</div>
            <div className="card-subtitle">Automatisch berekend op basis van verstuurde facturen</div>
          </div>
          <div className="btw-grid">
            {KWARTALEN.map(q => (
              <div key={q} className="btw-col">
                <div className="btw-qtr">{q} {year}</div>
                <div className="btw-row"><span className="lbl">Omzet excl.</span><span className="val">€ 0,00</span></div>
                <div className="btw-row"><span className="lbl">BTW 21%</span><span className="val">€ 0,00</span></div>
                <div className="btw-row"><span className="lbl">BTW 9%</span><span className="val">€ 0,00</span></div>
                <div className="btw-row"><span className="lbl">Voorbelasting</span><span className="val" style={{ color: 'var(--green)' }}>- € 0,00</span></div>
                <div className="btw-row total"><span className="lbl">Af te dragen</span><span className="val">€ 0,00</span></div>
                <div className="btw-row aangifte"><span className="lbl" /><span className="val">Nog niet gedaan</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="bottom-grid">
          <div className="chart-card">
            <div className="card-head">
              <div className="card-title">Openstaande posten</div>
              <div className="card-subtitle">Geen openstaande facturen</div>
            </div>
            <div className="card-body">
              <div className="empty-mini">Alle facturen zijn betaald of er zijn nog geen facturen aangemaakt.</div>
            </div>
          </div>
          <div className="chart-card">
            <div className="card-head">
              <div className="card-title">Omzet per klant</div>
              <div className="card-subtitle">Gerangschikt op totale omzet</div>
            </div>
            <div className="card-body">
              <div className="empty-mini">Nog geen facturen om klantomzet te berekenen.</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`toast${toast ? ' show' : ''}`}>
        <div className="toast-dot" />
        <span>{toast}</span>
      </div>
    </AppLayout>
  )
}
