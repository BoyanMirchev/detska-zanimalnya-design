import type { Metadata } from "next"
import Image from "next/image"
import { Heart, Sprout, Users, Shield } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"

export const metadata: Metadata = {
  title: "За нас | Хралупата",
  description:
    "Занималня Хралупата - топло и уютно място, където децата учат, играят и растат с грижа и индивидуален подход.",
}

const values = [
  { icon: Heart, title: "С грижа", text: "Отнасяме се към всяко дете с внимание, търпение и обич." },
  { icon: Sprout, title: "С развитие", text: "Подкрепяме любопитството и помагаме на децата да растат." },
  { icon: Users, title: "В общност", text: "Изграждаме приятелства и усещане за принадлежност." },
  { icon: Shield, title: "В безопасност", text: "Сигурна, чиста и приветлива среда през целия ден." },
]

const gallery = [
  { src: "/images/room-green-whiteboard.png", alt: "Зелена класна стая с бяла дъска" },
  { src: "/images/room-blue-flowers.png", alt: "Синя стая с цветно килимче" },
  { src: "/images/foam-alphabet.png", alt: "Стена с азбука от гумени плочки" },
  { src: "/images/room-mess.png", alt: "Стая с постери на азбука" },
  { src: "/images/hall-sofa.png", alt: "Коридор със зелен диван" },
  { src: "/images/banner-owl-closeup.png", alt: "Банер с логото на Хралупата" },
]

export default function ZaNasPage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="За нас"
        title="Мястото, наречено"
        highlight="Хралупата"
        text="Хралупата е ученическа занималня, създадена като топло и уютно гнездо - място, където децата се чувстват спокойни, учат с желание и растат заобиколени от грижа."
        heroImage="/images/banner-hallway.png"
        heroImageAlt="Вход към занималня Хралупата с банер"
      />

      {/* Story */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[36px] border-8 border-white soft-shadow">
            <Image
              src="/images/class-green-lego.png"
              alt="Класна стая с цветни столове и килимче"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading eyebrow="Нашата история" title="Гнездо, в което е добре да пораснеш." />
            <div className="mt-6 grid gap-4 text-lg font-semibold leading-8 text-ink/65">
              <p>
                Името Хралупата не е случайно - хралупата е дом, скрит и топъл, в който малките се чувстват
                защитени, докато набират сили за големия свят.
              </p>
              <p>
                Всеки ден при нас е изпълнен с учене, игра и творчество. Стаите ни са цветни и подредени така, че
                децата да имат пространство да мислят, да се движат и да мечтаят.
              </p>
              <p>
                Работим целогодишно, включително през ваканциите, и предлагаме програми за деца от 2 до 7 клас, с
                индивидуален подход към всяко дете.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" eyebrow="Нашите ценности" title="В какво вярваме" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.title} className="rounded-[28px] border border-brand/10 bg-cream p-7 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-ink">{v.title}</h3>
                  <p className="mt-2 font-semibold leading-7 text-ink/60">{v.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Нашите пространства" title="Разгледайте Хралупата отвътре." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-[26px] border-4 border-white">
                <Image
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
