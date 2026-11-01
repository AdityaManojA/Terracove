# Terracove release notes

The same notes appear in the app under **Settings → What's new**, and people who used an earlier version see a short "SoloDesk updated" note the first time they open a new one. The source of truth is [`src/changelog.js`](src/changelog.js); keep this file in step with it.

## 1.25 — 1 November 2026 · A calmer mobile workspace

- Mobile page zoom is locked, including input-focus zoom; calendar view controls and desktop browser zoom remain available.
- Notifications stay within the viewport, with scrolling for longer lists.
- Calendar rebuilt for phones: swipe to change period, pinch to zoom, bottom-sheet details with swipe-down and back-button close, press-and-hold drag, and iOS / Android motion.
- Mobile Home Today items open the calendar day view with that task selected; the extra View full calendar button is hidden.
- Notes replaces Tasks in the mobile dock. Tasks is accessible directly from Home on mobile.
- Swipe a checklist item right to indent and left to outdent on mobile. Vertical scrolling, reminder controls and desktop keyboard editing are preserved.

## 1.24 — 27 October 2026 · TaskFlow is now Levern

- The sister app is now **Levern** (https://getlevern.web.app). Every visible “TaskFlow” in `src/` became “Levern” (calendar filter, search kinds, Home, legal pages, Data & connections); `TASKFLOW_URL` points to getlevern.web.app. The panel is just the heading “from levern”, an Open Levern button and the quests. Code identifiers (`taskflow*`, `TASKFLOW_URL`, feed paths) and older release notes are unchanged.

## 1.23 — 27 October 2026 · Tidier client picker

- On a project page, Change / Link a client opens a compact picker on its own line (`.tag-row .link-picker.inline`, 36 px controls) with Save and Cancel that never shrink or wrap.

## 1.22 — 27 October 2026 · Link projects and clients any time

- **Linking.** Client Work tab: linked projects with Unlink, plus “Link an existing project…” (projects without a client first, then “Move from another client”). Project page: the client with Change, or “Link a client”. `src/linking.js` (`linkProject`, `linkableProjects`): tasks with no client or the project’s previous client move with the project; tasks set to another client stay. Tests in `functions/linking.test.js`.

## 1.21 — 27 October 2026 · Small things, in style

- **Checkboxes and scrollbars.** All checkboxes are a custom rounded box (`appearance:none`, ink fill and tick when checked, cream in dark mode; `!important` needed because a global `input` rule sets the background). Scrollbars are slim and quiet everywhere (transparent track, soft thumb, no outline).
- **Navigation.** Notes moved under Tasks in the sidebar.
- **Data & connections** trimmed to TaskFlow, calendar export (ICS) and the import guide; JSON export, the badge and the long note removed.
- **Fixes.** Client list rows use round palette icons. Note link picker uses its own class (`note-link-picker`), so old pill styles no longer paint behind it. The notes column used `overflow-x:hidden`, which turned children into scroll boxes (a stray scrollbar looked like a dot); now `overflow-x:clip`.

## 1.20 — 27 October 2026 · Projects in sections, invoices in Reports

- **Projects in sections.** “Recently edited” (two) first, then one section per client (or Ongoing / Completed via a switch, `projects.group`). Cards say “No tasks yet” instead of “0 of 0”.
- **Invoices in Reports.** The sidebar item is “Reports & invoices”: charts, then the invoice list (`Invoices embedded`). `#/invoices` opens Reports scrolled to the list; invoice pages are unchanged.
- **Calendar.** Timeline header dates open that day (drags don’t count as clicks); “0/0 tasks” hidden; client tones palette-only.
- **Fixes.** No blur on the live site: Lightning CSS drops `backdrop-filter:none` when a rule also has `-webkit-backdrop-filter`, so the blur values were removed at source (verify with `grep blur dist/assets/*.css`). Settings tab scroll-spy pauses after a click. Notes: themed link picker (app Select with heading rows), Delete button, wrapping tags. Task tick centred.

## 1.19 — 27 October 2026 · Clients as cards

- **Clients as cards.** The Clients page defaults to cards (active projects, open tasks, amount owed, next due task, overdue flag) with a Cards | List switch remembered per workspace view (`clients.layout`).
- **Fixes.** The install guide highlights the chosen device. App icons renamed to `terracove-app-192/512.png` so installed desktop apps notice the change and fetch the transparent icon. “1 project” grammar; initials skip symbols.

## 1.18 — 26 October 2026 · Log time and chase payments

- **Log time on tasks.** A Time card on each task (`src/TimeLog.jsx`, `src/time-log.js`): durations like `1h 30m`, `90`, `1:30`; today or an earlier day; optional note. Entries are focus sessions (`manual: true`), so project billing picks them up; invoiced entries are locked.
- **Payment reminders.** Sent, unpaid invoices get Send reminder (`src/reminders.js`): a Gmail draft (or mailto) with amount due, days late and payment details; `i.reminders[]` records when, shown on the invoice and Home.
- **Tidy-up.** About 37 KB of unused CSS removed (verified by before/after computed-style fingerprints on every page); Reports moved into the sidebar; phone More gains Approvals and Daily planner; API keys (`VITE_API=on`) and Excel “Coming soon” hidden until deployable; the update note has a single Got it button; dark-mode phone top-bar icons visible.

## 1.17 — 26 October 2026 · A calmer, sturdier Terracove

From a whole-app audit (UI leftovers, logic, what to cut).

- **Delete approval requests.** Approvals rows get a remove button (Undo restores); client requests get Delete (asks first). The item box says “Delete request” for answered ones. Re-sending or withdrawing also deletes the client’s old answer document, so clock skew can’t pre-answer a new request.
- **Calendar.** Day pills say “8 items” (clients count in the tooltip). Picking a date scrolls back to the heading. The sliding timeline’s pinned names cover the gap, and a stable ref stops it snapping back on re-render. ICS export keeps ongoing projects to their start day. Tasks “Next 7 days” is 7 days.
- **Guided tour.** No blur, light dim, one spotlight element that glides (no unmount between steps), card slides and fades; leaving the step’s page ends the tour.
- **Dialogs and dark mode.** No backdrop blur anywhere; dark mode maps the old alias variables (`--ac`, `--action`, `--bar`, `--butter`…) to Terracotta, so menus, date pickers, toasts, scrollbars, progress bars, ticks and danger buttons lose the navy/yellow/pink. Approve button green again; portal file badges visible; invoice sheet uses ink instead of the old blue. theme-color is cream with a dark variant.
- **Logic fixes.** Recurring invoice repeats the page offers now validate (no load lock-out); impossible ISO dates rejected by smart parse; billing marks only invoiced sessions and the UI uses the same rounding; “Invoice unbilled hours” opens the right draft; reissue carries payments, drops approval/schedule link and moves logged time; void invoices excluded from revenue; NoteDialog keeps text typed just before closing; client updates deleted only after a confirmed save; repeated tasks start clean. Regression tests added (169 total).
- **Cleanup.** Offline cache uses the Terracove icons; removed 12 unused old brand files (dist/brand 738 KB → 241 KB) and an unused calendar component. Copy: “Buttons stay ink”, no custom-colour mention, “Send for approval”, “Daily planner”, unknown pages titled Home.

## 1.16 — 26 October 2026 · A new address

- **terracove.web.app.** The app moved from taskflow-solodesk.web.app to its own Hosting site, `terracove`. The old site now serves only `legacy/`: a page that sends people to the same path, query and #route on the new address (so client portal links keep working), and a service worker that clears and unregisters old installs. Browser storage is per address, so people sign in once more and see the welcome tour again; Firestore data is unchanged.
- **Desktop icon without a tile.** The 192/512 app icons are transparent with the cream sun (reads on dark taskbars); the iPhone and Android icons keep their cream tile.
- **Fix:** public profile pages showed an old “S” badge; they now show the Terracove logo.

## 1.15 — 26 October 2026 · Slide through your timeline

- **Slide the timeline.** Calendar → What you’re working on slides: swipe, scroll sideways or drag to move through the dates, as far forward or back as you like (60 more days load at either end). Client names stay pinned, the header shows the month in view, and ‹ › and Today move it. The year view still fits the whole year.
- **Updates, tidied.** Settings → What’s new shows the current update first; earlier ones are folded under Review earlier updates. The update note on opening shows once per new version and once after each sign-in (keyed on the sign-in time), not on reloads or new tabs.

## 1.14 — 26 October 2026 · A new logo

- **The Terracove sun.** A new logo: a terracotta tile with a sun rising over the sea. It plays a short float-up when it appears (still for people who ask for less motion) and switches to a cream sun in dark mode. It is on the sidebar, sign-in, top bar, client portal, legal pages, browser tab (follows the browser's light/dark setting), installed-app icons and link previews. Sources are in `design/logo/`; the old Throughline files stay in `public/brand/` for old links.
- **A fluid tab bar.** On phones, one terracotta highlight flows between tabs: it stretches across like a drop of liquid and settles on the tab you tap.
- **Fix:** the welcome tour still said "SoloDesk"; it now says Terracove.

## 1.13 — 26 October 2026 · SoloDesk is now Terracove

- **A new name.** SoloDesk is now Terracove. Data and links are unchanged: Firestore collections keep their `solodesk*` names, browser storage keeps its `sd_*` keys, and the app stays at taskflow-solodesk.web.app until a new domain is set up.

Releases below were made under the name SoloDesk.

## 1.12 — 26 October 2026 · Open a task in the client portal

- **Open a task.** Clients click a task in their portal to open its due date, steps, approval (Approve / Request changes) and comments together.
- **Change an answer.** Clients can change an approval answer later; the newest answer wins in SoloDesk.

## 1.11 — 26 October 2026 · Client portal fixes

- **Meetings open in Gmail.** Request a meeting opens a ready-to-send Gmail message in the browser, with a link to use the device's email app instead.

Fixes
- Client requests were refused by the Firestore rules (the rule's wildcard was named `request`, hiding the built-in request object); they now save.
- Change password in the portal is behind a button.
- Portal comment box and quick buttons line up; Send sits under the comment.
- The “Live” label on client access is now “Shared”.

## 1.10 — 25 October 2026 · Find any setting, and a steadier client portal

- **Search finds settings.** Search (Ctrl/⌘ K) now finds every setting and page by the words you’d use: “bank”, “IFSC”, “GST”, “dark mode”, “logo”, “backup”. Picking one opens the right section and puts the cursor in the field.

Fixes
- The custom action colour is gone; the 16 presets all keep text readable. A custom colour chosen earlier shows as Terracotta.
- Client portals no longer flicker when SoloDesk is open in more than one tab: an older tab can no longer overwrite a newer portal.
- Portal task names no longer squeeze into one letter per line, and the link editor fits narrow cards.

## 1.09 — 25 October 2026 · Approvals for everything, billable time and room to grow

- **Notifications.** A bell in the top bar shows when clients approve, ask for changes, comment, cheer you on, send a request or update a link, plus overdue invoices, reminders and tasks due today. The Approvals menu item shows how many answers and requests are new.
- **Clients can talk to you.** In their portal, clients comment on tasks, send a quick “You got this 💪”, request a change, update their links and shared files, and draft a meeting request email to you in one click. You reply to comments from the task page.
- **Client requests.** Clients can ask for something new (“Can you add a blog?”). You answer from Approvals with Feature scope, We’ll start right away, Can be implemented, In progress, or your own timing, and can add it as a task in the same click. They see the answer in their portal.
- **Quick add from anywhere.** Press N (or Ctrl/⌘ J, or the bolt in the top bar), type “Call Ava tomorrow 7pm for Website” and press Enter.
- **A clearer task page and list.** Tasks open with a status switch, a tidy details panel, the client conversation and approvals. The Tasks list shows priority, due, approval and project chips, and can be grouped by project.
- **Client summary.** A client’s Overview starts with their portal status (with Copy portal link), approvals waiting and their links.
- **A shorter sidebar.** Daily planner opens from the Calendar (Plan your day) and Reports from the top bar.
- **Approve PRDs, files and quotes.** Send a PRD, a linked file or a draft invoice (as a quote) for approval, not just tasks. Clients read the PRD, open the file or see the quote’s lines and total in their portal, then approve or ask for changes. An approved PRD is marked Approved by itself.
- **Invoice unbilled hours.** A project’s Budget tab shows logged time that is not on an invoice yet. One click turns it into a draft invoice, one line per task at the project’s hourly rate.
- **Repeats like TaskFlow.** Tasks can repeat every other day, yearly, or on the weekdays you pick, and smart typing fills these in from “every Mon, Wed and Fri”.
- **Room to grow.** Notes, documents, activity, focus history and Trash are now stored separately from the rest of your workspace, so it can keep growing well past the old 1 MB limit.
- **Requested changes on Home.** When a client asks for changes, it shows in Needs attention with their comment.
- **Portal settings.** Clients change their password in a new Settings tab in their portal, which also shows the name and email they are signed in with.
- **Approval emails (coming with Blaze).** Ready for when the Blaze plan is on: clients get an email when you send something for approval, and you get one when they answer.

Fixes
- Dark mode: calendar items, day counts, timeline captions and delete buttons are readable again.
- The Excel “Coming soon” card is now a single line, so Files & docs uses the full width.
- Note titles and text no longer sit in white boxes on coloured notes.

## 1.08 — 25 October 2026 · A clearer timeline and a calmer Home

- **Jump back in opens the work.** Clicking a task, project or client under Jump back in now opens its page instead of the edit form. Notes still open right there on Home.
- **A clearer project timeline.** “What you’re working on” in the calendar now labels every day with its weekday and date, shades weekends, marks today with a clear line, and stacks only projects that overlap. Bar ends show whether a project carries on past the view (›) or is ongoing.
- **A calmer Home.** The revenue card moved off Home; Needs attention now has the full width. Revenue is still in Reports.

## 1.07 — 25 October 2026 · Small improvements

- **Your client’s name in their portal.** The top of the client portal shows the client’s name as you set it in SoloDesk, with their initials and login email, instead of only the email.

## 1.06 — 25 October 2026 · Client portals that keep themselves up to date

- **No more “Update portal”.** A client’s portal now updates by itself a moment after you change anything you share with them: task progress, project dates, documents, PRDs, links or invoices.
- **Pick what to share, instantly.** Under Client access, ticking or unticking a project, document or invoice changes the portal straight away. A live dot shows when it last published.

## 1.05 — 25 October 2026 · Client approvals, a new client portal and smart typing

- **Send work for approval.** Open a task and choose Send for approval. Your client approves it or asks for changes in their portal, and the answer comes back to the task. A new Approvals page shows what is waiting, approved or needs changes.
- **A client portal that shows the work.** Clients now see the project tasks you share, their links, the documents and PRDs you pick, and sent invoices, in a new colourful portal with their approvals at the top. Copy the portal link straight from Client access.
- **Type it, and it fills in.** Like TaskFlow: type “Send the draft to Ava tomorrow at 7pm” and the date, time, client and project fill themselves in. Suggestions appear as you type; press Tab to pick one. Works for tasks, projects (“from Nov 3 to Dec 20”), search and checklist reminders.
- **Search by day.** Search for “tomorrow” or “next Friday” to see the work on that day.
- **Clearer document buttons.** Link a file and New PRD are now two clear buttons with a short description each.
- **Free and busy days.** Every day in the calendar is coloured by how full it is — free, light, busy or packed — with a count of items and clients. The year view becomes a heatmap of your free days.
- **Projects across every day.** Project timelines now stretch across every day they cover in the month view, instead of showing only at the start of each week.
- **Ongoing projects.** Leave a project’s end date empty and it runs on from its start date until you add one.
- **Add a client while creating a project.** “Add a new client” sits right under the client list in the project form.
- **Effort budget when you need it.** Budget hours and hourly rate only appear when you tick “Track an effort budget”.
- **Clickable breadcrumb.** The path at the top left now links back: Workspace goes Home, the section opens its list, and the last part shows the client, project or note you are on.
- **More action colours.** Eight new presets — coral, mustard, olive, sage, teal, sky, lavender and stone — plus a Custom colour picker for any shade you like.
- **Links on clients.** Add a client’s website, Instagram or any other link in the client form. Type just “acme.com” and SoloDesk fills in the rest; links show under the client’s name.
- **Safer portal passwords.** When you create a client portal login you type the password twice, and clients must enter their current password before setting a new one.
- **Completed projects out of the way.** When you pick a project for a task, finished projects are tucked under a greyed-out “Completed projects” row at the bottom of the list. Click it to show them.
- **A fresh welcome.** Onboarding and the guided tour were redone in the new colours and now walk through Home, Notes, Calendar zoom and free days, your Profile and Settings.

Fixes
- Calendar zoom buttons are easier to spot.
- Radio buttons and checkboxes no longer stretch across the whole row (for example “Who can see it?” in profile setup).
- Removed the logo download section from Settings → Appearance.

## 1.04 — 25 October 2026 · Edit what you were working on, right from Home

- **Jump back in, editable.** Home shows the notes, tasks, projects and clients you edited most recently (never TaskFlow quests). Notes open in place under the cards; tick checklist items and tasks straight from a card; project and client cards open their editors.
- **TaskFlow, tucked away.** Quests sit in a small pill next to the greeting with a quick list.
- **Checklists like Apple Notes.** Enter for the next item, Tab / Shift+Tab to nest and un-nest, Enter on an empty sub-item steps out, Backspace at the start outdents or joins with the item above. Ticking an item ticks its sub-items; items keep their place.
- **Notes, side by side.** The Notes page lists notes on the left and opens the selected one on the right, ready to type — no pop-up windows.
- **Calendar zoom buttons.** Labelled Zoom in / Zoom out, plus Ctrl/⌘ + scroll or a trackpad pinch over the calendar.

Fixes
- Note fields no longer show a form-style box while typing.
- Text typed just before closing a note is saved; notes save less often while you type.

## 1.03 — 25 October 2026 · A clearer calendar, Keep-style notes and a tidier workspace

- **Calendar, rebuilt.** One zoom control from Year → Month → Week → Day (also keys Y, M, W, D and T for today). A "What you're working on" timeline above every zoom level shows each client's projects as bars across the period. Month view packs multi-day projects into bars like Google Calendar; Week and Day are hourly timelines with a now line; the Day view adds a plan of what is due, scheduled and running, plus the free-time tools. Drag-to-reschedule, Move to date and ICS export remain.
- **Notes like Google Keep.** Title plus "Take a note…", or switch on the checklist: Enter adds the next item, Backspace on an empty item removes it, ticked items collect at the bottom, and any item can carry a reminder date. The Notes page shows every note, including client and project notes, with filters and search.
- **Take a note from Home** — a shortcut under Add task.
- **Profile setup walkthrough** — address (availability checked as you type), about you, links, clients to show, and visibility (private by default).
- **Settings on one page** — General, Invoices & bank, Appearance, Data & connections, What's new and Account in one scroll; the sticky tabs follow the section you're reading.
- **Cleaner toolbar and sidebar account area** — quick actions, search (⌘K), reports, settings and light/dark in one pill; your initials, name, email and log-out button at the bottom of the sidebar.
- **Uniform project cards** with Archive and Delete side by side.
- **Palette colours** in Reports and for TaskFlow items.

Fixes
- Removed the "All changes saved" label; the top bar only shows saving progress or a save problem.

## 1.02 — 25 October 2026 · A new look, and your whole client business in one place

- **New design.** A calmer, business-ready look: a black sidebar, warm Terracotta colours (sage, sand, cream) and clearer type (Bricolage Grotesque and Figtree, served with the app) across every page, in light and dark.
- **Choose your action colour.** Settings → Appearance lets each workspace pick its highlight colour: Terracotta (default), Clay, Rust, Apricot, Sienna, Brick, Peach or Dusty blue. Buttons stay black.
- **Jump back in.** Home shows the three most recently edited clients, projects and TaskFlow quests, plus revenue, what needs attention, a month calendar and today's timeline.
- **All work.** A new page lists every project, client and completed piece of work as cards, newest first.
- **Client and project notes.** Notes, checklists and dated reminders on each client and project. Dated to-dos show on Home and in the client's Reminders.
- **Project pages.** Every project has its own page with Tasks, Notes, Files & docs and Budget.
- **Files & docs.** Write PRDs in SoloDesk (problem, goals, out of scope, requirements), turn requirements into linked tasks, and link files from Drive, OneDrive, Notion or Figma.
- **Live Excel sync (coming soon).** Shown as "Coming soon" in Files & docs until the server part is deployed. Link a Microsoft Excel workbook to a project or client. Task name, status, due date and priority sync both ways; logged hours go to the sheet; conflicting edits wait for you to choose. Needs the Blaze plan and a Microsoft app registration — see [docs/excel-sync-setup.md](docs/excel-sync-setup.md).
- **Public profile.** A mini portfolio at `/<username>` with your headline, bio, links and chosen client names. Private by default: visitors then see only your name and a note that the profile is private.
- **Edit invoices on the page.** On a draft, change the invoice number, title, dates, reference/PO, your details, bill-to, line items, tax label and rate, notes, payment instructions and bank details (account, bank, IFSC/sort code, SWIFT, IBAN, UPI). Save bank details as your default from the invoice or in Settings → Invoices & bank.
- **What's new.** Release notes in Settings, a one-time update note, and the version in the sidebar.

Fixes
- Edits now record when they happened, so "most recent" is always accurate.

## 1.01 — 25 October 2026 · Calendar on phones and a new identity

- Throughline identity: new logo and app icon, with a downloadable logo pack.
- Calendar source markers on every date.
- Clients, projects, tasks, invoices, calendar, TaskFlow connection, planning tools, client portal, Undo/Trash/backups, installable app, dark mode and offline access.

Fixes
- On phones, the Start time field in Conflicts & free time no longer runs past the card.
- On phones, the project popup in Calendar stays on screen and its Move to date field fits.
