import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { orderApi } from '../api/orderApi'
import { ErrorState, Loading, PageHeader, TierPill } from '../components/Layout'
import { useAsync } from '../hooks/useAsync'
import { useCart } from '../state/cartContext'
import { formatMoney } from '../lib/format'
import type { CreateOrderItem } from '../api/types'

export function NewOrderPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { lines, setQuantity, remove, clear, unitCount, estimatedSubtotal } = useCart()

  const customers = useAsync(() => orderApi.listCustomers(), [])
  const products = useAsync(() => orderApi.listProducts(), [])

  const [customerId, setCustomerId] = useState(params.get('customerId') ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<ApiError | null>(null)

  const stockByProduct = new Map((products.data ?? []).map((p) => [p.id, p.stockQuantity]))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (lines.length === 0) return

    const items: CreateOrderItem[] = lines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
    }))

    setSubmitting(true)
    setSubmitError(null)
    try {
      const created = await orderApi.createOrder({ customerId: Number(customerId), items })
      clear()
      // Stock levels move once an order lands, so refresh before showing the result.
      products.reload()
      navigate(`/orders/${created.id}`)
    } catch (cause) {
      setSubmitError(cause instanceof ApiError ? cause : new ApiError(0, 'Unknown', String(cause)))
      products.reload()
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCustomer = customers.data?.find((c) => String(c.id) === customerId)

  return (
    <>
      <PageHeader
        title="Place an order"
        subtitle="Build a basket and submit it to POST /api/orders."
        actions={
          <Link className="btn btn-ghost" to="/products">
            Browse catalog
          </Link>
        }
      />

      {customers.error && <ErrorState error={customers.error} onRetry={customers.reload} />}
      {submitError && <ErrorState error={submitError} />}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Customer</h2>
          {customers.loading ? (
            <Loading label="Loading customers" />
          ) : (
            <label className="field">
              <span>Account</span>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">Select a customer…</option>
                {customers.data?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName} ({customer.email})
                  </option>
                ))}
              </select>
            </label>
          )}
          {selectedCustomer ? (
            <p className="muted">
              Discount tier: <TierPill tier={selectedCustomer.tier} />
            </p>
          ) : null}
        </div>

        <div className="card">
          <h2>Items</h2>
          {lines.length === 0 ? (
            <p className="muted">The basket is empty. Add products from the catalog.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th className="num">Unit price</th>
                    <th className="num">Available</th>
                    <th className="num">Quantity</th>
                    <th className="num">Line total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const available = stockByProduct.get(line.product.id) ?? line.product.stockQuantity
                    const oversubscribed = line.quantity > available
                    return (
                      <tr key={line.product.id}>
                        <td>{line.product.name}</td>
                        <td className="muted">{line.product.sku}</td>
                        <td className="num">{formatMoney(line.product.unitPrice)}</td>
                        <td className="num">{available}</td>
                        <td className="num">
                          <input
                            className="qty-input"
                            type="number"
                            min={1}
                            step={1}
                            value={line.quantity}
                            onChange={(e) => {
                              const next = Number(e.target.value)
                              // Never send a quantity below 1: the API should reject
                              // it, but the basket should not offer it either.
                              if (Number.isFinite(next) && next >= 1) {
                                setQuantity(line.product.id, Math.floor(next))
                              }
                            }}
                            onBlur={() => {
                              if (line.quantity < 1) setQuantity(line.product.id, 1)
                            }}
                          />
                          {oversubscribed ? (
                            <span className="warn">Only {available} available</span>
                          ) : null}
                        </td>
                        <td className="num">
                          {formatMoney(line.quantity * line.product.unitPrice)}
                        </td>
                        <td className="num">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => remove(line.product.id)}
                            aria-label={`Remove ${line.product.name}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="grand">
                    <td colSpan={5}>
                      {unitCount} {unitCount === 1 ? 'unit' : 'units'} · subtotal{' '}
                      {formatMoney(estimatedSubtotal)}
                    </td>
                    <td className="num">{formatMoney(estimatedSubtotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <p className="muted small">
            The discount applied to the final total is calculated by the server from the
            customer tier, so the total shown after submitting may differ from this subtotal.
          </p>
        </div>

        <div className="card sticky-submit">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting || lines.length === 0 || !customerId}
          >
            {submitting ? 'Placing order…' : `Place order (${unitCount} units)`}
          </button>
        </div>
      </form>
    </>
  )
}
