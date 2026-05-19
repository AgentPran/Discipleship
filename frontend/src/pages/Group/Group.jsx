import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGroup, listPosts, createPost, reactToPost, checkinPost } from '../../api/groups'
import { createTask } from '../../api/tasks'
import Button from '../../components/Button'

const POST_TYPES = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'event', label: 'Event' },
  { value: 'activity', label: 'Activity' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'reflection', label: 'Reflection' },
  { value: 'praise_report', label: 'Praise report' },
]

export default function Group() {
  const { groupId } = useParams()
  const [group, setGroup] = useState(null)
  const [posts, setPosts] = useState([])
  const [type, setType] = useState('meeting')
  const [content, setContent] = useState('')

  async function load() {
    const [g, p] = await Promise.all([getGroup(groupId), listPosts(groupId)])
    setGroup(g)
    setPosts(p)
  }

  useEffect(() => { load() }, [groupId])

  async function submit(e) {
    e.preventDefault()
    if (!content.trim()) return
    await createPost(groupId, { postType: type, content })
    setContent('')
    load()
  }

  async function react(p) {
    await reactToPost(groupId, p.id, 'amen')
    load()
  }

  async function checkin(p) {
    await checkinPost(groupId, p.id)
    load()
  }

  async function addToTasks(p, taskType) {
    await createTask({
      content: p.content.slice(0, 200),
      taskType,
      sourcePostId: p.id,
    })
    alert(`Added to your ${taskType === 'prayer' ? 'prayer list' : 'task list'}.`)
  }

  if (!group) return <div className="p-6 text-gray-500">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
        <p className="text-sm text-gray-500">
          {group.members.map((m) => m.name).join(' · ')}
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
        <div className="flex gap-2 mb-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm bg-white"
          >
            {POST_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a meeting, prayer, reflection…"
          className="w-full border border-gray-300 rounded-md p-2 text-sm h-20 resize-none"
        />
        <div className="flex justify-end mt-2">
          <Button type="submit">Post</Button>
        </div>
      </form>

      <div className="space-y-3">
        {posts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
            No posts yet. Share the first thing.
          </div>
        )}
        {posts.map((p) => (
          <article key={p.id} className="bg-white border border-gray-200 rounded-lg p-3">
            <header className="flex justify-between items-baseline mb-1">
              <span className="font-medium text-sm">{p.author_name}</span>
              <span className="text-xs uppercase text-gray-400 tracking-wide">{p.post_type}</span>
            </header>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.content}</p>
            <footer className="mt-3 flex flex-wrap gap-2 text-xs">
              <ActionBtn onClick={() => react(p)} active={p.has_reacted}>
                🙏 Amen ({p.reaction_count})
              </ActionBtn>
              {p.post_type === 'meeting' && (
                <ActionBtn onClick={() => checkin(p)} active={p.has_attended}>
                  👋 I was here ({p.attendance_count})
                </ActionBtn>
              )}
              <ActionBtn onClick={() => addToTasks(p, 'action')}>+ My task list</ActionBtn>
              <ActionBtn onClick={() => addToTasks(p, 'prayer')}>+ My prayer list</ActionBtn>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}

function ActionBtn({ children, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded border text-xs transition ${
        active
          ? 'bg-brand-500 text-white border-brand-500'
          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-500'
      }`}
    >
      {children}
    </button>
  )
}
