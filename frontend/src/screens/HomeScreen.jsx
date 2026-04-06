export function HomeScreen({ onOpenFeed, onOpenProfile }) {
  return (
    <section className="screen">
      <div className="glass-panel hero">
        <div className="eyebrow">Sportnis MVP</div>
        <h1>Спортивная лента, профили и быстрый вход в сценарий.</h1>
        <p>
          Платформа соединяет спортсменов, кружки, школы и тренеров через
          role-based ленту и единый профильный сценарий.
        </p>
        <div className="hero-actions">
          <button className="primary-button" onClick={onOpenFeed}>
            Открыть ленту
          </button>
          <button className="secondary-button" onClick={onOpenProfile}>
            Профиль и вход
          </button>
        </div>
      </div>

      <div className="feature-grid">
        <article className="glass-card feature-card">
          <span className="feature-badge">Consumer</span>
          <h2>Анкета в поиске</h2>
          <p>Пользователь включает режим поиска и попадает в выдачу для providers.</p>
        </article>
        <article className="glass-card feature-card accent-card">
          <span className="feature-badge">Provider</span>
          <h2>Много объявлений</h2>
          <p>Тренеры и школы создают предложения по наборам, группам и анонсам.</p>
        </article>
        <article className="glass-card feature-card">
          <span className="feature-badge">Demo</span>
          <h2>Три экрана</h2>
          <p>Главный экран знакомит, лента показывает контент, профиль собирает auth и управление.</p>
        </article>
      </div>
    </section>
  );
}
