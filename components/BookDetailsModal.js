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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8 overflow-y-auto">
      <div
        className="surface w-full max-w-2xl overflow-hidden border border-base-700 shadow-2xl flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover */}
        <div className={`w-full h-32 sm:h-40 bg-gradient-to-br ${book.coverGradient || "from-gray-700 to-gray-800"} p-5 flex flex-col justify-between relative`}>
          <div className="absolute inset-0 bg-black/25" />

          <div className="z-10 flex items-center justify-between w-full">
            <span className="text-xs uppercase font-semibold tracking-wider text-white bg-black/40 px-2.5 py-0.5 rounded-full">
              {book.genre}
            </span>
            <button onClick={onClose} className="p-1.5 rounded bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="z-10">
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{book.title}</h2>
            <p className="text-sm text-white/75 mt-0.5">by {book.author}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 py-3 px-4 rounded-lg bg-base-800 border border-base-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium uppercase">Status:</span>
              <span className={status.cls}>{status.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium uppercase">Rating:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={13} className={i < book.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"} />
                ))}
              </div>
            </div>
            {book.startMonth && book.startYear && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={12} className="text-blue-400" />
                <span>{book.startMonth} {book.startYear}</span>
              </div>
            )}
          </div>

          {/* Quote */}
          {book.quote && (
            <div className="relative p-4 rounded-lg bg-base-800 border border-base-700">
              <Quote size={28} className="absolute top-2 left-2 text-gray-800/10 rotate-180" />
              <p className="relative z-10 italic text-gray-300 text-sm leading-relaxed pl-5">
                &ldquo;{book.quote}&rdquo;
              </p>
            </div>
          )}

          {/* Takeaway */}
          {book.takeaway && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-200">
                <Lightbulb size={14} className="text-amber-400" />
                <span>Key Takeaway</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pl-5">{book.takeaway}</p>
            </div>
          )}

          {/* Review */}
          {book.review && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-200">
                <BookOpen size={14} className="text-blue-400" />
                <span>My Review</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pl-5 whitespace-pre-line">{book.review}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-5 border-t border-base-700 bg-base-900">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <button
              onClick={() => { onOpenEdit(book); onClose(); }}
              className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
            >
              <Edit3 size={11} /> Edit
            </button>
            <button
              onClick={() => { if (confirm("Delete this book?")) { onDelete(book.id); onClose(); } }}
              className="btn-ghost border-red-900/40 text-red-400 hover:bg-red-950/30 hover:border-red-800/60 py-1.5 px-3 text-xs flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
          <button onClick={onClose} className="btn-primary py-1.5 px-5 text-xs justify-center">Close</button>
        </div>
      </div>
    </div>
  );
}
