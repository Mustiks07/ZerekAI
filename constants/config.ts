export const Config = {
  // ─── Quiz Settings ──────────────────────────────
  QUESTIONS_PER_QUIZ: 10,
  QUIZ_TIME_SECONDS: 600, // 10 minutes
  AUTO_ADVANCE_DELAY: 1500, // ms after correct answer

  // ─── UBT Settings ──────────────────────────────
  UBT_TOTAL_QUESTIONS: 120,
  UBT_TIME_MINUTES: 240, // 4 hours
  UBT_SUBJECTS_REQUIRED: 5,

  // ─── XP Values ─────────────────────────────────
  XP_CORRECT_ANSWER: 10,
  XP_PERFECT_QUIZ: 50,
  XP_STREAK_BONUS: 20,
  XP_FIRST_ATTEMPT: 30,

  // ─── API ───────────────────────────────────────
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
  AI_MODEL: 'anthropic/claude-3-haiku',
  AI_MAX_TOKENS: 300,

  // ─── App ───────────────────────────────────────
  APP_NAME: 'ZerekAI',
  MIN_SUBJECTS: 2,
  GOAL_SCORE_MIN: 50,
  GOAL_SCORE_MAX: 140,
} as const;
