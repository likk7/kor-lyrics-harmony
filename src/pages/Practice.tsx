import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Check, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { getSong, updateProgress } from '@/lib/store'
import { transliterateLine } from '@/lib/romanizer'
import type { Song } from '@/types/song'

export default function Practice() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [song] = useState<Song | null>(() => (id ? (getSong(id) ?? null) : null))
  const [current, setCurrent] = useState(() => song?.progress ?? 0)
  const [showKorean, setShowKorean] = useState(true)
  const [showHanzi, setShowHanzi] = useState(true)
  const [copied, setCopied] = useState(false)
  const activeRef = useRef<HTMLLIElement>(null)

  const lines = useMemo(() => {
    if (!song) return []
    return song.lines.map((korean, i) => ({ korean, hanzi: transliterateLine(korean), i }))
  }, [song])

  const jump = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= lines.length) return
      setCurrent(idx)
      if (id) updateProgress(id, idx)
    },
    [lines.length, id],
  )

  // 键盘翻句：↑/↓ 或 ←/→ 或空格
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        jump(current + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        jump(current - 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current, jump])

  // 当前句自动滚入视野
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [current])

  if (!song) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">没有找到这首歌，可能已被删除</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          返回曲库
        </Button>
      </div>
    )
  }

  const copyHanzi = async () => {
    const text = lines.map((l) => l.hanzi).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast.success('已复制全部谐音歌词')
    } catch {
      toast.error('复制失败：浏览器未授权剪贴板访问')
    }
  }

  const pct = lines.length > 0 ? Math.round(((current + 1) / lines.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-6 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight">{song.title}</h1>
            <p className="truncate text-xs text-muted-foreground">{song.artist || '未知歌手'}</p>
          </div>
          <Badge variant="secondary">
            {current + 1} / {lines.length} 句
          </Badge>
          <Button variant="outline" size="sm" onClick={copyHanzi}>
            {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
            复制谐音
          </Button>
        </div>
        <div className="h-0.5 bg-secondary">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        <div className="mb-5 flex items-center gap-6 rounded-xl border border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Switch id="korean" checked={showKorean} onCheckedChange={setShowKorean} />
            <Label htmlFor="korean" className="text-xs">韩文原文</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="hanzi" checked={showHanzi} onCheckedChange={setShowHanzi} />
            <Label htmlFor="hanzi" className="text-xs">中文谐音</Label>
          </div>
          <div className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Keyboard className="h-3.5 w-3.5" /> 方向键 / 空格翻句，点击任意句跳转
          </div>
        </div>

        <ol className="space-y-2">
          {lines.map((line) => {
            const active = line.i === current
            const passed = line.i < current
            return (
              <li
                key={line.i}
                ref={active ? activeRef : undefined}
                onClick={() => jump(line.i)}
                className={`cursor-pointer rounded-xl border px-5 py-3.5 transition-all ${
                  active
                    ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary))]'
                    : 'border-border/50 hover:border-primary/30'
                } ${passed ? 'opacity-55' : ''}`}
              >
                {showKorean && (
                  <p className={`text-[17px] leading-8 ${active ? 'font-semibold' : ''}`}>{line.korean}</p>
                )}
                {showKorean && showHanzi && <Separator className="my-1.5 opacity-40" />}
                {showHanzi && (
                  <p className={`text-[15px] leading-7 ${active ? 'text-primary' : 'text-primary/70'}`}>{line.hanzi}</p>
                )}
              </li>
            )
          })}
        </ol>

        <div className="sticky bottom-4 mt-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => jump(current - 1)} disabled={current === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-16 text-center text-sm text-muted-foreground">
              {current + 1} / {lines.length}
            </span>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => jump(current + 1)} disabled={current >= lines.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
