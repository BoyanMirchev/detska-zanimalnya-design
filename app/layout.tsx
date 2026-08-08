import type { Metadata, Viewport } from "next"
import "./globals.css"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RegistrationSection } from "@/components/registration-section"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.хралупата.com"),

  title: {
    default: "Ученическа занималня в София | Хралупата",
    template: "%s | Хралупата",
  },

  description:
    "Ученическа занималня в центъра на София за деца от 1. до 7. клас. Учебна подготовка, малки групи, предучилищна и лятна занималня.",

  applicationName: "Хралупата",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "Ученическа занималня в София | Хралупата",
    description:
      "Ученическа занималня в центъра на София за деца от 1. до 7. клас. Учебна подготовка, малки групи и индивидуален подход.",
    url: "/",
  },
}

export const viewport: Viewport = {
  themeColor: "#dd5b26",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg" className="bg-cream" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        {children}
        <RegistrationSection />
        <SiteFooter />
      </body>
    </html>
  )
}