import { ProfileTypeDropdown } from "./ProfileTypeDropdown";

export function AddProfileForm({ busy, form, setForm, onSubmit }) {
  return (
    <form className="form-grid compact-form" onSubmit={onSubmit}>
      <label className="field-block">
        <span>Тип профиля</span>
        <ProfileTypeDropdown
          value={form.profileType}
          onChange={(nextValue) =>
            setForm((current) => ({ ...current, profileType: nextValue }))
          }
        />
      </label>
      <label className="field-block">
        <span>Display name</span>
        <input
          value={form.displayName}
          onChange={(event) =>
            setForm((current) => ({ ...current, displayName: event.target.value }))
          }
          placeholder="Например, Coach Alex"
        />
      </label>
      <button className="primary-button field-wide" disabled={busy} type="submit">
        {busy ? "Создаем..." : "Создать профиль"}
      </button>
    </form>
  );
}
