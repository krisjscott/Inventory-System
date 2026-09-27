/**
 * Mirrors the Java DTO records in
 * src/main/java/com/example/orderapi/dto. Field names and types must stay in
 * sync with the server, since Jackson serialises the record components by name.
 *
 * Money arrives as a JSON number, so `number` is correct here.
 */

export type CustomerTier = 'STANDARD' | 'GOLD' | 'PLATINUM'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED'

/** CustomerResponse */
export interface Customer {
  id: number
  fullName: string
  email: string
  tier: CustomerTier
}

/** ProductResponse */
export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  unitPrice: number
  stockQuantity: number
  inStock: boolean
}

/** OrderItemResponse */
export interface OrderItem {
  id: number
  productId: number
  sku: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

/** OrderResponse */
export interface Order {
  id: number
  orderNumber: string
  customerId: number
  customerName: string
  status: OrderStatus
  subtotal: number
  discountAmount: number
  total: number
  createdAt: string
  items: OrderItem[]
}

/** OrderSummaryResponse */
export interface OrderSummary {
  id: number
  orderNumber: string
  status: OrderStatus
  total: number
  /** Sum of line quantities, not the number of lines. */
  unitCount: number
  createdAt: string
}

/** ErrorResponse */
export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors: Record<string, string>
}

/** CreateOrderItemRequest */
export interface CreateOrderItem {
  productId: number
  quantity: number
}

/** CreateOrderRequest */
export interface CreateOrderRequest {
  customerId: number
  items: CreateOrderItem[]
}
