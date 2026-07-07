# Chrome Web Store Listing — JWT Workbench

Copy-paste ready. All fields respect current Chrome Web Store limits.

---

## Extension name
`JWT Workbench` (14 / 75 chars)

Alternate if you want a keyword in the name:
`JWT Workbench — Encode, Decode & Manage Tokens` (47 / 75)

---

## Short description (max 132 chars)
> Local JWT encoder, decoder, and signature verifier in Chrome's side panel. Save projects and reusable secrets.

(107 chars)

Alternates:
- `Encode, decode, verify, and re-sign JWTs from Chrome's side panel. Reusable projects and secrets, all local.` (107)
- `Private JWT tools for Chrome: decode from clipboard, edit claims, re-sign tokens, verify signatures, and save projects.` (116)

---

## Detailed description (max 16,000 chars)

**JWT Workbench is a private JWT encoder, decoder, and signature verifier built for Chrome's side panel.**

Keep it open beside your app, API console, docs, or logs while you inspect bearer tokens, edit claims, re-sign payloads, and verify signatures. Everything runs locally in your browser: tokens, payloads, projects, and signing secrets are never uploaded or sent to a server.

**ENCODE AND RE-SIGN TOKENS**
• Edit JWT headers and payloads as JSON with live syntax highlighting.
• Choose HS256, HS384, or HS512 and see the signed token update as you type.
• Add an `exp` claim with one click using presets from 5 minutes to 1 year.
• Copy the finished token instantly for API requests, tests, or debugging.

**DECODE AND VERIFY**
• Decode a JWT from your clipboard with one click, or paste a token manually.
• View clean, highlighted header and payload JSON.
• Read `exp`, `iat`, and `nbf` claims as human-friendly timestamps.
• Spot expired tokens quickly with an "Expired" badge.
• Verify signatures against a saved or pasted secret and get a clear result.

**SAVE REUSABLE PROJECTS**
Stop rebuilding the same test tokens from scratch. Save a header, payload, algorithm, and secret as a named project, reopen it later, tweak a claim, and copy a fresh token. You can create, save, duplicate, rename, and delete projects as your environments change.

**MANAGE SIGNING SECRETS LOCALLY**
Store reusable secrets with friendly names like "staging-api" or "auth-service" and select them from the encoder or decoder. Secrets are stored with `chrome.storage.local` on this browser profile and are not synced or transmitted.

**WHY DEVELOPERS USE IT**
• Side panel workflow: no tab switching to an online decoder.
• Local by design: no tracking, no uploads, no remote code.
• Useful for backend, frontend, QA, support, and API debugging.
• System light/dark theme and a clean, focused interface.

JWT Workbench is made for anyone who works with authentication tokens and wants a fast, private tool close at hand.

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

### Privacy practices tab — copy/paste answers

Use these exact answers for the missing publish requirements:

**Single purpose description**
> JWT Workbench lets users encode, decode, verify, and manage JSON Web Tokens locally in Chrome's side panel, including saving reusable token projects and named signing secrets.

**`clipboardRead` justification**
> JWT Workbench uses clipboardRead only when the user clicks "Decode from clipboard." The clipboard content is processed locally in the browser to decode a JWT and is not stored, transmitted, or shared.

**Remote code use justification**
> JWT Workbench does not use remote code. All JavaScript, CSS, and other executable code is bundled inside the extension package. The extension does not download or execute code from any remote server.

**`sidePanel` justification**
> JWT Workbench uses sidePanel to display its JWT encoder, decoder, project manager, and secret manager in Chrome's side panel when the user opens the extension.

**`storage` justification**
> JWT Workbench uses storage to save the user's JWT projects, named signing secrets, and local UI state in chrome.storage.local. This data remains on the user's browser profile and is not transmitted to any server.

**Data usage certification**
> JWT Workbench does not collect, sell, transfer, or use user data outside the extension's single purpose. Tokens, payloads, secrets, and projects stay local in the user's browser and are never transmitted.

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
