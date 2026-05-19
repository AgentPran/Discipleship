import client from './client'

export async function listMyGroups() {
  const { data } = await client.get('/groups/')
  return data
}

export async function createGroup({ name, memberIds = [] }) {
  const { data } = await client.post('/groups/', { name, member_ids: memberIds })
  return data
}

export async function getGroup(groupId) {
  const { data } = await client.get(`/groups/${groupId}`)
  return data
}

export async function listPosts(groupId) {
  const { data } = await client.get(`/groups/${groupId}/posts`)
  return data
}

export async function createPost(groupId, { postType, content }) {
  const { data } = await client.post(`/groups/${groupId}/posts`, {
    group_id: groupId,
    post_type: postType,
    content,
  })
  return data
}

export async function reactToPost(groupId, postId, reaction = 'amen') {
  const { data } = await client.post(
    `/groups/${groupId}/posts/${postId}/react`,
    null,
    { params: { reaction } },
  )
  return data
}

export async function checkinPost(groupId, postId) {
  const { data } = await client.post(`/groups/${groupId}/posts/${postId}/checkin`)
  return data
}
