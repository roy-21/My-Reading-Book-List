"use client";
import { Star, Edit3, Trash2 } from "lucide-react";

const STATUS_MAP = {
  reading:   { label: "Reading",   cls: "badge badge-reading" },
  completed: { label: "Completed", cls: "badge badge-completed" },
  "to-read": { label: "To Read",   cls: "badge badge-to-read" },
};

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          className={i < rating ? "star-filled fill-amber-400 text-amber-400" : "star-empty fill-base-700 text-base-700"}
        />
      ))}
    </div>
  );
}

export default function BookCard({ book, onOpenDetails, onOpenEdit, onDelete, delay }) {
  const status = STATUS_MAP[book.status] || STATUS_MAP["to-read"];

  return (
    <div
      className="card group relative cursor-pointer"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      onClick={() => onOpenDetails(book)}
    >
      {/* Top row: Genre and Date */}
      <div className="flex items-center justify-between">
        <span style={{
          fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700,
          letterSpacing: '0.08em', color: '#818cf8',
          background: 'rgba(99, 102, 241, 0.08)', padding: '0.2rem 0.5rem',
          borderRadius: 6, border: '1px solid rgba(99, 102, 241, 0.1)'
        }}>
          {book.genre}
        </span>
        <span style={{ fontSize: '0.6rem', color: '#636d82', fontWeight: 500 }}>
          {book.startMonth && book.startYear ? `${book.startMonth} ${book.startYear}` : ""}
        </span>
      </div>

      {/* Main Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <h3 style={{ 
          fontSize: '0.9rem', fontWeight: 600, color: '#dce0e8', 
          lineHeight: 1.4, transition: 'color 0.2s ease',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }} className="group-hover:text-indigo-400">
          {book.title}
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#636d82' }}>by {book.author}</p>
        
        {/* Subtle key takeaway preview if exists */}
        {book.takeaway && (
          <p style={{ 
            fontSize: '0.7rem', color: '#8b94a6', marginTop: '0.5rem', fontStyle: 'italic',
            borderLeft: '2px solid rgba(99,102,241,0.15)', paddingLeft: '0.5rem',
            lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            &ldquo;{book.takeaway}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: '0.25rem'
      }}>
        <span className={status.cls}>{status.label}</span>
        <StarRating rating={book.rating} />
      </div>

      {/* Hover Actions in Top Right */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenEdit(book)}
          style={{
            padding: 4, borderRadius: 6, 
            background: 'rgba(22, 26, 36, 0.9)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#8b94a6', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(22, 26, 36, 0.9)'; e.currentTarget.style.color = '#8b94a6'; }}
          title="Edit Book"
        >
          <Edit3 size={11} />
        </button>
        <button
          onClick={() => onDelete(book.id)}
          style={{
            padding: 4, borderRadius: 6,
            background: 'rgba(22, 26, 36, 0.9)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#8b94a6', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(22, 26, 36, 0.9)'; e.currentTarget.style.color = '#8b94a6'; }}
          title="Delete Book"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

