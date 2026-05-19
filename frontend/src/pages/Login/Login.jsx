import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/Button'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/matches')
    } catch {
      /* error handled in store */
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-brand-600 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-5">Sign in to continue.</p>

        <label className="block mb-3">
          <span className="text-sm text-gray-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-700">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm"
          />
        </label>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          No account? <Link to="/register" className="text-brand-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}
