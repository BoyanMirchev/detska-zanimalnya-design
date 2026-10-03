import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Brain, Check, Compass, Crosshair, Hourglass, Phone, UserCheck } from "lucide-react"
import { SectionHeading } from "@/components/sections"
import { ContactDialog } from "@/components/contact-dialog"
import { PhoneLink } from "@/components/phone-link"
import { contact } from "@/lib/nav"

const learnTopics = [
  "шахматната дъска и фигурите;",
  "правилата за движение на всяка фигура;",
  "шах, мат и пат;",
  "основни принципи в началото на партията;",
  "защита и атака;",
  "разпознаване на заплахи;",
  "планиране на няколко хода напред;",
  "основни тактики и комбинации;",
  "анализ на собствените ходове;",
  "спортсменско поведение и уважение към противника.",
]

const questions = [
  "Коя фигура да премести?",
  "Какво ще направи противникът след това?",
  "Има ли по-добро решение?",
  "Как може да защити позицията си?",
]

const skills: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Brain, title: "Логическо мислене", text: "Децата се учат да анализират ситуацията и да търсят различни решения." },
  {
    icon: Crosshair,
    title: "Концентрация",
    text: "Шахът изисква внимание към детайлите и проследяване на промените върху цялата дъска.",
  },
  {
    icon: Hourglass,
    title: "Търпение",
    text: "Не всеки ход трябва да бъде направен веднага. Детето се учи да обмисля действията си.",
  },
  {
    icon: Compass,
    title: "Стратегическо мислене",
    text: "Учениците започват да планират предварително и да предвиждат възможните реакции на противника.",
  },
  {
    icon: UserCheck,
    title: "Самостоятелност",
    text: "На шахматната дъска решението е на детето. Това изгражда увереност и отговорност за собствения избор.",
  },
]

const lessonMethods = [
  "демонстрации на шахматната дъска;",
  "кратки шахматни задачи;",
  "позиции за решаване;",
  "партии между учениците;",
  "анализ на интересни ситуации;",
  "приятелски състезания и предизвикателства.",
]

const audience = [
  "никога не са играли шах и искат да започнат;",
  "познават правилата, но искат да играят по-добре;",
  "обичат логически игри и предизвикателства;",
  "искат да подобрят концентрацията си;",
  "имат интерес към стратегии и решаване на проблеми.",
]

function CheckList({ items, columns = false }: { items: string[]; columns?: boolean }) {
  return (
    <ul className={`grid gap-3 ${columns ? "sm:grid-cols-2" : ""}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-2xl border border-brand/10 bg-paper p-4">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="font-bold leading-6 text-ink/80">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4">
      {items.map((p) => (
        <p key={p} className="text-lg font-semibold leading-8 text-ink/65">
          {p}
        </p>
      ))}
    </div>
  )
}

export function ShahContent() {
  return (
    <>
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <SectionHeading eyebrow="Програма" title="Какво научават децата?" />
          <p className="text-lg font-semibold leading-8 text-ink/65">
            По време на занятията децата постепенно усвояват:
          </p>
          <CheckList items={learnTopics} columns />
          <p className="rounded-[24px] bg-brand-soft px-6 py-5 text-lg font-extrabold leading-8 text-brand-dark">
            Целта ни не е детето просто да запомни правилата, а да започне да разбира логиката зад играта.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Какво развива" title="Развиваме мислене, не просто шахматни умения" />
            <p className="text-lg font-semibold leading-8 text-ink/65">
              Една шахматна партия постоянно поставя детето пред избор.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Въпроси по време на партия">
              {questions.map((q) => (
                <li key={q} className="rounded-full border border-brand/20 bg-paper px-4 py-2 font-extrabold text-ink/80">
                  {q}
                </li>
              ))}
            </ul>
            <p className="text-lg font-semibold leading-8 text-ink/65">
              Този процес постепенно развива умения, които са полезни и извън шахматната дъска.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[28px] border border-brand/10 bg-paper p-7">
                <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-soft text-brand-dark">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink">{title}</h3>
                <p className="mt-2 font-semibold leading-7 text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Обучението" title="Как протичат занятията?" />
            <Paragraphs
              items={[
                "Обучението съчетава кратки обяснения с много практическа игра.",
                "Започваме от нивото на всяко дете и постепенно добавяме нови правила, тактики и стратегии.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-extrabold text-ink">По време на занятията използваме:</p>
            <CheckList items={lessonMethods} />
            <p className="font-semibold leading-7 text-ink/60">
              Така обучението остава динамично и интересно, вместо да се превръща в сухо изучаване на теория.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Без предишен опит" title="Подходящо и за напълно начинаещи" />
            <Paragraphs
              items={[
                "Не е необходимо детето да е играло шах преди.",
                "Започваме от основите и постепенно изграждаме знанията и увереността му.",
                "За децата, които вече познават правилата, занятията могат да се насочат към по-сложни позиции, тактики и стратегии.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Аудитория" title="За кого е курсът?" />
            <p className="font-extrabold text-ink">Курсът е подходящ за деца, които:</p>
            <CheckList items={audience} />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-[32px] border border-brand/12 bg-cream p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">
              Малки групи. Повече време за всяко дете.
            </h2>
            <Paragraphs
              items={[
                "Работата в малка група позволява на преподавателя да следи начина, по който всяко дете мисли и взема решения.",
                "При шаха няма само един начин да се стигне до добра позиция. Затова насърчаваме децата да обясняват идеите си, да анализират грешките си и сами да откриват по-добри решения.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-5 rounded-[32px] bg-ink p-8 text-white sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight">Всеки ход е ново решение</h2>
            <p className="text-lg font-semibold leading-8 text-white/75">
              Шахът учи децата, че грешката не е край на играта, а възможност да намерят следващото най-добро решение.
            </p>
            <p className="text-lg font-semibold leading-8 text-white/75">
              Точно това прави играта толкова полезна — децата развиват постоянство, мислене и увереност, докато се
              забавляват.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export function ShahEnrollCTA() {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:pb-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[36px] bg-brand p-8 text-center text-white sm:p-12">
        <h2 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl">Запишете детето си на шах</h2>
        <p className="max-w-xl text-lg font-semibold leading-8 text-white/85">
          Свържете се с нас за информация относно групите, графика и свободните места.
        </p>
        <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#zapisvane"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-brand-dark transition hover:-translate-y-1"
          >
            Запиши детето
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <PhoneLink
            href={contact.phonePrimaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-4 font-extrabold text-white transition hover:-translate-y-1"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            {contact.phonePrimary}
          </PhoneLink>
          <ContactDialog />
        </div>
      </div>
    </section>
  )
}
