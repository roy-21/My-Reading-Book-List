import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookBySlug, getBooks } from "@/lib/db/books";
import { Star, ArrowLeft, Calendar, Quote, Lightbulb, BookOpen, Share2 } from "lucide-react";

const hasBengali = (text) => /[\u0980-\u09FF]/.test(text || "");

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book Not Found — Sojib's Reading Room" };

  return {
    title: `${book.title} — Sojib's Reading Room`,
    description: book.takeaway || book.review || `A curated volume in Sojib's library by ${book.author}.`,
    openGraph: {
      title: `${book.title} by ${book.author}`,
      description: book.takeaway || book.review || `Explore literary insights and notes on "${book.title}".`,
      type: "article",
    },
  };
}

export default async function BookDetailPage({ params }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const isBnTitle = hasBengali(book.title);

  return (
    <div className="min-h-screen bg-page text-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-indigo-400 transition-colors bg-surface border border-color px-3.5 py-2 rounded-xl"
          >
            <ArrowLeft size={14} />
            <span>Return to The Reading Room</span>
          </Link>
        </div>

        {/* Book Header Card */}
        <article className="surface rounded-2xl overflow-hidden border border-color shadow-lg">
          <div
            className={`w-full bg-gradient-to-br ${book.coverGradient || "from-slate-900 to-blue-950"} p-8 sm:p-12 relative flex flex-col justify-between`}
            style={{ minHeight: 220 }}
          >
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
            
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[0.68rem] uppercase font-bold tracking-widest text-white/90 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                {book.genre}
              </span>
              <span className="text-xs text-white/80 font-medium capitalize bg-white/10 px-3 py-1 rounded-full">
                Status: {book.status}
              </span>
            </div>

            <div className="relative z-10 mt-6">
              <h1
                lang={isBnTitle ? "bn" : "en"}
                className={`text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug ${
                  isBnTitle ? "font-bengali-serif" : ""
                }`}
              >
                {book.title}
              </h1>
              <p
                lang={hasBengali(book.author) ? "bn" : "en"}
                className="text-base sm:text-lg text-white/80 mt-2 font-medium"
              >
                by {book.author}
              </p>
            </div>
          </div>

          {/* Metadata Banner */}
          <div className="px-6 sm:px-8 py-4 border-b border-color bg-surface/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
            <div className="flex items-center gap-4">
              {book.rating && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[0.65rem]">Rating:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < book.rating ? "fill-amber-400 text-amber-400" : "text-gray-500/40"}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-main ml-1">{book.rating}.0</span>
                </div>
              )}

              {book.startMonth && book.startYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-indigo-400" />
                  <span>{book.startMonth} {book.startYear}</span>
                </div>
              )}
            </div>

            <span className="text-[0.7rem] italic">Sojib&apos;s Reading List Archive</span>
          </div>

          {/* Book Content */}
          <div className="p-6 sm:p-8 flex flex-col gap-8">
            
            {/* Quote */}
            {book.quote && (
              <div className="relative p-6 rounded-2xl bg-input border border-color">
                <Quote size={36} className="absolute top-4 left-4 opacity-10 rotate-180 text-indigo-400" />
                <blockquote
                  lang={hasBengali(book.quote) ? "bn" : "en"}
                  className={`relative z-10 text-base sm:text-lg text-main italic leading-relaxed pl-6 ${
                    hasBengali(book.quote) ? "font-bengali-serif" : ""
                  }`}
                >
                  &ldquo;{book.quote}&rdquo;
                </blockquote>
              </div>
            )}

            {/* Takeaway */}
            {book.takeaway && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-highlight">
                  <Lightbulb size={16} className="text-amber-400" />
                  <span>Key Literary Takeaway</span>
                </div>
                <p
                  lang={hasBengali(book.takeaway) ? "bn" : "en"}
                  className="text-sm sm:text-base text-muted leading-relaxed pl-6 border-l-2 border-indigo-500/20"
                >
                  {book.takeaway}
                </p>
              </div>
            )}

            {/* Review */}
            {book.review && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-highlight">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span>Personal Review &amp; Commentary</span>
                </div>
                <div
                  lang={hasBengali(book.review) ? "bn" : "en"}
                  className="text-sm sm:text-base text-muted leading-relaxed pl-6 border-l-2 border-indigo-500/20 whitespace-pre-line"
                >
                  {book.review}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
