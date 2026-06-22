import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Centrum Gym – Shape Your Body",
  description:
    "Centrum Gym – Train hard, push limits, conquer goals. Expert coaches, modern equipment, and personalized fitness programs in Jaipur, Rajasthan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable}`}>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
