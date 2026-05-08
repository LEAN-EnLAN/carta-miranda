import test from "node:test";
import assert from "node:assert/strict";
import { compareFeedEntries, decodeFeedCursor, encodeFeedCursor } from "./feed-cursor";

test("feed cursor roundtrips timestamp and id", () => {
  const cursor = encodeFeedCursor("2026-04-22T12:00:00.000Z", "letter:abc");
  assert.deepEqual(decodeFeedCursor(cursor), { createdAt: "2026-04-22T12:00:00.000Z", id: "letter:abc" });
});

test("feed entries sort newest-first", () => {
  const newer = { createdAt: "2026-04-22T12:00:00.000Z", id: "a" };
  const older = { createdAt: "2026-04-21T12:00:00.000Z", id: "b" };
  assert.equal(compareFeedEntries(newer, older) < 0, true);
  assert.equal(compareFeedEntries(older, newer) > 0, true);
});
