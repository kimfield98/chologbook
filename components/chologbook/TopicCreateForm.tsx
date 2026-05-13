"use client";

import { focusRingPrimary } from "@/lib/ui/appButtonStyles";

type TopicCreateFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  submitLabel?: string;
  helperText?: string;
  label?: string;
  placeholder?: string;
};

export function TopicCreateForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  autoFocus = false,
  submitLabel = "추가",
  helperText = "반복하고 싶은 습관이나 기록을 하나 만들어보세요",
  label = "새 Topic 이름",
  placeholder = "예: 영어 회화",
}: TopicCreateFormProps) {
  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
      <p className="text-xs text-zinc-500">{helperText}</p>
      <label className="block text-xs font-medium text-zinc-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ${focusRingPrimary}`}
        autoFocus={autoFocus}
      />
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            취소
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
