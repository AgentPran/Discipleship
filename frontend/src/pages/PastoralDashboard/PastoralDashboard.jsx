import { useEffect, useState } from 'react'
import { pendingPastoralRequests, activeGroups } from '../../api/pastoral'

export default function PastoralDashboard() {
  const [requests, setRequests] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const [r, g] = await Promise.all([pendingPastoralRequests(), activeGroups()])
        setRequests(r)
        setGroups(g)
      } catch (e) {
        setError(e.response?.data?.detail || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Pastoral dashboard</h1>

      <section>
        <h2 className="font-semibold text-gray-800 mb-2">
          Pending match requests ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-md p-3">
            Nothing pending right now.
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-md p-3 text-sm">
                <div>User #{r.from_user_id} → user #{r.to_user_id}</div>
                {r.message && <p className="text-gray-600 mt-1">"{r.message}"</p>}
                <div className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-gray-800 mb-2">Active groups ({groups.length})</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-md p-3">
            No groups yet.
          </p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <div key={g.id} className="bg-white border border-gray-200 rounded-md p-3">
                <div className="font-medium">{g.name}</div>
                <div className="text-xs text-gray-500">
                  {g.members.map((m) => `${m.name} (${m.role})`).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
