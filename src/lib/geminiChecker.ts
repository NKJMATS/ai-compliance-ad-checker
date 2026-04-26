import { GoogleGenerativeAI } from "@google/generative-ai";

export type RiskLevel = "low" | "medium" | "high";

export interface Issue {
  category: "薬機法" | "景表法" | "SNS規約";
  severity: RiskLevel;
  description: string;
  suggestion: string;
}

export interface CheckResult {
  score: number;       // 0–100（高いほど安全）
  riskLevel: RiskLevel;
  issues: Issue[];
  summary: string;
  detail?: string;     // AIによる総合解説
}

const SYSTEM_PROMPT = `あなたは日本の広告法務の専門家AIです。
入力された広告原稿を以下の3つの観点で厳格に審査し、必ずJSON形式のみで回答してください。

【審査観点】
1. 薬機法（医薬品医療機器等法）
   - 医薬品・医療機器でない商品への効能・効果の断定表現
   - 「治る」「治癒」「完治」「医師推薦」など医薬的効果を示す表現
   - 未承認の効能・効果の標榜
   - 身体の構造・機能に影響を与えることを示す表現

2. 景品表示法（景表法）
   - 根拠のない「No.1」「最安値」「業界一」等の優良誤認表示
   - 体験談・口コミを使った根拠なき効果の断定
   - 「全額返金保証」等の条件を明記しない有利誤認表示
   - ダイエット・美容効果の誇大表示
   - 比較広告における根拠のない優位性の主張

3. SNSプラットフォーム規約
   - ステルスマーケティング（PR・広告表示の欠如）
   - 不正なエンゲージメント操作を示唆する表現
   - 年齢制限コンテンツの不適切な表示
   - プラットフォーム固有の禁止表現

【出力形式】必ず以下のJSONのみを出力し、説明文・マークダウンは一切含めないこと:
{
  "score": <0〜100の整数。問題がないほど高い>,
  "riskLevel": <"low"|"medium"|"high">,
  "summary": "<総評（1〜2文）>",
  "detail": "<専門家視点での詳細解説。法律の条文・背景・行政指導事例などを交えた200〜400文字程度の包括的な説明>",
  "issues": [
    {
      "category": <"薬機法"|"景表法"|"SNS規約">,
      "severity": <"low"|"medium"|"high">,
      "description": "<問題の説明（該当箇所を引用し、なぜ問題か具体的に）>",
      "suggestion": "<具体的な修正案（修正後の文例を含む）>"
    }
  ]
}

【スコア基準】
- 80〜100: 問題なし（low）
- 50〜79: 要注意・軽微な問題あり（medium）
- 0〜49: 高リスク・重大な問題あり（high）

【重要】
- 問題がない場合もdetailには「問題のない理由」と「今後の注意点」を記載すること
- issuesは必ず配列で返すこと（問題がない場合は空配列[]）`;

export async function checkAdCopyWithGemini(text: string): Promise<CheckResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // gemini-1.5-flash → gemini-2.0-flash へ更新（無料枠での安定性向上）
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: `【広告原稿】\n${text}` },
  ]);

  const raw = result.response.text().trim();

  // マークダウンコードブロックの除去（フォールバック用）
  const jsonStr = raw
    .replace(/^```(?:json)?\r?\n?/, "")
    .replace(/\r?\n?```$/, "")
    .trim();

  let parsed: CheckResult;
  try {
    parsed = JSON.parse(jsonStr) as CheckResult;
  } catch {
    throw new Error(`JSON parse failed. Raw response: ${raw.slice(0, 200)}`);
  }
  return parsed;
}

/** キーなし・API障害時のフォールバック */
export function mockFallback(text: string): CheckResult {
  return {
    score: 0,
    riskLevel: "high",
    summary: "診断中にエラーが発生しました。APIキーをご確認のうえ、もう一度お試しください。",
    detail: `入力テキスト（${text.length}文字）の診断を試みましたが、Gemini APIへの接続に失敗しました。`,
    issues: [],
  };
}
