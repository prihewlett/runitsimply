import { BUSINESS_TYPES } from "@/lib/data";
import type { ServiceType } from "@/types";

interface BadgeProps {
  type: ServiceType;
  size?: "sm" | "md";
}

export function ServiceBadge({ type, size = "sm" }: BadgeProps) {
  const bt = BUSINESS_TYPES.find((b) => b.id === type);
  if (!bt) return null;

  const isSm = size === "sm";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-semibold"
      style={{
        fontSize: isSm ? 10 : 12,
        padding: isSm ? "2px 8px" : "4px 12px",
        background: bt.color + "14",
        color: bt.color,
      }}
    >
      <span>{bt.emoji}</span>
      {bt.label}
    </span>
  );
}
