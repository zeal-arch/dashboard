"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Search, Heart, Settings, User as UserIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin/feed", icon: Compass, label: "My Feed" },
  { href: "/admin/trending", icon: Search, label: "Trending" },
  { href: "/admin/favorites", icon: Heart, label: "Favorites" },
  { href: "/admin/preferences", icon: Settings, label: "Preferences" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="relative flex h-full w-20 flex-col items-center py-8">
      {/* Top Section (Profile) */}
      <div className="absolute top-8 flex flex-col items-center">
        <Link
          href="/admin/preferences"
          title="Profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-gray-500 transition-all hover:bg-white hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white shadow-sm"
        >
          <UserIcon className="h-5 w-5" />
        </Link>
      </div>

      {/* Main Nav Items (Centered) */}
      <nav className="my-auto flex flex-col items-center gap-4">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                isActive
                  ? "bg-white text-gray-900 shadow-sm dark:bg-dark-2 dark:text-white"
                  : "bg-white/50 text-gray-500 hover:bg-white hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section (Theme) */}
      <div className="absolute bottom-8 flex flex-col items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            title="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-gray-500 transition-all hover:bg-white hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white"
          >
            {resolvedTheme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        )}
      </div>
    </aside>
  );
}
