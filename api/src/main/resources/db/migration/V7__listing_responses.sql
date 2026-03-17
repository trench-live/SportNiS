CREATE TABLE listing_responses
(
    id                  UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    listing_id          UUID        NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    responder_profile_id UUID       NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    message             TEXT,
    status              VARCHAR(32) NOT NULL DEFAULT 'NEW',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_listing_responses_status
        CHECK (status IN ('NEW', 'ACCEPTED', 'REJECTED')),
    CONSTRAINT uk_listing_responses_listing_profile
        UNIQUE (listing_id, responder_profile_id)
);

CREATE INDEX idx_listing_responses_listing_id_created_at
    ON listing_responses (listing_id, created_at DESC);

CREATE INDEX idx_listing_responses_responder_profile_id
    ON listing_responses (responder_profile_id);
