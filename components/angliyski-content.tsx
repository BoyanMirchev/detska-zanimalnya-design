import type { LucideIcon } from "lucide-react"
import { BookOpen, Ear, MessageCircle, Mic, PenLine, Puzzle, Sparkles, Type } from "lucide-react"
import { SectionHeading } from "@/components/sections"
import { CheckList, EnrollCTA, Paragraphs } from "@/components/course-content-parts"

const skills: { icon: LucideIcon; label: string }[] = [
  { icon: MessageCircle, label: "говорене" },
  { icon: Ear, label: "слушане с разбиране" },
  { icon: BookOpen, label: "четене" },
  { icon: PenLine, label: "писане" },
  { icon: Mic, label: "произношение" },
  { icon: Type, label: "речников запас" },
  { icon: Puzzle, label: "основна граматика" },
  { icon: Sparkles, label: "увереност при използване на английски език" },
]

const practice = [
  "разговори и кратки диалози;",
  "образователни игри;",
  "работа с картинки и флашкарти;",
  "упражнения за слушане;",
  "четене на подходящи текстове;",
  "задачи за писане;",
  "песни и интерактивни упражнения;",
  "работа по двойки и в малки групи.",
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
  "Кратък преговор на изученото",
  "Нови думи или езикова структура",
  "Практически упражнения",
  "Говорене или работа по двойки",
  "Игра или интерактивна задача",
  "Кратко обобщение",
]

const audience = [
  "започват да учат английски;",
  "искат да затвърдят знанията си;",
  "имат затруднения с материала в училище;",
  "разбират английски, но се притесняват да говорят;",
  "искат да разширят речниковия си запас;",
  "желаят да подобрят четенето, писането и произношението си.",
]

export function AngliyskiContent() {
  return (
    <>
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Умения" title="Какво развиваме?" />
            <p className="text-lg font-semibold leading-8 text-ink/65">
              По време на занятията работим върху основните езикови умения:
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
            Целта ни е детето да не се притеснява да говори, а постепенно да започне да използва английския език
            естествено и самостоятелно.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Практика" title="Английски чрез практика" />
            <Paragraphs items={["Език се учи най-добре, когато се използва."]} />
            <p className="font-semibold leading-7 text-ink/60">
              Така новите думи и изрази не остават само в учебника, а се използват в реален контекст.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-extrabold text-ink">Затова в занятията включваме:</p>
            <CheckList items={practice} columns />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-[32px] bg-ink p-8 text-white sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight">Говорене без притеснение</h2>
            <p className="text-lg font-semibold leading-8 text-white/75">
              Много деца знаят правилния отговор, но се притесняват да го кажат на английски.
            </p>
            <p className="text-lg font-semibold leading-8 text-white/75">
              Затова създаваме спокойна среда, в която грешките са част от ученето.
            </p>
            <p className="text-lg font-semibold leading-8 text-white/75">
              Насърчаваме децата да задават въпроси, да участват в разговори и постепенно да изграждат увереност при
              говорене.
            </p>
          </div>
          <div className="flex flex-col gap-5 rounded-[32px] border border-brand/12 bg-cream p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">Граматика с разбиране</h2>
            <Paragraphs
              items={[
                "Граматиката не трябва да бъде сухо учене на правила.",
                "Обясняваме я с ясни примери и я упражняваме чрез практически ситуации, така че децата да разберат кога и защо използват дадена структура.",
                "Работим постепенно, без излишно натоварване и съобразено с нивото на групата.",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <SectionHeading eyebrow="Речник" title="Разширяване на речниковия запас" />
          <p className="text-lg font-semibold leading-8 text-ink/65">
            Новите думи се въвеждат чрез теми, които са близки и интересни за децата. Работим с теми като:
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
            Думите се упражняват многократно чрез говорене, четене, игри и практически задачи.
          </p>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Малки групи" title="Малки групи. Повече участие." />
            <Paragraphs
              items={[
                "В малката група всяко дете има повече възможности да говори, да задава въпроси и да получава обратна връзка.",
                "Това ни позволява да следим напредъка по-внимателно и да обръщаме допълнително внимание на темите, които създават затруднения.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Нива" title="Групи според нивото" />
            <Paragraphs
              items={[
                "Разпределяме децата според техните знания и опит с английския език.",
                "По този начин материалът не е нито прекалено лесен, нито прекалено труден.",
              ]}
            />
            <p className="rounded-[24px] bg-brand-soft px-6 py-5 text-lg font-semibold leading-8 text-brand-dark">
              Работата може да бъде насочена към нива от <strong className="font-extrabold">Pre-A1 до B2</strong>, в
              зависимост от възрастта, знанията и конкретната група.
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
                "Всяко занятие съчетава различни активности, за да поддържа вниманието и интереса на децата. Обикновено включваме:",
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
            Така децата използват езика по няколко различни начина в рамките на едно занятие.
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
              Не просто още един учебен предмет
            </h2>
            <Paragraphs
              items={[
                "Искаме английският да бъде език, който детето използва с увереност, а не предмет, който просто трябва да научи за следващото контролно.",
                "Когато ученето е интересно, разбираемо и свързано с реалния живот, резултатите идват много по-естествено.",
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
      title="Запишете детето си на английски език"
      text="Свържете се с нас за информация относно нивата, групите, графика и свободните места."
    />
  )
}
