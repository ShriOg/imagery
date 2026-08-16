import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imagery — Luxury Studio Image & Design Editor",
  description: "High-precision manual design and image studio with tactile luxury UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-workspace text-zinc-100 antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
