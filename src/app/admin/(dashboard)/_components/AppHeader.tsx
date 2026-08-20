"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Settings, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setSearchQuery } from "@/lib/store/preferencesSlice";
import { useTranslation } from "react-i18next";

export function AppHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === "/admin/search";
  const dispatch = useAppDispatch();
  const globalQuery = useAppSelector((s) => s.preferences.searchQuery);
  const [prevGlobalQuery, setPrevGlobalQuery] = useState(globalQuery);
  const [localQuery, setLocalQuery] = useState(globalQuery);
  const debouncedQuery = useDebounce(localQuery, 400);
  const { t, i18n } = useTranslation();

  if (!isSearchPage && globalQuery !== prevGlobalQuery) {
    setPrevGlobalQuery(globalQuery);
    setLocalQuery(globalQuery);
  }

  useEffect(() => {
    if (isSearchPage) return; // Disable header debounced dispatch when already on the search page
    if (debouncedQuery !== globalQuery) {
      dispatch(setSearchQuery(debouncedQuery));
      if (debouncedQuery.trim() !== "" && pathname !== "/admin/search") {
        router.push("/admin/search");
      }
    }
  }, [debouncedQuery, globalQuery, dispatch, pathname, router, isSearchPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim() && pathname !== "/admin/search") {
      dispatch(setSearchQuery(localQuery));
      router.push("/admin/search");
    }
  };

  const getGlassButtonClass = (isActive: boolean) =>
    cn(
      "group relative isolate flex h-10 w-10 items-center justify-center",
      "overflow-hidden rounded-full",
      "transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out",
      "backdrop-blur-[22px] backdrop-saturate-[170%]",
      "bg-white/[0.075] border border-white/[0.38]",
      "shadow-[0_4px_16px_rgba(72,76,125,0.08),inset_0_1px_0_rgba(255,255,255,0.45)]",
      "before:pointer-events-none before:absolute before:inset-0 before:rounded-full",
      "before:bg-gradient-to-b before:from-white/[0.20] before:to-transparent before:opacity-70",
      "after:pointer-events-none after:absolute after:inset-[1px] after:rounded-full after:border after:border-white/[0.10]",
      "dark:bg-white/[0.045] dark:border-white/[0.14]",
      "dark:shadow-[0_5px_18px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]",
      "dark:before:from-white/[0.10] dark:after:border-white/[0.05]",
      "hover:scale-105",
      isActive && [
        "bg-[#9A9FF2]/[0.13] border-[#A7ABF5]/[0.42] text-[#5D639C]",
        "shadow-[0_5px_18px_rgba(103,108,188,0.10),inset_0_1px_0_rgba(255,255,255,0.52),inset_0_-1px_0_rgba(92,98,164,0.05)]",
        "dark:bg-[#B7B0FF]/[0.10] dark:border-[#C1BBFF]/[0.24] dark:text-[#D8D3FF]",
        "dark:shadow-[0_5px_18px_rgba(120,110,220,0.12),inset_0_1px_0_rgba(255,255,255,0.14)]",
      ]
    );

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(nextLang);
  };

  // If the user is currently on the Search page, we can hide the mini-search in the header
  // to avoid confusing duplicate search bars.
  
  return (
    <header className="mb-2 flex w-full items-center justify-between gap-4 px-2 py-1 sm:px-4">

      {/* Search Bar (Left) */}
      <div className="flex-1">
        {!isSearchPage && (
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <div className="relative flex items-center rounded-full bg-white/60 dark:bg-dark-2/50 border border-gray-200/80 dark:border-white/10 px-3 py-2 shadow-sm backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-primary/30">
              <Search className="h-4 w-4 text-gray-400 shrink-0 ml-1" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className="w-full bg-transparent px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none"
              />
            </div>
          </form>
        )}
      </div>

      {/* User Settings & Account Info (Right) */}
      <div className="flex items-center gap-4">
        {/* Language switch button */}
        <button
          onClick={toggleLanguage}
          title="Toggle Language / Alternar Idioma"
          className={cn(
            getGlassButtonClass(false),
            "text-[10px] font-bold font-satoshi flex items-center justify-center tracking-wider text-gray-700 dark:text-gray-200"
          )}
        >
          {i18n.language === "es" ? "ES" : "EN"}
        </button>

        <Link
          href="/admin/preferences"
          title={t("preferences.title")}
          className={getGlassButtonClass(pathname === "/admin/preferences")}
        >
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 group-hover:rotate-45" />
        </Link>

        <div className="h-8 w-px bg-gray-200/50 dark:bg-white/10" />

        <Link
          href="/admin/profile"
          className="flex items-center gap-3 rounded-full border border-transparent p-1 transition-all hover:bg-white/50 hover:border-gray-200/50 dark:hover:bg-white/5 dark:hover:border-white/10"
        >
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {session?.user?.name || "Dashboard User"}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 overflow-hidden relative">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Avatar"
                width={40}
                height={40}
                unoptimized
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
