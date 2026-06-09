import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'https://product-management-system-aqwk.onrender.com/api'

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

function UserLoginPage() {
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
      const response = await fetch(`${API_BASE_URL}/auth/user-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'User login failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('email', data.email)
      localStorage.setItem('name', data.name)

      
      window.dispatchEvent(new Event('authChange'))

      setIsError(false)
      setMessage(data.message || 'User login successful.')
      navigate('/user-dashboard')
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
              <h1 className="h3 mb-3">User Login</h1>
             

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="userEmail" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="userEmail"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="userPassword" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="userPassword"
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
                  {isLoading ? 'Logging in...' : 'Login as User'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <Link to="/user-register" className="text-decoration-none">
                  New user? Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default UserLoginPage
