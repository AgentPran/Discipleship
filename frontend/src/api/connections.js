import client from './client'

export async function listConnections() {
  const { data } = await client.get('/connections/')
  return data
}

export async function createConnection({ toUserId, pathway, message }) {
  const { data } = await client.post('/connections/', {
    to_user_id: toUserId,
    pathway,
    message: message || '',
  })
  return data
}

export async function updateConnection(id, status) {
  const { data } = await client.patch(`/connections/${id}`, { status })
  return data
}
