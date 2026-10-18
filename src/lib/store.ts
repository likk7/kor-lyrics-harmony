import type { Song } from '@/types/song'

const KEY = 'kor-harmony:songs:v1'

function readAll(): Song[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Song[]) : []
  } catch {
    return []
  }
}

function writeAll(songs: Song[]): void {
  localStorage.setItem(KEY, JSON.stringify(songs))
}

export function listSongs(): Song[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getSong(id: string): Song | undefined {
  return readAll().find((s) => s.id === id)
}

export function saveSong(song: Song): void {
  const songs = readAll()
  const idx = songs.findIndex((s) => s.id === song.id)
  if (idx >= 0) songs[idx] = song
  else songs.push(song)
  writeAll(songs)
}

export function deleteSong(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id))
}

export function updateProgress(id: string, progress: number): void {
  const song = getSong(id)
  if (!song) return
  song.progress = progress
  song.updatedAt = Date.now()
  saveSong(song)
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
