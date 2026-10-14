"use client";
import { useEffect } from "react";
import { X, Star, Quote, Calendar, Lightbulb, BookOpen, Trash2, Edit3 } from "lucide-react";

const STATUS_MAP = {
  reading:   { label: "Reading",   cls: "badge badge-reading" },
  completed: { label: "Completed", cls: "badge badge-completed" },
  "to-read": { label: "To Read",   cls: "badge badge-to-read" },
  upcoming:  { label: "Upcoming",  cls: "badge badge-to-read" },
};

const hasBengali = (text) => /[\u0980-\u09FF]/.test(text || "");

export default function BookDetailsModal({ isOpen, onClose, book, onOpenEdit, onDelete, isAdmin }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const status = STATUS_MAP[book.status] || STATUS_MAP["to-read"];
  const isBengaliTitle = hasBengali(book.title);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)',
        padding: '1rem', overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 640, overflow: 'hidden',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)', borderRadius: '1.25rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', margin: 'auto', maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover */}
        <div
          className={`w-full bg-gradient-to-br ${book.coverGradient || "from-slate-900 to-blue-950"}`}
          style={{
            height: 'clamp(130px, 22vw, 175px)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(12, 14, 20, 0.35)' }} />

          <div style={{ zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', color: '#fff', background: 'rgba(0,0,0,0.45)', padding: '0.2rem 0.65rem', borderRadius: 20 }}>
              {book.genre}
            </span>
            <button
              onClick={onClose}
              aria-label="Close details"
              style={{ padding: 6, borderRadius: 8, background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ zIndex: 10 }}>
            <h2
              id="book-modal-title"
              className={isBengaliTitle ? "font-bengali-serif" : ""}
              lang={isBengaliTitle ? "bn" : "en"}
              style={{ fontSize: 'clamp(1.1rem, 3.2vw, 1.35rem)', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}
            >
              {book.title}
            </h2>
            <p
              lang={hasBengali(book.author) ? "bn" : "en"}
              style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.78)', marginTop: 2 }}
            >
              by {book.author}
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Metadata */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
            padding: '0.85rem 1rem', borderRadius: 12,
            background: 'var(--bg-input)', border: '1px solid var(--border-color)'
          }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status:</span>
              <span className={status.cls}>{status.label}</span>
            </div>

            {book.rating ? (
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Rating:</span>
                <div className="flex gap-0.5" aria-label={`Rating: ${book.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} className={i < book.rating ? "fill-amber-400 text-amber-400" : "text-gray-400"} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <em>No rating yet</em>
              </div>
            )}

            {book.startMonth && book.startYear && (
              <div className="flex items-center gap-1.5" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={12} style={{ color: '#818cf8' }} />
                <span>{book.startMonth} {book.startYear}</span>
              </div>
            )}
          </div>

          {/* Quote */}
          {book.quote && (
            <div style={{
              position: 'relative', padding: '1rem 1.25rem', borderRadius: 12,
              background: 'var(--bg-input)', border: '1px solid var(--border-color)'
            }}>
              <Quote size={28} style={{ position: 'absolute', top: 8, left: 8, opacity: 0.08, transform: 'rotate(180deg)' }} />
              <p
                lang={hasBengali(book.quote) ? "bn" : "en"}
                className={hasBengali(book.quote) ? "font-bengali-serif" : ""}
                style={{ position: 'relative', zIndex: 10, fontStyle: 'italic', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: '1.25rem' }}
              >
                &ldquo;{book.quote}&rdquo;
              </p>
            </div>
          )}

          {/* Takeaway */}
          {book.takeaway && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-center gap-1.5" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
                <Lightbulb size={14} style={{ color: '#fbbf24' }} />
                <span>Key Takeaway</span>
              </div>
              <p
                lang={hasBengali(book.takeaway) ? "bn" : "en"}
                style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: '1.25rem' }}
              >
                {book.takeaway}
              </p>
            </div>
          )}

          {/* Review */}
          {book.review && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-center gap-1.5" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
                <BookOpen size={14} style={{ color: '#818cf8' }} />
                <span>My Review</span>
              </div>
              <p
                lang={hasBengali(book.review) ? "bn" : "en"}
                style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: '1.25rem', whiteSpace: 'pre-line' }}
              >
                {book.review}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--border-color)', background: 'var(--bg-card-upcoming)'
        }}>
          {isAdmin ? (
            <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 auto' }}>
              <button
                onClick={() => { onOpenEdit(book); onClose(); }}
                className="btn-ghost flex items-center gap-1.5 justify-center"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', flex: '1 1 0', maxWidth: 120 }}
              >
                <Edit3 size={12} /> Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
                    onDelete(book.id);
                    onClose();
                  }
                }}
                className="btn-ghost flex items-center gap-1.5 justify-center"
                style={{ 
                  padding: '0.45rem 0.85rem', fontSize: '0.75rem', flex: '1 1 0', maxWidth: 120,
                  borderColor: 'rgba(239, 68, 68, 0.25)', color: '#fb7185'
                }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Curated by Sojib · Read-Only View
            </div>
          )}
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.45rem 1.35rem', fontSize: '0.75rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
