import { NextResponse } from "next/server";
import { getBooks } from "@/lib/db/books";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const books = await getBooks();

  if (format === "csv") {
    // Generate CSV
    const headers = ["Title", "Author", "Genre", "Status", "Rating", "StartMonth", "StartYear", "Takeaway", "Review"];
    const rows = books.map((b) => [
      `"${(b.title || "").replace(/"/g, '""')}"`,
      `"${(b.author || "").replace(/"/g, '""')}"`,
      `"${(b.genre || "").replace(/"/g, '""')}"`,
      `"${(b.status || "").replace(/"/g, '""')}"`,
      b.rating || "",
      `"${b.startMonth || ""}"`,
      b.startYear || "",
      `"${(b.takeaway || "").replace(/"/g, '""')}"`,
      `"${(b.review || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="sojib_reading_list.csv"',
      },
    });
  }

  // Default JSON export
  return NextResponse.json(books, {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="sojib_reading_list.json"',
    },
  });
}
