import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { APP_NAME } from '../constants/app'
import { AUTH_USER_STORAGE_KEY } from '../constants/auth'
import ImageUrlField from '../components/common/ImageUrlField'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { changePassword, updateProfile } from '../services/api/auth'
import { getMyRestaurants, updateRestaurant } from '../services/api/restaurants'
import { getRestaurantImageUrl, restaurantThumbStyle } from '../utils/restaurantImage'
import { getRoleName } from '../utils/formatters'
import type { Restaurant } from '../types'
import ApplyDriverModal from '../components/partner/ApplyDriverModal'
import ApplyMerchantModal from '../components/partner/ApplyMerchantModal'
import AddressAutocomplete from '../components/common/AddressAutocomplete'
import {
  createSavedAddress,
  deleteSavedAddress,
  getSavedAddresses,
  updateSavedAddress,
} from '../services/api/addresses'
import type { AddressDetail, SavedAddress } from '../types'

export default function ProfilePage() {
  useDocumentTitle(`${APP_NAME} | Hồ sơ`)
  const { user, refreshUser } = useAuth()
  const isMerchant = user?.role === 'MERCHANT'

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false)
  const [savingRestaurantId, setSavingRestaurantId] = useState<number | null>(null)
  const [driverOpen, setDriverOpen] = useState(false)
  const [merchantOpen, setMerchantOpen] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [restaurantFeedback, setRestaurantFeedback] = useState<string | null>(null)
  const [restaurantError, setRestaurantError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [addressText, setAddressText] = useState('')
  const [selectedAddress, setSelectedAddress] = useState<AddressDetail | null>(null)
  const [addressLabel, setAddressLabel] = useState('')
  const [addressNote, setAddressNote] = useState('')
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [addressFeedback, setAddressFeedback] = useState<string | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName)
      setPhone(user.phone)
    }
  }, [user])

  const loadRestaurants = useCallback(async () => {
    if (!isMerchant) {
      return
    }

    try {
      setIsLoadingRestaurants(true)
      setRestaurantError(null)
      const items = await getMyRestaurants()
      setRestaurants(items)
      setImageUrls(
        items.reduce<Record<number, string>>((map, restaurant) => {
          map[restaurant.id] = restaurant.imageUrl ?? ''
          return map
        }, {}),
      )
    } catch (error) {
      setRestaurantError(error instanceof Error ? error.message : 'Không thể tải quán của bạn')
    } finally {
      setIsLoadingRestaurants(false)
    }
  }, [isMerchant])

  useEffect(() => {
    void loadRestaurants()
  }, [loadRestaurants])

  const loadSavedAddresses = useCallback(async () => {
    try {
      setAddressError(null)
      setSavedAddresses(await getSavedAddresses())
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Không thể tải địa chỉ đã lưu')
    }
  }, [])

  useEffect(() => {
    void loadSavedAddresses()
  }, [loadSavedAddresses])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = fullName.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName || !trimmedPhone) {
      setErrorMessage('Họ tên và số điện thoại là bắt buộc')
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage(null)
      setFeedback(null)

      const updated = await updateProfile({ fullName: trimmedName, phone: trimmedPhone })
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(updated))
      await refreshUser()
      setFeedback('Đã cập nhật thông tin cá nhân')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveRestaurantImage(restaurant: Restaurant) {
    try {
      setSavingRestaurantId(restaurant.id)
      setRestaurantError(null)
      setRestaurantFeedback(null)

      const imageUrl = (imageUrls[restaurant.id] ?? '').trim() || null
      await updateRestaurant(restaurant.id, { imageUrl })

      setRestaurantFeedback(`Đã cập nhật hình ảnh cho "${restaurant.name}"`)
      await loadRestaurants()
    } catch (error) {
      setRestaurantError(error instanceof Error ? error.message : 'Không thể cập nhật hình ảnh quán')
    } finally {
      setSavingRestaurantId(null)
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordFeedback(null)
    setPasswordError(null)

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại')
      return
    }

    if (newPassword.length < 6 || newPassword.length > 72) {
      setPasswordError('Mật khẩu mới phải có từ 6 đến 72 ký tự')
      return
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError('Mật khẩu mới phải gồm chữ và số')
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không khớp')
      return
    }

    try {
      setIsChangingPassword(true)
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordFeedback('Đã đổi mật khẩu thành công')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Không thể đổi mật khẩu')
    } finally {
      setIsChangingPassword(false)
    }
  }

  function resetAddressForm() {
    setAddressText('')
    setSelectedAddress(null)
    setAddressLabel('')
    setAddressNote('')
    setEditingAddressId(null)
  }

  async function handleSaveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAddressFeedback(null)
    setAddressError(null)

    if (!selectedAddress || selectedAddress.latitude === null || selectedAddress.longitude === null) {
      setAddressError('Vui lòng chọn một địa chỉ hợp lệ trong danh sách gợi ý')
      return
    }

    const payload = {
      ...selectedAddress,
      label: addressLabel.trim(),
      note: addressNote.trim(),
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    }

    try {
      setIsSavingAddress(true)
      if (editingAddressId) {
        await updateSavedAddress(editingAddressId, payload)
        setAddressFeedback('Đã cập nhật địa chỉ')
      } else {
        await createSavedAddress(payload)
        setAddressFeedback('Đã lưu địa chỉ mới')
      }
      resetAddressForm()
      await loadSavedAddresses()
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Không thể lưu địa chỉ')
    } finally {
      setIsSavingAddress(false)
    }
  }

  async function handleDeleteAddress(address: SavedAddress) {
    if (!window.confirm(`Xóa địa chỉ "${address.label || address.formattedAddress}"?`)) {
      return
    }

    try {
      setAddressError(null)
      await deleteSavedAddress(address.id)
      setAddressFeedback('Đã xóa địa chỉ')
      if (editingAddressId === address.id) {
        resetAddressForm()
      }
      await loadSavedAddresses()
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Không thể xóa địa chỉ')
    }
  }

  return (
    <section className="restaurant-page">
      <div className="restaurant-form-card">
        <span className="hero-badge">Tài khoản</span>
        <h1>Thông tin cá nhân</h1>
        <p>Cập nhật thông tin cá nhân và bảo mật tài khoản.</p>
      </div>

      <div className="restaurant-form-card">
        {user ? (
          <div className="profile-summary">
            <div className="profile-avatar-circle">
              {(user.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <p className="profile-info-name">{user.fullName}</p>
              <span className="profile-info-role">{getRoleName(user.role)}</span>
              <span className="profile-info-rating">
                <span className="star">⭐</span> {user.ratingAvg.toFixed(1)} / 5.0
              </span>
            </div>
          </div>
        ) : null}

        {feedback ? <p className="restaurant-feedback success">{feedback}</p> : null}
        {errorMessage ? <p className="restaurant-feedback error">{errorMessage}</p> : null}

        <form className="restaurant-form" onSubmit={handleSubmit}>
          <div className="restaurant-form-grid">
            <div className="restaurant-field full">
              <label htmlFor="profileFullName">Họ tên</label>
              <input
                id="profileFullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="restaurant-field full">
              <label htmlFor="profilePhone">Số điện thoại</label>
              <input
                id="profilePhone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0900000001"
              />
            </div>
          </div>

          <div className="restaurant-form-actions">
            <button type="submit" className="button-primary" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>

      <div className="restaurant-form-card profile-security-card">
        <span className="hero-badge">Bảo mật</span>
        <h2>Đổi mật khẩu</h2>
        <p>Mật khẩu mới phải có từ 6 đến 72 ký tự, gồm chữ và số.</p>

        {passwordFeedback ? <p className="restaurant-feedback success">{passwordFeedback}</p> : null}
        {passwordError ? <p className="restaurant-feedback error">{passwordError}</p> : null}

        <form className="restaurant-form" onSubmit={handleChangePassword}>
          <div className="restaurant-form-grid profile-password-grid">
            <div className="restaurant-field full">
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input
                id="currentPassword"
                type="password"
                maxLength={72}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
            <div className="restaurant-field">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                id="newPassword"
                type="password"
                maxLength={72}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="restaurant-field">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <input
                id="confirmPassword"
                type="password"
                maxLength={72}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="restaurant-form-actions">
            <button type="submit" className="button-primary" disabled={isChangingPassword}>
              {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>

      <div className="restaurant-form-card">
        <span className="hero-badge">Địa chỉ</span>
        <h2>Địa chỉ đã lưu</h2>
        <p>Lưu địa chỉ nhà, công ty hoặc nơi nhận hàng thường xuyên.</p>

        {addressFeedback ? <p className="restaurant-feedback success">{addressFeedback}</p> : null}
        {addressError ? <p className="restaurant-feedback error">{addressError}</p> : null}

        <form className="restaurant-form" onSubmit={handleSaveAddress}>
          <div className="restaurant-form-grid">
            <label className="restaurant-field">
              <span>Nhãn địa chỉ</span>
              <input value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)} placeholder="Nhà, Công ty..." />
            </label>
            <label className="restaurant-field">
              <span>Ghi chú giao hàng</span>
              <input value={addressNote} onChange={(event) => setAddressNote(event.target.value)} placeholder="Tòa nhà, số tầng..." />
            </label>
            <div className="restaurant-field full">
              <label htmlFor="profileSavedAddress">Địa chỉ</label>
              <AddressAutocomplete
                id="profileSavedAddress"
                value={addressText}
                isSelectionConfirmed={Boolean(selectedAddress)}
                onTextChange={(value) => {
                  setAddressText(value)
                  setSelectedAddress(null)
                }}
                onSelect={(address) => {
                  setSelectedAddress(address)
                  setAddressText(address.formattedAddress)
                }}
                placeholder="Tìm địa chỉ tại Việt Nam"
              />
            </div>
          </div>
          <div className="restaurant-form-actions">
            <button type="submit" className="button-primary" disabled={isSavingAddress}>
              {isSavingAddress ? 'Đang lưu...' : editingAddressId ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
            </button>
            {editingAddressId ? <button type="button" className="button-secondary" onClick={resetAddressForm}>Hủy sửa</button> : null}
          </div>
        </form>

        <div className="profile-restaurant-list">
          {savedAddresses.map((address) => (
            <article key={address.id} className="profile-restaurant-card">
              <div>
                <h3>{address.label || 'Địa chỉ nhận hàng'}</h3>
                <p>{address.formattedAddress}</p>
                {address.note ? <small>{address.note}</small> : null}
              </div>
              <div className="restaurant-form-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setEditingAddressId(address.id)
                    setAddressLabel(address.label)
                    setAddressNote(address.note)
                    setAddressText(address.formattedAddress)
                    setSelectedAddress(address)
                  }}
                >
                  Sửa
                </button>
                <button type="button" className="button-danger" onClick={() => void handleDeleteAddress(address)}>Xóa</button>
              </div>
            </article>
          ))}
          {savedAddresses.length === 0 ? <p className="empty-state">Chưa có địa chỉ nào được lưu.</p> : null}
        </div>
      </div>

      {isMerchant ? (
        <div className="restaurant-form-card">
          <span className="hero-badge">Chủ quán</span>
          <h2>Hình ảnh quán của tôi</h2>
          <p>Dán link URL hình ảnh cho từng quán. Hình ảnh sẽ hiển thị trên trang đặt món sau khi lưu.</p>

          {restaurantFeedback ? <p className="restaurant-feedback success">{restaurantFeedback}</p> : null}
          {restaurantError ? <p className="restaurant-feedback error">{restaurantError}</p> : null}
          {isLoadingRestaurants ? <p className="empty-state">Đang tải quán...</p> : null}

          {!isLoadingRestaurants && restaurants.length === 0 ? (
            <p className="empty-state">Chưa có quán nào được gán. Liên hệ admin để được tạo quán.</p>
          ) : null}

          <div className="profile-restaurant-list">
            {restaurants.map((restaurant) => (
              <article key={restaurant.id} className="profile-restaurant-card">
                <div className="profile-restaurant-card-head">
                  <div
                    className={`profile-restaurant-thumb ${restaurantThumbStyle(restaurant.imageUrl, restaurant.id) ? '' : 'restaurant-thumb--placeholder'}`}
                    style={restaurantThumbStyle(getRestaurantImageUrl(imageUrls[restaurant.id]) ?? restaurant.imageUrl, restaurant.id)}
                  />
                  <div>
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.address || 'Chưa có địa chỉ'}</p>
                  </div>
                </div>

                <ImageUrlField
                  id={`merchantRestaurantImage-${restaurant.id}`}
                  label="Link hình ảnh quán"
                  value={imageUrls[restaurant.id] ?? ''}
                  hint="Dán URL ảnh công khai (jpg, png, webp...)."
                  onChange={(value) =>
                    setImageUrls((current) => ({
                      ...current,
                      [restaurant.id]: value,
                    }))
                  }
                />

                <div className="restaurant-form-actions">
                  <button
                    type="button"
                    className="button-primary"
                    disabled={savingRestaurantId === restaurant.id}
                    onClick={() => void handleSaveRestaurantImage(restaurant)}
                  >
                    {savingRestaurantId === restaurant.id ? 'Đang lưu...' : 'Lưu hình ảnh quán'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {user?.role === 'CUSTOMER' && (
        <div className="restaurant-form-card">
          <span className="hero-badge text-green-600 bg-green-50">Đối tác</span>
          <h2>Trở thành đối tác</h2>
          <p>Trở thành tài xế giao hàng hoặc đăng ký mở nhà hàng cùng chúng tôi.</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold border-0 cursor-pointer transition-all shadow-md hover:shadow-lg flex-1 min-w-[200px]"
              onClick={() => setDriverOpen(true)}
            >
              Đăng ký làm Tài xế
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold border-0 cursor-pointer transition-all shadow-md hover:shadow-lg flex-1 min-w-[200px]"
              onClick={() => setMerchantOpen(true)}
            >
              Đăng ký làm Nhà hàng
            </button>
          </div>
        </div>
      )}

      {/* Driver/Merchant Registration Modals */}
      <ApplyDriverModal isOpen={driverOpen} onClose={() => setDriverOpen(false)} />
      <ApplyMerchantModal isOpen={merchantOpen} onClose={() => setMerchantOpen(false)} />
    </section>
  )
}
