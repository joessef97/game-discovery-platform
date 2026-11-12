# Live Catalog Implementation Plan

> **For agentic workers:** Keep the tasks in this plan ordered. Use TDD: write each named regression test, observe its expected failure, implement the smallest change, then run the focused test and full suite.

**Goal:** Make game discovery, home recommendations, genre browsing, and platform browsing reflect live IGDB data.

**Architecture:** Extend the existing IGDB service and Express games routes with category lists and filtered, paginated queries. Route the React discovery and browse pages through the existing Axios service, and build Home sections from the existing trending, top-rated, and upcoming API methods.

**Tech Stack:** React 18, React Router, Axios, Express, IGDB API.

**Spec:** `docs/superpowers/specs/2026-11-12-live-game-discovery-design.md`

## Global Constraints

- Keep the React, Express, MongoDB, and IGDB architecture.
- Use IGDB IDs and filtered results rather than searching game titles for category words.
- Return the same formatted game shape already used by search and charts.
- Validate genre identifiers, page numbers, and page sizes before using them in IGDB queries.
- Adding a third-party gaming news provider or public player posts/comments is out of scope.

## Review Focus

- A non-numeric or non-positive genre/platform ID returns a client error without making an IGDB request.
- A page less than 1 or page size outside the supported range returns a client error.
- An empty IGDB category result renders a clear empty state with no stale cards.
- An IGDB failure renders an error/retry state and does not substitute hardcoded fixtures.
- A search combined with a selected genre or platform preserves both filters when loading the next page.

---

### Task 1: IGDB category and filtered-game API

**Files:**
- Modify: `backend/services/igdbService.js`
- Modify: `backend/routes/games.js`

**Interfaces:**
- Produces `getGenres(limit = 100, offset = 0) -> Promise<Array<{ id: number, name: string }>>`.
- Produces `getPlatforms(limit = 100, offset = 0) -> Promise<Array<{ id: number, name: string }>>`.
- Produces `getGamesByGenre(genreId, limit = 20, offset = 0) -> Promise<Array<IGDBGame>>`.
- Produces `getGamesByPlatform(platformId, limit = 20, offset = 0) -> Promise<Array<IGDBGame>>`.
- Extends `searchGames(query, limit = 20, offset = 0, filters = {})`; `filters` may contain positive integer `genreId` and `platformId` values.
- Exposes `GET /api/games/genres`, `GET /api/games/platforms`, `GET /api/games/genre/:genreId`, and `GET /api/games/platform/:platformId` before the catch-all `/:id` route.
- Category game routes return `{ results, count, next, previous }`; each result is formatted by `formatGameData()`.

- [x] **Step 1: Write route tests** in `backend/tests/games.test.js`: `GET /genres returns IGDB IDs and names`, `GET /platforms returns IGDB IDs and names`, `genre/platform routes return formatted results`, `rejects invalid IDs and page values without calling IGDB`, and `search forwards validated genre/platform filters`. Assert 400 for malformed/zero IDs and page < 1, plus the documented result shape.
- [x] **Step 2: Write service tests** in `backend/tests/igdbService.test.js`: `queries IGDB by genre ID` and `queries IGDB by platform ID`. Assert the endpoint and literal `where genres = 5` / `where platforms = 6` clauses passed to `makeRequest`.
- [x] **Step 3: Run the focused backend tests** with `cd backend && npx jest --runInBand tests/games.test.js tests/igdbService.test.js`. Expected: new route and query assertions fail because the methods and filters are missing.
- [x] **Step 4: Implement IGDB category list methods** in `backend/services/igdbService.js`, returning sorted `{id, name}` records.
- [x] **Step 5: Implement filtered list methods** in `backend/services/igdbService.js`, using category IDs and existing game fields.
- [x] **Step 6: Implement and validate routes** in `backend/routes/games.js`. Cap `page_size` at 40; calculate offset as `(page - 1) * page_size`; place named routes before `GET /:id`; preserve anonymous search-history behavior.
- [x] **Step 7: Verify** with the focused Jest command and `cd backend && npm test`. Expected: both commands pass.
- [x] **Step 8: Commit** after `git diff --check` passes.

