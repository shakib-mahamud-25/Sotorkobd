# PWA icons — you need to generate these, I can't

`app/manifest.ts` references four icon files that don't exist yet:

```
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/icon-maskable-192.png
public/icons/icon-maskable-512.png
```

I'm not generating these myself — actual app icons are a design asset, not
something that should be procedurally faked. Here's exactly what's needed
and the fastest real way to get them:

## What's needed

- **icon-192.png / icon-512.png**: standard icons, square, transparent or
  solid background. Should be the Sotorko mark on `--color-primary`
  (#0F2A3D) or `--color-bg` (#F7F4EE) — whichever reads better at small
  sizes. These are what shows in app switchers, Android home screens, etc.
- **icon-maskable-192.png / icon-maskable-512.png**: same mark, but with
  extra padding (~safe zone: keep the actual logo within the center 80% of
  the canvas) since Android applies its own mask shape (circle, squircle,
  etc.) and will crop anything too close to the edges. Background should be
  a solid fill (not transparent) — `--color-primary` is the natural choice
  so the mask doesn't show white/transparent corners.

## Fastest real path

1. Design (or have designed) a single square Sotorko mark at 512×512,
   ideally as SVG first for clean scaling.
2. Export the two standard sizes directly from that source.
3. For the maskable variants, add padding in the export (a tool like
   [maskable.app](https://maskable.app) lets you preview exactly how
   Android will crop it and export a correctly-padded PNG).
4. Drop all four into `public/icons/`.

## In the meantime

If you want to ship Phase 3 before icons are ready, the manifest and service
worker both still work without them — Chrome/Android will simply fall back
to a generic icon or the page's favicon for install, and installability
itself won't be blocked (a manifest with icon *entries* pointing at 404s is
still a valid manifest; it just looks bad). I'd treat real icons as a
same-week follow-up, not a blocker for testing the rest of this phase.
