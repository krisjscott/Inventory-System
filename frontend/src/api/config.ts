const configuredOrigin = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

/** Backend origin; blank keeps local same-origin Vite proxy behavior. */
export const backendOrigin = configuredOrigin.replace(/\/$/, '')

export function backendUrl(path: string): string {
  return `${backendOrigin}${path}`
}
