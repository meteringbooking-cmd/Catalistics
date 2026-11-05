# Catalistics

Unbranded field-team management console. Every page is a self-contained HTML file. No server is needed:
publish the folder (for example to GitHub + Vercel) and open `index.html`.

## First-time setup
1. Open **Storage & settings** (`storage.html`).
2. Paste your Firebase web-app config into **Primary database**, then **Test connection**.
   The secondary (Solar, staff, calendar) and asset-tracking databases fall back to the primary one if left blank.
3. Enter your **Targets**. Anything left blank shows as "Not set" and is not used for colours or AI judgements.
4. Add **Linked systems** (forms, HR, recruitment, solar sites, WhatsApp support number) if you use them.
5. Choose whether admin pages **require sign-in**, and set the administrator password.
6. Click **Download settings file** and publish `catalistics-settings.js` next to the pages so every user gets the same setup.
   (Leave "Include secrets" off for a public website.)
7. Optional: set up Catalistics AI with `catalistics-ai/SETUP.md` and paste the Worker address on Storage & settings.

## Shared files
| File | Purpose |
|---|---|
| `catalistics-config.js` | Loads the settings (storage, targets, links, sign-in) for every page. |
| `catalistics-theme.css` | Console colours, typography, buttons, tables and the sidebar/top bar. |
| `catalistics-shell.js` | Sidebar navigation, top bar, page search, notices. Add `?kiosk=1` to a page address to hide it on wall screens. |
| `catalistics-settings.js` | Optional. Downloaded from Storage & settings and published by you. |
| `login.html` | Firebase Authentication sign-in, used by Team capacity and Additional payments when sign-in is required. |
| `assets/` | Catalistics logo files and favicon. |

## Renamed pages
| Before | Now |
|---|---|
| bonus-barry.html | bonus-tracker.html |
| bonus-deduction-carl-review.html | bonus-deduction-final-review.html |
| gareth-stats.html | operations-uploads.html |
| Office-Screen.html | office-screen-summary.html |
| krakenam.html | morningwork.html |

## Placeholder names used in the code
Contracts are called **Alpha, Bravo, Charlie, Delta** (and **Echo**), the in-house team is **Core / CORE**,
team leaders are **Team Leader 1-5**. These are stored values the pages compare against, so a new company's data
should use the same values, or the names should be changed consistently across all pages.

## Worth reviewing before go-live
These are business rules in the page code, not targets, so they were left as they were:
- Bonus deduction bands (completion rate below 85 / 87.5 / 89.9%) and deduction percentages.
- Quarterly bonus tiers, additional-payment rates, per-job claim values, GSOS job values and Morning Work revenue rates.
- Hard-coded UK bank holiday lists.
