import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";
import { EMPTY_REPLY_STATUS } from "../constants/auth";

export function useFeed({ token, onRequireAuth }) {
  const [feedItems, setFeedItems] = useState([]);
  const [feedMeta, setFeedMeta] = useState({ total: 0, hasNext: false });
  const [feedBusy, setFeedBusy] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [feedSearch, setFeedSearch] = useState("");
  const [feedCity, setFeedCity] = useState("");
  const [feedTag, setFeedTag] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [replyListingId, setReplyListingId] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyStatus, setReplyStatus] = useState(EMPTY_REPLY_STATUS);

  useEffect(() => {
    let ignore = false;

    async function loadFeed() {
      setFeedBusy(true);
      setFeedError("");

      try {
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", "20");

        if (feedCity.trim()) {
          params.set("city", feedCity.trim());
        }

        if (feedTag.trim()) {
          params.set("tag", feedTag.trim());
        }

        const data = await apiRequest(`/api/v1/feed?${params.toString()}`, {
          token: token || undefined
        });

        if (ignore) {
          return;
        }

        setFeedItems(data.items ?? []);
        setFeedMeta({ total: data.total ?? 0, hasNext: data.hasNext ?? false });
      } catch (error) {
        if (!ignore) {
          setFeedError(error.message);
        }
      } finally {
        if (!ignore) {
          setFeedBusy(false);
        }
      }
    }

    loadFeed();

    return () => {
      ignore = true;
    };
  }, [token, feedCity, feedTag]);

  const visibleFeedItems = useMemo(() => {
    const query = feedSearch.trim().toLowerCase();

    if (!query) {
      return feedItems;
    }

    return feedItems.filter((item) =>
      [item.title, item.subtitle, item.ownerDisplayName, item.city]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [feedItems, feedSearch]);

  async function handleReplySubmit(listingId) {
    if (!token) {
      onRequireAuth();
      return;
    }

    setReplyBusy(true);
    setReplyStatus(EMPTY_REPLY_STATUS);

    try {
      await apiRequest(`/api/v1/listings/${listingId}/responses`, {
        method: "POST",
        token,
        body: { message: replyMessage || null }
      });
      setReplyListingId("");
      setReplyMessage("");
      setReplyStatus({ type: "success", text: "Отклик отправлен." });
    } catch (error) {
      setReplyStatus({ type: "error", text: error.message });
    } finally {
      setReplyBusy(false);
    }
  }

  return {
    feedItems: visibleFeedItems,
    feedMeta,
    feedBusy,
    feedError,
    feedSearch,
    setFeedSearch,
    feedCity,
    setFeedCity,
    feedTag,
    setFeedTag,
    filtersOpen,
    setFiltersOpen,
    replyListingId,
    setReplyListingId,
    replyMessage,
    setReplyMessage,
    replyBusy,
    replyStatus,
    onRequireAuth,
    onReplySubmit: handleReplySubmit
  };
}
