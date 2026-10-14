"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, BookOpen, Bookmark, Star, ArrowRight, CornerDownLeft, X, Sparkles } from "lucide-react";

const hasBengali = (text) => /[\u0980-\u09FF]/.test(text || "");

export default function CommandPalette({ isOpen, onClose, books = [], onSelectBook }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      }
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter books matching search
  const results = useMemo(() => {
    if (!query.trim()) {
      // Suggest reading and top completed books
      return books.filter((b) => b.status === "reading" || b.status === "completed").slice(0, 8);
    }
    const q = query.toLowerCase();
    return books
      .filter((b) => {
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q) ||
          (b.takeaway && b.takeaway.toLowerCase().includes(q))
        );
      })
      .slice(0, 10);
  }, [books, query]);

  // Handle keyboard navigation inside results
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onSelectBook(results[selectedIndex]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick Search Command Palette"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-20 px-3 sm:px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-card border border-color rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "80vh" }}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-color bg-surface/80">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search books, authors, genres, or quotes..."
            className="w-full bg-transparent text-main placeholder:text-muted focus:outline-none text-sm"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-md text-muted hover:text-main text-xs border border-color px-1.5 py-0.5"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          <div className="px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
            <span>{query.trim() ? "Search Results" : "Featured & Currently Reading"}</span>
            <span className="text-[0.6rem] font-normal normal-case">↑↓ to navigate · Enter to select</span>
          </div>

          {results.length > 0 ? (
            results.map((book, idx) => {
              const isSelected = idx === selectedIndex;
              const isBn = hasBengali(book.title);
              return (
                <div
                  key={book.id}
                  onClick={() => {
                    onSelectBook(book);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-surface text-main"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-400"
                      }`}
                    >
                      {book.status === "reading" ? <Bookmark size={15} /> : <BookOpen size={15} />}
                    </div>
                    <div className="overflow-hidden">
                      <div
                        lang={isBn ? "bn" : "en"}
                        className={`text-xs font-semibold truncate ${
                          isBn ? "font-bengali-serif" : ""
                        }`}
                      >
                        {book.title}
                      </div>
                      <div
                        className={`text-[0.7rem] truncate ${
                          isSelected ? "text-white/80" : "text-muted"
                        }`}
                      >
                        {book.author} · <span className="capitalize">{book.genre}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {book.rating && (
                      <span
                        className={`text-[0.68rem] flex items-center gap-0.5 font-bold ${
                          isSelected ? "text-amber-200" : "text-amber-400"
                        }`}
                      >
                        <Star size={11} className="fill-current" />
                        {book.rating}
                      </span>
                    )}
                    {isSelected && <CornerDownLeft size={13} className="text-white/70" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-muted">
              No matching books found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-color bg-surface/50 flex items-center justify-between text-[0.68rem] text-muted">
          <span>Quick Spotlight Palette</span>
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-input border border-color">Ctrl+K</kbd> anywhere</span>
          </div>
        </div>
      </div>
    </div>
  );
}
