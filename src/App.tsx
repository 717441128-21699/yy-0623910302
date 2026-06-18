import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import EventEntry from '@/pages/EventEntry'
import SentimentScan from '@/pages/SentimentScan'
import ResponseDraft from '@/pages/ResponseDraft'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/event-entry" replace />} />
          <Route path="/event-entry" element={<EventEntry />} />
          <Route path="/sentiment-scan" element={<SentimentScan />} />
          <Route path="/response-draft" element={<ResponseDraft />} />
        </Route>
      </Routes>
    </Router>
  )
}
