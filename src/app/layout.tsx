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

const siteTitle = "KnowYourPew | Spiritual Gifts Assessment";
const siteDescription = "A mobile-friendly spiritual gifts assessment for Woodridge Baptist Church. Discover your strongest spiritual gifts and how you can serve.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: "KnowYourPew",
  keywords: [
    "spiritual gifts assessment",
    "Woodridge Baptist Church",
    "church assessment",
    "spiritual gifts",
  ],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
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
      { url: "/favicon.ico" },
    ],
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
