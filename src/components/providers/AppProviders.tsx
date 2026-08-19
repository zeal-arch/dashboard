"use client";

import { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { LayoutGroup } from "framer-motion";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root-level provider wrapper.
 * Add global providers (theme, auth, toast, smooth-scroll, etc.) here
 * so the root layout stays clean.
 */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReactLenis root options={{ autoRaf: true }}>
      <LayoutGroup>{children}</LayoutGroup>
    </ReactLenis>
  );
}
