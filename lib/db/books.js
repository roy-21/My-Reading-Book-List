import fs from "fs/promises";
import path from "path";
import { defaultBooks } from "@/data/defaultBooks";
import { upcomingBooks } from "@/data/upcomingBooks";
import { slugify } from "@/lib/utils/slugify";

const DB_FILE_PATH = path.join(process.cwd(), "data", "books.json");

/**
 * Normalizes a book record ensuring consistent schema, valid slug, and clean defaults.
 */
function normalizeBook(book, index = 0) {
  const isUpcoming = book.status === "upcoming" || book.id?.startsWith("up-");
  const status = isUpcoming ? "upcoming" : (book.status || "to-read");
  const rawTitle = book.title || "Untitled Book";
  const slug = slugify(rawTitle) || `book-${index + 1}`;

  return {
    id: book.id ? String(book.id) : `b-${Date.now()}-${index}`,
    slug,
    title: rawTitle,
    author: book.author || "Unknown Author",
    genre: book.genre || "General",
    status,
    // Only completed books or books with real reviews have an active rating
    rating: status === "completed" ? (Number(book.rating) || 5) : (status === "reading" ? (Number(book.rating) || null) : null),
    review: book.review || "",
    takeaway: book.takeaway || "",
    quote: book.quote || "",
    startYear: book.startYear ? Number(book.startYear) : (status === "completed" ? 2024 : 2025),
    startMonth: book.startMonth || "January",
    completedYear: book.completedYear ? Number(book.completedYear) : (status === "completed" ? (book.startYear ? Number(book.startYear) : 2024) : null),
    completedMonth: book.completedMonth || (status === "completed" ? (book.startMonth || "June") : null),
    coverGradient: book.coverGradient || "from-slate-900 to-blue-950",
    coverImage: book.coverImage || null,
    updatedAt: book.updatedAt || new Date().toISOString(),
  };
}

/**
 * Initializes the JSON database from defaultBooks and upcomingBooks if not already created.
 */
async function initializeDb() {
  try {
    await fs.access(DB_FILE_PATH);
  } catch {
    // Merge default and upcoming books into a unified collection
    const initialList = [
      ...defaultBooks.map((b, i) => normalizeBook(b, i)),
      ...upcomingBooks.map((b, i) => normalizeBook({ ...b, status: "upcoming" }, defaultBooks.length + i))
    ];
    await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(initialList, null, 2), "utf8");
    return initialList;
  }
}

/**
 * Reads all books from the persistent JSON storage.
 */
export async function getBooks() {
  await initializeDb();
  try {
    const raw = await fs.readFile(DB_FILE_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to read books from database file:", err);
    return defaultBooks.map((b, i) => normalizeBook(b, i));
  }
}

/**
 * Retrieve a single book by slug.
 */
export async function getBookBySlug(slug) {
  const books = await getBooks();
  return books.find((b) => b.slug === slug || slugify(b.title) === slug) || null;
}

/**
 * Retrieve a single book by ID.
 */
export async function getBookById(id) {
  const books = await getBooks();
  return books.find((b) => String(b.id) === String(id)) || null;
}

/**
 * Saves (creates or updates) a book in the database.
 */
export async function saveBook(bookData) {
  const books = await getBooks();
  const index = books.findIndex((b) => String(b.id) === String(bookData.id));
  
  const normalized = normalizeBook({
    ...bookData,
    updatedAt: new Date().toISOString(),
  });

  if (index >= 0) {
    books[index] = { ...books[index], ...normalized };
  } else {
    // New book
    books.unshift(normalized);
  }

  await fs.writeFile(DB_FILE_PATH, JSON.stringify(books, null, 2), "utf8");
  return normalized;
}

/**
 * Deletes a book by ID.
 */
export async function deleteBook(id) {
  const books = await getBooks();
  const filtered = books.filter((b) => String(b.id) !== String(id));
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(filtered, null, 2), "utf8");
  return true;
}

/**
 * Promotes an upcoming book to a reading or shelf status.
 */
export async function promoteBook(id, newStatus = "to-read") {
  const books = await getBooks();
  const book = books.find((b) => String(b.id) === String(id));
  if (!book) throw new Error("Book not found");
  
  book.status = newStatus;
  book.updatedAt = new Date().toISOString();
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(books, null, 2), "utf8");
  return book;
}

/**
 * Resets the database to the initial seed books.
 */
export async function resetDatabase() {
  const initialList = [
    ...defaultBooks.map((b, i) => normalizeBook(b, i)),
    ...upcomingBooks.map((b, i) => normalizeBook({ ...b, status: "upcoming" }, defaultBooks.length + i))
  ];
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(initialList, null, 2), "utf8");
  return initialList;
}
