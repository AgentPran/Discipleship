import client from './client'

export async function pendingPastoralRequests() {
  const { data } = await client.get('/pastoral/pending-requests')
  return data
}

export async function activeGroups() {
  const { data } = await client.get('/pastoral/active-groups')
  return data
}
