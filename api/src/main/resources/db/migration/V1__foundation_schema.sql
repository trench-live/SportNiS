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
    active_profile_id UUID,
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
    user_id          UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
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
    CONSTRAINT chk_profiles_type
        CHECK (profile_type IN ('CONSUMER', 'PROVIDER'))
);

CREATE INDEX idx_profiles_user_id ON profiles (user_id);

CREATE TABLE profile_sports
(
    profile_id UUID        NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    sport      VARCHAR(80) NOT NULL,
    PRIMARY KEY (profile_id, sport)
);

CREATE TABLE consumer_details
(
    profile_id       UUID PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
    birth_year       INTEGER,
    experience_level VARCHAR(120),
    goals            TEXT,
    preferences      TEXT
);

CREATE TABLE provider_details
(
    profile_id         UUID PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
    experience_years   INTEGER,
    qualifications     TEXT,
    training_format    VARCHAR(120),
    price_from         NUMERIC(12, 2),
    price_currency     VARCHAR(3),
    service_conditions TEXT
);

CREATE OR REPLACE FUNCTION ensure_consumer_profile_type()
    RETURNS TRIGGER AS
$$
BEGIN
    IF (SELECT profile_type FROM profiles WHERE id = NEW.profile_id) <> 'CONSUMER' THEN
        RAISE EXCEPTION 'consumer_details can only reference CONSUMER profile';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_provider_profile_type()
    RETURNS TRIGGER AS
$$
BEGIN
    IF (SELECT profile_type FROM profiles WHERE id = NEW.profile_id) <> 'PROVIDER' THEN
        RAISE EXCEPTION 'provider_details can only reference PROVIDER profile';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consumer_details_profile_type
    BEFORE INSERT OR UPDATE
    ON consumer_details
    FOR EACH ROW
EXECUTE FUNCTION ensure_consumer_profile_type();

CREATE TRIGGER trg_provider_details_profile_type
    BEFORE INSERT OR UPDATE
    ON provider_details
    FOR EACH ROW
EXECUTE FUNCTION ensure_provider_profile_type();

ALTER TABLE users
    ADD CONSTRAINT fk_users_active_profile
        FOREIGN KEY (active_profile_id) REFERENCES profiles (id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION ensure_active_profile_belongs_to_user()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.active_profile_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = NEW.active_profile_id
          AND p.user_id = NEW.id
    ) THEN
        RAISE EXCEPTION 'active_profile_id must belong to the same user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_active_profile_owner
    BEFORE INSERT OR UPDATE OF active_profile_id, id
    ON users
    FOR EACH ROW
EXECUTE FUNCTION ensure_active_profile_belongs_to_user();
