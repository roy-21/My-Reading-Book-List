"use client";
import { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, BarChart3, Star, BookMarked, 
  Search, Plus, Filter, RotateCcw, Quote as QuoteIcon, Library
} from "lucide-react";
import { defaultBooks } from "@/data/defaultBooks";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import BookDetailsModal from "@/components/BookDetailsModal";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeView, setActiveView] = useState("shelf"); // "shelf" or "analytics"

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);

  // Quote Spotlight State
  const [spotlightBook, setSpotlightBook] = useState(null);

  // 1. Initial State Load from LocalStorage
  useEffect(() => {
    const localData = localStorage.getItem("my_reading_list_books");
    if (localData) {
      try {
        setBooks(JSON.parse(localData));
      } catch (e) {
        setBooks(defaultBooks);
        localStorage.setItem("my_reading_list_books", JSON.stringify(defaultBooks));
      }
    } else {
      setBooks(defaultBooks);
      localStorage.setItem("my_reading_list_books", JSON.stringify(defaultBooks));
    }
    setIsLoaded(true);
  }, []);

  // 2. Select Spotlight Quote dynamically when books load/change
  useEffect(() => {
    if (books.length > 0) {
      const booksWithQuotes = books.filter(b => b.quote && b.quote.trim().length > 0);
      if (booksWithQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * booksWithQuotes.length);
        setSpotlightBook(booksWithQuotes[randomIndex]);
      } else {
        setSpotlightBook(null);
      }
    } else {
      setSpotlightBook(null);
    }
  }, [books]);

  // 3. Actions
  const handleSaveBook = (savedBook) => {
    let updatedBooks;
    if (bookToEdit) {
      // Edit mode
      updatedBooks = books.map((b) => (b.id === savedBook.id ? savedBook : b));
    } else {
      // Add mode
      updatedBooks = [savedBook, ...books];
    }
    setBooks(updatedBooks);
    localStorage.setItem("my_reading_list_books", JSON.stringify(updatedBooks));
    setBookToEdit(null);
  };

  const handleDeleteBook = (id) => {
    const updatedBooks = books.filter((b) => b.id !== id);
    setBooks(updatedBooks);
    localStorage.setItem("my_reading_list_books", JSON.stringify(updatedBooks));
  };

  const handleResetDefaults = () => {
    if (confirm("This will reset all your changes and restore the default reading list. Proceed?")) {
      setBooks(defaultBooks);
      localStorage.setItem("my_reading_list_books", JSON.stringify(defaultBooks));
      setSearchQuery("");
      setSelectedGenre("All");
      setSelectedStatus("All");
    }
  };

  // Get unique genres dynamically from book list
  const availableGenres = ["All", ...new Set(books.map((b) => b.genre))];

  // Filter books based on search & selectors
  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    const matchesStatus = selectedStatus === "All" || book.status === selectedStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Loading state
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-space-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-400">Loading Shelf...</h2>
        </div>
      </main>
    );
  }

  // Quick stats calculation
  const totalRead = books.filter(b => b.status === "completed").length;
  const avgRating = books.length > 0 
    ? (books.reduce((acc, b) => acc + b.rating, 0) / books.length).toFixed(1) 
    : "0.0";
  const currentReading = books.filter(b => b.status === "reading").length;

  return (
    <main className="relative min-h-screen overflow-hidden">
      
      {/* Ambient decorative glass orbs */}
      <div className="orb orb-violet w-[500px] h-[500px] -top-32 -left-32 opacity-50" />
      <div className="orb orb-cyan w-[400px] h-[400px] top-1/4 -right-20 opacity-30" />
      <div className="orb orb-indigo w-[350px] h-[350px] bottom-10 left-1/3 opacity-25" />

      {/* Main page wrapper */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-16 animate-fade-in">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView("shelf")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-slate-200 font-semibold text-base tracking-tight">
              My<span className="gradient-text">Reading</span>List
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView("shelf")}
              className={`btn-ghost text-xs py-2 px-4 flex items-center gap-1.5 ${
                activeView === "shelf" ? "bg-white/10 text-white border-white/25" : ""
              }`}
            >
              <Library size={13} />
              Book Collection
            </button>
            <button 
              onClick={() => setActiveView("analytics")}
              className={`btn-ghost text-xs py-2 px-4 flex items-center gap-1.5 ${
                activeView === "analytics" ? "bg-white/10 text-white border-white/25" : ""
              }`}
            >
              <BarChart3 size={13} />
              Analytics Dashboard
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-slate-400 mb-8 animate-slide-up">
            <Sparkles size={12} className="text-violet-400" />
            <span>Interactive portfolio of books, reflections, and insights</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight animate-slide-up delay-100">
            Reading Shapes
            <br />
            <span className="shimmer-text">Perspective</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed animate-slide-up delay-200">
            A curated log of my educational readings, reviews, and insights. Filter through categories, 
            explore rating trends, or check stats on genres and timeline logs below.
          </p>
        </section>

        {/* Dynamic Quote Spotlight */}
        {spotlightBook && activeView === "shelf" && (
          <section className="glass p-6 md:p-8 mb-16 max-w-3xl mx-auto relative overflow-hidden animate-slide-up delay-300">
            <div className="absolute top-4 left-4 text-violet-500/10">
              <QuoteIcon size={80} />
            </div>
            <div className="relative z-10 text-center space-y-4">
              <p className="text-slate-300 font-medium italic text-base leading-relaxed">
                "{spotlightBook.quote}"
              </p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-violet-400 font-semibold">{spotlightBook.title}</span>
                <span className="text-slate-600">—</span>
                <span className="text-slate-500">{spotlightBook.author}</span>
              </div>
            </div>
          </section>
        )}

        {/* Main Content Area */}
        {activeView === "analytics" ? (
          /* Render Analytics Dashboard view */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Visual Insights</h2>
                <p className="text-xs text-slate-500 mt-0.5">Aggregate reading analytics graphs</p>
              </div>
              <button 
                onClick={() => setActiveView("shelf")}
                className="btn-ghost py-1.5 px-4 text-xs"
              >
                ← Back to Books
              </button>
            </div>
            <AnalyticsDashboard books={books} />
          </div>
        ) : (
          /* Render Book Shelf view */
          <div className="space-y-8 animate-fade-in">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-slate-200">{books.length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Shelf Items</div>
              </div>
              <div className="glass p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-violet-400">{totalRead}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Completed</div>
              </div>
              <div className="glass p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-cyan-400">{avgRating}★</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Avg Rating</div>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-t border-white/5 bg-space-950/20 backdrop-blur-sm z-20 sticky top-0">
              
              {/* Left Side: Search & Filter dropdowns */}
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, author..."
                    className="input-glass pl-9 text-xs py-2"
                  />
                </div>

                {/* Genre Select */}
                <div className="flex items-center gap-1.5">
                  <Filter size={12} className="text-slate-500" />
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="input-glass py-2 px-3 text-xs w-36 cursor-pointer"
                  >
                    {availableGenres.map((g) => (
                      <option key={g} value={g} className="bg-space-900">{g}</option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div className="flex items-center gap-1.5">
                  <BookMarked size={12} className="text-slate-500" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="input-glass py-2 px-3 text-xs w-36 cursor-pointer"
                  >
                    <option value="All" className="bg-space-900">All Status</option>
                    <option value="completed" className="bg-space-900">Completed</option>
                    <option value="reading" className="bg-space-900">Reading</option>
                    <option value="to-read" className="bg-space-900">To Read</option>
                  </select>
                </div>
              </div>

              {/* Right Side: Add Button & Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaults}
                  className="btn-ghost p-2 rounded-full border border-white/10 hover:bg-white/5"
                  title="Reset list to sample defaults"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => {
                    setBookToEdit(null);
                    setIsModalOpen(true);
                  }}
                  className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Book
                </button>
              </div>

            </div>

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredBooks.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    delay={index}
                    onOpenDetails={(b) => {
                      setSelectedBook(b);
                      setIsDetailsOpen(true);
                    }}
                    onOpenEdit={(b) => {
                      setBookToEdit(b);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDeleteBook}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search Results / Collection state */
              <div className="glass p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 mx-auto">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">No books found</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search queries, clearing your filters, or adding a new book to the shelf.
                  </p>
                </div>
                {(searchQuery || selectedGenre !== "All" || selectedStatus !== "All") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGenre("All");
                      setSelectedStatus("All");
                    }}
                    className="btn-ghost py-1.5 px-4 text-xs"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <footer className="mt-24 border-t border-white/5 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-600 gap-4">
          <div>
            Built with Next.js App Router · Tailwind CSS v4 · Glassmorphic Theme
          </div>
          <div>
            &copy; {new Date().getFullYear()} My Reading List Portfolio. All rights reserved.
          </div>
        </footer>

      </div>

      {/* Add / Edit Form Modal */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBookToEdit(null);
        }}
        onSave={handleSaveBook}
        bookToEdit={bookToEdit}
      />

      {/* Details Showcase Modal */}
      <BookDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        onOpenEdit={(b) => {
          setBookToEdit(b);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteBook}
      />

    </main>
  );
}
