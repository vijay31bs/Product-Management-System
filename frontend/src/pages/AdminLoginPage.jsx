import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000/api'

async function readResponseMessage(response, fallbackMessage) {
  const responseText = await response.text()

  if (!responseText) {
    return fallbackMessage
  }

  try {
    const data = JSON.parse(responseText)
    return data.message || fallbackMessage
  } catch {
    return responseText || fallbackMessage
  }
}

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('email', data.email)
      localStorage.setItem('name', data.name)

      // Notify other components (like Navbar) of auth change
      window.dispatchEvent(new Event('authChange'))

      setIsError(false)
      setMessage(data.message || 'Admin login successful.')
      navigate('/admin-dashboard')
    } catch (error) {
      setIsError(true)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 mb-3">Admin Login</h1>
              
             <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="adminEmail" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="adminEmail"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="adminPassword" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="adminPassword"
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                {message ? (
                  <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} py-2`}>
                    {message}
                  </div>
                ) : null}

                <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login as Admin'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AdminLoginPage
