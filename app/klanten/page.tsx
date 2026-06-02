'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

type Klant = {
  id: number
  naam: string
  type: string
  init: string
  color: string
  email: string
  telefoon: string
  website: string
  adres: string
  kvk: string
  btw: string
  omzet: number
  open: number
  facturen: number
  incasso: boolean
  notitie: string
}

function fmt(n: number) {
  return '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function initials(naam: string) {
  const w = naam.trim().split(/\s+/)
  if (w.length === 1) return naam.substring(0, 2).toUpperCase()
  return (w[0][0] + w[w.length - 1][0]).toUpperCase()
}

const COLORS = ['#2456ff', '#10b981', '#7c3aed', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

export default function KlantenPage() {
  const [klanten, setKlanten] = useState<Klant[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'gegevens' | 'facturen' | 'notities'>('gegevens')
  const [filter, setFilter] = useState('alle')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [klantType, setKlantType] = useState<'bedrijf' | 'particulier'>('bedrijf')
  const [selectedColor, setSelectedColor] = useState('#2456ff')
  const [form, setForm] = useState({ naam: '', voornaam: '', achternaam: '', email: '', tel: '', kvk: '', btw: '', iban: '', web: '', straat: '', postcode: '', plaats: '', type: '', land: 'Nederland' })
  const [noteText, setNoteText] = useState('')
  const [toast, setToast] = useState('')

  const activeKlant = klanten.find(k => k.id === activeId) ?? null

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function openModal() {
    setForm({ naam: '', voornaam: '', achternaam: '', email: '', tel: '', kvk: '', btw: '', iban: '', web: '', straat: '', postcode: '', plaats: '', type: '', land: 'Nederland' })
    setSelectedColor('#2456ff')
    setKlantType('bedrijf')
    setModalOpen(true)
  }

  function saveKlant() {
    let naam = ''
    if (klantType === 'bedrijf') {
      naam = form.naam.trim()
      if (!naam) { showToast('Bedrijfsnaam is verplicht'); return }
    } else {
      naam = (form.voornaam + ' ' + form.achternaam).trim()
      if (!form.voornaam.trim()) { showToast('Voornaam is verplicht'); return }
    }
    if (!form.email.trim()) { showToast('E-mailadres is verplicht'); return }

    const adres = [form.straat, form.postcode, form.plaats].filter(Boolean).join(', ')
    const newKlant: Klant = {
      id: Date.now(), naam, init: initials(naam), color: selectedColor,
      type: klantType === 'particulier' ? 'Particulier' : (form.type || 'Bedrijf'),
      email: form.email, telefoon: form.tel, website: form.web.replace(/https?:\/\//, ''),
      adres, kvk: klantType === 'bedrijf' ? form.kvk : '', btw: klantType === 'bedrijf' ? form.btw : '',
      omzet: 0, open: 0, facturen: 0, incasso: false, notitie: '',
    }
    setKlanten(prev => [...prev, newKlant])
    setModalOpen(false)
    showToast(`${naam} toegevoegd`)
    setTimeout(() => setActiveId(newKlant.id), 200)
  }

  const filtered = klanten.filter(k => {
    if (filter === 'open') return k.open > 0
    if (filter === 'incasso') return k.incasso
    if (filter === 'nieuw') return k.facturen <= 2
    return true
  }).filter(k => {
    if (!search) return true
    const q = search.toLowerCase()
    return k.naam.toLowerCase().includes(q) || k.email.toLowerCase().includes(q) || k.kvk.includes(q)
  })

  function saveNote() {
    if (!activeKlant) return
    setKlanten(prev => prev.map(k => k.id === activeKlant.id ? { ...k, notitie: noteText } : k))
    showToast('Notitie opgeslagen')
  }

  return (
    <AppLayout>
      <div className="split">
        {/* LIST PANE */}
        <div className="list-pane">
          <div className="lp-header">
            <div className="lp-title-row">
              <div className="lp-title">
                Klanten <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>{klanten.length}</span>
              </div>
              <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={openModal}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Klant toevoegen
              </button>
            </div>
            <div className="lp-search-wrap">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="lp-search-input" type="text" placeholder="Zoek op naam, e-mail of KvK..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="filter-row">
            {[['alle', 'Alle klanten'], ['open', 'Openstaand'], ['incasso', 'Incasso actief'], ['nieuw', 'Nieuw dit jaar']].map(([val, lbl]) => (
              <div key={val} className={`fchip${filter === val ? ' on' : ''}`} onClick={() => setFilter(val)}>{lbl}</div>
            ))}
          </div>

          <div className="klant-list">
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Nog geen klanten</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 220, margin: '0 auto 18px' }}>Voeg uw eerste klant toe om facturen aan te kunnen sturen.</div>
                <button className="btn-primary" style={{ margin: '0 auto' }} onClick={openModal}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Eerste klant toevoegen
                </button>
              </div>
            ) : filtered.map(k => (
              <div key={k.id} className={`klant-item${activeId === k.id ? ' active' : ''}`} onClick={() => { setActiveId(k.id); setNoteText(k.notitie); setActiveTab('gegevens') }}>
                <div className="ki-av" style={{ background: k.color + '22', color: k.color }}>{k.init}</div>
                <div className="ki-info">
                  <div className="ki-naam">{k.naam}</div>
                  <div className="ki-email">{k.email || 'Geen e-mail'}</div>
                </div>
                <div className="ki-right">
                  <div className="ki-bedrag">{fmt(k.omzet)}</div>
                  <div className={`ki-status ${k.open > 0 ? 'open' : 'ok'}`}>
                    {k.open > 0 ? `€${k.open.toLocaleString('nl-NL')} open` : 'Alles betaald'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAIL PANE */}
        <div className="detail-pane">
          {!activeKlant ? (
            <div className="empty-detail">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div className="empty-title">Selecteer een klant</div>
              <div className="empty-sub">Klik op een klant in de lijst om de gegevens en factuurhistorie te bekijken.</div>
            </div>
          ) : (
            <>
              <div className="dp-header">
                <div className="dp-identity">
                  <div className="dp-av" style={{ background: activeKlant.color + '22', color: activeKlant.color }}>{activeKlant.init}</div>
                  <div>
                    <div className="dp-name">{activeKlant.naam}</div>
                    <div className="dp-type">{activeKlant.type} · {activeKlant.facturen} facturen · {activeKlant.incasso ? <span style={{ color: 'var(--green)' }}>Incasso actief</span> : 'Geen incasso'}</div>
                  </div>
                </div>
                <div className="dp-actions">
                  <button className="btn-secondary" onClick={() => showToast('Factuur aanmaken')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Factuur aanmaken
                  </button>
                  <button className="btn-secondary">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Bewerken
                  </button>
                </div>
              </div>

              <div className="kpi-strip">
                <div className="kpi-c b"><div className="kpi-l">Totale omzet</div><div className="kpi-v">{fmt(activeKlant.omzet)}</div><div className="kpi-s">{activeKlant.facturen} facturen totaal</div></div>
                <div className={`kpi-c ${activeKlant.open > 0 ? 'a' : 'g'}`}><div className="kpi-l">Openstaand</div><div className="kpi-v">{fmt(activeKlant.open)}</div><div className="kpi-s">{activeKlant.open > 0 ? 'Betaling verwacht' : 'Alles voldaan'}</div></div>
                <div className="kpi-c g"><div className="kpi-l">Incasso</div><div className="kpi-v">{activeKlant.incasso ? 'Actief' : 'Inactief'}</div><div className="kpi-s">{activeKlant.incasso ? 'SEPA-machtiging actief' : 'Niet ingesteld'}</div></div>
                <div className="kpi-c b"><div className="kpi-l">Facturen</div><div className="kpi-v">{activeKlant.facturen}</div><div className="kpi-s">Alle periodes</div></div>
              </div>

              <div className="dp-tabs">
                {(['gegevens', 'facturen', 'notities'] as const).map(tab => (
                  <div key={tab} className={`dp-tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'gegevens' ? 'Contactgegevens' : tab === 'facturen' ? 'Factuurhistorie' : 'Notities'}
                  </div>
                ))}
              </div>

              {activeTab === 'gegevens' && (
                <div className="contact-grid">
                  <div className="contact-card">
                    <div className="cc-label">Contactgegevens</div>
                    {activeKlant.email && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span className="cc-val"><a href={`mailto:${activeKlant.email}`}>{activeKlant.email}</a></span></div>}
                    {activeKlant.telefoon && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .19h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg><span className="cc-val">{activeKlant.telefoon}</span></div>}
                    {activeKlant.adres && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><span className="cc-val">{activeKlant.adres}</span></div>}
                    {!activeKlant.email && !activeKlant.telefoon && !activeKlant.adres && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Geen contactgegevens ingevuld.</div>}
                  </div>
                  <div className="contact-card">
                    <div className="cc-label">Bedrijfsgegevens</div>
                    <div className="cc-row"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg><span className="cc-val">{activeKlant.type}</span></div>
                    {activeKlant.kvk && <div className="cc-row"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg><span className="cc-val">KvK: {activeKlant.kvk}</span></div>}
                    {activeKlant.btw && <div className="cc-row"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><span className="cc-val">BTW: {activeKlant.btw}</span></div>}
                  </div>
                </div>
              )}

              {activeTab === 'facturen' && (
                <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Nog geen facturen voor deze klant.</div>
                  <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => showToast('Factuur aanmaken')}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Eerste factuur aanmaken
                  </button>
                </div>
              )}

              {activeTab === 'notities' && (
                <>
                  <div className="note-area">
                    <textarea rows={5} placeholder="Voeg een notitie toe over deze klant..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                  </div>
                  <button className="btn-primary" onClick={saveNote}>Notitie opslaan</button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      <div className={`modal-overlay${modalOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="modal">
          <div className="modal-head">
            <div className="modal-title">Klant toevoegen</div>
            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="type-toggle">
              <div className={`tt-opt${klantType === 'bedrijf' ? ' active' : ''}`} onClick={() => setKlantType('bedrijf')}>
                <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                Bedrijf
              </div>
              <div className={`tt-opt${klantType === 'particulier' ? ' active' : ''}`} onClick={() => setKlantType('particulier')}>
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Particulier
              </div>
            </div>

            <div className="mrow c2">
              {klantType === 'bedrijf' ? (
                <div className="mfield">
                  <label>Bedrijfsnaam <span className="req">*</span></label>
                  <input type="text" placeholder="Naam van het bedrijf" value={form.naam} onChange={e => setForm(f => ({ ...f, naam: e.target.value }))} />
                </div>
              ) : (
                <>
                  <div className="mfield">
                    <label>Voornaam <span className="req">*</span></label>
                    <input type="text" placeholder="Voornaam" value={form.voornaam} onChange={e => setForm(f => ({ ...f, voornaam: e.target.value }))} />
                  </div>
                  <div className="mfield">
                    <label>Achternaam <span className="req">*</span></label>
                    <input type="text" placeholder="Achternaam" value={form.achternaam} onChange={e => setForm(f => ({ ...f, achternaam: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="mfield">
                <label>E-mailadres <span className="req">*</span></label>
                <input type="email" placeholder="naam@bedrijf.nl" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            {klantType === 'bedrijf' && (
              <>
                <div className="modal-divider" />
                <div className="modal-section-label">Bedrijfsgegevens</div>
                <div className="mrow c2">
                  <div className="mfield">
                    <label>Rechtsvorm</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="">Selecteer...</option>
                      <option>Eenmanszaak</option>
                      <option>Besloten Vennootschap (B.V.)</option>
                      <option>Vennootschap Onder Firma (V.O.F.)</option>
                      <option>Stichting</option>
                    </select>
                  </div>
                  <div className="mfield">
                    <label>KvK-nummer</label>
                    <input type="text" placeholder="8 cijfers" maxLength={8} value={form.kvk} onChange={e => setForm(f => ({ ...f, kvk: e.target.value }))} />
                  </div>
                </div>
                <div className="mrow c2">
                  <div className="mfield">
                    <label>BTW-nummer</label>
                    <input type="text" placeholder="NL000000000B00" value={form.btw} onChange={e => setForm(f => ({ ...f, btw: e.target.value }))} />
                  </div>
                  <div className="mfield">
                    <label>IBAN</label>
                    <input type="text" placeholder="NL00 BANK 0000 0000 00" value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} />
                  </div>
                </div>
              </>
            )}

            <div className="modal-divider" />
            <div className="modal-section-label">Contactgegevens</div>
            <div className="mrow c2">
              <div className="mfield">
                <label>Telefoonnummer</label>
                <input type="tel" placeholder="+31 6 00000000" value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} />
              </div>
              <div className="mfield">
                <label>Website</label>
                <input type="url" placeholder="https://bedrijf.nl" value={form.web} onChange={e => setForm(f => ({ ...f, web: e.target.value }))} />
              </div>
            </div>

            <div className="modal-divider" />
            <div className="modal-section-label">Adres</div>
            <div className="mfield" style={{ gridColumn: 'span 2' }}>
              <label>Straat en huisnummer</label>
              <input type="text" placeholder="Straatnaam 0" value={form.straat} onChange={e => setForm(f => ({ ...f, straat: e.target.value }))} />
            </div>
            <div className="mrow c3">
              <div className="mfield">
                <label>Postcode</label>
                <input type="text" placeholder="0000 AA" value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} />
              </div>
              <div className="mfield">
                <label>Plaats</label>
                <input type="text" placeholder="Plaatsnaam" value={form.plaats} onChange={e => setForm(f => ({ ...f, plaats: e.target.value }))} />
              </div>
              <div className="mfield">
                <label>Land</label>
                <select value={form.land} onChange={e => setForm(f => ({ ...f, land: e.target.value }))}>
                  <option>Nederland</option><option>België</option><option>Duitsland</option><option>Overig</option>
                </select>
              </div>
            </div>

            <div className="modal-divider" />
            <div className="modal-section-label">Weergave</div>
            <div className="mfield">
              <label>Kleur klantkaart</label>
              <div className="avatar-picker">
                {COLORS.map(c => (
                  <div key={c} className={`av-color${selectedColor === c ? ' sel' : ''}`} style={{ background: c }} onClick={() => setSelectedColor(c)} />
                ))}
                <div className="av-preview" style={{ background: selectedColor + '22', color: selectedColor }}>
                  {klantType === 'bedrijf' ? (form.naam ? initials(form.naam) : '??') : ((form.voornaam || form.achternaam) ? initials((form.voornaam + ' ' + form.achternaam).trim()) : '??')}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <div className="modal-foot-hint">Velden met <span>*</span> zijn verplicht</div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Annuleren</button>
              <button className="btn-primary" onClick={saveKlant}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Klant opslaan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast${toast ? ' show' : ''}`}>
        <div className="toast-dot" />
        <span>{toast}</span>
      </div>
    </AppLayout>
  )
}
