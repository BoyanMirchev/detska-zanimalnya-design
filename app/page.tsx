import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Clock3,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MessagesSquare,
  Phone,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  UsersRound,
} from "lucide-react"
import { ContactDialog } from "@/components/contact-dialog"
import { BottomCTA, SectionHeading } from "@/components/sections"
import { Reveal } from "@/components/reveal"
import { contact } from "@/lib/nav"

const programs = [
  {
    icon: BookOpen,
    title: "Учебна занималня",
    age: "1.–7. клас",
    href: "/zanimalnya/uchebna",
    text: "Домашни, подготовка за училище, засилена математика и БЕЛ в спокойни малки групи.",
  },
  {
    icon: GraduationCap,
    title: "Предучилищна група",
    age: "5–7 години",
    href: "/zanimalnya/preduchilishtna",
    text: "Целенасочена подготовка за първи клас с игри, четене, писане и много увереност.",
  },
  {
    icon: Sun,
    title: "Лятна занималня",
    age: "5–12 години",
    href: "/zanimalnya/liatna",
    text: "Тематични седмици, игри навън, спорт и много нови приятелства през ваканцията.",
  },
]

const benefits = [
  { icon: UsersRound, title: "Малки групи", text: "Повече лично внимание за всяко дете." },
  { icon: ShieldCheck, title: "Сигурна среда", text: "Уютни, подредени и безопасни пространства." },
  { icon: HeartHandshake, title: "Грижа и доверие", text: "Спокойна и честна комуникация с родителите." },
]

const reasons = [
  {
    icon: Target,
    title: "Индивидуално внимание",
    text: "Всяко дете учи с различно темпо. Наблюдаваме напредъка му и адаптираме работата спрямо конкретните му нужди.",
  },
  {
    icon: BookOpen,
    title: "Подкрепа с учебния материал",
    text: "Помагаме при домашните, преговаряме трудните теми и работим за преодоляване на натрупаните пропуски.",
  },
  {
    icon: UsersRound,
    title: "Малки групи",
    text: "Ограниченият брой деца носи по-добра концентрация, повече спокойствие и реално внимание от преподавателя.",
  },
  {
    icon: Lightbulb,
    title: "Учене чрез преживяване",
    text: "Практически задачи, образователни игри, експерименти и проекти правят знанията по-разбираеми.",
  },
  {
    icon: MessagesSquare,
    title: "Обратна връзка към родителите",
    text: "Поддържаме комуникация и информираме за напредъка, трудностите и поведението на детето.",
  },
  {
    icon: ShieldCheck,
    title: "Безопасна и приветлива среда",
    text: "Пространство, в което децата се чувстват спокойни, приети и свободни да задават въпроси.",
  },
]

const skills = [
  "Логическо мислене",
  "Самостоятелност",
  "Концентрация",
  "Креативност",
  "Работа в екип",
  "Увереност при представяне на идеи",
  "Решаване на проблеми",
]

const gallery = [
  { src: "/images/photo-classroom-road.png", alt: "Ученици пишат заедно на групови чинове", cls: "md:col-span-2 md:row-span-2" },
  { src: "/images/photo-playroom.png", alt: "Кът за игра с настолни и конструктивни игри", cls: "" },
  { src: "/images/photo-toddlers-banner.png", alt: "Малчугани рисуват пред банера на Хралупата", cls: "" },
  { src: "/images/photo-green-room.png", alt: "Група деца учат в зелената класна стая", cls: "md:col-span-2" },
]

