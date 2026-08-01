import { useIsPortrait } from "@/lib/useMediaQuery";
import { FeedListView } from "@/features/feed/FeedListView";
import { FeedFullscreen } from "@/features/feed/FeedFullscreen";

export function FeedPage() {
  // Портрет (телефон вертикально) → полноэкранная лента; ландшафт/десктоп → обычный список.
  const isPortrait = useIsPortrait();
  return isPortrait ? <FeedFullscreen /> : <FeedListView />;
}
