import type { Metadata } from "next"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RegistrationSection } from "@/components/registration-section"

export const metadata: Metadata = {
  title: "Ученическа занималня Хралупата | Учене, игра и грижа",
  description:
    "Хралупата – целодневна ученическа занималня за деца от 1. до 7. клас, предучилищна група и лятна занималня. Малки групи, топла грижа и индивидуален подход.",
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#dd5b26",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
