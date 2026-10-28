export const QUESTION_TYPES = ["single", "multiple", "true_false"] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export const DIFFICULTIES = ["easy", "medium", "hard"] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const QUESTION_STATUSES = ["active", "inactive", "archived"] as const
export type QuestionStatus = (typeof QUESTION_STATUSES)[number]

export const TEST_TYPES = ["level", "placement"] as const
export type TestType = (typeof TEST_TYPES)[number]

export const TEST_STATUSES = ["draft", "published", "unpublished", "archived"] as const
export type TestStatus = (typeof TEST_STATUSES)[number]

export const SELECTION_METHODS = ["manual", "random"] as const
export type SelectionMethod = (typeof SELECTION_METHODS)[number]

export type AttemptStatus = "in_progress" | "grading" | "submitted" | "expired"

export type TestSettings = {
  shuffleQuestions: boolean
  shuffleOptions: boolean
  allowBack: boolean
  allowAnswerChange: boolean
  /** 0 means unlimited attempts. */
  maxAttempts: number
  cooldownHours: number
  showScore: boolean
  showCorrectAnswers: boolean
  showLevel: boolean
  /** Explicit policy for multiple-answer questions. Only all-or-nothing is supported. */
  multipleAnswerPolicy: "all_or_nothing"
}

export const DEFAULT_TEST_SETTINGS: TestSettings = {
  shuffleQuestions: true,
  shuffleOptions: false,
  allowBack: true,
  allowAnswerChange: true,
  maxAttempts: 1,
  cooldownHours: 0,
  showScore: true,
  showCorrectAnswers: false,
  showLevel: true,
  multipleAnswerPolicy: "all_or_nothing",
}

export type LevelAllocation = { levelId: number; count: number }

export type SelectionConfig = {
  levelIds: number[]
  difficulties: Difficulty[]
  allocations: LevelAllocation[]
}

export const EMPTY_SELECTION_CONFIG: SelectionConfig = {
  levelIds: [],
  difficulties: [],
  allocations: [],
}

export type PlacementLevelRule = {
  levelId: number
  levelName: string
  /** Minimum number of questions of this level that must appear to judge it. */
  minQuestions: number
  /** Minimum percentage of this level's points required to pass it. */
  minPercent: number
  /** score_bands: inclusive upper bound of the overall score range. */
  maxPercent?: number
}

export type PlacementMode = "score_bands" | "per_level"

export type PlacementRuleConfig = {
  /**
   * score_bands: minPercent is the overall test score from which the level starts.
   * per_level (legacy default): each level is judged on its own questions.
   */
  mode?: PlacementMode
  /** Ordered from the lowest to the highest level. */
  levels: PlacementLevelRule[]
  /** Minimum number of answered questions overall before any placement is attempted. */
  minTotalAnswered: number
}

export type QuestionSnapshot = {
  text: string
  type: QuestionType
  points: number
  levelId: number | null
  levelName: string | null
  difficulty: Difficulty
}

export type OptionSnapshot = { id: number; text: string }

/** Server-only. Never serialise to a student before the attempt is finalised. */
export type GradingSnapshot = {
  correctOptionIds: number[]
  explanation: string | null
}

export const LABELS = {
  questionType: { single: "Един верен отговор", multiple: "Няколко верни отговора", true_false: "Вярно / Невярно" },
  difficulty: { easy: "Лесен", medium: "Среден", hard: "Труден" },
  questionStatus: { active: "Активен", inactive: "Неактивен", archived: "Архивиран" },
  testType: { level: "Тест за конкретно ниво", placement: "Входящ (общ) тест" },
  testStatus: { draft: "Чернова", published: "Публикуван", unpublished: "Скрит", archived: "Архивиран" },
  selectionMethod: { manual: "Ръчен избор", random: "Случаен избор" },
  attemptStatus: {
    in_progress: "В процес",
    grading: "Оценява се",
    submitted: "Предаден",
    expired: "Изтекло време",
  },
} as const

export const INCONCLUSIVE_MESSAGE = "Необходимо е допълнително оценяване."