function Hero() {
  return (
    <section className="noise relative px-5 pb-16 pt-32 sm:px-8 lg:pt-40">
      <div className="absolute -left-28 top-40 h-72 w-72 rounded-full bg-sun/20 blur-3xl" />
      <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-paper/80 px-4 py-2 text-sm font-extrabold text-brand-dark shadow-sm">
            <Star className="h-4 w-4 fill-sun text-sun" />
            Място за любопитни малки умове
          </div>
          <h1 className="max-w-3xl text-[3rem] font-extrabold leading-[0.94] tracking-[-0.03em] text-ink sm:text-[4.5rem] lg:text-[5.5rem]">
            Всеки ден е ново
            <span className="relative ml-3 inline-block text-brand">
              приключение.
              <svg className="absolute -bottom-9 left-0 w-full" viewBox="0 0 330 22" fill="none" aria-hidden="true">
                <path d="M4 14C78 2 221 2 326 13" stroke="#F4B63F" strokeWidth="9" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg font-semibold leading-8 text-ink/65 sm:text-xl">
            Ученическа занималня „Хралупата“ – мястото, където ученето, играта и творчеството се срещат в спокойна и
            вдъхновяваща среда. Работим целогодишно от {contact.hours} ч.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={contact.phonePrimaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              <Phone className="h-5 w-5" />
              {contact.phonePrimary}
            </a>
            <ContactDialog />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-bold text-ink/65">
            {["От 1. до 7. клас", "Малки групи", "Опитни педагози"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[40px] border-[10px] border-white bg-brand-soft soft-shadow">
            <Image
              src="/images/banner-hallway.png"
              alt="Входът на занималня Хралупата с оранжев банер и бухалче в дървесна къщичка"
              fill
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-cover"
              priority
            />
          </div>
          <div className="card-shadow absolute -left-3 top-[18%] rounded-[22px] bg-white px-4 py-3 sm:-left-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
                <HeartHandshake className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-ink/55">Грижа всеки ден</p>
                <p className="font-extrabold text-ink">Малки групи</p>
              </div>
            </div>
          </div>
          <div className="card-shadow absolute -right-3 bottom-[6%] rounded-[22px] bg-white px-4 py-3 sm:-right-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-leaf/15 text-leaf">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-ink/55">Работно време</p>
                <p className="font-extrabold text-ink">{contact.hours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />

      <section className="overflow-hidden border-y border-brand/10 bg-ink py-4 text-white">
        <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap pr-10">
          {[...Array(2)].flatMap((_, loop) =>
            ["Учим с желание", "Творим смело", "Играем заедно", "Растем уверено"].map((text) => (
              <div key={`${loop}-${text}`} className="flex items-center gap-10 text-sm font-black uppercase tracking-[0.22em]">
                <span>{text}</span>
                <Sparkles className="h-4 w-4 text-sun" />
              </div>
            )),
          )}
        </div>
      </section>

      {/* Programs */}
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <SectionHeading eyebrow="Нашите програми" title="Различни занимания. Една обща цел." />
            <p className="max-w-2xl text-lg font-semibold leading-8 text-ink/65 lg:justify-self-end">
              Всяка програма съчетава полезна структура с достатъчно свобода за въображение, движение и приятелства.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {programs.map((program, index) => {
              const Icon = program.icon
              return (
                <Reveal as="div" key={program.title} delay={index * 90}>
                <Link
                  href={program.href}
                  className="group relative block overflow-hidden rounded-[34px] border border-brand/12 bg-paper p-7 transition duration-300 hover:-translate-y-1 hover:border-brand/30 sm:p-9"
                >
                  <span className="absolute right-7 top-7 text-6xl font-black text-brand/8">0{index + 1}</span>
                  <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-brand-soft text-brand-dark transition duration-300 group-hover:-rotate-6 group-hover:scale-105">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-sm font-black uppercase tracking-[0.16em] text-ink/45">{program.age}</span>
                      <h3 className="mt-2 text-3xl font-extrabold text-ink">{program.title}</h3>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-brand/20 bg-cream transition group-hover:bg-brand group-hover:text-white">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 max-w-xl font-semibold leading-7 text-ink/65">{program.text}</p>
                </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative bg-paper px-5 py-24 sm:px-8 lg:py-32">
        <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[40px] border-[10px] border-cream soft-shadow">
              <Image
                src="/images/photo-blue-room.png"
                alt="Деца пишат заедно в синята класна стая на Хралупата"
                fill
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover"
              />
            </div>
            <div className="card-shadow absolute -bottom-6 -right-4 max-w-[220px] rounded-[26px] bg-brand p-5 text-white sm:-right-6">
              <p className="text-4xl font-black">7:30</p>
              <p className="mt-1 text-sm font-bold text-white/85">– 19:00 ч. всеки делничен ден</p>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Добре дошли в Хралупата" title="Повече от обикновена занималня." />
            <p className="mt-7 text-lg font-semibold leading-8 text-ink/65">
              „Хралупата“ е образователен център за деца, в който съчетаваме подготовката за училище с практически
              занимания, творчество, движение и игри. Целта ни не е децата просто да приключат домашните си – искаме те
              да разбират наученото, да задават въпроси и да откриват решения.
            </p>
            <p className="mt-5 text-lg font-semibold leading-8 text-ink/65">
              Работим в малки групи, за да отделяме внимание на всяко дете, и съобразяваме задачите с неговата възраст,
              училищна програма, темпо на работа и индивидуални потребности.
            </p>
            <div className="mt-9 grid gap-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div key={benefit.title} className="flex gap-4 rounded-[24px] border border-brand/10 bg-cream p-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white text-brand-dark shadow-sm">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-extrabold text-ink">{benefit.title}</h3>
                      <p className="mt-1 font-semibold text-ink/60">{benefit.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link
              href="/za-nas"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              Запознай се с нас
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why parents choose us */}
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" eyebrow="Защо родителите избират нас" title="Спокойствие за детето. Доверие за родителя." />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => {
              const Icon = reason.icon
              return (
                <Reveal as="article" key={reason.title} delay={index * 80} className="group rounded-[30px] border border-brand/12 bg-paper p-7 transition duration-300 hover:-translate-y-1 hover:border-brand/30">
                  <span className="grid h-14 w-14 place-items-center rounded-[20px] bg-brand-soft text-brand-dark transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-2xl font-extrabold text-ink">{reason.title}</h3>
                  <p className="mt-3 font-semibold leading-7 text-ink/65">{reason.text}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Learn, create, discover */}
      <section className="bg-paper px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Учим, създаваме и откриваме" title="Любопитството е в основата на доброто образование." />
            <p className="mt-7 text-lg font-semibold leading-8 text-ink/65">
              Насърчаваме децата да изследват, да експериментират и да търсят различни решения. Чрез занимания по наука,
              технологии, изкуство, математика и конструиране те развиват уменията, които ще им бъдат полезни цял живот.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-cream px-4 py-2 text-sm font-bold text-brand-dark">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Brain, label: "Логика" },
              { icon: Puzzle, label: "Конструиране" },
              { icon: Lightbulb, label: "Идеи" },
              { icon: Sparkles, label: "Творчество" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="hover-wiggle flex flex-col items-center justify-center gap-3 rounded-[28px] border border-brand/12 bg-cream p-8 text-center transition hover:-translate-y-1 hover:border-brand/30">
                  <span className="grid h-16 w-16 place-items-center rounded-[22px] bg-white text-brand-dark shadow-sm">
                    <Icon className="h-8 w-8" />
                  </span>
                  <span className="text-lg font-extrabold text-ink">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Daily rhythm */}
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl rounded-[42px] bg-ink p-7 text-white sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-sun">Един спокоен ден</p>
              <h2 className="text-4xl font-extrabold leading-none sm:text-5xl">Ритъм, който дава сигурност.</h2>
              <p className="mt-6 max-w-lg text-lg font-semibold leading-8 text-white/70">
                Децата знаят какво следва, но никой ден не е скучен. Балансираме учебно време, движение, творчество и
                почивка.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                ["07:30", "Посрещане и свободна игра"],
                ["09:00", "Учебни задачи и подготовка"],
                ["12:30", "Обяд и спокойна почивка"],
                ["15:00", "Творческо ателие или спорт"],
                ["17:00", "Игри, четене и изпращане"],
              ].map(([time, title], index) => (
                <div key={time} className="group flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 sm:p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[17px] bg-brand font-black text-white">
                    {index + 1}
                  </span>
                  <span className="w-16 shrink-0 text-sm font-black text-sun">{time}</span>
                  <span className="font-extrabold text-white">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-paper px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Галерия" title="Малки моменти. Големи усмивки." />
            <Link href="/za-nas" className="inline-flex items-center gap-2 font-extrabold text-brand-dark hover:text-brand">
              Виж повече
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-12 grid auto-rows-[220px] gap-5 md:grid-cols-4">
            {gallery.map((item) => (
              <div key={item.src} className={`${item.cls} group relative overflow-hidden rounded-[30px] border-4 border-cream`}>
                <Image src={item.src || "/placeholder.svg"} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" eyebrow="Думи от родителите" title="Доверието не се рекламира. Печели се." />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              ["Мария П.", "Майка на Алекс", "Детето ми тръгва с желание и се прибира спокойно. За мен това е най-важният знак, че сме избрали правилното място."],
              ["Николай К.", "Баща на Ема", "Харесва ми, че има структура, но децата не са натоварени излишно. Комуникацията с екипа е ясна и навременна."],
              ["Елена Д.", "Майка на Мартин", "Само за няколко седмици видяхме повече увереност и самостоятелност. Атмосферата е топла, но професионална."],
            ].map(([name, role, quote], index) => (
              <article key={name} className={`rounded-[32px] border border-brand/10 p-7 ${index === 1 ? "bg-ink text-white" : "bg-paper text-ink"}`}>
                <div className="flex gap-1 text-sun">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className={`mt-7 text-lg font-bold leading-8 ${index === 1 ? "text-white/85" : "text-ink/70"}`}>
                  {"“"}
                  {quote}
                  {"”"}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span className={`grid h-12 w-12 place-items-center rounded-full font-black ${index === 1 ? "bg-sun text-ink" : "bg-brand-soft text-brand-dark"}`}>
                    {name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-extrabold">{name}</p>
                    <p className={`text-sm font-bold ${index === 1 ? "text-white/55" : "text-ink/45"}`}>{role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
