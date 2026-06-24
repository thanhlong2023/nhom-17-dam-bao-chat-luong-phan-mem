import { useCallback, useEffect, useState } from 'react'
import {
  approveRestaurantChangeRequest,
  getRestaurantChangeRequests,
  rejectRestaurantChangeRequest,
} from '../../services/api/restaurants'
import type { RestaurantChangeRequest } from '../../types'

export default function AdminChangeRequestsPanel() {
  const [requests, setRequests] = useState<RestaurantChangeRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      // Fetch only PENDING change requests
      const data = await getRestaurantChangeRequests('PENDING')
      setRequests(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải yêu cầu thay đổi')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleApprove(id: number) {
    try {
      setActioningId(id)
      setFeedback(null)
      await approveRestaurantChangeRequest(id)
      setFeedback(`Đã duyệt yêu cầu #${id}`)
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể duyệt yêu cầu')
    } finally {
      setActioningId(null)
    }
  }

  async function handleReject(id: number) {
    const reason = window.prompt('Lý do từ chối (tùy chọn):') || undefined
    if (reason === undefined) return // user cancelled prompt

    try {
      setActioningId(id)
      setFeedback(null)
      await rejectRestaurantChangeRequest(id, reason || undefined)
      setFeedback(`Đã từ chối yêu cầu #${id}`)
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể từ chối yêu cầu')
    } finally {
      setActioningId(null)
    }
  }

  function renderPayload(payload: Record<string, unknown>) {
    return (
      <ul className="text-sm list-disc pl-4">
        {Object.entries(payload).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value !== null ? String(value) : 'null'}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="admin-workspace">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Yêu cầu thay đổi thông tin quán</h2>
            <p>Duyệt các thay đổi từ nhà hàng (Merchant) gửi lên trước khi áp dụng.</p>
          </div>
          <button type="button" className="button-secondary" onClick={() => void loadData()} disabled={isLoading}>
            Tải lại
          </button>
        </div>

        {feedback ? <p className="restaurant-feedback success">{feedback}</p> : null}
        {errorMessage ? <p className="app-feedback error">{errorMessage}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nhà hàng</th>
                <th>Người gửi</th>
                <th>Nội dung thay đổi</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>Quán #{item.restaurantId}</td>
                  <td>User #{item.requestedBy}</td>
                  <td>{item.payload ? renderPayload(item.payload) : 'Không có dữ liệu'}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '-'}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="button-primary"
                        disabled={actioningId === item.id}
                        onClick={() => void handleApprove(item.id)}
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        className="button-danger"
                        disabled={actioningId === item.id}
                        onClick={() => void handleReject(item.id)}
                      >
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading ? <p className="empty-state">Đang tải...</p> : null}
          {!isLoading && requests.length === 0 ? (
            <p className="empty-state">Không có yêu cầu thay đổi nào đang chờ duyệt.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
