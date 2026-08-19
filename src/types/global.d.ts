/**
 * Global type augmentations.
 * Extend Window, ProcessEnv, or other global interfaces here.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly NEXT_PUBLIC_SITE_URL?: string;
  }
}
