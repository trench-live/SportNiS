import { useState } from "react";
import { Heart, Search, Trash2, Pencil, MoreVertical, Inbox, MapPin } from "lucide-react";
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  ConfirmDialog,
  Divider,
  Dropdown,
  Drawer,
  EmptyState,
  ErrorState,
  FormField,
  IconButton,
  Input,
  Modal,
  Pagination,
  Radio,
  RangeInput,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  Textarea,
  useToast,
  type RangeValue,
} from "@/components/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <Card>
        <div className="flex flex-wrap items-start gap-4">{children}</div>
      </Card>
    </section>
  );
}

export function KitPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(2);
  const [price, setPrice] = useState<RangeValue>({ min: 1000, max: 4000 });
  const [liked, setLiked] = useState(false);
  const [chip, setChip] = useState(true);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <Badge tone="accent">UI-kit</Badge>
        <h1 className="mt-3 text-3xl text-ink">Компоненты Sportnis</h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          Доменно-нейтральный набор на дизайн-токенах. Тёплая штукатурка, бордовый только как
          действие, волосяные разделители, движение метронома.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <Section title="Кнопки">
          <Button>Основная</Button>
          <Button variant="secondary">Вторичная</Button>
          <Button variant="ghost">Призрак</Button>
          <Button variant="danger">Опасная</Button>
          <Button loading>Загрузка</Button>
          <Button disabled>Выключена</Button>
          <Button leftIcon={<Search className="size-4" />}>С иконкой</Button>
          <IconButton label="В избранное" icon={<Heart />} variant="soft" />
          <IconButton label="Ещё" icon={<MoreVertical />} />
        </Section>

        <Section title="Поля ввода">
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <FormField label="Заголовок" required hint="Коротко и по делу">
              <Input placeholder="Тренер по плаванию" />
            </FormField>
            <FormField label="Город" error="Обязательное поле">
              <Input placeholder="Москва" defaultValue="" />
            </FormField>
            <FormField label="Формат">
              <Select defaultValue="">
                <option value="" disabled>
                  Выберите…
                </option>
                <option>Онлайн</option>
                <option>Офлайн</option>
                <option>Гибрид</option>
              </Select>
            </FormField>
            <FormField label="Поиск">
              <Input leftIcon={<Search />} placeholder="Искать…" />
            </FormField>
            <FormField label="Описание" className="sm:col-span-2">
              <Textarea placeholder="Расскажите о себе…" />
            </FormField>
          </div>
          <div className="flex w-full flex-col gap-3">
            <Checkbox label="Показывать телефон" hint="Виден после отклика" defaultChecked />
            <Radio name="demo" label="Ищу тренера" defaultChecked />
            <Radio name="demo" label="Ищу секцию" />
          </div>
          <div className="w-full max-w-sm">
            <RangeInput
              label="Цена, ₽"
              min={0}
              max={10000}
              step={500}
              value={price}
              onChange={setPrice}
              formatValue={(v) => `${v.toLocaleString("ru-RU")} ₽`}
            />
          </div>
        </Section>

        <Section title="Бейджи, чипы, аватары">
          <Badge tone="accent">OFFER</Badge>
          <Badge tone="success">Опубликовано</Badge>
          <Badge tone="warning">Скрыто</Badge>
          <Badge tone="danger">Отклонено</Badge>
          <Badge tone="neutral">Плавание</Badge>
          <Badge tone="outline">Онлайн</Badge>
          <Divider orientation="vertical" className="h-8" />
          <Chip selected={chip} onClick={() => setChip((v) => !v)}>
            Плавание
          </Chip>
          <Chip onRemove={() => toast({ message: "Фильтр убран" })}>Москва</Chip>
          <Divider orientation="vertical" className="h-8" />
          <div className="flex items-end gap-3">
            <Avatar name="Иван Петров" size="xs" />
            <Avatar name="Иван Петров" size="sm" />
            <Avatar name="Иван Петров" size="md" />
            <Avatar name="Sport Club" size="lg" />
            <Avatar name="Организация Здоровье" size="xl" />
            <Avatar src="broken-url" name="Ошибка загрузки" size="lg" />
          </div>
        </Section>

        <Section title="Состояния и обратная связь">
          <Spinner />
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <IconButton
            label={liked ? "Убрать из избранного" : "В избранное"}
            icon={<Heart className={liked ? "fill-accent text-accent" : ""} />}
            variant="soft"
            onClick={() => setLiked((v) => !v)}
          />
        </Section>

        <Section title="Оверлеи">
          <Button onClick={() => setModalOpen(true)}>Модалка</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Удалить…
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Drawer
          </Button>
          <Dropdown
            trigger={({ toggle, ref }) => (
              <span ref={ref as React.Ref<HTMLSpanElement>}>
                <IconButton label="Действия" icon={<MoreVertical />} onClick={toggle} />
              </span>
            )}
            items={[
              { key: "edit", label: "Изменить", icon: <Pencil />, onSelect: () => toast({ message: "Изменить" }) },
              {
                key: "del",
                label: "Удалить",
                icon: <Trash2 />,
                destructive: true,
                onSelect: () => toast({ message: "Удалено", tone: "error" }),
              },
            ]}
          />
        </Section>

        <Section title="Тосты">
          <Button variant="secondary" onClick={() => toast({ message: "Профиль обновлён", tone: "success" })}>
            Успех
          </Button>
          <Button variant="secondary" onClick={() => toast({ message: "Не удалось сохранить", tone: "error" })}>
            Ошибка
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                message: "Убрано из избранного",
                action: { label: "Вернуть", onClick: () => toast({ message: "Возвращено", tone: "success" }) },
              })
            }
          >
            С действием
          </Button>
        </Section>

        <Section title="Навигация и раскрытие">
          <div className="w-full">
            <Tabs
              items={[
                { key: "all", label: "Все", count: 12 },
                { key: "active", label: "Активные", count: 8 },
                { key: "hidden", label: "Скрытые", count: 3 },
                { key: "rejected", label: "Отклонённые", count: 1 },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
          <div className="w-full">
            <Accordion
              defaultOpen={["a"]}
              items={[
                { key: "a", title: "Что такое объявление?", content: "Предложение от провайдера услуги." },
                { key: "b", title: "Как связаться?", content: "Контакты открываются после принятия отклика." },
              ]}
            />
          </div>
          <Pagination page={page} totalPages={9} onChange={setPage} />
        </Section>

        <Section title="Пустое и ошибка">
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <EmptyState
              icon={<Inbox />}
              title="Пока пусто"
              description="Здесь появятся объявления, как только они будут."
              action={<Button size="sm">Создать</Button>}
            />
            <ErrorState description="Не удалось загрузить ленту." onRetry={() => toast({ message: "Повтор" })} />
          </div>
        </Section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Связаться с автором"
        description="Контакты откроются после того, как автор примет отклик."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setModalOpen(false)}>Отправить отклик</Button>
          </>
        }
      >
        <FormField label="Сообщение (необязательно)">
          <Textarea placeholder="Здравствуйте! Хочу записаться…" />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast({ message: "Объявление удалено", tone: "error" });
        }}
        destructive
        title="Удалить объявление?"
        description="Действие необратимо. Объявление исчезнет из выдачи."
        confirmLabel="Удалить"
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Фильтры">
        <div className="flex flex-col gap-4">
          <FormField label="Город">
            <Input leftIcon={<MapPin />} placeholder="Москва" />
          </FormField>
          <RangeInput label="Цена, ₽" min={0} max={10000} step={500} value={price} onChange={setPrice} />
          <Button fullWidth onClick={() => setDrawerOpen(false)}>
            Применить
          </Button>
        </div>
      </Drawer>
    </main>
  );
}
