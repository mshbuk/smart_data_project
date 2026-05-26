# Score Methodology For District Data

The app schema uses 0-10 score fields, but the source datasets provide raw indicators such as population, density, childcare counts, school counts, car density, rent, and police case counts.

`src/data/districts.json` now uses sourced values wherever the saved evidence sources match the app's 104 GeoJSON districts:

- `sourced`: rent, population/density, infrastructure proxies, and police safety proxy are all available.
- `partially-sourced`: at least one factual source matched, but one or more required source rows are missing.
- `placeholder`: no matching factual source row was available for the current app fields.

As of the 2026-05-26 data expansion, 93 districts are fully sourced, 10 are partially sourced, and 1 remains placeholder-only.

## Direct Values

- `population`: official 2024 resident population from Statistikamt Nord.
- `populationDensity`: official 2024 residents per km² from Statistikamt Nord.
- `rentPerSqm`: current district rent in EUR/m² from the extracted Miet-Check table. Hamm uses the average of Hamm-Mitte, Hamm-Nord, and Hamm-Süd because Miet-Check publishes those subdistrict rows separately.

## Derived 0-10 Scores

The following fields remain app scores, not official source columns. They are derived from factual source indicators and normalized across Hamburg Stadtteile:

- `safetyScore`: inverse of Police Hamburg PKS 2024 total recorded cases per 1,000 residents.
- `quietnessScore`: inverse of official population density.
- `greenScore`: composite proxy using lower population density, more living space per resident, and a higher share of one- and two-family homes.
- `publicTransportScore`: composite proxy using lower private-car density and higher population density.
- `schoolScore`: primary schools per 1,000 residents under 18.
- `kindergartenScore`: childcare facilities per 1,000 residents under 18.
- `nightlifeScore`: urban activity proxy using higher population density, higher single-household share, and lower household-with-children share.

## Evidence Tables

- `hamburg-district-source-metrics-2026-05-26.csv` contains source coverage, raw metrics, missing-source notes, and final app scores for all 104 app districts.
- `top-25-hamburg-district-source-metrics-2026-05-24.csv` is retained as the earlier top-25 extraction snapshot.
- `polizei-hamburg-pks-2024-total-crimes-extracted.csv` contains the extracted 2024 total recorded crime cases from the Police Hamburg PDF.
