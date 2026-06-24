import { httpDelete, httpGet, httpPost, httpPut } from './http'
import type { AddressDetail, AddressSuggestion, ApiResponse, SavedAddress } from '../../types'

type AddressRequestOptions = {
  signal?: AbortSignal
  suggestion?: AddressSuggestion
}

function unwrapAddressResponse<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data
  }

  return response as T
}

function hasCoordinates(suggestion: AddressSuggestion) {
  return (
    suggestion.latitude !== null &&
    suggestion.longitude !== null &&
    Number.isFinite(Number(suggestion.latitude)) &&
    Number.isFinite(Number(suggestion.longitude))
  )
}

export function addressDetailFromSuggestion(suggestion: AddressSuggestion): AddressDetail {
  return {
    placeId: suggestion.placeId,
    formattedAddress: suggestion.description,
    latitude: hasCoordinates(suggestion) ? Number(suggestion.latitude) : null,
    longitude: hasCoordinates(suggestion) ? Number(suggestion.longitude) : null,
    province: '',
    district: '',
    ward: '',
    street: '',
    houseNumber: '',
    provider: suggestion.provider || 'vietmap',
    raw: suggestion.raw,
  }
}

export async function suggestAddresses(query: string, options: AddressRequestOptions = {}) {
  const response = await httpGet<ApiResponse<AddressSuggestion[]> | AddressSuggestion[]>('/api/addresses/suggest', {
    query: { q: query },
    signal: options.signal,
  })

  return unwrapAddressResponse(response)
}

export async function getAddressDetail(placeId: string, options: AddressRequestOptions = {}) {
  const query: Record<string, string | number | boolean> = {}

  if (options.suggestion) {
    query.description = options.suggestion.description
    query.provider = options.suggestion.provider

    if (options.suggestion.latitude !== null && Number.isFinite(Number(options.suggestion.latitude))) {
      query.latitude = Number(options.suggestion.latitude)
    }

    if (options.suggestion.longitude !== null && Number.isFinite(Number(options.suggestion.longitude))) {
      query.longitude = Number(options.suggestion.longitude)
    }
  }

  const response = await httpGet<ApiResponse<AddressDetail> | AddressDetail>(
    `/api/addresses/detail/${encodeURIComponent(placeId)}`,
    {
      query,
      signal: options.signal,
    },
  )

  return unwrapAddressResponse(response)
}

export async function reverseGeocodeAddress(latitude: number, longitude: number, options: AddressRequestOptions = {}) {
  const response = await httpGet<ApiResponse<AddressDetail> | AddressDetail>('/api/addresses/reverse', {
    query: {
      lat: latitude,
      lng: longitude,
    },
    signal: options.signal,
  })

  return unwrapAddressResponse(response)
}

export type SavedAddressPayload = Omit<SavedAddress, 'id' | 'userId' | 'createdAt'>

export async function getSavedAddresses() {
  const response = await httpGet<ApiResponse<SavedAddress[]>>('/api/addresses/mine')
  return response.data
}

export async function createSavedAddress(payload: SavedAddressPayload) {
  const response = await httpPost<ApiResponse<SavedAddress>>('/api/addresses/mine', payload)
  return response.data
}

export async function updateSavedAddress(id: number, payload: SavedAddressPayload) {
  const response = await httpPut<ApiResponse<SavedAddress>>(`/api/addresses/mine/${id}`, payload)
  return response.data
}

export async function deleteSavedAddress(id: number) {
  const response = await httpDelete<ApiResponse<SavedAddress>>(`/api/addresses/mine/${id}`)
  return response.data
}
