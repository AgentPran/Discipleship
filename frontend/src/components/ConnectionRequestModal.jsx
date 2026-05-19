import { useState } from 'react'
import Button from './Button'
import { createConnection } from '../api/connections'

const PATHWAYS = [
  { value: 'direct', label: 'Send a direct request', desc: 'I will reach out to them myself.' },
  { value: 'pastoral', label: 'Ask the pastoral team to match us', desc: 'Pastoral team will facilitate.' },
  { value: 'mentor_invite', label: 'Invite as my mentee', desc: 'For mentors inviting a mentee.' },
  { value: 'peer_recommend', label: 'Recommend a peer', desc: 'Invite them to a mentoring group.' },
]

export default function ConnectionRequestModal({ match, onClose, onSent }) {
  const [pathway, setPathway] = useState('direct')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  async function handleSend() {
    setSending(true)
    setError(null)
    try {
      await createConnection({ toUserId: match.user_id, pathway, message })
      onSent?.()
      onClose()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl">
        <h3 className="text-lg font-semibold mb-1">Connect with {match.name}</h3>
        <p className="text-sm text-gray-500 mb-4">Choose how you want to reach out.</p>

        <div className="space-y-2 mb-4">
          {PATHWAYS.map((p) => (
            <label
              key={p.value}
              className={`block border rounded-md p-3 cursor-pointer transition ${
                pathway === p.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="pathway"
                value={p.value}
                checked={pathway === p.value}
                onChange={(e) => setPathway(e.target.value)}
                className="mr-2"
              />
              <span className="font-medium text-sm">{p.label}</span>
              <p className="text-xs text-gray-500 ml-5">{p.desc}</p>
            </label>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal note (optional)"
          className="w-full border border-gray-300 rounded-md p-2 text-sm h-20 resize-none mb-3"
        />

        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send request'}
          </Button>
        </div>
      </div>
    </div>
  )
}
