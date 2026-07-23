"use client";

import { useId, useMemo, useState } from "react";

export type SearchablePersonOption = {
  id: string;
  label: string;
  detail?: string | null;
};

type SearchablePersonSelectProps = {
  name: string;
  label: string;
  options: SearchablePersonOption[];
  defaultValue?: string;
  placeholder?: string;
  emptyHint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

function optionText(option: SearchablePersonOption) {
  return option.detail ? `${option.label} - ${option.detail}` : option.label;
}

export function SearchablePersonSelect({
  name,
  label,
  options,
  defaultValue = "",
  placeholder = "Buscar por nombre...",
  emptyHint = "Borra el texto para no seleccionar a nadie.",
  required = false,
  disabled = false,
  className = "block"
}: SearchablePersonSelectProps) {
  const inputId = useId();
  const listId = `${inputId}-options`;
  const initialText = useMemo(() => {
    const selected = options.find((option) => option.id === defaultValue);
    return selected ? optionText(selected) : "";
  }, [defaultValue, options]);
  const [query, setQuery] = useState(initialText);
  const selected = options.find((option) => optionText(option) === query || option.label === query);
  const value = selected?.id ?? "";
  const showInvalidHint = query.trim().length > 0 && !selected;

  return (
    <label className={className}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        list={listId}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
      />
      <input type="hidden" name={name} value={value} />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.id} value={optionText(option)} />
        ))}
      </datalist>
      <p className="mt-1 text-xs text-ink/50">
        {showInvalidHint ? "Selecciona una coincidencia de la lista." : emptyHint}
      </p>
    </label>
  );
}
