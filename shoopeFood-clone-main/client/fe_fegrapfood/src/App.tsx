import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppRefineProvider } from './refine/RefineProvider'
import { Route, Routes } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import MockPaymentGatewayPage from './pages/MockPaymentGatewayPage'

function App() {
  return (
    <AuthProvider>
      <AppRefineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/mock-gateway/:paymentId" element={<MockPaymentGatewayPage />} />
            <Route path="*" element={<AppRouter />} />
          </Routes>
        </BrowserRouter>
      </AppRefineProvider>
    </AuthProvider>
  )
}

export default App
