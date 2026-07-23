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

const SITE_URL = "https://policywell.github.io";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PolicyWell AI — The AI Operating System for the Insurance Industry",
    template: "%s · PolicyWell AI",
  },
  description:
    "Analyze policies. Recommend actions. Keep humans in control. PolicyWell AI is the AI operating system for the insurance industry.",
  applicationName: "PolicyWell AI",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    title: "PolicyWell",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PolicyWell AI",
    title: "PolicyWell AI — The AI Operating System for the Insurance Industry",
    description:
      "Analyze policies. Recommend actions. Keep humans in control.",
    images: [
      {
        url: OG_IMAGE,
        width: 1024,
        height: 1024,
        alt: "PolicyWell AI — The AI Operating System for the Insurance Industry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PolicyWell AI — The AI Operating System for the Insurance Industry",
    description:
      "Analyze policies. Recommend actions. Keep humans in control.",
    images: [OG_IMAGE],
  },
  manifest: "/site.webmanifest",
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
      <body className="min-h-full flex flex-col font-sans text-[15px] leading-relaxed">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
