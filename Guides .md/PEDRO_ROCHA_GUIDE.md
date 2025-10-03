# Developer Guide - Zitadel Click Tracker

## Overview

This is a full-stack application demonstrating Zitadel OAuth/OIDC authentication with a Vue 3 frontend and Node.js/Express backend. The app tracks user click events and stores them in a SQLite database.

---

## Project Structure

```
zitadel-testing/
├── server/                      # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js          # SQLite configuration and Promise wrappers
│   ├── middleware/
│   │   └── auth.js              # Zitadel JWT verification middleware
│   ├── routes/
│   │   └── clicks.js            # Click tracking API endpoints
│   ├── services/
│   │   └── clickService.js      # Business logic for clicks
│   └── index.js                 # Express server entry point
│
├── src/                         # Frontend (Vue 3)
│   ├── composables/
│   │   ├── useAuth.js           # Authentication composable
│   │   └── useClickApi.js       # API client composable
│   ├── router/
│   │   └── index.js             # Vue Router configuration
│   ├── views/
│   │   ├── LoginView.vue        # Login page
│   │   └── MainView.vue         # Main app with click button
│   ├── App.vue                  # Root component
│   └── main.js                  # Vue app initialization
│
├── .env                         # Environment variables (NOT in git)
├── clicks.db                    # SQLite database file
├── package.json                 # Dependencies and scripts
└── vite.config.js               # Vite configuration
```

---

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vue Router 4** - Client-side routing
- **@zitadel/vue** - Zitadel authentication SDK
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and dev server

### Backend
- **Node.js + Express** - Server framework
- **SQLite3** - Embedded database
- **jose** - JWT verification library
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

---

## Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│  User   │                │ Frontend│                │  Zitadel │
└────┬────┘                └────┬────┘                └─────┬────┘
     │                          │                           │
     │  1. Click "Login"        │                           │
     ├─────────────────────────>│                           │
     │                          │  2. Redirect to Zitadel   │
     │                          ├──────────────────────────>│
     │                          │                           │
     │                          │  3. User authenticates    │
     │                          │<──────────────────────────┤
     │                          │                           │
     │                          │  4. OAuth callback        │
     │                          │<──────────────────────────┤
     │                          │                           │
     │  5. Redirect to /main    │                           │
     │<─────────────────────────┤                           │
     │                          │                           │

┌─────────┐                ┌─────────┐                ┌──────────┐
│Frontend │                │ Backend │                │  Zitadel │
└────┬────┘                └────┬────┘                └─────┬────┘
     │                          │                           │
     │  6. POST /api/clicks     │                           │
     │     Authorization:       │                           │
     │     Bearer <token>       │                           │
     ├─────────────────────────>│                           │
     │                          │                           │
     │                          │  7. Verify token (JWKS)   │
     │                          ├──────────────────────────>│
     │                          │<──────────────────────────┤
     │                          │                           │
     │                          │  8. Get UserInfo          │
     │                          ├──────────────────────────>│
     │                          │<──────────────────────────┤
     │                          │                           │
     │                          │  9. Save to database      │
     │                          │                           │
     │  10. Return click data   │                           │
     │<─────────────────────────┤                           │
```

---

## Database Schema

### users table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Zitadel user ID (from JWT 'sub' claim)
  email TEXT NOT NULL,              -- User email
  name TEXT,                        -- User display name
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### clicks table
```sql
CREATE TABLE clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,            -- Foreign key to users.id
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Index
```sql
CREATE INDEX idx_clicks_user_id ON clicks(user_id);
```

---

## API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/test` - Test endpoint

### Protected Endpoints (require JWT)
- `POST /api/clicks` - Record a click
- `GET /api/clicks/count` - Get user's total click count
- `GET /api/clicks/history?limit=100` - Get click history
- `GET /api/clicks/stats` - Get global statistics
- `GET /api/clicks/me` - Get user info with click count
- `DELETE /api/clicks/logout` - Delete all user clicks

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Frontend Configuration
VITE_ZITADEL_ISSUER=https://your-instance.zitadel.cloud
VITE_ZITADEL_CLIENT_ID=your_client_id
VITE_API_BASE_URL=http://localhost:3001

# Backend Configuration
PORT=3001
NODE_ENV=development
ZITADEL_DOMAIN=https://your-instance.zitadel.cloud
DB_PATH=./clicks.db
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Production Build

```bash
# Build frontend
npm run build

# Run backend
npm run server
```

---

## Key Implementation Details

### 1. JWT Verification (server/middleware/auth.js)

The backend verifies JWT tokens using Zitadel's public keys (JWKS):

```javascript
const JWKS = createRemoteJWKSet(
  new URL(`${ZITADEL_ISSUER}/oauth/v2/keys`)
)

const { payload } = await jwtVerify(token, JWKS, {
  issuer: ZITADEL_ISSUER,
  audience: ZITADEL_CLIENT_ID
})
```

