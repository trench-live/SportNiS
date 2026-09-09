-- username больше не обязателен: вход идёт по email/phone, публичная личность — displayName.
-- Колонку оставляем (nullable) на будущее под возможные @username-хендлы.
-- Уникальный индекс (nulls distinct) и CHECK-регэксп (NULL проходит) NULL-значения терпят.
ALTER TABLE users
    ALTER COLUMN username DROP NOT NULL;
