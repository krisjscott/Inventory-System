import { api } from './client'

export interface AuthUser {
  subject: string
  email: string
  name: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseAuthUser(value: unknown): AuthUser {
  if (
    !isRecord(value) ||
    typeof value.subject !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.name !== 'string'
  ) {
    throw new Error('The sign-in response was incomplete. Please try again.')
  }
  return { subject: value.subject, email: value.email, name: value.name }
}

export const authApi = {
  async currentUser(): Promise<AuthUser> {
    return parseAuthUser(await api.get<unknown>('/auth/me'))
  },
  signOut(): Promise<null> {
    return api.post<null>('/auth/logout')
  },
}
