import { useEffect, useMemo, useState } from "react";

function getInitials(displayName) {
  if (!displayName) {
    return "SP";
  }

  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "SP";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function ProfileAvatar({ avatarUrl, displayName, size = "md", className = "" }) {
  const [broken, setBroken] = useState(false);
  const hasImage = Boolean(avatarUrl) && !broken;
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const classes = ["profile-avatar", `profile-avatar-${size}`, className].filter(Boolean).join(" ");

  useEffect(() => {
    setBroken(false);
  }, [avatarUrl]);

  return (
    <div className={classes} aria-label={displayName || "Аватар профиля"}>
      {hasImage ? (
        <img
          src={avatarUrl}
          alt={displayName || "Аватар профиля"}
          onError={() => setBroken(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
