# District Data Source Evidence

This folder preserves the source evidence used for replacing placeholder district data with sourced Hamburg indicators.

Access date: 2026-05-24

## Sources

### Statistikamt Nord Stadtteil-Profile 2024

- Local file: `statistikamt-nord-stadtteilprofile-2024.xlsx`
- Source URL: `https://www.statistik-nord.de/fileadmin/user_upload/Stadtteilprofile2025.xlsx`
- Publisher: Statistikamt Nord
- Sheet title: `Stadtteilprofile 2024`
- Used for: population, population density, households, household structure, social indicators, housing stock, doctors, pharmacies, childcare facilities, and primary schools.

### Police Hamburg PKS Stadtteilatlas 2024

- Local file: `polizei-hamburg-pks-stadtteilatlas-2024.pdf`
- Extracted table: `polizei-hamburg-pks-2024-total-crimes-extracted.csv`
- Source URL: `https://www.polizei.hamburg/resource/blob/1024890/f7220b94849ab02959cbc9ad5eff5289/stadtteilatlas-2024-do-data.pdf`
- Publisher: Polizei Hamburg
- Used for: district-level recorded crime cases, used as the factual basis for the app's safety proxy.
- Note: The file was downloaded with `curl -k` because local certificate verification failed for the server, but the URL is the official Polizei Hamburg resource URL.

### Miet-Check Hamburg District Rents

- Local extracted table: `miet-check-hamburg-district-rents-2026.csv`
- Source URL: `https://www.miet-check.de/stadtteile_uebersicht.php?stadt=Hamburg`
- Publisher: Miet-Check.de
- Used for: current district-level rent in EUR per square meter.
- Note: Only a compact extracted table is saved here instead of the full webpage.

## Integrity

`SHA256SUMS` contains checksums for the saved source files and extracted rent table.

## Derived App Scores

`hamburg-district-source-metrics-2026-05-26.csv` stores source coverage, raw metrics, missing-source notes, and derived 0-10 app scores for all 104 app districts. `top-25-hamburg-district-source-metrics-2026-05-24.csv` is retained as the earlier top-25 extraction snapshot. `score-methodology.md` explains how raw source indicators are translated into the current app scoring fields.
