import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import "@/styles/globals.css"; // Ensure styles are imported

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
    </>
  );
}
