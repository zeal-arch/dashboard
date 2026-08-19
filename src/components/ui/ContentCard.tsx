"use client";

import { motion } from "framer-motion";
import { Heart, ExternalLink, Newspaper, Film, Twitter, Headphones, Trophy, MessageSquare, Rocket, Coffee, Gamepad2, Sparkles } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleFavorite } from "@/lib/store/favoritesSlice";
import { recordInteraction } from "@/lib/store/preferencesSlice";
import { ContentItem } from "@/lib/store/contentSlice";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const TYPE_META = {
  news: { label: "News", icon: Newspaper, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
  movie: { label: "Movie", icon: Film, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
  social: { label: "Social", icon: Twitter, color: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
  music: { label: "Music", icon: Headphones, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  sports: { label: "Sports", icon: Trophy, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
  forum: { label: "Forum", icon: MessageSquare, color: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400" },
  science: { label: "Science", icon: Rocket, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" },
  food: { label: "Food", icon: Coffee, color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
  gaming: { label: "Gaming", icon: Gamepad2, color: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
  anime: { label: "Anime", icon: Sparkles, color: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400" },
};

interface ContentCardProps {
  item: ContentItem;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

// Extract YouTube video ID from music.youtube.com or youtube.com URLs
function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/[?&v=]([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}

export function ContentCard({ item, isDragging = false }: ContentCardProps) {
  const dispatch = useAppDispatch();
  const isFav = useAppSelector((s) => s.favorites.ids.includes(item.id));
  const meta = TYPE_META[item.type as keyof typeof TYPE_META] || TYPE_META.news;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex flex-col overflow-hidden h-[24rem] rounded-3xl border border-white/80 bg-white/50 backdrop-blur-3xl shadow-[0_8px_32px_rgb(142,148,242,0.15)] transition-all duration-300",
        "dark:border-white/20 dark:bg-white/10 dark:shadow-[0_8px_32px_rgb(0,0,0,0.5)]",
        isDragging && "scale-105 shadow-2xl ring-4 ring-primary/50 z-50 bg-white/80 dark:bg-white/20"
      )}
    >
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-[#020D1A]">
        <SmartImage
          src={item.type === "music" && item.url ? (getYouTubeThumbnail(item.url) ?? item.image) : item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500"
        />
        {/* Type badge */}
        <div className="absolute left-3 top-3 flex gap-2">
          {item.isRecommendation && (
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-sm border border-white/20 bg-amber-500/90 text-white dark:bg-amber-600/90 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              <Sparkles className="h-3 w-3" />
              Recommended for you
            </span>
          )}
          <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-sm border border-white/20", meta.color)}>
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>
        {/* Favorite button */}
        <button
          onClick={() => dispatch(toggleFavorite(item))}
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
            onClick={() => {
              dispatch(recordInteraction({ tag: item.category, weight: 1 }));
              dispatch(recordInteraction({ tag: item.type, weight: 1 }));
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-primary hover:text-white dark:bg-white/5 dark:text-gray-300 dark:hover:bg-primary"
          >
            {item.type === "movie" ? "Play Now" : item.type === "music" ? "Listen Now" : item.type === "sports" ? "View Match" : item.type === "science" ? "Explore Mission" : item.type === "food" ? "Visit Now" : item.type === "gaming" ? "Play Free" : item.type === "anime" ? "Watch Now" : "Read More"}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
