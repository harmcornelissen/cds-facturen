import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="main">
        <div className="page-header">
          <div className="page-title">Dashboard</div>
          <Link href="/facturen/nieuw" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuwe factuur
          </Link>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-label">Omzet deze maand</div>
            <div className="kpi-value">€ 0,00</div>
            <div className="kpi-sub">Eerste maand</div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-label">Openstaand</div>
            <div className="kpi-value">€ 0,00</div>
            <div className="kpi-sub">0 facturen open</div>
          </div>
          <div className="kpi-card red">
            <div className="kpi-label">Verlopen</div>
            <div className="kpi-value">€ 0,00</div>
            <div className="kpi-sub">0 facturen verlopen</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Incasso actief</div>
            <div className="kpi-value">0</div>
            <div className="kpi-sub">SEPA-machtigingen</div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head">
            <span className="section-title">Recente facturen</span>
            <Link href="/facturen" style={{ fontSize: '12px', color: 'var(--blue2)', textDecoration: 'none' }}>
              Alle facturen →
            </Link>
          </div>
          <div className="empty-state">
            <div className="es-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(240,244,255,0.45)" strokeWidth="1.4">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="es-title">Nog geen facturen</div>
            <div className="es-sub">Maak uw eerste factuur aan om te beginnen</div>
            <Link href="/facturen/nieuw" className="btn-primary">Eerste factuur aanmaken</Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
