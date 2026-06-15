import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grade My Site — Find out why your website isn't getting calls",
  description:
    "Free 30-second website scan for local businesses. See exactly what's stopping visitors from calling you.",
  metadataBase: new URL("https://grademy.site"),
  openGraph: {
    title: "Grade My Site — Find out why your website isn't getting calls",
    description:
      "Free 30-second website scan for local businesses. See exactly what's stopping visitors from calling you.",
    url: "https://grademy.site",
    siteName: "GradeMysite",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grade My Site — Find out why your website isn't getting calls",
    description:
      "Free 30-second website scan for local businesses. See exactly what's stopping visitors from calling you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
