import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSong, newId, saveSong } from '@/lib/store'
import { splitLyrics, transliterateLine } from '@/lib/romanizer'

const SAMPLE = `사랑해 사랑해
보고 싶어 정말로
오늘도 너만 생각해
하늘 아래 우리 둘이서`

export default function ImportSong() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const song = getSong(id)
    if (song) {
      setTitle(song.title)
      setArtist(song.artist)
      setLyrics(song.lines.join('\n'))
    }
  }, [id])

  const preview = useMemo(() => {
    const lines = splitLyrics(lyrics)
    return lines.slice(0, 6).map((l) => ({ korean: l, hanzi: transliterateLine(l) }))
  }, [lyrics])

  const lineCount = useMemo(() => splitLyrics(lyrics).length, [lyrics])

  const handleSave = () => {
    if (!title.trim()) {
      setError('请填写歌名')
      return
    }
    const lines = splitLyrics(lyrics)
    if (lines.length === 0) {
      setError('请粘贴歌词内容')
      return
    }
    const existing = id ? getSong(id) : undefined
    saveSong({
      id: existing?.id ?? newId(),
      title: title.trim(),
      artist: artist.trim(),
      lines,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      progress: existing && existing.lines.join('\n') === lines.join('\n') ? existing.progress : 0,
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight">{isEdit ? '编辑歌曲' : '添加歌曲'}</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">歌名</Label>
            <Input id="title" placeholder="例如：벚꽃엔딩" value={title} onChange={(e) => { setTitle(e.target.value); setError('') }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist">歌手</Label>
            <Input id="artist" placeholder="例如：버스커 버스커（可留空）" value={artist} onChange={(e) => setArtist(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="lyrics">韩文歌词</Label>
              {!lyrics && (
                <Button variant="link" size="sm" className="h-auto px-0 text-xs" onClick={() => setLyrics(SAMPLE)}>
                  填入示例
                </Button>
              )}
            </div>
            <Textarea
              id="lyrics"
              className="min-h-[320px] resize-y font-mono text-sm leading-7"
              placeholder={`한 줄에 한 소절씩 붙여넣기\n\n지금 만나러 갑니다\n조금 늦었지만 괜찮아요`}
              value={lyrics}
              onChange={(e) => { setLyrics(e.target.value); setError('') }}
            />
            <p className="text-xs text-muted-foreground">已识别 {lineCount} 句，每行一句，空行会自动忽略</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" size="lg" onClick={handleSave}>
            <Save className="mr-1 h-4 w-4" /> 保存到曲库
          </Button>
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> 谐音实时预览
            </CardTitle>
            <CardDescription>口语化谐音，整词优先、逐音节兜底</CardDescription>
          </CardHeader>
          <CardContent>
            {preview.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">粘贴歌词后这里会显示预览</p>
            ) : (
              <ul className="space-y-4">
                {preview.map((p, i) => (
                  <li key={i} className="rounded-lg border border-border/60 p-3">
                    <p className="text-[15px] leading-7">{p.korean}</p>
                    <p className="mt-1 text-sm leading-6 text-primary">{p.hanzi}</p>
                  </li>
                ))}
              </ul>
            )}
            {lineCount > 6 && (
              <Badge variant="secondary" className="mt-4">仅预览前 6 句，共 {lineCount} 句</Badge>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
