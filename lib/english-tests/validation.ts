import {
  DEFAULT_TEST_SETTINGS,
  DIFFICULTIES,
  QUESTION_STATUSES,
  QUESTION_TYPES,
  SELECTION_METHODS,
  TEST_TYPES,
  type Difficulty,
  type PlacementRuleConfig,
  type QuestionStatus,
  type QuestionType,
  type SelectionConfig,
  type SelectionMethod,
  type TestSettings,
  type TestType,
} from "./types"

export type Errors = Record<string, string>
export type Validated<T> = { ok: true; data: T } | { ok: false; errors: Errors }

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const int = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(str(v))
  return Number.isInteger(n) ? n : NaN
}
const idList = (v: unknown) =>
  Array.isArray(v) ? [...new Set(v.map(Number).filter((n) => Number.isInteger(n) && n > 0))] : []

/* ---------- Students ---------- */

export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,28})[a-z0-9]$/

export function normalizeUsername(value: unknown) {
  return str(value).toLowerCase()
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) {
    return "Потребителското име трябва да е 3–30 символа: латински букви, цифри, точка, тире или долна черта."
  }
  return null
}

export function validatePassword(password: string, username?: string): string | null {
  if (password.length < 8) return "Паролата трябва да е поне 8 символа."
  if (password.length > 128) return "Паролата е твърде дълга."
  if (!/[a-zA-Zа-яА-Я]/.test(password) || !/\d/.test(password)) return "Паролата трябва да съдържа букви и цифри."
  if (username && password.toLowerCase().includes(username)) return "Паролата не трябва да съдържа потребителското име."
  return null
}

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]{0,49}$/u

export type RegistrationInput = {
  firstName: string
  lastName: string
  username: string
  password: string
  schoolGrade: string | null
  ageGroup: string | null
}

export const SCHOOL_GRADES = ["Предучилищна", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
export const AGE_GROUPS = ["5–6 г.", "7–9 г.", "10–12 г.", "13–15 г.", "16+ г."]

export function validateRegistration(form: FormData): Validated<RegistrationInput> {
  const errors: Errors = {}
  const firstName = str(form.get("firstName"))
  const lastName = str(form.get("lastName"))
  const username = normalizeUsername(form.get("username"))
  const password = String(form.get("password") ?? "")
  const confirm = String(form.get("confirmPassword") ?? "")
  const schoolGrade = str(form.get("schoolGrade")) || null
  const ageGroup = str(form.get("ageGroup")) || null

  if (!NAME_PATTERN.test(firstName)) errors.firstName = "Въведете валидно име."
  if (!NAME_PATTERN.test(lastName)) errors.lastName = "Въведете валидна фамилия."
  const usernameError = validateUsername(username)
  if (usernameError) errors.username = usernameError
  const passwordError = validatePassword(password, username)
  if (passwordError) errors.password = passwordError
  if (password !== confirm) errors.confirmPassword = "Паролите не съвпадат."
  if (schoolGrade && !SCHOOL_GRADES.includes(schoolGrade)) errors.schoolGrade = "Невалиден клас."
  if (ageGroup && !AGE_GROUPS.includes(ageGroup)) errors.ageGroup = "Невалидна възрастова група."

  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, data: { firstName, lastName, username, password, schoolGrade, ageGroup } }
}

/* ---------- Levels & categories ---------- */

export function validateLevel(input: { name: unknown; description: unknown; displayOrder: unknown }) {
  const errors: Errors = {}
  const name = str(input.name)
  const description = str(input.description)
  const displayOrder = int(input.displayOrder)
  if (!name || name.length > 30) errors.name = "Името е задължително (до 30 символа)."
  if (description.length > 300) errors.description = "Описанието е твърде дълго."
  if (Number.isNaN(displayOrder) || displayOrder < 0 || displayOrder > 1000) errors.displayOrder = "Невалиден ред."
  if (Object.keys(errors).length) return { ok: false as const, errors }
  return { ok: true as const, data: { name, description, displayOrder } }
}

export function validateCategory(input: { name: unknown; description: unknown }) {
  const errors: Errors = {}
  const name = str(input.name)
  const description = str(input.description)
  if (!name || name.length > 50) errors.name = "Името е задължително (до 50 символа)."
  if (description.length > 300) errors.description = "Описанието е твърде дълго."
  if (Object.keys(errors).length) return { ok: false as const, errors }
  return { ok: true as const, data: { name, description } }
}

/* ---------- Questions ---------- */

export type QuestionInput = {
  type: QuestionType
  text: string
  levelId: number
  categoryId: number
  difficulty: Difficulty
  points: number
  explanation: string | null
  status: QuestionStatus
  options: { text: string; isCorrect: boolean }[]
}

