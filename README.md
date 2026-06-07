# 📚 My Reading List

A **premium, interactive reading list portfolio** built with a glassmorphic dark UI — showcasing my personal reading journey across data science, technology, philosophy, and fiction.

> **Live preview:** `http://localhost:3000` (run locally)

---

## ✨ Features

- 🌙 **Glassmorphic Dark Theme** — deep space color palette with violet/indigo/cyan accents
- 📖 **Book Collection** — browse, filter, and search by genre, status, and rating
- ➕ **Add / Edit / Delete Books** — fully interactive with `localStorage` persistence
- 📊 **Analytics Dashboard** — genre distribution, reading timeline, and rating charts
- 🔍 **Detail View** — quotes, key takeaways, and personal reviews per book
- 🎨 **Smooth Animations** — fade-in, slide-up, floating, shimmer effects

---

## 🛠 Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | [Next.js 16](https://nextjs.org) (App Router) |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com) |
| Icons       | [Lucide React](https://lucide.dev)   |
| Charts      | [Recharts](https://recharts.org) *(coming soon)* |
| Data        | `localStorage` (client-side)        |
| Font        | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/my-reading-list.git
cd my-reading-list

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
my-reading-list/
├── app/
│   ├── layout.js          # Root layout with font & metadata
│   ├── page.js            # Main landing page
│   └── globals.css        # Design system & theme tokens
├── components/            # Reusable UI components (coming)
│   ├── BookCard.js
│   ├── BookModal.js
│   ├── BookDetailsModal.js
│   └── AnalyticsDashboard.js
└── data/
    └── defaultBooks.js    # Pre-seeded book data
```

---

## 📌 Roadmap

- [x] Project setup & dark glassmorphic theme
- [ ] Book grid with filters & search
- [ ] Add / Edit / Delete modal
- [ ] Analytics dashboard (recharts)
- [ ] `localStorage` persistence
- [ ] Export / print reading list

---

*Built with ❤️ using Next.js & Tailwind CSS v4*
