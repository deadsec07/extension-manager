# Extension Manager — Quick Toggle for Chrome Extensions

Quickly enable/disable other extensions in bulk. Protect essentials with **Exclude** lists, focus with **Include** lists, and undo changes with **Snapshot/Restore**. Lightweight, privacy-first.

## Features
- **Disable all except exclusions** — keep your critical tools on
- **Enable only inclusions** — a clean, focused environment
- **Snapshot & restore** — undo bulk changes in one click
- **Sync storage** — your lists can follow you via Chrome Sync
- **Privacy-first** — no tracking, no network requests

## Why this exists
When you’re debugging, gaming, or minimizing distractions, flipping multiple extensions one-by-one is slow. Manager gives you fast, predictable control.

## Install (Unpacked)
1. Download this repo.
2. Go to `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the project folder.

## How to use
1. Click the toolbar icon to open the popup.  
2. Mark extensions as **Included** or **Excluded** (checkboxes in the list), or use **Options** to paste IDs.  
3. Use:
   - **Disable all except exclusions** — turns everything off except excluded ones  
   - **Enable only inclusions** — turns on only the included ones  
   - **Snapshot** then **Restore** — safety net for experiments

## Permissions
- `management`: List and enable/disable your installed extensions **on demand**.
- `storage`: Save inclusion/exclusion lists and snapshot metadata.

## Privacy
- No analytics. No tracking. No external requests.
- All data stays in local storage (or Chrome Sync if you use it).

## Known limits
- Themes and built-in components cannot be toggled by Chrome’s API.

## Branding
by [hnetechnologies.com](https://hnetechnologies.com)

## License
MIT
