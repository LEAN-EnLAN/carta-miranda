#!/usr/bin/env node

import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const stateKey = process.env.SUPABASE_STATE_KEY || "primary"
const filePath = process.env.LOCAL_STORE_PATH || ".data/carta-miranda.json"

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const raw = await readFile(filePath, "utf8")
const data = JSON.parse(raw)
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { error } = await supabase.from("app_state").upsert({ id: stateKey, data })

if (error) {
  console.error(error)
  process.exit(1)
}

console.log(`Migrated ${filePath} to Supabase state key '${stateKey}'`)
