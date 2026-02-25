"use client";

import { StarIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";

export function Testimonial() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-[800px] px-10 py-[70px] text-center">
      <div className="mb-3.5 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <p className="mx-auto mb-5 max-w-[560px] text-xl font-semibold leading-snug">
        {t("testimonial.quote")}
      </p>
      <div className="font-body text-sm text-gray-500">
        <strong className="text-[#1A1D26]">{t("testimonial.author")}</strong>{" "}
        &middot; {t("testimonial.company")}
      </div>
    </section>
  );
}
