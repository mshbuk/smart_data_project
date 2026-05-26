# Score Methodology For Top 25 Districts

The app schema uses 0-10 score fields, but the source datasets provide raw indicators such as population, density, childcare counts, school counts, car density, rent, and police case counts.

For the top 25 Hamburg districts by 2024 population, `src/data/districts.json` now uses factual raw values from the saved sources and converts proxy indicators into the existing 0-10 demo scoring scale.

## Popularity Selection

The top 25 districts are selected by resident population from `statistikamt-nord-stadtteilprofile-2024.xlsx`, using the `Stadtteilprofile 2024` sheet and Stadtteil rows only.

## Direct Values

- `population`: official 2024 resident population from Statistikamt Nord.
- `populationDensity`: official 2024 residents per km² from Statistikamt Nord.
- `rentPerSqm`: current district rent in EUR/m² from the extracted Miet-Check table.

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

- `top-25-hamburg-district-source-metrics-2026-05-24.csv` contains the raw source metrics and final derived app scores for the updated top 25.
- `polizei-hamburg-pks-2024-total-crimes-extracted.csv` contains the extracted 2024 total recorded crime cases from the Police Hamburg PDF.
