import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModernToastProvider } from "./components/customToastProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "GymFreak — Premium Gym & Fitness Products Online",
    template: "%s | GymFreak",
  },
  description:
    "Buy premium gym equipment, supplements, and fitness accessories online at GymFreak. Shop dumbbells, protein powders, mass gainers, belts, and more — trusted by fitness enthusiasts across India.",
  keywords: [
    "GymFreak",
    "Gym Equipment",
    "Fitness Store",
    "Protein Supplements",
    "Dumbbells",
    "Barbells",
    "Gym Wear",
    "Clothes",
    "Workout Accessories",
    "Buy Gym Products Online",
  ],
  authors: [{ name: "GymFreak Team" }],
  creator: "GymFreak",
  publisher: "GymFreak",
  metadataBase: new URL("https://www.gymfreak.store"),
  openGraph: {
    title: "GymFreak — Buy Gym & Fitness Products Online",
    description:
      "Shop high-quality gym equipment, protein supplements, and fitness accessories at unbeatable prices. Get stronger with GymFreak!",
    url: "https://www.gymfreak.store",
    siteName: "GymFreak",
    images: [
      {
        url: "https://www.gymfreak.store/logo.png",
        width: 1200,
        height: 630,
        alt: "GymFreak Store — Premium Gym Products",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://www.gymfreak.store",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "d5cd3910b17e836c",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          id="structured-data-org"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "GymFreak",
            url: "https://www.gymfreak.store",
            logo: "https://www.gymfreak.store/logo.png",
          })}
        </Script>
      </head>

      <body className="antialiased bg-gray-50 text-gray-900">
        <ModernToastProvider>{children}</ModernToastProvider>
      </body>
    </html>
  );
}
