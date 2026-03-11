ALTER TABLE profiles
    ADD COLUMN onboarding_step VARCHAR(32) DEFAULT 'REGISTERED';

UPDATE profiles p
SET onboarding_step = CASE u.onboarding_step
                          WHEN 'PROFILE_BASICS_FILLED' THEN 'PROFILE_BASICS_FILLED'
                          WHEN 'DONE' THEN 'DONE'
                          ELSE 'REGISTERED'
    END
FROM users u
WHERE u.active_profile_id = p.id;

UPDATE profiles
SET onboarding_step = 'REGISTERED'
WHERE onboarding_step IS NULL;

ALTER TABLE profiles
    ALTER COLUMN onboarding_step SET NOT NULL;

ALTER TABLE profiles
    ADD CONSTRAINT chk_profiles_onboarding_step
        CHECK (onboarding_step IN ('REGISTERED', 'PROFILE_BASICS_FILLED', 'DONE'));
