export function encodeFeedCursor(createdAt: string, id: string) {
  return Buffer.from(`${createdAt}:${id}`, "utf8").toString("base64");
}

export class InvalidFeedCursorError extends Error {
  constructor() {
    super("Invalid feed cursor");
    this.name = "InvalidFeedCursorError";
  }
}

export function decodeFeedCursor(cursor: string) {
  try {
    const raw = Buffer.from(cursor, "base64").toString("utf8");
    const separator = raw.indexOf("Z:") + 1;
    if (separator <= 0) throw new Error("Missing separator");

    const createdAt = raw.slice(0, separator);
    const id = raw.slice(separator + 1);
    if (!createdAt || !id) throw new Error("Incomplete cursor");
    if (Number.isNaN(new Date(createdAt).getTime())) throw new Error("Invalid timestamp");

    return { createdAt, id };
  } catch {
    throw new InvalidFeedCursorError();
  }
}

export function compareFeedEntries(left: { createdAt: string; id: string }, right: { createdAt: string; id: string }) {
  if (left.createdAt !== right.createdAt) {
    return right.createdAt.localeCompare(left.createdAt);
  }

  return right.id.localeCompare(left.id);
}
