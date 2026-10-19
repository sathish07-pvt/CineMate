# 🎬 CineMate – Your Personal Movie Discovery & Social Viewing Platform

> **Find. Discover. Review. Watch Together.**

CineMate is a modern, responsive full-stack movie discovery and social entertainment web application built for movie lovers, cinephiles, and viewing parties across devices (Android, iOS, tablets, laptops, and desktops) with installable Progressive Web App (PWA) support.

---

## 🌟 Key Features

### 1. 🎞️ Cinematic Background Movie Trailer Previews
- **Ambient Preview Experience:** Opening any movie or series details page seamlessly streams the official trailer right inside the backdrop header.
- **Player Controls:** Mute/Unmute audio, Pause/Resume preview, launch theatre-mode **Full Trailer Modal**, or jump out to the official authorized YouTube player.
- **Smart Fallback:** Instantly falls back to high-resolution backdrop art with animated ambient gradient overlays if no video trailer is available or if reduced motion is enabled.

### 2. 📺 Regional OTT Availability & Direct Navigation
- **Where to Watch:** Discover real-time regional streaming availability categorized by **Stream (Subscription)**, **Rent**, and **Buy**.
- **Interactive Region Selector:** Switch regions between **United States 🇺🇸**, **United Kingdom 🇬🇧**, **India 🇮🇳**, **Canada 🇨🇦**, **Australia 🇦🇺**, **Germany 🇩🇪**, and **France 🇫🇷**.
- **Official Deep Links:** "Watch Now" action buttons launch authorized platforms (Netflix, Prime Video, Disney+, Apple TV, Paramount+, Max, etc.).

### 3. 🧠 Transparent Mood & Situation Recommendation Engine
- **9 Curated States of Mind:**
  - ✨ *Happy & Uplifting* (Comedies, animation, feel-good classics)
  - 🌧️ *Sad & Cathartic* (Deep emotional dramas)
  - 💖 *Romantic & Date Night* (Romance, rom-coms)
  - ⚡ *Bored / Need Excitement* (Action, sci-fi, mind-benders)
  - 🔥 *Motivated & Inspired* (Biographical, sports, heroic perseverance)
  - 🕵️‍♂️ *Thriller Night* (Psychological suspense, mystery twists)
  - 🍿 *Family Time* (Wholesome multi-generational favorites)
  - 🎉 *Friends Night* (Popcorn blockbusters, crowd-pleasers)
  - ☕ *Weekend Relaxation* (Breathtaking visuals, slow-burn mysteries)
- **Transparent Reasoning:** Each recommendation displays an exact **Match Score %** and explanation (e.g. *"Matches your Thriller Night preference + Top critical rating (8.4/10)"*).

### 4. 🍿 Real-Time Social Watch Together Rooms
- **Synchronized Viewing Hub:** Create a watch room for any title, generating a unique 6-character room code (e.g. `CNM-777`) and shareable invite link.
- **Synchronized Countdown:** 5-second synchronized countdown (*5... 4... 3... 2... 1... Sync Play!*) with celebratory confetti blast to align stream starts on separate OTT accounts.
- **Participant Readiness:** Interactive "Mark as Ready" status matrix for all room members.
- **Live Room Chat:** Real-time text messaging powered by Socket.IO with quick one-tap emoji reactions (🍿, 🎬, 😱, 😂, ❤️, 🔥, 👏, 🚀).

### 5. 📑 Personal Watchlist & Library Tracking
- **Persistent Storage:** Add/remove titles to your personal database with duplicate prevention.
- **Watched Status:** Toggle between "To Watch" and "Watched" with instant progress indicators.
- **Smart Filtering:** Filter by Content Type (Movies / Series) and Watch Status.

### 6. ⭐ Community Reviews & CineMate Rating Score
- **Separate Rating Scales:** View the external TMDB critic/audience rating alongside CineMate's own Community Average score.
- **1-10 Star Interactive Ratings:** Write, edit, or delete personal reviews.
- **Live Community Feed:** Browse recent thoughts from other film critics and friends.

### 7. 👥 Social Friends & Profiles
- **User Discovery:** Search members by username, send friend requests, and accept/decline incoming invitations.
- **Viewing Profiles:** Customize avatar, bio, preferred OTT region, and favorite genres.

