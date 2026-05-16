import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Tarjetas from './pages/Tarjetas'
import Propietarios from './pages/Propietarios'
import Vehiculos from './pages/Vehiculos'
import { colors } from './styles/theme'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        display: 'flex', height: '100vh', width: '100vw',
        maxWidth: '100vw', background: colors.bgMain, overflow: 'hidden'
      }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: 'auto', height: '100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tarjetas" element={<Tarjetas />} />
            <Route path="/propietarios" element={<Propietarios />} />
            <Route path="/vehiculos" element={<Vehiculos />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}