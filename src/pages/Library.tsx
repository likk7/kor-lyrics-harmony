import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Music2, Plus, Pencil, Trash2, Play, Search, Loader2, Sparkles, Import, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CloudOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteSong, listSongs, newId, saveSong } from '@/lib/store'
import { splitLyrics, transliterateLine } from '@/lib/romanizer'
import { searchTracks, formatDuration, type LrcTrack } from '@/lib/lyricsApi'
import type { Song } from '@/types/song'

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/* ------------------------------- 在线搜词 ------------------------------- */

type SearchState = 'idle' | 'searching' | 'done' | 'error'

const PAGE_SIZE = 8

function OnlineSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [state, setState] = useState<SearchState>('idle')
  const [error, setError] = useState('')
  const [results, setResults] = useState<LrcTrack[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [page, setPage] = useState(0)

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    setState('searching')
    setError('')
    try {
      const tracks = await searchTracks(q)
      setResults(tracks.filter((t) => !t.instrumental && t.plainLyrics))
      setState('done')
      setExpanded(null)
      setPage(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络异常，请稍后再试')
      setState('error')
    }
  }

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const pageItems = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const rangeStart = results.length === 0 ? 0 : page * PAGE_SIZE + 1
  const rangeEnd = Math.min(results.length, (page + 1) * PAGE_SIZE)

  const importTrack = (track: LrcTrack) => {
    const lines = splitLyrics(track.plainLyrics ?? '')
    if (lines.length === 0) {
      toast.error('这首歌没有可用的纯文本歌词')
      return
    }
    saveSong({
      id: newId(),
      title: track.trackName,
      artist: track.artistName,
      lines,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      progress: 0,
    })
    toast.success(`已导入「${track.trackName}」`)
    navigate('/')
    window.scrollTo({ top: 0 })
  }

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-6 pb-10 pt-14">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">韩语谐音歌词</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            搜一首韩语歌，立刻得到口语化中文谐音，对照跟唱
          </p>
        </div>

        <form onSubmit={doSearch} className="mx-auto mt-7 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-xl pl-9 text-[15px]"
              placeholder="输入歌名或歌手，例如：Spring Day BTS / 사랑"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button className="h-11 rounded-xl px-5" type="submit" disabled={state === 'searching' || !query.trim()}>
            {state === 'searching' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="mr-1 h-4 w-4" />}
            搜歌词
          </Button>
        </form>

        {state === 'error' && (
          <div className="mx-auto mt-4 flex max-w-xl items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <CloudOff className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {state === 'done' && (
          <div className="mx-auto mt-6 max-w-2xl space-y-2">
            {results.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                在线曲库没有找到「{query.trim()}」，可以换个关键词，或
                <Button variant="link" className="h-auto px-1 text-sm" onClick={() => navigate('/import')}>
                  手动粘贴歌词
                </Button>
              </p>
            ) : (
              <>
                <p className="px-1 text-xs text-muted-foreground">
                  共 {results.length} 条结果，第 {rangeStart}–{rangeEnd} 条，点「预览谐音」查看效果
                </p>
                {pageItems.map((track) => {
                  const open = expanded === track.id
                  const previewLines = open ? splitLyrics(track.plainLyrics ?? '').slice(0, 6) : []
                  return (
                    <div key={track.id} className="overflow-hidden rounded-xl border border-border/70 bg-card">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Music2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{track.trackName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {track.artistName}
                            {track.albumName ? ` · ${track.albumName}` : ''}
                            {formatDuration(track.duration) ? ` · ${formatDuration(track.duration)}` : ''}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setExpanded(open ? null : track.id)}>
                          {open ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
                          预览谐音
                        </Button>
                        <Button size="sm" onClick={() => importTrack(track)}>
                          <Import className="mr-1 h-3.5 w-3.5" /> 导入
                        </Button>
                      </div>
                      {open && previewLines.length > 0 && (
                        <div className="border-t border-border/60 bg-background/40 px-4 py-3">
                          <ul className="space-y-3">
                            {previewLines.map((l, i) => (
                              <li key={i}>
                                <p className="text-sm leading-6">{l}</p>
                                <p className="text-sm leading-6 text-primary">{transliterateLine(l)}</p>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-[11px] text-muted-foreground">仅预览前 6 句，导入后可看完整谐音</p>
                        </div>
                      )}
                    </div>
                  )
                })}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-3">
                    <Button variant="outline" size="sm" className="h-8" disabled={page === 0} onClick={() => { setPage(page - 1); setExpanded(null) }}>
                      <ChevronLeft className="h-3.5 w-3.5" /> 上一页
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={i === page ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 w-8 px-0"
                        onClick={() => { setPage(i); setExpanded(null) }}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages - 1} onClick={() => { setPage(page + 1); setExpanded(null) }}>
                      下一页 <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------- 曲库 ------------------------------- */

function SongGrid({ songs, onChanged }: { songs: Song[]; onChanged: () => void }) {
  const navigate = useNavigate()
  const handleDelete = (id: string) => {
    deleteSong(id)
    onChanged()
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
        <Music2 className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">曲库还是空的，搜索一首歌导入，或手动粘贴歌词</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => {
        const pct = song.lines.length > 0 ? Math.round((song.progress / song.lines.length) * 100) : 0
        return (
          <Card key={song.id} className="group relative transition-colors hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-1 text-base">{song.title}</CardTitle>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/import/${song.id}`)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除这首歌？</AlertDialogTitle>
                        <AlertDialogDescription>「{song.title}」的谐音和练习进度都会被删除，无法恢复。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(song.id)}>删除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardDescription className="line-clamp-1">{song.artist || '未知歌手'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{song.lines.length} 句</Badge>
                <span>{formatDate(song.updatedAt)}</span>
                {pct > 0 && <Badge variant="outline">练到 {pct}%</Badge>}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <Button className="w-full" size="sm" onClick={() => navigate(`/practice/${song.id}`)}>
                <Play className="mr-1 h-3.5 w-3.5" /> 开始练唱
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* ------------------------------- 首页 ------------------------------- */

export default function Library() {
  const [songs, setSongs] = useState<Song[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setSongs(listSongs())
  }, [])

  const refresh = () => setSongs(listSongs())

  const hasSongs = songs.length > 0
  const recentSongs = useMemo(() => songs.slice(0, 6), [songs])

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute right-6 top-5 z-10">
        <Button variant="outline" size="sm" onClick={() => navigate('/import')}>
          <Plus className="mr-1 h-3.5 w-3.5" /> 手动导入
        </Button>
      </header>

      <OnlineSearch />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {hasSongs ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
                <Sparkles className="h-4 w-4 text-primary" /> 我的曲库
              </h2>
              <span className="text-xs text-muted-foreground">{songs.length} 首</span>
            </div>
            <SongGrid songs={recentSongs} onChanged={refresh} />
          </>
        ) : (
          <SongGrid songs={[]} onChanged={refresh} />
        )}

        <Separator className="my-10 opacity-50" />
        <p className="text-center text-xs text-muted-foreground">
          在线歌词来自 LRCLIB 公开曲库 · 本地歌曲数据只保存在你的浏览器中，不会上传
        </p>
      </main>
    </div>
  )
}
