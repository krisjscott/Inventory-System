import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { orderApi } from './api/orderApi'
import { useCart } from './state/cartContext'
import { CustomerDetailPage, CustomersPage } from './pages/CustomersPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { OrdersIndexPage } from './pages/OrdersIndexPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'

/** Pings GET /api/products once on mount to confirm the API is reachable. */
function useApiStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    let active = true
    orderApi
      .listProducts()
      .then(() => active && setStatus('online'))
      .catch(() => active && setStatus('offline'))
    return () => {
      active = false
    }
  }, [])

  return status
}

export default function App() {
  const apiStatus = useApiStatus()
  const { unitCount } = useCart()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden="true" />
          <div>
            <strong>Inventory System</strong>
            <small>order-api</small>
          </div>
        </div>

        <nav>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/orders/new">New order</NavLink>
        </nav>

        <div className="topbar-right">
          <span className={`dot dot-${apiStatus}`} title={`API ${apiStatus}`} />
          <span className="status-text">
            {apiStatus === 'checking' ? 'Connecting' : apiStatus === 'online' ? 'API online' : 'API offline'}
          </span>
          <span className="cart-chip" title="Units in basket">
            Basket {unitCount}
          </span>
        </div>
      </header>

      {apiStatus === 'offline' && (
        <div className="banner" role="alert">
          Cannot reach the order-api on port 8080. Start it with <code>mvn spring-boot:run</code>,
          then reload. The dev server proxies <code>/api</code> to it.
        </div>
      )}

      <main>
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
      </main>
    </div>
  )
}
