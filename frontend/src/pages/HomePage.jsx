import productImg from '../assets/product.jpg'

function HomePage() {
  return (
    <>
      <header id="home" className="py-5 bg-primary text-white">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <p className="text-uppercase fw-semibold small mb-2"></p>
              <h1 className="display-5 fw-bold mb-3">Product Management System</h1>
              <p className="lead mb-4">
                Welcome to All
              </p>
             
            </div>
          </div>
        </div>
      </header>
       
      <main className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg overflow-hidden rounded-4">
              <img 
                src={productImg} 
                alt="Product Management Showcase" 
                className="img-fluid w-100" 
                style={{ 
                  maxHeight: '500px', 
                  objectFit: 'cover'
                }} 
              />
            </div>
          </div>
        </div>
      </main>
      
    </>
  )
}

export default HomePage
