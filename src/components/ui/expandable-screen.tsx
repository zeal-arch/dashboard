"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BodyScrollLock, useIsClient, useClickAway } from "@/hooks";

// ── Context ──
interface ExpandableScreenContextValue {
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextValue | null>(null);

function useExpandableScreen() {
  const context = useContext(ExpandableScreenContext);
  if (!context) {
    throw new Error(
      "useExpandableScreen must be used within an ExpandableScreen",
    );
  }
  return context;
}

// ── Root ──
interface ExpandableScreenProps {
  children: ReactNode;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  lockScroll?: boolean;
  // accepted but unused — kept so existing call-sites don't break
  layoutId?: string;
  triggerRadius?: string;
  animationDuration?: number;
  contentRadius?: string;
}

export function ExpandableScreen({
  children,
  defaultExpanded = false,
  onExpandChange,
  lockScroll = true,
}: ExpandableScreenProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const expand = () => {
    setIsExpanded(true);
    onExpandChange?.(true);
  };

  const collapse = () => {
    setIsExpanded(false);
    onExpandChange?.(false);
  };

  return (
    <ExpandableScreenContext.Provider value={{ isExpanded, expand, collapse }}>
      {lockScroll && isExpanded && <BodyScrollLock />}
      {children}
    </ExpandableScreenContext.Provider>
  );
}

// ── Trigger ──
interface ExpandableScreenTriggerProps {
  children: ReactNode;
  className?: string;
}

export function ExpandableScreenTrigger({
  children,
  className = "",
}: ExpandableScreenTriggerProps) {
  const { expand } = useExpandableScreen();

  return (
    <div onClick={expand} className={`cursor-pointer ${className}`}>
      {children}
    </div>
  );
}

// ── Content ──
// Rendered via portal to document.body — avoids parent CSS interference
// (transforms, filters, overflow, stacking contexts from the carousel).
// Uses coordinated tween transitions (no springs) so backdrop + panel
// exit at the same time with no leftover invisible DOM blocking clicks.
interface ExpandableScreenContentProps {
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeButtonClassName?: string;
}

export function ExpandableScreenContent({
  children,
  className = "",
  showCloseButton = true,
  closeButtonClassName = "",
}: ExpandableScreenContentProps) {
  const { isExpanded, collapse } = useExpandableScreen();
  const contentRef = useClickAway<HTMLDivElement>(collapse);
  const isClient = useIsClient();

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          key="expandable-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-110 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-5 backdrop-blur-sm"
        >
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative flex w-full items-center justify-center ${className}`}
          >
            {showCloseButton && (
              <button
                onClick={collapse}
                className={`absolute right-0 top-0 z-30 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  closeButtonClassName ||
                  "bg-white/15 text-white backdrop-blur-sm hover:bg-white/30"
                }`}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Background (optional) ──
interface ExpandableScreenBackgroundProps {
  trigger?: ReactNode;
  content?: ReactNode;
  className?: string;
}

export function ExpandableScreenBackground({
  trigger,
  content,
  className = "",
}: ExpandableScreenBackgroundProps) {
  const { isExpanded } = useExpandableScreen();

  if (isExpanded && content) {
    return <div className={className}>{content}</div>;
  }

  if (!isExpanded && trigger) {
    return <div className={className}>{trigger}</div>;
  }

  return null;
}

export { useExpandableScreen };
