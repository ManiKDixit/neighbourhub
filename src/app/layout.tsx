
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NeighbourHub - Your AI Community Assistant",
  description: "Discover local events, businesses, and community news with AI-powered assistance. Get real-time information about your neighbourhood.",
  keywords: ["neighbourhood", "community", "local", "events", "AI assistant"],
  authors: [{ name: "NeighbourHub" }],
  openGraph: {
    title: "NeighbourHub",
    description: "Your AI-powered community assistant",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark bg-slate-950 text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}