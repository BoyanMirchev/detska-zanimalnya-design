import { sql } from "@/lib/db"

/**
 * Idempotent, additive migration for the English placement testing module.
 * Mirrors the project's existing on-demand `ensure*Schema` convention: it never
 * drops or rewrites data and is safe to run on every server instance.
 * All tables use the `et_` prefix so they cannot collide with the existing
 * `students` / `payments` tables used for the занималня billing module.
 */
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS et_meta (
    key text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS et_students (
    id serial PRIMARY KEY,
    username text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT')),
    first_name text NOT NULL,
    last_name text NOT NULL,
    school_grade text,
    age_group text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS et_students_username_key ON et_students (lower(username))`,

  `CREATE TABLE IF NOT EXISTS et_sessions (
    id serial PRIMARY KEY,
    student_id int NOT NULL REFERENCES et_students(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS et_sessions_student_idx ON et_sessions (student_id)`,

  `CREATE TABLE IF NOT EXISTS et_rate_limits (
    id bigserial PRIMARY KEY,
    bucket text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS et_rate_limits_bucket_idx ON et_rate_limits (bucket, created_at)`,

  `CREATE TABLE IF NOT EXISTS et_recovery_requests (
    id serial PRIMARY KEY,
    username_entered text NOT NULL,
    student_id int REFERENCES et_students(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz
  )`,
  `CREATE INDEX IF NOT EXISTS et_recovery_requests_status_idx ON et_recovery_requests (status, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS et_password_reset_tokens (
    id serial PRIMARY KEY,
    student_id int NOT NULL REFERENCES et_students(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS et_levels (
    id serial PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    display_order int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS et_levels_name_key ON et_levels (lower(name))`,

  `CREATE TABLE IF NOT EXISTS et_categories (
    id serial PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS et_categories_name_key ON et_categories (lower(name))`,

  `CREATE TABLE IF NOT EXISTS et_questions (
    id serial PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('single', 'multiple', 'true_false')),
    text text NOT NULL,
    level_id int NOT NULL REFERENCES et_levels(id),
    category_id int REFERENCES et_categories(id),
    difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points int NOT NULL CHECK (points BETWEEN 1 AND 100),
    explanation text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    version int NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS et_questions_level_idx ON et_questions (level_id)`,
  // Categories were retired; the legacy column stays (nullable) so older deployments keep working during rollout.
  `ALTER TABLE et_questions ALTER COLUMN category_id DROP NOT NULL`,
  `CREATE INDEX IF NOT EXISTS et_questions_status_idx ON et_questions (status)`,

  `CREATE TABLE IF NOT EXISTS et_question_options (
    id serial PRIMARY KEY,
    question_id int NOT NULL REFERENCES et_questions(id) ON DELETE CASCADE,
    text text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false,
    display_order int NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS et_question_options_question_idx ON et_question_options (question_id)`,

  `CREATE TABLE IF NOT EXISTS et_tests (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    test_type text NOT NULL CHECK (test_type IN ('level', 'placement')),
    level_id int REFERENCES et_levels(id),
    duration_minutes int NOT NULL CHECK (duration_minutes BETWEEN 1 AND 300),
    question_count int NOT NULL CHECK (question_count BETWEEN 1 AND 200),
    selection_method text NOT NULL CHECK (selection_method IN ('manual', 'random')),
    selection_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    available_from timestamptz,
    available_until timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS et_tests_status_idx ON et_tests (status)`,
  // Optimistic-concurrency token: every admin save must present the version it loaded.
  `ALTER TABLE et_tests ADD COLUMN IF NOT EXISTS edit_version int NOT NULL DEFAULT 1`,

  `CREATE TABLE IF NOT EXISTS et_test_questions (
    id serial PRIMARY KEY,
    test_id int NOT NULL REFERENCES et_tests(id) ON DELETE CASCADE,
    question_id int NOT NULL REFERENCES et_questions(id),
    display_order int NOT NULL DEFAULT 0,
    UNIQUE (test_id, question_id)
  )`,
  `CREATE INDEX IF NOT EXISTS et_test_questions_question_idx ON et_test_questions (question_id)`,

  `CREATE TABLE IF NOT EXISTS et_placement_rules (
    id serial PRIMARY KEY,
    test_id int NOT NULL REFERENCES et_tests(id),
    rule_configuration jsonb NOT NULL,
    version int NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (test_id, version)
  )`,

  `CREATE TABLE IF NOT EXISTS et_attempts (
    id uuid PRIMARY KEY,
    student_id int NOT NULL REFERENCES et_students(id),
    test_id int NOT NULL REFERENCES et_tests(id),
    attempt_number int NOT NULL,
    status text NOT NULL CHECK (status IN ('in_progress', 'grading', 'submitted', 'expired')),
    started_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    submitted_at timestamptz,
    test_title text NOT NULL,
    test_type text NOT NULL,
    settings_snapshot jsonb NOT NULL,
    placement_rule_id int REFERENCES et_placement_rules(id),
    total_questions int NOT NULL,
    answered_count int,
    correct_count int,
    incorrect_count int,
    unanswered_count int,
    score int,
    max_score int,
    percentage numeric(5, 2),
    estimated_level text,
    placement_conclusive boolean,
    placement_details jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, test_id, attempt_number)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS et_attempts_one_active ON et_attempts (student_id, test_id) WHERE status IN ('in_progress', 'grading')`,
  `CREATE INDEX IF NOT EXISTS et_attempts_student_idx ON et_attempts (student_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS et_attempts_test_idx ON et_attempts (test_id)`,
  `CREATE INDEX IF NOT EXISTS et_attempts_status_idx ON et_attempts (status, expires_at)`,

  `CREATE TABLE IF NOT EXISTS et_attempt_questions (
    id serial PRIMARY KEY,
    attempt_id uuid NOT NULL REFERENCES et_attempts(id),
    original_question_id int REFERENCES et_questions(id) ON DELETE SET NULL,
    display_order int NOT NULL,
    question_snapshot jsonb NOT NULL,
    options_snapshot jsonb NOT NULL,
    grading_snapshot jsonb NOT NULL,
    is_correct boolean,
    earned_points int,
    UNIQUE (attempt_id, display_order)
  )`,
  `CREATE INDEX IF NOT EXISTS et_attempt_questions_original_idx ON et_attempt_questions (original_question_id)`,

  `CREATE TABLE IF NOT EXISTS et_student_answers (
    id serial PRIMARY KEY,
    attempt_id uuid NOT NULL REFERENCES et_attempts(id),
    attempt_question_id int NOT NULL UNIQUE REFERENCES et_attempt_questions(id),
    selected_option_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    answer_version bigint NOT NULL,
    saved_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS et_student_answers_attempt_idx ON et_student_answers (attempt_id)`,

  `CREATE TABLE IF NOT EXISTS et_retake_grants (
    id serial PRIMARY KEY,
    student_id int NOT NULL REFERENCES et_students(id),
    test_id int NOT NULL REFERENCES et_tests(id),
    extra_attempts int NOT NULL CHECK (extra_attempts BETWEEN 1 AND 10),
    reason text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS et_retake_grants_idx ON et_retake_grants (student_id, test_id)`,

  `CREATE TABLE IF NOT EXISTS et_admin_notes (
    id serial PRIMARY KEY,
    attempt_id uuid NOT NULL REFERENCES et_attempts(id),
    note text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS et_audit_logs (
    id bigserial PRIMARY KEY,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS et_audit_logs_entity_idx ON et_audit_logs (entity_type, entity_id)`,

  // Starting records are seeded once (guarded by et_meta) so admins can freely rename or archive them later.
  `WITH flag AS (INSERT INTO et_meta (key) VALUES ('seed_levels_v1') ON CONFLICT DO NOTHING RETURNING 1)
   INSERT INTO et_levels (name, description, display_order)
   SELECT v.name, v.description, v.ord FROM (VALUES
     ('Pre-A1', 'Starter — първи стъпки в езика', 1),
     ('A1', 'Beginner — начално ниво', 2),
     ('A2', 'Elementary — елементарно ниво', 3),
     ('B1', 'Intermediate — средно ниво', 4),
     ('B2', 'Upper Intermediate — над средното ниво', 5)
   ) AS v(name, description, ord)
   WHERE EXISTS (SELECT 1 FROM flag)
   ON CONFLICT DO NOTHING`,
  // Separately flagged so existing installs gain C1/C2 exactly once; ON CONFLICT also skips names an admin already created.
  `WITH flag AS (INSERT INTO et_meta (key) VALUES ('seed_levels_c1_c2_v1') ON CONFLICT DO NOTHING RETURNING 1),
   base AS (SELECT COALESCE(MAX(display_order), 0) AS max_order FROM et_levels)
   INSERT INTO et_levels (name, description, display_order)
   SELECT v.name, v.description, base.max_order + v.ord FROM base, (VALUES
     ('C1', 'Advanced — напреднало ниво', 1),
     ('C2', 'Proficiency — владеене на езика', 2)
   ) AS v(name, description, ord)
   WHERE EXISTS (SELECT 1 FROM flag)
   ON CONFLICT DO NOTHING`,
]

let ready: Promise<void> | null = null

export function ensureEnglishTestsSchema(): Promise<void> {
  if (!ready) {
    // A single non-interactive transaction keeps cold starts to one round trip.
    ready = sql
      .transaction(STATEMENTS.map((statement) => sql.query(statement)))
      .then(() => undefined)
      .catch((err) => {
      ready = null
      throw err
    })
  }
  return ready
}
