import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "KnowYourPew | Spiritual Gifts Assessment";
const siteDescription = "Discover your strongest spiritual gifts and how you can serve at Woodridge Baptist Church through a simple, mobile-friendly assessment.";
const siteUrl = "https://knowyourpew.com";

export const viewport: Viewport = {
  themeColor: "#172554",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "KnowYourPew",
  keywords: [
    "spiritual gifts assessment",
    "Woodridge Baptist Church",
    "church assessment",
    "spiritual gifts",
    "KnowYourPew",
  ],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    url: siteUrl,
    siteName: "KnowYourPew",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" }],
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
      <body className="min-h-full bg-slate-50 text-slate-900">
        <ServiceWorkerRegistration />
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-amber-200 bg-white/90 px-4 py-4 text-center text-sm font-medium text-blue-950">
            Woodridge Baptist Church · {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  );
}
