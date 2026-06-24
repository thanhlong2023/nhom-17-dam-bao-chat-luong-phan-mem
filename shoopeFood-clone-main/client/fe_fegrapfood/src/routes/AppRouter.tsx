import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import RequireAuth from '../components/common/RequireAuth'
import RoleHomeRedirect from '../components/common/RoleHomeRedirect'
import MainLayout from '../layouts/MainLayout'
import AdminTabRedirect from '../components/common/AdminTabRedirect'

const AdminPage = lazy(() => import('../pages/AdminPage'))
const HomePage = lazy(() => import('../pages/HomePage'))
const DriverPage = lazy(() => import('../pages/DriverPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const MerchantMenuPage = lazy(() => import('../pages/MerchantMenuPage'))
const MerchantOrdersPage = lazy(() => import('../pages/MerchantOrdersPage'))
const RestaurantDetailPage = lazy(() => import('../pages/RestaurantDetailPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const TrackingPage = lazy(() => import('../pages/TrackingPage'))
const BrowseRestaurantsPage = lazy(() => import('../pages/BrowseRestaurantsPage'))
const PaymentPage = lazy(() => import('../pages/PaymentPage'))
const QrPaymentPage = lazy(() => import('../pages/QrPaymentPage'))
const PortalPage = lazy(() => import('../pages/PortalPage'))

export default function AppRouter() {
  return (
    <MainLayout>
      <Suspense fallback={<p className="empty-state">Đang tải trang...</p>}>
        <Routes>
        <Route
          path="/"
          element={
            <RoleHomeRedirect>
              <PortalPage />
            </RoleHomeRedirect>
          }
        />
        <Route
          path="/food"
          element={
            <HomePage />
          }
        />
        <Route path="/login" element={<LoginPage role="CUSTOMER" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/merchant/login" element={<LoginPage role="MERCHANT" />} />
        <Route path="/driver/login" element={<LoginPage role="DRIVER" />} />
        <Route path="/admin/login" element={<LoginPage role="ADMIN" />} />
        <Route
          path="/profile"
          element={
            <RequireAuth allowedRoles={['CUSTOMER', 'DRIVER', 'MERCHANT', 'ADMIN']}>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/tracking"
          element={
            <RequireAuth>
              <TrackingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/payment"
          element={
            <RequireAuth allowedRoles={['CUSTOMER']}>
              <PaymentPage />
            </RequireAuth>
          }
        />
        <Route
          path="/payment/qr"
          element={
            <RequireAuth allowedRoles={['CUSTOMER']}>
              <QrPaymentPage />
            </RequireAuth>
          }
        />
        <Route
          path="/driver"
          element={
            <RequireAuth allowedRoles={['DRIVER', 'ADMIN']}>
              <DriverPage />
            </RequireAuth>
          }
        />
        <Route
          path="/merchant/orders"
          element={
            <RequireAuth allowedRoles={['MERCHANT']}>
              <MerchantOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/merchant/menu"
          element={
            <RequireAuth allowedRoles={['MERCHANT']}>
              <MerchantMenuPage />
            </RequireAuth>
          }
        />
        <Route path="/restaurants" element={<BrowseRestaurantsPage />} />
        <Route
          path="/restaurants/new"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <AdminTabRedirect tab="restaurants" action="create" />
            </RequireAuth>
          }
        />
        <Route
          path="/restaurants/:id"
          element={<RestaurantDetailPage />}
        />
        <Route
          path="/restaurants/:id/edit"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <AdminTabRedirect tab="restaurants" />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <AdminPage />
            </RequireAuth>
          }
        />
        </Routes>
      </Suspense>
    </MainLayout>
  )
}