### 2. UserInfo Endpoint (server/middleware/auth.js)

Since the access token may not contain all user data, we fetch it from UserInfo:

```javascript
const response = await fetch(`${ZITADEL_ISSUER}/oidc/v1/userinfo`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
const userInfo = await response.json()
```

### 3. Promise-based SQLite (server/config/database.js)

SQLite3 uses callbacks by default. We wrap it in Promises:

```javascript
export const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}
```

### 4. Route Protection (src/router/index.js)

Routes with `meta: { authName: 'zitadel' }` are automatically protected:

```javascript
{
  path: '/main',
  name: 'Main',
  component: () => import('../views/MainView.vue'),
  meta: { authName: 'zitadel' }  // Requires authentication
}
```

---

## Zitadel Configuration

In your Zitadel console, ensure:

### 1. Application Settings
- **Application Type:** Web
- **Auth Method:** PKCE
- **Grant Types:** Authorization Code, Refresh Token

### 2. Redirect URIs
Add:
```
http://localhost:5173
http://localhost:5173/
```

### 3. Post Logout URIs
Add:
```
http://localhost:5173/
```

### 4. Token Settings
- Enable PKCE
- Token expiration: Default (3600s)

---

## Database Queries

### View all clicks with user info
```sql
SELECT
  c.clicked_at AS timestamp,
  u.id AS user_id,
  u.name AS user_name,
  u.email,
  (SELECT COUNT(*) FROM clicks c2 WHERE c2.user_id = u.id AND c2.id <= c.id) AS click_number,
  c.id AS click_sequence
FROM clicks c
JOIN users u ON c.user_id = u.id
ORDER BY c.clicked_at DESC
LIMIT 50;
```

### Count clicks per user
```sql
SELECT
  u.name,
  u.email,
  COUNT(c.id) AS total_clicks
FROM users u
LEFT JOIN clicks c ON u.id = c.user_id
GROUP BY u.id
ORDER BY total_clicks DESC;
```

---

## Common Issues & Solutions

### Issue: "Port 5173 already in use"
**Solution:** Kill the process or change port in `vite.config.js`

### Issue: "Invalid or expired token"
**Solution:** Logout and login again. Tokens expire after 1 hour.

### Issue: "CORS error"
**Solution:** Ensure frontend URL is in CORS whitelist (`server/index.js`)

### Issue: "User name shows as 'User'"
**Solution:** Ensure `scope: 'openid profile email'` in `src/main.js` and that UserInfo endpoint is working

---

## Architecture Patterns

### Backend
- **Layered Architecture:** Routes → Services → Database
- **Repository Pattern:** `clickService.js` abstracts database operations
- **Middleware Pattern:** Authentication middleware runs before routes
- **Singleton Pattern:** Single service instance exported

### Frontend
- **Composition API:** Reusable logic in composables
- **Reactive State:** Vue 3 computed and ref
- **Provider/Inject:** Auth instance provided globally
- **Lazy Loading:** Route components loaded on demand

---

## Security Considerations

### Implemented
- JWT signature verification
- Token expiration checking
- CORS restrictions
- SQL injection prevention (prepared statements)
- HTTPS enforcement (in production)

### Production TODOs
- [ ] Add rate limiting
- [ ] Implement request logging
- [ ] Add CSRF protection
- [ ] Use environment-specific secrets
- [ ] Set up SSL/TLS
- [ ] Implement audit logging

---

## Testing

### Backend API Testing
```bash
# Health check
curl http://localhost:3001/health

# Get token from browser console:
# window.$oidcAuth.accessToken

# Record click
curl -X POST http://localhost:3001/api/clicks \
  -H "Authorization: Bearer <token>"

# Get count
curl http://localhost:3001/api/clicks/count \
  -H "Authorization: Bearer <token>"
```

### Database Testing
```bash
# Open SQLite CLI
sqlite3 clicks.db

# Run query
sqlite> SELECT * FROM clicks ORDER BY clicked_at DESC LIMIT 10;
```

---

## Deployment

### Frontend (Vite)
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)
3. Update Zitadel redirect URIs with production URL

### Backend (Node.js)
1. Set `NODE_ENV=production`
2. Deploy to Node.js hosting (Heroku, Railway, DigitalOcean, etc.)
3. Update CORS origins with production URL
4. Use production database (PostgreSQL, MySQL, etc.)

---

## Maintenance

### Logs to Monitor
- User authentication events
- API errors
- Database errors
- Token verification failures

### Database Maintenance
```sql
-- Check database size
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();

-- Vacuum database (compact)
VACUUM;

-- Analyze for query optimization
ANALYZE;
```

---

## Support & Resources

- [Zitadel Documentation](https://zitadel.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Express Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**Last Updated:** 2025-10-03
