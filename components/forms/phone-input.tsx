"use client";

import { useMemo, useState } from "react";

type PhoneInputProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  disabled?: boolean;
  required?: boolean;
};

const COUNTRY_CODES = [
  { label: "Mexico", value: "+52" },
  { label: "Estados Unidos", value: "+1" },
  { label: "Espana", value: "+34" },
  { label: "Colombia", value: "+57" },
  { label: "Argentina", value: "+54" },
  { label: "Chile", value: "+56" },
  { label: "Peru", value: "+51" }
];

function splitPhone(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);

  return {
    countryCode: match?.[1] ?? "+52",
    number: match?.[2]?.trim() ?? trimmed.replace(/^\+/, "")
  };
}

export function PhoneInput({
  name,
  label,
  defaultValue,
  disabled = false,
  required = false
}: PhoneInputProps) {
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [countryCode, setCountryCode] = useState(initial.countryCode);
  const [number, setNumber] = useState(initial.number);
  const normalized = number.trim() ? `${countryCode} ${number.trim()}` : "";

  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input type="hidden" name={name} value={normalized} />
      <div className="mt-2 grid grid-cols-[minmax(118px,0.42fr)_1fr] gap-2">
        <select
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          disabled={disabled}
          aria-label={`${label} pais`}
          className="h-10 w-full rounded-md border border-ink/15 bg-white px-2 text-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/5"
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.value} {country.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="tel"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          disabled={disabled}
          required={required}
          aria-label={`${label} numero`}
          placeholder="Numero"
          className="h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/5"
        />
      </div>
    </label>
  );
}
