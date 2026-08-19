"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    document.body.classList.add("admin-font-scale");
    return () => {
      document.body.classList.remove("admin-font-scale");
    };
  }, []);

  return (
    <Provider store={store}>
      {mounted ? (
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      ) : (
        <div className="font-satoshi relative flex h-screen w-full items-center justify-center bg-linear-to-br from-[#e0e5ff] to-[#f3e7e9] dark:from-[#0B1425] dark:to-[#1A1A2E]">
          <div className="w-10 h-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary/80" />
        </div>
      )}
      <Toaster />
    </Provider>
  );
}
