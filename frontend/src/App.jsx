import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Tarjetas from './pages/Tarjetas'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', background: '#0D1B2A' }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tarjetas" element={<Tarjetas />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}