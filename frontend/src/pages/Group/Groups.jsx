import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyGroups, createGroup } from '../../api/groups'
import Button from '../../components/Button'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  async function load() {
    setLoading(true)
    try {
      setGroups(await listMyGroups())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    await createGroup({ name })
    setName('')
    setCreating(false)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Your groups</h1>
          <p className="text-sm text-gray-500">Spaces to walk together.</p>
        </div>
        <Button onClick={() => setCreating(true)}>New group</Button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-md p-3 mb-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
            autoFocus
          />
          <Button type="submit">Create</Button>
          <Button variant="ghost" type="button" onClick={() => setCreating(false)}>Cancel</Button>
        </form>
      )}

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && groups.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          No groups yet. Create one to get started.
        </div>
      )}

      <div className="space-y-2">
        {groups.map((g) => (
          <Link
            key={g.id}
            to={`/groups/${g.id}`}
            className="block bg-white border border-gray-200 rounded-md p-3 hover:border-brand-500"
          >
            <div className="font-medium text-gray-900">{g.name}</div>
            <div className="text-xs text-gray-500">
              {g.members.length} member{g.members.length === 1 ? '' : 's'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
