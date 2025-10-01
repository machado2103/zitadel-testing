# Zitadel Click Tracker - Vue 3 Application

A modern, retro-styled Vue 3 application with an 80's beach vibe aesthetic, ready for Zitadel authentication and backend integration.

## Features

- 🎨 Retro 80's beach vibe design with deep dark blues and vibrant pink/cyan accents
- 🔐 Mock authentication system (ready for Zitadel integration)
- 🖱️ Click tracking interface with local counter
- 🛣️ Vue Router with route guards
- 📦 Modern Vue 3 Composition API
- ⚡ Vite for fast development and building

## Project Structure

```
zitadel-testing/
├── src/
│   ├── components/          # Reusable components (none yet, add as needed)
│   ├── composables/         # Vue composables for logic
│   │   ├── useAuth.js       # Authentication logic (Zitadel integration pending)
│   │   └── useClickApi.js   # API calls for click tracking (backend pending)
│   ├── router/              # Vue Router configuration
│   │   └── index.js         # Routes and navigation guards
│   ├── views/               # Page components
│   │   ├── LoginView.vue    # Login/landing page
│   │   └── MainView.vue     # Main application page with click button
│   ├── App.vue              # Root component
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles with retro theme
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## File Descriptions

### Core Files

- **src/main.js**: Initializes the Vue app, sets up the router, and mounts the application.
- **src/App.vue**: Root component that renders the router view.
- **src/style.css**: Global CSS with retro 80's styling, color variables, and reusable utility classes.

### Router

- **src/router/index.js**: Defines application routes and implements navigation guards that check authentication status before allowing access to protected routes.

### Views

- **src/views/LoginView.vue**: Landing page with retro-styled login card. Features icon-based UI with a primary login button and a development bypass button. Includes placeholders for Zitadel OAuth integration.

- **src/views/MainView.vue**: Protected main page with a header (containing logout button) and a large circular click button. Displays a local click counter that increments on each click. Ready for database integration.

### Composables

- **src/composables/useAuth.js**: Authentication composable with mock login/logout functions. Contains extensive TODO comments marking where Zitadel integration should be added:
  - OAuth/OIDC flow initialization
  - User info retrieval
  - Session management
  - Token handling

- **src/composables/useClickApi.js**: API service composable for click tracking. Contains placeholder functions with TODO comments for:
  - Recording clicks to backend database
  - Fetching click history
  - Getting total click counts
  - Authentication header injection

## Integration TODOs

### 1. Zitadel Authentication Integration

**Location**: `src/composables/useAuth.js`

The following functions need to be implemented with Zitadel:

- `login()`: Initiate Zitadel OAuth/OIDC flow
- `logout()`: Clear session and redirect to Zitadel logout
- `getToken()`: Retrieve access token for API calls

**Additional steps**:
1. Install Zitadel Vue SDK: `npm install @zitadel/vue`
2. Configure Zitadel client in a config file
3. Set up Zitadel project and application in Zitadel console
4. Update environment variables with Zitadel client ID and domain
5. Wrap app with Zitadel provider in `main.js`

### 2. Backend API Integration

**Location**: `src/composables/useClickApi.js`

The following functions need backend endpoints:

- `recordClick()`: POST request to save click data
- `getClickHistory()`: GET request to fetch click records
- `getTotalClicks()`: GET request for aggregate click count

**Additional steps**:
1. Create backend API endpoints (Express/Node.js server example exists)
2. Set up database (SQLite already in dependencies)
3. Create API client configuration
4. Add API base URL to environment variables
5. Implement error handling and loading states

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_ZITADEL_DOMAIN=your-zitadel-domain
VITE_ZITADEL_CLIENT_ID=your-client-id
VITE_API_BASE_URL=http://localhost:3001
```

## Development Notes

- The application uses mock authentication by default. Toggle `isLoggedIn` in `useAuth.js` to test protected routes.
- The click counter is purely local. No data persists on page reload until backend integration is complete.
- All icons are SVG-based for clean scaling and themability.
- The design is optimized for desktop only (no mobile responsiveness).

## Design Theme

The application features a retro 80's beach/synthwave aesthetic:

- **Background**: Deep dark blues (#0a0e27, #1a1a2e, #16213e)
- **Primary Accents**: Hot pink (#ff6ec7) and cyan (#00d4ff)
- **Typography**: Monospace fonts (Courier New, Consolas)
- **Effects**: Glowing text shadows, neon borders, smooth transitions
- **Style**: Minimalist with icon-based navigation

## Next Steps

1. ✅ Complete Vue 3 application structure
2. ⏳ Integrate Zitadel authentication
3. ⏳ Connect to backend API
4. ⏳ Implement persistent click storage
5. ⏳ Add click history visualization (optional)
6. ⏳ Deploy to production

## Dependencies

### Runtime
- **vue**: Core Vue 3 framework
- **vue-router**: Client-side routing
- **@zitadel/vue**: Zitadel authentication (ready for integration)
- **@zitadel/node**: Node.js Zitadel SDK (for backend)
- **axios**: HTTP client for API calls
- **express**: Backend server framework
- **sqlite3**: Database for storing clicks
- **cors**: Enable CORS for API
- **dotenv**: Environment variable management

### Development
- **vite**: Build tool and dev server
- **@vitejs/plugin-vue**: Vite plugin for Vue 3

## License

MIT
