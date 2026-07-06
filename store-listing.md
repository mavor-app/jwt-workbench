# Chrome Web Store Listing — JWT Workbench

Copy-paste ready. All fields respect current Chrome Web Store limits.

---

## Extension name
`JWT Workbench` (14 / 75 chars)

Alternate if you want a keyword in the name:
`JWT Workbench — Encode, Decode & Manage Tokens` (47 / 75)

---

## Short description (max 132 chars)
> Encode, decode, and manage JWTs in a side panel. Save reusable projects, store named secrets, and verify signatures — all local.

(129 chars)

Alternates:
- `A JWT toolbox in your side panel: decode from clipboard, edit & re-sign tokens, save projects, and manage secrets.` (114)
- `Decode, edit, and re-sign JWTs without leaving your browser. Reusable projects, a secret library, and instant copy.` (115)

---

## Detailed description (max 16,000 chars)

**JWT Workbench is a fast, private JSON Web Token toolkit that lives in your browser's side panel — so it's one click away while you work.**

Unlike online decoders, JWT Workbench runs entirely on your machine. Your tokens, payloads, and secrets never leave the browser and are never sent to any server.

**━━━ ENCODE ━━━**
• Edit the header and payload as JSON with live syntax highlighting and one-click formatting.
• Pick the signing algorithm (HS256, HS384, HS512) from a dropdown.
• Watch the signed token update in real time as you type.
• Set an expiration with one click — presets from 5 minutes to 1 year drop a correct `exp` claim straight into your payload.
• Copy the finished token instantly.

**━━━ DECODE ━━━**
• Hit one button to grab a JWT from your clipboard and decode it immediately.
• Or paste a token manually — it decodes as you type.
• See the header and payload as clean, color-highlighted JSON.
• Human-readable `exp`, `iat`, and `nbf` timestamps, plus an at-a-glance "Expired" badge.
• Optionally verify the signature against any secret and get a clear Verified / Invalid result.

**━━━ PROJECTS ━━━**
Stop pasting the same payloads over and over. Save a header + payload + secret as a named project, then reopen it anytime, tweak the payload, and grab a fresh token. Full create, save, save-as, rename, and delete. Turn any decoded token into a new project in one click.

**━━━ SECRET LIBRARY ━━━**
Save your signing secrets with friendly names (like "staging-api" or "auth-service") and reuse them across projects — in both the encoder and the decoder. No more digging through notes for the right key.

**━━━ BUILT FOR DEVELOPERS ━━━**
• 100% local — nothing is uploaded, tracked, or logged.
• Lives in the side panel, so it stays open next to your app, docs, or API console.
• Automatic light/dark theme that follows your system.
• Clean, keyboard-friendly UI.

Perfect for backend and frontend developers, QA engineers, and anyone who works with authentication tokens day to day.

Open source and built with modern web tech. Feedback and issues welcome.

---

## Category
Developer Tools

## Language
English (United States)

---

## Search keywords / tags
`JWT, JSON Web Token, decode, encode, token, authentication, developer tools, jwt.io, base64, HS256, debugger, API, bearer token`

---

## Permission justifications (required by Chrome review)

**`sidePanel`**
Used to display the extension's UI in the browser side panel, which opens when the user clicks the toolbar icon.

**`storage`**
Used to save the user's JWT projects and named secrets locally via `chrome.storage.local` so they persist between sessions. No data is transmitted off the device.

**`clipboardRead`**
Used by the "Decode from clipboard" button to read a JWT the user has copied, so it can be decoded automatically. The clipboard is read only when the user clicks that button.

**Remote code:** None. All code is bundled in the extension package.

**Data usage disclosures (Privacy tab):**
- Does the extension collect or use personally identifiable information? **No**
- Health, financial, authentication, personal communications, location, web history, user activity, website content? **No** — all data stays on the user's device and is never transmitted.
- Sold to third parties? **No.** Used for unrelated purposes? **No.** Used to determine creditworthiness / lending? **No.**

---

## Single purpose statement (required)
> JWT Workbench lets users encode, decode, and manage JSON Web Tokens locally in the browser's side panel, including saving reusable token configurations and named secrets.

---

## Privacy policy (short form you can host)

**JWT Workbench Privacy Policy**

JWT Workbench does not collect, transmit, or share any user data. All tokens, JSON payloads, secrets, and project configurations you create are stored locally on your device using the browser's `chrome.storage.local` API and never leave your browser. The extension makes no network requests. Reading your clipboard happens only when you explicitly press the "Decode from clipboard" button, and that content is used solely to decode the token on your device.

Contact: <your-email@example.com>

---

## Screenshot captions (1280×800 or 640×400 PNG/JPEG, up to 5)

1. **"Encode & sign JWTs in real time"** — Encoder tab with header/payload editors, algorithm dropdown, and a live color-highlighted token.
2. **"Decode any token in one click"** — Decoder tab showing a decoded header/payload with the "Signature verified" badge.
3. **"Save reusable projects"** — Project dropdown open with several saved configs.
4. **"A library of named secrets"** — Secret manager dialog and the secret picker in use.
5. **"Set expiration with one tap"** — The exp presets menu (5 minutes … 1 year) over a payload.

## Small promo tile (440×280) text
> **JWT Workbench**
> Decode. Edit. Re-sign. All local.

## Marquee promo (1400×560) text
> **Your JWT toolkit, one click away.**
> Encode, decode, and manage tokens in the side panel — with reusable projects and a secret library.
