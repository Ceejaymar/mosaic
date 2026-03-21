<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Mosaic Expo app. Here is a summary of changes made:

- **`app.config.js`** — Created from `app.json` with PostHog extras (`posthogProjectToken`, `posthogHost`) reading from environment variables via `process.env`.
- **`.env`** — Created with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (covered by `.gitignore`).
- **`src/config/posthog.ts`** — New PostHog client singleton configured via `expo-constants`, with lifecycle event capture, batching, and graceful no-op when token is missing.
- **`src/app/_layout.tsx`** — Wrapped app with `PostHogProvider` (autocapture touches, manual screen tracking) and added screen tracking via `usePathname` + `useGlobalSearchParams`.
- **`src/features/check-in/hooks/useCheckInForm.ts`** — Captures `check_in_saved` with mood, note, tag, and date properties.
- **`src/app/check-in/[id].tsx`** — Captures `check_in_updated` and `check_in_deleted` with entry metadata.
- **`src/app/(drawer)/(tabs)/index.tsx`** — Captures `check_in_sheet_opened` (funnel top) and `daily_limit_reached` when all 4 slots are filled.
- **`src/app/(drawer)/pages/security.tsx`** — Captures `app_lock_toggled`, `data_exported`, and `data_deleted`.
- **`src/app/(drawer)/pages/notifications.tsx`** — Captures `notification_toggled` with enabled state and reminder count.
- **`src/app/(drawer)/_layout.tsx`** — Captures `app_rated`, `app_shared`, and `feedback_opened` from the drawer.

## Events

| Event | Description | File |
|---|---|---|
| `check_in_saved` | User saves a new mood check-in | `src/features/check-in/hooks/useCheckInForm.ts` |
| `check_in_updated` | User saves edits to an existing mood entry | `src/app/check-in/[id].tsx` |
| `check_in_deleted` | User permanently deletes a mood entry | `src/app/check-in/[id].tsx` |
| `check_in_sheet_opened` | User opens the mood check-in sheet (top of funnel) | `src/app/(drawer)/(tabs)/index.tsx` |
| `daily_limit_reached` | User has completed all 4 check-ins for the day | `src/app/(drawer)/(tabs)/index.tsx` |
| `notification_toggled` | User enables or disables daily reminder notifications | `src/app/(drawer)/pages/notifications.tsx` |
| `app_lock_toggled` | User enables or disables biometric/passcode app lock | `src/app/(drawer)/pages/security.tsx` |
| `data_exported` | User exports their mood data as a CSV file | `src/app/(drawer)/pages/security.tsx` |
| `data_deleted` | User permanently deletes all their mood data (churn signal) | `src/app/(drawer)/pages/security.tsx` |
| `app_rated` | User taps Rate Mosaic from the drawer | `src/app/(drawer)/_layout.tsx` |
| `app_shared` | User taps Share with a friend from the drawer | `src/app/(drawer)/_layout.tsx` |
| `feedback_opened` | User opens the feedback survey | `src/app/(drawer)/_layout.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/350824/dashboard/1384237
- **Check-In Funnel** (sheet opened → saved): https://us.posthog.com/project/350824/insights/W7FVcJhg
- **Daily Check-In Activity** (saved vs deleted trend): https://us.posthog.com/project/350824/insights/MdP6IW54
- **Churn Signals** (data deleted + exported): https://us.posthog.com/project/350824/insights/stP6gsCM
- **Notification & App Lock Adoption:** https://us.posthog.com/project/350824/insights/XWgQDOdo
- **Sharing & Feedback:** https://us.posthog.com/project/350824/insights/vidt8F2J

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
