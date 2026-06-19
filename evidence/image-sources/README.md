# Image Source Notes

This project uses local image assets copied from the owner/team Lovable prototype for the demo district cards and detail pages. These images are visual prototype assets only; they are not evidence for a specific apartment listing, rental offer, or exact street condition.

## District Card Image Pool

The 104 local district records in `src/data/districts.json` now rotate through the local `public/lovable-assets/` image pool from `git@github.com:mshbuk/hamburg-matchmaker.git`. The photos do not need to show the exact district named on the card. Some districts intentionally share photos so the pool stays easier to maintain and keeps the UI close to the Lovable reference.

These Hamburg images are a visual prototype technique. They should not be read as sourced proof that a specific image shows the exact district named on the card.

Current local pool:

- `altona.jpg`, `altona-2.jpg`
- `eimsbuettel.jpg`, `eimsbuettel-2.jpg`
- `eppendorf.jpg`, `eppendorf-2.jpg`
- `hafencity.jpg`, `hafencity-2.jpg`
- `ottensen.jpg`, `ottensen-2.jpg`
- `sternschanze.jpg`, `sternschanze-2.jpg`
- `winterhude.jpg`, `winterhude-2.jpg`

## Generated District Carousel Images

`district-carousel-canal.png` and `district-carousel-market.png` were generated locally with the built-in image generation tool on 2026-06-19 for the district-detail carousel. They depict plausible Hamburg neighborhood scenes for interface demonstration only and must not be treated as evidence of an exact district, address, property, or current local condition.

## Demo Apartment Preview Image Pool

`DistrictDetail.tsx` no longer renders in-platform apartment preview cards. It links out to housing portals only.
