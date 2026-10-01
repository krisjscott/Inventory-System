import { Boxes } from 'lucide-react'
import SignInForm from '@/components/ui/sign-in-form'

interface LoginPageProps {
  onGoogleSignIn: () => void
  errorMessage?: string
  onRetry?: () => void
}

export function LoginPage({ onGoogleSignIn, errorMessage, onRetry }: LoginPageProps) {
  return (
    <main className="inventory-login-shell">
      <section className="login-story" aria-labelledby="login-story-title">
        <a className="login-brand" href="/" aria-label="Stockroom home">
          <span className="login-brand-mark">S/</span>
          <span>Stockroom</span>
        </a>

        <div className="login-story-content">
          <span className="eyebrow">Inventory operations / 01</span>
          <h1 id="login-story-title">Every item.<br /><em>In its place.</em></h1>
          <p className="login-story-copy">
            A calmer way to see stock, shape orders, and keep the whole operation moving.
          </p>
        </div>

        <div className="login-story-footer">
          <span>Control the flow</span>
          <span>Stockroom / System 01</span>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-panel-inner">
          <span className="eyebrow">Workspace access</span>
          <h2 id="login-title">Sign in.</h2>
          <p className="login-panel-copy">Use your Google account to enter the inventory workspace.</p>
          {errorMessage ? (
            <div className="signin-error" role="alert">
              <p className="m-0">{errorMessage}</p>
              {onRetry ? (
                <button className="mt-2 text-sm text-primary underline underline-offset-4" type="button" onClick={onRetry}>
                  Retry connection
                </button>
              ) : null}
            </div>
          ) : null}
          <SignInForm onGoogleSignIn={onGoogleSignIn} />
          <div className="mt-10 flex items-center gap-3 text-xs text-muted-foreground">
            <Boxes className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Inventory, orders, and customers in one place.</span>
          </div>
        </div>
      </section>
    </main>
  )
}
