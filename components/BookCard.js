"use client";
import { Star, Edit3, Trash2, Eye } from "lucide-react";

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
      className="card p-4 flex flex-col gap-3 group relative cursor-pointer animate-slide-up"
      style={{ animationDelay: `${delay * 0.04}s` }}
      onClick={() => onOpenDetails(book)}
    >
      {/* Cover */}
      <div className={`w-full h-28 rounded-lg bg-gradient-to-br ${book.coverGradient || "from-gray-700 to-gray-800"} flex flex-col justify-between p-3 relative overflow-hidden`}>
        {/* Genre tag */}
        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/90 bg-black/40 px-2 py-0.5 rounded-full self-start z-10">
          {book.genre}
        </span>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onOpenEdit(book)}
            className="p-1.5 rounded-md bg-black/60 hover:bg-blue-600 text-gray-300 hover:text-white transition-colors"
            title="Edit Book"
          >
            <Edit3 size={11} />
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="p-1.5 rounded-md bg-black/60 hover:bg-red-600 text-gray-300 hover:text-white transition-colors"
            title="Delete Book"
          >
            <Trash2 size={11} />
          </button>
        </div>

        {/* Bottom info */}
        <div className="flex items-center justify-between w-full z-10 mt-auto">
          <span className="text-[10px] text-white/60 font-medium">
            {book.startMonth && book.startYear ? `${book.startMonth} ${book.startYear}` : ""}
          </span>
          <Eye size={14} className="text-white/30 group-hover:text-white/70 transition-colors" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 flex-1">
        <h3 className="text-sm font-semibold text-gray-200 leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500">{book.author}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-base-700">
        <span className={status.cls}>{status.label}</span>
        <StarRating rating={book.rating} />
      </div>
    </div>
  );
}
