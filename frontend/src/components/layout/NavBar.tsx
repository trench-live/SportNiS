import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

interface NavItem {
  to: string;
  label: string;
}

export function NavBar({ items, className }: { items: NavItem[]; className?: string }) {
  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "rounded-control px-3 py-2 text-sm font-medium transition-colors duration-120 ease-metronome",
              isActive ? "text-accent" : "text-ink-muted hover:text-ink",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
