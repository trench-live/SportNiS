import { AuthCard } from "../components/profile/AuthCard";
import { DeleteProfileDialog } from "../components/profile/DeleteProfileDialog";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { ProfileEditForm } from "../components/profile/ProfileEditForm";
import { ProfileOverviewCard } from "../components/profile/ProfileOverviewCard";
import { ProfileSwitchCard } from "../components/profile/ProfileSwitchCard";

export function ProfileScreen(props) {
  if (props.isGuest) {
    return (
      <section className="screen">
        <div className="glass-panel profile-hero">
          <div className="eyebrow">Гостевой режим</div>
          <h2>Профиль</h2>
          <p>Регистрация, вход, переключение ролей и базовая работа с профилем проходят здесь.</p>
        </div>

        <AuthCard
          guestStep={props.guestStep}
          registerForm={props.registerForm}
          setRegisterForm={props.setRegisterForm}
          loginForm={props.loginForm}
          setLoginForm={props.setLoginForm}
          authBusy={props.authBusy}
          authError={props.authError}
          onStartRegistration={props.onStartRegistration}
          onOpenLogin={props.onOpenLogin}
          onChooseRegisterRole={props.onChooseRegisterRole}
          onBackToIntro={props.onBackToIntro}
          onBackToRoleSelection={props.onBackToRoleSelection}
          onRegister={props.onRegister}
          onLogin={props.onLogin}
        />
      </section>
    );
  }

  return (
    <>
      <section className="screen">
        <div className="glass-panel profile-hero">
          <div className="profile-hero-main">
            <ProfileAvatar
              avatarUrl={props.profileForm?.avatarUrl || props.profile?.avatarUrl}
              displayName={props.profileForm?.displayName || props.profile?.displayName}
              size="xl"
            />
            <div>
              <div className="eyebrow">Аккаунт</div>
              <h2>{props.profile?.displayName || "Профиль"}</h2>
              <p>{props.authMe?.email || props.authMe?.phone || "Контакт не найден"}</p>
            </div>
          </div>
          <div className="hero-actions">
            <button className="secondary-button delete-button" onClick={props.onOpenDeleteProfileDialog}>
              Удалить профиль
            </button>
            <button className="secondary-button" onClick={props.onLogout}>
              Выйти
            </button>
          </div>
        </div>

        {props.profileError ? <div className="message error-message">{props.profileError}</div> : null}
        {props.profileMessage ? (
          <div className={props.profileMessageVisible ? "message success-message toast-visible" : "message success-message toast-hidden"}>
            {props.profileMessage}
          </div>
        ) : null}

        <div className="profile-grid">
          <ProfileOverviewCard
            profile={props.profile}
            profileBusy={props.profileBusy}
            onSearchingToggle={props.onSearchingToggle}
          />
          <ProfileSwitchCard
            myProfiles={props.myProfiles}
            onSwitchProfile={props.onSwitchProfile}
            addProfileOpen={props.addProfileOpen}
            addProfileBusy={props.addProfileBusy}
            addProfileForm={props.addProfileForm}
            setAddProfileForm={props.setAddProfileForm}
            onToggleAddProfile={props.onToggleAddProfile}
            onCreateProfile={props.onCreateProfile}
          />
        </div>

        <ProfileEditForm
          profileForm={props.profileForm}
          setProfileForm={props.setProfileForm}
          profileBusy={props.profileBusy}
          onProfileSave={props.onProfileSave}
        />
      </section>

      <DeleteProfileDialog
        isOpen={props.deleteProfileDialogOpen}
        busy={props.profileBusy}
        onClose={props.onCloseDeleteProfileDialog}
        onConfirm={props.onConfirmDeleteCurrentProfile}
      />
    </>
  );
}
