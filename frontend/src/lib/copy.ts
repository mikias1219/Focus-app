/** Friendly microcopy so business rules stay understandable without cluttering the UI. */

export const COPY = {
  brandTagline: "Track today without thinking twice.",

  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to open your Today board and tasks.",
    registerTitle: "Join FocusFlow",
    registerSubtitle: "Create an account to plan tasks and track focus in one calm place.",
    loginCta: "Sign in",
    registerCta: "Create account",
    footerLoginPrompt: "No account yet?",
    footerRegisterPrompt: "Already registered?",
    footerLoginLink: "Create one",
    footerRegisterLink: "Sign in instead",
    passwordMinHint: "Use at least 8 characters.",
  },

  nav: {
    home: "Today",
    tasks: "My tasks",
    focus: "Focus timer",
    analytics: "Numbers",
    history: "Past sessions",
    settings: "You",
  },

  tasks: {
    panelTitle: "My tasks",
    panelSubtitle: "Add what you want to do today. Pick how long you think it will take.",
    duplicateHint:
      "Each task needs a unique name — pick a slightly different title if you see an error.",
    filtersHint:
      "Shown by default: tasks due or created today. Expand “More views” for week, month, or everything.",
    createButton: "Add task",
    focusRecordingHint:
      "Starting focus begins a session; stopping saves that stretch of time on the task. Pause only freezes the on-screen timer.",
    searchPlaceholder: "Find a task…",
    todayChip: "This week",
    monthChip: "Month",
    allChip: "Everything",
  },

  dashboard: {
    heroTitle: "Your day",
    heroSubtitle:
      "Three steps: pick a task → tap Start focus → tap Stop when you finish. We record real time.",
    tasksTitle: "Today",
    tasksSubtitle: "Tap Start focus on one task at a time.",
    cockpitTitle: "Focus timer",
    cockpitSubtitle: "Elapsed time is saved when you stop. Pause only affects this screen — your session stays active.",
    statsTitle: "Today at a glance",
    statsSubtitle: "Rough scores — they reward realistic timing, not rushing.",

    /** Plain-language scoring (matches backend analytics.service.ts intent). */
    scoringRules: [
      "Score mixes finished tasks, total focus minutes, fewer distractions, and how close real time was to your estimate.",
      "~1.0 means your actual time matched your plan. Finishing very fast vs a long estimate lowers the bonus — we assume honest estimates.",
      "Numbers update after you complete focus sessions and finish tasks.",
    ],

    emptyTasks: "No tasks yet — add one under My tasks.",
    quickLinkTasks: "Open My tasks",
  },

  focus: {
    subtitle: "Large timer while you work. Log interruptions without leaving.",
  },

  analytics: {
    subtitle: "Simple charts — detailed History has each session.",
    ratioHint: "Closer to 1 usually means your estimates matched reality.",
  },

  history: {
    subtitle: "Card view — no spreadsheets. Filter when you need to dig in.",
  },

  settings: {
    subtitle: "Profile and preferences. Email reminders and alarms will plug in here later.",
  },

  future: {
    reminders:
      "Coming later: email nudges and alarms so you don’t forget to start a task.",
    aiInsights:
      "Coming later: AI suggestions based on your patterns — optional and easy to ignore.",
  },
} as const;
