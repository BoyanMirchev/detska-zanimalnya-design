import type { LucideIcon } from "lucide-react"
import { Brain, Focus, Hammer, Laptop, Lightbulb, ListOrdered, Puzzle, Workflow } from "lucide-react"
import { SectionHeading } from "@/components/sections"
import { CheckList, EnrollCTA, Paragraphs } from "@/components/course-content-parts"

const skills: { icon: LucideIcon; label: string }[] = [
  { icon: Brain, label: "логическо мислене" },
  { icon: Puzzle, label: "умение за решаване на проблеми" },
  { icon: Workflow, label: "алгоритмично мислене" },
  { icon: Focus, label: "концентрация" },
  { icon: Lightbulb, label: "креативност" },
  { icon: ListOrdered, label: "самостоятелност" },
  { icon: Hammer, label: "работа по проекти" },
  { icon: Laptop, label: "увереност при използване на технологии" },
]

const projects = [
  "интерактивни истории;",
  "малки игри;",
  "анимации;",
  "логически задачи;",
  "алгоритми;",
  "визуални програми;",
  "прости приложения;",
  "проекти с роботи и различни технологични елементи.",
]

const questions = [
  "Какво искам да се случи?",
  "В какъв ред трябва да изпълня действията?",
  "Какво ще стане, ако условието се промени?",
  "Защо програмата не работи?",
  "Как мога да я поправя?",
]

const concepts = [
  "последователност от действия",
  "условия",
  "повторения",
  "събития",
  "променливи",
  "логически зависимости",
]

const lessonSteps = [
  "Кратък преговор на предишната тема",
  "Представяне на нова концепция",
  "Демонстрация",
  "Практическа задача",
  "Самостоятелна работа или работа по двойки",
  "Малък проект или предизвикателство",
  "Обсъждане на решенията",
]

const audience = [
  "имат интерес към компютри и технологии;",
  "обичат логически задачи;",
  "искат да създават собствени игри и проекти;",
  "искат да направят първите си стъпки в програмирането;",
  "вече имат базови знания и искат да ги развият;",
  "обичат да експериментират и да откриват как работят нещата.",
]

export function ProgramiraneIntro() {
  return (
    <section className="px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <SectionHeading eyebrow="За курса" title="Първи стъпки в света на технологиите" />
        <Paragraphs
          items={[
            "В „Хралупата“ подхождаме към програмирането по достъпен и интересен начин, съобразен с възрастта на децата. Вместо суха теория, занятията включват практически задачи, визуално програмиране, игри, проекти и експериментиране.",
            "Работим в малки групи, за да може всяко дете да получава достатъчно внимание и да напредва със собствено темпо.",
          ]}
        />
      </div>
    </section>
  )
}

export function ProgramiraneContent() {
  return (
    <>
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Умения" title="Какво развиват децата?" />
            <p className="text-lg font-semibold leading-8 text-ink/65">
              По време на курса децата постепенно изграждат:
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
            Целта не е просто да натискат правилните бутони, а да започнат да разбират как работят програмите и как една
            идея се превръща в последователност от ясни стъпки.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Проекти" title="Учим чрез създаване" />
            <Paragraphs
              items={[
                "Децата усвояват новите знания най-добре, когато сами създават нещо.",
                "Затова занятията са насочени към практически задачи и малки проекти.",
              ]}
            />
            <p className="font-semibold leading-7 text-ink/60">
              Всеки проект дава възможност детето да експериментира, да допуска грешки и само да открива как да подобри
              решението си.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-extrabold text-ink">
              В зависимост от възрастта и нивото те могат да създават:
            </p>
            <CheckList items={projects} columns />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Алгоритми" title="От идея до алгоритъм" />
            <Paragraphs
              items={[
                "Една от най-важните части на програмирането е да можеш да разделиш големия проблем на по-малки стъпки.",
              ]}
            />
            <p className="rounded-[24px] bg-brand-soft px-6 py-5 text-lg font-semibold leading-8 text-brand-dark">
              Този начин на мислене е полезен не само в програмирането, а и в математиката, природните науки и
              ежедневното решаване на проблеми.
            </p>
          </div>
          <div className="flex flex-col gap-5 rounded-[32px] bg-ink p-8 text-white sm:p-10">
            <p className="text-lg font-extrabold">Децата се учат да си задават въпроси като:</p>
            <ul className="flex flex-col gap-3">
              {questions.map((q) => (
                <li key={q} className="rounded-2xl bg-white/10 px-5 py-4 text-lg font-bold leading-7 text-white/90">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-[32px] border border-brand/12 bg-cream p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">Визуално програмиране</h2>
            <Paragraphs
              items={[
                "При по-малките ученици започваме с визуално програмиране, при което командите се подреждат като цветни блокове.",
                "Това позволява на децата да разберат основни концепции като:",
              ]}
            />
            <ul className="flex flex-wrap gap-3" aria-label="Основни концепции">
              {concepts.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-brand/20 bg-paper px-5 py-2.5 font-extrabold text-ink/80 first-letter:uppercase"
                >
                  {c}
                </li>
              ))}
            </ul>
            <p className="font-semibold leading-7 text-ink/60">
              Така те усвояват начина на мислене зад програмирането, без да бъдат затруднявани още в началото от сложен
              синтаксис.
            </p>
          </div>
          <div className="flex flex-col gap-5 rounded-[32px] border border-brand/12 bg-paper p-8 sm:p-10">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">Постепенно към истински код</h2>
            <Paragraphs
              items={[
                "Когато детето е готово, подготовката може постепенно да премине към работа с истински програмен код.",
                "Фокусът остава върху разбирането, а не върху механичното преписване.",
                "Учениците се насърчават сами да експериментират, да променят програмите и да наблюдават резултата.",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Постоянство" title="Грешките са част от процеса" />
            <Paragraphs
              items={[
                "В програмирането почти нищо не работи перфектно от първия опит. И точно това е една от най-ценните части на обучението.",
                "Децата се учат да търсят причината за проблема, да проверяват различни решения и да не се отказват при първата грешка.",
                "Така развиват постоянство и увереност, че могат сами да стигнат до решение.",
              ]}
            />
          </div>
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Малки групи" title="Малки групи и индивидуално внимание" />
            <Paragraphs
              items={[
                "Всяко дете възприема технологиите по различен начин.",
                "В малка група можем да наблюдаваме как ученикът подхожда към задачите и да му помагаме точно там, където има затруднение.",
                "По-напредналите деца могат да получават допълнителни предизвикателства, а начинаещите имат достатъчно време да изградят стабилна основа.",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <SectionHeading eyebrow="Занятието" title="Как протича едно занятие?" />
            <Paragraphs
              items={["Занятията съчетават кратко обяснение с много практическа работа. Обикновено включват:"]}
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
            Така децата не остават пасивни слушатели, а постоянно прилагат наученото.
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
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-ink">Не просто работа с компютър</h2>
            <Paragraphs
              items={[
                "Целта ни не е детето просто да стане по-добро в използването на устройства.",
                "Искаме то да започне да разбира технологиите и да ги използва като инструмент за създаване.",
                "От първата идея до първия работещ проект — всяка малка стъпка изгражда логика, увереност и желание за откриване.",
              ]}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export function ProgramiraneEnrollCTA() {
  return (
    <EnrollCTA
      title="Запишете детето си на програмиране"
      text="Свържете се с нас за информация относно възрастовите групи, програмата, графика и свободните места."
    />
  )
}
