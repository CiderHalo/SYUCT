# SYUCT maintenance package - 2026-08-16

This package completes the two requested website maintenance items.

## 1. Acknowledgements PDF

The current `main` version of `about.html` already contains an acknowledgements strip between the "如何共建" section and "相关入口", and its button points to:

`pdf-viewer.html?file=docs/syuct-acknowledgements.pdf&title=SYUCT%20校园指南致谢名单`

The requested PDF is included here at:

`docs/syuct-acknowledgements.pdf`

Copy that file into the repository's `docs/` directory. Do not add a second acknowledgements block if the current `about.html` already contains `id="acknowledgements"`.

## 2. Mobile resource filters

Replace `assets/styles.css` with the included version, or apply `SYUCT-maintenance.patch`.

The mobile rule at `max-width: 650px` changes the category chips to a single non-wrapping horizontal row with touch scrolling. It also slightly reduces toolbar padding and search-field height so the sticky toolbar takes less vertical space.

The patch also changes the stylesheet cache-busting query in `resources.html` from `rev=20260807` to `rev=20260816`.

## Suggested apply sequence

1. Copy `docs/syuct-acknowledgements.pdf` to the repository `docs/` folder.
2. Apply `SYUCT-maintenance.patch` from the repository root with `git apply`.
3. If you prefer not to apply the patch, replace `assets/styles.css` with the included file and manually update the stylesheet revision in `resources.html`.
4. Verify `/about.html` and `/resources.html` on a phone-width viewport before deployment.

No new direction-arrow symbols were added to the UI.
