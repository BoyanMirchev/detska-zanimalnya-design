import type { Metadata } from "next"
import { Baloo_2, Nunito } from "next/font/google"
import "./globals.css"

const baloo = Baloo_2({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
})

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ученическа занималня Хралупата | Учене, игра и грижа",
  description:
    "Хралупата е целодневна ученическа занималня за деца от 2 до 7 клас — писане на домашни, засилена математика, английски, БЕЛ, шах и природни науки в топла и сигурна среда.",
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#d15a1f",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg" className={`${baloo.variable} ${nunito.variable} bg-background`}>
      <body>{children}</body>
    </html>
  )
}
