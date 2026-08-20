"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en",  name: "English" },
  { code: "es",  name: "Español" },
  { code: "fr",  name: "Français" },
  { code: "de",  name: "Deutsch" },
  { code: "hi",  name: "हिन्दी" },
  { code: "bn",  name: "বাংলা" },
  { code: "te",  name: "తెలుగు" },
  { code: "mr",  name: "मराठी" },
  { code: "ta",  name: "தமிழ்" },
  { code: "ur",  name: "اردو" },
  { code: "gu",  name: "ગુજરાતી" },
  { code: "kn",  name: "ಕನ್ನಡ" },
  { code: "ml",  name: "മലയാളം" },
  { code: "pa",  name: "ਪੰਜਾਬੀ" },
  { code: "or",  name: "ଓଡ଼ିଆ" },
  { code: "as",  name: "অসমীয়া" },
  { code: "ne",  name: "नेपाली" },
  { code: "sa",  name: "संस्कृतम्" },
  { code: "ar",  name: "العربية" },
  { code: "zh",  name: "中文" },
  { code: "ja",  name: "日本語" },
  { code: "ko",  name: "한국어" },
  { code: "ru",  name: "Русский" },
  { code: "pt",  name: "Português" },
  { code: "it",  name: "Italiano" },
  { code: "id",  name: "Bahasa Indonesia" },
  { code: "tr",  name: "Türkçe" },
  { code: "vi",  name: "Tiếng Việt" },
  { code: "th",  name: "ไทย" },
  { code: "nl",  name: "Nederlands" },
  { code: "pl",  name: "Polski" },
  { code: "sv",  name: "Svenska" },
  { code: "uk",  name: "Українська" },
  { code: "el",  name: "Ελληνικά" },
  { code: "cs",  name: "Čeština" },
  { code: "ro",  name: "Română" },
  { code: "hu",  name: "Magyar" },
  { code: "fi",  name: "Suomi" },
  { code: "da",  name: "Dansk" },
  { code: "no",  name: "Norsk" },
  { code: "he",  name: "עברית" },
  { code: "ms",  name: "Bahasa Melayu" },
  { code: "fa",  name: "فارسی" },
  { code: "sw",  name: "Kiswahili" },
  { code: "tl",  name: "Tagalog" },
  { code: "bg",  name: "Български" },
  { code: "hr",  name: "Hrvatski" },
  { code: "sr",  name: "Српски" },
  { code: "sk",  name: "Slovenčina" },
  { code: "sl",  name: "Slovenščina" },
  { code: "et",  name: "Eesti" },
  { code: "lv",  name: "Latviešu" },
  { code: "lt",  name: "Lietuvių" },
  { code: "af",  name: "Afrikaans" },
  { code: "sq",  name: "Shqip" },
  { code: "hy",  name: "Հայերեն" },
  { code: "az",  name: "Azərbaycan" },
  { code: "eu",  name: "Euskara" },
  { code: "be",  name: "Беларуская" },
  { code: "bs",  name: "Bosanski" },
  { code: "ca",  name: "Català" },
  { code: "ka",  name: "ქართული" },
  { code: "is",  name: "Íslenska" },
  { code: "ga",  name: "Gaeilge" },
  { code: "mk",  name: "Македонски" },
  { code: "mt",  name: "Malti" },
  { code: "cy",  name: "Cymraeg" },
  { code: "kok", name: "कोंकणी" },
  { code: "doi", name: "डोगरी" },
  { code: "mni", name: "মৈতৈ" },
  { code: "bho", name: "भोजपुरी" },
  { code: "sd",  name: "سنڌي" },
  { code: "ks",  name: "كٲشُر" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          "relative flex h-10 items-center justify-center gap-1",
          "overflow-hidden rounded-full px-3",
          "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          "backdrop-blur-[22px] backdrop-saturate-170",
          "bg-white/7.5 border border-white/38",
          "shadow-[0_4px_16px_rgba(72,76,125,0.08),inset_0_1px_0_rgba(255,255,255,0.45)]",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-full",
          "before:bg-linear-to-b before:from-white/20 before:to-transparent before:opacity-70",
          "after:pointer-events-none after:absolute after:inset-px after:rounded-full after:border after:border-white/10",
          "dark:bg-white/4.5 dark:border-white/[0.14]",
          "dark:shadow-[0_5px_18px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "dark:before:from-white/10 dark:after:border-white/5"
        )}
      >
        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300 shrink-0" />
        <select
          value={i18n.language || "en"}
          onChange={handleLanguageChange}
          className="appearance-none bg-transparent outline-none text-[12px] font-semibold text-gray-700 dark:text-gray-200 cursor-pointer pr-1 max-w-22.5"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-black dark:text-black bg-white">
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
