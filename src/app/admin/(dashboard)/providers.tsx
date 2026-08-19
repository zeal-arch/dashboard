"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("admin-font-scale");
    return () => {
      document.body.classList.remove("admin-font-scale");
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="light" attribute="class">
          {children}
          <Toaster />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
