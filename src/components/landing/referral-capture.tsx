"use client";

import { useEffect } from "react";

export function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && !localStorage.getItem("runitsimply-referral-used")) {
      localStorage.setItem("runitsimply-referral-code", ref.toUpperCase());
    }
  }, []);

  return null;
}
