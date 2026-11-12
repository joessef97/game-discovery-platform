# Live Game Discovery Design

## Goal

Make the existing game discovery experience reflect current IGDB data and remove claims or flows that are currently backed only by hardcoded mock content. Correct the security and data-resolution issues found in the repository review while keeping the React, Express, MongoDB, and IGDB architecture.

## Product scope

- Home trending, top-rated, and upcoming sections use the existing IGDB-backed endpoints. Cards show IGDB game IDs, current metadata, ratings, genres, and release dates. Remove fake personalized recommendations, newsletter success state, and unsupported achievements/community claims.
- Genre browsing uses IGDB genre IDs and genre-filtered results rather than searching game titles for genre words. Search and browse expose pagination so users can reach results after the first page.
- News and Community currently have no real data provider or social backend. Remove these mock-feed pages and their navigation entries; retain navigation to supported discovery features such as charts and upcoming releases.
- Remove unsupported XP/level/Pro progress presentation from the sidebar/profile unless backed by actual user progression data. Keep real identity, favorite counts, and search history.
- Keep account registration/login, favorites, wishlist, search history, profile identity, password recovery, charts, upcoming releases, and game details.

## Backend and data flow

Add IGDB genre list and genre-filtered games methods to `backend/services/igdbService.js`. Expose validated, paginated endpoints from `backend/routes/games.js`; return the same formatted game shape already used by search and charts. Frontend services call those endpoints, while Browse and Discover render loading, empty, error, and paginated states.

Home will use those existing services instead of Steam-ID fixtures. All game links will use IGDB IDs and the standard detail route. If a dynamic section fails, show a visible retry/error state rather than silently presenting stale fixtures.

## Correctness and security fixes

- Remove the public email test route and its guessable fallback secret. The authenticated test route sends only to the authenticated account’s verified address, not an arbitrary request-provided recipient.
- Never log password-reset URLs or raw reset tokens when email delivery fails. Keep the same generic response for existing and nonexistent addresses.
- When Steam title search and IGDB `external_games` lookup fail, return not-found instead of treating a Steam App ID as an IGDB game ID.
- Include `createdAt` in the safe login/register user response so Profile can render membership time immediately.
- Allow favorites without cover images, matching wishlist behavior; render the existing visual fallback for missing artwork.
- Keep per-user authorization and existing collection behavior intact.

## Error handling and verification

Validate genre identifiers, page numbers, and page sizes before using them in IGDB queries. Preserve the project’s existing response conventions and show errors in the UI. The existing CI workflow covers backend tests, frontend tests, and the production build. No local test run is planned for this change; changes will be reviewed against the existing test coverage and the CI workflow after they are pushed.

## Out of scope

Adding a third-party gaming news provider, implementing public player posts/comments, or introducing personalized/AI recommendations, achievements, user XP, or subscription tiers. These require product choices and data sources that are not present in the current repository.
