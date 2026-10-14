"use client";

import { useState, useEffect, useMemo } from "react";

import dynamic from "next/dynamic";
import {
  BookOpen, Search, Filter, Plus, BarChart3,
  Sparkles, Shield, Bookmark, CheckCircle2,
  RotateCcw, ArrowRight, Library, LayoutGrid,
  LibraryBig, Download, ExternalLink, Box
} from "lucide-react";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import BookDetailsModal from "@/components/BookDetailsModal";
import AdminModal from "@/components/AdminModal";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import SpineShelf from "@/components/SpineShelf";
import CommandPalette from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeProvider";

const ReadingRoom3D = dynamic(() => import("@/components/ReadingRoom3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[540px] rounded-2xl border border-color bg-slate-950 flex flex-col items-center justify-center gap-3 text-muted shadow-2xl">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-medium">Entering 3D Library Room...</p>
    </div>
  ),
});

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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global open-command-palette event listener
  useEffect(() => {
    const handleOpen = () => setIsCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);


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
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Library size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-bold text-main tracking-tight block leading-none truncate">
                Sojib&apos;s Reading Room
              </span>
              <span className="text-[0.62rem] sm:text-[0.68rem] text-muted font-medium mt-1 hidden xs:block sm:block truncate">
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
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-6 sm:gap-8">
        
        {/* Mobile Station Navigation (Directly accessible at top of content on mobile) */}
        <div className="flex md:hidden items-center justify-between bg-surface p-1 rounded-xl border border-color shadow-sm gap-1">
          <button
            onClick={() => setActiveTab("shelf")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "shelf"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted hover:text-main"
            }`}
          >
            <BookOpen size={13} />
            <span>Stacks ({shelfBooks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "upcoming"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted hover:text-main"
            }`}
          >
            <Bookmark size={13} />
            <span>Queue ({upcomingBooks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted hover:text-main"
            }`}
          >
            <BarChart3 size={13} />
            <span>Ledger</span>
          </button>
        </div>

        {/* Hero Section: Quote Spotlight & Literary Atmosphere */}
        {featuredQuote && activeTab === "shelf" && (
          <section
            aria-label="Spotlight Quote"
            className="surface relative overflow-hidden rounded-2xl p-4 sm:p-7 border border-color"
          >
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  <Sparkles size={11} />
                  Spotlight Quote
                </span>
                <span className="text-xs text-muted truncate">from {featuredQuote.title}</span>
              </div>
              <blockquote
                lang={hasBengali(featuredQuote.quote) ? "bn" : "en"}
                className={`text-base sm:text-xl font-medium text-main italic leading-relaxed max-w-3xl ${
                  hasBengali(featuredQuote.quote) ? "font-bengali-serif" : ""
                }`}
              >
                &ldquo;{featuredQuote.quote}&rdquo;
              </blockquote>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
                <p className="text-xs text-muted">
                  — {featuredQuote.author}
                </p>
                <button
                  onClick={() => setViewMode("3d")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <Box size={13} />
                  <span>Enter 3D Reading Room</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Active View: The Stacks (Shelf) */}
        {activeTab === "shelf" && (
          <div className="flex flex-col gap-5 sm:gap-6">
            
            {/* Search, Filters, and Shelf/Grid/3D View Toggle */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Search Box with Ctrl+K trigger */}
              <div className="relative flex-1 max-w-full lg:max-w-md flex items-center">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors, or insights..."
                  style={{ paddingLeft: '2.5rem', paddingRight: '5rem' }}
                  className="input-dark w-full py-2.5 text-xs rounded-xl"
                  aria-label="Search through reading catalogue"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-muted hover:text-main px-1"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsCommandPaletteOpen(true)}
                    title="Open Command Palette (Ctrl+K)"
                    className="hidden sm:inline-flex items-center gap-0.5 text-[0.62rem] font-medium text-muted bg-surface border border-color px-1.5 py-0.5 rounded-md hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <kbd>Ctrl</kbd>+<kbd>K</kbd>
                  </button>
                </div>
              </div>

              {/* View Switcher & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                
                {/* Shelf vs Grid vs 3D Room Toggle */}
                <div className="flex items-center justify-between sm:justify-start bg-surface border border-color p-0.5 rounded-xl">
                  <button
                    onClick={() => setViewMode("shelf")}
                    aria-label="Bookshelf View"
                    title="Bookshelf Spine View"
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
                      viewMode === "shelf" ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-muted hover:text-main"
                    }`}
                  >
                    <LibraryBig size={14} />
                    <span className="text-[0.7rem]">Shelf</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid View"
                    title="Card Grid View"
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
                      viewMode === "grid" ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-muted hover:text-main"
                    }`}
                  >
                    <LayoutGrid size={14} />
                    <span className="text-[0.7rem]">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode("3d")}
                    aria-label="3D Reading Room"
                    title="Enter 3D Library Room"
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
                      viewMode === "3d" ? "bg-indigo-600 text-white shadow-sm font-bold" : "text-muted hover:text-main"
                    }`}
                  >
                    <Box size={14} />
                    <span className="text-[0.7rem]">3D Room</span>
                  </button>
                </div>

                {/* Filter Controls: 2 clean columns on mobile */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-surface border border-color px-2.5 py-1.5 rounded-xl text-xs text-muted min-w-0">
                    <Filter size={12} className="text-indigo-400 flex-shrink-0" />
                    <span className="font-semibold uppercase tracking-wider text-[0.62rem] flex-shrink-0">Status:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-transparent text-main focus:outline-none cursor-pointer text-xs w-full truncate"
                    >
                      <option value="All" style={{ background: 'var(--bg-input-option)' }}>All</option>
                      <option value="completed" style={{ background: 'var(--bg-input-option)' }}>Completed</option>
                      <option value="reading" style={{ background: 'var(--bg-input-option)' }}>Reading</option>
                      <option value="to-read" style={{ background: 'var(--bg-input-option)' }}>To Read</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-surface border border-color px-2.5 py-1.5 rounded-xl text-xs text-muted min-w-0">
                    <span className="font-semibold uppercase tracking-wider text-[0.62rem] flex-shrink-0">Genre:</span>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="bg-transparent text-main focus:outline-none cursor-pointer text-xs w-full truncate"
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

            {/* Books Presentation: 3D Room, Spine Shelf or Grid View */}
            {filteredShelfBooks.length > 0 ? (
              viewMode === "3d" ? (
                <ReadingRoom3D
                  books={filteredShelfBooks}
                  onSelectBook={(b) => setDetailsBook(b)}
                  onClose={() => setViewMode("shelf")}
                />
              ) : viewMode === "shelf" ? (
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

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        books={shelfBooks}
        onSelectBook={(book) => setDetailsBook(book)}
      />
    </div>
  );
}

