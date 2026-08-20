# Personalized Content Dashboard

A highly interactive, personalized content dashboard built as part of the Software Development Engineer (SDE) Intern Frontend Development Assignment. This application curates and displays content across various categories (News, Movies, Music, Sports, etc.), offering a tailored experience based on user preferences.

## Features

- **Multi-Category Feed:** Aggregates content from News, Movies, Music, Sports, and more.
- **Smart Recommendations:** Uses a personalized recommendation engine (TF-IDF cosine similarity) to suggest content based on user favorites.
- **Real-Time Updates:** Seamlessly integrates Server-Sent Events (SSE) for real-time notifications and feed updates.
- **Global Localization (i18n):** Native support for 75 languages (including major international and Indian regional languages) with dynamic JSON-based translation loading.
- **Advanced UI/UX:** Built with Tailwind CSS v4 and Framer Motion for smooth, glassmorphism-inspired design, dark mode support, and drag-and-drop feed reordering.
- **Robust State Management:** Utilizes Redux Toolkit and Redux Persist to maintain user preferences, themes, and favorites across sessions.
- **Comprehensive E2E Testing:** Fully tested using Playwright, ensuring high reliability across critical user flows.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **Library:** [React](https://reactjs.org/) 19
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) + [Redux Persist](https://github.com/rt2zz/redux-persist)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Testing:** [Playwright](https://playwright.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Localization:** `react-i18next` + `i18next-http-backend`

## Project Structure

- `src/app`: Next.js App Router pages and internal API routes.
- `src/components`: Reusable UI components (ContentCards, LanguageSwitcher, Sidebar, etc.).
- `src/lib/store`: Redux slices and persistent store configuration.
- `e2e`: Playwright End-to-End test suites.
- `public/locales`: Generated JSON translation dictionaries for 75 languages.

## Getting Started

Please refer to the **[Local Development Guide](../readme.md)** for detailed instructions on how to install, run, test, and build the project locally.
