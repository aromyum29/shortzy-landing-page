# Shortzy mascot assets

Each action has its own transparent PNG. Use these files directly in the application.

| File | Action / application context |
| --- | --- |
| welcome.png | Welcome, onboarding and empty library |
| thinking.png | Analysis in progress |
| clipping.png | Review candidate clips and export in progress |
| celebration.png | Successfully completed export |

`manifest.json` lists exact dimensions and state mappings. Treat its `file` paths as relative to the pack root. Display within a square box using `object-fit: contain`; never stretch, crop or recolour the artwork. The source files retain their natural dimensions and alpha channels. The welcome source has a wider canvas than the other poses; the shared square display box prevents layout jumps.

The original concept sheet is retained under `references/` only. It is not loaded by the application. The standalone assets were generated from that sheet using the built-in image generation tool and are not pixel-identical crops. The brief for each was to isolate its corresponding character while preserving pose, expression, palette and details, with transparent surroundings.

No dedicated error or empty-result pose exists yet. Those states deliberately map to null, so clear text and recovery actions appear without an inappropriate smile or celebration.
