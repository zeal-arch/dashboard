const fs = require('fs');

const baseObj = {
  nav: { explore: "Explore", search: "Search", trending: "Trending", favorites: "Favorites", history: "History", preferences: "Preferences" },
  feed: { title: "Your Feed", recommendationsTitle: "Recommended for You", loading: "Loading personalization feed...", empty: "No content available.", newAlert: "New real-time post received! Click to load" },
  trending: { title: "Trending Content" },
  favorites: { title: "Your Favorites", empty: "No favorites yet", placeholder: "Like cards to get personalized recommendations" },
  search: { title: "Search Content", placeholder: "Search for movies, music, or news..." },
  preferences: { title: "Content Preferences", theme: "Toggle Theme" },
};

const languages = ["es", "fr", "de", "hi", "bn", "te", "mr", "ta", "ur", "gu", "kn", "ml", "pa", "or", "as", "ma", "sat", "ks", "ne", "sd", "kok", "doi", "mni", "bho", "sa", "ar", "zh", "ja", "ko", "ru", "pt", "it", "id", "tr", "vi", "th", "nl", "pl", "sv", "uk", "el", "cs", "ro", "hu", "fi", "da", "no", "he", "ms", "fa", "sw", "tl", "bg", "hr", "sr", "sk", "sl", "et", "lv", "lt", "af", "sq", "hy", "az", "eu", "be", "bs", "ca", "ka", "is", "ga", "mk", "mt", "cy"];

async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0][0][0];
  } catch (e) {
    console.error(`Failed to translate "${text}" to ${targetLang}`, e);
    return text;
  }
}

async function translateObject(obj, targetLang) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object') {
      result[key] = await translateObject(obj[key], targetLang);
    } else {
      result[key] = await translateText(obj[key], targetLang);
    }
  }
  return result;
}

async function run() {
  const translations = { en: { translation: baseObj } };
  
  // Just test with a few languages first to see if it works without rate limits
  const testLangs = ["es", "fr", "hi"];
  
  for (const lang of testLangs) {
    console.log(`Translating to ${lang}...`);
    translations[lang] = { translation: await translateObject(baseObj, lang) };
    // Small delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(JSON.stringify(translations, null, 2));
}

run();
