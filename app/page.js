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
        const parsed = JSON.parse(localData);
        const existingIds = new Set(parsed.map((b) => b.id));
        const existingTitles = new Set(parsed.map((b) => b.title.toLowerCase().trim()));
        
        const newDefaults = defaultBooks.filter(
          (db) => !existingIds.has(db.id) && !existingTitles.has(db.title.toLowerCase().trim())
        );

        if (newDefaults.length > 0) {
          const merged = [...newDefaults, ...parsed];
          setBooks(merged);
          localStorage.setItem("my_reading_list_books", JSON.stringify(merged));
        } else {
          setBooks(parsed);
        }
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
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-semibold tracking-wide text-gray-400">Loading Shelf...</h2>
        </div>
      </main>
    );
  }

  // Quick stats calculation
  const totalRead = books.filter(b => b.status === "completed").length;
  const avgRating = books.length > 0 
    ? (books.reduce((acc, b) => acc + b.rating, 0) / books.length).toFixed(1) 
    : "0.0";

  return (
    <main className="relative min-h-screen bg-black">
      
      {/* Main page wrapper */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView("shelf")}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-gray-200 font-semibold text-base tracking-tight">
              My<span className="gradient-text">Reading</span>List
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView("shelf")}
              className={`btn-ghost text-xs py-2 px-4 flex items-center gap-1.5 ${
                activeView === "shelf" ? "bg-base-800 text-white border-base-700" : ""
              }`}
            >
              <Library size={13} />
              Book Collection
            </button>
            <button 
              onClick={() => setActiveView("analytics")}
              className={`btn-ghost text-xs py-2 px-4 flex items-center gap-1.5 ${
                activeView === "analytics" ? "bg-base-800 text-white border-base-700" : ""
              }`}
            >
              <BarChart3 size={13} />
              Analytics Dashboard
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 surface px-4 py-1.5 rounded-full text-xs text-gray-400 mb-8">
            <Sparkles size={12} className="text-blue-400" />
            <span>Interactive portfolio of books, reflections, and insights</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Reading Shapes
            <br />
            <span className="gradient-text">Perspective</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            A curated log of my educational readings, reviews, and insights. Filter through categories, 
            explore rating trends, or check stats on genres and timeline logs below.
          </p>
        </section>

        {/* Dynamic Quote Spotlight */}
        {spotlightBook && activeView === "shelf" && (
          <section className="surface p-6 md:p-8 mb-16 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-4 left-4 text-neutral-800/20">
              <QuoteIcon size={80} />
            </div>
            <div className="relative z-10 text-center space-y-4">
              <p className="text-gray-300 font-medium italic text-base leading-relaxed">
                "{spotlightBook.quote}"
              </p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-blue-400 font-semibold">{spotlightBook.title}</span>
                <span className="text-gray-600">—</span>
                <span className="text-gray-500">{spotlightBook.author}</span>
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
                <h2 className="text-xl font-bold text-gray-100">Visual Insights</h2>
                <p className="text-xs text-gray-500 mt-0.5">Aggregate reading analytics graphs</p>
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
          <div className="space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="surface p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-200">{books.length}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Shelf Items</div>
              </div>
              <div className="surface p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-blue-400">{totalRead}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Completed</div>
              </div>
              <div className="surface p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-amber-400">{avgRating}★</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Avg Rating</div>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-t border-base-800 bg-black/90 backdrop-blur-md z-20 sticky top-0">
              
              {/* Left Side: Search & Filter dropdowns */}
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, author..."
                    className="input-dark pl-9 text-xs py-2"
                  />
                </div>

                {/* Genre Select */}
                <div className="flex items-center gap-1.5">
                  <Filter size={12} className="text-gray-500" />
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="input-dark py-2 px-3 text-xs w-36 cursor-pointer"
                  >
                    {availableGenres.map((g) => (
                      <option key={g} value={g} className="bg-black">{g}</option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div className="flex items-center gap-1.5">
                  <BookMarked size={12} className="text-gray-500" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="input-dark py-2 px-3 text-xs w-36 cursor-pointer"
                  >
                    <option value="All" className="bg-black">All Status</option>
                    <option value="completed" className="bg-black">Completed</option>
                    <option value="reading" className="bg-black">Reading</option>
                    <option value="to-read" className="bg-black">To Read</option>
                  </select>
                </div>
              </div>

              {/* Right Side: Add Button & Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaults}
                  className="p-2 rounded-full border border-base-700 hover:border-gray-500 hover:bg-base-800 text-gray-400 hover:text-white transition-colors"
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
              <div className="surface p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-gray-500 mx-auto">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-300">No books found</h3>
                  <p className="text-xs text-gray-500 mt-1">
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
        <footer className="mt-24 border-t border-base-800 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-600 gap-4">
          <div>
            Built with Next.js App Router · Tailwind CSS v4 · Minimal Dark Theme
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
