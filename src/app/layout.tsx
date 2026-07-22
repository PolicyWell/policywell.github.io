import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
    default: "PolicyWell — The Agentic Intelligence Layer for Insurance",
    template: "%s · PolicyWell",
  },
  description:
    "Building the Intelligence Layer for Insurance. Context-first AI for policyholders, advisors, IMOs, and carriers.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PolicyWell",
    title: "PolicyWell — The Agentic Intelligence Layer for Insurance",
    description:
      "Building the Intelligence Layer for Insurance. Context-first AI for policyholders, advisors, IMOs, and carriers.",
    images: [
      {
        url: OG_IMAGE,
        width: 1024,
        height: 1024,
        alt: "PolicyWell — The Agentic Intelligence Layer for Insurance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PolicyWell — The Agentic Intelligence Layer for Insurance",
    description:
      "Building the Intelligence Layer for Insurance. Context-first AI for policyholders, advisors, IMOs, and carriers.",
    images: [OG_IMAGE],
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
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-[15px] leading-relaxed">
        {children}
      </body>
    </html>
  );
}
