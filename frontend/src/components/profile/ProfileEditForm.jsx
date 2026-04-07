import { AvatarUploadField } from "./AvatarUploadField";

function PrivacyToggle({ checked, title, description, onChange }) {
  return (
    <label className="privacy-toggle-card">
      <span className="privacy-toggle-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

export function ProfileEditForm({ profileForm, setProfileForm, profileBusy, onProfileSave }) {
  return (
    <form className="glass-panel profile-edit-form" onSubmit={onProfileSave}>
      <div className="profile-edit-section">
        <div className="profile-edit-head">
          <h3>Заполнение профиля</h3>
          <p>Собери публичную карточку так, как она будет выглядеть для других пользователей.</p>
        </div>

        <div className="profile-edit-top-grid">
          <div className="profile-edit-card">
            <AvatarUploadField
              onChange={(nextAvatar) =>
                setProfileForm((current) => ({ ...current, avatarUrl: nextAvatar }))
              }
            />
          </div>

          <div className="profile-edit-card identity-card">
            <div className="field-block">
              <span>Имя профиля</span>
              <input
                value={profileForm.displayName}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                }
                placeholder="Например, Coach Alex"
              />
            </div>
            <div className="field-block">
              <span>Город</span>
              <input
                value={profileForm.city}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="Москва"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="profile-edit-section">
        <div className="field-block">
          <span>О себе</span>
          <textarea
            value={profileForm.about}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, about: event.target.value }))
            }
            placeholder="Кто вы, чем занимаетесь, кого ищете или что предлагаете."
          />
        </div>
      </div>

      <div className="profile-edit-section">
        <div className="field-block">
          <span>Теги</span>
          <input
            value={profileForm.sportsTags}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, sportsTags: event.target.value }))
            }
            placeholder="running, football"
          />
        </div>
      </div>

      <div className="profile-edit-section">
        <div className="profile-edit-subhead">
          <h4>Приватность</h4>
          <p>Определи, что смогут видеть другие пользователи.</p>
        </div>

        <div className="privacy-toggle-grid">
          <PrivacyToggle
            checked={profileForm.isPublic}
            title="Публичный профиль"
            description="Профиль будет виден в каталоге и других публичных сценариях."
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, isPublic: event.target.checked }))
            }
          />
          <PrivacyToggle
            checked={profileForm.isEmailPublic}
            title="Публичный email"
            description="Email будет показан в профиле, если это разрешено логикой продукта."
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, isEmailPublic: event.target.checked }))
            }
          />
          <PrivacyToggle
            checked={profileForm.isPhonePublic}
            title="Публичный телефон"
            description="Телефон будет виден другим пользователям, когда это допустимо."
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, isPhonePublic: event.target.checked }))
            }
          />
        </div>
      </div>

      <div className="profile-edit-actions">
        <button className="primary-button" disabled={profileBusy} type="submit">
          {profileBusy ? "Сохраняем..." : "Сохранить профиль"}
        </button>
      </div>
    </form>
  );
}
