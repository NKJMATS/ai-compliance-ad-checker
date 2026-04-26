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
    const message = err instanceof Error ? err.message : String(err);
    if (message === "GEMINI_API_KEY is not set") {
      console.error("[check] GEMINI_API_KEY environment variable is not configured.");
      return NextResponse.json(
        {
          ...mockFallback(text),
          summary: "Gemini APIキーが設定されていません。Vercelの環境変数にGEMINI_API_KEYを追加してください。",
        },
        { status: 503 }
      );
    }
    console.error("[check] Gemini API error:", message);
    return NextResponse.json(mockFallback(text));
  }
}
