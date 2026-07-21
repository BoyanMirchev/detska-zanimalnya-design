"use client"

import { useState } from "react"
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  Clock3,
  HeartHandshake,
  Menu,
  MessageCircleMore,
  Music2,
  Paintbrush,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react"

const navItems = [
  { label: "Начало", href: "#nachalo" },
  { label: "Програми", href: "#programi" },
  { label: "За нас", href: "#za-nas" },
  { label: "Галерия", href: "#galeria" },
  { label: "Контакти", href: "#kontakti" },
]

const programs = [
  {
    icon: BookOpen,
    title: "Учебна занималня",
    age: "1.–4. клас",
    text: "Домашни, подготовка за училище и време за спокойна игра в малки групи.",
    tone: "bg-[#E8F7F2]",
    iconTone: "bg-[#9ED9CA]",
  },
  {
    icon: Paintbrush,
    title: "Творческа академия",
    age: "5–10 години",
    text: "Рисуване, моделиране, приложни изкуства и проекти, които развиват въображението.",
    tone: "bg-[#FFF0E5]",
    iconTone: "bg-[#FFB37B]",
  },
  {
    icon: BrainCircuit,
    title: "Логика и открития",
    age: "6–12 години",
    text: "Забавни STEM експерименти, логически задачи и учене чрез действие.",
    tone: "bg-[#F1ECFB]",
    iconTone: "bg-[#C9B8EA]",
  },
  {
    icon: Music2,
    title: "Лятна занималня",
    age: "5–12 години",
    text: "Тематични седмици, приключения навън, спорт, музика и много нови приятелства.",
    tone: "bg-[#FDEBE8]",
    iconTone: "bg-[#F59A8F]",
  },
]

const benefits = [
  { icon: UsersRound, title: "Малки групи", text: "Повече лично внимание за всяко дете." },
  { icon: ShieldCheck, title: "Сигурна среда", text: "Организирани пространства и ясни правила." },
  { icon: HeartHandshake, title: "Грижа и доверие", text: "Спокойна комуникация с родителите." },
]

const gallery = [
  {
    title: "Творим",
    className: "md:col-span-2 md:row-span-2 bg-[#FFD4B4]",
    art: "art-one",
  },
  {
    title: "Откриваме",
    className: "bg-[#CBECE4]",
    art: "art-two",
  },
  {
    title: "Играем",
    className: "bg-[#DCD1F1]",
    art: "art-three",
  },
  {
    title: "Учимся заедно",
    className: "md:col-span-2 bg-[#F7C5BE]",
    art: "art-four",
  },
]

