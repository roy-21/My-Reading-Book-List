"use client";
import { Star, Edit3, Trash2 } from "lucide-react";

const STATUS_MAP = {
  reading:   { label: "Reading",   cls: "badge badge-reading" },
  completed: { label: "Completed", cls: "badge badge-completed" },
  "to-read": { label: "To Read",   cls: "badge badge-to-read" },
  upcoming:  { label: "Upcoming",  cls: "badge badge-to-read" },
};

const hasBengali = (text) => /[\u0980-\u09FF]/.test(text || "");

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          className={i < rating ? "star-filled fill-amber-400 text-amber-400" : "star-empty fill-base-700 text-base-700 opacity-30"}
        />
      ))}
    </div>
  );
}

export default function BookCard({ book, onOpenDetails, onOpenEdit, onDelete, isAdmin }) {
  const status = STATUS_MAP[book.status] || STATUS_MAP["to-read"];
  const isBengaliTitle = hasBengali(book.title);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDetails(book);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`View details for ${book.title} by ${book.author}`}
      onKeyDown={handleKeyDown}
      onClick={() => onOpenDetails(book)}
      className="card group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Top row: Genre and Date */}
      <div className="flex items-center justify-between">
        <span style={{
          fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 700,
          letterSpacing: '0.08em', color: '#818cf8',
          background: 'rgba(99, 102, 241, 0.08)', padding: '0.2rem 0.5rem',
          borderRadius: 6, border: '1px solid rgba(99, 102, 241, 0.1)'
        }}>
          {book.genre}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {book.startMonth && book.startYear ? `${book.startMonth} ${book.startYear}` : ""}
        </span>
      </div>

      {/* Main Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <h3
          lang={isBengaliTitle ? "bn" : "en"}
          className={`group-hover:text-indigo-400 transition-colors ${isBengaliTitle ? "font-bengali-serif" : ""}`}
          style={{ 
            fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', 
            lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}
        >
          {book.title}
        </h3>
        <p
          lang={hasBengali(book.author) ? "bn" : "en"}
          style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
        >
          by {book.author}
        </p>
        
        {/* Subtle key takeaway preview if exists */}
        {book.takeaway && (
          <p
            lang={hasBengali(book.takeaway) ? "bn" : "en"}
            style={{ 
              fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic',
              borderLeft: '2px solid rgba(99,102,241,0.2)', paddingLeft: '0.5rem',
              lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}
          >
            &ldquo;{book.takeaway}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.25rem'
      }}>
        <span className={status.cls}>{status.label}</span>
        {book.rating ? (
          <StarRating rating={book.rating} />
        ) : (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Queue
          </span>
        )}
      </div>

      {/* Actions in Top Right - Admin Only (visible on group hover AND group focus-within) */}
      {isAdmin && (
        <div
          className="absolute top-3.5 right-3.5 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onOpenEdit(book)}
            aria-label={`Edit ${book.title}`}
            style={{
              padding: 5, borderRadius: 6, 
              background: 'var(--bg-input)', border: '1px solid var(--border-color)',
              color: 'var(--text-btn-ghost)', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-btn-ghost)'; }}
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete "${book.title}"?`)) {
                onDelete(book.id);
              }
            }}
            aria-label={`Delete ${book.title}`}
            style={{
              padding: 5, borderRadius: 6,
              background: 'var(--bg-input)', border: '1px solid var(--border-color)',
              color: 'var(--text-btn-ghost)', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-btn-ghost)'; }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </article>
  );
}
