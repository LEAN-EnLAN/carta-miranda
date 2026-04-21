export interface AutomationProvider {
  name: string;
  generate(input: {
    subject: string;
    body: string;
    context?: string;
  }): Promise<{ output: string }>;
}

export class LocalAutomationProvider implements AutomationProvider {
  name = "local";

  async generate(input: { subject: string; body: string; context?: string }) {
    const context = input.context ? `\nContexto: ${input.context}` : "";
    return {
      output: [
        `Borrador para “${input.subject}”`,
        input.body.slice(0, 280),
        context,
        "Sugerencia: mantené el tono íntimo y dejá espacio para una respuesta humana.",
      ]
        .filter(Boolean)
        .join("\n\n"),
    };
  }
}

export class NoopAutomationProvider implements AutomationProvider {
  name = "noop";

  async generate(input: { subject: string; body: string; context?: string }) {
    return {
      output: `Automation disabled for “${input.subject}”.`,
    };
  }
}

export function getAutomationProvider() {
  switch ((process.env.CARTA_MIRANDA_AUTOMATION_PROVIDER ?? "local").toLowerCase()) {
    case "noop":
      return new NoopAutomationProvider();
    default:
      return new LocalAutomationProvider();
  }
}
