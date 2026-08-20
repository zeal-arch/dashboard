"use client";

import { useEffect } from "react";
import Script from "next/script";

// Add global CSS to hide the ugly Google Translate top frame and tooltips
// We append this dynamically so it only affects the app when the widget is present.
const googleTranslateStyles = `
  /* Hide the top translation banner */
  .skiptranslate iframe.goog-te-banner-frame {
    display: none !important;
  }
  
  /* Fix body jumping down when banner is hidden */
  body {
    top: 0px !important;
  }

  /* Hide the tooltip that appears on hover */
  .goog-tooltip {
    display: none !important;
  }
  
  .goog-tooltip:hover {
    display: none !important;
  }
  
  /* Hide hover highlight bounding box */
  .goog-text-highlight {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Style the select dropdown slightly */
  .goog-te-combo {
    padding: 6px 12px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(8px);
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dark .goog-te-combo {
    background: rgba(0, 0, 0, 0.2);
    color: #f3f4f6;
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* Remove "Powered by Google" */
  .goog-logo-link {
    display: none !important;
  }
  .goog-te-gadget {
    color: transparent !important;
    font-size: 0;
  }
  
  .goog-te-gadget .goog-te-combo {
    margin: 0;
  }
`;

export function GoogleTranslate() {
  useEffect(() => {
    // Inject the CSS
    const styleId = "google-translate-overrides";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = googleTranslateStyles;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      <div id="google_translate_element" className="flex items-center justify-center translate-y-0.5" />

      {/* We use next/script with a callback approach to initialize */}
      <Script
        id="google-translate-script"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />

      <Script
        id="google-translate-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.googleTranslateElementInit = function() {
              new window.google.translate.TranslateElement(
                { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
                'google_translate_element'
              );
            };
          `,
        }}
      />
    </>
  );
}
