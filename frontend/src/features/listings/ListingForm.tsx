import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, FormField, Input, Select, Textarea } from "@/components/ui";
import { FORMAT_LABELS } from "@/lib/format";
import type { ListingFormat } from "@/lib/api/types";
import { validateListingForm, type ListingFormValues } from "./listingFormModel";

interface Props {
  value: ListingFormValues;
  onChange: (value: ListingFormValues) => void;
  onSubmit: (value: ListingFormValues) => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
  apiError?: string | null;
}

export function ListingForm({ value, onChange, onSubmit, onCancel, submitting, submitLabel, apiError }: Props) {
  const [touched, setTouched] = useState(false);
  const error = validateListingForm(value);

  function set<K extends keyof ListingFormValues>(key: K, v: ListingFormValues[K]) {
    onChange({ ...value, [key]: v });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    onSubmit(value);
  }

  const showError = (field: keyof ListingFormValues) =>
    touched && error?.field === field ? error.message : undefined;

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <Card>
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Основное</h2>
        <div className="flex flex-col gap-4">
          <FormField label="Заголовок" required error={showError("title")}>
            <Input value={value.title} onChange={(e) => set("title", e.target.value)} maxLength={255} placeholder="Набор в детскую футбольную группу" />
          </FormField>
          <FormField label="Описание" required error={showError("description")}>
            <Textarea value={value.description} onChange={(e) => set("description", e.target.value)} rows={6} maxLength={5000} />
          </FormField>
          <FormField label="Теги" hint="Вид спорта и уточнения через запятую">
            <Input value={value.tags} onChange={(e) => set("tags", e.target.value)} placeholder="футбол, дети" />
          </FormField>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Цена и формат</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Формат">
            <Select value={value.format} onChange={(e) => set("format", e.target.value as ListingFormat)}>
              {(Object.keys(FORMAT_LABELS) as ListingFormat[]).map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Город">
            <Input value={value.city} onChange={(e) => set("city", e.target.value)} placeholder="Москва" maxLength={120} />
          </FormField>
          <FormField label="Цена от, ₽" error={showError("priceFrom")}>
            <Input type="number" min="0" value={value.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} placeholder="1000" />
          </FormField>
          <FormField label="Цена до, ₽" hint="Необязательно" error={showError("priceTo")}>
            <Input type="number" min="0" value={value.priceTo} onChange={(e) => set("priceTo", e.target.value)} placeholder="3000" />
          </FormField>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Контакты и срок</h2>
        <div className="flex flex-col gap-4">
          <FormField label="Контакты" hint="Откроются откликнувшемуся только после того, как вы примете отклик">
            <Input value={value.contactInfo} onChange={(e) => set("contactInfo", e.target.value)} placeholder="Telegram: @coach, +7 900 000-00-00" maxLength={500} />
          </FormField>
          <Checkbox
            label="Закрывать только вручную"
            hint="Объявление будет активно, пока вы сами его не закроете"
            checked={value.manualCloseOnly}
            onChange={(e) => set("manualCloseOnly", e.target.checked)}
          />
          {!value.manualCloseOnly && (
            <FormField label="Автозакрытие" hint="Необязательно" error={showError("expiresAt")}>
              <Input type="date" value={value.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
            </FormField>
          )}
        </div>
      </Card>

      {apiError && (
        <p role="alert" className="text-sm text-danger">
          {apiError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Отмена
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
