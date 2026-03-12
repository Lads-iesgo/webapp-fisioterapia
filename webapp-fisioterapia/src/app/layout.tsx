import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NotificationProvider } from "./components/Notification";
import { CookiesProvider } from "next-client-cookies/server"; // Corrigir importação
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clínica de Fisioterapia",
  description: "Sistema de gerenciamento agenda para clínica de fisioterapia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookiesProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
