/**
 * generate-translations.js
 * 
 * Generates translation JSON files for all 75 supported languages using
 * the free Google Translate API endpoint. Files are saved to:
 *   public/locales/{lang}/translation.json
 * 
 * Run: node generate-translations.js
 */

const fs = require('fs');
const path = require('path');

// ─── Full UI string catalogue ──────────────────────────────────────────────────
const BASE = {
  nav: {
    explore: "Explore",
    search: "Search",
    trending: "Trending",
    favorites: "Favorites",
    history: "History",
    preferences: "Preferences",
  },
  feed: {
    title: "Your Feed",
    recommendationsTitle: "Recommended for You",
    loading: "Loading personalization feed...",
    empty: "No content available.",
    newAlert: "New real-time post received! Click to load",
  },
  trending: {
    title: "Trending Content",
  },
  favorites: {
    title: "Your Favorites",
    empty: "No favorites yet",
    placeholder: "Like cards to get personalized recommendations",
    clearAll: "Clear all",
  },
  search: {
    title: "Search Content",
    placeholder: "Search for movies, music, or news...",
    noResults: "No results found",
    noResultsHint: "Try a different search term",
    results: "results",
  },
  preferences: {
    title: "Content Preferences",
    theme: "Toggle Theme",
    categories: "Content Categories",
    categoriesHint: "Select the types of content you want to see",
  },
  profile: {
    title: "Profile",
    editProfile: "Edit Profile",
    save: "Save changes",
    name: "Name",
    email: "Email",
    bio: "Bio",
    location: "Location",
    website: "Website",
  },
  loginHistory: {
    title: "Login History",
    device: "Device",
    location: "Location",
    time: "Time",
    status: "Status",
    success: "Success",
    failed: "Failed",
  },
  chart: {
    title: "Content Analytics",
    views: "Views",
    engagement: "Engagement",
  },
  common: {
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    refresh: "Refresh",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    noData: "No data available",
  },
};

// ─── All 75 supported language codes ──────────────────────────────────────────
const LANGUAGES = [
  "es","fr","de","hi","bn","te","mr","ta","ur","gu","kn","ml","pa",
  "or","as","ne","sd","sa","ar","zh","ja","ko","ru","pt","it","id",
  "tr","vi","th","nl","pl","sv","uk","el","cs","ro","hu","fi","da",
  "no","he","ms","fa","sw","tl","bg","hr","sr","sk","sl","et","lv",
  "lt","af","sq","hy","az","eu","be","bs","ca","ka","is","ga","mk",
  "mt","cy","kok","doi","mni","bho","ks","ma","sat","mni",
];

// ─── Translate a single string ─────────────────────────────────────────────────
async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return text;
    const data = await res.json();
    // Collect all translation fragments (Google sometimes splits long strings)
    const translated = data[0].map(seg => seg[0]).join('');
    return translated || text;
  } catch {
    return text; // fallback to English on any error
  }
}

// ─── Recursively translate an object ──────────────────────────────────────────
async function translateObject(obj, targetLang) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = await translateObject(obj[key], targetLang);
    } else {
      result[key] = await translateText(obj[key], targetLang);
      // Small delay to be respectful of the free endpoint
      await new Promise(r => setTimeout(r, 80));
    }
  }
  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const outDir = path.join(__dirname, 'public', 'locales');
  
  // Always write English first (no translation needed)
  const enDir = path.join(outDir, 'en');
  fs.mkdirSync(enDir, { recursive: true });
  fs.writeFileSync(path.join(enDir, 'translation.json'), JSON.stringify(BASE, null, 2));
  console.log('✓ en (base)');

  const unique = [...new Set(LANGUAGES)];

  for (const lang of unique) {
    const langDir = path.join(outDir, lang);
    const outFile = path.join(langDir, 'translation.json');

    // Skip if already generated (allows resuming interrupted runs)
    if (fs.existsSync(outFile)) {
      console.log(`⏭  ${lang} (already exists, skipping)`);
      continue;
    }

    try {
      process.stdout.write(`  Translating ${lang}... `);
      const translated = await translateObject(BASE, lang);
      fs.mkdirSync(langDir, { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(translated, null, 2));
      console.log('✓');
    } catch (err) {
      console.log(`✗ (${err.message}) — writing English fallback`);
      fs.mkdirSync(langDir, { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(BASE, null, 2));
    }

    // Brief pause between languages to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n✅ All translation files generated in public/locales/');
}

main().catch(console.error);
