"use client";

import { BookOpen, Sparkles, BarChart3, Star, BookMarked, Brain, Cpu, Leaf } from "lucide-react";

const stats = [
  { label: "Books Read", value: "24+", icon: BookOpen, color: "text-violet-400" },
  { label: "Genres", value: "8", icon: BookMarked, color: "text-cyan-400" },
  { label: "Avg Rating", value: "4.3★", icon: Star, color: "text-amber-400" },
  { label: "Currently Reading", value: "2", icon: Brain, color: "text-rose-400" },
];

const previewBooks = [
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    genre: "Technology",
    status: "completed",
    rating: 5,
    color: "from-violet-600/20 to-indigo-600/20",
    border: "border-violet-500/20",
    icon: Cpu,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Growth",
    status: "completed",
    rating: 5,
    color: "from-cyan-600/20 to-blue-600/20",
    border: "border-cyan-500/20",
    icon: Leaf,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    status: "reading",
    rating: 4,
    color: "from-rose-600/20 to-orange-600/20",
    border: "border-rose-500/20",
    icon: Brain,
  },
];

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "star-filled fill-amber-400" : "star-empty fill-slate-700 text-slate-700"}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    reading: { label: "Reading", cls: "badge badge-reading" },
    completed: { label: "Completed", cls: "badge badge-completed" },
    "to-read": { label: "To Read", cls: "badge badge-to-read" },
  };
  const b = map[status] || map["to-read"];
  return <span className={b.cls}>{b.label}</span>;
}

function BookCard({ book, delay }) {
  const Icon = book.icon;
  return (
    <div
      className={`glass-card p-5 flex flex-col gap-3 animate-slide-up delay-${delay}`}
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className={`w-full h-28 rounded-lg bg-gradient-to-br ${book.color} border ${book.border} flex items-center justify-center`}>
        <Icon size={40} className="text-white/30" />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-200 leading-snug line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={book.status} />
        <StarRating rating={book.rating} />
      </div>
      <div>
        <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
          {book.genre}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* ── Ambient Orbs ── */}
      <div className="orb orb-violet w-[600px] h-[600px] -top-40 -left-40 opacity-60" />
      <div className="orb orb-cyan   w-[400px] h-[400px] top-1/3 -right-20 opacity-40" />
      <div className="orb orb-indigo w-[350px] h-[350px] bottom-0 left-1/3 opacity-30" />

      {/* ── Content Wrapper ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* ── Navbar ── */}
        <nav className="flex items-center justify-between mb-20 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-slate-200 font-semibold text-base tracking-tight">
              My<span className="gradient-text">Reading</span>List
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost text-sm py-2 px-4">All Books</button>
            <button className="btn-primary text-sm py-2 px-4">
              <Sparkles size={14} />
              Analytics
            </button>
          </div>
        </nav>

        {/* ── Hero Section ── */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-slate-400 mb-8 animate-slide-up">
            <Sparkles size={12} className="text-violet-400" />
            <span>A curated reading journey — books, reviews & insights</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight animate-slide-up delay-100">
            Every Book
            <br />
            <span className="shimmer-text">Tells a Story</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up delay-200">
            From <span className="text-violet-400 font-medium">data systems</span> to{" "}
            <span className="text-cyan-400 font-medium">human psychology</span> — my curated
            collection of books that shaped the way I think, build, and grow.
          </p>

          <div className="flex items-center justify-center gap-4 animate-slide-up delay-300">
            <button id="explore-btn" className="btn-primary px-8 py-3 text-base">
              <BookOpen size={16} />
              Explore Collection
            </button>
            <button id="analytics-btn" className="btn-ghost px-8 py-3 text-base">
              <BarChart3 size={16} />
              View Analytics
            </button>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 animate-slide-up delay-400">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass glass-hover p-5 text-center cursor-default">
                <Icon size={20} className={`${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </section>

        <div className="divider" />

        {/* ── Book Preview Grid ── */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                Featured <span className="gradient-text">Books</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">A preview of my reading shelf</p>
            </div>
            <button className="btn-ghost py-2 px-4 text-sm">View All →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {previewBooks.map((book, i) => (
              <BookCard key={book.title} book={book} delay={(i + 3) * 100} />
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── Analytics Teaser ── */}
        <section className="glass p-8 text-center animate-pulse-glow mb-12">
          <BarChart3 size={32} className="text-violet-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            Interactive <span className="gradient-text">Analytics Dashboard</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Explore genre distributions, reading timelines, and rating breakdowns with
            beautiful interactive charts — coming soon as part of the full app.
          </p>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-slate-600 text-xs pt-4 pb-6">
          Built with Next.js · Tailwind CSS v4 · Glassmorphic Dark UI
        </footer>

      </div>
    </main>
  );
}
