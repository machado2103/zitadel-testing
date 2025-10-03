# 🚀 Node.js Backend - Click Tracker API

REST API backend for managing authenticated user clicks with Zitadel.

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Backend](#running-the-backend)
- [API Endpoints](#api-endpoints)
- [Testing Endpoints](#testing-endpoints)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- ✅ JWT Authentication with Zitadel using `@zitadel/node`
- ✅ SQLite3 database for click storage
- ✅ REST API with Express.js
- ✅ CORS configured for Vue.js frontend
- ✅ Automatic user management
- ✅ Complete click history per user
- ✅ Global statistics

---

## 🛠️ Technologies

- **Node.js** + **Express.js** - Backend framework
- **SQLite3** - Database
- **@zitadel/node** - Zitadel authentication
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
- **Nodemon** - Hot reload in development

---

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # SQLite config + async functions
├── middleware/
│   └── auth.js              # Zitadel authentication middleware
├── routes/
│   └── clicks.js            # Click API routes
├── services/
│   └── clickService.js      # Business logic
└── index.js                 # Main Express server
```

---

## 📦 Installation

### 1. **Dependencies Already Installed**

All required dependencies are already installed:

```bash
# Check package.json
cat package.json
```

If you need to reinstall:

```bash
npm install
```

---

## ⚙️ Configuration

### 1. **`.env` File**

The `.env` file in the project root already contains the necessary configuration:

```env
# ===== BACKEND CONFIGURATION =====
PORT=3001
NODE_ENV=development

# Zitadel Backend API Configuration
ZITADEL_DOMAIN=https://test-qgqmqq.us1.zitadel.cloud
ZITADEL_API_CLIENT_ID=340439932633904189
ZITADEL_API_KEY_PATH=./zitadel-api-key.json

# Database
DB_PATH=./clicks.db
```

### 2. **Zitadel API Key**

The `zitadel-api-key.json` file must be in the project root.

✅ **Already configured** - File loaded and protected in `.gitignore`

⚠️ **NEVER commit this file!**

---

## 🚀 Running the Backend

### **Development Mode** (with hot reload):

```bash
npm run server:dev
```

### **Production Mode**:

```bash
npm run server
```

### **Expected Output**:

```
🚀 Starting backend server...
   Environment: development
   Port: 3001
   Zitadel: https://test-qgqmqq.us1.zitadel.cloud
✅ Zitadel API key loaded: 340439932633904189
✅ Connected to SQLite database: ./clicks.db
✅ Table "users" initialized
✅ Table "clicks" initialized
✅ Indexes created

┌─────────────────────────────────────────────┐
│                                             │
│  ✅ Backend running at: http://localhost:3001  │
│                                             │
│  Available endpoints:                       │
│  • GET  http://localhost:3001/health           │
│  • GET  http://localhost:3001/api/test         │
│  • POST http://localhost:3001/api/clicks       │
│  • GET  http://localhost:3001/api/clicks/count │
│                                             │
│  Press Ctrl+C to stop                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

All endpoints (except `/health` and `/api/test`) **require authentication**.

### **Authentication Header**:

```http
Authorization: Bearer <ZITADEL_JWT_TOKEN>
```

---

### **1. Health Check** (Public)

```http
GET http://localhost:3001/health
```

**Response**:

```json
{
  "status": "ok",
  "message": "Backend is running!",
  "timestamp": "2025-10-02T15:30:00.000Z",
  "environment": "development"
}
```

---

### **2. Test** (Public)

```http
GET http://localhost:3001/api/test
```

**Response**:

```json
{
  "success": true,
  "message": "API is functional!",
  "timestamp": "2025-10-02T15:30:00.000Z"
}
```

---

### **3. Record Click** (Authenticated)

```http
POST http://localhost:3001/api/clicks
Authorization: Bearer <TOKEN>
```

**Response**:

```json
{
  "success": true,
  "message": "Click recorded successfully",
  "data": {
    "clickId": 1,
    "userId": "340423200598948568",
    "timestamp": "2025-10-02T15:30:00.000Z"
  }
}
```

---

### **4. Click Count** (Authenticated)

```http
GET http://localhost:3001/api/clicks/count
Authorization: Bearer <TOKEN>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "userId": "340423200598948568",
    "totalClicks": 42
  }
}
```

---

### **5. Click History** (Authenticated)

```http
GET http://localhost:3001/api/clicks/history?limit=100
Authorization: Bearer <TOKEN>
```

**Query Parameters**:

- `limit` (optional): Maximum number of results (1-1000, default: 100)

**Response**:

```json
{
  "success": true,
  "data": {
    "userId": "340423200598948568",
    "clicks": [
      {
        "id": 42,
        "timestamp": "2025-10-02T15:30:00.000Z"
      },
      {
        "id": 41,
        "timestamp": "2025-10-02T15:29:00.000Z"
      }
    ],
    "count": 2
  }
}
```

---

### **6. Global Statistics** (Authenticated)

```http
GET http://localhost:3001/api/clicks/stats
Authorization: Bearer <TOKEN>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "totalClicks": 1234,
    "totalUsers": 10,
    "topUsers": [
      {
        "email": "user@example.com",
        "name": "John Silva",
        "clicks": 500
      }
    ]
  }
}
```

---

### **7. User Information** (Authenticated)

```http
GET http://localhost:3001/api/clicks/me
Authorization: Bearer <TOKEN>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "340423200598948568",
    "email": "user@example.com",
    "name": "John Silva",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "totalClicks": 42
  }
}
```

---

## 🧪 Testing Endpoints

### **Option 1: Using cURL** (Terminal)

```bash
# 1. Health check (no authentication)
curl http://localhost:3001/health

# 2. Get token from frontend (open browser console at http://localhost:5173 and run):
# window.$oidcAuth.accessToken

# 3. Record click (replace <TOKEN> with actual token)
curl -X POST http://localhost:3001/api/clicks \
  -H "Authorization: Bearer <TOKEN>"

# 4. Get count
curl http://localhost:3001/api/clicks/count \
  -H "Authorization: Bearer <TOKEN>"
```

---

### **Option 2: Using Vue.js Frontend**

1. **Start frontend**: `npm run dev` (another terminal window)
2. **Start backend**: `npm run server:dev`
3. Go to **http://localhost:5173**
4. Login with Zitadel
5. Click the "CLICK ME" button
6. The count should increase and be saved in the backend!

---

### **Option 3: VS Code Extension (Thunder Client / REST Client)**

Install **Thunder Client** or **REST Client** in VS Code and use:

```http
### Health Check
GET http://localhost:3001/health

### Record Click (replace <TOKEN>)
POST http://localhost:3001/api/clicks
Authorization: Bearer <TOKEN>

### Get Count
GET http://localhost:3001/api/clicks/count
Authorization: Bearer <TOKEN>
```

---

## 🐛 Troubleshooting

### **Problem: "Port 3001 is already in use"**

**Solution**:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

---

### **Problem: "Cannot find module 'dotenv'"**

**Solution**:

```bash
npm install
```

---

### **Problem: "Error loading Zitadel API key"**

**Check**:

1. Does the `zitadel-api-key.json` file exist in the project root?
2. Is the path in `.env` correct? (`ZITADEL_API_KEY_PATH=./zitadel-api-key.json`)

**Solution**:

```bash
ls -la zitadel-api-key.json
```

---

### **Problem: "Invalid or expired token"**

**Cause**: Zitadel JWT tokens have a limited lifetime.

**Solution**:

1. Logout in the frontend
2. Login again
3. A new token will be generated

---

### **Problem: "CORS error" in frontend**

**Check**:

- Is the frontend running at `http://localhost:5173`?
- Does the backend allow that origin in `server/index.js` (line 18)?

**Solution**: Add the origin to the CORS array:

```javascript
origin: [
  'http://localhost:5173',  // ✅ Add here
]
```

---

### **Problem: "Cannot connect to database"**

**Solution**:

```bash
# Check permissions
chmod 666 clicks.db

# Or delete and let it recreate
rm clicks.db
npm run server:dev
```

---

## 📊 Database Schema

### **Table: `users`**

| Column       | Type     | Description                 |
| ------------ | -------- | --------------------------- |
| `id`         | TEXT     | User ID (from Zitadel)      |
| `email`      | TEXT     | User email                  |
| `name`       | TEXT     | User name                   |
| `created_at` | DATETIME | Creation date (automatic)   |

### **Table: `clicks`**

| Column       | Type     | Description                |
| ------------ | -------- | -------------------------- |
| `id`         | INTEGER  | Click ID (autoincrement)   |
| `user_id`    | TEXT     | FK to `users.id`           |
| `clicked_at` | DATETIME | Click timestamp (automatic) |

---

## 🔐 Security

✅ **Implemented**:

- JWT token validation with Zitadel
- Token expiration verification
- CORS restricted to specific origins
- Input validation
- SQL prepared statements (SQL injection protection)

⚠️ **For Production**:

- [ ] Use HTTPS (SSL certificate)
- [ ] Implement rate limiting
- [ ] Structured logging (Winston/Pino)
- [ ] Monitoring (PM2, New Relic)
- [ ] Automatic database backups

---

## 🎯 Next Steps

1. **Test all endpoints** with cURL or Thunder Client
2. **Integrate frontend** - Verify clicks are saved
3. **View database data**: `sqlite3 clicks.db "SELECT * FROM clicks;"`
4. **Add more features**:
   - Export data to CSV/JSON
   - Admin dashboard
   - Real-time notifications (WebSockets)

---

## 📞 Support

If you encounter issues:

1. Check server logs (terminal where you ran `npm run server:dev`)
2. Check browser logs (F12 → Console)
3. Verify the `.env` file is correct
4. Verify Zitadel is configured correctly

---

**🎉 Backend successfully implemented!**

Run `npm run server:dev` and start testing! 🚀
