import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ES Module compatibility - Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database file path - Defaults to clicks.db in project root
// Can be overridden via DB_PATH environment variable
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', '..', 'clicks.db')

// Create SQLite database connection
// File will be created automatically if it doesn't exist
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message)
  } else {
    console.log('Connected to SQLite database:', DB_PATH)
  }
})

/**
 * Promise-based wrapper functions for SQLite3
 *
 * SQLite3 library uses callbacks by default. These helper functions
 * convert the callback-based API to Promise-based for use with async/await.
 * This makes the code cleaner and easier to work with in modern JavaScript.
 */

/**
 * Execute a SQL query that doesn't return data
 * Used for: INSERT, UPDATE, DELETE, CREATE TABLE
 *
 * @param {string} sql - SQL query to execute
 * @param {array} params - Query parameters (prevents SQL injection)
 * @returns {Promise<{lastID: number, changes: number}>}
 *   - lastID: Last inserted row ID (for INSERT statements)
 *   - changes: Number of rows affected (for UPDATE/DELETE)
 */
export const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        // 'this' context contains lastID and changes
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

/**
 * Get a single row from the database
 * Used for: SELECT queries that return one row (e.g., SELECT ... LIMIT 1)
 *
 * @param {string} sql - SQL query to execute
 * @param {array} params - Query parameters (prevents SQL injection)
 * @returns {Promise<object|undefined>} Single row object or undefined if not found
 */
export const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

/**
 * Get multiple rows from the database
 * Used for: SELECT queries that return multiple rows
 *
 * @param {string} sql - SQL query to execute
 * @param {array} params - Query parameters (prevents SQL injection)
 * @returns {Promise<array>} Array of row objects (empty array if no results)
 */
export const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

/**
 * Initialize database schema
 * Creates tables and indexes if they don't exist
 * Safe to call multiple times - uses CREATE TABLE IF NOT EXISTS
 *
 * Database Schema:
 * - users: Stores Zitadel user information
 * - clicks: Stores individual click events
 * - idx_clicks_user_id: Index for faster queries by user_id
 */
export const initDatabase = async () => {
  try {
    // Users table - Stores authenticated Zitadel users
    // id: Zitadel user ID from JWT 'sub' claim
    // email: User email from Zitadel UserInfo endpoint
    // name: User display name from Zitadel UserInfo endpoint
    // created_at: Timestamp when user first accessed the app
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Table "users" initialized')

    // Clicks table - Stores individual click events
    // id: Auto-incrementing unique click ID
    // user_id: Foreign key to users.id (Zitadel user ID)
    // clicked_at: Timestamp when the click occurred
    await runAsync(`
      CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log('Table "clicks" initialized')

    // Index on user_id for faster queries
    // Improves performance when filtering clicks by user
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_clicks_user_id ON clicks(user_id)
    `)
    console.log('Indexes created')

  } catch (error) {
    console.error('Error initializing database:', error.message)
    throw error
  }
}

export default db
