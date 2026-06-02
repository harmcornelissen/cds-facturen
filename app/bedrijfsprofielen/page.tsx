'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

type Profiel = {
  id: number
  naam: string
  init: string
  color: string
  kvk: string
  btw: string
  email: string
  telefoon: string
  adres: string
  iban: string
}

const COLORS = ['#2456ff', '#10b981', '#7c3aed', '#f59e0b', '#ef4444', '#ec4899']

function initials(naam: string) {
  const w = naam.trim().split(/\s+/)
  if (w.length === 1) return naam.substring(0, 2).toUpperCase()
  return (w[0][0] + w[w.length - 1][0]).toUpperCase()
}

export default function BedrijfsprofielenPage() {
  const [profielen, setProfielen] = useState<Profiel[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#2456ff')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ naam: '', kvk: '', btw: '', email: '', telefoon: '', straat: '', postcode: '', plaats: '', iban: '', website: '' })

  const activeProfiel = profielen.find(p => p.id === activeId) ?? null

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function openModal() {
    setForm({ naam: '', kvk: '', btw: '', email: '', telefoon: '', straat: '', postcode: '', plaats: '', iban: '', website: '' })
    setSelectedColor('#2456ff')
    setModalOpen(true)
  }

  function saveProfiel() {
    if (!form.naam.trim()) { showToast('Bedrijfsnaam is verplicht'); return }
    const adres = [form.straat, form.postcode, form.plaats].filter(Boolean).join(', ')
    const newProfiel: Profiel = {
      id: Date.now(), naam: form.naam, init: initials(form.naam), color: selectedColor,
      kvk: form.kvk, btw: form.btw, email: form.email, telefoon: form.telefoon,
      adres, iban: form.iban,
    }
    setProfielen(prev => [...prev, newProfiel])
    setModalOpen(false)
    showToast(`${form.naam} toegevoegd`)
    setTimeout(() => setActiveId(newProfiel.id), 200)
  }

  return (
    <AppLayout>
      <div className="split">
        {/* LIST PANE */}
        <div className="list-pane">
          <div className="lp-header">
            <div className="lp-title-row">
              <div className="lp-title">
                Bedrijfsprofielen <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>{profielen.length}</span>
              </div>
              <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={openModal}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nieuw profiel
              </button>
            </div>
          </div>

          <div className="klant-list">
            {profielen.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Nog geen bedrijfsprofielen</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 220, margin: '0 auto 18px' }}>Maak een bedrijfsprofiel aan om facturen te kunnen versturen.</div>
                <button className="btn-primary" style={{ margin: '0 auto' }} onClick={openModal}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Eerste profiel aanmaken
                </button>
              </div>
            ) : profielen.map(p => (
              <div key={p.id} className={`klant-item${activeId === p.id ? ' active' : ''}`} onClick={() => setActiveId(p.id)}>
                <div className="ki-av" style={{ background: p.color + '22', color: p.color }}>{p.init}</div>
                <div className="ki-info">
                  <div className="ki-naam">{p.naam}</div>
                  <div className="ki-email">{p.kvk ? `KvK: ${p.kvk}` : p.email || 'Geen gegevens'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAIL PANE */}
        <div className="detail-pane">
          {!activeProfiel ? (
            <div className="empty-detail">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
              </div>
              <div className="empty-title">Selecteer een profiel</div>
              <div className="empty-sub">Klik op een bedrijfsprofiel in de lijst om de gegevens te bekijken en te bewerken.</div>
            </div>
          ) : (
            <>
              <div className="dp-header">
                <div className="dp-identity">
                  <div className="dp-av" style={{ background: activeProfiel.color + '22', color: activeProfiel.color }}>{activeProfiel.init}</div>
                  <div>
                    <div className="dp-name">{activeProfiel.naam}</div>
                    <div className="dp-type">{activeProfiel.kvk ? `KvK: ${activeProfiel.kvk}` : 'Geen KvK'}</div>
                  </div>
                </div>
                <div className="dp-actions">
                  <button className="btn-secondary">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Bewerken
                  </button>
                  <button className="btn-primary" onClick={() => showToast('Actief profiel ingesteld')}>Activeren</button>
                </div>
              </div>

              <div className="contact-grid">
                <div className="contact-card">
                  <div className="cc-label">Bedrijfsgegevens</div>
                  {activeProfiel.kvk && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg><span className="cc-val">KvK: {activeProfiel.kvk}</span></div>}
                  {activeProfiel.btw && <div className="cc-row"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><span className="cc-val">BTW: {activeProfiel.btw}</span></div>}
                  {activeProfiel.iban && <div className="cc-row"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg><span className="cc-val">IBAN: {activeProfiel.iban}</span></div>}
                </div>
                <div className="contact-card">
                  <div className="cc-label">Contactgegevens</div>
                  {activeProfiel.email && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span className="cc-val">{activeProfiel.email}</span></div>}
                  {activeProfiel.telefoon && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .19h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg><span className="cc-val">{activeProfiel.telefoon}</span></div>}
                  {activeProfiel.adres && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><span className="cc-val">{activeProfiel.adres}</span></div>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      <div className={`modal-overlay${modalOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="modal">
          <div className="modal-head">
            <div className="modal-title">Bedrijfsprofiel aanmaken</div>
            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="mfield">
              <label>Bedrijfsnaam <span className="req">*</span></label>
              <input type="text" placeholder="Naam van uw bedrijf" value={form.naam} onChange={e => setForm(f => ({ ...f, naam: e.target.value }))} />
            </div>
            <div className="modal-divider" />
            <div className="modal-section-label">Bedrijfsgegevens</div>
            <div className="mrow c2">
              <div className="mfield"><label>KvK-nummer</label><input type="text" placeholder="8 cijfers" value={form.kvk} onChange={e => setForm(f => ({ ...f, kvk: e.target.value }))} /></div>
              <div className="mfield"><label>BTW-nummer</label><input type="text" placeholder="NL000000000B00" value={form.btw} onChange={e => setForm(f => ({ ...f, btw: e.target.value }))} /></div>
            </div>
            <div className="mfield"><label>IBAN</label><input type="text" placeholder="NL00 BANK 0000 0000 00" value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} /></div>
            <div className="modal-divider" />
            <div className="modal-section-label">Contactgegevens</div>
            <div className="mrow c2">
              <div className="mfield"><label>E-mailadres</label><input type="email" placeholder="facturen@bedrijf.nl" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="mfield"><label>Telefoonnummer</label><input type="tel" placeholder="+31 6 00000000" value={form.telefoon} onChange={e => setForm(f => ({ ...f, telefoon: e.target.value }))} /></div>
            </div>
            <div className="modal-divider" />
            <div className="modal-section-label">Adres</div>
            <div className="mfield"><label>Straat en huisnummer</label><input type="text" placeholder="Straatnaam 0" value={form.straat} onChange={e => setForm(f => ({ ...f, straat: e.target.value }))} /></div>
            <div className="mrow c2">
              <div className="mfield"><label>Postcode</label><input type="text" placeholder="0000 AA" value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} /></div>
              <div className="mfield"><label>Plaats</label><input type="text" placeholder="Plaatsnaam" value={form.plaats} onChange={e => setForm(f => ({ ...f, plaats: e.target.value }))} /></div>
            </div>
            <div className="modal-divider" />
            <div className="modal-section-label">Weergave</div>
            <div className="mfield">
              <label>Kleur profiel</label>
              <div className="avatar-picker">
                {COLORS.map(c => (
                  <div key={c} className={`av-color${selectedColor === c ? ' sel' : ''}`} style={{ background: c }} onClick={() => setSelectedColor(c)} />
                ))}
                <div className="av-preview" style={{ background: selectedColor + '22', color: selectedColor }}>
                  {form.naam ? initials(form.naam) : '??'}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <div className="modal-foot-hint">Velden met <span>*</span> zijn verplicht</div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Annuleren</button>
              <button className="btn-primary" onClick={saveProfiel}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Profiel opslaan
              </button>
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
