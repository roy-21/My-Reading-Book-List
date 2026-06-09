"use client";
import { Star, Edit3, Trash2 } from "lucide-react";

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
      className="card p-5 flex flex-col gap-4 group relative cursor-pointer"
      onClick={() => onOpenDetails(book)}
    >
      {/* Top row: Genre and Date */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10">
          {book.genre}
        </span>
        <span className="text-[10px] text-gray-500 font-medium">
          {book.startMonth && book.startYear ? `${book.startMonth} ${book.startYear}` : ""}
        </span>
      </div>

      {/* Main Info */}
      <div className="flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm font-semibold text-gray-200 leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500">by {book.author}</p>
        
        {/* Subtle key takeaway preview if exists */}
        {book.takeaway && (
          <p className="text-[11px] text-gray-400 line-clamp-2 mt-2 italic border-l border-neutral-800 pl-2 leading-relaxed">
            &ldquo;{book.takeaway}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-3 border-t border-base-800 mt-1">
        <span className={status.cls}>{status.label}</span>
        <StarRating rating={book.rating} />
      </div>

      {/* Hover Actions in Top Right */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenEdit(book)}
          className="p-1 rounded bg-base-800 hover:bg-blue-600 text-gray-400 hover:text-white border border-base-700 transition-colors"
          title="Edit Book"
        >
          <Edit3 size={11} />
        </button>
        <button
          onClick={() => onDelete(book.id)}
          className="p-1 rounded bg-base-800 hover:bg-red-600 text-gray-400 hover:text-white border border-base-700 transition-colors"
          title="Delete Book"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

