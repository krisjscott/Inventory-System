import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import { EmptyState, ErrorState, Loading, PageHeader, StatusPill, TierPill } from '../components/Layout'
import { useAsync } from '../hooks/useAsync'
import { formatDateTime, formatMoney } from '../lib/format'

export function CustomersPage() {
  const { data, error, loading, reload } = useAsync(() => orderApi.listCustomers(), [])

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Every customer from GET /api/customers, with their discount tier."
      />
      {loading && <Loading label="Loading customers" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No customers" />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Tier</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link to={`/customers/${customer.id}`}>{customer.fullName}</Link>
                  </td>
                  <td className="muted">{customer.email}</td>
                  <td>
                    <TierPill tier={customer.tier} />
                  </td>
                  <td className="num">
                    <Link className="btn btn-ghost btn-sm" to={`/customers/${customer.id}`}>
                      View orders
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export function CustomerDetailPage() {
  const { id } = useParams()
  const customerId = Number(id)
  const { data, error, loading, reload } = useAsync(
    () => orderApi.getCustomer(customerId),
    [customerId],
  )

  return (
    <>
      <PageHeader
        title={data?.fullName ?? 'Customer'}
        subtitle={data ? data.email : undefined}
        actions={
          <>
            <Link className="btn btn-ghost" to="/customers">
              All customers
            </Link>
            <Link className="btn btn-primary" to={`/orders/new?customerId=${customerId}`}>
              Place order
            </Link>
          </>
        }
      />
      {loading && <Loading label="Loading customer" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <div className="card">
          <dl className="detail-grid">
            <div>
              <dt>Tier</dt>
              <dd>
                <TierPill tier={data.tier} />
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{data.email}</dd>
            </div>
          </dl>
        </div>
      )}

      <section>
        <h2>Order history</h2>
        <CustomerOrderHistory customerId={customerId} />
      </section>
    </>
  )
}

function CustomerOrderHistory({ customerId }: { customerId: number }) {
  const { data, error, loading, reload } = useAsync(
    () => orderApi.getCustomerOrders(customerId),
    [customerId],
  )

  if (loading) return <Loading label="Loading order history" />
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!data || data.length === 0) return <EmptyState title="No orders yet" hint="Nothing placed for this customer." />

  const lifetime = data.reduce((sum, order) => sum + order.total, 0)

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Status</th>
              <th className="num">Units</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link to={`/orders/${order.id}`}>{order.orderNumber}</Link>
                </td>
                <td>{formatDateTime(order.createdAt)}</td>
                <td>
                  <StatusPill status={order.status} />
                </td>
                <td className="num">{order.unitCount}</td>
                <td className="num">{formatMoney(order.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>{data.length} orders</td>
              <td className="num">{formatMoney(lifetime)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}
