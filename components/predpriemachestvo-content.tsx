import type { LucideIcon } from "lucide-react"
import {
  Brain,
  CalendarCheck,
  Lightbulb,
  MessagesSquare,
  PiggyBank,
  Presentation,
  Puzzle,
  Rocket,
  Users,
} from "lucide-react"
import { SectionHeading } from "@/components/sections"
import { CheckList, EnrollCTA, Paragraphs } from "@/components/course-content-parts"

const skills: { icon: LucideIcon; label: string }[] = [
  { icon: Lightbulb, label: "креативно мислене" },
  { icon: Brain, label: "логическо мислене" },
  { icon: PiggyBank, label: "финансова грамотност" },
  { icon: CalendarCheck, label: "планиране" },
  { icon: Users, label: "работа в екип" },
  { icon: MessagesSquare, label: "комуникационни умения" },
  { icon: Presentation, label: "увереност при представяне на идеи" },
  { icon: Puzzle, label: "умение за решаване на проблеми" },
  { icon: Rocket, label: "инициативност и самостоятелност" },
]

const projectSteps: { title: string; lines: string[] }[] = [
  {
    title: "Откриваме идея",
    lines: [
      "Какво можем да създадем?",
      "Какъв проблем можем да решим?",
      "Какво би било полезно или интересно за другите?",
    ],
  },
  {
    title: "Правим план",
    lines: [
      "Определяме какво е необходимо, какви стъпки трябва да изпълним и как можем да организираме работата си.",
    ],
  },
  {
    title: "Работим в екип",
    lines: ["Децата разпределят задачи, обсъждат различни предложения и се учат да вземат решения заедно."],
  },
  {
    title: "Създаваме проекта",
    lines: ["Идеята постепенно се превръща в конкретен продукт, услуга, презентация или модел."],
  },
  {
    title: "Представяме резултата",
    lines: [
      "Децата се учат да обяснят какво са създали, за кого е предназначено и защо тяхната идея има стойност.",
    ],
  },
]

const financeTopics = [
  "приходи и разходи",
  "цена",
  "бюджет",
  "печалба",
  "спестяване",
  "разумно управление на парите",
  "стойност на продукт или услуга",
]

const priceQuestions = [
  "Колко струва създаването на даден продукт?",
  "Колко можем да поискаме за него?",
  "Каква е разликата между приход и печалба?",
  "Какво се случва, ако разходите станат по-високи?",
]

const marketing = [
  "име на проект или продукт;",
  "за кого е предназначен;",
  "какъв проблем решава;",
  "защо някой би го избрал;",
  "как може да бъде представен;",
  "какво послание искаме да предадем.",
]

const methods = [
  "ролеви игри",
  "работа по проекти",
  "казуси",
  "презентации",
  "работа в екип",
  "дискусии",
  "творчески предизвикателства",
  "примерни бюджети",
  "симулации на реални ситуации",
]

const presenting = [
  "структуриране на мисълта;",
  "кратко и разбираемо представяне;",
  "говорене пред група;",
  "аргументиране;",
  "отговаряне на въпроси;",
  "приемане на обратна връзка.",
]

const audience = [
  "обичат да измислят нови неща;",
  "имат интерес към бизнеса и парите;",
  "искат да развият увереността си;",
  "обичат да работят по проекти;",
  "искат да се научат да представят идеите си;",
  "проявяват интерес към създаването на собствени продукти или услуги;",
  "искат да развиват логическо и креативно мислене.",
]

