"use client";
import { X, Star, Quote, Calendar, Lightbulb, BookOpen, Trash2, Edit3 } from "lucide-react";

const STATUS_MAP = {
  reading:   { label: "Reading",   cls: "badge badge-reading" },
  completed: { label: "Completed", cls: "badge badge-completed" },
  "to-read": { label: "To Read",   cls: "badge badge-to-read" },
};

export default function BookDetailsModal({ isOpen, onClose, book, onOpenEdit, onDelete }) {
  if (!isOpen || !book) return null;

  const status = STATUS_MAP[book.status] || STATUS_MAP["to-read"];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(12, 14, 20, 0.88)', backdropFilter: 'blur(8px)',
      padding: '1rem', overflowY: 'auto'
    }}>
      <div
        style={{
          width: '100%', maxWidth: 640, overflow: 'hidden',
          background: 'linear-gradient(145deg, #161a24 0%, #12151e 100%)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', margin: 'auto', maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover */}
        <div className={`w-full bg-gradient-to-br ${book.coverGradient || "from-gray-700 to-gray-800"}`}
          style={{ height: 'clamp(120px, 20vw, 160px)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,14,20,0.3)' }} />

          <div style={{ zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
              {book.genre}
            </span>
            <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ zIndex: 10 }}>
            <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{book.title}</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>by {book.author}</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Metadata */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
            padding: '0.85rem 1rem', borderRadius: 12,
            background: 'rgba(12, 14, 20, 0.5)', border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.7rem', color: '#636d82', fontWeight: 500, textTransform: 'uppercase' }}>Status:</span>
              <span className={status.cls}>{status.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '0.7rem', color: '#636d82', fontWeight: 500, textTransform: 'uppercase' }}>Rating:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={13} className={i < book.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"} />
                ))}
              </div>
            </div>
            {book.startMonth && book.startYear && (
              <div className="flex items-center gap-1.5" style={{ fontSize: '0.75rem', color: '#8b94a6' }}>
                <Calendar size={12} style={{ color: '#818cf8' }} />
                <span>{book.startMonth} {book.startYear}</span>
              </div>
            )}
          </div>

          {/* Quote */}
          {book.quote && (
            <div style={{
              position: 'relative', padding: '1rem 1.25rem', borderRadius: 12,
              background: 'rgba(12, 14, 20, 0.5)', border: '1px solid rgba(255,255,255,0.04)'
            }}>
              <Quote size={28} style={{ position: 'absolute', top: 8, left: 8, opacity: 0.06, transform: 'rotate(180deg)' }} />
              <p style={{ position: 'relative', zIndex: 10, fontStyle: 'italic', color: '#b8bfcc', fontSize: '0.875rem', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
                &ldquo;{book.quote}&rdquo;
              </p>
            </div>
          )}

          {/* Takeaway */}
          {book.takeaway && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-center gap-1.5" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dce0e8' }}>
                <Lightbulb size={14} style={{ color: '#fbbf24' }} />
                <span>Key Takeaway</span>
              </div>
              <p style={{ color: '#8b94a6', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: '1.25rem' }}>{book.takeaway}</p>
            </div>
          )}

          {/* Review */}
          {book.review && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-center gap-1.5" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dce0e8' }}>
                <BookOpen size={14} style={{ color: '#818cf8' }} />
                <span>My Review</span>
              </div>
              <p style={{ color: '#8b94a6', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: '1.25rem', whiteSpace: 'pre-line' }}>{book.review}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', padding: '1.25rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(12, 14, 20, 0.4)'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 auto' }}>
            <button
              onClick={() => { onOpenEdit(book); onClose(); }}
              className="btn-ghost flex items-center gap-1.5 justify-center"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', flex: '1 1 0', maxWidth: 120 }}
            >
              <Edit3 size={11} /> Edit
            </button>
            <button
              onClick={() => { if (confirm("Delete this book?")) { onDelete(book.id); onClose(); } }}
              className="btn-ghost flex items-center gap-1.5 justify-center"
              style={{ 
                padding: '0.4rem 0.75rem', fontSize: '0.75rem', flex: '1 1 0', maxWidth: 120,
                borderColor: 'rgba(239, 68, 68, 0.15)', color: '#fb7185'
              }}
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.75rem' }}>Close</button>
        </div>
      </div>
    </div>
  );
}
