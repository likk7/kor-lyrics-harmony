# 韩语谐音歌词

输入韩语歌，自动生成口语化中文谐音歌词，对照跟唱。

- **在线搜词**：接入 LRCLIB 公开歌词库，搜索歌名/歌手直接导入歌词
- **谐音引擎**：韩文音节按 Unicode 规则拆分，整词谐音表 + 音节表 + 音素兜底三级转写（如 `사랑해` → 撒浪嘿）
- **跟唱练习**：韩文/谐音双行对照、逐句高亮、键盘翻句、进度自动保存
- **纯静态部署**：所有逻辑在浏览器运行，数据只存在本地（localStorage），无后端

## 技术栈

React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui

## 本地开发

```bash
npm install
npm run dev
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages。
