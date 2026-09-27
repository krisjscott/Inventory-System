import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import { ErrorState, Loading, PageHeader } from '../components/Layout'
import { useAsync } from '../hooks/useAsync'
import { formatMoney } from '../lib/format'

export function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const { data, error, loading, reload } = useAsync(
    () => orderApi.getProduct(productId),
    [productId],
  )

  return (
    <>
      <PageHeader
        title={data?.name ?? 'Product'}
        subtitle={data ? data.sku : undefined}
        actions={
          <Link className="btn btn-ghost" to="/products">
            Back to catalog
          </Link>
        }
      />
      {loading && <Loading label="Loading product" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <div className="card">
          {data.description ? <p>{data.description}</p> : null}
          <dl className="detail-grid">
            <div>
              <dt>Unit price</dt>
              <dd>{formatMoney(data.unitPrice)}</dd>
            </div>
            <div>
              <dt>Stock on hand</dt>
              <dd>{data.stockQuantity}</dd>
            </div>
            <div>
              <dt>Available</dt>
              <dd>{data.inStock ? 'In stock' : 'Out of stock'}</dd>
            </div>
          </dl>
        </div>
      )}
    </>
  )
}
