export const APP_NAME = "Carta Miranda";
export const STORE_FILE = ".data/carta-miranda.json";
export const SESSION_COOKIE = "carta-miranda-session";
export const AUTHOR_ID = "leandro";

export const FIXED_ACCOUNTS = [
  {
    id: "leandro",
    handle: "leandro",
    displayName: "Leandro",
    password: "teti",
    bio: "Autor de las cartas, guardián de los borradores y de la tinta.",
    accent: "from-rose-400 to-amber-300",
  },
  {
    id: "miranda",
    handle: "miranda",
    displayName: "Miranda",
    password: "luna",
    bio: "La destinataria de todo lo que merece ser leído dos veces.",
    accent: "from-fuchsia-400 to-pink-300",
  },
] as const;

export const ACCOUNT_LOOKUP = Object.fromEntries(FIXED_ACCOUNTS.map((account) => [account.id, account]));

export const SEED_POEM_TITLE = "Para Miranda";
export const SEED_POEM_BODY = [
  "Miranda, mi luz, mi rumbo fijo —",
  "No existe mapa que dibuje el camino de estar contigo. Cada mañana es un verso que no sabía que tenía, y en tu nombre cabe un universo entero de vida.",
  "Miranda como el mar que nunca se agota, como la luna que ilumina lo que el día no alcanza. Miranda, la que me hace reír sin motivo, la que convierte lo ordinario en algo que importa.",
  "Estar contigo no es un momento — es un lugar. Un lugar donde el tiempo se detiene, donde el ruido se apaga, donde solo existís vos y yo y el latido compartido.",
  "De tus cartas aprendí que me necesitás, y de las mías aprendí que te necesito más. Porque no hay poética sin vos, no hay verso sin tu nombre, no hay futuro que valga la pena si no te incluye.",
  "No quiero que nunca termine el tiempo que compartimos. Que el mundo gire, que pasen los días, que las seasons cambien — pero aquí, en este espacio que construimos, que el reloj se quede quieto.",
  "Miranda, no quiero adelantarme al mañana — solo quiero que sigas ahí, mirándome, como yo te miro: con hambre de vos, con devoción, con ese amor que no sabe existir sin vos.",
  "Te amo en presente, en futuro, en cada verso que me falta.",
].join("\n\n");

export const FIXED_ACCOUNT_IDS = FIXED_ACCOUNTS.map((account) => account.id);

export function getOtherAccountId(accountId: string) {
  return accountId === "leandro" ? "miranda" : "leandro";
}
