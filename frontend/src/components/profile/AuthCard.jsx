function RoleButton({ title, description, onClick }) {
  return (
    <button className="choice-card" onClick={onClick} type="button">
      <span className="choice-title">{title}</span>
      <span className="choice-description">{description}</span>
    </button>
  );
}

export function AuthCard({
  guestStep,
  registerForm,
  setRegisterForm,
  loginForm,
  setLoginForm,
  authBusy,
  authError,
  onStartRegistration,
  onOpenLogin,
  onChooseRegisterRole,
  onBackToIntro,
  onBackToRoleSelection,
  onRegister,
  onLogin
}) {
  return (
    <div className="glass-panel auth-card auth-dialog-card">
      {guestStep === "intro" ? (
        <>
          <div className="auth-copy-block">
            <div className="eyebrow">Первый шаг</div>
            <h3 className="auth-title">Зарегистрируемся?</h3>
            <p className="auth-lead">
              Минимальная регистрация занимает несколько полей. После входа попадешь сразу в профиль.
            </p>
          </div>
          <div className="dialog-actions dialog-actions-stacked">
            <button className="primary-button" type="button" onClick={onStartRegistration}>
              Да, начнем
            </button>
            <button className="secondary-button" type="button" onClick={onOpenLogin}>
              У меня уже есть аккаунт
            </button>
          </div>
        </>
      ) : null}

      {guestStep === "role" ? (
        <>
          <div className="auth-copy-block">
            <div className="eyebrow">Вопрос 1</div>
            <h3 className="auth-title">Кто вы?</h3>
            <p className="auth-lead">
              Выбор влияет только на то, в какой профиль ты попадешь сразу после регистрации.
            </p>
          </div>
          <div className="choice-grid">
            <RoleButton
              title="Потребитель услуги"
              description="Ищу секцию, тренера, школу или спортивную возможность."
              onClick={() => onChooseRegisterRole("CONSUMER")}
            />
            <RoleButton
              title="Предоставитель услуги"
              description="Тренер, школа или организация, которая публикует предложения."
              onClick={() => onChooseRegisterRole("PROVIDER")}
            />
          </div>
          <div className="dialog-actions">
            <button className="secondary-button" type="button" onClick={onBackToIntro}>
              Назад
            </button>
          </div>
        </>
      ) : null}

      {guestStep === "register" ? (
        <>
          <div className="auth-copy-block">
            <div className="eyebrow">Вопрос 2</div>
            <h3 className="auth-title">Первичная регистрация</h3>
            <p className="auth-lead">
              Выбранный тип: <strong>{registerForm.profileType === "CONSUMER" ? "Потребитель услуги" : "Предоставитель услуги"}</strong>
            </p>
          </div>
          <form className="form-grid" onSubmit={onRegister}>
            <label className="field-block">
              <span>Email</span>
              <input
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>
            <label className="field-block">
              <span>Логин</span>
              <input
                value={registerForm.username}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, username: event.target.value }))
                }
              />
            </label>
            <label className="field-block field-wide">
              <span>Пароль</span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </label>
            <div className="dialog-actions field-wide">
              <button className="secondary-button" type="button" onClick={onBackToIntro}>
                Назад
              </button>
              <button className="primary-button" disabled={authBusy} type="submit">
                {authBusy ? "Создаем..." : "Перейти в профиль"}
              </button>
            </div>
          </form>
        </>
      ) : null}

      {guestStep === "login" ? (
        <>
          <div className="auth-copy-block">
            <div className="eyebrow">Вход</div>
            <h3 className="auth-title">Войти в профиль</h3>
            <p className="auth-lead">
              Если аккаунт уже есть, введи почту и пароль.
            </p>
          </div>
          <form className="form-grid" onSubmit={onLogin}>
            <label className="field-block">
              <span>Email</span>
              <input
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>
            <label className="field-block">
              <span>Пароль</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </label>
            <div className="dialog-actions field-wide">
              <button className="secondary-button" type="button" onClick={onBackToIntro}>
                Назад
              </button>
              <button className="primary-button" disabled={authBusy} type="submit">
                {authBusy ? "Входим..." : "Войти"}
              </button>
            </div>
          </form>
        </>
      ) : null}

      {authError ? <div className="message error-message">{authError}</div> : null}
    </div>
  );
}
