import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'https://product-management-system-aqwk.onrender.com/api'

function UserDashboardPage() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'user') {
      navigate('/user-login')
      return
    }

    loadProducts(token)
  }, [navigate])

  const loadProducts = async (token) => {
    const activeToken = token || localStorage.getItem('token')
    if (!activeToken) return

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`,
        },
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.clear()
        window.dispatchEvent(new Event('authChange'))
        navigate('/user-login')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load products')
      }

      setProducts(data)
      setIsError(false)
      setMessage('')
    } catch (error) {
      setIsError(true)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    if (!search) {
      return products
    }

    return products.filter((product) => {
      const searchableText = [product.name, product.category, product.price]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(search)
    })
  }, [products, searchTerm])

  return (
    <main className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <p className="text-uppercase text-muted small mb-1">User Dashboard</p>
          <h1 className="h3 mb-0">Product Details</h1>
        </div>
        <div className="w-100 w-md-auto" style={{ maxWidth: '420px' }}>
          <input
            type="search"
            className="form-control form-control-lg"
            placeholder="Search products by name, category, or price"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {message ? (
        <div className={`alert ${isError ? 'alert-danger' : 'alert-info'}`}>{message}</div>
      ) : null}

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h2 className="h6 text-muted">Available Products</h2>
              <p className="display-6 mb-0">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h2 className="h6 text-muted">Matching Results</h2>
              <p className="display-6 mb-0">{filteredProducts.length}</p>
            </div>
          </div>
        </div>
        
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Product List</h2>
            <span className="text-muted small">Read-only view from database</span>
          </div>

          {isLoading ? <div className="alert alert-secondary mb-0">Loading products...</div> : null}

          {!isLoading && filteredProducts.length === 0 ? (
            <div className="alert alert-warning mb-0">No products found.</div>
          ) : null}

          {!isLoading && filteredProducts.length > 0 ? (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>
                        {product.image ? (
                          <img
                            src={`data:${product.image.contentType};base64,${product.image.data}`}
                            alt={product.name}
                            className="rounded border"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        ) : (
                          <span className="text-muted small">No image</span>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default UserDashboardPage