import { httpGet, httpPost } from './http'
import type { ApiResponse } from '../../types'

export type CreatePaymentPayload = {
  orderId: number
  idempotencyKey: string
  paymentMethod: 'CASH' | 'E_WALLET' | 'CREDIT_CARD'
}

export type PaymentData = {
  id: number
  orderId: number
  idempotencyKey: string
  paymentMethod: string
  amount: string | number
  status: string
}

export type ProcessPaymentCallbackPayload = {
  paymentId: number
  gatewayRef?: string
}

export async function createPayment(payload: CreatePaymentPayload) {
  const response = await httpPost<ApiResponse<PaymentData>>('/api/payments/create', payload)
  return response.data
}

export async function processPaymentCallback(payload: ProcessPaymentCallbackPayload) {
  const response = await httpPost<ApiResponse<any>>('/api/payments/callback', payload)
  return response.data
}

export async function getPaymentStatus(orderId: number) {
  const response = await httpGet<ApiResponse<PaymentData>>(`/api/payments/${orderId}`)
  return response.data
}
