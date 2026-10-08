# Shortzy: product and implementation handoff for another LLM

> Snapshot: 8 October 2026. This document explains the product, the owner's decisions, and the current development state. It is not a claim that every implemented feature has passed production validation. Verify the code and current provider documentation before changing integrations or pricing.

## 1. What Shortzy is

Shortzy is a downloadable, local-first desktop application that turns long videos into short-form clips suitable for social platforms, especially YouTube Shorts.

A user supplies a YouTube link or a video file, connects their own AI account, chooses the desired output, and receives titled, captioned clips ranked by estimated editorial or viral potential. The AI finds suitable moments and returns editing instructions. The user's computer performs the actual editing and exports the videos.

The product began as a solution to the owner's personal workflow. The commercial direction is a paid downloadable app sold through the owner's domain. Customers supply their own API keys and pay their chosen AI provider directly for usage. Shortzy does not supply a shared key, resell bundled AI credits, or run a cloud video-rendering service. Exact purchase pricing, checkout, and the marketing website are separate work, outside this repository.

The product name is **Shortzy**. Earlier discussion sometimes used Clipper or Shortsy; use Shortzy in current product copy.

## 2. Who it serves

Shortzy is for creators who want to grow their social presence without manually finding, cutting, captioning, and formatting every short.

The primary source content is:

- Podcasts and interviews.
- Tutorials and educational explanations.
- Business and AI information.

Users may be comfortable with everyday technology but unfamiliar with APIs, model names, tokens, and developer tools. Explain choices in ordinary language and progressively reveal detail. Most expected inputs are YouTube links. Uploading a personal video is an equally valid alternative, never a mandatory extra step after a successful link import.

## 3. The core promise and boundaries

**Long video in. Shorts out.**

- AI analyzes content; local tools trim, frame, caption, encode, and export.
- Projects, working media, previews, and outputs live in a user-selected local workspace.
- Originals must remain untouched.
- Selected video, audio, frames, or transcript content can be sent to the user's chosen AI provider for analysis. “Local-first” does not mean AI analysis is offline.
- Give the user an estimated API cost before generation begins.
- Produce useful, distinct moments rather than filler to meet a requested count.
- Recover from failed imports, analysis, and rendering without unnecessarily discarding completed work.
- Never imply that a clip score guarantees views or that model access proves billing readiness.

YouTube imports retain source attribution. Do not treat attribution or promotional intent as proof of permission to reuse content. The downloader does not bypass private-video access or sign-in restrictions.

## 4. First-run onboarding

Use one main progress indicator with exactly five steps:

1. **Welcome:** briefly introduce the source-to-shorts workflow.
2. **Your workspace:** let users select their local storage folder. Recommend 20 GB of free space as a starting point, not a reservation or a universal minimum for every project.
3. **Choose a model:** choose an AI provider, then its model.
4. **Understand the cost:** explain the estimated cost for processing the user's video.
5. **Connect your key:** provide help, accept a private API key, and verify the connection.

Do not split steps 3–5 into a second nested progress indicator during onboarding. Settings reuses the progressive AI setup screens when someone adds or changes a connection.

### AI choices

Only **Gemini** and **Qwen** are selectable for new setup. Gemini has a **Recommended** badge. Kimi's previous selection slot is now a noninteractive **Coming soon** card. Legacy Kimi integration code remains, and previously saved Kimi keys can still be removed.

The current configuration includes Gemini Flash 3.8 / Flash Lite 3.5 and Qwen 3.8 / 3.5 Omni Flash. Flash 3.8 and Qwen 3.8 Omni Flash receive the requested higher-output-quality badge. These are product recommendations, not measured quality guarantees. Treat model identifiers, availability, account regions, and rates as time-sensitive configuration that must be rechecked before release.

Use real provider logos, preserve their aspect ratios, and provide enough padding to avoid cropping. Do not restore the old “Extra setup” or “Lowest estimate” badges.

### Cost screen

- Default to **60 minutes**.
- Provide an obviously editable duration field and a slider.
- Derive pricing from the selected model; do not ask users to choose an arbitrary per-minute rate.
- Show the alternate provider's estimate for the same duration, clearly identifying its model.
- Use a visual sequence: source video → AI analysis → up to 10 locally edited shorts.
- Keep detailed assumptions collapsed and make clear that estimates are ranges, not guaranteed bills.
- Cost previews themselves must not trigger paid analysis.

### Key connection and completion

Describe the API connection as the user's **AI brain**, while still labeling the credential field accurately as an API key.

Explain that the key is private, must never be shared, and lets users pay the provider directly rather than buying an AI-credit bundle from Shortzy. Avoid promising universal savings against competitors.

Put the official Get API key link and expandable walkthrough/privacy cards above the key field. The masked key field is the last input. Include an explicitly labeled dummy example. Official tutorial links are used where available; built-in visual walkthroughs cover the rest. The owner may replace tutorial links with their own videos later.

