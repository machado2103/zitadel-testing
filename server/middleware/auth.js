import { createRemoteJWKSet, jwtVerify } from 'jose'

/**
 * Zitadel Authentication Middleware
 *
 * This middleware validates JWT tokens issued by Zitadel and fetches
 * user profile information from the UserInfo endpoint.
 *
 * Environment Variables Required:
 * - VITE_ZITADEL_ISSUER or ZITADEL_DOMAIN: Zitadel instance URL
 * - VITE_ZITADEL_CLIENT_ID: OAuth client ID for this application
 */

// Load Zitadel configuration from environment variables
const ZITADEL_ISSUER = process.env.VITE_ZITADEL_ISSUER || process.env.ZITADEL_DOMAIN
const ZITADEL_CLIENT_ID = process.env.VITE_ZITADEL_CLIENT_ID

// Validate required environment variables on startup
if (!ZITADEL_ISSUER || !ZITADEL_CLIENT_ID) {
  console.error('Missing required environment variables:')
  console.error('   VITE_ZITADEL_ISSUER or ZITADEL_DOMAIN')
  console.error('   VITE_ZITADEL_CLIENT_ID')
  process.exit(1)
}

// Create JWKS (JSON Web Key Set) for verifying JWT signatures
// JWKS contains Zitadel's public keys used to sign tokens
const JWKS = createRemoteJWKSet(
  new URL(`${ZITADEL_ISSUER}/oauth/v2/keys`)
)

console.log('JWT verification configured')
console.log('   Issuer:', ZITADEL_ISSUER)
console.log('   Client ID:', ZITADEL_CLIENT_ID)

/**
 * Verify JWT token signature and claims
 *
 * Uses Zitadel's public keys (JWKS) to verify the token signature.
 * Also validates issuer and audience claims to prevent token misuse.
 *
 * @param {string} token - JWT access token from Authorization header
 * @returns {Promise<object>} Decoded JWT payload
 * @throws {Error} If token is invalid, expired, or verification fails
 */
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ZITADEL_ISSUER,        // Verify token was issued by our Zitadel instance
      audience: ZITADEL_CLIENT_ID    // Verify token was issued for this application
    })

    return payload
  } catch (error) {
    console.error('JWT verification failed:', error.message)
    throw error
  }
}

/**
 * Fetch user profile information from Zitadel UserInfo endpoint
 *
 * The access token often doesn't contain all user information (name, email).
 * This function makes an additional request to Zitadel's UserInfo endpoint
 * to retrieve the complete user profile.
 *
 * UserInfo endpoint: https://docs.zitadel.com/docs/apis/openidoauth/endpoints#userinfo
 *
 * @param {string} token - Valid access token
 * @returns {Promise<object|null>} User profile data or null on failure
 */
async function getUserInfo(token) {
  try {
    const response = await fetch(`${ZITADEL_ISSUER}/oidc/v1/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`UserInfo request failed: ${response.status}`)
    }

    const userInfo = await response.json()
    return userInfo
  } catch (error) {
    console.error('Error fetching UserInfo:', error.message)
    return null
  }
}

/**
 * Express middleware for Zitadel authentication
 *
 * This middleware:
 * 1. Extracts JWT token from Authorization header
 * 2. Verifies token signature and claims
 * 3. Fetches user profile from UserInfo endpoint
 * 4. Adds user information to req.user for downstream handlers
 *
 * Request flow:
 * Frontend -> Authorization: Bearer <token> -> This middleware -> Route handler
 *
 * After successful authentication, req.user contains:
 * - id: Zitadel user ID (from JWT 'sub' claim)
 * - email: User email address
 * - name: User display name
 * - payload: Full JWT payload for advanced use cases
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const authenticateZitadel = async (req, res, next) => {
  try {
    // Step 1: Extract token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token not provided'
      })
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format. Use: Authorization: Bearer <token>'
      })
    }

    const token = parts[1]

    // Step 2: Verify JWT token signature and claims
    let payload
    try {
      payload = await verifyToken(token)
    } catch (error) {
      console.error('Token verification failed:', error.message)
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      })
    }

    // Step 3: Extract user ID from JWT payload
    const userId = payload.sub

    if (!userId) {
      console.error('Token missing user ID (sub)')
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token does not contain user information'
      })
    }

    // Step 4: Fetch complete user profile from UserInfo endpoint
    const userInfo = await getUserInfo(token)

    let email, name
    if (userInfo) {
      // UserInfo endpoint returned data - use it
      email = userInfo.email || userInfo.preferred_username || `user-${userId}`
      name = userInfo.name || userInfo.given_name || userInfo.preferred_username || 'User'
    } else {
      // Fallback to JWT payload if UserInfo request failed
      email = payload.email || payload.preferred_username || payload.username || `user-${userId}`
      name = payload.name || payload.given_name || payload.preferred_username || 'User'
    }

    // Step 5: Add user information to request object
    // This data is accessible in route handlers as req.user
    req.user = {
      id: userId,
      email,
      name,
      payload  // Include full JWT payload for advanced use cases
    }

    console.log(`${name} authenticated`)

    // Step 6: Continue to next middleware or route handler
    next()

  } catch (error) {
    console.error('Error in authentication middleware:', error)
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error processing authentication'
    })
  }
}

/**
 * Optional authentication middleware
 *
 * Similar to authenticateZitadel, but doesn't block requests without a token.
 * Sets req.user to null if no token is provided.
 *
 * Use this for endpoints that work with or without authentication
 * (e.g., public content with optional personalization).
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    req.user = null
    return next()
  }

  return authenticateZitadel(req, res, next)
}

export default authenticateZitadel
