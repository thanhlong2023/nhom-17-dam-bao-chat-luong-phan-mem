import { httpDelete, httpGet, httpPost, httpPut } from './http'
import type { ApiResponse, Voucher, SystemSetting } from '../../types'

// ==== VOUCHERS ====
export async function getVouchers() {
  const response = await httpGet<ApiResponse<Voucher[]>>('/api/admin/vouchers')
  return response.data
}

export async function createVoucher(payload: Partial<Voucher>) {
  const response = await httpPost<ApiResponse<Voucher>>('/api/admin/vouchers', payload)
  return response.data
}

export async function updateVoucher(id: number, payload: Partial<Voucher>) {
  const response = await httpPut<ApiResponse<Voucher>>(`/api/admin/vouchers/${id}`, payload)
  return response.data
}

export async function deleteVoucher(id: number) {
  const response = await httpDelete<ApiResponse<unknown>>(`/api/admin/vouchers/${id}`)
  return response.data
}

// ==== SYSTEM SETTINGS ====
export async function getSystemSettings() {
  const response = await httpGet<ApiResponse<SystemSetting[]>>('/api/admin/settings')
  return response.data
}

export async function createSystemSetting(payload: Partial<SystemSetting>) {
  const response = await httpPost<ApiResponse<SystemSetting>>('/api/admin/settings', payload)
  return response.data
}

export async function updateSystemSetting(id: number, payload: Partial<SystemSetting>) {
  const response = await httpPut<ApiResponse<SystemSetting>>(`/api/admin/settings/${id}`, payload)
  return response.data
}

export async function deleteSystemSetting(id: number) {
  const response = await httpDelete<ApiResponse<unknown>>(`/api/admin/settings/${id}`)
  return response.data
}
