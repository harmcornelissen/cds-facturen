'use client'

import { useMemo, useState } from 'react'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import { Button, EmptyState, Field, Modal, SelectInput, TextArea, TextInput, Toast } from '@/app/components/ui'
import { colors, fonts, formGrid, inputStyle, mainScroll, pageHeader, titleStyle } from '@/app/lib/theme'
import { canUseIncasso, clientColors, createId, fmtCurrency, initials, invoiceTotals, resolveInvoiceStatus, type Client, type ClientKind, type PriceInputMode, useClients, useInvoices, usePlan } from '@/app/lib/data'

const blankForm = {
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  postalCode: '',
  city: '',
  country: 'Nederland',
  kvk: '',
  btw: '',
  iban: '',
}

export default function KlantenPage() {
  const [clients, setClients] = useClients()
  const [invoices] = useInvoices()
  const [plan] = usePlan()
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'alle' | 'open' | 'incasso'>('alle')
  const [modalOpen, setModalOpen] = useState(false)
  const [kind, setKind] = useState<ClientKind>('bedrijf')
  const [form, setForm] = useState(blankForm)
  const [color, setColor] = useState(clientColors[0])
  const [priceInputMode, setPriceInputMode] = useState<PriceInputMode>('excl')
  const [note, setNote] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [toast, setToast] = useState('')

  const selected = clients.find((client) => client.id === selectedId) || clients[0]
  const stats = useMemo(() => {
    return clients.reduce<Record<string, { revenue: number; open: number; invoices: number }>>((acc, client) => {
      const related = invoices.filter((invoice) => invoice.clientId === client.id || invoice.clientName === client.name)
      acc[client.id] = related.reduce(
        (sum, invoice) => {
          const totals = invoiceTotals(invoice)
          const status = resolveInvoiceStatus(invoice)
          sum.revenue += totals.total
          sum.invoices += 1
          if (status === 'verzonden' || status === 'verlopen' || status === 'incasso') sum.open += totals.total
          return sum
        },
        { revenue: 0, open: 0, invoices: 0 },
      )
      return acc
    }, {})
  }, [clients, invoices])

  const visible = clients
    .filter((client) => {
      if (filter === 'open') return (stats[client.id]?.open || 0) > 0
      if (filter === 'incasso') return client.incasso
      return true
    })
    .filter((client) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return [client.name, client.email, client.kvk, client.city].some((value) => value.toLowerCase().includes(q))
    })

  function openModal() {
    setKind('bedrijf')
    setForm(blankForm)
    setColor(clientColors[0])
    setPriceInputMode('excl')
    setModalOpen(true)
  }

  function updateForm(key: keyof typeof blankForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function saveClient() {
    const name = kind === 'bedrijf' ? form.companyName.trim() : `${form.firstName} ${form.lastName}`.trim()
    if (!name) {
      setToast('Vul een klantnaam in.')
      return
    }
    const client: Client = {
      id: createId('klant'),
      kind,
      name,
      email: form.email,
      phone: form.phone,
      website: form.website.replace(/^https?:\/\//, ''),
      address: form.address,
      postalCode: form.postalCode,
      city: form.city,
      country: form.country,
      kvk: kind === 'bedrijf' ? form.kvk : '',
      btw: kind === 'bedrijf' ? form.btw : '',
      iban: form.iban,
      color,
      note: '',
      incasso: false,
      priceInputMode,
      createdAt: new Date().toISOString(),
    }
    setClients((current) => [client, ...current])
    setSelectedId(client.id)
    setNote('')
    setModalOpen(false)
    setToast(`${name} toegevoegd`)
  }

  function saveNote() {
    if (!selected) return
    setClients((current) => current.map((client) => (client.id === selected.id ? { ...client, note } : client)))
    setToast('Notitie opgeslagen')
  }

  function toggleIncasso() {
    if (!selected) return
    if (!canUseIncasso(plan)) {
      setUpgradeOpen(true)
      return
    }
    setClients((current) => current.map((client) => (client.id === selected.id ? { ...client, incasso: !client.incasso } : client)))
  }

  return (
    <main style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', minHeight: 0, overflow: 'auto' }}>
      <aside style={{ width: 'min(410px, 100%)', flex: '0 1 410px', minWidth: 0, borderRight: `0.5px solid ${colors.border2}`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '22px 20px 14px', borderBottom: `0.5px solid ${colors.border2}` }}>
          <div style={{ ...pageHeader, marginBottom: 14 }}>
            <div style={{ ...titleStyle, fontSize: 17 }}>Klanten <span style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 13, fontWeight: 400 }}>{clients.length}</span></div>
            <Button icon="plus" onClick={openModal} style={{ minHeight: 34, padding: '8px 12px', fontSize: 12 }}>Toevoegen</Button>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek op naam, e-mail of KvK..."
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', gap: 7, padding: '10px 20px', borderBottom: `0.5px solid ${colors.border2}`, overflowX: 'auto' }}>
          {[
            ['alle', 'Alle klanten'],
            ['open', 'Openstaand'],
            ['incasso', 'Incasso actief'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as typeof filter)}
              style={{
                border: `0.5px solid ${filter === value ? 'rgba(36,86,255,0.45)' : colors.border2}`,
                background: filter === value ? colors.blueSoft : 'transparent',
                color: filter === value ? '#6f8cff' : colors.muted,
                borderRadius: 999,
                padding: '6px 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: 11.5,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {visible.length === 0 ? (
            <EmptyState compact icon="users" title="Nog geen klanten" body="Voeg een klant toe om facturen te kunnen versturen." action={<Button icon="plus" onClick={openModal}>Klant toevoegen</Button>} />
          ) : (
            visible.map((client) => {
              const active = selected?.id === client.id
              const clientStats = stats[client.id] || { revenue: 0, open: 0, invoices: 0 }
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(client.id)
                    setNote(client.note)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: 0,
                    borderBottom: `0.5px solid rgba(240,244,255,0.07)`,
                    background: active ? colors.blueSoft : 'transparent',
                    color: colors.white,
                    padding: '13px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${client.color}22`, color: client.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.heading, fontWeight: 800 }}>
                    {initials(client.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                    <div style={{ color: colors.muted, fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email || client.city || 'Geen contactgegevens'}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 800 }}>{fmtCurrency(clientStats.revenue)}</div>
                    <div style={{ color: clientStats.open > 0 ? colors.amber : colors.green, fontSize: 11 }}>{clientStats.open > 0 ? `${fmtCurrency(clientStats.open)} open` : 'Alles voldaan'}</div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      <section style={{ ...mainScroll, flex: '1 1 420px' }}>
        {!selected ? (
          <EmptyState icon="users" title="Selecteer een klant" body="Klik op een klant in de lijst om gegevens, omzet en notities te bekijken." />
        ) : (
          <ClientDetail client={selected} stats={stats[selected.id] || { revenue: 0, open: 0, invoices: 0 }} note={note || selected.note} setNote={setNote} saveNote={saveNote} toggleIncasso={toggleIncasso} />
        )}
      </section>

      <Modal
        open={modalOpen}
        title="Klant toevoegen"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuleren</Button>
            <Button onClick={saveClient} icon="check">Klant opslaan</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 18, width: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 4, width: 'fit-content' }}>
            {[
              ['bedrijf', 'Bedrijf'],
              ['particulier', 'Particulier'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value as ClientKind)}
                style={{
                  border: 0,
                  borderRadius: 7,
                  padding: '8px 13px',
                  background: kind === value ? colors.blue : 'transparent',
                  color: kind === value ? '#fff' : colors.muted,
                  cursor: 'pointer',
                  fontFamily: fonts.heading,
                  fontWeight: 700,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <div style={{ color: colors.muted, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Prijsinvoer voor facturen</div>
            <PriceModeSwitch value={priceInputMode} onChange={setPriceInputMode} />
          </div>

          <div style={formGrid(210)}>
            {kind === 'bedrijf' ? (
              <Field label="Bedrijfsnaam">
                <TextInput value={form.companyName} onChange={(value) => updateForm('companyName', value)} placeholder="Bedrijfsnaam of volledige naam" />
              </Field>
            ) : (
              <>
                <Field label="Voornaam">
                  <TextInput value={form.firstName} onChange={(value) => updateForm('firstName', value)} placeholder="Voornaam" />
                </Field>
                <Field label="Achternaam">
                  <TextInput value={form.lastName} onChange={(value) => updateForm('lastName', value)} placeholder="Achternaam" />
                </Field>
              </>
            )}
            <Field label="E-mail">
              <TextInput value={form.email} onChange={(value) => updateForm('email', value)} placeholder="klant@bedrijf.nl" type="email" />
            </Field>
            <Field label="Telefoon">
              <TextInput value={form.phone} onChange={(value) => updateForm('phone', value)} placeholder="+31 6 00000000" />
            </Field>
            <Field label="Website">
              <TextInput value={form.website} onChange={(value) => updateForm('website', value)} placeholder="https://klant.nl" />
            </Field>
            {kind === 'bedrijf' ? (
              <>
                <Field label="KvK">
                  <TextInput value={form.kvk} onChange={(value) => updateForm('kvk', value)} placeholder="12345678" />
                </Field>
                <Field label="BTW">
                  <TextInput value={form.btw} onChange={(value) => updateForm('btw', value)} placeholder="NL000000000B01" />
                </Field>
              </>
            ) : null}
            <Field label="IBAN">
              <TextInput value={form.iban} onChange={(value) => updateForm('iban', value)} placeholder="NL00 BANK 0000 0000 00" />
            </Field>
            <Field label="Straat en huisnummer">
              <TextInput value={form.address} onChange={(value) => updateForm('address', value)} placeholder="Straatnaam 1" />
            </Field>
            <Field label="Postcode">
              <TextInput value={form.postalCode} onChange={(value) => updateForm('postalCode', value)} placeholder="1234 AB" />
            </Field>
            <Field label="Plaats">
              <TextInput value={form.city} onChange={(value) => updateForm('city', value)} placeholder="Amsterdam" />
            </Field>
            <Field label="Land">
              <SelectInput value={form.country} onChange={(value) => updateForm('country', value)}>
                <option>Nederland</option>
                <option>Belgie</option>
                <option>Duitsland</option>
              </SelectInput>
            </Field>
          </div>

          <div>
            <div style={{ color: colors.muted, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Kleur</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {clientColors.map((item) => (
                <button key={item} type="button" onClick={() => setColor(item)} style={{ width: 26, height: 26, borderRadius: 999, border: `2px solid ${color === item ? '#fff' : 'transparent'}`, background: item, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

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

function ClientDetail({
  client,
  stats,
  note,
  setNote,
  saveNote,
  toggleIncasso,
}: {
  client: Client
  stats: { revenue: number; open: number; invoices: number }
  note: string
  setNote: (value: string) => void
  saveNote: () => void
  toggleIncasso: () => void
}) {
  return (
    <div>
      <div style={{ ...pageHeader, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 58, height: 58, borderRadius: 12, background: `${client.color}22`, color: client.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.heading, fontWeight: 800, fontSize: 19 }}>
            {initials(client.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>{client.name}</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
              {client.kind === 'bedrijf' ? 'Bedrijf' : 'Particulier'} · {stats.invoices} facturen · {client.incasso ? 'Incasso actief' : 'Geen incasso'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button href={`/facturen/nieuw?client=${client.id}`} variant="secondary" icon="plus">Factuur maken</Button>
          <Button variant={client.incasso ? 'danger' : 'secondary'} icon="bank" onClick={toggleIncasso}>{client.incasso ? 'Incasso uit' : 'Incasso aan'}</Button>
        </div>
      </div>

      <div style={{ ...formGrid(190), marginBottom: 22 }}>
        <Metric label="Totale omzet" value={fmtCurrency(stats.revenue)} sub={`${stats.invoices} facturen`} color={colors.blue} />
        <Metric label="Openstaand" value={fmtCurrency(stats.open)} sub={stats.open > 0 ? 'Betaling verwacht' : 'Alles voldaan'} color={stats.open > 0 ? colors.amber : colors.green} />
        <Metric label="Incasso" value={client.incasso ? 'Actief' : 'Inactief'} sub="SEPA machtiging" color={client.incasso ? colors.green : colors.muted} />
        <Metric label="Type" value={client.kind === 'bedrijf' ? 'Bedrijf' : 'Particulier'} sub={client.country || 'Nederland'} color={colors.blue} />
      </div>

      <div style={{ ...formGrid(280, 2, 16), marginBottom: 18 }}>
        <InfoCard title="Contactgegevens" rows={[
          ['E-mail', client.email || '-'],
          ['Telefoon', client.phone || '-'],
          ['Website', client.website || '-'],
          ['Adres', [client.address, client.postalCode, client.city].filter(Boolean).join(', ') || '-'],
        ]} />
        <InfoCard title="Bedrijfsgegevens" rows={[
          ['KvK', client.kvk || '-'],
          ['BTW', client.btw || '-'],
          ['IBAN', client.iban || '-'],
          ['Prijsinvoer', client.priceInputMode === 'incl' ? 'Incl. BTW' : 'Excl. BTW'],
          ['Aangemaakt', new Date(client.createdAt).toLocaleDateString('nl-NL')],
        ]} />
      </div>

      <div style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 18 }}>
        <Field label="Notitie">
          <TextArea value={note} onChange={setNote} placeholder="Interne klantnotitie..." rows={5} />
        </Field>
        <Button onClick={saveNote} icon="check" style={{ marginTop: 12 }}>Notitie opslaan</Button>
      </div>
    </div>
  )
}

function PriceModeSwitch({ value, onChange }: { value: PriceInputMode; onChange: (value: PriceInputMode) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 4, flexWrap: 'wrap' }}>
      {[
        ['excl', 'Prijzen invoeren excl. BTW'],
        ['incl', 'Prijzen invoeren incl. BTW'],
      ].map(([mode, label]) => {
        const active = value === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode as PriceInputMode)}
            style={{
              border: 0,
              borderRadius: 7,
              padding: '8px 12px',
              background: active ? colors.blue : 'transparent',
              color: active ? '#fff' : colors.muted,
              cursor: 'pointer',
              fontFamily: fonts.heading,
              fontWeight: 800,
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 16 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: fonts.heading, color: '#fff', fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ color: colors.muted, fontSize: 11.5, marginTop: 4 }}>{sub}</div>
    </div>
  )
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 18 }}>
      <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'grid', gridTemplateColumns: '105px minmax(0, 1fr)', gap: 12, fontSize: 13, width: '100%', overflow: 'hidden' }}>
            <span style={{ color: colors.muted }}>{label}</span>
            <span style={{ color: colors.white, overflowWrap: 'anywhere' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