### Task 2: Real genre/platform browsing and search pagination

**Files:**
- Modify: `frontend/src/services/gameService.js`
- Modify: `frontend/src/pages/Browse.js`
- Modify: `frontend/src/pages/Discover.js`

**Interfaces:**
- `gameService.getGenres()` and `gameService.getPlatforms()` return arrays of `{ id, name }`.
- `gameService.getGamesByGenre(id, page = 1, pageSize = 20)` and `getGamesByPlatform(id, page = 1, pageSize = 20)` return `{ results, count, next, previous }`.
- `gameService.searchGames(query, page = 1, pageSize = 20, filters = {})` preserves existing callers and returns the existing search response shape; `filters` may contain `genreId` and/or `platformId`.
- Browse links use `?genreId=<id>` or `?platformId=<id>`; Discover reads and preserves those parameters while paging.

- [x] **Step 1: Write service tests** in `frontend/src/services/__tests__/services.test.js`: `requests live genres and platforms` and `sends category filters and page size`. Assert the request URLs and encoded IDs.
- [x] **Step 2: Write Browse tests** in `frontend/src/pages/__tests__/Browse.test.js`: `renders IGDB genres and platforms` and `links a genre using its IGDB ID`. Use literal mock records `{id: 5, name: 'Shooter'}` and `{id: 6, name: 'PC'}`.
- [x] **Step 3: Write Discover tests** in `frontend/src/pages/__tests__/Discover.test.js`: `searches within the selected genre` and `loads the next page without losing query filters`. Assert the second request retains query and category IDs and the new result is appended once.
- [x] **Step 4: Run focused frontend tests** with `cd frontend && npm test -- --watchAll=false --runTestsByPath src/services/__tests__/services.test.js src/pages/__tests__/Browse.test.js src/pages/__tests__/Discover.test.js`. Expected: new methods and category result behavior fail.
- [x] **Step 5: Implement service methods** in `frontend/src/services/gameService.js`, preserving existing callers.
- [x] **Step 6: Implement Browse and Discover data flows** with loading, error, empty, and pagination states; preserve query parameters when loading more.
- [x] **Step 7: Verify** with the focused Jest command and `cd frontend && npm test -- --watchAll=false`. Expected: both commands pass.
- [x] **Step 8: Commit** after `git diff --check` passes.

### Task 3: Replace Home mock data and unsupported navigation claims

**Files:**
- Modify: `frontend/src/pages/Home.js`
- Modify: `frontend/src/components/Sidebar.js`
- Modify: `frontend/src/App.js`
- Delete or replace with redirects: `frontend/src/pages/News.js`, `frontend/src/pages/Community.js`
- Modify: `frontend/src/pages/Profile.js`

- [x] **Step 1: Write Home tests** in `frontend/src/pages/__tests__/Home.test.js`: `renders live trending, top-rated, and upcoming results`, `shows retry after section failure`, and `omits mock newsletter and feature claims`. Assert fixture-only titles and fake claims are absent.
- [x] **Step 2: Run the focused Home tests** with `cd frontend && npm test -- --watchAll=false --runTestsByPath src/pages/__tests__/Home.test.js`. Expected: tests fail because Home still uses fixed arrays and lacks retry UI.
- [x] **Step 3: Replace Home data** with `getTrendingGames`, `getTopRatedGames`, `getUpcomingGames`, and `getGenres`; render IGDB game IDs and metadata with loading, empty, error, and retry states.
- [x] **Step 4: Remove unsupported UI**: hardcoded Steam arrays, fixed scores/dates, fake recommendation copy, and the local-only newsletter form.
- [x] **Step 5: Replace unsupported navigation**: remove the Sidebar's platform-as-title-search shortcuts in favor of the live platform list in Browse; redirect `/news` and `/community` to supported discovery destinations.
- [x] **Step 6: Remove unsupported profile progress**: remove XP/level/Pro and infinite-games UI while retaining username, email, favorite count, and search-history count.
- [x] **Step 7: Verify** with the focused Home tests and `cd frontend && npm test -- --watchAll=false`. Expected: both commands pass.
- [x] **Step 8: Commit** after confirming no Home fixture arrays remain and `git diff --check` passes.
