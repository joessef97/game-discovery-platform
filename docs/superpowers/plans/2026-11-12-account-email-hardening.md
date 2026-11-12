# Account and Email Hardening Implementation Plan

> **For agentic workers:** Keep the tasks in this plan ordered. Use TDD: write each named regression test, observe its expected failure, implement the smallest change, then run the focused test and full suite.

**Goal:** Remove unauthenticated email-sending exposure and prevent password-reset token leakage while keeping the auth flow’s existing responses.

**Architecture:** Keep Resend and the current Express auth routes. Restrict test email delivery to the authenticated account, remove the public test route, and ensure reset failure handling never logs a raw reset URL or token.

**Tech Stack:** Express, express-validator, JWT, MongoDB/Mongoose, Resend.

**Spec:** `docs/superpowers/specs/2026-11-12-live-game-discovery-design.md`

## Global Constraints

- Keep the existing account registration/login and password recovery flows.
- Keep the same generic password-reset response for existing and nonexistent addresses.
- Never log password-reset URLs or raw reset tokens.
- Keep the React, Express, MongoDB, and IGDB architecture.

## Review Focus

- Unauthenticated calls to the email test endpoint cannot deliver mail.
- An authenticated caller cannot choose an arbitrary recipient for test mail.
- Missing/invalid reset email configuration produces no token-bearing log output.
- Login and registration user objects contain `createdAt` but never contain password or reset-token fields.

---

### Task 1: Restrict email test delivery and remove the public endpoint

**Files:**
- Modify: `backend/routes/email.js`

**Interfaces:**
- `POST /api/email/test` remains authenticated and sends only to `req.user.email`.
- `POST /api/email/test-public` is removed.

- [x] **Step 1: Write endpoint tests** in `backend/tests/email.test.js`: `requires authentication`, `sends test mail only to the authenticated account`, and `removes the public test endpoint`. Assert 401, recipient is the signed-in user even when `to` is supplied, and the removed route returns 404.
- [x] **Step 2: Run focused backend tests** with `cd backend && npx jest --runInBand tests/email.test.js`. Expected: the public route is still reachable and recipient override is forwarded.
- [x] **Step 3: Remove the public route** and its `TEST_EMAIL_SECRET` fallback/unused validation imports from `backend/routes/email.js`.
- [x] **Step 4: Restrict authenticated delivery** to `req.user.email`, ignoring request-supplied recipients.
- [x] **Step 5: Verify** with the focused Jest command and `cd backend && npm test`. Expected: both commands pass.
- [x] **Step 6: Commit** after confirming auth middleware precedes mail sending and `git diff --check` passes.

### Task 2: Prevent reset-token disclosure and return complete safe user data

**Files:**
- Modify: `backend/routes/auth.js`

**Interfaces:**
- `safeUser(user)` includes `createdAt` alongside the existing safe account fields.
- Forgot-password responses remain generic and never include the reset URL or token.

- [x] **Step 1: Write auth tests** in `backend/tests/auth.test.js`: `returns createdAt on registration and login` and `does not log a reset URL when email delivery fails`. Assert createdAt exists, password/reset fields are absent, known/unknown reset messages match, and captured logs contain no raw URL/token.
- [x] **Step 2: Run focused auth tests** with `cd backend && npx jest --runInBand tests/auth.test.js`. Expected: createdAt is absent and reset failure logs include the raw URL.
- [x] **Step 3: Add `createdAt`** to the safe account response in `backend/routes/auth.js`.
- [x] **Step 4: Remove reset URL logging** when email delivery fails while preserving the generic response for known and unknown addresses.
- [x] **Step 5: Verify** with the focused Jest command and `cd backend && npm test`. Expected: both commands pass.
- [x] **Step 6: Commit** after `git diff --check` passes.

### Review follow-up: verify the account email before test delivery

- [x] Add hashed, 24-hour single-use email verification tokens and a resend path.
- [x] Send verification email after registration and welcome email after confirmation.
- [x] Block authenticated test email until `emailVerified` is true.
- [x] Add a verification completion page and a Profile resend action.
- [x] Verify token reuse fails and resend uses a fresh token; full suites/build pass.
