"use client";

import type { TeamCode } from "@basebook/contracts";

import { TeamBadge } from "@/components/team-badge";
import { TEAM_OPTIONS } from "@/lib/team-meta";

type TeamPickerProps = {
  label: string;
  value: TeamCode;
  onChange: (team: TeamCode) => void;
  error?: string;
  hint?: string;
};

export function TeamPicker({
  label,
  value,
  onChange,
  error,
  hint,
}: TeamPickerProps) {
  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-sm font-medium text-stone-700">{label}</legend>
      {hint ? <p className="text-xs leading-5 text-stone-500">{hint}</p> : null}

      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-2 gap-3 sm:grid-cols-5"
      >
        {TEAM_OPTIONS.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={`group flex min-h-[10.5rem] flex-col items-center justify-center rounded-[28px] border px-2 py-4 text-center transition ${
                isSelected
                  ? "border-stone-950 bg-stone-100 text-stone-950 shadow-[0_16px_32px_rgba(15,23,42,0.12)]"
                  : "border-stone-200 bg-white text-stone-900 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <TeamBadge team={option.value} size={88} />
              <p className="mt-3 text-[12px] font-semibold leading-5">
                {option.label}
              </p>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </fieldset>
  );
}
