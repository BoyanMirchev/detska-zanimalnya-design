import type { PriceCategory } from "@/lib/pricing/types"

/**
 * One-time migration source: the prices that were hardcoded in the page files.
 * Rows are inserted with ON CONFLICT DO NOTHING, so after the first run the
 * database (edited through /admin/ceni) is the only source of truth and these
 * values are never re-applied over admin changes.
 */
type SeedRow = {
  key: string
  label: string
  note?: string
  regular: string
  bgn?: string
  installments?: number
}

type SeedGroup = {
  key: string
  service_name: string
  category: PriceCategory
  page_path: string
  title: string
  note?: string
  rows: SeedRow[]
}

export const PRICE_SEED: SeedGroup[] = [
  {
    key: "zanimalnya-uchebna",
    service_name: "Учебна занималня 1.–7. клас",
    category: "Занималня",
    page_path: "/zanimalnya/uchebna",
    title: "Такси — учебна занималня 1.–7. клас",
    rows: [
      { key: "uchebna-mesechna-1-4", label: "Месечна такса за деца от 1 до 4 клас", regular: "220" },
      {
        key: "uchebna-mesechna-5-7",
        label: "Месечна такса за деца от 5 до 7 клас",
        note: "включва полудневно, целодневно, онлайн обучение и всички ваканции без лятно училище",
        regular: "245",
      },
      { key: "uchebna-sedmichna", label: "Седмична такса", regular: "140" },
      { key: "uchebna-celodnevna", label: "Целодневна такса", regular: "35" },
      { key: "uchebna-poludnevna", label: "Полудневна такса", regular: "30" },
    ],
  },
  {
    key: "zanimalnya-liatna",
    service_name: "Лятна занималня",
    category: "Занималня",
    page_path: "/zanimalnya/liatna",
    title: "Такси за лятна занималня",
    rows: [
      { key: "liatna-sedmichna", label: "Седмична такса", regular: "120" },
      { key: "liatna-sedmichna-polovin", label: "Седмична такса при половин присъствен ден", regular: "105" },
      { key: "liatna-ednodnevna", label: "Еднодневна такса", regular: "35" },
      { key: "liatna-ednodnevna-polovin", label: "Еднодневна такса при половин присъствен ден", regular: "30" },
      { key: "liatna-mesechna", label: "Месечна такса", note: "без право на връщане", regular: "410" },
      { key: "liatna-mesechna-polovin", label: "Месечна такса при половин присъствен ден", note: "до 13 ч", regular: "310" },
      { key: "liatna-chasova", label: "Почасова такса", note: "на час", regular: "15" },
    ],
  },
  {
    key: "zanimalnya-preduchilishtna",
    service_name: "Предучилищна група 5–7 години",
    category: "Занималня",
    page_path: "/zanimalnya/preduchilishtna",
    title: "Такси — предучилищна група 5–7 години",
    rows: [
      { key: "preduchilishtna-mesechna", label: "Месечна такса", regular: "430" },
      { key: "preduchilishtna-mesechna-polovin", label: "Месечна такса при половин присъствен ден", regular: "300" },
      { key: "preduchilishtna-sedmichna", label: "Седмична такса", regular: "135" },
      { key: "preduchilishtna-sedmichna-polovin", label: "Седмична такса при половин присъствен ден", regular: "110" },
      { key: "preduchilishtna-dnevna", label: "Дневна такса", regular: "35" },
      { key: "preduchilishtna-poludnevna", label: "Полудневна такса", regular: "30" },
    ],
  },
  {
    key: "kurs-angliyski",
    service_name: "Английски език",
    category: "Курсове",
    page_path: "/kursove/angliyski",
    title: "Цени и отстъпки",
    note: "При брат или сестра от същото семейство се ползва 10% отстъпка за второто дете при заплащане на месечна такса. Месечната такса е на база календарен месец и пропуснати часове не се прехвърлят.",
    rows: [
      { key: "angliyski-poseshtenie", label: "Еднократно посещение", regular: "15", bgn: "29.33" },
      { key: "angliyski-mesec", label: "Еднократно заплащане за месец", regular: "80", bgn: "156.47" },
      { key: "angliyski-godina", label: "Заплащане за целия курс (на година)", note: "8 месеца", regular: "555", bgn: "1085.80" },
      {
        key: "angliyski-razsrocheno",
        label: "Разсрочено заплащане на целия курс",
        note: "3 равни вноски – при започване, м. ноември и м. февруари",
        regular: "195",
        bgn: "380",
        installments: 3,
      },
    ],
  },
  {
    key: "kurs-shah",
    service_name: "Шах",
    category: "Курсове",
    page_path: "/kursove/shah",
    title: "Цени за курса по шах",
    note: "Месечната такса е на база календарен месец и пропуснати часове не се прехвърлят.",
    rows: [
      { key: "shah-mesechna-2", label: "Месечна такса – 2 пъти седмично", regular: "52", bgn: "101.73" },
      { key: "shah-mesechna-1", label: "Месечна такса – 1 път седмично", regular: "42", bgn: "82.17" },
      { key: "shah-urok", label: "Цена на един урок", regular: "15", bgn: "29.35" },
    ],
  },
  {
    key: "kurs-programirane",
    service_name: "Програмиране",
    category: "Курсове",
    page_path: "/programirane",
    title: "Цени за курса по програмиране",
    note: "За братя и сестри – 10% намаление от втората такса.",
    rows: [
      { key: "programirane-mesec", label: "Такса за един месец", regular: "85", bgn: "166.29" },
      { key: "programirane-nivo", label: "Пакетна цена за едно ниво", note: "4 модула / 4 месеца", regular: "310", bgn: "606.48" },
    ],
  },
]
