import { useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { AuthUser } from '@/api/authApi'
import { backendUrl } from '@/api/config'
import { LoginPage } from '@/components/auth/LoginPage'
import { useAuth } from '@/hooks/useAuth'
import { CustomersPage, CustomerDetailPage } from '@/pages/CustomersPage'
import { NewOrderPage } from '@/pages/NewOrderPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { OrdersIndexPage } from '@/pages/OrdersIndexPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { useCart } from '@/state/cartContext'

function App() {
  const auth = useAuth()

  if (auth.state.kind === 'loading') {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
          <span className="spinner" aria-hidden="true" />
          Checking workspace access
        </div>
      </main>
    )
  }

  if (auth.state.kind === 'error' || auth.state.kind === 'signed-out') {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onGoogleSignIn={() => window.location.assign(backendUrl('/oauth2/authorization/google'))}
              errorMessage={auth.state.kind === 'error' ? auth.state.message : undefined}
              onRetry={auth.state.kind === 'error' ? auth.retry : undefined}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<InventoryApp user={auth.state.user} onSignOut={auth.signOut} />} />
    </Routes>
  )
}

function InventoryApp({ user, onSignOut }: { user: AuthUser; onSignOut: () => Promise<void> }) {
  const { unitCount } = useCart()
  const [signOutError, setSignOutError] = useState<string | null>(null)

  async function handleSignOut() {
    setSignOutError(null)
    try {
      await onSignOut()
    } catch {
      setSignOutError('Sign out did not complete. Please try again.')
    }
  }

  return (
    <div className="app min-h-screen bg-background text-foreground">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink className="brand" to="/" aria-label="Stockroom inventory home">
            <span className="logo" aria-hidden="true">S/</span>
            <span>
              <strong>Stockroom</strong>
              <small>Inventory / System 01</small>
            </span>
          </NavLink>

          <nav aria-label="Main navigation">
            <NavLink to="/" end>Inventory</NavLink>
            <NavLink to="/customers">Customers</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/orders/new">New order</NavLink>
          </nav>

          <div className="topbar-right">
            <span className="dot dot-online" aria-hidden="true" />
            <span className="status-text">Live workspace</span>
            <span className="cart-chip" title="Units in basket">{unitCount} units</span>
            <span className="status-text hidden max-w-32 truncate md:inline" title={user.email}>{user.name}</span>
            <button className="btn btn-ghost" type="button" onClick={() => void handleSignOut()}>
              Sign out <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {signOutError ? <div className="banner" role="alert">{signOutError}</div> : null}

      <main className="main-stage">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/orders" element={<OrdersIndexPage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="*" element={<p className="state">Page not found.</p>} />
        </Routes>
        <footer className="app-footer">
          <span>Stockroom / Inventory operations</span>
          <span>Built for a clearer count</span>
        </footer>
      </main>
    </div>
  )
}

export default App
