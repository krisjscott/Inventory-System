import type { ApiErrorBody } from './types'

/**
 * Thrown for any failed API call. `status` is the status the server *intended*
 * to send, which is not always the status it actually sent (see below).
 */
export class ApiError extends Error {
  readonly status: number
  readonly error: string
  readonly fieldErrors: Record<string, string>
  readonly path: string

  constructor(
    status: number,
    error: string,
    message: string,
    fieldErrors: Record<string, string> = {},
    path = '',
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.error = error
    this.fieldErrors = fieldErrors
    this.path = path
  }
}

/**
 * The order-api answers a "not found" lookup with HTTP 200 and an ErrorResponse
 * as the body. Detect that shape so the UI can treat it as the failure it is.
 * None of the success DTOs carry `timestamp`/`error`/`message`/`path`, so this
 * check cannot misfire on a real payload.
 */
function isErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== 'object' || body === null) return false
  const candidate = body as Record<string, unknown>
  return (
    typeof candidate.timestamp === 'string' &&
    typeof candidate.status === 'number' &&
    typeof candidate.error === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.path === 'string'
  )
}

function toApiError(status: number, body: unknown, path: string): ApiError {
  if (isErrorBody(body)) {
    return new ApiError(
      body.status,
      body.error,
      body.message,
      body.fieldErrors ?? {},
      body.path || path,
    )
  }
  return new ApiError(status, 'Request Failed', `Request to ${path} failed.`, {}, path)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(init?.headers)
    if (init?.body) headers.set('Content-Type', 'application/json')
    if (init?.method === 'POST') {
      const csrfResponse = await fetch('/api/auth/csrf')
      const csrf = await csrfResponse.json() as { token: string }
      headers.set('X-XSRF-TOKEN', csrf.token)
    }
    response = await fetch(`/api${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new ApiError(
      0,
      'Network Error',
      'Could not reach the order-api. Start it with `mvn spring-boot:run` and confirm it is listening on port 8080.',
    )
  }

  const raw = await response.text()
  let body: unknown = null
  if (raw) {
    try {
      body = JSON.parse(raw)
    } catch {
      body = raw
    }
  }

  if (!response.ok) throw toApiError(response.status, body, path)
  if (isErrorBody(body)) throw toApiError(response.status, body, path)

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, payload?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: payload === undefined ? undefined : JSON.stringify(payload),
    }),
}
