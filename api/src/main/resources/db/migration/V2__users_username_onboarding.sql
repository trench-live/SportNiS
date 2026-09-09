ALTER TABLE users
    ADD COLUMN username VARCHAR(32);

UPDATE users
SET username = 'user_' || substring(replace(id::text, '-', '') FROM 1 FOR 12)
WHERE username IS NULL;

ALTER TABLE users
    ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX uq_users_username_lower
    ON users (LOWER(username));

ALTER TABLE users
    ADD CONSTRAINT chk_users_username_format
        CHECK (username ~ '^[a-z0-9._]{3,32}$');

ALTER TABLE users
    ADD COLUMN onboarding_step VARCHAR(32) DEFAULT 'REGISTERED';

UPDATE users
SET onboarding_step = 'REGISTERED'
WHERE onboarding_step IS NULL;

ALTER TABLE users
    ALTER COLUMN onboarding_step SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT chk_users_onboarding_step
        CHECK (onboarding_step IN ('REGISTERED', 'PROFILE_BASICS_FILLED', 'DONE'));
