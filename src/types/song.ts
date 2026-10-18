/** 歌曲数据模型：一首歌曲 = 标题 + 歌手 + 有效歌词行 */
export interface Song {
  id: string
  title: string
  artist: string
  lines: string[]
  createdAt: number
  updatedAt: number
  /** 跟唱进度：当前句下标 */
  progress: number
}

export interface SongMeta {
  id: string
  title: string
  artist: string
  lineCount: number
  createdAt: number
  updatedAt: number
  progress: number
}
