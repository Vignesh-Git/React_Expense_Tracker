import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import { Login, Signup } from './pages/Auth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="*" element={<MainLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
