import { NAV_ITEMS } from "../../constants/navigation";

export function BottomNav({ screen, onSelect }) {
  return (
    <nav className="glass-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={screen === item.id ? "nav-button active-nav" : "nav-button"}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
