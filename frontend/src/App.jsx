import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import HomePage from './pages/HomePage'
import UserRegisterPage from './pages/UserRegisterPage'
import UserLoginPage from './pages/UserLoginPage'
import UserDashboardPage from './pages/UserDashboardPage'


function App() {
  const location = useLocation()
  const showFooter = location.pathname !== '/admin-login' && location.pathname !== '/user-login'

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        <Route path="/user-register" element={<UserRegisterPage />} />
      </Routes>
      

      {showFooter && <Footer />}
    </div>
  )
}

export default App