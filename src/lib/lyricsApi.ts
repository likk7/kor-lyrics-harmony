/** LRCLIB 公开歌词库（免密钥，已允许浏览器跨域） */

const ORIGIN = 'https://lrclib.net'
const PROXY_PREFIX = '/api/lrclib'

export interface LrcTrack {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  instrumental: boolean
  plainLyrics?: string | null
  syncedLyrics?: string | null
}

async function fetchJson(path: string): Promise<unknown> {
  // 优先直连（LRCLIB 允许 CORS），失败时回退到 Vite 代理（防止直连被网络策略拦截）
  try {
    const res = await fetch(`${ORIGIN}${path}`)
    if (res.ok) return await res.json()
  } catch {
    /* 直连失败，走代理 */
  }
  const res = await fetch(`${PROXY_PREFIX}${path}`)
  if (!res.ok) throw new Error(`搜索失败（HTTP ${res.status}）`)
  return await res.json()
}

export async function searchTracks(q: string): Promise<LrcTrack[]> {
  const data = await fetchJson(`/api/search?q=${encodeURIComponent(q)}`)
  if (!Array.isArray(data)) throw new Error('歌词服务返回了异常数据')
  return data as LrcTrack[]
}

export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return ''
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
