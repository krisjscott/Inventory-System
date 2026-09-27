import { createContext, useContext } from 'react'
import type { Product } from '../api/types'

export interface CartLine {
  product: Product
  quantity: number
}

export interface CartValue {
  lines: CartLine[]
  add: (product: Product, quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  clear: () => void
  /** Total number of units across all lines. */
  unitCount: number
  /** Line totals before any tier discount, which only the server can apply. */
  estimatedSubtotal: number
}

export const CartContext = createContext<CartValue | null>(null)

export function useCart(): CartValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside a CartProvider')
  return value
}
