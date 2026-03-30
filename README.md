# iFactory AI - Smart Manufacturing Platform

A multi-industry demo portal showcasing AI-powered plant monitoring dashboards. Built with Next.js 16, React 19, MongoDB, and JWT authentication.

## Quick Start

```bash
git clone https://github.com/RohitJoshi-OX/ifactory-demo-portal.git
cd ifactory-demo-portal
npm install
```

Create `.env.local` in root:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run development server:

```bash
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

---

## Folder Structure Explained

```
ifactory-demo-portal/
│
├── app/                          # Next.js App Router (pages + API)
│   ├── layout.js                 # Root HTML layout (<html><body>)
│   ├── page.js                   # Home "/" — redirects to /login
│   │
│   ├── (auth)/                   # Auth group (parentheses = no URL segment)
│   │   ├── login/page.js         # /login — Login form
│   │   └── signup/page.js        # /signup?utm_source=... — Signup form
│   │
│   ├── api/                      # Backend API routes (replaces Express)
│   │   ├── signup/route.js       # POST /api/signup — Create account
│   │   ├── login/route.js        # POST /api/login — Login + JWT cookie
│   │   ├── logout/route.js       # POST /api/logout — Clear cookie
│   │   ├── me/route.js           # GET /api/me — Get current user
│   │   ├── track/route.js        # POST /api/track — Track page views
│   │   ├── forgot-password/route.js  # POST /api/forgot-password
│   │   └── industries/route.js   # GET /api/industries — List industries
│   │
│   └── portal/                   # Protected portal routes
│       ├── layout.js             # Portal wrapper (empty, passes children)
│       ├── cement-plant/
│       │   ├── layout.js         # Cement layout: Sidebar + TopBar + Chatbot
│       │   ├── page.js           # /portal/cement-plant — Default overview
│       │   └── [section]/page.js # /portal/cement-plant/:section — Dynamic routing
│       └── steel-plant/
│           ├── layout.js         # Steel layout: Sidebar + TopBar
│           └── page.js           # /portal/steel-plant — Default overview
│
├── components/industries/        # All UI components organized by industry
│   ├── cement-plant/
│   │   ├── components/           # Shared UI used across all cement pages
│   │   │   ├── Sidebar.jsx       # Left navigation with collapsible sections
│   │   │   ├── TopBar.jsx        # Header bar with demo banner + schedule call
│   │   │   ├── Chatbot.jsx       # Floating chatbot with demo popup
│   │   │   ├── KPISection.jsx    # KPI cards for overview
│   │   │   ├── ProductionChart.jsx
│   │   │   ├── EnergyTrend.jsx
│   │   │   ├── KilnHealth.jsx
│   │   │   ├── AIInsights.jsx
│   │   │   ├── AlertsPanel.jsx
│   │   │   ├── EnvironmentPanel.jsx
│   │   │   └── StatusBar.jsx
│   │   │
│   │   └── pages/                # Individual dashboard pages (17 pages)
│   │       ├── OverviewPage.jsx          # Main overview with KPIs, charts
│   │       ├── RealTimeKPIs.jsx          # Detailed KPI monitoring
│   │       ├── DigitalTwinMonitoring.jsx # 3D plant process flow
│   │       ├── AIInsightsSummary.jsx     # AI insights & recommendations
│   │       ├── KilnOptimization.jsx      # Kiln process optimization
│   │       ├── ConveyorHealth.jsx        # Conveyor belt health + AI vision
│   │       ├── RawMaterial.jsx           # Raw material & fuel blend
│   │       ├── QualityPrediction.jsx     # Quality prediction & control
│   │       ├── EmissionMonitoring.jsx    # Emission monitoring & compliance
│   │       ├── InventoryLogistics.jsx    # Inventory & logistics
│   │       ├── EnergyOptimization.jsx    # Energy optimization
│   │       ├── SmartSensors.jsx          # Smart sensor monitoring
│   │       ├── EnvironmentalDashboard.jsx # Environmental dashboard
│   │       ├── ComplianceReports.jsx     # Compliance & audit reports
│   │       ├── AssetHealth.jsx           # Critical asset health + anomaly detection
│   │       ├── MaintenanceScheduling.jsx # Maintenance scheduling + work orders
│   │       └── Integrations.jsx          # Software & hardware integrations
│   │
│   └── steel-plant/
│       ├── components/           # Steel plant shared UI
│       │   ├── Sidebar.jsx
│       │   ├── TopBar.jsx
│       │   ├── StatusBar.jsx
│       │   └── KPISection.jsx
│       └── pages/                # Steel plant pages (ready for development)
│
├── lib/                          # Backend utilities
│   ├── db.js                     # MongoDB connection (mongoose + caching)
│   ├── auth.js                   # JWT token generation & verification
│   ├── logger.js                 # Winston logger (console + file)
│   ├── seed.js                   # Seeds industry data on server start
│   └── models/
│       ├── User.js               # User schema (email, password, role, pageViews, etc.)
│       └── Industry.js           # Industry schema (name, description, features)
│
├── public/                       # Static assets
│   └── images/cement-plant/      # Conveyor belt images for AI vision page
│
├── proxy.js                      # Auth middleware (JWT verification on edge)
├── instrumentation.js            # Server startup hook (seeds DB)
├── next.config.js                # Next.js configuration
├── jsconfig.json                 # Path aliases (@/ → root)
├── package.json                  # Dependencies & scripts
└── .env.local                    # Environment variables (not in git)
```

---

## How It Works

### Routing

Next.js uses **file-based routing** — folder path = URL path.

| File | URL |
|------|-----|
| `app/page.js` | `/` |
| `app/(auth)/login/page.js` | `/login` |
| `app/(auth)/signup/page.js` | `/signup` |
| `app/portal/cement-plant/page.js` | `/portal/cement-plant` |
| `app/portal/cement-plant/[section]/page.js` | `/portal/cement-plant/kiln-optimization` |

- `(auth)` — Route group, organizes files without affecting URL
- `[section]` — Dynamic segment, matches any value

### Layouts (Nested Wrappers)

Layouts wrap their child pages and nest automatically:

```
app/layout.js                              → <html><body>
  └── app/portal/cement-plant/layout.js    → Sidebar + TopBar + Chatbot
      └── app/portal/cement-plant/[section]/page.js → Page content
