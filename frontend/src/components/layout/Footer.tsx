import { Link } from "react-router-dom";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-ink-muted sm:flex-row">
        <span className="font-display font-bold text-ink">Sportnis</span>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/feed" className="hover:text-ink">
            Лента
          </Link>
          <Link to="/kit" className="hover:text-ink">
            UI-kit
          </Link>
        </nav>
        <span className="text-ink-faint">© {new Date().getFullYear()} Sportnis</span>
      </Container>
    </footer>
  );
}
