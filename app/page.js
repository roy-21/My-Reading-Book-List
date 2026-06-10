"use client";
import { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, BarChart3, Star, BookMarked, 
  Search, Plus, Filter, RotateCcw, Quote as QuoteIcon, Library, Trash2
} from "lucide-react";
import { defaultBooks } from "@/data/defaultBooks";
import { upcomingBooks } from "@/data/upcomingBooks";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import BookDetailsModal from "@/components/BookDetailsModal";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeView, setActiveView] = useState("shelf"); // "shelf" or "analytics"
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

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

    // Load upcoming books
    const localUpcoming = localStorage.getItem("my_reading_list_upcoming");
    if (localUpcoming) {
      try {
        setUpcomingList(JSON.parse(localUpcoming));
      } catch (e) {
        setUpcomingList(upcomingBooks);
        localStorage.setItem("my_reading_list_upcoming", JSON.stringify(upcomingBooks));
      }
    } else {
      setUpcomingList(upcomingBooks);
      localStorage.setItem("my_reading_list_upcoming", JSON.stringify(upcomingBooks));
    }

    setIsLoaded(true);
  }, []);

  // Splash Screen timer
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeSplash(true);
    }, 2500);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
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
    
    // If it was added from upcoming list, remove it from there
    const matchedUpcoming = upcomingList.find(
      (ub) => ub.title.toLowerCase().trim() === savedBook.title.toLowerCase().trim()
    );
    if (matchedUpcoming) {
      const updatedUpcoming = upcomingList.filter((ub) => ub.id !== matchedUpcoming.id);
      setUpcomingList(updatedUpcoming);
      localStorage.setItem("my_reading_list_upcoming", JSON.stringify(updatedUpcoming));
    }
    
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
      
      setUpcomingList(upcomingBooks);
      localStorage.setItem("my_reading_list_upcoming", JSON.stringify(upcomingBooks));
      
      setSearchQuery("");
      setSelectedGenre("All");
      setSelectedStatus("All");
    }
  };

  const handleAddUpcomingToShelf = (upcomingBook) => {
    setBookToEdit({
      title: upcomingBook.title,
      author: upcomingBook.author,
      genre: upcomingBook.genre,
      status: "to-read",
      rating: 5,
      startYear: new Date().getFullYear(),
      startMonth: MONTHS[new Date().getMonth()],
      review: "",
      takeaway: "",
      quote: "",
      coverGradient: upcomingBook.coverGradient || "from-slate-900 to-blue-950"
    });
    setIsModalOpen(true);
  };

  const handleDeleteUpcomingBook = (id) => {
    const updated = upcomingList.filter((b) => b.id !== id);
    setUpcomingList(updated);
    localStorage.setItem("my_reading_list_upcoming", JSON.stringify(updated));
  };

  // Get unique genres dynamically from both book lists
  const availableGenres = ["All", ...new Set([
    ...books.map((b) => b.genre),
    ...upcomingList.map((b) => b.genre)
  ])];

  // Filter books based on search & selectors
  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    const matchesStatus = selectedStatus === "All" || book.status === selectedStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Filter upcoming books based on search & genre selector
  const filteredUpcoming = upcomingList.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // Loading state
  if (!isLoaded) {
    return (
      <main style={{ minHeight: '100vh', background: '#0c0e14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          <h2 style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', color: '#636d82' }}>Loading Shelf...</h2>
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
    <main style={{ position: 'relative', minHeight: '100vh', background: '#0c0e14' }}>
      
      {/* Splash Screen / Intro Landing */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 ${
            fadeSplash ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
          }`}
        >
          {/* Background Image with Dark Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[4000ms] ease-out scale-100"
            style={{ 
              backgroundImage: "url('/library_background.png')",
              filter: "brightness(0.2) contrast(1.1) saturate(0.7)"
            }}
          />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(12,14,20,0.5) 0%, rgba(12,14,20,0.85) 100%)' }} />
          
          {/* Content overlay */}
          <div className="relative z-10 text-center px-6 max-w-2xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              width: 72, height: 72, borderRadius: 20, 
              background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} className="animate-pulse">
              <BookOpen className="text-indigo-400 w-9 h-9" />
            </div>
            
            <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2 }}>
              Welcome to <span className="gradient-text">Sojib's Virtual Library</span>
              <br />
              <span style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)', fontWeight: 500, color: '#636d82', letterSpacing: '0.05em', display: 'block', marginTop: '0.5rem' }}>
                Book Collections
              </span>
            </h1>
            
            {/* Loading Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: '0.5rem' }}>
              <span className="animate-bounce" style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animationDelay: '0ms' }} />
              <span className="animate-bounce" style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animationDelay: '150ms' }} />
              <span className="animate-bounce" style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Main page wrapper */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
        
        {/* ═══════════════════════════════════════════════════ */}
        {/* SECTION 1: Navigation Bar                          */}
        {/* ═══════════════════════════════════════════════════ */}
        <nav style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', padding: '1rem 1.5rem',
          background: 'rgba(22, 26, 36, 0.6)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.04)', borderRadius: '1rem',
          marginBottom: '3rem'
        }}>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView("shelf")}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, 
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <BookOpen size={18} className="text-white" />
            </div>
            <span style={{ color: '#dce0e8', fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              My<span className="gradient-text">Reading</span>List
            </span>
          </div>

          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveView("shelf")}
              className={`btn-ghost text-xs flex items-center gap-1.5 justify-center`}
              style={{
                padding: '0.5rem 1rem',
                ...(activeView === "shelf" ? { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', color: '#818cf8' } : {})
              }}
            >
              <Library size={13} />
              Book Collection
            </button>
            <button 
              onClick={() => setActiveView("analytics")}
              className={`btn-ghost text-xs flex items-center gap-1.5 justify-center`}
              style={{
                padding: '0.5rem 1rem',
                ...(activeView === "analytics" ? { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', color: '#818cf8' } : {})
              }}
            >
              <BarChart3 size={13} />
              Analytics Dashboard
            </button>
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════ */}
        {/* SECTION 2: Dynamic Quote Spotlight                 */}
        {/* ═══════════════════════════════════════════════════ */}
        {spotlightBook && activeView === "shelf" && (
          <section style={{ 
            maxWidth: 720, margin: '0 auto 4rem', padding: '2rem 2.5rem',
            background: 'linear-gradient(145deg, rgba(22, 26, 36, 0.8), rgba(18, 21, 30, 0.9))',
            border: '1px solid rgba(255,255,255,0.04)', borderRadius: '1rem',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Decorative accent line */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
            
            <div style={{ position: 'absolute', top: 16, left: 16, opacity: 0.06 }}>
              <QuoteIcon size={80} />
            </div>
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#b8bfcc', fontWeight: 500, fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.7 }}>
                "{spotlightBook.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.75rem' }}>
                <span style={{ color: '#818cf8', fontWeight: 600 }}>{spotlightBook.title}</span>
                <span style={{ color: '#49516a' }}>—</span>
                <span style={{ color: '#636d82' }}>{spotlightBook.author}</span>
              </div>
            </div>
          </section>
        )}

        {/* Main Content Area */}
        {activeView === "analytics" ? (
          /* ═══════════════════════════════════════════════════ */
          /* Analytics Dashboard view                           */
          /* ═══════════════════════════════════════════════════ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0f1f5' }}>Visual Insights</h2>
                <p style={{ fontSize: '0.75rem', color: '#636d82', marginTop: 2 }}>Aggregate reading analytics graphs</p>
              </div>
              <button 
                onClick={() => setActiveView("shelf")}
                className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
              >
                ← Back to Books
              </button>
            </div>
            <AnalyticsDashboard books={books} />
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════ */
          /* Book Shelf view                                     */
          /* ═══════════════════════════════════════════════════ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            
            {/* ── SECTION 3: Quick Stats ── */}
            <section style={{ marginBottom: '3rem' }}>
              <div className="grid grid-cols-3 gap-4 md:gap-5">
                <div className="surface" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#dce0e8' }}>{books.length}</div>
                  <div style={{ fontSize: '0.6rem', color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 600 }}>Shelf Items</div>
                </div>
                <div className="surface" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#818cf8' }}>{totalRead}</div>
                  <div style={{ fontSize: '0.6rem', color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 600 }}>Completed</div>
                </div>
                <div className="surface" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fbbf24' }}>{avgRating}★</div>
                  <div style={{ fontSize: '0.6rem', color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 600 }}>Avg Rating</div>
                </div>
              </div>
            </section>

            {/* ── Visual Divider ── */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)', marginBottom: '2.5rem' }} />

            {/* ── SECTION 4: Filter & Control Bar ── */}
            <section style={{ 
              marginBottom: '3rem', padding: '1.25rem 1.5rem',
              background: 'rgba(22, 26, 36, 0.5)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.04)', borderRadius: '1rem',
              position: 'sticky', top: 0, zIndex: 20
            }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left Side: Search & Filter dropdowns */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 w-full">
                  {/* Search Box */}
                  <div className="relative flex-1 min-w-0 sm:max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#636d82' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, author..."
                      className="input-dark w-full"
                      style={{ paddingLeft: '2.25rem', fontSize: '0.8rem', padding: '0.55rem 0.85rem 0.55rem 2.25rem' }}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Genre Select */}
                    <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                      <Filter size={12} style={{ color: '#636d82', flexShrink: 0 }} />
                      <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="input-dark cursor-pointer"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {availableGenres.map((g) => (
                          <option key={g} value={g} style={{ background: '#10131a' }}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Select */}
                    <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                      <BookMarked size={12} style={{ color: '#636d82', flexShrink: 0 }} />
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="input-dark cursor-pointer"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <option value="All" style={{ background: '#10131a' }}>All Status</option>
                        <option value="completed" style={{ background: '#10131a' }}>Completed</option>
                        <option value="reading" style={{ background: '#10131a' }}>Reading</option>
                        <option value="to-read" style={{ background: '#10131a' }}>To Read</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Side: Add Button & Reset */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={handleResetDefaults}
                    style={{ 
                      padding: 8, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
                      background: 'transparent', color: '#636d82', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Reset list to sample defaults"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#dce0e8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#636d82'; }}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setBookToEdit(null);
                      setIsModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-1.5 justify-center"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} />
                    Add Book
                  </button>
                </div>

              </div>
            </section>

            {/* ── SECTION 5: Books Grid ── */}
            <section>
              {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
                <div className="surface" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: 56, height: 56, borderRadius: 16, 
                    background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636d82'
                  }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#b8bfcc' }}>No books found</h3>
                    <p style={{ fontSize: '0.75rem', color: '#636d82', marginTop: 4 }}>
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
                      className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* ── Visual Divider ── */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)', marginTop: '4rem', marginBottom: '3rem' }} />

            {/* ── SECTION 5.5: Upcoming Books Grid ── */}
            <section style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0f1f5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} className="text-indigo-400" />
                    Upcoming New Book Collection
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#636d82', marginTop: 2 }}>Curated queue of books to read next</p>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#636d82', background: 'rgba(99, 102, 241, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(99, 102, 241, 0.1)', fontWeight: 500 }}>
                  <span style={{ fontWeight: 700, color: '#818cf8' }}>{filteredUpcoming.length}</span> {filteredUpcoming.length === 1 ? 'book' : 'books'} queued
                </div>
              </div>

              {filteredUpcoming.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredUpcoming.map((book) => (
                    <div
                      key={book.id}
                      className="card group relative"
                      style={{
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        background: 'rgba(22, 26, 36, 0.4)',
                        border: '1px dashed rgba(99, 102, 241, 0.2)',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Top row: Genre and Status */}
                      <div className="flex items-center justify-between">
                        <span style={{
                          fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700,
                          letterSpacing: '0.08em', color: '#818cf8',
                          background: 'rgba(99, 102, 241, 0.08)', padding: '0.2rem 0.5rem',
                          borderRadius: 6, border: '1px solid rgba(99, 102, 241, 0.1)'
                        }}>
                          {book.genre}
                        </span>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 600,
                          color: '#b8bfcc', background: 'rgba(255, 255, 255, 0.05)',
                          padding: '0.2rem 0.5rem', borderRadius: 6
                        }}>
                          Upcoming
                        </span>
                      </div>

                      {/* Main Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '0.85rem', fontWeight: 600, color: '#dce0e8', 
                          lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {book.title}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: '#636d82' }}>by {book.author}</p>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-base-800 mt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleAddUpcomingToShelf(book)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Plus size={12} /> Add to Shelf
                        </button>
                        <button
                          onClick={() => handleDeleteUpcomingBook(book.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                          title="Remove from Upcoming"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="surface" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#636d82' }}>No upcoming books found.</p>
                </div>
              )}
            </section>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* SECTION 6: Footer                                  */}
        {/* ═══════════════════════════════════════════════════ */}
        <footer style={{ 
          marginTop: '5rem', paddingTop: '1.5rem', paddingBottom: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.65rem', color: '#49516a', gap: '1rem'
        }}>
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
