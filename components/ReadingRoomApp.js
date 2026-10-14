"use client";

import { useState, useMemo } from "react";
import {
  BookOpen, Search, Filter, Plus, BarChart3,
  Sparkles, Shield, Bookmark, CheckCircle2,
  RotateCcw, ArrowRight, Library, LayoutGrid,
  LibraryBig, Download, ExternalLink
} from "lucide-react";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import BookDetailsModal from "@/components/BookDetailsModal";
import AdminModal from "@/components/AdminModal";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import SpineShelf from "@/components/SpineShelf";
import { ThemeToggle } from "@/components/ThemeProvider";
import {
  loginAction,
  logoutAction,
  saveBookAction,
  deleteBookAction,
  promoteBookAction,
  resetDatabaseAction,
} from "@/app/actions";

const hasBengali = (text) => /[\u0980-\u09FF]/.test(text || "");

export default function ReadingRoomApp({ initialBooks = [], initialIsAdmin = false }) {
  const [books, setBooks] = useState(initialBooks);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activeTab, setActiveTab] = useState("shelf"); // "shelf" | "upcoming" | "analytics"
  const [viewMode, setViewMode] = useState("shelf"); // "shelf" (Spine view) | "grid" (Card view)

  // Modals
  const [detailsBook, setDetailsBook] = useState(null);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Derived Book Subsets
  const shelfBooks = useMemo(() => {
    return books.filter((b) => b.status !== "upcoming");
  }, [books]);

  const upcomingBooks = useMemo(() => {
    return books.filter((b) => b.status === "upcoming");
  }, [books]);

  // Dynamic Genres extracted from current catalogue
  const genres = useMemo(() => {
    const set = new Set();
    shelfBooks.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return ["All", ...Array.from(set).sort()];
  }, [shelfBooks]);

  // Filtered Shelf Books
  const filteredShelfBooks = useMemo(() => {
    return shelfBooks.filter((b) => {
      const matchSearch =
        searchQuery === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.review && b.review.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.takeaway && b.takeaway.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGenre = selectedGenre === "All" || b.genre === selectedGenre;
      const matchStatus = selectedStatus === "All" || b.status === selectedStatus;

      return matchSearch && matchGenre && matchStatus;
    });
  }, [shelfBooks, searchQuery, selectedGenre, selectedStatus]);

  // Featured Quote of the day
  const featuredQuote = useMemo(() => {
    const quotedBooks = shelfBooks.filter((b) => b.quote && b.quote.trim().length > 0);
    if (!quotedBooks.length) return null;
    return quotedBooks[0];
  }, [shelfBooks]);

  // Flash Status Message Helper
  const flashMessage = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 3500);
  };

  // Auth Handlers
  const handleAuthenticate = async ({ username, password }) => {
    const res = await loginAction(username, password);
    if (res.success) {
      setIsAdmin(true);
      flashMessage("Authenticated as Administrator");
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const handleLogout = async () => {
    await logoutAction();
    setIsAdmin(false);
    flashMessage("Admin session locked");
  };

  // Mutation Handlers
  const handleSaveBook = async (bookData) => {
    const res = await saveBookAction(bookData);
    if (res.success) {
      setBooks((prev) => {
        const idx = prev.findIndex((b) => String(b.id) === String(res.book.id));
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = res.book;
          return updated;
        }
        return [res.book, ...prev];
      });
      flashMessage(`"${res.book.title}" saved to library`);
    } else {
      alert(res.error || "Failed to save book");
    }
  };

  const handleDeleteBook = async (id) => {
    const res = await deleteBookAction(id);
    if (res.success) {
      setBooks((prev) => prev.filter((b) => String(b.id) !== String(id)));
      flashMessage("Book removed from library");
    } else {
      alert(res.error || "Failed to delete book");
    }
  };

  const handlePromoteUpcoming = async (book) => {
    const res = await promoteBookAction(book.id, "to-read");
    if (res.success) {
      setBooks((prev) =>
        prev.map((b) => (String(b.id) === String(book.id) ? res.book : b))
      );
      flashMessage(`"${book.title}" added to active reading list!`);
    } else {
      alert(res.error || "Failed to promote book");
    }
  };

  const handleResetDatabase = async () => {
    if (window.confirm("Reset all books back to initial default seed? Any local additions will be refreshed.")) {
      const res = await resetDatabaseAction();
      if (res.success) {
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Skip to Main Content Link for A11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Persistent Notification Banner */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/90 text-white border border-indigo-500/30 shadow-2xl backdrop-blur-md animate-fade-in text-sm font-medium"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 navbar border-b border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Library size={18} />
            </div>
            <div>
              <span className="text-base font-bold text-main tracking-tight block leading-none">
                Sojib&apos;s Reading Room
              </span>
              <span className="text-[0.68rem] text-muted font-medium mt-1 block">
                Virtual Library &amp; Literary Archive
              </span>
            </div>
          </div>

          {/* Navigation Stations */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-surface/60 p-1 rounded-xl border border-color">
            <button
              onClick={() => setActiveTab("shelf")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "shelf"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted hover:text-main hover:bg-btn-ghost-hover"
              }`}
            >
              <BookOpen size={13} />
              The Stacks ({shelfBooks.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "upcoming"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted hover:text-main hover:bg-btn-ghost-hover"
              }`}
            >
              <Bookmark size={13} />
              Queue ({upcomingBooks.length})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted hover:text-main hover:bg-btn-ghost-hover"
              }`}
            >
              <BarChart3 size={13} />
              The Ledger
            </button>
          </nav>

          {/* Top Actions: Theme, Export, Admin & Add */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Export Dropdown Link */}
            <a
              href="/api/export?format=json"
              download
              title="Export Library (JSON)"
              className="p-2 rounded-lg border border-color bg-surface text-muted hover:text-main hover:border-indigo-500/30 transition-all flex items-center justify-center text-xs"
            >
              <Download size={14} />
            </a>

            {isAdmin && (
              <button
                onClick={() => {
                  setBookToEdit(null);
                  setIsBookModalOpen(true);
                }}
                className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg shadow-sm"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add Book</span>
              </button>
            )}

            <button
              onClick={() => setIsAdminModalOpen(true)}
              aria-label={isAdmin ? "Admin Controls" : "Admin Login"}
              className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-surface border-color text-muted hover:text-main hover:border-indigo-500/30"
              }`}
            >
              <Shield size={14} />
              <span className="hidden sm:inline text-[0.72rem] font-medium">
                {isAdmin ? "Admin" : "Login"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Hero Section: Quote Spotlight & Literary Atmosphere */}
        {featuredQuote && activeTab === "shelf" && (
          <section
            aria-label="Spotlight Quote"
            className="surface relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-color"
          >
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  <Sparkles size={11} />
                  Spotlight Quote
                </span>
                <span className="text-xs text-muted">from {featuredQuote.title}</span>
              </div>
              <blockquote
                lang={hasBengali(featuredQuote.quote) ? "bn" : "en"}
                className={`text-lg sm:text-xl font-medium text-main italic leading-relaxed max-w-3xl ${
                  hasBengali(featuredQuote.quote) ? "font-bengali-serif" : ""
                }`}
              >
                &ldquo;{featuredQuote.quote}&rdquo;
              </blockquote>
              <p className="text-xs text-muted">
                — {featuredQuote.author}
              </p>
            </div>
          </section>
        )}

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden items-center justify-between bg-surface p-1 rounded-xl border border-color">
          <button
            onClick={() => setActiveTab("shelf")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeTab === "shelf" ? "bg-indigo-600 text-white" : "text-muted"
            }`}
          >
            Stacks ({shelfBooks.length})
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeTab === "upcoming" ? "bg-indigo-600 text-white" : "text-muted"
            }`}
          >
            Queue ({upcomingBooks.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeTab === "analytics" ? "bg-indigo-600 text-white" : "text-muted"
            }`}
          >
            Ledger
          </button>
        </div>

        {/* Active View: The Stacks (Shelf) */}
        {activeTab === "shelf" && (
          <div className="flex flex-col gap-6">
            
            {/* Search, Filters, and Shelf/Grid View Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors, or insights..."
                  className="input-dark w-full pl-10 pr-4 py-2 text-xs rounded-xl"
                  aria-label="Search through reading catalogue"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-main"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* View Switcher & Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                
                {/* Shelf vs Grid Toggle */}
                <div className="flex items-center bg-surface border border-color p-0.5 rounded-xl">
                  <button
                    onClick={() => setViewMode("shelf")}
                    aria-label="Bookshelf View"
                    title="Bookshelf Spine View"
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      viewMode === "shelf" ? "bg-indigo-600 text-white shadow-sm" : "text-muted hover:text-main"
                    }`}
                  >
                    <LibraryBig size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid View"
                    title="Card Grid View"
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      viewMode === "grid" ? "bg-indigo-600 text-white shadow-sm" : "text-muted hover:text-main"
                    }`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-1.5 bg-surface border border-color px-2.5 py-1.5 rounded-xl text-xs text-muted">
                  <Filter size={12} className="text-indigo-400" />
                  <span className="font-semibold uppercase tracking-wider text-[0.62rem]">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent text-main focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="All" style={{ background: 'var(--bg-input-option)' }}>All Statuses</option>
                    <option value="completed" style={{ background: 'var(--bg-input-option)' }}>Completed</option>
                    <option value="reading" style={{ background: 'var(--bg-input-option)' }}>Currently Reading</option>
                    <option value="to-read" style={{ background: 'var(--bg-input-option)' }}>To Read</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-surface border border-color px-2.5 py-1.5 rounded-xl text-xs text-muted">
                  <span className="font-semibold uppercase tracking-wider text-[0.62rem]">Genre:</span>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="bg-transparent text-main focus:outline-none cursor-pointer text-xs max-w-[130px] truncate"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g} style={{ background: 'var(--bg-input-option)' }}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count & Filter Reset */}
            <div className="flex items-center justify-between text-xs text-muted border-b border-color pb-2">
              <span>
                Showing <strong className="text-main">{filteredShelfBooks.length}</strong> of {shelfBooks.length} volumes in The Stacks
              </span>
              {(searchQuery || selectedGenre !== "All" || selectedStatus !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGenre("All");
                    setSelectedStatus("All");
                  }}
                  className="text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Reset Filters
                </button>
              )}
            </div>

            {/* Books Presentation: Spine Shelf or Grid View */}
            {filteredShelfBooks.length > 0 ? (
              viewMode === "shelf" ? (
                <SpineShelf
                  books={filteredShelfBooks}
                  onSelectBook={(b) => setDetailsBook(b)}
                  selectedGenre={selectedGenre}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 animate-fade-in">
                  {filteredShelfBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onOpenDetails={(b) => setDetailsBook(b)}
                      onOpenEdit={(b) => {
                        setBookToEdit(b);
                        setIsBookModalOpen(true);
                      }}
                      onDelete={handleDeleteBook}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="surface text-center py-16 px-4 rounded-2xl flex flex-col items-center gap-3">
                <BookOpen size={32} className="text-muted opacity-40" />
                <h3 className="text-sm font-semibold text-main">No books matched your criteria</h3>
                <p className="text-xs text-muted max-w-sm">
                  Try adjusting your search query, or clear selected status and genre filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGenre("All");
                    setSelectedStatus("All");
                  }}
                  className="btn-ghost text-xs px-3 py-1.5 mt-2"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active View: Upcoming Queue */}
        {activeTab === "upcoming" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-color pb-4">
              <div>
                <h2 className="text-base font-bold text-main">Upcoming Acquisitions &amp; Reading Wishlist</h2>
                <p className="text-xs text-muted mt-1">
                  Volumes queued for future reading. When ready to read, promote them directly to your shelf.
                </p>
              </div>
              <span className="text-xs font-semibold text-muted bg-surface px-3 py-1 rounded-lg border border-color self-start sm:self-auto">
                {upcomingBooks.length} titles in queue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {upcomingBooks.map((book) => {
                const isBn = hasBengali(book.title);
                return (
                  <div
                    key={book.id}
                    className="card p-4 rounded-xl flex flex-col justify-between gap-3 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[0.62rem] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {book.genre || "Queue"}
                        </span>
                        <span className="text-[0.65rem] text-muted">Wishlist</span>
                      </div>
                      <h3
                        lang={isBn ? "bn" : "en"}
                        className={`text-sm font-semibold text-main line-clamp-2 ${isBn ? "font-bengali-serif" : ""}`}
                      >
                        {book.title}
                      </h3>
                      <p
                        lang={hasBengali(book.author) ? "bn" : "en"}
                        className="text-xs text-muted mt-1"
                      >
                        by {book.author}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-color flex items-center justify-between">
                      {isAdmin ? (
                        <button
                          onClick={() => handlePromoteUpcoming(book)}
                          className="btn-ghost w-full flex items-center justify-center gap-1.5 text-xs py-1.5 text-indigo-400 hover:text-indigo-300"
                        >
                          <span>Move to Shelf</span>
                          <ArrowRight size={12} />
                        </button>
                      ) : (
                        <span className="text-[0.7rem] text-muted italic">Queued by Sojib</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active View: The Ledger (Analytics Dashboard) */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-color pb-4">
              <div>
                <h2 className="text-base font-bold text-main">The Reading Ledger</h2>
                <p className="text-xs text-muted mt-1">
                  Empirical reading pacing, categorical distributions, and literary review metrics.
                </p>
              </div>
            </div>
            <AnalyticsDashboard books={shelfBooks} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-color mt-16 py-8 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} Sojib&apos;s Reading Room. Handcrafted with Next.js &amp; Tailwind.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/api/export?format=csv"
              download
              className="hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <Download size={11} /> Export CSV
            </a>
            {isAdmin && (
              <button
                onClick={handleResetDatabase}
                className="hover:text-rose-400 transition-colors flex items-center gap-1"
                title="Reset database to seed books"
              >
                Reset Seed Data
              </button>
            )}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              {isAdmin ? "Admin Active" : "Admin Sign In"}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookDetailsModal
        isOpen={Boolean(detailsBook)}
        onClose={() => setDetailsBook(null)}
        book={detailsBook}
        onOpenEdit={(book) => {
          setBookToEdit(book);
          setIsBookModalOpen(true);
        }}
        onDelete={handleDeleteBook}
        isAdmin={isAdmin}
      />

      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
        }}
        onSave={handleSaveBook}
        bookToEdit={bookToEdit}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAuthenticate={handleAuthenticate}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </div>
  );
}
