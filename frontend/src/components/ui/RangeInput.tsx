import { useCallback, useId } from "react";
import { cn } from "@/lib/cn";

export interface RangeValue {
  min: number;
  max: number;
}

export interface RangeInputProps {
  /** Границы шкалы. */
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  /** Форматирование подписи значений (цена, возраст). */
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const thumb =
  "pointer-events-none absolute h-2 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent " +
  "[&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:cursor-pointer " +
  "focus-visible:outline-none";

export function RangeInput({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => String(v),
  label,
  className,
  disabled,
}: RangeInputProps) {
  const id = useId();
  const span = max - min || 1;
  const leftPct = ((value.min - min) / span) * 100;
  const rightPct = ((value.max - min) / span) * 100;

  const handleMin = useCallback(
    (raw: number) => onChange({ min: Math.min(raw, value.max), max: value.max }),
    [onChange, value.max],
  );
  const handleMax = useCallback(
    (raw: number) => onChange({ min: value.min, max: Math.max(raw, value.min) }),
    [onChange, value.min],
  );

  return (
    <div className={cn("w-full", disabled && "opacity-60", className)}>
      <div className="mb-3 flex items-center justify-between text-sm text-ink">
        {label && <span className="text-ink-muted">{label}</span>}
        <span className="font-medium tabular-nums">
          {formatValue(value.min)} — {formatValue(value.max)}
        </span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-surface-alt" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          aria-label={label ? `${label}: от` : "Минимум"}
          id={`${id}-min`}
          min={min}
          max={max}
          step={step}
          value={value.min}
          disabled={disabled}
          onChange={(e) => handleMin(Number(e.target.value))}
          className={cn(thumb, "top-1/2 -translate-y-1/2")}
        />
        <input
          type="range"
          aria-label={label ? `${label}: до` : "Максимум"}
          id={`${id}-max`}
          min={min}
          max={max}
          step={step}
          value={value.max}
          disabled={disabled}
          onChange={(e) => handleMax(Number(e.target.value))}
          className={cn(thumb, "top-1/2 -translate-y-1/2")}
        />
      </div>
    </div>
  );
}
