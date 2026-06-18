import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
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
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grade My Site — Find out why your website isn't getting calls",
    description:
      "Free 30-second website scan for local businesses. See exactly what's stopping visitors from calling you.",
    images: ["/og.png"],
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
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
