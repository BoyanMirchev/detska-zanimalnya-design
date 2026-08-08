import type { Metadata } from "next"
import Image from "next/image"
import { Heart, Sprout, Shield, Lightbulb, HeartHandshake, Check } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"

export const metadata: Metadata = {
  title: "За Хралупата – ученическа занималня в София",

  description:
    "Научете повече за ученическа занималня Хралупата в София – нашия подход, среда, принципи и начина, по който помагаме на децата да учат и растат уверено.",

  alternates: {
    canonical: "/za-nas",
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "За Хралупата – ученическа занималня в София",
    description:
      "Нашият подход, образователна среда и принципи в ученическа занималня Хралупата.",
    url: "/za-nas",
  },
}

const values = [
  { icon: Heart, title: "Уважение", text: "Отнасяме се към всяко дете като към отделна личност със собствен характер, интереси и темпо." },
  { icon: Shield, title: "Отговорност", text: "Поддържаме ясни правила и учим децата да носят отговорност за действията и задачите си." },
  { icon: Lightbulb, title: "Любопитство", text: "Насърчаваме задаването на въпроси и търсенето на различни решения." },
  { icon: Sprout, title: "Постоянство", text: "Показваме, че добрите резултати идват чрез упражнение, търпение и последователност." },
  { icon: HeartHandshake, title: "Партньорство с родителите", text: "Най-добрите резултати се постигат, когато родители и преподаватели работят в една посока." },
]

const facilities = [
  "Учебна зала",
  "Пространство за творчески занимания",
  "Зона за четене",
  "Място за почивка и свободни игри",
  "Подходящи учебни материали",
  "Образователни и настолни игри",
]

const gallery = [
  { src: "/images/photo-toddlers-banner.png", alt: "Малчугани рисуват пред банера на Хралупата" },
  { src: "/images/photo-classroom-road.png", alt: "Ученици пишат заедно на групови чинове" },
  { src: "/images/photo-green-room.png", alt: "Група деца учат в зелената класна стая" },
  { src: "/images/photo-blue-room.png", alt: "Деца пишат в синята класна стая" },
  { src: "/images/photo-playroom.png", alt: "Зона за игри с настолни и конструктивни игри" },
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
        image="/images/banner-hallway.png"
        imageAlt="Вход към занималня Хралупата с банер"
      />

      {/* Story */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[36px] border-8 border-white soft-shadow">
            <Image
              src="/images/photo-classroom-road.png"
              alt="Ученици пишат заедно на групови чинове в занималнята"
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

      {/* Mission */}
      <section className="px-5 pb-4 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[36px] bg-brand p-8 text-center text-white sm:p-12 lg:p-16">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-white/70">Нашата мисия</p>
          <p className="text-2xl font-extrabold leading-snug text-balance sm:text-3xl">
            Да помагаме на децата да учат с разбиране, да развиват своите способности и да изграждат увереност в
            сигурна и подкрепяща среда.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" eyebrow="Нашите принципи" title="В какво вярваме" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Facilities */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Нашата база" title="Пространства, създадени за спокойно учене." />
            <p className="mt-6 text-lg font-semibold leading-8 text-ink/65">
              Занималнята е обзаведена така, че всяко кътче да има своята роля — за учене, за творчество, за четене и
              за почивка.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {facilities.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-cream p-4">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="font-bold text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[36px] border-8 border-white soft-shadow">
            <Image
              src="/images/photo-playroom.png"
              alt="Уютна зона за игри и почивка в занималня Хралупата"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
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
