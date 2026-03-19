ALTER TABLE consumer_details
    ADD COLUMN is_looking_for BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE consumer_details cd
SET is_looking_for = p.is_looking_for
FROM profiles p
WHERE p.id = cd.profile_id;

ALTER TABLE profiles
    DROP COLUMN is_looking_for;
