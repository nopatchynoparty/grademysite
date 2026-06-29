import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Grade My Site — Free Website Audit for Local Businesses",
  description:
    "Find out why your local business website isn't getting calls. Free 30-second audit checks 22 rules — no account needed.",
  metadataBase: new URL("https://grademy.site"),
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Grade My Site — Free Website Audit for Local Businesses",
    description:
      "Find out why your local business website isn't getting calls. Free 30-second audit checks 22 rules — no account needed.",
    url: "https://grademy.site",
    siteName: "GradeMysite",
    locale: "en_GB",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grade My Site — Free Website Audit for Local Businesses",
    description:
      "Find out why your local business website isn't getting calls. Free 30-second audit checks 22 rules — no account needed.",
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
