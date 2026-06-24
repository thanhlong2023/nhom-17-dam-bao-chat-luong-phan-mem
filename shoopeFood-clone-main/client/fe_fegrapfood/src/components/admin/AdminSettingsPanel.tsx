import { useCallback, useEffect, useState } from 'react'
import {
  createSystemSetting,
  deleteSystemSetting,
  getSystemSettings,
  updateSystemSetting,
} from '../../services/api/admin'
import type { SystemSetting } from '../../types'

const emptyForm: Partial<SystemSetting> = {
  key: '',
  value: '',
  description: '',
}

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<SystemSetting>>(emptyForm)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getSystemSettings()
      setSettings(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách cấu hình')
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

      if (form.id) {
        await updateSystemSetting(form.id, form)
        setFeedback('Đã cập nhật cấu hình thành công')
      } else {
        await createSystemSetting(form)
        setFeedback('Đã tạo cấu hình mới thành công')
      }

      setIsEditing(false)
      setForm(emptyForm)
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi khi lưu cấu hình')
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cấu hình này? (Cảnh báo: Có thể ảnh hưởng đến hệ thống)')) return
    try {
      setFeedback(null)
      setErrorMessage(null)
      await deleteSystemSetting(id)
      setFeedback('Đã xóa cấu hình thành công')
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi khi xóa cấu hình')
    }
  }

  function handleEdit(item: SystemSetting) {
    setForm(item)
    setIsEditing(true)
    setFeedback(null)
    setErrorMessage(null)
  }

  return (
    <div className="admin-workspace">
      <section className="admin-panel" style={{ flex: 1 }}>
        <div className="admin-panel-head">
          <div>
            <h2>Cài đặt Hệ thống</h2>
            <p>Quản lý các biến môi trường, tham số tính toán của hệ thống (phí ship, bán kính...).</p>
          </div>
          <button type="button" className="button-secondary" onClick={() => void loadData()} disabled={isLoading}>
            Tải lại
          </button>
        </div>

        {feedback && <p className="restaurant-feedback success">{feedback}</p>}
        {errorMessage && <p className="app-feedback error">{errorMessage}</p>}

        {!isEditing ? (
          <button type="button" className="button-primary mb-4" onClick={() => setIsEditing(true)}>
            + Thêm cấu hình mới
          </button>
        ) : null}

        <div className="admin-table-wrap mt-4">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key (Tên biến)</th>
                <th>Giá trị (Value)</th>
                <th>Mô tả (Description)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.key}</strong></td>
                  <td><code style={{ background: '#eee', padding: '2px 4px', borderRadius: '4px' }}>{item.value}</code></td>
                  <td>{item.description || '-'}</td>
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
          {!isLoading && settings.length === 0 && <p className="empty-state">Chưa có cấu hình nào.</p>}
        </div>
      </section>

      {isEditing && (
        <aside className="admin-form-panel">
          <div className="driver-control-head">
            <h2>{form.id ? 'Sửa Cấu hình' : 'Thêm Cấu hình'}</h2>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="restaurant-field">
              <span>Tên biến (Key) VD: BASE_SHIPPING_FEE</span>
              <input type="text" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })} required disabled={!!form.id} />
            </label>

            <label className="restaurant-field">
              <span>Giá trị (Value)</span>
              <textarea value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required rows={4} />
            </label>

            <label className="restaurant-field">
              <span>Mô tả (Description)</span>
              <input type="text" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>

            <div className="restaurant-form-actions mt-4">
              <button type="submit" className="button-primary">Lưu Cấu hình</button>
              <button type="button" className="button-secondary" onClick={() => { setIsEditing(false); setForm(emptyForm) }}>Hủy</button>
            </div>
          </form>
        </aside>
      )}
    </div>
  )
}
