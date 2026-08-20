# Local Development Guide

This guide provides instructions on how to set up, run, and test the Personalized Content Dashboard locally.

## Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

## Setup

1. Open a terminal and navigate to the `dashboard` directory.
2. Install the required dependencies:
   ```bash
   npm install
   ```

## Running the Application (Development)

Start the Next.js development server:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000). 
*(Note: The app uses mocked API routes for rapid development and testing, so no external API keys are required.)*

## Testing

This project uses [Playwright](https://playwright.dev/) for robust End-to-End (E2E) testing. The test suite covers authentication, personalization, theme toggling, drag-and-drop, localization, and more.

To run the complete test suite:
```bash
npx playwright test
```

To view the detailed HTML test report:
```bash
npx playwright show-report
```

## Linting & Building (Production)

To ensure code quality and check for linting errors:
```bash
npm run lint
```

To create an optimized production build:
```bash
npm run build
```

To run the production build locally:
```bash
npm run start
```

## Generating Translations

The project supports 75 languages natively. If you need to regenerate or add to the translation dictionaries, you can run the utility script:
```bash
node generate-translations.js
```
*(This will populate `public/locales` with the necessary JSON files).*
