import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractText, getDocumentProxy } from "unpdf";
import { getSession } from "@/lib/auth";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a travel operations assistant. You extract structured trip information from itinerary/brochure PDFs for a boutique travel agency. Output strict JSON matching the given schema. Be conservative: if a field is not clearly stated, return an empty string (for strings) or 0 (for numbers) or [] (for arrays). Never use placeholders like "<UNKNOWN>", "N/A", or "Not specified" — just return empty. Dates must be ISO (YYYY-MM-DD). Prices must be numbers (USD). Title should be a short, marketable name.`;

const TOOL = {
  name: "extract_trip",
  description: "Extract structured trip details from the itinerary text.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Short marketable title, e.g. 'China Highlights Tour'" },
      description: { type: "string", description: "1-2 paragraph trip overview suitable for a public website. Summarize the experience, not the itinerary." },
      destinations: { type: "string", description: "Comma-separated primary destinations (cities/regions)." },
      duration: { type: "string", description: "Human-readable duration, e.g. '12 days'" },
      dates: {
        type: "array",
        description: "Scheduled departures. One entry per departure found.",
        items: {
          type: "object",
          properties: {
            departureDate: { type: "string", description: "ISO YYYY-MM-DD" },
            returnDate: { type: "string", description: "ISO YYYY-MM-DD" },
          },
          required: ["departureDate", "returnDate"],
        },
      },
      groupSizeMin: { type: "number", description: "Minimum group size. 0 if unspecified." },
      groupSizeMax: { type: "number", description: "Maximum group size. 0 if unspecified." },
      pricePerPerson: { type: "number", description: "USD base price per person (double occupancy). 0 if not stated." },
      singleSupplement: { type: "number", description: "USD single supplement if stated; 0 otherwise." },
      inclusions: { type: "string", description: "Newline-separated inclusions list." },
      exclusions: { type: "string", description: "Newline-separated exclusions list." },
    },
    required: ["title", "description", "destinations", "duration", "dates", "pricePerPerson", "inclusions", "exclusions"],
  },
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No PDF provided" }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });

  const buffer = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  const pdfText = Array.isArray(text) ? text.join("\n") : text;

  if (!pdfText || pdfText.trim().length < 50) {
    return NextResponse.json({ error: "PDF appears empty or unreadable" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [TOOL],
    tool_choice: { type: "tool", name: "extract_trip" },
    messages: [
      {
        role: "user",
        content: `Extract trip details from the following itinerary PDF text:\n\n${pdfText.slice(0, 60000)}`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({ error: "No structured output from model" }, { status: 500 });
  }

  return NextResponse.json(toolUse.input);
}
