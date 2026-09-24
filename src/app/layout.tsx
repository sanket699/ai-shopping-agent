import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import profileAvatar from "./profile_avatar.svg";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const profileAvatarUrl =
  typeof profileAvatar === "string" ? profileAvatar : profileAvatar.src;

export const metadata: Metadata = {
  title: "SpecPilot — AI Phone Recommendations",
  description: "AI-powered phone search, ranking, and recommendations.",
  icons: {
    icon: profileAvatarUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
