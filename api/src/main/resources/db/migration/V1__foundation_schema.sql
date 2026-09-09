CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE,
    phone         VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status        VARCHAR(32)  NOT NULL,
    system_role   VARCHAR(32)  NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'BLOCKED', 'ON_REVIEW', 'DELETED')),
    CONSTRAINT chk_users_system_role
        CHECK (system_role IN ('USER', 'ADMIN', 'SUPPORT', 'PARTNER')),
    CONSTRAINT chk_users_contact_present
        CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE profiles
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    market_side      VARCHAR(32)  NOT NULL,
    profile_type     VARCHAR(32)  NOT NULL,
    display_name     VARCHAR(255) NOT NULL,
    avatar_url       TEXT,
    city             VARCHAR(120),
    about            TEXT,
    is_public        BOOLEAN      NOT NULL DEFAULT TRUE,
    is_email_public  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_phone_public  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_profiles_market_side
        CHECK (market_side IN ('CONSUMER', 'PROVIDER')),
    CONSTRAINT chk_profiles_type
        CHECK (profile_type IN ('ATHLETE', 'COACH', 'ORGANIZATION')),
    CONSTRAINT chk_profiles_type_side
        CHECK (
            (profile_type = 'ATHLETE' AND market_side = 'CONSUMER') OR
            (profile_type IN ('COACH', 'ORGANIZATION') AND market_side = 'PROVIDER')
            )
);

CREATE TABLE profile_sports
(
    profile_id UUID        NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    sport      VARCHAR(80) NOT NULL,
    PRIMARY KEY (profile_id, sport)
);

CREATE TABLE athlete_profile_details
(
    profile_id               UUID PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
    birth_year               INTEGER,
    experience_years         INTEGER,
    sport_rank               VARCHAR(120),
    competitive_achievements TEXT,
    sports_goals             TEXT,
    resume_markdown          TEXT
);

CREATE TABLE coach_profile_details
(
    profile_id        UUID PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
    education         TEXT,
    certificates      TEXT,
    experience_years  INTEGER,
    training_format   VARCHAR(120),
    price_from        NUMERIC(12, 2),
    price_currency    VARCHAR(3),
    price_notes       TEXT
);

CREATE TABLE coach_specializations
(
    profile_id      UUID         NOT NULL REFERENCES coach_profile_details (profile_id) ON DELETE CASCADE,
    specialization  VARCHAR(120) NOT NULL,
    PRIMARY KEY (profile_id, specialization)
);

CREATE TABLE organization_profile_details
(
    profile_id            UUID PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
    organization_type     VARCHAR(120),
    legal_name            VARCHAR(255),
    address               VARCHAR(500),
    working_hours         TEXT,
    facility_description  TEXT,
    website               VARCHAR(500)
);
