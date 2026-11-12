# Game Lookup and Collections Implementation Plan

> **For agentic workers:** Keep the tasks in this plan ordered. Use TDD: write each named regression test, observe its expected failure, implement the smallest change, then run the focused test and full suite.

**Goal:** Ensure Steam links never resolve by confusing Steam IDs with IGDB IDs and allow favoriting games even when IGDB has no cover image.

**Architecture:** Keep IGDB name matching and external-game source resolution. If both lookups fail, return not-found. Keep favorites embedded on the user document and treat artwork as optional, consistent with wishlist behavior.

**Tech Stack:** Express, Mongoose, IGDB API, React.

**Spec:** `docs/superpowers/specs/2026-11-12-live-game-discovery-design.md`

## Global Constraints

- Use IGDB IDs for game detail URLs and data.
- Do not treat Steam App IDs as IGDB game IDs.
- Keep per-user authorization and existing collection behavior intact.
- Allow favorites without cover images, matching wishlist behavior.

## Review Focus

- A valid Steam App ID with no name match and no IGDB external-game mapping returns not-found.
- An external-game mapping still resolves to the mapped IGDB game.
- A game with no cover can be favorited and appears with a visual fallback.
- Duplicate favorite behavior remains unchanged.

---

### Task 1: Remove the incorrect Steam-ID fallback

**Files:**
- Modify: `backend/services/igdbService.js`

**Interfaces:**
- `getGameBySteamId(steamAppId, gameName = null)` returns a matched IGDB game or `null`.

- [x] **Step 1: Write Steam lookup tests** in `backend/tests/igdbService.test.js`: `returns null when Steam name and external ID lookups miss` and `resolves Steam external ID to the mapped IGDB ID`. Assert the miss returns `null` and a mapping resolves its IGDB game ID.
- [x] **Step 2: Run focused backend tests** with `cd backend && npx jest --runInBand tests/igdbService.test.js`. Expected: a missing external mapping falls through to a Steam-ID detail lookup instead of returning `null`.
- [x] **Step 3: Remove the incorrect fallback** in `backend/services/igdbService.js`; retain name matching and `external_games` resolution.
- [x] **Step 4: Verify** with the focused Jest command and `cd backend && npm test`. Expected: both commands pass.
- [x] **Step 5: Commit** after comments describe only valid ID sources and `git diff --check` passes.

### Task 2: Permit favorites without cover artwork

**Files:**
- Modify: `backend/routes/favorites.js`
- Modify if needed: `frontend/src/pages/Favorites.js`

**Interfaces:**
- `POST /api/favorites` requires `gameId` and `gameName`; `gameImage` is optional and defaults to an empty string.

- [x] **Step 1: Write the favorite test** in `backend/tests/favorites.test.js`: `accepts a favorite without a cover image`; assert status 201 and stored `gameImage` is `''`.
- [x] **Step 2: Run the focused test** with `cd backend && npx jest --runInBand tests/favorites.test.js`. Expected: the route rejects the missing image with status 400.
- [x] **Step 3: Make artwork optional** in `backend/routes/favorites.js`, preserving ID/name validation and duplicate checks; accept only positive decimal IGDB IDs and compare duplicates using the parsed ID.
- [x] **Step 4: Verify** with the focused Jest command and `cd backend && npm test`. Expected: both commands pass. Confirm `frontend/src/pages/Favorites.js` uses its existing placeholder when the stored image is empty.
- [x] **Step 5: Commit** after `git diff --check` passes.
