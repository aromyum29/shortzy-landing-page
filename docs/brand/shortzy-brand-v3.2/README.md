# Shortzy brand guidelines

Version 3.2 · 8 October 2026

Open `index.html` in a browser to explore the brand and product states. It works offline without installation. Give Codex this whole folder and ask it to follow `CODEX_HANDOFF.md`.

## Direction

Shortzy helps creators find promising moments in longer videos and turn them into shorts. The identity is playful, warm and easy to understand. A matte maroon and grey palette gives it weight; an expressive filmstrip character brings personality to onboarding and task feedback.

Use **Shortzy**, with a z, in all product copy. The wordmark artwork uses lowercase. Tagline: “Long video in. Shorts out.” Promise a useful starting point and creative control, never guaranteed virality.

This revision replaces the old grey mascot with a folded corner and heavy outlines. The new mascot is the maroon filmstrip character provided as separate action images in `assets/mascot/`. The compact logo and wordmark remain the maroon SVG assets from version 2. A logo symbol and a mascot do not have to be identical.

## Colour system

| Token | Colour | Role |
| --- | --- | --- |
| maroon | #702F42 | Brand anchor, primary buttons, headings and logo |
| pebbleGrey | #C9C5C1 | Neutral surfaces, mascot limbs, decorative dividers |
| warmPaper | #F3F1EE | Main canvas, warm off-white details |
| softCoral | #E7ADA0 | Cheeks, small highlights and friendly accents |
| roseClay | #E9D6D2 | Selected and supporting panels |
| oatGold | #D5C28F | Small celebration details, clip highlights |
| deepMaroon | #43202B | Mascot pupils, brows and mouth details |
| ink | #292628 | Primary text on light backgrounds |
| muted | #625B60 | Secondary text on paper or white; control boundaries |
| white | #FFFFFF | Raised surfaces and text on maroon |

Aim for about 70% neutral surfaces, 20% maroon and 10% accents across a page. Treat this as a composition guide. Large maroon surfaces are best reserved for focused brand moments. Keep editing surfaces and video previews calm.

Matte means low visual shine: no glossy effects, bevels, glows or metallic styling. Use solid UI colours. The supplied raster mascot has slight tonal variation from generation; use the exact tokens for interface elements rather than sampling pixels from the illustration.

## Accessible combinations

Use ink on all light palette surfaces. White on maroon is the primary action pairing. Maroon on paper is suitable for text and secondary actions. Use muted text only on white or paper. Coral, rose, grey and oat need dark text; avoid white text on these colours.

Use maroon borders plus text or a check icon for selected states. Pebble is decorative and is too light to identify an input boundary on white by itself. Use the muted token for essential control boundaries. Focus rings are 3 px maroon with a 4 px offset on light surfaces; use paper rings on dark surfaces. Colour must never be the only status indicator.

`UI_STATES.md` defines the full interaction and application state system, including hover, pressed/active, focus, selected, disabled, loading, read-only, validation and combined states. Use `index.html` to inspect real interactive examples.

`VALIDATION.md` records measured contrast for the intended pairings. These checks do not certify an entire application. Real components still need keyboard access, labels, screen reader status and responsive testing.

## Logo

`assets/logo.svg` is the primary outlined wordmark with compact video mark and terminal dot. `assets/logo-mark.svg` is the small standalone mark. Both remain vector assets. Do not retype the wordmark or treat the raster mascot as a replacement logo.

Minimum sizes: wordmark 120 CSS px wide, standalone mark 24 CSS px. Keep clear space equal to 20% of the mark width. Use on white or paper. On other backgrounds place it on a light plate with clear space. Keep original proportions. Do not add eyes, gradients, glow or a random recolour to the logo.

## Mascot identity

The mascot is a soft, rounded vertical filmstrip tile with matte maroon body, grey hands and feet, large warm-white eyes, deep maroon pupils, a simple smile, coral cheek freckles and a warm-white play badge. Film perforations sit along both sides. The silhouette should read as a video character, with no folded document corner.

Use simple rounded filled shapes, expressive brows and friendly gestures. Avoid a heavy enclosing outline, realistic anatomy, shiny 3D rendering and elaborate detail. One small eye catchlight is part of the character. Keep eye style, body proportions, film perforations and badge consistent across poses. Small leaning gestures are welcome. Do not independently stretch the eyes, body or limbs.

The four supplied poses form the current asset set:

