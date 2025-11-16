import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Library MVP",
  description: "A gamified video streaming experience with achievements and XP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}