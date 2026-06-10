"use client";
import { useState, useEffect } from "react";
import { X, Star, Plus } from "lucide-react";

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

const GENRES = [
  "Technology", "Self-Growth", "Psychology", "Philosophy",
  "Fiction", "Science", "History", "Biography", "Business", "Other",
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
      id: bookToEdit ? bookToEdit.id : Date.now().toString(),
      ...form,
      rating: Number(form.rating),
      startYear: Number(form.startYear),
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(12, 14, 20, 0.85)', backdropFilter: 'blur(8px)',
      padding: '1rem', overflowY: 'auto'
    }}>
      <div
        style={{
          width: '100%', maxWidth: 640, overflow: 'hidden',
          background: 'linear-gradient(145deg, #161a24 0%, #12151e 100%)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          position: 'relative', display: 'flex', flexDirection: 'column', margin: 'auto', maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)'
        }}>
          <div className="flex items-center gap-2">
            <Plus size={16} style={{ color: '#818cf8' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f1f5' }}>
              {bookToEdit ? "Edit Book" : "Add New Book"}
            </h2>
          </div>
          <button onClick={onClose} style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', color: '#636d82', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#dce0e8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#636d82'}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Title *</label>
              <input type="text" required value={form.title} onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Clean Code" className="input-dark" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Author *</label>
              <input type="text" required value={form.author} onChange={(e) => update("author", e.target.value)}
                placeholder="e.g. Robert C. Martin" className="input-dark" />
            </div>
          </div>

          {/* Genre & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Genre</label>
              <select value={form.genre} onChange={(e) => update("genre", e.target.value)} className="input-dark cursor-pointer">
                {GENRES.map((g) => <option key={g} value={g} style={{ background: '#10131a' }}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input-dark cursor-pointer">
                <option value="completed" style={{ background: '#10131a' }}>Completed</option>
                <option value="reading" style={{ background: '#10131a' }}>Currently Reading</option>
                <option value="to-read" style={{ background: '#10131a' }}>To Read</option>
              </select>
            </div>
          </div>

          {/* Rating, Year, Month */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Rating</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(12,14,20,0.5)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.5rem 0.75rem' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => update("rating", s)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s', padding: 0 }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <Star size={16} className={s <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Year</label>
              <input type="number" value={form.startYear} onChange={(e) => update("startYear", e.target.value)} className="input-dark" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Month</label>
              <select value={form.startMonth} onChange={(e) => update("startMonth", e.target.value)} className="input-dark cursor-pointer">
                {MONTHS.map((m) => <option key={m} value={m} style={{ background: '#10131a' }}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Cover Gradient */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Card Color</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GRADIENT_PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => update("coverGradient", p.value)}
                  className={`bg-gradient-to-br ${p.value}`}
                  style={{
                    height: 36, borderRadius: 10, fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    border: form.coverGradient === p.value ? '2px solid #818cf8' : '2px solid transparent',
                    boxShadow: form.coverGradient === p.value ? '0 0 0 2px rgba(99,102,241,0.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Review</label>
            <textarea value={form.review} onChange={(e) => update("review", e.target.value)}
              placeholder="Your thoughts on this book..." rows={3} className="input-dark" style={{ resize: 'none' }} />
          </div>

          {/* Takeaway */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Key Takeaway</label>
            <textarea value={form.takeaway} onChange={(e) => update("takeaway", e.target.value)}
              placeholder="The one lesson you learned..." rows={2} className="input-dark" style={{ resize: 'none' }} />
          </div>

          {/* Quote */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#636d82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Memorable Quote</label>
            <textarea value={form.quote} onChange={(e) => update("quote", e.target.value)}
              placeholder="A quote that stuck with you..." rows={2} className="input-dark" style={{ resize: 'none' }} />
          </div>
        </form>

        {/* Actions */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem',
          padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)'
        }}>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!form.title.trim() || !form.author.trim()}
            className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', opacity: (!form.title.trim() || !form.author.trim()) ? 0.4 : 1, cursor: (!form.title.trim() || !form.author.trim()) ? 'not-allowed' : 'pointer' }}>
            {bookToEdit ? "Save Changes" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
