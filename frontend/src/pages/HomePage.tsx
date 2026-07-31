import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui";
import { SearchBar } from "@/features/feed/SearchBar";

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function goToFeed() {
    const tag = query.trim();
    navigate(tag ? `/feed?tag=${encodeURIComponent(tag)}` : "/feed");
  }

  return (
    <Container size="narrow" className="py-16">
      <section className="flex flex-col items-start gap-6">
        <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          Спорт начинается
          <br />с нужного человека
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Тренеры, секции, клубы и организации — и те, кто их ищет. Одна витрина вместо десятка чатов.
        </p>
        <div className="w-full max-w-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToFeed();
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Вид спорта: плавание, бокс, футбол…"
              className="flex-1"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Найти
            </Button>
          </form>
        </div>
      </section>
    </Container>
  );
}
