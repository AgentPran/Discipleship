import client from './client'

export async function getMatches({ lookingFor = 'mentor', limit = 20 } = {}) {
  const { data } = await client.get('/matches/', {
    params: { looking_for: lookingFor, limit },
  })
  return data
}
