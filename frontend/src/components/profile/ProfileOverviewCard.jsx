export function ProfileOverviewCard({ profile, profileBusy, onSearchingToggle }) {
  return (
    <div className="glass-card profile-card">
      <div className="card-head">
        <h3>Активный профиль</h3>
        <span className="type-pill profile-pill">{profile?.profileType}</span>
      </div>
      <div className="profile-summary">
        <p><strong>Имя:</strong> {profile?.displayName || "не указано"}</p>
        <p><strong>Город:</strong> {profile?.city || "не указан"}</p>
        <p><strong>Теги:</strong> {(profile?.sportsTags || []).join(", ") || "нет"}</p>
        <p><strong>О себе:</strong> {profile?.about || "не заполнено"}</p>
        <p><strong>Публичность:</strong> {profile?.isPublic ? "публичный" : "скрыт"}</p>
        {profile?.profileType === "CONSUMER" ? (
          <p><strong>В поиске:</strong> {profile?.isLookingFor ? "да" : "нет"}</p>
        ) : null}
      </div>
      {profile?.profileType === "CONSUMER" ? (
        <button className="primary-button" disabled={profileBusy} onClick={onSearchingToggle}>
          {profile?.isLookingFor ? "Выключить режим поиска" : "Включить режим поиска"}
        </button>
      ) : null}
    </div>
  );
}
