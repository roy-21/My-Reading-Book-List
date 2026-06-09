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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 overflow-y-auto py-8">
      <div
        className="surface w-full max-w-2xl overflow-hidden border border-base-700 shadow-2xl relative flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-base-700">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold text-gray-100">
              {bookToEdit ? "Edit Book" : "Add New Book"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
              <input type="text" required value={form.title} onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Clean Code" className="input-dark" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Author *</label>
              <input type="text" required value={form.author} onChange={(e) => update("author", e.target.value)}
                placeholder="e.g. Robert C. Martin" className="input-dark" />
            </div>
          </div>

          {/* Genre & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Genre</label>
              <select value={form.genre} onChange={(e) => update("genre", e.target.value)} className="input-dark cursor-pointer">
                {GENRES.map((g) => <option key={g} value={g} className="bg-black">{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input-dark cursor-pointer">
                <option value="completed" className="bg-black">Completed</option>
                <option value="reading" className="bg-black">Currently Reading</option>
                <option value="to-read" className="bg-black">To Read</option>
              </select>
            </div>
          </div>

          {/* Rating, Year, Month */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Rating</label>
              <div className="flex items-center gap-1 bg-base-800 border border-base-700 rounded-lg px-3 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => update("rating", s)} className="hover:scale-110 transition-transform">
                    <Star size={16} className={s <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Year</label>
              <input type="number" value={form.startYear} onChange={(e) => update("startYear", e.target.value)} className="input-dark" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Month</label>
              <select value={form.startMonth} onChange={(e) => update("startMonth", e.target.value)} className="input-dark cursor-pointer">
                {MONTHS.map((m) => <option key={m} value={m} className="bg-black">{m}</option>)}
              </select>
            </div>
          </div>

          {/* Cover Gradient */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Card Color</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GRADIENT_PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => update("coverGradient", p.value)}
                  className={`h-9 rounded-lg bg-gradient-to-br ${p.value} border-2 text-[9px] font-bold text-white/80 flex items-center justify-center transition-all ${
                    form.coverGradient === p.value ? "border-blue-400 ring-1 ring-blue-500/30" : "border-transparent hover:border-gray-600"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Review</label>
            <textarea value={form.review} onChange={(e) => update("review", e.target.value)}
              placeholder="Your thoughts on this book..." rows={3} className="input-dark resize-none" />
          </div>

          {/* Takeaway */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Key Takeaway</label>
            <textarea value={form.takeaway} onChange={(e) => update("takeaway", e.target.value)}
              placeholder="The one lesson you learned..." rows={2} className="input-dark resize-none" />
          </div>

          {/* Quote */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Memorable Quote</label>
            <textarea value={form.quote} onChange={(e) => update("quote", e.target.value)}
              placeholder="A quote that stuck with you..." rows={2} className="input-dark resize-none" />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-base-700">
          <button type="button" onClick={onClose} className="btn-ghost py-2 px-5 text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={!form.title.trim() || !form.author.trim()}
            className="btn-primary py-2 px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            {bookToEdit ? "Save Changes" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
