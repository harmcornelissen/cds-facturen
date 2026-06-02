'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

export default function IncassoPage() {
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  return (
    <AppLayout>
      <div className="main">
        <div className="page-header">
          <div>
            <div className="page-title">Automatische incasso</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4, maxWidth: 480, lineHeight: 1.5 }}>
              Verwerk betalingen automatisch via SEPA incasso. Klanten geven eenmalig een machtiging en facturen worden automatisch geïnd.
            </div>
          </div>
          <button className="btn-primary" onClick={() => showToast('Mollie koppelen...')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Machtiging toevoegen
          </button>
        </div>

        {/* MOLLIE STATUS */}
        <div className="mollie-card">
          <div className="mollie-left">
            <div className="mollie-logo">M</div>
            <div>
              <div className="mollie-title">Mollie betaalintegratie</div>
              <div className="mollie-desc">Koppel uw Mollie account om automatische incasso te activeren. Veilig, betrouwbaar en volledig SEPA-compliant.</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="status-badge sb-inactive"><span className="sb-dot" style={{ background: 'var(--muted)' }} />Niet gekoppeld</span>
            <button className="btn-primary" onClick={() => showToast('Mollie koppelen...')}>Koppelen</button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          <div className="kpi-card b">
            <div className="kpi-label">Actieve machtigingen</div>
            <div className="kpi-value">0</div>
            <div className="kpi-sub">SEPA-mandaten</div>
          </div>
          <div className="kpi-card g">
            <div className="kpi-label">Geïnd deze maand</div>
            <div className="kpi-value">€ 0,00</div>
            <div className="kpi-sub">0 transacties</div>
          </div>
          <div className="kpi-card a">
            <div className="kpi-label">In afwachting</div>
            <div className="kpi-value">€ 0,00</div>
            <div className="kpi-sub">0 opdrachten</div>
          </div>
          <div className="kpi-card r">
            <div className="kpi-label">Mislukt</div>
            <div className="kpi-value">0</div>
            <div className="kpi-sub">Laatste 30 dagen</div>
          </div>
        </div>

        {/* SPLIT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
          {/* MACHTIGINGEN */}
          <div className="section-card">
            <div className="sc-head">
              <div>
                <div className="sc-title">SEPA-machtigingen</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>0 actieve mandaten</div>
              </div>
              <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => showToast('Machtiging toevoegen...')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Toevoegen
              </button>
            </div>
            <div className="empty-state">
              <div className="es-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 2v20M2 12h20"/></svg>
              </div>
              <div className="es-title">Geen machtigingen</div>
              <div className="es-sub">Voeg SEPA-machtigingen toe om automatisch betalingen te incasseren van uw klanten.</div>
              <button className="btn-primary" onClick={() => showToast('Koppel eerst Mollie om machtigingen toe te voegen')}>
                Eerste machtiging toevoegen
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--blue-g)', border: '0.5px solid rgba(36,86,255,.3)', borderRadius: 13, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--blue2)', marginBottom: 8, fontWeight: 700 }}>Volgende incasso</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>—</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Geen machtigingen actief</div>
              <div style={{ height: '0.5px', background: 'rgba(36,86,255,.2)', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                <span style={{ color: 'var(--muted)' }}>Klanten</span><span style={{ fontWeight: 500 }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                <span style={{ color: 'var(--muted)' }}>Totaal bedrag</span><span style={{ fontWeight: 500 }}>€ 0,00</span>
              </div>
            </div>

            <div className="section-card">
              <div className="sc-head">
                <div className="sc-title">Recente transacties</div>
              </div>
              <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                Nog geen transacties
              </div>
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
