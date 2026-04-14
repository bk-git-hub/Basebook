"use client";

import type { TeamCode } from "@basebook/contracts";

import { TeamBadge } from "@/components/team-badge";
import { TEAM_META, TEAM_OPTIONS } from "@/lib/team-meta";

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
          const team = TEAM_META[option.value];
          const isSelected = option.value === value;
          const isWideInitials = team.initials.length >= 3;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={`group rounded-[24px] border px-3 py-3 text-left transition ${
                isSelected
                  ? "border-stone-950 bg-stone-950 text-white shadow-lg shadow-stone-950/15"
                  : "border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <TeamBadge team={option.value} size={52} />
                <span
                  className={`inline-flex items-center justify-center rounded-full py-1 font-semibold ${
                    isWideInitials
                      ? "min-w-[3.6rem] px-2.5 text-[9px] tracking-[0.12em]"
                      : "min-w-[3.15rem] px-2 text-[10px] tracking-[0.18em]"
                  } ${
                    isSelected
                      ? "bg-white/12 text-stone-200"
                      : "bg-white text-stone-500 ring-1 ring-stone-200"
                  }`}
                >
                  {team.initials}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold">{option.label}</p>
                <p
                  className={`text-xs ${
                    isSelected ? "text-stone-300" : "text-stone-500"
                  }`}
                >
                  {team.shortLabel} 배지
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </fieldset>
  );
}
