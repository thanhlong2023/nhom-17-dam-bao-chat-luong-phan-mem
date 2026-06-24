import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { processPaymentCallback } from '../services/api/payments'
import { getOrderById } from '../services/api/orders'
import { formatCurrency } from '../utils/formatters'
import type { Order } from '../types'

export default function MockPaymentGatewayPage() {
  const { paymentId } = useParams()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      if (orderId) {
        try {
          const data = await getOrderById(Number(orderId))
          setOrder(data)
        } catch (error) {
          console.error('Failed to fetch order', error)
        }
      }
    }
    void fetchOrder()
  }, [orderId])

  async function handlePayment(success: boolean) {
    if (!paymentId) return
    setIsProcessing(true)
    setErrorMessage('')

    try {
      // Simulate real-world gateway delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (success) {
        // Call webhook
        await processPaymentCallback({
          paymentId: Number(paymentId),
          gatewayRef: `ZALOPAY-MOCK-${Date.now()}`
        })
        navigate(`/tracking?orderId=${orderId}`, { replace: true })
      } else {
        navigate(`/tracking?orderId=${orderId}&error=payment_cancelled`, { replace: true })
      }
    } catch {
      setErrorMessage('Lỗi xử lý giao dịch. Vui lòng thử lại.')
      setIsProcessing(false)
    }
  }

  if (!paymentId || !orderId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Thiếu thông tin phiên thanh toán.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] font-sans">
      {/* Header ZaloPay */}
      <header className="bg-[#0068FF] text-white p-4 shadow-md flex items-center justify-center relative">
        <h1 className="text-xl font-semibold">ZaloPay Cổng Thanh Toán</h1>
      </header>

      <main className="max-w-md mx-auto mt-8 p-4">
        {/* Hóa đơn */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center border-b border-dashed border-gray-200 pb-6 mb-6">
            <div className="w-16 h-16 bg-[#0068FF] rounded-full flex items-center justify-center text-white mb-4 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-1">Số tiền thanh toán</p>
            <h2 className="text-4xl font-bold text-[#0068FF]">
              {order ? formatCurrency(order.totalAmount) : '...'}
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-medium text-gray-900">{order?.orderCode || `#${orderId}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mã giao dịch ZaloPay</span>
              <span className="font-medium text-gray-900">MOCK-{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nhà cung cấp</span>
              <span className="font-medium text-gray-900">GrabFood Clone</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Nút hành động */}
        <div className="space-y-4">
          <button
            onClick={() => handlePayment(true)}
            disabled={isProcessing}
            className="w-full bg-[#0068FF] text-white rounded-xl py-4 font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Xác nhận thanh toán'
            )}
          </button>
          
          <button
            onClick={() => handlePayment(false)}
            disabled={isProcessing}
            className="w-full bg-white text-[#0068FF] border-2 border-[#0068FF] rounded-xl py-3.5 font-semibold text-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            Hủy giao dịch
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Đây là môi trường giả lập (Sandbox). Không có giao dịch thật nào được thực hiện.
        </p>
      </main>
    </div>
  )
}
