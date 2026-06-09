"use client";
import { useState, useEffect } from "react";
import { X, Star, Sparkles } from "lucide-react";

const GRADIENT_PRESETS = [
  { name: "Neon Dusk", value: "from-violet-600 to-indigo-700" },
  { name: "Ocean Breeze", value: "from-cyan-500 to-blue-600" },
  { name: "Sunset Glow", value: "from-rose-500 to-orange-600" },
  { name: "Forest Moss", value: "from-emerald-500 to-teal-600" },
  { name: "Cyberpunk Pink", value: "from-purple-600 to-pink-600" },
  { name: "Golden Lava", value: "from-amber-500 to-red-600" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const GENRES = [
  "Technology", "Self-Growth", "Psychology", "Philosophy", 
  "Fiction", "Science", "History", "Biography", "Business", "Other"
];

export default function BookModal({ isOpen, onClose, onSave, bookToEdit }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("Technology");
  const [status, setStatus] = useState("completed");
  const [rating, setRating] = useState(5);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(MONTHS[new Date().getMonth()]);
  const [review, setReview] = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [quote, setQuote] = useState("");
  const [coverGradient, setCoverGradient] = useState(GRADIENT_PRESETS[0].value);

  // Sync state if editing a book
  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title || "");
      setAuthor(bookToEdit.author || "");
      setGenre(bookToEdit.genre || "Technology");
      setStatus(bookToEdit.status || "completed");
      setRating(bookToEdit.rating || 5);
      setStartYear(bookToEdit.startYear || new Date().getFullYear());
      setStartMonth(bookToEdit.startMonth || MONTHS[new Date().getMonth()]);
      setReview(bookToEdit.review || "");
      setTakeaway(bookToEdit.takeaway || "");
      setQuote(bookToEdit.quote || "");
      setCoverGradient(bookToEdit.coverGradient || GRADIENT_PRESETS[0].value);
    } else {
      // Clear form for addition
      setTitle("");
      setAuthor("");
      setGenre("Technology");
      setStatus("completed");
      setRating(5);
      setStartYear(new Date().getFullYear());
      setStartMonth(MONTHS[new Date().getMonth()]);
      setReview("");
      setTakeaway("");
      setQuote("");
      setCoverGradient(GRADIENT_PRESETS[0].value);
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const savedBook = {
      id: bookToEdit ? bookToEdit.id : Date.now().toString(),
      title,
      author,
      genre,
      status,
      rating: Number(rating),
      startYear: Number(startYear),
      startMonth,
      review,
      takeaway,
      quote,
      coverGradient,
    };
    onSave(savedBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-y-auto py-8">
      <div 
        className="glass w-full max-w-2xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              {bookToEdit ? "Edit Book Details" : "Add New Book to Shelf"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Row 1: Title & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Book Title *</label>
              <input 
                type="text" 
                required
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clean Code"
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Author *</label>
              <input 
                type="text" 
                required
                value={author} 
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Robert C. Martin"
                className="input-glass"
              />
            </div>
          </div>

          {/* Row 2: Genre & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Genre</label>
              <select 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)}
                className="input-glass cursor-pointer"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g} className="bg-space-900">{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reading Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="input-glass cursor-pointer"
              >
                <option value="completed" className="bg-space-900">Completed</option>
                <option value="reading" className="bg-space-900">Currently Reading</option>
                <option value="to-read" className="bg-space-900">To Read</option>
              </select>
            </div>
          </div>

          {/* Row 3: Rating, Year & Month */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Rating</label>
              <div className="flex items-center gap-1 bg-space-900/60 border border-white/8 rounded-lg px-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-slate-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={18}
                      className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Year</label>
              <input 
                type="number" 
                value={startYear} 
                onChange={(e) => setStartYear(e.target.value)}
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Month</label>
              <select 
                value={startMonth} 
                onChange={(e) => setStartMonth(e.target.value)}
                className="input-glass cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m} className="bg-space-900">{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Gradients */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Shelf Card Background Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setCoverGradient(preset.value)}
                  className={`h-11 rounded-lg bg-gradient-to-br ${preset.value} border-2 text-[10px] font-bold text-white shadow-inner flex items-center justify-center transition-all ${
                    coverGradient === preset.value 
                      ? "border-violet-400 scale-102 ring-2 ring-violet-500/20" 
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Review */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Personal Review</label>
            <textarea 
              value={review} 
              onChange={(e) => setReview(e.target.value)}
              placeholder="What were your thoughts on this book?"
              rows={3}
              className="input-glass resize-none"
            />
          </div>

          {/* Key Takeaway */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Takeaway / Lesson</label>
            <textarea 
              value={takeaway} 
              onChange={(e) => setTakeaway(e.target.value)}
              placeholder="What is the one lesson or model you learned from this?"
              rows={2}
              className="input-glass resize-none"
            />
          </div>

          {/* Memorable Quote */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Memorable Quote</label>
            <textarea 
              value={quote} 
              onChange={(e) => setQuote(e.target.value)}
              placeholder="A quote from the book that stuck with you..."
              rows={2}
              className="input-glass resize-none"
            />
          </div>

        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5 bg-space-950/40">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-ghost py-2 px-6"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !author.trim()}
            className="btn-primary py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookToEdit ? "Save Changes" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
