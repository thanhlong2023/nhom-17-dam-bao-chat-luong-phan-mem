import { useCallback, useEffect, useState } from 'react'
import {
  createVoucher,
  deleteVoucher,
  getVouchers,
  updateVoucher,
} from '../../services/api/admin'
import type { Voucher } from '../../types'

const emptyForm: Partial<Voucher> = {
  code: '',
  discountType: 'FIXED',
  discountValue: 0,
  minOrderValue: 0,
  maxDiscountAmount: 0,
  validFrom: new Date().toISOString().slice(0, 16),
  validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  usageLimit: 0,
  isActive: true,
}

export default function AdminVouchersPanel() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<Voucher>>(emptyForm)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getVouchers()
      setVouchers(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách vouchers')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setFeedback(null)
      setErrorMessage(null)

      const payload = { ...form }
      if (payload.usageLimit === 0) payload.usageLimit = null
      if (payload.maxDiscountAmount === 0) payload.maxDiscountAmount = null

      if (form.id) {
        await updateVoucher(form.id, payload)
        setFeedback('Đã cập nhật Voucher thành công')
      } else {
        await createVoucher(payload)
        setFeedback('Đã tạo Voucher mới thành công')
      }

      setIsEditing(false)
      setForm(emptyForm)
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi khi lưu Voucher')
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Voucher này?')) return
    try {
      setFeedback(null)
      setErrorMessage(null)
      await deleteVoucher(id)
      setFeedback('Đã xóa Voucher thành công')
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi khi xóa Voucher')
    }
  }

  function handleEdit(item: Voucher) {
    setForm({
      ...item,
      validFrom: new Date(item.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(item.validUntil).toISOString().slice(0, 16),
    })
    setIsEditing(true)
    setFeedback(null)
    setErrorMessage(null)
  }

  return (
    <div className="admin-workspace">
      <section className="admin-panel" style={{ flex: 1 }}>
        <div className="admin-panel-head">
          <div>
            <h2>Quản lý Mã giảm giá (Vouchers)</h2>
            <p>Tạo và quản lý các chương trình khuyến mãi cho khách hàng.</p>
          </div>
          <button type="button" className="button-secondary" onClick={() => void loadData()} disabled={isLoading}>
            Tải lại
          </button>
        </div>

        {feedback && <p className="restaurant-feedback success">{feedback}</p>}
        {errorMessage && <p className="app-feedback error">{errorMessage}</p>}

        {!isEditing ? (
          <button type="button" className="button-primary mb-4" onClick={() => setIsEditing(true)}>
            + Thêm Voucher mới
          </button>
        ) : null}

        <div className="admin-table-wrap mt-4">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã (Code)</th>
                <th>Loại</th>
                <th>Mức giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Hiệu lực</th>
                <th>Đã dùng / Giới hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td><strong>{item.code}</strong></td>
                  <td>{item.discountType === 'FIXED' ? 'Giảm tiền' : 'Giảm %'}</td>
                  <td>{item.discountValue} {item.discountType === 'PERCENTAGE' ? '%' : 'VND'}</td>
                  <td>{item.minOrderValue} VND</td>
                  <td>
                    <small>
                      Từ: {new Date(item.validFrom).toLocaleDateString('vi-VN')}<br />
                      Đến: {new Date(item.validUntil).toLocaleDateString('vi-VN')}
                    </small>
                  </td>
                  <td>{item.usedCount} / {item.usageLimit || '∞'}</td>
                  <td>
                    {item.isActive ? (
                       <span className="hero-badge" style={{ backgroundColor: 'var(--success)', color: 'white' }}>Active</span>
                    ) : (
                       <span className="hero-badge" style={{ backgroundColor: 'var(--disabled)', color: 'white' }}>Disabled</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="button-secondary" onClick={() => handleEdit(item)}>Sửa</button>
                      <button type="button" className="button-danger" onClick={() => void handleDelete(item.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && <p className="empty-state">Đang tải...</p>}
          {!isLoading && vouchers.length === 0 && <p className="empty-state">Chưa có Voucher nào.</p>}
        </div>
      </section>

      {isEditing && (
        <aside className="admin-form-panel">
          <div className="driver-control-head">
            <h2>{form.id ? 'Sửa Voucher' : 'Thêm Voucher'}</h2>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="restaurant-field">
              <span>Mã Code (Ví dụ: FREESHIP)</span>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
            </label>

            <label className="restaurant-field">
              <span>Loại giảm giá</span>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'FIXED' | 'PERCENTAGE' })}>
                <option value="FIXED">Trừ tiền trực tiếp (VND)</option>
                <option value="PERCENTAGE">Trừ theo phần trăm (%)</option>
              </select>
            </label>

            <label className="restaurant-field">
              <span>Mức giảm (Số tiền hoặc % tùy loại)</span>
              <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} required min="0" />
            </label>

            <label className="restaurant-field">
              <span>Giá trị đơn tối thiểu (VND)</span>
              <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} min="0" />
            </label>

            {form.discountType === 'PERCENTAGE' && (
              <label className="restaurant-field">
                <span>Mức giảm tối đa (VND) - Để 0 nếu ko giới hạn</span>
                <input type="number" value={form.maxDiscountAmount || 0} onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })} min="0" />
              </label>
            )}

            <label className="restaurant-field">
              <span>Từ ngày</span>
              <input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
            </label>

            <label className="restaurant-field">
              <span>Đến ngày</span>
              <input type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required />
            </label>

            <label className="restaurant-field">
              <span>Giới hạn số lần dùng (Để 0 nếu vô hạn)</span>
              <input type="number" value={form.usageLimit || 0} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} min="0" />
            </label>

            <label className="restaurant-checkbox">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <span>Kích hoạt ngay</span>
            </label>

            <div className="restaurant-form-actions mt-4">
              <button type="submit" className="button-primary">Lưu Voucher</button>
              <button type="button" className="button-secondary" onClick={() => { setIsEditing(false); setForm(emptyForm) }}>Hủy</button>
            </div>
          </form>
        </aside>
      )}
    </div>
  )
}
