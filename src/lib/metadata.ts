import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://www.rayvoy.com"),
  title: {
    default: "RAYVOY — Study Abroad Experts",
    template: "%s | RAYVOY",
  },
  description:
    "Expert guidance for students applying to top universities in the USA, UK, Canada, Australia & Europe. Free counselling, SOP help, visa support.",
  openGraph: {
    type: "website",
    siteName: "RAYVOY",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};
