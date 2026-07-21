# 🛸 Majestic Cross-System Ticketing Tool & Bilingual UI Widget

A centralized, cross-system bug reporting and feature request tracker designed to offload ticketing and triage logic entirely from individual host applications. 

By dropping a single line of code into any internal platform, developers unlock an isolated, frontend widget drawer featuring instant **Bilingual Localization (English & Amharic / አማርኛ)**, real-time **in-browser viewport screen captures**, and clipboard image paste mechanics. All issues funnel into a singular, unified administrative data-grid triage console managed by a strict backend state machine.

---

## 🚀 Key Features

* **Dual-Language Interface**: Complete runtime language switching between English and Amharic (`አማርኛ`) across the end-user widget drawer and the core triage admin panels.
* **Encapsulated Widget Injections**: Built as an independent Web Component wrapped in an IIFE running inside a strict **Shadow DOM** boundary, guaranteeing zero CSS clashing or global scope contamination with parent applications.
* **Native Viewport Screen Capture**: Utilizes the browser's native `navigator.mediaDevices.getDisplayMedia` API to record precise pixel frames of the client viewport—accurately capturing heavy canvas configurations and iframes.
* **Clipboard Interaction Engine**: Intercepts document-level paste (`Ctrl+V` / `Cmd+V`) events to seamlessly capture and attach images straight from the OS clipboard.
* **Strict Workflow State Machine**: Protects data integrity with a server-enforced state machine (e.g., `new` → `triaged` → `in_progress` → `done`) that writes an immutable, system-generated timeline audit ledger into database tables on every transaction.
* **Robust Multi-Tenant Security**: Protects ingestion routes via distinct API keys matched against origin-restricted Cross-Origin Resource Sharing (CORS) lists.

---

## 🛠️ Tech Stack

* **Frontend Widget / Dashboard**: Pure Vanilla JavaScript (Web Components), React 18, Vite
* **Backend API Engine**: Node.js, Express.js, Multer (Multipart Form-Data)
* **Database & ORM**: MySQL, Prisma ORM
* **Security & Auth**: JSON Web Tokens (JWT), Bcrypt.js, Strict CORS Policies

---

## 🗄️ Core Database Architecture

The data layout maps data boundaries across host multi-tenancy pipelines:

```text
  [systems] 1 ── 🔐 ──  जाहीर [tickets] 1 ── 💾 ── जाहीर [ticket_attachments]
                             │
                             ├── 💬 ── जाहीर [ticket_comments] (Timeline Audit Trail)
                             │
                             └── 🗳️ ── जाहीर [votes] (Upvote Engine)
```

* **`systems`**: Tracks client applications allowed to communicate with the API via secure tokens (`api_key`) and explicit `allowed_origin` matching.
* **`tickets`**: Stores metadata variables including titles, detailed descriptions, priorities, severities, system-captured browser user agents, and page URLs.
* **`ticket_comments`**: An append-only historical timeline collection containing internal triage chat text and automated system tracking logs.
* **`ticket_attachments`**: Tracks discrete filesystem asset storage paths mapped directly to user-uploaded images or captured viewport snapshots.

---

## 💻 Local Setup & Quickstart

### Prerequisites
* Node.js (v18+ recommended)
* MySQL Server database instance running locally

### 1. Database & Environment Configuration
Clone the repository, navigate to the root directory, create a `.env` file, and supply your local database string:
```env
PORT=5000
NODE_ENV="development"
DATABASE_URL="mysql://your_user:your_password@localhost:3306/ticketing_db"
JWT_SECRET="your_secure_cryptographic_jwt_token_string"
```

### 2. Install Dependencies & Initialize Database
```bash
# Install core backend packages
npm install

# Generate Prisma Client blueprints and deploy schema migrations
npx prisma migrate dev

# Seed internal triage staff profiles and mock test client applications
npm run db:seed
```

### 3. Run the Backend API Engine
```bash
# Starts the server on port 5000
node src/app.js
```

### 4. Deploy the Embeddable UI Widget
To test the layout locally, drop the following custom HTML element script tags into any plain test web file:
```html
<internal-ticket-widget data-system-key="wgt_k_erp_prod_7719ab22cd884019e055f2"></internal-ticket-widget>
<script src="http://localhost:5000/widget.js"></script>
```

---

## 🌐 Production Cloud Deployment Strategy

This repository is structured for streamlined containerized or serverless hosting deployments:

1. **Database Tier**: Spin up a fully-managed MySQL cluster instance utilizing platforms like **Aiven.io** or **Railway.app** and update the production configuration string inside your system.
2. **Backend Engine**: Deploy the core Express.js repository framework directly onto **Render.com** or **Railway**, exposing production environment variables securely via their cloud dashboards.
3. **Frontend SPA / Assets**: Compile static build bundles (`npm run build`) and connect the dashboard views natively to **Vercel** or **Netlify** for global delivery.
