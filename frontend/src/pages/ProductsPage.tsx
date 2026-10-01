import { ArrowUpRight, MoveRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, Loading } from '../components/Layout'
import { useInventory } from '../hooks/useInventory'
import { formatMoney } from '../lib/format'

export function ProductsPage() {
  const { data, error, loading, reload, addToOrder, totalUnits } = useInventory()

  return (
    <>
      <section className="inventory-hero-band" aria-labelledby="inventory-title">
        <div className="inventory-hero-inner">
          <div>
            <span className="eyebrow">Stockroom / Inventory overview</span>
            <h1 className="inventory-hero-title" id="inventory-title">
              Count clearly.<br /><span>Move with intent.</span>
            </h1>
            <p className="inventory-hero-copy">
              Your stock, availability, and next action—kept in one clear view.
            </p>
          </div>
          <div className="inventory-hero-stat" aria-live="polite">
            <span>Active products</span>
            <strong>{loading ? '—' : data?.length ?? 0}</strong>
            <span>{totalUnits.toLocaleString()} units on hand</span>
          </div>
        </div>
      </section>

      <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <span>01 / Current stock</span>
          <h2 id="catalog-title">Inventory</h2>
        </div>

        {loading ? <Loading label="Loading inventory" /> : null}
        {error ? <ErrorState error={error} onRetry={reload} /> : null}
        {data && data.length === 0 ? (
          <EmptyState title="No products yet" hint="Add inventory items to see them here." />
        ) : null}

        {data && data.length > 0 ? (
          <ul className="product-list">
            {data.map((product) => (
              <li key={product.id} className="product-row">
                <div>
                  <Link className="product-name" to={`/products/${product.id}`}>
                    {product.name}
                  </Link>
                  <p className="product-description">{product.description || 'No description provided.'}</p>
                </div>
                <span className="sku">{product.sku}</span>
                <div className="product-stock">
                  <strong className="product-price">{formatMoney(product.unitPrice)}</strong>
                  <span className={product.inStock ? 'stock-ok block' : 'stock-out block'}>
                    {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="product-actions flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!product.inStock}
                    onClick={() => addToOrder(product)}
                  >
                    {product.inStock ? 'Add to order' : 'Unavailable'}
                    <MoveRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <Link className="btn btn-ghost" to={`/products/${product.id}`} aria-label={`Details for ${product.name}`}>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  )
}
