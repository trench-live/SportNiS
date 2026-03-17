CREATE TABLE listings
(
    id                UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    owner_profile_id  UUID        NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    type              VARCHAR(32) NOT NULL,
    status            VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
    title             VARCHAR(255) NOT NULL,
    description       TEXT        NOT NULL,
    city              VARCHAR(120),
    format            VARCHAR(32) NOT NULL,
    price_from        NUMERIC(12, 2),
    price_to          NUMERIC(12, 2),
    currency          VARCHAR(3)  NOT NULL DEFAULT 'RUB',
    expires_at        TIMESTAMPTZ,
    manual_close_only BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_listings_type
        CHECK (type IN ('REQUEST', 'OFFER')),
    CONSTRAINT chk_listings_status
        CHECK (status IN ('PUBLISHED', 'ARCHIVED', 'CLOSED')),
    CONSTRAINT chk_listings_format
        CHECK (format IN ('ONLINE', 'OFFLINE', 'HYBRID')),
    CONSTRAINT chk_listings_currency_rub
        CHECK (currency = 'RUB'),
    CONSTRAINT chk_listings_manual_close_expires
        CHECK (NOT manual_close_only OR expires_at IS NULL),
    CONSTRAINT chk_listings_price_from_non_negative
        CHECK (price_from IS NULL OR price_from >= 0),
    CONSTRAINT chk_listings_price_to_non_negative
        CHECK (price_to IS NULL OR price_to >= 0),
    CONSTRAINT chk_listings_price_range
        CHECK (price_from IS NULL OR price_to IS NULL OR price_to >= price_from)
);

CREATE INDEX idx_listings_owner_profile_id ON listings (owner_profile_id);
CREATE INDEX idx_listings_status_created_at ON listings (status, created_at DESC);
CREATE INDEX idx_listings_expires_at ON listings (expires_at);

CREATE TABLE listing_tags
(
    listing_id UUID        NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    tag        VARCHAR(80) NOT NULL,
    PRIMARY KEY (listing_id, tag)
);
