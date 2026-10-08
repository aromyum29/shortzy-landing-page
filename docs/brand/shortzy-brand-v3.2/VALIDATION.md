# Validation

Version 3.2 · 8 October 2026

## Completed

* JavaScript syntax checks passed for the guide and mascot helper.
* The image helper was checked for resolving actual local asset files, optional asset directory overrides, decorative/informative labels and error/completion state mapping.
* JSON parsed successfully; all palette and feedback values match the CSS literals.
* All local HTML/CSS asset references resolve; no duplicate HTML IDs.
* The two retained SVG logo files parse successfully.
* Four generated standalone mascot assets were visually inspected. Each file has an RGBA alpha channel with transparent and opaque pixels. Original dimensions are recorded in the manifest.
* Every mascot key maps to its own existing action file; CSS sprite cropping has been removed. The original concept sheet remains reference-only.
* All 18 application-state keys have a documented action and a supplied pose or explicit null.
* All 32 specified text and essential boundary contrast checks passed.

## Browser verification still required

Automated browser checks could not run because the environment had no Chromium binary and its browser download failed. Do not treat the included interactive examples as browser-certified. Confirm responsive layout, individual-image proportions, hover/pressed transitions, keyboard focus, tab navigation, dialog focus restoration, local file selection and reduced motion in your target browser. Check at 375 px, desktop widths and 200% zoom.

The guidelines include CSS and JavaScript handling for these states, but the application needs its own real-data, job and integration checks. There is no whole-product accessibility certification. Inspect transparent raster edges before large-format or dark-background use.

## Contrast measurements

Ratios are computed from sRGB relative luminance. Normal text uses a 4.5:1 minimum; essential boundaries and focus indicators use 3:1. Disabled text was checked voluntarily as normal text.

| Pairing | Foreground | Background | Ratio | Minimum |
| --- | --- | --- | --- | --- |
| Ink on pebbleGrey | #292628 | #C9C5C1 | 8.73:1 | 4.5 |
| Ink on softCoral | #292628 | #E7ADA0 | 7.76:1 | 4.5 |
| Ink on roseClay | #292628 | #E9D6D2 | 10.71:1 | 4.5 |
| Ink on warmPaper | #292628 | #F3F1EE | 13.28:1 | 4.5 |
| Ink on oatGold | #292628 | #D5C28F | 8.52:1 | 4.5 |
| Ink on white | #292628 | #FFFFFF | 14.98:1 | 4.5 |
| primary / default | #FFFFFF | #702F42 | 9.66:1 | 4.5 |
| primary / hover | #FFFFFF | #612539 | 11.46:1 | 4.5 |
| primary / pressed | #FFFFFF | #522030 | 13.06:1 | 4.5 |
| primary / selected | #522030 | #E9D6D2 | 9.34:1 | 4.5 |
| primary / disabled | #625B60 | #E4E1DD | 5.06:1 | 4.5 |
| primary / loading | #FFFFFF | #702F42 | 9.66:1 | 4.5 |
| secondary / default | #702F42 | #FFFFFF | 9.66:1 | 4.5 |
| secondary / hover | #612539 | #F3F1EE | 10.17:1 | 4.5 |
| secondary / pressed | #522030 | #E9D6D2 | 9.34:1 | 4.5 |
| ghost / default | #702F42 | #FFFFFF | 9.66:1 | 4.5 |
| ghost / hover | #612539 | #F3F1EE | 10.17:1 | 4.5 |
| ghost / pressed | #522030 | #E9D6D2 | 9.34:1 | 4.5 |
| destructive / default | #FFFFFF | #982D3F | 7.55:1 | 4.5 |
| destructive / hover | #FFFFFF | #822335 | 9.37:1 | 4.5 |
| destructive / pressed | #FFFFFF | #6C1D2C | 11.35:1 | 4.5 |
| success feedback | #2E6751 | #E8F0EB | 5.70:1 | 4.5 |
| warning feedback | #795516 | #F5ECD8 | 5.72:1 | 4.5 |
| error feedback | #982D3F | #F8E8EA | 6.37:1 | 4.5 |
| info feedback | #3C5872 | #E9EFF5 | 6.40:1 | 4.5 |
| Muted on warmPaper | #625B60 | #F3F1EE | 5.85:1 | 4.5 |
| Boundary/focus on warmPaper | #625B60 | #F3F1EE | 5.85:1 | 3 |
| Maroon focus on warmPaper | #702F42 | #F3F1EE | 8.57:1 | 3 |
| Muted on white | #625B60 | #FFFFFF | 6.59:1 | 4.5 |
| Boundary/focus on white | #625B60 | #FFFFFF | 6.59:1 | 3 |
| Maroon focus on white | #702F42 | #FFFFFF | 9.66:1 | 3 |
| Paper focus on maroon | #F3F1EE | #702F42 | 8.57:1 | 3 |
