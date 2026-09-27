const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  CANCELLED: 'Cancelled',
}

const TIER_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge status-${status.toLowerCase()}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={`badge tier-${tier.toLowerCase()}`}>{TIER_LABELS[tier] ?? tier}</span>
  )
}
