"use client";

import { motion } from "framer-motion";
import { Heart, ExternalLink, Newspaper, Film, Twitter } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleFavorite } from "@/lib/store/favoritesSlice";
import { ContentItem } from "@/lib/store/contentSlice";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const TYPE_META = {
  news:   { label: "News",    icon: Newspaper, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
  movie:  { label: "Movie",   icon: Film,      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
  social: { label: "Social",  icon: Twitter,   color: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
};

interface ContentCardProps {
  item: ContentItem;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function ContentCard({ item, isDragging = false }: ContentCardProps) {
  const dispatch = useAppDispatch();
  const isFav = useAppSelector((s) => s.favorites.ids.includes(item.id));
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex flex-col overflow-hidden h-[420px] rounded-[1.5rem] border border-white/80 bg-white/50 backdrop-blur-3xl shadow-[0_8px_32px_rgb(142,148,242,0.15)] transition-all duration-300",
        "dark:border-white/20 dark:bg-white/10 dark:shadow-[0_8px_32px_rgb(0,0,0,0.5)]",
        isDragging && "scale-105 shadow-2xl ring-4 ring-primary/50 z-50 bg-white/80 dark:bg-white/20"
      )}
    >
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-[#020D1A]">
        <SmartImage
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500"
        />
        {/* Type badge */}
        <span className={cn("absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-sm border border-white/20", meta.color)}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        {/* Favorite button */}
        <button
          onClick={() => dispatch(toggleFavorite(item.id))}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all border border-white/20 shadow-sm",
            isFav
              ? "bg-red-500/90 text-white"
              : "bg-white/50 text-gray-600 hover:bg-white hover:text-red-500 dark:bg-black/50 dark:text-gray-300 dark:hover:bg-black/80"
          )}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">{item.source}</span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 dark:text-white transition-colors">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {item.description}
        </p>

        <div className="mt-auto pt-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-primary hover:text-white dark:bg-white/5 dark:text-gray-300 dark:hover:bg-primary"
          >
            {item.type === "movie" ? "Play Now" : "Read More"}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
