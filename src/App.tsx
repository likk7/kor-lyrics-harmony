import { Routes, Route, Navigate } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Library from './pages/Library'
import ImportSong from './pages/ImportSong'
import Practice from './pages/Practice'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/import" element={<ImportSong />} />
        <Route path="/import/:id" element={<ImportSong />} />
        <Route path="/practice/:id" element={<Practice />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  )
}