export function validateQuestion(raw: Record<string, unknown>): Validated<QuestionInput> {
  const errors: Errors = {}
  const type = str(raw.type) as QuestionType
  const text = str(raw.text)
  const levelId = int(raw.levelId)
  const categoryId = int(raw.categoryId)
  const difficulty = str(raw.difficulty) as Difficulty
  const points = int(raw.points)
  const explanation = str(raw.explanation) || null
  const status = (str(raw.status) || "active") as QuestionStatus
  const rawOptions = Array.isArray(raw.options) ? raw.options : []
  const options = rawOptions.map((o) => ({
    text: str((o as Record<string, unknown>)?.text),
    isCorrect: Boolean((o as Record<string, unknown>)?.isCorrect),
  }))

  if (!QUESTION_TYPES.includes(type)) errors.type = "Невалиден тип въпрос."
  if (!text) errors.text = "Текстът на въпроса е задължителен."
  else if (text.length > 2000) errors.text = "Текстът е твърде дълъг (до 2000 символа)."
  if (!(levelId > 0)) errors.levelId = "Изберете ниво."
  if (!(categoryId > 0)) errors.categoryId = "Изберете категория."
  if (!DIFFICULTIES.includes(difficulty)) errors.difficulty = "Изберете трудност."
  if (Number.isNaN(points) || points < 1 || points > 100) errors.points = "Точките трябва да са цяло число от 1 до 100."
  if (explanation && explanation.length > 2000) errors.explanation = "Обяснението е твърде дълго."
  if (!QUESTION_STATUSES.includes(status)) errors.status = "Невалиден статус."

  const correctCount = options.filter((o) => o.isCorrect).length
  if (options.some((o) => !o.text)) errors.options = "Всички отговори трябва да имат текст."
  else if (options.some((o) => o.text.length > 500)) errors.options = "Отговорът е твърде дълъг (до 500 символа)."
  else if (new Set(options.map((o) => o.text.toLowerCase())).size !== options.length)
    errors.options = "Отговорите трябва да са различни."
  else if (type === "true_false") {
    if (options.length !== 2) errors.options = "Въпросът Вярно/Невярно има точно 2 отговора."
    else if (correctCount !== 1) errors.options = "Маркирайте точно един верен отговор."
  } else if (type === "single") {
    if (options.length < 2 || options.length > 8) errors.options = "Добавете между 2 и 8 отговора."
    else if (correctCount !== 1) errors.options = "Маркирайте точно един верен отговор."
  } else if (type === "multiple") {
    if (options.length < 3 || options.length > 8) errors.options = "Добавете между 3 и 8 отговора."
    else if (correctCount < 2) errors.options = "Маркирайте поне два верни отговора."
    else if (correctCount === options.length) errors.options = "Поне един отговор трябва да е грешен."
  }

  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    data: { type, text, levelId, categoryId, difficulty, points, explanation, status, options },
  }
}

/* ---------- Tests ---------- */

export type TestInput = {
  title: string
  description: string
  testType: TestType
  levelId: number | null
  durationMinutes: number
  questionCount: number
  selectionMethod: SelectionMethod
  selectionConfig: SelectionConfig
  questionIds: number[]
  settings: TestSettings
  availableFrom: string | null
  availableUntil: string | null
}

function parseDate(v: unknown): string | null | "invalid" {
  const s = str(v)
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? "invalid" : d.toISOString()
}

export function parseSettings(raw: unknown): TestSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const bool = (key: keyof TestSettings) =>
    typeof r[key] === "boolean" ? (r[key] as boolean) : (DEFAULT_TEST_SETTINGS[key] as boolean)
  const maxAttempts = int(r.maxAttempts)
  const cooldownHours = int(r.cooldownHours)
  return {
    shuffleQuestions: bool("shuffleQuestions"),
    shuffleOptions: bool("shuffleOptions"),
    allowBack: bool("allowBack"),
    allowAnswerChange: bool("allowAnswerChange"),
    maxAttempts: Number.isNaN(maxAttempts) ? DEFAULT_TEST_SETTINGS.maxAttempts : Math.min(Math.max(maxAttempts, 0), 50),
    cooldownHours: Number.isNaN(cooldownHours) ? 0 : Math.min(Math.max(cooldownHours, 0), 24 * 365),
    showScore: bool("showScore"),
    showCorrectAnswers: bool("showCorrectAnswers"),
    showLevel: bool("showLevel"),
    multipleAnswerPolicy: "all_or_nothing",
  }
}

