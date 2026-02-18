import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/context/ToastContext'
import Layout from '@/components/Layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Calls from '@/pages/Calls'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
