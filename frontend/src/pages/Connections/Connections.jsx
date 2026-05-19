import { useEffect, useState } from 'react'
import { listConnections, updateConnection } from '../../api/connections'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/Button'

const PATHWAY_LABELS = {
  direct: 'Direct',
  pastoral: 'Pastoral team',
  mentor_invite: 'Mentor invite',
  peer_recommend: 'Peer recommendation',
}

export default function Connections() {
  const { user } = useAuthStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setItems(await listConnections())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function act(id, status) {
    await updateConnection(id, status)
    load()
  }

  const incoming = items.filter((c) => c.to_user_id === user?.id)
  const outgoing = items.filter((c) => c.from_user_id === user?.id)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Your connections</h1>
      {loading && <p className="text-gray-500">Loading…</p>}

      <Section title="Incoming requests">
        {incoming.length === 0 && <Empty text="No incoming requests." />}
        {incoming.map((c) => (
          <Row key={c.id} c={c} you="recipient" onAct={act} />
        ))}
      </Section>

      <Section title="Sent requests">
        {outgoing.length === 0 && <Empty text="No sent requests." />}
        {outgoing.map((c) => (
          <Row key={c.id} c={c} you="sender" onAct={act} />
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-semibold text-gray-800 mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Empty({ text }) {
  return <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-md p-3">{text}</p>
}

function Row({ c, you, onAct }) {
  const otherId = you === 'recipient' ? c.from_user_id : c.to_user_id
  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 flex justify-between items-center">
      <div>
        <div className="text-sm font-medium">
          {you === 'recipient' ? 'From' : 'To'} user #{otherId}
          <span className="ml-2 text-xs text-gray-500">{PATHWAY_LABELS[c.pathway]}</span>
        </div>
        {c.message && <p className="text-sm text-gray-600 mt-1">"{c.message}"</p>}
        <div className="text-xs text-gray-400 mt-1">Status: {c.status}</div>
      </div>
      <div className="flex gap-2">
        {c.status === 'pending' && you === 'recipient' && (
          <>
            <Button onClick={() => onAct(c.id, 'accepted')}>Accept</Button>
            <Button variant="ghost" onClick={() => onAct(c.id, 'declined')}>Decline</Button>
          </>
        )}
        {c.status === 'pending' && you === 'sender' && (
          <Button variant="ghost" onClick={() => onAct(c.id, 'cancelled')}>Cancel</Button>
        )}
      </div>
    </div>
  )
}
