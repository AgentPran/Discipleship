import { useEffect, useState } from 'react'
import { getProfile, getTags, updateProfile } from '../../api/profiles'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/Button'
import TagPicker from '../../components/TagPicker'

export default function Profile() {
  const { user, updateMe } = useAuthStore()
  const [tags, setTags] = useState({ character: [], gift: [], gap: [] })
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const [allTags, p] = await Promise.all([getTags(), getProfile()])
      const grouped = { character: [], gift: [], gap: [] }
      allTags.forEach((t) => grouped[t.category]?.push(t))
      setTags(grouped)
      setProfile(p)
    })()
  }, [])

  if (!profile || !user) return <div className="p-6 text-gray-500">Loading…</div>

  function toggleTag(category, id) {
    setProfile((p) => {
      const key = `${category}_tags`
      const cur = p[key]
      const exists = cur.some((t) => t.id === id)
      const next = exists
        ? cur.filter((t) => t.id !== id)
        : [...cur, tags[category].find((t) => t.id === id)]
      return { ...p, [key]: next }
    })
  }

  async function save() {
    setSaving(true)
    setMsg('')
    try {
      await updateMe({
        age: user.age,
        gender: user.gender,
        location: user.location,
        availability: user.availability,
        is_mentor: user.is_mentor,
        is_mentee: user.is_mentee,
      })
      await updateProfile({
        character_text: profile.character_text,
        gifts_text: profile.gifts_text,
        gap_text: profile.gap_text,
        character_tag_ids: profile.character_tags.map((t) => t.id),
        gift_tag_ids: profile.gift_tags.map((t) => t.id),
        gap_tag_ids: profile.gap_tags.map((t) => t.id),
      })
      setMsg('Saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Your profile</h1>
        <p className="text-sm text-gray-500">Edit how others see you and how we match you.</p>
      </div>

      <Section title="Basic details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" value={user.name} onChange={(v) => updateMe({ name: v })} />
          <Field label="Age" value={user.age || ''} onChange={(v) => updateMe({ age: v ? Number(v) : null })} />
          <Field label="Gender" value={user.gender || ''} onChange={(v) => updateMe({ gender: v })} />
          <Field label="Location" value={user.location || ''} onChange={(v) => updateMe({ location: v })} />
          <Field
            label="Availability"
            value={user.availability || ''}
            onChange={(v) => updateMe({ availability: v })}
          />
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={user.is_mentor}
              onChange={(e) => updateMe({ is_mentor: e.target.checked })}
            />
            I want to mentor
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={user.is_mentee}
              onChange={(e) => updateMe({ is_mentee: e.target.checked })}
            />
            I want to be mentored
          </label>
        </div>
      </Section>

      {['character', 'gift', 'gap'].map((cat) => (
        <Section key={cat} title={titleFor(cat)}>
          <textarea
            value={profile[`${cat === 'gift' ? 'gifts' : cat}_text`]}
            onChange={(e) =>
              setProfile({
                ...profile,
                [`${cat === 'gift' ? 'gifts' : cat}_text`]: e.target.value,
              })
            }
            className="w-full border border-gray-300 rounded-md p-2 text-sm h-20 resize-none mb-3"
          />
          <TagPicker
            tags={tags[cat]}
            selectedIds={profile[`${cat}_tags`].map((t) => t.id)}
            onToggle={(id) => toggleTag(cat, id)}
          />
        </Section>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        {msg && <span className="text-sm text-green-600">{msg}</span>}
      </div>
    </div>
  )
}

function titleFor(cat) {
  return {
    character: 'Character & heart',
    gift: 'Gifts & talents',
    gap: 'The gap you see / need',
  }[cat]
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="font-semibold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm"
      />
    </label>
  )
}
