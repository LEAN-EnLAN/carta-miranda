import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve(".data/carta-miranda.json");
const BACKUP_FILE = `${DATA_FILE}.bak`;

function replaceAccountIds(obj) {
  if (typeof obj === "string") {
    if (obj === "leo") return "leandro";
    if (obj === "Leo") return "Leandro";
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(replaceAccountIds);
  }
  if (obj && typeof obj === "object") {
    const next = {};
    for (const [key, value] of Object.entries(obj)) {
      next[key] = replaceAccountIds(value);
    }
    return next;
  }
  return obj;
}

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log("Data file not found, skipping migration.");
    process.exit(0);
  }

  try {
    fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    console.log(`Backup created: ${BACKUP_FILE}`);
  } catch (error) {
    console.error("Failed to create backup:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  const data = JSON.parse(raw);
  const migrated = replaceAccountIds(data);
  const output = JSON.stringify(migrated, null, 2);

  if (output === raw) {
    console.log("No changes needed.");
    process.exit(0);
  }

  fs.writeFileSync(DATA_FILE, output);
  console.log("Migration complete: all 'leo' account IDs replaced with 'leandro'.");
}

main();
