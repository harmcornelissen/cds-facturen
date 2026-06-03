'use client'

import { useEffect, useState } from 'react'
import { PlanRestrictionModal } from '@/app/components/DevPlanToolbar'
import { Button, EmptyState } from '@/app/components/ui'
import { colors, fonts, mainScroll, pageHeader, titleStyle } from '@/app/lib/theme'
import { canUseIncasso, usePlan } from '@/app/lib/data'

export default function IncassoPage() {
  const [plan] = usePlan()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const incassoAllowed = canUseIncasso(plan)

  useEffect(() => {
    if (!incassoAllowed) setUpgradeOpen(true)
  }, [incassoAllowed])

  if (!incassoAllowed) {
    return (
      <main style={mainScroll}>
        <div style={pageHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...titleStyle, margin: 0 }}>Automatische incasso</h1>
            <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Incasso is beschikbaar in het Professional abonnement.</div>
          </div>
        </div>
        <EmptyState
          icon="bank"
          title="Incasso uitgeschakeld"
          body="Upgrade naar Professional om automatische incasso te gebruiken."
          action={<Button icon="bank" onClick={() => setUpgradeOpen(true)}>Plan bekijken</Button>}
        />
        <PlanRestrictionModal
          open={upgradeOpen}
          plan={plan}
          title="Incasso niet beschikbaar"
          message="Automatische incasso is beschikbaar in het Professional abonnement."
          onClose={() => setUpgradeOpen(false)}
        />
      </main>
    )
  }

  return (
    <main style={mainScroll}>
      <div style={pageHeader}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleStyle, margin: 0 }}>Automatische incasso</h1>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Mollie koppeling in voorbereiding.</div>
        </div>
      </div>

      <section style={{ background: colors.surface, border: `0.5px solid ${colors.border2}`, borderRadius: 8, padding: 24, maxWidth: 720 }}>
        <div style={{ fontFamily: fonts.heading, color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Binnenkort beschikbaar</div>
        <div style={{ color: colors.muted, fontSize: 13, lineHeight: 1.6 }}>
          Automatische incasso wordt binnenkort beschikbaar. We zijn bezig met de Mollie koppeling.
        </div>
      </section>
    </main>
  )
}
