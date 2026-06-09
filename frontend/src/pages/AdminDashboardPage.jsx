import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'https://product-management-system-aqwk.onrender.com/api'

function AdminDashboardPage() {
  const [products, setProducts] = useState([])
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // New modal and alert states
  const [showModal, setShowModal] = useState(false)
  const [dashboardMessage, setDashboardMessage] = useState('')
  const [isDashboardError, setIsDashboardError] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'admin') {
      navigate('/admin-login')
      return
    }

    loadProducts(token)
  }, [navigate])

  const loadProducts = async (token) => {
    const activeToken = token || localStorage.getItem('token')
    if (!activeToken) return

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`,
        },
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.clear()
        window.dispatchEvent(new Event('authChange'))
        navigate('/admin-login')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load products')
      }

      setProducts(data)
    } catch (error) {
      setIsDashboardError(true)
      setDashboardMessage(error.message)
    }
  }

  const resetForm = () => {
    setProductName('')
    setPrice('')
    setCategory('')
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
    setMessage('')
    setIsError(false)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!productName || !price || !category) {
      setIsError(true)
      setMessage('Please fill in name, price, and category.')
      return
    }

    if (!editingId && !imageFile) {
      setIsError(true)
      setMessage('Please upload a product image.')
      return
    }

    const formData = new FormData()
    formData.append('name', productName)
    formData.append('price', price)
    formData.append('category', category)

    if (imageFile) {
      formData.append('image', imageFile)
    }

    setIsLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        },
      )

      if (response.status === 401 || response.status === 403) {
        localStorage.clear()
        window.dispatchEvent(new Event('authChange'))
        navigate('/admin-login')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save product')
      }

      setIsDashboardError(false)
      setDashboardMessage(data.message || (editingId ? 'Product updated successfully' : 'Product added successfully'))
      await loadProducts()
      resetForm()
      setShowModal(false)
    } catch (error) {
      setIsError(true)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product) => {
    setProductName(product.name)
    setPrice(product.price)
    setCategory(product.category)
    setImagePreview(
      product.image ? `data:${product.image.contentType};base64,${product.image.data}` : '',
    )
    setImageFile(null)
    setEditingId(product.id)
    setMessage('')
    setIsError(false)
    setShowModal(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.clear()
        window.dispatchEvent(new Event('authChange'))
        navigate('/admin-login')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete product')
      }

      setIsDashboardError(false)
      setDashboardMessage(data.message || 'Product deleted successfully')
      await loadProducts()
    } catch (error) {
      setIsDashboardError(true)
      setDashboardMessage(error.message)
    }
  }

  return (
    <main className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin Dashboard</p>
          <h1 className="h3 mb-0">Product Management</h1>
        </div>
        <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-2 mt-3 mt-md-0">
          Admin Session Active
        </span>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-center py-4">
              <h2 className="h6 text-muted mb-1">Total Products</h2>
              <p className="display-5 fw-bold mb-0 text-primary">{products.length}</p>
            </div>
          </div>
        </div>
        
        
      </div>

      {dashboardMessage ? (
        <div className={`alert ${isDashboardError ? 'alert-danger' : 'alert-success'} alert-dismissible fade show border-0 shadow-sm rounded-3 mb-4 d-flex justify-content-between align-items-center`} role="alert">
          <div>{dashboardMessage}</div>
          <button type="button" className="btn-close position-relative shadow-none" onClick={() => setDashboardMessage('')} aria-label="Close" style={{ right: 0, top: 0 }}></button>
        </div>
      ) : null}

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                  <h2 className="h5 mb-1">Product Inventory List</h2>
                  <span className="text-muted small">Manage items using actions below</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2 fw-semibold rounded-3 shadow-sm"
                  onClick={() => {
                    resetForm()
                    setShowModal(true)
                  }}
                >
                  + Add Product
                </button>
              </div>

              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">#</th>
                      <th className="border-0">Image</th>
                      <th className="border-0">Name</th>
                      <th className="border-0">Price</th>
                      <th className="border-0">Category</th>
                      <th className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No products found. Click "+ Add Product" to add one.
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => (
                        <tr key={product.id}>
                          <td>{index + 1}</td>
                          <td>
                            {product.image ? (
                              <img
                                src={`data:${product.image.contentType};base64,${product.image.data}`}
                                alt={product.name}
                                className="rounded border shadow-sm"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              />
                            ) : (
                              <span className="text-muted small">No image</span>
                            )}
                          </td>
                          <td className="fw-semibold">{product.name}</td>
                          <td>{Number(product.price).toLocaleString()}</td>
                          <td>
                            <span className="badge bg-secondary-subtle text-secondary-emphasis px-2.5 py-1.5 rounded-2">
                              {product.category}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-primary px-3"
                                onClick={() => handleEdit(product)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger px-3"
                                onClick={() => handleDelete(product.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          role="dialog"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">{editingId ? 'Edit Product' : 'Add Product'}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-medium" htmlFor="productName">
                      Product Name
                    </label>
                    <input
                      id="productName"
                      type="text"
                      className="form-control rounded-3"
                      value={productName}
                      onChange={(event) => setProductName(event.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium" htmlFor="productPrice">
                      Price
                    </label>
                    <input
                      id="productPrice"
                      type="number"
                      className="form-control rounded-3"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium" htmlFor="productCategory">
                      Category
                    </label>
                    <input
                      id="productCategory"
                      type="text"
                      className="form-control rounded-3"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      placeholder="Enter category"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium" htmlFor="productImage">
                      Product Image
                    </label>
                    <input
                      id="productImage"
                      type="file"
                      className="form-control rounded-3"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {imagePreview ? (
                      <div className="text-center mt-3">
                        <img
                          src={imagePreview}
                          alt="Selected product preview"
                          className="img-fluid rounded border shadow-sm"
                          style={{ maxHeight: '180px', objectFit: 'cover' }}
                        />
                      </div>
                    ) : null}
                  </div>
                  {message ? (
                    <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} py-2 rounded-3`}>
                      {message}
                    </div>
                  ) : null}
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary px-4 rounded-3" 
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 rounded-3" disabled={isLoading}>
                      {isLoading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminDashboardPage
