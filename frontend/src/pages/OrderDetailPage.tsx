import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { orderApi } from '../api/orderApi'
import { ErrorState, Loading, PageHeader, StatusPill } from '../components/Layout'
import { useAsync } from '../hooks/useAsync'
import { formatDateTime, formatMoney } from '../lib/format'

export function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const { data, error, loading, reload } = useAsync(() => orderApi.getOrder(orderId), [orderId])
  const [actionError, setActionError] = useState<ApiError | null>(null)
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    if (!data || !window.confirm(`Cancel order ${data.orderNumber}?`)) return
    setCancelling(true)
    setActionError(null)
    try {
      await orderApi.cancelOrder(data.id)
      reload()
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause : new ApiError(0, 'Unknown', String(cause)))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <PageHeader
        title={data?.orderNumber ?? 'Order'}
        subtitle={data ? `Placed ${formatDateTime(data.createdAt)}` : undefined}
        actions={
          <>
            <Link className="btn btn-ghost" to="/orders">
              All orders
            </Link>
            {data && data.status !== 'CANCELLED' ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </button>
            ) : null}
          </>
        }
      />

      {loading && <Loading label="Loading order" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {actionError && <ErrorState error={actionError} />}

      {data && (
        <>
          <div className="card">
            <dl className="detail-grid">
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusPill status={data.status} />
                </dd>
              </div>
              <div>
                <dt>Customer</dt>
                <dd>
                  <Link to={`/customers/${data.customerId}`}>{data.customerName}</Link>
                </dd>
              </div>
            </dl>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU</th>
                  <th className="num">Qty</th>
                  <th className="num">Unit price</th>
                  <th className="num">Line total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                    </td>
                    <td className="muted">{item.sku}</td>
                    <td className="num">{item.quantity}</td>
                    <td className="num">{formatMoney(item.unitPrice)}</td>
                    <td className="num">{formatMoney(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>Subtotal</td>
                  <td className="num">{formatMoney(data.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={4}>Discount</td>
                  <td className="num">-{formatMoney(data.discountAmount)}</td>
                </tr>
                <tr className="grand">
                  <td colSpan={4}>Total</td>
                  <td className="num">{formatMoney(data.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </>
  )
}