### 8. 📱 Responsive PWA & Mobile Touch Navigation
- **Installable Web App:** Web app manifest (`manifest.webmanifest`), service worker caching (`sw.js`), and floating install banner.
- **Mobile Bottom Navigation Dock:** Optimized thumb-zone dock for mobile smartphones.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, Socket.IO, JWT, bcryptjs, Dotenv, CORS |
| **Database** | SQLite (zero-config local dev `dev.db`), PostgreSQL-ready Prisma ORM schema |
| **External APIs** | TMDB API v3 (movies, TV shows, trailers, credits, watch providers) with curated offline fallback |
| **Testing** | Vitest, Supertest integration test suite |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended; developed and tested on Node v24.19.0)
- **npm** (v9 or higher)

### 1. Clone & Install Dependencies

From the repository root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

The project includes pre-configured `.env` and `.env.example` templates.

In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Connection (Prisma)
# Default is SQLite for instant zero-dependency local dev:
DATABASE_URL="file:./dev.db"

# For PostgreSQL production / staging:
# DATABASE_URL="postgresql://user:password@localhost:5432/cinemate?schema=public"

JWT_SECRET=cinemate_dev_secret_key_8923489234
JWT_EXPIRES_IN=7d

# TMDB API Key (Optional)
# If provided, CineMate queries live TMDB v3 API.
# If omitted, CineMate seamlessly runs with its comprehensive built-in catalog.
TMDB_API_KEY=
```

### 3. Initialize & Seed Database

Generate Prisma Client and push tables into the local SQLite database:

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

Seed demo users, community reviews, watchlists, and an active watch party:

```bash
npm run prisma:seed
```

**Pre-seeded Demo Accounts:**
- `alex@cinemate.io` / `password123` (Username: `alex_cinephile`)
- `sophia@cinemate.io` / `password123` (Username: `sophia_movies`)
- `marcus@cinemate.io` / `password123` (Username: `marcus_stream`)
*(You can also use the 1-Click Demo Login button in the CineMate Sign In modal!)*

---

## 💻 Running the Application

### Option A: Run Backend and Frontend Concurrently

From the root project directory:
```bash
npm run dev:backend
# In another terminal:
npm run dev:frontend
```

### Option B: Run Individually

**Backend Server:**
```bash
cd backend
npm run dev
# Starts server on http://localhost:5000 with live Socket.IO
```

**Frontend Dev Server:**
```bash
cd frontend
npm run dev
# Starts Vite dev server on http://localhost:5173
```

Now open **http://localhost:5173** in your browser.

---

## 🧪 Running Tests

The test suite validates authentication, movie discovery, search filtering, mood recommendations, watchlist duplicate prevention, and community review ratings.

```bash
cd backend
npm test
```

**Test Results:**
```text
 ✓ tests/api.test.ts (10 tests) 736ms
 Test Files  1 passed (1)
      Tests  10 passed (10)
```

---

## 📦 Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

The production assets will be output to `frontend/dist`.

---

## 🗄️ Database Architecture & PostgreSQL Migration

CineMate uses **Prisma ORM** with a relational schema defined in `backend/prisma/schema.prisma`:
- `User`: Accounts, credentials hash, bio, avatar, regional preferences.
- `WatchlistItem`: User-specific titles, unique constraint `@@unique([userId, tmdbId, mediaType])`.
- `MovieReview`: 1-10 community scores, user reviews, timestamps.
- `Friendship`: Pending/accepted friend links with mutual uniqueness.
- `WatchRoom`: Unique room codes (`roomCode`), host associations, sync states.
- `RoomParticipant`: Room membership and "Ready" statuses.
- `ChatMessage`: Chat history and real-time emoji reactions.
- `UserActivity`: User action timeline.

### Switching to PostgreSQL:
To connect to an external PostgreSQL database:
1. In `backend/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `backend/.env`, set:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/cinemate?schema=public"
   ```
3. Run `npx prisma db push` or `npx prisma migrate dev`.

---

## 🛡️ Security Best Practices
- **Password Hashing:** Pure-JS `bcryptjs` with salt rounds prevents plain-text storage.
- **JWT Authentication:** Strict token verification on protected endpoints (`/api/watchlist`, `/api/reviews`, `/api/friends`, `/api/rooms`).
- **Input Validation:** Strict type checking on review ratings (1-10), email regex validation, username minimum length.
- **No Leaked Secrets:** TMDB credentials and JWT secrets remain strictly on the backend.

---

## 📄 License
This project is licensed under the MIT License. Movie metadata and posters are provided by TMDB.
