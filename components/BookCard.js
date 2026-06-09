"use client";
import { Star, Edit3, Trash2, Eye } from "lucide-react";

export default function BookCard({ book, onOpenDetails, onOpenEdit, onDelete, delay }) {
  // Star rating helper
  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < rating ? "star-filled fill-amber-400 text-amber-400" : "star-empty fill-slate-700 text-slate-700"}
          />
        ))}
      </div>
    );
  };

  // Status badge classes
  const statusMap = {
    reading: { label: "Reading", cls: "badge badge-reading" },
    completed: { label: "Completed", cls: "badge badge-completed" },
    "to-read": { label: "To Read", cls: "badge badge-to-read" },
  };
  const statusInfo = statusMap[book.status] || statusMap["to-read"];

  return (
    <div
      className="glass-card p-5 flex flex-col gap-3 group relative cursor-pointer animate-slide-up"
      style={{ animationDelay: `${delay * 0.05}s` }}
      onClick={() => onOpenDetails(book)}
    >
      {/* Cover representation */}
      <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${book.coverGradient || "from-slate-700 to-slate-800"} border border-white/10 flex flex-col justify-between p-3 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
        
        {/* Genre Tag inside cover (top left) */}
        <div className="z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/90 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {book.genre}
          </span>
        </div>
        
        {/* Floating actions on hover */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onOpenEdit(book)}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-violet-600 text-slate-300 hover:text-white border border-white/5 transition-all shadow-md"
            title="Edit Book"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/5 transition-all shadow-md"
            title="Delete Book"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Book Icon placeholder/aesthetic details */}
        <div className="self-end z-10 flex items-center justify-between w-full mt-auto">
          <span className="text-[10px] text-white/70 font-medium">
            {book.startMonth && book.startYear ? `${book.startMonth} ${book.startYear}` : "Unscheduled"}
          </span>
          <Eye size={16} className="text-white/40 group-hover:text-white/80 transition-colors duration-300" />
        </div>
      </div>

      {/* Book Info */}
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-slate-200 leading-snug line-clamp-2 group-hover:text-violet-400 transition-colors duration-200">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 font-medium">{book.author}</p>
      </div>

      {/* Rating & Status */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <span className={statusInfo.cls}>{statusInfo.label}</span>
        {renderStars(book.rating)}
      </div>
    </div>
  );
}
