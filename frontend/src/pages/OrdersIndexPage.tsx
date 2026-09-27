import { Link } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import { ErrorState, Loading, PageHeader } from '../components/Layout'
import { useAsync } from '../hooks/useAsync'

/**
 * The API exposes orders per customer (GET /api/customers/{id}/orders) and
 * individually (GET /api/orders/{id}); there is no list-all endpoint. This page
 * is the entry point into each customer's order history.
 */
export function OrdersIndexPage() {
  const { data, error, loading, reload } = useAsync(() => orderApi.listCustomers(), [])

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Order history is exposed per customer. Pick an account to browse its orders."
        actions={
          <Link className="btn btn-primary" to="/orders/new">
            Place an order
          </Link>
        }
      />
      {loading && <Loading label="Loading customers" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <ul className="card-grid">
          {data.map((customer) => (
            <li key={customer.id} className="card">
              <div className="card-top">
                <h2>{customer.fullName}</h2>
                <span className="sku">{customer.tier}</span>
              </div>
              <p className="muted">{customer.email}</p>
              <div className="card-actions">
                <Link className="btn btn-ghost" to={`/customers/${customer.id}`}>
                  View orders
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
