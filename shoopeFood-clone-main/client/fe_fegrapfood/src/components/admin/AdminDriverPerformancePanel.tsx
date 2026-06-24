import { useState } from 'react'
import { getDriverPerformanceMetricsAdmin, revokeDriverPenalty } from '../../services/api/drivers'
import type { DriverPerformanceMetrics } from '../../types'

export default function AdminDriverPerformancePanel() {
  const [driverIdInput, setDriverIdInput] = useState('')
  const [metrics, setMetrics] = useState<DriverPerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const id = Number(driverIdInput)
    if (!id) return

    try {
      setIsLoading(true)
      setErrorMessage(null)
      setFeedback(null)
      const data = await getDriverPerformanceMetricsAdmin(id)
      setMetrics(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không tìm thấy tài xế hoặc có lỗi')
      setMetrics(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRevokePenalty(penaltyId: number) {
    const confirm = window.confirm('Bạn có chắc chắn muốn thu hồi hình phạt này không?')
    if (!confirm) return

    try {
      setIsRevoking(true)
      setErrorMessage(null)
      await revokeDriverPenalty(penaltyId)
      setFeedback('Thu hồi hình phạt thành công.')
      // Refresh metrics
      if (metrics) {
        const updated = await getDriverPerformanceMetricsAdmin(metrics.driverId)
        setMetrics(updated)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể thu hồi hình phạt')
    } finally {
      setIsRevoking(false)
    }
  }

  function renderStatusBadge(value: number, threshold: number, severeThreshold?: number) {
    if (severeThreshold !== undefined && value >= severeThreshold) {
      return <span className="hero-badge" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>Nghiêm trọng</span>
    }
    if (value >= threshold) {
      return <span className="hero-badge" style={{ backgroundColor: 'var(--warning)', color: 'black' }}>Cảnh báo</span>
    }
    return <span className="hero-badge" style={{ backgroundColor: 'var(--success)', color: 'white' }}>Tốt</span>
  }

  return (
    <div className="admin-workspace">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Quản lý Hiệu suất Tài xế</h2>
            <p>Kiểm tra các chỉ số Acceptance Rate (AR), Cancellation Rate (CR), Rating và quản lý Penalties.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-4 mt-4" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="number"
            placeholder="Nhập ID tài xế"
            value={driverIdInput}
            onChange={(e) => setDriverIdInput(e.target.value)}
            className="p-2 border rounded"
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
          />
          <button type="submit" className="button-primary" disabled={isLoading || !driverIdInput}>
            {isLoading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>

        {feedback && <p className="restaurant-feedback success">{feedback}</p>}
        {errorMessage && <p className="app-feedback error">{errorMessage}</p>}

        {metrics && (
          <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {/* AR Card */}
            <div className="admin-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Acceptance Rate (AR)</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(metrics.acceptanceRate.value * 100).toFixed(1)}%</p>
              <p>Chấp nhận: {metrics.acceptanceRate.accepted} / {metrics.acceptanceRate.total}</p>
              <p>Ngưỡng cảnh báo: {(metrics.acceptanceRate.threshold * 100).toFixed(0)}%</p>
              <div style={{ marginTop: '1rem' }}>
                {metrics.acceptanceRate.value < metrics.acceptanceRate.threshold ? (
                   <span className="hero-badge" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>Dưới ngưỡng</span>
                ) : (
                   <span className="hero-badge" style={{ backgroundColor: 'var(--success)', color: 'white' }}>Tốt</span>
                )}
              </div>
            </div>

            {/* CR Card */}
            <div className="admin-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Cancellation Rate (CR)</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(metrics.cancellationRate.value * 100).toFixed(1)}%</p>
              <p>Hủy: {metrics.cancellationRate.cancelled} / Đã nhận: {metrics.cancellationRate.accepted}</p>
              <p>Ngưỡng cảnh báo: {(metrics.cancellationRate.threshold * 100).toFixed(0)}% (Khóa: {(metrics.cancellationRate.severeThreshold * 100).toFixed(0)}%)</p>
              <div style={{ marginTop: '1rem' }}>
                {renderStatusBadge(metrics.cancellationRate.value, metrics.cancellationRate.threshold, metrics.cancellationRate.severeThreshold)}
              </div>
            </div>

            {/* Rating Card */}
            <div className="admin-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Đánh giá (Rating)</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>⭐ {metrics.rating.value.toFixed(2)}</p>
              <p>Dựa trên {metrics.rating.count} lượt đánh giá</p>
              <p>Ngưỡng cảnh báo: {metrics.rating.threshold}</p>
              <div style={{ marginTop: '1rem' }}>
                {metrics.rating.value < metrics.rating.threshold ? (
                  <span className="hero-badge" style={{ backgroundColor: 'var(--warning)', color: 'black' }}>Cần cải thiện</span>
                ) : (
                  <span className="hero-badge" style={{ backgroundColor: 'var(--success)', color: 'white' }}>Tốt</span>
                )}
              </div>
            </div>

            {/* Penalty Status */}
            <div className="admin-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', background: '#fff', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Trạng thái Hình phạt (Penalty)</h3>
              {metrics.penalty && metrics.penalty.endsAt !== null ? (
                <div style={{ background: '#fff3f3', padding: '1rem', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
                  <p style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.1rem' }}>Đang bị phạt: {metrics.penalty.type}</p>
                  <p>Lý do: {metrics.penalty.reason}</p>
                  <p>Bắt đầu: {new Date(metrics.penalty.startsAt).toLocaleString('vi-VN')}</p>
                  <p>Kết thúc: {new Date(metrics.penalty.endsAt).toLocaleString('vi-VN')}</p>
                  <button 
                    type="button" 
                    className="button-primary" 
                    style={{ marginTop: '1rem', background: '#333' }}
                    onClick={() => void handleRevokePenalty(metrics.penalty!.id)}
                    disabled={isRevoking}
                  >
                    {isRevoking ? 'Đang xử lý...' : 'Thu hồi hình phạt'}
                  </button>
                </div>
              ) : (
                <p>Hiện không có hình phạt nào đang áp dụng đối với tài xế này.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
