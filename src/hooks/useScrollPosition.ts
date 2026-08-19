"use client";

import { useWindowScroll } from "./usehooks";

export function useScrollPosition(): number {
  const [{ y }] = useWindowScroll();
  return y ?? 0;
}
