import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Color Your World - Digital Coloring Book",
  description: "A beautiful digital coloring book app. Choose from sample pages or upload your own photos to transform into line art. Color with ease and export as PDF.",
  keywords: ["coloring book", "digital art", "kids", "creative", "line art", "pdf export"],
  authors: [{ name: "Coloring Book App" }],
  openGraph: {
    title: "Color Your World - Digital Coloring Book",
    description: "Transform photos into coloring pages and create beautiful artwork",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
