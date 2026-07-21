import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Малки откриватели | Детска занималня",
  description: "Модерен дизайн за детска занималня, създаден с Next.js и Tailwind CSS.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  )
}
