import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/shared/components/Layout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { PensionersPage } from '@/features/pensioners/components/PensionersPage'
import { ConsumptionPage } from '@/features/consumption/components/ConsumptionPage'
import { PaymentsPage } from '@/features/payments/components/PaymentsPage'
import { SettingsPage } from '@/features/settings/components/SettingsPage'

// Placeholder para reportes (Iteración 2)
const ReportsComingSoon = () => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
    <p className="text-lg font-medium">Reportes</p>
    <p className="text-sm mt-1">Disponible en la próxima actualización</p>
  </div>
)

// Rutas de la aplicación — pensionistas y policías
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/pensioners" replace />} />
          <Route path="/pensioners" element={<PensionersPage />} />
          <Route path="/consumption" element={<ConsumptionPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsComingSoon />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
