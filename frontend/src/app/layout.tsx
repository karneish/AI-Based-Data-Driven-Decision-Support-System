import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DSS-MIP | AI Data-Driven Decision Support System",
    template: "%s | DSS-MIP",
  },
  description:
    "A free AI-powered student performance decision support system. Predict success probability, classify risk, simulate what-if scenarios and compare five machine learning models.",
  keywords: [
    "machine learning",
    "student performance",
    "decision support",
    "what-if simulator",
    "risk analysis",
  ],
  authors: [{ name: "Karneish" }],
  openGraph: {
    title: "DSS-MIP | AI Data-Driven Decision Support System",
    description:
      "Predict, simulate and improve student outcomes with an ensemble of five machine learning models — 100% free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
