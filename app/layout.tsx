import type { Metadata } from "next";
import { Albert_Sans, Inconsolata } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Kickers, footer column headings and the footer legal row are set in
// Inconsolata in the design — the monospace tracking is what makes those
// all-caps labels read as labels rather than as small headings.
const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "DishBooks | Restaurant Accounting Software",
  description:
    "AI-powered accounting software, built for restaurants. Know your numbers, control your costs, and grow with confidence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${inconsolata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-1 text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
