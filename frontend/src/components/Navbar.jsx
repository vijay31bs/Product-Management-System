import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState({
    token: null,
    name: null,
    role: null,
  })

  const checkAuth = () => {
    setAuthState({
      token: localStorage.getItem('token'),
      name: localStorage.getItem('name'),
      role: localStorage.getItem('role'),
    })
  }

  useEffect(() => {
    checkAuth()

    window.addEventListener('authChange', checkAuth)
    return () => {
      window.removeEventListener('authChange', checkAuth)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    checkAuth()
    window.dispatchEvent(new Event('authChange'))
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container py-1">
        <Link className="navbar-brand fw-bold" to="/">
          Product Management System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link className="btn btn-success btn-sm" to="/">
                Home
              </Link>
            </li>

            {authState.token ? (
              <>
                <li className="nav-item">
                  <Link
                    className="btn btn-outline-secondary btn-sm ms-lg-2"
                    to={authState.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <span className="navbar-text small fw-semibold text-dark">
                    Hello, <span className="text-primary">{authState.name}</span> ({authState.role})
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger btn-sm ms-lg-2" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary btn-sm ms-lg-2" to="/admin-login">
                    Admin Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm" to="/user-login">
                    User Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
