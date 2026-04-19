import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PageScan | Style Extractor",
  description: "Professional style extraction extension for generating DESIGN.md and SKILL.md files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
