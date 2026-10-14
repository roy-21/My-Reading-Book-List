"use client";
import { useState, useEffect } from "react";
import { X, Star, Plus, Check } from "lucide-react";

const GRADIENT_PRESETS = [
  { name: "Slate",      value: "from-neutral-800 to-neutral-900" },
  { name: "Navy",       value: "from-slate-900 to-blue-950" },
  { name: "Forest",     value: "from-slate-900 to-emerald-950" },
  { name: "Wine",       value: "from-slate-900 to-rose-950" },
  { name: "Charcoal",   value: "from-neutral-900 to-neutral-950" },
  { name: "Aubergine",  value: "from-slate-900 to-purple-950" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const GENRES = [
  "Technology", "Self-Growth", "Psychology", "Philosophy",
  "Fiction", "Science", "History", "Biography", "Business",
  "Poetry", "Adventure", "Memoir", "Other",
];

const INITIAL_STATE = {
  title: "", author: "", genre: "Technology", status: "completed",
  rating: 5, startYear: new Date().getFullYear(),
  startMonth: MONTHS[new Date().getMonth()],
  review: "", takeaway: "", quote: "",
  coverGradient: GRADIENT_PRESETS[0].value,
};

export default function BookModal({ isOpen, onClose, onSave, bookToEdit }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (bookToEdit) {
      setForm({
        title: bookToEdit.title || "",
        author: bookToEdit.author || "",
        genre: bookToEdit.genre || "Technology",
        status: bookToEdit.status || "completed",
        rating: bookToEdit.rating || 5,
        startYear: bookToEdit.startYear || new Date().getFullYear(),
        startMonth: bookToEdit.startMonth || MONTHS[new Date().getMonth()],
        review: bookToEdit.review || "",
        takeaway: bookToEdit.takeaway || "",
        quote: bookToEdit.quote || "",
        coverGradient: bookToEdit.coverGradient || GRADIENT_PRESETS[0].value,
      });
    } else {
      setForm(INITIAL_STATE);
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;

    onSave({
      ...(bookToEdit ? { id: bookToEdit.id } : {}),
      ...form,
      rating: form.status === "completed" ? Number(form.rating) : (form.status === "reading" ? Number(form.rating) : null),
      startYear: Number(form.startYear),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-edit-dialog-title"
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
          position: 'relative', display: 'flex', flexDirection: 'column', margin: 'auto', maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="flex items-center gap-2">
            <Plus size={16} style={{ color: '#818cf8' }} />
            <h2 id="book-edit-dialog-title" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
              {bookToEdit ? "Edit Book" : "Add New Book"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close form"
            style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Title *</label>
              <input type="text" required value={form.title} onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Designing Data-Intensive Applications" className="input-dark" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Author *</label>
              <input type="text" required value={form.author} onChange={(e) => update("author", e.target.value)}
                placeholder="e.g. Martin Kleppmann" className="input-dark" />
            </div>
          </div>

          {/* Genre & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Genre</label>
              <select value={form.genre} onChange={(e) => update("genre", e.target.value)} className="input-dark cursor-pointer">
                {GENRES.map((g) => <option key={g} value={g} style={{ background: 'var(--bg-input-option)', color: 'var(--text-main)' }}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input-dark cursor-pointer">
                <option value="completed" style={{ background: 'var(--bg-input-option)', color: 'var(--text-main)' }}>Completed</option>
                <option value="reading" style={{ background: 'var(--bg-input-option)', color: 'var(--text-main)' }}>Currently Reading</option>
                <option value="to-read" style={{ background: 'var(--bg-input-option)', color: 'var(--text-main)' }}>To Read (Shelf)</option>
                <option value="upcoming" style={{ background: 'var(--bg-input-option)', color: 'var(--text-main)' }}>Upcoming Queue</option>
              </select>
            </div>
          </div>

          {/* Rating (shown for completed or reading) */}
          {(form.status === "completed" || form.status === "reading") && (
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button key={val} type="button" onClick={() => update("rating", val)}
                    style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star size={18} className={val <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-400"} />
                  </button>
                ))}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>{form.rating} / 5</span>
              </div>
            </div>
          )}

          {/* Start Month & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Month</label>
              <select value={form.startMonth} onChange={(e) => update("startMonth", e.target.value)} className="input-dark cursor-pointer">
                {MONTHS.map((m) => <option key={m} value={m} style={{ background: 'var(--bg-input-option)', color: 'var(--text-main)' }}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Year</label>
              <input type="number" min={2015} max={2030} value={form.startYear} onChange={(e) => update("startYear", e.target.value)} className="input-dark" />
            </div>
          </div>

          {/* Cover Spine Gradient */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Spine / Cover Palette</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map((p) => {
                const isSelected = form.coverGradient === p.value;
                return (
                  <button key={p.name} type="button" onClick={() => update("coverGradient", p.value)}
                    className={`bg-gradient-to-r ${p.value}`}
                    style={{
                      height: 32, padding: '0 0.85rem', borderRadius: 8,
                      border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                    <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 500 }}>{p.name}</span>
                    {isSelected && <Check size={12} color="#fff" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quote */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Memorable Quote</label>
            <textarea rows={2} value={form.quote} onChange={(e) => update("quote", e.target.value)}
              placeholder="A sentence from the book that stuck with you..." className="input-dark" style={{ resize: 'vertical' }} />
          </div>

          {/* Key Takeaway */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Key Takeaway</label>
            <textarea rows={2} value={form.takeaway} onChange={(e) => update("takeaway", e.target.value)}
              placeholder="What core lesson or mindset shift did you learn?" className="input-dark" style={{ resize: 'vertical' }} />
          </div>

          {/* Review */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Personal Review</label>
            <textarea rows={3} value={form.review} onChange={(e) => update("review", e.target.value)}
              placeholder="Your honest thoughts, critique, and commentary..." className="input-dark" style={{ resize: 'vertical' }} />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
              {bookToEdit ? "Update Book" : "Save to Library"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
