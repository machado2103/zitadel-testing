import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDatabase } from './config/database.js'
import clicksRouter from './routes/clicks.js'

const app = express()
const PORT = process.env.PORT || 3001

/**
 * ========================================
 * MIDDLEWARE CONFIGURATION
 * ========================================
 */

// CORS - Allow requests from Vue.js frontend
// Configure allowed origins for cross-origin requests
app.use(cors({
  origin: [
    'http://localhost:5173',  // Frontend Vite dev server (default)
    'http://localhost:5174',  // Alternative port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true // Allow cookies and authentication headers
}))

// Body parser - Parse JSON request bodies
app.use(express.json())

// Request logging middleware - Logs all incoming HTTP requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

/**
 * ========================================
 * ROUTES
 * ========================================
 */

// Health check endpoint - Verify server is running
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Click tracking API routes - All protected with Zitadel authentication
app.use('/api/clicks', clicksRouter)

// Test endpoint - Public, no authentication required
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is functional',
    timestamp: new Date().toISOString()
  })
})

// 404 handler - Return helpful error for unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: 'GET /health',
      test: 'GET /api/test',
      clicks: {
        record: 'POST /api/clicks',
        count: 'GET /api/clicks/count',
        history: 'GET /api/clicks/history?limit=100',
        stats: 'GET /api/clicks/stats',
        me: 'GET /api/clicks/me'
      }
    }
  })
})

/**
 * ========================================
 * GLOBAL ERROR HANDLER
 * ========================================
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An error occurred on the server',
    // Include stack trace only in development for security
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

/**
 * ========================================
 * SERVER INITIALIZATION
 * ========================================
 */
const startServer = async () => {
  try {
    console.log('Starting backend server...')
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   Port: ${PORT}`)
    console.log(`   Zitadel: ${process.env.ZITADEL_DOMAIN}`)

    // Initialize SQLite database and create tables if they don't exist
    await initDatabase()
    console.log('Database initialized')

    // Start HTTP server
    app.listen(PORT, () => {
      console.log('')
      console.log('┌─────────────────────────────────────────────┐')
      console.log('│                                             │')
      console.log(`│  Backend running at: http://localhost:${PORT}  │`)
      console.log('│                                             │')
      console.log('│  Available endpoints:                       │')
      console.log(`│  • GET  http://localhost:${PORT}/health           │`)
      console.log(`│  • GET  http://localhost:${PORT}/api/test         │`)
      console.log(`│  • POST http://localhost:${PORT}/api/clicks       │`)
      console.log(`│  • GET  http://localhost:${PORT}/api/clicks/count │`)
      console.log('│                                             │')
      console.log('│  Press Ctrl+C to stop                      │')
      console.log('│                                             │')
      console.log('└─────────────────────────────────────────────┘')
      console.log('')
    })

  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nShutting down server...')
  process.exit(0)
})

// Handle graceful shutdown on SIGTERM (docker/pm2)
process.on('SIGTERM', () => {
  console.log('\nShutting down server...')
  process.exit(0)
})

// Start the server
startServer()
