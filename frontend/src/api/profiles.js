import client from './client'

export async function getTags(category) {
  const params = category ? { category } : {}
  const { data } = await client.get('/tags', { params })
  return data
}

export async function getProfile() {
  const { data } = await client.get('/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await client.put('/profile', payload)
  return data
}

export async function getUserProfile(userId) {
  const { data } = await client.get(`/users/${userId}/profile`)
  return data
}
