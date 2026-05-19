import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Onboarding from './pages/Onboarding/Onboarding'
import Matches from './pages/Matches/Matches'
import Profile from './pages/Profile/Profile'
import Connections from './pages/Connections/Connections'
import Groups from './pages/Group/Groups'
import Group from './pages/Group/Group'
import Tasks from './pages/Tasks/Tasks'
import PastoralDashboard from './pages/PastoralDashboard/PastoralDashboard'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/onboarding"
          element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
        />
        <Route
          path="/matches"
          element={<ProtectedRoute><Matches /></ProtectedRoute>}
        />
        <Route
          path="/connections"
          element={<ProtectedRoute><Connections /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route
          path="/groups"
          element={<ProtectedRoute><Groups /></ProtectedRoute>}
        />
        <Route
          path="/groups/:groupId"
          element={<ProtectedRoute><Group /></ProtectedRoute>}
        />
        <Route
          path="/tasks"
          element={<ProtectedRoute><Tasks /></ProtectedRoute>}
        />
        <Route
          path="/pastoral"
          element={<ProtectedRoute><PastoralDashboard /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/matches" replace />} />
      </Routes>
    </>
  )
}
