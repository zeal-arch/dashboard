"use client";

import { useLockBodyScroll } from "./usehooks";

/**
 * Render this component conditionally to lock body scroll.
 * Locks on mount, unlocks on unmount.
 *
 * Usage: {isOpen && <BodyScrollLock />}
 */
export function BodyScrollLock() {
  useLockBodyScroll();
  return null;
}
