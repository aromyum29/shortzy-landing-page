# UI and experience audit: Apple design principles

Date: 9 October 2026. Method: the `apple-design` skill (WWDC *Designing Fluid Interfaces*, *Principles of Great
Design*, UI typography) applied to the production build, with measurements from a scripted Chromium session at
1440px and 390px, plus axe-core (WCAG 2.1 AA). Where the skill and the Shortzy v3.2 brand pack disagree, the brand
pack wins and the conflict is noted.

## Scorecard

| Area (skill section) | Before | After |
| --- | --- | --- |
| Response (§1) | Primary CTA fully visible ~1.36 s after load; buttons nudged 1px on press | ~0.81 s; buttons, tabs, toggles and nav respond on press (`scale(0.97)`, 100 ms) |
| Interruptibility and springs (§3–4) | Tween crossfades; tab state jumped | Critically damped springs (`bounce: 0`) for tab and toggle indicators, slide and clip changes; timers resume from the live value |
| Direct manipulation, momentum (§2, §5–6, §9) | Hero tour could only be clicked | Swipe/drag the hero window: follows the pointer with soft resistance, lands where the flick projects (Apple's `0.998` deceleration projection), springs back if not far enough |
| Spatial consistency (§7–8) | Slides faded in place; mobile menu appeared instantly | Slides enter from the side you are heading to and leave the opposite way; mobile menu drops out of the bar and returns the same way; How it works clips still fly from their exact moment on the timeline |
| Frame-level smoothness (§11) | Phone progress bar stepped ~4×/s via React state | Display-synced (`requestAnimationFrame`) transform, no re-renders; How it works stage isolated with `contain: layout paint` |
| Materials and depth (§12) | Hard 1px rule under the sticky nav | Soft scroll-edge fade where content passes under the bar (nav stays solid, see conflicts) |
| Reduced motion, transparency, contrast (§14) | Reduced motion only | Adds `prefers-contrast: more` (decorative pebble edges become real boundaries) and `prefers-reduced-transparency` (translucent tour controls become solid); FAQ answers open smoothly but snap under reduced motion |
| Typography (§15) | 77 fixed `px` text sizes ignored the browser text-size setting | Page text in `rem` (scales with the user's setting); tracking stays size-specific (tight display, neutral body). Logo lockup and the drawn UI inside the How it works stage stay fixed to keep proportions |
| Wayfinding (§16) | Nav gave no "you are here" | Nav marks the current section (`aria-current`, sliding underline) on desktop and in the mobile menu |
| Familiarity / patterns (§16) | Hero tabs had `role="tab"` without the keyboard pattern | Full ARIA tabs: roving tabindex, ←/→/Home/End, `aria-controls` → `tabpanel` |
| Feedback (§16) | Email validated only on submit | Validates when you leave the field, clears as soon as it becomes valid |
| Touch targets (§10, WCAG 2.5.8) | 15 controls under 44px (tour tabs 32px, pause 36px, framing toggle 40px, footer links 19px) | All ≥44px tall; hidden-but-focusable step buttons on phones removed (read as text instead) |

Verification after fixes: 0 axe violations (1440px; 390px with reduced motion), no horizontal scroll at 375px
including at 125% text size, no console errors.

## Brand conflicts (left as the brand pack specifies)

- **Translucent chrome (§12).** The skill favours `backdrop-filter` bars. The brand pack says matte and "use solid UI
  colours", so the nav stays solid paper; only the divider became a soft edge.
- **System font (§15).** The skill defaults to the platform face. The app uses the system stack; the marketing site
  keeps its chosen display and body faces for distinctiveness. Swappable in `src/app/layout.tsx`.
- **Bounce (§4).** Every spring is critically damped. No overshoot was added, in line with the brand's calm motion and
  the skill's rule that bounce belongs only to momentum gestures.

## Still worth doing

1. **How it works morph uses layout properties.** The six clips animate `left/top/width/height`. Containment keeps the
   cost local, but a FLIP version (transform + counter-scaled poster) would be compositor-only.
2. **Scroll length of How it works.** The pinned walkthrough spans ~4.4 viewports. Consider a visible "Skip the
   walkthrough" link, or a shorter track, to strengthen agency for people who already get it.
3. **Hero tour peeking.** Swipe currently uses resistance plus a crossfade. A true carousel that shows the neighbouring
   screen during the drag would make tracking fully 1:1.
4. **Test with real people** on real phones (the skill's §17); the measurements above are synthetic.
