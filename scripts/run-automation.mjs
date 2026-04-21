#!/usr/bin/env node

const [mode = "draft", authorId, recipientUsername, ...rest] = process.argv.slice(2)

if (!authorId || !recipientUsername) {
  console.error("Usage: npm run automation -- <draft|send> <authorId> <recipientUsername> <topic or content>")
  process.exit(1)
}

const baseUrl = process.env.APP_URL || "http://localhost:3000"
const token = process.env.AGENT_TOKEN

if (!token) {
  console.error("Missing AGENT_TOKEN")
  process.exit(1)
}

const payload =
  mode === "send"
    ? {
        authorId,
        recipientUsername,
        content: rest.join(" ") || "Carta automatizada desde terminal.",
      }
    : {
        authorId,
        recipientUsername,
        topic: rest.join(" ") || "Carta automatizada",
      }

const endpoint = mode === "send" ? "/api/internal/agent/send" : "/api/internal/agent/draft"

const response = await fetch(`${baseUrl}${endpoint}`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-agent-token": token,
  },
  body: JSON.stringify(payload),
})

const data = await response.json()

if (!response.ok) {
  console.error(data)
  process.exit(1)
}

console.log(JSON.stringify(data, null, 2))
