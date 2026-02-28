import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import { LanguageProvider } from "@/lib/language-context";
import { SettingsProvider } from "@/lib/settings-context";
import { DataProvider } from "@/lib/data-context";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RunItSimply — Home Service Business Manager",
  description:
    "Scheduling, team management, client tracking, and payments for home service businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${sora.variable}`}>
      <body className="bg-[#FAFBFD] font-heading text-[#1A1D26] antialiased">
        <LanguageProvider>
          <AuthProvider>
            <SettingsProvider>
              <DataProvider>{children}</DataProvider>
            </SettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
