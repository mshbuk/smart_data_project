export function averageMonthlyRent50(rentPerSqm: number) {
  return Math.round(rentPerSqm * 50);
}

export function formatMonthlyRent50(rentPerSqm: number, language: "de" | "en") {
  return new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 0,
  }).format(averageMonthlyRent50(rentPerSqm));
}