| Pose key | Asset | Expression | Use |
| --- | --- | --- | --- |
| welcome | `assets/mascot/welcome.png` | Waving with a happy open smile | Welcome, import, empty library |
| thinking | `assets/mascot/thinking.png` | Looking upward with a hand at the chin | Analysis, considering content |
| clipping | `assets/mascot/clipping.png` | Holding a video strip with a selected frame | Reviewing candidate clips, export in progress |
| celebration | `assets/mascot/celebration.png` | Arms raised with closed happy eyes | Successful export completion |

Each pose is now a separate transparent PNG, named by action. These standalone renditions were generated from the selected concept sheet, preserving the intended pose and character identity; they are not pixel-identical crops. `assets/mascot/manifest.json` records the dimensions and context for each file. The original sheet remains under `references/mascot-concept-sheet.png` as a reference only. The application uses normal images, without sprite sheets or CSS cropping. The assets are raster, not SVG artwork. No separate error, sad or empty-result pose has been created.


## Product state mapping

| Application state | Pose | Suggested copy | Behaviour |
| --- | --- | --- | --- |
| welcome | welcome | Add your video. Let’s find your next short. | Pair with import action |
| idle | welcome | Start with a video you want to clip. | Use only in an empty library |
| analyzing | thinking | Looking for strong moments. | Show real stage and progress separately |
| found | clipping | Your clips are ready to review. | Keep result thumbnails dominant |
| exporting | clipping | Exporting your selected clips. | Use actual progress and cancel behaviour |
| done | celebration | Your clips are ready to share. | Only after output files exist |
| empty | none | No strong matches yet. Try a different range. | Offer range adjustment or manual clipping |
| error | none | We couldn’t process this video. | Show the actual reason and recovery action |

Do not imply eight original poses exist by duplicating images under different filenames. A future error or empty-result pose must follow the same character model; until then the UI uses clear text without the mascot. A thinking question mark is decorative, so make analysis text unambiguous.

Use one mascot per panel. Recommended component width: 240–360 px for onboarding, 180–240 px for progress, 96–160 px for results headers. Use a stable square display box with `object-fit: contain` to preserve proportions and avoid clipping limbs or props. Omit the mascot at very small sizes where the face cannot be read. It should never cover a video preview, editor timeline or action button.

## Behaviour and accessibility

Mascots are decorative when adjacent text explains the state. Use `aria-hidden="true"`. For informative standalone use, add an accessible label. Do not announce the same message through both a mascot and status text. Keep job updates in a separate polite live region and render errors with clear text and an actionable control.

The supplied poses are static. They do not imply animation assets exist. Optional future movement should be gentle, short and limited to brand moments, with reduced-motion preferences honoured. Never use animation as the only progress signal. Never celebrate a failed or cancelled export.

## Typography, layout and components

Use the system sans stack in `brand.css` for offline reliability. Body 16 px / 1.55, labels 14 px, captions 12 px, headings 32 px / 1.1 and display 56 px / 1.1. Use bold for hierarchy and action emphasis.

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 and 96 px. Control radius 12 px, card radius 24 px, chips fully rounded. Primary controls have at least 48 px height. Editor previews and timeline sections may use 8 px corners.

Primary action: white text on maroon. Secondary action: dark text with maroon outline. Selected panel: rose clay with maroon outline and check label. Disabled action: rose clay and ink text, disabled semantics and no pointer interaction. Avoid putting an accent colour on every component.

## Voice

Friendly, direct and creator focused. Use “Find clips”, “Review clips”, “Export clips” and “Try another video”. Say what is happening and what the creator can do next. Avoid baby talk, exaggerated AI claims and guaranteed virality. Explain clip selections using actual content evidence such as a clear hook or complete answer.

Only promise local or offline processing when the implementation supports it. If an AI service receives content, explain that before upload. These guidelines provide visuals and UI patterns, not video processing logic.

## Included files

* `index.html`, `guide.css`, `guide.js`: offline visual guidelines with interactive examples.
* `tokens.json`: exact palette, semantic tokens, sizes and mascot state mapping.
* `brand.css`: reusable component styles and proportional mascot image display.
* `mascot.js`: plain-script mascot helper for the offline guide.
* `mascot.mjs`: optional ES module exports for an application.
* `assets/logo.svg`, `assets/logo-mark.svg`: current vector logo assets.
* `assets/mascot/welcome.png`, `thinking.png`, `clipping.png`, `celebration.png`: individual transparent action images.
* `assets/mascot/manifest.json`: dimensions and application-state mappings.
* `references/mascot-concept-sheet.png`: original concept reference, not an app dependency.
* `UI_STATES.md`: component states, state precedence and full application feedback specification.
* `CODEX_HANDOFF.md`: implementation brief and usage examples.
* `VALIDATION.md`: checks performed and limits.
* `CHANGELOG.md`: what changed in this revision.
