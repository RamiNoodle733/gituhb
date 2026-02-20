import type { Metadata } from "next"
import {
  Inter,
  Source_Sans_3,
  JetBrains_Mono,
  League_Gothic,
} from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const leagueGothic = League_Gothic({
  subsets: ["latin"],
  variable: "--font-league-gothic",
})

export const metadata: Metadata = {
  title: "GitUHb - UH Student Project Collaboration",
  description:
    "Find your team. Ship your project. A collaboration platform for University of Houston students.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceSans.variable} ${jetbrainsMono.variable} ${leagueGothic.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
