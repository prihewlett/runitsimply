interface PlaceholderPageProps {
  icon: string;
  title: string;
  description: string;
}

export function PlaceholderPage({ icon, title, description }: PlaceholderPageProps) {
  return (
    <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-4 text-5xl">{icon}</div>
      <h2 className="mb-2 text-xl font-bold">{title}</h2>
      <p className="mx-auto max-w-md font-body text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}
