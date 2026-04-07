import { useState } from "react";
import { BottomNav } from "./components/navigation/BottomNav";
import { BackgroundOrbs } from "./components/layout/BackgroundOrbs";
import { TOKEN_STORAGE_KEY } from "./constants/auth";
import { useFeed } from "./hooks/useFeed";
import { useSession } from "./hooks/useSession";
import { FeedScreen } from "./screens/FeedScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

function App() {
  const [screen, setScreen] = useState("home");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) ?? "");

  const session = useSession({
    token,
    setToken,
    onAuthSuccess: () => setScreen("profile"),
    onLogout: () => setScreen("home")
  });

  const feed = useFeed({
    token,
    onRequireAuth: () => setScreen("profile")
  });

  const isGuest = !token;

  return (
    <div className="app-shell">
      <BackgroundOrbs />

      <main className="page-frame">
        {screen === "home" ? (
          <HomeScreen
            onOpenFeed={() => setScreen("feed")}
            onOpenProfile={() => setScreen("profile")}
          />
        ) : null}

        {screen === "feed" ? (
          <FeedScreen
            isGuest={isGuest}
            profileType={session.profile?.profileType}
            {...feed}
          />
        ) : null}

        {screen === "profile" ? (
          <ProfileScreen
            isGuest={isGuest}
            {...session}
          />
        ) : null}
      </main>

      <BottomNav screen={screen} onSelect={setScreen} />
    </div>
  );
}

export default App;
