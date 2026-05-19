import { create } from 'zustand'
import * as authApi from '../api/auth'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  loading: false,
  error: null,

  async login({ email, password }) {
    set({ loading: true, error: null })
    try {
      const data = await authApi.login({ email, password })
      localStorage.setItem('access_token', data.access_token)
      set({ user: data.user, token: data.access_token, loading: false })
      return data.user
    } catch (e) {
      set({ error: e.response?.data?.detail || 'Login failed', loading: false })
      throw e
    }
  },

  async register({ email, password, name }) {
    set({ loading: true, error: null })
    try {
      const data = await authApi.register({ email, password, name })
      localStorage.setItem('access_token', data.access_token)
      set({ user: data.user, token: data.access_token, loading: false })
      return data.user
    } catch (e) {
      set({ error: e.response?.data?.detail || 'Registration failed', loading: false })
      throw e
    }
  },

  async loadMe() {
    if (!get().token) return null
    try {
      const user = await authApi.getMe()
      set({ user })
      return user
    } catch {
      set({ user: null, token: null })
      localStorage.removeItem('access_token')
      return null
    }
  },

  async updateMe(payload) {
    const user = await authApi.updateMe(payload)
    set({ user })
    return user
  },

  logout() {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  },
}))
