export function formatDate(value?: string | null): string {
  return value ? new Date(value).toLocaleDateString() : '—'
}

export function formatDateTime(value?: string | null): string {
  return value ? new Date(value).toLocaleString() : '—'
}

export function formatMoney(value?: number | string | null): string {
  return value == null ? '—' : `$${Number(value).toFixed(2)}`
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm"
export function toDateTimeInput(value?: string | null): string {
  return value ? value.slice(0, 16) : ''
}

// Forms keep optional fields as '' (Dui inputs don't accept null); appi expects
// null to clear them. Converts every '' value of a payload to null.
export function emptyToNull<T extends object>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value])
  ) as T
}
