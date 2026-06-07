# Implementation Plan - "My Reading List" Portfolio Web App

This plan outlines the steps to build a premium, highly interactive "My Reading List" web application in the empty workspace. The design will feature a modern dark glassmorphic UI to showcase frontend development, personal reading habits, and data science skills through interactive charts.

---

## User Review Required

> [!IMPORTANT]
> **Project Setup and Stack:** We will bootstrap the application using Next.js App Router (JavaScript), Tailwind CSS, ESLint, and npm. We will also install `lucide-react` for high-quality icons and `recharts` for interactive data visualization.
> 
> **Data Storage:** The initial books will be loaded from a pre-defined JSON configuration. To showcase interactive capabilities, any changes (adding new books, editing ratings/status, deleting) will be persisted in `localStorage`. This avoids requiring a complex database setup while keeping the app fully functional and interactive as a client-side demo.

---

## Open Questions

> [!NOTE]
> 1. **Default Book List:** I will populate the list with 6 default books covering Data Science, Tech, Philosophy, and Fiction (e.g., *Designing Data-Intensive Applications*, *Atomic Habits*, *Thinking, Fast and Slow*). Let me know if you would like me to include any specific books of your choice.
> 2. **Charts Library:** `recharts` is standard for React dashboards. If there are package installation conflicts, we can fall back to custom-styled SVG charts. I will attempt to install `recharts` first.

---

## Proposed Changes

We will build the Next.js project directly in the workspace root. Below is the proposed file structure and changes.

### Core Structure & Pages

#### [NEW] [package.json](file:///e:/My%20Reading%20List/package.json)
- Next.js project settings and scripts.
- Dependencies: `next`, `react`, `react-dom`, `lucide-react`, `recharts`, `clsx`, `tailwind-merge`.

#### [NEW] [tailwind.config.js](file:///e:/My%20Reading%20List/tailwind.config.js)
- Extend color palette with violet/indigo/cyan theme.
- Add animation utilities for smooth hover and glassmorphic fade-in transitions.

#### [NEW] [app/layout.js](file:///e:/My%20Reading%20List/app/layout.js)
- Setup the main HTML5 structure, title tags, responsive meta tags, and global Google Font (Inter/Outfit).

#### [NEW] [app/page.js](file:///e:/My%20Reading%20List/app/page.js)
- The main entry point. It will coordinate the state (book list, filter criteria, active views) and render:
  1. Header / Hero section (stats count).
  2. Analytics Dashboard (Genre distribution, Reading Progress, Rating distribution).
  3. Interactive Filters & Search.
  4. Book Showcase Grid.
  5. Add/Edit Book Modal.
  6. Detailed Book View Modal (with review & takeaway).
  7. Quote Spotlight.

#### [NEW] [data/defaultBooks.js](file:///e:/My%20Reading%20List/data/defaultBooks.js)
- Hardcoded list of sample books to populate `localStorage` on first load.
- Fields: `id`, `title`, `author`, `genre`, `rating` (1-5), `status` ("Reading", "Completed", "To-Read"), `startYear`, `startMonth`, `review`, `takeaway`, `quote`, `coverUrl`.

#### [NEW] [components/AnalyticsDashboard.js](file:///e:/My%20Reading%20List/components/AnalyticsDashboard.js)
- A separate component rendering three charts using `recharts` or custom SVGs:
  - **Books Per Genre** (Bar/Donut chart)
  - **Reading Journey Timeline** (Line chart of books read by month/year)
  - **Rating Distribution** (Bar chart of 1-5 stars)

#### [NEW] [components/BookCard.js](file:///e:/My%20Reading%20List/components/BookCard.js)
- Renders an individual book with glassmorphism styling, cover thumbnail, status badge, rating stars, and genre tags.

#### [NEW] [components/BookModal.js](file:///e:/My%20Reading%20List/components/BookModal.js)
- A multipurpose slide-over/modal to **Add** or **Edit** books in the list.

#### [NEW] [components/BookDetailsModal.js](file:///e:/My%20Reading%20List/components/BookDetailsModal.js)
- A modal to show the book details, quotes, key takeaways, and personal rating.

---

## Verification Plan

### Automated Tests
- Build verification: `npm run build` to ensure Next.js outputs a production bundle without syntax or import errors.
- Lint verification: `npm run lint` to check for code standard conformance.

### Manual Verification
- Launch local development server (`npm run dev`) and test:
  1. Responsive design on desktop and mobile.
  2. Searching and filtering by genre and status.
  3. Adding, editing, and deleting a book (verifying localStorage sync).
  4. Interactions in the dashboard charts (recharts hover states).
  5. Exporting list or mock printing.
