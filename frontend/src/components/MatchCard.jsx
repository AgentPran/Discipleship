import Button from './Button'

export default function MatchCard({ match, onConnect }) {
  const { name, age, location, similarity_score, complementarity_score, overall_score, reasoning } = match
  const pct = (v) => `${Math.round(v * 100)}%`

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500">
            {age ? `${age} · ` : ''}{location || 'Location not set'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-gray-400">match</div>
          <div className="text-lg font-bold text-brand-600">{pct(overall_score)}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        {reasoning.shared_character_tags.length > 0 && (
          <Reason
            label="You share these character traits"
            tags={reasoning.shared_character_tags}
            tone="similar"
          />
        )}
        {reasoning.shared_gift_tags.length > 0 && (
          <Reason
            label="You share these gifts"
            tags={reasoning.shared_gift_tags}
            tone="similar"
          />
        )}
        {reasoning.complementary_tags.length > 0 && (
          <Reason
            label="They could help with"
            tags={reasoning.complementary_tags}
            tone="complementary"
          />
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Similarity {pct(similarity_score)} · Complementarity {pct(complementarity_score)}
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-gray-500 italic">
          AI suggests, you decide.
        </span>
        <Button onClick={() => onConnect(match)}>Connect</Button>
      </div>
    </div>
  )
}

function Reason({ label, tags, tone }) {
  const colors = {
    similar: 'bg-brand-50 text-brand-700 border-brand-200',
    complementary: 'bg-amber-50 text-amber-800 border-amber-200',
  }
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className={`text-xs px-2 py-0.5 rounded-full border ${colors[tone]}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
