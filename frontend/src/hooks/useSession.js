import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import {
  EMPTY_LOGIN,
  EMPTY_PROFILE_FORM,
  EMPTY_REGISTER,
  TOKEN_STORAGE_KEY
} from "../constants/auth";
import { EMPTY_ADD_PROFILE_FORM } from "../constants/profile";
import { useTimedMessage } from "./useTimedMessage";

function mapProfileToForm(profile) {
  if (!profile) {
    return EMPTY_PROFILE_FORM;
  }

  return {
    displayName: profile.displayName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    city: profile.city ?? "",
    about: profile.about ?? "",
    sportsTags: (profile.sportsTags ?? []).join(", "),
    isPublic: profile.isPublic,
    isEmailPublic: profile.isEmailPublic,
    isPhonePublic: profile.isPhonePublic
  };
}

export function useSession({ token, setToken, onAuthSuccess, onLogout }) {
  const [guestStep, setGuestStep] = useState("intro");
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [authMe, setAuthMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myProfiles, setMyProfiles] = useState([]);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const [addProfileBusy, setAddProfileBusy] = useState(false);
  const [addProfileForm, setAddProfileForm] = useState(EMPTY_ADD_PROFILE_FORM);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false);
  const {
    message: profileMessage,
    visible: profileMessageVisible,
    showMessage: showProfileMessage,
    clearMessage: clearProfileMessage
  } = useTimedMessage();

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAuthMe(null);
      setProfile(null);
      setMyProfiles([]);
      return;
    }

    let ignore = false;

    async function loadSession() {
      setSessionBusy(true);
      setProfileError("");
      try {
        const [meData, profileData, myProfilesData] = await Promise.all([
          apiRequest("/api/v1/auth/me", { token }),
          apiRequest("/api/v1/profiles/me", { token }),
          apiRequest("/api/v1/profiles/my", { token })
        ]);

        if (ignore) {
          return;
        }

        setAuthMe(meData);
        setProfile(profileData);
        setMyProfiles(myProfilesData);
      } catch (error) {
        if (!ignore) {
          setProfileError(error.message);
        }
      } finally {
        if (!ignore) {
          setSessionBusy(false);
        }
      }
    }

    loadSession();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    setProfileForm(mapProfileToForm(profile));
  }, [profile]);

  async function refreshSession() {
    if (!token) {
      return;
    }

    setSessionBusy(true);
    try {
      const [meData, profileData, myProfilesData] = await Promise.all([
        apiRequest("/api/v1/auth/me", { token }),
        apiRequest("/api/v1/profiles/me", { token }),
        apiRequest("/api/v1/profiles/my", { token })
      ]);
      setAuthMe(meData);
      setProfile(profileData);
      setMyProfiles(myProfilesData);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSessionBusy(false);
    }
  }

  function startRegistration() {
    setAuthError("");
    setGuestStep("role");
  }

  function openLogin() {
    setAuthError("");
    setGuestStep("login");
  }

  function chooseRegisterRole(profileType) {
    setAuthError("");
    setRegisterForm((current) => ({ ...current, profileType }));
    setGuestStep("register");
  }

  function backToIntro() {
    setAuthError("");
    setGuestStep("intro");
  }

  function backToRoleSelection() {
    setAuthError("");
    setGuestStep("role");
  }

  function toggleAddProfile() {
    setProfileError("");
    setAddProfileOpen((current) => !current);
  }

  function openDeleteProfileDialog() {
    setProfileError("");
    setDeleteProfileDialogOpen(true);
  }

  function closeDeleteProfileDialog() {
    setDeleteProfileDialogOpen(false);
  }

  async function handleRegister(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const data = await apiRequest("/api/v1/auth/register", {
        method: "POST",
        body: registerForm
      });
      setToken(data.token);
      setRegisterForm(EMPTY_REGISTER);
      setGuestStep("intro");
      onAuthSuccess();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const data = await apiRequest("/api/v1/auth/login", {
        method: "POST",
        body: loginForm
      });
      setToken(data.token);
      setLoginForm(EMPTY_LOGIN);
      setGuestStep("intro");
      onAuthSuccess();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleCreateProfile(event) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setAddProfileBusy(true);
    setProfileError("");

    try {
      await apiRequest("/api/v1/profiles", {
        method: "POST",
        token,
        body: {
          profileType: addProfileForm.profileType,
          displayName: addProfileForm.displayName
        }
      });
      setAddProfileForm(EMPTY_ADD_PROFILE_FORM);
      setAddProfileOpen(false);
      await refreshSession();
      showProfileMessage("Профиль добавлен.");
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setAddProfileBusy(false);
    }
  }

  async function handleConfirmDeleteCurrentProfile() {
    if (!token || !profile) {
      return;
    }

    setProfileBusy(true);
    setProfileError("");

    try {
      await apiRequest("/api/v1/profiles/me", {
        method: "DELETE",
        token
      });
      setDeleteProfileDialogOpen(false);
      await refreshSession();
      showProfileMessage("Профиль удален.");
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setProfileBusy(true);
    setProfileError("");

    try {
      const updated = await apiRequest("/api/v1/profiles/me", {
        method: "PUT",
        token,
        body: {
          displayName: profileForm.displayName,
          avatarUrl: profileForm.avatarUrl || null,
          city: profileForm.city || null,
          about: profileForm.about || null,
          sportsTags: profileForm.sportsTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          isPublic: profileForm.isPublic,
          isEmailPublic: profileForm.isEmailPublic,
          isPhonePublic: profileForm.isPhonePublic
        }
      });
      setProfile(updated);
      showProfileMessage("Профиль обновлен.");
      refreshSession();
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleSearchingToggle() {
    if (!token || profile?.profileType !== "CONSUMER") {
      return;
    }

    setProfileBusy(true);
    setProfileError("");

    try {
      const updated = await apiRequest("/api/v1/profiles/me/searching", {
        method: "PUT",
        token,
        body: { isLookingFor: !profile?.isLookingFor }
      });
      setProfile(updated);
      showProfileMessage(updated.isLookingFor ? "Режим поиска включен." : "Режим поиска выключен.");
      refreshSession();
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleSwitchProfile(profileId) {
    if (!token || profile?.id === profileId) {
      return;
    }

    setProfileBusy(true);
    setProfileError("");

    try {
      await apiRequest("/api/v1/profiles/me/switch", {
        method: "POST",
        token,
        body: { profileId }
      });
      await refreshSession();
      showProfileMessage("Активный профиль переключен.");
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileBusy(false);
    }
  }

  function handleLogout() {
    setToken("");
    setAuthMe(null);
    setProfile(null);
    setMyProfiles([]);
    clearProfileMessage();
    setProfileError("");
    setAuthError("");
    setGuestStep("intro");
    setAddProfileOpen(false);
    setDeleteProfileDialogOpen(false);
    onLogout();
  }

  return {
    guestStep,
    registerForm,
    setRegisterForm,
    loginForm,
    setLoginForm,
    authBusy,
    authError,
    authMe,
    profile,
    myProfiles,
    sessionBusy,
    profileBusy,
    profileMessage,
    profileMessageVisible,
    profileError,
    profileForm,
    setProfileForm,
    addProfileOpen,
    addProfileBusy,
    addProfileForm,
    setAddProfileForm,
    deleteProfileDialogOpen,
    onToggleAddProfile: toggleAddProfile,
    onCreateProfile: handleCreateProfile,
    onOpenDeleteProfileDialog: openDeleteProfileDialog,
    onCloseDeleteProfileDialog: closeDeleteProfileDialog,
    onConfirmDeleteCurrentProfile: handleConfirmDeleteCurrentProfile,
    onStartRegistration: startRegistration,
    onOpenLogin: openLogin,
    onChooseRegisterRole: chooseRegisterRole,
    onBackToIntro: backToIntro,
    onBackToRoleSelection: backToRoleSelection,
    onRegister: handleRegister,
    onLogin: handleLogin,
    onProfileSave: handleProfileSave,
    onSearchingToggle: handleSearchingToggle,
    onSwitchProfile: handleSwitchProfile,
    onLogout: handleLogout
  };
}
