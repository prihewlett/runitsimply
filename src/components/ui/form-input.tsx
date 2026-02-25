"use client";

import { useId } from "react";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  options,
  disabled,
}: FormInputProps) {
  const id = useId();

  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
        {label}
      </label>
      {options ? (
        <select
          id={id}
          className="w-full rounded-[10px] border-[1.5px] border-[#F0F2F5] bg-white px-3 py-2 font-body text-sm outline-none transition-colors focus:border-blue-600 disabled:opacity-50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          className="w-full rounded-[10px] border-[1.5px] border-[#F0F2F5] px-3 py-2 font-body text-sm outline-none transition-colors focus:border-blue-600 disabled:opacity-50"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}
