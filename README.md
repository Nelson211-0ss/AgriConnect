# CORWADO AgriConnect

A production-ready, full-stack **digital agricultural extension platform** for smallholder farmers in South Sudan. AgriConnect connects farmers, extension officers, buyers and financial service providers through a web management system with SMS / WhatsApp channel simulations.

Built as an MVP prototype suitable for presentation to **CORWADO South Sudan, the Norwegian Embassy, the Ministry of Agriculture and development partners**.

![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node%20%7C%20PostgreSQL%20%7C%20Docker-0B7A3E)

---

## Features

| Module | Highlights |
| --- | --- |
| **Dashboard** | KPI cards, farmers-by-county pie, message activity line, crop distribution, growth area chart, top advisories, recent activity tables |
| **Farmer Registry** | 1,000 seeded farmers, multi-step registration form, search, filters, full CRUD, CSV export, GPS capture |
| **Extension Workers** | Officer directory, farmers-registered counts, admin CRUD |
| **Advisories** | 6 categories, create / publish / schedule, card gallery, reader view |
| **Market Information** | Live prices, weekly price-trend chart, search, add prices |
| **Weather Intelligence** | Per-county current weather, 7-day forecast charts, early-warning alerts (mock API) |
| **Pest & Disease Alerts** | County-based outbreak reporting, severity, **interactive Leaflet map** |
| **Buyer Marketplace** | Buyers post demand, farmers submit interest |
| **Financial Services** | Loans, savings & insurance product catalogue |
| **Messaging Center** | SMS & WhatsApp composer, groups, scheduling, history (mock integrations) |
| **Training** | Courses, enrollment, progress, certificates |
| **Reports** | Farmer / county / crop / market reports, Excel (CSV) + PDF (print) export |
| **Maps** | Farmer distribution, pest outbreaks and market locations on one map |
| **Mobile & Channels** | Realistic phone mockups: Farmer App, Crop Advice, Market, WhatsApp Business, SMS |
| **Auth** | JWT authentication + role-based access control (4 roles) |

### User roles
- **Super Admin** – manage everything
- **Extension Officer** – register farmers, publish advisories, issue alerts, send messages
- **Farmer** – view advisories, alerts, prices, weather, finance
- **Buyer** – post buying opportunities, browse marketplace

---

## 🧰 Tech Stack

**Frontend:** React + TypeScript, Vite, Tailwind CSS, ShadCN-style UI kit, Recharts, React-Leaflet, lucide-react
**Backend:** Node.js, Express, TypeScript, PostgreSQL (`pg`), JWT, bcrypt
**Infra:** Docker, Docker Compose, Nginx

---

## 🚀 Quick Start (Docker — recommended)

Requires Docker & Docker Compose.

```bash
docker-compose up --build
```

Then open:

| Service | URL |
| --- | --- |
| **Web app** | http://localhost:8090 |
| Backend API | http://localhost:4010/api/health |
| PostgreSQL | localhost:5544 (`agriconnect` / `agriconnect`) |

> Host ports (8090 / 4010 / 5544) are chosen to avoid clashes with other local services. Containers still talk to each other on their internal ports (frontend → `backend:4000` → `db:5432`). Edit the `ports:` mappings in `docker-compose.yml` if you prefer the defaults.

The backend automatically waits for PostgreSQL, creates the schema, and seeds demo data on first start (1,000 farmers, 100 buyers, 50 officers, advisories, alerts, market prices and more).

### Demo accounts (default password: `password123`)

All seeded, admin-created, and self-registered accounts use the same default password unless changed in production via `DEFAULT_PASSWORD` in the backend environment.

| Role | Email |
| --- | --- |
| Super Admin | `admin@corwado.org` |
| Extension Officer | `officer@corwado.org` |
| Farmer | `farmer@corwado.org` |
| Buyer | `buyer@corwado.org` |

Super Admin can also create farmer and buyer accounts under **User Accounts** in the dashboard. Farmers and buyers may self-register at `/register` using the same default password.

---

## 🛠️ Local Development (without Docker)

### 1. Database
Start a PostgreSQL 16 instance and create a database:

```bash
createdb agriconnect   # or use docker: docker run -e POSTGRES_PASSWORD=agriconnect -e POSTGRES_USER=agriconnect -e POSTGRES_DB=agriconnect -p 5432:5432 postgres:16-alpine
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # adjust DATABASE_URL if needed
npm install
npm run dev               # starts API on http://localhost:4000 and seeds data
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev               # starts Vite on http://localhost:5173 (proxies /api to :4000)
```

Open http://localhost:5173.

---

## 📦 Project Structure

```
AgriConnect/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express app + bootstrap
│   │   ├── config.ts         # env config
│   │   ├── db.ts             # pg pool + helpers
│   │   ├── schema.sql        # PostgreSQL schema (DDL)
│   │   ├── seed.ts           # demo data generator
│   │   ├── utils.ts          # JWT, auth & RBAC middleware
│   │   └── routes/           # auth, dashboard, farmers, advisories, market, weather,
│   │                         # pests, marketplace, financial, messaging, training, reports, users
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/        # Layout, UI kit, charts, Leaflet map
    │   ├── context/          # AuthContext
    │   ├── lib/              # api client, helpers
    │   └── pages/           # Landing, Login, Dashboard, all modules, mockups
    ├── nginx.conf
    └── Dockerfile
```

---

## 🔌 Key API Endpoints

All endpoints are under `/api` and (except auth) require `Authorization: Bearer <token>`.

```
POST   /api/auth/login            POST /api/auth/register      GET /api/auth/me
GET    /api/dashboard
GET    /api/farmers   POST /api/farmers   PUT/DELETE /api/farmers/:id
GET    /api/farmers/export (CSV)   GET /api/farmers/map
GET    /api/users?role=extension_officer   POST/PUT/DELETE /api/users
GET    /api/advisories   POST/PUT/DELETE
GET    /api/market   GET /api/market/trends   POST /api/market
GET    /api/weather   POST /api/weather/alerts
GET    /api/pests   POST/PUT/DELETE
GET    /api/marketplace   POST   POST /api/marketplace/:id/interest
GET    /api/financial
GET    /api/messaging   POST
GET    /api/training
GET    /api/reports/:type   (farmer | county | crop | market)
```

---

## 🌱 Demo Data

Seeded automatically on first backend start:
- **1,000** farmers across 5 counties (Juba, Wau, Aweil, Bor, Rumbek)
- **100** buyers, **50** extension officers
- **50** advisories, **20** pest alerts, weather alerts
- **20+** market price records with 12 weeks of trend history
- **40** marketplace listings, **6** financial products
- **60** SMS/WhatsApp messages, **4** training courses, **600** enrollments

To re-seed from scratch: drop the `db_data` volume (`docker-compose down -v`) or run `npm run seed -- --force` in `backend/`.

---

## 🎨 Design

- Forest Green `#0B7A3E` / Light Green `#22C55E` / Orange accent `#F59E0B`
- White & light-gray surfaces, soft shadows, 12–16px rounded corners
- Fully responsive (mobile → large desktop), collapsible sidebar
- NGO / SaaS-grade aesthetic suitable for donor presentation

---

© CORWADO South Sudan — Digital Agricultural Extension Platform.
