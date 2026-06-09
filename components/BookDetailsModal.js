"use client";
import { X, Star, Quote, Calendar, Lightbulb, BookOpen, Trash2, Edit3 } from "lucide-react";

export default function BookDetailsModal({ isOpen, onClose, book, onOpenEdit, onDelete }) {
  if (!isOpen || !book) return null;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "star-filled fill-amber-400 text-amber-400" : "star-empty fill-slate-700 text-slate-700"}
          />
        ))}
      </div>
    );
  };

  const statusMap = {
    reading: { label: "Reading", cls: "badge badge-reading" },
    completed: { label: "Completed", cls: "badge badge-completed" },
    "to-read": { label: "To Read", cls: "badge badge-to-read" },
  };
  const statusInfo = statusMap[book.status] || statusMap["to-read"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 py-8 overflow-y-auto">
      <div 
        className="glass w-full max-w-2xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Header Cover */}
        <div className={`w-full h-44 bg-gradient-to-br ${book.coverGradient || "from-slate-700 to-slate-800"} p-6 flex flex-col justify-between relative`}>
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Top Row: Genre Tag & Close Button */}
          <div className="z-10 flex items-center justify-between w-full">
            <span className="text-xs uppercase font-bold tracking-wider text-white bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {book.genre}
            </span>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Bottom Row: Title and Author */}
          <div className="z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-md">
              {book.title}
            </h2>
            <p className="text-sm text-white/80 font-medium mt-1 drop-shadow-sm">
              by {book.author}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 rounded-xl bg-space-900/60 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status:</span>
              <span className={statusInfo.cls}>{statusInfo.label}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Rating:</span>
              {renderStars(book.rating)}
            </div>

            {book.startMonth && book.startYear && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar size={14} className="text-violet-400" />
                <span>Started: {book.startMonth} {book.startYear}</span>
              </div>
            )}
          </div>

          {/* Quote Section */}
          {book.quote && (
            <div className="relative p-5 rounded-xl bg-violet-600/5 border border-violet-500/10 overflow-hidden">
              <Quote size={40} className="absolute -top-2 -left-2 text-violet-500/10 transform rotate-180" />
              <p className="relative z-10 italic text-slate-300 text-sm leading-relaxed pl-6">
                "{book.quote}"
              </p>
            </div>
          )}

          {/* Takeaway Section */}
          {book.takeaway && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                <Lightbulb size={16} className="text-amber-400" />
                <span>Key Takeaway</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed pl-5">
                {book.takeaway}
              </p>
            </div>
          )}

          {/* Review Section */}
          {book.review && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                <BookOpen size={16} className="text-cyan-400" />
                <span>My Review & Reflection</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed pl-5 whitespace-pre-line">
                {book.review}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-white/5 bg-space-950/40">
          {/* Quick Actions (Edit/Delete) */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onOpenEdit(book);
                onClose();
              }}
              className="btn-ghost py-2 px-4 text-xs flex items-center gap-1.5"
            >
              <Edit3 size={12} />
              Edit details
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this book?")) {
                  onDelete(book.id);
                  onClose();
                }
              }}
              className="btn-ghost border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/60 py-2 px-4 text-xs flex items-center gap-1.5"
            >
              <Trash2 size={12} />
              Delete book
            </button>
          </div>

          <button 
            onClick={onClose} 
            className="btn-primary py-2 px-6 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
