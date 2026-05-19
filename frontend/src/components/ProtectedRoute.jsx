import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const { token, user, loadMe } = useAuthStore()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (token && !user) {
      loadMe().finally(() => setChecked(true))
    } else {
      setChecked(true)
    }
  }, [token, user, loadMe])

  if (!token) return <Navigate to="/login" replace />
  if (!checked) return <div className="p-8 text-gray-500">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
