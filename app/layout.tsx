import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Chandle — Guess the Song",
  description:
    "A daily game. A famous song title, translated into bureaucratic nonsense. Can you guess the original?",
  openGraph: {
    title: "Chandle",
    description:
      "Guess the song from its formal translation. New puzzle every day.",
    url: "https://chandle.app",
    siteName: "Chandle",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Chandle — Guess the Song",
    description: "Daily song title game. Formal language. Real songs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
