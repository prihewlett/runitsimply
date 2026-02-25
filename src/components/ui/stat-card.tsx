interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor: string;
}

export function StatCard({ icon, label, value, subtitle, accentColor }: StatCardProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-[14px] border border-[#F0F2F5] bg-white p-[18px_20px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[10px]"
        style={{ background: accentColor + "14", color: accentColor }}
      >
        {icon}
      </div>
      <div>
        <div className="font-body text-[11px] font-semibold tracking-wide text-gray-400">
          {label}
        </div>
        <div className="text-[22px] font-extrabold leading-tight">{value}</div>
        {subtitle && (
          <div className="font-body text-[10px] text-gray-400">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
