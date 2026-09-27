import type { ReactNode } from 'react'
import type { ApiError } from '../api/client'
import { StatusBadge, TierBadge } from './Badges'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  )
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}…
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="state">
      <strong>{title}</strong>
      {hint ? <span>{hint}</span> : null}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="state state-error" role="alert">
      <strong>
        {error.status ? `${error.status} ${error.error}` : error.error}
      </strong>
      <span>{error.message}</span>
      {Object.keys(error.fieldErrors).length > 0 ? (
        <ul>
          {Object.entries(error.fieldErrors).map(([field, message]) => (
            <li key={field}>
              <code>{field}</code> {message}
            </li>
          ))}
        </ul>
      ) : null}
      {onRetry ? (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  return <StatusBadge status={status} />
}

export function TierPill({ tier }: { tier: string }) {
  return <TierBadge tier={tier} />
}
