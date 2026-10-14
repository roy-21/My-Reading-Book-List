import { getBooks } from "@/lib/db/books";
import { isAdminAuthenticated } from "@/lib/auth/session";
import ReadingRoomApp from "@/components/ReadingRoomApp";

export const metadata = {
  title: "Sojib's Virtual Library — Curated Literary Archive & Reading Tracker",
  description:
    "An intimate personal library and reading showcase featuring software engineering, cognitive science, philosophy, and classical Bengali literature.",
};

export default async function Page() {
  const books = await getBooks();
  const isAdmin = await isAdminAuthenticated();

  return (
    <main>
      <ReadingRoomApp initialBooks={books} initialIsAdmin={isAdmin} />
    </main>
  );
}