function Logo() {
  return (
    <a href="#nachalo" className="group flex items-center gap-3" aria-label="Малки откриватели - начало">
      <span className="relative grid h-12 w-12 place-items-center rounded-[18px] bg-[#17324D] text-white transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <Sparkles className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#FFB37B]" />
      </span>
      <span className="leading-none">
        <span className="brand-font block text-[1.35rem] font-extrabold tracking-tight text-[#17324D]">Малки</span>
        <span className="block text-xs font-extrabold uppercase tracking-[0.18em] text-[#3E8F82]">откриватели</span>
      </span>
    </a>
  )
}

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[24px] border border-white/70 bg-[#FFF9EF]/90 px-4 py-3 shadow-[0_12px_40px_rgba(23,50,77,0.08)] backdrop-blur-xl sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Основна навигация">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-extrabold text-[#17324D]/75 transition hover:text-[#3E8F82]">
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#kontakti" className="hidden items-center gap-2 rounded-full bg-[#17324D] px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#244766] lg:flex">
          Запиши посещение
          <ArrowRight className="h-4 w-4" />
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-[#17324D] text-white lg:hidden"
          aria-label={open ? "Затвори менюто" : "Отвори менюто"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-7xl rounded-[24px] border border-white/70 bg-white p-4 shadow-2xl lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 font-extrabold text-[#17324D] hover:bg-[#E8F7F2]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#kontakti" onClick={() => setOpen(false)} className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[#17324D] px-5 py-3 font-extrabold text-white">
            Запиши посещение
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </header>
  )
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[5/6] w-full max-w-[540px]">
      <div className="absolute inset-x-[7%] bottom-[2%] top-[8%] rotate-2 rounded-[42%_58%_45%_55%/48%_42%_58%_52%] bg-[#9ED9CA]" />
      <div className="absolute left-[1%] top-[4%] h-20 w-20 rounded-[36%_64%_51%_49%/51%_47%_53%_49%] bg-[#FFB37B] sm:h-28 sm:w-28" />
      <div className="absolute right-[1%] top-[18%] h-14 w-14 rounded-full bg-[#C9B8EA] sm:h-20 sm:w-20" />
      <div className="absolute bottom-[9%] right-[2%] h-20 w-20 rotate-12 rounded-[28px] bg-[#F2776B] sm:h-28 sm:w-28" />

      <div className="soft-shadow absolute inset-x-[15%] bottom-[10%] top-[14%] overflow-hidden rounded-[160px_160px_48px_48px] border-[8px] border-white bg-[#FFE2C9]">
        <div className="absolute inset-x-0 bottom-0 h-[36%] bg-[#F7C68E]" />
        <div className="absolute left-[12%] top-[10%] h-[15%] w-[24%] rotate-[-7deg] rounded-[18px] bg-white/80" />
        <div className="absolute right-[10%] top-[12%] h-[18%] w-[26%] rotate-[8deg] rounded-[18px] bg-[#C9B8EA]/80" />
        <div className="absolute left-[12%] top-[34%] h-[10%] w-[16%] rounded-full bg-[#F2776B]" />
        <div className="absolute right-[13%] top-[36%] h-[10%] w-[16%] rounded-full bg-[#3E8F82]" />

        <div className="absolute bottom-[14%] left-1/2 h-[46%] w-[44%] -translate-x-1/2 rounded-[46%_54%_42%_58%/48%_45%_55%_52%] bg-[#17324D]">
          <div className="absolute left-1/2 top-[-27%] h-[56%] w-[72%] -translate-x-1/2 rounded-full bg-[#E9A978]">
            <div className="absolute left-[16%] top-[42%] h-2 w-2 rounded-full bg-[#17324D] sm:h-3 sm:w-3" />
            <div className="absolute right-[16%] top-[42%] h-2 w-2 rounded-full bg-[#17324D] sm:h-3 sm:w-3" />
            <div className="absolute left-1/2 top-[62%] h-[7%] w-[26%] -translate-x-1/2 rounded-b-full border-b-[3px] border-[#B85D56]" />
            <div className="absolute -left-[7%] -top-[5%] h-[48%] w-[114%] rounded-[50%_50%_44%_56%/66%_66%_34%_34%] bg-[#68452E]" />
          </div>
          <div className="absolute left-[8%] top-[14%] h-[18%] w-[28%] -rotate-[28deg] rounded-full bg-[#E9A978]" />
          <div className="absolute right-[8%] top-[14%] h-[18%] w-[28%] rotate-[28deg] rounded-full bg-[#E9A978]" />
          <div className="absolute bottom-[-5%] left-[12%] h-[34%] w-[30%] rounded-[20px] bg-[#FFB37B]" />
          <div className="absolute bottom-[-5%] right-[12%] h-[34%] w-[30%] rounded-[20px] bg-[#FFB37B]" />
        </div>

        <div className="absolute bottom-[19%] left-[8%] rotate-[-12deg] rounded-[14px] bg-white px-4 py-3 shadow-lg">
          <div className="flex gap-1">
            <span className="h-3 w-3 rounded-full bg-[#F2776B]" />
            <span className="h-3 w-3 rounded-full bg-[#FFB37B]" />
            <span className="h-3 w-3 rounded-full bg-[#9ED9CA]" />
          </div>
        </div>
      </div>

      <div className="card-shadow absolute left-0 top-[22%] rounded-[22px] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FFF0E5] text-[#F2776B]">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold text-[#17324D]/55">Грижа всеки ден</p>
            <p className="font-extrabold text-[#17324D]">Малки групи</p>
          </div>
        </div>
      </div>

      <div className="card-shadow absolute bottom-[4%] right-0 rounded-[22px] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#E8F7F2] text-[#3E8F82]">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold text-[#17324D]/55">Работно време</p>
            <p className="font-extrabold text-[#17324D]">07:30 – 19:00</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Header />

      <section id="nachalo" className="noise relative min-h-screen px-5 pb-20 pt-36 sm:px-8 lg:pt-40">
        <div className="absolute -left-28 top-40 h-72 w-72 rounded-full bg-[#C9B8EA]/25 blur-3xl" />
        <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-[#FFB37B]/25 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#17324D]/10 bg-white/80 px-4 py-2 text-sm font-extrabold text-[#3E8F82] shadow-sm">
              <Star className="h-4 w-4 fill-[#FFB37B] text-[#FFB37B]" />
              Място за любопитни малки умове
            </div>

            <h1 className="max-w-3xl text-[3.5rem] font-extrabold leading-[0.94] tracking-[-0.035em] text-[#17324D] sm:text-[5rem] lg:text-[6.2rem]">
              Всеки ден е ново
              <span className="relative ml-3 inline-block text-[#F2776B]">
                откритие.
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 330 22" fill="none" aria-hidden="true">
                  <path d="M4 14C78 2 221 2 326 13" stroke="#FFB37B" strokeWidth="9" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-9 max-w-xl text-lg font-semibold leading-8 text-[#17324D]/68 sm:text-xl">
              Детска занималня, в която ученето, играта и творчеството се срещат в спокойна и вдъхновяваща среда.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#programi" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#17324D] px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-[#244766]">
                Разгледай програмите
                <ArrowRight className="h-5 w-5" />
              </a>
              <a href="#kontakti" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#17324D]/15 bg-white px-7 py-4 font-extrabold text-[#17324D] transition hover:-translate-y-1 hover:border-[#3E8F82]">
                <CalendarDays className="h-5 w-5 text-[#3E8F82]" />
                Безплатно посещение
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-bold text-[#17324D]/65">
              {[
                "За деца от 5 до 12 г.",
                "Малки групи",
                "Опитни педагози",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#9ED9CA] text-[#17324D]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      <section className="overflow-hidden border-y border-[#17324D]/8 bg-[#17324D] py-4 text-white">
        <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap pr-10">
          {[...Array(2)].flatMap((_, loop) =>
            ["Учим с желание", "Творим смело", "Играем заедно", "Растем уверено"].map((text) => (
              <div key={`${loop}-${text}`} className="flex items-center gap-10 text-sm font-black uppercase tracking-[0.22em]">
                <span>{text}</span>
                <Sparkles className="h-4 w-4 text-[#FFB37B]" />
              </div>
            )),
          )}
        </div>
      </section>

      <section id="programi" className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#3E8F82]">Нашите програми</p>
              <h2 className="text-4xl font-extrabold leading-none tracking-tight text-[#17324D] sm:text-6xl">
                Различни занимания. Една обща цел.
              </h2>
            </div>
            <p className="max-w-2xl text-lg font-semibold leading-8 text-[#17324D]/65 lg:justify-self-end">
              Всяка програма комбинира полезна структура с достатъчно свобода за въображение, движение и приятелства.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {programs.map((program, index) => {
              const Icon = program.icon
              return (
                <article key={program.title} className={`${program.tone} group relative overflow-hidden rounded-[34px] border border-white p-7 transition duration-300 hover:-translate-y-1 sm:p-9`}>
                  <span className="absolute right-7 top-7 text-6xl font-black text-[#17324D]/5">0{index + 1}</span>
                  <div className={`${program.iconTone} grid h-14 w-14 place-items-center rounded-[20px] text-[#17324D] transition duration-300 group-hover:-rotate-6 group-hover:scale-105`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-sm font-black uppercase tracking-[0.16em] text-[#17324D]/50">{program.age}</span>
                      <h3 className="mt-2 text-3xl font-extrabold text-[#17324D]">{program.title}</h3>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-[#17324D]/15 bg-white/60 transition group-hover:bg-[#17324D] group-hover:text-white">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 max-w-xl font-semibold leading-7 text-[#17324D]/65">{program.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="za-nas" className="relative bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="absolute inset-0 noise opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[580px]">
            <div className="absolute left-0 top-0 h-[82%] w-[78%] rounded-[54px] bg-[#CBECE4]" />
            <div className="soft-shadow absolute bottom-0 right-0 h-[78%] w-[78%] overflow-hidden rounded-[54px] border-[10px] border-white bg-[#FFF0E5]">
              <div className="absolute inset-x-0 bottom-0 h-[33%] bg-[#FFB37B]" />
              <div className="absolute left-[10%] top-[13%] h-[20%] w-[34%] -rotate-6 rounded-[24px] bg-[#C9B8EA]" />
              <div className="absolute right-[10%] top-[12%] h-[22%] w-[32%] rotate-6 rounded-[24px] bg-white" />
              <div className="absolute bottom-[17%] left-[14%] h-[42%] w-[30%] rounded-t-full bg-[#3E8F82]" />
              <div className="absolute bottom-[17%] right-[14%] h-[46%] w-[30%] rounded-t-full bg-[#17324D]" />
              <div className="absolute bottom-[49%] left-[14%] h-[22%] w-[30%] rounded-full bg-[#E9A978]" />
              <div className="absolute bottom-[53%] right-[14%] h-[22%] w-[30%] rounded-full bg-[#D28F63]" />
            </div>
            <div className="card-shadow absolute left-[5%] top-[11%] max-w-[230px] rounded-[28px] bg-[#17324D] p-5 text-white">
              <p className="text-4xl font-black">12+</p>
              <p className="mt-1 text-sm font-bold text-white/70">вдъхновяващи занимания всяка седмица</p>
            </div>
            <div className="card-shadow absolute bottom-[7%] left-[2%] rounded-[26px] bg-white p-5">
              <div className="flex -space-x-2">
                {["М", "А", "К", "+"].map((letter, index) => (
                  <span key={letter} className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white text-sm font-black text-[#17324D] ${["bg-[#FFB37B]", "bg-[#9ED9CA]", "bg-[#C9B8EA]", "bg-[#F7C5BE]"][index]}`}>
                    {letter}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm font-extrabold text-[#17324D]">Екип, който познава децата</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#F2776B]">Повече от занималня</p>
            <h2 className="text-4xl font-extrabold leading-[0.98] tracking-tight text-[#17324D] sm:text-6xl">
              Място, в което детето се чувства видяно.
            </h2>
            <p className="mt-7 text-lg font-semibold leading-8 text-[#17324D]/65">
              Не гоним шумна, претрупана визия и не обещаваме чудеса. Създаваме ясна ежедневна структура, топло отношение и достатъчно пространство детето да бъде себе си.
            </p>

            <div className="mt-10 grid gap-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div key={benefit.title} className="flex gap-4 rounded-[24px] border border-[#17324D]/8 bg-[#FFF9EF] p-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white text-[#3E8F82] shadow-sm">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#17324D]">{benefit.title}</h3>
                      <p className="mt-1 font-semibold text-[#17324D]/60">{benefit.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <a href="#kontakti" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#F2776B] px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-[#DD675C]">
              Запознай се с екипа
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl rounded-[42px] bg-[#17324D] p-7 text-white sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#9ED9CA]">Един спокоен ден</p>
              <h2 className="text-4xl font-extrabold leading-none sm:text-6xl">Ритъм, който дава сигурност.</h2>
              <p className="mt-6 max-w-lg text-lg font-semibold leading-8 text-white/65">
                Децата знаят какво следва, но никой ден не е скучен. Балансираме учебно време, движение, творчество и почивка.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["07:30", "Посрещане и свободна игра", "bg-[#FFB37B]"],
                ["09:00", "Учебни задачи и подготовка", "bg-[#9ED9CA]"],
                ["12:30", "Обяд и спокойна почивка", "bg-[#C9B8EA]"],
                ["15:00", "Творческо ателие или спорт", "bg-[#F7C5BE]"],
                ["17:00", "Игри, четене и изпращане", "bg-white"],
              ].map(([time, title, tone], index) => (
                <div key={time} className="group flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 sm:p-5">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[17px] ${tone} font-black text-[#17324D]`}>{index + 1}</span>
                  <span className="w-16 shrink-0 text-sm font-black text-[#9ED9CA]">{time}</span>
                  <span className="font-extrabold text-white">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="galeria" className="bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#3E8F82]">Галерия</p>
              <h2 className="text-4xl font-extrabold leading-none tracking-tight text-[#17324D] sm:text-6xl">Малки моменти. Големи усмивки.</h2>
            </div>
            <a href="#kontakti" className="inline-flex items-center gap-2 font-extrabold text-[#17324D] hover:text-[#3E8F82]">
              Виж повече
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-12 grid auto-rows-[240px] gap-5 md:grid-cols-4">
            {gallery.map((item, index) => (
              <div key={item.title} className={`${item.className} group relative overflow-hidden rounded-[34px] p-6`}>
                <div className="absolute inset-0 opacity-70">
                  {index === 0 && (
                    <>
                      <span className="absolute left-[12%] top-[13%] h-24 w-24 rounded-full bg-[#F2776B]" />
                      <span className="absolute right-[12%] top-[16%] h-32 w-32 rotate-12 rounded-[28px] bg-white/70" />
                      <span className="absolute bottom-[12%] left-[28%] h-44 w-36 rounded-t-full bg-[#17324D]" />
                      <span className="absolute bottom-[43%] left-[29%] h-28 w-32 rounded-full bg-[#E9A978]" />
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <span className="absolute left-[18%] top-[18%] h-28 w-28 rounded-[34px] bg-white/75" />
                      <span className="absolute bottom-[14%] right-[13%] h-36 w-28 rounded-t-full bg-[#3E8F82]" />
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <span className="absolute right-[17%] top-[14%] h-28 w-28 rounded-full bg-[#FFB37B]" />
                      <span className="absolute bottom-[12%] left-[16%] h-32 w-32 rotate-12 rounded-[36px] bg-white/70" />
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <span className="absolute left-[8%] top-[18%] h-20 w-20 rounded-full bg-[#17324D]" />
                      <span className="absolute left-[37%] top-[14%] h-28 w-28 rotate-12 rounded-[28px] bg-white/60" />
                      <span className="absolute bottom-[12%] right-[11%] h-28 w-44 rounded-t-full bg-[#F2776B]" />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#17324D]/55 via-transparent to-transparent opacity-80" />
                <div className="relative flex h-full items-end justify-between">
                  <h3 className="text-2xl font-extrabold text-white">{item.title}</h3>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#17324D] transition group-hover:rotate-45">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#F2776B]">Думи от родителите</p>
            <h2 className="text-4xl font-extrabold leading-none tracking-tight text-[#17324D] sm:text-6xl">Доверието не се рекламира. Печели се.</h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              ["Мария П.", "Майка на Алекс", "Детето ми тръгва с желание и се прибира спокойно. За мен това е най-важният знак, че сме избрали правилното място."],
              ["Николай К.", "Баща на Ема", "Харесва ми, че има структура, но децата не са натоварени излишно. Комуникацията с екипа е ясна и навременна."],
              ["Елена Д.", "Майка на Мартин", "Само за няколко седмици видяхме повече увереност и самостоятелност. Атмосферата е топла, но професионална."],
            ].map(([name, role, quote], index) => (
              <article key={name} className={`rounded-[32px] border border-[#17324D]/8 p-7 ${index === 1 ? "bg-[#17324D] text-white" : "bg-white text-[#17324D]"}`}>
                <div className="flex gap-1 text-[#FFB37B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className={`mt-7 text-lg font-bold leading-8 ${index === 1 ? "text-white/80" : "text-[#17324D]/70"}`}>“{quote}”</p>
                <div className="mt-8 flex items-center gap-3">
                  <span className={`grid h-12 w-12 place-items-center rounded-full font-black ${index === 1 ? "bg-[#9ED9CA] text-[#17324D]" : "bg-[#FFF0E5] text-[#F2776B]"}`}>
                    {name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-extrabold">{name}</p>
                    <p className={`text-sm font-bold ${index === 1 ? "text-white/50" : "text-[#17324D]/45"}`}>{role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakti" className="px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[44px] bg-[#FFB37B] px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-white/20" />
          <div className="absolute -bottom-24 left-[35%] h-56 w-56 rotate-12 rounded-[60px] bg-[#C9B8EA]/40" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#17324D]">
                <MessageCircleMore className="h-4 w-4" />
                Нека се запознаем
              </span>
              <h2 className="mt-6 max-w-3xl text-4xl font-extrabold leading-none tracking-tight text-[#17324D] sm:text-6xl">
                Заповядайте на безплатно опознавателно посещение.
              </h2>
              <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-[#17324D]/65">
                Разгледайте пространството, запознайте се с екипа и задайте всички важни въпроси преди да вземете решение.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a href="tel:+359888123456" className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-[#17324D] px-7 py-4 font-extrabold text-white transition hover:-translate-y-1">
                <Phone className="h-5 w-5" />
                0888 123 456
              </a>
              <a href="mailto:hello@example.bg" className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-[#17324D] transition hover:-translate-y-1">
                Пиши ни съобщение
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#17324D]/8 bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-extrabold text-[#17324D]/55">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[#3E8F82]">{item.label}</a>
            ))}
          </div>
          <p className="text-sm font-bold text-[#17324D]/45">© 2026 Малки откриватели</p>
        </div>
      </footer>
    </main>
  )
}
