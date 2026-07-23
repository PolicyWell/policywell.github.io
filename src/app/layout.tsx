import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://policywell.ai";
const OG_IMAGE = `${SITE_URL}/og-image.png`;
/** Bump to force browsers/CDNs to pick up refreshed shield favicons. */
const ICON_V = "20260723b";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PolicyWell — The Agentic AI Layer for the Insurance Industry",
    template: "%s · PolicyWell",
  },
  description:
    "Analyze Illustrations & Policies. Recommendation Actions. Aid Human Control.",
  applicationName: "PolicyWell",
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_V}`, sizes: "any" },
      {
        url: `/favicon-16.png?v=${ICON_V}`,
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: `/favicon-32.png?v=${ICON_V}`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: `/icon-192.png?v=${ICON_V}`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: `/icon-512.png?v=${ICON_V}`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: `/apple-touch-icon.png?v=${ICON_V}`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: [`/favicon.ico?v=${ICON_V}`],
  },
  appleWebApp: {
    capable: true,
    title: "PolicyWell",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PolicyWell",
    title: "PolicyWell — The Agentic AI Layer for the Insurance Industry",
    description:
      "Analyze Illustrations & Policies. Recommendation Actions. Aid Human Control.",
    images: [
      {
        url: OG_IMAGE,
        width: 1024,
        height: 1024,
        alt: "PolicyWell — The Agentic AI Layer for the Insurance Industry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PolicyWell — The Agentic AI Layer for the Insurance Industry",
    description:
      "Analyze Illustrations & Policies. Recommendation Actions. Aid Human Control.",
    images: [OG_IMAGE],
  },
  verification: {
    google: "YWZ2M2Q486Ke411V0zJ6FkhO6ykrmZN9WYEexjrutF4",
  },
  manifest: `/site.webmanifest?v=${ICON_V}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        {/* Explicit tags so every static route (including 404) gets the shield mark. */}
        <meta
          name="google-site-verification"
          content="YWZ2M2Q486Ke411V0zJ6FkhO6ykrmZN9WYEexjrutF4"
        />
        <link rel="icon" href={`/favicon.ico?v=${ICON_V}`} sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`/favicon-16.png?v=${ICON_V}`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`/favicon-32.png?v=${ICON_V}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`/apple-touch-icon.png?v=${ICON_V}`}
        />
        <link rel="manifest" href={`/site.webmanifest?v=${ICON_V}`} />
      </head>
      <body className="min-h-full flex flex-col font-sans text-[15px] leading-relaxed">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
