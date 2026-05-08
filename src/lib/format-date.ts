const MONTHS_ES_AR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

export function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "fecha no disponible";

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTHS_ES_AR[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours24 = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const period = hours24 >= 12 ? "p. m." : "a. m.";
  const hours12 = hours24 % 12 || 12;

  return `${day} ${month} ${year}, ${hours12}:${minutes} ${period}`;
}
