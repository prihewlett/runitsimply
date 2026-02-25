import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export function ButtonPrimary({ children, icon, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-[11px] bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:from-blue-700 hover:to-blue-800 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}

export function ButtonSecondary({ children, icon, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-[11px] border-[1.5px] border-[#F0F2F5] bg-[#FAFBFD] px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}