The Connect button performs the real connection check and displays a verification modal while it is pending. A failure returns to the form with an actionable error. Successful onboarding connection saves setup, enters the app, and shows a short confetti welcome that thanks the user, invites suggestions, and leads to creating the first project. Respect reduced-motion preferences.

“Explore first” and “I'll connect later” require a confirmation explaining that the user can explore but must connect an AI to make clips. Do not use em dashes in onboarding copy.

## 5. Project workflow

1. Create a project from a YouTube URL or a local video.
2. While the source imports, collect output preferences.
3. If multiple supported providers are connected, choose the AI first, then its model.
4. Request **1–10 clips**, ordinarily **30–60 seconds** each, with **9:16 vertical** as the main use case.
5. Choose one of four caption presets: **Bold pop**, **Word highlight**, **Condensed**, or **Clean box**. A no-captions option is also available.
6. Optionally adjust shape, framing, fonts, colors, caption placement, language, or a moment/topic to find. Tutorials and slides can use fit framing instead of face cropping.
7. Review the estimate for the actual source and selected options, then explicitly start generation.
8. AI returns validated structured instructions, including timestamps, titles, score components, reasons, and word timings.
9. Local workers render the clips.
10. Review results in score order and download individual MP4 files or a ZIP of the clip set. Preserve earlier clip sets.

If a user asks for 10 clips but only six strong, distinct moments exist, return six and explain why. Do not claim the full source-analysis charge disappeared merely because fewer clips were rendered.

“Viral potential” is an editorial estimate. The current scoring dimensions include opening, momentum, payoff, clarity, relevance, and audiovisual suitability. Do not present these as YouTube's disclosed ranking formula. Major scoring or recommendation changes should be discussed with the owner before implementation.

## 6. Desktop architecture

Shortzy is a **desktop app**, even though its interface uses web technology. A localhost URL in a development preview does not make the intended product a hosted website.

| Layer | Current approach |
| --- | --- |
| Desktop shell | Tauri / Rust |
| Interface | React, TypeScript, Vite, TanStack Query |
| Local service | FastAPI, Python, SQLModel |
| Persistence | SQLite plus local project/media files |
| Packaged Python runtime | PyInstaller sidecar |
| Media processing | Bundled FFmpeg / FFprobe |
| Face detection and tracking | Local MediaPipe with smoothed crop paths |
| Caption rendering | ASS subtitles through FFmpeg/libass |
| Local transcription support | Bundled Whisper runtime/model where needed |
| YouTube acquisition | yt-dlp with bundled Node support |
| Credential storage | macOS Keychain / Windows Credential Manager |

Preserve this architecture unless there is a concrete reason to change it. Customers should not need to install Python, Node, FFmpeg, or other developer tools separately.

The desktop shell launches an authenticated loopback service with an ephemeral session token and HttpOnly cookie. An OS workspace lock prevents two desktop engines from opening the same workspace. Bounded background workers keep imports and rendering away from the UI thread.

Gemini and Qwen currently receive prepared audio/video analysis proxies. The legacy Kimi adapter uses locally transcribed speech plus sampled frames. AI responses must be bounded, validated editing plans, never arbitrary commands to execute.

The renderer probes hardware encoders and falls back to software when necessary. MediaPipe tracks faces; it is not validated active-speaker recognition. If face tracking is unavailable or no face is found, report the centered-crop fallback honestly.

Workspace relocation uses a native folder picker, checks the destination, copies app-owned media and an SQLite snapshot, rewrites owned absolute paths, and commits a bootstrap pointer before restarting. It preserves the credential namespace and retains the old workspace as a backup. Active imports/rendering block relocation. The browser development preview uses a full-path field instead of the native picker.

## 7. Settings and privacy

The app has a project-oriented sidebar and Settings sections for:

- AI connections.
- Local storage.
- Privacy and data.
- Installed app version, updates, and release notes.
- Request a feature.
- Reset Shortzy, below Request a feature.

“Version control” means app version, updates, and release notes, not Git or an editing timeline.

Reset requires an explicit destructive confirmation, removes app-owned workspace content/preferences/connections, and returns to setup. It must preserve originals outside the workspace and must not run during active work. Disconnecting or resetting does not revoke a provider's API key or close its account.

Never put keys in chat, browser storage, logs, project records, exports, screenshots, source control, analytics, or a shipped developer configuration. Persist only nonsecret onboarding choices outside the OS credential store.

The feature-request form currently opens an email draft addressed to **medisarom@gmail.com**. Direct in-app delivery is not connected. PostHog is desired for future product monitoring but is currently **not connected**. Do not claim analytics are already running or add cloud video processing under the guise of monitoring.

## 8. Brand and interaction language

The owner's supplied **Shortzy v3.2** brand package is authoritative. The earlier purple identity is obsolete.

