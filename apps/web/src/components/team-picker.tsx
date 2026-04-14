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
  disabledTeams?: TeamCode[];
};

export function TeamPicker({
  label,
  value,
  onChange,
  error,
  hint,
  disabledTeams = [],
}: TeamPickerProps) {
  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-sm font-medium text-[#11284f]">{label}</legend>
      {hint ? <p className="text-xs leading-5 text-[#5a6f91]">{hint}</p> : null}

      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-2 gap-3 sm:grid-cols-5"
      >
        {TEAM_OPTIONS.map((option) => {
          const isSelected = option.value === value;
          const isDisabled = disabledTeams.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => onChange(option.value)}
              className={`group flex min-h-[10.5rem] flex-col items-center justify-center rounded-[28px] border px-2 py-4 text-center transition ${
                isSelected
                  ? "border-[#11284f] bg-[#11284f] text-white shadow-[0_18px_40px_rgba(17,40,79,0.18)]"
                  : isDisabled
                    ? "cursor-not-allowed border-[#edf2f8] bg-[#f8fbff] text-[#9aaaca] opacity-60"
                    : "border-[#e5ecf6] bg-white text-[#11284f] hover:border-[#cfdcf0] hover:bg-[#f8fbff]"
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

      {error ? <p className="text-sm text-[#c42d3c]">{error}</p> : null}
    </fieldset>
  );
}
