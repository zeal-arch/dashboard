"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

// Check if i18n is already initialized to prevent duplicate init on hot reload
if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      // Language files are served from public/locales/{lng}/translation.json
      backend: {
        loadPath: "/locales/{{lng}}/translation.json",
      },
      lng: typeof window !== "undefined"
        ? (localStorage.getItem("i18n-lang") || "en")
        : "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, // Prevent SSR suspense issues
      },
    });
}

// Persist language selection to localStorage on change
if (typeof window !== "undefined") {
  i18n.on("languageChanged", (lng) => {
    localStorage.setItem("i18n-lang", lng);
  });
}

export default i18n;
