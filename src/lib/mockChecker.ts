export type RiskLevel = "low" | "medium" | "high";

export interface CheckResult {
  score: number; // 0–100
  riskLevel: RiskLevel;
  issues: Issue[];
  summary: string;
}

export interface Issue {
  category: "薬機法" | "景表法" | "SNS規約";
  severity: RiskLevel;
  description: string;
  suggestion: string;
}

const YAKKI_TRIGGERS = [
  { words: ["治る", "治します", "治癒", "完治"], desc: "効能・効果を断定する表現が含まれています。", suggestion: "「サポートする」「気になる方に」など、断定しない表現に変更してください。" },
  { words: ["効果あり", "効果が出る", "必ず効く", "確実に"], desc: "確実な効果を保証する表現が含まれています。", suggestion: "「個人差があります」「感じ方には差があります」などの表現を追加してください。" },
  { words: ["医師推薦", "病院推薦", "医療機関推奨"], desc: "医師・医療機関の推薦を示す表現が含まれています。", suggestion: "実際の推薦がない場合はこの表現を削除してください。" },
  { words: ["副作用なし", "副作用ゼロ", "安全100%"], desc: "副作用がないことを断言する表現が含まれています。", suggestion: "この表現は削除し、成分の安全性を科学的根拠とともに説明してください。" },
];

const KEIHY_TRIGGERS = [
  { words: ["No.1", "ナンバーワン", "日本一", "業界一"], desc: "No.1表示は客観的な根拠が必要です。", suggestion: "根拠となる調査・データの出典を明記するか、表現を削除してください。" },
  { words: ["最安値", "最低価格", "他社より安い"], desc: "最安値・価格比較の主張は根拠が必要です。", suggestion: "比較根拠を明示するか「お手頃価格」などの表現に変更してください。" },
  { words: ["絶対に痩せる", "必ずやせる", "確実に痩せる", "確実にやせる"], desc: "ダイエット効果の断定表現が含まれています（景表法・健康増進法に抵触の恐れ）。", suggestion: "「健康的な生活習慣のサポートに」などの表現に変更してください。" },
  { words: ["全額返金", "返金保証"], desc: "返金保証の表示は条件を明記する必要があります。", suggestion: "返金条件・手続き・期限を具体的に明記してください。" },
];

const SNS_TRIGGERS = [
  { words: ["#PR", "#広告", "#スポンサー"], desc: "ステルスマーケティング対策のハッシュタグが検出されました（適切な開示です）。", suggestion: "引き続きPR表示を継続してください（問題ありません）。" },
  { words: ["フォロワー増やす", "いいね増やす", "エンゲージメント購入"], desc: "不正なエンゲージメント操作を示唆する表現です。", suggestion: "この表現を削除し、オーガニックな成長を促す表現に変更してください。" },
  { words: ["年齢確認不要", "未成年OK"], desc: "年齢制限のある商品の未成年向け販売を示唆する表現です。", suggestion: "この表現を削除し、年齢確認プロセスを明記してください。" },
];

function detectIssues(text: string): Issue[] {
  const issues: Issue[] = [];

  for (const trigger of YAKKI_TRIGGERS) {
    if (trigger.words.some((w) => text.includes(w))) {
      issues.push({
        category: "薬機法",
        severity: "high",
        description: trigger.desc,
        suggestion: trigger.suggestion,
      });
    }
  }

  for (const trigger of KEIHY_TRIGGERS) {
    if (trigger.words.some((w) => text.includes(w))) {
      issues.push({
        category: "景表法",
        severity: "medium",
        description: trigger.desc,
        suggestion: trigger.suggestion,
      });
    }
  }

  for (const trigger of SNS_TRIGGERS) {
    const matched = trigger.words.some((w) => text.includes(w));
    if (matched) {
      // PR disclosure tag is a positive signal — downgrade severity
      const isPositive = trigger.words.includes("#PR");
      issues.push({
        category: "SNS規約",
        severity: isPositive ? "low" : "high",
        description: trigger.desc,
        suggestion: trigger.suggestion,
      });
    }
  }

  return issues;
}

function calcScore(issues: Issue[]): number {
  let penalty = 0;
  for (const issue of issues) {
    if (issue.severity === "high") penalty += 25;
    else if (issue.severity === "medium") penalty += 12;
    else penalty += 3;
  }
  return Math.max(0, 100 - penalty);
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "low";
  if (score >= 40) return "medium";
  return "high";
}

function buildSummary(score: number, issues: Issue[]): string {
  if (issues.length === 0) {
    return "明らかなリスクワードは検出されませんでした。引き続き、専門家によるレビューを推奨します。";
  }
  const highCount = issues.filter((i) => i.severity === "high").length;
  const medCount = issues.filter((i) => i.severity === "medium").length;
  const parts: string[] = [];
  if (highCount > 0) parts.push(`高リスク ${highCount} 件`);
  if (medCount > 0) parts.push(`中リスク ${medCount} 件`);
  return `${parts.join("・")}の問題が検出されました（スコア: ${score}点）。修正後に再度チェックしてください。`;
}

/** Mock checker — no external API call */
export function checkAdCopy(text: string): CheckResult {
  const issues = detectIssues(text);
  const score = calcScore(issues);
  const riskLevel = toRiskLevel(score);
  const summary = buildSummary(score, issues);
  return { score, riskLevel, issues, summary };
}