| Role | Color |
| --- | --- |
| Primary maroon | `#702F42` |
| Deep maroon | `#43202B` |
| Warm paper | `#F3F1EE` |
| White surface | `#FFFFFF` |
| Ink | `#292628` |
| Muted text | `#625B60` |
| Pebble grey | `#C9C5C1` |
| Coral | `#E7ADA0` |
| Rose clay | `#E9D6D2` |
| Oat gold | `#D5C28F` |

Use system sans typography, generous but purposeful spacing, clear field boundaries, visible keyboard focus, and large primary controls. Brand guidance uses approximately 12px control radii and 24px panel radii. Use the supplied logo and filmstrip mascot assets, not newly invented replacements.

The interface should feel warm, approachable, and useful without overwhelming people. Explain one decision at a time. Use real status information rather than invented progress percentages or fake results.

Requested components have been adapted to the brand:

- Watermelon Select 9 for dropdowns.
- Watermelon expandable profile card for optional help/details.
- Watermelon Badge 10 for shared badges.

Mobbin informed earlier flow research. Use Impeccable for UI reviews and polish while preserving the owner's brand and explicit product decisions.

## 9. Implementation and validation status

### Implemented in the current development code

Project persistence, local/YouTube imports, multiple stored provider connections, upfront estimates, structured AI adapters, local trimming/framing/captions/export, clip ranking and downloads, cancellation, cached analysis sections, reset, and the revised five-step onboarding are implemented.

A macOS Apple Silicon private-QA bundle exists. The latest onboarding build is **Shortzy Preview.app**, with a separate identifier and default workspace so it can run alongside the existing Shortzy app. The current bundle is approximately 1.5 GiB and targets macOS 14 or later. Windows support is an implementation target with packaging paths, not a verified shipping build.

### Evidence available

- Latest backend run: **178 passed, four skipped**.
- TypeScript/Vite and Tauri release builds passed.
- Frozen-service startup, authentication, bundled frontend, and yt-dlp smoke checks passed without developer runtimes on PATH.
- Real FFmpeg rendered captioned output from an actual video with fixture timestamps; the original file was preserved.
- Connection failure/success UI was checked using synthetic credentials and simulated provider responses.
- The revised desktop onboarding opened successfully.
- Workspace migration has 11 integration tests. The latest native picker/restart UI interaction still needs hands-on QA.

### Important remaining work

- A real paid-provider run through analysis, word timestamps, clipping, captions, and export.
- Successful real-face MediaPipe tracking in an unrestricted desktop environment; this host's graphics-context initialization failed, and fallback behavior was tested instead.
- Windows and clean-machine execution.
- Signed/notarized distribution, installer/update validation, and final dependency/codec licensing review.
- Automated browser assertions: standalone Chromium is blocked by this host's Mach-port sandbox restriction. Test discovery is not a test pass.
- Direct feature-request email delivery and any consented PostHog implementation.

Do not call this production-ready or imply that fixture-based rendering proves the full paid-AI pipeline. The development FFmpeg bundle is explicitly for private QA and is not cleared for public redistribution.

## 10. Repository orientation and guidance for the next LLM

Repository: `outputs/viral-clipper` within the working project. The older folder name is historical; the product is Shortzy.

- `frontend/src/Onboarding.tsx`: main five-step onboarding.
- `frontend/src/WorkspaceSetup.tsx`: folder choice and space guidance.
- `frontend/src/AIConnection.tsx`: provider/model/key setup.
- `frontend/src/CostPreview.tsx`: duration-based provider comparison.
- `frontend/src/WelcomeCelebration.tsx`: successful setup welcome.
- `frontend/src/ProcessingWorkspace.tsx`: output preferences and clip results.
- `frontend/src/SettingsPage.tsx`: connection, storage, privacy, feedback, and reset UI.
- `frontend/src/providers.ts`: provider/model choices and editable tutorial links.
- `backend/app/services/`: AI adapters, estimates, jobs, storage, captions, tracking, and local rendering.
- `src-tauri/`: desktop shell, native dialog integration, and packaging configuration.
- `scripts/`: setup, resource packaging, and smoke tests.
- `docs/brand/`: supplied visual authority.
- `docs/AI_PRICING.md`, `docs/AI_SETUP_DESIGN.md`, `docs/UI_AUDIT.md`, `docs/DISTRIBUTION.md`, and `BUILD.md`: assumptions, design decisions, evidence, and release requirements.

Some repository documents contain historical sections describing earlier prototypes. Where they conflict, inspect the latest dated build/audit entry and actual code. Do not revert to a three-step onboarding, re-enable Kimi setup, or remove working local-engine capabilities based on stale prose.

Before making changes, inspect the relevant implementation and preserve existing user projects and uncommitted work. Keep the distinction between implemented, tested, planned, and publicly distributable explicit. Focus on the product itself; do not expand into checkout, subscriptions, a landing page, or cloud rendering unless the owner requests it.
