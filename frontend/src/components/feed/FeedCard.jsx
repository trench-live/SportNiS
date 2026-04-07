export function FeedCard({
  item,
  isGuest,
  feedTag,
  setFeedTag,
  replyListingId,
  setReplyListingId,
  replyMessage,
  setReplyMessage,
  replyBusy,
  onRequireAuth,
  onReplySubmit
}) {
  const isProviderListing = item.itemType === "PROVIDER_LISTING";
  const isReplyOpen = replyListingId === item.itemId;

  return (
    <article className="glass-card feed-card">
      <div className="feed-card-head">
        <span className={isProviderListing ? "type-pill listing-pill" : "type-pill profile-pill"}>
          {isProviderListing ? "Объявление" : "Анкета спортсмена"}
        </span>
        <span className="muted-text">{item.city || "Без города"}</span>
      </div>

      <div className="feed-card-body">
        <h3>{item.title}</h3>
        {item.ownerDisplayName ? <p className="owner-line">{item.ownerDisplayName}</p> : null}
        <p>{item.subtitle || "Без описания"}</p>
      </div>

      <div className="tag-row">
        {(item.tags || []).map((tag) => (
          <button
            key={`${item.itemId}-${tag}`}
            className={feedTag === tag ? "tag-chip active-tag" : "tag-chip"}
            onClick={() => setFeedTag(feedTag === tag ? "" : tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      {isProviderListing ? (
        <div className="listing-meta">
          <span>{item.format || "Формат не указан"}</span>
          <span>{item.priceFrom ? `от ${item.priceFrom} ${item.currency || "RUB"}` : "Цена не указана"}</span>
        </div>
      ) : null}

      {isProviderListing ? (
        <div className="feed-actions">
          {isGuest ? (
            <button className="secondary-button" onClick={onRequireAuth}>
              Войти для отклика
            </button>
          ) : (
            <>
              <button
                className="primary-button"
                onClick={() => setReplyListingId(isReplyOpen ? "" : item.itemId)}
              >
                {isReplyOpen ? "Скрыть форму" : "Откликнуться"}
              </button>

              {isReplyOpen ? (
                <div className="reply-box">
                  <textarea
                    value={replyMessage}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    placeholder="Коротко опиши интерес или вопрос"
                  />
                  <button
                    className="secondary-button"
                    disabled={replyBusy}
                    onClick={() => onReplySubmit(item.itemId)}
                  >
                    {replyBusy ? "Отправка..." : "Отправить отклик"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </article>
  );
}
