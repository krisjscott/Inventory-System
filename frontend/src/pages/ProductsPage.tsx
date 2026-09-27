import { Link } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import { ErrorState, Loading, PageHeader } from '../components/Layout'
import { useAsync } from '../hooks/useAsync'
import { useCart } from '../state/cartContext'
import { formatMoney } from '../lib/format'

export function ProductsPage() {
  const { data, error, loading, reload } = useAsync(() => orderApi.listProducts(), [])
  const { add } = useCart()

  return (
    <>
      <PageHeader
        title="Product catalog"
        subtitle="Active products from GET /api/products, priced and stocked live."
      />
      {loading && <Loading label="Loading products" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <ul className="card-grid">
          {data.map((product) => (
            <li key={product.id} className="card">
              <div className="card-top">
                <h2>{product.name}</h2>
                <span className="sku">{product.sku}</span>
              </div>
              {product.description ? <p className="muted">{product.description}</p> : null}
              <div className="card-meta">
                <strong>{formatMoney(product.unitPrice)}</strong>
                <span className={product.inStock ? 'stock-ok' : 'stock-out'}>
                  {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!product.inStock}
                  onClick={() => add(product)}
                >
                  {product.inStock ? 'Add to order' : 'Unavailable'}
                </button>
                <Link className="btn btn-ghost" to={`/products/${product.id}`}>
                  Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
