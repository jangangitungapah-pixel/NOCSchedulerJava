# WP-F03 Design System Foundation

This document records the implementation conventions established by WP-F03.

## Visual direction

NOCScheduler uses:

- clean precision;
- controlled spatial depth;
- compact operational density;
- strict repeated alignment;
- Light default theme;
- Dark parity;
- restrained motion;
- semantic tokens instead of page-specific raw palette values.

## Responsive bands

The implementation follows the PRD-12 behavioral bands:

| Band | Intent |
|---|---|
| < 480px | compact one-hand mobile |
| 480–767px | mobile / landscape aware |
| 768–1023px | tablet / compact navigation rail |
| 1024–1279px | compact desktop |
| 1280–1599px | canonical desktop |
| >= 1600px | wide operational workspace |

The shell intentionally recomposes rather than simply shrinking desktop chrome.

## Touch

Mobile interactive controls use a practical 44px minimum target for normal buttons, icon buttons, inputs, and mobile navigation.

## Themes

Theme structure is shared. The root HTML element owns:

```text
data-theme="light" | "dark"
class="dark" when dark
color-scheme
```

CSS semantic tokens perform the visual skin change.

## Package boundary

`@nocscheduler/ui` owns reusable primitive/component structure and shared token/style exports.

Feature pages should consume these primitives before creating local variants.

## QA surface

During Vite development:

```text
/__design-system
```

shows the shared component states and is covered by Playwright.

This route is development-only and is not part of the production product information architecture.

## Future evolution

WP-F03 is the foundation, not the final component catalog.

Later feature phases may add reusable variants only when the requirement is genuinely shared. Page-local styling must not fork the visual grammar.
