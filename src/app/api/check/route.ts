import { NextRequest, NextResponse } from "next/server";
import { checkAdCopyWithGemini, mockFallback } from "@/lib/geminiChecker";

// Node.js ランタイムを明示（Edge Runtime では @google/generative-ai が動作しない場合がある）
export const runtime = "nodejs";

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
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[check] error:", message, stack);

    if (message === "GEMINI_API_KEY is not set") {
      return NextResponse.json(
        {
          ...mockFallback(text),
          summary: "Gemini APIキーが設定されていません。Vercelの環境変数にGEMINI_API_KEYを追加してください。",
          _debug: message,
        },
        { status: 503 }
      );
    }

    // エラー詳細をsummaryに含めてVercelログなしでも原因を特定できるようにする
    return NextResponse.json({
      ...mockFallback(text),
      summary: `API呼び出しエラー: ${message}`,
      _debug: message,
    });
  }
}
