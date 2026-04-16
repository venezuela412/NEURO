# Telegram Mini App setup for NEURO

This guide connects your **deployed HTTPS URL** (for example Vercel) to a Telegram bot so the app opens inside Telegram with `window.Telegram.WebApp` available.

## Prerequisites

- A **public HTTPS** URL for the miniapp (no self-signed certificates).
- The same URL (or parent path) used for **`VITE_APP_URL`** when you build the frontend, so TonConnect manifest `url` matches where users open the app.

## 1. Create a bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send `/newbot` and follow prompts. You get a token (keep it private) and a username like `YourNeuroBot`.

Optional: set name and description with `/setname`, `/setdescription`.

## 2. Attach the Mini App URL

Telegram’s UI changes occasionally; use whichever path exists in BotFather:

1. Send `/mybots` → choose your bot → **Bot Settings**.
2. Look for **Configure Mini App** or **Menu Button** / **Web App**.
3. Set the **Mini App URL** (or **Web App URL**) to your deployed root, for example:
   - `https://your-project.vercel.app/`
4. Save.

**Important:** The URL must be **HTTPS** and reachable from Telegram’s servers.

## 3. How users open NEURO

- **Menu button:** If you set a default menu button with a Web App URL, users tap the button next to the chat input.
- **Inline / custom keyboards:** Your future bot backend can send `web_app` buttons pointing to the same URL.
- **Direct link:** Some clients allow `https://t.me/YourBotUsername?startapp` style deep links when Mini App is configured (depends on Telegram client).

For a hackathon demo, the **menu button Web App** is usually enough.

## 4. Match environment variables on the host

Set these on **Vercel** (or your static host) for **Production** builds, then **redeploy**:

| Variable | Purpose |
|----------|---------|
| `VITE_APP_URL` | Exact public origin of the app (e.g. `https://your-project.vercel.app`). Used when generating `tonconnect-manifest.json` at build time. |
| `VITE_CONTROL_PLANE_URL` | Public URL of your control-plane API. **Optional for a first UI-only test:** if unset, the app falls back to `http://localhost:8787` (fine on your PC with `pnpm dev:control-plane`, not from a phone or Telegram until you deploy the API). |
| `VITE_TELEGRAM_BOT_USERNAME` | Bot username **without** `@`, for copy or deep links in the app if referenced. |
| `VITE_TON_NETWORK` | `mainnet` or `testnet` as you prefer for the demo. |

After changing variables, trigger a new deployment so the manifest rebuilds.

### Blank screen on Vercel?

1. Open the site in **desktop Chrome** (not only Telegram), press **F12** → **Console** and note any red errors.
2. Confirm the address is **HTTPS** and matches `VITE_APP_URL` after you set it (then **Redeploy**).
3. A missing API alone should **not** blank the home page; if you still see white, check the console or redeploy after pulling the latest repo (includes a root error boundary for clearer failures).

## 5. Control plane: signed actions and CORS

If users run NEURO from `https://your-project.vercel.app`:

1. **CORS:** The control plane must allow that origin (already permissive in dev; tighten for production as you harden).
2. **`ALLOWED_SIGN_DOMAINS`:** Include your host, e.g. `your-project.vercel.app` (no scheme), so wallet `signData` proofs validate.

## 6. TonConnect and Telegram

- TonConnect opens the user’s wallet (Tonkeeper, etc.). That works from a Mini App as long as the **manifest URL** is correct and the domain is allowed by the wallet.
- NEURO loads the manifest from `${origin}/tonconnect-manifest.json`, so the **opened URL** must be the same origin you built with (`VITE_APP_URL`).

## 7. Quick test checklist

- [ ] Open the **same** URL in desktop Chrome: app loads, no mixed-content errors.
- [ ] Open the bot → launch Mini App: header shows **Telegram mode** in NEURO where applicable.
- [ ] Connect wallet from inside Telegram: TonConnect UI appears and returns to the app.
- [ ] If using control plane: `GET /health` on the API URL works from your machine.

## 8. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Blank or “cannot load” in Telegram | HTTP only, bad cert, or URL typo in BotFather. |
| TonConnect errors / wrong app | `VITE_APP_URL` does not match the live origin; rebuild. |
| Signed save fails against API | `ALLOWED_SIGN_DOMAINS` missing your Vercel host. |
| API unreachable from phone | Wrong `VITE_CONTROL_PLANE_URL`, CORS, or API not deployed. |

## Official references

- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [BotFather](https://t.me/BotFather)