function Pills({ items, label }: { items: string[]; label: string }) {
  return (
    <ul className="flex flex-wrap gap-3" aria-label={label}>
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-brand/20 bg-paper px-5 py-2.5 font-extrabold text-ink/80 first-letter:uppercase"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

export function PredpriemachestvoContent() {
  return (
    <>
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Умения" title="Какво развиваме?" />
            <p className="text-lg font-semibold leading-8 text-ink/65">По време на занятията децата развиват:</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4 rounded-[24px] border border-brand/10 bg-cream p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-brand-soft text-brand-dark">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="font-extrabold leading-6 text-ink first-letter:uppercase">{label}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-[24px] bg-brand-soft px-6 py-5 text-lg font-extrabold leading-8 text-brand-dark">
            Учениците се насърчават да задават въпроси, да търсят различни решения и да защитават собствените си идеи.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Стъпка по стъпка" title="Как една идея се превръща в проект?" />
            <Paragraphs
              items={[
                "Всяка добра идея започва с въпрос или проблем.",
                "По време на курса децата постепенно преминават през основните стъпки:",
              ]}
            />
          </div>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projectSteps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-4 rounded-[28px] border border-brand/10 bg-paper p-6">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-lg font-extrabold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-extrabold text-ink">{step.title}</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {step.lines.map((line) => (
                    <p key={line} className="font-semibold leading-7 text-ink/65">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Финанси" title="Финансова грамотност на разбираем език" />
            <Paragraphs
              items={[
                "Част от курса е посветена на основни финансови понятия, представени чрез примери и практически задачи.",
                "Децата се запознават с теми като:",
              ]}
            />
            <Pills items={financeTopics} label="Финансови теми" />
            <p className="rounded-[24px] bg-brand-soft px-6 py-5 text-lg font-semibold leading-8 text-brand-dark">
              Идеята не е да запаметяват сложни термини, а да разберат логиката зад тях.
            </p>
          </div>
          <div className="flex flex-col gap-5 rounded-[32px] bg-ink p-8 text-white sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight">Как определяме цена?</h2>
            <p className="text-lg font-semibold text-white/80">Децата могат да работят по примерни ситуации:</p>
            <ul className="flex flex-col gap-3">
              {priceQuestions.map((q) => (
                <li key={q} className="rounded-2xl bg-white/10 px-5 py-4 text-lg font-bold leading-7 text-white/90">
                  {q}
                </li>
              ))}
            </ul>
            <p className="font-semibold leading-7 text-white/70">
              Чрез подобни задачи финансовите понятия стават много по-лесни за разбиране.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Маркетинг" title="Маркетинг и представяне на идея" />
            <Paragraphs items={["Добрата идея трябва да може да бъде представена ясно."]} />
            <p className="font-semibold leading-7 text-ink/60">
              Могат да създават плакати, презентации, кратки рекламни послания и други материали към проектите си.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-extrabold text-ink">Децата се учат да мислят за:</p>
            <CheckList items={marketing} columns />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-[32px] border border-brand/12 bg-cream p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">
              Учим чрез практически задачи
            </h2>
            <Paragraphs items={["Занятията не са изградени само от теория.", "Използваме:"]} />
            <Pills items={methods} label="Методи на обучение" />
            <p className="font-semibold leading-7 text-ink/60">
              Така децата разбират как наученото може да се използва извън учебната стая.
            </p>
          </div>
          <div className="flex flex-col gap-5 rounded-[32px] border border-brand/12 bg-paper p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">
              Умението да представиш собствената си идея
            </h2>
            <Paragraphs
              items={[
                "Да имаш добра идея е само началото.",
                "Децата се учат да я представят пред останалите ясно и уверено. Работим върху:",
              ]}
            />
            <CheckList items={presenting} />
            <p className="font-semibold leading-7 text-ink/60">
              Това развива увереност, която е полезна далеч извън самия курс.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Постоянство" title="Грешката е част от добрата идея" />
            <Paragraphs
              items={[
                "Не всяка идея работи от първия път.",
                "По време на курса насърчаваме децата да анализират какво не се е получило, да променят подхода си и да опитат отново.",
                "Така те разбират, че неуспехът не означава край на проекта, а възможност да намерят по-добро решение.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Малки групи" title="Малки групи и повече участие" />
            <Paragraphs
              items={[
                "Работата в малка група позволява всяко дете да участва активно.",
                "Няма само един ученик, който говори, докато останалите слушат.",
                "Всеки има възможност да предлага идеи, да поема задачи, да представя решения и да участва в общите проекти.",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Аудитория" title="За кого е курсът?" />
            <p className="font-extrabold text-ink">Курсът е подходящ за деца, които:</p>
            <CheckList items={audience} />
          </div>
          <div className="flex flex-col justify-center gap-5 rounded-[32px] border border-brand/12 bg-cream p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">
              Умения, които остават за цял живот
            </h2>
            <Paragraphs
              items={[
                "Предприемачеството не е само създаване на фирма.",
                "То е умението да видиш проблем, да намериш решение, да направиш план и да имаш увереността да опиташ.",
                "Точно тези качества искаме да развиваме в децата.",
              ]}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export function PredpriemachestvoEnrollCTA() {
  return (
    <EnrollCTA
      title="Запишете детето си на предприемачество"
      text="Свържете се с нас за информация относно възрастовите групи, програмата, графика и свободните места."
    />
  )
}
