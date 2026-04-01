"use client";

import { useEffect } from "react";

// Syncs the nexusai_token cookie from localStorage on every page load.
// Needed because middleware reads cookies (not localStorage), and cookies
// can go missing after expiry or if set before the cookie code was added.
export function AuthSync() {
  useEffect(() => {
    const token = localStorage.getItem("nexusai_token");
    if (token) {
      // Re-set cookie in case it expired or is missing
      document.cookie = `nexusai_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      // Clear stale cookie if localStorage was cleared
      document.cookie = "nexusai_token=; path=/; max-age=0; SameSite=Lax";
    }
  }, []);

  return null;
}
