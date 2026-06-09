require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { ObjectId } = require('mongodb')

const jwt = require('jsonwebtoken')
const { connectDB } = require('./config/db')
const { getAdminCollection } = require('./models/admin.model')
const { getUserCollection } = require('./models/user.model')
const { getProductCollection } = require('./models/product.model')
const { authenticateToken, requireAdmin } = require('./middlewares/auth')

const app = express()
const port = process.env.PORT || 5000
const API_URL = 'https://product-management-system-aqwk.onrender.com'
const frontendUrl = process.env.FRONTEND_URL || 'https://task1-product-management.web.app/'
const allowedOrigins = [
    'https://task1-product.web.app',
    'http://localhost:5173'
]

// Configure multer to store files in memory so the buffer can be accessed
const upload = multer({ storage: multer.memoryStorage() })

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                return callback(null, true)
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true)
            }

            return callback(new Error(`CORS blocked: ${origin}`))
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
)

app.options('*', cors())
app.use(express.json())

app.get('/', (request, response) => {
	response.json({ message: 'Product Management System backend is running' })
})

app.post('/api/auth/admin-login', async (request, response) => {
	const { email, password } = request.body

	if (!email || !password) {
		return response.status(400).json({ message: 'Email and password are required.' })
	}

	try {
		const adminCollection = getAdminCollection()
		const admin = await adminCollection.findOne({ email, password })

		if (!admin) {
			return response.status(401).json({ message: 'Invalid admin credentials.' })
		}

		const token = jwt.sign(
			{ id: admin._id, email: admin.email, role: 'admin', name: admin.name },
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		)

		return response.json({
			message: 'Admin login successful.',
			token,
			role: 'admin',
			email: admin.email,
			name: admin.name,
		})
	} catch (error) {
		return response.status(500).json({ message: 'Unable to process admin login.' })
	}
})

app.post('/api/auth/user-login', async (request, response) => {
	const { email, password } = request.body

	if (!email || !password) {
		return response.status(400).json({ message: 'Email and password are required.' })
	}

	try {
		const userCollection = getUserCollection()
		const user = await userCollection.findOne({ email, password })

		if (!user) {
			return response.status(401).json({ message: 'Invalid email or password.' })
		}

		const token = jwt.sign(
			{ id: user._id, email: user.email, role: 'user', name: user.name },
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		)

		return response.json({
			message: 'User login successful.',
			token,
			role: 'user',
			email: user.email,
			name: user.name,
		})
	} catch (error) {
		return response.status(500).json({ message: 'Unable to process user login.' })
	}
})

app.post('/api/auth/user-register', async (request, response) => {
	const { name, email, password } = request.body

	if (!name || !email || !password) {
		return response.status(400).json({ message: 'Name, email, and password are required.' })
	}

	try {
		const userCollection = getUserCollection()
		const existingUser = await userCollection.findOne({ email })

		if (existingUser) {
			return response.status(409).json({ message: 'User already exists with this email.' })
		}

		const userDocument = {
			name,
			email,
			password,
			createdAt: new Date(),
		}

		const result = await userCollection.insertOne(userDocument)

		return response.status(201).json({
			message: 'User registered successfully.',
			userId: result.insertedId,
			name,
			email,
		})
	} catch (error) {
		return response.status(500).json({ message: 'Unable to register user.' })
	}
})

function serializeProduct(product) {
	return {
		id: product._id,
		name: product.name,
		price: product.price,
		category: product.category,
		image: product.image || null,
		createdAt: product.createdAt,
		updatedAt: product.updatedAt,
	}
}

app.get('/api/products', authenticateToken, async (request, response) => {
	try {
		const productCollection = getProductCollection()
		const products = await productCollection.find({}).sort({ createdAt: -1 }).toArray()

		return response.json(products.map(serializeProduct))
	} catch (error) {
		return response.status(500).json({ message: 'Unable to fetch products.' })
	}
})

