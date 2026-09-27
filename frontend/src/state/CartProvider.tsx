import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '../api/types'
import { CartContext } from './cartContext'
import type { CartLine, CartValue } from './cartContext'

const STORAGE_KEY = 'inventory-system.cart'

function readStored(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStored)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const add = useCallback((product: Product, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line,
        )
      }
      return [...current, { product, quantity }]
    })
  }, [])

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((current) =>
      current.map((line) => (line.product.id === productId ? { ...line, quantity } : line)),
    )
  }, [])

  const remove = useCallback((productId: number) => {
    setLines((current) => current.filter((line) => line.product.id !== productId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartValue>(() => {
    const unitCount = lines.reduce((sum, line) => sum + line.quantity, 0)
    const estimatedSubtotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.product.unitPrice,
      0,
    )
    return { lines, add, setQuantity, remove, clear, unitCount, estimatedSubtotal }
  }, [lines, add, setQuantity, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
