import { NextRequest, NextResponse } from "next/server";
import { checkAdCopyWithGemini, mockFallback } from "@/lib/geminiChecker";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "テキストが空です" }, { status: 400 });
  }

  try {
    const result = await checkAdCopyWithGemini(text);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(mockFallback(text));
  }
}
