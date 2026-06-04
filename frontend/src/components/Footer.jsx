import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-light mt-4 pt-4 pb-3">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <h2 className="h5 mb-2">Product Management System</h2>
            <p className="text-light-emphasis mb-0">
              Complete workflow for authentication, product operations, search and pagination,
              API integration, and validation.
            </p>
          </div>

          <div className="col-6 col-md-3">
            <h3 className="h6 mb-2">Quick Links</h3>
            <ul className="list-unstyled mb-0">
              <li>
                  <Link to="/" className="text-light text-decoration-none">
                  Home
                  </Link>
              </li>
              
              <li>
                  <Link to="/admin-login" className="text-light text-decoration-none">
                  Admin Login
                  </Link>
              </li>
              <li>
                  <Link to="/user-login" className="text-light text-decoration-none">
                  User Login
                  </Link>
              </li>
              <li>
                <Link to="/user-register" className="text-light text-decoration-none">
                  User Register
                </Link>
              </li>
            </ul>
          </div>

          
        </div>

        <hr className="border-secondary my-3" />
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 small text-light-emphasis">
          <span>Copyright {currentYear} Product Management System</span>
          <span>Built with React and Bootstrap</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
