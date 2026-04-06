import { AddProfileForm } from "./AddProfileForm";
import { ProfileAvatar } from "./ProfileAvatar";

export function ProfileSwitchCard({
  myProfiles,
  onSwitchProfile,
  addProfileOpen,
  addProfileBusy,
  addProfileForm,
  setAddProfileForm,
  onToggleAddProfile,
  onCreateProfile
}) {
  return (
    <div className="glass-card profile-card profile-switch-card" id="profile-switch-card">
      <div className="card-head profile-switch-head">
        <h3>Профили аккаунта</h3>
        <div className="card-head-actions profile-switch-head-actions">
          <button className="secondary-button add-profile-button" type="button" onClick={onToggleAddProfile}>
            {addProfileOpen ? "Скрыть форму" : "Добавить профиль"}
          </button>
          <span className="muted-text">{myProfiles.length} шт.</span>
        </div>
      </div>

      {addProfileOpen ? (
        <AddProfileForm
          busy={addProfileBusy}
          form={addProfileForm}
          setForm={setAddProfileForm}
          onSubmit={onCreateProfile}
        />
      ) : null}

      {addProfileOpen ? null : (
        <div className="profile-switch-list profile-switch-scroll">
          {myProfiles.map((item) => (
            <button
              key={item.id}
              className={item.active ? "switch-card active-switch" : "switch-card"}
              onClick={() => onSwitchProfile(item.id)}
            >
              <span className="switch-card-main">
                <ProfileAvatar
                  avatarUrl={item.avatarUrl}
                  displayName={item.displayName}
                  size="sm"
                />
                <span className="switch-card-copy">
                  <span>{item.displayName}</span>
                  <span>{item.profileType}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
