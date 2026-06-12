# CloudBase Deploy Checklist

AppID: `wxe7fec94bbc002874`

CloudBase envId: `cloudbase-d0g4yo1qac1bbd1db`

## Local Checks

Run these from the repository root:

```bash
node scripts/check-cloud-contracts.cjs
node scripts/check-seed-data.cjs
node scripts/seed-cloud-data.cjs --dry-run
node scripts/check-cloud-functions.cjs
node scripts/check-page-routes.cjs
node scripts/check-miniapp-ui.cjs
node scripts/check-mvp-flow.cjs
node scripts/check-production-flow.cjs
```

## CloudBase Collections

Create these database collections:

- `users`
- `question_categories`
- `questions`
- `papers`
- `materials`
- `answer_records`
- `wrong_questions`
- `favorites`
- `notes`
- `study_reports`
- `memberships`
- `orders`
- `downloads`

Public learning content collections can allow public read for published data:

- `question_categories`
- `questions`
- `papers`
- `materials`

User private collections should be written through cloud functions:

- `users`
- `answer_records`
- `wrong_questions`
- `favorites`
- `notes`
- `study_reports`
- `orders`
- `downloads`

## Cloud Functions

Upload and deploy all directories under `cloudfunctions`:

- `login`
- `syncGuestData`
- `getHomeData`
- `getQuestionBank`
- `getPracticeSession`
- `saveAnswer`
- `toggleFavorite`
- `saveNote`
- `deleteNote`
- `getStudyData`
- `getMaterials`
- `getProfileData`

## Seed Data

Dry run:

```bash
node scripts/seed-cloud-data.cjs --dry-run
```

Upload after CloudBase credentials are configured:

```bash
$env:CLOUDBASE_ENV_ID='cloudbase-d0g4yo1qac1bbd1db'
node scripts/seed-cloud-data.cjs
```

The seed data is original simulated practice content. It is not copied from official exam papers.

## Manual Acceptance In WeChat DevTools

1. Compile the mini program and confirm there is no white screen.
2. Open Home and switch exam category.
3. Tap all 8 Home shortcuts and confirm each opens a real page.
4. Open Bank tabs: chapter, real-like papers, mock papers, memory notes.
5. Start a practice session, answer a question, favorite it, add a note, open answer card, and finish to result.
6. Open Wrong, Favorites, Notes, and Report to confirm user learning data renders.
7. Open Materials, material detail, favorite material, and tap learn to enter Downloads.
8. Open Profile, run login sync, then open Member Center, Orders, Downloads, My Materials, Settings, and Feedback.
9. Preview on a real phone and repeat guest-to-login sync.

## Known First-Release Boundary

Membership, orders, and downloads are clickable cloud-backed pages, but real WeChat Pay and protected file delivery are intentionally out of scope for this release.
