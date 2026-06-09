import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PlayFit Admin",
  description: "Learning Management System by PlayFit - Admin Portal",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PlayFit Admin',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '1254x1254', type: 'image/png' },
      { url: '/images/playfit-logo.jpg', sizes: '1254x1254', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#1E88E5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-[#F5F5F5]">
        {children}
      </body>
    </html>
  );
}
