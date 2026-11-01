# Terracove (formerly SoloDesk) — context history, October 2026

The working history behind the app: what was built, what was tried and dropped, what broke and how it was fixed,
the decisions that now constrain the codebase, and what is still open. It covers 25–27 October 2026, from the
1.01 mobile fixes to 1.24. Release-by-release notes for users live in [CHANGELOG.md](../CHANGELOG.md) and in the
app (Settings → What's new). **Read §1, §2 and §7 first if you are picking this project up cold.**

---

## 1. Where things stand (27 Oct 2026)

| | |
|---|---|
| **Name** | **Terracove** (renamed from SoloDesk in 1.13) |
| **Live** | **1.26** — https://terracove.web.app (the old address https://taskflow-solodesk.web.app redirects there) |
| **Repo** | `D:\Projects\Terracove`, branch `main`, GitHub `AdityaManojA/Terracove`, tags `v1.02`…`v1.20` |
| **Stack** | React 18 + Vite (Lightning CSS minifier), Firebase Auth / Firestore / Hosting, hash routes |
| **Sister app** | **Levern** (formerly TaskFlow) — https://getlevern.web.app, repo `D:\Projects\TaskFlow-controls`, owned by another session. Terracove's UI says Levern; code keeps `taskflow*` names |
| **Firebase** | Project `taskflow-dailytracker` (shared with Levern). Hosting targets in `.firebaserc`: **`terracove` → site `terracove` (the app)**, `solodesk` → site `taskflow-solodesk` (serves only `legacy/`, a redirect). **Spark plan** (Blaze expected ~mid-Nov 2026) |
| **Auth** | Sign-in through `taskflow-dailytracker.firebaseapp.com` (authDomain). Authorized domains include `terracove.web.app`, `localhost`, the Levern domains; `taskflow-solodesk.web.app` was removed |
| **Tests** | 175 passing — `npm test` (node --test functions/*.test.js); `npm run check` = tests + build |
| **Rules** | `firestore.rules`, shared with Levern; Levern's copy `D:\Projects\TaskFlow-controls\firestore.rules` must stay identical |
| **Design** | Figma file `bnt8lsuv1xdCg4xHFitxvZ`, page 68:234 (see §9) |

**Release checklist** (every user-facing change):
1. Entry in `src/changelog.js` (newest first; `released:false` while building, then `released:true` + date).
2. `functions/changelog.test.js`: bump `currentVersion()` and the `shouldShowUpdate` lines.
3. `package.json` version (1.20 → `1.2.0`), `CHANGELOG.md`, README "Current version" + "What's new in …".
4. `npm test`, `npm run build`, then **check the built CSS** for things the minifier may have changed (see §5, blur).
5. Commit everything except `firestore.rules` (unless rules changed) and `.claude/`; tag `vX.YY`; `git push origin main --follow-tags`.
6. Deploy (allowed by the user for this project, when they ask for it):
```
firebase deploy --only hosting:terracove --project taskflow-dailytracker --account aditya.dev.org@gmail.com
firebase deploy --only firestore:rules   --project taskflow-dailytracker --account aditya.dev.org@gmail.com   # only when rules change, first
```
Never deploy the app to `hosting:solodesk` again (it is the redirect), and never deploy Levern's Hosting or functions from here.
7. Verify live: fetch the JS chunks and grep for `` version:`X.YY`,released:!0 `` and a string from the change.

---

## 2. Standing decisions and constraints

Keep these unless the user says otherwise.

- **Design direction B, Terracotta palette**: cream `#F8F2E6` (surface `#FFFDF8`, card `#EFE7D8`), terracotta `#E8957A` / deep `#D27556`, ink `#141414`, sand `#EFCB8A`, sage `#A7B98B`. Type: Bricolage Grotesque (display) + Figtree (body). **Buttons stay ink**; the action colour is for highlights. Dark mode: `#161412` / `#221F1B` / `#2B2722`, cream text.
- **Never pink, never lime.** Client colours in the calendar come from the palette only (`CLIENT_TONES` in `src/Calendar.jsx`).
- **Action colour = 16 presets only** (custom colour removed in 1.10).
- **No blur anywhere.** Dialogs, onboarding and the guided tour dim the page lightly (ink ~35%) and never use `backdrop-filter: blur`. The user found blur disorienting.
- **UI changes need approval.** Design first (Figma) or show it in chat; a direct request from the user counts as approval.
- **Changelog every user-facing change** (see §1).
- **Data names are frozen.** Firestore `solodeskWorkspaces`, `solodeskPortals`, `solodeskProfiles`, `solodeskSync*`; browser keys `sd_*`; SW cache `solodesk-shell-*`; the `SOLODESK_URL` function parameter name (its default is now `https://terracove.web.app`). Renaming any of these orphans user data or links.
- **Logo**: the "Terracove sun" (since 1.14) — terracotta tile, sun in the top half, sea below; ink sun/sea on light, cream on dark; float-up motion on load (off for reduced motion). Rendered inline by `src/BrandLogo.jsx` (`BrandMark`, `BrandLogo`). Masters in `design/logo/`. Desktop app icons are transparent with the cream sun (`terracove-app-192/512.png`); iPhone/Android icons keep a cream tile.
- **Gmail first** for anything that drafts email (meetings, payment reminders); "Use my email app" is the secondary link.
- **Don't commit `.claude/`** (local `launch.json`: `solodesk-dev` on 5173 and `terracove-prod` = `vite preview` on 4173).
- **`firestore.rules` has an uncommitted Levern edit** (leaderboard refill `15 *` → `60 *` in `tfBoardGrowth`) owned by the Levern session. Keep that line; never revert it; leave the file out of Terracove commits unless rules change.
- **Things hidden until they can work** (Spark plan): API keys (`VITE_API=on` to show), live Excel sync (`VITE_EXCEL_SYNC=on`).

---

## 3. Release timeline

| Version | When | Headline |
|---|---|---|
| 1.01 | 25 Oct | Calendar on phones; Throughline identity |
| 1.02 | 25 Oct | New design (Terracotta), recent work, notes, profiles, invoice editing |
| 1.03 | 25 Oct | Calendar zoom (Year/Month/Week/Day), Keep-style notes |
| 1.04 | 25 Oct | Edit recent work on Home, nested checklists, two-pane Notes |
| 1.05 | 25 Oct | Free/busy calendar, client approvals, new portal, smart typing (from Levern) |
| 1.06–1.08 | 25 Oct | Portals publish themselves; client name in portal; Jump back in opens records |
| 1.09 | 25 Oct | Approvals for PRDs/files/quotes, billable hours, split storage, notifications, client requests, quick add |
| 1.10 | 25 Oct | Settings search; custom colour removed; stale tabs can't overwrite portals |
| 1.11–1.12 | 26 Oct | Client requests save (rules bug); open a task in the portal; clients change answers |
| 1.13 | 26 Oct | **SoloDesk is now Terracove** |
| 1.14 | 26 Oct | **New logo (Terracove sun)**; fluid phone tab bar |
| 1.15 | 26 Oct | Sliding timeline; What's new folded; update note once per version and per sign-in |
| 1.16 | 26 Oct | **New address terracove.web.app** (old one redirects); transparent desktop icon |
| 1.17 | 26 Oct | Whole-app audit: delete approval requests, calendar fixes, calmer tour/dialogs, dark-mode palette, logic fixes |
| 1.18 | 26 Oct | Log time on tasks; payment reminders; tidy-up (dead CSS, menus, hide undeployable features) |
| 1.19 | 27 Oct | Clients as cards (with List); install-tab highlight; icon refresh |
| 1.20 | 27 Oct | Projects in sections; invoices under Reports; click timeline dates; no blur in production; notes/tabs/tick fixes |
| 1.21 | 27 Oct | Themed checkboxes and scrollbars; Notes under Tasks; round client icons; trimmed Data & connections |
| 1.22 | 27 Oct | Link projects and clients any time (client Work tab and project page) |
| 1.23 | 27 Oct | Tidier client picker on the project page |
| 1.24 | 27 Oct | **TaskFlow is now Levern** (getlevern.web.app); panel is just “from levern” |

---

## 4. What was built, by area

### 4.1 Design, shell and navigation
- Direction B / Terracotta UI, designed in Figma first (1.02–1.04). Clickable breadcrumb (1.05).
- Sidebar (desktop): General = Home, Clients, Projects, Tasks, **Notes**, Calendar; Tools = All work, Approvals, **Reports & invoices**, Data & connections; Account = Profile, Settings (1.18, 1.20). Phone dock: Home, Tasks, +, Calendar, More; More lists All work, Clients, Projects, Approvals, Notes, Reports, Daily planner, Focus timer, Data & connections, Profile, Settings.
- **Fluid dock** (1.14, `src/FluidDock.jsx`): one terracotta blob stretches between tabs like liquid. The cream ring around + is unchanged; four alternatives were sketched (cradle notch, liquid bridge, flush tile, thin halo) — not chosen yet.
- Header: quick add, search, bell, settings, theme toggle (Reports icon removed in 1.18).
- Update note (pop-up on opening): once per new version and once per sign-in (`shouldShowUpdate` in `src/changelog.js`, keys `sd_seen_version`, `sd_seen_login` = `uid|lastSignInTime`); single "Got it" button (1.18). Settings → What's new shows the current release with "Review earlier updates" folding older ones (1.15).
- Guided tour (`src/Experience.jsx` Tour): one spotlight element whose huge box-shadow dims the page; it glides between steps; the card slides; leaving the step's page ends the tour (1.17). No blur (1.20 for real — see §5).

### 4.2 Logo and brand (1.14)
- Process: the `logo-design-skill` method (brief → longlist → concepts in black → size tests → checkpoint). ~30 concepts across rounds (Alcove, Tile cove, Harbour, Shoreline, Sun cove, monogram, keystone…), then the user combined W's layout with R3's motion. Copyright/trademark notes: shapes drawn from scratch (no copying); sun-over-sea is a common motif (weak to protect, not infringing); a US application **99786184** (sun with rays over waves in a rectangle, filed Apr 2026) should be shown to an attorney; a scallop-shell idea was dropped (Shell plc).
- Files: `src/BrandLogo.jsx` (inline SVG, `--brand-ink` var, `.brand-anim` float-up), `public/brand/terracove-*` (favicon follows the browser theme, app icons, maskable, share image), `design/logo/` (SVG masters, share.html), `design/logo-motion/index.html` (motion explorations).

### 4.3 Home
- Jump back in (3 latest edits, editable in place), Needs attention (overdue invoices show "reminded <date>"), today's timeline, notes composer.

### 4.4 Clients (1.19)
- **Cards by default**: initials tile (palette tones), name, contact, active projects, open tasks, amount owed, next due task, "Overdue invoice" chip. **Cards | List** switch (`clients.layout` view state). Initials skip symbols.

### 4.5 Projects (1.20, 1.22)
- Sections: **Recently edited** (2 most recently updated), then **by client** (alphabetical, "No client" last) or **Ongoing / Completed** (`projects.group` view state). Cards say "No tasks yet" instead of "0 of 0".
- **Linking (1.22)**: a client's Work tab lists linked projects (Unlink) and a picker to link an existing project (unassigned first, then "Move from another client"); a project page shows its client with Change, or "Link a client". `src/linking.js`: tasks with no client or the previous client follow the project.

### 4.6 Tasks and time
- Task page: status switch, details, client thread, approval box, checklist, **Time card** (1.18): log "1h 30m" / "90" / "1:30" with a day and note; entries are `focusSessions` with `manual:true`; invoiced entries locked (`src/time-log.js`, `src/TimeLog.jsx`). Focus timer below it.
- Billing (`src/billing.js`): per-task lines rounded to the quarter hour; tasks under ~8 min stay unbilled and accumulate; the shown "billable" equals the invoice (1.17).
- Repeats: copies start clean (no approval, checklist unticked) (1.17).

### 4.7 Calendar
- Year/Month/Week/Day zoom; day load pills read "N items" (1.17).
- **"What you're working on" timeline** slides without end (60-day chunks at each edge, pinned client names, month label, ‹ › and Today, drag with the mouse) (1.15); clicking a header date opens that day (1.20); task counts hidden when a project has no tasks (1.20).
- Picking a date scrolls back to the calendar heading (1.17). ICS export keeps ongoing projects to their start day (1.17).

### 4.8 Invoices and reports
- **Invoices live under Reports** ("Reports & invoices"): charts, then the invoice list; `#/invoices` opens Reports scrolled to it; invoice pages unchanged (1.20).
- **Payment reminders** (1.18, `src/reminders.js`): "Send reminder" on sent, unpaid invoices (filled when overdue) → Gmail draft with amount due, days late, how to pay; "Use my email app instead"; history in `invoice.reminders[]`.
- Void & reissue keeps payments, drops approval/schedule link, moves logged time; void invoices are excluded from revenue (1.17).

### 4.9 Notes
- Two-pane Notes; link a note to a client or project with the app's own dropdown (headings for Clients/Projects) (1.20); **Delete** button (moves to Trash, Undo) (1.20); tags wrap (1.20). A new note closed quickly keeps its text (1.17).

### 4.10 Client portal, approvals, requests
- Portal (`src/ClientPortal.jsx`): dark hero, tabs (Approvals, Projects & tasks, Links & documents, Requests, Invoices, Settings), comments, cheers, meeting requests (Gmail), client requests with labelled replies, change an approval answer.
- Approvals page: **remove any request** (×, Undo) and **delete client requests** (asks first) (1.17). Re-sending or withdrawing deletes the client's old `responses/{id}` so clock skew can't pre-answer.
- Portal publishing: only after this tab's own edits, with a never-decreasing `wsStamp` (rules enforce it).

### 4.11 Storage and safety
- Split storage v2 (`src/workspace-store.js`); validation on load (`src/workspace-upgrades.js`) — anything saved must pass it or the workspace won't load (two such lock-outs were fixed in 1.17: recurring-invoice repeats and impossible ISO dates).
- Client link/file updates are deleted from Firestore only after the workspace save resolves (1.17).

### 4.12 Address move (1.16)
- New Hosting site `terracove`; `legacy/` on the old site: `index.html` + `move.js` (redirect keeping path, query and `#route`, so portal links work) and a kill-switch `sw.js` (clears caches, unregisters, navigates open tabs). Browser storage is per origin, so people sign in again and see onboarding again on the new address.

---

## 5. Things tried, problems hit, and how they were resolved

| What happened | Cause | Resolution |
|---|---|---|
| **Blur stayed on the live site after 1.17's "no blur" fix** | Lightning CSS (Vite's minifier) drops the unprefixed `backdrop-filter:none` when the same rule also has `-webkit-backdrop-filter:none` — so overrides vanished in production while the dev server looked fine | 1.20 removed the blur values at the source (`theme.css`, `styles.css`, `experience.css`, `dark.css`). **Always check `dist/assets/*.css` (or run `terracove-prod`) for CSS fixes**; don't trust the dev server alone |
| Dead-CSS removal could break styling | ~37 KB of unused rules across many files | Removed only rules whose classes appear nowhere in JS/JSX/HTML (dynamic prefixes kept), then compared computed styles of every element on 24 pages before/after (desktop light, phone dark): only hover noise and one improvement |
| Old portal answer counted for a new request | Owner device clock vs server time | Delete `responses/{id}` on re-send/withdraw |
| Workspace could stop loading | UI saved values the loader's validator rejects | Validator widened / parser fixed; regression tests added |
| Sliding timeline snapped back | A new callback ref every render | `useCallback` |
| Tour left a stray outline after navigating | Tour kept running on another page | Leaving the step's page ends the tour |
| Settings tab didn't stay selected | Scroll-spy overrode the click mid-scroll | Spy paused ~1.2 s after a click |
| Stray "dot" next to New note (1.21) | `overflow-x:hidden` on children made them scroll boxes | Use `overflow-x:clip` |
| Checked checkboxes stayed cream (1.21) | A global `input{background:… !important}` rule | Checkbox rules use `!important` |
| Tick off-centre | Text glyph "☑" plus a translated `:after` tick | One centred SVG icon |
| Desktop app kept the old icon | Installed PWAs cache icons; Chrome checks rarely | Renamed icon files (`terracove-app-*`); fastest fix is uninstall + reinstall from terracove.web.app |
| Browser-pane screenshots cropped/stale; rAF not running when the pane is hidden | Pane quirks | Verify with DOM measurements; computed styles can lag right after a toggle — re-read after a delay |
| Justia trademark pages blocked automated fetches | Cloudflare | Left for the attorney |
| Figma MCP hit its call limit (View seat) on 27 Oct | Seat limit | Page cleanup not done — see §7 |
| Heredocs with quotes broke in the Bash tool | Shell quoting | Write Python to the scratchpad and run it |
| (Earlier chapter) portal flicker, `{request}` rules wildcard, Outlook links, ad-blocker console errors | — | See git history / CHANGELOG 1.10–1.11 |

---

## 6. Testing done

- **Automated**: 172 tests (parsing, approvals, billing incl. short sessions and fixed ids, storage, notifications, time log, reminders, reissue/revenue, repeats, smart-parse dates, validator coverage of every recurring-invoice repeat, changelog/update-note rules).
- **Live checks after each release**: version string and a feature string in the deployed JS; no `blur(` in the live CSS (1.20); new icons served; old-address redirect keeps `#/portal/...`.
- **Preview checks**: every page on desktop and phone in light and dark (no sideways overflow), tour steps across pages with no frame missing the dim, client cards/list, project sections, invoices under Reports, note picker/delete, time log, reminders (Gmail URL), timeline date click.
- **Earlier chapter**: signed-in end-to-end on the owner's workspace (1.09) — see git history.

---

## 7. Open items and next steps

**Figma (blocked by the MCP limit on 27 Oct)** — on page 68:234 keep **"Direction B · Terracotta + choose your action colour"** (current design system) and **"Terracove · FINAL logo (sun)"**; delete the old blue SoloDesk screens 01–10, "Components", the old "Read me", "Direction B · Playful professional (for comparison)", and the logo exploration boards ("Logo concepts (checkpoint)", "Logos in Terracotta + motion", "Logos round 3", "Shoreline + sun options", "Horizon sun pop-up motion"). Then rename the page "Terracove · Design (current)" and add a short read-me.

**Known logic issues not fixed yet** (from the 1.17 audit)
- Two open tabs: listener-driven changes (client approvals, updates) are saved by every tab, so one tab can go into conflict. Fix: one leader tab (BroadcastChannel/Web Locks) or reload-and-retry for listener changes.
- A stale tab can still publish an older portal copy after a failed save; publish only after this tab's save succeeds.
- A publish already in flight skips the newest change with no retry.
- Undo doesn't reach the portal (its stamp goes backwards); stamp undo/restore.
- Recovery after a reload mid-save can report a false conflict.
- Deleting the workspace leaves portal subcollections (responses, comments, requests, updates).
- `calc` doesn't round to cents (rare 0.01 "partially paid").

**Design/product suggestions not done**
- Merge the old stylesheets (`styles.css`, `taskflow.css`, `dark.css`) into `theme.css`.
- Expenses (profit in Reports), quote → invoice in one click, default payment terms (Net 7/14/30) and late fees, retainers, contracts/sign-off docs, client intake form in the portal, tax/income export, keyboard-shortcut sheet, Firestore offline persistence.
- Fold Daily planner into Calendar's day view and All work into Tasks; one "Data & connections" place.
- A choice for the ring around the + button (four sketches made).

**Testing / data**
- Re-test from a client window: send a request, add a link, reply from Approvals.
- Clean up test data: task "E2E portal test, safe to delete", test comments/cheers.
- Sign in once on terracove.web.app in a normal browser to confirm Google sign-in end-to-end.

**Name and platform**
- Trademark: no "Terracove" in classes 9/35/42 (US, WIPO, India). Near-marks for the attorney: TERRA CORE (India 35, 7624901), Teracove (Korea 35), Terracov (Indonesia 35), TERRACODE (US 42); logo: US 99786184. User to-do: buy terracove.app, attorney clearance, file in India (9, 42, optionally 35).
- Move to Blaze (~mid-Nov 2026), then approval emails, Excel sync, API keys (flip the build flags), backups, error tracking; App Check / per-client limits; Privacy Policy + Terms.
- Consider a separate Firebase project for Terracove.

---

## 8. Key files

| Area | Files |
|---|---|
| App shell, pages, forms, routing, nav | `src/App.jsx` |
| Logo | `src/BrandLogo.jsx`, `src/brand.css`, `public/brand/terracove-*`, `design/logo/` |
| Phone dock | `src/FluidDock.jsx` |
| Onboarding, tour, update note | `src/Experience.jsx`, `src/experience-state.js`, `src/tour-geometry.js`, `src/SettingsParts.jsx` (WhatsNew, UpdateNotice), `src/changelog.js` |
| Calendar | `src/Calendar.jsx` (WorkTimeline, useSlidingWindow), `src/calendar-view.js` |
| Time and billing | `src/time-log.js`, `src/TimeLog.jsx`, `src/billing.js` |
| Reminders | `src/reminders.js` |
| Notes | `src/NotesKeep.jsx`, `src/checklist.js` |
| Client portal, approvals | `src/ClientPortal.jsx`, `src/portal-sync.js`, `src/client-feed.js`, `src/approvals.js`, `src/Approvals.jsx` |
| Storage and validation | `src/workspace-store.js`, `src/workspace-upgrades.js` |
| Styles | `src/theme.css` (last; current palette + all newer rules), older `styles.css` / `taskflow.css` / `dark.css` |
| Hosting | `firebase.json`, `.firebaserc`, `legacy/` (old-address redirect), `vite.config.js` (service worker precache list) |
| Release notes | `src/changelog.js`, `CHANGELOG.md`, `README.md` |
| Rules | `firestore.rules` (+ Levern copy) |
| Server code (not deployed) | `functions/approval-*.js`, `functions/excel-*.js`, `functions/index.js` (api) |

---

## 9. Figma

File `bnt8lsuv1xdCg4xHFitxvZ` (Levern file). Page 68:234 holds Terracove's design; the other pages are Levern's. What to keep is listed in §7 (cleanup pending). Note the Figma MCP **View seat** has a call limit; heavy board-building can exhaust it.
