export default function TagPicker({ tags, selectedIds, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const selected = selectedIds.includes(t.id)
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              selected
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-brand-500'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
