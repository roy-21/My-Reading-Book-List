"use client";

import { useMemo } from "react";
import { Star, Bookmark } from "lucide-react";

const hasBengali = (text) => /[\u0980-\u09FF]/.test(text || "");

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  const t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  return ((t ^ (t >>> 7)) >>> 0) / 4294967296;
}

const SPINE_GRADIENTS = {
  "from-neutral-800 to-neutral-900": "linear-gradient(180deg, #38383f 0%, #202024 100%)", // Slate
  "from-slate-900 to-blue-950":      "linear-gradient(180deg, #1e3a6d 0%, #0d1b33 100%)", // Navy
  "from-slate-900 to-emerald-950":   "linear-gradient(180deg, #1b4d3e 0%, #0c261e 100%)", // Forest
  "from-slate-900 to-rose-950":      "linear-gradient(180deg, #6e2436 0%, #361019 100%)", // Wine
  "from-neutral-900 to-neutral-950": "linear-gradient(180deg, #2c2c30 0%, #17171a 100%)", // Charcoal
  "from-slate-900 to-purple-950":    "linear-gradient(180deg, #4d2b6e 0%, #241236 100%)", // Aubergine
};

export default function SpineShelf({ books = [], onSelectBook }) {
  // Organize books into manageable shelf chunks
  const shelves = useMemo(() => {
    const rows = [];
    const chunkSize = 10;
    for (let i = 0; i < books.length; i += chunkSize) {
      rows.push(books.slice(i, i + chunkSize));
    }
    return rows;
  }, [books]);

  return (
    <div className="flex flex-col gap-8 sm:gap-12 w-full py-2 select-none animate-fade-in overflow-hidden">
      {shelves.map((rowBooks, shelfIndex) => (
        <div key={shelfIndex} className="relative flex flex-col w-full">
          
          {/* Scrollable Books Shelf Area */}
          <div className="w-full overflow-x-auto pb-1 scrollbar-thin" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="inline-flex items-end justify-start gap-1 sm:gap-2 px-3 sm:px-6 min-w-full">
              {rowBooks.map((book) => {
                const seed = hashString(book.slug || book.id || book.title);
                const rand1 = seededRandom(seed);
                const rand2 = seededRandom(seed + 1);

                // Fluid heights and widths using clamp and deterministic random ratios
                const heightScale = 0.85 + rand1 * 0.3; // 85% to 115%
                const widthScale = 0.88 + rand2 * 0.28;

                const isReading = book.status === "reading";
                const isBn = hasBengali(book.title);
                const spineBackground = SPINE_GRADIENTS[book.coverGradient] || "linear-gradient(180deg, #2c2c32 0%, #141416 100%)";

                return (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectBook(book);
                      }
                    }}
                    aria-label={`${book.title} by ${book.author}`}
                    className="group relative cursor-pointer flex-shrink-0 transition-transform duration-200 ease-out hover:-translate-y-4 hover:z-30 focus:outline-none focus:-translate-y-4 focus:z-30 active:scale-95"
                    style={{
                      height: `calc(clamp(170px, 24vw, 250px) * ${heightScale})`,
                      width: `calc(clamp(32px, 4.6vw, 46px) * ${widthScale})`,
                    }}
                  >
                    {/* Bookmark Ribbon for currently reading */}
                    {isReading && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                        <div className="w-2.5 h-6 bg-rose-500 rounded-b shadow-md flex items-end justify-center">
                          <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900" />
                        </div>
                      </div>
                    )}

                    {/* Physical Book Spine */}
                    <div
                      className="w-full h-full rounded-t-sm flex flex-col justify-between py-2 sm:py-3 px-0.5 sm:px-1 border-x border-t border-white/10 shadow-md relative overflow-hidden transition-all duration-200 group-hover:shadow-2xl group-hover:border-amber-400/50"
                      style={{
                        background: spineBackground,
                        boxShadow: "inset 2px 0 4px rgba(255,255,255,0.12), inset -2px 0 4px rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* Top Brass Foil Accent */}
                      <div className="w-full h-0.5 bg-amber-400/40 mb-1" />

                      {/* Spine Title (Vertical writing mode) */}
                      <div className="flex-1 flex items-center justify-center overflow-hidden py-1">
                        <span
                          lang={isBn ? "bn" : "en"}
                          className={`text-white/90 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-amber-200 transition-colors ${
                            isBn ? "font-bengali-serif" : ""
                          }`}
                          style={{
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                            transform: "rotate(180deg)",
                            fontSize: isBn ? "clamp(0.68rem, 1.6vw, 0.78rem)" : "clamp(0.62rem, 1.4vw, 0.72rem)",
                            letterSpacing: isBn ? "0.01em" : "0.05em",
                          }}
                        >
                          {book.title}
                        </span>
                      </div>

                      {/* Bottom Details: Rating Pips & Brass Bands */}
                      <div className="flex flex-col items-center gap-1 mt-1">
                        {book.status === "completed" && book.rating && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: Math.min(book.rating, 5) }).map((_, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-amber-400/80 shadow-sm" />
                            ))}
                          </div>
                        )}
                        <div className="w-full h-0.5 bg-amber-400/40" />
                      </div>
                    </div>

                    {/* Floating Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 pointer-events-none z-40 bg-slate-900/95 text-white text-[0.7rem] px-2.5 py-1 rounded-md border border-white/20 whitespace-nowrap shadow-xl">
                      <span className="font-semibold">{book.title}</span>
                      <span className="text-white/60 ml-1">· {book.author}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shelf Wooden Plank (inside scrollable row so it extends fully with books) */}
            <div
              className="w-full min-w-full h-4 sm:h-5 rounded-sm relative z-10 shadow-lg mt-[-1px]"
              style={{
                background: "linear-gradient(180deg, #4a3324 0%, #342217 60%, #1e130c 100%)",
                borderTop: "2px solid #6b4c37",
                boxShadow: "0 6px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)",
              }}
            >
              <div className="w-full h-1 bg-[#26170d]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
