import { httpPost } from './http'
import type { ApiResponse } from '../../types'

export type VoucherValidationResult = {
  id: number
  code: string
  discountAmount: number
  discountType: string
  discountValue: number
  minOrderValue: number
  maxDiscountAmount: number | null
}

export async function validateVoucher(code: string, subtotal: number) {
  const response = await httpPost<ApiResponse<VoucherValidationResult>>('/api/vouchers/validate', {
    code,
    subtotal,
  })
  return response.data
}
