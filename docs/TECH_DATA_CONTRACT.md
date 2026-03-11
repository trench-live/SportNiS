# Sportnis MVP Technical Data Contract (Stage 2)

## Status
- Version: draft-1
- Date: 2026-03-10
- Scope: data + API contract baseline for next implementation stage

## 1) User Model Changes

### New field: `username`
- Table: `users`
- Type: `VARCHAR(32)`
- Nullability: `NOT NULL`
- Uniqueness: unique, case-insensitive (unique index on `LOWER(username)`)
- Validation rules:
  - length: `3..32`
  - allowed chars: `a-z`, `0-9`, `_`, `.`
  - normalized to lower-case on save

### New field: `onboarding_step`
- Table: `users`
- Type: `VARCHAR(32)`
- Nullability: `NOT NULL`
- Default: `REGISTERED`
- Allowed values:
  - `REGISTERED` — user just registered with minimal data
  - `PROFILE_BASICS_FILLED` — user filled base profile fields
  - `DONE` — onboarding completed for initial flow

### Existing fields (kept)
- `email` or `phone` is required (at least one).
- `password_hash`, `status`, `system_role`, `active_profile_id` are kept as-is.

## 2) Profile Defaults for "Empty Profile"

When profile is created on registration (minimal flow), fields are initialized as:
- `display_name`: generated default by type:
  - `CONSUMER` -> `New consumer`
  - `PROVIDER` -> `New provider`
- `avatar_url`: `NULL`
- `city`: `NULL`
- `about`: `NULL`
- `sports_tags`: empty set
- privacy flags:
  - `is_public = true`
  - `is_email_public = false`
  - `is_phone_public = false`

Details tables on registration:
- `consumer_details` / `provider_details` rows are not required at registration time.
- They can be created lazily on first update.

## 3) Registration Contract (Target)

### Request (`POST /api/v1/auth/register`)
- `email` (optional, if `phone` provided)
- `phone` (optional, if `email` provided)
- `password` (required)
- `username` (required)
- `profileType` (`CONSUMER` or `PROVIDER`, required)

### Response
- same auth payload style as now (token + user/profile identifiers)

### Removed from required registration inputs
- `displayName` is no longer required in register request.

## 4) Onboarding Step Transitions

- on register: `REGISTERED`
- after successful `PUT /api/v1/profiles/me` with non-default meaningful values: `PROFILE_BASICS_FILLED`
- optional finalization step (later): `DONE`

Note:
- This is account-level onboarding for MVP.
- Profile completion per-profile can be added later if needed.

## 5) Security / Lifecycle Rules (Confirmed)

- Profile cannot be deleted by user.
- Profile can be cleared (`POST /api/v1/profiles/{id}/clear`).
- Account can be deleted (`DELETE /api/v1/auth/me`).

## 6) Migration Plan for Next Stage

Required DB changes:
1. Add `users.username` (+ backfill strategy for existing rows in local/dev DB).
2. Add case-insensitive unique index for username.
3. Add `users.onboarding_step` with check constraint and default.
4. Keep existing profile schema; no profile soft-delete columns.

## 7) Open Points Before Coding Stage

- Final regex for `username` (current proposal: `^[a-z0-9._]{3,32}$`).
- Exact rule for moving from `PROFILE_BASICS_FILLED` to `DONE`.
