# Game Discovery Platform

A full-stack web application for discovering games, tracking what you want to play, and building a personal collection — powered by live data from the [Twitch IGDB API](https://api-docs.igdb.com/).

**Stack:** React 18 · Express · MongoDB · JWT · IGDB API

---

## Overview

Game Discovery Platform is a MERN application built around a real third-party data source rather than a seeded local database. Every game, cover image, rating, and release date is fetched live from IGDB — a catalogue of over 250,000 titles — which means the app has to handle the messy parts of real API integration: OAuth token lifecycle, fuzzy search matching, rate limits, and upstream schema changes.

The app supports account registration with email-based password recovery, full-text game search, detail pages with trailers and screenshots, and two separate per-user collections (favorites and wishlist).

## Features

**Discovery**
- Full-text game search against IGDB with paginated results
- Game detail pages with cover art, screenshots, trailers, ratings, genres, platforms, developers/publishers, and ESRB rating
- **Top Charts** — highest-rated games, filterable by all-time, this year, or the last three years
- **Upcoming Releases** — future launches ranked by IGDB's anticipation score, grouped by month with live countdown timers
- Browse by genre and platform

**Accounts & collections**
- Registration and login with JWT authentication and bcrypt-hashed passwords
- Password reset via tokenised email links (Resend)
- **Favorites** — a personal library of saved games
- **Wishlist** — a separate list for games you're tracking but don't own
- **Recent searches** — search history, re-runnable with one click
- Profile page with collection stats

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Axios, Tailwind CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose 7 |
| Auth | JWT (`jsonwebtoken`), bcryptjs |
| External API | Twitch IGDB (OAuth2 client credentials) |
| Email | Resend |
| Hardening | `express-rate-limit`, `express-validator`, CORS allowlist |

### Why this stack

- **IGDB over a static dataset** — using a live third-party API meant building real token management and defensive data handling instead of shipping fixture data.
- **JWT over sessions** — keeps the API stateless, so the backend can scale horizontally without shared session storage.
- **Mongoose subdocuments for collections** — favorites, wishlist, and search history are embedded arrays on the user document. They're always read together with the user and never queried independently, so embedding avoids a join on every request.

## Architecture

```
game-discovery-platform/
├── backend/
│   ├── middleware/auth.js         # JWT verification
│   ├── models/User.js             # user + embedded favorites/wishlist/history
│   ├── routes/
│   │   ├── auth.js                # register, login, me, password reset
│   │   ├── games.js               # search, details, trending, upcoming, charts
│   │   ├── favorites.js           # favorites CRUD
│   │   ├── wishlist.js            # wishlist CRUD
│   │   └── email.js               # email delivery test endpoints
│   ├── services/
│   │   ├── igdbService.js         # IGDB client: OAuth, queries, response mapping
│   │   └── emailService.js        # Resend wrapper
│   └── server.js                  # app entry, CORS, rate limiting, routing
└── frontend/
    └── src/
        ├── components/            # Navbar, Sidebar, GameCard, HeroBanner, PrivateRoute
        ├── context/AuthContext.js # auth state + token rehydration
        ├── pages/                 # 16 routed pages
        └── services/              # typed API clients (axios instance + interceptors)
```

**Request flow:** React page → service module → shared Axios instance (injects `Authorization` header, handles 401 by clearing the token and redirecting) → Express route → `igdbService` or MongoDB → normalised response.

`igdbService` is the only place that knows IGDB's query language and response shape. Every IGDB record passes through `formatGameData()`, so the rest of the app works with one stable internal shape regardless of what upstream returns.

## API Reference

Endpoints marked 🔒 require an `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a JWT |
| POST | `/api/auth/login` | Authenticate, returns a JWT |
| GET | `/api/auth/me` 🔒 | Current user profile |
| POST | `/api/auth/forgot-password` | Email a reset link |
| POST | `/api/auth/reset-password/:token` | Set a new password |

### Games
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/games/search?query=` | Search games by title |
| GET | `/api/games/:id` | Game details by IGDB ID |
| GET | `/api/games/steam/:steamId?name=` | Resolve a Steam App ID to a game |
| GET | `/api/games/trending/popular` | Highly-rated recent releases |
| GET | `/api/games/upcoming/list` | Upcoming releases by anticipation |
| GET | `/api/games/top-rated/list?since=` | Top-rated, optionally scoped by year |
| GET | `/api/games/user/search-history` 🔒 | The user's recent searches |

### Collections
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/favorites` 🔒 | List favorites |
| POST | `/api/favorites` 🔒 | Add a game |
| DELETE | `/api/favorites/:gameId` 🔒 | Remove a game |
| GET | `/api/favorites/check/:gameId` 🔒 | Check membership |
| GET | `/api/wishlist` 🔒 | List wishlist |
| POST | `/api/wishlist` 🔒 | Add a game |
| DELETE | `/api/wishlist/:gameId` 🔒 | Remove a game |
| GET | `/api/wishlist/check/:gameId` 🔒 | Check membership |

`GET /api/health` returns a liveness check.

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local, or a free [Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- Twitch developer credentials for IGDB — [dev.twitch.tv/console](https://dev.twitch.tv/console)

### Backend

```bash
cd backend
npm install
cp .env.example .env    # then fill in your own values
npm start               # or: npm run dev  (nodemon)
```

Runs on `http://localhost:5000`.

Required environment variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret for auth tokens |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | IGDB API credentials |
| `PORT` | Server port (default 5000) |
| `FRONTEND_URL` | Allowed CORS origin |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Password-reset email delivery |

> `.env` is git-ignored and must never be committed.

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000` and proxies API requests to port 5000.

## Implementation Notes

A few problems worth calling out, because they shaped the code:

**IGDB search doesn't rank exact titles first.** Searching "Baldur's Gate 3" returns the Deluxe Edition, the Collector's Edition, and a spin-off before the base game — and IGDB lists the base game as "Baldur's Gate III" in Roman numerals. Naively taking the first result opens the wrong page. `igdbService.pickBestNameMatch()` scores candidates (exact → prefix → substring → word overlap), normalises Roman numerals and edition suffixes, and returns `null` when nothing is close enough rather than guessing — so the caller can fall back to a more reliable lookup instead of silently showing an unrelated game.

**Deprecated API fields fail silently.** IGDB renamed several fields (`category` → `game_type`, `external_games.category` → `external_game_source`, `age_ratings.category/rating` → `organization/rating_category`). Querying a removed field doesn't error — it just matches nothing. That turned a schema change into an empty list and a permanently blank ESRB rating rather than a visible failure. All queries now target the current field names.

**Rating averages need a vote floor.** Sorting by rating alone puts obscure titles with a handful of votes above genuinely acclaimed games. The chart queries require a minimum `rating_count`, scaled by the time window — recent releases haven't accumulated votes yet, so a flat threshold would leave the year-scoped tabs empty.

## Roadmap

- Automated test suite (Jest + Supertest for the API, React Testing Library for components)
- Response caching for IGDB queries to reduce upstream calls
- Server-side pagination on browse and search
- Deployment (frontend to Vercel, API to Render)

## License

MIT
