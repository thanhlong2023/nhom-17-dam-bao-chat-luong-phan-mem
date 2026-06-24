import { BrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { AppRefineProvider } from './refine/RefineProvider'
import { Route, Routes } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
const MockPaymentGatewayPage = lazy(() => import('./pages/MockPaymentGatewayPage'))

function App() {
  return (
    <AuthProvider>
      <AppRefineProvider>
        <BrowserRouter>
          <Suspense fallback={<p className="empty-state">Đang tải trang...</p>}>
            <Routes>
              <Route path="/mock-gateway/:paymentId" element={<MockPaymentGatewayPage />} />
              <Route path="*" element={<AppRouter />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppRefineProvider>
    </AuthProvider>
  )
}

export default App
