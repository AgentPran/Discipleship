import { useEffect, useState } from 'react'
import { listTasks, updateTask, deleteTask, createTask } from '../../api/tasks'
import Button from '../../components/Button'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState('action')

  async function load() {
    setLoading(true)
    try {
      setTasks(await listTasks())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function add(e) {
    e.preventDefault()
    if (!newContent.trim()) return
    await createTask({ content: newContent, taskType: newType })
    setNewContent('')
    load()
  }

  async function complete(t) {
    await updateTask(t.id, { status: 'completed' })
    load()
  }

  async function uncomplete(t) {
    await updateTask(t.id, { status: 'pending' })
    load()
  }

  async function remove(t) {
    await deleteTask(t.id)
    load()
  }

  const pending = tasks.filter((t) => t.status === 'pending')
  const completed = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Your list</h1>
        <p className="text-sm text-gray-500">
          Add action points and prayer subjects. Check out when done — share praise reports.
        </p>
      </div>

      <form onSubmit={add} className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex gap-2">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm bg-white"
        >
          <option value="action">Action</option>
          <option value="prayer">Prayer</option>
        </select>
        <input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Add something to your list…"
          className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
        />
        <Button type="submit">Add</Button>
      </form>

      {loading && <p className="text-gray-500">Loading…</p>}

      <h2 className="font-semibold text-gray-800 mt-4 mb-2">In progress ({pending.length})</h2>
      <div className="space-y-2 mb-6">
        {pending.length === 0 && <Empty text="Nothing in your list right now." />}
        {pending.map((t) => (
          <Row key={t.id} t={t} onComplete={complete} onRemove={remove} />
        ))}
      </div>

      <h2 className="font-semibold text-gray-800 mt-4 mb-2">Completed ({completed.length})</h2>
      <div className="space-y-2">
        {completed.length === 0 && <Empty text="No completed items yet." />}
        {completed.map((t) => (
          <Row key={t.id} t={t} done onUncomplete={uncomplete} onRemove={remove} />
        ))}
      </div>
    </div>
  )
}

function Empty({ text }) {
  return <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-md p-3">{text}</p>
}

function Row({ t, done, onComplete, onUncomplete, onRemove }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 flex justify-between items-start gap-3">
      <div>
        <span className={`text-xs uppercase mr-2 ${t.task_type === 'prayer' ? 'text-amber-600' : 'text-brand-600'}`}>
          {t.task_type}
        </span>
        <span className={done ? 'line-through text-gray-400' : 'text-gray-800'}>{t.content}</span>
      </div>
      <div className="flex gap-2 shrink-0">
        {!done && (
          <Button onClick={() => onComplete(t)}>
            ✓ Complete
          </Button>
        )}
        {done && (
          <Button variant="ghost" onClick={() => onUncomplete(t)}>↩ Reopen</Button>
        )}
        <Button variant="ghost" onClick={() => onRemove(t)}>✕</Button>
      </div>
    </div>
  )
}
