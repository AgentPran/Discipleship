import client from './client'

export async function listTasks(status) {
  const params = status ? { status } : {}
  const { data } = await client.get('/tasks/', { params })
  return data
}

export async function createTask({ content, taskType = 'action', sourcePostId, sharedWith = [] }) {
  const { data } = await client.post('/tasks/', {
    content,
    task_type: taskType,
    source_post_id: sourcePostId,
    shared_with: sharedWith,
  })
  return data
}

export async function updateTask(id, payload) {
  const { data } = await client.patch(`/tasks/${id}`, payload)
  return data
}

export async function deleteTask(id) {
  const { data } = await client.delete(`/tasks/${id}`)
  return data
}