export function parseSelectionConfig(raw: unknown): SelectionConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const allocations = Array.isArray(r.allocations)
    ? r.allocations
        .map((a) => ({ levelId: int((a as Record<string, unknown>)?.levelId), count: int((a as Record<string, unknown>)?.count) }))
        .filter((a) => a.levelId > 0 && a.count > 0 && a.count <= 200)
    : []
  return {
    levelIds: idList(r.levelIds),
    categoryIds: idList(r.categoryIds),
    difficulties: Array.isArray(r.difficulties)
      ? (r.difficulties.filter((d) => DIFFICULTIES.includes(d as Difficulty)) as Difficulty[])
      : [],
    allocations,
  }
}

export function validateTest(raw: Record<string, unknown>): Validated<TestInput> {
  const errors: Errors = {}
  const title = str(raw.title)
  const description = str(raw.description)
  const testType = str(raw.testType) as TestType
  const levelIdRaw = int(raw.levelId)
  const levelId = levelIdRaw > 0 ? levelIdRaw : null
  const durationMinutes = int(raw.durationMinutes)
  const selectionMethod = str(raw.selectionMethod) as SelectionMethod
  const selectionConfig = parseSelectionConfig(raw.selectionConfig)
  const questionIds = idList(raw.questionIds)
  const settings = parseSettings(raw.settings)
  const availableFrom = parseDate(raw.availableFrom)
  const availableUntil = parseDate(raw.availableUntil)
  let questionCount = int(raw.questionCount)

  if (!title || title.length > 150) errors.title = "Заглавието е задължително (до 150 символа)."
  if (description.length > 2000) errors.description = "Описанието е твърде дълго."
  if (!TEST_TYPES.includes(testType)) errors.testType = "Изберете тип тест."
  if (testType === "level" && !levelId) errors.levelId = "Изберете нивото, което тестът проверява."
  if (Number.isNaN(durationMinutes) || durationMinutes < 1 || durationMinutes > 300)
    errors.durationMinutes = "Времето трябва да е между 1 и 300 минути."
  if (!SELECTION_METHODS.includes(selectionMethod)) errors.selectionMethod = "Изберете метод за подбор."
  if (selectionMethod === "manual") {
    questionCount = questionIds.length
    if (questionIds.length > 200) errors.questionIds = "Максимум 200 въпроса."
  } else if (Number.isNaN(questionCount) || questionCount < 1 || questionCount > 200) {
    errors.questionCount = "Броят въпроси трябва да е между 1 и 200."
  }
  if (availableFrom === "invalid") errors.availableFrom = "Невалидна дата."
  if (availableUntil === "invalid") errors.availableUntil = "Невалидна дата."
  if (availableFrom && availableUntil && availableFrom !== "invalid" && availableUntil !== "invalid" && availableFrom >= availableUntil)
    errors.availableUntil = "Крайната дата трябва да е след началната."

  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    data: {
      title,
      description,
      testType,
      levelId,
      durationMinutes,
      questionCount: Math.max(questionCount, 0),
      selectionMethod,
      selectionConfig,
      questionIds,
      settings,
      availableFrom: availableFrom as string | null,
      availableUntil: availableUntil as string | null,
    },
  }
}

export function validatePlacementRules(
  raw: unknown,
  knownLevels: Map<number, string>,
): Validated<PlacementRuleConfig> {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const errors: Errors = {}
  const minTotalAnswered = int(r.minTotalAnswered)
  const rawLevels = Array.isArray(r.levels) ? r.levels : []
  const seen = new Set<number>()
  const levels: PlacementRuleConfig["levels"] = []

  for (const item of rawLevels) {
    const o = (item ?? {}) as Record<string, unknown>
    const levelId = int(o.levelId)
    const minQuestions = int(o.minQuestions)
    const minPercent = Number(o.minPercent)
    const levelName = knownLevels.get(levelId)
    if (!levelName || seen.has(levelId)) {
      errors.levels = "Всяко ниво може да присъства само веднъж и трябва да съществува."
      continue
    }
    if (Number.isNaN(minQuestions) || minQuestions < 1 || minQuestions > 100) {
      errors.levels = "Минималният брой въпроси за ниво трябва да е между 1 и 100."
      continue
    }
    if (!Number.isFinite(minPercent) || minPercent < 1 || minPercent > 100) {
      errors.levels = "Прагът трябва да е между 1 и 100%."
      continue
    }
    seen.add(levelId)
    levels.push({ levelId, levelName, minQuestions, minPercent })
  }

  if (Number.isNaN(minTotalAnswered) || minTotalAnswered < 0 || minTotalAnswered > 200)
    errors.minTotalAnswered = "Невалиден минимален брой отговорени въпроси."

  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, data: { levels, minTotalAnswered } }
}
