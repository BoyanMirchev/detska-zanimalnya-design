import type { Metadata } from "next"
import { CoursePage } from "@/components/course-page"
import { PredpriemachestvoContent, PredpriemachestvoEnrollCTA } from "@/components/predpriemachestvo-content"

export const metadata: Metadata = {
  title: "Предприемачество и финанси за деца в София",

  description:
    "Курс по предприемачество и финансова грамотност за деца от 10 до 14 години в София. Практически знания за бизнес, финанси, маркетинг и икономика.",

  alternates: {
    canonical: "/kursove/predpriemachestvo",
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "Предприемачество и финанси за деца в София | Хралупата",
    description:
      "Практически курс за деца от 10 до 14 години по предприемачество, финанси, маркетинг и бизнес.",
    url: "/kursove/predpriemachestvo",
  },
}

export default function PredpriemachestvoPage() {
  return (
    <CoursePage
      slug="predpriemachestvo"
      badge="За деца 10 – 14 г."
      title="Предприемачество и финанси за"
      highlight="деца"
      heroText="Предприемачеството учи децата да мислят самостоятелно, да търсят решения и да превръщат идеите си в конкретни проекти."
      heroImage="/images/predpriemachestvo-deca.png"
      heroImageAlt="Деца обсъждат бизнес идеи около маса, а момиче посочва схема с крушка на бяла дъска"
      intro={{
        eyebrow: "За курса",
        title: "От идея до реален проект",
        paragraphs: [
          "В „Хралупата“ подхождаме към темата по практичен и достъпен начин. Децата работят по собствени идеи, учат се да планират, да представят предложенията си и да разбират основни понятия, свързани с парите, бизнеса и работата в екип.",
          "Целта не е да превърнем всяко дете в бъдещ предприемач, а да му дадем умения, които ще са полезни независимо с какво реши да се занимава.",
        ],
      }}
      cta={<PredpriemachestvoEnrollCTA />}
      modules={{
        eyebrow: "Учебна програма",
        title: "Предприемачество и маркетинг в 5 модула.",
        items: [
          { title: "Бизнес основи", topics: ["Бизнес идея и реализация", "Пазар и пазарни механизми"] },
          { title: "Финанси", topics: ["Финансово планиране", "Приходи и разходи"] },
          { title: "Растеж", topics: ["Инвестиции", "Електронен бизнес"] },
          { title: "Дигитален свят", topics: ["Дигитален маркетинг", "Дигитален брандинг"] },
          {
            title: "Комуникация",
            topics: ["Маркетинг и реклама", "Бизнес комуникация и делова кореспонденция"],
          },
        ],
      }}
    >
      <PredpriemachestvoContent />
    </CoursePage>
  )
}
