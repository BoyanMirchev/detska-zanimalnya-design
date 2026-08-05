export type NavChild = {
  label: string
  short: string
  href: string
  age: string
}

export type NavItem = {
  label: string
  href: string
  children?: NavChild[]
}

export const zanimalnyaChildren: NavChild[] = [
  {
    label: "Учебна занималня за деца 1–7 клас",
    short: "Учебна занималня",
    age: "1.–7. клас",
    href: "/zanimalnya/uchebna",
  },
  {
    label: "Предучилищна група 5–7 години",
    short: "Предучилищна група",
    age: "5–7 години",
    href: "/zanimalnya/preduchilishtna",
  },
  {
    label: "Лятна занималня",
    short: "Лятна занималня",
    age: "5–12 години",
    href: "/zanimalnya/liatna",
  },
]

export const kursoveChildren: NavChild[] = [
  {
    label: "Шах за деца",
    short: "Шах",
    age: "над 5 г.",
    href: "/kursove/shah",
  },
  {
    label: "Английски език",
    short: "Английски",
    age: "Pre A1 – B2",
    href: "/kursove/angliyski",
  },
  {
    label: "Предприемачество и финанси",
    short: "Предприемачество",
    age: "10–14 г.",
    href: "/kursove/predpriemachestvo",
  },
]

export const navItems: NavItem[] = [
  { label: "Начало", href: "/" },
  { label: "Занималня", href: "/zanimalnya/uchebna", children: zanimalnyaChildren },
  { label: "Курсове", href: "/kursove", children: kursoveChildren },
  { label: "Програмиране", href: "/programirane" },
  { label: "Плащане", href: "/plashtane" },
  { label: "Полезно", href: "/polezno" },
  { label: "За нас", href: "/za-nas" },
]

export const contact = {
  phonePrimary: "088 667 9774",
  phonePrimaryHref: "tel:+359886679774",
  phoneSecondary: "088 882 7634",
  phoneSecondaryHref: "tel:+359888827634",
  hours: "07:30 – 19:00",
}
