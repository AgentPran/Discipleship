import { useEffect, useState } from 'react'
import { getMatches } from '../../api/matches'
import MatchCard from '../../components/MatchCard'
import ConnectionRequestModal from '../../components/ConnectionRequestModal'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [lookingFor, setLookingFor] = useState('mentor')
  const [selected, setSelected] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getMatches({ lookingFor })
      setMatches(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookingFor])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Suggested matches</h1>
          <p className="text-sm text-gray-500">
            AI surfaces possibilities. You and the other person decide.
          </p>
        </div>
        <select
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm bg-white"
        >
          <option value="mentor">Looking for a mentor</option>
          <option value="mentee">Looking for a mentee</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Finding matches…</p>}

      {!loading && matches.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          No matches yet. Try adding more tags to your profile so we can find better suggestions.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((m) => (
          <MatchCard key={m.user_id} match={m} onConnect={setSelected} />
        ))}
      </div>

      {selected && (
        <ConnectionRequestModal
          match={selected}
          onClose={() => setSelected(null)}
          onSent={() => alert('Request sent.')}
        />
      )}
    </div>
  )
}
