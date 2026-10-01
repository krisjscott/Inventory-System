import { orderApi } from '../api/orderApi'
import { useAsync } from './useAsync'
import { useCart } from '../state/cartContext'

/** Inventory data and cart actions used by the inventory screen. */
export function useInventory() {
  const inventory = useAsync(() => orderApi.listProducts(), [])
  const cart = useCart()
  const totalUnits = inventory.data?.reduce((total, product) => total + product.stockQuantity, 0) ?? 0

  return {
    ...inventory,
    addToOrder: cart.add,
    totalUnits,
  }
}
