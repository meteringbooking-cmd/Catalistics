# Catalistics AI assistant - setup (about 20 minutes, no cost)

The assistant is the full page `catalistics-ai.html`. It needs one small free service (a Cloudflare Worker)
that holds your Google Gemini key safely. Nothing secret is ever put in the web pages.

## 1. Get a Gemini key
1. Go to https://aistudio.google.com/apikey and sign in with a Google account.
2. Click **Create API key** and copy it. Keep it private: it goes into the Worker only, never into a page or a spreadsheet.

## 2. Create the Worker
1. Create a free account at https://dash.cloudflare.com.
2. Go to **Workers & Pages > Create > Create Worker**. Name it `catalistics-ai` and click **Deploy**.
3. Click **Edit code**, delete what is there, paste in everything from `worker.js`, and click **Deploy**.

## 3. Add the Worker settings
Open the Worker > **Settings > Variables and Secrets** and add:

| Name | Type | Value |
|---|---|---|
| `GEMINI_API_KEY` | Secret | the key from step 1 |
| `ACCESS_CODE` | Secret | a code you choose and give to management |
| `ALLOWED_ORIGINS` | Text | the website the pages are on, with no path, e.g. `https://portal.example.com` (separate several with commas) |
| `FINANCE_PIN` | Secret (optional) | a 4 to 6 digit PIN that unlocks finance questions. Without it finance stays locked |
| `GEMINI_MODEL` | Text (optional) | defaults to `gemini-3.8-flash`. Change it here if Google retires that model |
| `DAILY_LIMIT` | Text (optional) | requests per day, default 400 (needs a KV binding named `KV`) |

## 4. Connect the pages
1. Copy your Worker address (it looks like `https://catalistics-ai.<your-account>.workers.dev`).
2. Open **Storage & settings** (`storage.html`) in the console, go to **Catalistics AI** and paste the address.
3. Save. To give every user the same setting, use **Download settings file** on that page and publish
   `catalistics-settings.js` next to the other pages.

## 5. Try it
Open **Catalistics AI**, enter the access code, and ask for example "Top 10 engineers by meters this week".
Open **How this was worked out** under any answer to see what it looked up. Check the first few answers against
the dashboard figures before relying on them.

## Things to know
- **Usage:** each question uses 2 to 5 requests to Gemini. The Worker allows 20 requests per visitor per minute.
- **Data privacy:** Google's free tier may use submitted content to improve its products. Work data (engineer names,
  meters, attendance) is sent to Gemini to answer questions. Use Google's paid tier if that is not acceptable.
- **What it can read:** only the collections listed in `CATALOG` in the page. Passwords, e-mails, phone numbers,
  addresses, postcodes, bank details, salary, NI numbers and dates of birth are removed before anything is sent.
- **Targets:** the assistant reads the targets entered on Storage & settings, so it always uses the same numbers as the dashboards.
- **Teaching it your business:** edit the `KNOWLEDGE` guide and the `CATALOG` descriptions in the page.
- **Database rules:** the page reads the database directly from the browser, like every other page, so the assistant
  can only see what your database security rules already allow.
- **Other systems:** the assistant can also read Solar, HR, Recruitment and Asset Tracking data when those databases
  are connected on Storage & settings (secondary and asset tracking databases).

Finance and profit data (revenue, outgoings, forecasts, engineer daily profit) is locked by default. A manager presses
**Finance** in the assistant and enters the finance PIN. The PIN is checked by the Worker (never in the web page),
allows 5 wrong attempts per 10 minutes, and finance locks again after 15 minutes without a question.
The PIN controls what the assistant will discuss. It is not a database security control, so also set your
database security rules if finance figures must be truly private.
