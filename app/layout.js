import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "My Reading List — A Curated Book Collection",
  description:
    "A personal portfolio showcasing my reading journey — from data science and technology to philosophy and fiction. Explore my curated book collection with analytics and insights.",
  keywords: ["reading list", "books", "data science", "portfolio", "book reviews"],
  authors: [{ name: "My Reading List" }],
  openGraph: {
    title: "My Reading List — A Curated Book Collection",
    description: "Explore my curated book collection with interactive analytics and insights.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.className} dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0c0e14" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