app.post('/api/products', authenticateToken, requireAdmin, upload.single('image'), async (request, response) => {
	try {
		const { name, price, category } = request.body

		if (!name || !price || !category) {
			return response.status(400).json({ message: 'Name, price, and category are required.' })
		}

		if (!request.file) {
			return response.status(400).json({ message: 'Product image is required.' })
		}

		const productCollection = getProductCollection()
		const productDocument = {
			name,
			price,
			category,
			image: {
				name: request.file.originalname,
				contentType: request.file.mimetype,
				data: request.file.buffer.toString('base64'),
			},
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		const result = await productCollection.insertOne(productDocument)

		return response.status(201).json({
			message: 'Product created successfully.',
			productId: result.insertedId,
			product: serializeProduct({ ...productDocument, _id: result.insertedId }),
		})
	} catch (error) {
		return response.status(500).json({ message: 'Unable to create product.' })
	}
})

app.put('/api/products/:id', authenticateToken, requireAdmin, upload.single('image'), async (request, response) => {
	try {
		const { id } = request.params
		const { name, price, category } = request.body

		if (!ObjectId.isValid(id)) {
			return response.status(400).json({ message: 'Invalid product id.' })
		}

		if (!name || !price || !category) {
			return response.status(400).json({ message: 'Name, price, and category are required.' })
		}

		const productCollection = getProductCollection()
		const existingProduct = await productCollection.findOne({ _id: new ObjectId(id) })

		if (!existingProduct) {
			return response.status(404).json({ message: 'Product not found.' })
		}

		const updatedProduct = {
			name,
			price,
			category,
			image: request.file
				? {
					name: request.file.originalname,
					contentType: request.file.mimetype,
					data: request.file.buffer.toString('base64'),
				}
				: existingProduct.image,
			updatedAt: new Date(),
		}

		await productCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedProduct })

		return response.json({
			message: 'Product updated successfully.',
			product: serializeProduct({ ...existingProduct, ...updatedProduct, _id: existingProduct._id }),
		})
	} catch (error) {
		return response.status(500).json({ message: 'Unable to update product.' })
	}
})

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (request, response) => {
	try {
		const { id } = request.params

		if (!ObjectId.isValid(id)) {
			return response.status(400).json({ message: 'Invalid product id.' })
		}

		const productCollection = getProductCollection()
		const deleteResult = await productCollection.deleteOne({ _id: new ObjectId(id) })

		if (deleteResult.deletedCount === 0) {
			return response.status(404).json({ message: 'Product not found.' })
		}

		return response.json({ message: 'Product deleted successfully.' })
	} catch (error) {
		return response.status(500).json({ message: 'Unable to delete product.' })
	}
})

async function startServer() {
	try {
		const database = await connectDB()
		const adminCollection = getAdminCollection()
		const userCollection = getUserCollection()
		const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com'
		const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin'
		const defaultAdminName = process.env.ADMIN_NAME || 'Admin'
		const defaultUserEmail = process.env.USER_EMAIL || 'user@gmail.com'
		const defaultUserPassword = process.env.USER_PASSWORD || 'user'
		const defaultUserName = process.env.USER_NAME || 'User'

		const existingAdmin = await adminCollection.findOne({ email: defaultAdminEmail })
		const existingUser = await userCollection.findOne({ email: defaultUserEmail })

		if (!existingAdmin) {
			await adminCollection.insertOne({
				name: defaultAdminName,
				email: defaultAdminEmail,
				password: defaultAdminPassword,
				createdAt: new Date(),
			})
			console.log(`Default admin seeded: ${defaultAdminEmail}`)
		}

		if (!existingUser) {
			await userCollection.insertOne({
				name: defaultUserName,
				email: defaultUserEmail,
				password: defaultUserPassword,
				createdAt: new Date(),
			})
			console.log(`Default user seeded: ${defaultUserEmail}`)
		}

		app.listen(port, () => {
			console.log(`MongoDB connected to database: ${database.databaseName}`)
			console.log(`Server running on port ${port}`)
		})
	} catch (error) {
		console.error('Failed to start server:', error.message)
		process.exit(1)
	}
}

startServer()
