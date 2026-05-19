import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getTags, updateProfile } from '../../api/profiles'
import Button from '../../components/Button'
import TagPicker from '../../components/TagPicker'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateMe } = useAuthStore()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Basic details
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState('')
  const [isMentor, setIsMentor] = useState(false)
  const [isMentee, setIsMentee] = useState(true)

  // Soft features
  const [characterText, setCharacterText] = useState('')
  const [giftsText, setGiftsText] = useState('')
  const [gapText, setGapText] = useState('')

  // Tags
  const [tags, setTags] = useState({ character: [], gift: [], gap: [] })
  const [selected, setSelected] = useState({ character: [], gift: [], gap: [] })

  useEffect(() => {
    (async () => {
      const all = await getTags()
      const grouped = { character: [], gift: [], gap: [] }
      all.forEach((t) => grouped[t.category]?.push(t))
      setTags(grouped)
    })()
  }, [])

  useEffect(() => {
    if (user) {
      setAge(user.age || '')
      setGender(user.gender || '')
      setLocation(user.location || '')
      setAvailability(user.availability || '')
      setIsMentor(user.is_mentor)
      setIsMentee(user.is_mentee)
    }
  }, [user])

  function toggle(category, id) {
    setSelected((s) => {
      const cur = s[category]
      return {
        ...s,
        [category]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
      }
    })
  }

  async function finish() {
    setSaving(true)
    try {
      await updateMe({
        age: age ? Number(age) : null,
        gender: gender || null,
        location: location || null,
        availability: availability || null,
        is_mentor: isMentor,
        is_mentee: isMentee,
      })
      await updateProfile({
        character_text: characterText,
        gifts_text: giftsText,
        gap_text: gapText,
        character_tag_ids: selected.character,
        gift_tag_ids: selected.gift,
        gap_tag_ids: selected.gap,
      })
      navigate('/matches')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { title: 'About you', render: renderBasics },
    { title: 'Your character & heart', render: renderCharacter },
    { title: 'Your gifts & talents', render: renderGifts },
    { title: 'The gap you see / need', render: renderGap },
  ]

  function renderBasics() {
    return (
      <div className="space-y-3">
        <Input label="Age" type="number" value={age} onChange={setAge} />
        <Input label="Gender" value={gender} onChange={setGender} />
        <Input label="Location" value={location} onChange={setLocation} />
        <Input
          label="Availability (e.g. weekday evenings)"
          value={availability}
          onChange={setAvailability}
        />
        <div className="flex gap-4 pt-2">
          <Toggle label="I want to mentor" checked={isMentor} onChange={setIsMentor} />
          <Toggle label="I want to be mentored" checked={isMentee} onChange={setIsMentee} />
        </div>
      </div>
    )
  }

  function renderCharacter() {
    return (
      <div className="space-y-3">
        <TextArea
          label="Tell us about your character & heart — what you love, your passions, your personality."
          value={characterText}
          onChange={setCharacterText}
        />
        <div>
          <p className="text-sm text-gray-700 mb-2">Pick traits that describe you:</p>
          <TagPicker
            tags={tags.character}
            selectedIds={selected.character}
            onToggle={(id) => toggle('character', id)}
          />
        </div>
      </div>
    )
  }

  function renderGifts() {
    return (
      <div className="space-y-3">
        <TextArea
          label="What are you good at? What gifts / talents do you operate in?"
          value={giftsText}
          onChange={setGiftsText}
        />
        <div>
          <p className="text-sm text-gray-700 mb-2">Pick your gifts:</p>
          <TagPicker
            tags={tags.gift}
            selectedIds={selected.gift}
            onToggle={(id) => toggle('gift', id)}
          />
        </div>
      </div>
    )
  }

  function renderGap() {
    return (
      <div className="space-y-3">
        <TextArea
          label="What gap do you see and care about? Where do you need help, or want to help others?"
          value={gapText}
          onChange={setGapText}
        />
        <div>
          <p className="text-sm text-gray-700 mb-2">Pick the gaps that resonate:</p>
          <TagPicker
            tags={tags.gap}
            selectedIds={selected.gap}
            onToggle={(id) => toggle('gap', id)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="text-sm text-gray-500">Step {step + 1} of {steps.length}</div>
        <h1 className="text-2xl font-semibold text-gray-900">{steps[step].title}</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        {steps[step].render()}
      </div>

      <div className="flex justify-between mt-5">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        ) : (
          <Button onClick={finish} disabled={saving}>
            {saving ? 'Saving…' : 'Finish'}
          </Button>
        )}
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm"
      />
    </label>
  )
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm h-24 resize-none"
      />
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
