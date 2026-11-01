// Release notes shown in Settings → What's new, in the update notice, and mirrored in CHANGELOG.md.
// Newest first. Add an entry for every user-facing change: put it in the unreleased version while it is
// being built, and set released + date when it ships.
export const changelog=[
  {version:'1.25',released:true,date:'2026-11-01',title:'A calmer mobile workspace',highlights:[
    ['A rebuilt calendar','Made for phones first. Swipe sideways to change the month, week or day, pinch to zoom between Year, Month, Week and Day, and tap the title to zoom out. On a phone the month shows dots per day and the selected day’s plan underneath. Item details open in a bottom sheet you can swipe down to close; the back button closes it too. Press and hold an item to drag it to another day. Motion follows your phone: iPhone springs, Android Material curves and an Add button. On a laptop, swipe with two fingers on the trackpad.'],
    ['App-like mobile zoom','The page stays at its normal scale on mobile, including when entering text. Calendar view buttons still work; desktop browser zoom is unchanged.'],
    ['Notes at your fingertips','Notes replaces Tasks in the mobile dock. Open Tasks directly from Home. Swipe right on a checklist item to indent, or left to outdent; desktop keeps Tab and Shift+Tab.'],
    ['Job title on invoices','Add your job title in Settings → General, or on a single draft invoice. It appears under your name in the From section.'],
  ],fixes:['Notifications stay inside the screen instead of being clipped beside the bell.','On mobile Home, Today items open the task in the calendar day view; the redundant View full calendar button is hidden.','Invoice PDFs keep quantities, prices and amounts on one line instead of splitting them like ₹5,000.0 / 0.','Bank details and notes always print on their own page of the invoice PDF, instead of being cut across two pages.','Invoice PDFs leave out the browser’s print date, page title, web address and page numbers, and no longer show the internal Draft or Sent badge.']},
  {version:'1.24',released:true,date:'2026-10-27',title:'TaskFlow is now Levern',highlights:[
    ['Levern','TaskFlow is now called Levern, so Terracove says Levern everywhere: the calendar, search, Home and Data & connections. The panel is simply “from levern” with your quests and an Open Levern button (getlevern.web.app). Nothing to reconnect.'],
  ],fixes:['The calendar’s event details now say “From Levern” too.']},
  {version:'1.23',released:true,date:'2026-10-27',title:'Tidier client picker',highlights:[
    ['Tidier client picker','On a project page, Change or Link a client opens a compact picker on its own line, with Save and Cancel beside it instead of squeezed buttons.'],
  ],fixes:[]},
  {version:'1.22',released:true,date:'2026-10-27',title:'Link projects and clients any time',highlights:[
    ['Link projects and clients','A client’s Work tab lists its linked projects, with Unlink, and a picker to link an existing project (one without a client, or move one from another client). A project page shows its client with Change, or Link a client if it has none. The project’s tasks move with it.'],
  ],fixes:[]},
  {version:'1.21',released:true,date:'2026-10-27',title:'Small things, in style',highlights:[
    ['Checkboxes and scrollbars match','Every checkbox is the same rounded ink box with a tick, and scrollbars are slim and quiet everywhere, in light and dark.'],
    ['Notes under Tasks','Notes sits right below Tasks in the sidebar.'],
    ['A simpler Data & connections','Just Levern, your calendar export and how to add it to Google or Apple Calendar.'],
  ],fixes:['The client list uses round colour icons instead of bordered initials.','No more shadow behind the “linked to” menu in Notes, and no stray dot next to New note.']},
  {version:'1.20',released:true,date:'2026-10-27',title:'Projects in sections, invoices in Reports',highlights:[
    ['Projects in sections','Projects show your two most recently edited first, then section by section: by client, or switch to Ongoing / Completed.'],
    ['Invoices live in Reports','Reports is now Reports & invoices: your revenue charts first, then all your invoices underneath.'],
    ['Calendar','Click any date in the “What you’re working on” timeline to open that day. Projects without tasks no longer say “0/0 tasks”, and every client colour comes from the Terracotta palette.'],
  ],fixes:[
    'The guided tour and dialogs no longer blur the page on the live site (a build step was quietly putting the blur back).',
    'Settings tabs stay on the one you clicked instead of jumping to a neighbour.',
    'Notes: the “linked to” menu matches the theme, notes have a clear Delete button, and long client/project tags wrap instead of scrolling sideways.',
    'The tick on finished tasks is centred.',
  ]},
  {version:'1.19',released:true,date:'2026-10-27',title:'Clients as cards',highlights:[
    ['Clients as cards','Clients show as cards with what matters at a glance: active projects, open tasks, what they still owe and the next thing due, plus an overdue flag. Prefer the old view? Switch to List; Terracove remembers your choice.'],
  ],fixes:['In the install guide, the device you pick (iPhone / iPad, Android, Desktop) is now highlighted.','Installed desktop apps pick up the new transparent icon.','“1 projects” now reads “1 project”, and initials skip symbols (Form & Field → FF).']},
  {version:'1.18',released:true,date:'2026-10-26',title:'Log time and chase payments',highlights:[
    ['Log time on tasks','Each task has a Time card: type “1h 30m”, “90” or “1:30”, pick the day and add a note. Logged time joins the focus timer’s, so Invoice unbilled hours on the project bills it. Entries can be removed until they are invoiced.'],
    ['Payment reminders','Unpaid invoices have Send reminder: it opens a ready-to-send Gmail message with the amount due, how late it is and how to pay (or use your own email app). The invoice and Home show when you last reminded.'],
    ['A tidier app','Reports sits in the sidebar instead of the top bar, and Approvals and Daily planner are in the phone’s More menu. Things that can’t work yet (API keys, live Excel sync) are hidden until they can.'],
  ],fixes:['The update note has just one button, Got it.','In dark mode on phones, the top bar icons are clearly visible.']},
  {version:'1.17',released:true,date:'2026-10-26',title:'A calmer, sturdier Terracove',highlights:[
    ['Delete approval requests','Remove any approval request from Approvals, even an answered one (Undo brings it back). Client requests can be deleted too.'],
    ['Calendar, clearer','Day counts read “8 items” instead of “8 · 3c”. Picking a date no longer drops you to the bottom of the page, and the timeline’s client names stay neatly pinned while you slide.'],
    ['A smoother guided tour','No blur, a gentle dim, and Back/Next glide to the next spot instead of flashing. Leaving the page ends the tour.'],
    ['Calmer dialogs and dark mode','Dialogs dim the page without blurring it. Dark mode no longer shows leftover navy, yellow or pink: menus, date pickers, toasts, scrollbars and progress bars all use the Terracotta palette.'],
  ],fixes:[
    'A recurring invoice set to repeat every other day or yearly could stop the workspace from loading. It now loads, and “On days I choose” is no longer offered for invoices.',
    'Typing an impossible date such as 2026-02-30 in quick add no longer saves it as a due date.',
    'Invoicing logged time no longer loses short tasks: under 8 minutes stays unbilled and adds up. The hours shown match the invoice, and the new draft opens straight away.',
    'Reissuing a void invoice keeps what was already paid and drops the old approval; payments are counted once in Reports.',
    'A new note closed quickly after typing is kept instead of being thrown away.',
    'A client’s link or file update is only cleared once your workspace has saved it.',
    'Sending something for approval again can no longer be answered by the client’s previous reply.',
    'The next copy of a repeating task starts with its checklist unticked and no approval.',
    'Calendar export shows ongoing projects on their start day, not as 10-year events. “Next 7 days” covers 7 days.',
    'Approve buttons are green again, link badges in the client portal are visible, and dark-mode ticks and progress bars show.',
  ]},
  {version:'1.16',released:true,date:'2026-10-26',title:'A new address: terracove.web.app',highlights:[
    ['terracove.web.app','Terracove now lives at terracove.web.app. The old address sends you, and your clients’ portal links, to the same page there. Sign in once on the new address; your workspace and portals are unchanged.'],
    ['A cleaner desktop icon','The installed app icon on computers has no background tile now, just the logo.'],
  ],fixes:[
    'Public profile pages showed an old “S” badge instead of the Terracove logo.',
  ]},
  {version:'1.15',released:true,date:'2026-10-26',title:'Slide through your timeline',highlights:[
    ['Slide the timeline','In Calendar, What you’re working on now slides: swipe, scroll sideways or drag to move through the dates, as far forward or back as you like. The month shows as you go, and Today brings you back.'],
    ['Updates, tidied','Settings → What’s new shows the current update first; earlier ones are under Review earlier updates. The update note on opening shows once per new version and once after you sign in, not every time.'],
  ],fixes:[]},
  {version:'1.14',released:true,date:'2026-10-26',title:'A new logo',highlights:[
    ['The Terracove sun','A new logo: a terracotta tile with a sun rising over the sea. It plays a short float-up when the app opens (still if your device asks for less motion), and switches to a cream sun in dark mode. It is on the sidebar, sign-in, client portal, browser tab and the installed app icon.'],
    ['A fluid tab bar','On your phone, the highlight in the bottom bar now flows to the tab you tap: it stretches across like a drop of liquid and settles on the new tab.'],
  ],fixes:[]},
  {version:'1.13',released:true,date:'2026-10-26',title:'SoloDesk is now Terracove',highlights:[
    ['A new name','SoloDesk is now Terracove: terracotta, and a cove, a calm place to keep your client work. Everything you have stays exactly where it is, and your clients’ portal links keep working.'],
  ],fixes:[]},
  {version:'1.12',released:true,date:'2026-10-26',title:'Open a task in the client portal',highlights:[
    ['Open a task','In their portal, clients click a task to open it: its due date and steps, the approval (with Approve or Request changes) and the comments, all in one place.'],
    ['Change an answer','Clients can change an approval answer later (Change my answer). The newest answer is what you see in SoloDesk.'],
  ],fixes:[]},
  {version:'1.11',released:true,date:'2026-10-26',title:'Client portal fixes',highlights:[
    ['Meetings open in Gmail','Request a meeting opens a ready-to-send Gmail message in the browser. Clients who prefer their own email app can use the link next to it.'],
  ],fixes:[
    'Client requests were not being saved; they now go through and stay.',
    'Change password in the client portal is behind a button, so the form only shows when it is needed.',
    'The comment box and quick buttons in the portal line up neatly, with Send under the comment.',
    'The “Live” label on client access is now a plain “Shared”.',
  ]},
  {version:'1.10',released:true,date:'2026-10-25',title:'Find any setting, and a steadier client portal',highlights:[
    ['Search finds settings','Search (Ctrl/⌘ K) now finds every setting and page by the words you’d use: “bank”, “IFSC”, “GST”, “dark mode”, “logo”, “backup”. Picking one opens the right section and puts the cursor in the field.'],
  ],fixes:[
    'The custom action colour is gone; the 16 presets all keep text readable. A custom colour chosen earlier shows as Terracotta.',
    'Client portals no longer flicker when SoloDesk is open in more than one tab: an older tab can no longer overwrite a newer portal.',
    'Portal task names no longer squeeze into one letter per line, and the link editor fits narrow cards.',
  ]},
  {version:'1.09',released:true,date:'2026-10-25',title:'Approvals for everything, billable time and room to grow',highlights:[
    ['Notifications','A bell in the top bar shows when clients approve, ask for changes, comment, cheer you on, send a request or update a link, plus overdue invoices, reminders and tasks due today. The Approvals menu item shows how many answers and requests are new.'],
    ['Clients can talk to you','In their portal, clients comment on tasks, send a quick “You got this 💪”, request a change, update their links and shared files, and draft a meeting request email to you in one click. You reply to comments from the task page.'],
    ['Client requests','Clients can ask for something new (“Can you add a blog?”). You answer from Approvals with Feature scope, We’ll start right away, Can be implemented, In progress, or your own timing, and can add it as a task in the same click. They see the answer in their portal.'],
    ['Quick add from anywhere','Press N (or Ctrl/⌘ J, or the bolt in the top bar), type “Call Ava tomorrow 7pm for Website” and press Enter.'],
    ['A clearer task page and list','Tasks open with a status switch, a tidy details panel, the client conversation and approvals. The Tasks list shows priority, due, approval and project chips, and can be grouped by project.'],
    ['Client summary','A client’s Overview starts with their portal status (with Copy portal link), approvals waiting and their links.'],
    ['A shorter sidebar','Daily planner opens from the Calendar (Plan your day) and Reports from the top bar.'],
    ['Approve PRDs, files and quotes','Send a PRD, a linked file or a draft invoice (as a quote) for approval, not just tasks. Clients read the PRD, open the file or see the quote’s lines and total in their portal, then approve or ask for changes. An approved PRD is marked Approved by itself.'],
    ['Invoice unbilled hours','A project’s Budget tab shows logged time that is not on an invoice yet. One click turns it into a draft invoice, one line per task at the project’s hourly rate.'],
    ['Repeats like Levern','Tasks can repeat every other day, yearly, or on the weekdays you pick, and smart typing fills these in from “every Mon, Wed and Fri”.'],
    ['Room to grow','Notes, documents, activity, focus history and Trash are now stored separately from the rest of your workspace, so it can keep growing well past the old 1 MB limit.'],
    ['Requested changes on Home','When a client asks for changes, it shows in Needs attention with their comment.'],
    ['Portal settings','Clients change their password in a new Settings tab in their portal, which also shows the name and email they are signed in with.'],
    ['Approval emails (coming with Blaze)','Ready for when the Blaze plan is on: clients get an email when you send something for approval, and you get one when they answer.'],
  ],fixes:[
    'Dark mode: calendar items, day counts, timeline captions and delete buttons are readable again.',
    'The Excel “Coming soon” card is now a single line, so Files & docs uses the full width.',
    'Note titles and text no longer sit in white boxes on coloured notes.',
  ]},
  {version:'1.08',released:true,date:'2026-10-25',title:'A clearer timeline and a calmer Home',highlights:[
    ['Jump back in opens the work','Clicking a task, project or client under Jump back in now opens its page instead of the edit form. Notes still open right there on Home.'],
    ['A clearer project timeline','“What you’re working on” in the calendar now labels every day with its weekday and date, shades weekends, marks today with a clear line, and stacks only projects that overlap. Bar ends show whether a project carries on past the view (›) or is ongoing.'],
    ['A calmer Home','The revenue card moved off Home; Needs attention now has the full width. Revenue is still in Reports.'],
  ],fixes:[]},
  {version:'1.07',released:true,date:'2026-10-25',title:'Small improvements',highlights:[
    ['Your client’s name in their portal','The top of the client portal shows the client’s name as you set it in SoloDesk, with their initials and login email, instead of only the email.'],
  ],fixes:[]},
  {version:'1.06',released:true,date:'2026-10-25',title:'Client portals that keep themselves up to date',highlights:[
    ['No more “Update portal”','A client’s portal now updates by itself a moment after you change anything you share with them: task progress, project dates, documents, PRDs, links or invoices.'],
    ['Pick what to share, instantly','Under Client access, ticking or unticking a project, document or invoice changes the portal straight away. A live dot shows when it last published.'],
  ],fixes:[]},
  {version:'1.05',released:true,date:'2026-10-25',title:'Client approvals, a new client portal and smart typing',highlights:[
    ['Send work for approval','Open a task and choose Send for approval. Your client approves it or asks for changes in their portal, and the answer comes back to the task. A new Approvals page shows what is waiting, approved or needs changes.'],
    ['A client portal that shows the work','Clients now see the project tasks you share, their links, the documents and PRDs you pick, and sent invoices, in a new colourful portal with their approvals at the top. Copy the portal link straight from Client access.'],
    ['Type it, and it fills in','Like Levern: type “Send the draft to Ava tomorrow at 7pm” and the date, time, client and project fill themselves in. Suggestions appear as you type; press Tab to pick one. Works for tasks, projects (“from Nov 3 to Dec 20”), search and checklist reminders.'],
    ['Search by day','Search for “tomorrow” or “next Friday” to see the work on that day.'],
    ['Clearer document buttons','Link a file and New PRD are now two clear buttons with a short description each.'],
    ['Free and busy days','Every day in the calendar is coloured by how full it is — free, light, busy or packed — with a count of items and clients. The year view becomes a heatmap of your free days.'],
    ['Projects across every day','Project timelines now stretch across every day they cover in the month view, instead of showing only at the start of each week.'],
    ['Ongoing projects','Leave a project’s end date empty and it runs on from its start date until you add one.'],
    ['Add a client while creating a project','“Add a new client” sits right under the client list in the project form.'],
    ['Effort budget when you need it','Budget hours and hourly rate only appear when you tick “Track an effort budget”.'],
    ['Clickable breadcrumb','The path at the top left now links back: Workspace goes Home, the section opens its list, and the last part shows the client, project or note you are on.'],
    ['More action colours','Eight new presets — coral, mustard, olive, sage, teal, sky, lavender and stone — plus a Custom colour picker for any shade you like.'],
    ['Links on clients','Add a client’s website, Instagram or any other link in the client form. Type just “acme.com” and SoloDesk fills in the rest; links show under the client’s name.'],
    ['Safer portal passwords','When you create a client portal login you type the password twice, and clients must enter their current password before setting a new one.'],
    ['Completed projects out of the way','When you pick a project for a task, finished projects are tucked under a greyed-out “Completed projects” row at the bottom of the list. Click it to show them.'],
    ['A fresh welcome','Onboarding and the guided tour were redone in the new colours and now walk through Home, Notes, Calendar zoom and free days, your Profile and Settings.'],
  ],fixes:[
    'Calendar zoom buttons are easier to spot.',
    'Radio buttons and checkboxes no longer stretch across the whole row (for example “Who can see it?” in profile setup).',
    'Removed the logo download section from Settings → Appearance.',
  ]},
  {version:'1.04',released:true,date:'2026-10-25',title:'Edit what you were working on, right from Home',highlights:[
    ['Jump back in, editable','Home now shows the notes, tasks, projects and clients you edited most recently. Open a note, tick a checklist item or a task, or edit a project or client without leaving Home.'],
    ['Levern, tucked away','Your Levern quests sit in a small pill next to the greeting; tap it for a quick list.'],
    ['Checklists like Apple Notes','Type an item, press Enter for the next one, Tab to make a sub-item and Shift+Tab to move it back. Ticking an item ticks its sub-items, and items stay where you put them.'],
    ['Notes, side by side','The Notes page lists your notes on the left and opens the one you pick on the right, ready to type. On Home, a note opens right under your recent work.'],
    ['Zoom buttons in the calendar','Clear Zoom in and Zoom out buttons, plus Ctrl/⌘ + scroll or a trackpad pinch over the calendar.'],
  ],fixes:[
    'Note fields no longer show a form-style box when you type in them.',
    'Text typed just before closing a note is no longer lost, and notes save less often while you type.',
  ]},
  {version:'1.03',released:true,date:'2026-10-25',title:'A clearer calendar, Keep-style notes and a tidier workspace',highlights:[
    ['Calendar, rebuilt','Zoom from the whole year down to a single day, like Google or Apple Calendar. A “What you’re working on” timeline shows every client’s projects across the period, and the day view explains what is due, scheduled and running.'],
    ['Notes like Google Keep','Take a note, or switch on the checklist and press Enter for each new item. Ticked items move to the bottom, any item can have a reminder date, and every note — including client and project notes — is on the Notes page.'],
    ['Take a note from Home','A “Take a note…” shortcut sits under Add task on Home.'],
    ['Set up your profile','A short walkthrough helps you pick your address (checked as you type), introduce yourself, add links and choose who can see it.'],
    ['Settings on one page','Scroll through General, Invoices & bank, Appearance, Data & connections, What’s new and Account. The tabs follow along as you scroll.'],
    ['Cleaner toolbar and account area','Quick actions, search (⌘K), reports, settings and light/dark mode sit together in one bar; your name and log out sit neatly at the bottom of the sidebar.'],
    ['Even project cards','Every project card is the same size, with Archive and Delete side by side.'],
    ['Your colours everywhere','Reports and Levern items now use the SoloDesk palette.'],
  ],fixes:[
    'The “All changes saved” label is gone; SoloDesk only speaks up while saving or if something did not save.',
  ]},
  {version:'1.02',released:true,date:'2026-10-25',title:'A new look, and your whole client business in one place',highlights:[
    ['New design','A calmer, business-ready look: a black sidebar, warm Terracotta colours and clearer type across every page.'],
    ['Choose your action colour','Pick the highlight colour for your workspace in Settings → Appearance. Terracotta is the default.'],
    ['Jump back in','Home shows your three most recently edited clients, projects and Levern quests, with revenue, what needs attention and today’s timeline.'],
    ['All work','See every project, client and completed piece of work as cards, newest first.'],
    ['Client and project notes','Keep notes, checklists and dated reminders on each client and project. Reminders also show on Home.'],
    ['Project pages','Every project now has its own page with tasks, notes and files.'],
    ['Files & docs','Write PRDs in SoloDesk, turn their requirements into tasks, and link files from Drive, OneDrive, Notion or Figma.'],
    ['Live Excel sync (coming soon)','Link a Microsoft Excel workbook to a project or client, with task edits flowing both ways and SoloDesk asking before it overwrites anything. The panel is in Files & docs and switches on in an upcoming update.'],
    ['Public profile','A mini portfolio with your links and chosen clients at your own address. Private by default.'],
    ['Edit invoices on the page','Change the invoice number, title, your details, bill-to and bank details right on a draft invoice, and save bank details as your default.'],
    ['What’s new','Release notes like these, in Settings, and a short note after each update.'],
  ],fixes:[
    'Edits now record when they happened, so “most recent” is always accurate.',
  ]},
  {version:'1.01',released:true,date:'2026-10-25',title:'Calendar on phones and a new identity',highlights:[
    ['Throughline identity','A new SoloDesk logo and app icon, with a downloadable logo pack in Settings.'],
    ['Calendar source markers','Every date shows which connected calendars have events on it.'],
    ['Clients, projects, tasks & invoices','Your whole client business in one private workspace.'],
    ['Calendar','Month and agenda views, drag work to a new date, and export to Google or Apple Calendar.'],
    ['Levern connection','See Levern quests and shared Google Calendar events next to your work.'],
    ['Planning tools','Daily planner, conflicts & free time, focus timer, project templates and recurring invoice drafts.'],
    ['Client portal','Share chosen projects and sent invoices with a client.'],
    ['Safety nets','Undo, Trash, and backup & restore. Install as an app, dark mode and offline access.'],
  ],fixes:[
    'On phones, the Start time field in Conflicts & free time no longer runs past the card.',
    'On phones, the project popup in Calendar stays on screen and its Move to date field fits.',
  ]},
];
export const currentVersion=()=>changelog.find(entry=>entry.released)?.version||'1.01';
// Whether to show the "Terracove updated" note. Never to brand-new people (they get the tour). Otherwise once
// for each new version, and once after each sign-in: loginKey changes with every sign-in (not on reloads),
// seenLoginKey is the sign-in it was last shown for.
export function shouldShowUpdate(seenVersion,returning,loginKey,seenLoginKey){
  if(!returning)return false;
  if(!seenVersion||Number(seenVersion)<Number(currentVersion()))return true;
  return !!loginKey&&loginKey!==seenLoginKey;
}
