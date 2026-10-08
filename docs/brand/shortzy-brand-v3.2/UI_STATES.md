# Shortzy application state specification

Version 3.2 · Light theme · 8 October 2026

This file defines the interaction and workflow states for the clipping application. `tokens.json` supplies exact values, `brand.css` implements reusable styles and `index.html` provides an interactive reference. The reference has no video engine or service connection.

## State vocabulary

| State | Meaning | Trigger / semantics |
| --- | --- | --- |
| Default | Enabled and at rest | Native enabled control |
| Hover | Pointer is over the control | `:hover`; never required to understand an action |
| Pressed / active | Control is being activated | `:active`; transient, not a saved choice |
| Focus visible | Keyboard focus needs a visible indicator | `:focus-visible`; 3 px ring with 4 px offset |
| Selected | A persistent chosen item | Native checked, `aria-pressed`, `aria-selected` or `aria-current`, depending on control |
| Disabled | Action is currently unavailable | Native `disabled` when possible; explain why nearby |
| Loading / busy | Action started and is incomplete | `aria-busy`, visible label and duplicate-submit guard |
| Read-only | Value can be read or copied but not edited | Native `readonly`, not disabled |
| Invalid | Value or operation cannot be accepted | `aria-invalid`, described error text and recovery |
| Valid | A meaningful check succeeded | Explicit success text when useful; avoid decorating every field |
| Mixed | Some items in a group are selected | Native checkbox `indeterminate` or equivalent mixed semantics |
| Drag over | A compatible drop interaction is in progress | Solid maroon boundary, rose surface and visible instruction |
| Empty | There is no content to show | Explain what is empty and provide a next action |
| Skeleton | Content layout is known but data is loading | Decorative blocks plus a textual loading message |
| Success / warning / error / information | Meaning of system feedback | Distinct icon or label, text and semantic colour |

### State precedence

Disabled suppresses activation and hover/pressed effects. Busy prevents duplicate submission, keeps the action label, and remains discoverable. Focus is an independent visible layer for enabled controls, including selected, invalid and read-only states. Error and selected indicators must not disappear on hover. Invalid takes priority over a stale success flag. Pressed is temporary; selection persists after release. A disabled control should not simultaneously advertise a fresh validation outcome.

`data-preview-state` is only for pinning visuals in the guideline. Production uses actual browser states and semantic attributes. Do not ship permanently forced hover or pressed styling.

## Buttons and links

| Variant | Default | Hover | Pressed |
| --- | --- | --- | --- |
| Primary | #702F42 background, white text | #612539 background | #522030 background |
| Secondary | White fill, #702F42 border/text | Paper fill, #612539 border/text | Rose fill, #522030 border/text |
| Ghost | Transparent, #702F42 text | Paper fill, #612539 text | Rose fill, #522030 text |
| Destructive | #982D3F background, white text | #822335 background | #6C1D2C background |
| Text link | #702F42, underline | #612539, underline | #522030, underline |

Focus adds the ring without removing the variant. Selected toggle buttons use rose fill, deep maroon text, maroon border and a check label. Disabled buttons use #E4E1DD with #625B60 text, no hover reaction and disabled semantics. Busy buttons use maroon with white text and spinner plus a descriptive label; the included base style uses this same busy treatment across variants. Do not add visited treatment to buttons. Text links may use muted #625B60 for visited links on paper/white.

Use `<button type="button">` for actions and `<a href>` for navigation. A toggle requires `aria-pressed`. A loading control using `aria-disabled="true"` requires an actual click/keyboard guard: ARIA alone never disables an element. Keep a busy control focusable where useful so keyboard focus does not disappear when a request starts. Keep a separate polite live region for task updates. Every icon-only action needs an accessible name and a minimum 44 × 44 px target; the primary control standard is 48 px.

Destructive confirmation is proportional to cost: removing a recoverable candidate can use undo; deleting source files or losing unsaved edits needs a clear confirmation. Give the safer action initial focus. Never use the mascot to pressure confirmation.

## Fields, select and validation

| State | Treatment | Behaviour |
| --- | --- | --- |
| Empty/default | White, dark boundary, visible label | Placeholder is a hint, never the label |
| Hover | Maroon boundary | No content change |
| Focus | Maroon boundary plus focus ring | Keep label and help visible |
| Filled | Normal text, same boundary | No automatic success decoration |
| Read-only | Paper surface, muted text, dark boundary | Focus and text selection remain available |
| Disabled | Disabled surface/text and native disabled | Not editable; explain reason when relevant |
| Invalid | Error boundary plus specific inline error | Connect using `aria-describedby`; use `aria-invalid` |
| Validated | Success boundary and explicit confirmation when useful | Only after a real validation rule passes |
| Async validating | Keep value, textual checking state | Cancel or ignore stale responses; never overwrite newer input |
| Select open | Native popup/navigation | Preserve keyboard selection and disabled options |

