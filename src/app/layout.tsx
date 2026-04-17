import type { Metadata } from "next";
import { Rubik, Roboto } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  SITE_URL,
  travelAgencyLd,
  websiteLd,
  jsonLdScript,
} from "@/lib/jsonld";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const TITLE_DEFAULT =
  "Shobra Travel Agency | Cultural Historical Boutique Tours";
const DESCRIPTION =
  "Boutique travel agency curating cultural and historical group tours worldwide. Small-group departures, concierge service, and expert itineraries from Short Hills, New Jersey.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: "%s | Shobra Travel Agency",
  },
  description: DESCRIPTION,
  applicationName: "Shobra Travel Agency",
  keywords: [
    "boutique travel agency",
    "cultural tours",
    "historical tours",
    "group travel",
    "small group tours",
    "New Jersey travel agency",
    "Short Hills travel agency",
    "Egypt tours",
    "guided tours",
    "luxury travel",
  ],
  authors: [{ name: "Shobra Travel Agency" }],
  creator: "Shobra Travel Agency",
  publisher: "Shobra Travel Agency",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Shobra Travel Agency",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Shobra Travel Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  other: {
    "websitelaunches-verification": "dd527da1e9f0356cbefda8a7b769a347",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rubik.variable} ${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(travelAgencyLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteLd()) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