```

### Authentication Flow

1. **Signup**: User visits `/signup?utm_source=industries/cement-plant/` → fills form → `POST /api/signup` → JWT cookie set → redirect to portal
2. **Login**: User visits `/login` → enters credentials → `POST /api/login` → JWT cookie set → redirect based on stored `utmSource`
3. **Protection**: `proxy.js` checks JWT cookie on every `/portal/*` request → invalid/missing token → redirect to `/login`
4. **Forgot Password**: Resets password to user's mobile number

### API Routes

Each `route.js` exports HTTP method functions:

```js
// app/api/login/route.js
export async function POST(request) {
  const { email, password } = await request.json()
  // ... verify, generate token, return response
}
```

### Adding a New Page

1. Create component: `components/industries/cement-plant/pages/NewPage.jsx`
2. Import in `app/portal/cement-plant/[section]/page.js`:
   ```js
   import NewPage from '@/components/industries/cement-plant/pages/NewPage'
   ```
3. Add to SECTION_MAP:
   ```js
   'new-page': NewPage,
   ```
4. Add menu item in `Sidebar.jsx`

### Adding a New API Route

1. Create `app/api/your-route/route.js`
2. Export handler:
   ```js
   export async function POST(request) { ... }
   export async function GET(request) { ... }
   ```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Frontend | React 19, Inline Styles (no CSS framework) |
| Backend | Next.js API Routes |
| Database | MongoDB Atlas + Mongoose 9 |
| Auth | JWT (jose for edge, jsonwebtoken for server) |
| Logging | Winston |
| Charts | Custom SVG components (AreaChart, GaugeChart, DonutChart, etc.) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token signing |

## Scripts

```bash
npm run dev     # Start dev server (http://localhost:3000)
npm run build   # Create production build
npm start       # Run production server
```
#   F M C G - P o r t a l  
 #   F M C G - P o r t a l  
 