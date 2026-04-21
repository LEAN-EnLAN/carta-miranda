import { getOtherAccountId } from "../constants";
import { createDraftLetter, getLetterById, publishLetter, recordAutomationRun, touchLetterSummary } from "../store";
import type { AccountId } from "../types";
import { getAutomationProvider } from "./providers";

export async function draftAgentLetter(input: { authorId: AccountId; recipientUsername: AccountId; topic: string; tone?: string }) {
  const provider = getAutomationProvider();
  const content = await provider.generate({
    subject: input.topic,
    body: input.tone ? `Tono: ${input.tone}` : input.topic,
    context: `Para ${input.recipientUsername}`,
  });

  const draft = await createDraftLetter({
    authorId: input.authorId,
    recipientId: input.recipientUsername,
    title: input.topic,
    body: content.output,
  });

  await recordAutomationRun({ provider: provider.name, source: `draft:${input.topic}`, output: content.output });
  return { draft_id: draft.id, content_preview: content.output.slice(0, 120) };
}

export async function sendAgentLetter(input: { authorId: AccountId; draftId?: string; recipientUsername?: AccountId; content?: string }) {
  const provider = getAutomationProvider();

  if (input.draftId) {
    const draft = await getLetterById(input.draftId);
    if (!draft || draft.authorId !== input.authorId) {
      throw new Error("Draft not accessible");
    }
    const published = await publishLetter({ letterId: draft.id, userId: input.authorId });
    await recordAutomationRun({ provider: provider.name, source: `send:${draft.id}`, output: published.body });
    return { letter_id: published.id, published: true };
  }

  const recipient = input.recipientUsername ?? getOtherAccountId(input.authorId);
  const draft = await createDraftLetter({
    authorId: input.authorId,
    recipientId: recipient,
    title: "Carta automatizada",
    body: input.content ?? "",
  });
  const published = await publishLetter({ letterId: draft.id, userId: input.authorId });
  await recordAutomationRun({ provider: provider.name, source: `send:${recipient}`, output: published.body });
  return { letter_id: published.id, published: true };
}

export async function runAutomationForLetter(letterId: string, userId: AccountId) {
  const provider = getAutomationProvider();
  const detail = await getLetterById(letterId);
  if (!detail || detail.authorId !== userId) {
    throw new Error("Letter not accessible");
  }

  const generated = await provider.generate({
    subject: detail.title,
    body: detail.body,
    context: detail.versions.map((version) => version.summary).join(" | "),
  });

  await recordAutomationRun({
    provider: provider.name,
    source: detail.id,
    output: generated.output,
  });

  await touchLetterSummary(detail.id, generated.output, userId, "automation");
  return generated.output;
}
