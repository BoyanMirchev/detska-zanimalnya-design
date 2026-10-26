import type { LucideIcon } from "lucide-react"
import { BookOpen, Ear, MessageCircle, Mic, PenLine, Puzzle, Sparkles, Type } from "lucide-react"
import { SectionHeading } from "@/components/sections"
import { CheckList, EnrollCTA, Paragraphs } from "@/components/course-content-parts"
import { contact } from "@/lib/nav"

const skills: { icon: LucideIcon; label: string }[] = [
  { icon: MessageCircle, label: "свободно говорене" },
  { icon: Ear, label: "слушане с разбиране" },
  { icon: BookOpen, label: "четене на текстове" },
  { icon: PenLine, label: "писане на изречения и текстове" },
  { icon: Mic, label: "ясно произношение" },
  { icon: Type, label: "богат речников запас" },
  { icon: Puzzle, label: "граматика с разбиране" },
  { icon: Sparkles, label: "увереност да използва езика" },
]

const practice = [
  "разговори и ролеви игри от ежедневието;",
  "образователни игри, които карат децата да говорят;",
  "картинки, флашкарти и визуални материали;",
  "слушане на кратки истории, песни и диалози;",
  "четене на текстове, подходящи за нивото;",
  "задачи за писане – от думи до кратки съчинения;",
  "песни, движение и интерактивни упражнения;",
  "работа по двойки и в малки екипи.",
]

const topics = [
  "семейство",
  "училище",
  "приятели",
  "храна",
  "животни",
  "цветове и числа",
  "свободно време",
  "спорт",
  "пътуване",
  "ежедневни ситуации",
]

const lessonSteps = [
  "Загрявка и бърз преговор",
  "Нови думи или граматическа структура",
  "Упражнения с ясни примери",
  "Разговор и работа по двойки",
  "Игра, която затвърждава наученото",
  "Обобщение: какво научихме днес",
]

const audience = [
  "тепърва правят първите си стъпки в английския;",
  "искат да затвърдят и подредят знанията си;",
  "срещат трудности с материала в училище;",
  "разбират езика, но се притесняват да говорят;",
  "искат да научат повече думи и изрази;",
  "искат да четат, пишат и произнасят по-уверено.",
]

export function AngliyskiContent() {
  return (
    <>
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Умения" title="Какво развиваме?" />
            <p className="text-lg font-semibold leading-8 text-ink/65">
              Работим балансирано върху всички езикови умения, защото истинското владеене на езика идва, когато
              те се развиват заедно:
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            Най-голямата ни цел е детето да спре да се страхува да говори и да започне да използва английския
            естествено – в час, на почивка, на път и в живота.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Практика" title="Английски чрез практика" />
            <Paragraphs
              items={[
                "Един език се научава, когато се използва. Затова в нашите занятия децата прекарват повече време в говорене и действие, отколкото в преписване.",
              ]}
            />
            <p className="font-semibold leading-7 text-ink/60">
              Новите думи и изрази не остават в учебника – децата ги използват веднага, в ситуации, които познават и
              които им харесват.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-extrabold text-ink">В часовете включваме:</p>
            <CheckList items={practice} columns />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-[32px] bg-ink p-8 text-white sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight">Говорене без страх от грешки</h2>
            <p className="text-lg font-semibold leading-8 text-white/75">
              Много деца знаят отговора, но мълчат, защото се притесняват да не сбъркат.
            </p>
            <p className="text-lg font-semibold leading-8 text-white/75">
              При нас грешката е нормална част от ученето, а не повод за неудобство. Поправяме внимателно и
              хвалим всеки опит.
            </p>
            <p className="text-lg font-semibold leading-8 text-white/75">
              Така децата започват да питат, да отговарят и да разговарят, а с всяко занятие увереността им
              расте.
            </p>
          </div>
          <div className="flex flex-col gap-5 rounded-[32px] border border-brand/12 bg-cream p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">Граматика с разбиране</h2>
            <Paragraphs
              items={[
                "Граматиката не е списък с правила за наизустяване.",
                "Обясняваме я с прости примери и веднага я прилагаме в реални ситуации, така че детето да разбере кога и защо се казва точно така.",
                "Напредваме стъпка по стъпка, без претоварване и с темпо, съобразено с групата.",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <SectionHeading eyebrow="Речник" title="Думи, които остават" />
          <p className="text-lg font-semibold leading-8 text-ink/65">
            Учим новите думи по теми, които са близки до света на децата и ги използват всеки ден:
          </p>
          <ul className="flex flex-wrap gap-3" aria-label="Теми">
            {topics.map((topic) => (
              <li
                key={topic}
                className="rounded-full border border-brand/20 bg-paper px-5 py-2.5 font-extrabold text-ink/80 first-letter:uppercase"
              >
                {topic}
              </li>
            ))}
          </ul>
          <p className="font-semibold leading-7 text-ink/60">
            Всяка дума се среща многократно – в разговор, в текст, в игра и в задача. Затова децата не просто я
            научават, а я запомнят и използват.
          </p>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Малки групи" title="Малки групи. Повече участие." />
            <Paragraphs
              items={[
                "С най-много 6 деца в група всяко дете говори, пита и получава обратна връзка във всяко занятие, а не веднъж седмично.",
                "Преподавателят вижда напредъка на всяко дете и се връща към темите, които още затрудняват някого.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Нива" title="Групи според нивото" />
            <Paragraphs
              items={[
                "Преди началото всяко дете прави входящ тест, а групите сформираме според реалните му знания.",
                "Така материалът е предизвикателство, но не непосилно, и децата напредват заедно с връстници на тяхното ниво.",
              ]}
            />
            <p className="rounded-[24px] bg-brand-soft px-6 py-5 text-lg font-semibold leading-8 text-brand-dark">
              Работим с нива от <strong className="font-extrabold">Pre A1 до B2</strong> според възрастта и
              знанията на децата в групата.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Занятието" title="Как протича едно занятие?" />
            <Paragraphs
              items={[
                "Редуваме различни дейности, за да не намалява вниманието, а децата да учат с удоволствие. Едно типично занятие включва:",
              ]}
            />
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessonSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-4 rounded-[24px] border border-brand/10 bg-paper p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-lg font-extrabold text-white">
                  {index + 1}
                </span>
                <span className="font-extrabold leading-6 text-ink">{step}</span>
              </li>
            ))}
          </ol>
          <p className="font-semibold leading-7 text-ink/60">
            Така в едно занятие децата чуват, казват, четат и пишат едно и също нещо по различен начин, а
            наученото се затвърждава трайно.
          </p>
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
              Повече от поредния учебен предмет
            </h2>
            <Paragraphs
              items={[
                "Искаме английският да бъде език, който детето използва уверено – да се разбере с връстник на почивка, да гледа любимото си филмче или да прочете книга, а не само да изкара добра оценка на следващото контролно.",
                "Когато ученето е интересно, разбираемо и свързано с живота, добрите резултати в училище идват като естествено следствие.",
              ]}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export function AngliyskiEnrollCTA() {
  return (
    <EnrollCTA
      title="Запишете детето си на английски"
      text="Обадете ни се – ще ви разкажем за нивата, групите и графика, ще уговорим входящ тест и ще ви кажем дали има свободни места."
      phone={contact.phoneEnglish}
      phoneHref={contact.phoneEnglishHref}
    />
  )
}
