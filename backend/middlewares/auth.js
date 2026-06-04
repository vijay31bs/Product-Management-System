const jwt = require('jsonwebtoken')


function authenticateToken(request, response, next) {
  const authHeader = request.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return response.status(401).json({ message: 'Access token required. Please log in.' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return response.status(403).json({ message: 'Invalid or expired session. Please log in again.' })
    }

    request.user = decoded
    next()
  })
}


function requireAdmin(request, response, next) {
  if (!request.user || request.user.role !== 'admin') {
    return response.status(403).json({ message: 'Access denied. Administrator privileges required.' })
  }
  next()
}


function requireUser(request, response, next) {
  if (!request.user || request.user.role !== 'user') {
    return response.status(403).json({ message: 'Access denied. User privileges required.' })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireUser,
}
