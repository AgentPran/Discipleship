import client from './client'

export async function register({ email, password, name }) {
  const { data } = await client.post('/auth/register', { email, password, name })
  return data
}

export async function login({ email, password }) {
  // FastAPI's OAuth2PasswordRequestForm expects form-urlencoded body
  const body = new URLSearchParams()
  body.append('username', email)
  body.append('password', password)
  const { data } = await client.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function getMe() {
  const { data } = await client.get('/me')
  return data
}

export async function updateMe(payload) {
  const { data } = await client.patch('/me', payload)
  return data
}
