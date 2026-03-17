# Sportnis Discovery Rules (MVP Draft)

## Status
- Version: draft-10
- Date: 2026-03-17

## Discovery Purpose
- `Profile` answers "who you are".
- `Provider listing` answers "what you offer right now".
- `Consumer` visibility in discovery is controlled by profile flag `isLookingFor`.

## Listing Types
- `OFFER` - offer from provider side.

## Profile Type Matrix
- `CONSUMER` profile does not create listings in MVP.
- `CONSUMER` profile can be shown in discovery if `isLookingFor = true`.
- `PROVIDER` profile can create only `OFFER` listings.
- `PROVIDER` profile can have multiple active `OFFER` listings in MVP.
- Active exact duplicates of provider offers from the same profile are rejected as spam protection.

## Unified Model
- Listings are kept only for provider-side offers in MVP.
- Consumer discovery goes through profile visibility, not through pseudo-request listings.

## Listing Statuses
- `PUBLISHED`
- `ARCHIVED`
- `CLOSED`

## Core Fields
- `id`
- `ownerProfileId`
- `type` (`OFFER` in current MVP implementation)
- `title`
- `description`
- `contactInfo` (nullable)
- `tags`
- `city`
- `format` (`ONLINE`/`OFFLINE`/`HYBRID`)
- `priceFrom`
- `priceTo` (nullable)
- `currency` (fixed `RUB` in MVP)
- `expiresAt` (nullable)
- `manualCloseOnly` (boolean, default `false`)
- `createdAt`
- `updatedAt`

## Deferred Fields (Not in MVP Core)
- `ownerProfileType` (derived from `ownerProfileId` via profile relation)

## Interaction Rules
- Any `PUBLISHED` listing can receive responses from other users.
- Listing owner can manually close listing (`CLOSED`) when goal is reached.
- Interaction history should remain available after close/archive.
- MVP contact policy: `Contact After Accepted`.
- Listing owner contact is visible to responder only after response status `ACCEPTED`.
- No in-app chat in MVP listings scope.
- Response message is optional in MVP.

## Listing Response Rules
- Response entity is stored separately from listing.
- Response statuses: `NEW`, `ACCEPTED`, `REJECTED`.
- One profile can create only one response per listing.
- Listing owner cannot respond to own listing.
- New responses are allowed only for `PUBLISHED` listings.
- `contactInfo` becomes visible to listing owner and to responder only after that responder status becomes `ACCEPTED`.

## Consumer Discovery Rules
- `CONSUMER` profile enters discovery only when `isLookingFor = true`.
- `isLookingFor` can be changed only for active consumer profile.
- Public endpoint `/api/v1/profiles/public/searching` returns public consumer profiles currently in search.

## Lifetime Rules
- If `manualCloseOnly = true`, listing stays active until owner closes it manually.
- If `manualCloseOnly = false` and `expiresAt` is reached, listing is auto-closed (`CLOSED`).

## Validation Rules
- If `manualCloseOnly = true`, then `expiresAt` must be `null`.
- If `manualCloseOnly = false`, `expiresAt` may be `null` or set.
- `expiresAt`, if set, must be in the future at publish time.
- `currency` is always `RUB` in MVP (no user-side selection).
