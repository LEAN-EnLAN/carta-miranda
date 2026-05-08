# QA Checklist — diagnose-finish-project

## P0 Fixes
- [ ] Migration script ran without errors and `.data/carta-miranda.json.bak` exists
- [ ] All `authorId` and `userId` values are `leandro` (not `leo`)
- [ ] Login panel accent dots render with wine colors (no missing Tailwind classes)
- [ ] No `console.log` output in server logs during login

## Design System
- [ ] No `backdrop-blur`, `bg-white/45`, or `rounded-[1.35rem]` remains in UI
- [ ] Paper sheets have sharp corners (border-radius: 0)
- [ ] `.paper-sheet__edge` and `.paper-inset-border` no longer appear in DOM
- [ ] Buttons and inputs use flat borders (no gradients, no colored shadows)

## API & Navigation
- [ ] Creating a draft via dashboard form posts to `/api/drafts` (not `/api/letters`)
- [ ] Updating/publishing a letter uses `/api/drafts/[id]/update` and `/api/drafts/[id]/publish`
- [ ] No frontend links point to `/letters/` (plural)

## UX Completeness
- [ ] Draft cards show a "borrar" button with confirmation dialog
- [ ] Deleting a draft refreshes the feed/profile and the draft disappears
- [ ] Unread notification count badge appears in feed header when > 0
- [ ] Activity cards show "marcar como leída" button for unread items
- [ ] Marking a notification read refreshes the page and decreases the badge count
- [ ] `loading.tsx` shows a pulsing skeleton on slow route transitions
- [ ] `error.tsx` shows "Algo salió mal" with reintentar/volver buttons

## Polish
- [ ] Letter page renders Spotify iframe when `spotifyTrack` is set
- [ ] `<title>` updates to "Carta: {title}" on letter pages
- [ ] `<title>` updates to "{displayName} — Carta Miranda" on profile pages
- [ ] Spanish copy uses consistent voseo (Podés, Tenés, Todavía, última)
- [ ] No "post" labels — only "carta" / "borrador"