Validate as users complete a field or submit, rather than showing errors before they have had a chance to type. Retain entered values after errors. For form submission, focus the first invalid field or a linked error summary. Do not put API keys into logs or public UI; use a labelled password field with a reveal control in the real settings screen. File extension validation in the guide is only a demo; the real engine checks file format, decodability, size and duration.

## Checkbox, radio, switch and selection

Use native checkbox/radio inputs with persistent text labels. Their exact rendering follows the browser and operating system, with maroon `accent-color` and the brand focus ring. Checkbox states: unchecked, checked, mixed, hover, pressed, focus and disabled. Radio states: unchecked, checked, hover, pressed, focus and disabled; a radio has no mixed state. Group radios with a fieldset and legend.

Switches use grey track/off and maroon track/on, with a thumb position change and an explicit text label. Keep the setting name stable. On/off text is supplemental and must agree with `aria-checked`. Disable the control when it cannot be changed; do not merely fade it. If changing a setting requires a server response, either show busy and confirm afterward or optimistically update with a rollback and failure message.

Clip selection uses a toggle button or a labelled checkbox in a card, with `aria-pressed` or checked semantics. Default card: white with dark boundary. Hover: paper and maroon boundary. Selected: rose fill, maroon boundary, check icon and selected text. Focus ring remains visible. Disabled clips explain why they cannot be selected. Multiple selections must have an accurate count and mixed select-all state in the actual application. The guideline’s mixed checkbox is an independent component example, not wired to its one-card demo.

## Tabs, navigation, menus and tooltips

Tabs use a tablist, tabs and associated tabpanels. Selected tab has maroon text and a maroon underline; hover uses paper; focus adds a ring. Arrow keys, Home and End move between enabled tabs. Keep only the active tab in the Tab sequence. Disabled tabs are skipped. Active navigation links use `aria-current="page"`, selected surface/text and a visible indicator; do not misuse `aria-pressed` for navigation.

Prefer native selects for ordinary options. A true action menu needs a named trigger with `aria-expanded`, Escape to close, arrow-key navigation and focus restoration. Its item treatments follow ghost controls; selected options include a check; destructive items use error text; disabled items cannot activate. These menu rules are specification guidance, not a bundled custom menu widget.

Tooltips supplement an already named control. Show on hover and keyboard focus, keep available while hovered, and allow Escape dismissal. Do not put essential instructions or actionable controls only inside a tooltip.

## Upload and source states

| State | Surface and message | Available action |
| --- | --- | --- |
| Ready | Dashed dark boundary, accepted formats, limits from configuration | Browse or drag/drop |
| Hover/focus | Maroon boundary; keyboard focus ring | Browse |
| Drag over | Rose fill, solid maroon boundary, drop instruction | Drop or leave |
| Validating | Source name plus real stage | Cancel if supported |
| Unsupported/corrupt | Error tone with actual reason; keep replacement action available | Pick another file |
| Uploading | Source name, bytes or engine progress, cancel | Cancel |
| Interrupted | Keep resumable state only if backend supports resume | Resume or restart as supported |
| Queued | Explain waiting; use real position only if available | Remove from queue |
| Ready source | Metadata and change-source action | Analyze or choose another source |
| Disabled | Muted surface and reason | Existing permitted actions remain visible |

Support browse as an alternative to dragging. Never claim a file was uploaded just because it was selected. If processing is local, label it as importing/preparing instead of uploading. Show transfer privacy information based on the actual architecture. Remote URL import also needs empty, validating, accepted, unavailable/private, unsupported, timeout and permission failure states with relevant recovery copy.

## Progress, skeletons and notifications

Use determinate progress only when the engine reports a measurable quantity. Display the stage and, if reliable, percent or item counts. For indeterminate work, omit `value` from a progress element or use a decorative spinner with meaningful status text. Do not fill a fake progress bar on a timer. Throttle live-region announcements by stage or meaningful progress increments.

Skeletons communicate missing layout, are hidden from assistive technology and have separate loading text. Avoid motion in the base skeleton. Stop animation under `prefers-reduced-motion`. Reduced motion never removes labels or makes a workflow dependent on animation finishing.

