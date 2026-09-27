import { api } from './client'
import type { CreateOrderRequest, Customer, Order, OrderSummary, Product } from './types'

/** One function per controller method, so pages never build URLs by hand. */
export const orderApi = {
  listProducts: () => api.get<Product[]>('/products'),
  getProduct: (id: number) => api.get<Product>(`/products/${id}`),

  listCustomers: () => api.get<Customer[]>('/customers'),
  getCustomer: (id: number) => api.get<Customer>(`/customers/${id}`),
  getCustomerOrders: (id: number) => api.get<OrderSummary[]>(`/customers/${id}/orders`),

  getOrder: (id: number) => api.get<Order>(`/orders/${id}`),
  createOrder: (payload: CreateOrderRequest) => api.post<Order>('/orders', payload),
  cancelOrder: (id: number) => api.post<Order>(`/orders/${id}/cancel`),
}
