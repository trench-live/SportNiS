import { FeedCard } from "../components/feed/FeedCard";
import { FEED_TAGS } from "../constants/feed";

export function FeedScreen(props) {
  return (
    <section className="screen">
      <div className="glass-panel feed-toolbar">
        <div className="toolbar-header">
          <div>
            <div className="eyebrow">Role-based feed</div>
            <h2>Лента</h2>
          </div>
          <button className="secondary-button" onClick={() => props.setFiltersOpen((value) => !value)}>
            {props.filtersOpen ? "Скрыть фильтры" : "Фильтры"}
          </button>
        </div>

        <input
          className="search-input"
          value={props.feedSearch}
          onChange={(event) => props.setFeedSearch(event.target.value)}
          placeholder="Поиск по заголовку, описанию или владельцу"
        />

        <div className="tag-row">
          {FEED_TAGS.map((tag) => (
            <button
              key={tag}
              className={props.feedTag === tag ? "tag-chip active-tag" : "tag-chip"}
              onClick={() => props.setFeedTag(props.feedTag === tag ? "" : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>

        {props.filtersOpen ? (
          <div className="filters-grid">
            <label className="field-block">
              <span>Город</span>
              <input
                value={props.feedCity}
                onChange={(event) => props.setFeedCity(event.target.value)}
                placeholder="Например, Moscow"
              />
            </label>

            <div className="status-note">
              {props.isGuest
                ? "Гостю показываются и анкеты спортсменов, и объявления providers."
                : props.profileType === "CONSUMER"
                  ? "Consumer видит только provider-объявления."
                  : "Provider видит только анкеты спортсменов в поиске."}
            </div>
          </div>
        ) : null}
      </div>

      {props.replyStatus.text ? (
        <div className={props.replyStatus.type === "error" ? "message error-message" : "message success-message"}>
          {props.replyStatus.text}
        </div>
      ) : null}

      {props.feedError ? <div className="message error-message">{props.feedError}</div> : null}

      <div className="feed-meta-line">
        <span>{props.feedBusy ? "Обновляем ленту..." : `Элементов: ${props.feedMeta.total}`}</span>
        <span>{props.feedMeta.hasNext ? "Есть следующая страница" : "Последняя страница"}</span>
      </div>

      <div className="feed-grid">
        {props.feedItems.map((item) => (
          <FeedCard
            key={`${item.itemType}-${item.itemId}`}
            item={item}
            isGuest={props.isGuest}
            feedTag={props.feedTag}
            setFeedTag={props.setFeedTag}
            replyListingId={props.replyListingId}
            setReplyListingId={props.setReplyListingId}
            replyMessage={props.replyMessage}
            setReplyMessage={props.setReplyMessage}
            replyBusy={props.replyBusy}
            onRequireAuth={props.onRequireAuth}
            onReplySubmit={props.onReplySubmit}
          />
        ))}
      </div>

      {!props.feedBusy && props.feedItems.length === 0 ? (
        <div className="glass-card empty-card">По текущим фильтрам ничего не найдено.</div>
      ) : null}
    </section>
  );
}
