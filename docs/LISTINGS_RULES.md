# Sportnis Listings Rules (MVP Draft)

## Status
- Version: draft-7
- Date: 2026-03-12

## Listing Purpose
- `Profile` answers "who you are".
- `Listing` answers "what you need/offer right now".

## Listing Types
- `REQUEST` - demand from consumer side.
- `OFFER` - offer from provider side.

## Unified Model
- Single listing model for both sides.
- No extra sub-type field in MVP (no `offerMode`).
- Differences between `REQUEST` and `OFFER` are handled by `type` and UI.

## Listing Statuses
- `PUBLISHED`
- `ARCHIVED`
- `CLOSED`

## Core Fields
- `id`
- `ownerProfileId`
- `type` (`REQUEST`/`OFFER`)
- `title`
- `description`
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

## Lifetime Rules
- If `manualCloseOnly = true`, listing stays active until owner closes it manually.
- If `manualCloseOnly = false` and `expiresAt` is reached, listing is auto-closed (`CLOSED`).

## Validation Rules
- If `manualCloseOnly = true`, then `expiresAt` must be `null`.
- If `manualCloseOnly = false`, `expiresAt` may be `null` or set.
- `expiresAt`, if set, must be in the future at publish time.
- `currency` is always `RUB` in MVP (no user-side selection).
