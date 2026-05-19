import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/Button'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await register({ name, email, password })
      navigate('/onboarding')
    } catch {
      /* error handled in store */
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-brand-600 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-5">Start your discipleship journey.</p>

        <label className="block mb-3">
          <span className="text-sm text-gray-700">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm"
          />
        </label>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm"
          />
        </label>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
