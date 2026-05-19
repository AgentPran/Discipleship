import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  if (!user) return null

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-brand-600 mr-3">Discipleship</span>
          <NavLink to="/matches" className={linkClass}>Matches</NavLink>
          <NavLink to="/connections" className={linkClass}>Connections</NavLink>
          <NavLink to="/groups" className={linkClass}>Groups</NavLink>
          <NavLink to="/tasks" className={linkClass}>Tasks</NavLink>
          <NavLink to="/profile" className={linkClass}>Profile</NavLink>
          {user.is_pastoral && (
            <NavLink to="/pastoral" className={linkClass}>Pastoral</NavLink>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">{user.name}</span>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
