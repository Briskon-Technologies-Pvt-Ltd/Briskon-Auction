"use client";

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"
import { usePathname } from "next/navigation"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {!isLoginPage && <Navigation />}
      <main className={isLoginPage ? "" : "flex-1"}>{children}</main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Briskon Auctions - Premium Online Auction Platform</title>
        <meta name="description" content="Experience the ultimate auction platform with live bidding, VIP access, and premium auction houses. Join Briskon for exclusive auctions and unparalleled service." />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="briskon-theme"
        >
          <AuthProvider>
            <RootLayoutContent>{children}</RootLayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
