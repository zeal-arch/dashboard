"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      nav: {
        explore: "Explore",
        search: "Search",
        trending: "Trending",
        favorites: "Favorites",
        history: "History",
        preferences: "Preferences",
      },
      feed: {
        title: "Your Feed",
        recommendationsTitle: "✨ Recommended for You",
        loading: "Loading personalization feed...",
        empty: "No content available.",
        newAlert: "New real-time post received! Click to load",
      },
      trending: {
        title: "Trending Content",
      },
      favorites: {
        title: "Your Favorites",
        empty: "No favorites yet",
        placeholder: "Like cards to get personalized recommendations",
      },
      search: {
        title: "Search Content",
        placeholder: "Search for movies, music, or news...",
      },
      preferences: {
        title: "Content Preferences",
        theme: "Toggle Theme",
      },
    },
  },
  es: {
    translation: {
      nav: {
        explore: "Explorar",
        search: "Buscar",
        trending: "Tendencias",
        favorites: "Favoritos",
        history: "Historial",
        preferences: "Preferencias",
      },
      feed: {
        title: "Tu Feed",
        recommendationsTitle: "✨ Recomendado para ti",
        loading: "Cargando feed de personalización...",
        empty: "No hay contenido disponible.",
        newAlert: "¡Nueva publicación en tiempo real recibida! Haz clic para cargar",
      },
      trending: {
        title: "Contenido de Tendencia",
      },
      favorites: {
        title: "Tus Favoritos",
        empty: "No hay favoritos todavía",
        placeholder: "Dale me gusta a las tarjetas para recibir recomendaciones",
      },
      search: {
        title: "Buscar Contenido",
        placeholder: "Buscar películas, música o noticias...",
      },
      preferences: {
        title: "Preferencias de Contenido",
        theme: "Alternar Tema",
      },
    },
  },
};

// Check if i18n is already initialized to prevent duplicate init on hot reload
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, // Prevent SSR suspense issues
      },
    });
}

export default i18n;
