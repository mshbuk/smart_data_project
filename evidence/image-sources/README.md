# Image Source Notes

This project uses externally hosted Pexels image URLs for the demo district cards and the demo apartment previews. These images are visual prototype assets only; they are not evidence for a specific apartment listing, rental offer, or exact street condition.

Pexels license reference:

- https://www.pexels.com/license/

## District Card Image Pool

The 104 local district records in `src/data/districts.json` now use unique Hamburg-oriented Pexels image URL variants instead of repeating the same exact card image. The URLs use Pexels image CDN crop/focal variants at `images.pexels.com`, so every district record has a different `imageUrl` while still drawing from a small, presentation-safe Hamburg visual pool.

These unique variants are a visual prototype technique. They should not be read as sourced proof that a specific image shows the exact district named on the card.

Source photo pages used for the current pool:

- https://www.pexels.com/photo/17458974/
- https://www.pexels.com/photo/36051414/
- https://www.pexels.com/photo/21674959/
- https://www.pexels.com/photo/32416401/
- https://www.pexels.com/photo/35863370/
- https://www.pexels.com/photo/31947438/
- https://www.pexels.com/photo/28236365/
- https://www.pexels.com/photo/21418940/
- https://www.pexels.com/photo/16527466/
- https://www.pexels.com/photo/36074748/
- https://www.pexels.com/photo/34502688/

## Demo Apartment Preview Image Pool

Apartment cards in `DistrictDetail.tsx` use realistic apartment/interior photos from Pexels. They are intentionally generic demo images and should be replaced if a real housing-listing provider is added.

Source photo pages used for the current pool:

- https://www.pexels.com/photo/9976124/
- https://www.pexels.com/photo/7147291/
- https://www.pexels.com/photo/7614411/