Success, warning, error and information notifications use their semantic tokens with explicit labels/icons. Error colour is reserved for actual problems, not the brand maroon. Use polite status announcements for routine changes and alerts sparingly for blocking errors. Do not use both an alert and a separate identical live message.

Toast states: entering/visible/dismissed, with hover/focus pausing any optional timed dismissal. The supplied toast stays visible until dismissed. Never put essential recovery only in an auto-disappearing toast. Inline banners remain until addressed; dismissing a warning should not clear the underlying issue.

## Dialogs and overlays

Dialog states: closed, open, action pending, inline action failure, action success/closed. Use a native `<dialog>` or a tested equivalent with background interaction blocked, sensible initial focus, Escape dismissal when appropriate, focus containment and restoration to the opener. Scrim: #29262899. If an action is pending, explain what closing does; keep cancellation available if supported. On failure, keep the dialog open and the entered data intact. Do not auto-close on a failed save.

The supplied demo covers open, confirm, cancel, Escape and focus restoration. Async persistence is an application integration responsibility.

## Timeline, preview and editor

| Component | States to implement | Required non-colour cues / behaviour |
| --- | --- | --- |
| Video preview | Poster, buffering, playing, paused, ended, media error | Named controls, current time, native keyboard support or equivalent |
| Trim handles | Default, hover, focus, dragging, limit reached, disabled | Time inputs/keyboard steps as alternatives to dragging |
| Crop controls | Default, hover, focus, adjusted, reset, unavailable | Position values, aspect ratio and reset action |
| Caption editor | Empty, editing, unsaved, saving, saved, validation error | Persist draft, word timing validity and retry without data loss |
| Clip card | Loading thumbnail, ready, selected, processing, unavailable, failed | Label/state icon; keep reason and relevant retry action visible |
| Export settings | Default, changed, invalid, read-only, disabled by capability | Explain capability limits; show genuine output constraints |

Use dark grey timeline tracks, maroon selection boundaries and rose selected ranges. Keep text outside low-contrast imagery or place it on an opaque supporting surface. Caption contrast depends on video content: use a dark caption plate or outline treatment and inspect across frames. This pack does not certify captions on arbitrary footage. Video timeline, caption editor and media engine are specified here, not implemented in the brand demo.

## Application state map

The `applicationStates` object in `tokens.json` lists the canonical state, pose, live-region role and primary action.

| State | User message | Mascot | Next step |
| --- | --- | --- | --- |
| idle | Add your first video | welcome | Add video |
| validating | Checking the video | none | Cancel if supported |
| uploading | Uploading your video | none | Cancel |
| queued | Your video is waiting | none | Remove from queue |
| analyzing | Looking for strong moments | thinking | Cancel |
| results | Your clips are ready to review | clipping | Review clips |
| empty | No strong matches yet | none | Adjust range or clip manually |
| editing | Make the cut your own | none | Save changes |
| unsaved | You have unsaved edits | none | Save or discard with confirmation |
| exporting | Exporting your selected clips | clipping | Cancel |
| partial | Some clips could not be exported | none | Open successes, retry failures |
| complete | Your clips are ready to share | celebration | Open real output files |
| cancelled | The task was cancelled | none | Start again |
| error | We couldn’t process this video | none | Show cause and retry/recover |
| offline | The AI service is unavailable | none | Retry; retain supported local features |
| credentials | Connect your analysis provider | none | Repair key in settings |
| rateLimited | The provider needs a moment | none | Use actual retry-after timing |
| storageFull | There isn’t enough output space | none | Choose folder or free space |

Some failures need specialised recovery: expired permissions require access renewal, a missing source requires locating it again, corrupt media requires another source, exhausted credits require provider/account action, and a timeout can often retry. Do not label all failures “Something went wrong” or offer a retry that cannot help.

For an analysis retry, preserve the source and settings. For a partial export, retry only failed outputs when possible. For cancellation, describe whether partial files remain. For successful completion, verify the output exists before showing celebration. No candidates is a valid result, not an error. A rejected API credential is an error, not an empty result. A loss of network must not disable working local editing unnecessarily.

## Accessibility and integration checks

Check real pointer and keyboard states, combined focus/selected and focus/invalid states, 200% zoom, 375 px layout, reduced motion, source errors and interrupted jobs. Use the contrast pairs in `VALIDATION.md`. Native disabled controls do not require normal contrast, but the chosen disabled text remains readable. Keep essential text at normal text contrast and component boundaries at the relevant non-text contrast threshold.

Only light application tokens are defined. `sz-on-dark` changes focus-ring colour for isolated dark surfaces; it is not a complete dark theme. Do not assume the same semantic pairings work on arbitrary backgrounds.
